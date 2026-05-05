📚 Agenda Fácil - Sistema de Generación de Horarios

Sistema académico para la gestión y generación automática de horarios universitarios, desarrollado con Node.js, Express y PostgreSQL.

🚀 Descripción del proyecto

Agenda Fácil es un sistema backend que permite gestionar la información académica (grupos, docentes, aulas y asignaturas) y generar automáticamente horarios semanales usando algoritmos de optimización (Greedy y Backtracking), aplicando validaciones de restricciones para evitar conflictos.

🧠 Características principales
Generación automática de horarios semanales completos
Dos estrategias de asignación:
Greedy (rápido y eficiente)
Backtracking (más exhaustivo)
Validación de restricciones académicas
Detección y almacenamiento de conflictos
Gestión de grupos, docentes, aulas y asignaturas
API REST modular y escalable
Control de roles de usuario (ADMIN, COORDINADOR, DOCENTE, CONSULTA)
🏗️ Arquitectura del sistema

El proyecto está organizado por módulos:

schedule-engine → Motor de generación de horarios
academic → Gestión de grupos y periodos
teacher → Gestión de docentes y disponibilidad
classroom → Gestión de aulas
constraint-engine → Validación de reglas
repositories → Acceso a base de datos
services → Lógica de negocio
🧰 Tecnologías utilizadas
Node.js
Express.js
PostgreSQL (Supabase compatible)
Sequelize (SQL híbrido)
JavaScript ES6+
Nodemon
⚙️ Configuración del proyecto
1. Clonar el repositorio:
git https://github.com/MichaelLopezMolinares/ProyectoNucleo2.git
cd agenda-facil
2. Instalar dependencias
npm install
3. Configurar variables de entorno

Crear un archivo .env en la raíz del proyecto:

PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=agenda_facil

JWT_SECRET=secret_key
4. Ejecutar migraciones / base de datos

Asegúrate de tener PostgreSQL corriendo y ejecutar los scripts SQL del proyecto (incluyendo tablas como grupos, asignaciones, conflictos, etc.).

5. Ejecutar el servidor
npm run dev

Servidor disponible en:

http://localhost:3000
