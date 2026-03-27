import {useState} from "react";
import {api} from "../API/api.ts";
import {Link, useNavigate} from "react-router-dom";
import {FaRegEyeSlash} from "react-icons/fa";
import {IoEyeSharp} from "react-icons/io5";
import toast from "react-hot-toast";

const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
        return null;
    }
};

const LoginWindow = () => {
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [Loading, setLoading] = useState(false);


    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const datosReporte = { Email, Password };

        try {
            const response = await api.post("/api/auth/logIn", datosReporte);
            const { message, token } = response.data;

            localStorage.setItem("token", token);

            const decodedToken = parseJwt(token);
            const userRole =
                decodedToken["role"] ||
                decodedToken[
                    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                    ];
            localStorage.setItem("role", userRole);

            const userName = decodedToken["unique_name"];
            localStorage.setItem("userName", userName);

            const userId = decodedToken["nameid"];
            localStorage.setItem("userId", userId);

            console.log("Login exitoso:", message);

     
            toast.success("Inicio de sesión exitoso S");

            // Redirección con un pequeño delay
            setTimeout(() => {
                if (userRole === "Admin") {
                    navigate("/admin-profile");
                } else {
                    navigate("/");
                }
            }, 600);
        } catch (error) {
            console.error("Error al iniciar sesión:", error);

            toast.error("Credenciales incorrectas o error en el servidor.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
            <img src="/logo_verde.png" alt="Ecocun Logo" className="h-24 mb-4"/>

            <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Correo
                        </label>
                        <input
                            type="email"
                            id="e\\Email"
                            placeholder="ejemplo@ejemplo.com"
                            value={Email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-600 focus:border-green-600"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="Password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Contraseña
                        </label>

                        <div className="mt-1 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="Password"
                                placeholder={"Escribe tu contraseña"}
                                value={Password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-4 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-600 focus:border-green-600 outline-none"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-green-700"
                            >
                                {showPassword ? <FaRegEyeSlash size={20} /> : <IoEyeSharp size={20} />}
                            </button>
                        </div>
                    </div>


                    <button
                        type="submit"
                        disabled={Loading}
                        className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition-colors font-medium"
                    >
                        {Loading ? "Cargando..." : "Comenzar"}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <Link
                        to="/recuperar"
                        className="text-sm text-green-700 hover:underline"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
                <div className="mt-4 text-center">
                    <Link
                        to="/registro"
                        className="text-sm text-green-700 hover:underline"
                    >
                        Regístrate
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginWindow;
