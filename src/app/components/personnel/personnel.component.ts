import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import * as PersonApi from '@api/Person';

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
			{ prop: 'full_name', name: 'Name', cellTemplate: this.nameTemplate },
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
			rows.filter(r => r.full_name.toLowerCase().includes(value));
	}
}
