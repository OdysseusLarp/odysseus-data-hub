import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { get } from 'lodash';
import { getPersonCardId, getPersonId } from '@api/Person';
import { getDataTypeId } from '@api/Data';
import { postLogAudit } from '@api/Log';

@Injectable({
	providedIn: 'root',
})
export class StateService {
	user: BehaviorSubject<api.Person> = new BehaviorSubject(null);
	sessionStorage = window.sessionStorage;
	logout = new Subject<void>();
	canEnableHacking$ = new BehaviorSubject(false);
	hackingTarget$ = new BehaviorSubject(null);
	showHackingView = new BehaviorSubject(false);
	hasInitialized$ = new BehaviorSubject(false);
	isSocialHubEnabled$ = new BehaviorSubject(true);

	constructor() {
		// Attempt to log in as previous user automatically
		const previousUserId = this.sessionStorage.getItem('previousUserId');
		if (previousUserId) this.login(previousUserId, true);
		else this.hasInitialized$.next(true);

		getDataTypeId('metadata', 'ship').then(res => {
			const isEnabled = get(res, 'data.social_ui_enabled', true);
			this.isSocialHubEnabled$.next(isEnabled);
		});

		// Handle logout
		this.logout.subscribe(() => {
			const person_id = get(this.user.getValue(), 'id');
			if (person_id) postLogAudit({ person_id, type: 'LOGOUT' });
			this.sessionStorage.removeItem('previousUserId');
			this.user.next(null);
		});
	}

	login(id, isRestoredSession = false): Promise<api.Person> {
		return getPersonCardId(id, { login: !isRestoredSession })
			.then((res: api.Response<any>) => {
				if (!res.data) throw new Error('User not found');
				this.user.next(res.data);
				this.sessionStorage.setItem('previousUserId', res.data.card_id);
				return res.data;
			})
			.finally(() => this.hasInitialized$.next(true));
	}

	loginHacker(id): Promise<api.Person> {
		const hackerId = get(this.user.getValue(), 'id');
		this.logout.next();
		return getPersonId(id, { login: true, hackerId })
			.then((res: api.Response<any>) => {
				if (!res.data) throw new Error('User not found');
				this.user.next(res.data);
				this.sessionStorage.setItem('previousUserId', res.data.card_id);
				return res.data;
			})
			.finally(() => this.hasInitialized$.next(true));
	}
}
