import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	OnDestroy,
} from '@angular/core';
import { SipService, Call, PhoneViewState } from '@app/services/sip.service';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import moment from 'moment';
import { StateService } from '@app/services/state.service';

@Component({
	selector: 'app-phone',
	templateUrl: './phone.component.html',
	styleUrls: ['./phone.component.scss'],
})
export class PhoneComponent implements OnInit, OnDestroy {
	@ViewChild('video') video: ElementRef;
	@ViewChild('audio') audio: ElementRef;
	@ViewChild('incomingCallTone') incomingCallTone: ElementRef;
	@ViewChild('outgoingCallTone') outgoingCallTone: ElementRef;
	outgoingSipContacts$: Observable<api.SipContact[]>;
	setAudioStream$: Subscription;
	outgoingCall: Call;
	outgoingCall$: Subscription;
	incomingCall: Call;
	incomingCall$: Subscription;
	ongoingCall: Call;
	ongoingCall$: Subscription;
	callTime$ = new BehaviorSubject<number>(0);
	formattedCallTime$ = new BehaviorSubject<string>('');
	showPhone: PhoneViewState = 'HIDDEN';
	selectedContact = null;

	constructor(public sip: SipService, public state: StateService) {}

	ngOnInit() {
		// Filter out contacts that don't have is_visible = true
		this.outgoingSipContacts$ = this.sip.outgoingSipContacts$.pipe(
			map(contacts => contacts.filter(c => (<any>c).is_visible))
		);

		this.sip.endSession$.subscribe(() => this.onEndSession());
		this.setAudioStream$ = this.sip.setAudioStream$.subscribe(stream => {
			if (stream) {
				this.audio.nativeElement.srcObject = stream;
				this.audio.nativeElement.play();
			} else {
				this.onEndSession();
			}
		});
		this.outgoingCall$ = this.sip.outgoingCall$
			.pipe(distinctUntilChanged())
			.subscribe(call => {
				this.outgoingCall = call;
				// Return if we haven't rendered our audio element yet
				if (!this.outgoingCallTone || !this.outgoingCallTone.nativeElement)
					return;
				if (call) {
					this.outgoingCallTone.nativeElement.play();
				} else {
					this.outgoingCallTone.nativeElement.pause();
					this.outgoingCallTone.nativeElement.currentTime = 0;
				}
			});
		this.incomingCall$ = this.sip.incomingCall$
			.pipe(distinctUntilChanged())
			.subscribe(call => {
				this.incomingCall = call;
				// Return if we haven't rendered our audio element yet
				if (!this.incomingCallTone || !this.outgoingCallTone.nativeElement)
					return;
				if (call) {
					this.incomingCallTone.nativeElement.play();
				} else {
					this.incomingCallTone.nativeElement.pause();
					this.incomingCallTone.nativeElement.currentTime = 0;
				}
			});
		this.ongoingCall$ = this.sip.ongoingCall$
			.pipe(distinctUntilChanged())
			.subscribe(call => {
				this.ongoingCall = call;
			});
		this.callTime$.pipe(distinctUntilChanged()).subscribe(callTime => {
			let formattedTime = moment.utc(callTime * 1000).format('HH:mm:ss');
			// Strip out the hour if the call has been going on for less than that
			formattedTime = formattedTime.replace(/^00:/, '');
			this.formattedCallTime$.next(formattedTime);
		});
		this.sip.showPhone$.pipe(distinctUntilChanged()).subscribe(state => {
			this.showPhone = state;
		});
	}

	ngOnDestroy() {
		console.log('phone component is destroying');
		this.setAudioStream$.unsubscribe();
	}

	closePhone() {
		const newState = this.sip.isRegistered$.getValue() ? 'MINIMIZED' : 'HIDDEN';
		console.log('setting phone state =>', newState);
		this.sip.showPhone$.next(newState);
	}

	unregister() {
		this.sip.unregister();
	}

	onEndSession(session?) {
		if (!this.audio || !this.audio.nativeElement) return;
		this.audio.nativeElement.pause();
		this.audio.nativeElement.currentTime = 0;
		this.audio.nativeElement.srcObject = null;
	}

	call(targetId: string) {
		if (!targetId) return;
		this.sip.call(targetId);
	}

	answerCall() {
		this.sip.answerCall();
		this.sip.showPhone$.next('MINIMIZED');
	}

	hangUp() {
		this.sip.hangUp();
		this.sip.showPhone$.next('MINIMIZED');
	}

	updateTime() {
		this.callTime$.next(Math.floor(this.audio.nativeElement.currentTime));
	}
}
