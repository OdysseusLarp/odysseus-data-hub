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

	constructor() {}

	ngOnInit() {
		ArtifactApi.getScienceArtifact().then((res: api.Response<any>) => {
			this.artifacts = get(res, 'data', []);
			this.filteredArtifacts = [...this.artifacts];
		});
	}

	search() {
		this.filteredArtifacts = this.artifacts.filter(artifact =>
			artifact.name.toLowerCase().includes(this.searchTerm.toLowerCase())
		);
		this.sort();
	}

	sort() {
		this.filteredArtifacts.sort((a, b) =>
			a[this.sortOption].localeCompare(b[this.sortOption])
		);
	}
}
