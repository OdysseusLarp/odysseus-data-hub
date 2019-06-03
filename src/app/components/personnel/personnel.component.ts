import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import * as PersonApi from '@api/Person';
import { get, debounce, mapKeys, camelCase, pickBy } from 'lodash';
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
	filters: api.FilterCollection[] = [];
	filterValues: any = { page: 1 };
	onNameFilterChangeDebounce: any;
	hasInitialized$ = new BehaviorSubject(false);

	constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

	@autobind()
	setPage(event) {
		this.onFilterChange('page', { value: event.offset + 1 });
	}

	fetchPage(filters = this.filterValues) {
		this.isLoading = true;
		const params = pickBy(
			mapKeys(filters, (_value, key) => camelCase(key)),
			(value, key) => !!value
		);
		PersonApi.getPerson({
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
				const queryParams = this.getCurrentQueryParams();
				this.filters.forEach(f => {
					this.filterValues[f.key] = queryParams[f.key];
				});
				// Set name value manually
				if (queryParams.name) this.filterValues['name'] = queryParams.name;
			})
			.finally(() => this.hasInitialized$.next(true));
	}

	@autobind
	onNameFilterChange(event) {
		const value = event.target.value;
		this.onFilterChange('name', { value });
	}

	onFilterChange(filterKey: string, filterSelection: api.FilterItem) {
		const queryParams = this.getCurrentQueryParams();
		if (filterSelection && filterSelection.value)
			queryParams[filterKey] = filterSelection.value;
		else delete queryParams[filterKey];
		this.router.navigate([], {
			relativeTo: this.activatedRoute,
			queryParams,
		});
	}

	private getCurrentQueryParams() {
		return { ...this.activatedRoute.snapshot.queryParams };
	}

	ngOnInit() {
		this.onNameFilterChangeDebounce = debounce(this.onNameFilterChange, 300);
		this.activatedRoute.queryParams.subscribe(async params => {
			await this.hasInitialized$.pipe(first(Boolean)).toPromise();
			this.fetchPage(params);
		});
		this.fetchFilterValues();
		const columnSettings = {
			sortable: false,
			resizeable: false,
			canAutoResize: false,
		};
		this.columns = [
			{
				prop: 'full_name',
				name: 'Name',
				cellTemplate: this.nameTemplate,
				width: 300,
				...columnSettings,
			},
			{ prop: 'dynasty', name: 'Dynasty', ...columnSettings },
			{ prop: 'home_planet', name: 'Home planet', ...columnSettings },
			{
				prop: 'ship.name',
				name: 'Current location',
				cellTemplate: this.shipTemplate,
				width: 200,
				...columnSettings,
			},
			{
				prop: 'status',
				name: 'Status',
				width: 350,
				...columnSettings,
			},
		];
	}
}
