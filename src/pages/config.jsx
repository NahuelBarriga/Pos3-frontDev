import { useEffect, useState } from 'react';
import { User, Settings, LogOut, Edit2, Eye, EyeOff, Save, Lock } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { getConfig, postMediosDePago, postProveedores, deleteProveedores, toggleProveedores, updateUsuario, updateConfig, getPedidos, getReservas, postCategoria, deleteCategoria, updateCategoriaOrder, toggleMediosDePago, deleteMediosDePago, createCupon, deleteCupon, updateCuponEstado, updateContrasena } from '../services/configHelper';
import socket from '../config/socket';
import ProveedorModal from '../components/ProveedorModal';
import ProveedorDetailsModal from '../components/ProveedorDetailsModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import LoadingScreen from '../components/utils/LoadingScreen';

// Import new components
import Section from '../components/config/Section';
import ClientSection from '../components/config/ClientSection';
import GeneralConfig from '../components/config/GeneralConfig';
import MenuConfig from '../components/config/MenuConfig';
import PaymentConfig from '../components/config/PaymentConfig';
import ProviderConfig from '../components/config/ProviderConfig';
import CouponsConfig from '../components/config/CouponsConfig';
import FormField from '../components/config/FormField';

// Global constant for pagination
const ITEMS_PER_PAGE = 5;

// Helper to format date as DD/MM/YYYY
const formatDate = (dateStr) => {
  if (!dateStr) return "";


  // If it's a Date object, format it
  if (dateStr instanceof Date) {
    const day = String(dateStr.getDate()).padStart(2, '0');
    const month = String(dateStr.getMonth() + 1).padStart(2, '0');
    const year = dateStr.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // If it has a T (ISO format), extract just the date part
  if (dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }

  // If it's already in DD-MM-YYYY format, just replace hyphens with slashes
  if (dateStr.includes('-') && dateStr.split('-').length === 3) {
    const parts = dateStr.split('-');
    if (parts[0].length !== 4) {
      return dateStr.replace(/-/g, '/');
    }
    // It's in YYYY-MM-DD format, convert to DD/MM/YYYY
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  // If we get here, return as is
  return dateStr;
};

// Componente principal
export default function RenderConfig() {
  // Estado para simular un usuario
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [cafeConfig, setCafeConfig] = useState({ 
    nombreCafe: '',
    direccion: '',
    telefono: '',
    horarioApertura: '',
    horarioCierre: '',
    horarioCierreCocina: '',
  });

  // Estado para controlar las secciones expandidas
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    ordersHistory: false,
    reservationsHistory: false,
    cafeSettings: false,
    reservationSettings: false,
    approvalSettings: false,
    CuponesSettings: false
  });

  const [categorias, setCategorias] = useState([]);
  const [mediosPago, setMediosPago] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [cupones, setCupones] = useState([]);
  const [currentPageProveedores, setCurrentPageProveedores] = useState(1);
  const [currentPageCupones, setCurrentPageCupones] = useState(1);
  const [currentPagePedidos, setCurrentPagePedidos] = useState(1);
  const [currentPageReservas, setCurrentPageReservas] = useState(1);
  const [newMedioPago, setNewMedioPago] = useState('');
  const [newPaymentMethodDesc, setNewPaymentMethodDesc] = useState('');
  const [newPaymentMethodRef, setNewPaymentMethodRef] = useState('');
  const [newProveedor, setNewProveedor] = useState('');
  const [newCategoria, setNewCategoria] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info'); // 'info', 'success', 'error'

  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [proveedorToEdit, setProveedorToEdit] = useState(null);
  // Add new state for details modal
  const [showProveedorDetails, setShowProveedorDetails] = useState(false);
  const [proveedorToView, setProveedorToView] = useState(null);

  const [confirmationModal, setConfirmationModal] = useState(false);


  // Estado para formularios de edición
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    email: '',
    telefono: ''
  });

  //para clientes 
  const [pedidos, setPedidos] = useState([]);
  const [reservas, setReservas] = useState([]);

  const [newCupon, setNewCupon] = useState({
    descuento: '',
    tipo: 'porcentaje',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    descripcion: ''
  });


  useEffect(() => { 
    console.log(cupones);  //!debugging line
  },[cupones]); 

  const fetchUserData = async () => {
    try {
      setCurrentUser(user);
      setEditedProfile({
        email: user?.email || '',
        telefono: user?.telefono || ''
      });

    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      // Establecer valores por defecto para evitar errores
      setCurrentUser({
        nombre: "",
        email: "",
        telefono: "",
        cumpleanos: "",
        isAdmin: false,
        pedidos: [],
        reservas: []
      });
    }
  };
  async function fetchConfig() {
    try {
      const cafeConfig = await getConfig(); // Obtener la configuración del café 
      setCafeConfig(cafeConfig);
      setProveedores(cafeConfig.proveedores || [])
      setCategorias(cafeConfig.categorias || []); // Asignar las categorías al estado
      setMediosPago(cafeConfig.mediosDePago || []);
      setCupones(cafeConfig.cuponesData || []);
    } catch (error) {
      console.error("Error al obtener configuracion del cafe:", error);
    }

  }

  async function fetchPedidos() {
    try {
      const pedidos = await getPedidos(user.id);
      setPedidos(pedidos); // Asignar los pedidos al estado
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    }
  }
  async function fetchReservas() {
    try {
      const reservas = await getReservas(user.id);
      setReservas(reservas); // Asignar los pedidos al estado
    } catch (error) {
      console.error("Error al obtener pedidos:", error);

    }
  }

  async function fetchCambioContrasena(passwordForm) {
    try {
      const cambio = await updateContrasena(passwordForm);
      alert("Contraseña cambiada con éxito");
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
    }
  }
  // Función para asignar colores a los estados de los pedidos
  const obtenerColorEstado = (estado) => {
    return estado === 'pendiente' ? "bg-yellow-300 text-yellow-900" :
      estado === 'confirmado' || estado === 'aceptada' ? "bg-green-300 text-green-900" :
        estado === 'finalizado' || estado === 'finalizada' ? "bg-blue-300 text-green-900" :
          estado === 'rechazado' || estado === 'rechazada' ? "bg-red-300 text-red-900" : "bg-gray-300 text-gray-900"

  };

  // Función para mostrar notificaciones simple
  const showToast = (message, type = 'info') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
      if (user.cargo === 'cliente') {
        fetchPedidos();
        fetchReservas();
      }
      if (user.cargo === 'admin') { //si es admin, buscamos configuracion del cafe //todo: armar
        fetchConfig();
      }
    }

    // Socket listeners
    socket.on("medioPago:actualizado", () => {
      fetchConfig();
    });

    return () => {
      socket.off("medioPago:actualizado");
    };
  }, [user]);

  // Manejo de expansión de secciones
  const toggleSection = (section) => {
    setExpandedSections({ ...expandedSections, [section]: !expandedSections[section] });
  };

  // Manejo del cambio en formularios
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({ ...editedProfile, [name]: value });
  };

  const handleCafeConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCafeConfig({
      ...cafeConfig,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCategoriaChange = (e) => {
    const { name, value } = e.target;
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(categorias);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Always reindex ALL categories to ensure consistent ordering
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1 // Use order instead of position, starting from 1
    }));

    try {
      // First update UI optimistically for better UX
      setCategorias(updatedItems);

      // Update all categories with their new order values
      const promises = updatedItems.map(cat =>
        updateCategoriaOrder(cat.id, cat.order)
      );

      await Promise.all(promises);

      showToast("Orden de categorías actualizado", "success");
    } catch (error) {
      console.error("Error al actualizar orden de categorías:", error);

      // Revert to original order if there's an error
      fetchConfig(); // Reload from server
      showToast("Error al actualizar el orden de categorías", "error");
    }
  };

  // Agregar nueva categoría
  const handleSubmitCategoria = async () => {
    if (!newCategoria.trim()) {
      showToast("El nombre de la categoría no puede estar vacío", "error");
      return;
    }

    try {
      // Always compute the max order as the count of existing categories + 1
      // This ensures the new category is positioned at the end
      const newOrder = categorias.length + 1;

      // Call API to add category
      const response = await postCategoria({
        nombre: newCategoria.trim(),
        order: newOrder
      });

      if (response.status === 201) {
        // If API call is successful, add to local state
        console.log("Categoría agregada:", response.data);
        const newId = Math.max(0, ...categorias.map(c => c.id)) + 1; //!acmoda esto hdp
        const newCategory = {
          id: newId,
          nombre: newCategoria.trim(),
          order: newOrder,
          cant: 0
        };

        setCategorias([...categorias, newCategory]);
        setNewCategoria('');
        showToast("Categoría agregada correctamente", "success");
      } else {
        showToast("Error al agregar categoría", "error");
      }
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      showToast("Error al agregar categoría: " + error.message, "error");
    }
  };

  // Confirmar eliminación de categoría
  const confirmDeleteCategory = (category) => {
    if (category.cant > 0) {
      showToast(`No se puede eliminar la categoría "${category.nombre}" porque contiene ${category.cant} productos.`, "error");
      return;
    }

    setCategoryToDelete(category);
    setAlertMessage(`¿Estás seguro de eliminar la categoría "${category.nombre}"?`);
    setShowAlert(true);
  };

  // Eliminar categoría
  const handleDeleteCategory = async (categoryId) => {
    try {
      // First find the category to check if it has associated items
      const categoryToDelete = categorias.find(c => c.id === categoryId);

      // Check if category has associated items
      if (categoryToDelete && categoryToDelete.cant && categoryToDelete.cant > 0) {
        showToast(`No se puede eliminar la categoría "${categoryToDelete.nombre}" porque contiene ${categoryToDelete.cant} productos.`, "error");
        return;
      }

      // Call API to delete category
      const response = await deleteCategoria(categoryId);

      if (response === 200 || response.status === 200) {
        // If API call is successful, remove from local state
        const updatedCategorias = categorias.filter(c => c.id !== categoryId);
        // Actualizar posiciones después de eliminar
        const reindexedCategorias = updatedCategorias.map((cat, index) => ({
          ...cat,
          order: index + 1
        }));

        setCategorias(reindexedCategorias);
        // Adjust current page if necessary
        adjustCurrentPage(reindexedCategorias.length, currentPagePedidos, setCurrentPagePedidos);
        showToast(`Categoría eliminada correctamente`, "success");
      } else {
        showToast("Error al eliminar categoría", "error");
      }
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      showToast("Error al eliminar categoría: " + error.message, "error");
    }
  };

  // Guardar cambios
  const handleSaveChanges = () => {
    // Actualizar configuración
    const updatedConfig = {
      ...cafeConfig,
      categorias: categorias
    };

    updateCafeConfig(updatedConfig);
    showToast("Cambios guardados correctamente", "success");
  };

  // Guardar cambios de perfil
  const saveProfileChanges = async () => {
    try {
      // Llamar al backend para actualizar el usuario
      const response = await updateUsuario(user.id, {
        email: editedProfile.email,
        telefono: editedProfile.telefono
      });
      if (response.status === 200) {
        setCurrentUser({ ...currentUser, email: editedProfile.email, telefono: editedProfile.telefono });
        setIsEditingProfile(false);
        showToast("Perfil actualizado correctamente", "success");
      } else {
        showToast("Error al actualizar el perfil", "error");
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      showToast("Error al actualizar el perfil: " + error.message, "error");
    }
  };

  // Simulación de cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility({
      ...passwordVisibility,
      [field]: !passwordVisibility[field]
    });
  };

  const isPasswordFormValid = () => {
    return passwordForm.current.trim() !== '' &&
      passwordForm.new.trim() !== '' &&
      passwordForm.confirm.trim() !== '' &&
      passwordForm.new === passwordForm.confirm;
  };

  const savePasswordChange = () => {
    // Aquí iría la lógica para cambiar la contraseña

    fetchCambioContrasena(passwordForm);
    setIsChangingPassword(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleAddMedioPago = async () => {
    if (!newPaymentMethodDesc.trim() || !newPaymentMethodRef.trim()) {
      showToast("El nombre y la referencia del medio de pago son obligatorios", "error");
      return;
    }

    try {
      const response = await postMediosDePago({
        nombre: newPaymentMethodDesc.trim(),
        ref: newPaymentMethodRef.trim()
      });

      if (response.status === 201) {
        // Add the new payment method to the local state
        const newMedioPago = {
          id: response.data?.id || Date.now(), // Use API-provided ID or generate temporary one
          nombre: newPaymentMethodDesc.trim(),
          ref: newPaymentMethodRef.trim(),
          activo: true
        };

        setMediosPago([newMedioPago, ...mediosPago]);

        // Reset input fields
        setNewPaymentMethodDesc('');
        setNewPaymentMethodRef('');
        showToast("Medio de pago agregado correctamente", "success");
      } else {
        showToast("Error al agregar medio de pago", "error");
      }
    } catch (error) {
      console.error("Error al agregar medio de pago:", error);
      showToast("Error al agregar medio de pago: " + error.message, "error");
    }
  };

  const handleInabilitarMedioPago = async (id) => {
    try {
      const response = await toggleMediosDePago(id);

      if (response.status === 200) {
        // Update the specific payment method in the local state
        setMediosPago(mediosPago.map(medio =>
          medio.id === id ? { ...medio, activo: !medio.activo } : medio
        ));

        showToast("Estado del medio de pago actualizado correctamente", "success");
      } else {
        showToast("Error al actualizar estado del medio de pago", "error");
      }
    } catch (error) {
      console.error("Error al cambiar estado del medio de pago:", error);
      showToast("Error al cambiar estado del medio de pago: " + error.message, "error");
    }
  };

  const handleEliminarMedioPago = async (id) => {
    // Show confirmation modal instead of browser confirm
    setConfirmationModal({
      visible: true,
      title: 'Eliminar Medio de Pago',
      message: 'Esta acción eliminará permanentemente este medio de pago. Una vez eliminado, no podrá ser recuperado y podría afectar los registros históricos de transacciones. ¿Está seguro que desea continuar?',
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          const response = await deleteMediosDePago(id);

          if (response.status === 200) {
            const newMediosPago = mediosPago.filter(medio => medio.id !== id);
            setMediosPago(newMediosPago);
            showToast("Medio de pago eliminado correctamente", "success");
          } else {
            showToast("Error al eliminar medio de pago", "error");
          }
        } catch (error) {
          console.error("Error al eliminar medio de pago:", error);
          showToast("Error al eliminar medio de pago: " + error.message, "error");
        }
      }
    });
  };

  const handleOpenAddProveedor = () => {
    setProveedorToEdit(null);
    setShowProveedorModal(true);
  };

  const handleOpenEditProveedor = (proveedor) => {
    console.log("Editing proveedor:", proveedor); // Debugging line
    setProveedorToEdit(proveedor);
    setShowProveedorModal(true);
  };

  // Add new handler for viewing provider details
  const handleOpenViewProveedor = (proveedor) => {
    setProveedorToView(proveedor);
    setShowProveedorDetails(true);
  };

  const handleSubmitProveedor = async (formData) => {
    try {
      let response;

      if (formData.id) {
        // Update existing proveedor
        response = await updateProveedor(formData.id, formData);
        if (response.status === 200) {
          showToast("Proveedor actualizado con éxito", "success");
          // Update in local state
          setProveedores(prev =>
            prev.map(p => p.id === formData.id ? formData : p)
          );
        }
      } else {
        // Create new proveedor
        response = await postProveedores(formData);
        if (response.status === 201) {
          showToast("Proveedor agregado con éxito", "success");
          // Add the new proveedor to the local state using the response data (with correct ID)
          const newProveedor = response.data || { ...formData, id: Date.now() };
          setProveedores(prev => [...prev, newProveedor]);
        }
      }

      setShowProveedorModal(false);
    } catch (error) {
      console.error("Error al guardar el proveedor:", error);
      showToast("Error al guardar el proveedor", "error");
    }
  };

  const handleDeleteProveedor = async (provId) => {
    setConfirmationModal({
      visible: true,
      title: 'Eliminar Proveedor',
      message: 'Esta acción eliminará permanentemente este proveedor. Una vez eliminado, no podrá ser recuperado y podría afectar los registros asociados. ¿Está seguro que desea continuar?',
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          if (provId) {
            const response = await deleteProveedores(provId);
            if (response.status === 200) {
              showToast("Proveedor eliminado con éxito", "success");
              const newProveedores = proveedores.filter(p => p.id !== provId);
              setProveedores(newProveedores);
              // Adjust current page if necessary
              adjustCurrentPage(newProveedores.length, currentPageProveedores, setCurrentPageProveedores);
            }
          }
        } catch (error) {
          console.error("Error al eliminar el proveedor:", error);
          showToast("Error al eliminar el proveedor", "error");
        }
      }
    });
  }

  const handleToggleProveedorStatus = async (provId) => {
    try {
      if (provId) {
        const response = await toggleProveedores(provId);
        if (response.status === 200) {
          showToast("Proveedor inhabilitado con éxito", "success");
          // Refresh the list to get the updated data
          setProveedores(prev =>
            prev.map(p => p.id === provId ? { ...p, activo: !p.activo } : p)
          );
        }
      }
    } catch (error) {
      console.error("Error al inhabilitar el proveedor:", error);
      showToast("Error al inhabilitar el proveedor", "error");
    }
  }

  // Manejo del cambio en formularios de cupones
  const handleCuponChange = (e) => {
    const { name, value } = e.target;
    
    // Validate descuento field when tipo is porcentaje
    if (name === 'descuento' && newCupon.tipo === 'porcentaje') {
      const numValue = parseFloat(value);
      if (numValue > 100) {
        showToast("El descuento porcentual no puede ser mayor a 100%", "error");
        return;
      }
    }
    
    setNewCupon({ ...newCupon, [name]: value });
  };

  // Agregar nuevo cupón
  const handleSubmitCupon = async () => {
    if (!newCupon.descuento || !newCupon.tipo || !newCupon.fechaInicio || !newCupon.fechaFin) {
      showToast("Todos los campos son obligatorios", "error");
      return;
    }

    try {
      const response = await createCupon(newCupon);
      console.log("Respuesta del servidor:", response.status);
      if (response.status === 201) {
        showToast("Cupón creado con éxito", "success");
        const cupon = { 
          id: response.data.id || Date.now(), 
          descuento: response.data.descuento,
          tipo: response.data.tipo,
          fechaInicio: response.data.fechaInicio,
          fechaFin: response.data.fechaFin,
          codigo: response.data.codigo,
          estado: 'activo',
          descripcion: response.data.descripcion || ''
        }
        setCupones(cup => [...(cup || []), cupon]);
        setNewCupon({
          descuento: '',
          tipo: 'porcentaje',
          fechaInicio: new Date().toISOString().split('T')[0],
          fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          descripcion: ''
        });
      }
    } catch (error) {
      console.error("Error al crear cupón:", error);
      showToast("Error al crear cupón", "error");
    }
  };

  // Eliminar cupón
  const handleDeleteCupon = async (cupon) => {
    setConfirmationModal({
      visible: true,
      title: 'Eliminar Cupón',
      message: 'Esta acción eliminará permanentemente este cupón. Una vez eliminado, no podrá ser recuperado y los clientes que lo tengan no podrán utilizarlo. ¿Está seguro que desea continuar?',
      type: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          const response = await deleteCupon(cupon.codigo);
          if (response.status === 200) {
            const newCupones = cupones.filter(c => c.id !== cupon.id);
            setCupones(newCupones);
            // Adjust current page if necessary
            adjustCurrentPage(newCupones.length, currentPageCupones, setCurrentPageCupones);
            showToast("Cupón eliminado correctamente", "success");
          }
        } catch (error) {
          console.error("Error al eliminar cupón:", error);
          showToast("Error al eliminar cupón", "error");
        }
      }
    });
  };

  const handleUpdateCuponEstado = async(cupon) => { 
    try { 
      const response = await updateCuponEstado(cupon.codigo, cupon.estado === 'activo' ? 'inactivo' : 'activo');
      if (response.status === 200) {
        const updatedCupones = cupones.map(c => 
          c.id === cupon.id 
            ? { ...c, estado: c.estado === 'activo' ? 'no activo' : 'activo' }
            : c
        );
        setCupones(updatedCupones);
        showToast(`Cupón ${cupon.estado === 'activo' ? 'desactivado' : 'activado'} correctamente`, "success");
      } else { 
        showToast("Error al actualizar estado del cupón", "error");
      }
    } catch (error) {
      console.error("Error al actualizar estado del cupón:", error);
      showToast("Error al actualizar estado del cupón", "error");
    }
  }

  // Copy to clipboard function
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Código copiado al portapapeles", "success");
    } catch (err) {
      console.error('Error al copiar:', err);
      showToast("Error al copiar el código", "error");
    }
  };


  // Generic pagination helper functions
  const getPaginatedData = (data, currentPage) => {
    const indexOfLast = currentPage * ITEMS_PER_PAGE;
    const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
    return {
      currentItems: data.slice(indexOfFirst, indexOfLast),
      totalPages: Math.ceil(data.length / ITEMS_PER_PAGE),
      indexOfFirst: indexOfFirst + 1,
      indexOfLast: Math.min(indexOfLast, data.length)
    };
  };

  const createPaginationHandlers = (currentPage, setCurrentPage, totalPages) => ({
    nextPage: () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    },
    prevPage: () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    goToPage: (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    }
  });

  // Helper function to adjust current page when items are deleted
  const adjustCurrentPage = (newDataLength, currentPage, setCurrentPage) => {
    const newTotalPages = Math.ceil(newDataLength / ITEMS_PER_PAGE);
    if (newTotalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  // Renderizado condicional mientras se cargan los datos
  if (!currentUser) {
    return <LoadingScreen title="Configuración" subtitle="Cargando datos de usuario..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <Settings className="mr-2" /> Configuración
      </h1>

      {/* Sección de perfil de usuario */}
      <Section
        title="Perfil de Usuario"
        icon={<User />}
        isExpanded={expandedSections.profile}
        toggleExpand={() => toggleSection('profile')}
      >
        {!isEditingProfile ? (
          <div className="space-y-4 text-black">
            <InfoRow label="Nombre" value={currentUser?.nombre || 'No disponible'} />
            <InfoRow label="Email" value={currentUser?.email || 'No disponible'} />
            {(currentUser?.telefono && currentUser?.telefono != 'null' && (
              <InfoRow label="Teléfono" value={currentUser?.telefono || 'No disponible'} />
            ))}
            {(currentUser?.cumpleanos && (
              <InfoRow label="Fecha de nacimiento" value={currentUser?.cumpleanos ? currentUser.cumpleanos.split("T")[0] : 'No disponible'} />
            ))}

            <div className="flex space-x-4 mt-6">
              {(currentUser?.googleAuth && currentUser?.googleAuth === false) && ( 
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                >
                  <Lock size={16} className="mr-2" /> Cambiar Contraseña
                </button>
              )}

            </div>
          </div>
        ) : (
          <form className="space-y-4">
            <div className="opacity-60 text-black">
              <InfoRow
                label="Nombre"
                value={currentUser?.nombre || 'No disponible'}
              />
              <InfoRow
                label="Fecha de nacimiento"
                value={
                  currentUser?.cumpleanos
                    ? formatDate(currentUser.cumpleanos)
                    : 'No disponible'
                }
              />
            </div>

            <FormField
              label="Email"
              type="email"
              name="email"
              value={editedProfile.email}
              onChange={handleProfileChange}
            />

            <FormField
              label="Teléfono"
              type="tel"
              name="telefono"
              value={editedProfile.telefono}
              onChange={handleProfileChange}
            />

            <div className="flex space-x-4 mt-6">
              <button
                type="button"
                onClick={saveProfileChanges}
                className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                <Save size={16} className="mr-2" /> Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  setEditedProfile({
                    email: currentUser?.email || '',
                    telefono: currentUser?.telefono || ''
                  });
                }}
                className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </form>
        )
        }

        {/* Modal de cambio de contraseña */}
        {
          isChangingPassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-xl font-semibold mb-4">Cambiar Contraseña</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label htmlFor="current" className="text-gray-600 font-medium">
                      Contraseña actual:
                    </label>
                    <div className="col-span-2 relative">
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900 pr-10"
                        onChange={handlePasswordChange}
                        value={passwordForm.current}
                        name="current"
                        id="current"
                        type={passwordVisibility.current ? "text" : "password"}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 bg-transparent text-gray-500 hover:text-gray-700"
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {passwordVisibility.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label htmlFor="new" className="text-gray-600 font-medium">
                      Nueva contraseña:
                    </label>
                    <div className="col-span-2 relative">
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900 pr-10"
                        onChange={handlePasswordChange}
                        value={passwordForm.new}
                        name="new"
                        id="new"
                        type={passwordVisibility.new ? "text" : "password"}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 bg-transparent text-gray-500 hover:text-gray-700"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {passwordVisibility.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <label htmlFor="confirm" className="text-gray-600 font-medium">
                      Confirmar contraseña:
                    </label>
                    <div className="col-span-2 relative">
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900 pr-10"
                        onChange={handlePasswordChange}
                        value={passwordForm.confirm}
                        name="confirm"
                        id="confirm"
                        type={passwordVisibility.confirm ? "text" : "password"}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 bg-transparent text-gray-500 hover:text-gray-700"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {passwordVisibility.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {passwordForm.new !== passwordForm.confirm && passwordForm.confirm.trim() !== '' && (
                    <p className="text-red-500 text-sm">Las contraseñas no coinciden</p>
                  )}

                  <div className="flex space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={savePasswordChange}
                      disabled={!isPasswordFormValid()}
                      className={`flex items-center ${isPasswordFormValid()
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-400 cursor-not-allowed"
                        } text-white px-4 py-2 rounded`}
                    >
                      <Save size={16} className="mr-2" /> Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordForm({ current: '', new: '', confirm: '' });
                      }}
                      className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
      </Section>

      {/* Client sections */}
      {user.cargo === 'cliente' && (
        <ClientSection 
          pedidos={pedidos}
          reservas={reservas}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
        />
      )}

      {/* Admin sections */}
      {user?.cargo === 'admin' && cafeConfig && (
        <>
          <div className="border-t border-gray-200 my-6"></div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Configuración de Administrador</h2>

          <GeneralConfig 
            cafeConfig={cafeConfig}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            handleCafeConfigChange={handleCafeConfigChange}
          />

          <MenuConfig 
            categorias={categorias}
            newCategoria={newCategoria}
            setNewCategoria={setNewCategoria}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            handleDragEnd={handleDragEnd}
            handleSubmitCategoria={handleSubmitCategoria}
            handleDeleteCategory={handleDeleteCategory}
          />

          <PaymentConfig 
            mediosPago={mediosPago}
            newPaymentMethodDesc={newPaymentMethodDesc}
            setNewPaymentMethodDesc={setNewPaymentMethodDesc}
            newPaymentMethodRef={newPaymentMethodRef}
            setNewPaymentMethodRef={setNewPaymentMethodRef}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            handleAddMedioPago={handleAddMedioPago}
            handleInabilitarMedioPago={handleInabilitarMedioPago}
            handleEliminarMedioPago={handleEliminarMedioPago}
          />

          <ProviderConfig 
            proveedores={proveedores}
            currentPageProveedores={currentPageProveedores}
            setCurrentPageProveedores={setCurrentPageProveedores}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            handleOpenAddProveedor={handleOpenAddProveedor}
            handleOpenEditProveedor={handleOpenEditProveedor}
            handleOpenViewProveedor={handleOpenViewProveedor}
            handleDeleteProveedor={handleDeleteProveedor}
            handleToggleProveedorStatus={handleToggleProveedorStatus}
          />

          <CouponsConfig 
            cupones={cupones}
            currentPageCupones={currentPageCupones}
            setCurrentPageCupones={setCurrentPageCupones}
            newCupon={newCupon}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            handleCuponChange={handleCuponChange}
            handleSubmitCupon={handleSubmitCupon}
            handleDeleteCupon={handleDeleteCupon}
            handleUpdateCuponEstado={handleUpdateCuponEstado}
            copyToClipboard={copyToClipboard}
          />
        </>
      )}

      {/* Botón de cerrar sesión */}
      <div className="mt-8 text-center">
        <button
          onClick={async () => {
            await logout();
            navigate('/');
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded flex items-center mx-auto"
        >
          <LogOut size={16} className="mr-2" /> Cerrar Sesión
        </button>
      </div>

      {/* Add a toast notification component */}
      {
        showAlert && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-opacity ${alertType === 'success' ? 'bg-green-500 text-white' :
            alertType === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}>
            {alertMessage}
          </div>
        )
      }

      {/* Add this at the end of your component, just before the closing return tag */}
      <ProveedorModal
        isOpen={showProveedorModal}
        onClose={() => {
          setShowProveedorModal(false);
          setProveedorToEdit(null);
        }}
        onSubmit={handleSubmitProveedor}
        proveedor={proveedorToEdit}
      />

      <ProveedorDetailsModal
        isOpen={showProveedorDetails}
        onClose={() => {
          setShowProveedorDetails(false);
          setProveedorToView(null);
        }}
        proveedor={proveedorToView}
      />
      
      <ConfirmationModal
        visible={confirmationModal.visible}
        onClose={() => setConfirmationModal({ ...confirmationModal, visible: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
      />
    </div >
  );
}

// Componente para fila de información
function InfoRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className="col-span-2">{value}</span>
    </div>
  );
}