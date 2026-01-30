
import { Proveedor } from '../types';

/**
 * Servicio para obtener y parsear los datos desde Google Sheets en formato CSV.
 */
export const fetchProvidersFromSheet = async (url: string): Promise<Proveedor[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('No se pudo acceder al archivo de Google Sheets. Asegúrate de que el enlace sea público.');
    }
    
    const csvText = await response.text();
    // Separamos por líneas y eliminamos las vacías
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    
    if (lines.length < 2) return [];

    /**
     * Parseo de CSV robusto para manejar comas dentro de comillas si existieran.
     */
    const parseCSVLine = (text: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(v => v.replace(/^"|"$/g, ''));
    };

    const headers = parseCSVLine(lines[0]);
    const dataRows = lines.slice(1);
    
    return dataRows
      .map((line, index) => {
        const row = parseCSVLine(line);
        const item: any = {};
        headers.forEach((header, i) => {
          item[header] = row[i];
        });
        
        // Mapeo estricto basado en las cabeceras del usuario:
        // nombre_proveedor, categoria, lat, lng, ciudad, provincia, numero_celular
        return {
          id: `sheet-${index}-${Date.now()}`,
          nombre_proveedor: item.nombre_proveedor || 'Sin nombre',
          categoria: item.categoria || 'General',
          ubicacion: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng)
          },
          ciudad: item.ciudad || '',
          provincia: item.provincia || '',
          numero_celular: item.numero_celular || ''
        };
      })
      .filter(p => !isNaN(p.ubicacion.lat) && !isNaN(p.ubicacion.lng) && p.ubicacion.lat !== 0);
  } catch (error) {
    console.error('Error cargando Google Sheet:', error);
    throw error;
  }
};
