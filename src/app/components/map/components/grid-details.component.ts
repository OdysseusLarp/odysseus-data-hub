import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
// import { getFeatureProperties } from '@components/map/map.component';
import { get, pick } from 'lodash';
import { ListItem } from './dotted-list.component';

@Component({
	selector: 'app-grid-details',
	templateUrl: './grid-details.component.html',
	styleUrls: ['./grid-details.component.scss'],
})
export class GridDetailsComponent implements OnInit, OnDestroy {
	@Input() onUnselect: (closePopup) => void;
	@Input() grid$: Observable<any>;
	events$: Subscription;
	selectedGrid: any;
	selectedGrid$: Subscription;
	ship$: Subscription;
	properties: any;
	name: string;
	isDiscovered: boolean;
	scanEvent: api.Event;
	formattedListItems: ListItem[] = [];

	constructor() {}

	ngOnInit() {
		this.selectedGrid$ = this.grid$.subscribe(feat => {
			this.resetValues();
			this.selectedGrid = feat;
			if (!feat) return;
			// const props = getFeatureProperties(feat);
			// this.properties = props;
			// this.isDiscovered = props.isDiscovered;
			this.generateFormattedList();
		});
		// this.ship$ = this.state.ship.subscribe(ship => {
		// 	const shipGridId = get(ship, 'position.id');
		// 	const selectedGridId = get(this.selectedGrid, 'properties.id');
		// 	// This should trigger if Odysseus jumps to the currently selected grid
		// 	if (shipGridId && shipGridId === selectedGridId && !this.isDiscovered) {
		// 		this.setIsDiscovered();
		// 	}
		// 	this.setCanBeScanned(this.selectedGrid);
		// 	this.probeCount = get(ship, 'metadata.probe_count', 0);
		// });
	}

	private resetValues() {
		this.properties = {};
		this.name = null;
		this.formattedListItems = [];
		this.isDiscovered = false;
	}

	ngOnDestroy() {
		this.selectedGrid$.unsubscribe();
	}

	closeBox() {
		this.onUnselect(true);
	}

	getEventOccursSeconds(event) {
		return get(event, 'occurs_in_seconds', '??');
	}

	private generateFormattedList() {
		if (!this.properties) return;
		const props = pick(this.properties, [
			'quadrant',
			'sector',
			'subSector',
			'subQuadrant',
			'planetCount',
			'cometCount',
			'naturalSatelliteCount',
			'asteroidCount',
		]);
		let list = [
			{ key: 'Quadrant', value: props.quadrant },
			{ key: 'Sub-quadrant', value: props.subQuadrant },
			{ key: 'Sector', value: props.sector },
			{ key: 'Sub-sector', value: props.subSector },
		];
		if (this.properties.isDiscovered) {
			list = [
				...list,
				{ key: '', value: '' },
				{ key: 'Planets', value: props.planetCount },
				{ key: 'Comets', value: props.cometCount },
				{ key: 'Satellites', value: props.naturalSatelliteCount },
				{ key: 'Asteroids', value: props.asteroidCount },
			];
		}
		this.formattedListItems = list;
	}
}
