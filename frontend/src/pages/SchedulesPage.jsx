import { useState, useEffect, useCallback } from 'react';
import { scheduleViewApi } from '../api/services';
import toast from 'react-hot-toast';
import { HiOutlineCalendarDays, HiOutlineEye, HiOutlineUserGroup, HiOutlineBuildingOffice2, HiOutlineAcademicCap } from 'react-icons/hi2';

const DAYS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const DAY_LABELS = { LUNES: 'LUN', MARTES: 'MAR', MIERCOLES: 'MIÉ', JUEVES: 'JUE', VIERNES: 'VIE', SABADO: 'SÁB' };

const SLOTS = [
  { start: '06:00', end: '08:00' },
  { start: '08:00', end: '10:00' },
  { start: '10:00', end: '12:00' },
  { start: '12:00', end: '14:00' },
  { start: '14:00', end: '16:00' },
  { start: '16:00', end: '18:00' },
  { start: '18:00', end: '20:00' },
  { start: '20:00', end: '22:00' },
];

// Paleta de colores por grupo — se asigna dinámicamente
const GROUP_PALETTES = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', badge: '#3b82f6' },
  { bg: '#dcfce7', border: '#22c55e', text: '#15803d', badge: '#22c55e' },
  { bg: '#fef3c7', border: '#f59e0b', text: '#b45309', badge: '#f59e0b' },
  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d', badge: '#ec4899' },
  { bg: '#ede9fe', border: '#8b5cf6', text: '#6d28d9', badge: '#8b5cf6' },
  { bg: '#ffedd5', border: '#f97316', text: '#c2410c', badge: '#f97316' },
  { bg: '#cffafe', border: '#06b6d4', text: '#0e7490', badge: '#06b6d4' },
  { bg: '#f0fdf4', border: '#16a34a', text: '#14532d', badge: '#16a34a' },
];

// Asigna colores a grupos de forma estable basándose en el grupo_id
const buildGroupColorMap = (rows) => {
  const map = {};
  let idx = 0;
  for (const r of rows) {
    const key = r.grupo_id || r.grupo_codigo;
    if (key && !map[key]) {
      map[key] = GROUP_PALETTES[idx % GROUP_PALETTES.length];
      idx++;
    }
  }
  return map;
};

// Extrae las asignaciones planas del objeto agrupado por día
const flattenView = (view) => {
  if (!view) return [];
  return Object.values(view).flat();
};

export default function SchedulesPage() {
  const [horarios, setHorarios] = useState([]);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingView, setLoadingView] = useState(false);
  const [filterGrupo, setFilterGrupo] = useState('');
  const [filterDocente, setFilterDocente] = useState('');
  const [groupColorMap, setGroupColorMap] = useState({});

  useEffect(() => {
    scheduleViewApi.getAll()
      .then(r => setHorarios(r.data || []))
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const loadView = async (id) => {
    setSelected(id);
    setView(null);
    setStats(null);
    setFilterGrupo('');
    setFilterDocente('');
    setLoadingView(true);
    try {
      const [v, s] = await Promise.all([
        scheduleViewApi.getView(id),
        scheduleViewApi.getStats(id),
      ]);
      const data = v.data;
      setView(data);
      setStats(s.data);
      // Construir mapa de colores con todas las asignaciones
      setGroupColorMap(buildGroupColorMap(flattenView(data)));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoadingView(false);
    }
  };

  // Obtener items de una celda (dia + franja horaria)
  const getSlotItems = useCallback((dia, start) => {
    if (!view || !view[dia]) return [];
    return view[dia].filter(a => {
      const as = a.hora_inicio?.substring(0, 5);
      return as === start;
    });
  }, [view]);

  // Opciones únicas para filtros
  const allRows = flattenView(view);
  const grupoOptions = [...new Map(allRows.map(r => [r.grupo_id, r.grupo_codigo])).entries()];
  const docenteOptions = [...new Map(
    allRows.filter(r => r.docente_nombre).map(r => [r.docente_nombre + r.docente_apellido, r])
  ).entries()].map(([, r]) => r);

  // Aplicar filtros localmente
  const getFilteredItems = useCallback((dia, start) => {
    let items = getSlotItems(dia, start);
    if (filterGrupo) items = items.filter(i => i.grupo_id === filterGrupo || i.grupo_codigo === filterGrupo);
    if (filterDocente) items = items.filter(i => i.docente_nombre === filterDocente);
    return items;
  }, [getSlotItems, filterGrupo, filterDocente]);

  // Detectar qué días tienen al menos una asignación (para no mostrar columnas vacías)
  const activeDays = DAYS.filter(d =>
    SLOTS.some(s => getFilteredItems(d, s.start).length > 0)
  );
  const visibleDays = activeDays.length > 0 ? activeDays : DAYS;

  const hasView = selected && view && !loadingView;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Visualización de Horarios</h1>
        <p>Consulta los horarios generados por el motor de asignación</p>
      </div>

      {/* ── Lista de horarios ── */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3><HiOutlineCalendarDays /> Horarios disponibles</h3>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Estado</th>
                  <th>Estrategia</th>
                  <th>Fecha</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {horarios.length === 0 ? (
                  <tr><td colSpan={5}><div className="empty-state"><p>No hay horarios generados</p></div></td></tr>
                ) : horarios.map(h => (
                  <tr key={h.id} style={{ background: selected === h.id ? 'var(--bg-elevated)' : '' }}>
                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>{h.id?.substring(0, 8)}...</td>
                    <td>
                      <span className={`badge ${h.estado === 'PUBLICADO' ? 'badge-green' : h.estado === 'VALIDADO' ? 'badge-blue' : 'badge-orange'}`}>
                        {h.estado}
                      </span>
                    </td>
                    <td>{h.estrategia || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(h.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => loadView(h.id)}
                        disabled={loadingView && selected === h.id}
                      >
                        <HiOutlineEye /> {selected === h.id && loadingView ? 'Cargando...' : 'Ver'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Grilla del horario ── */}
      {loadingView && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Cargando horario...</p>
        </div>
      )}

      {hasView && (
        <div className="card fade-in">
          {/* Header + stats */}
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <h3>📊 Grilla del Horario</h3>
            {stats && (
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: 'var(--font-xs)', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HiOutlineAcademicCap /> {stats.total_asignaciones} asignaciones
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HiOutlineUserGroup /> {stats.total_docentes} docentes
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HiOutlineBuildingOffice2 /> {stats.total_aulas} aulas · {stats.dias_usados} días
                </span>
              </div>
            )}
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '1rem', padding: '0 0 1rem 0', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ maxWidth: 200, fontSize: 'var(--font-sm)' }}
              value={filterGrupo}
              onChange={e => setFilterGrupo(e.target.value)}
            >
              <option value="">Todos los grupos</option>
              {grupoOptions.map(([id, codigo]) => (
                <option key={id} value={id}>{codigo}</option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ maxWidth: 220, fontSize: 'var(--font-sm)' }}
              value={filterDocente}
              onChange={e => setFilterDocente(e.target.value)}
            >
              <option value="">Todos los docentes</option>
              {docenteOptions.map((r, i) => (
                <option key={i} value={r.docente_nombre}>
                  {r.docente_nombre} {r.docente_apellido}
                </option>
              ))}
            </select>

            {(filterGrupo || filterDocente) && (
              <button
                className="btn btn-sm"
                style={{ fontSize: 'var(--font-sm)' }}
                onClick={() => { setFilterGrupo(''); setFilterDocente(''); }}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Leyenda de colores por grupo */}
          {!filterGrupo && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {grupoOptions.map(([id, codigo]) => {
                const palette = groupColorMap[id] || GROUP_PALETTES[0];
                return (
                  <span
                    key={id}
                    style={{
                      padding: '2px 10px',
                      borderRadius: 12,
                      fontSize: 'var(--font-xs)',
                      fontWeight: 600,
                      background: palette.bg,
                      color: palette.text,
                      border: `1.5px solid ${palette.border}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => setFilterGrupo(id)}
                  >
                    {codigo}
                  </span>
                );
              })}
            </div>
          )}

          {/* Tabla del horario */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'var(--font-xs)',
              tableLayout: 'fixed',
            }}>
              <colgroup>
                <col style={{ width: 80 }} />
                {visibleDays.map(d => <col key={d} />)}
              </colgroup>

              <thead>
                <tr>
                  <th style={thStyle}>Hora</th>
                  {visibleDays.map(d => (
                    <th key={d} style={thStyle}>{DAY_LABELS[d]}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {SLOTS.map((slot, si) => {
                  // Verificar si esta fila tiene algo visible
                  const rowHasContent = visibleDays.some(d => getFilteredItems(d, slot.start).length > 0);

                  return (
                    <tr key={slot.start} style={{ background: si % 2 === 0 ? 'var(--bg-base)' : 'var(--bg-elevated)' }}>
                      {/* Columna de hora */}
                      <td style={timeColStyle}>
                        <span style={{ fontWeight: 700, display: 'block' }}>{slot.start}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{slot.end}</span>
                      </td>

                      {/* Celdas de cada día */}
                      {visibleDays.map(dia => {
                        const items = getFilteredItems(dia, slot.start);
                        return (
                          <td key={dia} style={cellStyle}>
                            {items.length === 0 ? null : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {items.map((item, i) => {
                                  const key = item.grupo_id || item.grupo_codigo;
                                  const palette = groupColorMap[key] || GROUP_PALETTES[i % GROUP_PALETTES.length];
                                  return (
                                    <div key={i} style={{
                                      background: palette.bg,
                                      border: `1.5px solid ${palette.border}`,
                                      borderRadius: 6,
                                      padding: '5px 7px',
                                      lineHeight: 1.35,
                                    }}>
                                      {/* Grupo badge */}
                                      <div style={{ marginBottom: 2 }}>
                                        <span style={{
                                          background: palette.badge,
                                          color: '#fff',
                                          borderRadius: 4,
                                          padding: '1px 5px',
                                          fontSize: 9,
                                          fontWeight: 700,
                                          letterSpacing: '0.04em',
                                          marginRight: 4,
                                        }}>
                                          {item.grupo_codigo}
                                        </span>
                                      </div>

                                      {/* Asignatura */}
                                      <div style={{
                                        fontWeight: 700,
                                        color: palette.text,
                                        fontSize: 11,
                                        marginBottom: 1,
                                        wordBreak: 'break-word',
                                      }}>
                                        {item.asignatura_nombre || '—'}
                                      </div>

                                      {/* Docente */}
                                      {item.docente_nombre && (
                                        <div style={{ color: palette.text, opacity: 0.75, fontSize: 10 }}>
                                          👤 {item.docente_nombre} {item.docente_apellido?.charAt(0)}.
                                        </div>
                                      )}

                                      {/* Aula */}
                                      <div style={{ color: palette.text, opacity: 0.75, fontSize: 10, marginTop: 1 }}>
                                        📍 {item.aula_codigo}{item.aula_nombre ? ` · ${item.aula_nombre}` : ''}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mensaje si no hay datos */}
          {allRows.length === 0 && (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <p>Este horario no tiene asignaciones registradas.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Estilos inline reutilizables ──────────────────────────────────────────────

const thStyle = {
  padding: '10px 8px',
  textAlign: 'center',
  fontWeight: 700,
  fontSize: 'var(--font-xs)',
  background: 'var(--bg-elevated)',
  borderBottom: '2px solid var(--border-color)',
  whiteSpace: 'nowrap',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const timeColStyle = {
  padding: '8px 10px',
  textAlign: 'center',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  borderRight: '1px solid var(--border-color)',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
};

const cellStyle = {
  padding: '4px 5px',
  verticalAlign: 'top',
  borderRight: '1px solid var(--border-color)',
  borderBottom: '1px solid var(--border-color)',
  minHeight: 60,
  minWidth: 120,
};
