import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { getPersonId } from '@api/Person';

@Injectable({
	providedIn: 'root',
})
export class StateService {
	user: BehaviorSubject<api.Person> = new BehaviorSubject(null);
	sessionStorage = window.sessionStorage;
	logout = new Subject<api.Person>();

	constructor() {
		// Attempt to log in as previous user automatically
		const previousUserId = this.sessionStorage.getItem('previousUserId');
		if (previousUserId) this.login(previousUserId);

		// Handle logout
		this.logout.subscribe(() => {
			this.sessionStorage.removeItem('previousUserId');
			this.user.next(null);
		});
	}

	login(id): Promise<api.Person> {
		console.log('loggin in', id);
		return getPersonId(id).then((res: api.Response<any>) => {
			this.user.next(res.data);
			this.sessionStorage.setItem('previousUserId', res.data.id);
			return res.data;
		});
	}
}
