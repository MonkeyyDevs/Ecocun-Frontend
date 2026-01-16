import { Outlet } from "react-router-dom";
import NavBar from "../Components/NavBar";
import BottomNavBar from "../Components/BottomNavBar";
import { Toaster } from "react-hot-toast";

export default function Layout() {
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900 ">
      <nav className="sticky top-0 z-40 border-b border-gray-200/70 bg-white/80 backdrop-blur">
        <NavBar></NavBar>
      </nav>
      {/* CONTENIDO */}
      <main id="content" className="min-h-[calc(100dvh-3.5rem)]">
        <div className="mx-auto">
          <Outlet />
          <Toaster
            position="bottom-center"
            reverseOrder={false}
            toastOptions={{
              style: {
                fontSize: "18px",
                padding: "20px", 
                borderRadius: "10px",
                margin: "100px",
              },
              success: {
                style: {
                  background: "#16a34a", 
                  color: "white",
                },
              },
              error: {
                style: {
                  background: "#dc2626", 
                  color: "white",
                },
              },
            }}
          />
        </div>
      </main>
      {/* FOOTER */}
      <footer className="border-t border-[#848484] bg-white py-3 text-sm text-center text-black">
        <BottomNavBar/>
      </footer>
    </div>
  );
}
