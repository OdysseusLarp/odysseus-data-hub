import { Component, OnInit } from '@angular/core';
import { StateService } from '@app/services/state.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
	user$: Observable<api.Person>;

	constructor(private state: StateService, private router: Router) {}

	ngOnInit() {
		this.user$ = this.state.user;
	}

	onLogout() {
		this.state.logout();
		this.router.navigate(['/']);
	}
}
