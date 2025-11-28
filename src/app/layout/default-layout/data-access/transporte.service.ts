import { computed, inject, Injectable, linkedSignal, signal } from '@angular/core';
//import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ApiService } from '../../../../data-access/api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { APIConstant } from '../../../../core/constant/ApiConstants';
import { Transporte } from './transporte.model';


export interface ResponseValidationError {
  data : [], 
  message : string, 
  success : boolean
}

@Injectable({
  providedIn: 'root'
})
export class TransporteService {

  protected readonly API_ENDPOINT = `${environment.API_URL}/${APIConstant.API_TRANSPORTES}`;

  private readonly _apiService = inject(ApiService);
  readonly #httpClient = inject(HttpClient)

  // personaSignal = signal<Persona>(this.defaultPersona);
  // persona = linkedSignal(() => this.personaSignal());
  // readonly #personasSignal = signal<Persona[]>([]);
  // personas = computed(() => this.#personasSignal());

  // load(): Observable<ApiPersonasResponse> {
  //   return this.#httpClient
  //   .get<ApiPersonasResponse>(this.API_ENDPOINT)
  //   .pipe(
  //     tap( result => 
  //      { console.log("personas ", result.data);
  //        this.#personasSignal.set(result.data)}
  //      )
  //     ,catchError((error) => {
  //          console.error('Error al obtener listado de personas ', error);
  //          return throwError(() => error);
  //     })
  //   )
  // }

  getTransportes(): Observable<Transporte[]> {
    return this.#httpClient.get<Transporte[]>(`${this.API_ENDPOINT}`);
  }

  // getPersonaById(id: number): Observable<Response> {
  //   return this._apiService.getById<Response>(`${this.API_ENDPOINT}/${id}`);
  // }
  createTransporte(data: FormData) {
    return this.#httpClient.post<{ message: string, data: Transporte }>(
      this.API_ENDPOINT,
      data
    );
  }

  /**
   * Creando nueva Persona
   * @param persona Persona data
   * @returns Observable con Persona creada
   */
//   createPersona(persona: Persona): Observable<Persona> {
   

//     return this._apiService.post<Persona>(this.API_ENDPOINT, persona).pipe(
//       tap((response) => console.log('Persona creada : ', response)),
//       catchError((error) => {
//         console.error('Error create persona : ', error);
//         return throwError(() => error);
//       })
//     );
//   }

//   updatePersona(id: number | null, persona: Persona): Observable<Persona> {
//     return this._apiService.put<Persona>(`${this.API_ENDPOINT}/${id}`, persona);
//   }

//   deletePersona(id: number | null ): Observable<void> {
//     return this._apiService.delete<void>(`${this.API_ENDPOINT}/${id}`);
//   }

//   remove(id : number): Observable<void> {
//     return this._apiService.delete<void>(`${this.API_ENDPOINT}/${id}`);
//   }
//   override getPersonaById(id: number): Observable<Persona> {
//     throw new Error('Method not implemented.');
//   }
}
