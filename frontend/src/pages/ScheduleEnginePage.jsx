import { useState } from 'react';
import { scheduleEngineApi } from '../api/services';
import toast from 'react-hot-toast';
import { HiOutlineCog6Tooth, HiOutlineRocketLaunch, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2';

export default function ScheduleEnginePage() {
  const [periodoId, setPeriodoId] = useState('');
  const [strategy, setStrategy] = useState('greedy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    if (!periodoId.trim()) { toast.error('Ingresa el ID del periodo académico'); return; }
    setLoading(true); setResult(null);
    try {
      const res = await scheduleEngineApi.generate({ periodoId, estrategia: strategy });
      setResult(res.data);
      toast.success('¡Horario generado exitosamente!');
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Motor de Generación</h1>
        <p>Genera horarios automáticamente con validación de restricciones</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header"><h3><HiOutlineCog6Tooth /> Configuración</h3></div>
        <div className="form-group">
          <label>ID del Periodo Académico</label>
          <input className="form-control" value={periodoId} onChange={e => setPeriodoId(e.target.value)} placeholder="UUID del periodo (ver tabla periodos_academicos)" />
        </div>
        <div className="form-group">
          <label>Estrategia de Generación</label>
          <select className="form-control" value={strategy} onChange={e => setStrategy(e.target.value)}>
            <option value="greedy">🚀 Greedy (Voraz) — Rápida</option>
            <option value="backtracking">🔍 Backtracking — Exhaustiva</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={loading}>
            {loading ? <><span className="spinner" /> Generando...</> : <><HiOutlineRocketLaunch /> Generar Horario</>}
          </button>
        </div>
      </div>

      {result && (
        <div className="card fade-in">
          <div className="card-header">
            <h3>{result.estado === 'VALIDADO' ? <><HiOutlineCheckCircle style={{ color: 'var(--success-400)' }} /> Resultado: VALIDADO</> : <><HiOutlineExclamationTriangle style={{ color: 'var(--warning-400)' }} /> Resultado: {result.estado}</>}</h3>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><HiOutlineCog6Tooth /></div>
              <div className="stat-info"><h3>{result.generacion?.strategy}</h3><p>Estrategia usada</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><HiOutlineCheckCircle /></div>
              <div className="stat-info"><h3>{result.generacion?.assigned}/{result.generacion?.totalGrupos}</h3><p>Grupos asignados</p></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><HiOutlineExclamationTriangle /></div>
              <div className="stat-info"><h3>{result.validacion?.errors || 0}</h3><p>Conflictos detectados</p></div>
            </div>
          </div>

          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
            <p><strong>Horario ID:</strong> <code style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px' }}>{result.horarioId}</code></p>
            <p style={{ marginTop: '0.5rem' }}><strong>Intentos:</strong> {result.generacion?.attempts} | <strong>Warnings:</strong> {result.validacion?.warnings || 0}</p>
          </div>

          {result.noAsignados?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ color: 'var(--danger-400)', marginBottom: '0.5rem' }}>Grupos no asignados:</h4>
              <div className="table-container"><table>
                <thead><tr><th>Grupo</th><th>Razón</th></tr></thead>
                <tbody>{result.noAsignados.map((n, i) => (
                  <tr key={i}><td>{n.grupoCodigo || n.grupoId}</td><td>{n.razon}</td></tr>
                ))}</tbody>
              </table></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

