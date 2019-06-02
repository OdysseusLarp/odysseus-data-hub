import { Injectable } from '@angular/core';
import io from 'socket.io-client/dist/socket.io';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

interface Socket {
	on: (eventName: string, attributes: any) => void;
	emit: (eventName: string, data: any) => void;
}

@Injectable({
	providedIn: 'root',
})
export class SocketService {
	socket: Socket;
	public logEntryAdded$: Observable<api.LogEntry>;
	public voteAddedOrUpdated$: Observable<api.Vote>;

	constructor() {
		this.socket = io(environment.apiUrl);
		this.logEntryAdded$ = this.createObservable<api.LogEntry>('logEntryAdded');

		this.voteAddedOrUpdated$ = new Observable<api.Vote>(o => {
			this.socket.on('voteAdded', vote => o.next(vote));
			this.socket.on('voteUpdated', vote => o.next(vote));
		});
	}

	private createObservable<T>(event: string): Observable<T> {
		return new Observable(o =>
			this.socket.on(event, (e: T) => {
				o.next(e);
			})
		);
	}
}
