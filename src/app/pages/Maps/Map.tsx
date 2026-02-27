import {api} from "../../API/api.ts";
import "leaflet/dist/leaflet.css";
// Asegúrate de que este archivo CSS tenga height: 100% o una altura fija
import styles from "./styles/Map.module.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import React, {useEffect, useState} from "react";
import {MapContainer, TileLayer, Marker, Popup} from "react-leaflet";
import L from "leaflet";
import {useLocation} from "react-router-dom";
// 1. Importamos Framer Motion
import {motion} from "framer-motion";
import {FaMapMarkedAlt} from "react-icons/fa";
import LoadingModal from "../../Components/LoadingModal.tsx";

const API_URL = import.meta.env.VITE_API_URL;

// Interfaces
interface Reporte {
    id: number;
    locLatitude: number;
    locLongitude: number;
    description: string;
    category: string;
    imageUrl?: string | null;
}

interface CentroAcopio {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    acceptedMaterials: string[];
    address: string;
    openingTime: string;
    closingTime: string;
}

// Icono para Centros de Acopio (Verde)
const centerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

const MapView: React.FC = () => {
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [centros] = useState<CentroAcopio[]>([]);
//  const [centros, setCentros] = useState<CentroAcopio[]>([]);
    const location = useLocation();

    // Posición del usuario (null = todavía no cargada)
    const [latitud, setLatitud] = useState<number | null>(null);
    const [longitud, setLongitud] = useState<number | null>(null);

    // Controla cuándo mostrar el modal
    const [showLocationLoader, setShowLocationLoader] = useState(false);

    const targetLat = location.state?.targetLat;
    const targetLng = location.state?.targetLng;

    // Delay de 1 segundo antes de mostrar el modal
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (latitud === null || longitud === null) {
                setShowLocationLoader(true);
            }
        }, 1000);

        return () => clearTimeout(timeout);
    }, [latitud, longitud]);

    const getImageUrl = (path?: string | null) => {
        if (!path) return null;
        return path.startsWith("http") ? path : `${API_URL}${path}`;
    };

    useEffect(() => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: markerIcon2x,
            iconUrl: markerIcon,
            shadowUrl: markerShadow,
        });

        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? {Authorization: `Bearer ${token}`} : {};

                const resReports = await api.get("/api/reports/allreports", {
                    params: {page: 1, limit: 100},
                    headers,
                });

                if (resReports.data?.data) setReportes(resReports.data.data);

            } catch (error) {
                console.error(error);
            }
        };

        // Obtener ubicación
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (p) => {
                    setLatitud(p.coords.latitude);
                    setLongitud(p.coords.longitude);
                },
                () => console.warn("Sin ubicación")
            );
        }

        fetchData();
    }, []);

    if (latitud === null || longitud === null) {
        return showLocationLoader ? <LoadingModal/> : null;
    }

    const actualPosition: [number, number] = [latitud, longitud];

    return (
        <div
            className="relative w-full min-h-screen bg-gradient-to-br from-[#ffffff] via-[#d1eddf] to-[#ffffff] py-6 px-4">
            {/* --- Título con Framer Motion --- */}
            <motion.div
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, ease: "easeOut"}}
                className="max-w-4xl mx-auto mb-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-green-100"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                        <FaMapMarkedAlt size={20}/>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 leading-tight">
                            Mapa Ecológico
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500">
                            Explora reportes y puntos ecológicos cercanos.
                        </p>
                    </div>
                </div>
            </motion.div>
            <div
                className="max-w-4xl mx-auto bg-white/95 rounded-2xl shadow-xl border border-green-100 overflow-hidden">
                <div className="h-[60vh] md:h-[70vh]">
                    <MapContainer
                        center={targetLat && targetLng ? [targetLat, targetLng] : actualPosition}
                        zoom={targetLat ? 16 : 12}
                        className={styles.mapContainer}
                        key={targetLat ? `${targetLat}-${targetLng}` : "default-map"}
                        style={{height: "100%", width: "100%", zIndex: 0}}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />
                        {/* Marcadores de Reportes */}
                        {reportes.map((r) => (
                            <Marker
                                key={`rep-${r.id}`}
                                position={[r.locLatitude, r.locLongitude]}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <h3 className="font-bold text-sm mb-1 text-red-600">
                                            Reporte: {r.id}
                                        </h3>
                                        <p className="text-xs mb-2 text-gray-600">{r.description}</p>
                                        {r.imageUrl && (
                                            <img
                                                src={getImageUrl(r.imageUrl) || ""}
                                                className="rounded-md w-32 h-20 object-cover"
                                                alt="Evidencia"
                                            />
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                        {/* Marcadores de Centros de Acopio */}
                        {centros.map((c) => (
                            <Marker
                                key={`center-${c.id}`}
                                position={[c.latitude, c.longitude]}
                                icon={centerIcon}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <h3 className="font-bold text-sm mb-1 text-green-700">
                                            {c.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">{c.address}</p>
                                        <p className="text-xs font-semibold mt-1">Materiales:</p>
                                        <p className="text-xs text-gray-600">
                                            {c.acceptedMaterials.join(", ")}
                                        </p>
                                        <p className="text-xs mt-1 text-blue-600">
                                            {c.openingTime} - {c.closingTime}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                 </div>
            </div>
            {/* --- Simbología debajo del mapa --- */}
            <div
                className="px-4 py-3 rounded-lg mt-4 mb-8 border-green-100 bg-white/95 flex flex-wrap gap-4 text-xs md:text-sm text-gray-700">
                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-sky-500"/>
                    <span>Reportes ciudadanos</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"/>
                    <span>Centros de acopio</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-purple-500"/>
                    <span>Tu ubicación aproximada</span>
                </div>
            </div>
        </div>
    );
};


export default MapView;