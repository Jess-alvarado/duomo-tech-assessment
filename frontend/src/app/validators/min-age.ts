import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';


export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === '' || value === undefined) {
      return null;
    }

    const numericValue = Number(value);

    if (isNaN(numericValue)) {
      return { notANumber: true };
    }

    return numericValue >= minAge ? null : { minAge: { requiredAge: minAge, actual: numericValue } };
  };
}
