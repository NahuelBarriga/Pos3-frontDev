import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import { CarritoProvider } from "./context/carritoContext";
import { PedidosProvider } from "./context/pedidosContext";
import { NotificationProvider } from "./context/NotificacionContext";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/navBar";
import RenderMenu from "./pages/menu";
import RenderLogin from "./pages/login";
import RenderCarrito from "./pages/carrito";
import RenderCaja from "./pages/caja";
import RenderPedidos from "./pages/pedidos";
import RenderUsuarios from "./pages/users";
import RenderReservas from "./pages/reservas";
import RenderStats from "./pages/stats";
import RenderLayout from "./pages/layout";
import RenderConfig from "./pages/config";
import RenderNonAuthorized from "./context/nonAuthorized";
import RenderComanda from "./pages/comanda"; // Import the new component
import "./App.css";

import PrivateRoute from "./components/privateRoute";
import { useState } from "react";

function App() {

  // Puedes usar context o props drilling para actualizar estos estados desde sockets
  return (
    <div className="w-full min-h-screen bg-gray-100">
      <AuthProvider>
        <NotificationProvider>
          <CarritoProvider>
            <PedidosProvider>
              <Router>
                <Navbar
                  newPedidoActivity={newPedidoActivity}
                  newReservaActivity={newReservaActivity}
                  newLayoutActivity={newLayoutActivity}
                />
                <Routes>
                  <Route path="/" element={<RenderMenu />} />
                  <Route path="/login" element={<RenderLogin />} />
                  <Route path="/carrito" element={<RenderCarrito />} />
                  <Route path="/config" element={<RenderConfig />} />

                  <Route
                    path="/caja"
                    element={
                      <PrivateRoute
                        allowedRoles={["admin", "cajero", "encargado"]}
                      >
                        <RenderCaja />
                      </PrivateRoute>
                    }
                  />
                  {/* <Route path="/mesas" element={
              <PrivateRoute  allowedRoles={['admin', 'cajero', 'encargado', 'mozo']}> 
                <RenderMesasLayout />
              </PrivateRoute> 
            } /> */}
                  <Route
                    path="/pedidos"
                    element={
                      <PrivateRoute allowedRoles={["admin", "encargado"]}>
                        <RenderPedidos />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <PrivateRoute allowedRoles={["admin"]}>
                        <RenderUsuarios />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/reservas"
                    element={
                      <PrivateRoute
                        allowedRoles={["admin", "encargado", "mozo"]}
                      >
                        <RenderReservas />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/stats"
                    element={
                      <PrivateRoute allowedRoles={["admin"]}>
                        <RenderStats />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/layout"
                    element={
                      <PrivateRoute
                        allowedRoles={["admin", "cajero", "encargado", "mozo"]}
                      >
                        <RenderLayout />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/comanda"
                    element={
                      <PrivateRoute
                        allowedRoles={["admin", "encargado", "mozo"]}
                      >
                        <RenderComanda />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/nonAuthorized"
                    element={<RenderNonAuthorized />}
                  />
                  <Route path="*" element={<RenderNonAuthorized />} />
                </Routes>
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
              </Router>
            </PedidosProvider>
          </CarritoProvider>
        </NotificationProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
