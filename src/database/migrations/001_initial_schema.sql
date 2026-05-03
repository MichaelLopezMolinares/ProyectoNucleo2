-- ============================================================
-- Agenda Fácil – Esquema inicial PostgreSQL
-- ============================================================

-- Usuarios y autenticación
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'coordinator', 'teacher', 'viewer')),
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Programas académicos
CREATE TABLE IF NOT EXISTS programs (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(200) NOT NULL,
  code       VARCHAR(20) UNIQUE NOT NULL,
  faculty    VARCHAR(200),
  semesters  INT NOT NULL DEFAULT 8,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Asignaturas
CREATE TABLE IF NOT EXISTS subjects (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  code           VARCHAR(20) NOT NULL,
  credits        INT NOT NULL,
  hours_per_week INT NOT NULL,
  program_id     INT REFERENCES programs(id) ON DELETE CASCADE,
  semester       INT NOT NULL,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- Grupos
CREATE TABLE IF NOT EXISTS groups (
  id                SERIAL PRIMARY KEY,
  code              VARCHAR(20) NOT NULL,
  subject_id        INT REFERENCES subjects(id) ON DELETE CASCADE,
  semester          INT NOT NULL,
  year              INT NOT NULL,
  enrolled_students INT NOT NULL DEFAULT 0,
  created_at        TIMESTAMP DEFAULT NOW()
);

-- Docentes
CREATE TABLE IF NOT EXISTS teachers (
  id                     SERIAL PRIMARY KEY,
  first_name             VARCHAR(100) NOT NULL,
  last_name              VARCHAR(100) NOT NULL,
  email                  VARCHAR(255) UNIQUE NOT NULL,
  identification_number  VARCHAR(50),
  contract_type          VARCHAR(50) CHECK (contract_type IN ('full_time', 'part_time', 'contractor')),
  max_hours_per_week     INT DEFAULT 20,
  created_at             TIMESTAMP DEFAULT NOW()
);

-- Disponibilidad de docentes
CREATE TABLE IF NOT EXISTS teacher_availability (
  id          SERIAL PRIMARY KEY,
  teacher_id  INT REFERENCES teachers(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  CONSTRAINT chk_time_order CHECK (end_time > start_time)
);

-- Aulas
CREATE TABLE IF NOT EXISTS classrooms (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  code     VARCHAR(20) UNIQUE NOT NULL,
  building VARCHAR(100),
  floor    INT DEFAULT 1,
  capacity INT NOT NULL,
  type     VARCHAR(50) CHECK (type IN ('lecture', 'lab', 'workshop', 'auditorium')),
  features JSONB DEFAULT '[]'
);

-- Horarios (cabecera)
CREATE TABLE IF NOT EXISTS schedules (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  academic_period VARCHAR(50),
  year            INT NOT NULL,
  semester        INT NOT NULL CHECK (semester IN (1, 2)),
  program_id      INT REFERENCES programs(id),
  status          VARCHAR(50) DEFAULT 'draft'
    CHECK (status IN ('draft', 'generating', 'generated', 'published', 'failed')),
  generated_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Asignaciones del horario (detalle)
CREATE TABLE IF NOT EXISTS schedule_assignments (
  id           SERIAL PRIMARY KEY,
  schedule_id  INT REFERENCES schedules(id) ON DELETE CASCADE,
  group_id     INT REFERENCES groups(id),
  teacher_id   INT REFERENCES teachers(id),
  classroom_id INT REFERENCES classrooms(id),
  day_of_week  INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  CONSTRAINT chk_assignment_time CHECK (end_time > start_time)
);

-- Índices para consultas del validador de conflictos
CREATE INDEX idx_assignments_teacher ON schedule_assignments(teacher_id, day_of_week, start_time, end_time);
CREATE INDEX idx_assignments_classroom ON schedule_assignments(classroom_id, day_of_week, start_time, end_time);
CREATE INDEX idx_assignments_group ON schedule_assignments(group_id, day_of_week, start_time, end_time);
CREATE INDEX idx_assignments_schedule ON schedule_assignments(schedule_id);
