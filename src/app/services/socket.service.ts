import { Injectable } from '@angular/core';
import io from 'socket.io-client/dist/socket.io';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { get } from 'lodash';
import { environment } from '@env/environment';
import { StateService } from './state.service';
import { Router } from '@angular/router';
import { VelianState } from './state.service';

interface Socket {
	on: (eventName: string, attributes: any) => void;
	emit: (eventName: string, data: any) => void;
	close: () => void;
}

export interface JumpState {
	id?: 'jumpstate';
	cooldown_time?: string;
	jump_time?: string;
	jump_drive_temp_exact?: number;
	jump_drive_temp?: number;
	breaking_jump?: boolean;
	coherence?: number;
	readyRemaining?: number;
	readyT?: string;
	cooldownRemaining?: number;
	cooldownT?: string;
	jumpT?: string;
	status?: string;
}

@Injectable({
	providedIn: 'root',
})
export class SocketService {
	socket: Socket;
	metadataStateSocket: Socket;
	velianStateSocket: Socket;
	jumpStateSocket: Socket;
	jumpStateUpdated: Observable<JumpState>;
	public jumpState$ = new BehaviorSubject<JumpState>({});
	public logEntryAdded$: Observable<api.LogEntry>;
	public voteAddedOrUpdated$: Observable<api.Vote>;
	public shipMetadataUpdated$: Observable<any>;
	public refreshMap$: Observable<void>;
	public velianStateUpdated$: Observable<VelianState>;

	constructor(private state: StateService, private router: Router) {
		this.socket = io(environment.apiUrl);
		this.metadataStateSocket = io.connect(
			`${environment.apiUrl}/data`,
			{ query: { data: '/data/ship/metadata' } }
		);

		this.jumpStateSocket = io.connect(
			`${environment.apiUrl}/data`,
			{ query: { data: '/data/ship/jumpstate' } }
		);

		this.logEntryAdded$ = this.createObservable<api.LogEntry>('logEntryAdded');

		this.voteAddedOrUpdated$ = new Observable<api.Vote>(o => {
			this.socket.on('voteAdded', vote => o.next(vote));
			this.socket.on('voteUpdated', vote => o.next(vote));
		});

		this.shipMetadataUpdated$ = this.createDataUpdateObservable(
			this.metadataStateSocket
		);

		this.refreshMap$ = new Observable<void>(o => {
			this.socket.on('refreshMap', () => o.next());
		});

		this.jumpStateUpdated = this.createDataUpdateObservable(
			this.jumpStateSocket
		);

		this.jumpStateUpdated.subscribe(jumpState =>
			this.jumpState$.next(jumpState)
		);

		// Disable or enable social hub when state changes in backend
		this.shipMetadataUpdated$
			.pipe(map(metadata => get(metadata, 'social_ui_enabled', true)))
			.subscribe(isEnabled => {
				const isAdmin = this.state.isAdmin$.getValue();
				// If there is an active user, log them out before disabling social hub
				if (!isAdmin && !isEnabled && !!this.state.user.getValue()) {
					this.state.logout.next();
					this.router.navigate(['/']);
				}
				this.state.isSocialHubEnabled$.next(isEnabled || isAdmin);
			});

		// Subscribe to Velian game state changes if enabled
		this.state.isVelianModeEnabled$
			.pipe(distinctUntilChanged())
			.subscribe(isActive => {
				if (!isActive || this.velianStateSocket) return;
				this.velianStateSocket = io.connect(
					`${environment.apiUrl}/data`,
					{ query: { data: '/data/misc/velian' } }
				);
				this.velianStateUpdated$ = this.createDataUpdateObservable(
					this.velianStateSocket
				);
				this.velianStateUpdated$.subscribe(velianState =>
					this.state.velianState$.next(velianState)
				);
			});
	}

	private createObservable<T>(event: string): Observable<T> {
		return new Observable(o =>
			this.socket.on(event, (e: T) => {
				o.next(e);
			})
		);
	}

	private createDataUpdateObservable<T>(socket: Socket): Observable<T> {
		return new Observable(o =>
			socket.on('dataUpdate', (_type: string, _id: string, data: T) =>
				o.next(data)
			)
		);
	}
}
