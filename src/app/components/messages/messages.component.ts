import {
	Component,
	OnInit,
	OnDestroy,
	ViewChild,
	ElementRef,
	AfterViewInit,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessagingService } from '@app/services/messaging.service';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { get, isEmpty } from 'lodash';
import moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { StateService } from '@app/services/state.service';
import { getPersonId } from '@api/Person';

// Probably shouldn't hardcode this but here we are
// Conversation with this person id is not shown when logging in as a hacker
const GM_ID = '20264';

export interface ChatView {
	type: 'channel' | 'private';
	target: string;
	targetPerson?: api.Person;
}

export interface OutgoingMessage {
	target: string;
	message: string;
	type: ChatView['type'];
}

@Component({
	selector: 'app-messages',
	templateUrl: './messages.component.html',
	styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('chatMessages') private chatMessages: ElementRef;
	messageForm: FormGroup;
	filterForm: FormGroup;
	message$: BehaviorSubject<any[]>;
	users$: Observable<api.Person[]>;
	currentUser: api.Person;
	currentUser$: Subscription;
	chatView: ChatView;
	isEmpty = isEmpty;

	constructor(
		private messaging: MessagingService,
		private state: StateService,
		private route: ActivatedRoute
	) {}

	ngOnInit() {
		this.buildForm();
		this.message$ = this.messaging.messages;
		this.currentUser$ = this.state.user.subscribe(
			user => (this.currentUser = user)
		);

		this.route.params.subscribe((params: ChatView) => {
			const chatView = { ...params };
			if (params.type === 'private') {
				// Don't show GM conversation when logged in via hacking
				const isHacker = Boolean(window.sessionStorage.getItem('hackerId'));
				if (isHacker && params.target === GM_ID) {
					return;
				}

				chatView.targetPerson = this.messaging.users
					.getValue()
					.find(user => user.id === chatView.target);
				getPersonId(<any>params.target).then(person => {
					chatView.targetPerson = <any>person.data;
				});
			}
			this.chatView = chatView;
			this.messaging.chatViewChanged(chatView);
		});

		this.filterForm.valueChanges.subscribe(({ userFilter }) => {
			this.messaging.debouncedSearchUsers(userFilter.toLowerCase().trim());
		});

		// Users that show up in users list
		this.users$ = combineLatest(
			this.messaging.users,
			this.filterForm.valueChanges,
			this.messaging.unseenMessagesUpdated
		).pipe(
			map(([users, { userFilter }, unseenMessages]) => {
				const filter = userFilter.toLowerCase().trim();
				const isHacker = Boolean(window.sessionStorage.getItem('hackerId'));
				return users
					.filter(user => {
						// Don't show GM conversation when logged in via hacking
						if (isHacker && user.id === GM_ID) {
							return false;
						}
						return get(user, 'full_name', '')
							.toLowerCase()
							.includes(filter);
					})
					.map(user => {
						// add unseen message counts to user list
						if (unseenMessages.has(user.id)) {
							// @ts-ignore
							user.unseen_message_count = unseenMessages.get(user.id);
						} else {
							// @ts-ignore
							user.unseen_message_count = 0;
						}
						return user;
					});
			})
		);
		this.messaging.unseenMessagesUpdated.next(new Map<string, number>());
	}

	ngAfterViewInit() {
		// Scroll chat to bottom on initial page load
		this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
	}

	ngOnDestroy() {
		this.currentUser$.unsubscribe();
		// set empty chatview to prevent messages from current conversation partner being marked
		// as read in the background
		this.messaging.chatViewChanged({ type: 'channel', target: 'general' });
	}

	onKeyDown(event: KeyboardEvent) {  // New method
		if ((event.shiftKey || event.ctrlKey) && event.key === 'Enter') {
			event.preventDefault();
			this.onSubmit();
		}
	}

	onSubmit() {
		const { message } = this.messageForm.value,
			{ target, type } = this.chatView;
		if (!target || !message) return;
		this.messaging.sendMessage({ message: message.trim(), target, type });
		this.messageForm.patchValue({ message: '' });
	}

	formatTimestamp(timestamp) {
		return moment(timestamp).format('HH:mm:ss');
	}

	private buildForm() {
		this.messageForm = new FormGroup({
			message: new FormControl('', [
				Validators.required,
				Validators.maxLength(1000),
			]),
		});
		this.filterForm = new FormGroup({
			userFilter: new FormControl(''),
		});
		// Stupid hack to emit a valueChanges event so that the combineLatest filtering
		// function will run. Can be removed once I figure out how to use RXJS.
		setTimeout(() => {
			this.filterForm.controls['userFilter'].setValue('', { emitEvent: true });
			this.messaging.emitUnseenMessages();
		}, 0);
	}
}
