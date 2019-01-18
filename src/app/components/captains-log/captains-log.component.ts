import { Component, OnInit } from '@angular/core';
import { PostType } from '@components/shared/post-form/post-form.component';
import * as PostApi from '@api/Post';
import { get } from 'lodash';
import { autobind } from 'core-decorators';

@Component({
	selector: 'app-captains-log',
	templateUrl: './captains-log.component.html',
	styleUrls: ['./captains-log.component.scss'],
})
export class CaptainsLogComponent implements OnInit {
	posts: api.Post[];
	postTypes: PostType[] = [
		{
			value: 'CAPTAINS_LOG',
			text: `Captain's log`,
		},
	];
	constructor() {}

	ngOnInit() {
		this.fetchPosts();
	}

	private fetchPosts() {
		PostApi.getPost().then((res: api.Response<any>) => {
			// TODO: Filter in API
			this.posts = get(res, 'data', []).filter(
				post => post.type === 'CAPTAINS_LOG'
			);
		});
	}

	@autobind
	onSubmit(values) {
		return PostApi.putPost(values).then(async res => {
			this.fetchPosts();
			return res;
		});
	}
}
