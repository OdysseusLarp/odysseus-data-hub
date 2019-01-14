import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtifactDetailsComponent } from './artifact-details.component';

describe('ArtifactDetailsComponent', () => {
	let component: ArtifactDetailsComponent;
	let fixture: ComponentFixture<ArtifactDetailsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ArtifactDetailsComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ArtifactDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
