import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GmConfigComponent } from './gm-config.component';

describe('GmConfigComponent', () => {
	let component: GmConfigComponent;
	let fixture: ComponentFixture<GmConfigComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [GmConfigComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(GmConfigComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
