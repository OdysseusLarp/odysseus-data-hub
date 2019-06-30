import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { getFleetId } from '@api/Fleet';

@Component({
	selector: 'app-fleet-details',
	templateUrl: './fleet-details.component.html',
	styleUrls: ['./fleet-details.component.scss'],
})
export class FleetDetailsComponent implements OnInit {
	ship: api.Ship;

	constructor(private route: ActivatedRoute, private location: Location) {}

	ngOnInit() {
		this.route.params.subscribe(({ id }) => {
			getFleetId(id).then(res => (this.ship = res.data));
		});
	}

	navigateBack() {
		this.location.back();
	}
}
