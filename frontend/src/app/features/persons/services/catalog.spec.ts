import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { CatalogService } from './catalog';
import { Commune, Region } from '../model/catalog';

describe('CatalogService', () => {
  let service: CatalogService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:8090/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(CatalogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRegions', () => {
    it('debe pedir las regiones al endpoint correcto', () => {
      const mockRegions: Region[] = [{ id: 'RM', name: 'Región Metropolitana' }];

      service.getRegions().subscribe((regions) => {
        expect(regions).toEqual(mockRegions);
      });

      const req = httpMock.expectOne(`${apiUrl}/catalogs/regions`);
      expect(req.request.method).toBe('GET');
      req.flush(mockRegions);
    });

    it('debe propagar un AppError legible cuando el backend falla', () => {
      let receivedError: any;

      service.getRegions().subscribe({
        next: () => {},
        error: (err) => (receivedError = err)
      });

      const req = httpMock.expectOne(`${apiUrl}/catalogs/regions`);
      // Simulamos un error de red/servidor sin cuerpo usable (progress event),
      // que es el caso real donde debe aplicarse el fallbackMessage.
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Internal Server Error' });

      expect(receivedError.message).toBe('No se pudo cargar el listado de regiones.');
      expect(receivedError.status).toBe(500);
    });
  });

  describe('getCommunesByRegion', () => {
    it('debe pedir las comunas de la región indicada', () => {
      const mockCommunes: Commune[] = [{ id: 'stgo', name: 'Santiago', regionId: 'RM' }];

      service.getCommunesByRegion('RM').subscribe((communes) => {
        expect(communes).toEqual(mockCommunes);
      });

      const req = httpMock.expectOne(`${apiUrl}/catalogs/regions/RM/communes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCommunes);
    });
  });
});
