import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptainsLogComponent } from './captains-log.component';

describe('CaptainsLogComponent', () => {
	let component: CaptainsLogComponent;
	let fixture: ComponentFixture<CaptainsLogComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CaptainsLogComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CaptainsLogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
