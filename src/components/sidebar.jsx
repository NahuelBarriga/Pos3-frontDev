import { Link } from "react-router-dom";
import { useAuth } from '../context/authContext';
import { useState, useEffect } from "react";
import CoffeePromotionCard from './sideBar/tarjetaPromocion'
import ProximaReservaCard from './sideBar/proximaReserva';
import PedidoCard from './sideBar/pedidoCard';
import Modal from "./modal";
import FormularioReserva from "./formularioReserva";

// CSS personalizado para ocultar scrollbar
const scrollbarHideStyle = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;

function Sidebar({ isOpen, onClose, newPedidoActivity, newReservaActivity, newLayoutActivity }) {
  const { user, logout } = useAuth();
  const [mostrarModal, setMostrarModal] = useState(false);

  // Navigation links organized by user role
  const commonLinks = [
    { to: "/", label: "☕ Menú" },
    {
      label: "📜 Reservar", onClick: () => {
        if (user) { 
          setMostrarModal(true);
          onClose();
        } else { 
          window.location.href = "/login";
        }
      }
    }
  ];

  const staffLinks = [
    { to: "/pedidos", label: "📝 Pedidos" },
    { to: "/reservas", label: "📅 Reservas" },
    { to: "/layout", label: "🪑 Local" },
    { to: '/comanda', label: '🍴 Comanda' }
  ];

  const cashierLinks = [
    { to: "/caja", label: "💰 Caja" }
  ];

  const adminLinks = [
    { to: "/users", label: "👥 Usuarios" },
    { to: "/stats", label: "📊 Estadísticas" }
  ];

  const footerLinks = [
    { to: "/config", label: "⚙️ Configuración" }
  ];

  // Helper function to render navigation links
  const renderNavLink = (link, index) => {
    let showDot = false;
    if (link.to === "/pedidos" && newPedidoActivity) showDot = true;
    if (link.to === "/reservas" && newReservaActivity) showDot = true;
    if (link.to === "/layout" && newLayoutActivity) showDot = true;

    return (
      <div className="relative w-full" key={index}>
        {link.to ? (
          <Link
            to={link.to}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 font-medium"
            onClick={onClose}
          >
            <span className="text-base">{link.label}</span>
          </Link>
        ) : (
          <button
            onClick={link.onClick}
            className="flex items-center w-full px-4 py-3 text-left text-gray-700 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200 font-medium"
          >
            <span className="text-base">{link.label}</span>
          </button>
        )}
        {showDot && (
          <span className="absolute top-3 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
        )}
      </div>
    );
  };

  // Hook to track animation state
  const [isAnimating, setIsAnimating] = useState(false);

  // This function would be replaced with your actual implementation
  // that gets the coffee count from your database/state
  const getCoffeeCount = () => {
    // Replace this with your actual implementation
    return 5; // Example: user has purchased 3 coffees
  };

  const totalNeeded = 5;
  const coffeesPurchased = getCoffeeCount();

  // Trigger a small animation when the component renders
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Check user roles
  const isStaff = user?.cargo === "encargado" || user?.cargo === "admin" || user?.cargo === "mozo";
  const isCashier = user?.cargo === "encargado" || user?.cargo === "admin" || user?.cargo === "cajero";
  const isAdmin = user?.cargo === "admin";

  return (
    <>
      {/* Inyectar CSS personalizado */}
      <style>{scrollbarHideStyle}</style>

      {/* Backdrop overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out z-50 flex flex-col`}
      >
        {/* Header */}
        <div
          className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100 cursor-pointer"
          onClick={() => { !user ? window.location.href = "/login" : window.location.href = "/config"}}
        >
          <div className="flex flex-col space-y-1">
            <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Bienvenido!</h2>
            <h2 className="text-xl font-bold text-orange-600">{user?.nombre || "Buscando el inicio de sesion?"}</h2>
            <span className="text-orange-800"> {!user? "Click aqui!" : ""}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <nav className="px-4 py-6 space-y-1">
            {/* Common Links Section */}
            <div className="space-y-1">
              {commonLinks.map((link, index) => renderNavLink(link, `common-${index}`))}
            </div>

            {/* Staff Links Section */}
            {isStaff && (
              <>
                <div className="pt-3 pb-1 px-3">
                  <div className="h-px bg-gray-200"></div>
                </div>
                {staffLinks.map((link, index) => renderNavLink(link, `staff-${index}`))}
              </>
            )}

            {/* Admin Links Section */}
            {isAdmin && (
              <>
                <div className="pt-3 pb-1 px-3">
                  <div className="h-px bg-gray-200"></div>
                </div>
                {adminLinks.map((link, index) => renderNavLink(link, `admin-${index}`))}
              </>
            )}

            {/* Cashier Links Section */}
            {isCashier && (
              <>
                <div className="pt-3 pb-1 px-3">
                  <div className="h-px bg-gray-200"></div>
                </div>
                {cashierLinks.map((link, index) => renderNavLink(link, `cash-${index}`))}
              </>
            )}

            {/* Cliente Cards Section */}
            {user?.cargo === 'cliente' && (
              <>
                <div className="pt-3 pb-2 px-3">
                  <div className="h-px bg-gray-200"></div>
                </div>
                <div className="space-y-3">
                  <PedidoCard />
                  <ProximaReservaCard />
                  {/* <CoffeePromotionCard /> */}
                </div>
              </>
            )}
          </nav>
        </div>

        {/* Footer Links */}
        {user && (
          <div className="border-t border-gray-200 px-4 py-4 bg-gray-50">
            <div className="space-y-1">
              {footerLinks.map((link, index) => renderNavLink(link, `footer-${index}`))}
            </div>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {mostrarModal && (
        <Modal
          titulo={'Realizar una reserva'}
          onClose={() => setMostrarModal(false)}>
          <FormularioReserva onClose={() => setMostrarModal(false)} />
        </Modal>
      )}
    </>
  );
}

export default Sidebar;