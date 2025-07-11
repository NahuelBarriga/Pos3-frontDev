import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import {
  EyeIcon,
  EyeOffIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/utils/LoadingScreen";

const LoginSignup = () => {
  const { user, login, signup, googleLogin, forgotPassword } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [invalidAuth, setInvalidAuth] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    cumpleanos: "",
    telefono: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    telefono: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      nombre: "",
      telefono: "",
    };

    // Validación de email
    if (!form.email.includes("@") || !form.email.includes(".")) {
      newErrors.email = "Ingresa un email válido";
      isValid = false;
    }

    // Validación de contraseña
    if (form.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      isValid = false;
    }

    // Validación de confirmación de contraseña
    if (isSignup && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      isValid = false;
    }

    // Validación de nombre (solo para registro)
    if (isSignup && form.nombre.trim() === "") {
      newErrors.nombre = "Ingresa tu nombre completo";
      isValid = false;
    }

    // Validación de teléfono (solo para registro)
    if (isSignup && !/^\d{10}$/.test(form.telefono)) {
      newErrors.telefono = "Ingresa un número de teléfono válido de 10 dígitos";
      isValid = false;
    }

    setValidationErrors(newErrors);
    return isValid;
  };

  // Validación de teléfono cuando el usuario deja de escribir
  const validatePhoneOnBlur = (e) => {
    if (e.target.name === "telefono") {
      if (!/^\d{10}$/.test(e.target.value) && e.target.value !== "") {
        setValidationErrors({
          ...validationErrors,
          telefono: "Ingresa un número de teléfono válido de 10 dígitos",
        });
      } else {
        setValidationErrors({
          ...validationErrors,
          telefono: "",
        });
      }
    }
  };

  // useEffect que redirige al home ("/") cuando se verifica el token y se obtiene el usuario
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Limpiar mensaje de error cuando el usuario comienza a escribir
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }

    // Validación en tiempo real para confirmación de contraseña
    if (name === "confirmPassword" && isSignup) {
      if (value !== form.password && value !== "") {
        setValidationErrors({
          ...validationErrors,
          confirmPassword: "Las contraseñas no coinciden",
        });
      } else {
        setValidationErrors({
          ...validationErrors,
          confirmPassword: "",
        });
      }
    }

    // Validación en tiempo real cuando cambia la contraseña principal
    if (name === "password" && isSignup && form.confirmPassword !== "") {
      if (value !== form.confirmPassword) {
        setValidationErrors({
          ...validationErrors,
          confirmPassword: "Las contraseñas no coinciden",
        });
      } else {
        setValidationErrors({
          ...validationErrors,
          confirmPassword: "",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (isSignup) {
        await signup(
          form.email,
          form.password,
          form.nombre,
          form.telefono,
          form.cumpleanos
        );
      } else {
        await login(form.email, form.password);
      }
    } catch (error) {
      if (error.status === 401) setError("Acceso inválido");
      else setError("Ha ocurrido un error durante la autenticación");
      setInvalidAuth(true);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setValidationErrors({
      email: "",
      password: "",
      confirmPassword: "",
      nombre: "",
      telefono: "",
    });
    setForm({
      email: "",
      password: "",
      confirmPassword: "",
      nombre: "",
      cumpleanos: "",
      telefono: "",
    });
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError("Por favor ingresa tu email para restablecer la contraseña");
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(form.email);
      setError(""); // Clear any previous errors
      // Show success message - you might want to use a different state for success messages
      alert(
        "Se ha enviado un enlace de restablecimiento a tu correo electrónico"
      );
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message ||
          "Error al enviar el correo de restablecimiento"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        title="Iniciando sesión"
        subtitle="Verificando credenciales..."
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            {isSignup ? "Crear una cuenta" : "Iniciar sesión"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignup
              ? "Regístrate para acceder a tu cuenta"
              : "Bienvenido de nuevo"}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mt-4">
            <div className="flex">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {isSignup && (
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre completo
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="nombre"
                    type="text"
                    autoComplete="name"
                    value={form.nombre}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border bg-transparent border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Nombre y Apellido"
                  />
                </div>
                {validationErrors.nombre && (
                  <p className="mt-1 text-xs text-red-600">
                    {validationErrors.nombre}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="telefono"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Teléfono
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    autoComplete="tel"
                    value={form.telefono}
                    onChange={handleChange}
                    onBlur={validatePhoneOnBlur}
                    className="block w-full pl-10 pr-3 py-2 border bg-transparent border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="2234567890"
                  />
                </div>
                {validationErrors.telefono && (
                  <p className="mt-1 text-xs text-red-600">
                    {validationErrors.telefono}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="cumpleanos"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fecha de nacimiento
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="cumpleanos"
                    name="cumpleanos"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    autoComplete="bday"
                    value={form.cumpleanos}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border bg-transparent border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo electrónico
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MailIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                className={`block w-full pl-10 pr-3 py-2 border bg-transparent rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${invalidAuth ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="correo@ejemplo.com"
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <LockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={form.password}
                onChange={handleChange}
                required
                className={`block w-full pl-10 pr-3 py-2 border bg-transparent rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${invalidAuth ? 'border-red-300' : 'border-gray-300'}`}
                placeholder={isSignup ? "Crea una contraseña" : "Tu contraseña"}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 bg-transparent flex items-center"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400 bg-transparent" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 bg-transparent" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.password}
              </p>
            )}
          </div>

          {isSignup && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmar contraseña
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-10 py-2 border bg-transparent border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Repite la contraseña"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 bg-transparent pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400 bg-transparent" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 bg-transparent" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {!isSignup && (
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-medium text-blue-600 bg-transparent hover:text-blue-500 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </span>
              ) : isSignup ? (
                "Crear cuenta"
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                O continúa con
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={googleLogin}
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={toggleMode}
            className="font-medium bg-transparent text-blue-600 hover:text-blue-500 transition-colors"
          >
            {isSignup
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿No tienes cuenta? Regístrate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
