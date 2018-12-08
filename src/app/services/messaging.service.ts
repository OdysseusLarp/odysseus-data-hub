import { Injectable } from '@angular/core';
import { StateService } from '@app/services/state.service';
import {
	filter,
	distinctUntilKeyChanged,
	distinctUntilChanged,
} from 'rxjs/operators';
import { environment } from '@env/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import * as io from 'socket.io-client/dist/socket.io';
import { get, isEqual } from 'lodash';

export interface Message {
	message: string;
	sender: api.Person;
}

@Injectable({
	providedIn: 'root',
})
export class MessagingService {
	user: api.Person;
	socket: any;
	messages: BehaviorSubject<Message[]> = new BehaviorSubject([]);
	users: BehaviorSubject<api.Person[]> = new BehaviorSubject([]);

	constructor(private state: StateService) {
		state.user.pipe(distinctUntilChanged(isEqual)).subscribe(user => {
			this.user = user;
			this.createSocket();
		});
		state.logout.subscribe(() => this.removeSocket());
		// TODO: Fetch initial messages
	}

	sendMessage(message) {
		this.socket.emit('message', message);
	}

	private createSocket() {
		const id = get(this.user, 'id');
		if (!id) return;
		if (this.socket) this.removeSocket();
		const socket = io(`${environment.apiUrl}/messaging`, {
			query: { id },
		});
		socket.on('message', message => this.onMessageReceived(message));
		socket.on('userList', userList => this.onUserListReceived(userList));
		socket.on('latestMessages', userList =>
			this.onLatestMessagesReceived(userList)
		);
		socket.on('status', status => this.onStatusReceived(status));
		this.socket = socket;
	}

	private onStatusReceived(status) {
		const users = this.users.getValue();
		const userId = get(status, 'user.id');
		const is_online = status.state === 'connected';
		this.users.next([
			...users.map(u => {
				if (u.id === userId) return { ...u, is_online };
				return u;
			}),
		]);
	}

	private onMessageReceived(message) {
		this.messages.next([...this.messages.getValue(), message]);
	}

	private onUserListReceived(userList) {
		this.users.next(userList);
	}

	private onLatestMessagesReceived(messages) {
		this.messages.next(messages);
	}

	private removeSocket() {
		console.log('removing socket');
		this.socket.close();
	}
}
