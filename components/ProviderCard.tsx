
import React from 'react';
import { Proveedor } from '../types';

interface ProviderCardProps {
  proveedor: Proveedor;
  isSelected: boolean;
  onClick: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ proveedor, isSelected, onClick }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Grúa': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Médica': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Auxilio Vial': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Dental': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer mb-3 ${
        isSelected 
          ? 'border-[#1A365D] bg-[#1A365D]/5 shadow-md' 
          : 'border-transparent bg-white hover:border-slate-200 hover:shadow-sm shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-[#1A365D] text-lg leading-tight flex-1 mr-2">
          {proveedor.nombre_proveedor}
        </h3>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(proveedor.categoria)}`}>
          {proveedor.categoria}
        </span>
      </div>

      <p className="text-slate-500 text-sm mb-3 flex items-center">
        <svg className="w-4 h-4 mr-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {proveedor.ciudad}, {proveedor.provincia}
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">Contacto</span>
          <span className="text-sm font-medium text-slate-700">{proveedor.numero_celular}</span>
        </div>
        
        {proveedor.distancia !== undefined && (
          <div className="text-right">
            <span className="text-xs text-slate-400">Distancia</span>
            <div className="text-sm font-bold text-[#1A365D]">
              {proveedor.distancia.toFixed(1)} km
            </div>
          </div>
        )}
      </div>
      
      {isSelected && (
        <button className="mt-4 w-full bg-[#1A365D] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#2A4A7D] transition-colors shadow-lg shadow-blue-900/20">
          Llamar ahora
        </button>
      )}
    </div>
  );
};

export default ProviderCard;
