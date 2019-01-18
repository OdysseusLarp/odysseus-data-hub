import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StateService } from '@app/services/state.service';
import * as VoteApi from '@api/Vote';

@Component({
	selector: 'app-vote-create',
	templateUrl: './vote-create.component.html',
	styleUrls: ['./vote-create.component.scss'],
})
export class VoteCreateComponent implements OnInit {
	voteForm: FormGroup;
	user$: Subscription;
	currentUser: api.Person;
	submitting = false;

	constructor(private router: Router, private state: StateService) {}

	ngOnInit() {
		this.buildForm();
		this.user$ = this.state.user.subscribe(user => (this.currentUser = user));
	}

	async onFormSubmit() {
		if (this.submitting) return;
		this.submitting = true;
		const res = await VoteApi.putVoteCreate({
			...this.voteForm.value,
			person_id: this.currentUser.id,
		});
		this.submitting = false;
		if (res.raw.status === 204) this.router.navigate(['../vote']);
	}

	getInitialActiveTime() {
		return '30';
	}

	addOption() {
		const options = this.voteForm.get('options') as FormArray;
		options.push(this.getNewOption());
	}

	removeOption(index) {
		const options = this.voteForm.get('options') as FormArray;
		options.removeAt(index);
	}

	private getNewOption() {
		return new FormControl('', Validators.required);
	}

	private buildForm() {
		this.voteForm = new FormGroup({
			title: new FormControl('', Validators.required),
			activeTime: new FormControl(
				this.getInitialActiveTime(),
				Validators.required
			),
			description: new FormControl('', Validators.required),
			options: new FormArray([this.getNewOption()]),
		});
	}
}
