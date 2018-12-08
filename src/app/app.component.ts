import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateService } from '@app/services/state.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	user$: Subscription;
	user: api.Person;

	constructor(private state: StateService) {}

	ngOnInit() {
		this.user$ = this.state.user.subscribe(user => (this.user = user));
	}
}
