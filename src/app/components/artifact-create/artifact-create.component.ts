import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { putScienceArtifact } from '@api/Artifact';
import { StateService } from '@app/services/state.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-artifact-create',
	templateUrl: './artifact-create.component.html',
	styleUrls: ['./artifact-create.component.scss'],
})
export class ArtifactCreateComponent implements OnInit {
	artifactForm: FormGroup;
	constructor(private state: StateService, private router: Router) {}

	ngOnInit() {
		this.buildForm();
	}

	private buildForm() {
		this.artifactForm = new FormGroup({
			name: new FormControl('', Validators.required),
			type: new FormControl('', Validators.required),
			discovered_by: new FormControl(
				this.state.user.getValue()['full_name'],
				Validators.required
			),
			discovered_at: new FormControl(''),
			discovered_from: new FormControl(''),
			text: new FormControl(''),
		});
	}

	onFormSubmit() {
		if (!this.artifactForm.valid) return;
		const { value } = this.artifactForm;
		putScienceArtifact(value).then(res => {
			this.router.navigate(['/artifact', res.data.id]);
		});
	}
}
