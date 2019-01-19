import { Component, OnInit } from '@angular/core';
import * as VoteApi from '@api/Vote';
import { get } from 'lodash';

@Component({
	selector: 'app-vote',
	templateUrl: './vote.component.html',
	styleUrls: ['./vote.component.scss'],
})
export class VoteComponent implements OnInit {
	votes: api.Vote[];

	constructor() {}

	ngOnInit() {
		VoteApi.getVote({ status: 'APPROVED' }).then((res: api.Response<any>) => {
			this.votes = get(res, 'data', []).sort(
				(a, b) => a.updated_at < b.updated_at
			);
		});
	}
}
