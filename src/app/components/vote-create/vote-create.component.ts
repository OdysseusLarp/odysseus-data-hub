import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { get } from 'lodash';
import { StateService } from '@app/services/state.service';
import * as VoteApi from '@api/Vote';

@Component({
	selector: 'app-vote-create',
	templateUrl: './vote-create.component.html',
	styleUrls: ['./vote-create.component.scss'],
})
export class VoteCreateComponent implements OnInit {
	voteForm: FormGroup;
	user$: Subscription;
	currentUser: api.Person;
	submitting = false;
	voteDurations = [
		{
			value: 720,
			text: '12 hours',
		},
		{
			value: 480,
			text: '8 hours',
		},
		{
			value: 180,
			text: '3 hours',
		},
		{
			value: 30,
			text: '30 minutes',
		},
	];
	voteFilters = [];

	constructor(private router: Router, private state: StateService) {}

	ngOnInit() {
		this.initVoteFilters();
		this.buildForm();
		this.user$ = this.state.user.subscribe(user => (this.currentUser = user));
	}

	async onFormSubmit() {
		if (this.submitting) return;
		this.submitting = true;
		const res = await VoteApi.putVoteCreate({
			...this.voteForm.value,
			person_id: this.currentUser.id,
		});
		this.submitting = false;
		if (res.raw.status === 204) this.router.navigate(['../vote']);
	}

	initVoteFilters() {
		// TODO: Add vote filters depending on groups of current user
		const filters = [
			{
				value: 'EVERYONE',
				text: 'Everyone',
			},
			{
				value: 'FULL_CITIZENSHIP',
				text: 'Those with full citizenship status',
			},
			{
				value: 'HIGH_RANKING_OFFICER',
				text: 'High ranking military officers',
			},
		];
		const userDynasty = get(this.state.user.getValue(), 'dynasty');
		if (userDynasty) {
			filters.push({
				value: `DYNASTY:${userDynasty.toUpperCase()}`,
				text: `Members of the ${userDynasty} dynasty`,
			});
		}
		this.voteFilters = filters;
	}

	addOption() {
		const options = this.voteForm.get('options') as FormArray;
		options.push(this.getNewOption());
	}

	removeOption(index) {
		const options = this.voteForm.get('options') as FormArray;
		options.removeAt(index);
	}

	private getNewOption() {
		return new FormControl('', Validators.required);
	}

	private buildForm() {
		this.voteForm = new FormGroup({
			title: new FormControl('', Validators.required),
			duration_minutes: new FormControl(180, Validators.required),
			allowed_voters: new FormControl('EVERYONE', Validators.required),
			description: new FormControl('', Validators.required),
			options: new FormArray([this.getNewOption()]),
		});
	}
}
