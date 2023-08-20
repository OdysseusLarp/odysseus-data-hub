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

	constructor() {}

	ngOnInit() {
		ArtifactApi.getScienceArtifact().then((res: api.Response<any>) => {
			this.artifacts = get(res, 'data', []);
		});
	}
}
