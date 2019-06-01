import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtifactCreateComponent } from './artifact-create.component';

describe('ArtifactCreateComponent', () => {
	let component: ArtifactCreateComponent;
	let fixture: ComponentFixture<ArtifactCreateComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ArtifactCreateComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ArtifactCreateComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
