import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { getCategoryStats } from "../../services/statsHelper";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
];

const OrdersStats = ({
  loading,
  ordersByHour,
  popularItems,
  ensureArray,
  LoadingIndicator,
  NoDataMessage,
  timeRange,
}) => {
  const [categoryStats, setCategoryStats] = useState({
    categories: [],
    totalOrders: 0,
  });
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch category stats
  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        setLoadingCategories(true);
        const data = await getCategoryStats(timeRange);
        data.totalOrders = data.categories.reduce(
          (sum, category) => sum + category.count,
          0
        );
        setCategoryStats(data);
      } catch (error) {
        console.error("Error fetching category stats:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategoryStats();
  }, [timeRange]);

  // Custom tooltip for the composed chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-sm text-blue-600">{`Pedidos: ${payload[0].value}`}</p>
          {payload[1] && (
            <p className="text-sm text-green-600">{`Valor promedio: $${payload[1].value.toFixed(
              2
            )}`}</p>
          )}
          {/* Add total income information */}
          {payload[0].payload.totalAmount && (
            <p className="text-sm text-purple-600">{`Ingreso total: $${payload[0].payload.totalAmount.toFixed(
              2
            )}`}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Pedidos por hora con valor promedio */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            Pedidos y Valor Promedio por Hora
          </h3>
        </div>
        <div className="h-64">
          {loading.orders ? (
            <LoadingIndicator />
          ) : ordersByHour && ordersByHour.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={ensureArray(ordersByHour)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  name="Pedidos"
                  fill="#4f46e5"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgOrderValue"
                  name="Valor Promedio ($)"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No hay datos de pedidos disponibles para mostrar" />
          )}
        </div>
      </div>

      {/* Categorías más pedidas */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            Distribución por Categorías
          </h3>
        </div>
        <div className="h-64">
          {loadingCategories ? (
            <LoadingIndicator />
          ) : categoryStats.categories &&
            categoryStats.categories.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ensureArray(categoryStats.categories)}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {categoryStats.categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} (${(
                      (value / categoryStats.totalOrders) *
                      100
                    ).toFixed(1)}%)`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No hay datos de categorías disponibles para mostrar" />
          )}
        </div>
      </div>

      {/* Items más pedidos por hora (existing chart) */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            Top 5 Items por Hora
          </h3>
        </div>
        <div className="h-64">
          {loading.items ? (
            <LoadingIndicator />
          ) : popularItems.hourlyData && popularItems.hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ensureArray(popularItems.hourlyData)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(popularItems.hourlyData[0] || {})
                  .filter((key) => key !== "hour")
                  .map((itemName, index) => (
                    <Line
                      key={itemName}
                      type="monotone"
                      dataKey={itemName}
                      stroke={COLORS[index % COLORS.length]}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No hay datos de productos populares por hora para mostrar" />
          )}
        </div>
      </div>

      {/* Items Table Grouped by Category */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            Items por Categoría ABC
          </h3>
        </div>
        {loading.items ? (
          <LoadingIndicator />
        ) : popularItems.topItems && popularItems.topItems.length > 0 ? (
          <div className="space-y-6">
            {/* Group items by category and render tables */}
            
            {['A', 'B', 'C'].map(category => {
              const categoryItems = popularItems.topItems.filter(item => item.category === category);
              
              if (categoryItems.length === 0) return null;
              const totalCount = popularItems.topItems.reduce((sum, item) => sum + item.totalSpent, 0);
              
              return (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-gray-700">
                    Categoría {category} 
                    <span className="text-sm text-gray-500 ml-2">
                      ({categoryItems.length} items)
                    </span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg table-fixed">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-1/6 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b whitespace-nowrap">
                            Nombre
                          </th>
                          <th className="w-1/6 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b whitespace-nowrap">
                            SKU
                          </th>
                          <th className="w-1/6 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b whitespace-nowrap">
                            Cantidad Vendida
                          </th>
                          <th className="w-1/6 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b whitespace-nowrap">
                            Precio Unitario
                          </th>
                          <th className="w-1/6 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b whitespace-nowrap">
                            Total Generado
                          </th>
                          <th className="w-1/6 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b whitespace-nowrap">
                            % del Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {categoryItems.map((item, index) => (
                          <tr key={item.id || index} className="hover:bg-gray-50">
                            <td className="w-1/6 px-4 py-3 text-sm font-medium text-gray-900">
                              <div className="truncate" title={item.nombre || item.name}>
                                {item.nombre || item.name}
                              </div>
                            </td>
                            <td className="w-1/6 px-4 py-3 text-sm text-gray-500 text-center">
                              <div className="truncate" title={item.SKU || item.sku}>
                                {item.SKU || item.sku}
                              </div>
                            </td>
                            <td className="w-1/6 px-4 py-3 text-sm text-gray-900 text-center">
                              {item.count || 0}
                            </td>
                            <td className="w-1/6 px-4 py-3 text-sm text-gray-900 text-right">
                              ${item.precio?.toFixed(2) || item.unitPrice?.toFixed(2) || 'N/A'}
                            </td>
                            <td className="w-1/6 px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              ${item.totalSpent?.toFixed(2) || 'N/A'}
                            </td>
                            <td className="w-1/6 px-4 py-3 text-sm text-gray-500 text-center">
                              {((item.totalSpent / totalCount)*100)?.toFixed(1) || 'N/A'}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <NoDataMessage message="No hay datos de items populares para mostrar" />
        )}
      </div>
    </div>
  );
};

export default OrdersStats;
