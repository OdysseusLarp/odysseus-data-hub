import { Component, OnInit } from '@angular/core';
import { StateService } from '@app/services/state.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MessagingService } from '@services/messaging.service';
import { PermissionService } from '@app/services/permission.service';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
	user$: Observable<api.Person>;
	unseenMessagesCount$: Observable<number>;

	constructor(
		private state: StateService,
		private router: Router,
		private messaging: MessagingService,
		public permission: PermissionService
	) {}

	ngOnInit() {
		this.user$ = this.state.user;
		this.unseenMessagesCount$ = this.messaging.unseenMessagesCount;
	}

	onLogout() {
		this.state.logout.next();
		this.router.navigate(['/']);
	}

	openUserProfile() {
		const user = this.state.user.getValue();
		if (!user) return;
		this.router.navigate(['/personnel', user.id]);
	}
}
