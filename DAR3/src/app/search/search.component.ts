// src/app/search/search.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: false
})
export class SearchComponent {
  // Propiedad que refleje los filtros que usas en la plantilla
  filters = {
    location: '',
    brand: '',
    fuelType: ''
  };

  constructor() { }

  searchGasStations() {
    console.log('Buscando gasolineras con:', this.filters);
    // Aquí podrías navegar a /results o llamar a un servicio
  }
}