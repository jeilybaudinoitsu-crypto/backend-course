# Work log

Registro del trabajo con IA durante el TALLER (la evaluación tiene su
propio historial obligatorio en assessment/). No copies conversaciones
completas aquí: registra el criterio, no el chat.

## What I observed before asking AI

Ya había ejecutado el baseline por mi cuenta antes de preguntar nada:

- `git remote -v` confirmó que estoy en mi repo del curso.
- `npm run doctor` → 7/7 PASS (entorno y base listos).
- `npm run db:migrate` → 001-005 todas `[SKIPPED]` (las conocía de las
  clases 6-8).
- `npm run db:seed` → 6 requests y 15 eventos recreados.
- `npm test` → 59 PASS, 0 FAIL, **5 TODO**. Esos TODO eran los stubs del
  ticket: leí el BUG-901 y supe que el hueco no estaba cubierto.

Con mis ojos, sin IA: `src/modules/requests/requests.service.js:86-93`
(`getRequest`) devuelve la fila sin consultar ninguna policy — con un
comentario `TEMP(REQ-442)`. En cambio `getHistory` (mismo archivo) sí
llama a la policy. Ahí ya sospeché que la regla existía pero nadie la
consultaba en el detalle.

## What I asked

1. "El BUG-901 dice que un requester lee solicitudes ajenas cambiando el
   ID. ¿Es reproducible con los datos del seed o solo con usuarios
   sintéticos?" → lo probé con el seed (Ana lectura de Luis).
2. "¿Dónde está la regla de 'solo el dueño' y por qué el detalle no la
   usa?" → me señaló la policy y el comentario REQ-442.
3. "¿Cuál es el cambio mínimo y qué debo NO tocar?" → me propuso reutilizar
   `canViewRequest` y devolver el mismo `404` del caso inexistente.
4. "¿Conviene cambiar `request.policy.js`?" → dijo que no, que la regla
   estaba sana; solo faltaba engancharla.
5. "¿Puedo meter DTOs/controller nuevos?" → me dijo que no agrege capas.

## What the AI proposed

- Confirmar el leak con una reproducción HTTP real (no solo teoría).
- Convertir los TODO de `test/request-detail.test.js` y
  `test/request-access-policy.test.js` en pruebas reales ANTES de tocar el
  código, correrlas en rojo contra el bug.
- El fix mínimo: en `getRequest`, tras `mapRequestRow`, consultar
  `canViewRequest(actor, request)` y en caso de denegar lanzar el mismo
  `notFound(id)` de siempre (404 indistinguible de "no existe").
- No tocar migraciones, store, mapper ni rutas; no agregar capas.
- Verificar al final con la suite completa y `validate:class-09`.

## Evidence I checked

- `request.policy.js:20-23` — `canViewRequest` ya hacía lo que el ticket
  pide (agente→true; requester→`createdBy === userId`). Lo contrasté con la
  matriz del comentario 6-14.
- `requests.service.js` — cuáles usos consultaban la policy:
  `getHistory` (sí), `patchRequest`:162 (sí), `claimRequest`:245 (sí) y
  `getRequest` (NO). Confirmado por inspección directa, no por suposición.
- `test/request-detail.test.js:47-51` — el contract freeze del schema
  autorizado (las 9 claves); mi fix no debía alterarlas.
- `test/helpers/cleanup.js` y `test-data.js` — las pruebas usan usuarios/
  requests sintéticos con emails únicos y cleanup dedicado; leerlas me
  tranquilizó de que correr la regresión no ensucia la base.
- Reproducción real: `curl` con los seeds (`ana`, `luis`, `maria`) →
  luis recibía `200` con la solicitud de ana; tras el fix `404`.

## What I accepted

- Reutilizar `canViewRequest` tal cual (cambio mínimo, una función usada).
- Que la denegación sea `404 REQUEST_NOT_FOUND`, igual que la inexistencia
  (decisión del sistema BUG-901 para no confirmar existencia y no permitir
  enumeración).
- Convertir los 5 TODO en pruebas reales (2 de detalle + 3 de policy pura).
- El orden de trabajo: reproducir → activar regresión en rojo → corregir →
  verla en verde → suite → validador.

## What I rejected

- La idea (de un primer borrador mío) de editar `request.policy.js` para
  "fortalecer" la regla: la regla ya era correcta y el problema era su
  invocación. Editarla habría sido tocar de más y arriesgar los contratos.
- Mi impulso de responder `403` para "existe pero no me pertenece": el
  ticket lo decide explícitamente como `404`, y además `history` ya usa 404
  — haber puesto 403 habría roto la consistencia y revelado existencia.
- Cambiar el schema del `GET /requests/:id` autorizado: prohibido por el
  contract freeze del ticket y de `request-detail.test.js`.
- Añadir una capa extra (por ej. un middleware de ownership por ruta):
  el módulo ya tiene route→service→policy→store→mapper; el fix de 3 líneas
  en el service es la corrección mínima y lo único que el ticket pide.

## What I changed

- `src/modules/requests/requests.service.js` — `getRequest`: se retira el
  comentario `TEMP(REQ-442)` y se restaura la consulta a `canViewRequest`;
  una solicitud ajena para un requester lanza el mismo `notFound(id)`.
  Nada más cambió en producción: ni policy, ni store, ni rutas, ni SQL,
  ni migraciones, ni schema de respuesta.
- `test/request-detail.test.js` — 2 TODO convertidos en pruebas:
  "a different requester receives the same 404..." y "a userId in the
  query string does not grant access".
- `test/request-access-policy.test.js` — 3 TODO convertidos en pruebas
  puras de `canViewRequest` (agente, owner, ajeno).
- `activities/class-09/system-dossier.md` — secciones 1 a 9 completas con
  evidencia archivo+linea.
- `activities/class-09/validation-evidence.txt` — salidas reales de todos
  los comandos (sin secretos).
- `activities/class-09/work-log.md` — este registro.

## How I verified it

- `npm run test:detail` → 2 pruebas nuevas FALLARON contra el bug
  (`200 !== 404`) y pasan tras el fix.
- `npm run test:policy` → las 3 pruebas puras de `canViewRequest` pasan
  sin Express ni base.
- `curl` contra el server local con la base real: ajeno→404, ajeno
  con `?userId=`→404, owner→200, agent→200, sin token→401. El schema del
  200 autorizado se mantuvo (mismas claves).
- `npm test` → 64/64 PASS, 0 TODO (antes: 59 PASS / 5 TODO).
- `npm run validate:class-09` → **14/14 PASS** (`FINAL RESULT: PASSED`),
  incluido el check 12 (policy sin dependencia de Express) y el 14 (sin
  secretos en los documentos entregados).

## What I still cannot explain

- Por qué la visibilidad se desactivó exactamente con REQ-442: el
  comentario dice que "support compara reportes duplicados", pero no
  explico cómo el soporte podía leer reportes ajenos de forma legítima sin
  confirmar enumeración. Me parece contradictorio con la regla de negocio.
- Si el mismo equipo dejó más endpoints con la visibilidad deshabilitada o
  si hay otros lugares donde la policy no se consulta (solo audité a fondo
  detail/history/patch/claim).
- Por qué el scoping de la colección vive en SQL (`store.js`) mientras el
  del detalle vive en la policy JS; son dos filosofías distintas en un
  mismo módulo y el ticket no las unifica.