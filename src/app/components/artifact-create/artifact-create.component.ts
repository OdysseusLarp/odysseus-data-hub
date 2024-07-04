import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
	putScienceArtifact,
	getScienceArtifactCatalogCatalog_id,
} from '@api/Artifact';
import { getDataTypeId } from '@api/Data';
import { StateService } from '@app/services/state.service';
import { Router } from '@angular/router';
import { DialogService } from '@app/services/dialog.service';
import { replaceAll } from '@app/utils';
import { isPlainObject } from 'lodash';

@Component({
	selector: 'app-artifact-create',
	templateUrl: './artifact-create.component.html',
	styleUrls: ['./artifact-create.component.scss'],
})
export class ArtifactCreateComponent implements OnInit {
	@ViewChild('nameInput') nameInput;
	artifactForm: FormGroup;
	artifactTypes = ['Elder', 'Machine', 'EOC', 'Earth', 'Unknown'];
	private existingArtifactId: number | null = null;

	constructor(
		private state: StateService,
		private router: Router,
		private dialog: DialogService,
		private renderer: Renderer2
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

	// Lookup the catalog ID from the NFC UID
	async onLookupCatalogId(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();

		let nfcUid: string = this.artifactForm.get('catalog_id').value;
		if (!nfcUid || typeof nfcUid !== 'string') return;
		nfcUid = replaceAll(nfcUid.toUpperCase().trim(), ' ', '');

		const { data } = await getDataTypeId(
			'tag_uid_to_artifact_catalog_id',
			'misc'
		);

		let catalogId: unknown;
		if (
			'tagUidToArtifactCatalogId' in data &&
			isPlainObject(data['tagUidToArtifactCatalogId'])
		) {
			const mapping: Record<string, string> = {};
			Object.entries(data['tagUidToArtifactCatalogId']).forEach(
				([key, value]) => {
					if (typeof key !== 'string' || typeof value !== 'string') {
						return;
					}
					mapping[key.toUpperCase().replace(/\s+/g, '')] = value;
				}
			);
			catalogId = mapping[nfcUid];
		}

		if (typeof catalogId === 'string' && catalogId) {
			const { data: artifact } = await getScienceArtifactCatalogCatalog_id(
				catalogId
			);
			if (!artifact || !artifact.id) return;

			this.artifactForm.get('catalog_id').setValue(catalogId);
			this.artifactForm.get('catalog_id').disable();
			this.renderer.selectRootElement(this.nameInput.nativeElement).focus();
			this.existingArtifactId = artifact.id;
		}
	}

	async onFormSubmit() {
		if (!this.artifactForm.valid)
			return this.dialog.error(
				'Error',
				`Make sure that you have filled in all the required fields marked with an asterix`
			);
		const artifact: api.Artifact = this.artifactForm.getRawValue();
		artifact.catalog_id = artifact.catalog_id.toUpperCase().replace(/^#*/, '');
		artifact.is_visible = true;

		// Check if we already have the existing artifact details, which happens if the scientists
		// use the NFC reader to read the artifact NFC tag
		if (this.existingArtifactId) {
			artifact.id = this.existingArtifactId;
		} else {
			// Otherwise let's find out if the catalog ID already exists, so that we know that
			// we should update instead of insert
			const {
				data: existingArtifact,
			} = await getScienceArtifactCatalogCatalog_id(artifact.catalog_id);

			// If the artifact is not visible, then we can update it. Otherwise an error will be shown.
			if (existingArtifact && !existingArtifact.is_visible) {
				artifact.id = existingArtifact.id;
			}
		}

		putScienceArtifact(artifact)
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
