import { describe, it, expect } from 'vitest';
import { FormControl } from '@angular/forms';
import { minAgeValidator } from './min-age';


describe('minAgeValidator', () => {

  const validator = minAgeValidator(18);

  it('debe aceptar una edad igual al mínimo', () => {
    const result = validator(new FormControl(18));

    expect(result).toBeNull();
  });

  it('debe aceptar una edad mayor al mínimo', () => {
    const result = validator(new FormControl(25));

    expect(result).toBeNull();
  });

  it('debe rechazar una edad menor al mínimo', () => {
    const result = validator(new FormControl(17));

    expect(result).toEqual({
      minAge: {
        requiredAge: 18,
        actual: 17
      }
    });
  });

  it('debe devolver null cuando el valor es null', () => {
    const result = validator(new FormControl(null));

    expect(result).toBeNull();
  });

  it('debe devolver null cuando el valor es undefined', () => {
    const result = validator(new FormControl(undefined));

    expect(result).toBeNull();
  });

  it('debe devolver null cuando el valor es una cadena vacía', () => {
    const result = validator(new FormControl(''));

    expect(result).toBeNull();
  });

  it('debe indicar notANumber cuando el valor no es numérico', () => {
    const result = validator(new FormControl('hola'));

    expect(result).toEqual({
      notANumber: true
    });
  });
});
