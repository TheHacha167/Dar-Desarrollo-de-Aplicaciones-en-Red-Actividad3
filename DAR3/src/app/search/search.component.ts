import { Component, OnInit } from '@angular/core';
import { GasStationService } from '../services/gas-station.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone : false
})
export class SearchComponent implements OnInit {

  // Datos crudos (todas las gasolineras)
  allGasStations: any[] = [];

  // Datos filtrados (los que muestra la interfaz)
  filteredGasStations: any[] = [];

  // Catálogos únicos extraídos de `allGasStations`
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

  constructor(private gasStationService: GasStationService) { }

  ngOnInit(): void {
    // Al iniciar el componente, cargamos toda la data de gasolineras
    this.gasStationService.getGasStations().subscribe({
      next: (data: any[]) => {
        this.allGasStations = data;
        // Copiamos como filtrado inicial (sin filtros)
        this.filteredGasStations = data;

        // Generamos catálogos:
        this.empresas = this.getUniqueValues(data, 'Rótulo');
        this.provincias = this.getUniqueValues(data, 'Provincia');
        this.municipios = this.getUniqueValues(data, 'Municipio');
        this.localidades = this.getUniqueValues(data, 'Localidad');
        
        // Extraer lista de carburantes:
        // En la API, los carburantes vienen en propiedades como 'Precio Gasolina 95 E5',
        // 'Precio Gasolina 98 E5', 'Precio Gasoleo A', etc.
        // Podemos tomar las keys que empiecen por 'Precio '
        this.carburantes = this.extractCarburantes(data[0]);
      },
      error: (err) => {
        console.error('Error al obtener estaciones de servicio: ', err);
      }
    });
  }

  /**
   * Extrae los valores únicos para una propiedad dada (por ejemplo, 'Rótulo').
   */
  getUniqueValues(arrayData: any[], property: string): string[] {
    const values = arrayData.map(item => item[property]?.trim() || '');
    const uniqueValues = Array.from(new Set(values)).filter(v => v !== '');
    return uniqueValues.sort();
  }

  /**
   * Como en el script, detectamos las keys que empiezan por "Precio "
   */
  extractCarburantes(oneStation: any): string[] {
    if (!oneStation) return [];
    return Object.keys(oneStation)
      .filter(key => key.startsWith('Precio '))
      .map(key => key.replace('Precio ', ''))
      .sort();
  }

  /**
   * Aplica filtros en memoria, similar a cómo lo hace tu script con jq.
   */
  applyFilters(): void {
    this.filteredGasStations = this.allGasStations.filter(st => {
      
      // Filtra por empresa (Rótulo), si está seleccionado
      if (this.filters.empresa && st['Rótulo'] !== this.filters.empresa) {
        return false;
      }
      // Filtra por provincia
      if (this.filters.provincia && st['Provincia'] !== this.filters.provincia) {
        return false;
      }
      // Filtra por municipio
      if (this.filters.municipio && st['Municipio'] !== this.filters.municipio) {
        return false;
      }
      // Filtra por localidad
      if (this.filters.localidad && st['Localidad'] !== this.filters.localidad) {
        return false;
      }
      // Filtra por carburante
      // Ej: st["Precio Gasolina 95 E5"] ? -> se revisa que exista la clave
      if (this.filters.carburante) {
        const precioKey = 'Precio ' + this.filters.carburante;
        // Opcional: si quieres excluir las que no tengan ese carburante, comprueba si la key existe:
        if (!st.hasOwnProperty(precioKey)) {
          return false;
        }
      }
      
      return true; // Si pasa todos los filtros, se incluye
    });
  }

  /**
   * Evento al cambiar provincia -> recarga los municipios correspondientes, etc.
   * (Opcional) Si prefieres repoblar combos en cascada.
   */
  onChangeProvince(): void {
    // Filtra allGasStations para los que coincidan con la provincia
    // y saca municipios únicos
    if (this.filters.provincia) {
      const filtered = this.allGasStations.filter(st => st.Provincia === this.filters.provincia);
      this.municipios = this.getUniqueValues(filtered, 'Municipio');
    } else {
      this.municipios = this.getUniqueValues(this.allGasStations, 'Municipio');
    }
    // Reseteamos el municipio y localidad seleccionados
    this.filters.municipio = '';
    this.filters.localidad = '';
    this.onChangeMunicipio();
  }

  onChangeMunicipio(): void {
    if (this.filters.municipio) {
      const filtered = this.allGasStations.filter(st => st.Municipio === this.filters.municipio);
      this.localidades = this.getUniqueValues(filtered, 'Localidad');
    } else {
      // sino, las localidades se basan en toda la provincia
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