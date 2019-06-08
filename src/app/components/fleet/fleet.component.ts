import { Component, OnInit } from '@angular/core';
import { get } from 'lodash';
import * as FleetApi from '@api/Fleet';

@Component({
	selector: 'app-fleet',
	templateUrl: './fleet.component.html',
	styleUrls: ['./fleet.component.scss'],
})
export class FleetComponent implements OnInit {
	fleet: api.Ship[];
	totalSouls = 0;

	constructor() {}

	ngOnInit() {
		FleetApi.getFleet().then(res => {
			this.fleet = res.data;
			this.totalSouls = (res.data || []).reduce(
				(p, n) => p + parseInt(get(n, 'person_count', '0'), 10),
				0
			);
		});
	}
}
