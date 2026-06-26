import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Commune, Region } from '../model/catalog';
import { CreatePersonPayload, Person } from '../model/person';
import { PersonStateService } from './person-state';


describe('PersonStateService', () => {
  let service: PersonStateService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:8090/api/persons';

  const region: Region = { id: 'RM', name: 'Región Metropolitana' };
  const commune: Commune = { id: 'stgo', name: 'Santiago', regionId: 'RM' };

  const mockPerson: Person = {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    age: 25,
    region,
    commune
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(PersonStateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('load', () => {
    it('debe pedir la lista al backend y actualizar el signal persons', () => {
      service.load();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([mockPerson]);

      expect(service.persons()).toEqual([mockPerson]);
    });

    it('debe poner loading en true mientras carga y en false al terminar', () => {
      expect(service.loading()).toBe(false);

      service.load();
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne(apiUrl);
      req.flush([mockPerson]);

      expect(service.loading()).toBe(false);
    });

    it('debe volver loading a false aunque el backend falle', () => {
      service.load();
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne(apiUrl);
      req.flush('Error simulado', { status: 500, statusText: 'Internal Server Error' });

      expect(service.loading()).toBe(false);
    });
  });

  describe('create', () => {
    const payload: CreatePersonPayload = {
      firstName: 'Ana',
      lastName: 'Soto',
      email: 'ana.soto@email.com',
      age: 30,
      region,
      commune
    };

    it('debe agregar la persona creada al signal persons sin recargar todo', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const createdPerson: Person = { ...payload, id: 2 };

      service.create(payload, onSuccess, onError);

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(createdPerson);

      expect(service.persons()).toEqual([createdPerson]);
      expect(onSuccess).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it('debe llamar onError y no modificar el signal cuando el backend falla', () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      service.create(payload, onSuccess, onError);

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { message: 'La comuna no corresponde a la región seleccionada.' },
        { status: 400, statusText: 'Bad Request' }
      );

      expect(service.persons()).toEqual([]);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'La comuna no corresponde a la región seleccionada.' })
      );
    });
  });

  describe('delete', () => {
    it('debe quitar la persona del signal persons cuando se elimina exitosamente', () => {
      // Precondicion: cargamos una persona para luego eliminarla.
      service.load();
      httpMock.expectOne(apiUrl).flush([mockPerson]);
      expect(service.persons()).toEqual([mockPerson]);

      const onSuccess = vi.fn();
      const onError = vi.fn();

      service.delete(1, onSuccess, onError);

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(service.persons()).toEqual([]);
      expect(onSuccess).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it('debe llamar onError y no modificar el signal cuando el backend falla', () => {
      service.load();
      httpMock.expectOne(apiUrl).flush([mockPerson]);

      const onSuccess = vi.fn();
      const onError = vi.fn();

      service.delete(1, onSuccess, onError);

      const req = httpMock.expectOne(`${apiUrl}/1`);
      req.flush('No encontrado', { status: 404, statusText: 'Not Found' });

      expect(service.persons()).toEqual([mockPerson]);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });
  });
});
