import axios from "axios";
import api from "./api"; // Assuming api is imported from a central file
import statsDTO from "../models/statsDTO";

const API_URL = `/stats`; // Example, adjust if API_BASE_URL is for the whole backend

// Helper function to format dates consistently
const formatDateParam = (date) => {
  if (!date) return undefined;

  if (date instanceof Date) {
    return date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  }

  return date; // Return as is if already formatted
};

// Helper to prepare timeRange parameters consistently
const prepareTimeRangeParams = (timeRange) => {
  if (!timeRange) return {};

  return {
    startDate: formatDateParam(timeRange.startDate),
    endDate: formatDateParam(timeRange.endDate),
  };
};

export const getDashboardStats = async (timeRange) => {
  try {
    const params = prepareTimeRangeParams(timeRange);
    const response = await api.get(`${API_URL}/dashboard`, { params });
    return new statsDTO(response.data);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return default data structure if API fails
    return {
      totalOrdersToday: 0,
      totalOrdersYesterday: 0,
      totalTablesOccupied: 0,
      totalTables: 0,
      mostPopularItem: { nombre: "N/A", count: 0, SKU: "N/A" },
      reservationsToday: 0,
    };
  }
};

export const getOrdersByHour = async (timeRange) => {
  try {
    const params = prepareTimeRangeParams(timeRange);
    console.log("Fetching orders by hour with params:", params);

    // Update the endpoint to match the backend route defined in statsRoute.js
    const response = await api.get(`${API_URL}/orders-by-hour`, { params });

    console.log("Orders hourly API response:", response.data);
    return response.data || [];
  } catch (error) {
    console.error(
      "Error fetching orders by hour:",
      error.response?.data || error.message
    );
  }
};

export const getPopularItems = async (timeRange) => {
  try {
    const quantity = 5; 
    const params = { ...prepareTimeRangeParams(timeRange), quantity};
    const response = await api.get(`${API_URL}/popular-items`, { params });
    response.data = transformItemData(response.data, quantity);
    return response.data || { topItems: [], hourlyData: [], topQuantItems: [] };
  } catch (error) {
    console.error("Error fetching popular items:", error);
    return { topItems: [], hourlyData: [], topQuantItems: [] };
  }
};

function transformItemData(data, quantity) {
  const { popularItems, hourlyData } = data;
  const topQuantItems = popularItems || [];

  // Paso 1: obtener nombres únicos
  const allItemNames = new Set();
  hourlyData.forEach(({ itemList }) =>
    itemList.forEach((item) => allItemNames.add(item.nombre))
  );

  // Paso 2: transformar hourlyData al formato para LineChart
  const parsedHourlyData = hourlyData.map(({ hour, itemList }) => {
    const row = { hour };
    allItemNames.forEach((name) => {
      const match = itemList.find((item) => item.nombre === name);
      row[name] = match ? match.count : 0;
    });
    return row;
  });

  const topQuantItemsSorted = topQuantItems.sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, quantity)
    .map((item) => ({
      ...item,
      totalSpent: item.totalSpent.toFixed(2), // Formatear a 2 decimales
    }));

  return {
    topItems: popularItems,       // renombrás si querés, o dejás igual
    hourlyData: parsedHourlyData, // este lo usás directamente en el gráfico
    topQuantItems: topQuantItemsSorted, // Top items por cantidad
  };
}

export const getTableData = async (timeRange) => {
  try {
    const params = prepareTimeRangeParams(timeRange);
    const response = await api.get("/stats/tables", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching table data:", error);
    return [];
  }
};

export const getReservationsData = async (timeRange) => {
  try {
    const params = prepareTimeRangeParams(timeRange);
    // Try the endpoint path with the correct route name - should be '/reservations' but might be different
    const response = await api.get(`${API_URL}/reservations`, { params });

    if (
      !response.data ||
      (Array.isArray(response.data.reservations) &&
        response.data.reservations.length === 0)
    ) {
      // If main endpoint fails or returns empty, try alternative endpoint
      try {
        console.log("Trying alternative endpoint for reservations");
        const altResponse = await api.get(`/stats/reservations`, { params });
        console.log("Alternative endpoint response:", altResponse.data);
        return altResponse.data || { reservations: [], todaysReservations: [] };
      } catch (altError) {
        console.error(
          "Error with alternative endpoint:",
          altError.response?.data || altError.message
        );
        return { reservations: [], todaysReservations: [] };
      }
    }

    return response.data || { reservations: [], todaysReservations: [] };
  } catch (error) {
    console.error(
      "Error fetching reservations data:",
      error.response?.data || error.message
    );

    // Try alternative endpoint format as fallback
    try {
      console.log("Trying alternative endpoint after initial failure");
      const altResponse = await api.get(`/stats/reservations`, {
        params: prepareTimeRangeParams(timeRange),
      });
      return altResponse.data || { reservations: [], todaysReservations: [] };
    } catch (secondError) {
      console.error(
        "Error with alternative endpoint:",
        secondError.response?.data || secondError.message
      );
      // Return structured empty result
      return { reservations: [], todaysReservations: [] };
    }
  }
};

export const getUsersStats = async (timeRange) => {
  try {
    const params = prepareTimeRangeParams(timeRange);
    const response = await api.get(`${API_URL}/users-stats`, { params });

    // Ensure we return a properly structured response even if parts are missing
    const data = response.data || [];

    data.retentionStats.totalActiveClients =
      data.retentionStats.newClients + data.retentionStats.returningClients;
    data.retentionStats.retentionRate =
      data.retentionStats.returningClients /
        data.retentionStats.totalActiveClients || 0;
    const orderBreakdown = {
      totalOrders: data.clientSpending.reduce(
        (sum, client) => sum + client.orderCount,
        0
      ),
      employeeOrders: data.clientSpending
        .filter((client) => client.role !== "cliente")
        .reduce((sum, client) => sum + client.orderCount, 0),
      clientOrders: data.clientSpending
        .filter((client) => client.role === "cliente")
        .reduce((sum, client) => sum + client.orderCount, 0),
    };
    orderBreakdown.employeeOrderPercentage =
      orderBreakdown.employeeOrders / orderBreakdown.totalOrders || 0;
    orderBreakdown.clientOrderPercentage =
      orderBreakdown.clientOrders / orderBreakdown.totalOrders || 0;

    return {
      clientSpending: Array.isArray(data.clientSpending)
        ? data.clientSpending
        : [],
      retentionStats: data.retentionStats || {
        totalActiveClients: 0,
        newClients: 0,
        returningClients: 0,
        retentionRate: 0,
      },
      orderBreakdown: orderBreakdown || {
        totalOrders: 0,
        employeeOrders: 0,
        clientOrders: 0,
        employeeOrderPercentage: 0,
        clientOrderPercentage: 0,
      },
    };
  } catch (error) {
    console.error(
      "Error fetching users stats:",
      error.response?.data || error.message
    );
    // Return structured mock data for testing
    return {
      clientSpending: [],
      retentionStats: {
        totalActiveClients: 0,
        newClients: 0,
        returningClients: 0,
        retentionRate: 0,
      },
      orderBreakdown: {
        totalOrders: 0,
        employeeOrders: 0,
        clientOrders: 0,
        employeeOrderPercentage: 0,
        clientOrderPercentage: 0,
      },
    };
  }
};

export const getCategoryStats = async (timeRange) => {
  try {
    const params = prepareTimeRangeParams(timeRange);
    const response = await api.get(`${API_URL}/categories`, { params });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching category stats:", error);
    return [];
  }
};

export const getPaymentsData = async (timeRange) => {
  try {
    const params = prepareTimeRangeParams(timeRange);
    const response = await api.get(`${API_URL}/payments`, { params });

    return (
      response.data || {
        methodBreakdown: [],
        dailyPayments: [],
      }
    );
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return {
      methodBreakdown: [],
      dailyPayments: [],
    };
  }
};
