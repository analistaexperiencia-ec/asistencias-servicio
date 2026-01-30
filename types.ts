
export interface Ubicacion {
  lat: number;
  lng: number;
}

export interface Proveedor {
  id: string;
  nombre_proveedor: string;
  categoria: string;
  direccion: string;
  ubicacion: Ubicacion;
  ciudad: string;
  provincia: string;
  nombre_contacto: string;
  numero_celular: string;
  distancia?: number; // Calculada dinámicamente
}

export type Categoria = 'Grúa' | 'Médica' | 'Auxilio Vial' | 'Dental' | 'Seguro' | string;

export interface FiltersState {
  search: string;
  categoria: string;
  provincia: string;
  ciudad: string;
}
