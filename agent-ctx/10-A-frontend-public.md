# Task 10-A — frontend-public (subagent A)

## Objetivo
Transformar el concepto y copywriting del frontend público (`AuthScreens.tsx` Landing/RegisterScreen/ClientLogin y `ClienteShell.tsx`) para aplicar los 6 principios de Cialdini (Reciprocidad, Compromiso y Consistencia, Prueba Social, Autoridad, Afinidad, Escasez) y posicionar el producto como un **Pase Digital** de acceso exclusivo. Sin tocar store.ts, api-client.ts, ni archivos admin.

## Contexto previo consultado
- `/home/z/my-project/worklog.md` (Tasks 1-9, especialmente Task 9 con contrato backend Config + Empresa.calificacion/servicios/galeria/destacada + Estrategia.incluye/limiteCupos/cuposDisponibles/destacada/escasezTipo).
- `/home/z/my-project/src/components/fidelix/api-client.ts` (tipos Empresa/Estrategia/Config).
- `/home/z/my-project/src/components/fidelix/store.ts` (routes, clienteSection, helpers).
- `/home/z/my-project/src/lib/constants.ts` (TIPOS_BENEFICIO, ESCASEZ_TIPOS).
- `/home/z/my-project/src/components/fidelix/QrComponents.tsx` (API de `QrDisplay`).
- `/home/z/my-project/src/app/api/datos-publicos/route.ts` y `/src/app/api/transacciones/route.ts` (verificación de payload real).
- Registros previos: `/agent-ctx/7-A-frontend-public.md`, `/agent-ctx/7-B-admin-frontend.md`, `/agent-ctx/10-B-admin-forms.md`.

## Archivos modificados
1. `src/components/fidelix/AuthScreens.tsx` (full rewrite)
2. `src/components/fidelix/ClienteShell.tsx` (full rewrite)

## Resumen de cambios por archivo

### AuthScreens.tsx
Reescritura completa de las 3 pantallas públicas. Eliminados los viejos `Landing`, `ClientLogin` y `Register` (todos con copy "Club de Beneficios QR" y "QR"/"fidelización"). Nuevos exports: `Landing`, `ClientLogin`, `RegisterScreen`.

**Helpers de módulo**:
- `parseJsonArray<T>(value, fallback=[])` — parsea strings JSON (servicios, incluye) defensivamente con try/catch.
- `escasezMensaje(tipo)` — mapea `escasezTipo` → mensaje legible usando `ESCASEZ_TIPOS`.
- `useCountUp(target, durationMs=1200)` — animación count-up (Cialdini Prueba Social) con `requestAnimationFrame` + easing cúbico.
- `StatPill({value,label,icon,suffix})` — pill premium con icono en círculo ámbar, número grande con count-up, label pequeño.
- `scrollToPromociones()` — scroll suave a `#promociones`.

**Landing**:
- Fetch único `/api/datos-publicos` → `{tipos, empresas, usosPorEstr, config, clientesReales}`.
- **Header**: logo KeyRound + "PASE DIGITAL" + tagline "Acceso Exclusivo" + botón "Acceder a mi Pase" (→ cliente-login). NINGÚN botón admin.
- **Hero**: badge ámbar "Acceso exclusivo para clientes registrados" (Crown), H1 con "Pase Digital" en ámbar (usa config.heroTitulo si está seteado), subtítulo (config.heroSubtitulo o default), CTA primario "Quiero mi Pase Digital" (→ registro), CTA secundario "Descubrir promociones" (scroll), frase pequeña "Algunas promociones solo están disponibles para clientes registrados."
- **Barra de prueba social** (Cialdini Prueba Social): 4 StatPills horizontales con count-up animado. socialClientes (Users), socialVisitas (Ticket), socialNegocios (Store), socialVehiculos (Car) solo si hay empresa carwash.
- **Cómo funciona** (Cialdini Compromiso y Consistencia): 5 pasos con iconos lucide — Activa tu Pase Digital / Elige tu establecimiento / Descubre las promociones / Presenta tu Pase QR / Disfruta la experiencia. Grid horizontal en desktop (5 cols), vertical en móvil.
- **Establecimientos participantes** (Cialdini Autoridad): grid de `EmpresaPremiumCard` premium por empresa. Card con cover (imagenPortada o gradient colorPrincipal→colorSecundario), logo circular flotante (-mt-8), badge "Destacado" si destacada, nombre + calificación ★ X.X/5, ciudad · dirección, descripcionPublica (line-clamp-2), chips de servicios (parseados, 4 max), horario (Clock), clientes satisfechos (Users), botón "Ver promociones" → scroll.
- **Promociones disponibles** (Cialdini Escasez + Prueba Social + Reciprocidad): grid de `PromocionCard`. Card premium con badges arriba (destacada dorada "La favorita de nuestros clientes" / escasez rojo-ámbar con Flame y mensaje). Si ultimos_cupos y cuposDisponibles>0: "¡Solo {cuposDisponibles} cupos disponibles!". Nombre empresa chico con color principal, nombre promoción grande, badge tipo (TIPOS_BENEFICIO label), descripcion, lista "Incluye" con checks verdes (parseada), prueba social "Ya utilizado por {n}+ clientes" (si n>0), precio grande "RD$ {precio}" o "Gratis", botón "Quiero este plan" (destacada) o "Obtener acceso", toggle "Ver términos".
- **FAQ** (Cialdini Afinidad + manejo de objeciones): Accordion shadcn con 5 preguntas exactamente del brief, todas con copy premium reescrito.
- **Footer sticky**: `mt-auto`, "Pase Digital · Acceso Exclusivo a promociones privadas · {año}".

**ClientLogin**:
- Card premium centrada. Logo KeyRound en gradiente ámbar. Título "Tu Pase Digital te espera". Subtítulo "Accede a tus promociones privadas".
- Form email + password. Botón "Acceder a mi Pase".
- Submit: POST /api/auth → si user.rol !== "CLIENTE": logout vía fetch directo + toast error "Esta cuenta no es de cliente". Si cliente: `useStore.getState().setUser(res.user)` + toast "¡Bienvenido a tu Pase Digital, {nombre}!" + navigate("cliente-app").
- Caja demo ámbar "Cuenta de demostración: cliente@fidelix.com / cliente123".
- Link "¿Aún no tienes tu Pase? Activar ahora" (→ registro) y "← Volver" (→ landing).
- Footer sticky.

**RegisterScreen**:
- Header con logo + "PASE DIGITAL" + "← Volver" (→ landing). Sin botón admin.
- Título step 1 "Elige tu establecimiento", subtítulo "¿Dónde quieres tu acceso exclusivo?".
- Título step 2 "Descubre las promociones disponibles", subtítulo "Selecciona el establecimiento y descubre las promociones disponibles". Cards empresa con logo o inicial, calificación, dirección, horario. Promociones opcionales con bullets incluye (2 max), badge escasez, precio/Gratis, nota "Puedes elegir una promoción ahora o activarla después desde tu Pase."
- Título step 3 "Activa tu Pase". Nota email "Lo usarás para acceder a tu Pase". Botón final "Activar mi Pase Digital".
- Submit: POST /api/auth/register → `useStore.getState().setUser(res.user)` + toast "¡Tu Pase Digital está listo!" + navigate("cliente-app"). **Bug corregido**: el código anterior llamaba `await api.post(...)` sin asignar a `res` y luego accedía `res.user` (undefined). Ahora `const res = await api.post<{user: SessionUser}>(...)`.
- Step indicator con 3 barras que crecen (`w-6`→`w-10`) al activarse, ámbar.

### ClienteShell.tsx
Reescritura completa del shell del cliente.

- **NAV renombrado**: `mi-qr` → "Mi Pase" (icon KeyRound), `mis-empresas` → "Mis establecimientos" (icon Wallet), `historial` → "Mi actividad" (icon History).
- **Header**: logo KeyRound gradiente ámbar + "PASE DIGITAL" + tagline "Acceso Exclusivo" + nombre/email user + Badge ámbar "Titular del Pase" (Crown icon) + logout. Drawer móvil.
- **Sidebar desktop** w-60 con nav ámbar (active: `bg-amber-600 text-white`, hover: `bg-amber-50`).
- **Footer sticky**: "Pase Digital · Acceso Exclusivo a promociones privadas".

**Mi Pase View (MiPaseView)**:
- Título "Tu Pase Digital" (NO "Mi QR"). Subtítulo "Presenta este Pase en el establecimiento para tus promociones".
- QrDisplay con label `Pase Digital · {empresa.nombre}` (NO "Tu código QR personal").
- Card "Promoción activa" (NO "Estrategia activa" / "Beneficio activo"):
  - MEMBRESIA: "Te quedan {n} usos disponibles" + "Usos disfrutados" (NO "Usos consumidos").
  - CONTEO_VISITAS: "Va {n} de {meta} — tu recompensa está cerca" con barra de progreso.
  - CUPON: "Descuento disponible" {pct}%.
- Card "Otras promociones activas" (NO "Otros beneficios activos").
- Empty state: "No tienes tu Pase Digital aún" + botón "Activar mi Pase".

**Mis Establecimientos View**:
- Título "Mis establecimientos", subtítulo "Lugares donde tienes tu Pase Digital activo".
- Botón "Activar otro Pase" (NO "Registrarme en otra").
- Cards con: barra color principal, nombre, tipoNegocio, calificación ★, dirección (MapPin), horario (Clock), chips "Promociones activas" (NO "Beneficios activos"), botón "Ver mi Pase" (NO "Ver promociones" en este contexto porque ya está dentro del panel).

**Mi Actividad View (MiActividadView)**:
- Título "Mi actividad", subtítulo "Tus visitas y promociones aprovechadas".
- Cada transacción: "Visitaste {empresa.coloreada} · {tipoConsumo}" + fecha/hora + "Aprovechaste: {beneficioAplicado}" en ámbar. Monto/usos/puntos a la derecha.
- Empty state "Sin actividad aún" + "Cuando uses una promoción en un establecimiento, aparecerá aquí."
- Tipo extendido localmente: `TransaccionConEmpresa = Transaccion & { empresa?: {...} | null }` porque /api/transacciones para CLIENTE hace `include: { empresa: true, cliente: true }` pero el api-client Transaccion no declara `empresa`. No se modificó api-client.ts (contrato preservado).

## Paleta y diseño
- Base: slate/zinc + fondo gradient sutil `from-white via-white to-amber-50/40`.
- Acento principal de marca: ámbar/amber-600 (#d97706) y amber-700 (#b45309) para exclusividad.
- Cada empresa conserva su `colorPrincipal` en su cover, chips y barra superior.
- Bordes redondeados `rounded-2xl`, sombras suaves, hover lift sutil (`hover:-translate-y-1 hover:shadow-xl`).
- Tipografía: títulos `font-extrabold tracking-tight`, jerarquía clara.
- Mobile-first responsive en todas las secciones (grid cols 1 → 2 → 3/4/5 según breakpoint).

## Reglas de oro respetadas
- Cero menciones de: fidelización, fidelizar, beneficios (en copy visible al cliente), programa de fidelización, plataforma SaaS, software, sistema, aplicación, multiempresa, membresía de fidelización, sistema de fidelización.
- QR presentado siempre como "Pase Digital" / "Pase QR" / "Pase" (nunca "código" o "QR" standalone como feature).
- Variación de palabras premium: Pase Digital, Acceso Exclusivo, promociones, oportunidades, experiencias, ventajas exclusivas, recompensas.
- 6 principios Cialdini aplicados: Reciprocidad (registro gratis), Compromiso y Consistencia (5 pasos + multi-step register), Prueba Social (stats con count-up + "Ya utilizado por N+ clientes"), Autoridad (calificaciones, destacados, establecimientos cuidadosamente seleccionados), Afinidad (FAQ + copy cercano), Escasez (badges "Solo X cupos" / "Tiempo limitado" / "Solo este mes").

## Verificación
- `bun run lint` → EXIT 0 (0 errores, 0 warnings en TODOS los archivos).
- Dev log: GET / y /api/datos-publicos devuelven 200, sin errores runtime.
- Compila limpio con hot reload del dev server.

## Pendientes / Notas
- `parseJsonArray` se usa con `<>` genérico en JSX. TypeScript lo resolvió correctamente (lint pasó).
- `useCountUp` corre en cliente (useEffect con `performance.now()` + `requestAnimationFrame`), safe para SSR (no toca `window` directamente).
- Si `_count.clientes` no viene en empresas (datos-publicos no lo incluye), `EmpresaPremiumCard` muestra "Clientes satisfechos" sin número — comportamiento graceful.
- Demo credentials unchanged: cliente@fidelix.com / cliente123.
