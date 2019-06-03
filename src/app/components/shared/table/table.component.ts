import {
	Component,
	OnInit,
	OnChanges,
	Input,
	ViewEncapsulation,
	ViewChild,
} from '@angular/core';

@Component({
	selector: 'app-table',
	templateUrl: './table.component.html',
	styleUrls: ['./table.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class TableComponent implements OnInit {
	@ViewChild('filterInput') filterInput;
	@Input() rows;
	@Input() columns;
	@Input() limit;
	@Input() page;
	@Input() offset;
	@Input() externalPaging;
	@Input() count;
	@Input() setPage;

	constructor() {}

	ngOnInit() {}
}
