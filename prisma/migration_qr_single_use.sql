-- Migration: support single-use dynamic QR codes
-- Run this in the Supabase SQL editor

ALTER TYPE "AuditAccion" ADD VALUE 'QR_USADO';
