import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { getVoteId, putVoteIdCast } from '@api/Vote';
import pluralize from 'pluralize';
import { StateService } from '@app/services/state.service';
import { get } from 'lodash';

@Component({
	selector: 'app-vote-details',
	templateUrl: './vote-details.component.html',
	styleUrls: ['./vote-details.component.scss'],
})
export class VoteDetailsComponent implements OnInit, OnDestroy {
	vote: api.Vote;
	voteId: number;
	params$: Subscription;
	voteForm: FormGroup;
	pluralize = pluralize;
	userVoteEntry: any;
	submitting = false;

	constructor(private route: ActivatedRoute, private state: StateService) {}

	ngOnInit() {
		this.params$ = this.route.params.subscribe(params => {
			if (!params.id) return;
			this.voteId = parseInt(params.id, 10);
			this.fetchVote(params.id);
		});
		this.buildForm();
	}

	ngOnDestroy() {
		this.params$.unsubscribe();
	}

	onSubmit() {
		this.submitting = true;
		const person_id = get(this.state.user.getValue(), 'id');
		const vote_id = get(this.vote, 'id');
		const vote_option_id = get(this.voteForm.value, 'option');
		const data = { person_id, vote_id, vote_option_id };
		putVoteIdCast(vote_id, data).then((res: api.Response<any>) => {
			this.submitting = false;
			if (res.data) this.fetchVote(this.voteId);
		});
	}

	getVoteCount(voteId: number) {
		// @ts-ignore
		return this.vote.entries.filter(vote => vote.vote_option_id === voteId)
			.length;
	}

	private fetchVote(id: number) {
		getVoteId(id).then((res: api.Response<any>) => {
			this.vote = res.data;
			// Check if current user has already voted
			// @ts-ignore
			this.userVoteEntry = this.vote.entries.find(
				entry => entry.person_id === get(this.state.user.getValue(), 'id')
			);
			this.buildForm();
		});
	}

	private buildForm() {
		const optionId = get(this.userVoteEntry, 'vote_option_id', null);
		this.voteForm = new FormGroup({
			option: new FormControl(
				{ value: optionId, disabled: !!optionId },
				Validators.required
			),
		});
	}
}
