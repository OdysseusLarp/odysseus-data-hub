import { Injectable } from '@angular/core';
import { get } from 'lodash';
import JsSIP from 'jssip';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '@env/environment';

interface SipContact {
	id: string;
	name: string;
	allow_video?: boolean;
}

// TODO: Get from API
const sipContacts: SipContact[] = [
	{ id: '6001', name: 'Contact #6001', allow_video: false },
	{ id: '6002', name: 'Contact #6002', allow_video: false },
];

const mediaConstraints = { audio: true, video: false };

// TODO: Get from API
const { sipUrl, sipRealm } = environment.sip;

@Injectable({
	providedIn: 'root',
})
export class SipService {
	phone: JsSIP.UA;
	socket: JsSIP.Socket;
	sessions = [];
	sipContacts = sipContacts;
	sipContactsMap = new Map<string, SipContact>();
	incomingCalls = [];

	endSession$ = new Subject();
	outgoingCall$ = new BehaviorSubject(null);
	incomingCall$ = new BehaviorSubject(null);
	setAudioStream$ = new BehaviorSubject(null);

	// Temporary stuff
	beepInterval: NodeJS.Timeout;

	constructor() {
		// TODO: Get SIP contacts from API
		this.sipContacts.forEach(c => this.sipContactsMap.set(c.id, c));
	}

	register(selfId: string) {
		console.log('Registering to SIP as', selfId);
		if (this.phone) this.unregister();
		if (!selfId) return;

		this.socket = new JsSIP.WebSocketInterface(sipUrl);

		const configuration = {
			sockets: [this.socket],
			uri: `sip:${selfId}@${sipRealm}`,
			password: selfId,
		};

		this.phone = new JsSIP.UA(configuration);
		this.phone.on('registered', e => {
			console.log('=> Registered to SIP', e);
		});

		// Event listeners for incoming and outgoing call events
		this.phone.on('newRTCSession', evt => {
			const session = get(evt, 'session');
			const direction = get(evt, 'session.direction');
			if (direction === 'incoming') {
				console.log('== INCOMING CALL ==', evt);
				this.onIncomingCall(evt);
			} else {
				console.log('== OUTGOING CALL ==', evt);
				this.onOutgoingCall(session);
			}
			this.sessions.push(session);
		});

		this.phone.start();
	}

	unregister() {
		console.log('unregistering');
		this.hangUp();
		if (!this.phone) return;
		this.phone.terminateSessions();
		this.phone.unregister();
		this.phone = null;
	}

	call(targetId) {
		this.phone.call(`sip:${targetId}@${sipRealm}`, { mediaConstraints });
	}

	answerCall(index) {
		this.incomingCalls[index].session.answer({ mediaConstraints });
		this.incomingCalls.splice(index, 1);
		console.log('answered call', index);
	}

	hangUp() {
		clearInterval(this.beepInterval);
		this.sessions.forEach(s => {
			try {
				console.log('hanging up session', s);
				s.terminate();
			} catch (e) {
				console.log('error hanging up session', e);
			}
		});
		this.sessions = [];
	}

	onOutgoingCall(session) {
		let dtmfSender;
		session.on('confirmed', e => {
			// send some beeps for debugging
			const localStream = session.connection.getLocalStreams()[0];
			dtmfSender = session.connection.createDTMFSender(
				localStream.getAudioTracks()[0]
			);
			console.log('=> outgoing call was accepted', e);
		});
		session.on('ended', e => {
			console.log('=> outgoing call ended', e);
			clearInterval(this.beepInterval);
			this.endSession$.next();
		});
		session.on('failed', e => {
			console.log('=> outgoing call failed', e);
			this.hangUp();
		});
		session.connection.addEventListener('addstream', e => {
			this.setAudioStream$.next(e.stream);
		});

		// session.unmute({ audio: true });

		// Beep every now and then just to let the other guy know that we are active
		this.beepInterval = setInterval(() => {
			if (!dtmfSender) return console.log('dtmfSender undefined');
			dtmfSender.insertDTMF('1');
			dtmfSender.insertDTMF('#');
			console.log('beep beep');
		}, 5000);
	}

	onIncomingCall({ session, request }) {
		const callerId = request.from.uri.user;
		const caller = this.sipContactsMap.get(callerId);
		console.log('=> Incoming call from', caller);
		session.on('accepted', e => {
			console.log('=> accepted incoming call =>', e);
		});
		session.on('confirmed', e => {
			console.log('=> confirmed incoming call =>', e);
		});
		session.on('ended', e => {
			console.log('=> ended incoming call =>', e);
			this.endSession$.next(session);
		});
		session.on('failed', e => {
			console.log('=> failed incoming call =>', e);
		});
		session.on('peerconnection', e => {
			session.connection.addEventListener('addstream', evt => {
				console.log('=> setting audio stream =>', evt);
				this.setAudioStream$.next(evt.stream);
			});
		});

		this.incomingCalls.push({ caller, session });
	}
}
