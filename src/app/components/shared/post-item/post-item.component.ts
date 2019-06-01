import { Component, OnInit, Input } from '@angular/core';
import { startCase, toLower } from 'lodash';
import moment from 'moment';

interface Post extends api.Post {
	author: api.Person;
}

@Component({
	selector: 'app-post-item',
	templateUrl: './post-item.component.html',
	styleUrls: ['./post-item.component.scss'],
})
export class PostItemComponent implements OnInit {
	@Input() post: Post;
	postAge: string;
	constructor() {}

	ngOnInit() {
		if (!this.post) return;
		this.postAge = moment
			.duration(moment(this.post.created_at).diff(moment()))
			.humanize();
	}

	getPostType() {
		if (this.post.type === 'CAPTAINS_LOG') return '';
		return `${startCase(toLower(this.post.type))}: `;
	}
}
