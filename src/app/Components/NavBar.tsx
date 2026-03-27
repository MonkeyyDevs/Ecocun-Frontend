import { Link } from "react-router-dom";

const NavBar = () => {

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
        </div>
      </div>
    </nav>
  );
};

export default NavBar;