import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StateService } from '@app/services/state.service';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
	user$: Subscription;
	loginForm: FormGroup;
	submitting = false;

	constructor(private state: StateService, private router: Router) { }

	ngOnInit() {
		if (this.state.user.getValue()) this.router.navigate(['news']);
		this.user$ = this.state.user.pipe(first(Boolean))
			.subscribe(() => this.router.navigate(['news']));
		this.buildForm();
	}

	ngOnDestroy() {
		this.user$.unsubscribe();
	}

	onSubmit() {
		this.submitting = true;
		this.state.login(this.loginForm.value.personId)
			.then(user => {
				this.submitting = false;
				if (!user) throw new Error('User not found');
			})
			.catch(err => {
				console.error(err);
				this.submitting = false;
			});
	}

	private buildForm() {
		this.loginForm = new FormGroup({
			personId: new FormControl('', Validators.required)
		});
	}
}
