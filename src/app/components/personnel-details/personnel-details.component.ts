import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getPersonId } from '@api/Person';
import { Observable } from 'rxjs';
import { StateService } from '@app/services/state.service';

@Component({
	selector: 'app-personnel-details',
	templateUrl: './personnel-details.component.html',
	styleUrls: ['./personnel-details.component.scss'],
})
export class PersonnelDetailsComponent implements OnInit {
	user$: Observable<api.Person>;
	person: api.Person;
	constructor(private state: StateService, private route: ActivatedRoute) {}

	ngOnInit() {
		this.user$ = this.state.user;
		this.route.params.subscribe(({ id }) =>
			getPersonId(id).then((res: api.Response<any>) => (this.person = res.data))
		);
	}
}
