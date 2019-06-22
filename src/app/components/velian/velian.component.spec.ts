import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VelianComponent } from './velian.component';

describe('VelianComponent', () => {
	let component: VelianComponent;
	let fixture: ComponentFixture<VelianComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VelianComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VelianComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
