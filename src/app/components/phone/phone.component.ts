import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	OnDestroy,
} from '@angular/core';
import { SipService, Call } from '@app/services/sip.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import moment from 'moment';

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
	setAudioStream$: Subscription;
	outgoingCall: Call;
	outgoingCall$: Subscription;
	incomingCall: Call;
	incomingCall$: Subscription;
	ongoingCall: Call;
	ongoingCall$: Subscription;
	callTime$ = new BehaviorSubject<number>(0);
	formattedCallTime$ = new BehaviorSubject<string>('');

	constructor(public sip: SipService) {}

	ngOnInit() {
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
	}

	ngOnDestroy() {
		console.log('phone component is destroying');
		this.setAudioStream$.unsubscribe();
	}

	closePhone() {
		this.sip.showPhone$.next(false);
	}

	unregister() {
		this.sip.unregister();
	}

	onEndSession(session?) {
		this.audio.nativeElement.pause();
		this.audio.nativeElement.currentTime = 0;
		this.audio.nativeElement.srcObject = null;
	}

	call(targetId: string) {
		this.sip.call(targetId);
	}

	hangUp() {
		this.sip.hangUp();
	}

	updateTime() {
		this.callTime$.next(Math.floor(this.audio.nativeElement.currentTime));
	}
}
