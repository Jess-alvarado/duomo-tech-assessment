import { Injectable, signal } from '@angular/core';
import { PersonService } from './person';
import { Person, CreatePersonPayload } from '../model/person';
import { AppError } from '../../../core/models/app-error';

@Injectable({
  providedIn: 'root'
})
export class PersonStateService {

  private readonly personsSignal = signal<Person[]>([]);
  private readonly loadingSignal = signal<boolean>(false);

  readonly persons = this.personsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  constructor(private personService: PersonService) {}

  load(): void {
    this.loadingSignal.set(true);
    this.personService.getPersons().subscribe({
      next: (data) => {
        this.personsSignal.set(data);
        this.loadingSignal.set(false);
      },
      error: () => {
        this.loadingSignal.set(false);
      }
    });
  }

  create(payload: CreatePersonPayload, onSuccess: () => void, onError: (err: AppError) => void): void {
    this.personService.createPerson(payload).subscribe({
      next: (created) => {
        this.personsSignal.update((current) => [...current, created]);
        onSuccess();
      },
      error: (err: AppError) => onError(err)
    });
  }

  delete(id: number, onSuccess: () => void, onError: (err: AppError) => void): void {
    this.personService.deletePerson(id).subscribe({
      next: () => {
        this.personsSignal.update((current) => current.filter((p) => p.id !== id));
        onSuccess();
      },
      error: (err: AppError) => onError(err)
    });
  }
}
