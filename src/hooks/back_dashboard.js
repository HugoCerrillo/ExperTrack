import { useState, useCallback } from 'react';

const API_URL = '/api';

export const useDashboardStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/dashboard/stats`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await response.json();
            
            if (response.ok && data.status === 'success') {
                setStats({
                    rol: data.rol,
                    data: data.data
                });
                setError(null);
            } else {
                setError(data.message || 'Error al cargar las estadísticas');
                setStats(null);
            }
        } catch (err) {
            console.error("Error al obtener stats del dashboard:", err);
            setError("Error de conexión al servidor");
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        stats,
        loading,
        error,
        fetchStats
    };
};
