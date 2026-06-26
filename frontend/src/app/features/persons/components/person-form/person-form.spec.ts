import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';

import { PersonForm } from './person-form';
import { CatalogService } from '../../services/catalog';
import { PersonStateService } from '../../services/person-state';
import { Region, Commune } from '../../model/catalog';
import { AppError } from '../../../../core/models/app-error';

describe('PersonForm', () => {
  let component: PersonForm;
  let fixture: ComponentFixture<PersonForm>;

  const regionRM: Region = { id: 'RM', name: 'Región Metropolitana' };
  const regionV: Region = { id: 'V', name: 'Región de Valparaíso' };
  const comunaSantiago: Commune = { id: 'stgo', name: 'Santiago', regionId: 'RM' };
  const comunaValpo: Commune = { id: 'valpo', name: 'Valparaíso', regionId: 'V' };

  let catalogServiceMock: {
    getRegions: ReturnType<typeof vi.fn>;
    getCommunesByRegion: ReturnType<typeof vi.fn>;
  };

  let personStateMock: {
    create: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    catalogServiceMock = {
      getRegions: vi.fn().mockReturnValue(of([regionRM, regionV])),
      getCommunesByRegion: vi.fn().mockReturnValue(of([comunaSantiago]))
    };

    personStateMock = {
      create: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PersonForm],
      providers: [
        { provide: CatalogService, useValue: catalogServiceMock },
        { provide: PersonStateService, useValue: personStateMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar las regiones al iniciar', () => {
    expect(component).toBeTruthy();
    expect(catalogServiceMock.getRegions).toHaveBeenCalled();
    expect(component.regions).toEqual([regionRM, regionV]);
  });

  describe('validaciones del formulario', () => {
    it('el formulario es inválido si falta cualquier campo obligatorio', () => {
      expect(component.personForm.invalid).toBe(true);

      component.personForm.patchValue({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        age: 25,
        regionId: 'RM',
        communeId: 'stgo'
      });

      expect(component.personForm.valid).toBe(true);
    });

    it('el campo email es inválido con un formato incorrecto', () => {
      const emailControl = component.personForm.get('email')!;

      emailControl.setValue('no-es-un-email');
      expect(emailControl.hasError('email')).toBe(true);

      emailControl.setValue('valido@email.com');
      expect(emailControl.hasError('email')).toBe(false);
    });

    it('el campo age es inválido si es menor a 18', () => {
      const ageControl = component.personForm.get('age')!;

      ageControl.setValue(17);
      expect(ageControl.hasError('minAge')).toBe(true);

      ageControl.setValue(18);
      expect(ageControl.hasError('minAge')).toBe(false);
    });
  });

  describe('onRegionChange', () => {
    it('debe pedir las comunas de la región elegida y limpiar communeId', () => {
      component.personForm.patchValue({ communeId: 'stgo' });

      const fakeEvent = { target: { value: 'RM' } } as unknown as Event;
      component.onRegionChange(fakeEvent);

      expect(catalogServiceMock.getCommunesByRegion).toHaveBeenCalledWith('RM');
      expect(component.communes).toEqual([comunaSantiago]);
      expect(component.personForm.get('communeId')?.value).toBe('');
    });

    it('no debe pedir comunas si se deselecciona la región (valor vacío)', () => {
      const fakeEvent = { target: { value: '' } } as unknown as Event;
      component.onRegionChange(fakeEvent);

      expect(catalogServiceMock.getCommunesByRegion).not.toHaveBeenCalled();
      expect(component.communes).toEqual([]);
    });
  });

  describe('onSubmit', () => {
    function fillValidForm(): void {
      component.personForm.patchValue({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        age: 25,
        regionId: 'RM',
        communeId: 'stgo'
      });
      component.communes = [comunaSantiago];
    }

    it('no debe llamar a create si el formulario es inválido, y marca todo como touched', () => {
      component.onSubmit();

      expect(personStateMock.create).not.toHaveBeenCalled();
      expect(component.personForm.get('firstName')?.touched).toBe(true);
    });

    it('debe llamar a personState.create con el payload correcto cuando todo es válido', () => {
      fillValidForm();

      component.onSubmit();

      expect(personStateMock.create).toHaveBeenCalledWith(
        {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@email.com',
          age: 25,
          region: regionRM,
          commune: comunaSantiago
        },
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('debe mostrar errorMessage y NO llamar a create si la comuna no corresponde a la región', () => {
      fillValidForm();

      component.personForm.patchValue({ regionId: 'V' });

      component.onSubmit();

      expect(personStateMock.create).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('La comuna no corresponde a la región seleccionada.');
    });

    it('al crear exitosamente, muestra successMessage y resetea el formulario', () => {
      fillValidForm();

      personStateMock.create.mockImplementation((_payload, onSuccess, _onError) => {
        onSuccess();
      });

      component.onSubmit();

      expect(component.successMessage).toBe('Persona registrada.');
      expect(component.submitting).toBe(false);
      expect(component.personForm.get('firstName')?.value).toBe('');
      expect(component.communes).toEqual([]);
    });

    it('si create falla, muestra errorMessage con el mensaje del AppError', () => {
      fillValidForm();

      const appError: AppError = { message: 'No se pudo registrar la persona.', status: 500 };
      personStateMock.create.mockImplementation((_payload, _onSuccess, onError) => {
        onError(appError);
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('No se pudo registrar la persona.');
      expect(component.submitting).toBe(false);
    });
  });

  it('si falla la carga de regiones, muestra errorMessage', async () => {
    catalogServiceMock.getRegions.mockReturnValue(
      throwError(() => ({ message: 'No se pudo cargar el listado de regiones.', status: 500 } as AppError))
    );

    const localFixture = TestBed.createComponent(PersonForm);
    localFixture.detectChanges();

    expect(localFixture.componentInstance.errorMessage).toBe('No se pudo cargar el listado de regiones.');
  });
});
