# User Personas & Product Experience
## Capítulo 1 — Ecosistema de Usuarios

**Document ID:** UPPE-001  
**Version:** 1.0.0  
**Date:** 2026-06-26  
**Status:** APPROVED  
**Classification:** Confidential — Product & Design Team  
**Companion documents:** PAD-001, BRFF-001, DM-001, PSBM-001

---

## Table of Contents

1. [Ecosistema Completo de Usuarios](#1-ecosistema-completo-de-usuarios)
2. [Buyer Personas — Perfiles Completos](#2-buyer-personas--perfiles-completos)
3. [Objetivos Principales por Perfil](#3-objetivos-principales-por-perfil)
4. [Customer Journey](#4-customer-journey)
5. [Jobs To Be Done](#5-jobs-to-be-done)
6. [Escenarios Reales](#6-escenarios-reales)
7. [Necesidades Funcionales](#7-necesidades-funcionales)
8. [Necesidades Emocionales](#8-necesidades-emocionales)
9. [Principios de Experiencia](#9-principios-de-experiencia)
10. [Autoauditoría del Ecosistema](#10-autoauditoría-del-ecosistema)

---

## Nota metodológica

Este capítulo fue construido siguiendo la metodología de Product Discovery utilizada en empresas de producto de clase mundial. Los perfiles aquí desarrollados no son suposiciones — son síntesis de comportamientos, motivaciones y frustraciones reales observados en entornos de operación de beneficios, programas de lealtad y software empresarial en América Latina.

Cada persona ficticia representa un arquetipo real. Las edades, nombres y contextos son representativos de los segmentos identificados en el documento PSBM-001. Toda decisión de experiencia posterior debe poder rastrearse hasta al menos un perfil de este documento.

**Regla de uso:** Si se propone una funcionalidad que no sirve a ningún perfil de este capítulo, esa funcionalidad no debe construirse.

---

## 1. Ecosistema Completo de Usuarios

### 1.1 Mapa del ecosistema

Pase Digital es operado por tres grandes grupos de actores:

1. **El equipo de Pase Digital** (operadores de la plataforma).
2. **Las empresas** que contratan la plataforma (sus administradores y empleados).
3. **Los clientes finales** que usan los beneficios.

Cada grupo tiene subtipos con responsabilidades, privilegios y necesidades completamente distintas.

```
PASE DIGITAL (plataforma)
├── Superadministrador
├── Soporte Interno
└── Auditor Interno

EMPRESA (tenant)
├── Administrador de Empresa
├── Gerente de Sucursal
├── Supervisor Operativo
├── Cajero / Operador de escaneo
├── Empleado Operativo
└── Empresa interesada (pre-alta)

CLIENTE FINAL
└── Cliente (miembro del programa)
```

### 1.2 Catálogo de perfiles identificados

| ID | Perfil | Contexto | Frecuencia de uso |
|----|--------|----------|-------------------|
| P-01 | Superadministrador de plataforma | Equipo interno Pase Digital | Diaria (múltiples sesiones) |
| P-02 | Soporte Interno | Equipo interno Pase Digital | Diaria |
| P-03 | Auditor Interno | Equipo interno Pase Digital | Semanal / según incidente |
| P-04 | Administrador de Empresa | Empresa cliente | Diaria / múltiples veces por semana |
| P-05 | Gerente de Sucursal | Empresa cliente | Semanal / según reportes |
| P-06 | Supervisor Operativo | Empresa cliente | Diaria (turno) |
| P-07 | Cajero / Operador de escaneo | Empresa cliente | Diaria (cada turno) |
| P-08 | Empleado Operativo sin caja | Empresa cliente | Ocasional / según operación |
| P-09 | Cliente Final (miembro) | Usuario del Pase Digital | Eventual (cada visita) |
| P-10 | Empresa interesada (pre-alta) | Prospecto externo | Una sola vez (proceso de registro) |
| P-11 | Integrador / Desarrollador externo | Partner técnico de la empresa | Proyecto puntual |
| P-12 | Consultor / Agente de ventas | Canal indirecto de Pase Digital | Por proyecto |

---

## 2. Buyer Personas — Perfiles Completos

---

### P-01 — Superadministrador de Plataforma

---

**"Rodrigo, el arquitecto del ecosistema"**

> *"Mi trabajo no es operar beneficios. Mi trabajo es garantizar que el sistema en el que operan sea confiable, esté limpio y escale sin sorpresas."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Rodrigo Salinas |
| Edad | 34 años |
| Cargo | Head of Platform Operations / Co-fundador técnico |
| Nivel educativo | Ingeniería en Sistemas o Administración con fuerte componente técnico |
| Nivel tecnológico | Experto. Entiende tanto el negocio como la tecnología. Puede leer logs, pero prefiere dashboards |
| Contexto laboral | Trabaja desde la oficina central de Pase Digital. Tiene acceso a todos los entornos |

---

**Contexto profesional**

Rodrigo lleva 3 años construyendo Pase Digital. Conoce cada decisión de arquitectura, cada regla de negocio, cada empresa que ha entrado y salido. Es el primer contacto cuando algo falla en producción y el responsable final de que el sistema sea confiable.

No atiende a los clientes directamente — para eso está el equipo de Soporte. Pero sí toma decisiones críticas: aprobar o rechazar empresas, suspender operaciones, gestionar incidentes, analizar métricas globales.

Su mayor responsabilidad es invisible: que el sistema funcione sin que nadie tenga que pensar en él.

---

**Objetivos**

1. Garantizar que todas las empresas activas puedan operar sin interrupciones.
2. Aprobar empresas legítimas y rechazar actores de riesgo antes de que ingresen.
3. Detectar anomalías operativas antes de que se conviertan en incidentes.
4. Mantener la calidad y coherencia del catálogo de planes y configuraciones.
5. Controlar el estado financiero: empresas en mora, pagos pendientes, suscripciones por vencer.

---

**Responsabilidades diarias**

- Revisar el panel de empresas: nuevas solicitudes, empresas en mora, alertas de salud.
- Aprobar o rechazar solicitudes de alta de nuevas empresas.
- Gestionar suspensiones y reactivaciones.
- Revisar alertas del Motor Antifraude: patrones inusuales a nivel de plataforma.
- Verificar el estado de los servicios de infraestructura.
- Coordinar con el equipo de Soporte en escalamientos.

---

**Problemas diarios**

- Solicitudes de alta incompletas o sospechosas que requieren investigación manual.
- Empresas que no pagan pero tampoco responden a notificaciones.
- Alertas de posibles fraudes que deben investigarse rápido.
- Solicitudes de Admins de Empresa que requieren ajustes que solo él puede hacer.
- Reportes de clientes finales que llegan indirectamente (por el canal de soporte) con problemas de validación.

---

**Frustraciones**

- Tener que investigar el mismo tipo de problema repetidamente porque no hay documentación o automatización.
- Recibir solicitudes urgentes que podrían haberse prevenido con mejor autoservicio para los Admins de Empresa.
- No tener suficiente visibilidad anticipada sobre empresas que están en riesgo de abandono.
- Procesos que requieren intervención manual cuando podrían ser automáticos.

---

**Necesidades**

- Panel centralizado con vista de salud del ecosistema completo.
- Alertas proactivas, no reactivas: saber que algo va a fallar antes de que falle.
- Capacidad de actuar rápido: suspender, reactivar, ajustar con un solo clic y confirmación.
- Historial de auditoría completo y filtrable para cualquier investigación.
- Métricas financieras claras: qué empresas deben dinero, cuánto, desde cuándo.

---

**Motivaciones**

- El crecimiento de la plataforma. Cada nueva empresa activa es una validación del sistema que construyó.
- La confiabilidad. Que ninguna empresa tenga que llamar porque el sistema falló.
- El control. Saber que si algo sale mal, tiene los instrumentos para responder.

---

**Miedos**

- Una brecha de seguridad que comprometa datos de clientes.
- Un incidente de disponibilidad en horario pico (fin de semana, temporada alta).
- Una empresa fraudulenta que operó durante semanas antes de ser detectada.
- Perder la confianza de una empresa cliente grande por un fallo sistémico.

---

**Cómo mide el éxito**

- Uptime > 99.5% mensual.
- Tiempo de aprobación de nuevas empresas < 24 horas hábiles.
- Cero incidentes de seguridad.
- Churn de empresas < 3% mensual.
- Todos los pagos pendientes resueltos antes de llegar a suspensión.

---

**Qué espera de la plataforma**

Una consola de control que le dé visibilidad total sin ruido. Que las alertas sean accionables, no decorativas. Que pueda tomar decisiones críticas (suspender, aprobar, configurar) desde cualquier dispositivo, en cualquier momento, con confirmación clara del resultado.

---

**Acciones más frecuentes**

1. Revisar cola de solicitudes de alta de empresas.
2. Aprobar/rechazar solicitudes con registro del motivo.
3. Verificar estado de pagos pendientes.
4. Revisar métricas globales de validaciones y salud del sistema.
5. Responder a escalamientos del equipo de Soporte.
6. Investigar alertas del Motor Antifraude.

---

**Información que necesita ver**

- Total de empresas activas / suspendidas / en revisión.
- Empresas con pagos vencidos (días de mora + monto).
- Volumen total de validaciones del día / semana / mes.
- Alertas activas del sistema (antifraude, errores, latencia).
- Nuevas solicitudes de alta pendientes de revisión.

---

**Información que NO necesita ver**

- Detalle de clientes individuales de cada empresa (a menos que investigue un incidente específico).
- Contenido operativo de beneficios específicos (a menos que haya una disputa).
- Conversaciones entre empleados y clientes dentro de las empresas.

---

---

### P-02 — Soporte Interno

---

**"Valeria, la voz de la plataforma"**

> *"Cada empresa que llama tiene una urgencia real. Mi trabajo es resolver, no derivar. Si tengo que escalar, lo hago rápido con toda la información necesaria."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Valeria Mendoza |
| Edad | 27 años |
| Cargo | Customer Support Specialist / Agente de Soporte |
| Nivel educativo | Técnico o universitario (administración, sistemas, comunicaciones) |
| Nivel tecnológico | Intermedio. Usa el panel de administración con fluidez, no programa |
| Contexto laboral | Trabaja desde la oficina de Pase Digital o en remoto |

---

**Contexto profesional**

Valeria atiende entre 15 y 40 tickets por día. Sus interlocutores son los Admins de Empresa y, ocasionalmente, Gerentes de Sucursal. Rara vez habla directamente con clientes finales — eso lo gestiona la empresa misma.

Su trabajo requiere entender perfectamente cómo funciona la plataforma, porque cuando alguien le dice "el beneficio no se validó", tiene que saber exactamente qué puede haber salido mal y qué herramientas tiene para investigarlo.

---

**Problemas diarios**

- Admins de Empresa que no entienden por qué un cliente no puede validar su beneficio.
- Preguntas repetitivas que podrían resolverse con mejor documentación de autoservicio.
- Solicitudes que requieren intervención del Superadmin pero que llegan primero a Soporte.
- Falta de contexto en los reportes de problemas ("el QR no funciona" sin más detalle).

---

**Necesidades**

- Vista de solo lectura del panel de cualquier empresa para reproducir el problema sin tocar datos.
- Historial completo de validaciones de un cliente específico para diagnóstico rápido.
- Capacidad de escalar al Superadmin con un clic, incluyendo el contexto completo.
- Base de conocimiento interna con los problemas más frecuentes y sus soluciones.

---

**Cómo mide el éxito**

- Tiempo de primera respuesta < 2 horas.
- Resolución en primer contacto > 70%.
- CSAT del ticket > 4.5/5.
- Escalamientos al Superadmin < 20% de tickets.

---

**Qué espera de la plataforma**

Una vista de diagnóstico que le permita ver exactamente lo que ve el Admin de Empresa, sin modificar nada. Herramientas de búsqueda potentes: buscar un cliente por correo, buscar una validación por fecha, ver el historial de estados de una empresa.

---

---

### P-03 — Auditor Interno

---

**"Marco, el guardián de la trazabilidad"**

> *"Si algo pasó en el sistema, debe quedar registrado. Sin excepción. Mi trabajo empieza exactamente donde terminan los demás."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Marco Ríos |
| Edad | 41 años |
| Cargo | Internal Auditor / Compliance Officer |
| Nivel educativo | Contaduría, Derecho o Administración con especialización en auditoría |
| Nivel tecnológico | Intermedio-bajo. Prefiere informes exportables a navegar paneles complejos |
| Contexto laboral | Puede ser externo o interno. Accede a la plataforma con rol de solo lectura |

---

**Contexto profesional**

Marco no opera la plataforma. La examina. Su trabajo puede ser activado por: una disputa de una empresa sobre validaciones incorrectas, una investigación de fraude, una auditoría regulatoria, o el proceso interno de Pase Digital para verificar la integridad del sistema.

Necesita ver todo, modificar nada, y exportar lo que necesite en formatos estándar.

---

**Necesidades**

- Acceso de solo lectura al historial completo de auditoría, filtrable por empresa, fecha, actor y tipo de evento.
- Exportación de registros en formatos estándar (CSV, PDF).
- Vista de los estados históricos de entidades: cómo era el beneficio X el día Y.
- Visualización del actor responsable de cada acción registrada.

---

**Miedos**

- Que existan acciones que no dejaron rastro.
- Que los registros puedan ser modificados retroactivamente.
- Que la pista de auditoría sea incompleta en un momento crítico de investigación.

---

**Cómo mide el éxito**

- Encontrar el registro de cualquier evento en menos de 5 minutos.
- Exportar un reporte completo de auditoría de una empresa en menos de 2 minutos.
- Cero "no hay registro de eso" en la historia de la plataforma.

---

---

### P-04 — Administrador de Empresa

---

**"Carolina, la directora del programa"**

> *"Yo quiero saber que mis clientes están usando los beneficios. Y si no los están usando, quiero saber por qué. La plataforma tiene que darme esas respuestas rápido."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Carolina Vargas |
| Edad | 38 años |
| Cargo | Gerente de Marketing / Directora Comercial / Dueña del negocio |
| Nivel educativo | Universitario (administración, marketing, o carrera afín) |
| Nivel tecnológico | Intermedio. Usa con fluidez herramientas como Google Analytics, CRM básicos, redes sociales. No programa |
| Contexto laboral | Trabaja desde oficina, frecuentemente desde el teléfono |

---

**Contexto profesional**

Carolina representa al perfil más estratégicamente importante de la plataforma. Es quien tomó la decisión de contratar Pase Digital, quien responde al dueño o al directorio por los resultados del programa, y quien más se beneficia cuando el sistema funciona bien.

Su relación con la plataforma es habitual pero no constante — accede varias veces por semana, no varias veces por hora. Cuando accede, tiene preguntas concretas que responder: ¿cuántos clientes usaron el beneficio esta semana? ¿Está funcionando la campaña de temporada? ¿Hay algo inusual que deba atender?

---

**Objetivos**

1. Tener un programa de beneficios que los clientes realmente usen.
2. Entender qué beneficios generan más valor y cuáles son ignorados.
3. Poder reaccionar rápido ante cambios: activar, pausar o modificar un beneficio cuando lo necesita.
4. Mantener la operación de sus empleados bajo control sin microgestión.
5. Justificar ante su directorio o socios que el programa tiene impacto medible.

---

**Responsabilidades**

- Crear y publicar beneficios y campañas.
- Gestionar la base de clientes (importar, segmentar, subir/bajar niveles de membresía).
- Configurar sucursales y empleados.
- Revisar reportes y métricas de uso.
- Responder a situaciones excepcionales: anular validaciones, suspender clientes problemáticos.
- Gestionar la facturación con Pase Digital (subir comprobantes de pago, cambiar de plan).

---

**Problemas diarios**

- No saber si los empleados están validando correctamente.
- Clientes que se quejan de que su beneficio "no les aplicó" sin poder verificar qué pasó.
- Crear un beneficio toma demasiado tiempo si el proceso es confuso.
- Reportes que dan números pero no respuestas — sabe que se hicieron 80 validaciones pero no sabe si eso es bueno o malo.
- Empleados que rotan constantemente y requieren capacitación recurrente.

---

**Frustraciones**

- Sistemas que muestran mucha información pero no la que necesita.
- Tener que llamar a soporte para hacer algo que debería poder hacer sola.
- Procesos de creación de beneficios con demasiados pasos o formularios complejos.
- No poder ver en tiempo real si el beneficio que acaba de publicar ya está funcionando.
- Que el sistema la trate como si fuera ingeniera de software — con terminología técnica innecesaria.

---

**Necesidades**

- Dashboard de inicio que responda sus preguntas más frecuentes en < 5 segundos.
- Flujo de creación de beneficios guiado, sin tecnicismos, con confirmación clara.
- Vista de actividad de empleados (quién validó, cuándo, en qué sucursal).
- Alertas proactivas: "Este beneficio vence en 3 días", "Tu plan alcanza el límite de clientes".
- Exportación de reportes para presentar a socios o directorio.

---

**Motivaciones**

- El orgullo de un programa que funciona y que los clientes aprecian.
- Los datos que demuestran que la inversión en beneficios tiene retorno.
- La tranquilidad de saber que todo está bajo control sin tener que revisar todo el tiempo.

---

**Miedos**

- Que los empleados estén otorgando beneficios de forma incorrecta o fraudulenta.
- Que un error de configuración haya afectado a clientes sin que ella se enterara.
- Que el programa sea invisible para los clientes porque nadie les comunicó que existe.
- Que le cobren de más o que su plan no cubra lo que necesita y no se dé cuenta a tiempo.

---

**Cómo mide el éxito**

- Tasa de uso mensual de beneficios > 40% de clientes activos.
- Crecimiento de la base de clientes del programa mes a mes.
- Cero quejas de empleados sobre problemas de validación.
- Reportes listos en menos de 2 minutos cuando los necesita.

---

**Qué espera de la plataforma**

Una plataforma que la haga sentir en control sin requerirle un manual de usuario. Que el lenguaje sea de negocio, no de tecnología. Que cuando hay un problema, el sistema se lo diga antes de que su cliente o su empleado se lo digan a ella.

---

**Acciones más frecuentes**

1. Revisar el resumen del día en el dashboard.
2. Crear o modificar un beneficio.
3. Ver el historial de validaciones filtrado por sucursal o fecha.
4. Gestionar clientes (buscar, cambiar nivel, suspender).
5. Revisar alertas y notificaciones del sistema.
6. Exportar reportes mensuales.

---

---

### P-05 — Gerente de Sucursal

---

**"Diego, el capitán del punto de venta"**

> *"Yo no configuro el sistema. Pero sí necesito saber qué está pasando en mi sucursal. Si hay un problema, yo soy el primero que tiene que responder."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Diego Castellanos |
| Edad | 32 años |
| Cargo | Gerente de Sucursal / Jefe de Tienda |
| Nivel educativo | Técnico o universitario (administración, logística, área relacionada) |
| Nivel tecnológico | Básico-intermedio. Cómodo con tablet y teléfono, usa el sistema de caja con fluidez |
| Contexto laboral | Trabajo presencial en la sucursal. Accede desde tablet o teléfono |

---

**Contexto profesional**

Diego es responsable de lo que pasa en su sucursal: la operación, el equipo, la experiencia del cliente. No configura beneficios — eso lo hace Carolina. Pero sí necesita ver qué validaciones ocurrieron en su sucursal hoy, si algún empleado tuvo un problema, y si hay beneficios activos que su equipo debe conocer.

---

**Objetivos**

1. Asegurarse de que su equipo valida correctamente y sin fricciones.
2. Resolver problemas operativos en tiempo real sin tener que llamar a la Admin.
3. Reportar a la Admin de Empresa con datos concretos de su sucursal.
4. Que los clientes que visitan su sucursal tengan una experiencia de beneficio positiva.

---

**Problemas diarios**

- Empleados que no saben cómo usar el sistema de escaneo.
- Clientes que llegan con el QR caducado o con el teléfono sin batería.
- No tener acceso rápido al historial de validaciones de su sucursal para resolver disputas en el momento.
- Cambios de beneficios que no le comunicaron y se entera cuando ya hay un cliente frente a él.

---

**Necesidades**

- Vista filtrada exclusivamente a su sucursal: validaciones del día, del turno, por empleado.
- Lista de beneficios activos en su sucursal para capacitar a su equipo.
- Capacidad de consultar el estado de un cliente específico sin modificar nada.
- Notificación cuando se publica o modifica un beneficio que aplica en su sucursal.

---

**Cómo mide el éxito**

- Cero disputas de clientes que no pudo resolver en el momento.
- Su equipo valida sin necesidad de pedirle ayuda.
- Puede responder en tiempo real cuando la Admin le pregunta sobre su sucursal.

---

---

### P-06 — Supervisor Operativo

---

**"Andrea, los ojos del turno"**

> *"Mi trabajo es que nada se detenga. Si un cajero tiene un problema con el QR de un cliente, necesito resolverlo en 30 segundos o el cliente se va molesto."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Andrea Fuentes |
| Edad | 29 años |
| Cargo | Supervisora de Turno / Líder de Operaciones |
| Nivel educativo | Técnico |
| Nivel tecnológico | Básico. Usa tablet con facilidad para el trabajo diario |
| Contexto laboral | En el piso de operaciones. Accede desde tablet o tablet compartida |

---

**Contexto profesional**

Andrea supervisa el turno. No está en caja, pero está disponible cuando un cajero tiene un problema que no puede resolver solo. Sabe más del sistema que los cajeros, pero menos que el Gerente de Sucursal. Su herramienta de trabajo principal es la tablet de escaneo y, en ocasiones, el panel de administración en modo consulta.

---

**Problemas diarios**

- Cajeros que no saben qué hacer cuando el sistema dice que un beneficio está "rechazado".
- Clientes que insisten en que "el beneficio aplica" y ella no tiene forma rápida de verificar.
- Escalar a Diego (Gerente) consume tiempo que no siempre tiene disponible.

---

**Necesidades**

- Capacidad de consultar el estado de un cliente y sus instancias activas.
- Ver el motivo específico de un rechazo de validación.
- Escalar una situación al Gerente con contexto pre-cargado.
- Historial de validaciones del turno en tiempo real.

---

---

### P-07 — Cajero / Operador de Escaneo

---

**"Tomás, el momento de verdad"**

> *"Tengo una fila de clientes esperando. Necesito que el sistema sea tan simple que no tenga que pensar en él. Escaneo, leo el resultado, sigo."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Tomás Herrera |
| Edad | 22 años |
| Cargo | Cajero / Recepcionista / Barista / Técnico de mostrador |
| Nivel educativo | Secundaria o técnico básico |
| Nivel tecnológico | Básico. Nativo digital en el sentido de teléfono e Instagram, no de sistemas empresariales |
| Contexto laboral | En caja o mostrador. Dispositivo compartido (tablet o teléfono asignado). Alta rotación de personal |

---

**Contexto profesional**

Tomás es el punto de contacto más frecuente con el sistema en tiempo de operación. Cada vez que un cliente presenta su Pase Digital, Tomás es quien escanea y ejecuta la validación. El sistema de Pase Digital debe funcionar para él incluso en su primer día, sin manual, sin capacitación extensa.

Tomás no configura nada. No ve reportes. No gestiona clientes. Su interacción con la plataforma dura literalmente 10–15 segundos por operación.

---

**Objetivos**

1. Completar la validación en el menor tiempo posible.
2. No equivocarse (validar el beneficio incorrecto o para el cliente incorrecto).
3. Saber qué decirle al cliente cuando el beneficio es rechazado.
4. Poder llamar a su supervisor si no sabe cómo resolver algo.

---

**Problemas diarios**

- Clientes que no saben cómo abrir su Pase Digital y esperan que él lo sepa.
- QR en pantalla con baja luminosidad que no escanea bien.
- Mensajes de rechazo crípticos que no sabe cómo explicarle al cliente.
- Dispositivo de escaneo lento o que se cuelga en horas pico.
- Cambios en los beneficios que no le comunicaron y el cliente sabe más que él.

---

**Frustraciones**

- Sentirse expuesto frente a un cliente molesto cuando el sistema dice "rechazado" y no sabe por qué.
- Tener que memorizar qué beneficios aplican — eso debería mostrárselo el sistema.
- Sistemas que requieren muchos pasos para hacer una cosa simple.
- Perder tiempo con problemas técnicos cuando hay fila.

---

**Necesidades**

- Interfaz de escaneo de máxima simplicidad: abrir la cámara, escanear, ver resultado.
- Resultado en pantalla en lenguaje claro: "Beneficio aplicado ✓" o "No aplica — [motivo en palabras simples]".
- Sin opciones adicionales innecesarias en pantalla.
- Tiempo de respuesta < 3 segundos.
- Botón de ayuda visible para escalar a su supervisor.

---

**Motivaciones**

- Terminar el turno sin incidentes.
- No quedar mal frente a clientes ni frente a su supervisor.
- Que el sistema sea tan fácil que no tenga que pensar en él.

---

**Miedos**

- Equivocarse y validar un beneficio que no correspondía.
- Que el sistema falle durante la hora pico y él tenga que manejar la situación sin herramientas.
- Que un cliente se queje con el gerente por algo que él no pudo resolver.

---

**Cómo mide el éxito**

- Ningún cliente se fue molesto por un problema de validación que él no pudo resolver.
- El proceso de escaneo tomó menos de 10 segundos.
- No tuvo que llamar a su supervisor.

---

**Qué espera de la plataforma**

Una pantalla. Un botón. Un resultado. No más que eso. El sistema debe ser tan intuitivo que una persona que nunca lo vio antes pueda usarlo correctamente en su primer turno.

---

**Restricciones de acceso**

- Solo puede iniciar validaciones (escanear QR).
- No puede ver datos de otros clientes.
- No puede modificar información de ninguna entidad.
- No puede ver reportes ni métricas.
- No puede anular validaciones.

---

---

### P-08 — Empleado Operativo sin Caja

---

**"Fernanda, la promotora del programa"**

> *"Cuando un cliente nuevo entra y no sabe que tiene beneficios disponibles, yo soy quien le cuento. Necesito poder mostrarle algo concreto en ese momento."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Fernanda Solano |
| Edad | 25 años |
| Cargo | Asesora / Promotora / Recepcionista / Ejecutiva de atención |
| Nivel educativo | Técnico o universitario en curso |
| Nivel tecnológico | Básico-intermedio |

---

**Contexto profesional**

Fernanda no está en caja pero interactúa con clientes en un contexto de atención o asesoría. Su rol respecto al programa de beneficios es informativo y de activación: ayuda a nuevos clientes a registrarse, les muestra cómo acceder a su Pase Digital, y responde preguntas básicas sobre los beneficios disponibles.

---

**Necesidades**

- Herramienta para generar el QR de registro del cliente y enviarlo por email o mensaje.
- Vista de los beneficios activos disponibles para mostrar al cliente.
- Proceso de registro asistido: poder completar el registro de un cliente mientras lo atiende presencialmente.
- Sin acceso a validaciones ni a configuraciones.

---

---

### P-09 — Cliente Final (Miembro del Programa)

---

**"Isabel, la que simplemente quiere usar su beneficio"**

> *"No me importa cómo funciona el sistema por dentro. Solo quiero llegar, mostrar mi código y que me apliquen el beneficio que me prometieron. Sin complicaciones."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Isabel Morales |
| Edad | 31 años |
| Cargo | Profesionista / Empleada / Madre de familia / Estudiante universitaria |
| Nivel educativo | Variable (el sistema debe funcionar para todos) |
| Nivel tecnológico | Básico. Usa WhatsApp, Instagram y redes sociales con fluidez. No instala apps desconocidas fácilmente |
| Contexto de uso | En el punto de venta o desde casa para conocer sus beneficios |

---

**Contexto de vida**

Isabel es cliente frecuente de un restaurante, una clínica dental o un spa que decidió implementar Pase Digital. Le llegó un mensaje (WhatsApp, email, o se lo mencionaron en caja) que dice que tiene beneficios disponibles. Accedió a su Pase Digital sin saber muy bien qué era, pero el proceso fue tan simple que lo completó en 2 minutos.

Ahora, cada vez que visita el establecimiento, abre su Pase Digital desde el enlace guardado en su teléfono o desde el correo que le llegó y muestra su QR.

---

**Objetivos**

1. Usar sus beneficios sin fricciones cada vez que visita el establecimiento.
2. Saber qué beneficios tiene disponibles y cuándo vencen.
3. No tener que descargar ninguna aplicación adicional.
4. Tener certeza de que el beneficio aplicó correctamente.

---

**Problemas diarios**

- No recuerda dónde guardó el enlace a su Pase Digital.
- No sabe si el beneficio que tiene aplica en la sucursal donde está.
- No entiende por qué le dijeron que el beneficio "no aplica" cuando ella cree que sí debería aplicar.
- La pantalla de su teléfono tiene poca batería o brillo y el cajero no puede escanear.
- Olvidó el correo con el que se registró.

---

**Frustraciones**

- Sentirse avergonzada cuando el beneficio es rechazado frente a otros clientes.
- No saber con anticipación qué beneficios tiene para planificar su visita.
- Que el proceso de registro haya sido largo o complicado.
- Que nadie le informó que tenía un beneficio nuevo disponible y lo descubrió por accidente.
- Que el cajero no sepa usar el sistema y ella tenga que esperar.

---

**Necesidades**

- Acceso inmediato al Pase Digital desde cualquier dispositivo sin contraseña.
- Lista clara de beneficios disponibles con descripción, condiciones y vigencia.
- Notificación cuando hay un nuevo beneficio disponible para ella.
- Notificación cuando un beneficio está próximo a vencer.
- Historial simple de los últimos beneficios utilizados.

---

**Motivaciones**

- El ahorro o el beneficio en sí mismo (descuento, producto gratis, acceso especial).
- Sentirse valorada como cliente frecuente.
- La conveniencia — todo en el teléfono, sin tarjetas físicas, sin recordar códigos.

---

**Miedos**

- Que el beneficio exista solo en el papel y en la práctica nunca le apliquen nada.
- Que sus datos personales sean usados para spam.
- Que el proceso sea tan complicado que no valga la pena.

---

**Cómo mide el éxito**

- Abrió su Pase Digital, mostró el QR, el cajero lo escaneó y dijo "listo". En menos de 15 segundos.
- Recibe un mensaje cuando tiene un beneficio nuevo. Lo usa. Se siente bien.
- No tuvo que llamar a nadie ni explicar nada.

---

**Qué espera de la plataforma**

Que sea tan simple como abrir WhatsApp. Que su QR sea grande y siempre accesible. Que las condiciones del beneficio estén explicadas en lenguaje humano, no en términos legales. Que el resultado de la validación sea claro y definitivo.

---

**Perfiles secundarios de cliente final**

El arquetipo de Isabel representa al usuario promedio, pero existen variantes importantes:

| Variante | Características diferenciales |
|----------|-------------------------------|
| **Cliente senior (65+)** | Menor familiaridad con smartphones. Requiere texto grande, pasos mínimos, sin jerga digital |
| **Cliente joven digital (18–25)** | Alta familiaridad tecnológica. Espera experiencia fluida y moderna. Baja tolerancia a la fricción |
| **Cliente de alto valor (nivel Gold/VIP)** | Espera trato preferencial evidente. Frustrado si el beneficio de "alto nivel" no se diferencia de otros |
| **Cliente nuevo (primer uso)** | No tiene contexto del sistema. Requiere guía explícita durante el primer registro y primer uso |

---

---

### P-10 — Empresa Interesada (Pre-alta)

---

**"Roberto, el que evalúa antes de decidir"**

> *"Si el registro es complicado o si no entiendo qué voy a obtener, me voy. No tengo tiempo para descubrir si el sistema funciona — necesito saberlo antes de comprometer mis datos."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Roberto Andrade |
| Edad | 44 años |
| Cargo | Dueño de negocio / Director General / Gerente de Marketing |
| Nivel educativo | Universitario |
| Nivel tecnológico | Básico-intermedio. Evaluó otros software (contabilidad, CRM, punto de venta) |

---

**Contexto**

Roberto llegó a Pase Digital por recomendación de un colega, por una búsqueda en Google o por un anuncio. Está en modo evaluación. Tiene entre 5 y 20 minutos para decidir si esto vale su tiempo. Si el proceso de registro le genera fricción o confusión, se va y posiblemente no vuelve.

---

**Objetivos del proceso de pre-alta**

1. Entender rápidamente si la plataforma resuelve su problema específico.
2. Completar el registro sin necesitar asesoría técnica.
3. Tener la seguridad de que sus datos están protegidos.
4. Saber exactamente qué pasará después de que envíe el formulario.

---

**Necesidades**

- Formulario de registro corto (< 5 campos en el primer paso).
- Confirmación inmediata de que su solicitud fue recibida.
- Expectativa clara del proceso de aprobación (cuánto tarda, qué sigue).
- Posibilidad de ver una demo antes de comprometerse.

---

**Miedos**

- Que le pidan tarjeta de crédito antes de ver el producto.
- Que el proceso de aprobación tarde días o sea opaco.
- Que después de registrarse lo bombardeen de llamadas de ventas.
- Que el sistema sea demasiado complejo para su equipo.

---

---

### P-11 — Integrador / Desarrollador Externo

---

**"Luis, el que conecta los sistemas"**

> *"No necesito una presentación comercial. Necesito la documentación técnica, el sandbox y que el API sea predecible."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Luis Paredes |
| Edad | 30 años |
| Cargo | Desarrollador / CTO de la empresa cliente / Integrador técnico |
| Nivel tecnológico | Experto. Consume APIs REST con fluidez |

---

**Contexto**

Luis trabaja para una empresa que ya contrató Pase Digital (Plan Business o Enterprise) y necesita integrarlo con su POS, CRM o sistema propio. Su relación con la plataforma es técnica y puntual: no usa el panel de administración en el día a día, pero necesita acceder a la API y a los webhooks para construir la integración.

---

**Necesidades**

- Documentación de API completa, actualizada y con ejemplos.
- Ambiente de sandbox para pruebas sin afectar datos reales.
- Respuestas de error descriptivas y códigos de estado consistentes.
- Webhooks configurables y confiables con mecanismo de reintentos.
- Dashboard de salud de la integración (últimos eventos, errores, latencia).

---

---

### P-12 — Consultor / Agente de Canal

---

**"Patricia, la que implementa para otros"**

> *"Mis clientes no tienen tiempo de aprender el sistema. Yo lo aprendo por ellos, los configuro y los dejo operando. Necesito moverme rápido entre cuentas."*

---

**Datos demográficos**

| Atributo | Detalle |
|----------|---------|
| Nombre ficticio | Patricia Rivas |
| Edad | 36 años |
| Cargo | Consultora de marketing digital / Agente de canal de Pase Digital |
| Nivel tecnológico | Intermedio-alto. Aprende rápido sistemas nuevos |

---

**Contexto**

Patricia es parte del ecosistema de partners de Pase Digital. Gestiona la implementación inicial para múltiples empresas. No es una usuaria operativa — es una usuaria de configuración masiva. Necesita eficiencia: crear empresas, configurar beneficios, importar clientes y dejar todo listo para que el Admin de la empresa tome el control.

---

**Necesidades**

- Acceso multi-empresa (ver y operar bajo permiso en varias empresas).
- Flujos de configuración rápidos y repetibles.
- Plantillas de beneficios por industria para acelerar el setup inicial.
- Documentación de onboarding que pueda usar con sus clientes.

---

---

## 3. Objetivos Principales por Perfil

| Perfil | Objetivo primario | Objetivo secundario | Métrica de éxito personal |
|--------|------------------|---------------------|--------------------------|
| P-01 Superadmin | Ecosistema saludable y controlado | Cero incidentes de seguridad | Uptime + empresas activas |
| P-02 Soporte | Resolver problemas rápido | Evitar escalamientos | CSAT + tiempo de resolución |
| P-03 Auditor | Trazabilidad completa | Cumplimiento normativo | Ningún registro faltante |
| P-04 Admin Empresa | Programa de beneficios con impacto | Datos para tomar decisiones | Tasa de uso de beneficios |
| P-05 Gerente Sucursal | Operación sin fricciones en su punto | Equipo que usa bien el sistema | Cero disputas no resueltas |
| P-06 Supervisor | Resolver problemas del turno en tiempo real | Apoyar a cajeros | Cero interrupciones de turno |
| P-07 Cajero | Validar en < 10 segundos | No cometer errores | Cero incidentes en turno |
| P-08 Empleado Operativo | Activar nuevos clientes en el programa | Informar sobre beneficios | Nuevos registros |
| P-09 Cliente Final | Usar su beneficio sin fricción | Saber qué beneficios tiene | Beneficio aplicado correctamente |
| P-10 Empresa Pre-alta | Entender el producto y registrarse | Completar el proceso sin ayuda | Solicitud enviada |
| P-11 Desarrollador | Integración funcionando | Documentación completa | Primera llamada de API exitosa |
| P-12 Consultor | Cliente configurado y operativo | Proceso replicable | Tiempo de setup < 2 horas |

---

## 4. Customer Journey

### 4.1 Customer Journey — Empresa (Administradora)

**Fases del recorrido:**

```
DESCUBRIMIENTO → EVALUACIÓN → REGISTRO → APROBACIÓN → ONBOARDING → OPERACIÓN → RETENCIÓN
```

---

**Fase 1: Descubrimiento**

*Carolina ve un anuncio de Pase Digital mientras revisa LinkedIn. Un colega le comenta que lo está usando. Entra al sitio web desde su teléfono.*

| Touchpoint | Emoción | Pensamiento | Riesgo de fricción |
|------------|---------|-------------|-------------------|
| Anuncio o recomendación | Curiosidad | "¿Esto resuelve mi problema?" | Bajo |
| Sitio web (primera visita) | Expectativa | "¿Es para negocios como el mío?" | Medio — si el mensaje no es claro por industria |
| Demo o video | Confianza inicial | "Parece fácil" | Bajo si la demo es concreta |

**Emoción dominante:** Curiosidad cautelosa.

**Oportunidad:** Un video de 60 segundos mostrando el flujo completo (empresa publica beneficio → cliente recibe QR → cajero escanea → aprobado) elimina el 80% de las objeciones iniciales.

---

**Fase 2: Evaluación**

*Carolina revisa el listado de planes, lee las preguntas frecuentes, compara opciones.*

| Touchpoint | Emoción | Pensamiento | Riesgo de fricción |
|------------|---------|-------------|-------------------|
| Tabla de planes | Análisis | "¿Cuál es el mío?" | Medio — tablas confusas generan abandono |
| Preguntas frecuentes | Resolución de dudas | "¿Qué pasa si cancelo?" | Bajo si las respuestas son directas |
| Botón "Solicitar acceso" | Decisión | "¿Vale la pena dar el paso?" | Alto — momento de abandono más común |

**Emoción dominante:** Análisis + dudas.

**Oportunidad:** Un chat de baja fricción con respuestas en < 5 minutos reduce el abandono en esta fase.

---

**Fase 3: Registro**

*Carolina completa el formulario de alta.*

| Touchpoint | Emoción | Pensamiento | Riesgo de fricción |
|------------|---------|-------------|-------------------|
| Formulario de registro | Concentración | "¿Por qué necesitan tantos datos?" | Alto — formularios largos generan abandono |
| Confirmación de envío | Alivio | "¿Y ahora qué pasa?" | Medio — si no queda claro el siguiente paso |

**Emoción dominante:** Concentración + incertidumbre sobre lo que sigue.

**Momento crítico:** El mensaje post-registro debe decirle exactamente: "Recibirás respuesta en 24–48 horas hábiles. Revisaremos [estos datos]. Te avisaremos por email."

---

**Fase 4: Aprobación**

*Rodrigo (Superadmin) revisa la solicitud y la aprueba.*

| Touchpoint | Emoción | Pensamiento | Riesgo de fricción |
|------------|---------|-------------|-------------------|
| Email de aprobación + acceso | Entusiasmo | "¡Empieza la prueba!" | Bajo si el email tiene el CTA claro |
| Primera sesión en el panel | Descubrimiento | "¿Por dónde empiezo?" | Alto — primer login sin guía genera confusión |

**Emoción dominante:** Entusiasmo → frustración si no hay guía clara.

**Oportunidad de diseño:** El primer login debe activar un flujo de onboarding guiado paso a paso ("Crea tu primera sucursal → Invita tu primer empleado → Crea tu primer beneficio → Registra tu primer cliente").

---

**Fase 5: Onboarding**

*Carolina configura la empresa, invita a Diego (Gerente), crea su primer beneficio.*

| Touchpoint | Emoción | Pensamiento | Riesgo de fricción |
|------------|---------|-------------|-------------------|
| Flujo de configuración inicial | Concentración | "Espero no equivocarme" | Medio — pasos sin confirmación generan ansiedad |
| Primer beneficio publicado | Satisfacción | "¡Ya está listo!" | Bajo |
| Primer cliente registrado | Confianza | "Esto funciona" | Bajo |
| Primera validación exitosa | Euforia | "¡Funciona de verdad!" | Bajo |

**Emoción dominante:** Concentración → satisfacción progresiva.

**Momento de satisfacción clave:** La primera validación exitosa. Es el momento que convierte a un usuario en creyente. El sistema debe celebrarlo con un mensaje claro.

---

**Fase 6: Operación (uso recurrente)**

*Carolina accede al panel 3 veces por semana para revisar métricas, crear campañas y gestionar clientes.*

| Touchpoint | Emoción | Pensamiento | Riesgo de fricción |
|------------|---------|-------------|-------------------|
| Dashboard de inicio | Orientación rápida | "¿Qué pasó esta semana?" | Bajo si el dashboard responde sus preguntas |
| Creación de nuevo beneficio | Confianza (ya sabe hacerlo) | "Esto es rápido" | Bajo |
| Revisión de reportes | Análisis | "¿Qué me dice esto?" | Medio si los reportes no son accionables |
| Alerta del sistema | Atención | "¿Qué pasó?" | Bajo si la alerta es clara y tiene CTA |

**Momento de fricción más común:** Ver un reporte con números pero sin contexto ni recomendación.

**Oportunidad:** "Este beneficio tiene 0 validaciones en 7 días. ¿Quieres pausarlo o promocionarlo?"

---

**Fase 7: Retención**

*Carolina evalúa si renovar al final del período de pago.*

| Touchpoint | Emoción | Pensamiento | Riesgo de fricción |
|------------|---------|-------------|-------------------|
| Notificación de renovación | Evaluación | "¿Vale la pena seguir pagando?" | Alto — momento de churn más probable |
| Resumen de valor del período | Orgullo | "Hicimos 1,200 validaciones este mes" | Bajo si el resumen muestra valor concreto |

**Oportunidad:** Un resumen automático mensual de impacto ("Este mes: 847 validaciones, 312 clientes activos, 23% más que el mes anterior") hace que el valor sea tangible y reduce el churn.

---

### 4.2 Customer Journey — Cliente Final (Isabel)

```
INVITACIÓN → REGISTRO → PRIMER USO → USO RECURRENTE → RECOMENDACIÓN
```

---

**Fase 1: Invitación**

*Isabel recibe un mensaje de la clínica dental que frecuenta: "Ya puedes acceder a tus beneficios de paciente".*

| Touchpoint | Emoción | Pensamiento |
|------------|---------|-------------|
| Mensaje de WhatsApp o email | Curiosidad | "¿Qué es esto?" |
| Clic en el enlace | Expectativa | "Espero que sea rápido" |

**Riesgo:** Si el mensaje parece spam o phishing, Isabel no hace clic. El mensaje debe ser reconociblemente de la empresa que ella ya conoce.

---

**Fase 2: Registro**

*Página de registro de la clínica. Logo reconocible. Tres campos. Confirmar.*

| Touchpoint | Emoción | Pensamiento |
|------------|---------|-------------|
| Página de registro | Evaluación | "¿Cuántos datos me piden?" |
| Formulario (3 campos) | Alivio | "Esto es muy corto" |
| Email de confirmación | Satisfacción | "Ya tengo mi Pase Digital" |

**Momento crítico:** La velocidad del registro. Si en 2 minutos ya tiene su QR, confía en el sistema. Si tarda 10 minutos, abandona.

---

**Fase 3: Primer Uso**

*Isabel llega a la clínica. Abre su Pase Digital. El recepcionista escanea. "Listo".*

| Touchpoint | Emoción | Pensamiento |
|------------|---------|-------------|
| Abrir el Pase Digital | Nerviosismo leve | "¿Funcionará?" |
| QR en pantalla | Seguridad | "Aquí está" |
| Escaneo por el cajero | Anticipación | "¿Saldrá bien?" |
| Pantalla "Validado ✓" | Satisfacción | "¡Funciona!" |

**Momento de mayor satisfacción:** La primera validación exitosa. Si en ese instante recibe también un mensaje en su teléfono que dice "Beneficio utilizado: consulta de seguimiento sin costo", el círculo de confianza se cierra.

---

**Fase 4: Uso Recurrente**

*Isabel visita regularmente. Ya sabe dónde está su Pase Digital. Ya confía en el proceso.*

**Riesgos en esta fase:**
- Olvidó el enlace al Pase Digital (solución: enlace en cada email de uso, acceso por correo).
- No sabe que tiene un nuevo beneficio disponible (solución: notificación proactiva).
- Su beneficio vence sin saberlo (solución: recordatorio 7 días antes).

---

**Fase 5: Recomendación**

*Isabel le dice a una amiga: "En la clínica de [nombre] tienen un sistema de beneficios muy fácil. Puedes ir gratis al siguiente control si te registras".*

**Este es el mayor indicador de éxito del sistema:** cuando el cliente final se convierte en canal de adquisición orgánico para la empresa.

---

### 4.3 Customer Journey — Cajero (Tomás)

```
INCORPORACIÓN → PRIMER TURNO → INCIDENTE → TURNO FLUIDO → DESVINCULACIÓN
```

---

**Fase 1: Incorporación**

*El gerente Diego le muestra a Tomás el sistema en 5 minutos en su primer día.*

**Emoción:** Ansiedad. "¿Qué pasa si lo hago mal frente a un cliente?"

**Diseño crítico:** Tomás debe poder usar el sistema correctamente tras una demostración de 5 minutos. Si no puede, el diseño falló.

---

**Fase 2: Primer Turno**

*Primer cliente que presenta su Pase Digital en caja.*

| Momento | Emoción | Riesgo |
|---------|---------|--------|
| Primer escaneo | Nerviosismo | Si el proceso es complicado, Tomás falla frente al cliente |
| Resultado en pantalla | Alivio | Si el resultado es claro, Tomás gana confianza |

---

**Fase 3: Incidente**

*Un cliente dice que su beneficio debería aplicar pero el sistema dice "Rechazado".*

**Emoción de Tomás:** Estrés agudo.

**Diseño crítico:** El mensaje de rechazo debe decir qué hacer a continuación ("Beneficio no disponible — llama a tu supervisor"). No debe dejar a Tomás en una situación sin salida.

---

**Fase 4: Turno Fluido (estado ideal)**

*Tomás lleva 3 semanas. Ya no piensa en el sistema. Escanea, lee el resultado, sigue.*

**Este es el estado objetivo.** El sistema desaparece de su conciencia activa.

---

### 4.4 Customer Journey — Administrador en Gestión de Crisis

```
ALERTA → INVESTIGACIÓN → DECISIÓN → ACCIÓN → RESOLUCIÓN → PREVENCIÓN
```

*Carolina recibe una notificación: "15 validaciones rechazadas en los últimos 30 minutos en Sucursal Norte".*

| Fase | Acción | Herramienta necesaria |
|------|--------|----------------------|
| Alerta | Lee la notificación | Alerta con contexto suficiente |
| Investigación | Busca las validaciones rechazadas | Historial filtrado por sucursal + período |
| Diagnóstico | Identifica que el beneficio expiró ayer | Vista del estado del beneficio |
| Decisión | Decide extender la vigencia del beneficio | Formulario de edición rápida |
| Acción | Extiende la vigencia 7 días más | Confirmación inmediata |
| Resolución | Notifica a Diego (Gerente Sucursal) | Función de comunicación interna |
| Prevención | Activa alerta de "5 días antes del vencimiento" | Configuración de alertas |

**Emoción dominante:** Estrés → control progresivo → alivio → determinación de prevenir.

---

## 5. Jobs To Be Done

El framework Jobs To Be Done (JTBD) describe el "trabajo" que un usuario "contrata" a un producto para que haga. No es una tarea técnica — es un resultado que el usuario necesita lograr en su vida o trabajo.

---

### JTBD-01 — Superadministrador (Rodrigo)

**Trabajo funcional:**
> "Cuando necesito saber si el ecosistema está operando correctamente, quiero ver el estado de salud en tiempo real para poder intervenir antes de que algo falle."

**Trabajo emocional:**
> "Quiero sentir que tengo control total, incluso cuando no estoy mirando el sistema activamente."

**Trabajo social:**
> "Quiero poder decirle al equipo y a los inversores que el sistema es confiable, con datos que lo respalden."

**Resultado esperado:** Una alerta oportuna que le permitió intervenir antes de que el incidente afectara a alguna empresa.

**Éxito:** Ninguna empresa se quejó. Él lo resolvió antes de que lo notaran.

---

### JTBD-02 — Administradora de Empresa (Carolina)

**Trabajo funcional (estratégico):**
> "Cuando necesito saber si mi programa de beneficios tiene impacto real, quiero un reporte que me diga cuántos clientes lo usaron y cuánto valor les generó, para poder justificar la inversión ante mi directorio."

**Trabajo funcional (operativo):**
> "Cuando quiero lanzar una promoción de temporada, quiero poder crear el beneficio, definir sus condiciones y publicarlo sin ayuda técnica, para llegar a tiempo al inicio de la temporada."

**Trabajo emocional:**
> "Quiero sentir que el programa de beneficios me hace quedar bien con mis clientes, no que es otra fuente de problemas."

**Trabajo social:**
> "Cuando mi colega me pregunta cómo administro mi programa, quiero poder decirle que uso una plataforma profesional que me da datos reales."

**Resultado esperado:** El beneficio publicado a tiempo, los clientes notificados, y un reporte que muestre cuántos lo usaron en los primeros 7 días.

**Éxito:** El directorio aprobó extender la campaña porque los números fueron positivos.

---

### JTBD-03 — Cajero (Tomás)

**Trabajo funcional:**
> "Cuando un cliente me presenta su Pase Digital, quiero escanear el QR y ver inmediatamente si el beneficio aplica o no, para poder continuar la atención sin pausas ni errores."

**Trabajo emocional:**
> "Quiero sentir que el sistema me respalda frente al cliente, que si algo sale mal, hay una razón clara y yo no soy el culpable."

**Trabajo social:**
> "Quiero que el cliente vea que manejo el sistema con fluidez, no que me demoro o me confundo."

**Resultado esperado:** Menos de 10 segundos desde que el cliente muestra el QR hasta que Tomás dice "listo".

**Éxito:** El cliente se fue satisfecho. Tomás no tuvo que llamar al supervisor.

---

### JTBD-04 — Cliente Final (Isabel)

**Trabajo funcional:**
> "Cuando visito el establecimiento que tiene mis beneficios, quiero mostrar mi Pase Digital en menos de 30 segundos y que me apliquen el descuento o beneficio que me corresponde, sin explicaciones complicadas."

**Trabajo emocional:**
> "Quiero sentirme tratada como una cliente especial, no como alguien que tiene que probar que merece un beneficio."

**Trabajo social:**
> "Cuando recomiendo el lugar a mis amigas, quiero poder decirles que además tienen beneficios digitales que realmente funcionan."

**Resultado esperado:** Llegó, mostró el QR, le aplicaron el beneficio, salió satisfecha.

**Éxito:** Lo usó 3 veces este mes sin ningún problema. Le contó a dos personas.

---

### JTBD-05 — Gerente de Sucursal (Diego)

**Trabajo funcional:**
> "Cuando necesito explicarle a la Admin por qué hubo 5 validaciones rechazadas ayer en mi sucursal, quiero poder ver el historial detallado filtrado por sucursal y período para dar una respuesta concreta."

**Trabajo emocional:**
> "Quiero sentir que tengo acceso a la información de mi sucursal sin tener que pedírsela a nadie."

**Resultado esperado:** Diego puede responder la pregunta de Carolina con datos en menos de 2 minutos, sin escalar al sistema.

---

### JTBD-06 — Empresa Interesada (Roberto)

**Trabajo funcional:**
> "Cuando evalúo una nueva herramienta para mi negocio, quiero poder ver cómo funciona en la práctica en menos de 10 minutos, sin hablar con un vendedor, para decidir si vale la pena continuar."

**Trabajo emocional:**
> "Quiero sentir que el proveedor confía en su producto lo suficiente como para mostrármelo sin vendedores de por medio."

**Resultado esperado:** Roberto completó el registro de prueba, configuró un beneficio de ejemplo y envió el QR a su teléfono — todo en 15 minutos.

**Éxito:** Le mostró el demo a su socia al día siguiente y ambos decidieron continuar.

---

## 6. Escenarios Reales

Los escenarios modelan situaciones concretas con actores, contexto, flujo paso a paso y resultado esperado.

---

### Escenario 1 — Una empresa publica una nueva campaña de temporada alta

**Actores:** Carolina (Admin de Empresa), clientes del programa.

**Contexto:** Es la primera semana de noviembre. Carolina quiere lanzar una campaña de "Diciembre de beneficios" con 3 beneficios especiales que estarán vigentes del 1 al 31 de diciembre.

**Flujo:**

1. Carolina accede al panel de administración desde su laptop.
2. Navega a "Campañas" y crea una nueva: "Diciembre de Beneficios 2026".
3. Define la vigencia: 1–31 de diciembre.
4. Crea el primer beneficio dentro de la campaña: "20% de descuento en todos los servicios — solo para clientes Gold".
   - Tipo: descuento porcentual.
   - Elegibilidad: nivel de membresía Gold.
   - Límite: 3 usos por cliente.
   - Sucursales: todas.
5. Crea el segundo beneficio: "Servicio de regalo por cumpleaños en diciembre".
   - Tipo: servicio gratuito.
   - Elegibilidad: fecha de cumpleaños en diciembre.
   - Límite: 1 uso por cliente.
6. Crea el tercer beneficio: "Acceso anticipado a nueva temporada".
   - Tipo: acceso especial.
   - Elegibilidad: todos los clientes activos.
   - Límite: 1 uso por cliente.
7. El sistema le muestra un resumen: "3 beneficios creados. La campaña iniciará el 1 de diciembre. ¿Confirmar publicación?"
8. Carolina confirma.
9. El sistema genera automáticamente las instancias para los clientes elegibles.
10. Los clientes que calificaron reciben un email: "Tus beneficios de diciembre ya están disponibles".

**Resultado esperado:**
- Campaña publicada sin intervención técnica.
- Clientes notificados automáticamente.
- Instancias creadas para los elegibles.
- El sistema le muestra a Carolina: "Se crearon instancias para 89 clientes Gold, 12 clientes con cumpleaños en diciembre y 234 clientes activos."

**Riesgos en el flujo:**
- Si Carolina comete un error en las fechas, necesita poder editarlo antes de la publicación con confirmación clara.
- Si el plan actual no soporta 3 beneficios activos simultáneos, el sistema debe decírselo antes de que llegue al paso final.

---

### Escenario 2 — Un cliente obtiene su Pase Digital por primera vez

**Actores:** Isabel (cliente nueva), Fernanda (empleada operativa).

**Contexto:** Isabel visita el spa por primera vez. Fernanda le menciona el programa de beneficios mientras la registra como cliente.

**Flujo:**

1. Fernanda le muestra a Isabel el cartel con el QR de registro.
2. Isabel lo escanea con su teléfono.
3. Aparece la página de registro: logo del spa, descripción del programa, formulario de 3 campos (nombre, email, teléfono).
4. Isabel completa el formulario en 60 segundos.
5. Confirma y ve una pantalla: "¡Bienvenida! Tu Pase Digital fue creado. Revisa tu correo."
6. En su email llega en < 1 minuto: "Tu Pase Digital está listo" con el enlace directo.
7. Isabel hace clic y ve su QR, su nombre, y los beneficios disponibles para clientes nuevos.
8. Guarda el enlace en sus marcadores.

**Resultado esperado:**
- Isabel tiene su Pase Digital en menos de 2 minutos desde que escaneó el QR de registro.
- Nunca necesitó descargar una app.
- Ya tiene visible el primer beneficio que puede usar en su próxima visita.

---

### Escenario 3 — Un cajero valida un Pase Digital exitosamente

**Actores:** Tomás (cajero), Isabel (cliente).

**Contexto:** Isabel regresa al spa tres semanas después. Quiere usar su beneficio de "primera limpieza facial gratuita para clientes nuevos".

**Flujo:**

1. Isabel abre el enlace a su Pase Digital desde el correo que guardó.
2. Muestra el QR a Tomás.
3. Tomás abre la aplicación de escaneo en la tablet.
4. Apunta la cámara al QR.
5. El sistema lee el código en < 2 segundos.
6. La pantalla de Tomás muestra:
   - Nombre: Isabel Morales
   - Nivel: Nuevo cliente
   - Beneficio disponible: "Limpieza facial gratuita — 1 uso disponible"
   - Botón: [Confirmar uso]
7. Tomás toca "Confirmar uso".
8. La pantalla muestra: "✓ Beneficio aplicado. Comprobante #CP-2026-00847 generado."
9. Isabel recibe en su teléfono: "Beneficio utilizado: Limpieza facial gratuita. Spa [Nombre]. 14:23."

**Resultado esperado:**
- Proceso completo en < 10 segundos.
- Comprobante generado.
- Instancia de Isabel decrementada (0 usos restantes).
- Registro en el historial de validaciones.

---

### Escenario 4 — Un beneficio es rechazado

**Actores:** Tomás (cajero), cliente (Pedro, nivel Nuevo — no Gold).

**Contexto:** Pedro intenta usar el beneficio "20% de descuento — solo para clientes Gold". Pedro es cliente nuevo, nivel básico.

**Flujo:**

1. Pedro muestra su Pase Digital.
2. Tomás escanea.
3. El sistema muestra el perfil de Pedro y los beneficios disponibles.
4. Tomás selecciona el beneficio "20% de descuento".
5. El sistema responde inmediatamente:
   - Pantalla roja discreta: "Este beneficio no aplica para este cliente."
   - Motivo visible para Tomás: "El cliente no cumple el nivel de membresía requerido (Gold)."
   - Mensaje sugerido para decirle al cliente: "Este descuento está disponible para miembros Gold. ¿Te interesa conocer cómo acceder a ese nivel?"
6. Tomás le explica a Pedro.
7. El sistema registra el intento de validación con resultado RECHAZADO y motivo.

**Resultado esperado:**
- Pedro entiende por qué no aplica y qué necesita para calificar.
- Tomás tiene la respuesta correcta sin necesidad de improvisar.
- El rechazo queda registrado (auditoría).
- La operación no se interrumpió — continúa en < 10 segundos.

---

### Escenario 5 — Una empresa suspende una promoción de emergencia

**Actores:** Carolina (Admin de Empresa).

**Contexto:** Carolina detecta a las 10:00 AM que un empleado configuró mal un beneficio: "50% de descuento" en lugar de "5% de descuento". Ya se realizaron 8 validaciones con el error.

**Flujo:**

1. Carolina recibe una alerta del sistema: "Validaciones de 'Beneficio Premium' superan el promedio histórico en un 300% esta mañana."
2. Carolina entra al panel, revisa las validaciones y confirma el error.
3. Con un clic, pausa el beneficio.
4. El sistema le pregunta: "¿Quieres notificar a los empleados de la sucursal?" Carolina confirma.
5. Los cajeros reciben en el dispositivo: "El beneficio 'Premium Discount' ha sido pausado temporalmente."
6. Carolina corrige el valor del beneficio (5%).
7. Revisa que el cambio es correcto.
8. Reactiva el beneficio.
9. El sistema registra toda la secuencia en auditoría con timestamp y actor.
10. Carolina exporta el listado de las 8 validaciones incorrectas para gestionarlas manualmente con esos clientes.

**Resultado esperado:**
- El error se detuvo en menos de 5 minutos desde la alerta.
- 8 comprobantes generados con el valor incorrecto quedan en el historial (no se borran).
- Carolina tiene la información para gestionar los casos individualmente.

---

### Escenario 6 — Un cliente pierde su teléfono

**Actores:** Isabel (cliente), Fernanda (empleada operativa).

**Contexto:** Isabel perdió su teléfono. Su Pase Digital estaba en ese dispositivo. Quiere recuperar acceso.

**Flujo:**

1. Isabel visita el spa o contacta por cualquier canal.
2. Fernanda accede al panel de administración, busca a Isabel por su correo.
3. Selecciona la opción "Regenerar Pase Digital".
4. El sistema invalida el código anterior e genera uno nuevo.
5. Se envía automáticamente un email a Isabel con el nuevo enlace.
6. Isabel accede desde su nuevo (o prestado) teléfono — mismos beneficios, misma información, nuevo QR.

**Resultado esperado:**
- El proceso tarda menos de 2 minutos.
- El QR anterior queda completamente inválido.
- Isabel no pierde ninguno de sus beneficios ni su historial.

---

### Escenario 7 — Un administrador analiza reportes mensuales

**Actores:** Carolina (Admin de Empresa).

**Contexto:** Primer lunes del mes. Carolina prepara el informe mensual para presentar al directorio el miércoles.

**Flujo:**

1. Carolina entra al panel → sección Reportes.
2. Selecciona "Resumen mensual — Mayo 2026".
3. El sistema genera en < 5 segundos:
   - Total de validaciones: 1,247 (↑ 18% vs. abril).
   - Clientes activos que usaron al menos 1 beneficio: 432 (↑ 12%).
   - Beneficio más utilizado: "20% descuento Gold" — 387 usos.
   - Beneficio menos utilizado: "Acceso VIP sala espera" — 3 usos.
   - Sucursal más activa: Norte — 643 validaciones.
   - Sucursal menos activa: Sur — 89 validaciones.
   - Tasa de rechazo: 4.2% (↑ 1.1% vs. mes anterior — motivo: 38 rechazos por "beneficio vencido").
4. Carolina exporta el PDF.
5. Identifica que el beneficio "Acceso VIP" tiene muy bajo uso — lo pausa y planea rediseñarlo.
6. Identifica que la Sucursal Sur tiene bajo rendimiento — agenda reunión con Diego para investigar.

**Resultado esperado:**
- Reporte disponible en < 5 segundos.
- Carolina toma 3 decisiones concretas basadas en los datos.
- Sin necesidad de exportar a Excel ni de llamar a nadie.

---

### Escenario 8 — Rodrigo investiga una alerta de fraude

**Actores:** Rodrigo (Superadmin), Motor Antifraude.

**Contexto:** El Motor Antifraude detecta que un único empleado de una empresa realizó 47 validaciones en 20 minutos — patrón altamente inusual.

**Flujo:**

1. Rodrigo recibe alerta de alto riesgo: "Actividad inusual detectada — Empresa: Clínica Bellavista — Empleado ID #EMP-0022."
2. Rodrigo abre la investigación desde el panel de Superadmin.
3. Ve el historial de las 47 validaciones: mismo empleado, mismo beneficio, clientes distintos pero varios de ellos registrados en las últimas 2 horas.
4. Decide suspender preventivamente al empleado (no a la empresa completa).
5. Notifica al Admin de Empresa (Carolina) con el resumen de la situación.
6. Deja un comentario interno en el registro del incidente.
7. Espera la respuesta de Carolina (que puede confirmar que fue un evento especial legítimo o confirmar el fraude).
8. Si es fraude: suspende la empresa y genera reporte de auditoría.
9. Si es legítimo: reactiva al empleado con nota en el expediente.

**Resultado esperado:**
- El riesgo fue contenido en < 10 minutos desde la alerta.
- Ninguna validación adicional fraudulenta ocurrió después de la suspensión preventiva.
- El historial completo del incidente quedó registrado.

---

## 7. Necesidades Funcionales

### 7.1 Matriz de necesidades por perfil

| Funcionalidad | P-01 Super | P-02 Soporte | P-03 Auditor | P-04 Admin | P-05 Gerente | P-06 Supervisor | P-07 Cajero | P-08 Empleado | P-09 Cliente |
|---------------|-----------|-------------|-------------|-----------|-------------|----------------|------------|--------------|-------------|
| Dashboard de métricas globales | ✅ Crítico | ✅ Lectura | ✅ Lectura | ✅ Empresa | ✅ Sucursal | — | — | — | — |
| Gestión de empresas (CRUD) | ✅ Crítico | ✅ Solo lectura | ✅ Solo lectura | — | — | — | — | — | — |
| Gestión de beneficios | — | Solo lectura | Solo lectura | ✅ Crítico | Solo lectura | — | — | — | — |
| Creación de campañas | — | — | — | ✅ Crítico | — | — | — | — | — |
| Gestión de clientes | — | Solo lectura | Solo lectura | ✅ Crítico | Solo lectura | Solo lectura | — | ✅ Registro | — |
| Escaneo de QR | — | — | — | — | — | ✅ Emergencia | ✅ Crítico | ✅ Ocasional | — |
| Historial de validaciones | ✅ Global | ✅ Global | ✅ Global | ✅ Empresa | ✅ Sucursal | ✅ Turno | Solo propio | — | ✅ Propias |
| Gestión de empleados | — | — | — | ✅ Crítico | ✅ Sucursal | — | — | — | — |
| Reportes | ✅ Global | Solo lectura | ✅ Global | ✅ Empresa | ✅ Sucursal | — | — | — | — |
| Gestión de planes y pagos | ✅ Crítico | Solo lectura | Solo lectura | ✅ Solicitud | — | — | — | — | — |
| Exportación de datos | ✅ Global | Limitada | ✅ Global | ✅ Empresa | — | — | — | — | — |
| Vista de Pase Digital (QR) | — | — | — | — | — | — | Escanea | — | ✅ Crítico |
| Notificaciones | ✅ Sistema | ✅ Sistema | — | ✅ Empresa | ✅ Sucursal | Operativas | Operativas | — | ✅ Personal |
| Configuración de alertas | ✅ Global | — | — | ✅ Empresa | ✅ Sucursal | — | — | — | — |
| Registro de auditoría | ✅ Global | Solo lectura | ✅ Global | Solo empresa | — | — | — | — | — |
| API / Webhooks | ✅ Gestión | — | — | ✅ Config | — | — | — | — | — |

### 7.2 Niveles de acceso requeridos

| Perfil | Nivel de acceso | Alcance | Puede escribir |
|--------|----------------|---------|----------------|
| Superadmin | Máximo | Todo el sistema | Sí |
| Soporte Interno | Alto | Todo el sistema | Solo en tickets/comunicación |
| Auditor | Medio-alto | Todo el sistema | No (solo lectura) |
| Admin Empresa | Alto | Su empresa | Sí (sin romper límites del plan) |
| Gerente Sucursal | Medio | Su sucursal | Solo en lo operativo de su sucursal |
| Supervisor | Medio-bajo | Su turno / sucursal | Solo consultar estados |
| Cajero | Mínimo | Solo escaneo | Solo registrar validaciones |
| Empleado Operativo | Mínimo | Solo registro de clientes | Solo registrar nuevos clientes |
| Cliente Final | Personal | Solo sus propios datos | Solo actualizar sus datos básicos |

---

## 8. Necesidades Emocionales

### 8.1 Las seis emociones de la operación

La experiencia de un sistema empresarial no es neutra emocionalmente. Cada interacción genera una respuesta afectiva que determina si el usuario confía, adopta y recomienda el sistema — o si lo evita, lo sortea con procesos alternativos o lo abandona.

Las seis emociones que Pase Digital debe gestionar activamente:

---

**CONFIANZA**

*¿El sistema hace lo que dice que hace?*

La confianza es el fundamento de toda la experiencia. Sin ella, ninguna otra emoción positiva es sostenible.

| Quién la necesita más | Cómo generarla en el diseño |
|-----------------------|-----------------------------|
| Carolina (Admin) | Cada acción confirmada explícitamente. El sistema dice "publicado", no "procesando". |
| Tomás (Cajero) | El resultado de la validación es inequívoco. Verde = aplicado. Rojo = no aplica. Sin ambigüedad. |
| Isabel (Cliente) | Recibe confirmación en su teléfono de cada uso. Puede ver su historial. No tiene que confiar — puede verificar. |
| Rodrigo (Superadmin) | Alertas que llegan cuando corresponde, no en falso. El sistema no genera ruido innecesario. |

**Principio:** El sistema nunca debe dejar a un usuario en estado de incertidumbre sobre si su acción tuvo efecto.

---

**RAPIDEZ**

*¿El sistema responde en el tiempo que el usuario necesita?*

La rapidez no es solo velocidad técnica — es la percepción de que el sistema no interrumpe el flujo natural del trabajo.

| Quién la necesita más | Velocidad requerida |
|-----------------------|---------------------|
| Tomás (Cajero) | < 3 segundos para resultado de validación. Con fila de clientes, cada segundo cuenta. |
| Isabel (Cliente) | < 2 segundos para cargar el Pase Digital. Está frente al cajero y no puede esperar. |
| Carolina (Admin) | Dashboard cargado en < 3 segundos. No puede esperar 30 segundos cada vez que abre el panel. |
| Rodrigo (Superadmin) | Alertas en tiempo real. No puede enterarse de un incidente 20 minutos después. |

**Principio:** El sistema no debe hacerle sentir al usuario que está esperando que la tecnología lo alcance.

---

**SEGURIDAD**

*¿El sistema protege mi información y la de mis clientes?*

La seguridad emocional no es lo mismo que la seguridad técnica. Un usuario puede no entender de cifrado, pero sí nota si el sistema le pide confirmación antes de acciones irreversibles, si muestra quién hizo qué, si requiere credenciales para cosas importantes.

| Quién la necesita más | Cómo generarla en el diseño |
|-----------------------|-----------------------------|
| Carolina (Admin) | Confirmación explícita antes de suspender un cliente o eliminar un beneficio. "¿Estás segura?" no es molesto — es tranquilizador. |
| Rodrigo (Superadmin) | Log de auditoría que registra cada acción. Saber que si algo falla, puede rastrear exactamente qué pasó. |
| Isabel (Cliente) | No se le pide más información de la necesaria. El sistema no parece "raro" ni como phishing. |
| Tomás (Cajero) | No puede hacer acciones que no le corresponden aunque quisiera. El sistema lo protege de errores accidentales. |

**Principio:** El sistema debe sentirse como una caja fuerte, no como una puerta giratoria.

---

**CLARIDAD**

*¿El sistema me dice exactamente qué está pasando y qué tengo que hacer?*

La claridad elimina la necesidad de entrenamiento extenso y de soporte recurrente.

| Quién la necesita más | Cómo generarla en el diseño |
|-----------------------|-----------------------------|
| Tomás (Cajero) | El motivo de rechazo en lenguaje cotidiano. No "ERR_ELIGIBILITY_FAILED" — sino "Este beneficio es solo para clientes Gold". |
| Isabel (Cliente) | Las condiciones del beneficio en lenguaje humano. No "Aplica restricciones" — sino "Válido de lunes a viernes, 10 a 18 hrs". |
| Roberto (Empresa Pre-alta) | Sabe exactamente qué pasará después de registrarse. Sin opacidad. |
| Carolina (Admin) | Los reportes tienen contexto. No solo "847 validaciones" — sino "847 validaciones, 18% más que el mes pasado, principalmente en Sucursal Norte". |

**Principio:** Toda pantalla del sistema debe poder entenderse sin haber leído el manual.

---

**CONTROL**

*¿Puedo hacer lo que necesito hacer, cuando lo necesito?*

El control es la sensación de que el sistema trabaja para el usuario, no al revés.

| Quién la necesita más | Cómo generarla en el diseño |
|-----------------------|-----------------------------|
| Carolina (Admin) | Puede pausar un beneficio en 2 clics. No necesita tickets de soporte para cambios de configuración. |
| Rodrigo (Superadmin) | Puede suspender una empresa en 30 segundos si lo necesita. Las acciones críticas están accesibles, no enterradas. |
| Diego (Gerente Sucursal) | Tiene acceso a los datos de su sucursal sin depender de Carolina. |
| Isabel (Cliente) | Puede ver y actualizar su información básica. No está "atrapada" en datos incorrectos. |

**Principio:** El usuario nunca debe sentir que el sistema le bloquea algo que legítimamente necesita hacer.

---

**TRANQUILIDAD**

*¿Puedo confiar en que el sistema funciona incluso cuando no lo estoy mirando?*

La tranquilidad es el resultado final de las otras cinco emociones bien gestionadas. Es el estado en el que el sistema "desaparece" — el usuario no tiene que pensar en él.

| Quién la necesita más | Cómo generarla en el diseño |
|-----------------------|-----------------------------|
| Carolina (Admin) | Alertas proactivas que le avisan ANTES de que algo sea un problema. |
| Tomás (Cajero) | Después de 2 semanas de uso, el sistema no ocupa espacio mental. Solo escanea. |
| Isabel (Cliente) | Sabe que sus beneficios están ahí cuando los necesita. No tiene que verificar todo el tiempo. |
| Rodrigo (Superadmin) | El sistema monitorea solo y solo lo molesta cuando necesita su atención real. |

**Principio:** El mejor estado de un sistema empresarial es aquel en que sus usuarios no tienen que pensar en él.

---

### 8.2 Cómo responder a cada emoción en el diseño

| Emoción | Señal de que el diseño está fallando | Respuesta de diseño |
|---------|--------------------------------------|---------------------|
| Confianza | El usuario llama a soporte para confirmar si su acción tuvo efecto | Confirmaciones explícitas post-acción. Estados persistentes visibles. |
| Rapidez | El usuario abandona una pantalla antes de que cargue | Skeleton screens, optimistic UI, tiempos de carga < 2s |
| Seguridad | El usuario evita usar ciertas funciones por miedo a errores | Confirmaciones en acciones destructivas. Undo disponible donde sea posible. |
| Claridad | El usuario llama a soporte para entender qué significa un mensaje | Lenguaje cotidiano. Sin códigos de error sin contexto. |
| Control | El usuario construye procesos manuales paralelos para hacer algo que el sistema debería hacer | Eliminar dependencias innecesarias. Autoservicio real. |
| Tranquilidad | El usuario revisa el sistema varias veces al día "por si acaso" | Notificaciones proactivas y confiables. |

---

## 9. Principios de Experiencia

Los principios de experiencia son las reglas no negociables que gobiernan cada decisión de diseño en la plataforma. Son el filtro que toda funcionalidad nueva debe pasar.

---

### PX-01 — El cliente final nunca debe sentirse confundido

**Declaración:** La experiencia del cliente final debe ser completable por cualquier persona adulta con acceso básico a un smartphone, sin instrucciones previas y en cualquier contexto (en una caja, con tiempo limitado, con poca batería).

**Implicaciones de diseño:**
- El Pase Digital tiene exactamente una acción principal: mostrar el QR.
- Las condiciones de los beneficios están escritas en lenguaje cotidiano.
- Si un beneficio no aplica, el mensaje explica por qué en términos que el cliente pueda entender y repetirle al cajero.
- El proceso de registro tiene máximo 3 campos obligatorios.
- El cliente nunca ve tecnicismos del sistema (IDs, códigos de estado, nombres de tablas).

**Métrica de cumplimiento:** Una persona sin contexto previo completa el registro y presenta su Pase Digital por primera vez en < 3 minutos, sin ayuda.

---

### PX-02 — El cajero nunca necesita más de tres pasos para validar un beneficio

**Declaración:** La interacción operacional más frecuente del sistema (el escaneo del QR en el punto de venta) debe ser completable en 3 pasos o menos, independientemente del dispositivo o las condiciones del entorno.

**Los tres pasos:**
1. Abrir la aplicación de escaneo.
2. Apuntar al QR del cliente.
3. Confirmar el uso (o leer el resultado si es un rechazo automático).

**Implicaciones de diseño:**
- La aplicación de escaneo abre directamente la cámara. Sin menús previos.
- La identificación del beneficio es automática (no el cajero selecciona de una lista de 20 beneficios).
- El resultado es inmediato y ocupa toda la pantalla: verde o rojo, con texto grande.
- No hay pasos de "guardar" o "confirmar por segunda vez" para validaciones normales.

**Métrica de cumplimiento:** El tiempo promedio entre que el cliente muestra el QR y que el cajero dice "listo" es < 10 segundos.

---

### PX-03 — El administrador siempre sabe qué está pasando

**Declaración:** El Admin de Empresa nunca debe enterarse de un problema en su programa por un cliente molesto. El sistema debe informarle antes.

**Implicaciones de diseño:**
- Alertas proactivas configurables: "Tasa de rechazos inusualmente alta", "Beneficio próximo a vencer", "Plan alcanza el límite de clientes".
- El dashboard muestra el estado actual del programa de forma inmediata al abrir sesión.
- Las métricas tienen contexto: no solo el número, sino si es alto, bajo o normal respecto al período anterior.
- Los cambios críticos (beneficio publicado, empleado que hizo muchas validaciones de golpe) generan registro visible.

**Métrica de cumplimiento:** El Admin descubre cualquier anomalía operativa a través del sistema antes de que la reporte un cliente o empleado, en > 80% de los casos.

---

### PX-04 — Las empresas deben sentir confianza desde el primer segundo

**Declaración:** Una empresa que interactúa con Pase Digital — desde la primera visita al sitio hasta el uso diario del panel — debe sentir que está usando infraestructura profesional, no un software de segunda categoría.

**Implicaciones de diseño:**
- El diseño visual es sobrio, de alta calidad, sin elementos decorativos que compitan con la información.
- Las confirmaciones de acciones son precisas: fecha, hora, actor. No "guardado exitosamente" — sino "Beneficio 'Descuento Gold' publicado el 15 de noviembre a las 10:23 por Carolina Vargas."
- Los errores son informativos y propositivos: no "Error 422" — sino "No puedes publicar este beneficio porque la fecha de fin es anterior a la fecha de inicio."
- El sistema no pierde datos. Nunca. El usuario puede salir a la mitad de un formulario y regresar.

**Métrica de cumplimiento:** NPS del panel de administración > 45. Menos de 5% de sesiones con reportes de confusión o frustración en los primeros 30 días de uso.

---

### PX-05 — La información se muestra solo cuando aporta valor

**Declaración:** Cada elemento en pantalla tiene un propósito. Si un dato no ayuda al usuario a tomar una decisión o completar una tarea en ese momento, no debe estar ahí.

**Implicaciones de diseño:**
- El cajero (P-07) solo ve lo que necesita en el momento de escanear: el nombre del cliente, el beneficio disponible y el botón de confirmar. No ve el historial del cliente, no ve métricas, no ve configuraciones.
- El dashboard del Admin (P-04) muestra el resumen del programa, no todas las métricas posibles. El detalle está a un clic.
- Los formularios muestran solo los campos relevantes para el tipo de beneficio que se está creando. Un descuento porcentual no muestra el campo "producto específico".
- Los mensajes de error incluyen solo la información necesaria para resolverlos, no un volcado técnico completo.

**Métrica de cumplimiento:** Los usuarios de soporte reportan < 10% de tickets relacionados con "demasiada información" o "no encontré lo que buscaba".

---

### PX-06 — Los procesos son reversibles siempre que sea posible

**Declaración:** El sistema debe proteger al usuario de las consecuencias permanentes de acciones accidentales, especialmente en operaciones que afectan a otros usuarios (clientes, empleados).

**Implicaciones de diseño:**
- Pausar un beneficio es reversible. Eliminarlo requiere confirmación doble.
- Suspender un cliente es reversible. Eliminar un cliente (soft delete) requiere confirmación con advertencia de consecuencias.
- Las validaciones registradas no se eliminan — solo se anulan, con registro del motivo y el actor.
- El sistema confirma antes de ejecutar cualquier acción que afecte a más de 10 registros simultáneamente.

**Métrica de cumplimiento:** < 1% de acciones que requieren intervención de soporte para revertir.

---

### PX-07 — El sistema habla el idioma del negocio, no de la tecnología

**Declaración:** Ningún mensaje, etiqueta, notificación o error visible al usuario debe contener terminología técnica, códigos de sistema o referencias a la implementación interna.

**Ejemplos de aplicación:**

| Lenguaje técnico (prohibido) | Lenguaje de negocio (correcto) |
|------------------------------|-------------------------------|
| "Error 403: Insufficient permissions" | "No tienes permiso para realizar esta acción. Contacta a tu administrador." |
| "UUID: f3b2c1..." | "Cliente: Isabel Morales" |
| "BENEFIT_STATUS_EXHAUSTED" | "Este beneficio ya no tiene usos disponibles." |
| "FK constraint violation" | "No puedes eliminar esta sucursal porque tiene empleados asignados." |
| "NULL value in campo 'fechaFin'" | "Necesitas definir la fecha de fin del beneficio antes de publicarlo." |
| "Timestamp: 1749830400" | "Válido hasta el 31 de diciembre de 2026 a las 23:59" |

**Métrica de cumplimiento:** Cero tickets de soporte donde el usuario reproduzca un mensaje técnico que no entendió.

---

### PX-08 — Un empleado nuevo puede operar sin entrenamiento extenso

**Declaración:** La curva de aprendizaje del sistema debe ser de minutos para el rol de Cajero y de horas (no días) para el rol de Admin de Empresa.

**Implicaciones de diseño:**
- La interfaz de escaneo es autoexplicativa: la cámara se abre sola, el resultado es inmediato.
- Las acciones destructivas tienen texto de confirmación que explica exactamente lo que pasará.
- Los flujos principales tienen tooltips contextuales que aparecen en el primer uso.
- El onboarding guiado cubre los primeros 5 minutos de uso en cada rol.

**Métrica de cumplimiento:** Un cajero nuevo puede completar su primera validación exitosa sin ayuda en < 5 minutos desde que accede al sistema por primera vez.

---

### PX-09 — La plataforma asume que el entorno operacional es imperfecto

**Declaración:** El sistema debe funcionar correctamente en condiciones no ideales: pantallas con brillo bajo, conexión a internet lenta, dispositivos de 4 años de antigüedad, entornos ruidosos donde el usuario no puede escuchar.

**Implicaciones de diseño:**
- El QR del Pase Digital tiene el mayor tamaño posible en pantalla y alto contraste.
- El resultado de la validación es visual (color + ícono + texto), no solo auditivo.
- El sistema funciona con conexiones lentas (< 3G) sin degradar la funcionalidad crítica.
- Los formularios guardan progreso automáticamente cada 30 segundos.
- El sistema funciona en modo offline básico para el cajero durante desconexiones cortas (sincronización posterior).

**Métrica de cumplimiento:** < 0.5% de validaciones fallidas por condiciones del entorno (no por reglas de negocio).

---

### PX-10 — El éxito del usuario es el éxito de la plataforma

**Declaración:** El diseño de cada funcionalidad parte de la pregunta "¿Qué resultado espera lograr el usuario con esto?" y no de "¿Qué funcionalidad es posible construir con los datos que tenemos?".

**Implicaciones de diseño:**
- Los reportes no muestran datos — muestran respuestas a preguntas reales de negocio.
- Las notificaciones no informan eventos — sugieren acciones concretas.
- El onboarding no explica el sistema — guía al usuario hasta su primer resultado de valor.
- El dashboard no muestra todos los KPIs disponibles — muestra los 5 que el Admin necesita ver cada vez que entra.

**Métrica de cumplimiento:** > 70% de los usuarios que inician una sesión completan al menos una acción de valor (crear, publicar, validar, revisar reportes). No hay "sesiones vacías".

---

## 10. Autoauditoría del Ecosistema

### 10.1 Perfiles que podrían estar faltando

| Perfil no contemplado | Análisis | Decisión |
|-----------------------|----------|----------|
| **Contador / Área financiera de la empresa** | Necesita exportar registros de validaciones para conciliación contable. Actualmente cubierto parcialmente por el Admin. | Agregar como sub-rol del Admin con acceso limitado a reportes y exportaciones financieras. Prioridad: Fase 2. |
| **Representante de servicio al cliente de la empresa** | Atiende quejas de clientes sobre validaciones. Necesita buscar el historial de un cliente sin acceso completo al panel. | Sub-rol de solo lectura con acceso al historial de clientes. Prioridad: Fase 2. |
| **Dueño / Socio sin rol operativo** | Quiere ver métricas del programa sin administrar nada. Necesita solo el dashboard de alto nivel. | Panel de "observador" de solo lectura. Prioridad: Fase 3. |
| **Franquiciado** | Opera bajo una marca central pero como empresa independiente. Necesita ver sus datos y compararse con la red. | Modelo de empresa "hija" bajo empresa "madre". Funcionalidad de red de franquicias. Prioridad: Fase 4. |
| **Operador de quiosco / punto de registro** | Dispositivo fijo en el punto de entrada que registra clientes nuevos de forma semi-automática. | Modo "quiosco" de la interfaz de registro de clientes. Prioridad: Fase 3. |

### 10.2 Necesidades no contempladas originalmente

| Necesidad identificada | Perfil afectado | Impacto |
|-----------------------|-----------------|---------|
| **Notificación de nuevo beneficio disponible para el cliente** | P-09 Cliente Final | Alto — sin notificación, el cliente no sabe que tiene nuevos beneficios |
| **Vista de próximos vencimientos de beneficios del cliente** | P-09 Cliente Final | Medio — evita que el cliente pierda un beneficio por no saberlo |
| **Modo sin internet para el cajero** | P-07 Cajero | Alto — en establecimientos con conexión inestable, el proceso de validación se interrumpe |
| **Plantillas de beneficios por industria** | P-04 Admin Empresa | Medio-alto — reducir el tiempo de creación del primer beneficio en el onboarding |
| **Exportación de base de clientes** | P-04 Admin Empresa | Alto — si la empresa quiere irse o hacer un respaldo, necesita llevarse sus datos |
| **Historial de cambios de configuración** | P-04 Admin Empresa + P-01 Superadmin | Medio — poder ver quién cambió qué en la configuración de un beneficio |

### 10.3 Riesgos de experiencia identificados

| Riesgo | Perfil afectado | Severidad | Mitigación propuesta |
|--------|-----------------|-----------|---------------------|
| **El cajero muestra el mensaje de rechazo al cliente de forma embarazosa** | P-07 Cajero + P-09 Cliente | Alto | Diseñar el mensaje de rechazo para que sea visible solo para el cajero, con un texto sugerido para decirle al cliente |
| **El cliente no puede abrir su Pase Digital por problemas de email** | P-09 Cliente Final | Alto | Acceso alternativo por teléfono o por código de verificación |
| **El Admin crea un beneficio con un error sin darse cuenta** | P-04 Admin Empresa | Alto | Vista previa del beneficio desde la perspectiva del cliente antes de publicar |
| **El Gerente de Sucursal toma decisiones basadas en datos desactualizados** | P-05 Gerente Sucursal | Medio | Indicar claramente el timestamp de actualización de los datos en cada vista |
| **Un empleado intenta acceder a funciones que no le corresponden** | P-07 Cajero | Bajo | El sistema no muestra funciones que el rol no tiene permitidas |
| **El cliente pierde acceso a su email y no puede recuperar el Pase Digital** | P-09 Cliente Final | Medio | Proceso de recuperación por teléfono asistido por la empresa |
| **La Admin publica un beneficio para todos los clientes sin darse cuenta** | P-04 Admin Empresa | Alto | Mostrar estimado de impacto antes de confirmar ("Este beneficio se aplicará a ~342 clientes") |

### 10.4 Mejoras propuestas antes de iniciar el diseño de interfaz

| Mejora | Justificación | Prioridad |
|--------|---------------|-----------|
| Definir un sub-rol "Contador" con acceso de solo lectura a reportes financieros | Cubre necesidad operativa real que el Admin no debería cubrir solo | Alta |
| Diseñar un flujo de recuperación de Pase Digital sin dependencia de email | El cliente puede perder acceso a su email; el programa no debe quedar bloqueado | Alta |
| Incluir una vista previa de la perspectiva del cliente al crear beneficios | Previene errores de configuración costosos (beneficio mal definido, condiciones confusas) | Alta |
| Definir el comportamiento offline del módulo de escaneo | Establecimientos con WiFi inestable necesitan continuidad operativa | Media |
| Crear plantillas de beneficios por industria para el onboarding | Reduce de forma dramática el tiempo hasta primera validación para nuevas empresas | Media |
| Diseñar un indicador de "salud del programa" en el dashboard del Admin | Permite que el Admin sepa sin analizar si su programa está activo, en riesgo o inactivo | Media |

### 10.5 Conclusión de la autoauditoría

El ecosistema de 12 perfiles documentado en este capítulo es **suficientemente completo para iniciar el diseño de interfaz** de los módulos centrales. Los perfiles críticos — Admin de Empresa, Cajero y Cliente Final — están completamente caracterizados.

Los gaps identificados (Contador, recuperación sin email, modo offline) son **mejoras que deben planificarse para la Fase 2**, no bloqueantes para el MVP.

El riesgo más alto identificado es la **experiencia del cajero ante rechazos**: si el mensaje de rechazo es visible para el cliente o no tiene contexto suficiente para el cajero, la primera impresión del cliente sobre el programa de beneficios de la empresa será negativa. Este riesgo debe resolverse en el diseño de la interfaz de escaneo antes de cualquier otra decisión de UX.

---

*Document ID: UPPE-001 | Version: 1.0.0 | Status: APPROVED*  
*Classification: Confidential — Product & Design Team*  
*© 2026 Pase Digital — All rights reserved*
