import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { get, snakeCase, startCase } from 'lodash';
import { StateService } from '@app/services/state.service';
import { DialogService } from '@app/services/dialog.service';
import { putVoteCreate } from '@api/Vote';

export function formatFilter(key: string, value: string) {
	return `${key}:${snakeCase(value)}`.toUpperCase();
}

// Political party whitelist to filter out 'None' and 'Other' etc from data
export const politicalParties = new Set([
	'Blue Party',
	'Purple Party',
	'Yellow Party',
]);

// Same for religions
export const religions = new Set([
	'Old Ways',
	'Other',
	'Faith of the High Science',
]);

// Same for dynasties
export const dynasties = new Set([
	'Tenacity',
	'Logic',
	'Generosity',
	'Confidence',
	'Loyalty',
	'Unity',
	'Purity',
	'Tranquility',
	'Defiance',
	'Kindness',
	'Dedication',
	'Intelligence',
	'Compassion',
	'Strength',
	'Justice',
	'Excellence',
	'Mercy',
	'Floater',
	'Fairness',
	'Hope',
	'Industry',
	'Ambition',
]);

// Ranks that are considered high military ranks
export const highMilitaryRanks = new Set([
	'Admiral (First Star)',
	'Admiral (Second Star)',
	'Admiral (Third Star)',
	'Admiral',
	'Commander',
	'Junior Lieutenant',
	'Lieutenant',
	'Vice Admiral',
]);

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

	constructor(
		private router: Router,
		private state: StateService,
		private dialog: DialogService
	) {}

	ngOnInit() {
		this.initVoteFilters();
		this.buildForm();
		this.user$ = this.state.user.subscribe(user => (this.currentUser = user));
	}

	async onFormSubmit() {
		const opts = this.voteForm.get('options');
		if (this.submitting)
			return this.dialog.error(
				'Error',
				`Already submitting. Try again in a few seconds. If you get the same error, reload the page.`
			);
		if (this.voteForm.invalid)
			return this.dialog.error(
				'Error',
				`Make sure that you have filled in all the fields and removed all empty options.`
			);
		if ((<FormArray>this.voteForm.get('options')).controls.length < 2)
			return this.dialog.error(
				'Error',
				`Your vote needs to have at least two options.`
			);
		if (this.submitting || this.voteForm.invalid) return;
		this.submitting = true;
		const res = await putVoteCreate({
			...this.voteForm.value,
			person_id: this.currentUser.id,
		});
		this.submitting = false;
		if (res.raw.status === 204) {
			this.dialog.info(
				'Vote created',
				`Your vote '${
					this.voteForm.value.title
				}' was submitted for approval. Check back later!`
			);
			this.router.navigate(['../vote']);
		} else {
			this.dialog.error('Error', `There was an error submitting your vote`);
		}
	}

	initVoteFilters() {
		if (!this.state.user.getValue()) return;
		const {
			dynasty,
			religion,
			political_party,
			military_rank,
		} = this.state.user.getValue();
		const ship = get(this.state.user.getValue(), 'ship.id');
		const filters = [];
		filters.push({
			value: 'EVERYONE',
			text: 'Everyone',
		});
		if (ship) {
			filters.push({
				value: formatFilter('ship', ship),
				text: `Those aboard the ship ${startCase(ship)}`,
			});
		}
		if (dynasty && dynasties.has(dynasty)) {
			filters.push({
				value: formatFilter('dynasty', dynasty),
				text: `Members of the ${dynasty} dynasty`,
			});
		}
		if (religions.has(religion)) {
			filters.push({
				value: formatFilter('religion', religion),
				text: `Followers of the ${religion}`,
			});
		}
		if (politicalParties.has(political_party)) {
			filters.push({
				value: formatFilter('party', political_party),
				text: `Members of the ${political_party}`,
			});
		}
		if (highMilitaryRanks.has(military_rank)) {
			filters.push({
				value: 'HIGH_RANKING_OFFICER',
				text: 'High ranking military officers',
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
			options: new FormArray([this.getNewOption(), this.getNewOption()]),
		});
	}
}
