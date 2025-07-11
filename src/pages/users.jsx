import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { getUsuarios, addEmpleado, modificarEmpleado } from "../services/usersHelper";
import { Filter, X } from "lucide-react";
import { toast } from "react-toastify";

// FilterSection Component with animations
const FilterSection = ({
  mostrarFiltros,
  setMostrarFiltros,
  busqueda,
  setBusqueda,
  filtroSeleccionado,
  setFiltroSeleccionado
}) => {
  return (
    <div className="bg-gray-50 border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center p-4">
        <h3 className="text-sm font-medium text-gray-700">Opciones de filtrado</h3>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="bg-transparent flex items-center gap-2 text-sm text-gray-600 hover:text-naranja transition-colors"
        >
          <Filter size={16} />
          {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${mostrarFiltros ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nombre
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de usuario
            </label>
            <select
              value={filtroSeleccionado}
              onChange={(e) => setFiltroSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
            >
              <option value="todos">Todos</option>
              <option value="empleado">Empleado</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={() => {
                setBusqueda("");
                setFiltroSeleccionado("todos");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function RenderUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    apellido: "",
    password: "",
    cargo: "",
    telefono: "",
    email: "",
    cumpleanos: ""
  });
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroSeleccionado, setFiltroSeleccionado] = useState("todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const { user } = useAuth();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    try {
      setLoading(true);
      const data = await getUsuarios();
      // Validate response data
      if (!data || !Array.isArray(data)) {
        console.error("Datos de usuarios inválidos:", data);
        setUsuarios([]);
      } else {
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      setUsuarios([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  const filtrarUsuarios = () => {
    return usuarios.filter(usuario => {
      const matchBusqueda = usuario.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchFiltro = filtroSeleccionado === "todos" || (filtroSeleccionado === 'cliente' ? usuario.cargo === filtroSeleccionado : (usuario.cargo === 'admin' || usuario.cargo === 'empleado' || usuario.cargo === 'encargado'));
      return matchBusqueda && matchFiltro;
    });
  };

  // Calculate pagination
  const usuariosFiltrados = filtrarUsuarios();
  const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsuarios = usuariosFiltrados.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda, filtroSeleccionado]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Pagination component
  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            Anterior
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
              <span className="font-medium">{Math.min(endIndex, usuariosFiltrados.length)}</span> de{' '}
              <span className="font-medium">{usuariosFiltrados.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Anterior
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${currentPage === number
                      ? 'z-10 bg-naranja border-naranja text-white'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    } border`}
                >
                  {number}
                </button>
              ))}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                Siguiente
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const response = await modificarEmpleado(usuarioSeleccionado.id, nuevoEmpleado);
        if (response.status === 200) {
          toast.success("Usuario modificado con éxito");
        }
      } else {
        const response = await addEmpleado(nuevoEmpleado);
        if (response.status === 201) {
          toast.success("Usuario añadido con éxito");
        }
      }

      setMostrarModal(false);
      setUsuarioSeleccionado(null);
      setNuevoEmpleado({
        nombre: "",
        apellido: "",
        password: "",
        cargo: "",
        telefono: "",
        email: "",
        cumpleanos: ""
      });
      setIsEditing(false);
      fetchUsuarios();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hubo un error. Por favor, inténtalo de nuevo.");
    }
  };

  const handleEdit = (usuario) => {
    setIsEditing(true);
    setUsuarioSeleccionado(usuario);
    setNuevoEmpleado({
      nombre: usuario.nombre,
      apellido: usuario.apellido || "",
      cargo: usuario.cargo || "",
      telefono: usuario.telefono || "",
      email: usuario.email || "",
      cumpleanos: usuario.cumpleanos || "",
      password: usuario.password || "",
    });
    setMostrarModal(true);
  };

  const handleNuevoUsuario = () => {
    setIsEditing(false);
    setNuevoEmpleado({
      nombre: "",
      apellido: "",
      password: "",
      cargo: "",
      telefono: "",
      email: "",
      cumpleanos: ""
    });
    setMostrarModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera */}
        <div className="bg-white rounded-lg shadow-md p-5 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-naranja flex items-center">
            <span className="mr-2">👥</span> Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Administra los usuarios y empleados del sistema
          </p>
        </div>

        {/* Tabla de usuarios */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-10 text-center">
            <div className="animate-spin w-12 h-12 mx-auto mb-4 border-4 border-naranja border-t-transparent rounded-full"></div>
            <p className="text-gray-600 text-lg">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            {!loading && usuarios.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-10 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔄</div>
                <p className="text-gray-600 text-lg">
                  No se pudieron cargar los usuarios. Por favor, intenta refrescar la página.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Refrescar página
                </button>
              </div>
            )}

            {!loading && usuarios.length > 0 && filtrarUsuarios().length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-10 text-center">
                <div className="text-gray-400 text-6xl mb-4">📭</div>
                <p className="text-gray-600 text-lg">
                  No se encontraron usuarios que coincidan con los criterios de búsqueda.
                </p>
              </div>
            )}

            {usuarios.length > 0 && usuariosFiltrados.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-5 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">Usuarios</h2>
                </div>

                {/* FilterSection implemented here */}
                <FilterSection
                  mostrarFiltros={mostrarFiltros}
                  setMostrarFiltros={setMostrarFiltros}
                  busqueda={busqueda}
                  setBusqueda={setBusqueda}
                  filtroSeleccionado={filtroSeleccionado}
                  setFiltroSeleccionado={setFiltroSeleccionado}
                />

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="px-4 py-3 text-gray-700 font-semibold">ID</th>
                        <th className="px-4 py-3 text-gray-700 font-semibold">Nombre</th>
                        <th className="px-4 py-3 text-gray-700 font-semibold">Cargo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsuarios.map((usuario) => (
                        <tr
                          key={usuario.id}
                          className="cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-200"
                          onClick={() => setUsuarioSeleccionado(usuario)}
                        >
                          <td className="px-4 py-3 text-gray-800">{usuario.id}</td>
                          <td className="px-4 py-3 text-gray-800">{usuario.nombre}</td>
                          <td className="px-4 py-3 text-gray-800">{usuario.cargo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Component */}
                <PaginationComponent />
              </div>
            )}

            {/* Updated counter */}
              {!loading && usuarios.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Mostrando {currentUsuarios.length} de {usuariosFiltrados.length} usuarios filtrados (Total: {usuarios.length})
                </div>
              )}
            </>
          )}

        {/* Modal para ver detalles del usuario */}
        {usuarioSeleccionado && !mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Usuario #{usuarioSeleccionado.id}
                </h2>
                <button
                  onClick={() => setUsuarioSeleccionado(null)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium text-gray-800">
                      {usuarioSeleccionado.nombre}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cargo</p>
                    <p className="font-medium text-gray-800">
                      {usuarioSeleccionado.cargo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-800">
                      {usuarioSeleccionado.telefono || "No registrado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">
                      {usuarioSeleccionado.email || "No registrado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                    <p className="font-medium text-gray-800">
                      {usuarioSeleccionado.cumpleanos || "No registrada"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="flex justify-end gap-3">
                  {user?.cargo === "admin" && usuarioSeleccionado.cargo !== "admin" && (
                    <button
                      onClick={() => handleEdit(usuarioSeleccionado)}
                      className="px-4 py-2 bg-naranja text-white rounded-md hover:bg-naranja/90 transition-colors"
                    >
                      Editar
                    </button>
                  )}
                  <button
                    onClick={() => setUsuarioSeleccionado(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de formulario para añadir/editar usuario */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditing ? "Editar Usuario" : "Añadir Nuevo Empleado"}
                </h2>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="px-6 py-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={nuevoEmpleado.nombre}
                      onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={nuevoEmpleado.telefono}
                      onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, telefono: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={nuevoEmpleado.email}
                      onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de nacimiento
                    </label>
                    <input
                      type="date"
                      value={nuevoEmpleado.cumpleanos}
                      onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, cumpleanos: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
                    />
                  </div>
                  {(!isEditing || (isEditing && nuevoEmpleado.password && nuevoEmpleado.cargo != 'cliente')) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        placeholder={isEditing ? "Nueva contraseña (dejar en blanco para mantener)" : ""}
                        onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja"
                        required={!isEditing}
                      />
                    </div>
                  )}
                  {(!isEditing || (isEditing && nuevoEmpleado.cargo != 'cliente')) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo
                      </label>
                      <select
                        value={nuevoEmpleado.cargo}
                        onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, cargo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naranja bg-gray-100 text-gray-900"
                        required
                      >
                        <option value="" disabled>Seleccione un cargo</option>
                        <option value="encargado">Encargado</option>
                        <option value="Mozo">Mozo</option>
                        <option value="Cajero">Cajero</option>
                      </select>
                    </div>
                  )}
                </form>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setMostrarModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-naranja text-white rounded-md hover:bg-naranja/90 transition-colors"
                  >
                    {isEditing ? "Guardar cambios" : "Añadir empleado"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botón flotante para añadir usuario */}
        {user?.cargo === "admin" && (
          <button
            onClick={handleNuevoUsuario}
            className="fixed bottom-6 right-6 bg-naranja text-white p-4 rounded-full shadow-lg hover:bg-naranja/90 transition-colors flex items-center justify-center"
          >
            <span className="text-base">Añadir empleado</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default RenderUsuarios;