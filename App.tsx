
import React, { useState, useEffect, useMemo } from 'react';
import MapView from './components/Map';
import ProviderCard from './components/ProviderCard';
import { Proveedor, FiltersState, Ubicacion } from './types';
import { SEED_DATA, GOOGLE_SHEET_CSV_URL, PROVINCIAS_ECUADOR, CATEGORIAS_BASE } from './constants';
import { calculateDistance } from './utils/haversine';
import { getGeminiAssistance } from './services/geminiService';
import { fetchProvidersFromSheet } from './services/sheetService';

const App: React.FC = () => {
  const [providers, setProviders] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Ubicacion | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    categoria: '',
    provincia: '',
    ciudad: ''
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Cargar datos exclusivamente de Google Sheets
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProvidersFromSheet(GOOGLE_SHEET_CSV_URL);
        if (data.length > 0) {
          setProviders(data);
        } else {
          setProviders(SEED_DATA);
        }
      } catch (error) {
        console.error("Error cargando Excel:", error);
        setProviders(SEED_DATA);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Obtener categorías y provincias únicas presentes en el Excel para los filtros
  const dynamicCategories = useMemo(() => {
    const cats = new Set(providers.map(p => p.categoria));
    // Combinamos con las base por si acaso, pero priorizamos las del Excel
    CATEGORIAS_BASE.forEach(c => cats.add(c));
    return Array.from(cats).filter(Boolean).sort();
  }, [providers]);

  const dynamicProvinces = useMemo(() => {
    const provs = new Set(providers.map(p => p.provincia));
    PROVINCIAS_ECUADOR.forEach(p => provs.add(p));
    return Array.from(provs).filter(Boolean).sort();
  }, [providers]);

  // Ubicación inicial
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

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(p => 
        p.nombre_proveedor.toLowerCase().includes(s) || 
        p.categoria.toLowerCase().includes(s) ||
        p.ciudad.toLowerCase().includes(s)
      );
    }
    if (filters.categoria) result = result.filter(p => p.categoria === filters.categoria);
    if (filters.provincia) result = result.filter(p => p.provincia === filters.provincia);

    if (userLocation) result.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
    return result;
  }, [providers, filters, userLocation]);

  const handleAiSearch = async () => {
    if (!filters.search) return;
    setIsAiLoading(true);
    const suggestion = await getGeminiAssistance(filters.search);
    // Si la IA sugiere una categoría, la aplicamos al filtro si existe
    if (suggestion) {
      const matchedCat = dynamicCategories.find(c => 
        suggestion.toLowerCase().includes(c.toLowerCase())
      );
      if (matchedCat) {
        setFilters(prev => ({ ...prev, categoria: matchedCat }));
      }
    }
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
            <p className="text-[10px] opacity-70 uppercase tracking-widest">Base de Datos: Google Sheets</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
        </div>

        <div className="p-4 space-y-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="relative">
            <input 
              type="text"
              placeholder="¿Qué servicio buscas?"
              className="w-full pl-10 pr-12 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <button 
              onClick={handleAiSearch} 
              disabled={isAiLoading || !filters.search}
              className="absolute right-2 top-2 p-1.5 bg-[#1A365D] text-white rounded-lg disabled:opacity-50"
            >
              {isAiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "IA"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select className="p-2 text-xs border rounded-lg bg-white" value={filters.categoria} onChange={(e) => setFilters({...filters, categoria: e.target.value})}>
              <option value="">Todas las Categorías</option>
              {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="p-2 text-xs border rounded-lg bg-white" value={filters.provincia} onChange={(e) => setFilters({...filters, provincia: e.target.value})}>
              <option value="">Toda la Provincia</option>
              {dynamicProvinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 border-4 border-[#1A365D] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium italic">Sincronizando con tu Excel...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-sm">No se encontraron proveedores en esta zona.</p>
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
