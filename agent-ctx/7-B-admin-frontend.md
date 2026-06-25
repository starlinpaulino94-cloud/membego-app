# Task 7-B — Frontend Admin (Agent B)

## Archivos creados/modificados
- **CREADO** `src/components/fidelix/AdminLogin.tsx` — Pantalla de login admin oculta (card centrada, título "Acceso administrativo", subtítulo "Panel interno — solo personal autorizado"). Submit POST /api/auth. Si `user.rol === "CLIENTE"` → toast de error + logout. Sin credenciales demo visibles. Link discreto "← Sitio público" → `navigate("landing")`.
- **CREADO** `src/components/fidelix/AdminShell.tsx` — Header con logo "Club de Beneficios QR" + badge "Panel interno" + nombre/rol del user + botón logout. Sidebar (desktop + drawer móvil) con nav por rol según spec (9 secciones SUPERADMIN, 8 ADMIN_EMPRESA, 2 EMPLEADO). Mapea `adminSection` → panel correspondiente. Footer sticky (`mt-auto`). Lee `useStore().adminSection` y `setAdminSection`. Componente `NavList` extraído fuera del cuerpo del componente para evitar "components created during render".
- **ACTUALIZADO** `src/components/fidelix/panels/SuperadminPanel.tsx` — Reescrito. Dashboard global con 6 métricas: Empresas activas, Clientes registrados, Beneficios activos, Beneficios pendientes de pago, Usos registrados hoy, Transacciones totales (usa `/api/reportes?tipo=general` + agregaciones por empresa para beneficios activos/pendientes/usosHoy). EmpresasManager con CRUD + `EmpresaForm` (importado de EmpresaPanel) con branding completo. EmpresaSelector para secciones que requieren empresa (clientes/beneficios/pagos/usos/configuracion). SuperadminConfiguracion con tabs Integraciones/Info. Renombrado "Estrategias"→"Beneficios" en toda la UI.
- **ACTUALIZADO** `src/components/fidelix/panels/EmpresaPanel.tsx` — Reescrito completo. Exporta `EmpresaPanel`, `EmpresaDashboard`, `ClientesManager`, `BeneficiosManager`, `PagosManager`, `UsosManager`, `ConfiguracionManager`, `EmpresaForm` (para uso desde SuperadminPanel). EmpresaDashboard usa `usosHoy` y `promocionesMasUsadas` del reporte empresa. BeneficiosManager + BeneficioForm con solo 3 tipos (TIPOS_BENEFICIO) y campo `terminos` en todos. UsosManager (renombrado de Historial). ConfiguracionManager = IntegracionesManager (movido a "Configuración"). EmpresaForm con TODOS los campos de branding en 4 secciones: Información básica, Identidad visual (color pickers + hex), Contacto y ubicación, Textos públicos.
- **ACTUALIZADO** `src/components/fidelix/panels/EmpleadoPanel.tsx` — Simplificado. Usa `UsosManager` importado de EmpresaPanel con `empleadoId` para filtrar. Solo 2 secciones: escanear y usos. Rename "Historial"→"Usos registrados".
- **ACTUALIZADO** `src/components/fidelix/panels/ScannerFlow.tsx` — Cambios de copy: "Estrategias"→"Beneficios" (header), "Sin estrategias asignadas"→"Sin beneficios asignados", "Confirmar consumo"→"Confirmar uso" (título del card y botón), "Consumo confirmado"→"Uso confirmado", "Consumo registrado"→"Uso registrado", "Últimos consumos"→"Últimos usos", descripción del header actualizada. Lógica intacta.

## Reglas de no-modificación respetadas
- `store.ts`, `api-client.ts`, `AppRoot.tsx`, `AuthScreens.tsx`, `ClienteShell.tsx` NO fueron tocados. (ClienteShell y AuthScreens son responsabilidad de Agent A; AppRoot ya los importa.)

## Lint
`bun run lint` pasa limpio para mis archivos (sin errores ni warnings). Los únicos errores residuales en `dev.log` son `Module not found: './ClienteShell'` y `'./AdminLogin'`/`'./AdminShell'` que se resolvieron al crear mis archivos — los restantes `./ClienteShell` son responsabilidad de Agent A.

## Decisiones de diseño
- **Estado interno de selección de empresa en SuperadminPanel**: las secciones clientes/beneficios/pagos/usos/configuracion requieren contexto de empresa. Implementé un `EmpresaSelector` interno (no en store) que aparece primero y permite elegir la empresa; el botón "Cambiar empresa" vuelve al selector. La selección se pierde al navegar fuera del módulo.
- **Métricas del Superadmin dashboard**: usosHoy se calcula agregando `usosHoy` de cada reporte empresa + fallback a `transaccionesPorDia` de hoy del reporte general. Beneficios activos y pendientes de pago se suman de los reportes por empresa. Para seed con 2 empresas son solo 2 fetches en paralelo — aceptable.
- **Campo `redesSociales`**: guardado como JSON `{instagram, facebook}` para coincidir con el contrato del backend. En el form, dos inputs separados (Instagram, Facebook) que se combinan al guardar y se parsean al editar.
- **TipoBeneficioBadge**: NO creado; reutilicé `TipoEstrategiaBadge` existente en `shared.tsx` (funciona correctamente porque TIPOS_ESTRATEGIA ahora apunta a TIPOS_BENEFICIO).
- **PUNTOS en ScannerFlow**: dejé el condicional `{e.estrategia.tipoEstrategia === "PUNTOS" && ...}` como dead code (nunca se renderiza porque solo hay 3 tipos). No afecta funcionalidad.

## Pruebas recomendadas (credenciales seed)
- `superadmin@fidelix.com / admin123` → Dashboard global, Empresas (CRUD con branding), Beneficios/Clientes/Pagos/Usos/Configuración (selector empresa → manager).
- `admin.carwash@fidelix.com / admin123` → Dashboard con usosHoy + promocionesMasUsadas, Beneficios (3 tipos + términos), Usos registrados, Configuración (Integraciones).
- `empleado.carwash@fidelix.com / admin123` → Escanear QR, Usos registrados (propios).
