import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'COORDINADOR' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
        toast.success('¡Cuenta creada! Ahora inicia sesión.');
        setIsRegister(false);
      } else {
        await login(form.email, form.password);
        toast.success('¡Bienvenido a Agenda Fácil!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message || 'Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card fade-in">
        <div className="logo">
          <h1>🗓️ Agenda Fácil</h1>
          <p>Sistema de Programación de Horarios Académicos</p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="form-control"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="correo@universidad.edu.co"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="rol">Rol</label>
              <select id="rol" name="rol" className="form-control" value={form.rol} onChange={handleChange}>
                <option value="ADMIN">Administrador</option>
                <option value="COORDINADOR">Coordinador</option>
                <option value="DOCENTE">Docente</option>
                <option value="CONSULTA">Consulta</option>
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? <span className="spinner" /> : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); }} style={{ fontWeight: 600 }}>
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </a>
        </p>
      </div>
    </div>
  );
}

