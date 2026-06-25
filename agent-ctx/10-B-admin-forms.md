# Task 10-B — admin-forms (subagent B)

## Objetivo
Anadir campos premium/marketing a los formularios del panel admin (EmpresaForm + BeneficioForm) y un card de prueba social en ConfiguracionManager. Sin tocar logica de negocio ni store/api-client.

## Contexto previo consultado
- `/home/z/my-project/worklog.md` (Tasks 1-9, especialmente Task 9 con contrato backend Config + campos premium/escasez).
- `/home/z/my-project/src/lib/constants.ts` (ESCASEZ_TIPOS).
- `/home/z/my-project/src/components/fidelix/api-client.ts` (tipos Empresa/Estrategia/Config con nuevos campos).
- `/home/z/my-project/src/components/fidelix/panels/EmpresaPanel.tsx` (estructura existente de EmpresaForm, BeneficioForm, ConfiguracionManager).
- `/home/z/my-project/src/components/fidelix/panels/SuperadminPanel.tsx` (estructura existente de SuperadminConfiguracion).
- Registros previos: `/agent-ctx/7-A-frontend-public.md`, `/agent-ctx/7-B-admin-frontend.md`.

## Archivos modificados
1. `src/components/fidelix/panels/EmpresaPanel.tsx`
2. `src/components/fidelix/panels/SuperadminPanel.tsx`

## Cambios por archivo

### EmpresaPanel.tsx
- **Imports**: anadido `ESCASEZ_TIPOS` (constants), `Separator` (ui), `Config` type (api-client), iconos `Star`, `Image as ImageIcon`, `List`, `Flame`, `Save`.
- **Helpers modulo-level nuevos**:
  - `jsonArrayToText(v)` — parsea string JSON o array a texto multilinea para textareas (try/catch defensivo).
  - `textToJsonArrayString(text)` — convierte texto (una linea por elemento) a `JSON.stringify(array)`.
- **EmpresaForm** (exportado, compartido con Superadmin): nueva seccion "Perfil premium (autoridad y prueba social)" despues de "Identidad visual":
  - Calificacion (Input type=number step=0.1 min=0 max=5, ayuda "Calificacion visible en la landing 0-5 estrellas").
  - Switch Destacada ("Marcar como establecimiento destacado, aparece primero en la landing").
  - Servicios (Textarea, una linea por servicio, ayuda "chips en la tarjeta").
  - Galeria (Textarea, una URL por linea, opcional).
  - State init (edit) parsea servicios/galeria con `jsonArrayToText`; create inicializa vacio. `save()` serializa con `textToJsonArrayString` y envia calificacion/servicios/galeria/destacada.
- **BeneficioForm**: nueva seccion "Presentacion en la landing (conversion)" despues de Terminos, con separador border-t:
  - Incluye (Textarea bullets, ayuda "Lista con ticks verdes ... Vende la experiencia").
  - Switch Destacada ("La favorita de nuestros clientes, badge dorado en la landing").
  - Limite de cupos (number, ayuda "0 = ilimitado. Si > 0, se muestra como escasez").
  - Cupos disponibles (number, ayuda "Cupos restantes. Se muestra cuando hay limite").
  - Tipo de escasez (Select con "Ninguna" + 3 `ESCASEZ_TIPOS`, ayuda "Mensaje de urgencia").
  - State init (edit) convierte incluye JSON a texto y normaliza escasezTipo null/empty a "none"; create inicializa vacio/0/"none". `save()` serializa incluye a JSON, mapea "none" a null al enviar.
- **Nuevo componente exportado `SocialProofConfig`**: card con CardTitle "Prueba social (numeros visibles en la landing)" icon Users. `GET /api/config` al montar. Inputs number: Clientes registrados, Promociones utilizadas, Visitas registradas, Negocios participantes, Vehiculos atendidos. Separator. Input text Titulo del hero (placeholder default). Textarea Subtitulo del hero. Boton "Guardar" con icon Save -> `PATCH /api/config`. Toast "Prueba social actualizada".
- **ConfiguracionManager**: ahora renderiza `<SocialProofConfig />` arriba + `<IntegracionesManager />` abajo en `space-y-6`. Descripcion actualizada a "Prueba social, integraciones con sistemas externos y sincronizacion".

### SuperadminPanel.tsx
- **Import anadido**: `SocialProofConfig` desde `./EmpresaPanel` (EmpresaForm ya se importaba; los campos premium se propagan automaticamente).
- **SuperadminConfiguracion**: renderiza `<SocialProofConfig />` arriba (global) + el tab switcher existente (Integraciones/Info) debajo, en `space-y-6`. Descripcion actualizada a "Prueba social global + integraciones y datos de la empresa seleccionada". Las integraciones por empresa siguen accesibles via el tab "Integraciones".

## Verificacion
- `bun run lint` pasa limpio (0 errores, 0 warnings en los 2 archivos modificados). `npx eslint` directo sobre los archivos tambien limpio.
- `GET /api/config` verificado via curl: devuelve `{socialClientes:2500, socialVisitas:5400, socialPromociones:8200, socialNegocios:2, socialVehiculos:1850, heroTitulo:null, heroSubtitulo:null}` — valores que el SocialProofConfig carga al montar.
- Dev server compila sin errores nuevos.

## Reglas respetadas
- No se modifico: store.ts, api-client.ts, AppRoot.tsx, AuthScreens.tsx, ClienteShell.tsx, AdminShell.tsx, AdminLogin.tsx, ScannerFlow.tsx, EmpleadoPanel.tsx.
- Terminos internos admin (beneficios, estrategias, marketing, conversion, escasez) se mantienen en el panel admin (permitidos). No aparecen en la landing publica.
- `'use client'` ya estaba en EmpresaPanel.tsx y SuperadminPanel.tsx.
- Componentes shadcn reutilizados (Card, Button, Input, Label, Textarea, Switch, Select, Separator). Iconos lucide-react.

## Entregable
2 archivos modificados. Worklog Task 10-B anadido a `/home/z/my-project/worklog.md`.
