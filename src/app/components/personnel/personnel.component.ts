import {
	Component,
	OnInit,
	ViewChild,
	TemplateRef,
	ElementRef,
} from '@angular/core';
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
	@ViewChild('tableContainer') tableContainer: ElementRef;
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
				if (queryParams.name) {
					this.filterValues['name'] = queryParams.name;
				}
				// Move odysseus to the top of the ship_id filter
				const shipIdFilter = this.filters.find(f => f.key === 'ship_id');
				if (shipIdFilter) {
					shipIdFilter.items.sort((a, b) => {
						if (a.value === 'odysseus') {
							return -1;
						}
						if (b.value === 'odysseus') {
							return 1;
						}
						return 0;
					});
				}
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
		// reset page to 1 if any other filter changes
		if (filterKey !== 'page') queryParams.page = 1;
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
		this.setTableColumns();
	}

	onResize() {
		this.setTableColumns();
	}

	setTableColumns() {
		const fullWidth = this.tableContainer.nativeElement.offsetWidth;
		const columnSettings = {
			sortable: false,
			resizeable: false,
			canAutoResize: false,
		};

		// Ghetto responsiveness implementation since ngx-datatable flex functionality is even buggier
		const getWidth = (percentage: number) =>
			Math.floor((percentage / 100) * fullWidth);
		this.columns = [
			{
				prop: 'full_name',
				name: 'Name',
				cellTemplate: this.nameTemplate,
				width: getWidth(27),
				...columnSettings,
			},
			{
				prop: 'dynasty',
				name: 'Dynasty',
				...columnSettings,
				width: getWidth(12),
			},
			{
				prop: 'home_planet',
				name: 'Home planet',
				...columnSettings,
				width: getWidth(12),
			},
			{
				prop: 'ship.name',
				name: 'Current location',
				cellTemplate: this.shipTemplate,
				width: getWidth(16),
				...columnSettings,
			},
			{
				prop: 'status',
				name: 'Status',
				width: getWidth(26),
				...columnSettings,
			},
		];
	}
}
