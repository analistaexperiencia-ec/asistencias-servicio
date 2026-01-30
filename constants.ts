
import { Proveedor } from './types';

export const PROVINCIAS_ECUADOR = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 
  'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 
  'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 
  'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 
  'Zamora Chinchipe'
];

export const CATEGORIAS = ['Grúa', 'Médica', 'Auxilio Vial', 'Dental', 'Seguro'];

export const SEED_DATA: Proveedor[] = [
  {
    id: '1',
    nombre_proveedor: 'Grúas Pichincha Express',
    categoria: 'Grúa',
    direccion: 'Av. Amazonas y Naciones Unidas',
    ubicacion: { lat: -0.1758, lng: -78.4821 },
    ciudad: 'Quito',
    provincia: 'Pichincha',
    nombre_contacto: 'Carlos Pérez',
    numero_celular: '0991234567'
  },
  {
    id: '2',
    nombre_proveedor: 'Asistencia Médica Guayas',
    categoria: 'Médica',
    direccion: 'Av. 9 de Octubre y Boyacá',
    ubicacion: { lat: -2.1912, lng: -79.8871 },
    ciudad: 'Guayaquil',
    provincia: 'Guayas',
    nombre_contacto: 'Dra. María Solís',
    numero_celular: '0987654321'
  },
  {
    id: '3',
    nombre_proveedor: 'Auxilio Vial Azuay',
    categoria: 'Auxilio Vial',
    direccion: 'Calle Larga y Huayna Cápac',
    ubicacion: { lat: -2.9001, lng: -79.0059 },
    ciudad: 'Cuenca',
    provincia: 'Azuay',
    nombre_contacto: 'Juan Cueva',
    numero_celular: '0955554433'
  },
  {
    id: '4',
    nombre_proveedor: 'Dental Care Quito Norte',
    categoria: 'Dental',
    direccion: 'Av. Galo Plaza Lasso',
    ubicacion: { lat: -0.1250, lng: -78.4750 },
    ciudad: 'Quito',
    provincia: 'Pichincha',
    nombre_contacto: 'Luis Méndez',
    numero_celular: '0966667788'
  },
  {
    id: '5',
    nombre_proveedor: 'Seguros del Pacífico',
    categoria: 'Seguro',
    direccion: 'Puerto Santa Ana, Edificio The Point',
    ubicacion: { lat: -2.1790, lng: -79.8760 },
    ciudad: 'Guayaquil',
    provincia: 'Guayas',
    nombre_contacto: 'Andrea Rivas',
    numero_celular: '0999991122'
  }
];
