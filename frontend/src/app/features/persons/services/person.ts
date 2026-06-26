import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Person, CreatePersonPayload } from '../model/person';
import { AppError } from '../../../core/models/app-error';


@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private readonly apiUrl = 'http://localhost:8090/api/persons';

  constructor(private http: HttpClient) {}

  getPersons(): Observable<Person[]> {
    return this.http.get<Person[]>(this.apiUrl).pipe(
      catchError(this.handleError('No se pudo cargar la lista de personas.'))
    );
  }

  getPersonById(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError('No se pudo cargar la persona solicitada.'))
    );
  }

  createPerson(person: CreatePersonPayload): Observable<Person> {
    return this.http.post<Person>(this.apiUrl, person).pipe(
      catchError(this.handleError('No se pudo registrar la persona.'))
    );
  }

  deletePerson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError('No se pudo eliminar la persona.'))
    );
  }

  private handleError(fallbackMessage: string) {
    return (error: HttpErrorResponse) => {
      const backendMessage =
        typeof error.error === 'string'
          ? error.error
          : error.error?.message;

      const appError: AppError = {
        message: backendMessage || fallbackMessage,
        status: error.status
      };

      return throwError(() => appError);
    };
  }
}
