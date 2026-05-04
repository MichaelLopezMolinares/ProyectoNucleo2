import { useState, useEffect } from 'react';
import { teacherApi } from '../api/services';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineClock } from 'react-icons/hi2';

const DAYS = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];

export default function TeachersPage() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: '', data: null });

  const loadData = async () => {
    setLoading(true);
    try { const r = await teacherApi.getAll(); setDocentes(r.data || []); }
    catch (e) { toast.error(e.message); }
    setLoading(false);
  };
  useEffect(() => { loadData(); }, []);
  const closeModal = () => setModal({ open: false, type: '', data: null });

  const DocenteForm = () => {
    const [f, setF] = useState(modal.data || { codigo:'', nombre:'', apellido:'', email:'', tipoContrato:'PLANTA', maxHorasSemana:20 });
    const submit = async (e) => {
      e.preventDefault();
      try {
        const p = {...f, maxHorasSemana: parseInt(f.maxHorasSemana)};
        if (modal.data?.id) { await teacherApi.update(modal.data.id, p); toast.success('Actualizado'); }
        else { await teacherApi.create(p); toast.success('Creado'); }
        closeModal(); loadData();
      } catch (e) { toast.error(e.message); }
    };
    return (
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="form-group"><label>Código</label><input className="form-control" value={f.codigo} onChange={e=>setF({...f,codigo:e.target.value})} required/></div>
          <div className="form-group"><label>Email</label><input type="email" className="form-control" value={f.email} onChange={e=>setF({...f,email:e.target.value})} required/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Nombre</label><input className="form-control" value={f.nombre} onChange={e=>setF({...f,nombre:e.target.value})} required/></div>
          <div className="form-group"><label>Apellido</label><input className="form-control" value={f.apellido} onChange={e=>setF({...f,apellido:e.target.value})} required/></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Contrato</label>
            <select className="form-control" value={f.tipoContrato} onChange={e=>setF({...f,tipoContrato:e.target.value})}>
              <option value="PLANTA">PLANTA</option><option value="CATEDRA">CÁTEDRA</option><option value="OCASIONAL">OCASIONAL</option>
            </select></div>
          <div className="form-group"><label>Máx Hrs/Sem</label><input type="number" className="form-control" value={f.maxHorasSemana} onChange={e=>setF({...f,maxHorasSemana:e.target.value})} min="1"/></div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{modal.data?.id?'Actualizar':'Crear'}</button>
        </div>
      </form>
    );
  };

  const DispForm = () => {
    const [slots, setSlots] = useState([]);
    const [ld, setLd] = useState(true);
    useEffect(() => {
      teacherApi.getDisponibilidad(modal.data.id).then(r => setSlots((r.data||[]).map(d=>({dia:d.dia,horaInicio:d.horaInicio,horaFin:d.horaFin})))).catch(()=>{}).finally(()=>setLd(false));
    }, []);
    const add = () => setSlots([...slots,{dia:'LUNES',horaInicio:'08:00',horaFin:'10:00'}]);
    const upd = (i,k,v) => { const s=[...slots]; s[i]={...s[i],[k]:v}; setSlots(s); };
    const submit = async (e) => {
      e.preventDefault();
      try { await teacherApi.setDisponibilidad(modal.data.id, slots); toast.success('Guardada'); closeModal(); }
      catch(e){ toast.error(e.message); }
    };
    if (ld) return <div className="loading-page"><div className="spinner"/></div>;
    return (
      <form onSubmit={submit}>
        <p style={{color:'var(--text-secondary)',fontSize:'var(--font-sm)',marginBottom:'1rem'}}>
          <strong style={{color:'var(--text-primary)'}}>{modal.data.nombre} {modal.data.apellido}</strong>
        </p>
        {slots.map((s,i)=>(
          <div key={i} style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem',alignItems:'center'}}>
            <select className="form-control" style={{flex:1}} value={s.dia} onChange={e=>upd(i,'dia',e.target.value)}>
              {DAYS.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" className="form-control" style={{width:120}} value={s.horaInicio} onChange={e=>upd(i,'horaInicio',e.target.value)}/>
            <input type="time" className="form-control" style={{width:120}} value={s.horaFin} onChange={e=>upd(i,'horaFin',e.target.value)}/>
            <button type="button" className="btn btn-danger btn-sm" onClick={()=>setSlots(slots.filter((_,j)=>j!==i))}><HiOutlineTrash/></button>
          </div>
        ))}
        <button type="button" className="btn btn-secondary btn-sm" onClick={add} style={{marginTop:'0.5rem'}}><HiOutlinePlus/> Agregar</button>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
          <button type="submit" className="btn btn-primary">Guardar</button>
        </div>
      </form>
    );
  };

  return (
    <div className="fade-in">
      <div className="page-header"><h1>Gestión de Docentes</h1><p>Administra docentes y disponibilidad</p></div>
      <div className="card">
        <div className="card-header"><h3>Docentes</h3>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal({open:true,type:'doc',data:null})}><HiOutlinePlus/> Nuevo</button>
        </div>
        {loading ? <div className="loading-page"><div className="spinner"/></div> : (
          <div className="table-container"><table>
            <thead><tr><th>Código</th><th>Nombre</th><th>Email</th><th>Contrato</th><th>Máx Hrs</th><th>Acciones</th></tr></thead>
            <tbody>
              {docentes.length===0 ? <tr><td colSpan={6}><div className="empty-state"><p>Sin docentes</p></div></td></tr> :
                docentes.map(d=>(
                  <tr key={d.id}>
                    <td><span className="badge badge-purple">{d.codigo}</span></td>
                    <td>{d.nombre} {d.apellido}</td>
                    <td style={{color:'var(--text-secondary)'}}>{d.email}</td>
                    <td><span className={`badge ${d.tipoContrato==='PLANTA'?'badge-green':d.tipoContrato==='CATEDRA'?'badge-orange':'badge-gray'}`}>{d.tipoContrato}</span></td>
                    <td>{d.maxHorasSemana}h</td>
                    <td><div className="table-actions">
                      <button className="btn btn-secondary btn-sm" title="Disponibilidad" onClick={()=>setModal({open:true,type:'disp',data:d})}><HiOutlineClock/></button>
                      <button className="btn btn-secondary btn-sm" onClick={()=>setModal({open:true,type:'doc',data:d})}><HiOutlinePencil/></button>
                      <button className="btn btn-danger btn-sm" onClick={async()=>{if(confirm('¿Eliminar?')){try{await teacherApi.delete(d.id);toast.success('Eliminado');loadData();}catch(e){toast.error(e.message);}}}}><HiOutlineTrash/></button>
                    </div></td>
                  </tr>
                ))
              }
            </tbody>
          </table></div>
        )}
      </div>
      <Modal isOpen={modal.open} onClose={closeModal} title={modal.type==='disp'?'Disponibilidad':`${modal.data?.id?'Editar':'Nuevo'} Docente`}>
        {modal.type==='doc' && <DocenteForm/>}
        {modal.type==='disp' && <DispForm/>}
      </Modal>
    </div>
  );
}

