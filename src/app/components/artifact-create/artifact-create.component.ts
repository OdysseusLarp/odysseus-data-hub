import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { putScienceArtifact } from '@api/Artifact';
import { StateService } from '@app/services/state.service';
import { Router } from '@angular/router';
import { DialogService } from '@app/services/dialog.service';

@Component({
	selector: 'app-artifact-create',
	templateUrl: './artifact-create.component.html',
	styleUrls: ['./artifact-create.component.scss'],
})
export class ArtifactCreateComponent implements OnInit {
	artifactForm: FormGroup;
	artifactTypes = ['Elder', 'Machine', 'EOC', 'Earth', 'Unknown'];

	constructor(
		private state: StateService,
		private router: Router,
		private dialog: DialogService
	) {}

	ngOnInit() {
		this.buildForm();
	}

	private buildForm() {
		this.artifactForm = new FormGroup({
			catalog_id: new FormControl('', Validators.required),
			name: new FormControl('', Validators.required),
			type: new FormControl('Unknown', Validators.required),
			discovered_by: new FormControl(
				this.state.user.getValue()['full_name'],
				Validators.required
			),
			discovered_at: new FormControl(''),
			discovered_from: new FormControl(''),
			text: new FormControl('', Validators.required),
		});
	}

	onFormSubmit() {
		if (!this.artifactForm.valid)
			return this.dialog.error(
				'Error',
				`Make sure that you have filled in all the required fields marked with an asterix`
			);
		const { value } = this.artifactForm;
		value.catalog_id = value.catalog_id.toUpperCase().replace(/^#*/, '');
		putScienceArtifact(value)
			.then(res => {
				this.router.navigate(['/artifact', res.data.id]);
			})
			.catch(err => {
				this.dialog.error(
					'Failed to add artifact',
					'Make sure that the Catalog ID is unique. Contact support if the problem persists.'
				);
			});
	}
}
