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
import { get } from 'lodash';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { StateService } from '@app/services/state.service';

export interface ChatView {
	type: 'channel' | 'private';
	target: string;
	targetPerson?: api.Person;
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
				chatView.targetPerson = this.messaging.users
					.getValue()
					.find(user => user.id === chatView.target);
			}
			this.chatView = chatView;
			this.messaging.chatViewChanged(chatView);
		});

		// Users that show up in users list
		this.users$ = combineLatest(
			this.messaging.users,
			this.filterForm.valueChanges
		).pipe(
			map(([users, { userFilter }]) => {
				const filter = userFilter.toLowerCase().trim();
				return users.filter(user =>
					get(user, 'full_name', '')
						.toLowerCase()
						.includes(filter)
				);
			})
		);
	}

	ngAfterViewInit() {
		// Scroll chat to bottom on initial page load
		this.chatMessages.nativeElement.scrollTop = this.chatMessages.nativeElement.scrollHeight;
	}

	ngOnDestroy() {
		this.currentUser$.unsubscribe();
	}

	onSubmit() {
		const { message } = this.messageForm.value,
			{ target, type } = this.chatView;
		this.messaging.sendMessage({ message, target, type });
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
		}, 0);
	}
}
