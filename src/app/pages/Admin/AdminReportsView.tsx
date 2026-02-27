import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaTimes, FaImage, FaMapMarkedAlt, FaCheck, FaBan } from 'react-icons/fa'; 
import { Link, useNavigate } from 'react-router-dom';
import ReportCard, { ReportCardProps } from '../../Components/ReportCard/ReportCard';
import { mapCategoryToString, mapStatusToString } from '../../utils/enumTranslators';
import toast from 'react-hot-toast';
// ! SE ESTA USANDO ESTE COMPONENTE????
const API_URL = import.meta.env.VITE_API_URL;

interface ReportFromApi { 
  id: number; 
  userId: number; 
  locLatitude: number; 
  locLongitude: number; 
  description: string; 
  category: number | string; 
  status: number | string; 
  createdAt: string; 
  blobName?: string; 
}

interface ExtendedReport extends ReportCardProps {
  id: number;
  rawStatus: number | string;
  lat: number;
  lon: number;
  // [key: string]: any; 
}

const AdminReportsView: React.FC = () => {
  const [reports, setReports] = useState<ExtendedReport[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ExtendedReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Estado para cargar al evaluar
  const navigate = useNavigate();

  const getImageUrl = (path?: string) => path ? (path.startsWith('http') ? path : `${API_URL}${path}`) : null;
  const fetchReports = () => {
    setIsLoading(true);
    const token = localStorage.getItem('token'); 
    fetch(`${API_URL}/api/reports/allreports`, { headers: { 'Authorization': `Bearer ${token}` } })
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
                     imageUrl: getImageUrl(r.blobName),
                     lat: r.locLatitude ?? 0, lon: r.locLongitude ?? 0
                 }));
                 setReports(mapped);
             } else {
                 setReports([]);
             }
          })
          // .catch(err => setError(err.message))
          .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // --- LÓGICA DE EVALUACIÓN ---
  const handleEvaluate = async (status: 'Approved' | 'Rejected') => {
    if (!selectedReport) return;
    setIsProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/api/reports/evaluate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reportId: selectedReport.id,
          status: status
        })
      });

      if (response.ok) {
        toast.success(`Reporte ${status === 'Approved' ? 'Aprobado' : 'Rechazado'} correctamente.`);
        setSelectedReport(null); 
        fetchReports();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al evaluar reporte.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión con el servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 flex flex-col relative">
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center">
        <Link to="/admin-profile" className="absolute left-4 text-gray-500 p-2"><FaArrowLeft size={20} /></Link>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">Gestión Global</h1>
      </div>

      <main className="flex-grow p-4">
        <div className="space-y-4">
          {isLoading ? <p className="text-center text-gray-500">Cargando reportes...</p> : 
           reports.map(r => (
             <ReportCard 
                key={r.folio} 
                {...r} 
                onViewDetails={() => setSelectedReport(r)} 
             />
           ))}
        </div>
      </main>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50" onClick={() => setSelectedReport(null)}>
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Folio #{selectedReport.folio}</h2>
                <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600"><FaTimes size={20} /></button>
            </div>
            
            <div className="mb-4 bg-gray-100 h-40 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
               {selectedReport.imageUrl ? <img src={selectedReport.imageUrl} className="w-full h-full object-cover"/> : <FaImage className="text-gray-400" size={30}/>}
            </div>
            
            <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-green-700">{selectedReport.caso}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    selectedReport.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                    selectedReport.status === 'Aprobado' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {selectedReport.status}
                </span>
            </div>

            <p className="text-gray-600 text-sm mb-6 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                "{selectedReport.description}"
            </p>

            {/* --- ZONA DE EVALUACIÓN --- */}
            {selectedReport.status === 'Pendiente' && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <button 
                        onClick={() => handleEvaluate('Rejected')}
                        disabled={isProcessing}
                        className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-red-100 transition-colors"
                    >
                        <FaBan /> Rechazar
                    </button>
                    <button 
                        onClick={() => handleEvaluate('Approved')}
                        disabled={isProcessing}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-700 shadow-md transition-colors"
                    >
                        {isProcessing ? '...' : <><FaCheck /> Aprobar</>}
                    </button>
                </div>
            )}

            <button onClick={() => navigate('/maps', { state: { targetLat: selectedReport.lat, targetLng: selectedReport.lon } })} className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold flex justify-center gap-2 hover:bg-gray-900 transition-colors">
                <FaMapMarkedAlt/> Ver en Mapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminReportsView;