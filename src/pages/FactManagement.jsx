import React, { useState } from 'react';
import { Database, Search, Plus, Edit, Trash2, Tag, BrainCircuit, Activity, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AuthInput } from '../components/ui/AuthInput';
import '../assets/styles/users.css';

const FactManagement = () => {
  const [activeTab, setActiveTab] = useState('SINTOMAS'); // 'SINTOMAS' o 'FALLAS'
  const [searchTerm, setSearchTerm] = useState('');

  // Datos quemados para propósitos de visualización (Mockup)
  const mockSintomas = [
    { id: 1, clave: 'no_enciende', descripcion: 'El equipo no da señales de energía, LEDs apagados.' },
    { id: 2, clave: 'pantalla_azul', descripcion: 'El equipo muestra una pantalla de error azul de Windows.' },
    { id: 3, clave: 'ruido_extraño', descripcion: 'Se escucha un pitido o rechinido mecánico al arrancar.' },
  ];

  const mockFallas = [
    { id: 1, tipo_equipo: 'PC', sintoma_asociado: 'no_enciende', falla_final: 'Fuente de poder dañada. Reemplazar fuente de 500W.' },
    { id: 2, tipo_equipo: 'Laptop', sintoma_asociado: 'no_enciende', falla_final: 'Batería interna inflada o placa base en corto. Requiere desarme.' },
    { id: 3, tipo_equipo: 'PC', sintoma_asociado: 'pantalla_azul', falla_final: 'Memoria RAM sucia o defectuosa. Limpiar pines.' },
  ];

  return (
    <DashboardLayout headerTitle="Gestión de Hechos (Base de Conocimiento)">
      <div className="users-container">

        {/* Tab Selector de Categoría Lógica */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(80, 75, 56, 0.1)', paddingBottom: '1rem' }}>
          <button
            onClick={() => setActiveTab('SINTOMAS')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
              backgroundColor: activeTab === 'SINTOMAS' ? 'var(--color-olive-dark)' : 'transparent',
              color: activeTab === 'SINTOMAS' ? '#FFF' : 'var(--color-olive-dark)'
            }}
          >
            <Tag size={18} />
            Diccionario de Síntomas Iniciales
          </button>
          
          <button
            onClick={() => setActiveTab('FALLAS')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
              backgroundColor: activeTab === 'FALLAS' ? 'var(--color-olive-dark)' : 'transparent',
              color: activeTab === 'FALLAS' ? '#FFF' : 'var(--color-olive-dark)'
            }}
          >
            <BrainCircuit size={18} />
            Árbol de Inferencias (Fallas Diagnósticas)
          </button>
        </div>

        {/* Cabecera Interactiva */}
        <div className="users-header-actions">
          <div className="search-bar">
            <AuthInput
              icon={Search}
              placeholder={activeTab === 'SINTOMAS' ? "Buscar por clave de síntoma..." : "Buscar inferencia diagnóstica..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required={false}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-refresh" title="Sincronizar motor Prolog">
              <RefreshCw size={20} />
            </button>
            <button className="btn-add-user" style={{ backgroundColor: '#504b38' }}>
              <Plus size={20} />
              {activeTab === 'SINTOMAS' ? 'Alta de Síntoma' : 'Alta de Inferencia'}
            </button>
          </div>
        </div>

        {/* Tabla Robusta Condicional */}
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              {activeTab === 'SINTOMAS' ? (
                <tr>
                  <th>Clave Única Lenguaje</th>
                  <th>Descripción del Síntoma (Mostrado a usuario)</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              ) : (
                <tr>
                  <th>Tipo Específico</th>
                  <th>Síntoma Asociado (Padre)</th>
                  <th>Veredicto Final del Experto (Falla / Solución)</th>
                  <th style={{ width: '120px' }}>Acciones</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeTab === 'SINTOMAS' ? (
                mockSintomas.map((sintoma) => (
                  <tr key={sintoma.id}>
                    <td data-label="Clave">
                      <div className="contact-cell">
                        <span style={{ fontWeight: '600' }}>{sintoma.clave}</span>
                      </div>
                    </td>
                    <td data-label="Descripción">
                      <div className="contact-cell">
                        <span style={{ color: '#4b5563' }}>{sintoma.descripcion}</span>
                      </div>
                    </td>
                    <td data-label="Acciones">
                      <div className="action-buttons">
                        <button className="btn-icon btn-edit" title="Editar Síntoma">
                          <Edit size={18} />
                        </button>
                        <button className="btn-icon btn-delete" title="Remover Síntoma">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                mockFallas.map((falla) => (
                  <tr key={falla.id}>
                    <td data-label="Tipo">
                      <span className={`role-badge ${falla.tipo_equipo === 'Laptop' ? 'role-técnico' : 'role-administrador'}`}>
                        {falla.tipo_equipo}
                      </span>
                    </td>
                    <td data-label="Síntoma Ascendente">
                      <div className="contact-cell">
                        <span style={{ fontWeight: '600' }}><Tag size={14} style={{ display: 'none' }} /> {falla.sintoma_asociado}</span>
                      </div>
                    </td>
                    <td data-label="Veredicto Final">
                      <div className="contact-cell" style={{ whiteSpace: 'normal', maxWidth: '400px' }}>
                        <span>{falla.falla_final}</span>
                      </div>
                    </td>
                    <td data-label="Acciones">
                      <div className="action-buttons">
                        <button className="btn-icon btn-edit" title="Editar Regla Dialéctica">
                          <Edit size={18} />
                        </button>
                        <button className="btn-icon btn-delete" title="Borrar Regla">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              
              {/* Fallback visual vacio */}
              {mockSintomas.length === 0 && mockFallas.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'SINTOMAS' ? "3" : "4"} style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                    <Database size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>No existen hechos en la base de datos para esta métrica.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default FactManagement;
