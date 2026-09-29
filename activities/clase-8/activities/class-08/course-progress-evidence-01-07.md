# course-progress-evidence-01-07

Paquete de evidencia para el diagnóstico acumulativo 7 en 1.
Generado automáticamente — completa las secciones marcadas con [COMPLETAR] antes de ejecutar el prompt.

## Metadata

* studentId: [COMPLETAR — tu identificador de estudiante, sin datos personales extra]
* promptVersion: ITSU-CHECKPOINT-01-07-1.0
* rubricVersion: BACKEND-01-07-R1
* generatedAt: 2026-09-29T14:27:19.791Z (EXECUTED_NOW)
* repoRoot: backend-course
* commit: b9bed0c (EXECUTED_NOW)
* repositorioRemoto: https://github.com/jeilybaudinoitsu-crypto/backend-course.git (EXECUTED_NOW) — verifica que sea TU repositorio antes de continuar
* modeloUtilizado: [COMPLETAR después de ejecutar el prompt]

### Contexto de git (informativo, EXECUTED_NOW)

El curso se trabaja en computadoras compartidas: el historial local puede
estar incompleto o pertenecer a otra sesión sin que falte trabajo real.
Este contexto NO es evidencia requerida — la evidencia son los archivos
del repositorio remoto del estudiante y sus respuestas. La ausencia de
commits aquí no debe interpretarse como evidencia faltante.

```text
b9bed0c clase 7: solucion de errores
3f25389 Update README.md
8ff4d96 clase 7
4c347b2 CLASE 6: Ceacion de backen conectado a la base de datos de supabase
144c376 clase 6
9f19b09 correcion clase 5
ed8ca5f clase 5 : se conecto a la base de datos "supabase" y se cumplieron con los 5  prametros. tambien se subieron las migraciones a la base de datos.
7bd7159 clase 4: solucion a los errores al ejecurar "npm run db:check"
```

## Evidencia por clase

Los archivos listados existen en el repositorio (FOUND). Un archivo de salida guardado, como validation-evidence.txt, es TEXTO: demuestra que se guardó, no que se ejecutó (NOT_VERIFIED como ejecución).

### Clase 01 — Fundamentos de backend

* FOUND: activities/class-01/README.md
* FOUND: activities/class-01/index.html
* FOUND: activities/class-01/server.js

Extracto de activities/class-01/README.md (redactado automáticamente):

```text
# backend-course
3ser trimestre backend y servidorres con el profesor carlos  
alumno: Jeily Baudino 


```

### Clase 02 — HTTP y contratos

* FOUND: activities/clase-5/docs/http-contract.md
* FOUND: activities/class-02/README.md
* FOUND: activities/class-02/request-api-full/app.js
* FOUND: activities/class-02/request-api-full/data/requests.js
* FOUND: activities/class-02/request-api-full/package-lock.json
* FOUND: activities/class-02/request-api-full/package.json
* FOUND: activities/class-02/request-api-full/routes/requests.routes.js
* FOUND: activities/class-02/request-api-full/server.js
* FOUND: activities/class-02/request-api-lite/package-lock.json
* FOUND: activities/class-02/request-api-lite/package.json
* FOUND: activities/class-02/request-api-lite/server.js

Extracto de activities/clase-5/docs/http-contract.md (redactado automáticamente):

```text
# Contrato HTTP — Request API v5 (solución de referencia)

## Qué cambió respecto de la v4

* Tres endpoints nuevos: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
* **Todos los endpoints de `/requests` ahora exigen `Authorization: Bearer <token>`.**
* La conversación de los endpoints existentes conserva su forma, pero cada respuesta
  depende ahora de QUIÉN pregunta (rol y propiedad). Aparece `createdBy` en la
  representación y `changedBy` en el historial.
* Códigos nuevos: `401`, `403` y los códigos de contrato de auth.
* Forma de error invariable: `{ "error": { "code", "message" } }`.

## Actores

Dos roles exactos: `requester` (crea y sigue sus solicitudes) y `agent` (las atiende).
El registro SIEMPRE crea `requester`; la promoción a `agent` es una operación docente
controlada (SQL), nunca un endpoint.

## Matriz de acceso (baseline fija del taller)

| Operación | Anónimo | Requester | Agent |
| --------- | ------: | --------: | ----: |
| `POST /auth/register` | Sí | Sí | Sí |
| `POST /auth/login` | Sí | Sí | Sí |
| `GET /auth/me` | No | Sí | Sí |
| `GET /requests` | No | Propias | Todas |
| `GET /requests/:id` | No | Propia | Todas |
| `GET /requests/:id/history` | No | Propia | Todas |
| `POST /requests` | No | Sí | No |
| Editar título/descripción | No | Propia y abierta | No |
[... 92 líneas más]
```

Extracto de activities/class-02/README.md (redactado automáticamente):

```text
# calse 2 
se creo una api utilizando la IA espesificamente: OpenCode,Gemini NoteBOok

Proyecto Lite: Consiste en leer una API de un tercero, reconstruir su contrato y detectar las inconsistencias que pueda tener. 
Proyecto Full: Consiste en construir utilizando IA, pero sin delegar el criterio técnico diseñando primero la especificación de la API y luego realizando una verificación crítica de lo que la IA genera
```

### Clase 03 — Recursos, estado y reglas

* NOT_FOUND: ningún artefacto esperado de esta clase

### Clase 04 — PostgreSQL y persistencia

* FOUND: activities/clase-5/database/migrations/001_create_requests.sql
* FOUND: activities/clase-5/database/migrations/002_create_request_status_history.sql
* FOUND: activities/clase-5/database/migrations/003_create_users.sql
* FOUND: activities/clase-5/database/migrations/004_add_request_ownership.sql
* FOUND: activities/clase-5/database/migrations/005_add_history_actor.sql
* FOUND: activities/clase-7/database/migrations/001_create_users.sql
* FOUND: activities/clase-7/database/migrations/002_create_requests.sql
* FOUND: activities/clase-7/database/migrations/003_create_request_history.sql
* FOUND: activities/clase-7/database/migrations/004_add_constraints_and_indexes.sql
* FOUND: activities/clase-7/scripts/seed.js
* FOUND: activities/clase-8/database/migrations/001_create_users.sql
* FOUND: activities/clase-8/database/migrations/002_create_requests.sql
* … 9 archivo(s) más con el mismo patrón

### Clase 05 — Autenticación y autorización

* FOUND: activities/clase-5/activities/class-05/README.md
* FOUND: activities/clase-5/activities/class-05/access-matrix.md
* FOUND: activities/clase-5/activities/class-05/ai-usage.md
* FOUND: activities/clase-5/activities/class-05/auth-contract.md
* FOUND: activities/clase-5/activities/class-05/decision-log.md
* FOUND: activities/clase-5/activities/class-05/reflection.md
* FOUND: activities/clase-5/activities/class-05/threat-cases.md
* FOUND: activities/clase-5/activities/class-05/validation-evidence.md — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities/clase-5/scripts/validate-class-05.js

Extracto de activities/clase-5/activities/class-05/auth-contract.md (redactado automáticamente):

```text
# Contrato de autenticación — Request API v5

Documenta ANTES de implementar. Para cada endpoint: método, ruta, ¿público o
protegido?, body permitido, respuesta de éxito (código + forma) y CADA error
(código HTTP + `error.code`).

## POST /auth/register

## POST /auth/login

## GET /auth/me

## Semántica de errores

¿Cuándo responde tu API `401`? ¿Cuándo `403`? ¿Cuándo `404` aunque el recurso
exista? ¿Cuándo `409`? Escribe el criterio, no solo ejemplos.

```

Extracto de activities/clase-5/activities/class-05/validation-evidence.md (redactado automáticamente):

```text
# Evidencia de validación — Clase 05

Pega aquí la salida del validador al cerrar cada estación (SIN secretos: el
validador ya evita imprimirlos, no agregues capturas de tu `.env`).

## stage setup

## stage access-design

## stage register

## stage password

## stage login

## stage authentication

## stage ownership

## stage authorization

## Boss battle (integral)

```

### Clase 06 — Onboarding y pruebas

* FOUND: activities/clase-7/scripts/validate-class-06.js
* FOUND: activities/clase-8/scripts/validate-class-06.js
* FOUND: activities/clase6/activities/class-06/README.md
* FOUND: activities/clase6/activities/class-06/validation-evidence.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities/clase6/activities/class-06/work-log.md
* FOUND: activities/clase6/scripts/validate-class-06.js
* FOUND: activities/clase6/tickets/BUG-106.md
* FOUND: activities/clase6/tickets/FEATURE-206.md

Extracto de activities/clase6/activities/class-06/work-log.md (redactado automáticamente):

```text
# Class 06 work log

## Environment

What did I configure?
Which command confirmed that it worked?

## Request flow

Where does the request enter?
Where is authentication checked?
Where is authorization checked?
Where is PostgreSQL accessed?

## Bug fixed

What was happening?
What should happen?
Which file did I modify?
Which test protects the behavior?

## Feature implemented

What does GET /requests/:id/history do?
Who can use it?
How is the result ordered?

## Test explained

Choose one test.
[... 16 líneas más]
```

Extracto de activities/clase6/activities/class-06/validation-evidence.txt (redactado automáticamente):

```text
Pega aqui la salida final de: npm run validate:class-06
(la salida no contiene secretos; no agregues capturas de tu .env)
CLASS 06 FINAL VALIDATION

Environment
[01/12] Database is reachable .............. PASS
[02/12] Migrations are complete ............ PASS
[03/12] Seed data is available ............. PASS

Regression
[04/12] Valid empty collection returns 200 .. FAIL

Expected:
A valid filter with zero matches answers 200.

Received:
GET /requests?status=closed answered 404.

Review:
- the difference between a missing resource and an empty collection
- where the collection route decides what to do with an empty array
- the class 3 contract for collections

[05/12] Empty collection returns [] ........ FAIL

Expected:
The body of an empty collection is exactly [].

Received:
The body is not an empty array.
[... 53 líneas más]
```

### Clase 07 — Diagnóstico y errores

* FOUND: activities/clase-7/activities/class-07/README.md
* FOUND: activities/clase-7/activities/class-07/incident-report.md
* FOUND: activities/clase-7/activities/class-07/validation-evidence.txt — salida guardada, NOT_VERIFIED como ejecución
* FOUND: activities/clase-7/incidents/INC-701-invalid-request-id.md
* FOUND: activities/clase-7/scripts/validate-class-07.js
* FOUND: activities/clase-7/src/middleware/error-handler.js
* FOUND: activities/clase-7/src/middleware/request-id.js
* FOUND: activities/clase-8/scripts/validate-class-07.js
* FOUND: activities/clase-8/src/middleware/error-handler.js
* FOUND: activities/clase-8/src/middleware/request-id.js

Extracto de activities/clase-7/activities/class-07/incident-report.md (redactado automáticamente):

```text
# Class 07 incident report

Completa cada sección MIENTRAS investigas. Separa hechos de
interpretaciones: un "creo que" pertenece a Hypotheses, no a Evidence.

## Baseline

Which command confirmed the starting state?

## Incident 701

### Report

(what support said, in one or two lines)

### Reproduction

(the exact request: method, path, user/role, body if any)

### Expected result

### Actual result

(status and body actually received — copy them)

### Hypotheses

(at least two, ordered by probability, each with HOW you would check it)

### Evidence
[... 56 líneas más]
```

Extracto de activities/clase-7/activities/class-07/validation-evidence.txt (redactado automáticamente):

```text
Pega aquí la salida REAL y COMPLETA de:

    npm run validate:class-07

> class-07-request-api@7.0.0 class-07:doctor
> node scripts/check-environment.js

CLASS 07 ENVIRONMENT CHECK

[01/07] Environment configured ............... PASS
[02/07] Database connection established ...... PASS
[03/07] Migrations available ................. PASS
[04/07] Seed data available .................. PASS
[05/07] Application can be imported .......... PASS
[06/07] Test runner available ................ PASS
[07/07] Incident fixtures available .......... PASS

```

## Estado previo a la clase 8

* Validadores disponibles (clases 1-7): activities/clase-5/scripts/validate-class-05.js, activities/clase-7/scripts/validate-class-06.js, activities/clase-7/scripts/validate-class-07.js, activities/clase-8/scripts/validate-class-06.js, activities/clase-8/scripts/validate-class-07.js, activities/clase6/scripts/validate-class-06.js
* Carpetas de pruebas: activities/clase-7/test, activities/clase-8/test, activities/clase6/test
* Último commit antes del taller: b9bed0c

## Cuestionario diagnóstico (responde aquí, 3-6 líneas cada una)

Sé específico: cita archivos o rutas concretas de TU proyecto cuando puedas. La extensión no suma.

### Pregunta clase 01

Describe qué ocurre desde que una petición llega al backend hasta que sale una respuesta y explica por qué el servidor debe permanecer activo.

Respuesta: [COMPLETAR]

### Pregunta clase 02

Elige un endpoint del proyecto y explica cómo método, ruta, body y status forman su contrato.

Respuesta: [COMPLETAR]

### Pregunta clase 03

Explica, usando una solicitud del proyecto, la diferencia entre representación, dato inválido y transición incompatible con el estado actual.

Respuesta: [COMPLETAR]

### Pregunta clase 04

Explica la diferencia entre migración, seed y transacción, e indica dónde aparece cada concepto en el proyecto.

Respuesta: [COMPLETAR]

### Pregunta clase 05

Explica la diferencia entre autenticación y autorización y por qué un JWT decodificado todavía debe verificarse.

Respuesta: [COMPLETAR]

### Pregunta clase 06

Elige una prueba del proyecto, identifica preparación, acción y comprobación, y explica qué regresión protege.

Respuesta: [COMPLETAR]

### Pregunta clase 07

Describe un fallo investigado distinguiendo síntoma, hipótesis y causa; luego indica qué señal correspondería a health o readiness.

Respuesta: [COMPLETAR]

---
Nota de seguridad: este paquete fue generado excluyendo .env y redactando
posibles secretos. Revisa una vez más antes de pegarlo en un modelo:
si ves una credencial real, reemplázala por [REDACTED] y avisa al docente.
