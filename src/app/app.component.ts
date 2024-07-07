import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatSnackBar, MatDialogRef, MatDialog } from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { StateService } from '@services/state.service';
import { MessagingService } from '@services/messaging.service';
import { SocketService } from '@services/socket.service';
import { ShipLogSnackbarComponent } from '@components/ship-log-snackbar/ship-log-snackbar.component';
import { fadeInAnimation } from '@app/animations';
import { autobind } from 'core-decorators';
import { SipService } from './services/sip.service';
import { ActivatedRoute } from '@angular/router';
import { JumpCountdownDialogComponent } from '@app/components/jump-countdown-dialog/jump-countdown-dialog.component';
import { DIALOG_SETTINGS } from '@components/message-dialog/message-dialog.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	animations: [fadeInAnimation],
})
export class AppComponent implements OnInit {
	@ViewChild('snackbar') snackbarTemplate: TemplateRef<any>;
	jumpCountdownDialogRef: MatDialogRef<JumpCountdownDialogComponent>;
	user$: Subscription;
	user: api.Person;
	showHackingView$: Observable<boolean>;
	isSocialHubEnabled$: Observable<boolean>;
	isVelianModeEnabled$: Observable<boolean>;
	canEnableHacking: boolean;
	hackingTarget: string;
	private isJumpCountdownDialogDismissed = false;

	constructor(
		private state: StateService,
		private socket: SocketService,
		private snackBar: MatSnackBar,
		public sip: SipService,
		private route: ActivatedRoute,
		private messaging: MessagingService,
		private dialog: MatDialog
	) {}

	ngOnInit() {
		this.user$ = this.state.user.subscribe(user => (this.user = user));
		this.showHackingView$ = this.state.showHackingView;
		this.isSocialHubEnabled$ = this.state.isSocialHubEnabled$;
		this.isVelianModeEnabled$ = this.state.isVelianModeEnabled$;
		this.state.canEnableHacking$.subscribe(async canEnableHacking => {
			// Not sure why I had to make this async/await but I was getting errors otherwise
			// https://github.com/angular/angular/issues/17572
			this.canEnableHacking = await canEnableHacking;
		});
		this.socket.logEntryAdded$.subscribe((logEntry: api.LogEntry) => {
			// Don't bother with log entries if there is no active user
			if (!this.state.user.getValue()) return;
			this.snackBar.openFromComponent(ShipLogSnackbarComponent, {
				duration: 5000,
				horizontalPosition: 'end',
				verticalPosition: 'bottom',
				data: logEntry,
				panelClass: 'log-entry-snackbar',
			});
		});
		this.route.queryParams.subscribe(params => {
			if (params.disablevelian) {
				window.localStorage.removeItem('enableVelianMode');
				this.state.isVelianModeEnabled$.next(false);
			}
			if (params.admin === 'true') {
				this.state.isAdmin$.next(true);
			}
		});

		this.socket.jumpState$.subscribe(jumpState => {
			if (jumpState.status === 'jump_initiated') {
				if (this.jumpCountdownDialogRef || this.isJumpCountdownDialogDismissed)
					return;
				this.isJumpCountdownDialogDismissed = false;
				this.openCountdownDialog();
			} else if (this.jumpCountdownDialogRef) {
				this.jumpCountdownDialogRef.close();
			} else {
				this.isJumpCountdownDialogDismissed = false;
			}
		});

		this.isSocialHubEnabled$.subscribe(isEnabled => {
			if (!isEnabled && this.jumpCountdownDialogRef) {
				this.jumpCountdownDialogRef.close();
			}
		});
	}

	private openCountdownDialog() {
		// Don't show jump countdown in velian mode
		if (this.state.isVelianModeEnabled$.getValue()) return;

		this.jumpCountdownDialogRef = this.dialog.open(
			JumpCountdownDialogComponent,
			{
				...DIALOG_SETTINGS,
			}
		);
		this.jumpCountdownDialogRef.afterClosed().subscribe(() => {
			this.jumpCountdownDialogRef = null;
			this.isJumpCountdownDialogDismissed = true;
		});
	}

	toggleHacking() {
		this.hackingTarget = this.state.hackingTarget$.getValue();
		this.state.showHackingView.next(!this.state.showHackingView.getValue());
	}

	@autobind
	onCompleteHacking() {
		this.state.loginHacker(this.hackingTarget).finally(() => {
			this.state.showHackingView.next(false);
		});
	}
}
