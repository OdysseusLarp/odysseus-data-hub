import { Injectable } from '@angular/core';
import { StateService } from '@app/services/state.service';
import { distinctUntilChanged, first } from 'rxjs/operators';
import { environment } from '@env/environment';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as io from 'socket.io-client/dist/socket.io';
import { get, isEqual, forIn, debounce, isEmpty, uniq } from 'lodash';
import {
	ChatView,
	OutgoingMessage,
} from '@app/components/messages/messages.component';

@Injectable({
	providedIn: 'root',
})
export class MessagingService {
	private unseenMessages = new Map<string, number>();
	private messageCache = new Map<string, api.ComMessage[]>();
	private hasInitialized = new BehaviorSubject<boolean>(false);
	private chatView: ChatView;
	private user: api.Person;
	private socket: any;
	debouncedSearchUsers: Function;
	messages = new BehaviorSubject<api.ComMessage[]>([]);
	users: BehaviorSubject<api.Person[]> = new BehaviorSubject([]);
	unseenMessagesUpdated: Subject<Map<string, number>> = new Subject();
	unseenMessagesCount = new BehaviorSubject<number>(0);

	constructor(private state: StateService) {
		this.state.user
			.pipe(
				filter(Boolean),
				distinctUntilChanged(isEqual)
			)
			.subscribe((user: api.Person) => {
				this.user = user;
				this.createSocket();
			});
		this.state.logout.subscribe(() => {
			this.removeSocket();
			// Wipe message cache on logout
			this.messageCache = new Map<string, api.ComMessage[]>();
			this.unseenMessages = new Map<string, number>();
			this.unseenMessagesCount.next(0);
		});
		this.debouncedSearchUsers = debounce(this.searchUsers, 300);
	}

	sendMessage(message: OutgoingMessage) {
		this.socket.emit('message', message);
	}

	searchUsers(name: string) {
		// Require at least 3 characters of the name to prevent fetching a huge list
		if (name.length < 3 && name !== '') return;
		this.socket.emit('searchUsers', name);
	}

	// Function to manually emit since I don't know how to use RXJS properly
	emitUnseenMessages() {
		this.unseenMessagesUpdated.next(this.unseenMessages);
		let totalUnseenMessages = 0;
		this.unseenMessages.forEach(val => (totalUnseenMessages += val));
		this.unseenMessagesCount.next(totalUnseenMessages);
	}

	private markMessagesSeen(senderPersonId: string) {
		const messageIds = this.messageCache
			.get(senderPersonId)
			.filter(msg => !msg.seen && msg.person_id !== this.user.id)
			.map(msg => msg.id);
		this.socket.emit('messagesSeen', messageIds);
	}

	chatViewChanged(chatView: ChatView) {
		this.chatView = chatView;
		const { target } = chatView;

		// Load messages from cache if they exist, otherwise fetch them
		if (!isEmpty(chatView) && !this.messageCache.has(target))
			this.fetchHistory(chatView);
		else if (isEmpty(chatView)) {
			this.messages.next([]);
		} else {
			this.messages.next(this.messageCache.get(target));
			// If there are any unread messages, mark them as read now
			if (this.unseenMessages.has(target)) this.markMessagesSeen(target);
		}
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
		socket.on('messagesSeen', messages => this.onMessagesSeen(messages));
		socket.on('unseenMessages', messages =>
			this.onUnseenMessagesReceived(messages)
		);
		this.socket = socket;
		this.hasInitialized.next(true);
	}

	private onMessagesSeen(messages: api.ComMessage[]) {
		if (!Array.isArray(messages)) return;
		uniq(messages.map(m => m.person_id)).forEach(id => {
			this.unseenMessages.delete(id);
		});
		this.emitUnseenMessages();
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
		this.hasInitialized.pipe(first(Boolean)).subscribe(() => {
			this.socket.emit('fetchHistory', {
				type: chatView.type,
				target: chatView.target,
			});
		});
	}

	private onMessageReceived(message: api.ComMessage) {
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
			// Note: Channels were never fully implemented and were not used in 2019 or 2024 runs
			(target = message.target_channel), (type = 'channel');
		}

		// See if the sender/receiver is in the users list, if not, fetch users
		const isUserVisible = !!this.users
			.getValue()
			.find(
				u =>
					u.id ===
					(message.person_id === this.user.id
						? message.target_person
						: message.person_id)
			);
		if (!isUserVisible) this.socket.emit('getUserList');

		if (message.target_person === this.user.id) {
			// If sender is not on the contact list, refetch contacts
			const currentlyUnseen = this.unseenMessages.get(target) || 0;
			this.unseenMessages.set(target, currentlyUnseen + 1);
		}

		const messages = this.messageCache.get(target) || [];
		// If we receive a message and have no prior history, fetch the full history
		// and ditch this message as it will be included in that response anyway
		if (messages.length < 1) {
			this.fetchHistory({ target, type });
		} else {
			messages.push(message);
			this.messageCache.set(target, messages);
			if (this.chatView && target === this.chatView.target) {
				this.messages.next(messages);
				this.markMessagesSeen(target);
			} else {
				this.emitUnseenMessages();
			}
		}
	}

	private onUserListReceived(userList: api.Person[]) {
		this.users.next(
			(userList || []).sort((a, b) => (a.first_name > b.first_name ? 1 : -1))
		);
	}

	private onLatestMessagesReceived(response) {
		const { type, target, messages } = response;
		this.messageCache.set(target, messages);

		const unseenMessageCount = messages.filter(
			msg => !msg.seen && msg.target_person === this.user.id
		).length;
		if (unseenMessageCount) this.unseenMessages.set(target, unseenMessageCount);
		this.emitUnseenMessages();

		if (
			this.chatView &&
			this.chatView.type === type &&
			this.chatView.target === target
		) {
			this.messages.next(messages);
			if (this.unseenMessages.has(target)) this.markMessagesSeen(target);
		}
	}

	private onUnseenMessagesReceived(messages: api.ComMessage[]) {
		// Count unseen messages per sender
		const messageCounts = messages.reduce((collection, message) => {
			collection[message.person_id] = (collection[message.person_id] || 0) + 1;
			return collection;
		}, {});
		forIn(messageCounts, (count, key) => this.unseenMessages.set(key, count));
		this.emitUnseenMessages();
	}

	private removeSocket() {
		this.socket.close();
	}
}
