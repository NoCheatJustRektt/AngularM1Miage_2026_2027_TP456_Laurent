import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '../../../environments/environment';
import { HealthApi } from './health.api';

describe('HealthApi', () => {
  let healthApi: HealthApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    healthApi = TestBed.inject(HealthApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it("appelle GET /health sur l'adresse de l'API", async () => {
    const health = firstValueFrom(healthApi.getHealth());

    const request = httpTesting.expectOne(`${environment.apiUrl}/health`);
    expect(request.request.method).toBe('GET');
    request.flush({ status: 'ok', uptime: 12.5 });

    expect(await health).toEqual({ status: 'ok', uptime: 12.5 });
  });
});
