import { Component, OnInit } from '@angular/core';
import * as VoteApi from '@api/Vote';

@Component({
	selector: 'app-vote',
	templateUrl: './vote.component.html',
	styleUrls: ['./vote.component.scss'],
})
export class VoteComponent implements OnInit {
	votes: api.Vote[];

	constructor() {}

	ngOnInit() {
		VoteApi.getVote().then((res: api.Response<any>) => {
			this.votes = res.data;
		});
	}
}
