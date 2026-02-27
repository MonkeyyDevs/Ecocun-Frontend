import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaFileAlt, FaSignOutAlt, FaChevronRight, FaUserAlt } from "react-icons/fa";
import { GamificationSection } from "../../Components/GamificationSection";

const monkeyLogo = "/monkeydev_logo_blanco_slogan.png";
const API_URL = import.meta.env.VITE_API_URL;


const OptionsView: React.FC = () => {
  const navigate = useNavigate();
  const [puntos, setPuntos] = useState(0);
  const [monedas, setMonedas] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {

    const fetchGamificationData = async () => {
      if (loaded) return;
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const response = await fetch(`${API_URL}/api/gamification/user/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        if (!response.ok) {
          throw new Error("Error al obtener datos de gamificación");
        }
        const data = await response.json();
        setPuntos(data.totalPoints);
        setMonedas(data.coins);
        setLoaded(true);
      } catch (error) {
        console.error("Error al obtener datos de gamificación:", error);
      }
    };
    fetchGamificationData();
  }, [loaded]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/iniciar_sesion");
  };

  const userName = localStorage.getItem("userName") || "Ciudadano";

  return (
    <div className="min-h-screen flex flex-col pb-20 bg-gradient-to-br from-[#ffffff] via-[#d1eddf] to-[#ffffff]">
      <main className="p-4 flex-grow">

        {/* Tarjeta de Usuario */}
        <div className="flex items-center gap-4 mb-6 mt-4 px-2">
          <div className="bg-[#228B4B] rounded-full p-4 w-16 h-16 flex items-center justify-center shadow-lg shadow-green-200">
            <FaUser className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Hola, {userName}</h2>
            <p className="text-xs text-gray-500">Perfil Ciudadano</p>
          </div>
        </div>

       {/* <GamificationSection points={puntos} coins={monedas} /> */}

        {/* Menú Mis Reportes */}
        <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden border border-gray-100">
          <ul>
            <li>
              <Link to="/mis-reportes" className="flex items-center justify-between p-4 w-full text-left border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <FaFileAlt className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-gray-700 font-medium">Mis reportes</span>
                </div>
                <FaChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </li>
            {/* Mi Perfil*/}
            <li>
              <Link to="/profile-info" className="flex items-center justify-between p-4 w-full text-left border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <FaUserAlt className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Mi Perfil</span>
                </div>
                <FaChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </li>
          </ul>
        </div>
        {/* Botón Cerrar Sesión */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden border border-gray-100">
          <ul>
            <li>
              <button onClick={handleLogout} className="flex items-center justify-between p-4 w-full text-left hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2 rounded-lg group-hover:bg-red-100 transition-colors">
                    <FaSignOutAlt className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-red-500 font-medium">Cerrar Sesión</span>
                </div>
                <FaChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4 mt-auto opacity-80">
          <Link to="/terminos" className="text-xs text-gray-500 hover:text-gray-700 block">
            Términos y condiciones • Política de Privacidad
          </Link>
          <div className="flex justify-center">
            <img src={monkeyLogo} alt="MonkeyDevs" className="h-10 opacity-40 object-contain grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>

      </main>
    </div>
  );
};

export default OptionsView;