import { Injectable } from '@angular/core';
import { StateService } from '@app/services/state.service';
import { distinctUntilChanged } from 'rxjs/operators';
import { environment } from '@env/environment';
import { BehaviorSubject } from 'rxjs';
import * as io from 'socket.io-client/dist/socket.io';
import { get, isEqual } from 'lodash';
import { ChatView } from '@app/components/messages/messages.component';

export interface TargetMessages {
	target: string;
	messages: api.ComMessage[];
}

@Injectable({
	providedIn: 'root',
})
export class MessagingService {
	private messageCache = new Map<string, api.ComMessage[]>();
	user: api.Person;
	socket: any;
	messages: BehaviorSubject<api.ComMessage[]> = new BehaviorSubject([]);
	users: BehaviorSubject<api.Person[]> = new BehaviorSubject([]);
	chatView: ChatView;

	constructor(private state: StateService) {
		state.user.pipe(distinctUntilChanged(isEqual)).subscribe(user => {
			this.user = user;
			this.createSocket();
		});
		state.logout.subscribe(() => {
			this.removeSocket();
			// Wipe message cache on logout
			this.messageCache = new Map<string, api.ComMessage[]>();
		});
	}

	sendMessage(message) {
		this.socket.emit('message', message);
	}

	chatViewChanged(chatView: ChatView) {
		this.chatView = chatView;
		if (!this.messageCache.has(chatView.target)) this.fetchHistory(chatView);
		else this.messages.next(this.messageCache.get(chatView.target));
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

	private fetchHistory(chatView: ChatView) {
		if (!this.socket) return;
		this.socket.emit('fetchHistory', {
			type: chatView.type,
			target: chatView.target,
		});
	}

	private onMessageReceived(message) {
		// Figure out what "conversation" the received message is part of
		let target, type;
		if (message.target_person === this.user.id) {
			// Private messages sent to current user => goes under sender person id
			(target = message.person_id), (type = 'private');
		} else if (message.person_id === this.user.id && message.target_person) {
			// Private messages sent by current user => goes under target person id
			(target = message.target_person), (type = 'private');
		} else {
			// Otherwise it should be a channel message => goes under target channel id
			(target = message.target_channel), (type = 'channel');
		}

		const messages = this.messageCache.get(target) || [];
		// If we receive a message and have no prior history, fetch the full history
		// and ditch this message as it will be included in that response anyway
		if (messages.length < 1) {
			this.fetchHistory({ target, type });
		} else {
			messages.push(message);
			this.messageCache.set(target, messages);
			if (target === this.chatView.target) this.messages.next(messages);
		}
	}

	private onUserListReceived(userList) {
		this.users.next(userList);
	}

	private onLatestMessagesReceived(response) {
		const { type, target, messages } = response;
		this.messageCache.set(target, messages);
		if (this.chatView.type === type && this.chatView.target === target)
			this.messages.next(messages);
	}

	private removeSocket() {
		this.socket.close();
	}
}
