import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getPersonId } from '@api/Person';

@Component({
	selector: 'app-personnel-details',
	templateUrl: './personnel-details.component.html',
	styleUrls: ['./personnel-details.component.scss'],
})
export class PersonnelDetailsComponent implements OnInit {
	person: api.Person;
	constructor(private route: ActivatedRoute) {}

	ngOnInit() {
		this.route.params.subscribe(({ id }) =>
			getPersonId(id).then((res: api.Response<any>) => (this.person = res.data))
		);
	}
}
