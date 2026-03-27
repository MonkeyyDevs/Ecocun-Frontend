import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

export interface ReportCardProps {
  folio: string;
  ubicacion: string;
  caso: string;
  status: string;
  description?: string;
  imageUrl?: string;
  lat: number;
  lon: number;
  onViewDetails?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  folio, ubicacion, caso, status, onViewDetails
}) => {


  const STATUS_OPTIONS = [
  { value: 0,      label: 'Nuevo',          color: 'bg-blue-100 text-blue-700 border-blue-300'       },
  { value: 1,      label: 'Bajo Revision',  color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 2,      label: 'Pendiente',      color: 'bg-orange-400 text-white border-orange-300'    },
  { value: 3,      label: 'En Proceso',     color: 'bg-blue-500 text-white border-blue-300' },
  { value: 4,      label: 'Resuelto',       color: 'bg-green-600 text-white border-green-300'       },
  { value: 5,      label: 'Cerrado',        color: 'bg-gray-600 text-white border-gray-300'    },
  { value: 6,      label: 'Rechazado',      color: 'bg-red-700 text-white border-red-300'    }
] as const;
  // Colores estilo "Badge" de tu imagen
  const getStatusColor = (s: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.label === s);
    return statusOption ? statusOption.color : 'bg-gray-400';
  };

  return (
    // FONDO GRIS CLARO y BORDE REDONDEADO
    <div className="bg-gray-100 rounded-2xl p-5 mb-4 relative shadow-sm">

      {/* Badge Flotante */}
      <span className={`${getStatusColor(status)} text-xs font-bold px-3 py-1 rounded-full absolute top-5 right-5`}>
        {status}
      </span>

      {/* Datos */}
      <div className="mb-1">
        <h3 className="text-xl font-bold text-gray-900">Folio: {folio}</h3>
      </div>

      <div className="text-sm text-gray-800 mb-1">
        <span className="font-bold">Ubicacion:</span> {ubicacion}
      </div>

      <div className="text-sm text-gray-800 mb-4">
        <span className="font-bold">Caso:</span> {caso}
      </div>

      {/* Link Ver Detalles */}
      <div className="flex justify-end">
        <button
          onClick={onViewDetails}
          className="text-green-600 font-bold text-sm flex items-center gap-1 hover:underline"
        >
          Ver detalles <FaChevronRight className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default ReportCard;