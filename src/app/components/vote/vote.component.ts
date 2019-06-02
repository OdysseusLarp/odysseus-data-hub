import { Component, OnInit, OnDestroy } from '@angular/core';
import * as VoteApi from '@api/Vote';
import { get } from 'lodash';
import { Subscription } from 'rxjs';
import { SocketService } from '@app/services/socket.service';

@Component({
	selector: 'app-vote',
	templateUrl: './vote.component.html',
	styleUrls: ['./vote.component.scss'],
})
export class VoteComponent implements OnInit, OnDestroy {
	votes: api.Vote[];
	voteAddedOrUpdated$: Subscription;

	constructor(private socket: SocketService) {}

	ngOnInit() {
		this.fetchVotes();
		this.voteAddedOrUpdated$ = this.socket.voteAddedOrUpdated$.subscribe(() => {
			this.fetchVotes();
		});
	}

	ngOnDestroy() {
		this.voteAddedOrUpdated$.unsubscribe();
	}

	fetchVotes() {
		VoteApi.getVote({ status: 'APPROVED' }).then((res: api.Response<any>) => {
			this.votes = get(res, 'data', []).sort(
				(a, b) => a.updated_at < b.updated_at
			);
		});
	}
}
