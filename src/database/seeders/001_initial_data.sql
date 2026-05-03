-- ============================================================
-- Agenda Fácil – Migración inicial
-- Base de datos PostgreSQL
-- ============================================================

-- ─── Extensiones ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── MÓDULO: Autenticación ──────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    rol             VARCHAR(20) NOT NULL CHECK (rol IN ('ADMIN','COORDINADOR','DOCENTE','CONSULTA')),
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ─── MÓDULO: Gestión Académica ──────────────────────────────
CREATE TABLE IF NOT EXISTS programas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo          VARCHAR(20) UNIQUE NOT NULL,
    nombre          VARCHAR(200) NOT NULL,
    facultad        VARCHAR(200),
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asignaturas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo          VARCHAR(20) UNIQUE NOT NULL,
    nombre          VARCHAR(200) NOT NULL,
    creditos        INTEGER NOT NULL CHECK (creditos > 0),
    horas_semanales INTEGER NOT NULL CHECK (horas_semanales > 0),
    semestre        INTEGER CHECK (semestre BETWEEN 1 AND 12),
    programa_id     UUID NOT NULL REFERENCES programas(id) ON DELETE CASCADE,
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grupos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo          VARCHAR(10) NOT NULL,
    capacidad       INTEGER NOT NULL CHECK (capacidad > 0),
    jornada         VARCHAR(20) NOT NULL CHECK (jornada IN ('DIURNA','NOCTURNA','MIXTA')),
    asignatura_id   UUID NOT NULL REFERENCES asignaturas(id) ON DELETE CASCADE,
    docente_id      UUID,  -- FK se agrega después de crear tabla docentes
    periodo         VARCHAR(10) NOT NULL, -- Ej: 2026-1
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(codigo, asignatura_id, periodo)
);

-- ─── MÓDULO: Gestión de Docentes ────────────────────────────
CREATE TABLE IF NOT EXISTS docentes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo          VARCHAR(20) UNIQUE NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    tipo_contrato   VARCHAR(30) NOT NULL CHECK (tipo_contrato IN ('PLANTA','CATEDRA','OCASIONAL')),
    max_horas_semana INTEGER NOT NULL DEFAULT 20,
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Disponibilidad horaria del docente
CREATE TABLE IF NOT EXISTS docente_disponibilidad (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    docente_id      UUID NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
    dia             VARCHAR(10) NOT NULL CHECK (dia IN ('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO')),
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL,
    CHECK (hora_inicio < hora_fin),
    UNIQUE(docente_id, dia, hora_inicio)
);

-- Agregar FK de grupos a docentes
ALTER TABLE grupos ADD CONSTRAINT fk_grupo_docente
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL;

-- ─── MÓDULO: Gestión de Aulas ───────────────────────────────
CREATE TABLE IF NOT EXISTS aulas (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo          VARCHAR(20) UNIQUE NOT NULL,
    nombre          VARCHAR(100) NOT NULL,
    edificio        VARCHAR(100),
    capacidad       INTEGER NOT NULL CHECK (capacidad > 0),
    tipo            VARCHAR(30) NOT NULL CHECK (tipo IN ('REGULAR','LABORATORIO','AUDITORIO','SALA_COMPUTO')),
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Recursos/equipamiento del aula
CREATE TABLE IF NOT EXISTS aula_recursos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aula_id         UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
    recurso         VARCHAR(100) NOT NULL,
    cantidad        INTEGER DEFAULT 1,
    UNIQUE(aula_id, recurso)
);

-- ─── MÓDULO: Motor de Horarios ──────────────────────────────
CREATE TABLE IF NOT EXISTS periodos_academicos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo          VARCHAR(10) UNIQUE NOT NULL, -- Ej: 2026-1
    nombre          VARCHAR(100) NOT NULL,
    fecha_inicio    DATE NOT NULL,
    fecha_fin       DATE NOT NULL,
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS horarios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    periodo_id      UUID NOT NULL REFERENCES periodos_academicos(id) ON DELETE CASCADE,
    estado          VARCHAR(20) NOT NULL DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR','VALIDADO','PUBLICADO','ARCHIVADO')),
    generado_por    UUID REFERENCES usuarios(id),
    estrategia      VARCHAR(50), -- Nombre de la estrategia usada
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asignaciones (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    horario_id      UUID NOT NULL REFERENCES horarios(id) ON DELETE CASCADE,
    grupo_id        UUID NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    aula_id         UUID NOT NULL REFERENCES aulas(id) ON DELETE CASCADE,
    docente_id      UUID NOT NULL REFERENCES docentes(id) ON DELETE CASCADE,
    dia             VARCHAR(10) NOT NULL CHECK (dia IN ('LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO')),
    hora_inicio     TIME NOT NULL,
    hora_fin        TIME NOT NULL,
    CHECK (hora_inicio < hora_fin),
    -- Evitar doble asignación de aula en mismo día/hora dentro del mismo horario
    UNIQUE(horario_id, aula_id, dia, hora_inicio)
);

-- Registro de conflictos detectados
CREATE TABLE IF NOT EXISTS conflictos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    horario_id      UUID NOT NULL REFERENCES horarios(id) ON DELETE CASCADE,
    tipo            VARCHAR(30) NOT NULL CHECK (tipo IN ('DOCENTE','AULA','GRUPO','TIEMPO','CAPACIDAD')),
    severidad       VARCHAR(10) NOT NULL DEFAULT 'ERROR' CHECK (severidad IN ('ERROR','WARNING')),
    descripcion     TEXT NOT NULL,
    asignacion_a_id UUID REFERENCES asignaciones(id) ON DELETE CASCADE,
    asignacion_b_id UUID REFERENCES asignaciones(id) ON DELETE CASCADE,
    resuelto        BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ─── Índices de rendimiento ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_asignaciones_horario ON asignaciones(horario_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_dia_hora ON asignaciones(dia, hora_inicio, hora_fin);
CREATE INDEX IF NOT EXISTS idx_asignaciones_docente ON asignaciones(docente_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_aula ON asignaciones(aula_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_grupo ON asignaciones(grupo_id);
CREATE INDEX IF NOT EXISTS idx_conflictos_horario ON conflictos(horario_id);
CREATE INDEX IF NOT EXISTS idx_grupos_asignatura ON grupos(asignatura_id);
CREATE INDEX IF NOT EXISTS idx_asignaturas_programa ON asignaturas(programa_id);
