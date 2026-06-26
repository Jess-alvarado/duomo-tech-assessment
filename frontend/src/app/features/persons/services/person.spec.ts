import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { PersonService } from './person';
import { Person, CreatePersonPayload } from '../model/person';
import { Region, Commune } from '../model/catalog';

describe('PersonService', () => {
  let service: PersonService;
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

    service = TestBed.inject(PersonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPersons', () => {
    it('debe hacer GET a la URL correcta y devolver la lista', () => {
      service.getPersons().subscribe((persons) => {
        expect(persons).toEqual([mockPerson]);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([mockPerson]);
    });
  });

  describe('getPersonById', () => {
    it('debe hacer GET a /persons/{id}', () => {
      service.getPersonById(1).subscribe((person) => {
        expect(person).toEqual(mockPerson);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPerson);
    });
  });

  describe('createPerson', () => {
    it('debe hacer POST con el payload correcto', () => {
      const payload: CreatePersonPayload = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        age: 25,
        region,
        commune
      };

      service.createPerson(payload).subscribe((created) => {
        expect(created).toEqual(mockPerson);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockPerson);
    });

    it('debe propagar un AppError legible cuando el backend rechaza la creación', () => {
      const payload: CreatePersonPayload = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        age: 25,
        region,
        commune
      };

      let receivedError: any;

      service.createPerson(payload).subscribe({
        next: () => {},
        error: (err) => (receivedError = err)
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { message: 'La comuna no corresponde a la región seleccionada.' },
        { status: 400, statusText: 'Bad Request' }
      );

      expect(receivedError.message).toBe('La comuna no corresponde a la región seleccionada.');
      expect(receivedError.status).toBe(400);
    });
  });

  describe('deletePerson', () => {
    it('debe hacer DELETE a /persons/{id}', () => {
      service.deletePerson(1).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
