import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	OnDestroy,
} from '@angular/core';
import { SipService, Call } from '@app/services/sip.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-phone',
	templateUrl: './phone.component.html',
	styleUrls: ['./phone.component.scss'],
})
export class PhoneComponent implements OnInit, OnDestroy {
	@ViewChild('video') video: ElementRef;
	@ViewChild('audio') audio: ElementRef;
	setAudioStream$: Subscription;
	outgoingCall: Call;
	outgoingCall$: Subscription;
	incomingCall: Call;
	incomingCall$: Subscription;
	ongoingCall: Call;
	ongoingCall$: Subscription;

	constructor(public sip: SipService) {}

	ngOnInit() {
		console.log('phone component is initializing');
		this.setAudioStream$ = this.sip.setAudioStream$.subscribe(stream => {
			if (stream) {
				console.log('===> SETTING STREAM IN COMPONENT', stream);
				this.audio.nativeElement.srcObject = stream;
				this.audio.nativeElement.play();
			} else {
				console.log('===> ENDING SESSION IN COMPONENT', stream);
				this.onEndSession();
			}
		});
		this.outgoingCall$ = this.sip.outgoingCall$.subscribe(call => {
			console.log('===> PHONE COMPONENT GOT OUTGOING CALL =>', call);
			this.outgoingCall = call;
		});
		this.incomingCall$ = this.sip.incomingCall$.subscribe(call => {
			console.log('===> PHONE COMPONENT GOT INCOMING CALL =>', call);
			this.incomingCall = call;
		});
		this.ongoingCall$ = this.sip.ongoingCall$.subscribe(call => {
			console.log('===> PHONE COMPONENT GOT ONGOING CALL =>', call);
			this.ongoingCall = call;
		});
	}

	ngOnDestroy() {
		console.log('phone component is destroying');
		// this.unregister();
		this.setAudioStream$.unsubscribe();
	}

	closePhone() {
		this.sip.showPhone$.next(false);
	}

	unregister() {
		this.sip.unregister();
	}

	onEndSession(session?) {
		console.log('ending session', session);
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
}
