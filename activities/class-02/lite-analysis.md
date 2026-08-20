# Análisis del proyecto Lite

> **Documento completado ANTES de usar IA y ANTES de corregir el código.** Es la evidencia del
> análisis independiente sobre la API de partida.
>
> Método usado: **ejecutar, observar, registrar**. Cada caso se probó con `curl -i` para ver la
> línea de estado, no solo el cuerpo.

## 1. Cómo ejecuté la API

```bash
cd activities/class-02/lite-api
npm install
node server.js
```

Salida de la terminal:

```txt
Request API Lite is running on http://localhost:3000
```

## 2. Tabla de análisis

| Endpoint | Intención | Entrada | Respuesta actual | Problema | Propuesta |
| -------- | --------- | ------- | ---------------- | -------- | --------- |
| `GET /getRequests` | Listar todas las solicitudes | Ninguna (sin query ni body) | `200 OK` + arreglo JSON con las solicitudes | El nombre de la ruta contiene un verbo (`get`) en lugar de nombrar el recurso; la ruta del recurso (`/requests`) no existe | `GET /requests` → `200` con el arreglo de solicitudes |
| `GET /requests/1` | Consultar la solicitud con id 1 | Path parameter: `id=1` | `200 OK` + objeto de la solicitud 1 | Correcto | Sin cambios |
| `GET /requests/999` | Consultar una solicitud inexistente | Path parameter: `id=999` | `200 OK` + `{"error":"Request not found"}` | Devuelve éxito (`200`) cuando el recurso no existe; el estado contradice al cuerpo | `404 Not Found` + `{"error":"Request not found"}` |
| `POST /requests` | Crear una solicitud nueva | Body: `{"title":"Leaking faucet","description":"...","priority":"medium"}` | `200 OK` + objeto creado con `id: 4` y `status: "open"` | Devuelve `200` en vez de `201`: el cliente no puede distinguir una creación de una consulta mirando solo el estado | `201 Created` + objeto creado |
| `POST /requests` (sin título) | Crear una solicitud | Body: `{"description":"No title at all","priority":"low"}` | `200 OK` + `{"id":5,"description":"No title at all","status":"open","priority":"low"}` (sin `title`) | Acepta una creación sin `title`, lo guarda y devuelve éxito; falta validación | `400 Bad Request` + `{"error":"Title is required"}` y ningún dato guardado |
| `GET /getRequests` (después de crear) | Comprobar el estado de los datos | Ninguna | `200 OK` + la lista contiene la solicitud `id:4` y la `id:5` sin título | Confirma que la solicitud inválida (sin `title`) quedó almacenada | La lista debe contener solo la solicitud `id:4` |

## 3. Evidencia

Peticiones y respuestas observadas con `curl -i`. Se incluye la línea de estado.

```txt
# A1 · GET /getRequests
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 462

[{"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"high"},{"id":2,"title":"Broken chair in the lab","description":"One chair in the computer lab has a loose back rest.","status":"in-progress","priority":"medium"},{"id":3,"title":"Wi-Fi drops in the library","description":"The connection drops every few minutes on the second floor.","status":"open","priority":"low"}]

# A1b · GET /requests
HTTP/1.1 404 Not Found
Content-Type: text/html; charset=utf-8

<!DOCTYPE html><html><body><pre>Cannot GET /requests</pre></body></html>

# A2 · GET /requests/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 150

{"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"high"}

# A3 · GET /requests/999
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 29

{"error":"Request not found"}

# A4 · POST /requests (válida)
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 131

{"id":4,"title":"Leaking faucet","description":"The faucet in the third floor bathroom leaks.","status":"open","priority":"medium"}

# A5 · POST /requests (sin título)
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 73

{"id":5,"description":"No title at all","status":"open","priority":"low"}

# A6 · GET /getRequests después de A4 y A5
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 668

[{"id":1,"title":"Projector does not turn on","description":"The projector in room 204 shows no image during class.","status":"open","priority":"high"},{"id":2,"title":"Broken chair in the lab","description":"One chair in the computer lab has a loose back rest.","status":"in-progress","priority":"medium"},{"id":3,"title":"Wi-Fi drops in the library","description":"The connection drops every few minutes on the second floor.","status":"open","priority":"low"},{"id":4,"title":"Leaking faucet","description":"The faucet in the third floor bathroom leaks.","status":"open","priority":"medium"},{"id":5,"description":"No title at all","status":"open","priority":"low"}]
```

## 4. Preguntas guía

1. **¿Qué recurso representa esta API y cómo se nombra en cada una de sus rutas?**
   Representa solicitudes de mantenimiento (`request`). La ruta de listado se nombra con un
   verbo (`/getRequests`) en lugar de con el recurso (`/requests`). La consulta individual usa
   `/requests/:id` y la creación usa `POST /requests`, que sí nombran el recurso.

2. **¿Qué método HTTP corresponde a cada intención, y coincide con el que usa el código?**
   Listar → `GET`; consultar una → `GET`; crear → `POST`. Los métodos coinciden con la
   intención; el problema está en el nombre de la ruta de listado, no en el método.

3. **¿Qué código de estado devuelve cada respuesta y qué afirma exactamente ese código?**
   Todas las respuestas devuelven `200 OK`. El `200` afirma «la petición se procesó y hubo un
   resultado positivo». Eso es correcto para listar y consultar un recurso existente, pero es
   falso para consultar un recurso inexistente (debería ser `404`) y para crear un recurso
   nuevo (debería ser `201`).

4. **¿Hay alguna respuesta cuyo estado contradiga su propio cuerpo? ¿Cuál y por qué?**
   Sí, dos. `GET /requests/999` responde `200 OK` pero su cuerpo dice `{"error":"Request
   not found"}`: el estado afirma éxito y el cuerpo describe un fallo. `POST /requests` sin
   título responde `200 OK` y devuelve un objeto incompleto como si la creación hubiera sido
   correcta.

5. **¿Qué entradas acepta el servidor sin comprobarlas, y qué consecuencia tiene aceptarlas?**
   El `title` de la creación. Si falta, el servidor crea igual una solicitud sin título y la
   guarda. Un cliente que luego consuma esa solicitud recibirá un dato que no cumple la forma
   prometida por el contrato.

6. **¿Cómo distinguiría un cliente automático un éxito de un error sin leer el cuerpo?**
   No podría: todos los estados son `200`. Un cliente que decida por el estado trataría una
   solicitud inexistente o una creación fallida como éxito. Solo leyendo el cuerpo (que no
   siempre se lee) podría notar la diferencia.

7. **¿Qué parte del comportamiento observado no podía deducirse leyendo solo las rutas?**
   Que `GET /requests/999` responde con estado de éxito; que `POST /requests` acepta cuerpos
   sin `title`; y que `GET /requests` directamente no existe. Leyendo las rutas del código se
   ve `app.get('/getRequests')`, `app.get('/requests/:id')` y `app.post('/requests')`, pero el
   comportamiento exacto de cada manejador (estado y validación) solo se descubre ejecutando.

8. **Si otra persona consumiera esta API sin ver el código, ¿qué supuesto la haría fallar?**
   Suponer que existe `GET /requests` (la ruta del recurso), y suponer que puede distinguir
   entre una solicitud existente y una inexistente, o entre una creación exitosa y una
   rechazada, mirando el código de estado.

## 5. Conclusión

El problema más grave para quien consume la API es que **no hay forma de distinguir un éxito
de un fallo por el código de estado**: `GET /requests/999` devuelve `200` con un cuerpo de
error y `POST /requests` sin título devuelve `200` con un objeto incompleto. Un cliente
automático —el caso más común en una API— decide con el estado y daría por válidas
operaciones que no lo son. Los otros defectos (ruta con verbo, falta de `201`) son de
nomenclatura y semántica de estado, pero no rompen la confianza del cliente; este sí.