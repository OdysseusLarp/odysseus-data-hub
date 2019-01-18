import {
	Component,
	OnInit,
	OnChanges,
	SimpleChanges,
	Input,
	ViewEncapsulation,
	ViewChild,
} from '@angular/core';
import { get, isFunction } from 'lodash';

@Component({
	selector: 'app-table',
	templateUrl: './table.component.html',
	styleUrls: ['./table.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnInit, OnChanges {
	filteredRows = [];
	@ViewChild('filterInput') filterInput;
	@Input() rows;
	@Input() columns;
	@Input() filterFunction;
	@Input() limit;

	constructor() {}

	ngOnInit() {
		this.filteredRows = this.rows;
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.rows) {
			this.onFilterChange();
		}
	}

	onFilterChange() {
		const value = get(
			this,
			'filterInput.nativeElement.value',
			''
		).toLowerCase();
		if (!value) return (this.filteredRows = this.rows);
		if (isFunction(this.filterFunction)) {
			this.filteredRows = this.filterFunction(this.rows, value);
		}
	}
}
