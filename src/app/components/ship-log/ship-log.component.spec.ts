import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipLogComponent } from './ship-log.component';

describe('ShipLogComponent', () => {
	let component: ShipLogComponent;
	let fixture: ComponentFixture<ShipLogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ShipLogComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ShipLogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
