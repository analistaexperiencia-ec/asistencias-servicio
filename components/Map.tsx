
import React, { useEffect, useRef } from 'react';
import { Proveedor, Ubicacion } from '../types';

interface MapProps {
  proveedores: Proveedor[];
  userLocation: Ubicacion | null;
  selectedId: string | null;
  onSelectProvider: (id: string) => void;
}

const MapView: React.FC<MapProps> = ({ proveedores, userLocation, selectedId, onSelectProvider }) => {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    if (!window.L) return;
    // @ts-ignore
    const L = window.L;

    if (!mapRef.current) {
      mapRef.current = L.map('map-container').setView([-1.8312, -78.1834], 7);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Actualizar marcadores de proveedores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    proveedores.forEach(p => {
      const color = p.id === selectedId ? '#1A365D' : '#3B82F6';
      const marker = L.circleMarker([p.ubicacion.lat, p.ubicacion.lng], {
        radius: p.id === selectedId ? 12 : 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-1">
          <strong class="text-[#1A365D]">${p.nombre_proveedor}</strong><br/>
          <span class="text-xs text-slate-500">${p.categoria}</span><br/>
          <span class="text-sm font-bold">${p.numero_celular}</span>
        </div>
      `);

      marker.on('click', () => {
        onSelectProvider(p.id);
      });

      markersRef.current.set(p.id, marker);
    });

    // Actualizar marcador de usuario
    if (userLocation) {
      if (userMarkerRef.current) userMarkerRef.current.remove();
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'user-marker',
          html: '<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
          iconSize: [16, 16]
        })
      }).addTo(map);
      
      if (!selectedId) {
        map.setView([userLocation.lat, userLocation.lng], 13);
      }
    }

    // Centrar si hay un proveedor seleccionado
    if (selectedId) {
      const selected = proveedores.find(p => p.id === selectedId);
      if (selected) {
        map.flyTo([selected.ubicacion.lat, selected.ubicacion.lng], 14);
      }
    }

  }, [proveedores, userLocation, selectedId]);

  return <div id="map-container" className="h-full w-full relative z-0" />;
};

export default MapView;
