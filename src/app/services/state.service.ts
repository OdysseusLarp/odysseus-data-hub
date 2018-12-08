import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { getPersonId } from '@api/Person';

@Injectable({
	providedIn: 'root',
})
export class StateService {
	user: BehaviorSubject<api.Person> = new BehaviorSubject(null);
	sessionStorage = window.sessionStorage;

	constructor() {
		// Log in as previous user automatically
		const previousUserId = this.sessionStorage.getItem('previousUserId');
		if (previousUserId) this.login(previousUserId);
	}

	login(id): Promise<api.Person> {
		return getPersonId(id).then((res: api.Response<any>) => {
			this.user.next(res.data);
			this.sessionStorage.setItem('previousUserId', res.data.id);
			return res.data;
		});
	}

	logout() {
		this.sessionStorage.removeItem('previousUserId');
		this.user.next(null);
	}
}
