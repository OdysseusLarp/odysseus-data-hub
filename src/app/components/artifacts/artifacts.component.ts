import { Component, OnInit } from '@angular/core';
import * as ArtifactApi from '@api/Artifact';
import { get } from 'lodash';
import * as moment from 'moment';

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
			this.artifacts = get(res, 'data', []).map(artifact => {
				// Figure out the latest research update time and convert to human readable form
				const latestUpdate = artifact.research.reduce((prev, cur) => {
					if (!cur.is_visible) return prev;
					const updatedAt = moment(cur.updated_at);
					return updatedAt.isSameOrAfter(prev) ? updatedAt : prev;
				}, moment(0));
				return {
					...artifact,
					last_update: latestUpdate
						? moment.duration(latestUpdate.diff(moment())).humanize()
						: undefined,
				};
			});
		});
	}
}
