# Agenda Fácil — Sistema de Programación de Horarios Académicos

## Arquitectura

**Estilo:** Monolito modular con arquitectura en capas (Layered Architecture)  
**Patrón:** MVC en backend  
**Stack:** Node.js + Express + PostgreSQL

```
HTTP Request
    │
    ▼
[Routes / Controller]   ← Capa de Presentación
    │
    ▼
[Service]               ← Capa de Negocio
    │
    ▼
[Repository]            ← Capa de Datos
    │
    ▼
[PostgreSQL]
```

---

## Módulos

| Módulo | Responsabilidad |
|---|---|
| `auth` | JWT, login, roles |
| `academic-management` | Programas, asignaturas, grupos |
| `teachers` | Docentes + disponibilidad horaria |
| `classrooms` | Aulas + capacidad |
| `schedule-engine` | **Motor central** de generación |
| `conflict-validator` | Validación de restricciones |
| `schedule-viewer` | API de consulta y visualización |

---

## Motor de Generación de Horarios

El componente central del sistema. Ubicado en:
`src/modules/schedule-engine/service/scheduleEngine.service.js`

**Flujo de generación:**
```
generateSchedule(scheduleId)
    │
    ├─► Cargar grupos, docentes, aulas (vía servicios)
    ├─► Construir restricciones (SchedulingRules)
    ├─► Seleccionar estrategia (Strategy Pattern)
    │       ├─ IncrementalStrategy (default)
    │       └─ BacktrackingStrategy (fallback)
    │
    ├─► Para cada grupo:
    │       └─► Para cada slot disponible:
    │               └─► conflictValidator.validate()
    │                       ├─ checkTeacherConflict()
    │                       ├─ checkClassroomConflict()
    │                       ├─ checkGroupConflict()
    │                       └─ checkTeacherWeeklyLoad()
    │
    └─► Persistir asignaciones (transacción atómica)
```

---

## Comunicación entre módulos

Todos los módulos se comunican **únicamente** a través de sus servicios. No hay acceso directo a repositorios de otro módulo.

```
schedule-engine ──► academic-management.service
schedule-engine ──► teachers.service
schedule-engine ──► classrooms.service
schedule-engine ──► conflict-validator.service
schedule-viewer ──► schedule-engine.repository (solo lectura)
```

---

## Roles de Usuario

| Rol | Permisos |
|---|---|
| `admin` | Acceso total |
| `coordinator` | Crear/generar horarios, gestionar docentes |
| `teacher` | Solo lectura de su propio horario |
| `viewer` | Solo lectura de horarios publicados |

---

## Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Crear base de datos y ejecutar migración
psql -U postgres -c "CREATE DATABASE agenda_facil;"
psql -U postgres -d agenda_facil -f src/database/migrations/001_initial_schema.sql

# 4. Iniciar en desarrollo
npm run dev
```

---

## Endpoints Principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/academic/programs` | Listar programas |
| POST | `/api/v1/schedule-engine` | Crear borrador de horario |
| POST | `/api/v1/schedule-engine/:id/generate` | **Generar horario** |
| GET | `/api/v1/schedule-engine/:id/validate` | Validar conflictos |
| POST | `/api/v1/schedule-engine/:id/publish` | Publicar horario |
| GET | `/api/v1/schedules/:id/matrix` | Ver horario como matriz |

---

## Decisiones Técnicas

- **Sin ORM**: Uso de `pg` directo para máximo control sobre las queries del validador de conflictos.
- **Sin microservicios**: Todo en un solo proceso — apropiado para el tamaño del equipo universitario.
- **Patrón Strategy**: Permite agregar nuevas estrategias (genéticas, CSP) sin modificar el motor.
- **Transacciones atómicas**: Las asignaciones se guardan en una sola transacción; si falla una, se hace rollback completo.
- **Índices en BD**: `schedule_assignments` tiene índices por teacher/classroom/group para que las queries del validador sean eficientes.
