import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const OverviewStats = ({ 
  loading, 
  ordersByHour, 
  popularItems, 
  ensureArray,
  LoadingIndicator,
  NoDataMessage 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pedidos por Hora */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Pedidos por Hora</h3>
        <div className="h-64">
          {loading.orders ? (
            <LoadingIndicator />
          ) : ordersByHour && ordersByHour.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ensureArray(ordersByHour)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No hay datos de pedidos disponibles para mostrar" />
          )}
        </div>
      </div>
      
      {/* Top items más pedidos */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Top 5 Items Más Pedidos</h3>
        <div className="h-64">
          {loading.items ? (
            <LoadingIndicator />
          ) : (popularItems.topQuantItems && popularItems.topQuantItems.length > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ensureArray(popularItems.topQuantItems)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="name"
                >
                  {ensureArray(popularItems.topQuantItems).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No hay datos de productos populares para mostrar" />
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewStats;
