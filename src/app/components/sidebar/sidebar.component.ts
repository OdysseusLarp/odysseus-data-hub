import {
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { StateService } from '@app/services/state.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MessagingService } from '@services/messaging.service';
import { PermissionService } from '@app/services/permission.service';
import { filter, pairwise } from 'rxjs/operators';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
	@ViewChild('messageNotificationAudio') notificationAudioEl: ElementRef;
	user$: Observable<api.Person>;
	unseenMessagesCount$: Observable<number>;
	subscriptions = new Subscription();

	constructor(
		private state: StateService,
		private router: Router,
		private messaging: MessagingService,
		public permission: PermissionService
	) {}

	ngOnInit() {
		this.user$ = this.state.user;
		this.unseenMessagesCount$ = this.messaging.unseenMessagesCount;

		const user = this.state.user.getValue();
		const isGroupChatAccount = user
			? user.character_group === 'Group Chat'
			: false;

		if (isGroupChatAccount) {
			const playSubscription = this.unseenMessagesCount$
				.pipe(
					pairwise(),
					filter(
						([prevCount, currentCount]) => prevCount === 0 && currentCount > 0
					)
				)
				.subscribe(() => {
					this.playNotificationSound();
				});

			const pauseSubscription = this.unseenMessagesCount$
				.pipe(filter(count => count === 0))
				.subscribe(() => {
					this.pauseNotificationSound();
				});

			this.subscriptions.add(playSubscription);
			this.subscriptions.add(pauseSubscription);
		}
	}

	ngOnDestroy() {
		this.pauseNotificationSound();
		this.subscriptions.unsubscribe();
	}

	onLogout() {
		this.state.logout.next();
		this.router.navigate(['/']);
	}

	playNotificationSound() {
		this.notificationAudioEl.nativeElement.currentTime = 0;
		this.notificationAudioEl.nativeElement.play();
	}

	pauseNotificationSound() {
		this.notificationAudioEl.nativeElement.pause();
	}

	openUserProfile() {
		const user = this.state.user.getValue();
		if (!user) return;
		this.router.navigate(['/personnel', user.id]);
	}
}
