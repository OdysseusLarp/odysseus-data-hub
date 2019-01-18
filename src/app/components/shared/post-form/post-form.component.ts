import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StateService } from '@app/services/state.service';
import { Subscription } from 'rxjs';
import { get, isFunction } from 'lodash';

export interface PostType {
	value: 'NEWS' | 'OPINION' | 'CAPTAINS_LOG';
	text: string;
}

@Component({
	selector: 'app-post-form',
	templateUrl: './post-form.component.html',
	styleUrls: ['./post-form.component.scss'],
})
export class PostFormComponent implements OnInit, OnDestroy {
	@Input() title = 'Add post';
	@Input() onSubmit: Function;
	@Input() postTypes: PostType[] = [];
	postForm: FormGroup;
	currentUser: api.Person;
	user$: Subscription;

	constructor(private state: StateService) {}

	onFormSubmit() {
		if (!this.postForm.valid || !isFunction(this.onSubmit)) return;
		const formData = {
			...this.postForm.value,
			is_visible: true,
			person_id: this.currentUser.id,
		};
		const submitted = this.onSubmit(formData);
		if (!isFunction(get(submitted, 'then'))) return;
		submitted.then(() => this.clearForm);
	}

	ngOnInit() {
		this.user$ = this.state.user.subscribe(user => (this.currentUser = user));
		this.buildForm();
	}

	ngOnDestroy() {
		this.user$.unsubscribe();
	}

	setPostType(type) {
		this.postForm.patchValue({ type });
	}

	private getInitialTypeValue() {
		return get(this.postTypes, '[0].value', '');
	}

	private clearForm() {
		this.postForm.patchValue({
			type: this.getInitialTypeValue(),
			title: '',
			body: '',
		});
	}

	private buildForm() {
		this.postForm = new FormGroup({
			title: new FormControl('', Validators.required),
			type: new FormControl(this.getInitialTypeValue(), Validators.required),
			body: new FormControl('', Validators.required),
		});
	}
}
