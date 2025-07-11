import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const PaymentsStats = ({ loading, paymentsData, ensureArray, LoadingIndicator, NoDataMessage }) => {
  const methodBreakdown = ensureArray(paymentsData?.methodBreakdown || []);
  const dailyPayments = ensureArray(paymentsData?.dailyPayments || []);


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Method Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Distribución por Método de Pago</h3>
          {loading ? (
            <LoadingIndicator />
          ) : methodBreakdown.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {methodBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Monto']}
                    labelFormatter={(name) => `Método: ${name}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoDataMessage message="No hay datos disponibles para la distribución de pagos." />
          )}
        </div>

        {/* Payment Method Count */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Número de Transacciones por Método</h3>
          {loading ? (
            <LoadingIndicator />
          ) : methodBreakdown.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={methodBreakdown}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Transacciones']} />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Transacciones" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoDataMessage message="No hay datos disponibles para la cantidad de transacciones." />
          )}
        </div>
      </div>

      {/* Daily Payment Trends */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Tendencia Diaria de Pagos</h3>
        {loading ? (
          <LoadingIndicator />
        ) : dailyPayments.length > 0 ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyPayments}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (name === 'amount') {
                      return [`$${value.toFixed(2)}`, 'Monto Total'];
                    } else if (name === 'count') {
                      return [value, 'Número de Transacciones'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Fecha: ${label}`}
                  separator=": "
                />
                <Legend />
                <Bar yAxisId="left" dataKey="amount" fill="#8884d8" name="Monto Total ($)" />
                <Bar yAxisId="right" dataKey="count" fill="#82ca9d" name="Número de Transacciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <NoDataMessage message="No hay datos disponibles para la tendencia diaria de pagos." />
        )}
      </div>

      {/* Payment Method Details Table */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Detalles de Métodos de Pago</h3>
        {loading ? (
          <LoadingIndicator />
        ) : methodBreakdown.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número de Transacciones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promedio por Transacción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% del Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {methodBreakdown.map((method, index) => {
                  const totalAmount = methodBreakdown.reduce((sum, item) => sum + item.amount, 0);
                  const percentage = (method.amount / totalAmount) * 100;
                  const averagePerTransaction = method.count > 0 ? method.amount / method.count : 0;
                  
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{method.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${method.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{method.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${averagePerTransaction.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{percentage.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <NoDataMessage message="No hay datos disponibles para los detalles de métodos de pago." />
        )}
      </div>
    </div>
  );
};

export default PaymentsStats;
