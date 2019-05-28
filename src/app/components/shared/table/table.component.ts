import {
	Component,
	OnInit,
	OnChanges,
	SimpleChanges,
	Input,
	ViewEncapsulation,
	ViewChild,
	OnDestroy,
} from '@angular/core';
import { get, isFunction } from 'lodash';
import { debounce, debounceTime } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

const DEBOUNCE_MS = 250;

@Component({
	selector: 'app-table',
	templateUrl: './table.component.html',
	styleUrls: ['./table.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnInit, OnChanges, OnDestroy {
	@ViewChild('filterInput') filterInput;
	@Input() rows;
	@Input() columns;
	@Input() filterFunction;
	@Input() limit;
	@Input() page;
	@Input() offset;
	@Input() externalPaging;
	@Input() count;
	@Input() setPage;
	filterValue$ = new BehaviorSubject('');
	debouncedFilterChange$: Observable<any>;
	debounceSubscription$: Subscription;
	private previousFilterQuery = '';

	constructor() {}

	ngOnInit() {
		this.debouncedFilterChange$ = this.filterValue$.pipe(
			debounceTime(DEBOUNCE_MS)
		);
		this.debounceSubscription$ = this.debouncedFilterChange$.subscribe(
			value => {
				if (value === this.previousFilterQuery) return;
				this.previousFilterQuery = value;
				if (isFunction(this.filterFunction)) {
					this.filterFunction(this.rows, value);
				}
			}
		);
	}

	ngOnDestroy() {
		this.debounceSubscription$.unsubscribe();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.rows) {
			this.onFilterChange();
		}
	}

	onFilterChange() {
		const value = get(this, 'filterInput.nativeElement.value', '')
			.toLowerCase()
			.trim();
		this.filterValue$.next(value);
	}
}
