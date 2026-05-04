import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { academicApi, teacherApi, classroomApi, scheduleViewApi } from '../api/services';
import { HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineBuildingOffice2, HiOutlineCalendarDays } from 'react-icons/hi2';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ programas: 0, docentes: 0, aulas: 0, horarios: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [prg, doc, aul, hor] = await Promise.allSettled([
          academicApi.getProgramas(),
          teacherApi.getAll(),
          classroomApi.getAll(),
          scheduleViewApi.getAll(),
        ]);
        setStats({
          programas: prg.status === 'fulfilled' ? prg.value?.data?.length || 0 : 0,
          docentes: doc.status === 'fulfilled' ? doc.value?.data?.length || 0 : 0,
          aulas: aul.status === 'fulfilled' ? aul.value?.data?.length || 0 : 0,
          horarios: hor.status === 'fulfilled' ? hor.value?.data?.length || 0 : 0,
        });
      } catch { /* ignore */ }
      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Panel de Control</h1>
        <p>Bienvenido, {user?.nombre || 'Usuario'}. Rol: {user?.rol}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><HiOutlineAcademicCap /></div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.programas}</h3>
            <p>Programas Académicos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><HiOutlineUserGroup /></div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.docentes}</h3>
            <p>Docentes Registrados</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><HiOutlineBuildingOffice2 /></div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.aulas}</h3>
            <p>Aulas Disponibles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><HiOutlineCalendarDays /></div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.horarios}</h3>
            <p>Horarios Generados</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Acerca del Sistema</h2>
        </div>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <p><strong>Agenda Fácil</strong> es un sistema de programación de horarios académicos con motor de generación basado en restricciones.</p>
          <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
            <li>📚 Gestiona programas, asignaturas y grupos</li>
            <li>👨‍🏫 Administra docentes y su disponibilidad horaria</li>
            <li>🏫 Controla aulas y su capacidad</li>
            <li>⚙️ Genera horarios automáticamente evitando conflictos</li>
            <li>📊 Visualiza horarios por docente, aula o grupo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

