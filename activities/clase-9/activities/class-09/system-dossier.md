# System dossier

Un solo expediente para todo el análisis del taller. Regla de oro: cada
afirmación cita su evidencia (archivo y función, prueba, tabla o salida de
comando) o se declara como duda en la sección 9. "El service maneja la
lógica" sin nombres no cuenta como inventario.

## 1. How the system starts

Arranque: `npm start` (o `npm run dev` en watch) ejecuta `node src/server.js`
(`package.json`, script `start`).

- `src/server.js:2-6` importa `app` y llama a `app.listen(PORT)`; `PORT` sale
  de `process.env.PORT ?? 3000` (`.env` local, línea `PORT=3000`). Es el
  único archivo que abre el puerto: "this file only starts the process".
- `src/app.js:23-41` construye la aplicación Express y monta, en orden:
  `corsPolicy` → `requestId` → `requestLogger` → `express.json` →
  índices `healthRoutes` (públicos) → `/auth` → `/requests` (con
  `authenticate` antes) → `notFound` → `errorHandler`. El orden es parte del
  diseño (comentario en `app.js:10-11`).
- Queda escuchando un servidor HTTP/Express 5 en `http://localhost:3000`
  (salida real: "Request API is running on http://localhost:3000").

## 2. Main components

| Componente | Archivo o recurso | Responsabilidad | Evidencia | Duda |
| --- | --- | --- | --- | --- |
| Punto de entrada | `src/server.js:1-8` | Sólo arranca el proceso: importa `app` y hace `listen`. No conoce rutas. | `app.listen(PORT, ...)` en línea 6 | |
| Construcción de la app | `src/app.js:23-41` | Crea `express()`, registra middlewares globales y monta los módulos en orden. | `const app = express()` línea 23; `app.use(...)` líneas 25-41 | |
| Router principal | `src/routes/health.routes.js:20-46` + módulos montados en `app.js:34-38` | Health público sin negocio; `/auth` y `/requests` montados por módulo. | `app.use('/requests', authenticate, requestsRoutes)` en `app.js:38` | |
| Módulos | `src/modules/auth`, `src/modules/requests`, `src/modules/users` | Auth (identidad), requests (núcleo), users (lectura de usuarios). | carpetas listadas en `app.js:20-21`; cada módulo con route/service/store | |
| Middleware global | `src/middleware/cors.js`, `request-id.js`, `request-logger.js` + `express.json` | CORS→ID→log→parseo JSON antes de cualquier ruta. | `app.js:25-28` | |
| Autenticación | `src/middleware/authenticate.js:13-45` | Verifica el JWT y construye `req.auth = { userId, role }`. NO autoriza. | `req.auth = { userId: payload.sub, role: payload.role }` línea 43 | |
| Autorización (policies) | `src/modules/requests/request.policy.js:16-68` | Reglas puras por rol/ownership (`canViewRequest`, `canListAllRequests`, `canClaimRequest`…). | `canViewRequest` líneas 20-23; matriz de acceso en el comentario 6-14 | |
| Services | `src/modules/requests/requests.service.js`, `src/modules/auth/auth.service.js` | Orquestan: aplican policy, reglas de dominio y unidades de trabajo. Sin SQL ni códigos HTTP. | firmas `getRequest`/`patchRequest`/`claimRequest` en service.js | |
| Stores / acceso a datos | `src/modules/requests/requests.store.js`, `src/modules/users/users.store.js` | Queries parametrizadas que devuelven filas; ignoran HTTP/dominio. | `findById` en store.js:50-56 | |
| Conexión PostgreSQL | `src/database/pool.js:14-16`, `src/database/transaction.js:6-22` | Un solo Pool compartido; `withTransaction` para unidades de trabajo atómicas. | `new Pool({ connectionString: process.env.DATABASE_URL })` | |
| Manejo de errores | `src/middleware/error-handler.js:33-77`, `src/app-error.js:9-15` | Traduce `AppError` (categoría→código HTTP) y errores inesperados a JSON uniforme. | tabla `CATEGORY_STATUS` en error-handler.js:18-24 | |
| Logging | `src/logging/logger.js:9-25`, `src/middleware/request-logger.js:13-38` | Líneas JSON estructuradas por evento; allowlist de campos por request. | campos en request-logger.js:21-29 (nunca headers/bodies/tokens) | |
| Health / readiness | `src/routes/health.routes.js:27-43` | `GET /health` (vivo, sin DB) y `GET /ready` (puede trabajar, `SELECT 1`). | comentario líneas 1-15; handlers líneas 27-43 | |
| Pruebas | `test/*.test.js` | Red de seguridad: auth, requests, policies puras, errors, traceability, health. | `package.json` script `test` (`node --test 'test/*.test.js'`) | |
| Scripts operativos | `scripts/migrate.js`, `scripts/seed.js`, `scripts/check-environment.js`, `scripts/validate-class-09.js` | Migraciones idempotentes, seed repetible, doctor de entorno, validador final. | package.json scripts `db:migrate`/`db:seed`/`doctor`/`validate:class-09` | |
| Dependencias externas | `package.json` | `express` (HTTP), `jose` (JWT), `pg` (PostgreSQL), `dotenv` (config), `supertest` (tests). | bloque `dependencies`/`devDependencies` en package.json | |

## 3. Request trace

Recorrido completo de `GET /requests/:id` — en orden, con archivo y
función en cada paso:

1. Router: `src/app.js:38` monta `requestsRoutes` bajo `/requests` con
   `authenticate` previo; `src/modules/requests/requests.routes.js:28-31`
   define `router.get('/:id', ...)` y delega en `getRequest(req.auth, id)`.
2. Middlewares que atraviesa (orden en `src/app.js:25-38`):
   `corsPolicy` (`middleware/cors.js:8`) → `requestId`
   (`middleware/request-id.js:14`) → `requestLogger`
   (`middleware/request-logger.js:13`) → `express.json` → `authenticate`
   (`middleware/authenticate.js:13`).
3. Dónde se valida el parámetro `id`: `src/http/parse-id.js:16-22`
   (`parseIdParam`): regex `^[1-9][0-9]{0,17}$`; falla → `400 INVALID_REQUEST_ID`.
   Se valida en la frontera HTTP antes de tocar SQL (`requests.routes.js:29`).
4. Dónde nace la identidad autenticada: `src/middleware/authenticate.js:43`
   `req.auth = { userId: payload.sub, role: payload.role }`, construido a
   partir del JWT verificado por `src/modules/auth/token.js:35-42`
   (`verifyToken`: firma, algoritmo, iss, aud, exp).
5. Policy consultada (¿se consulta?): **NO en el detalle — ese es el
   BUG-901.** `src/modules/requests/requests.service.js:86-93` (`getRequest`)
   lee la fila y devuelve el mapeo con un comentario `TEMP(REQ-442)` que
   deshabilitó la comprobación. La regla existe en
   `request.policy.js:20-23` (`canViewRequest`: agente→true, requester→
   `createdBy === userId`) pero nadie la invoca aquí. En cambio
   `getHistory` (`service.js:219-228`) SÍ la consulta.
6. Service: `src/modules/requests/requests.service.js:86-93` `getRequest(actor, id)`:
   `findById(id)`, si no hay fila `throw notFound(id)`, luego `mapRequestRow(row)`.
7. Store y query: `src/modules/requests/requests.store.js:50-56`
   `findById(id, db)`: `SELECT ... FROM requests WHERE id = $1` parametrizada.
8. Transformación fila → JSON: `src/modules/requests/request.mapper.js:5-17`
   `mapRequestRow`: snake_case → camelCase; `assignedTo`/`createdBy` etc.
9. Respuesta y manejo de errores: `requests.routes.js:29` responde
   `200 JSON`. Cualquier `AppError` lo traduce `src/middleware/error-handler.js:33-77`
   (`CATEGORY_STATUS`: contract→400, auth→401, forbidden→403, resource→404,
   domain→409); cuerpo `{ error: { code, message }, requestId }`.
10. Pruebas existentes que cubren este recorrido:
    `test/request-detail.test.js:19-67` (401 sin token, 404 inexistente,
    owner 200 con schema, agente 200) y `test/errors.test.js`,
    `test/traceability.test.js` como red general. TODO stubs de regresión:
    `request-detail.test.js:69-80`.

## 4. Database inventory

Tablas (todas ya aplicadas — `npm run db:migrate` muestra `[SKIPPED]` para
001-005; el ledger `schema_migrations` lo crea `scripts/migrate.js:20-25`):

- `users` — `database/migrations/001_create_users.sql:5-13`. `id UUID PK default
  gen_random_uuid()`, `email UNIQUE`, `role CHECK ('requester','agent')` default
  `'requester'`. Crea: la DB; el rol del token siempre viene del servidor.
- `requests` — `002_create_requests.sql:4-17`. `id BIGINT IDENTITY PK`,
  `title VARCHAR(200) NOT NULL`, `priority`/`status` con defaults,
  `created_by UUID NOT NULL` FK→`users` (ON DELETE RESTRICT): toda solicitud
  tiene dueño.
- `request_history` — `003_create_request_history.sql:7-25`. Eventos por
  solicitud: `type` (inicialmente `status_changed`/`priority_changed`,
  ampliado en 005 a `request_claimed`), FKs a `requests` y `users`.
- `004_add_constraints_and_indexes.sql:4-33` — CHECKs de `priority`/`status`
  sobre requests y de valores en request_history; índices
  `idx_requests_created_by` (scope por dueño en listado), `idx_requests_status`
  e `idx_request_history_request_order`.
- `005_add_request_assignment.sql:6-24` — FEATURE-801: `assigned_to UUID FK`
  sobre requests, índice `idx_requests_assigned_to`, y ampliación del CHECK
  de tipo de historia (evoluciona con ALTER, nunca reescribe 003).

Siembra: `scripts/seed.js:14-39` crea 3 users seed (2 requester + 1 agent,
emails `*.seed@example.test`), 6 solicitudes de demostración (abiertas,
asignada, terminales) y sus eventos. `SEED_REQUESTS` está pensado para el
escenario BUG-106 (Ana sin solicitudes `closed`). Es repetible: borra SOLO
los requests/history de los users seed, nunca datos ajenos ni TRUNCATE
(comentario en `seed.js:3-7`).

## 5. Authentication and authorization

- Verificación del JWT: `src/middleware/authenticate.js:27-40` llama a
  `verifyToken` (`src/modules/auth/token.js:35-42`), que usa `jose` con
  HS256, `iss`, `aud` y `exp`; cualquier fallo → mismo `401 INVALID_TOKEN`
  (no se revela qué cheque falló). Esquema estricto `Bearer ` (`authenticate.js:17-25`).
- `req.auth`: `{ userId: payload.sub, role: payload.role }` (`authenticate.js:43`),
  la ÚNICA fuente confiable de identidad para el resto del pipeline.
- Dónde viven las reglas de permiso: `src/modules/requests/request.policy.js`
  — funciones puras (sin Express, sin SQL): `canListAllRequests`
  (agente, línea 16-18), `canViewRequest` (agente→true, requester→propietario,
  línea 20-23), `canViewHistory` (error: 25-27 usa `canViewRequest`),
  `canCreateRequest` (requester, 29-31), `canEditContent` (dueño+`open`, 33-37),
  `canChangePriority`/`canChangeStatus` (agente, 39-45), `canClaimRequest`
  (veredicto con motivo, 58-68).
- Ejemplo de regla y su prueba: `canViewRequest` se prueba en
  `test/request-access-policy.test.js` (activo, con TODOs) y `canClaimRequest`
  en `test/request-policy.test.js:16-51`. El caso end-to-end del detalle está
  en `test/request-detail.test.js:35-67`.
- Lagunas: `getRequest` (`requests.service.js:86-93`) NO consulta la policy
  (BUG-901); `getHistory` (`service.js:219-228`) sí; `listRequests` filtra en
  SQL por `created_by` (store.js:37-40) sólo para requesters.

## 6. Errors, logs and operational checks

- Formato de error y requestId: toda respuesta de error es
  `{ "error": { "code", "message" }, "requestId": "..." }`
  (`error-handler.js:29-31, errorBody`). El `requestId` nace en
  `request-id.js:17-19` (id del cliente si es `[A-Za-z0-9._-]{1,64}`, si no
  `req_<uuid>`), viaja en header `X-Request-Id` y en el cuerpo de error.
- Categorías → HTTP: `CATEGORY_STATUS` en `error-handler.js:18-24`
  (contract→400, auth→401, forbidden→403, resource→404, domain→409;
  infraestructura de DB → 503).
- Qué se registra y qué jamás: `request-logger.js:21-29` loguea allowlist
  (method, path, status, durationMs, requestId, userId opcional, errorCode).
  Nunca headers, bodies, tokens ni query strings (comentario líneas 1-8;
  `error-handler.js:69-74` manda stack sólo al log). `logger.js` emite JSON
  a stdout/stderr con timestamp, level, event.
- `/health` vs `/ready`: `health.routes.js:1-15` y 27-43. `/health` responde
  `200 {status:'ok'}` sin tocar PostgreSQL (probe de liveness). `/ready`
  ejecuta el `SELECT 1` inyectable, responde `200 {status:'ready',
  database:'available'}` o `503 {status:'not_ready', database:'unavailable'}`
  sin revelar hosts ni credenciales. Pruebas: `test/health.test.js`.

## 7. Minimum-practices audit

Clasificaciones permitidas: COMPLIES · PARTIAL · DOES_NOT_COMPLY ·
NOT_FOUND · NOT_UNDERSTOOD. Cada fila cita evidencia o reconoce duda.

| Área | Pregunta | Clasificación | Evidencia / duda |
| --- | --- | --- | --- |
| Configuración | ¿Los secretos están fuera del código? | COMPLIES | `.env` en `.gitignore`; `token.js:8-12` falla sin `JWT_SECRET`; `pool.js:10-12` sin `DATABASE_URL`. Nunca en commits. |
| Entrada | ¿Se validan datos externos? | COMPLIES | `parse-id.js:16-22` (id) y validación de body en service (`createRequest`/`patchRequest`: título, prioridad, estado, transiciones). |
| SQL | ¿Las consultas están parametrizadas? | COMPLIES | `requests.store.js` y `users.store.js`: siempre `$1..$n`; identifiers nunca vienen del cliente (store.js:20-47). |
| Identidad | ¿El JWT se verifica? | COMPLIES | `authenticate.js:27-40` + `token.js:35-42` (`jwtVerify`, HS256, iss, aud, exp). Sin token o inválido → 401 (`request-detail.test.js:19-22`). |
| Permisos | ¿Existe autorización además de autenticación? | PARTIAL | Policy existe y se usa en history/patch/claim (`service.js:162,224,245`), pero `getRequest` no la consulta (BUG-901, `service.js:86-93`). |
| Ownership | ¿Se limita el acceso al propietario cuando corresponde? | PARTIAL | Listado: sí, en SQL (`store.js:37-40`). Detalle: NO — requester ajeno lee solicitudes ajenas cambiando el ID (reproducido, HTTP 200→debe ser 404). |
| Dominio | ¿Los campos del servidor están protegidos? | COMPLIES | `SERVER_CONTROLLED_FIELDS` rechazados en `auth.service.js:18` y `requests.service.js:35,47-54` (id/createdBy/createdAt/updatedAt/changedBy/assignedTo/status/role). |
| Consistencia | ¿Las escrituras relacionadas usan transacción? | COMPLIES | `withTransaction` en `createRequest` (service.js:113-128), `patchRequest` (157-214) y `claimRequest` (240-270); `transaction.js:6-22`. |
| Errores | ¿Existe un formato consistente? | COMPLIES | `error-handler.js:29-31` cuerpo uniforme; `AppError` en `app-error.js:9-15`; `CATEGORY_STATUS` en error-handler.js:18-24. |
| Logs | ¿Ayudan a investigar sin exponer secretos? | COMPLIES | `request-logger.js:21-29` allowlist; `logger.js` JSON; nunca headers/bodies/tokens. Prueba: `test/traceability.test.js`. |
| Pruebas | ¿Existen casos positivos y negativos? | PARTIAL | Hay positivos y negativos (`request-detail.test.js`, `requests.test.js`, `request-policy.test.js`), pero el acceso horizontal NO estaba cubierto: hueco del BUG-901 (ticket: "el hueco no está cubierto por ninguna prueba"). |
| Migraciones | ¿El esquema está versionado? | COMPLIES | `database/migrations/001-005` + ledger `schema_migrations` (`migrate.js:20-25,36-39`); todas `[SKIPPED]` (ya aplicadas). |
| Seed | ¿Puede repetirse de forma controlada? | COMPLIES | `seed.js` repetible: sólo borra/crea datos de users seed, por emails exclusivos `*.seed@example.test` (comentario seed.js:3-7, código 49-72). |
| Arquitectura | ¿HTTP, reglas y SQL están separados razonablemente? | COMPLIES | route→service→policy→store→mapper; policy pura sin Express/SQL (`request.policy.js`; verificado por `validate-class-09`). |
| Operación | ¿Health y readiness tienen propósitos distintos? | COMPLIES | `/health` liveness sin DB vs `/ready` readiness con `SELECT 1` (`health.routes.js:1-15`); respuestas 200/503 distintas. |

## 8. Change impact

Completa ANTES de modificar código. Commit: `class-09-analysis`.

### Observable behavior

Cambia: un `requester` ajeno deja de recibir `200` con la solicitud de otro
usuario en `GET /requests/:id`; recibe el mismo `404 REQUEST_NOT_FOUND` que
una solicitud inexistente (decisión de este sistema en el ticket BUG-901:
no confirmar existencia para reducir enumeración de IDs).

NO debe cambiar: el `404` de una solicitud que no existe, el `200` del owner,
el `200` del agente, el schema del JSON autorizado, el `401` sin token, ni
ningún endpoint vecino (colección, history, claim, patch).

### Files likely affected

- `src/modules/requests/requests.service.js` — función `getRequest`
  (líneas 86-93): únicamente ahí vive el retorno directo con el comentario
  `TEMP(REQ-442)`. Cambio mínimo: consultar `canViewRequest` tras cargar la
  fila.
- `src/modules/requests/request.policy.js` — NO debería cambiar: la regla
  `canViewRequest` (líneas 20-23) ya existe y es correcta; el problema es que
  nadie la llama.
- `test/request-detail.test.js` — convertir los 2 TODO stubs (líneas 69-80)
  en pruebas de regresión.
- `test/request-access-policy.test.js` — convertir los 3 TODO stubs
  (líneas 19-31) en pruebas puras de la policy.
- Sin cambios en migraciones, store, mapper ni rutas.

### Rule to protect

Un requester sólo puede consultar solicitudes que él creó; un agente puede
consultar cualquier solicitud. (La regla ya existe en la policy — la
corrección es hacer que el detalle la consulte.)

### Data required

- `actor.userId` y `actor.role` — vienen del token verificado
  (`authenticate.js:43`, `req.auth`). Jamás de `userId`/`createdBy` en query
  o body (regla explícita del ticket).
- `request.createdBy` y `request.status` — de la fila cargada por
  `findById` y mapeada por `mapRequestRow`. `canViewRequest` sólo usa
  `createdBy` y `role`.

### Status codes

| Caso | Antes (bug) | Después (esperado) |
| --- | --- | --- |
| Sin token | 401 AUTHENTICATION_REQUIRED | 401 (sin cambios) |
| id malformado | 400 INVALID_REQUEST_ID | 400 (sin cambios) |
| id inexistente | 404 REQUEST_NOT_FOUND | 404 (sin cambios) |
| owner (requester) | 200 | 200 (sin cambios) |
| agent | 200 | 200 (sin cambios) |
| requester ajeno | **200 (leak)** | **404 REQUEST_NOT_FOUND** |
| `?userId=<owner>` con token ajeno | 200 (leak) | 404 — la identidad sólo del token |

### Tests to add or change

- `test/request-detail.test.js` — activar: "a different requester receives
  the same 404 as a missing request" y "a userId in the query string does
  not grant access". Deben fallar contra el bug (200) y pasar con el fix
  (404).
- `test/request-access-policy.test.js` — activar: agente→true, owner→true,
  ajeno→false. Son pruebas puras, sin Express ni base
  (`npm run test:policy`).
- La suite completa (`npm test`) y `npm run validate:class-09` deben seguir
  verdes.

### Behavior that must remain unchanged

- Owner `200` y schema exacto con las 9 claves
  (`request-detail.test.js:47-51`).
- Agent `200` en cualquier solicitud.
- Sin token → `401`; id inválido → `400`.
- Listado de requesters scoped en SQL (`store.js:37-40`), `getHistory`
  sigue 404 para ajenos, `claimRequest`, `patchRequest` y endpoints
  vecinos intactos.

### Risks

- Romper el `200` del agente si la policy se consultara con datos
  incorrectos → mitigado: `canViewRequest` devuelve `true` para agente y se
  prueba puro.
- Cambiar el schema de la respuesta autorizada → el test de contract freeze
  (`request-detail.test.js:47-51`) y el check 09 del validator lo detectan.
- Copiar/pegar la política a otros endpoints sin revisar → limitado: cambio
  localizado a `getRequest`; history ya la tiene hace tiempo.
- Confirmar enumeración por diferencia 403/404 → este sistema decide 404
  para ambos casos (justificación en el ticket); ninguno de los dos revela
  datos.
- Afectar datos de seed/pruebas → las pruebas usan usuarios sintéticos con
  cleanup dedicado (`test/helpers/cleanup.js`); el fix no migra ni siembra.

### Unknowns

- Por qué el soporte pedía comparar reportes duplicados *leyéndolos* con la
  visibilidad apagada (REQ-442): el comentario no explica el workflow, sólo
  que "support compares duplicate reports".
- Si existían más endpoints con la visibilidad deshabilitada o si el equipo
  reabrió el hueco en otra ruta distinta a `GET /requests/:id`.
- La fecha en que se introdujo el TEMP(REQ-442); el historial de git la
  revelaría pero no fue inspeccionado en este análisis.

## 9. Unknowns and questions

1. ¿Qué reportes duplicados estaba comparando el equipo de soporte que llevó
   a desactivar la visibilidad en `getRequest` (comentario `TEMP(REQ-442)`)?
   El comentario no lo explica.
2. ¿Por qué el scoping de la colección vive en SQL (`store.js:37-40`) pero el
   del detalle se dejó a la policy en JS, y por qué el detalle quedó sin
   consultarla? Es una inconsistencia histórica que este fix no resuelve del todo.
3. ¿Hay más rutas o versiones del servicio donde la policy no se consulte?
   Sólo revisé a fondo `GET /requests/:id`, `GET /requests/:id/history` (sí la
   usa), `PATCH` y `claim`.
4. ¿`canViewHistory` es una redundancia de `canViewRequest` o el día de
   mañana dará reglas distintas? Hoy son idénticas (`request.policy.js:25-27`).
5. ¿Cómo decidió el equipo que `404` era mejor que `403` para "existe pero no
   me pertenece"? El ticket lo justifica como decisión de este sistema, pero
   no vi el contexto de la discusión (sólo el BUG-901).
6. ¿El validador de 14 checks cubre el caso del header `as=<owner>` como
   fuente de identidad? El check 12 prueba `?userId=` y `??createdBy=&as=`,
   pero no sé si el middleware `authenticate` rechaza explícitamente esos
   parametros o simplemente los ignora.
7. ¿Cuánto de la suite de tests depende de una base real y cuánto se podría
   mover a mocks? Hoy `test:policy` corre sin DB y el resto usa Supabase.
