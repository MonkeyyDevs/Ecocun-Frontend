import { api } from "../../API/api.ts";
import "leaflet/dist/leaflet.css";
import styles from "./styles/Map.module.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaMapMarkedAlt } from "react-icons/fa";
import LoadingModal from "../../Components/LoadingModal.tsx";

const API_URL = import.meta.env.VITE_API_URL;

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

const centerIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35]
});

const basureroIcon = new L.Icon({
    iconUrl: "/BasClan.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const quemaIcon = new L.Icon({
    iconUrl: "/QueBas.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const drenajeIcon = new L.Icon({
    iconUrl: "/DrenaBas.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const derrameIcon = new L.Icon({
    iconUrl: "/SusPeligrosas.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const normalize = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "").trim();

const getReportIcon = (category: string) => {
    const normalized = normalize(category);

    if (normalized.includes("basurero")) return basureroIcon;
    if (normalized.includes("quema")) return quemaIcon;
    if (normalized.includes("drenaje")) return drenajeIcon;
    if (normalized.includes("derrame")) return derrameIcon;

    return basureroIcon;
};

const MapView: React.FC = () => {
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [centros, setCentros] = useState<CentroAcopio[]>([]);
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
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: markerIcon2x,
            iconUrl: markerIcon,
            shadowUrl: markerShadow,
        });

        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const resReports = await api.get("/api/reports/allreports", {
                    params: { page: 1, limit: 100 },
                    headers,
                });

                if (resReports.data?.data)
                    setReportes(resReports.data.data);

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
        <div className="relative w-full min-h-screen bg-gradient-to-br from-[#ffffff] via-[#d1eddf] to-[#ffffff] py-6 px-4">

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto mb-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-green-100"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                        <FaMapMarkedAlt size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">
                            Mapa Ecológico
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500">
                            Explora reportes y puntos ecológicos cercanos.
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="max-w-4xl mx-auto bg-white/95 rounded-2xl shadow-xl border border-green-100 overflow-hidden">
                <div className="h-[60vh] md:h-[70vh]">
                    <MapContainer
                        center={targetLat && targetLng ? [targetLat, targetLng] : actualPosition}
                        zoom={targetLat ? 16 : 12}
                        className={styles.mapContainer}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                        />

                        {/* REPORTES */}
                        {reportes.map((r) => (
                            <Marker
                                key={`rep-${r.id}`}
                                position={[r.locLatitude, r.locLongitude]}
                                icon={getReportIcon(r.category)}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <h3 className="font-bold text-sm mb-1 text-red-600">
                                            Reporte: {r.category}
                                        </h3>
                                        <p className="text-xs mb-2 text-gray-600">
                                            {r.description}
                                        </p>
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
                                        <p className="text-xs text-gray-500">
                                            {c.address}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                    </MapContainer>
                </div>
            </div>

            {/* LEYENDA */}
            <div className="px-4 py-3 rounded-lg mt-4 mb-8 bg-white/95 flex flex-wrap gap-4 text-xs md:text-sm text-gray-700 shadow">

                <div className="flex items-center gap-2">
                    <img src="/BasClan.png" className="w-5 h-5" />
                    Basurero clandestino
                </div>

                <div className="flex items-center gap-2">
                    <img src="/QueBas.png" className="w-5 h-5" />
                    Quema de basura
                </div>

                <div className="flex items-center gap-2">
                    <img src="/DrenaBas.png" className="w-5 h-5" />
                    Drenaje obstruido
                </div>

                <div className="flex items-center gap-2">
                    <img src="/SusPeligrosas.png" className="w-5 h-5" />
                    Derrame peligroso
                </div>

                <div className="flex items-center gap-2">
                    <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" className="w-5 h-5" />
                    Centro de acopio
                </div>

            </div>

        </div>
    );
};

export default MapView;