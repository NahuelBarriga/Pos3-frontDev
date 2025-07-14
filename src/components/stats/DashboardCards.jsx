import React from 'react';
import { Calendar, Users, ShoppingBag, Coffee } from 'lucide-react';

const DashboardCards = ({ loading, dashboardStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Pedidos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Pedidos Hoy</h3>
          <div className="p-2 bg-blue-100 rounded-full">
            <ShoppingBag size={18} className="text-blue-600" />
          </div>
        </div>
        <div className="flex items-baseline">
          {loading.dashboard ? (
            <span className="text-3xl font-bold text-gray-300">...</span>
          ) : (
            <>
              <span className="text-3xl font-bold text-gray-900">{dashboardStats?.totalOrdersToday}</span>
              {dashboardStats?.totalOrdersYesterday > 0 && dashboardStats?.totalOrdersToday > 0 && (
                dashboardStats?.totalOrdersToday / dashboardStats?.totalOrdersYesterday >= 0 ? (
                  <span className="ml-2 text-sm text-green-500">{(((dashboardStats?.totalOrdersToday - dashboardStats?.totalOrdersYesterday) / dashboardStats?.totalOrdersYesterday) * 100).toFixed(1)}% mas que ayer</span>
                ) : (
                  <span className="ml-2 text-sm text-red-500">{(((dashboardStats?.totalOrdersYesterday - dashboardStats?.totalOrdersToday) / dashboardStats?.totalOrdersYesterday) * 100).toFixed(1)}% menos que ayer</span>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Mesas ocupadas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Mesas Ocupadas</h3>
          <div className="p-2 bg-green-100 rounded-full">
            <Users size={18} className="text-green-600" />
          </div>
        </div>
        <div className="flex items-baseline">
          {loading.dashboard ? (
            <span className="text-3xl font-bold text-gray-300">...</span>
          ) : (
            <>
              <span className="text-3xl font-bold text-gray-900">
                {dashboardStats?.totalTablesOccupied}/{dashboardStats?.totalTables}
              </span>
              {dashboardStats?.totalTables > 0 && dashboardStats?.totalTablesOccupied > 0 && (
                <span className="ml-2 text-sm text-gray-500">{((dashboardStats?.totalTablesOccupied / dashboardStats?.totalTables) * 100).toFixed(1)}% ocupación</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Item más popular */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Item Más Pedido</h3>
          <div className="p-2 bg-yellow-100 rounded-full">
            <Coffee size={18} className="text-yellow-600" />
          </div>
        </div>
        <div>
          {loading.dashboard ? (
            <span className="text-3xl font-bold text-gray-300">...</span>
          ) : (
            <>
              <div>
                <span className="text-3xl font-bold text-gray-900">{dashboardStats?.mostPopularItem?.name}</span>
                {dashboardStats?.mostPopularItem?.SKU && (
                  <span className="ml-2 text-sm text-gray-500">#{dashboardStats?.mostPopularItem?.SKU}</span>
                )}
              </div>

              <span className="text-sm text-gray-500">{dashboardStats?.mostPopularItem?.count} pedidos hoy</span>
            </>
          )}
        </div>
      </div>

      {/* Reservas */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Reservas para Hoy</h3>
          <div className="p-2 bg-purple-100 rounded-full">
            <Calendar size={18} className="text-purple-600" />
          </div>
        </div>
        <div className="flex items-baseline">
          {loading.dashboard ? (
            <span className="text-3xl font-bold text-gray-300">...</span>
          ) : (
            <div className="flex flex-col">
              <div className="text-3xl font-bold text-gray-900">{dashboardStats.reservationsToday}</div>
              {dashboardStats.nextReservationTime && (
                <div className="ml-2 text-sm text-gray-500">proxima: {dashboardStats.nextReservationTime}</div>
              )}
            </div>

          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
