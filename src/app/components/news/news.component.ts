import { Component, OnInit } from '@angular/core';
import { PostType } from '@components/shared/post-form/post-form.component';
import * as PostApi from '@api/Post';
import { get } from 'lodash';
import { autobind } from 'core-decorators';

@Component({
	selector: 'app-news',
	templateUrl: './news.component.html',
	styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
	posts: api.Post;
	postTypes: PostType[] = [
		{
			value: 'NEWS',
			text: 'News',
		},
		{
			value: 'OPINION',
			text: 'Opinion',
		},
	];

	constructor() {}

	ngOnInit() {
		this.fetchPosts();
	}

	private fetchPosts() {
		PostApi.getPost({ status: 'APPROVED' }).then((res: api.Response<any>) => {
			this.posts = get(res, 'data', [])
				.filter(post => post.type !== 'CAPTAINS_LOG')
				.sort((a, b) => a.updated_at < b.updated_at);
		});
	}

	@autobind
	onSubmit(post) {
		return PostApi.putPost(post).then(async res => {
			this.fetchPosts();
			return res;
		});
	}
}
