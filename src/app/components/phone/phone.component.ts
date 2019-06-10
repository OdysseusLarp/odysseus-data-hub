import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	OnDestroy,
} from '@angular/core';
import { SipService } from '@app/services/sip.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-phone',
	templateUrl: './phone.component.html',
	styleUrls: ['./phone.component.scss'],
})
export class PhoneComponent implements OnInit, OnDestroy {
	@ViewChild('video') video: ElementRef;
	@ViewChild('audio') audio: ElementRef;
	selfId: string;
	targetId: string;
	setAudioStream$: Subscription;

	constructor(public sip: SipService) {}

	ngOnInit() {
		this.setAudioStream$ = this.sip.setAudioStream$.subscribe(stream => {
			if (stream) {
				this.audio.nativeElement.srcObject = stream;
				this.audio.nativeElement.play();
			} else {
				this.onEndSession();
			}
		});
	}

	ngOnDestroy() {
		this.unregister();
		this.setAudioStream$.unsubscribe();
	}

	unregister() {
		this.sip.unregister();
	}

	initSelf() {
		if (!this.selfId) return;
		this.sip.register(this.selfId);
	}

	onEndSession(session?) {
		console.log('ending session', session);
		this.audio.nativeElement.pause();
		this.audio.nativeElement.currentTime = 0;
		this.audio.nativeElement.srcObject = null;
	}

	call() {
		this.sip.call(this.targetId);
	}

	hangUp() {
		this.sip.hangUp();
	}
}
