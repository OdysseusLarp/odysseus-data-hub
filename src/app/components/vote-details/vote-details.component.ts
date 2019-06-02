import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { getVoteId, putVoteIdCast } from '@api/Vote';
import pluralize from 'pluralize';
import { StateService } from '@app/services/state.service';
import { get } from 'lodash';
import { SocketService } from '@app/services/socket.service';

interface Vote extends api.Vote {
	entries: api.VoteEntry[];
}

@Component({
	selector: 'app-vote-details',
	templateUrl: './vote-details.component.html',
	styleUrls: ['./vote-details.component.scss'],
})
export class VoteDetailsComponent implements OnInit, OnDestroy {
	vote: Vote;
	voteId: number;
	params$: Subscription;
	voteForm: FormGroup;
	pluralize = pluralize;
	userVoteEntry: any;
	submitting = false;
	voteAddedOrUpdated$: Subscription;

	constructor(
		private route: ActivatedRoute,
		private state: StateService,
		private socket: SocketService
	) {}

	ngOnInit() {
		this.params$ = this.route.params.subscribe(params => {
			if (!params.id) return;
			this.voteId = parseInt(params.id, 10);
			this.fetchVote(params.id);
		});
		this.buildForm();
		// Refetch on model update
		this.voteAddedOrUpdated$ = this.socket.voteAddedOrUpdated$.subscribe(
			vote => {
				if (get(vote, 'id') === this.voteId) this.fetchVote(this.voteId);
			}
		);
	}

	ngOnDestroy() {
		this.params$.unsubscribe();
	}

	onSubmit() {
		if (!get(this.vote, 'is_active')) return;
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
		return this.vote.entries.filter(vote => vote.vote_option_id === voteId)
			.length;
	}

	private fetchVote(id: number) {
		getVoteId(id).then((res: api.Response<any>) => this.updateVote(res.data));
	}

	private updateVote(vote: Vote) {
		this.vote = vote;
		// Check if current user has already voted
		this.userVoteEntry = this.vote.entries.find(
			entry => entry.person_id === get(this.state.user.getValue(), 'id')
		);
		this.buildForm();
	}

	private buildForm() {
		const optionId = get(this.userVoteEntry, 'vote_option_id', null);
		this.voteForm = new FormGroup({
			option: new FormControl(
				{
					value: optionId,
					disabled: !!optionId || !get(this.vote, 'is_active'),
				},
				Validators.required
			),
		});
	}
}
