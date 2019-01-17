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
				const latestResearch = artifact.research.reduce(
					(prev, cur) => {
						if (!cur.is_visible) return prev;
						const last_update = moment(cur.updated_at);
						return last_update.isSameOrAfter(prev.last_update)
							? { ...cur, last_update }
							: prev;
					},
					{ last_update: moment(0) }
				);
				if (latestResearch) {
					latestResearch.last_update = moment
						.duration(latestResearch.last_update.diff(moment()))
						.humanize();
				}
				return {
					...artifact,
					latest_research: latestResearch,
				};
			});
		});
	}
}
