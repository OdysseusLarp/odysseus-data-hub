import { Component, OnInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { StateService } from '@app/services/state.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	user$: Subscription;
	user: api.Person;
	showHackingView$: Observable<boolean>;

	constructor(private state: StateService) {}

	ngOnInit() {
		this.user$ = this.state.user.subscribe(user => (this.user = user));
		this.showHackingView$ = this.state.showHackingView;
	}

	toggleHacking() {
		this.state.showHackingView.next(!this.state.showHackingView.getValue());
	}
}
