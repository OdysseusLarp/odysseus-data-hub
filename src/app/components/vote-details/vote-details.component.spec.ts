import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteDetailsComponent } from './vote-details.component';

describe('VoteDetailsComponent', () => {
  let component: VoteDetailsComponent;
  let fixture: ComponentFixture<VoteDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
