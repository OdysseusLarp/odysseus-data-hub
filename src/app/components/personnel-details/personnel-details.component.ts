import {
	Component,
	OnInit,
	ViewChild,
	ElementRef,
	OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { getPersonId, postPersonIdEntry } from '@api/Person';
import { get } from 'lodash';
import { StateService } from '@app/services/state.service';
import { PermissionService } from '@app/services/permission.service';

@Component({
	selector: 'app-personnel-details',
	templateUrl: './personnel-details.component.html',
	styleUrls: ['./personnel-details.component.scss'],
})
export class PersonnelDetailsComponent implements OnInit, OnDestroy {
	@ViewChild('medicalEntryForm') medicalEntryForm: ElementRef;
	@ViewChild('personalEntryForm') personalEntryForm: ElementRef;
	@ViewChild('militaryEntryForm') militaryEntryForm: ElementRef;
	person: api.Person;
	isSubmitting = false;
	medicalEntries: api.Entry[] = [];
	personalEntries: api.Entry[] = [];
	militaryEntries: api.Entry[] = [];
	currentUser: api.Person;

	constructor(
		private route: ActivatedRoute,
		private state: StateService,
		private permission: PermissionService,
		private location: Location
	) {}

	ngOnInit() {
		this.route.params.subscribe(({ id }) => {
			this.fetchPerson(id);
			this.state.hackingTarget$.next(id);
		});
		this.currentUser = this.state.user.getValue(); // Set currentUser to the current user from the state service
	}

	ngOnDestroy() {
		this.state.canEnableHacking$.next(false);
		this.state.hackingTarget$.next(null);
	}

	navigateBack() {
		this.location.back();
	}

	private fetchPerson(id) {
		getPersonId(id).then((res: api.Response<any>) => {
			this.person = res.data;
			const entries = get(this.person, 'entries', []).sort((a, b) =>
				a.created_at > b.created_at ? 1 : -1
			);
			this.medicalEntries = entries.filter(e => e.type === 'MEDICAL');
			this.personalEntries = entries.filter(e => e.type === 'PERSONAL');
			this.militaryEntries = entries.filter(e => e.type === 'MILITARY');
			const cardId = get(this.person, 'card_id');
			this.state.canEnableHacking$.next(
				this.permission.has('role:hacker') && // need to be a hacker to hack
				!!cardId && // target must have a card_id
				this.state.user.getValue().id !== id && // can't hack self
					!this.permission.has('role:admin', this.person) // can't hack admins
			);
		});
	}

	saveEntry(type: 'MEDICAL' | 'MILITARY' | 'PERSONAL') {
		const form = this[`${type.toLowerCase()}EntryForm`];
		const entry = form.nativeElement.value;
		if (!entry || !this.person || this.isSubmitting) return;
		this.isSubmitting = true;
		const added_by = get(this.state.user.getValue(), 'id');
		postPersonIdEntry(this.person.id, {
			type,
			entry: `542 ${entry}`,
			added_by,
		}).then(res => {
			this.fetchPerson(this.person.id);
			this.isSubmitting = false;
			form.nativeElement.value = '';
		});
	}
}
