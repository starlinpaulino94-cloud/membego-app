-- Sincroniza el enum "AppRole" de la base de datos con los roles definidos en
-- el código (src/types.ts). El esquema base creó "AppRole" con 4 valores
-- (SUPERADMIN, ADMIN_EMPRESA, EMPLEADO, CLIENTE), pero la aplicación referencia
-- 4 roles de equipo adicionales. Intentar guardar esos roles fallaba con
-- "invalid input value for enum AppRole".
--
-- Los valores se agregan al final del enum. Todo es aditivo e idempotente
-- (IF NOT EXISTS), por lo que es seguro reejecutar y no afecta datos existentes.
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'ADMINISTRADOR';
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'GERENTE';
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'CAJERO';
ALTER TYPE "AppRole" ADD VALUE IF NOT EXISTS 'RECEPCION';
