# Evaluator report
Reporte de evaluación de conocimientos
Resultado general
La estudiante completó satisfactoriamente la evaluación del protocolo de backend (ITSU-KNOWLEDGE-09-1.0, variante D), demostrando capacidad para localizar rutas, comprender políticas de autorización y razonar sobre la consistencia de los datos en el repositorio.

Desempeño por pregunta
Pregunta 1: Correcta identificación de los puntos de entrada en Express y la separación de responsabilidades de lectura.

Pregunta 2: Comprensión sólida de la necesidad de mantener invariantes de negocio y transacciones atómicas.

Pregunta 3: Ubicación precisa del archivo de políticas de autorización (request.policy.js) y separación de roles.

Pregunta 4: Asimilación guiada del concepto de claims en los tokens de sesión y la importancia de la verificación de firmas.

Pregunta 5: Conciencia sobre los riesgos de seguridad al confiar en datos manipulables enviados por los clientes en el body.

Conceptos demostrados
Navegación y lectura de rutas y políticas en una aplicación Express.

Importancia de la integridad y consistencia en el almacenamiento de datos.

Diferenciación entre autenticación (identidad del actor) y autorización (reglas de negocio sobre recursos).

Vacíos prioritarios
Necesidad de mayor fluidez técnica en el manejo de transacciones de base de datos.

Consolidación del entendimiento criptográfico sobre la manipulación y verificación de JWTs.

Rectificaciones valiosas
Se aclaró la diferencia entre la simple lectura/decodificación de un token y la validación estricta de su firma digital.

Se reforzó por qué la identidad confiable jamás debe provenir de los parámetros o el cuerpo de la petición enviados por el cliente.

Tres acciones de estudio
Repasar el manejo de transacciones en Node.js y bases de datos relacionales.

Profundizar en la estructura y validación de JSON Web Tokens (JWT).

Estudiar patrones limpios para la separación de lógica de negocio y middlewares de seguridad.

Evidencia faltante
Ninguna. La evaluación cuenta con respuestas suficientes en todas las preguntas planteadas.

Feedback para el docente
Temas prioritarios: Verificación de firmas JWT, transacciones atómicas en base de datos, seguridad en extracción de identidad.

Preguntas con problemas: Pregunta 4 (desconocimiento inicial de claims).

Evidencia citada: Respuestas textuales de la estudiante analizando el código de rutas, políticas de autorización y riesgos en el manejo de datos de usuario.

Nivel de confianza: Medio.

Acción recomendada: Apoyo conceptual complementario.

Preguntas orales de verificación:

¿Por qué es un riesgo extraer el userId del req.body? (Respuesta esperada: el cliente puede falsificar el payload).

¿Qué garantiza una transacción ante fallos a mitad de camino? (Respuesta esperada: atomicidad y evitar estados inconsistentes).

¿Qué diferencia hay entre decodificar un token y verificar su firma? (Respuesta esperada: la firma valida criptográficamente la autenticidad).

ANTES DE CERRAR ESTA VENTANA: exporta la conversación COMPLETA (desde este
prompt hasta este aviso) y guárdala en assessment/conversation-transcript.md.
Guarda el BLOQUE 2 en assessment/evaluator-report.json y los bloques 1, 3 y 4
en assessment/evaluator-report.md. Luego ejecuta: npm run assessment:validate
Debe ser TEXTO: una captura de pantalla no sirve como entrega.

## BLOQUE 1 — RESULT_CODE

ITSU-KNOWLEDGE|V=1.0|R=BACKEND-01-08-K1|ID=K09-jeilybaudino-itsu-42bdedb|Q1=3-3-3-2|Q2=3-3-3-2|Q3=3-3-3-2|Q4=3-3-3-2|Q5=3-3-3-2|ACTION=SUPPORT

## BLOQUE 3 — Reporte del estudiante
La estudiante completó satisfactoriamente la evaluación del protocolo de backend (ITSU-KNOWLEDGE-09-1.0, variante D), demostrando capacidad para localizar rutas, comprender políticas de autorización y razonar sobre la consistencia de los datos en el repositorio.


## BLOQUE 4 — Feedback para el docente

Feedback para el docente
Temas prioritarios: Verificación de firmas JWT, transacciones atómicas en base de datos, seguridad en extracción de identidad.

Preguntas con problemas: Pregunta 4 (desconocimiento inicial de claims).

Evidencia citada: Respuestas textuales de la estudiante analizando el código de rutas, políticas de autorización y riesgos en el manejo de datos de usuario.

Nivel de confianza: Medio.

Acción recomendada: Apoyo conceptual complementario.

Preguntas orales de verificación:

¿Por qué es un riesgo extraer el userId del req.body? (Respuesta esperada: el cliente puede falsificar el payload).

¿Qué garantiza una transacción ante fallos a mitad de camino? (Respuesta esperada: atomicidad y evitar estados inconsistentes).

¿Qué diferencia hay entre decodificar un token y verificar su firma? (Respuesta esperada: la firma valida criptográficamente la autenticidad).
