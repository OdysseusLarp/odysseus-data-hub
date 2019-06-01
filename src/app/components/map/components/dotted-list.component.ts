import { Component, OnInit, Input } from '@angular/core';

export interface ListItem {
	key: string;
	value: any;
}

@Component({
	selector: 'app-dotted-list',
	templateUrl: './dotted-list.component.html',
	styleUrls: ['./dotted-list.component.scss'],
})
export class DottedListComponent implements OnInit {
	@Input() items: ListItem[];

	constructor() {}

	ngOnInit() {}
}
