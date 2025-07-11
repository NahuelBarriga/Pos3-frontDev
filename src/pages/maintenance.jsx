import React from "react";

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-50">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-yellow-700 mb-4">Sitio en mantenimiento</h1>
        <p className="text-gray-700 mb-6">
          Estamos realizando tareas de mantenimiento programadas.<br />
          Por favor, vuelve a intentarlo más tarde.
        </p>
        <img src="/public/logo-cafe.png" alt="Logo" className="mx-auto mb-4 w-24 h-24" />
        <p className="text-sm text-gray-500">Gracias por tu paciencia.</p>
      </div>
    </div>
  );
}
