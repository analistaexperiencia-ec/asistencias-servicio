import React, { useState, useEffect, useMemo } from 'react';
import MapView from './components/Map';
import ProviderCard from './components/ProviderCard';
import { Proveedor, FiltersState, Ubicacion } from './types';
import { SEED_DATA, CATEGORIAS, PROVINCIAS_ECUADOR } from './constants';
import { calculateDistance } from './utils/haversine';
import { getGeminiAssistance } from './services/geminiService';

const App: React.FC = () => {
  const [providers, setProviders] = useState<Proveedor[]>(SEED_DATA);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Ubicacion | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    categoria: '',
    provincia: '',
    ciudad: ''
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Ubicación inicial (Default Quito)
  useEffect(() => {
    setUserLocation({ lat: -0.1807, lng: -78.4678 });
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Usando ubicación por defecto (Quito)")
      );
    }
  }, []);

  const filteredProviders = useMemo(() => {
    let result = providers.map(p => ({
      ...p,
      distancia: userLocation ? calculateDistance(userLocation, p.ubicacion) : undefined
    }));

    if (filters.search) result = result.filter(p => p.nombre_proveedor.toLowerCase().includes(filters.search.toLowerCase()));
    if (filters.categoria) result = result.filter(p => p.categoria === filters.categoria);
    if (filters.provincia) result = result.filter(p => p.provincia === filters.provincia);

    if (userLocation) result.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
    return result;
  }, [providers, filters, userLocation]);

  const handleAiSearch = async () => {
    if (!filters.search) return;
    setIsAiLoading(true);
    const suggestion = await getGeminiAssistance(filters.search);
    setAiMessage(suggestion || null);
    setIsAiLoading(false);
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-full md:w-[420px]' : 'w-0'
        } bg-white shadow-2xl flex flex-col transition-all duration-300 z-[2000] border-r border-slate-200 h-full overflow-hidden`}
      >
        <div className="p-5 bg-[#1A365D] text-white flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold">Asistencia Ecuador</h1>
            <p className="text-[10px] opacity-70 uppercase tracking-widest">Panel de Proveedores</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>

        <div className="p-4 space-y-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="relative">
            <input 
              type="text"
              placeholder="Ej: Grúa en Guayaquil..."
              className="w-full pl-10 pr-12 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <button onClick={handleAiSearch} className="absolute right-2 top-2 p-1.5 bg-[#1A365D] text-white rounded-lg">
              {isAiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "IA"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select className="p-2 text-xs border rounded-lg" value={filters.categoria} onChange={(e) => setFilters({...filters, categoria: e.target.value})}>
              <option value="">Categoría</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="p-2 text-xs border rounded-lg" value={filters.provincia} onChange={(e) => setFilters({...filters, provincia: e.target.value})}>
              <option value="">Provincia</option>
              {PROVINCIAS_ECUADOR.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredProviders.map(p => (
            <ProviderCard 
              key={p.id}
              proveedor={p}
              isSelected={selectedId === p.id}
              onClick={() => setSelectedId(p.id)}
            />
          ))}
        </div>
      </aside>

      {/* Map Area */}
      <main className="flex-1 relative bg-slate-200 overflow-hidden">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-[1500] bg-[#1A365D] p-3 rounded-full text-white shadow-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        )}
        
        <MapView 
          proveedores={filteredProviders}
          userLocation={userLocation}
          selectedId={selectedId}
          onSelectProvider={setSelectedId}
          onSetUserLocation={setUserLocation}
          isSidebarOpen={isSidebarOpen}
        />
      </main>
    </div>
  );
};

export default App;