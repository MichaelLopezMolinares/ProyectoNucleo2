import { useState, useEffect } from 'react';
import { academicApi } from '../api/services';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineUserGroup } from 'react-icons/hi2';

const TABS = ['Programas', 'Asignaturas', 'Grupos'];

export default function AcademicPage() {
  const [tab, setTab] = useState(0);
  const [programas, setProgramas] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: '', data: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, a, g] = await Promise.all([
        academicApi.getProgramas(), academicApi.getAsignaturas(), academicApi.getGrupos()
      ]);
      setProgramas(p.data || []);
      setAsignaturas(a.data || []);
      setGrupos(g.data || []);
    } catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openModal = (type, data = null) => setModal({ open: true, type, data });
  const closeModal = () => setModal({ open: false, type: '', data: null });

  // ─── Programa Form ────────────────────────────
  const ProgramaForm = () => {
    const [form, setForm] = useState(modal.data || { codigo: '', nombre: '', facultad: '' });
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (modal.data?.id) {
          await academicApi.updatePrograma(modal.data.id, form);
          toast.success('Programa actualizado');
        } else {
          await academicApi.createPrograma(form);
          toast.success('Programa creado');
        }
        closeModal(); loadData();
      } catch (err) { toast.error(err.message); }
    };
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Código</label>
            <input className="form-control" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Facultad</label>
            <input className="form-control" value={form.facultad} onChange={e => setForm({...form, facultad: e.target.value})} />
          </div>
        </div>
        <div className="form-group">
          <label>Nombre del programa</label>
          <input className="form-control" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{modal.data?.id ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    );
  };

  // ─── Asignatura Form ──────────────────────────
  const AsignaturaForm = () => {
    const [form, setForm] = useState(modal.data || { codigo: '', nombre: '', creditos: '', horasSemanales: '', semestre: '', programaId: '' });
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = { ...form, creditos: parseInt(form.creditos), horasSemanales: parseInt(form.horasSemanales), semestre: form.semestre ? parseInt(form.semestre) : undefined };
        if (modal.data?.id) {
          await academicApi.updateAsignatura(modal.data.id, payload);
          toast.success('Asignatura actualizada');
        } else {
          await academicApi.createAsignatura(payload);
          toast.success('Asignatura creada');
        }
        closeModal(); loadData();
      } catch (err) { toast.error(err.message); }
    };
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Código</label>
            <input className="form-control" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Programa</label>
            <select className="form-control" value={form.programaId} onChange={e => setForm({...form, programaId: e.target.value})} required>
              <option value="">Seleccionar...</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Nombre</label>
          <input className="form-control" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Créditos</label>
            <input type="number" className="form-control" value={form.creditos} onChange={e => setForm({...form, creditos: e.target.value})} min="1" required />
          </div>
          <div className="form-group">
            <label>Horas/Semana</label>
            <input type="number" className="form-control" value={form.horasSemanales} onChange={e => setForm({...form, horasSemanales: e.target.value})} min="1" required />
          </div>
          <div className="form-group">
            <label>Semestre</label>
            <input type="number" className="form-control" value={form.semestre} onChange={e => setForm({...form, semestre: e.target.value})} min="1" max="12" />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{modal.data?.id ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    );
  };

  // ─── Grupo Form ───────────────────────────────
  const GrupoForm = () => {
    const [form, setForm] = useState(modal.data || { codigo: '', capacidad: '', jornada: 'DIURNA', asignaturaId: '', docenteId: '', periodo: '2026-1' });
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = { ...form, capacidad: parseInt(form.capacidad) };
        if (modal.data?.id) {
          await academicApi.updateGrupo(modal.data.id, payload);
          toast.success('Grupo actualizado');
        } else {
          await academicApi.createGrupo(payload);
          toast.success('Grupo creado');
        }
        closeModal(); loadData();
      } catch (err) { toast.error(err.message); }
    };
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Código del grupo</label>
            <input className="form-control" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} required placeholder="Ej: G1" />
          </div>
          <div className="form-group">
            <label>Periodo</label>
            <input className="form-control" value={form.periodo} onChange={e => setForm({...form, periodo: e.target.value})} required placeholder="2026-1" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Asignatura</label>
            <select className="form-control" value={form.asignaturaId} onChange={e => setForm({...form, asignaturaId: e.target.value})} required>
              <option value="">Seleccionar...</option>
              {asignaturas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Capacidad</label>
            <input type="number" className="form-control" value={form.capacidad} onChange={e => setForm({...form, capacidad: e.target.value})} min="1" required />
          </div>
        </div>
        <div className="form-group">
          <label>Jornada</label>
          <select className="form-control" value={form.jornada} onChange={e => setForm({...form, jornada: e.target.value})}>
            <option value="DIURNA">Diurna</option>
            <option value="NOCTURNA">Nocturna</option>
            <option value="MIXTA">Mixta</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{modal.data?.id ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    );
  };

  const handleDelete = async (type, id) => {
    if (!confirm('¿Seguro que deseas eliminar?')) return;
    try {
      if (type === 'programa') await academicApi.deletePrograma(id);
      if (type === 'asignatura') await academicApi.deleteAsignatura(id);
      if (type === 'grupo') await academicApi.deleteGrupo(id);
      toast.success('Eliminado correctamente');
      loadData();
    } catch (err) { toast.error(err.message); }
  };

  const renderForm = () => {
    if (modal.type === 'programa') return <ProgramaForm />;
    if (modal.type === 'asignatura') return <AsignaturaForm />;
    if (modal.type === 'grupo') return <GrupoForm />;
    return null;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Gestión Académica</h1>
        <p>Administra programas, asignaturas y grupos</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {TABS.map((t, i) => (
          <button key={t} className={`btn ${tab === i ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(i)}>
            {i === 0 && <HiOutlineAcademicCap />}
            {i === 1 && <HiOutlineBookOpen />}
            {i === 2 && <HiOutlineUserGroup />}
            {t}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h3>{TABS[tab]}</h3>
          <button className="btn btn-primary btn-sm" onClick={() => openModal(['programa','asignatura','grupo'][tab])}>
            <HiOutlinePlus /> Nuevo
          </button>
        </div>

        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : (
          <div className="table-container">
            {/* Tabla Programas */}
            {tab === 0 && (
              <table>
                <thead><tr><th>Código</th><th>Nombre</th><th>Facultad</th><th>Acciones</th></tr></thead>
                <tbody>
                  {programas.length === 0 ? <tr><td colSpan={4}><div className="empty-state"><p>Sin programas registrados</p></div></td></tr> :
                    programas.map(p => (
                      <tr key={p.id}>
                        <td><span className="badge badge-blue">{p.codigo}</span></td>
                        <td>{p.nombre}</td>
                        <td>{p.facultad || '—'}</td>
                        <td><div className="table-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openModal('programa', p)}><HiOutlinePencil /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete('programa', p.id)}><HiOutlineTrash /></button>
                        </div></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}

            {/* Tabla Asignaturas */}
            {tab === 1 && (
              <table>
                <thead><tr><th>Código</th><th>Nombre</th><th>Créditos</th><th>Hrs/Sem</th><th>Semestre</th><th>Acciones</th></tr></thead>
                <tbody>
                  {asignaturas.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><p>Sin asignaturas</p></div></td></tr> :
                    asignaturas.map(a => (
                      <tr key={a.id}>
                        <td><span className="badge badge-purple">{a.codigo}</span></td>
                        <td>{a.nombre}</td>
                        <td>{a.creditos}</td>
                        <td>{a.horasSemanales}</td>
                        <td>{a.semestre || '—'}</td>
                        <td><div className="table-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openModal('asignatura', a)}><HiOutlinePencil /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete('asignatura', a.id)}><HiOutlineTrash /></button>
                        </div></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}

            {/* Tabla Grupos */}
            {tab === 2 && (
              <table>
                <thead><tr><th>Código</th><th>Capacidad</th><th>Jornada</th><th>Periodo</th><th>Acciones</th></tr></thead>
                <tbody>
                  {grupos.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><p>Sin grupos</p></div></td></tr> :
                    grupos.map(g => (
                      <tr key={g.id}>
                        <td><span className="badge badge-green">{g.codigo}</span></td>
                        <td>{g.capacidad}</td>
                        <td><span className="badge badge-gray">{g.jornada}</span></td>
                        <td>{g.periodo}</td>
                        <td><div className="table-actions">
                          <button className="btn btn-secondary btn-sm" onClick={() => openModal('grupo', g)}><HiOutlinePencil /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete('grupo', g.id)}><HiOutlineTrash /></button>
                        </div></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={closeModal} title={`${modal.data?.id ? 'Editar' : 'Nuevo'} ${modal.type}`}>
        {renderForm()}
      </Modal>
    </div>
  );
}

