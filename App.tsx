
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

  // Solicitar ubicación inicial
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.error("Error obteniendo ubicación, usando Quito por defecto:", err);
          // Fallback a Quito si no hay GPS
          setUserLocation({ lat: -0.1807, lng: -78.4678 });
        }
      );
    }
  }, []);

  // Filtrar y ordenar proveedores
  const filteredProviders = useMemo(() => {
    let result = providers.map(p => ({
      ...p,
      distancia: userLocation ? calculateDistance(userLocation, p.ubicacion) : undefined
    }));

    if (filters.search) {
      result = result.filter(p => p.nombre_proveedor.toLowerCase().includes(filters.search.toLowerCase()));
    }
    if (filters.categoria) {
      result = result.filter(p => p.categoria === filters.categoria);
    }
    if (filters.provincia) {
      result = result.filter(p => p.provincia === filters.provincia);
    }
    if (filters.ciudad) {
      result = result.filter(p => p.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase()));
    }

    // Ordenar por distancia si está disponible
    if (userLocation) {
      result.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
    }

    return result;
  }, [providers, filters, userLocation]);

  const handleAiSearch = async () => {
    if (!filters.search) return;
    setIsAiLoading(true);
    const suggestion = await getGeminiAssistance(filters.search);
    setAiMessage(suggestion || null);
    setIsAiLoading(false);
  };

  const handleSetUserLocation = (loc: Ubicacion) => {
    setUserLocation(loc);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-full md:w-[400px]' : 'w-0 overflow-hidden'
        } bg-white shadow-2xl flex flex-col transition-all duration-300 z-[2000] border-r border-slate-200 h-full relative`}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#1A365D] text-white">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Asistencia Ecuador</h1>
            <p className="text-xs text-slate-300">Encuentra ayuda en segundos</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Filtros */}
        <div className="p-5 space-y-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <input 
              type="text"
              placeholder="¿Qué necesitas? (ej. Grúa en Quito)"
              className="w-full pl-10 pr-12 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1A365D] focus:border-transparent outline-none transition-all shadow-inner"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <button 
              onClick={handleAiSearch}
              disabled={isAiLoading || !filters.search}
              className="absolute right-2 top-2 p-1.5 bg-[#1A365D] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
              title="Asistente IA"
            >
              {isAiLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              )}
            </button>
          </div>

          {aiMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 animate-fade-in flex items-start gap-2 shadow-sm">
              <span className="text-lg">💡</span>
              <p className="flex-1">{aiMessage}</p>
              <button onClick={() => setAiMessage(null)} className="text-blue-400 hover:text-blue-600 font-bold">&times;</button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <select 
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-[#1A365D]"
              value={filters.categoria}
              onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
            >
              <option value="">Todas las Categorías</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-[#1A365D]"
              value={filters.provincia}
              onChange={(e) => setFilters({ ...filters, provincia: e.target.value })}
            >
              <option value="">Provincia</option>
              {PROVINCIAS_ECUADOR.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-white">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {filteredProviders.length} Proveedores cercanos
            </span>
            {userLocation && (
              <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase animate-pulse">
                Ubicación Activa
              </span>
            )}
          </div>
          
          {filteredProviders.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="text-5xl mb-4 grayscale opacity-20">🗺️</div>
              <p className="text-slate-500 font-medium">No hay proveedores cercanos</p>
              <button 
                onClick={() => setFilters({ search: '', categoria: '', provincia: '', ciudad: '' })}
                className="mt-4 text-[#1A365D] text-sm font-bold hover:underline"
              >
                Restablecer búsqueda
              </button>
            </div>
          ) : (
            filteredProviders.map(p => (
              <ProviderCard 
                key={p.id}
                proveedor={p}
                isSelected={selectedId === p.id}
                onClick={() => setSelectedId(p.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Main Content (Map) */}
      <main className="flex-1 relative bg-slate-200">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className={`absolute top-4 left-4 z-[2000] bg-[#1A365D] p-3 rounded-full shadow-2xl text-white transition-all transform hover:scale-110 active:scale-95 ${isSidebarOpen ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
           <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-xl border border-white/50 flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-xs font-black text-[#1A365D] uppercase tracking-tighter">Asistencia 24/7 Ecuador</span>
           </div>
        </div>

        <MapView 
          proveedores={filteredProviders}
          userLocation={userLocation}
          selectedId={selectedId}
          onSelectProvider={setSelectedId}
          onSetUserLocation={handleSetUserLocation}
          isSidebarOpen={isSidebarOpen}
        />
      </main>
    </div>
  );
};

export default App;
