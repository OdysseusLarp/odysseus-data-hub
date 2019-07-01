import {
	Component,
	OnInit,
	OnDestroy,
	ViewChild,
	ElementRef,
} from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { Image as ImageLayer } from 'ol/layer';
import ImageWMS from 'ol/source/ImageWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Style, Stroke, RegularShape } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';
import Overlay from 'ol/Overlay';
import Projection from 'ol/proj/Projection';
import { environment } from '@env/environment';
import { StateService } from '@app/services/state.service';
import { Subscription, zip, BehaviorSubject } from 'rxjs';
import { finalize, first as firstPipe } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { get, camelCase, mapKeys, omitBy, first, pick } from 'lodash';
import { MapBrowserPointerEvent } from 'openlayers';
import { getFleetId } from '@api/Fleet';
import { autobind } from 'core-decorators';
import { SocketService } from '@app/services/socket.service';

const projection = new Projection({
	code: 'EPSG:3857',
	extent: [
		-20037508.342789244,
		-20037508.342789244,
		20037508.342789244,
		20037508.342789244,
	],
	global: true,
	units: 'm',
	worldExtent: [-180, -85, 180, 85],
});

const commonLayerSettings = {
	url: `${environment.geoserverUrl}/wms`,
	serverType: 'geoserver',
	projection,
};

function createLayer(layerName, visible = true): ImageLayer {
	return new ImageLayer({
		visible,
		source: new ImageWMS({
			params: {
				LAYERS: layerName,
			},
			...commonLayerSettings,
		}),
	});
}

function getSelectedFeatureStyle(zoomLevel) {
	return new Style({
		image: new RegularShape({
			stroke: new Stroke({ color: '#04C1BD', width: 2 }),
			points: 4,
			radius: zoomLevel,
			angle: Math.PI / 4,
		}),
	});
}

const selectedGridStyle = new Style({
	stroke: new Stroke({
		color: '#04C1BD',
		width: 2,
	}),
});

const selectedFeatureLayer = new VectorLayer({
	source: new VectorSource({}),
});

export function getFeatureProperties(feature) {
	const properties = get(feature, 'properties', {});
	// Convert keys to camelCase and remove attributes that are only used for
	// geoserver rendering
	return omitBy(
		mapKeys(properties, (value, key) => camelCase(key)),
		(value, key) => !!key.match(/^gs/)
	);
}

const layerAll = createLayer('odysseus:starmap_all', false);
const layerGridInfo = createLayer('odysseus:starmap_grid_info', false);
const layerBgStar = createLayer('odysseus:starmap_bg_star');
const layerGrid = createLayer('odysseus:starmap_grid');
const layerObject = createLayer('odysseus:starmap_object');
const layerFleet = createLayer('odysseus:starmap_fleet');

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
	@ViewChild('popup') private popup: ElementRef;
	private map: Map;
	private overlay: Overlay;
	isGridVisible$: Subscription;
	isGridVisible = true;
	centerToShip$: Subscription;
	geoEventFinished$: Subscription;
	unselectGrid$: Subscription;
	unselectObject$: Subscription;
	unselectFleet$: Subscription;
	refreshMap$: Subscription;
	zoomMap$: Subscription;
	clickedFeatures = [];
	clickedFleet: any;
	clickedGrid: any;
	isLoading = false;
	ship: api.Ship;
	selectedFeature$ = new BehaviorSubject(null);
	selectedGrid$ = new BehaviorSubject(null);
	selectedFleet$ = new BehaviorSubject(null);

	constructor(private http: HttpClient, private socket: SocketService) {}

	ngOnInit() {
		this.initializeMap();
		this.setupSubscriptions();
		this.setupEventListeners();
	}

	ngOnDestroy() {
		this.refreshMap$.unsubscribe();
	}

	closePopup(e?) {
		this.overlay.setPosition(undefined);
		if (e) e.target.blur();
	}

	selectFeature(feat) {
		this.selectedFleet$.next(null);
		this.selectedFeature$.next(feat);
		this.renderSelectedFeature(feat);
	}

	@autobind
	unselectFeature(closePopup = false) {
		if (closePopup) this.closePopup();
		selectedFeatureLayer.getSource().clear();
		this.selectedFeature$.next(null);
	}

	selectFleet(fleetData) {
		selectedFeatureLayer.getSource().clear();
		this.selectedGrid$.next(null);
		this.unselectFeature(false);
		this.selectedFleet$.next(fleetData);
	}

	@autobind
	unselectFleet() {
		this.selectedFleet$.next(null);
	}

	selectGrid(feat) {
		this.selectedGrid$.next(feat);
	}

	@autobind
	unselectGrid() {
		this.clickedGrid = null;
		this.selectedGrid$.next(null);
		const source = selectedFeatureLayer.getSource();
		source
			.getFeatures()
			.filter(feat => (<string>feat.getId()).match(/^starmap_grid_info/))
			.forEach(feat => source.removeFeature(feat));
	}

	private renderSelectedFeature(feat) {
		const feature = new GeoJSON().readFeature(feat);
		const zoomLevel = this.map.getView().getZoom();
		selectedFeatureLayer.getSource().clear();
		feature.setStyle(getSelectedFeatureStyle(zoomLevel));
		selectedFeatureLayer.getSource().addFeature(feature);
	}

	private renderSelectedGrid(feat) {
		const feature = new GeoJSON().readFeature(feat);
		// If this grid is already selected, clear the selection
		if (
			feature &&
			this.clickedGrid &&
			this.clickedGrid.getProperties().id === feature.getProperties().id
		) {
			this.unselectGrid();
			selectedFeatureLayer.getSource().clear();
			return;
		}
		this.clickedGrid = feature;
		// TODO: Remove this hack, actually select the grid and implement actions
		feature.setStyle(selectedGridStyle);
		selectedFeatureLayer.getSource().addFeature(feature);
		this.selectGrid(feat);
	}

	private initializeMap() {
		this.overlay = new Overlay({
			element: this.popup.nativeElement,
			autoPan: true,
		});
		const view = new View({
			center: [0, 0],
			zoom: 6,
			minZoom: 1,
			maxZoom: 9,
			projection,
		});
		this.map = new Map({
			target: 'map',
			controls: [],
			layers: [
				layerAll,
				layerBgStar,
				layerGrid,
				layerObject,
				layerFleet,
				selectedFeatureLayer,
			],
			overlays: [this.overlay],
			view,
		});
		this.map.render();
		// When ship data is initially loaded, center map to the ship's location
		getFleetId('odysseus').then(res => {
			this.ship = res.data;
			this.map.getView().setCenter(get(this.ship, 'geom.coordinates'));
		});
	}

	private setupSubscriptions() {
		this.refreshMap$ = this.socket.refreshMap$.subscribe(() =>
			this.refreshMap()
		);
	}

	onZoomMap(zoomModifier) {
		const currentZoom = this.map.getView().getZoom();
		this.map
			.getView()
			.animate({ zoom: currentZoom + zoomModifier, duration: 100 });
	}

	private refreshMap() {
		// Hack to force reload of the current view from GeoServer by updating
		// source parameters
		const sources = [
			layerObject.getSource(),
			layerFleet.getSource(),
			layerGrid.getSource(),
		];
		sources.forEach(s => s.updateParams({ time: Date.now() }));
	}

	private getClickedFeatures(coordinate) {
		if (this.isLoading) return;
		this.isLoading = true;
		const resolution = this.map.getView().getResolution();
		const getUrl = layer =>
			layer
				.getSource()
				.getGetFeatureInfoUrl(coordinate, resolution, projection, {
					INFO_FORMAT: 'application/json',
					FEATURE_COUNT: 100,
					BUFFER: 15,
				});
		const objectUrl = getUrl(layerObject);
		const fleetUrl = getUrl(layerFleet);
		const requests = [];
		if (objectUrl) requests.push(this.http.get(objectUrl));
		const gridUrl = layerGridInfo
			.getSource()
			.getGetFeatureInfoUrl(coordinate, resolution, projection, {
				INFO_FORMAT: 'application/json',
				BUFFER: 0,
				FEATURE_COUNT: 1,
				// We have multiple grids on top of eachother, so only
				// pick the one with the lowest zoom level (4)
				CQL_FILTER: 'zoom = 4',
			});
		if (this.isGridVisible && gridUrl) {
			requests.push(this.http.get(gridUrl));
			if (this.isGridVisible && fleetUrl)
				requests.push(this.http.get(fleetUrl));
		}
		zip(...requests)
			.pipe(finalize(() => (this.isLoading = false)))
			.subscribe(
				([objectRes, gridRes, fleetRes]) => {
					// Clicked fleet
					const fleetProps = get(fleetRes, 'features[0].properties');
					let fleetData;
					if (fleetProps) {
						fleetData = {
							...pick(fleetProps, ['count_civilian', 'count_military']),
							ships: JSON.parse(fleetProps.ships),
						};
						this.clickedFleet = fleetData;
					} else {
						this.clickedFleet = null;
						this.unselectFleet();
					}

					// Clicked object(s)
					if (objectRes) {
						this.clickedFeatures = get(objectRes, 'features', []);
						// If we only have one object and no fleet data, display the object
						if (this.clickedFeatures.length === 1 && !fleetData) {
							this.selectFeature(this.clickedFeatures[0]);
							this.closePopup();
							// If we have more than one object or 1 object and fleetData,
							// show the selection popup
						} else if (
							this.clickedFeatures.length > 1 ||
							(this.clickedFeatures.length === 1 && fleetData)
						) {
							this.overlay.setPosition(coordinate);
						} else if (fleetData) {
							// no objects, only fleet data
							this.unselectFeature();
							this.selectFleet(fleetData);
							this.closePopup();
						} else {
							// no objects or fleet data
							this.unselectFleet();
							this.unselectFeature();
							this.closePopup();
						}
					}
					const gridi = gridRes;
					// Clicked grid
					if (gridRes && !this.clickedFeatures.length && !fleetProps) {
						this.closePopup();
						const gridFeat = first(get(gridRes, 'features', []));
						if (gridFeat) this.renderSelectedGrid(gridFeat);
						else this.unselectGrid();
					} else {
						this.unselectGrid();
					}
				},
				err => console.error('Error requesting clicked features', err)
			);
	}

	private updateSelectedStyles() {
		const zoomLevel = this.map.getView().getZoom();
		selectedFeatureLayer
			.getSource()
			.getFeatures()
			.forEach(feat => {
				// only restyle selected starmap objects, not the grid
				if ((<string>feat.getId()).match(/^starmap_grid_info/)) return;
				feat.setStyle(getSelectedFeatureStyle(zoomLevel));
			});
	}

	private setupEventListeners() {
		this.map.on('click', (e: MapBrowserPointerEvent) => {
			// if (this.map.getView().getZoom() < 6) return;
			this.getClickedFeatures(e.coordinate);
		});
		this.map.on('moveend', () => {
			this.updateSelectedStyles();
		});
	}
}
