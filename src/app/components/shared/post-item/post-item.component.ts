import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'app-post-item',
	templateUrl: './post-item.component.html',
	styleUrls: ['./post-item.component.scss'],
})
export class PostItemComponent implements OnInit {
	@Input() post: api.Post;
	constructor() {}

	ngOnInit() {}
}
