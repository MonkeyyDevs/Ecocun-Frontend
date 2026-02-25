import React, { useState } from "react";
import { FaCheck, FaTimes, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";
import { api } from "../API/api.ts";

interface Report {
    id: number;
    description: string;
    category: string;
    imageUrl: string;
    status: string;
    userName: string;
    location: string;
    date: string;
}

interface AdminReportCardProps {
    report: Report;
    onEvaluated: (id: number) => void;
}

const AdminReportCard: React.FC<AdminReportCardProps> = ({ report, onEvaluated }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleEvaluate = async (status: "Approved" | "Rejected") => {
        setIsProcessing(true);
        try {
            // gillen Asegúrate que este endpoint exista
            await api.post("/api/reports/evaluate", {
                reportId: report.id,
                status: status,
            });

            if (status === "Approved") {
                toast.success(`Reporte #${report.id} Aprobado. ¡Puntos enviados!`);
            } else {
                toast.error(`Reporte #${report.id} Rechazado.`);
            }

            onEvaluated(report.id);

        } catch (error) {
            console.error(error);
            toast.error("Error al procesar la solicitud.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col md:flex-row mb-4">
            {/* Foto */}
            <div className="md:w-1/3 h-48 md:h-auto relative">
                <img
                    src={report.imageUrl || "https://via.placeholder.com/300?text=Sin+Evidencia"}
                    alt="Evidencia"
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                    #{report.id}
                </div>
            </div>

            {/* Info */}
            <div className="p-5 md:w-2/3 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-800">{report.category}</h3>
                        <span className="text-xs text-gray-400">{report.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2 mb-4 line-clamp-2">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1"><FaUser className="text-green-600" /><span>{report.userName}</span></div>
                        <div className="flex items-center gap-1"><FaMapMarkerAlt className="text-blue-500" /><span className="truncate max-w-[150px]">{report.location}</span></div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 mt-2">
                    <button onClick={() => handleEvaluate("Rejected")} disabled={isProcessing} className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors">
                        <FaTimes /> Rechazar
                    </button>
                    <button onClick={() => handleEvaluate("Approved")} disabled={isProcessing} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium text-sm shadow-sm transition-colors">
                        {isProcessing ? "..." : <><FaCheck /> Aprobar</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminReportCard;