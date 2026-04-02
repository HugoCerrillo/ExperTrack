import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

//pagina para el dashsboard reutilizando componentes y sera diferente para cada usuaario
const Dashboard = () => {
  return (
    <DashboardLayout headerTitle="Administrador">

      <div>
        <h1 style={{ color: '#504b38', marginBottom: '1rem' }}>Bienvenido al Panel de Control</h1>
        <p style={{ color: '#504b38' }}>Selecciona una opción del menú lateral para comenzar. El diseño está acoplado perfectamente a la paleta institucional.</p>
      </div>

    </DashboardLayout>
  );
};

export default Dashboard;
