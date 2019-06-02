import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { StateService } from '@services/state.service';
import { MessagingService } from '@services/messaging.service';
import { SocketService } from '@services/socket.service';
import { ShipLogSnackbarComponent } from '@components/ship-log-snackbar/ship-log-snackbar.component';
import { autobind } from 'core-decorators';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	@ViewChild('snackbar') snackbarTemplate: TemplateRef<any>;
	user$: Subscription;
	user: api.Person;
	showHackingView$: Observable<boolean>;
	canEnableHacking: boolean;
	hackingTarget: string;

	constructor(
		private state: StateService,
		private socket: SocketService,
		private snackBar: MatSnackBar,
		private messaging: MessagingService
	) {}

	ngOnInit() {
		this.user$ = this.state.user.subscribe(user => (this.user = user));
		this.showHackingView$ = this.state.showHackingView;
		this.state.canEnableHacking$.subscribe(async canEnableHacking => {
			// Not sure why I had to make this async/await but I was getting errors otherwise
			// https://github.com/angular/angular/issues/17572
			this.canEnableHacking = await canEnableHacking;
		});
		this.socket.logEntryAdded$.subscribe((logEntry: api.LogEntry) => {
			// Don't bother with log entries if there is no active user
			// TODO: Close the socket when user logs in, similarly as in messaging service
			if (!this.state.user.getValue()) return;
			this.snackBar.openFromComponent(ShipLogSnackbarComponent, {
				duration: 5000,
				horizontalPosition: 'end',
				verticalPosition: 'bottom',
				data: logEntry,
				panelClass: 'log-entry-snackbar',
			});
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
