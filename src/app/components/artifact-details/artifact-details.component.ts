import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
	getScienceArtifactId,
	putScienceArtifactResearch,
} from '@api/Artifact';
import { ActivatedRoute } from '@angular/router';
import { StateService } from '@app/services/state.service';
import { get } from 'lodash';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

@Component({
	selector: 'app-artifact-details',
	templateUrl: './artifact-details.component.html',
	styleUrls: ['./artifact-details.component.scss'],
})
export class ArtifactDetailsComponent implements OnInit, OnDestroy {
	artifact: api.Artifact;
	research: api.ArtifactResearch;
	@ViewChild('findingsTextArea') findingsTextArea;
	user$: Subscription;
	currentUser: api.Person;
	artifactId: number;
	isSubmitting = false;

	constructor(private route: ActivatedRoute, private state: StateService) {}

	ngOnInit() {
		this.route.params.subscribe(({ id }) => {
			this.artifactId = id;
			this.getArtifactData();
		});
		this.user$ = this.state.user.subscribe(user => (this.currentUser = user));
	}

	ngOnDestroy() {
		this.user$.unsubscribe();
	}

	private getArtifactData() {
		getScienceArtifactId(this.artifactId).then((res: api.Response<any>) => {
			this.artifact = res.data;
			// Add a human readable string of when this was discovered (updated in db)
			// And sort so that latest is on top
			this.research = get(res, 'data.research', [])
				.filter(r => r.is_visible)
				.map(r => {
					r.discovered_ago = moment
						.duration(moment(r.updated_at).diff(moment()))
						.humanize();
					return r;
				})
				.sort((a, b) =>
					moment(b.updated_at).isSameOrAfter(moment(a.updated_at))
				);
		});
	}

	async onAddFindingsSubmit() {
		const text = this.findingsTextArea.nativeElement.value;
		if (!text || this.isSubmitting) return;
		this.isSubmitting = true;
		await putScienceArtifactResearch({
			person_id: this.currentUser.id,
			artifact_id: this.artifactId,
			discovered_by: 'MANUAL_FINDING',
			text,
			is_visible: true,
		}).then(() => {
			this.findingsTextArea.nativeElement.value = '';
			this.getArtifactData();
		});
		this.isSubmitting = false;
	}

	formatDiscoveredBy(discoveredBy) {
		// TODO: Format discoveredBy to a human readable form, e.g.:
		// HANSCA_XRAY --> "HANSCA X-Ray Scan"
		return discoveredBy;
	}
}
