import { Component, OnInit } from '@angular/core';
import * as PersonApi from '@api/Person';

@Component({
	selector: 'app-personnel',
	templateUrl: './personnel.component.html',
	styleUrls: ['./personnel.component.scss']
})
export class PersonnelComponent implements OnInit {
	persons: api.Person[];

	constructor() { }

	ngOnInit() {
		PersonApi.getPerson().then((res: api.Response<any>) => {
			this.persons = res.data;
		});
	}
}
