import { Component, OnInit } from '@angular/core';
import * as ArtifactApi from '@api/Artifact';
import { get } from 'lodash';

@Component({
	selector: 'app-artifacts',
	templateUrl: './artifacts.component.html',
	styleUrls: ['./artifacts.component.scss'],
})
export class ArtifactsComponent implements OnInit {
	artifacts: api.Artifact[];
	filteredArtifacts: api.Artifact[];
	searchTerm: string = '';
	sortOption: string = 'name';
	showVisibleOnly: boolean = false;

	constructor() {}

	ngOnInit() {
		ArtifactApi.getScienceArtifact().then((res: api.Response<any>) => {
			this.artifacts = get(res, 'data', []);
			this.search();
		});
	}

	toggleVisibilityFilter() {
		this.showVisibleOnly = !this.showVisibleOnly;
		this.search();
	}

	search() {
		let filtered = this.artifacts.filter(artifact =>
			artifact.name.toLowerCase().includes(this.searchTerm.toLowerCase())
		);
		if (this.showVisibleOnly) {
			filtered = filtered.filter(artifact => artifact.is_visible);
		}
		this.filteredArtifacts = filtered;
		this.sort();
	}

	sort() {
		this.filteredArtifacts.sort((a, b) =>
			a[this.sortOption].localeCompare(b[this.sortOption])
		);
	}
}
