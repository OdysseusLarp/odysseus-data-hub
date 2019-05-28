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
	pageSize = 21;
	totalRows = 0;
	columns: any[];
	filterFunction: Function;
	isLoading = false;
	filterValue = '';

	constructor() {}

	@autobind()
	setPage(event) {
		const page = event.offset + 1;
		this.fetchPage(page);
	}

	fetchPage(page = this.page, nameFilter = this.filterValue) {
		this.isLoading = true;
		PersonApi.getPerson({
			page,
			entries: this.pageSize,
			name: nameFilter || undefined,
		}).then((res: api.Response<any>) => {
			this.persons = get(res.data, 'persons', []);
			this.page = get(res.data, 'page');
			this.pageSize = get(res.data, 'pageSize');
			this.totalRows = get(res.data, 'rowCount');
			this.isLoading = false;
		});
	}

	ngOnInit() {
		this.fetchPage(this.page);
		this.columns = [
			{
				prop: 'full_name',
				name: 'Name',
				cellTemplate: this.nameTemplate,
				width: 250,
				sortable: false,
			},
			{ prop: 'dynasty', name: 'Dynasty', sortable: false },
			{ prop: 'home_planet', name: 'Home planet', sortable: false },
			{
				prop: 'ship.name',
				name: 'Current ship',
				cellTemplate: this.shipTemplate,
				sortable: false,
			},
			{
				prop: 'status',
				name: 'Status',
				sortable: false,
			},
		];
		this.filterFunction = (rows, value) => {
			if (this.isLoading) return;
			this.filterValue = value;
			// Always set page to 1 when filtering
			this.fetchPage(1, value);
		};
	}
}
