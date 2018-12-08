import { Component, OnInit } from '@angular/core';
import * as PostApi from '@api/Post';

@Component({
	selector: 'app-news',
	templateUrl: './news.component.html',
	styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
	posts: api.Post;

	constructor() {}

	ngOnInit() {
		PostApi.getPost().then((res: api.Response<any>) => {
			this.posts = res.data;
		});
	}
}
