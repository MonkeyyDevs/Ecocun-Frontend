import React from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaBell,
  FaBullhorn,
  FaCogs,
  FaTrash,
} from "react-icons/fa";
import { api } from "../API/api";

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Ahora";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24)
    return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString("es-MX");
};

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  loading: boolean;
  error: string | null;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  setNotifications,
  loading,
  error,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "info":
        return <FaInfoCircle className="text-blue-500 text-xl" />;
      case "success":
        return <FaCheckCircle className="text-green-500 text-xl" />;
      case "failed":
        return <FaTimesCircle className="text-red-500 text-xl" />;
      case "reminder":
        return <FaBell className="text-orange-500 text-xl" />;
      case "campaign":
        return <FaBullhorn className="text-purple-500 text-xl" />;
      case "system":
        return <FaCogs className="text-gray-500 text-xl" />;
      default:
        return <FaInfoCircle className="text-blue-500 text-xl" />;
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
          {unreadCount > 0 && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {unreadCount} Nueva{unreadCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Lista */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <p>Cargando notificaciones...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 text-sm">
              <p>{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              <p>No tienes notificaciones nuevas.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border-b border-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex gap-3 group relative ${!notif.isRead ? "bg-green-50/30" : ""}`}
              >
                {/* Icono */}
                <div className="mt-1 flex-shrink-0">{getIcon(notif.type)}</div>

                {/* Contenido */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4
                      className={`text-sm font-bold ${!notif.isRead ? "text-gray-800" : "text-gray-600"}`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all duration-200"
                    title="Marcar como leída"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
          <Link
            to="/notificaciones"
            className="text-xs font-bold text-[#1a7f4c] hover:underline"
            onClick={onClose}
          >
            Ver todas las notificaciones
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
