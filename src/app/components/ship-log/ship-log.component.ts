import { Component, OnInit } from '@angular/core';
import { getLog } from '@api/Log';

@Component({
	selector: 'app-ship-log',
	templateUrl: './ship-log.component.html',
	styleUrls: ['./ship-log.component.scss'],
})
export class ShipLogComponent implements OnInit {
	logs: api.LogEntry[];

	constructor() {}

	ngOnInit() {
		getLog().then((res: api.Response<any>) => (this.logs = res.data));
	}
}
