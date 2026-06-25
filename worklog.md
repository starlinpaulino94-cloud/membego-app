# FIDELIX QR — Worklog

---
Task ID: 1
Agent: main
Task: Foundation — esquema Prisma completo, DB, librerías base (auth/session, constantes, integraciones, API helpers, QR) e instalación de qrcode + html5-qrcode.

Work Log:
- Instaladas librerías `qrcode`, `html5-qrcode`, `@types/qrcode`.
- Redactado `prisma/schema.prisma` completo con todas las tablas: User, Session, TipoNegocio, CampoDef, Empresa, Cliente, ClienteCampo, Estrategia, ClienteEstrategia, QrToken, Transaccion, Integracion, IntegrationLog. Enums modelados como String (compatibilidad SQLite). Relaciones multiempresa correctas. Un User CLIENTE puede tener varios registros Cliente (uno por empresa).
- Ejecutado `bun run db:push` con éxito. DB sincronizada en `db/custom.db`.
- Creado `src/lib/constants.ts` con tipos/constantes: roles, tipos de estrategia, tipos de integración, eventos de sincronización, servicios por tipo de negocio (carwash/restaurante), etiquetas y colores de estados.
- Creado `src/lib/auth.ts`: hashing scrypt, sesión con cookie httpOnly `fx_session` (TTL 7 días), `getCurrentUser`, `requireUser`, `requireRol`, `assertEmpresaAccess` (aislamiento por empresa).
- Creado `src/lib/integration.ts`: `syncEvent(empresaId, evento, payload)` que recorre integraciones activas, filtra por eventos configurados, envía webhook/API REST con headers x-api-key y x-token-secreto, registra siempre en IntegrationLog (EXITOSO/ERROR/PENDIENTE), soporta reintento.
- Creado `src/lib/api.ts`: helpers `ok`, `err`, `apiError` (mapea NO_AUTORIZADO/SIN_PERMISO/EMPRESA_INVALIDA) y `ensureQrToken` (genera/reutiliza token UUID por cliente+empresa y sincroniza evento QR_GENERADO).

Stage Summary:
- Esquema multiempresa listo y funcional. Aislamiento por empresa se enforce en API vía `assertEmpresaAccess`.
- Auth por sesión + cookie lista. Contraseñas hasheadas con scrypt.
- Infraestructura de integraciones con logging completo operativa.
- Próximo: API routes (auth, empresas, tipos-negocio, clientes, estrategias, cliente-estrategias, QR scan/confirm, transacciones, integraciones, reportes) y luego seed.

---
Task ID: 2
Agent: main
Task: API routes completas — auth, empresas, tipos-negocio, clientes, estrategias, cliente-estrategias, QR scan/confirm, transacciones, integraciones+logs, reportes, usuarios, seed, datos-publicos.

Work Log:
- /api/auth (POST login, GET me), /api/auth/logout, /api/auth/register (registro de cliente con campos dinámicos + estrategia opcional + QR).
- /api/empresas (GET con modo public, POST superadmin), /api/empresas/[id] (GET/PATCH/DELETE).
- /api/tipos-negocio, /api/datos-publicos (tipos + empresas activas + estrategias en un call para landing).
- /api/clientes (GET filtra por rol/empresa, POST admin crea cliente + usuario opcional), /api/clientes/[id] (GET/PATCH con campos dinámicos).
- /api/estrategias (GET public/privado, POST admin), /api/estrategias/[id] (GET/PATCH/DELETE).
- /api/cliente-estrategias (GET/POST asignar estrategia con validaciones), /api/cliente-estrategias/[id]/confirmar-pago (activa membresía pendiente).
- /api/qr/scan (POST valida token, devuelve cliente+estrategias+beneficios SIN consumir; aislamiento por empresa).
- /api/qr/confirm (POST registra transacción aplicando lógica por tipo de estrategia: MEMBRESIA descuenta usos, CONTEO_VISITAS acumula y aplica recompensa al llegar a meta, PUNTOS acumula, CUPON aplica descuento y vence, PROMOCION_TIEMPO valida rango fechas; sincroniza VISITA_REGISTRADA y BENEFICIO_USADO).
- /api/transacciones (GET con filtros fecha/cliente).
- /api/integraciones (GET/POST), /api/integraciones/[id] (PATCH/DELETE), /api/integraciones/[id]/logs, /api/integration-logs/[id]/retry.
- /api/reportes (tipo=general para superadmin: total empresas, activas, clientes, transacciones por tipo, estrategias más usadas, serie 14 días; tipo=empresa: clientes activos/inactivos, estrategias activas, beneficios usados, ingresos membresías, errores sync, clientes frecuentes, consumos por tipo, serie 14 días).
- /api/usuarios (GET/POST — superadmin crea admins, admin empresa crea empleados).

Stage Summary:
- Backend completo y verificado: seed ejecutado vía API (2 tipos, 2 empresas, 7 usuarios, estrategias y clientes de prueba). Login /api/auth probado con superadmin@fidelix.com/admin123 → OK. datos-publicos OK.
- Aislamiento multiempresa enforced con assertEmpresaAccess en todos los endpoints sensibles.
- Lint pasa sin errores.
- Contrato API listo para el frontend SPA.

---
Task ID: 3
Agent: main
Task: Seed de datos de prueba (Carwash + Restaurante).

Work Log:
- Creado src/lib/seed.ts idempotente con: tipos de negocio Carwash/Restaurante + campos dinámicos (marca/modelo/año/color/placa para carwash; preferencias/frecuencia/mesa favorita para restaurante).
- 2 empresas: AutoBrillo Carwash (Santiago) y Sabor Dominicano (Santo Domingo).
- 7 usuarios: superadmin, 2 admins empresa, 2 empleados, 2 clientes.
- Estrategias: Carwash (Silver/Gold membresía, Lava 5 y 6ta gratis conteo, Puntos); Restaurante (Almuerzo Ejecutivo membresía, Compra 5 y 6ta 50% conteo, Cupón 10%, Puntos, Promo mitad de mes).
- 2 clientes de prueba con QR + membresías asignadas (Pedro con Silver ACTIVA usos 2/4; Ana con Almuerzo PENDIENTE) + historial de transacciones.
- 2 integraciones webhook de ejemplo (httpbin) para sincronización.

Stage Summary:
- Credenciales de prueba: superadmin@fidelix.com/admin123, admin.carwash@fidelix.com/admin123, admin.restaurante@fidelix.com/admin123, empleado.carwash@fidelix.com/admin123, cliente@fidelix.com/cliente123, ana@fidelix.com/cliente123.

---
Task ID: 4
Agent: main
Task: Frontend SPA completo en / con store Zustand, api-client, shell con sidebar por rol, pantallas de auth (landing/login/registro multi-paso), y 4 paneles por rol (superadmin, admin empresa, empleado, cliente) con todos los módulos: empresas, tipos, usuarios, clientes, estrategias, pagos, escáner QR, historial, integraciones+logs, reportes. QR generation (qrcode) + scanner (html5-qrcode) + input manual. Diseño responsive con sticky footer.

Work Log:
- src/components/fidelix/api-client.ts: cliente fetch tipado con todos los tipos del dominio.
- store.ts: Zustand con user/loading/view/section/toast + helpers de formato (fmtMonto, fmtFecha, fmtFechaHora).
- shared.tsx: EstadoBadge, TipoEstrategiaBadge, RolBadge, StatCard, SectionHeader, EmptyState.
- AuthScreens.tsx: Landing (hero + flujo), Login (con cuentas demo), Register (3 pasos: tipo de negocio → empresa+estrategia → datos con campos dinámicos).
- QrComponents.tsx: QrDisplay (genera PNG descargable con qrcode), QrScanner (cámara con html5-qrcode), ManualTokenInput.
- AppShell.tsx: header sticky + sidebar por rol (desktop + drawer móvil) + router de paneles.
- panels/ClientePanel.tsx: Mi QR (selector de empresa, QR, estrategia activa con progreso/puntos/usos), Mis empresas, Historial.
- panels/ScannerFlow.tsx: escáner (cámara o manual) → validación (cliente+estrategias+beneficios SIN consumir) → confirmación (selecciona servicio, monto, estrategia; descuenta usos/puntos).
- panels/EmpresaPanel.tsx: Dashboard (stats + gráficos), Clientes (CRUD + asignar estrategia + detalle), Estrategias (CRUD con form por tipo), Pagos pendientes (confirmar), Historial (tabla), Integraciones (CRUD + logs + retry), Reportes.
- panels/SuperadminPanel.tsx: Dashboard global, Empresas (CRUD), Tipos de negocio (campos dinámicos), Usuarios (CRUD admins/empleados), Reportes globales.
- panels/EmpleadoPanel.tsx: Escáner + historial propio.
- AppRoot.tsx: orquesta auth inicial + routing de vistas + toasts.
- page.tsx: renderiza <AppRoot/>.
- layout.tsx: metadata FIDELIX QR.

Stage Summary:
- Frontend completo y funcional. Lint pasa sin errores.
- Diseño responsive (mobile-first, drawer móvil, grid adaptativo), colores sugeridos (slate/sky primary, emerald activo, amber pendiente, red alerta, violet integraciones).
- Bugs encontrados y corregidos durante verificación: /api/clientes para CLIENTE no incluía estrategias (corregido).

---
Task ID: 5
Agent: main
Task: Verificación end-to-end con Agent Browser.

Work Log:
- Landing renderiza correctamente con branding FIDELIX QR.
- Login superadmin@fidelix.com/admin123 → Dashboard global con datos reales (2 empresas, 2 clientes, 2 transacciones, estrategias más usadas). Navegación a Tipos de negocio muestra campos dinámicos.
- Login admin.carwash@fidelix.com/admin123 → Dashboard empresa AutoBrillo (1 cliente, 4 estrategias activas, RD$999 ingresos, cliente frecuente Pedro).
- Flujo ESCÁNER QR (crítico): ingreso token de Pedro manualmente → validación muestra cliente, datos vehículo (Toyota Corolla 2021 Blanco A123456), estrategias activas (Conteo 3/6, Membresía Silver 2 usos). Seleccioné Membresía Silver + Lavado básico → Confirmar → "Transacción registrada: Incluido en membresía (Membresía Silver)". Verificado en BD: transacción con usosDescontados=1 y Silver usosDisponibles 2→1. ✓
- Login cliente@fidelix.com/cliente123 → Mi QR muestra código QR + token + datos + estrategia activa (Conteo 3/6 con barra de progreso) + Membresía Silver. Historial muestra transacciones.
- Registro cliente: 3 pasos (tipo Carwash → empresa AutoBrillo → formulario con campos dinámicos Marca/Modelo/Año/Color/Placa). ✓
- Responsive móvil (390px): contenido renderiza, drawer de menú abre y navega.
- Sticky footer en landing.

Stage Summary:
- Todos los flujos核心 verificados: auth por rol, dashboard con datos reales, escaneo QR + confirmación de consumo (con decremento de beneficios verificado en BD), panel de cliente con QR y beneficios, registro multi-paso.
- Nota: el comando `click` de agent-browser no siempre dispara el onClick de React en este entorno; se usó JS click (element.click()) para verificación de navegación, confirmando que la app funciona correctamente.
- Sin errores de runtime/hydration en consola. Lint limpio. Dev server estable.
- FIDELIX QR está completo y funcional.

---
Task ID: 6 (refactor Club de Beneficios QR)
Agent: main
Task: Refactor backend + store + routing para separar landing pública (cliente) de panel admin oculto. Rebrand a "Club de Beneficios QR", empresas con identidad propia, solo 3 tipos de beneficio visibles.

Work Log:
- Schema: añadidos campos de branding a Empresa (whatsapp, ciudad, colorPrincipal, colorSecundario, descripcionPublica, imagenPortada, horario, redesSociales, urlPersonalizada, textoBienvenida, terminosCondiciones). Añadido `terminos` a Estrategia. db:push OK (aditivo).
- Seed reescrito: empresas con identidad propia (CARTOWN Wash & Detailing azul #1e40af / Sabor Dominicano naranja #ea580c) con branding completo; campos restaurante corregidos (preferencia_alimentaria + fecha_cumpleanos en vez de frecuencia/mesa_favorita); solo 3 tipos de beneficio (MEMBRESIA, CONTEO_VISITAS, CUPON) con términos; integración webhook de ejemplo. DB reseteada y re-seedeada (requirió reiniciar dev server por conexión Prisma stale).
- Constants: TIPOS_BENEFICIO (3 visibles) reemplaza TIPOS_ESTRATEGIA en UI; EVENTOS_SINCRONIZACION simplificado a 5 eventos (CLIENTE_CREADO, QR_GENERADO, BENEFICIO_ACTIVADO, USO_CONFIRMADO, PAGO_CONFIRMADO).
- API empresas: POST/PATCH aceptan todos los campos de branding via pickEmpresaFields. API estrategias: POST/PATCH aceptan `terminos`. API reportes: añadidos `usosHoy` y `promocionesMasUsadas`.
- Store reescrito con routing por hash: Route = landing | registro | cliente-login | cliente-app | admin-login | admin-app. navigate() actualiza hash + estado. hashchange listener para botones atrás/adelante. AdminSections: dashboard, empresas, clientes, beneficios, pagos, escanear, usos, reportes, configuracion. ClienteSections: mi-qr, mis-empresas, historial.
- api-client: Empresa con todos los campos de branding; Estrategia con `terminos`.
- AppRoot reescrito: routing por hash con separación landing/admin oculto. Admin solo accesible via #admin-login / #admin (no linkeado desde landing). Cliente via #mi-qr.

Stage Summary:
- Contrato frontend fijado: store (useStore con navigate/setRoute/setAdminSection/setClienteSection), api-client (tipos Empresa/Estrategia/Cliente/etc), constants (TIPOS_BENEFICIO, EVENTOS_SINCRONIZACION).
- Credenciales unchanged: superadmin@fidelix.com/admin123, admin.carwash@fidelix.com/admin123, cliente@fidelix.com/cliente123.
- Próximo: delegar a subagents (A) frontend público (Landing/Register/ClientLogin/ClienteShell) y (B) frontend admin (AdminLogin/AdminShell/EmpresaForm/BeneficiosForm/Dashboard).

---
Task ID: 7-A
Agent: frontend-public
Task: Reescribir el frontend público del cliente (Landing + ClientLogin + RegisterScreen + ClienteShell) para "Club de Beneficios QR", sin lenguaje SaaS/fidelización ni acceso al panel admin desde la UI pública.

Work Log:
- AuthScreens.tsx reescrito (~960 líneas): eliminados `Landing` viejo (con botón "Acceder al panel"), `Login` genérico y `Register`. Nuevos exports: `Landing`, `ClientLogin`, `RegisterScreen`.
  - Landing: header con logo + "Club de Beneficios QR" + botón "Ver mi QR" (→ cliente-login). Hero con badge "Beneficios exclusivos", H1 y subtítulo del brief, CTAs "Registrarme ahora" + "Ver beneficios disponibles" (scroll suave). Sección "Cómo funciona" 6 pasos. Sección "Negocios disponibles" agrupada por tipoNegocio con cards usando colorPrincipal + logo o ícono. Sección "Beneficios disponibles" grid iterando empresas.estrategias con tipo via TIPOS_BENEFICIO, precio o "Gratis", términos. FAQ con Accordion de shadcn (5 preguntas). Footer sticky.
  - ClientLogin (NUEVO): card centrada "Ver mi QR", form email+password, al submit POST /api/auth. Si user.rol !== "CLIENTE" → POST /api/auth/logout + toast error "Esta cuenta no es de cliente" (sin navegar). Si cliente → navigate("cliente-app"). Links "Registrarme ahora" y "← Volver". Caja demo cliente@fidelix.com/cliente123.
  - RegisterScreen (renombrado): header con logo + "← Volver" → landing (sin botón admin). 3 pasos: tipo de negocio → empresa+promoción opcional → datos (nombre*, teléfono*, email* con nota "lo usarás para ver tu QR", contraseña*, fecha nacimiento opcional, campos dinámicos desde tipoNegocio.camposDef). Botón "Completar registro". Al éxito: toast + navigate("cliente-app").
- ClienteShell.tsx NUEVO (~620 líneas): shell dedicado para clientes (no usa AppShell). Header con logo + "Club de Beneficios QR" + user + Badge "Cliente" + logout. Sidebar desktop w-60 + drawer móvil. 3 vistas internas: MiQrView (selector empresa + QrDisplay + tarjeta beneficio activo con progreso/usos/descuento), MisEmpresasView (grid con color principal, click → setClienteSection mi-qr), HistorialView (lista transacciones con scroll). Footer sticky. Copy adaptado: "Estrategia" → "Beneficio", eliminada mención a "fidelización".
- Colores: base slate/zinc + acentos con colorPrincipal de cada empresa (style inline). Emerald como CTA de marca (reemplaza el viejo sky). Sin indigo/blue. Responsive mobile-first. Sticky footer con min-h-screen flex flex-col + mt-auto en las 4 pantallas.
- Lint: mis 2 archivos con 0 errores y 0 warnings (verificado con npx eslint). Los 3 errores restantes de `bun run lint` están en AdminShell.tsx (Task 7-B), fuera de mi scope.
- Dev log: GET /api/datos-publicos 200 repetido (Landing renderizando y cargando datos OK), sin errores runtime.

Stage Summary:
- Frontend público completo y autocontenido. AppRoot ya importa correctamente Landing/RegisterScreen/ClientLogin desde ./AuthScreens y ClienteShell desde ./ClienteShell (no requiere cambios en AppRoot).
- Credenciales unchanged: cliente@fidelix.com/cliente123.
- Pendiente Task 7-B: AdminLogin + AdminShell (con sus errores de lint: setState en effect y NavList creada dentro de render) + EmpresaForm/BeneficiosForm/Dashboard.

---
Task ID: 7-B
Agent: admin-frontend (subagent B)
Task: Refactor frontend del panel administrativo — AdminLogin, AdminShell, SuperadminPanel, EmpresaPanel, EmpleadoPanel, ScannerFlow. Rebrand a "Club de Beneficios QR", separar landing pública de panel admin oculto, empresa con branding completo, solo 3 tipos de beneficio (MEMBRESIA/CONTEO_VISITAS/CUPON) con términos, renames "Estrategias"→"Beneficios" y "Historial"→"Usos registrados", integraciones bajo "Configuración", dashboard con usosHoy/promocionesMasUsadas.

Work Log:
- CREADO `src/components/fidelix/AdminLogin.tsx`: pantalla login admin oculta. Card centrada, título "Acceso administrativo", subtítulo "Panel interno — solo personal autorizado". POST /api/auth; si user.rol === "CLIENTE" → toast error + logout (no permite acceso admin). Sin credenciales demo visibles. Link discreto "← Sitio público" → navigate("landing").
- CREADO `src/components/fidelix/AdminShell.tsx`: header (logo "Club de Beneficios QR" + badge "Panel interno" + nombre/rol user + logout) + sidebar desktop + drawer móvil. NAV_BY_ROLE: SUPERADMIN (9 secciones), ADMIN_EMPRESA (8 secciones), EMPLEADO (2 secciones). Mapea adminSection → panel. Footer sticky mt-auto. NavList extraído fuera del componente para cumplir regla react-hooks/static-components. Lee useStore().adminSection + setAdminSection.
- ACTUALIZADO `src/components/fidelix/panels/SuperadminPanel.tsx`: dashboard global con 6 métricas (Empresas activas, Clientes registrados, Beneficios activos, Beneficios pendientes de pago, Usos registrados hoy, Transacciones totales). Agregación de reportes por empresa para beneficios activos/pendientes/usosHoy. EmpresasManager con EmpresaForm (branding completo). EmpresaSelector interno para secciones que requieren empresa. Renombrado "Estrategias"→"Beneficios" en toda la UI. Sección Configuración con tabs Integraciones/Info. Removidos TiposManager y UsuariosManager del router (no en nav spec).
- ACTUALIZADO `src/components/fidelix/panels/EmpresaPanel.tsx`: reescrito. EmpresaDashboard usa usosHoy y promocionesMasUsadas. BeneficiosManager + BeneficioForm con solo 3 tipos (TIPOS_BENEFICIO) + campo términos en todos los tipos. UsosManager (rename de Historial). ConfiguracionManager = IntegracionesManager. EmpresaForm exportado con todos los campos de branding en 4 secciones: Información básica, Identidad visual (color pickers + hex inputs + preview logo/portada), Contacto y ubicación, Textos públicos. Exporta ClientesManager/BeneficiosManager/PagosManager/UsosManager/EmpresaForm para reutilización desde SuperadminPanel.
- ACTUALIZADO `src/components/fidelix/panels/EmpleadoPanel.tsx`: simplificado. Solo 2 secciones (escanear/usos). Usa UsosManager de EmpresaPanel con empleadoId para filtrar.
- ACTUALIZADO `src/components/fidelix/panels/ScannerFlow.tsx`: cambios de copy "Estrategias"→"Beneficios", "Confirmar consumo"→"Confirmar uso", "Consumo registrado"→"Uso registrado", "Consumo confirmado"→"Uso confirmado", "Últimos consumos"→"Últimos usos". Lógica intacta.
- Worklog del agente en `/agent-ctx/7-B-admin-frontend.md`.

Stage Summary:
- `bun run lint` pasa limpio para todos los archivos del agente B (sin errores/warnings).
- Dev server compila limpio (sin module-not-found para AdminShell/AdminLogin).
- Restante: `./ClienteShell` Module not found — responsabilidad de Agent A (ClienteShell no creado todavía).
- Pendiente: Agent A debe crear/refactor AuthScreens (Landing/Register/ClientLogin), ClienteShell y page.tsx para completar la separación landing/admin oculto.

---
Task ID: 8
Agent: main
Task: Verificación end-to-end con Agent Browser del refactor Club de Beneficios QR.

Work Log:
- Landing pública: muestra "Club de Beneficios QR", H1 "Aprovecha beneficios exclusivos con tu código QR", subtítulo correcto, botones "Registrarme ahora" + "Ver beneficios disponibles" + "Ver mi QR". Secciones: Cómo funciona (6 pasos), Negocios disponibles (CARTOWN Wash & Detailing azul, Sabor Dominicano naranja con descripciones y horarios), Beneficios disponibles (grid de estrategias activas), FAQ (5 preguntas). Cero menciones de admin/panel/fidelización/SaaS verificadas. NO hay link al panel admin.
- Acceso admin oculto: `#admin-login` muestra "Acceso administrativo — Panel interno — solo personal autorizado". Login superadmin → redirige a `#admin` Dashboard con métricas (empresas activas 2, clientes 2, beneficios activos 6, pendientes pago 1, usos hoy 0, promociones más usadas).
- Módulo Empresas: form con branding completo (color principal, portada, horario, whatsapp, términos verificados).
- Módulo Beneficios: select muestra SOLO 3 tipos (Membresía por usos, Conteo de visitas, Cupón simple) — Puntos y Promoción eliminados de la UI.
- Escáner QR (admin carwash): token de Pedro validado → muestra cliente, vehículo (Toyota Corolla 2021 Blanco A123456), beneficios (Conteo 3/6, Plan Silver 2 usos). Confirmar uso con Plan Silver + Lavado básico → "Uso confirmado: Incluido en membresía (Plan Silver)". BD verificada: usos disponibles 2→1.
- Panel cliente (via "Ver mi QR" → #mi-qr): login navega a Mi QR mostrando código QR personal, datos del vehículo, beneficio activo con progreso.
- Bug corregido: ClientLogin y RegisterScreen no llamaban setUser antes de navigate("cliente-app"), por lo que AppRoot no detectaba la sesión. Añadido useStore.getState().setUser(res.user) en ambos.
- Responsive móvil (390px): drawer de menú presente. Lint limpio. Sin errores de runtime.

Stage Summary:
- Refactor completo y verificado. Landing 100% enfocada al cliente sin exposición del panel. Admin oculto via hash routing (#admin-login/#admin). Empresas con identidad propia (branding completo). Solo 3 tipos de beneficio visibles. Escáner + confirmación de uso funcionando end-to-end con decremento verificado en BD.

---
Task ID: 9 (transformación Pase Digital)
Agent: main
Task: Backend para transformación UX/copywriting a "Pase Digital" (Cialdini). Sin tocar lógica de negocio.

Work Log:
- Schema: Empresa +calificacion (Float), +servicios (JSON), +galeria (JSON), +destacada (Bool). Estrategia +incluye (JSON bullets), +limiteCupos, +cuposDisponibles, +destacada, +escasezTipo. Nuevo modelo Config (singleton id=1) con socialClientes/socialVisitas/socialPromociones/socialNegocios/socialVehiculos/heroTitulo/heroSubtitulo. db:push OK.
- Seed: empresas con calificación (4.8/4.7), servicios (6 c/u), destacada=true. Estrategias con `incluye` bullets persuasivos, escasez (Plan Silver ultimos_cupos 12 cupos; Gold tiempo_limitado 8 cupos; Almuerzo ultimos_cupos 5; Cupón este_mes), destacadas (Silver, Almuerzo). Descripciones reescritas orientadas a experiencia. Config upsert con 2500/5400/8200/2/1850.
- API datos-publicos: ahora devuelve config + usosPorEstr (conteo real de transacciones por estrategia) + clientesReales + empresas ordenadas por destacada.
- API empresas POST/PATCH: aceptan calificacion, servicios, galeria, destacada.
- API estrategias POST/PATCH: aceptan incluye, limiteCupos, cuposDisponibles, destacada, escasezTipo.
- API /api/config GET (público) / PATCH (admin) para prueba social administrable.
- constants: +ESCASEZ_TIPOS (tiempo_limitado, este_mes, ultimos_cupos).
- api-client: Empresa +calificacion/servicios/galeria/destacada; Estrategia +incluye/limiteCupos/cuposDisponibles/destacada/escasezTipo; +tipo Config.
- DB reseteada y re-seedeada. Verificado: config 2500/5400, calificaciones 4.8/4.7, incluye bullets presentes, escasez ultimos_cupos 12 cupos, usosPorEstr con conteo real.

Stage Summary:
- Contrato backend listo para frontend. Palabra "beneficios" sigue en datos internos (descripcionPublica/textoBienvenida usan "oportunidades/exclusivas"). El frontend público debe evitar "beneficios/fidelización" en copy visible.
- Próximo: delegar a subagents (A) frontend público rebrand "Pase Digital" con Cialdini y (B) admin forms con nuevos campos + config social.

---
Task ID: 10-B
Agent: admin-forms (subagent B)
Task: Anadir campos premium/marketing a los formularios del panel admin (EmpresaForm + BeneficioForm) y un card de prueba social en ConfiguracionManager. Sin tocar logica de negocio ni store/api-client.

Work Log:
- `src/components/fidelix/panels/EmpresaPanel.tsx`:
  - Imports: anadido `ESCASEZ_TIPOS` de constants, `Separator` de ui, `Config` type de api-client, e iconos lucide `Star`, `Image as ImageIcon`, `List`, `Flame`, `Save`.
  - Helpers nuevos (modulo-level): `jsonArrayToText(v)` parsea string JSON o array a texto multilinea para textareas; `textToJsonArrayString(text)` convierte texto (una linea por elemento) a `JSON.stringify(array)` para enviar al backend. try/catch defensivo.
  - `EmpresaForm` (compartido con Superadmin): nueva seccion "Perfil premium (autoridad y prueba social)" despues de "Identidad visual" con: Calificacion (number step 0.1 min 0 max 5, ayuda "Calificacion visible en la landing 0-5 estrellas"), Switch Destacada ("Marcar como establecimiento destacado, aparece primero en la landing"), Servicios (textarea, una linea por servicio, ayuda "chips en la tarjeta"), Galeria (textarea, una URL por linea, opcional). State init (edit) parsea servicios/galeria JSON con `jsonArrayToText`; state init (create) inicializa vacio. `save()` serializa con `textToJsonArrayString` y envia calificacion/servicios/galeria/destacada.
  - `BeneficioForm`: nueva seccion "Presentacion en la landing (conversion)" despues de Terminos, con separador `border-t`. Campos: Incluye (textarea bullets, ayuda "Lista con ticks verdes que se muestra en la tarjeta de la promocion. Vende la experiencia."), Switch Destacada ("La favorita de nuestros clientes, badge dorado"), Limite de cupos (number, ayuda "0 = ilimitado. Si > 0, se muestra como escasez"), Cupos disponibles (number, ayuda "Cupos restantes. Se muestra cuando hay limite"), Tipo de escasez (Select con "Ninguna" + los 3 `ESCASEZ_TIPOS`, ayuda "Mensaje de urgencia que aparece en la tarjeta"). State init (edit) convierte incluye JSON a texto y normaliza escasezTipo null/empty a "none"; state init (create) inicializa vacio/0/"none". `save()` serializa incluye a JSON, mapea "none" a null al enviar.
  - Nuevo componente exportado `SocialProofConfig`: card con CardTitle "Prueba social (numeros visibles en la landing)" icon Users. Carga `GET /api/config` al montar (useEffect). Inputs number: Clientes registrados, Promociones utilizadas, Visitas registradas, Negocios participantes, Vehiculos atendidos. Separator. Input text: Titulo del hero (placeholder "Tu Pase Digital abre la puerta a promociones privadas"). Textarea: Subtitulo del hero. Boton "Guardar" con icon Save que hace `PATCH /api/config` con los 5 numeros + heroTitulo/heroSubtitulo (null si vacio). Toast "Prueba social actualizada".
  - `ConfiguracionManager`: ahora renderiza `<SocialProofConfig />` arriba + `<IntegracionesManager />` abajo, dentro de un `space-y-6`. Descripcion del header actualizada a "Prueba social, integraciones con sistemas externos y sincronizacion".
- `src/components/fidelix/panels/SuperadminPanel.tsx`:
  - Import anadido: `SocialProofConfig` desde `./EmpresaPanel` (EmpresaForm ya se importaba, asi que los campos premium se propagan automaticamente).
  - `SuperadminConfiguracion`: renderiza `<SocialProofConfig />` arriba (global) + el tab switcher existente (Integraciones/Info) debajo, dentro de un `space-y-6`. Descripcion actualizada a "Prueba social global + integraciones y datos de la empresa seleccionada". Las integraciones por empresa siguen accesibles via el tab "Integraciones".

Stage Summary:
- `bun run lint` pasa limpio (0 errores, 0 warnings en los 2 archivos modificados). `npx eslint` directo sobre los archivos tambien limpio.
- `/api/config` GET verificado: devuelve {socialClientes:2500, socialVisitas:5400, socialPromociones:8200, socialNegocios:2, socialVehiculos:1850, heroTitulo:null, heroSubtitulo:null} — los valores que carga el SocialProofConfig al montar.
- No se modifico store.ts, api-client.ts, AppRoot.tsx, AuthScreens.tsx, ClienteShell.tsx, AdminShell.tsx, AdminLogin.tsx, ScannerFlow.tsx, EmpleadoPanel.tsx (reglas respetadas).
- Terminos internos admin (beneficios, estrategias, marketing, conversion, escasez) se mantienen en el panel admin (permitidos). No aparecen en la landing publica.
- Entregable completo: los 2 archivos modificados exponen todos los nuevos campos premium/marketing en los formularios y el card de prueba social administrable.

---
Task ID: 10-A (transformación frontend público — Pase Digital + Cialdini)
Agent: frontend-public (subagent A)
Task: Transformar concepto y copywriting del frontend público (AuthScreens.tsx Landing/RegisterScreen/ClientLogin + ClienteShell.tsx) a "Pase Digital · Acceso Exclusivo" aplicando los 6 principios de Cialdini. Sin tocar store.ts, api-client.ts, ni archivos admin.

Work Log:
- `src/components/fidelix/AuthScreens.tsx` reescrito completo (~980 líneas). Eliminados los viejos `Landing`/`ClientLogin`/`RegisterScreen` con branding "Club de Beneficios QR".
  - Helpers nuevos: `parseJsonArray<T>` (parseo defensivo JSON para servicios/incluye con try/catch default []), `escasezMensaje(tipo)` (mapeo ESCASEZ_TIPOS), `useCountUp(target, durationMs)` (animación count-up con requestAnimationFrame + easing cúbico), `StatPill` (pill premium con icono ámbar + número grande con count-up + label).
  - **Landing**: fetch único `/api/datos-publicos` → `{tipos, empresas, usosPorEstr, config, clientesReales}`. Header con logo KeyRound + "PASE DIGITAL" + tagline "Acceso Exclusivo" + botón "Acceder a mi Pase" (NINGÚN botón admin). Hero centrado: badge ámbar "Acceso exclusivo para clientes registrados" (Crown), H1 con "Pase Digital" en ámbar (usa config.heroTitulo si viene), subtítulo (config.heroSubtitulo o default), CTA primario "Quiero mi Pase Digital" (→ registro, ámbar), CTA secundario "Descubrir promociones" (scroll), frase "Algunas promociones solo están disponibles para clientes registrados.". Barra de prueba social (Cialdini Prueba Social): 4 StatPills con count-up animado (socialClientes/socialVisitas/socialNegocios/socialVehiculos solo si hay carwash). Sección "Activa tu Pase Digital en 5 pasos" (Cialdini Compromiso y Consistencia): 5 cards numeradas con iconos (KeyRound, Store, Gift, QrCode, Crown), grid horizontal 5 cols en desktop, vertical en móvil. Sección "Establecimientos participantes" (Cialdini Autoridad): grid de EmpresaPremiumCard con cover (imagenPortada o gradient colorPrincipal→colorSecundario), logo circular flotante, badge "Destacado", calificación ★ X.X/5, ciudad · dirección, descripcionPublica (line-clamp-2), chips servicios (parseados, 4 max), horario, clientes satisfechos, botón "Ver promociones". Sección "Promociones disponibles" id="promociones" (Cialdini Escasez + Prueba Social + Reciprocidad): grid de PromocionCard premium con badges (destacada dorada "La favorita de nuestros clientes" + escasez rojo/ámbar con Flame; si ultimos_cupos y cuposDisponibles>0: "¡Solo {n} cupos disponibles!"), nombre empresa chico con color principal, nombre promoción grande, badge tipo (TIPOS_BENEFICIO), descripcion, lista "Incluye" con checks verdes (parseada), prueba social "Ya utilizado por {n}+ clientes" (si n>0), precio grande o "Gratis", botón "Quiero este plan" (destacada) o "Obtener acceso", toggle "Ver términos". FAQ Accordion (Cialdini Afinidad): 5 preguntas con copy premium exacto del brief. Footer sticky mt-auto "Pase Digital · Acceso Exclusivo a promociones privadas · {año}".
  - **ClientLogin**: card premium centrada, logo KeyRound gradiente ámbar, título "Tu Pase Digital te espera", subtítulo "Accede a tus promociones privadas", form email+password, botón "Acceder a mi Pase". Submit POST /api/auth: si user.rol !== "CLIENTE" → fetch /api/auth/logout + toast error "Esta cuenta no es de cliente". Si cliente → `useStore.getState().setUser(res.user)` + toast "¡Bienvenido a tu Pase Digital, {nombre}!" + navigate("cliente-app"). Caja demo ámbar cliente@fidelix.com/cliente123. Links "¿Aún no tienes tu Pase? Activar ahora" + "← Volver".
  - **RegisterScreen**: header logo "PASE DIGITAL" + "← Volver" (→ landing), sin botón admin. Step indicator 3 barras ámbar (w-6→w-10 al activarse). Paso 1 "Elige tu establecimiento" / "¿Dónde quieres tu acceso exclusivo?" (cards tipo negocio). Paso 2 "Descubre las promociones disponibles" / "Selecciona el establecimiento y descubre las promociones disponibles" (cards empresa con calificación + dirección + horario + lista promociones con bullets incluye + badge escasez + precio/Gratis, texto "Puedes elegir una promoción ahora o activarla después desde tu Pase."). Paso 3 "Activa tu Pase" (datos: nombre*, teléfono*, email* con nota "Lo usarás para acceder a tu Pase", contraseña*, fecha nacimiento opcional, campos dinámicos). Botón "Activar mi Pase Digital". Submit: POST /api/auth/register → setUser + toast "¡Tu Pase Digital está listo!" + navigate("cliente-app"). **Bug corregido**: el código viejo hacía `await api.post(...)` sin asignar y luego `res.user` (undefined). Ahora `const res = await api.post<{user: SessionUser}>(...)`.
- `src/components/fidelix/ClienteShell.tsx` reescrito completo (~580 líneas). NAV renombrado: mi-qr → "Mi Pase" (icon KeyRound), mis-empresas → "Mis establecimientos" (icon Wallet), historial → "Mi actividad" (icon History). Header: logo KeyRound gradiente ámbar + "PASE DIGITAL" + nombre/email user + Badge ámbar "Titular del Pase" (Crown) + logout. Sidebar desktop w-60 con nav ámbar. Drawer móvil. Footer sticky "Pase Digital · Acceso Exclusivo a promociones privadas".
  - **MiPaseView**: título "Tu Pase Digital" (NO "Mi QR"), subtítulo "Presenta este Pase en el establecimiento para tus promociones". QrDisplay con label `Pase Digital · {empresa.nombre}`. Card "Promoción activa" (NO "Estrategia activa"): MEMBRESIA muestra "Te quedan {n} usos disponibles" + "Usos disfrutados", CONTEO_VISITAS "Va {n} de {meta} — tu recompensa está cerca" con barra progreso, CUPON "Descuento disponible" {pct}%. Empty state "No tienes tu Pase Digital aún" + botón "Activar mi Pase".
  - **MisEstablecimientosView**: cards empresa con calificación ★, dirección (MapPin), horario (Clock), chips "Promociones activas" (NO "Beneficios activos"), botón "Ver mi Pase" (no "Ver promociones" en este contexto intrapanel). Botón "Activar otro Pase".
  - **MiActividadView**: cada transacción "Visitaste {empresa coloreada con colorPrincipal} · {tipoConsumo}" + fecha/hora + "Aprovechaste: {beneficioAplicado}" en ámbar. Monto/usos/puntos a la derecha. Empty state "Sin actividad aún". Tipo extendido localmente `TransaccionConEmpresa = Transaccion & { empresa?: {...} | null }` porque /api/transacciones para CLIENTE hace `include: { empresa: true }` pero api-client Transaccion no declara `empresa`. No se modificó api-client.ts (contrato preservado).
- Paleta y diseño: base slate/zinc + gradient sutil `from-white via-white to-amber-50/40` + acento ámbar/amber-600 (#d97706) / amber-700 (#b45309) para exclusividad. Cada empresa conserva su colorPrincipal en cover/chips/barra. Bordes rounded-2xl, sombras suaves, hover lift sutil (`hover:-translate-y-1 hover:shadow-xl`). Mobile-first responsive.
- Reglas de oro respetadas: cero menciones de fidelización/beneficios/programa de fidelización/plataforma SaaS/software/sistema/aplicación/multiempresa/etc en copy visible. QR presentado siempre como "Pase Digital" / "Pase QR" / "Pase" (nunca "código" como feature). Variación de palabras premium (Pase Digital, Acceso Exclusivo, promociones, oportunidades, experiencias, ventajas exclusivas, recompensas). 6 principios Cialdini aplicados: Reciprocidad (registro gratis), Compromiso y Consistencia (5 pasos + multi-step register), Prueba Social (stats count-up + "Ya utilizado por N+ clientes"), Autoridad (calificaciones, destacados, "cuidadosamente seleccionados"), Afinidad (FAQ + copy cercano), Escasez (badges "Solo X cupos" / "Tiempo limitado" / "Solo este mes").
- Worklog del agente en `/agent-ctx/10-A-frontend-public.md`.

Stage Summary:
- `bun run lint` → EXIT 0 (0 errores, 0 warnings en todos los archivos). Dev server compila limpio. GET / y /api/datos-publicos devuelven 200.
- Frontend público 100% transformado a "Pase Digital · Acceso Exclusivo". Cialdini aplicado end-to-end. Credenciales unchanged: cliente@fidelix.com/cliente123.
- Pendiente: integración final con Task 10-B (admin forms con campos premium/escasez) ya entregado por subagent B.

---
Task ID: 11
Agent: main
Task: Verificación end-to-end con Agent Browser de la transformación Pase Digital.

Work Log:
- Landing pública: H1 "Tu Pase Digital abre la puerta a promociones privadas", subtítulo correcto, CTA "Quiero mi Pase Digital" + "Descubrir promociones". Frase "Algunas promociones solo están disponibles para clientes registrados." Barra de prueba social: 2,500+ clientes / 5,400+ promociones / 2 negocios / 1,850+ vehículos (count-up animado). Sección "Activa tu Pase Digital en 5 pasos" (flujo transformado). Establecimientos premium con portada, calificación ★4.8/5, chips de servicios, horario. Promociones premium con badge "La favorita de nuestros clientes" (destacada), "¡Solo 12 cupos disponibles!" (escasez), lista Incluye con checks, "Ya utilizado por 2+ clientes" (prueba social real), precio RD$999/mes, botón "Quiero este plan". FAQ premium.
- VERIFICADO: cero menciones de fidelización/beneficios/SaaS/software/sistema/multiempresa en la landing.
- VERIFICADO: ningún botón al panel admin en la landing (solo "Acceder a mi Pase" = cliente).
- Registro: "Elige tu establecimiento" (no "tipo de negocio"), 3 pasos con copy transformada.
- Panel admin (#admin-login oculto): Configuración muestra "Prueba social" con campos Clientes registrados / Promociones utilizadas / etc. cargando valores de /api/config. BeneficioForm tiene Incluye, cupos, escasez, destacada. EmpresaForm tiene calificación, servicios, galería, destacada.
- Panel cliente (#mi-qr): "Tu Pase Digital", nav "Mi Pase / Mis establecimientos / Mi actividad", badge "Titular del Pase", QR presentado como "Pase Digital · CARTOWN", "Promoción activa" (no "Estrategia").
- Prueba social configurable verificada: cambié socialClientes a 3200 via API y la landing mostró "3,200+" al recargar.
- Responsive móvil (390px): drawer presente. Lint limpio. Sin errores de consola.

Stage Summary:
- Transformación de concepto completada y verificada. La plataforma ahora se percibe como un "Pase Digital · Acceso Exclusivo" premium (no como sistema de fidelización). Los 6 principios de Cialdini aplicados: Reciprocidad (registro gratis), Compromiso/Consistencia (5 pasos), Prueba Social (barra + "ya utilizado por N"), Autoridad (perfiles premium con calificación), Afinidad (FAQ premium), Escasez (badges de cupos/tiempo). Lógica del sistema intacta. Panel admin oculto sin acceso desde landing.
