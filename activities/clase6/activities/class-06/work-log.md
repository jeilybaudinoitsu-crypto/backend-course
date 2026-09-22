# Class 06 work log

## Environment

Configuré el `.env` copiando `.env.example`, pegué la `DATABASE_URL` desde el
cuadro de conexión de Supabase y generé el `JWT_SECRET` con
`npm run generate:secret`.

El comando que confirmó que todo estaba listo fue `npm run db:check`.
Me dio 10/10 en verde desde la primera corrida: archivo de entorno, variables,
conexión a la base, migraciones y seed.

## Request flow

El flujo lo rastreé siguiendo una petición de punta a punta:

- La petición entra por `src/app.js`, que monta Express.
- La autenticación se revisa en `src/middleware/authenticate.js` para toda la
  ruta `/requests`: asume que llega un bearer y arma `req.auth`. Sin token,
  responde 401 y el router nunca se ejecuta.
- La autorización vive en `src/modules/requests/request.policy.js`: funciones
  puras que deciden si el actor puede listar, ver, editar, cambiar prioridad o
  estado.
- PostgreSQL se toca en `src/modules/requests/requests.store.js`, que ejecuta
  consultas parametrizadas con el `pool` (o un cliente de transacción).

## Bug fixed

El bug era BUG-106: `GET /requests?status=closed` devolvía 404 cuando no había
coincidencias. En `listRequests` se lanzaba uno de los `AppError` tipo resource
cuando el arreglo de filas quedaba vacío.

Lo que debe pasar es que una colección vacía con filtro válido responda 200
con `[]`: no es lo mismo un recurso que no existe que una colección sin
resultados. El 404 queda reservado para recursos individuales.

Archivo modificado: `src/modules/requests/requests.service.js` — quité el throw
y ahora devuelvo `rows.map(mapRequestRow)` directamente (puede ser `[]`).

Prueba que protege el comportamiento:
`test/requests.test.js` → "a valid empty collection answers 200 with []".

## Feature implemented

`GET /requests/:id/history` devuelve la lista de eventos de un request.

- Quién puede usarlo: cualquiera autenticado, pero un requester solo ve el
  historial de SUS propios requests; un agente ve el de cualquiera. Un extraño
  recibe exactamente el mismo 404 que un request inexistente, para no
  confirmar existencia.
- Cómo se ordena: de más antiguo a más nuevo con `ORDER BY created_at, id`,
  donde el id rompe empates. El nacimiento (`status_changed` con
  `fromStatus` nulo) siempre aparece primero.

Lo implementé reusando la política existente `canViewHistory`, la consulta
`findHistory` del store y el mapper `mapHistoryEventRow`, que ya ocultaba
`changed_by`. Solo faltaba el servicio y la ruta.

## Test explained

Elijo la prueba de regresión: "a valid empty collection answers 200 with []".

- Datos que prepara: crea un usuario requester de prueba y obtiene su token de
  login.
- Acción que ejecuta: hace `GET /requests?status=closed`, un filtro válido que
  no coincide con nada porque el usuario no tiene requests cerrados.
- Lo que comprueba: que el status sea 200 y que el cuerpo sea exactamente `[]`.
- Regla que protege: la diferencia entre recurso inexistente y colección vacía
  del contrato de la clase 3 (BUG-106).

## AI assistance

- La IA me ayudó a entender por qué el 404 de colección vacía era incorrecto:
  yo confundía "no hay filas" con "el recurso no existe".
- También me ayudó a conectar las piezas del historial que ya existían pero no
  estaban cableadas: el store ya tenía `findHistory` y el mapper ya filtraba
  campos sensibles; solo faltaba el servicio y la ruta.
- Verifiqué yo mismo la salida: corrí `npm test` (15/15) y
  `npm run validate:class-06` hasta llegar a 12/12.
- Una sugerencia incompleta fue que la ruta del historial debía ir "después"
  de la ruta genérica `/:id`; probé y me di cuenta de que Express las trata
  como rutas distintas y el orden no importa para este caso.

## Remaining doubt

Todavía no termino de entender bien cómo se comporta el `pool` con varias
transacciones en paralelo: cuando dos agentes cambian el mismo request (casi)
a la vez, no me queda claro que los eventos puedan llegar al historial en un
orden extraño. El `ORDER BY created_at, id` ayuda, pero si quisiera un orden
estrictamente garantizado por la causa y el efecto, creo que necesitaría
pensar algo más — quizás un contador por request en vez del timestamp.