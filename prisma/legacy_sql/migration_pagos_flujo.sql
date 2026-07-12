-- Migration: improve payment flow (admin notes + request new evidence)
-- Run this in the Supabase SQL editor

ALTER TABLE "memberships" ADD COLUMN IF NOT EXISTS "adminNota" TEXT;
