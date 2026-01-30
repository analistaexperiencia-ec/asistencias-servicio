
import { Ubicacion } from '../types';

/**
 * Calcula la distancia en kilómetros entre dos puntos geográficos
 * usando la fórmula de Haversine.
 */
export const calculateDistance = (p1: Ubicacion, p2: Ubicacion): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLon = (p2.lng - p1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
