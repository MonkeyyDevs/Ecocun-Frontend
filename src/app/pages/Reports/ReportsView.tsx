import React, { useState, useEffect } from 'react';
import { FaMapMarkedAlt, FaTimes, FaImage } from 'react-icons/fa';
import ReportCard, { ReportCardProps } from '../../Components/ReportCard/ReportCard';
import { mapCategoryToString, mapStatusToString } from '../../utils/enumTranslators';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

const monkeyLogo = "/monkeydev_logo_blanco_slogan.png";

interface ReportFromApi { id: number; userId: number; locLatitude: number; locLongitude: number; description: string; category: number | string; status: number | string; createdAt: string; imageUrl?: string; }

const ReportsView: React.FC = () => {
  const [reports, setReports] = useState<ReportCardProps[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportCardProps | null>(null);

  const navigate = useNavigate();

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API_URL}${path}`;
  };

  useEffect(() => {
    const token = localStorage.getItem('token'); 
    if (!token) {
      setError('No estás autenticado.');
      setIsLoading(false);
      return; 
    }

    fetch(`${API_URL}/api/reports/myreports`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401) throw new Error('Sesión expirada. Inicia sesión de nuevo.');
        if (!res.ok) throw new Error('Error al cargar reportes');
        return res.json();
      })
      .then(res => {
         const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
         console.log('API response shape:', { keys: Object.keys(res), firstItem: list[0] });
         if (list.length > 0) {
             const mapped = list.map((r: ReportFromApi) => ({
                 folio: String(r.id ?? '0000').padStart(4, '0'),
                 ubicacion: `Lat: ${(r.locLatitude ?? 0).toFixed(4)}, Lon: ${(r.locLongitude ?? 0).toFixed(4)}`,
                 caso: mapCategoryToString(r.category),
                 status: mapStatusToString(r.status),
                 description: r.description ?? '',
                 imageUrl: getImageUrl(r.imageUrl),
                 lat: r.locLatitude ?? 0, lon: r.locLongitude ?? 0
             }));
             setReports(mapped);
         } else {
             setReports([]);
         }
      })
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white pb-24 flex flex-col relative">
      
      <main className="flex-grow p-4 pt-6">
        
        {/* Título Simple (No es header sticky, así no choca) */}
        <h1 className="text-2xl font-black text-gray-800 mb-6 px-2">
            Mis Reportes
        </h1>

        {/* Filtros Visuales (Sin buscador) */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm whitespace-nowrap">Nuevo</button>
          <button className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm whitespace-nowrap">En proceso</button>
          <button className="bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm whitespace-nowrap">Resueltos</button>
        </div>

        {/* Lista */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Cargando tus reportes...</div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-center text-sm border border-red-100">{error}</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
                <p className="mb-2">No has creado ningún reporte aún.</p>
                <button onClick={() => navigate('/ecoaporta')} className="text-green-600 font-bold text-sm underline">¡Crea uno aquí!</button>
            </div>
          ) : (
            reports.map((report) => (
              <ReportCard
                key={report.folio}
                {...report} 
                onViewDetails={() => setSelectedReport(report)} 
              />
            ))
          )}
        </div>
      </main>
      
      {/* Footer */}
      <div className="text-center pb-4 opacity-40"> 
        <img src={monkeyLogo} alt="MonkeyDevs" className="h-10 mx-auto" />
      </div>

      {/* MODAL DETALLES */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fade-in" onClick={() => setSelectedReport(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                  <span className="text-xs text-gray-500 font-bold">FOLIO</span>
                  <h2 className="text-2xl font-black text-gray-800">#{selectedReport.folio}</h2>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-red-500"><FaTimes size={22} /></button>
            </div>

            <div className="p-5">
                <div className="mb-4 bg-gray-100 h-48 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 relative">
                   {selectedReport.imageUrl ? (
                      <img src={selectedReport.imageUrl} className="w-full h-full object-cover" alt="Evidencia"/>
                   ) : (
                      <div className="text-gray-400 flex flex-col items-center"><FaImage size={32} className="mb-2"/><span className="text-xs">Sin foto</span></div>
                   )}
                </div>

                <div className="space-y-3 mb-6">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categoría</label>
                        <p className="text-gray-800 font-semibold text-lg">{selectedReport.caso}</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Comentarios</label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-600 text-sm italic">
                            "{selectedReport.description}"
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estatus</label>
                        <div className="mt-1">
                            <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                                {selectedReport.status}
                            </span>
                        </div>
                    </div>
                </div>

                <button 
                  onClick={() => navigate('/maps', { state: { targetLat: selectedReport.lat, targetLng: selectedReport.lon } })} 
                  className="w-full bg-[#228B4B] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                >
                  <FaMapMarkedAlt /> Ver en Mapa
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
