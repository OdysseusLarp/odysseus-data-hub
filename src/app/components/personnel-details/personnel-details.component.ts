import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getPersonId, postPersonIdEntry } from '@api/Person';
import { get } from 'lodash';
import * as moment from 'moment';
import { StateService } from '@app/services/state.service';

@Component({
	selector: 'app-personnel-details',
	templateUrl: './personnel-details.component.html',
	styleUrls: ['./personnel-details.component.scss'],
})
export class PersonnelDetailsComponent implements OnInit {
	@ViewChild('medicalEntryForm') medicalEntryForm: ElementRef;
	@ViewChild('personalEntryForm') personalEntryForm: ElementRef;
	@ViewChild('militaryEntryForm') militaryEntryForm: ElementRef;
	person: api.Person;
	isSubmitting = false;
	medicalEntries: api.Entry[] = [];
	personalEntries: api.Entry[] = [];
	militaryEntries: api.Entry[] = [];
	constructor(private route: ActivatedRoute, private state: StateService) {}

	ngOnInit() {
		this.route.params.subscribe(({ id }) => this.fetchPerson(id));
	}

	private fetchPerson(id) {
		getPersonId(id).then((res: api.Response<any>) => {
			this.person = res.data;
			// TODO: Replace single newlines with two newlines in seeds
			// instead of here in frontend
			const entries = get(this.person, 'entries', []).map(e => {
				const entry = e.entry.replace('\n', '\n\n');
				return { ...e, entry };
			});
			this.medicalEntries = entries.filter(e => e.type === 'MEDICAL');
			this.personalEntries = entries.filter(e => e.type === 'PERSONAL');
			this.militaryEntries = entries.filter(e => e.type === 'MILITARY');
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
			entry,
			added_by,
		}).then(res => {
			console.log('got res', res);
			this.fetchPerson(this.person.id);
			this.isSubmitting = false;
			form.nativeElement.value = '';
		});
	}
}
