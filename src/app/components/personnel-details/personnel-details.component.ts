import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getPersonId, postPersonIdMedicalEntry } from '@api/Person';
import * as moment from 'moment';

@Component({
	selector: 'app-personnel-details',
	templateUrl: './personnel-details.component.html',
	styleUrls: ['./personnel-details.component.scss'],
})
export class PersonnelDetailsComponent implements OnInit {
	@ViewChild('medicalEntryForm') medicalEntryForm: ElementRef;
	person: api.Person;
	isSubmitting = false;
	constructor(private route: ActivatedRoute) {}

	ngOnInit() {
		this.route.params.subscribe(({ id }) => this.fetchPerson(id));
	}

	private fetchPerson(id) {
		getPersonId(id).then((res: api.Response<any>) => (this.person = res.data));
	}

	saveMedicalEntry() {
		const value = this.medicalEntryForm.nativeElement.value;
		if (!value || !this.person || this.isSubmitting) return;
		this.isSubmitting = true;
		postPersonIdMedicalEntry(this.person.id, {
			// TODO: Convert time to fictional year or get rid of it
			time: moment().format('D.M.YYYY'),
			details: value,
		}).then(() => {
			this.fetchPerson(this.person.id);
			this.isSubmitting = false;
			this.medicalEntryForm.nativeElement.value = '';
		});
	}
}
