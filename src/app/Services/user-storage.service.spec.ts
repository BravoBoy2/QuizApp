import { TestBed } from '@angular/core/testing';
import { UserStorageService } from './user-storage.service';

// Test suite for UserStorageService
describe('UserStorageService', () => {
  let service: UserStorageService;

  // Set up the testing module and inject the service
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserStorageService);
  });

  // Test case to check if the service is created successfully
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
