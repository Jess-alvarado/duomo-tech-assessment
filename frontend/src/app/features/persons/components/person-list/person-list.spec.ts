import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { PersonList } from './person-list';
import { PersonStateService } from '../../services/person-state';
import { PersonService } from '../../services/person';
import { Person } from '../../model/person';
import { AppError } from '../../../../core/models/app-error';

describe('PersonList', () => {
  let component: PersonList;
  let fixture: ComponentFixture<PersonList>;

  const mockPerson: Person = {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@email.com',
    age: 25,
    region: { id: 'RM', name: 'Región Metropolitana' },
    commune: { id: 'stgo', name: 'Santiago', regionId: 'RM' }
  };

  let personStateMock: {
    load: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    persons: ReturnType<typeof signal<Person[]>>;
    loading: ReturnType<typeof signal<boolean>>;
  };

  let personServiceMock: {
    getPersonById: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    personStateMock = {
      load: vi.fn(),
      delete: vi.fn(),
      persons: signal<Person[]>([]),
      loading: signal<boolean>(false)
    };

    personServiceMock = {
      getPersonById: vi.fn().mockReturnValue(of(mockPerson))
    };

    await TestBed.configureTestingModule({
      imports: [PersonList],
      providers: [
        { provide: PersonStateService, useValue: personStateMock },
        { provide: PersonService, useValue: personServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar las personas al iniciar', () => {
    expect(component).toBeTruthy();
    expect(personStateMock.load).toHaveBeenCalled();
  });

  describe('onViewDetail', () => {
    it('debe pedir el detalle por id y abrir el modal con la persona', () => {
      component.onViewDetail(1);

      expect(personServiceMock.getPersonById).toHaveBeenCalledWith(1);
      expect(component.selectedPerson()).toEqual(mockPerson);
      expect(component.loadingDetail()).toBe(false);
    });

    it('no debe hacer nada si el id es undefined', () => {
      component.onViewDetail(undefined);

      expect(personServiceMock.getPersonById).not.toHaveBeenCalled();
    });

    it('debe mostrar errorMessage si falla la carga del detalle', () => {
      const appError: AppError = { message: 'No se pudo cargar la persona solicitada.', status: 404 };
      personServiceMock.getPersonById.mockReturnValue(throwError(() => appError));

      component.onViewDetail(99);

      expect(component.errorMessage).toBe('No se pudo cargar la persona solicitada.');
      expect(component.selectedPerson()).toBeNull();
      expect(component.loadingDetail()).toBe(false);
    });
  });

  describe('closeDetail', () => {
    it('debe limpiar selectedPerson para cerrar el modal', () => {
      component.onViewDetail(1);
      expect(component.selectedPerson()).toEqual(mockPerson);

      component.closeDetail();

      expect(component.selectedPerson()).toBeNull();
    });
  });
});
