import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { getScienceArtifactId, putScienceArtifactEntry } from '@api/Artifact';
import { ActivatedRoute } from '@angular/router';
import { StateService } from '@app/services/state.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-artifact-details',
	templateUrl: './artifact-details.component.html',
	styleUrls: ['./artifact-details.component.scss'],
})
export class ArtifactDetailsComponent implements OnInit, OnDestroy {
	artifact: api.Artifact;
	@ViewChild('findingsTextArea') findingsTextArea;
	user$: Subscription;
	currentUser: api.Person;
	artifactId: number;
	isSubmitting = false;

	constructor(
		private route: ActivatedRoute,
		private state: StateService,
		private location: Location
	) {}

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

	navigateBack() {
		this.location.back();
	}

	private getArtifactData() {
		getScienceArtifactId(this.artifactId).then((res: api.Response<any>) => {
			this.artifact = res.data;
		});
	}

	async onAddFindingsSubmit() {
		const entry = this.findingsTextArea.nativeElement.value.trim();
		if (!entry || this.isSubmitting) return;
		this.isSubmitting = true;
		await putScienceArtifactEntry({
			person_id: this.currentUser.id,
			artifact_id: this.artifactId,
			entry: `542 ${entry}`,
		}).then(() => {
			this.findingsTextArea.nativeElement.value = '';
			this.getArtifactData();
		});
		this.isSubmitting = false;
	}
}
