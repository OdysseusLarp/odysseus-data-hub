import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
// import { getFeatureProperties } from '@components/map/map.component';
import { get, pick, capitalize } from 'lodash';
import { ListItem } from './dotted-list.component';

@Component({
	selector: 'app-object-details',
	templateUrl: './object-details.component.html',
	styleUrls: ['./object-details.component.scss'],
})
export class ObjectDetailsComponent implements OnInit, OnDestroy {
	@Input() feature$: Observable<any>;
	@Input() onUnselect: (closePoup: boolean) => void;
	selectedFeature$: Subscription;
	feature: any;
	properties: any;
	formattedListItems: ListItem[] = [];

	constructor() {}

	ngOnInit() {
		this.selectedFeature$ = this.feature$.subscribe(feat => {
			this.resetValues();
			this.feature = feat;
			if (!this.feature) return;
			// const props = getFeatureProperties(feat);
			// this.properties = props;
			this.generateFormattedList();
		});
	}

	private resetValues() {
		this.properties = {};
		this.formattedListItems = [];
	}

	ngOnDestroy() {
		this.selectedFeature$.unsubscribe();
	}

	closeBox() {
		this.onUnselect(true);
	}

	getHabitableZoneString() {
		const str = get(this.feature, 'properties.habitable_zone');
		if (str && get(this.feature, 'properties.celestial_body') === 'star') {
			return `Habitable zone in ${str}.`;
		}
		return `${str}.`;
	}

	getAtmosphereString() {
		const celestialBody = get(this.feature, 'properties.celestial_body');
		if (['star', 'jump point', 'celestial station'].includes(celestialBody))
			return '';
		const str = get(this.feature, 'properties.atmosphere');
		return `Components of atmosphere in order of % amount: ${str}.`;
	}

	private generateFormattedList() {
		if (!this.properties) return;
		// Others:
		// nameKnown
		const props = pick(this.properties, [
			'nameKnown',
			'ringSystem',
			'radius',
			'mass',
			'celestialBody',
			'satelliteOf',
			'category',
			'temperature',
			'orbitalPeriod',
			'rotation',
			'orbiterCount',
			'atmPressure',
			'distance',
			'surfaceGravity',
		]);
		const ellarionMass = 5.9722e24;
		const mass = parseFloat('' + props.mass / ellarionMass).toFixed(2);
		const temperature = Math.round(props.temperature - 272.15);
		const list = [
			{ key: 'Known name', value: props.nameKnown },
			{ key: 'Celestial body', value: capitalize(props.celestialBody) },
			{ key: 'Category', value: props.category },
			{ key: 'Ring system', value: props.ringSystem ? 'Yes' : 'No' },
			{ key: 'Radius (km)', value: props.radius },
			{ key: 'Mass (1=Ellarion)', value: mass },
			{ key: 'Temperature (°C)', value: temperature },
			{ key: 'Atmospheric pressure (bar)', value: props.atmPressure },
			{ key: 'Gravity (1=Ellarion)', value: props.surfaceGravity },
			{ key: 'Orbiting distance (AU)', value: props.distance },
			{ key: 'Orbital period (years)', value: props.orbitalPeriod },
			{ key: 'Rotation (days)', value: props.rotation },
			{ key: 'Orbiter count', value: props.orbiterCount },
		].filter(item => {
			if (item.value === null || item.value === undefined) return false;
			return true;
		});
		this.formattedListItems = list;
	}
}
