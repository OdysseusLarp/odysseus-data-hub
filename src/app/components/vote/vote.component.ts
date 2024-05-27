import { Component, OnInit, OnDestroy } from '@angular/core';
import * as VoteApi from '@api/Vote';
import { get } from 'lodash';
import { Subscription } from 'rxjs';
import { SocketService } from '@app/services/socket.service';
import { StateService } from '@app/services/state.service';
import {
	highMilitaryRanks,
	formatFilter,
} from '../vote-create/vote-create.component';

interface ExtendedVote extends api.Vote {
	is_allowed_to_vote: boolean;
}

@Component({
	selector: 'app-vote',
	templateUrl: './vote.component.html',
	styleUrls: ['./vote.component.scss'],
})
export class VoteComponent implements OnInit, OnDestroy {
	votes: ExtendedVote[];
	voteAddedOrUpdated$: Subscription;

	constructor(
		private state: StateService,
		private socket: SocketService
	) {}

	ngOnInit() {
		this.fetchVotes();
		this.voteAddedOrUpdated$ = this.socket.voteAddedOrUpdated$.subscribe(() => {
			this.fetchVotes();
		});
	}

	ngOnDestroy() {
		this.voteAddedOrUpdated$.unsubscribe();
	}

	checkVotingRights(vote) {
		const user = this.state.user.getValue();

		const allowedVoters = vote.allowed_voters;
		const { religion, dynasty, military_rank, political_party } = user;
		const userReligion = formatFilter('religion', religion);
		const userDynasty = formatFilter('dynasty', dynasty);
		const userPoliticalParty = formatFilter('party', political_party);
		const userShip = formatFilter('ship', get(user, 'ship.id'));

		const highRankingOfficerMatch =
			allowedVoters === 'HIGH_RANKING_OFFICER' &&
			highMilitaryRanks.has(military_rank);

		const isUserAllowedToVote = [
			highRankingOfficerMatch,
			userShip === allowedVoters,
			userReligion === allowedVoters,
			userDynasty === allowedVoters,
			userPoliticalParty === allowedVoters,
			allowedVoters === null,
			allowedVoters === 'EVERYONE',
		].some(Boolean);

		return isUserAllowedToVote;
	}

	fetchVotes() {
		VoteApi.getVote({ status: 'APPROVED' }).then((res: api.Response<any>) => {
			this.votes = get(res, 'data', []).sort(
				(a, b) => a.updated_at < b.updated_at
			);
			this.votes.map(vote => { vote.is_allowed_to_vote = this.checkVotingRights(vote) });
		});
	}
}
