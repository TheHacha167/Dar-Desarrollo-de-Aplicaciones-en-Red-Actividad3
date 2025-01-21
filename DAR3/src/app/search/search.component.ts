import { Component, OnInit } from '@angular/core';
import { GasStationService } from '../services/gas-station.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: false 
})
export class SearchComponent implements OnInit {

  // Datos crudos (todas las gasolineras)
  allGasStations: any[] = [];
  // Datos filtrados (los que muestra la interfaz)
  filteredGasStations: any[] = [];

  // Catálogos únicos
  empresas: string[] = [];
  carburantes: string[] = [];
  provincias: string[] = [];
  municipios: string[] = [];
  localidades: string[] = [];

  // Modelo de filtros
  filters = {
    empresa: '',
    carburante: '',
    provincia: '',
    municipio: '',
    localidad: ''
  };

  // Controla si ya hemos descargado la info
  dataLoaded = false;
  // Controla si estamos cargando datos (para mostrar spinner)
  isLoading = false;

  // Coordenadas del usuario
  userLat: number | null = null;
  userLng: number | null = null;

  constructor(private gasStationService: GasStationService) { }

  ngOnInit(): void {
    // Al iniciar el componente, cargamos las gasolineras automáticamente
    this.loadAllGasStations();
  }

  /**
   * Descarga la lista de gasolineras y construye catálogos
   */
  loadAllGasStations(): void {
    this.isLoading = true; // Encendemos el spinner
    this.gasStationService.getGasStations().subscribe({
      next: (data: any[]) => {
        // Guardamos la lista completa
        this.allGasStations = data;
        this.filteredGasStations = data; // Sin filtros inicialmente

        // Generar catálogos
        this.empresas = this.getUniqueValues(data, 'Rótulo');
        this.provincias = this.getUniqueValues(data, 'Provincia');
        this.municipios = this.getUniqueValues(data, 'Municipio');
        this.localidades = this.getUniqueValues(data, 'Localidad');
        this.carburantes = this.extractCarburantes(data[0]);

        this.dataLoaded = true;
        this.isLoading = false; // Apagamos el spinner
      },
      error: (err) => {
        console.error('Error al obtener estaciones de servicio: ', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Pide al navegador la ubicación del usuario
   */
  getUserLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLat = position.coords.latitude;
          this.userLng = position.coords.longitude;
          console.log('Ubicación del usuario:', this.userLat, this.userLng);

          // Una vez tengamos la ubicación, podemos calcular las distancias
          this.calculateDistances();
        },
        (error) => {
          console.error('Error al obtener geolocalización:', error);
          alert('No se pudo obtener la ubicación. Por favor, verifica los permisos de tu navegador.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocalización no soportada por este navegador.');
    }
  }

  /**
   * Calcula la distancia de cada gasolinera a la posición del usuario,
   * guardándola en station.distanceToUser. Luego ordena la lista por distancia.
   */
  calculateDistances(): void {
    if (this.userLat == null || this.userLng == null) return;

    this.allGasStations.forEach(st => {
      const stationLat = parseFloat(st['Latitud'].replace(',', '.'));
      const stationLng = parseFloat(st['Longitud (WGS84)'].replace(',', '.'));

      const dist = this.gasStationService.calculateDistance(
        this.userLat!, this.userLng!, stationLat, stationLng
      );
      st.distanceToUser = dist;
    });

    // Ordenar gasolineras por distancia
    this.allGasStations.sort((a, b) => a.distanceToUser - b.distanceToUser);
    // Actualizar la lista filtrada
    this.filteredGasStations = [...this.allGasStations];

      // Filtrar las gasolineras a menos de 10 km
      this.filterByRadius(10);


  }

  /**
   * Filtra las gasolineras que estén dentro de un radio X (km) respecto al usuario
   */
  filterByRadius(km: number): void {
    if (this.userLat == null || this.userLng == null) {
      alert('Primero obtén tu ubicación.');
      return;
    }
    this.filteredGasStations = this.allGasStations.filter(st => {
      return st.distanceToUser !== undefined && st.distanceToUser <= km;
    });
  }

  /**
   * Extrae valores únicos de una propiedad (p.e. 'Rótulo')
   */
  getUniqueValues(arrayData: any[], property: string): string[] {
    const values = arrayData.map(item => item[property]?.trim() || '');
    const uniqueValues = Array.from(new Set(values)).filter(v => v !== '');
    return uniqueValues.sort();
  }

  /**
   * Detectar claves que empiecen por "Precio "
   */
  extractCarburantes(oneStation: any): string[] {
    if (!oneStation) return [];
    return Object.keys(oneStation)
      .filter(key => key.startsWith('Precio '))
      .map(key => key.replace('Precio ', ''))
      .sort();
  }

  /**
   * Aplica los filtros en memoria (empresa, provincia, municipio, carburante, etc.)
   */
  applyFilters(): void {
    this.filteredGasStations = this.allGasStations.filter(st => {
      if (this.filters.empresa && st['Rótulo'] !== this.filters.empresa) {
        return false;
      }
      if (this.filters.provincia && st['Provincia'] !== this.filters.provincia) {
        return false;
      }
      if (this.filters.municipio && st['Municipio'] !== this.filters.municipio) {
        return false;
      }
      if (this.filters.localidad && st['Localidad'] !== this.filters.localidad) {
        return false;
      }
      if (this.filters.carburante) {
        const precioKey = 'Precio ' + this.filters.carburante;
        if (!st.hasOwnProperty(precioKey)) {
          return false;
        }
      }
      return true;
    });

    if (this.userLat != null && this.userLng != null) {
      this.filteredGasStations.sort((a, b) => (a.distanceToUser || 0) - (b.distanceToUser || 0));
    }
  }

  onChangeProvince(): void {
    if (this.filters.provincia) {
      const filtered = this.allGasStations.filter(st => st.Provincia === this.filters.provincia);
      this.municipios = this.getUniqueValues(filtered, 'Municipio');
    } else {
      this.municipios = this.getUniqueValues(this.allGasStations, 'Municipio');
    }
    this.filters.municipio = '';
    this.filters.localidad = '';
    this.onChangeMunicipio();
  }

  onChangeMunicipio(): void {
    if (this.filters.municipio) {
      const filtered = this.allGasStations.filter(st => st.Municipio === this.filters.municipio);
      this.localidades = this.getUniqueValues(filtered, 'Localidad');
    } else {
      if (this.filters.provincia) {
        const filteredProvince = this.allGasStations.filter(st => st.Provincia === this.filters.provincia);
        this.localidades = this.getUniqueValues(filteredProvince, 'Localidad');
      } else {
        this.localidades = this.getUniqueValues(this.allGasStations, 'Localidad');
      }
    }
    this.filters.localidad = '';
  }
}