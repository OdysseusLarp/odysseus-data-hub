import { Component, OnInit, OnDestroy } from '@angular/core';
import { SipService } from '@app/services/sip.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-gm-config',
	templateUrl: './gm-config.component.html',
	styleUrls: ['./gm-config.component.scss'],
})
export class GmConfigComponent implements OnInit, OnDestroy {
	sipId: string;
	sipId$: Subscription;

	constructor(public sip: SipService) {}

	ngOnInit() {
		this.sipId$ = this.sip.sipId$.subscribe(sipId => (this.sipId = sipId));
	}

	ngOnDestroy() {
		this.sipId$.unsubscribe();
	}

	register() {
		console.log('registering', this.sipId);
		this.sip.register(this.sipId);
	}
}
