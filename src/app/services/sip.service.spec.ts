import { TestBed } from '@angular/core/testing';

import { SipService } from './sip.service';

describe('SipService', () => {
	beforeEach(() => TestBed.configureTestingModule({}));

	it('should be created', () => {
		const service: SipService = TestBed.get(SipService);
		expect(service).toBeTruthy();
	});
});
