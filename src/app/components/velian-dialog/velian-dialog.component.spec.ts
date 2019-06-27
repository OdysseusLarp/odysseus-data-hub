import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VelianDialogComponent } from './velian-dialog.component';

describe('VelianDialogComponent', () => {
	let component: VelianDialogComponent;
	let fixture: ComponentFixture<VelianDialogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VelianDialogComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VelianDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
