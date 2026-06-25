# Task 7-A — Frontend Público (Cliente) · Club de Beneficios QR

**Agent:** frontend-public
**Date:** 2025-06-25
**Scope:** Reescribir el frontend público del cliente (Landing + ClientLogin + RegisterScreen + ClienteShell). NO tocar store.ts, api-client.ts, AppRoot.tsx, panels/, AdminShell.tsx, AdminLogin.tsx.

## Contexto previo
Leí `worklog.md` (Tasks 1–6) y los archivos existentes: `store.ts`, `api-client.ts`, `AppRoot.tsx`, `AuthScreens.tsx` (viejo con branding FIDELIX + botón admin), `AppShell.tsx` (viejo routing por `view`), `panels/ClientePanel.tsx`, `shared.tsx`, `QrComponents.tsx`, `constants.ts`, `route.ts` de `/api/datos-publicos` y `/api/auth`.

Confirmé el contrato:
- `useStore()` expone: `user, route, clienteSection, navigate(route), setClienteSection(s), showToast(msg,type), logout()`.
- Helpers: `fmtMonto`, `fmtFecha`, `fmtFechaHora`.
- `Route = "landing" | "registro" | "cliente-login" | "cliente-app" | "admin-login" | "admin-app"`.
- `ClienteSection = "mi-qr" | "mis-empresas" | "historial"`.
- API: `api.get/post/patch/del`. Endpoints usados: `/api/datos-publicos`, `/api/tipos-negocio`, `/api/empresas?public=1&tipoNegocioId=`, `/api/estrategias?public=1&empresaId=`, `/api/auth` (POST login, GET me), `/api/auth/logout` (POST), `/api/auth/register` (POST), `/api/clientes` (GET como CLIENTE), `/api/transacciones` (GET como CLIENTE).

## Archivos entregados

### 1. `src/components/fidelix/AuthScreens.tsx` (reescrito, ~960 líneas)
Exporta: `Landing`, `ClientLogin`, `RegisterScreen`. **Eliminado el `Login` genérico y el `Register` viejo.**

- **`Landing`** — branding "Club de Beneficios QR", **SIN botón al panel admin**. Header con logo + nombre + botón "Ver mi QR" → `navigate("cliente-login")`. Hero con badge "Beneficios exclusivos", H1 "Aprovecha beneficios exclusivos con tu código QR", subtítulo exacto del brief, botones "Registrarme ahora" (→ registro) y "Ver beneficios disponibles" (scroll suave a `#beneficios`). Sección "Cómo funciona" con los 6 pasos del brief e íconos lucide. Sección "Negocios disponibles": agrupa por tipo (Carwash/Restaurante), muestra empresas con logo o ícono por `tipoNegocio.icono`, colores usando `colorPrincipal`, dirección, horario. Sección "Beneficios disponibles": grid iterando `empresas.estrategias`, cada card con empresa+color, nombre, tipo (vía `TIPOS_BENEFICIO`), descripción, precio o "Gratis", términos. Estado vacío amable. Sección FAQ con 5 preguntas del brief usando `Accordion` de shadcn. Footer sticky (`mt-auto`) "Club de Beneficios QR · Beneficios exclusivos para nuestros clientes".
- **`ClientLogin`** (NUEVO) — Card centrada. Título "Ver mi QR", subtítulo "Ingresa para ver tu código QR y beneficios". Form email+password+submit. Al submit: POST `/api/auth`. Si `user.rol !== "CLIENTE"` → POST `/api/auth/logout`, mostrar toast error "Esta cuenta no es de cliente", limpiar campos (sin cambiar la ruta). Si es cliente → toast éxito + `navigate("cliente-app")`. Link "¿No tienes cuenta? Registrarme ahora" → `navigate("registro")`. Link "← Volver" → `navigate("landing")`. Caja demo `cliente@fidelix.com` / `cliente123`.
- **`RegisterScreen`** (renombrado de `Register`) — Header con logo "Club de Beneficios QR" + "← Volver" → `navigate("landing")`, **SIN botón admin**. 3 pasos con indicador visual (3 barras emerald). Paso 1 "Elige el tipo de negocio": cards Carwash/Restaurante con color e ícono del `tipoNegocio`. Paso 2 "Selecciona el negocio": lista empresas con logo/ícono, nombre, dirección, horario, badge de # promociones; debajo "Elige una promoción (opcional)" con estrategias activas (nombre, descripción, precio o "Gratis", nota si requiere pago). Paso 3 "Tus datos": nombre *, teléfono *, email * (con nota "Lo usarás para ver tu QR"), contraseña *, fecha de nacimiento (opcional), y campos dinámicos desde `tipoNegocio.camposDef` (marca/modelo/año/color/placa para carwash; preferencia_alimentaria/fecha_cumpleanos para restaurante). Botón final "Completar registro". Al éxito: toast "¡Registro exitoso! Tu QR está listo." + `navigate("cliente-app")`.

### 2. `src/components/fidelix/ClienteShell.tsx` (NUEVO, ~620 líneas)
Shell dedicado para clientes. **No usa AppShell.**

- Header sticky con logo + "Club de Beneficios QR" + "Tu panel de cliente" + nombre user + email + `Badge` "Cliente" + botón logout (vía `logout()` + toast info).
- Sidebar desktop (w-60) + drawer móvil con overlay, navegación: "Mi QR", "Mis empresas", "Historial" usando `setClienteSection`.
- Renderiza según `clienteSection`:
  - **`mi-qr`** (`MiQrView`): carga `/api/clientes`, selector de empresa (chips con color principal de cada empresa), `QrDisplay` con el token del cliente, datos del cliente (tipo, nombre, campos dinámicos). Tarjeta "Beneficio activo" con `colorPrincipal` de la empresa como acento, mostrando progreso/usos según tipo (MEMBRESIA: usos disponibles/consumidos; CONTEO_VISITAS: barra de progreso con metaVisitas; CUPON: % descuento). Badge tipo beneficio vía `TIPOS_BENEFICIO`. Lista de "Otros beneficios activos" si hay más de uno. Estado vacío con CTA "Registrarme en un negocio".
  - **`mis-empresas`** (`MisEmpresasView`): grid de empresas del cliente con color principal, dirección, horario, badges de beneficios activos. Click → `setSelectedClienteId(c.id)` + `setClienteSection("mi-qr")`.
  - **`historial`** (`HistorialView`): lista de transacciones (con scroll vertical `max-h-[calc(100vh-220px)]`), muestra tipo consumo, empresa con color, fecha/hora (`fmtFechaHora`), beneficio aplicado, monto (`fmtMonto`), usos descontados, puntos generados.
- Footer sticky (`mt-auto`) "Club de Beneficios QR · Beneficios exclusivos para nuestros clientes".
- **Adaptación de copy:** donde el `ClientePanel` viejo decía "Estrategia activa" → "Beneficio activo"; "Otras estrategias activas" → "Otros beneficios activos"; "No tienes estrategias activas" → "No tienes beneficios activos". Se eliminó toda mención a "fidelización". Se respetó "Membresía" como tipo de beneficio.

## Decisiones técnicas
- **Sin lenguaje SaaS/fidelización** en toda la UI pública. El único rol visible es "Cliente".
- **Colores:** base slate/zinc; acentos con `colorPrincipal` de cada empresa (vía `style` inline porque los colores vienen de la BD). Emerald como color de marca global para CTAs positivas (registro, beneficios gratis).
- **No usar indigo/blue.** Se reemplazó el viejo `sky-600` por `emerald-600` para CTAs.
- **Responsive:** mobile-first. Sidebar drawer en móvil (`lg:hidden`), sidebar fija en desktop (`hidden lg:flex`). Grids `sm:grid-cols-2 lg:grid-cols-3`.
- **Accessibility:** `aria-label` en botones de icono (logout, menú), labels asociadas a inputs, `alt` en imágenes de logos.
- **Sticky footer** con `min-h-screen flex flex-col` + `mt-auto` en todas las pantallas.
- **ClienteShell no reutiliza ClientePanel** (lo repliqué con copy y estructura nuevas dentro del mismo archivo para mantener todo autocontenido) — el panel viejo sigue existiendo para no romper `AppShell` si aún se referencia.

## Verificación
- `bun run lint` en mis archivos: **0 errores, 0 warnings** (verificado con `npx eslint src/components/fidelix/AuthScreens.tsx src/components/fidelix/ClienteShell.tsx`).
- Los 3 errores restantes en `bun run lint` están en `AdminShell.tsx` (Task 7-B), **no en mis archivos** — por contrato no puedo tocarlos.
- `dev.log` muestra `GET /api/datos-publicos 200` repetido (la Landing está renderizando y cargando datos correctamente), sin errores de runtime.
- AppRoot ya importa correctamente `Landing, RegisterScreen, ClientLogin` desde `./AuthScreens` y `ClienteShell` desde `./ClienteShell` — confirmado en `AppRoot.tsx` líneas 5 y 8.

## Notas para el siguiente agente
- Las pantallas públicas no tienen NINGÚN link al admin. El admin sigue accesible solo vía `#admin-login` / `#admin` (en AppRoot).
- `ClienteShell` define sus propios `SectionHeader` y `EmptyState` locales (no importa de `shared.tsx`) para mantener el archivo autocontenido y evitar dependencias con la UI admin.
- El footer copy es consistente en las 4 pantallas (Landing, ClientLogin, RegisterScreen, ClienteShell): "Club de Beneficios QR · Beneficios exclusivos para nuestros clientes".
