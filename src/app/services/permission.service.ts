import { Injectable } from '@angular/core';
import { get } from 'lodash';
import { StateService } from '@app/services/state.service';

@Injectable({
	providedIn: 'root',
})
export class PermissionService {
	constructor(private state: StateService) {}

	public has(key: string, person = this.state.user.getValue()) {
		return person ? get(person, 'groups', []).includes(key) : false;
	}
}
