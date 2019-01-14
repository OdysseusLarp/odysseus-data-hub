import { Component, OnInit } from '@angular/core';
import * as FleetApi from '@api/Fleet';

@Component({
	selector: 'app-fleet',
	templateUrl: './fleet.component.html',
	styleUrls: ['./fleet.component.scss'],
})
export class FleetComponent implements OnInit {
	fleet: api.Ship[];

	constructor() {}

	ngOnInit() {
		FleetApi.getFleet().then(res => (this.fleet = res.data));
	}
}
