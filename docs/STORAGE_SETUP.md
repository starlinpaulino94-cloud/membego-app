# Supabase Storage — setup y diagnóstico de subida de imágenes

Corrige el error **"No se pudo subir la imagen"** (avatares, logos, comprobantes,
galería). El código de subida es correcto; el fallo está del lado de Supabase
Storage.

## Cómo aplicarlo

1. Abre el **SQL Editor** de tu proyecto en Supabase.
2. Pega y ejecuta `prisma/migrations_manual/2026-07-storage-buckets.sql`.
3. Reintenta subir una imagen en la app.

El script es idempotente: crea los buckets `avatars`, `logos` y `comprobantes`
como públicos y añade las políticas RLS que permiten a un usuario autenticado
subir/reemplazar y a cualquiera leer. Correrlo varias veces no hace daño.

## Por qué fallaba

Las subidas se hacen **desde el navegador** con la sesión del usuario (rol
`authenticated`, key anónima). Para que `.upload()` funcione hacen falta tres
cosas en Supabase, y basta con que falte una para ver el error genérico:

| Causa | Síntoma en la pestaña Network / Console | Lo arregla el script |
|-------|------------------------------------------|----------------------|
| El bucket no existe | `400 Bucket not found` | Sí (crea los 3 buckets) |
| Falta política de INSERT/UPDATE para `authenticated` | `403 new row violates row-level security policy` | Sí (políticas 2b/2c) |
| El bucket no es público | La subida funciona pero la imagen no carga después | Sí (`public = true` + política 2a) |

Para confirmar cuál fue, abre DevTools → **Network**, reintenta la subida y mira
la petición a `.../storage/v1/object/...`: el código (`400` vs `403`) indica la
causa exacta. Ya no es necesario para arreglarlo — el script cubre las tres —
pero sirve para verificar.

## Nota de seguridad (comprobantes)

El bucket `comprobantes` queda **público** porque el código usa `getPublicUrl()`
para mostrarlos. Esto significa que cualquiera con la URL exacta puede ver un
comprobante de pago. Es aceptable a corto plazo (las URLs no son adivinables),
pero si se quiere endurecer, el paso siguiente es hacer ese bucket privado y
servirlo con URLs firmadas (`createSignedUrl`) — requiere un pequeño cambio de
código en `ComprobanteForm.tsx` y `ReportarProblemaForm.tsx`.
