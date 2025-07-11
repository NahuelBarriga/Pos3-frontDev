import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TablesStats = ({ 
  loading, 
  tableData,
  ensureArray,
  LoadingIndicator,
  NoDataMessage 
}) => {
  // Format revenue for tooltip and display
  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };

  // Custom tooltip for the revenue bar chart
  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded">
          <p className="font-semibold">Mesa {label}</p>
          <p className="text-blue-600">Ingreso Total: {formatCurrency(payload[0].value)}</p>
          <p className="text-sm text-gray-600">
            {payload[0].payload.orderCount} pedidos
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for the order count bar chart
  const OrdersTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded">
          <p className="font-semibold">Mesa {label}</p>
          <p className="text-blue-600">{`${payload[0].value} pedidos`}</p>
          <p className="text-sm text-gray-600">
            Ingreso: {formatCurrency(payload[0].payload.revenue)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Status de las mesas */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Estado Actual de las Mesas</h3>
        
        {loading.tables ? (
          <LoadingIndicator />
        ) : tableData && tableData.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {tableData.map(table => (
              <div 
                key={table.id} 
                className={`p-2 rounded-lg text-center ${
                  table.estado === 'ocupada' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}
              >
                <div className="font-medium">{table.numero}</div>
                <div className="text-xs">{table.estado === 'ocupada' ? 'Ocupada' : 'Libre'}</div>
              </div>
            ))}
          </div>
        ) : (
          <NoDataMessage message="No hay datos de mesas disponibles para mostrar" />
        )}
      </div>
      
      {/* Mesas con Más Pedidos */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Ocupación de las mesas</h3>
        <div className="h-64">
          {loading.tables ? (
            <LoadingIndicator />
          ) : tableData && tableData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={ensureArray(tableData)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="numero" 
                  type="category" 
                  width={80}
                  tickFormatter={(value) => `Mesa ${value}`}
                />
                <Tooltip content={<OrdersTooltip />} />
                <Legend />
                <Bar dataKey="orderCount" fill="#4f46e5" name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No hay datos de uso de mesas disponibles para mostrar" />
          )}
        </div>
      </div>

      {/* Mesas con Más Ingresos */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Ingresos por Mesa</h3>
        <div className="h-64">
          {loading.tables ? (
            <LoadingIndicator />
          ) : tableData && tableData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={ensureArray(tableData.sort((a, b) => b.revenue - a.revenue))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis 
                  dataKey="numero" 
                  type="category" 
                  width={80}
                  tickFormatter={(value) => `Mesa ${value}`}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Ingresos ($)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No hay datos de ingresos por mesa disponibles para mostrar" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TablesStats;
