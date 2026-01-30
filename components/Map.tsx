
import React, { useEffect, useRef } from 'react';
import { Proveedor, Ubicacion } from '../types';

interface MapProps {
  proveedores: Proveedor[];
  userLocation: Ubicacion | null;
  selectedId: string | null;
  onSelectProvider: (id: string) => void;
  onSetUserLocation: (loc: Ubicacion) => void;
  isSidebarOpen: boolean;
}

const MapView: React.FC<MapProps> = ({ 
  proveedores, 
  userLocation, 
  selectedId, 
  onSelectProvider, 
  onSetUserLocation,
  isSidebarOpen 
}) => {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);

  // Inicialización única del mapa
  useEffect(() => {
    // @ts-ignore
    const L = window.L;
    if (!L || !containerRef.current || mapRef.current) return;

    // Crear el mapa
    mapRef.current = L.map(containerRef.current, {
      zoomControl: false // Lo movemos a la derecha para que no estorbe
    }).setView([-1.8312, -78.1834], 7);

    L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

    L.tileLayer('https://{s}.tile.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapRef.current);

    // Permitir clic para establecer ubicación
    mapRef.current.on('click', (e: any) => {
      onSetUserLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Manejar redimensionamiento cuando cambia el sidebar
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300); // Esperar a que la transición del sidebar termine
    }
  }, [isSidebarOpen]);

  // Actualizar marcadores y capas
  useEffect(() => {
    // @ts-ignore
    const L = window.L;
    if (!L || !mapRef.current) return;

    const map = mapRef.current;

    // 1. Marcadores de Proveedores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    proveedores.forEach(p => {
      const isSelected = p.id === selectedId;
      const marker = L.circleMarker([p.ubicacion.lat, p.ubicacion.lng], {
        radius: isSelected ? 12 : 8,
        fillColor: isSelected ? '#ef4444' : '#1A365D',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-1 font-sans">
          <strong class="text-[#1A365D] block mb-1">${p.nombre_proveedor}</strong>
          <span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase font-bold">${p.categoria}</span>
          <div class="mt-2 text-sm font-bold text-slate-700">${p.numero_celular}</div>
        </div>
      `, { closeButton: false });

      marker.on('click', () => onSelectProvider(p.id));
      markersRef.current.set(p.id, marker);
    });

    // 2. Marcador de Usuario
    if (userLocation) {
      if (userMarkerRef.current) userMarkerRef.current.remove();
      
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'user-marker-icon',
          html: `
            <div class="relative flex items-center justify-center">
              <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
              <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(map);

      // Si no hay selección, centrar en el usuario la primera vez
      if (!selectedId && userLocation) {
        // map.setView([userLocation.lat, userLocation.lng], 13);
      }
    }

    // 3. Centrar en seleccionado
    if (selectedId) {
      const selected = proveedores.find(p => p.id === selectedId);
      if (selected) {
        map.flyTo([selected.ubicacion.lat, selected.ubicacion.lng], 15, {
          duration: 1.5
        });
      }
    }
  }, [proveedores, userLocation, selectedId]);

  return (
    <div className="h-full w-full relative group">
      <div ref={containerRef} className="h-full w-full" />
      
      {/* Overlay de ayuda */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          Haz clic en el mapa para marcar tu ubicación
        </div>
      </div>
    </div>
  );
};

export default MapView;
