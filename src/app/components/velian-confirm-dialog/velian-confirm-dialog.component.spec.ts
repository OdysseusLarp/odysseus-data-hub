import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VelianConfirmDialogComponent } from './velian-confirm-dialog.component';

describe('VelianConfirmDialogComponent', () => {
	let component: VelianConfirmDialogComponent;
	let fixture: ComponentFixture<VelianConfirmDialogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [VelianConfirmDialogComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(VelianConfirmDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
