import { useState, useEffect } from "react";
import { Calendar, RotateCcw } from "lucide-react";
import {
  getOrdersByHour,
  getPopularItems,
  getTableData,
  getReservationsData,
  getDashboardStats,
  getUsersStats,
  getPaymentsData // Import the new helper
} from "../services/statsHelper";

// Import shared UI components
import { LoadingIndicator, NoDataMessage, ensureArray } from "../components/stats/StatsUIComponents";
import LoadingScreen from '../components/utils/LoadingScreen';

// Import tab components
import DashboardCards from "../components/stats/DashboardCards";
import OverviewStats from "../components/stats/OverviewStats";
import OrdersStats from "../components/stats/OrdersStats";
import TablesStats from "../components/stats/TablesStats";
import ReservationsStats from "../components/stats/ReservationsStats";
import UsersStats from "../components/stats/UsersStats";
// Import the new component
import PaymentsStats from "../components/stats/PaymentsStats";
import socket from "../config/socket";

// Helper to parse DD-MM-YYYY into a Date object
const parseDate = (dateStr) => {
  if (!dateStr) return null;

  // If already a Date object
  if (dateStr instanceof Date) return dateStr;

  // Handle DD-MM-YYYY format
  if (dateStr.includes('-') && dateStr.split('-').length === 3) {
    const parts = dateStr.split('-');
    if (parts[0].length === 4) {
      // Already in YYYY-MM-DD format
      return new Date(dateStr);
    }
    // Convert DD-MM-YYYY to Date
    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}`);
  }

  // Handle ISO string with T
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }

  // Try direct parsing as fallback
  return new Date(dateStr);
};

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

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState({
    type: "today",
    startDate: new Date(),
    endDate: new Date()
  });
  const [ordersByHour, setOrdersByHour] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [popularItems, setPopularItems] = useState({ topItems: [], hourlyData: [], topQuantItems: [] });
  const [reservations, setReservations] = useState([]);
  const [usersData, setUsersData] = useState({
    usersByRole: [],
    userActivity: [],
    newUsers: []
  });

  const [dashboardStats, setDashboardStats] = useState({
    totalOrdersToday: 0,
    totalOrdersYesterday: 0,
    totalTables: 0,
    totalTablesOccupied: 0,
    occupancyPercentage: 0,
    mostPopularItem: { name: '', count: 0, SKU: 0},
    reservationsToday: 0
  });

  // Add state for payment data
  const [paymentsData, setPaymentsData] = useState({
    methodBreakdown: [],
    dailyPayments: []
  });

  const [loading, setLoading] = useState({
    orders: true,
    tables: true,
    items: true,
    reservations: true,
    dashboard: true,
    users: true,
    payments: true
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard summary stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(prev => ({ ...prev, dashboard: true }));
        const data = await getDashboardStats();
        setDashboardStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(prev => ({ ...prev, dashboard: false }));
      }
    };
    fetchDashboardStats();

    // --- SOCKET.IO LISTENERS ---
    // You must have a socket instance available (e.g., from context or a singleton import)
    // Example: import { socket } from '../services/socket';

    // Replace this with your actual socket import or context
    // const socket = ...;

    socket.on("pedido:nuevo", ({ }) => {
      fetchDashboardStats();
    });
    socket.on("pedido:eliminado", ({ }) => {
      fetchDashboardStats();
    });
    socket.on("pedido:estadoActualizado", ({ }) => {
      fetchDashboardStats();
    });
    socket.on("reserva:nueva", ({ }) => {
      fetchDashboardStats();
    });
    socket.on("reserva:eliminada", ({ }) => {
      fetchDashboardStats();
    });
    socket.on("reserva:estadoActualizado", ({ }) => {
      fetchDashboardStats();
    });
    socket.on("mesa:estadoActualizado", ({ }) => {
      fetchDashboardStats();
    })

    return () => {
      socket.off("pedido:nuevo");
      socket.off("pedido:eliminado");
      socket.off("pedido:estadoActualizado");
      socket.off("reserva:nueva");
      socket.off("reserva:eliminada");
      socket.off("reserva:estadoActualizado");
      socket.off("mesa:estadoActualizado");
    };

  }, []);

  // Load orders data
  useEffect(() => {
    const fetchOrdersByHour = async () => {
      try {
        setLoading(prev => ({ ...prev, orders: true }));
        const data = await getOrdersByHour(timeRange);
        setOrdersByHour(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching orders by hour:", error);
        setOrdersByHour([]);
      } finally {
        setLoading(prev => ({ ...prev, orders: false }));
      }
    };
    fetchOrdersByHour();
  }, [timeRange]);

  // Load popular items data
  useEffect(() => {
    const fetchPopularItems = async () => {
      try {
        setLoading(prev => ({ ...prev, items: true }));
        const data = await getPopularItems(timeRange);
        setPopularItems({
          topItems: Array.isArray(data?.topItems) ? data.topItems : [],
          hourlyData: Array.isArray(data?.hourlyData) ? data.hourlyData : [],
          topQuantItems: Array.isArray(data?.topQuantItems) ? data.topQuantItems : []
        });
      } catch (error) {
        console.error("Error fetching popular items:", error);
        setPopularItems({ topItems: [], hourlyData: [], topQuantItems: [] });
      } finally {
        setLoading(prev => ({ ...prev, items: false }));
      }
    };
    fetchPopularItems();
  }, [timeRange]);

  // Load tables data
  useEffect(() => {
    const fetchTableData = async () => {
      try {
        setLoading(prev => ({ ...prev, tables: true }));
        const data = await getTableData(timeRange);
        setTableData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching table data:", error);
        setTableData([]);
      } finally {
        setLoading(prev => ({ ...prev, tables: false }));
      }
    };
    fetchTableData();
  }, [timeRange]);

  // Load reservations data
  useEffect(() => {
    const fetchReservationsData = async () => {
      try {
        setLoading(prev => ({ ...prev, reservations: true }));
        const data = await getReservationsData(timeRange);
        setReservations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching reservations data:", error);
        setReservations([]);
      } finally {
        setLoading(prev => ({ ...prev, reservations: false }));
      }
    };
    //fetchReservationsData();
  }, [timeRange]);

  // Load users data
  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(prev => ({ ...prev, users: true }));
        const data = await getUsersStats(timeRange);
        setUsersData(data || {
          clientSpending: [],
          retentionStats: {
            totalActiveClients: 0,
            newClients: 0,
            returningClients: 0,
            retentionRate: 0
          },
          orderBreakdown: {
            totalOrders: 0,
            employeeOrders: 0,
            clientOrders: 0,
            employeeOrderPercentage: 0,
            clientOrderPercentage: 0
          }
        });
      } catch (error) {
        console.error("Error fetching users data:", error);
        setUsersData({
          clientSpending: [],
          retentionStats: {
            totalActiveClients: 0,
            newClients: 0,
            returningClients: 0,
            retentionRate: 0
          },
          orderBreakdown: {
            totalOrders: 0,
            employeeOrders: 0,
            clientOrders: 0,
            employeeOrderPercentage: 0,
            clientOrderPercentage: 0
          }
        });
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };
    fetchUsersData();
  }, [timeRange]);

  // Update the useEffect for payments data
  useEffect(() => {
    const fetchPaymentsData = async () => {
      try {
        setLoading(prev => ({ ...prev, payments: true }));
        const data = await getPaymentsData(timeRange);

        // Transform the data to match PaymentsStats component expectations
        const transformedData = transformPaymentsData(data);

        setPaymentsData(transformedData);
      } catch (error) {
        console.error("Error fetching payments data:", error);
        setPaymentsData({
          methodBreakdown: [],
          dailyPayments: []
        });
      } finally {
        setLoading(prev => ({ ...prev, payments: false }));
      }
    };

    fetchPaymentsData();
  }, [timeRange]);

  // Function to transform payments data from backend format to component format
  const transformPaymentsData = (rawData) => {
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return {
        methodBreakdown: [],
        dailyPayments: []
      };
    }

    // Aggregate method breakdown across all days
    const methodTotals = new Map();
    const dailyPayments = [];

    rawData.forEach(dayData => {
      const { fecha, mediosPago } = dayData;
      
      // Calculate daily totals
      let dailyAmount = 0;
      let dailyCount = 0;

      mediosPago.forEach(method => {
        const methodName = method.nombre;
        const amount = parseFloat(method.total) || 0;
        const count = parseInt(method.cantidad) || 0;

        // Accumulate for method breakdown
        if (methodTotals.has(methodName)) {
          const existing = methodTotals.get(methodName);
          methodTotals.set(methodName, {
            name: methodName,
            amount: existing.amount + amount,
            count: existing.count + count
          });
        } else {
          methodTotals.set(methodName, {
            name: methodName,
            amount: amount,
            count: count
          });
        }

        // Accumulate for daily totals
        dailyAmount += amount;
        dailyCount += count;
      });

      // Add daily summary
      if (dailyAmount > 0 || dailyCount > 0) {
        dailyPayments.push({
          // date: new Date(fecha).toLocaleDateString('es-ES', { 
          //   month: 'short', 
          //   day: 'numeric' 
          // }),
          date: formatDate(fecha), // Use the helper to format the date
          amount: dailyAmount,
          count: dailyCount,
          fullDate: new Date(fecha) // Keep full date for sorting
        });
      }
    });

    // Sort daily payments by date (ascending - oldest first)
    dailyPayments.sort((a, b) => a.fullDate - b.fullDate);
    
    // Remove fullDate after sorting as it's not needed for display
    dailyPayments.forEach(day => delete day.fullDate);

    return {
      methodBreakdown: Array.from(methodTotals.values()),
      dailyPayments: dailyPayments
    };
  };

  // Add state for custom date range
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });

  const resetDatesToToday = () => {
    const today = new Date();
    setCustomDateRange({
      startDate: today,
      endDate: today
    });
  };

  const handleStartDateChange = (e) => {
    const newStartDate = new Date(e.target.value);
    setCustomDateRange(prev => {
      if (newStartDate > prev.endDate) {
        return { startDate: newStartDate, endDate: newStartDate };
      }
      return { ...prev, startDate: newStartDate };
    });
  };

  const handleEndDateChange = (e) => {
    const newEndDate = new Date(e.target.value);
    setCustomDateRange(prev => {
      if (newEndDate < prev.startDate) {
        return { startDate: newEndDate, endDate: newEndDate };
      }
      return { ...prev, endDate: newEndDate };
    });
  };

  const handleDateRangeChange = () => {
    setTimeRange({
      type: 'custom',
      startDate: customDateRange.startDate || new Date(),
      endDate: customDateRange.endDate || new Date(),
    });
  };

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      // Load statistics data
      // ...existing data loading code...
      setIsLoading(false);
    };

    loadStats();
  }, []);

  if (isLoading) {
    return <LoadingScreen title="Estadísticas" subtitle="Cargando datos analíticos..." />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Estadísticas del Restaurante</h1>

        </div>
      </header>

      <div className="p-6">
        {/* Dashboard Summary Cards */}
        <DashboardCards
          loading={loading}
          dashboardStats={dashboardStats}
        />

        {/* Navigation and Controls Container */}
        <div className="rounded-lg shadow-sm border border-gray-200 mb-6">
          {/* Two-section layout: tabs on left, date picker on right */}
          <div className="flex flex-col md:flex-row justify-between border-b border-gray-200">
            {/* Tab Navigation */}
            <div className="flex overflow-x-auto scrollbar-hide">
              {/*
                { id: "overview", label: "Vista General" },
                { id: "orders", label: "Pedidos" },
                { id: "tables", label: "Mesas" },
                { id: "reservations", label: "Reservas" },
                { id: "users", label: "Usuarios" },
                { id: "payments", label: "Pagos" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`whitespace-nowrap bg-transparent px-6 py-4 font-medium text-sm transition-colors duration-200 
                    ${activeTab === tab.id 
                      ? "text-blue-600 border-b-2 border-blue-600 font-semibold" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
              */}
              <button
                className={`whitespace-nowrap bg-transparent px-6 py-4 font-medium text-sm transition-colors duration-200 
                  ${activeTab === "overview"
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setActiveTab("overview")}
              >
                Vista General
              </button>
              <button
                className={`whitespace-nowrap bg-transparent px-6 py-4 font-medium text-sm transition-colors duration-200 
                  ${activeTab === "orders"
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setActiveTab("orders")}
              >
                Pedidos
              </button>
              <button
                className={`whitespace-nowrap bg-transparent px-6 py-4 font-medium text-sm transition-colors duration-200 
                  ${activeTab === "tables"
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setActiveTab("tables")}
              >
                Mesas
              </button>
              {/* <button
                className={`whitespace-nowrap bg-transparent px-6 py-4 font-medium text-sm transition-colors duration-200 
                  ${activeTab === "reservations"
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setActiveTab("reservations")}
              >
                Reservas
              </button> */}
              <button
                className={`whitespace-nowrap bg-transparent px-6 py-4 font-medium text-sm transition-colors duration-200 
                  ${activeTab === "users"
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setActiveTab("users")}
              >
                Usuarios
              </button>
              <button
                className={`whitespace-nowrap bg-transparent px-6 py-4 font-medium text-sm transition-colors duration-200 
                  ${activeTab === "payments"
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                onClick={() => setActiveTab("payments")}
              >
                Pagos
              </button>
            </div>

            {/* Date Range Picker */}
            <div className="flex items-center p-2 md:pr-4 bg-white">
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg shadow-sm">

                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    className="bg-transparent border-0 outline-none px-2 py-1 text-gray-900 date-input-dark"
                    max={customDateRange.endDate instanceof Date ? customDateRange.endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                    value={customDateRange.startDate instanceof Date ? customDateRange.startDate.toISOString().split('T')[0] : ''}
                    onChange={handleStartDateChange}
                  />

                  <span className="text-gray-500 font-medium">a</span>

                  <input
                    type="date"
                    className="bg-transparent border-0 outline-none px-2 py-1 text-gray-900 date-input-dark"
                    min={customDateRange.startDate instanceof Date ? customDateRange.startDate.toISOString().split('T')[0] : ''}
                    max={new Date().toISOString().split('T')[0]}
                    value={customDateRange.endDate instanceof Date ? customDateRange.endDate.toISOString().split('T')[0] : ''}
                    onChange={handleEndDateChange}
                  />
                </div>

                <div className="flex space-x-2 ml-2">
                  <button
                    className="bg-gray-200 text-gray-700 p-1.5 rounded-full hover:bg-gray-300 transition-colors"
                    onClick={resetDatesToToday}
                    title="Resetear a hoy"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                    onClick={handleDateRangeChange}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <OverviewStats
                loading={loading}
                ordersByHour={ordersByHour}
                popularItems={popularItems}
                ensureArray={ensureArray}
                LoadingIndicator={LoadingIndicator}
                NoDataMessage={NoDataMessage}
                formatDate={formatDate}
              />
            )}

            {activeTab === "orders" && (
              <OrdersStats
                loading={loading}
                ordersByHour={ordersByHour}
                popularItems={popularItems}
                ensureArray={ensureArray}
                LoadingIndicator={LoadingIndicator}
                NoDataMessage={NoDataMessage}
                timeRange={timeRange}
                formatDate={formatDate}
              />
            )}

            {activeTab === "tables" && (
              <TablesStats
                loading={loading}
                tableData={tableData}
                ensureArray={ensureArray}
                LoadingIndicator={LoadingIndicator}
                NoDataMessage={NoDataMessage}
                formatDate={formatDate}
              />
            )}

            {activeTab === "reservations" && !( //*desactivada
              <ReservationsStats
                loading={loading}
                reservations={reservations}
                ensureArray={ensureArray}
                LoadingIndicator={LoadingIndicator}
                NoDataMessage={NoDataMessage}
                formatDate={formatDate}
              />
            )}

            {activeTab === "users" && (
              <>
                <UsersStats
                  loading={loading}
                  usersData={usersData}
                  ensureArray={ensureArray}
                  LoadingIndicator={LoadingIndicator}
                  NoDataMessage={NoDataMessage}
                  timeRange={timeRange}
                  formatDate={formatDate}
                />
              </>
            )}

            {activeTab === "payments" && (
              <PaymentsStats
                loading={loading.payments}
                paymentsData={paymentsData}
                ensureArray={ensureArray}
                LoadingIndicator={LoadingIndicator}
                NoDataMessage={NoDataMessage}
                timeRange={timeRange}
                formatDate={formatDate}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}