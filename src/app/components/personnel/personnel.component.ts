import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import * as PersonApi from '@api/Person';
import { get } from 'lodash';
import { autobind } from 'core-decorators';

@Component({
	selector: 'app-personnel',
	templateUrl: './personnel.component.html',
	styleUrls: ['./personnel.component.scss'],
})
export class PersonnelComponent implements OnInit {
	@ViewChild('nameTemplate') nameTemplate: TemplateRef<any>;
	@ViewChild('shipTemplate') shipTemplate: TemplateRef<any>;
	persons: api.Person[] = [];
	page = 1;
	pageSize = 25;
	totalRows = 0;
	columns: any[];
	filterFunction: Function;
	isLoading = false;

	constructor() {}

	@autobind()
	setPage(event) {
		const page = event.offset + 1;
		this.fetchPage(page);
	}

	fetchPage(page) {
		this.isLoading = true;
		PersonApi.getPerson({ page, entries: this.pageSize }).then(
			(res: api.Response<any>) => {
				this.persons = get(res.data, 'persons', []);
				this.page = get(res.data, 'page');
				this.pageSize = get(res.data, 'pageSize');
				this.totalRows = get(res.data, 'rowCount');
				this.isLoading = false;
			}
		);
	}

	ngOnInit() {
		this.fetchPage(this.page);
		this.columns = [
			{
				prop: 'full_name',
				name: 'Name',
				cellTemplate: this.nameTemplate,
				width: 250,
			},
			{ prop: 'dynasty', name: 'Dynasty' },
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
