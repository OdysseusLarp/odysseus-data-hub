import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import * as PersonApi from '@api/Person';
import { get, debounce, mapKeys, camelCase } from 'lodash';
import { autobind } from 'core-decorators';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';

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
	filters: api.FilterCollection[] = [];
	filterValues: any;
	filterSelections = {};
	onNameFilterChangeDebounce: any;
	hasInitialized$ = new BehaviorSubject(false);

	constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

	@autobind()
	setPage(event) {
		const page = event.offset + 1;
		this.fetchPage(page);
	}

	fetchPage(page = this.page, filters = {}) {
		this.isLoading = true;
		const params = mapKeys(filters, (_value, key) => camelCase(key));
		PersonApi.getPerson({
			page,
			entries: this.pageSize,
			...params,
		}).then((res: api.Response<any>) => {
			this.persons = get(res.data, 'persons', []);
			this.page = get(res.data, 'page');
			this.pageSize = get(res.data, 'pageSize');
			this.totalRows = get(res.data, 'rowCount');
			this.isLoading = false;
		});
	}

	fetchFilterValues() {
		PersonApi.getPersonFilters()
			.then((res: api.Response<api.FilterValuesResponse>) => {
				this.filters = res.data.filters || [];
			})
			.finally(() => this.hasInitialized$.next(true));
	}

	@autobind
	onNameFilterChange(event) {
		const value = event.target.value;
		this.onFilterChange('name', { value });
	}

	onFilterChange(filterKey: string, filterSelection: api.FilterItem) {
		const queryParams = { ...this.activatedRoute.snapshot.queryParams };
		if (filterSelection && filterSelection.value)
			queryParams[filterKey] = filterSelection.value;
		else delete queryParams[filterKey];
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams,
		});
	}

	ngOnInit() {
		this.onNameFilterChangeDebounce = debounce(this.onNameFilterChange, 300);
		this.activatedRoute.queryParams.subscribe(async params => {
			await this.hasInitialized$.pipe(first(Boolean)).toPromise();
			this.fetchPage(this.page, params);
		});
		// this.fetchPage(this.page);
		this.fetchFilterValues();
		this.columns = [
			{
				prop: 'full_name',
				name: 'Name',
				cellTemplate: this.nameTemplate,
				width: 300,
				sortable: false,
			},
			{ prop: 'dynasty', name: 'Dynasty', sortable: false },
			{ prop: 'home_planet', name: 'Home planet', sortable: false },
			{
				prop: 'ship.name',
				name: 'Current location',
				cellTemplate: this.shipTemplate,
				width: 200,
				sortable: false,
			},
			{
				prop: 'status',
				name: 'Status',
				width: 350,
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
