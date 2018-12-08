import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessagingService, Message } from '@app/services/messaging.service';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { get } from 'lodash';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-messages',
	templateUrl: './messages.component.html',
	styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent implements OnInit {
	messageForm: FormGroup;
	filterForm: FormGroup;
	message$: BehaviorSubject<Message[]>;
	users$: Observable<api.Person[]>;
	chatView: 'channel' | 'private';
	chatTarget: string;

	constructor(
		private messaging: MessagingService,
		private route: ActivatedRoute
	) {}

	ngOnInit() {
		this.buildForm();
		this.message$ = this.messaging.messages;

		this.route.params.subscribe(params => {
			console.log('params updated', params);
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

	onSubmit() {
		const { message } = this.messageForm.value;
		this.messaging.sendMessage({ message });
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
