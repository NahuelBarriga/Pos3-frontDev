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
  const [loading, setLoading] = useState(true);
  
  

  // Consolidated token handling from URL (both normal and OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      localStorage.setItem('token', tokenFromUrl);
      
      // Clear URL parameters without changing the current page
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Only set loading to false if there's no token to validate
    if (!token && !tokenFromUrl) {
      setLoading(false);
    }
  }, []);

  useEffect(() => { //si hay token, obtengo los datos del usuario
    if (token) {
      api
        .get(`${API_URL}/me`)
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('userId', res.data.user.id); // Guardar el ID del usuario en localStorage
        })
        .catch(error => {
          if (error.response && error.response.status === 401) {
            // Token invalid or expired
            logout();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
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
      logout();
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post(`${API_URL}/login`, { email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email, password, nombre, telefono, cumpleanos) => {
    try {
      const usuario = new clienteDTO({ email, password, nombre, telefono, cumpleanos });
      const res = await api.post(`${API_URL}/register`, usuario);
      setToken(res.data.token);
      //setRefreshToken(res.data.refreshToken);
      localStorage.setItem('token', res.data.token);
      // localStorage.setItem('refreshToken',res.data.refreshToken);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
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
      throw error;
    }
  };

  // Función para login con Google: redirige al endpoint del backend que inicia el flujo con Passport.
  const googleLogin = () => {
    const backendBase = import.meta.env.VITE_GOOGLE_CALLBACK_URL;
    window.location.href = backendBase;
  };

  // Función para solicitar restablecimiento de contraseña
  const forgotPassword = async (email) => {
    try {
      const res = await api.post(`${API_URL}/forgot-password`, { email });
      return res.data;
    } catch (error) {
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
