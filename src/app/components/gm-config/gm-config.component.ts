import { Component, OnInit, OnDestroy } from '@angular/core';
import { SipService } from '@app/services/sip.service';
import { Subscription } from 'rxjs';
import { StateService } from '@app/services/state.service';

@Component({
	selector: 'app-gm-config',
	templateUrl: './gm-config.component.html',
	styleUrls: ['./gm-config.component.scss'],
})
export class GmConfigComponent implements OnInit, OnDestroy {
	sipId: string;
	sipId$: Subscription;
	hasVelianMode: boolean;

	constructor(public sip: SipService, public state: StateService) {}

	ngOnInit() {
		this.sipId$ = this.sip.sipId$.subscribe(sipId => (this.sipId = sipId));
		this.hasVelianMode =
			this.state.isVelianModeEnabled$.getValue() ||
			!!window.localStorage.getItem('enableVelianMode');
	}

	ngOnDestroy() {
		this.sipId$.unsubscribe();
	}

	register() {
		this.sip.register(this.sipId);
	}

	setVelianMode(value: boolean) {
		if (value) {
			window.localStorage.setItem('enableVelianMode', 'true');
			this.hasVelianMode = true;
		} else {
			window.localStorage.removeItem('enableVelianMode');
			this.hasVelianMode = false;
		}
	}
}
