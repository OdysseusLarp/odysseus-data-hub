import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import * as PersonApi from '@api/Person';
import { get } from 'lodash';

@Component({
	selector: 'app-personnel',
	templateUrl: './personnel.component.html',
	styleUrls: ['./personnel.component.scss'],
})
export class PersonnelComponent implements OnInit {
	@ViewChild('nameTemplate') nameTemplate: TemplateRef<any>;
	@ViewChild('shipTemplate') shipTemplate: TemplateRef<any>;
	persons: api.Person[] = [];
	columns: any[];
	filterFunction: Function;

	constructor() {}

	ngOnInit() {
		PersonApi.getPerson().then((res: api.Response<any>) => {
			this.persons = res.data;
		});
		this.columns = [
			{
				prop: 'full_name',
				name: 'Name',
				cellTemplate: this.nameTemplate,
				width: 250,
			},
			{ prop: 'dynasty', name: 'Dynasty' },
			{ prop: 'dynasty_rank', name: 'Dynasty rank' },
			{ prop: 'home_planet', name: 'Home planet' },
			{
				prop: 'ship.name',
				name: 'Current ship',
				cellTemplate: this.shipTemplate,
			},
			{ prop: 'status', name: 'Status' },
		];
		this.filterFunction = (rows, value) =>
			rows.filter(
				r =>
					r.full_name.toLowerCase().includes(value) ||
					get(r, 'ship.name', '')
						.toLowerCase()
						.includes(value) ||
					get(r, 'dynasty', '')
						.toLowerCase()
						.includes(value) ||
					get(r, 'home_planet', '')
						.toLowerCase()
						.includes(value) ||
					get(r, 'status', '')
						.toLowerCase()
						.includes(value)
			);
	}
}
