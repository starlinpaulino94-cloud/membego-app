-- F4.4: notas internas del CRM por cliente.
CREATE TABLE "cliente_notas" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "clienteId" TEXT NOT NULL,
  "autorId" TEXT,
  "texto" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cliente_notas_clienteId_fkey" FOREIGN KEY ("clienteId")
    REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "cliente_notas_autorId_fkey" FOREIGN KEY ("autorId")
    REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "cliente_notas_clienteId_createdAt_idx" ON "cliente_notas"("clienteId", "createdAt");
