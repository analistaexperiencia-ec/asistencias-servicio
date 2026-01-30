
import { Proveedor } from './types';

/**
 * URL de exportación CSV para el Google Sheet del usuario.
 * El ID es: 1xi__RmraqJ9sVinB2Ow0P6wynpTIsKgJH4XJRryHS6k
 */
export const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1xi__RmraqJ9sVinB2Ow0P6wynpTIsKgJH4XJRryHS6k/export?format=csv';

// Estos se mantendrán como base, pero la App los complementará con los datos del Excel
export const PROVINCIAS_ECUADOR = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi', 'El Oro', 
  'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja', 'Los Ríos', 
  'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza', 'Pichincha', 
  'Santa Elena', 'Santo Domingo de los Tsáchilas', 'Sucumbíos', 'Tungurahua', 
  'Zamora Chinchipe'
];

export const CATEGORIAS_BASE = ['Grúa', 'Médica', 'Auxilio Vial', 'Dental', 'Seguro'];

// Seed data vacío para obligar al uso del Excel según solicitud "NO INVENTES DATOS"
export const SEED_DATA: Proveedor[] = [];
