-- Migration: performance indexes + NOTA_INTERNA audit action
-- Run this in the Supabase SQL editor

-- Index for common filter: memberships by estado (PENDIENTE_PAGO, ACTIVA, etc.)
CREATE INDEX IF NOT EXISTS "memberships_estado_idx" ON "memberships"("estado");

-- Index for common filter: memberships by clienteId
CREATE INDEX IF NOT EXISTS "memberships_clienteId_idx" ON "memberships"("clienteId");

-- Composite index for QR lookup by client + active status (used in buscarPorToken and confirmarVisita)
CREATE INDEX IF NOT EXISTS "qr_tokens_clienteId_activo_idx" ON "qr_tokens"("clienteId", "activo");

-- Add NOTA_INTERNA to AuditAccion enum
ALTER TYPE "AuditAccion" ADD VALUE IF NOT EXISTS 'NOTA_INTERNA';
