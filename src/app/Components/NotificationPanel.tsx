import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaLeaf, FaInfoCircle } from "react-icons/fa";

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "success", 
    title: "¡Reporte Aprobado!",
    message: "Tu reporte del 'Parque Kabah' ha sido validado. Recibiste +20 Puntos.",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: 2,
    type: "info", 
    title: "Nueva Campaña Disponible",
    message: "Únete a la limpieza de Playa Delfines este fin de semana.",
    time: "Hace 2 horas",
    read: false,
  },
  {
    id: 3,
    type: "error", 
    title: "Reporte Rechazado",
    message: "La foto de tu reporte #4023 no era clara. Intenta de nuevo.",
    time: "Ayer",
    read: true,
  },
];

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <FaCheckCircle className="text-green-500 text-xl" />;
      case "error": return <FaTimesCircle className="text-red-500 text-xl" />;
      case "info": return <FaLeaf className="text-[#1a7f4c] text-xl" />;
      default: return <FaInfoCircle className="text-blue-500 text-xl" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>

      {/*  Panel Flotante */}
      <div className="absolute top-16 right-4 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        
        {/* Cabecera */}
        <div className="bg-[#1a7f4c] p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-sm">Notificaciones</h3>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">3 Nuevas</span>
        </div>

        {/* Lista */}
        <div className="max-h-96 overflow-y-auto">
          {MOCK_NOTIFICATIONS.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <p>No tienes notificaciones nuevas.</p>
            </div>
          ) : (
            MOCK_NOTIFICATIONS.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-green-50/30' : ''}`}
              >
                {/* Icono */}
                <div className="mt-1 flex-shrink-0">
                  {getIcon(notif.type)}
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-bold ${!notif.read ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-gray-400">{notif.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
                
                {!notif.read && (
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
          <Link to="/notificaciones" className="text-xs font-bold text-[#1a7f4c] hover:underline" onClick={onClose}>
            Ver todas las notificaciones
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;