import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaTimes, FaImage, FaMapMarkedAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import ReportCard, { ReportCardProps } from '../../Components/ReportCard/ReportCard';
import { mapCategoryToString, mapStatusToString } from '../../utils/enumTranslators';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_OPTIONS = [
  { value: 'Nuevo',      label: 'Nuevo',      color: 'bg-blue-100 text-blue-700 border-blue-300'       },
  { value: 'En proceso', label: 'En Proceso',  color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'Resuelto',   label: 'Resuelto',    color: 'bg-green-100 text-green-700 border-green-300'    },
] as const;

type ReportStatus = typeof STATUS_OPTIONS[number]['value'];

interface ReportFromApi {
  id: number;
  userId: number;
  locLatitude: number;
  locLongitude: number;
  description: string;
  category: number | string;
  status: number | string;
  createdAt: string;
  imageUrl?: string;
}

interface ExtendedReport extends ReportCardProps {
  id: number;
  rawStatus: number | string;
  lat: number;
  lon: number;
  [key: string]: any;
}

const mapRawToStatus = (raw: number | string): ReportStatus => {
  const map: Record<string, ReportStatus> = {
    'nuevo': 'Nuevo',
    '0': 'Nuevo',
    'en proceso': 'En proceso',
    'inprogress': 'En proceso',
    '1': 'En proceso',
    'resuelto': 'Resuelto',
    'resolved': 'Resuelto',
    '2': 'Resuelto',
  };
  return map[String(raw).toLowerCase()] ?? 'Nuevo';
};

const AdminReportsView: React.FC = () => {
  const [reports, setReports] = useState<ExtendedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ExtendedReport | null>(null);
  const [pendingStatus, setPendingStatus] = useState<ReportStatus>('Nuevo');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const getImageUrl = (path?: string) =>
    path ? (path.startsWith('http') ? path : `${API_URL}${path}`) : null;

  const fetchReports = () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/reports/allreports?page=1&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          const mapped = res.data.map((r: ReportFromApi) => ({
            id: r.id,
            rawStatus: r.status,
            folio: r.id.toString().padStart(4, '0'),
            ubicacion: `${r.locLatitude.toFixed(4)}, ${r.locLongitude.toFixed(4)}`,
            caso: mapCategoryToString(r.category),
            status: mapStatusToString(r.status),
            description: r.description,
            imageUrl: getImageUrl(r.imageUrl),
            lat: r.locLatitude,
            lon: r.locLongitude,
          }));
          setReports(mapped);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenModal = (report: ExtendedReport) => {
    setSelectedReport(report);
    setPendingStatus(mapRawToStatus(report.rawStatus));
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport) return;
    setIsProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/api/reporte/cambiar-estado/${selectedReport.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nuevoEstado: pendingStatus }),
      });

      if (response.ok) {
        const data = await response.json(); // { response: "succesfull", newState: "..." }
        toast.success(`Estado actualizado a "${data.newState}".`);
        setSelectedReport(null);
        fetchReports();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error al actualizar el estado.');
      }
    } catch {
      toast.error('Error de conexión con el servidor.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (rawStatus: number | string) => {
    const mapped = mapRawToStatus(rawStatus);
    return STATUS_OPTIONS.find(s => s.value === mapped);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 flex flex-col relative">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center">
        <Link to="/admin-profile" className="absolute left-4 text-gray-500 p-2">
          <FaArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">Gestión Global</h1>
      </div>

      {/* Lista de reportes */}
      <main className="flex-grow p-4">
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-center text-gray-500">Cargando reportes...</p>
          ) : reports.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">No hay reportes disponibles.</p>
          ) : (
            reports.map(r => (
              <ReportCard
                key={r.folio}
                {...r}
                onViewDetails={() => handleOpenModal(r)}
              />
            ))
          )}
        </div>
      </main>

      {/* Modal de detalle */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Cabecera */}
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Folio #{selectedReport.folio}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Imagen */}
            <div className="mb-4 bg-gray-100 h-40 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
              {selectedReport.imageUrl ? (
                <img
                  src={selectedReport.imageUrl}
                  className="w-full h-full object-cover"
                  alt="evidencia"
                />
              ) : (
                <FaImage className="text-gray-400" size={30} />
              )}
            </div>

            {/* Categoría + badge estado actual */}
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-green-700">{selectedReport.caso}</p>
              {(() => {
                const badge = getStatusBadge(selectedReport.rawStatus);
                return (
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${badge?.color}`}>
                    {badge?.label}
                  </span>
                );
              })()}
            </div>

            {/* Descripción */}
            <p className="text-gray-600 text-sm mb-5 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
              "{selectedReport.description}"
            </p>

            {/* Selector de estado */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Cambiar estado
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPendingStatus(opt.value)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all ${
                    pendingStatus === opt.value
                      ? `${opt.color} border-current shadow-sm scale-105`
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Botón guardar */}
            <button
              onClick={handleUpdateStatus}
              disabled={isProcessing || pendingStatus === mapRawToStatus(selectedReport.rawStatus)}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold mb-3 hover:bg-green-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Guardando...' : 'Guardar cambios'}
            </button>

            {/* Ver en mapa */}
            <button
              onClick={() =>
                navigate('/maps', {
                  state: { targetLat: selectedReport.lat, targetLng: selectedReport.lon },
                })
              }
              className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold flex justify-center gap-2 hover:bg-gray-900 transition-colors"
            >
              <FaMapMarkedAlt /> Ver en Mapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsView;