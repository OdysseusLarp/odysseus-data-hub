import { Component, OnInit, Input } from '@angular/core';

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
	constructor() {}

	ngOnInit() {}
}
