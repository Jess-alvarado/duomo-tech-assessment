import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Region, Commune } from '../model/catalog';
import { AppError } from '../../../core/models/app-error';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private readonly apiUrl = 'http://localhost:8090/api';

  constructor(private http: HttpClient) {}

  getRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(`${this.apiUrl}/catalogs/regions`).pipe(
      catchError(this.handleError('No se pudo cargar el listado de regiones.'))
    );
  }

  getCommunesByRegion(regionId: string): Observable<Commune[]> {
    return this.http.get<Commune[]>(`${this.apiUrl}/catalogs/regions/${regionId}/communes`).pipe(
      catchError(this.handleError('No se pudo cargar el listado de comunas.'))
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
