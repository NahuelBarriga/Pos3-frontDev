import { createContext, useContext, useState, useEffect } from "react";
import api from '../services/api';
import clienteDTO from "../models/clienteDTO";
//import {useCarrito} from "./carrito"; 
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();
const API_URL = `/auth`;



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado del usuario
  const [token, setToken] = useState(localStorage.getItem('token') || null); //usa el token del localstorage, si existe
  const [refreshToken, setRefreshToken] = useState(null); // We don't store refreshToken in localStorage anymore
  const [loading, setLoading] = useState(true);
  //const { limpiarCarrito } = useCarrito();
  
  useEffect(() => { //imprimir el usuario
    console.log("AuthContext - El usuario ha cambiado:", user ? { id: user.id, cargo: user.cargo, nombre: user.nombre } : null);
    console.log("AuthContext - loading state:", loading);
  }, [user, loading]);

  // Consolidated token handling from URL (both normal and OAuth callback)
  useEffect(() => {
    console.log("AuthContext - Initial useEffect - token from localStorage:", token);
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    console.log("AuthContext - token from URL:", tokenFromUrl);
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      localStorage.setItem('token', tokenFromUrl);
      
      // Clear URL parameters without changing the current page
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Only set loading to false if there's no token to validate
    if (!token && !tokenFromUrl) {
      console.log("AuthContext - No token found, setting loading to false");
      setLoading(false);
    } else {
      console.log("AuthContext - Token found, keeping loading true until validation");
    }
  }, []);

  useEffect(() => { //si hay token, obtengo los datos del usuario
    console.log("AuthContext - Token validation useEffect triggered, token:", token);
    if (token) {
      console.log("AuthContext - Token exists, fetching user data");
      api
        .get(`${API_URL}/me`)
        .then((res) => {
          console.log("AuthContext - User data fetched successfully:", res.data.user);
          setUser(res.data.user);
          localStorage.setItem('userId', res.data.user.id); // Guardar el ID del usuario en localStorage
        })
        .catch(error => {
          console.error("AuthContext - Error fetching user data:", error);
          if (error.response && error.response.status === 401) {
            // Token invalid or expired
            console.log("AuthContext - Token invalid, logging out");
            logout();
          }
        })
        .finally(() => {
          console.log("AuthContext - User validation complete, setting loading to false");
          setLoading(false);
        });
    } else {
      console.log("AuthContext - No token, setting loading to false");
      setLoading(false);
    }
  }, [token]);

  // Función para refrescar el token usando el refreshToken (via cookie)
  const refreshAccessToken = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return false;
      
      const res = await api.post(`${API_URL}/refresh`, { userId });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      return true;
    } catch (error) {
      console.error('Error al refrescar el token:', error);
      logout();
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post(`${API_URL}/login`, { email, password });
      setToken(res.data.token);
      setRefreshToken(res.data.refreshToken);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const signup = async (email, password, nombre, telefono, cumpleanos) => {
    try {
      const usuario = new clienteDTO({ email, password, nombre, telefono, cumpleanos });
      const res = await api.post(`${API_URL}/register`, usuario);
      console.log("res.data", res.data.user); //!sacar
      setToken(res.data.token);
      //setRefreshToken(res.data.refreshToken);
      localStorage.setItem('token', res.data.token);
      // localStorage.setItem('refreshToken',res.data.refreshToken);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const res = await api.post(`${API_URL}/logout`);
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem('userId'); 
      localStorage.removeItem('pedidoActual'); 
      localStorage.removeItem('mesas');
      //limpiarCarrito(); // Assuming this function clears the cart state
      // Use React Router navigation instead of window.location.href
      // The component using logout should handle navigation
      // window.location.href = "/";
      // localStorage.removeItem("refreshToken");
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  // Función para login con Google: redirige al endpoint del backend que inicia el flujo con Passport.
  const googleLogin = () => {
    const backendBase = import.meta.env.GOOGLE_CALLBACK_URL;
    window.location.href = 'https://pixelcafe-fye3hqena8gwergr.chilecentral-01.azurewebsites.net/api/auth/google/callback'; //!cambiar a env
  };

  // Función para solicitar restablecimiento de contraseña
  const forgotPassword = async (email) => {
    try {
      const res = await api.post(`${API_URL}/forgot-password`, { email });
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      loading,
      refreshAccessToken, 
      login, 
      signup, 
      logout, 
      googleLogin,
      forgotPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para acceder al contexto en cualquier parte de la app
export const useAuth = () => useContext(AuthContext);
