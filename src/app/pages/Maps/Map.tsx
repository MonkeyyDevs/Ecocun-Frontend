import { api } from "../../API/api.ts";
import "leaflet/dist/leaflet.css";
import styles from "./styles/Map.module.css";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { renderToStaticMarkup } from "react-dom/server";
import LoadingModal from "../../Components/LoadingModal.tsx";
import { 
    FaMapMarkedAlt, FaTrash, FaFire, FaWater, FaBiohazard, FaQuestion, FaRecycle, FaMapMarkerAlt 
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

interface Reporte {
    id: number;
    locLatitude: number;
    locLongitude: number;
    description: string;
    category: string | number;
    imageUrl?: string | null;
    createdAt?: string; 
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

const createReactIconMarker = (IconComponent: React.ElementType, colorClass: string) => {
    const iconHtml = renderToStaticMarkup(
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md ${colorClass}`}>
            <IconComponent size={18} />
        </div>
    );
    return L.divIcon({
        html: iconHtml,
        className: 'bg-transparent border-none',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
    });
};

const trashIcon = createReactIconMarker(FaTrash, "bg-green-500");
const fireIcon = createReactIconMarker(FaFire, "bg-orange-500");
const drainIcon = createReactIconMarker(FaWater, "bg-blue-500");
const biohazardIcon = createReactIconMarker(FaBiohazard, "bg-red-600");
const questionIcon = createReactIconMarker(FaQuestion, "bg-gray-400");
const centerIcon = createReactIconMarker(FaRecycle, "bg-green-700");
const getCategoryName = (category: string | number) => {
    const catStr = String(category);
    switch (catStr) {
        case "0": case "basureroClandestino": return "Basurero clandestino";
        case "1": case "quemaDeBasura": return "Quema de basura";
        case "2": case "drenajeObstruido": return "Drenaje obstruido";
        case "3": case "derrameDeSustanciasPeligrosas": return "Derrame peligroso";
        default: return "Otro reporte"; 
    }
};

const getIconByCategory = (category: string | number) => {
    const catStr = String(category);
    switch (catStr) {
        case "0": case "basureroClandestino": return trashIcon;
        case "1": case "quemaDeBasura": return fireIcon;
        case "2": case "drenajeObstruido": return drainIcon;
        case "3": case "derrameDeSustanciasPeligrosas": return biohazardIcon;
        default: return questionIcon;
    }
};

const getPopupIconColor = (category: string | number) => {
    const catStr = String(category);
    switch (catStr) {
        case "0": case "basureroClandestino": return "bg-green-500";
        case "1": case "quemaDeBasura": return "bg-orange-500";
        case "2": case "drenajeObstruido": return "bg-blue-500";
        case "3": case "derrameDeSustanciasPeligrosas": return "bg-red-600";
        default: return "bg-gray-400";
    }
};

const getPopupIcon = (category: string | number) => {
    const catStr = String(category);
    switch (catStr) {
        case "0": case "basureroClandestino": return <FaTrash size={14} />;
        case "1": case "quemaDeBasura": return <FaFire size={14} />;
        case "2": case "drenajeObstruido": return <FaWater size={14} />;
        case "3": case "derrameDeSustanciasPeligrosas": return <FaBiohazard size={14} />;
        default: return <FaQuestion size={14} />;
    }
}

const MapView: React.FC = () => {
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [centros] = useState<CentroAcopio[]>([]); 
    const location = useLocation();
    const [latitud, setLatitud] = useState<number | null>(null);
    const [longitud, setLongitud] = useState<number | null>(null);
    const [showLocationLoader, setShowLocationLoader] = useState(false);
    
    const targetLat = location.state?.targetLat;
    const targetLng = location.state?.targetLng;

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
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                // --- LLAMADA REAL A TU API ---
                const resReports = await api.get("/api/reports/allreports", {
                    params: { page: 1, limit: 100 },
                    headers,
                });
                if (resReports.data?.data) {
                    setReportes(resReports.data.data);
                }

            } catch (error) {
                console.error(error);
            }
        };

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
        return showLocationLoader ? <LoadingModal /> : null;
    }

    const actualPosition: [number, number] = [latitud, longitud];

    return (
        <div className="relative w-full min-h-screen bg-gray-100">
            <div className="absolute top-4 left-4 right-4 z-[400] pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-xl mx-auto bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/50 flex items-center gap-3 pointer-events-auto"
                >
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                        <FaMapMarkedAlt size={18} />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-gray-800 leading-tight">
                            Mapa Ecológico
                        </h1>
                        <p className="text-[10px] text-gray-500">
                            Explora reportes y puntos de interés.
                        </p>
                    </div>
                </motion.div>
            </div>

            <MapContainer
                center={targetLat && targetLng ? [targetLat, targetLng] : actualPosition}
                zoom={targetLat ? 16 : 13}
                className={styles.mapContainer}
                key={targetLat ? `${targetLat}-${targetLng}` : "default-map"}
                style={{ height: "100vh", width: "100%", zIndex: 0 }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {reportes.map((r) => (
                    <Marker
                        key={`rep-${r.id}`}
                        position={[r.locLatitude, r.locLongitude]}
                        icon={getIconByCategory(r.category)} 
                    >
                        <Popup>
                            <div className="p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 ${getPopupIconColor(r.category)}`}>
                                         {getPopupIcon(r.category)}
                                    </div>
                                    <h3 className="font-bold text-base text-gray-800 leading-tight line-clamp-1">
                                        {getCategoryName(r.category)}
                                    </h3>
                                </div>
                                
                                {/* Descripción */}
                                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                                    {r.description || "Sin descripción adicional."}
                                </p>
                                
                                {/* Imagen */}
                                {r.imageUrl ? (
                                    <img
                                        src={getImageUrl(r.imageUrl) || ""}
                                        className="rounded-xl w-full h-36 object-cover border border-gray-100 shadow-sm"
                                        alt="Evidencia"
                                    />
                                ) : (
                                    <div className="h-24 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                                        <FaMapMarkerAlt size={16} className="opacity-50"/>
                                        Sin evidencia
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
                
                {centros.map((c) => (
                    <Marker
                        key={`center-${c.id}`}
                        position={[c.latitude, c.longitude]}
                        icon={centerIcon}
                    >
                        <Popup>
                            <div className="p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm bg-green-700 shrink-0">
                                         <FaRecycle size={14} />
                                    </div>
                                    <h3 className="font-bold text-base text-gray-800 leading-tight line-clamp-1">{c.name}</h3>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs text-gray-500 flex items-start gap-2">
                                        <FaMapMarkerAlt className="shrink-0 mt-0.5 text-green-700" size={12} /> 
                                        {c.address}
                                    </p>
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                        <p className="text-xs font-bold text-green-800 mb-1">Recibe:</p>
                                        <p className="text-xs text-green-700 leading-relaxed">{c.acceptedMaterials.join(", ")}</p>
                                    </div>
                                    <p className="text-xs text-center text-gray-500 font-medium bg-gray-100 py-1.5 rounded-full">
                                        ⏰ {c.openingTime} - {c.closingTime}
                                    </p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <div className="fixed bottom-20 left-0 right-0 p-4 z-[400] pointer-events-none">
                <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-4 pointer-events-auto">
                    <h4 className="text-[11px] font-bold text-gray-800 mb-3 text-center uppercase tracking-widest border-b border-gray-100 pb-2">
                        Tipos de Reportes
                    </h4>
                    
                    <div className="flex flex-wrap justify-around items-center gap-2">
                        <LeyendaItem icon={FaTrash} color="bg-green-500" label="Basurero" />
                        <LeyendaItem icon={FaFire} color="bg-orange-500" label="Quema" />
                        <LeyendaItem icon={FaWater} color="bg-blue-500" label="Drenaje" />
                        <LeyendaItem icon={FaBiohazard} color="bg-red-600" label="Peligro" />
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <LeyendaItem icon={FaRecycle} color="bg-green-700" label="Acopio" />
                    </div>
                </div>
            </div>

        </div>
    );
};

const LeyendaItem = ({ icon: Icon, color, label }: { icon: React.ElementType, color: string, label: string }) => (
    <div className="flex flex-col items-center min-w-[50px]">
        <div className={`w-7 h-7 rounded-full ${color} flex items-center justify-center text-white shadow-sm mb-1`}>
            <Icon size={12} />
        </div>
        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-wider">{label}</span>
    </div>
);

export default MapView;