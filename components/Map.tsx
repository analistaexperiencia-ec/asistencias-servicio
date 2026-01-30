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

  // Inicialización del mapa
  useEffect(() => {
    // @ts-ignore
    const L = window.L;
    if (!L || !containerRef.current || mapRef.current) return;

    // Pequeño timeout para asegurar que el contenedor tiene dimensiones
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true
      }).setView([-1.8312, -78.1834], 7);

      L.control.zoom({ position: 'topright' }).addTo(mapRef.current);

      // Usamos OpenStreetMap estándar que es el más robusto para pruebas
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Listener para clics en el mapa
      mapRef.current.on('click', (e: any) => {
        onSetUserLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      // Forzar renderizado correcto
      mapRef.current.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Actualizar tamaño cuando el sidebar cambia
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 350);
    }
  }, [isSidebarOpen]);

  // Manejo de marcadores
  useEffect(() => {
    // @ts-ignore
    const L = window.L;
    if (!L || !mapRef.current) return;

    const map = mapRef.current;

    // Limpiar marcadores antiguos
    markersRef.current.forEach(m => m.remove());
    markersRef.current.clear();

    // Marcadores de proveedores
    proveedores.forEach(p => {
      const isSelected = p.id === selectedId;
      const marker = L.circleMarker([p.ubicacion.lat, p.ubicacion.lng], {
        radius: isSelected ? 12 : 8,
        fillColor: isSelected ? '#ef4444' : '#1e3a8a',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      marker.bindPopup(`<b>${p.nombre_proveedor}</b><br>${p.categoria}`, { closeButton: false });
      
      marker.on('click', () => {
        onSelectProvider(p.id);
        marker.openPopup();
      });

      markersRef.current.set(p.id, marker);
    });

    // Marcador de usuario
    if (userLocation) {
      if (userMarkerRef.current) userMarkerRef.current.remove();
      
      userMarkerRef.current = L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 7,
        fillColor: '#3b82f6',
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map);
      
      userMarkerRef.current.bindTooltip("Tu ubicación", { permanent: false, direction: 'top' });
    }

    // Centrar si hay uno seleccionado
    if (selectedId) {
      const p = proveedores.find(x => x.id === selectedId);
      if (p) {
        map.flyTo([p.ubicacion.lat, p.ubicacion.lng], 14, { animate: true, duration: 1 });
      }
    }
  }, [proveedores, userLocation, selectedId]);

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Indicador de carga si el mapa no se ha inicializado */}
      {!mapRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">Cargando Mapa...</span>
          </div>
        </div>
      )}

      {/* Instrucciones flotantes */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="bg-white/90 backdrop-blur shadow-xl border border-slate-200 px-4 py-2 rounded-full text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          Haz clic en el mapa para marcar tu posición
        </div>
      </div>
    </div>
  );
};

export default MapView;