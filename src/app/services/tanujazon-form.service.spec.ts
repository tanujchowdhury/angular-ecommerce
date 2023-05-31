import { TestBed } from '@angular/core/testing';

import { TanujazonFormService } from './tanujazon-form.service';

describe('TanujazonFormService', () => {
    let service: TanujazonFormService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TanujazonFormService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
