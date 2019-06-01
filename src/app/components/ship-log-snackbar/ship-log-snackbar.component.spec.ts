import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipLogSnackbarComponent } from './ship-log-snackbar.component';

describe('ShipLogSnackbarComponent', () => {
	let component: ShipLogSnackbarComponent;
	let fixture: ComponentFixture<ShipLogSnackbarComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ShipLogSnackbarComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ShipLogSnackbarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
