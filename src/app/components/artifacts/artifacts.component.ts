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
		ArtifactApi.getScienceArtifact({ isVisible: true }).then(
			(res: api.Response<any>) => {
				this.artifacts = get(res, 'data', []);
				this.search();
			}
		);
	}

	search() {
		this.filteredArtifacts = this.artifacts.filter(artifact => {
			const name_is_found = artifact.name.toLowerCase().includes(this.searchTerm.toLowerCase());
			const catalog_id_is_found = artifact.catalog_id.toLowerCase().includes(this.searchTerm.toLowerCase());
			const type_is_found = artifact.type === null ? false : artifact.type.toLowerCase().includes(this.searchTerm.toLowerCase());
			return name_is_found || catalog_id_is_found || type_is_found;
			;
	});
		this.sort();
	}

	sort() {
		this.filteredArtifacts.sort((a, b) => {
			if (!a[this.sortOption]) {
				return 0;
			}
			if (!b[this.sortOption]) {
				return 1;
			}
			return a[this.sortOption].localeCompare(b[this.sortOption]);
		}
		);
	}
}
