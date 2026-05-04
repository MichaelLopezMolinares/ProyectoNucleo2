import { useState, useEffect } from 'react';
import { classroomApi } from '../api/services';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';

const TIPOS = ['REGULAR', 'LABORATORIO', 'AUDITORIO', 'SALA_COMPUTO'];

export default function ClassroomsPage() {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });

  const loadData = async () => {
    setLoading(true);
    try { const res = await classroomApi.getAll(); setAulas(res.data || []); }
    catch (err) { toast.error(err.message); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);
  const closeModal = () => setModal({ open: false, data: null });

  const AulaForm = () => {
    const [form, setForm] = useState(modal.data || { codigo: '', nombre: '', edificio: '', capacidad: '', tipo: 'REGULAR' });
    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const payload = { ...form, capacidad: parseInt(form.capacidad) };
        if (modal.data?.id) { await classroomApi.update(modal.data.id, payload); toast.success('Aula actualizada'); }
        else { await classroomApi.create(payload); toast.success('Aula creada'); }
        closeModal(); loadData();
      } catch (err) { toast.error(err.message); }
    };
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label>Código</label><input className="form-control" value={form.codigo} onChange={e => setForm({...form, codigo: e.target.value})} required placeholder="A-301" /></div>
          <div className="form-group"><label>Edificio</label><input className="form-control" value={form.edificio} onChange={e => setForm({...form, edificio: e.target.value})} placeholder="Bloque A" /></div>
        </div>
        <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required /></div>
        <div className="form-row">
          <div className="form-group"><label>Capacidad</label><input type="number" className="form-control" value={form.capacidad} onChange={e => setForm({...form, capacidad: e.target.value})} min="1" required /></div>
          <div className="form-group"><label>Tipo</label>
            <select className="form-control" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
              {TIPOS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{modal.data?.id ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    );
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar aula?')) return;
    try { await classroomApi.delete(id); toast.success('Eliminada'); loadData(); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Gestión de Aulas</h1><p>Administra los espacios físicos</p></div>
      <div className="card">
        <div className="card-header">
          <h3>Aulas</h3>
          <button className="btn btn-primary btn-sm" onClick={() => setModal({ open: true, data: null })}><HiOutlinePlus /> Nueva Aula</button>
        </div>
        {loading ? <div className="loading-page"><div className="spinner" /></div> : (
          <div className="table-container">
            <table>
              <thead><tr><th>Código</th><th>Nombre</th><th>Edificio</th><th>Capacidad</th><th>Tipo</th><th>Acciones</th></tr></thead>
              <tbody>
                {aulas.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><p>Sin aulas</p></div></td></tr> :
                  aulas.map(a => (
                    <tr key={a.id}>
                      <td><span className="badge badge-green">{a.codigo}</span></td>
                      <td>{a.nombre}</td>
                      <td>{a.edificio || '—'}</td>
                      <td>{a.capacidad}</td>
                      <td><span className="badge badge-gray">{a.tipo?.replace('_', ' ')}</span></td>
                      <td><div className="table-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal({ open: true, data: a })}><HiOutlinePencil /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}><HiOutlineTrash /></button>
                      </div></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal isOpen={modal.open} onClose={closeModal} title={`${modal.data?.id ? 'Editar' : 'Nueva'} Aula`}><AulaForm /></Modal>
    </div>
  );
}

