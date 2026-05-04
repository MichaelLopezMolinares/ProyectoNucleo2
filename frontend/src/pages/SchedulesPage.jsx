import { useState, useEffect } from 'react';
import { scheduleViewApi } from '../api/services';
import toast from 'react-hot-toast';
import { HiOutlineCalendarDays, HiOutlineEye } from 'react-icons/hi2';

const DAYS = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
const SLOTS = [
  { start:'06:00', end:'08:00' }, { start:'08:00', end:'10:00' },
  { start:'10:00', end:'12:00' }, { start:'12:00', end:'14:00' },
  { start:'14:00', end:'16:00' }, { start:'16:00', end:'18:00' },
  { start:'18:00', end:'20:00' }, { start:'20:00', end:'22:00' },
];

export default function SchedulesPage() {
  const [horarios, setHorarios] = useState([]);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scheduleViewApi.getAll().then(r => setHorarios(r.data || [])).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const loadView = async (id) => {
    setSelected(id); setView(null); setStats(null);
    try {
      const [v, s] = await Promise.all([scheduleViewApi.getView(id), scheduleViewApi.getStats(id)]);
      setView(v.data); setStats(s.data);
    } catch (e) { toast.error(e.message); }
  };

  const getSlotItems = (dia, start, end) => {
    if (!view || !view[dia]) return [];
    return view[dia].filter(a => {
      const as = a.hora_inicio?.substring(0, 5);
      return as === start;
    });
  };

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Visualización de Horarios</h1><p>Consulta los horarios generados</p></div>

      {/* Lista de horarios */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header"><h3><HiOutlineCalendarDays /> Horarios disponibles</h3></div>
        {loading ? <div className="loading-page"><div className="spinner" /></div> : (
          <div className="table-container"><table>
            <thead><tr><th>ID</th><th>Estado</th><th>Estrategia</th><th>Fecha</th><th>Acción</th></tr></thead>
            <tbody>
              {horarios.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><p>No hay horarios generados</p></div></td></tr> :
                horarios.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>{h.id?.substring(0, 8)}...</td>
                    <td><span className={`badge ${h.estado === 'PUBLICADO' ? 'badge-green' : h.estado === 'VALIDADO' ? 'badge-blue' : 'badge-orange'}`}>{h.estado}</span></td>
                    <td>{h.estrategia || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(h.created_at).toLocaleDateString()}</td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => loadView(h.id)}><HiOutlineEye /> Ver</button></td>
                  </tr>
                ))
              }
            </tbody>
          </table></div>
        )}
      </div>

      {/* Grid del horario */}
      {selected && view && (
        <div className="card fade-in">
          <div className="card-header">
            <h3>📊 Grilla del Horario</h3>
            {stats && (
              <div style={{ display: 'flex', gap: '1rem', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                <span>📋 {stats.total_asignaciones} asignaciones</span>
                <span>👨‍🏫 {stats.total_docentes} docentes</span>
                <span>🏫 {stats.total_aulas} aulas</span>
              </div>
            )}
          </div>

          <div className="schedule-grid">
            {/* Header */}
            <div className="header-cell">Hora</div>
            {DAYS.map(d => <div key={d} className="header-cell">{d.substring(0, 3)}</div>)}

            {/* Rows */}
            {SLOTS.map(slot => (
              <>
                <div key={`t-${slot.start}`} className="time-cell">{slot.start}<br />{slot.end}</div>
                {DAYS.map(dia => {
                  const items = getSlotItems(dia, slot.start, slot.end);
                  return (
                    <div key={`${dia}-${slot.start}`} className="slot-cell">
                      {items.map((item, i) => (
                        <div key={i} className="slot-item">
                          <div className="slot-subject">{item.asignatura_nombre}</div>
                          <div className="slot-teacher">{item.docente_nombre} {item.docente_apellido?.charAt(0)}.</div>
                          <div className="slot-room">📍 {item.aula_codigo} - {item.aula_nombre}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

