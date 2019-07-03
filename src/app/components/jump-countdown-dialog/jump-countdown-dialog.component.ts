import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from '@app/services/socket.service';
import { get } from 'lodash';
import { StateService } from '@app/services/state.service';
import { MatDialogRef } from '@angular/material';

@Component({
	selector: 'app-jump-countdown-dialog',
	templateUrl: './jump-countdown-dialog.component.html',
	styleUrls: ['./jump-countdown-dialog.component.scss'],
})
export class JumpCountdownDialogComponent implements OnInit {
	jumpState$: Subscription;
	countdown: string;

	constructor(
		public state: StateService,
		private socket: SocketService,
		private dialogRef: MatDialogRef<JumpCountdownDialogComponent>
	) {}

	ngOnInit() {
		this.jumpState$ = this.socket.jumpState$.subscribe(jumpState => {
			const jumpCountDown = get(jumpState, 'jumpT', '');
			this.countdown = jumpCountDown;
		});
	}

	ngOnDestroy() {
		this.jumpState$.unsubscribe();
	}

	close() {
		this.dialogRef.close();
	}
}
