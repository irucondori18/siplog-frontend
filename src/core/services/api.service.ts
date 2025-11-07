import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

interface HttpOptions {
  headers?: HttpHeaders;
  params?: HttpParams;
}
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly _http = inject(HttpClient);
  /**
   * Retrieves a single resource by its identifier
   * @param {string} endpoint - The API endpoint
   * @param {HttpParams} [params] - Optional query parameters
   * @returns {Observable<T>} An observable of the requested resource
   */
  public getById<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this._http.get<T>(endpoint, this._createOptions({ params })).pipe(catchError(this._handleError));
  }

  /**
   * Performs a GET request to retrieve multiple resources
   * @param {string} endpoint - The API endpoint
   * @param {HttpParams} [params] - Optional query parameters
   * @returns {Observable<T>} An observable of the requested resources
   */
  public get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this._http.get<T>(endpoint, this._createOptions({ params })).pipe(catchError(this._handleError));
  }

  /**
   * Performs a POST request to create a new resource
   * @param {string} endpoint - The API endpoint
   * @param {T} [body] - The payload to send in the request body
   * @param {HttpOptions} [options] - Request configuration options
   * @returns {Observable<T>} An observable of the created resource
   */
  public post<T>(endpoint: string, body?: T, options?: HttpOptions): Observable<T> {
    return this._http.post<T>(endpoint, body, this._createOptions(options)).pipe(catchError(this._handleError));
  }

  /**
   * Performs a PUT request to completely update a resource
   * @param {string} endpoint - The API endpoint
   * @param {T} [body] - The payload to send in the request body
   * @param {HttpOptions} [options] - Request configuration options
   * @returns {Observable<T>} An observable of the updated resource
   */
  public put<T>(endpoint: string, body?: T, options?: HttpOptions): Observable<T> {
    return this._http.put<T>(endpoint, body, this._createOptions(options)).pipe(catchError(this._handleError));
  }

  /**
   * Performs a PATCH request to partially update a resource
   * @param {string} endpoint - The API endpoint
   * @param {T} [body] - The payload to send in the request body
   * @param {HttpOptions} [options] - Request configuration options
   * @returns {Observable<T>} An observable of the updated resource
   */
  public patch<T>(endpoint: string, body?: T, options?: HttpOptions): Observable<T> {
    return this._http.patch<T>(endpoint, body, this._createOptions(options)).pipe(catchError(this._handleError));
  }

  /**
   * Performs a DELETE request to remove a resource
   * @param {string} endpoint - The API endpoint
   * @param {HttpOptions} [options] - Request configuration options
   * @returns {Observable<T>} An observable of the deletion response
   */
  public delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this._http.delete<T>(endpoint, this._createOptions(options)).pipe(catchError(this._handleError));
  }

  private _createOptions(options?: HttpOptions): HttpOptions {
    return {
      headers: options?.headers,
      params: options?.params
    };
  }

  private _handleError(error: unknown) {
    return throwError(() => error);
  }
}
