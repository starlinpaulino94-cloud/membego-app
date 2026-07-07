-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('SUPERADMIN', 'ADMIN_EMPRESA', 'EMPLEADO', 'CLIENTE', 'ADMINISTRADOR', 'GERENTE', 'CAJERO', 'RECEPCION');

-- CreateEnum
CREATE TYPE "NotifTipo" AS ENUM ('PAGO_APROBADO', 'PAGO_RECHAZADO', 'NUEVO_COMPROBANTE', 'MEMBRESIA_POR_VENCER', 'MEMBRESIA_ACTIVADA', 'PROMOCION_NUEVA', 'RECOMPENSA_REFERIDO', 'SISTEMA', 'TICKET_NUEVO', 'TICKET_RESPUESTA', 'TICKET_ACTUALIZADO');

-- CreateEnum
CREATE TYPE "TicketEstado" AS ENUM ('NUEVO', 'EN_PROCESO', 'ESPERANDO_CLIENTE', 'RESUELTO', 'CERRADO');

-- CreateEnum
CREATE TYPE "TicketCategoria" AS ENUM ('PAGO', 'MEMBRESIA', 'BENEFICIOS', 'APP', 'OTRO');

-- CreateEnum
CREATE TYPE "TicketAutor" AS ENUM ('CLIENTE', 'ADMIN', 'SISTEMA');

-- CreateEnum
CREATE TYPE "MembershipEstado" AS ENUM ('PENDIENTE', 'PENDIENTE_PAGO', 'RECHAZADA', 'ACTIVA', 'VENCIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "MetodoPagoTipo" AS ENUM ('TRANSFERENCIA', 'PRESENCIAL');

-- CreateEnum
CREATE TYPE "AuditAccion" AS ENUM ('VISITA_CONFIRMADA', 'PAGO_APROBADO', 'PAGO_RECHAZADO', 'MEMBRESIA_CANCELADA', 'MEMBRESIA_RENOVADA', 'QR_GENERADO', 'QR_USADO', 'COMPROBANTE_IMPRESO', 'REFERIDO_COMPLETADO', 'RECOMPENSA_OTORGADA', 'NOTA_INTERNA');

-- CreateEnum
CREATE TYPE "ReferidoEstado" AS ENUM ('PENDIENTE', 'COMPLETADO');

-- CreateEnum
CREATE TYPE "CondicionRecompensa" AS ENUM ('N_REFERIDOS_COMPLETADOS');

-- CreateEnum
CREATE TYPE "TipoRecompensa" AS ENUM ('LAVADOS_GRATIS', 'DESCUENTO_PORCENTAJE', 'DESCUENTO_MONTO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AppRole" NOT NULL DEFAULT 'CLIENTE',
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "categoria" TEXT,
    "website" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER,
    "bannerUrl" TEXT,
    "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "provincia" TEXT,
    "pais" TEXT,
    "whatsapp" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "tiktok" TEXT,
    "googleMapsUrl" TEXT,
    "totalMembersCount" INTEGER NOT NULL DEFAULT 0,
    "activePromotionsCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DECIMAL(3,2),

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sucursales" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sucursales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "tipo" "MetodoPagoTipo" NOT NULL,
    "nombre" TEXT NOT NULL,
    "titular" TEXT,
    "numeroCuenta" TEXT,
    "tipoCuenta" TEXT,
    "instrucciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promociones" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagenUrl" TEXT,
    "vigenciaDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenciaHasta" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "publicadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'general',
    "descuento" INTEGER,
    "codigo" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "promociones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "lavadosIncluidos" INTEGER NOT NULL DEFAULT 0,
    "esIlimitado" BOOLEAN NOT NULL DEFAULT false,
    "descripcion" TEXT,
    "beneficios" TEXT[],
    "vigenciaDias" INTEGER NOT NULL DEFAULT 30,
    "condiciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "avatarUrl" TEXT,
    "codigoReferido" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referidos" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "referenteClienteId" TEXT NOT NULL,
    "referidoClienteId" TEXT NOT NULL,
    "estado" "ReferidoEstado" NOT NULL DEFAULT 'PENDIENTE',
    "recompensaAplicada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completadoEn" TIMESTAMP(3),

    CONSTRAINT "referidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reglas_recompensa" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "condicion" "CondicionRecompensa" NOT NULL,
    "valorCondicion" INTEGER NOT NULL,
    "tipoRecompensa" "TipoRecompensa" NOT NULL,
    "valorRecompensa" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reglas_recompensa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_config" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "codigoPais" TEXT NOT NULL DEFAULT '+1',
    "numero" TEXT NOT NULL,
    "mensajePlantilla" TEXT NOT NULL DEFAULT 'Hola, quisiera más información.',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "correoSoporte" TEXT,
    "horaInicio" TEXT,
    "horaCierre" TEXT,
    "diasLaborales" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_items" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "categoria" "TicketCategoria" NOT NULL DEFAULT 'OTRO',
    "estado" "TicketEstado" NOT NULL DEFAULT 'NUEVO',
    "adjuntoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_mensajes" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "autorTipo" "TicketAutor" NOT NULL,
    "autorNombre" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "esNotaInterna" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "placa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "userId" TEXT,
    "metodoPagoId" TEXT,
    "estado" "MembershipEstado" NOT NULL DEFAULT 'PENDIENTE',
    "comprobanteUrl" TEXT,
    "comprobanteNota" TEXT,
    "rechazadoReason" TEXT,
    "adminNota" TEXT,
    "pagoConfirmado" BOOLEAN NOT NULL DEFAULT false,
    "montoPagado" DECIMAL(10,2),
    "fechaInicio" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "lavadosRestantes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_tokens" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "membresiaId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "vehiculoId" TEXT,
    "membershipId" TEXT NOT NULL,
    "sucursalId" TEXT,
    "empleadoId" TEXT,
    "servicio" TEXT NOT NULL,
    "descontado" BOOLEAN NOT NULL DEFAULT false,
    "fechaVisita" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comprobantes" (
    "id" TEXT NOT NULL,
    "visitId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "impresiones" INTEGER NOT NULL DEFAULT 0,
    "ultimaImpresion" TIMESTAMP(3),
    "creadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comprobantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "userId" TEXT,
    "accion" "AuditAccion" NOT NULL,
    "entidadTipo" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" "NotifTipo" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "href" TEXT,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_to_categories" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_to_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_ratings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseId_key" ON "users"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_companyId_idx" ON "users"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE INDEX "companies_isPublished_isFeatured_idx" ON "companies"("isPublished", "isFeatured");

-- CreateIndex
CREATE INDEX "companies_ciudad_provincia_idx" ON "companies"("ciudad", "provincia");

-- CreateIndex
CREATE INDEX "companies_type_idx" ON "companies"("type");

-- CreateIndex
CREATE INDEX "companies_createdAt_idx" ON "companies"("createdAt");

-- CreateIndex
CREATE INDEX "promociones_companyId_activo_idx" ON "promociones"("companyId", "activo");

-- CreateIndex
CREATE INDEX "promociones_isFeatured_vigenciaHasta_idx" ON "promociones"("isFeatured", "vigenciaHasta");

-- CreateIndex
CREATE INDEX "promociones_tipo_idx" ON "promociones"("tipo");

-- CreateIndex
CREATE INDEX "promociones_createdAt_idx" ON "promociones"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_codigoReferido_key" ON "clientes"("codigoReferido");

-- CreateIndex
CREATE INDEX "clientes_companyId_idx" ON "clientes"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_supabaseId_companyId_key" ON "clientes"("supabaseId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "referidos_referidoClienteId_key" ON "referidos"("referidoClienteId");

-- CreateIndex
CREATE INDEX "referidos_companyId_referenteClienteId_idx" ON "referidos"("companyId", "referenteClienteId");

-- CreateIndex
CREATE INDEX "reglas_recompensa_companyId_activo_idx" ON "reglas_recompensa"("companyId", "activo");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_config_companyId_key" ON "whatsapp_config"("companyId");

-- CreateIndex
CREATE INDEX "faq_items_companyId_activo_idx" ON "faq_items"("companyId", "activo");

-- CreateIndex
CREATE INDEX "support_tickets_companyId_estado_idx" ON "support_tickets"("companyId", "estado");

-- CreateIndex
CREATE INDEX "support_tickets_clienteId_idx" ON "support_tickets"("clienteId");

-- CreateIndex
CREATE INDEX "ticket_mensajes_ticketId_idx" ON "ticket_mensajes"("ticketId");

-- CreateIndex
CREATE INDEX "vehiculos_clienteId_idx" ON "vehiculos"("clienteId");

-- CreateIndex
CREATE INDEX "memberships_estado_idx" ON "memberships"("estado");

-- CreateIndex
CREATE INDEX "memberships_clienteId_idx" ON "memberships"("clienteId");

-- CreateIndex
CREATE INDEX "memberships_companyId_idx" ON "memberships"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_clienteId_companyId_key" ON "memberships"("clienteId", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "qr_tokens_token_key" ON "qr_tokens"("token");

-- CreateIndex
CREATE INDEX "qr_tokens_clienteId_activo_idx" ON "qr_tokens"("clienteId", "activo");

-- CreateIndex
CREATE INDEX "qr_tokens_membresiaId_idx" ON "qr_tokens"("membresiaId");

-- CreateIndex
CREATE INDEX "visits_clienteId_idx" ON "visits"("clienteId");

-- CreateIndex
CREATE INDEX "visits_membershipId_idx" ON "visits"("membershipId");

-- CreateIndex
CREATE INDEX "visits_fechaVisita_idx" ON "visits"("fechaVisita");

-- CreateIndex
CREATE UNIQUE INDEX "comprobantes_visitId_key" ON "comprobantes"("visitId");

-- CreateIndex
CREATE UNIQUE INDEX "comprobantes_numero_key" ON "comprobantes"("numero");

-- CreateIndex
CREATE INDEX "audit_logs_companyId_idx" ON "audit_logs"("companyId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_accion_idx" ON "audit_logs"("accion");

-- CreateIndex
CREATE INDEX "audit_logs_entidadTipo_entidadId_idx" ON "audit_logs"("entidadTipo", "entidadId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "notificaciones_userId_leida_idx" ON "notificaciones"("userId", "leida");

-- CreateIndex
CREATE INDEX "notificaciones_userId_createdAt_idx" ON "notificaciones"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "business_categories_name_key" ON "business_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "business_categories_slug_key" ON "business_categories"("slug");

-- CreateIndex
CREATE INDEX "business_categories_active_order_idx" ON "business_categories"("active", "order");

-- CreateIndex
CREATE INDEX "company_to_categories_companyId_idx" ON "company_to_categories"("companyId");

-- CreateIndex
CREATE INDEX "company_to_categories_categoryId_idx" ON "company_to_categories"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "company_to_categories_companyId_categoryId_key" ON "company_to_categories"("companyId", "categoryId");

-- CreateIndex
CREATE INDEX "company_ratings_companyId_idx" ON "company_ratings"("companyId");

-- CreateIndex
CREATE INDEX "company_ratings_rating_idx" ON "company_ratings"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "company_ratings_companyId_clienteId_key" ON "company_ratings"("companyId", "clienteId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sucursales" ADD CONSTRAINT "sucursales_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metodos_pago" ADD CONSTRAINT "metodos_pago_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promociones" ADD CONSTRAINT "promociones_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referidos" ADD CONSTRAINT "referidos_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referidos" ADD CONSTRAINT "referidos_referenteClienteId_fkey" FOREIGN KEY ("referenteClienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referidos" ADD CONSTRAINT "referidos_referidoClienteId_fkey" FOREIGN KEY ("referidoClienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reglas_recompensa" ADD CONSTRAINT "reglas_recompensa_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_config" ADD CONSTRAINT "whatsapp_config_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq_items" ADD CONSTRAINT "faq_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_mensajes" ADD CONSTRAINT "ticket_mensajes_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehiculos" ADD CONSTRAINT "vehiculos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "metodos_pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_tokens" ADD CONSTRAINT "qr_tokens_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_tokens" ADD CONSTRAINT "qr_tokens_membresiaId_fkey" FOREIGN KEY ("membresiaId") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "sucursales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobantes" ADD CONSTRAINT "comprobantes_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobantes" ADD CONSTRAINT "comprobantes_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobantes" ADD CONSTRAINT "comprobantes_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_to_categories" ADD CONSTRAINT "company_to_categories_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_to_categories" ADD CONSTRAINT "company_to_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "business_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_ratings" ADD CONSTRAINT "company_ratings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_ratings" ADD CONSTRAINT "company_ratings_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

