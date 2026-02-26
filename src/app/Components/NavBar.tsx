import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import NotificationPanel, { Notification } from "./NotificationPanel";
import { api } from "../API/api";

const NavBar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        const response = await api.get<Notification[]>("/api/notifications");
        setNotifications(response.data);
      } catch (err) {
        setError("Error al cargar las notificaciones");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <nav className="bg-[#228B4B] text-white px-4 py-4 shadow-md sticky top-0 z-50">
      <div className="container flex items-stretch justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
          <img src="/logo_blanco.png" alt="Ecocun" className="h-11 w-11" />
          <span className="text-xl font-bold tracking-wide">Ecocun</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Menú de navegación (PC) */}
          <ul className="hidden md:flex md:space-x-3">
            <li>
              <Link
                to="/"
                className="block px-2 py-2 hover:bg-white/10 rounded-lg transition-all"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                to="/ecoaporta"
                className="block px-2 py-2 hover:bg-white/10 rounded-lg transition-all"
              >
                EcoAporta
              </Link>
            </li>
            <li>
              <Link
                to="/Maps"
                className="block px-2 py-2 hover:bg-white/10 rounded-lg transition-all"
              >
                Mapa
              </Link>
            </li>
            <li>
              <Link
                to="/campaings"
                className="block px-2 py-2 hover:bg-white/10 rounded-lg transition-all"
              >
                Campañas
              </Link>
            </li>
            <li>
              <Link
                to="/opciones"
                className="block px-2 py-2 hover:bg-white/10 rounded-lg transition-all"
              >
                Opciones
              </Link>
            </li>
          </ul>

          <div className="flex items-center space-x-2">
            {/* Campana de Notificaciones - Visible en ambos */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center p-2 rounded-full hover:bg-white/10 transition-colors relative"
              >
                <FaBell className="w-6 h-6 text-white" />

                {/* Puntito rojo de aviso */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#228B4B] rounded-full animate-pulse"></span>
                )}
              </button>

              <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                setNotifications={setNotifications}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;