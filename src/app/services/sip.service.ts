import { Injectable } from '@angular/core';
import { get } from 'lodash';
import JsSIP from 'jssip';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { first, distinctUntilChanged, map, filter } from 'rxjs/operators';
import { getSipConfig, getSipContact } from '@api/SIP';

const mediaConstraints = { audio: true, video: false };

export interface Call {
	session: any;
	contact: api.SipContact;
}

@Injectable({
	providedIn: 'root',
})
export class SipService {
	sipId$ = new BehaviorSubject<string>(null);
	isRegistered$ = new BehaviorSubject<boolean>(false);
	phone: JsSIP.UA;
	socket: JsSIP.Socket;
	sipContacts: api.SipContact[] = [];
	sipContactsMap = new Map<string, api.SipContact>();
	outgoingSipContacts$ = new BehaviorSubject<api.SipContact[]>([]);
	sipConfig$ = new BehaviorSubject<api.SipConfig>(null);
	showPhone$ = new BehaviorSubject<boolean>(false);

	ongoingCall$ = new BehaviorSubject<Call>(null);
	outgoingCall$ = new BehaviorSubject<Call>(null);
	incomingCall$ = new BehaviorSubject<Call>(null);
	hasActiveCall$ = new BehaviorSubject<boolean>(false);

	endSession$ = new Subject();
	setAudioStream$ = new BehaviorSubject(null);

	constructor() {
		this.fetchSipConfig();
		this.fetchSipContacts();
		this.sipConfig$.pipe(first(Boolean)).subscribe(() => {
			// Check if local storage has sipId defined and initialize a session
			// if it does
			const sipId = window.localStorage.getItem('sipId');
			if (sipId) this.register(sipId);
		});

		// Filter self out of SIP contacts when registeration changes
		this.isRegistered$.pipe(distinctUntilChanged()).subscribe(() => {
			this.filterSipContacts();
		});

		combineLatest(
			this.ongoingCall$.pipe(map(Boolean)),
			this.outgoingCall$.pipe(map(Boolean)),
			this.incomingCall$.pipe(map(Boolean))
		).subscribe(([ongoing, outgoing, incoming]) => {
			this.hasActiveCall$.next(ongoing || outgoing || incoming);
		});

		// Open phone dialog if we get an incoming call
		this.incomingCall$
			.pipe(filter(Boolean))
			.subscribe(() => this.showPhone$.next(true));
	}

	fetchSipConfig() {
		getSipConfig().then(res => this.sipConfig$.next(res.data));
	}

	fetchSipContacts() {
		getSipContact().then(res => {
			if (!res.data || !Array.isArray(res.data)) return;
			this.sipContacts = res.data;
			console.log('got sip contacts', this.sipContacts);
			this.sipContacts.forEach(c => this.sipContactsMap.set(c.id, c));
		});
	}

	// Filter out self from SIP contacts if we are registered
	filterSipContacts() {
		const sipId = this.sipId$.getValue();
		if (!this.isRegistered$.getValue() || !sipId)
			return this.outgoingSipContacts$.next(this.sipContacts);
		this.outgoingSipContacts$.next(
			this.sipContacts.filter(({ id }) => id !== sipId)
		);
	}

	setSipId(sipId) {
		this.sipId$.next(sipId);
		window.localStorage.setItem('sipId', sipId);
	}

	unsetSipId() {
		this.sipId$.next(null);
		window.localStorage.removeItem('sipId');
	}

	register(sipId: string) {
		console.log('Registering to SIP as', sipId);
		const sipConfig = this.sipConfig$.getValue();
		if (!sipConfig) {
			console.error(`Can't register to SIP as SIP config is not defined`);
			return;
		}
		if (this.phone) this.unregister();
		if (!sipId) return;

		this.socket = new JsSIP.WebSocketInterface(sipConfig.url);

		const configuration = {
			sockets: [this.socket],
			uri: `sip:${sipId}@${sipConfig.realm}`,
			password: sipId,
		};

		this.phone = new JsSIP.UA(configuration);
		this.phone.on('registered', e => {
			console.log('=> Registered to SIP', e);
			this.setSipId(sipId);
			this.isRegistered$.next(true);
		});

		// Event listeners for incoming and outgoing call events
		this.phone.on('newRTCSession', evt => this.onCall(evt));

		this.phone.start();
	}

	unregister(clearSipId = false) {
		this.hangUp();
		if (!this.phone) return;
		this.phone.terminateSessions();
		this.phone.unregister();
		this.phone = null;
		if (clearSipId) this.unsetSipId();
		this.isRegistered$.next(false);
	}

	call(targetId) {
		const sipConfig = this.sipConfig$.getValue();
		if (!sipConfig) {
			return console.error(`Can't make a call as SIP config is not defined`);
		}
		if (this.hasActiveCall$.getValue()) {
			return console.error(
				`Can't make a call since we already have an active call`
			);
		}
		this.phone.call(`sip:${targetId}@${sipConfig.realm}`, { mediaConstraints });
	}

	answerCall() {
		const incomingCall = this.incomingCall$.getValue();
		if (incomingCall) incomingCall.session.answer({ mediaConstraints });
	}

	hangUp() {
		const ongoingCall = this.ongoingCall$.getValue();
		const incomingCall = this.incomingCall$.getValue();
		const outgoingCall = this.outgoingCall$.getValue();
		[ongoingCall, incomingCall, outgoingCall].forEach(call => {
			if (!call) return;
			console.log('=> Terminating call =>', call);
			call.session.terminate();
		});
	}

	onCall(evt) {
		const direction = get(evt, 'session.direction');
		if (direction === 'incoming') {
			console.log('== INCOMING CALL ==', evt);
			this.onIncomingCall(evt);
		} else {
			console.log('== OUTGOING CALL ==', evt);
			this.onOutgoingCall(evt);
		}
	}

	onOutgoingCall({ session, request }) {
		const callerId = request.to.uri.user;
		const contact = this.sipContactsMap.get(callerId);
		const call = { contact, session };

		session.on('confirmed', e => {
			console.log('=> outgoing call was accepted', e);
			this.outgoingCall$.next(null);
			this.ongoingCall$.next(call);
		});
		session.on('ended', e => {
			console.log('=> outgoing call ended', e);
			this.ongoingCall$.next(null);
			this.endSession$.next();
		});
		session.on('failed', e => {
			console.log('=> outgoing call failed', e);
			this.outgoingCall$.next(null);
			this.ongoingCall$.next(null);
			this.endSession$.next();
			this.hangUp();
		});
		session.connection.addEventListener('addstream', e => {
			this.setAudioStream$.next(e.stream);
		});

		this.outgoingCall$.next(call);
	}

	onIncomingCall({ session, request }) {
		const callerId = request.from.uri.user;
		const contact = this.sipContactsMap.get(callerId);
		if (this.hasActiveCall$.getValue()) {
			console.log(
				`Denying an incoming call from ${
					contact.name
				} since we are already have an active call`
			);
			return session.terminate();
		}

		const call = { contact, session };

		console.log('=> Incoming call from', contact);
		session.on('accepted', e => {
			console.log('=> accepted incoming call =>', e);
			this.incomingCall$.next(null);
			this.ongoingCall$.next(call);
		});
		session.on('confirmed', e => {
			console.log('=> confirmed incoming call =>', e);
			this.incomingCall$.next(null);
		});
		session.on('ended', e => {
			console.log('=> ended incoming call =>', e);
			this.endSession$.next(session);
			this.incomingCall$.next(null);
			this.ongoingCall$.next(null);
		});
		session.on('failed', e => {
			console.log('=> failed incoming call =>', e);
			this.incomingCall$.next(null);
			this.ongoingCall$.next(null);
		});
		session.on('peerconnection', e => {
			session.connection.addEventListener('addstream', evt => {
				this.setAudioStream$.next(evt.stream);
			});
		});

		this.incomingCall$.next(call);
	}
}
