-- ============================================================
-- Agenda Fácil – Datos iniciales de prueba
-- ============================================================

-- Usuario administrador (password: Admin123!)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador', 'admin@agendafacil.edu.co', '$2a$10$placeholder_hash_replace_me', 'ADMIN');

-- Periodo académico
INSERT INTO periodos_academicos (codigo, nombre, fecha_inicio, fecha_fin) VALUES
('2026-1', 'Primer Semestre 2026', '2026-02-01', '2026-06-30');
