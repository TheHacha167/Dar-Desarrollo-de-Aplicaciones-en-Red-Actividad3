import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GasStationService {

  private API_URL_JSON = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de estaciones de servicio (gasolineras) desde la API oficial.
   * Retorna un observable con un array de objetos (cada objeto es la info de una estación).
   */
  getGasStations(): Observable<any[]> {
    return this.http.get<any>(this.API_URL_JSON).pipe(
      // La API devuelve un objeto con la propiedad "ListaEESSPrecio",
      // que es el array real de gasolineras
      map(response => response.ListaEESSPrecio)
    );
  }

}