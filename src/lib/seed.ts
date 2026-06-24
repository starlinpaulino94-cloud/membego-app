import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// Seed idempotente: crea tipos de negocio, empresas, estrategias, usuarios y cliente de prueba.
export async function runSeed(): Promise<{ seeded: boolean; message: string }> {
  const existing = await db.tipoNegocio.count();
  if (existing > 0) return { seeded: false, message: "La base de datos ya tiene datos. Seed omitido." };

  // 1. Tipos de negocio
  const carwash = await db.tipoNegocio.create({
    data: {
      nombre: "Carwash",
      slug: "carwash",
      descripcion: "Lavado de vehículos y detallado automotriz",
      icono: "Car",
      color: "#0ea5e9",
      camposDef: {
        create: [
          { clave: "marca", etiqueta: "Marca del vehículo", tipo: "text", requerido: true, orden: 1 },
          { clave: "modelo", etiqueta: "Modelo", tipo: "text", requerido: true, orden: 2 },
          { clave: "anio", etiqueta: "Año", tipo: "number", requerido: false, orden: 3 },
          { clave: "color", etiqueta: "Color", tipo: "text", requerido: false, orden: 4 },
          { clave: "placa", etiqueta: "Placa", tipo: "text", requerido: true, orden: 5 },
        ],
      },
    },
  });

  const restaurante = await db.tipoNegocio.create({
    data: {
      nombre: "Restaurante",
      slug: "restaurante",
      descripcion: "Restaurantes y comedores",
      icono: "UtensilsCrossed",
      color: "#f97316",
      camposDef: {
        create: [
          { clave: "preferencias", etiqueta: "Preferencias alimenticias", tipo: "textarea", requerido: false, orden: 1 },
          { clave: "frecuencia", etiqueta: "Frecuencia de visita", tipo: "select", requerido: false, orden: 2, opciones: JSON.stringify(["Diaria", "Semanal", "Quincenal", "Mensual"]) },
          { clave: "mesa_favorita", etiqueta: "Mesa favorita (opcional)", tipo: "text", requerido: false, orden: 3 },
        ],
      },
    },
  });

  // 2. Empresas
  const empCarwash = await db.empresa.create({
    data: {
      nombre: "AutoBrillo Carwash",
      tipoNegocioId: carwash.id,
      telefono: "809-555-0100",
      direccion: "Av. 27 de Febrero #100, Santiago",
      estado: "ACTIVA",
      configuracion: JSON.stringify({ horario: "Lun-Dom 8:00-20:00" }),
    },
  });
  const empRestaurante = await db.empresa.create({
    data: {
      nombre: "Sabor Dominicano",
      tipoNegocioId: restaurante.id,
      telefono: "809-555-0200",
      direccion: "Calle El Sol #45, Santo Domingo",
      estado: "ACTIVA",
      configuracion: JSON.stringify({ horario: "Lun-Dom 11:00-23:00" }),
    },
  });

  // 3. Usuarios
  const superadmin = await db.user.create({
    data: { email: "superadmin@fidelix.com", password: hashPassword("admin123"), nombre: "Super Admin", rol: "SUPERADMIN", telefono: "809-000-0000" },
  });
  const adminCarwash = await db.user.create({
    data: { email: "admin.carwash@fidelix.com", password: hashPassword("admin123"), nombre: "Carlos Lavado", rol: "ADMIN_EMPRESA", empresaId: empCarwash.id, telefono: "809-111-1111" },
  });
  const adminRestaurante = await db.user.create({
    data: { email: "admin.restaurante@fidelix.com", password: hashPassword("admin123"), nombre: "María Sabor", rol: "ADMIN_EMPRESA", empresaId: empRestaurante.id, telefono: "809-222-2222" },
  });
  const empleadoCarwash = await db.user.create({
    data: { email: "empleado.carwash@fidelix.com", password: hashPassword("admin123"), nombre: "Juan Esponja", rol: "EMPLEADO", empresaId: empCarwash.id, telefono: "809-333-3333" },
  });
  const empleadoRestaurante = await db.user.create({
    data: { email: "empleado.restaurante@fidelix.com", password: hashPassword("admin123"), nombre: "Luisa Mesera", rol: "EMPLEADO", empresaId: empRestaurante.id, telefono: "809-444-4444" },
  });
  const clienteUser = await db.user.create({
    data: { email: "cliente@fidelix.com", password: hashPassword("cliente123"), nombre: "Pedro Cliente", rol: "CLIENTE", telefono: "809-555-5555" },
  });
  const clienteUser2 = await db.user.create({
    data: { email: "ana@fidelix.com", password: hashPassword("cliente123"), nombre: "Ana Comensal", rol: "CLIENTE", telefono: "809-666-6666" },
  });

  // 4. Estrategias Carwash
  const estrSilver = await db.estrategia.create({
    data: { empresaId: empCarwash.id, tipoNegocioId: carwash.id, nombre: "Membresía Silver", tipoEstrategia: "MEMBRESIA", descripcion: "4 lavados básicos al mes incluidos", requierePago: true, precio: 999, duracionDias: 30, cantidadUsos: 4, estado: "ACTIVA" },
  });
  const estrGold = await db.estrategia.create({
    data: { empresaId: empCarwash.id, tipoNegocioId: carwash.id, nombre: "Membresía Gold", tipoEstrategia: "MEMBRESIA", descripcion: "4 lavados premium al mes incluidos", requierePago: true, precio: 1499, duracionDias: 30, cantidadUsos: 4, estado: "ACTIVA" },
  });
  const estrConteoCar = await db.estrategia.create({
    data: { empresaId: empCarwash.id, tipoNegocioId: carwash.id, nombre: "Lava 5 y la 6ta GRATIS", tipoEstrategia: "CONTEO_VISITAS", descripcion: "Acumula 5 lavados y el 6to es gratis", requierePago: false, duracionDias: 365, metaVisitas: 6, descuentoPct: 100, recompensa: "6to lavado gratis", estado: "ACTIVA" },
  });
  const estrPuntosCar = await db.estrategia.create({
    data: { empresaId: empCarwash.id, tipoNegocioId: carwash.id, nombre: "Puntos AutoBrillo", tipoEstrategia: "PUNTOS", descripcion: "Gana 10 puntos por lavado + 1 punto por cada RD$100", requierePago: false, duracionDias: 365, puntosPorConsumo: 10, puntosPorMonto: 100, estado: "ACTIVA" },
  });

  // 5. Estrategias Restaurante
  const estrAlmuerzo = await db.estrategia.create({
    data: { empresaId: empRestaurante.id, tipoNegocioId: restaurante.id, nombre: "Almuerzo Ejecutivo", tipoEstrategia: "MEMBRESIA", descripcion: "5 almuerzos al mes incluidos", requierePago: true, precio: 1999, duracionDias: 30, cantidadUsos: 5, estado: "ACTIVA" },
  });
  const estrConteoRest = await db.estrategia.create({
    data: { empresaId: empRestaurante.id, tipoNegocioId: restaurante.id, nombre: "Compra 5 y la 6ta 50% descuento", tipoEstrategia: "CONTEO_VISITAS", descripcion: "Acumula 5 comidas y la 6ta con 50% de descuento", requierePago: false, duracionDias: 365, metaVisitas: 6, descuentoPct: 50, recompensa: "50% de descuento", estado: "ACTIVA" },
  });
  const estrCuponRest = await db.estrategia.create({
    data: { empresaId: empRestaurante.id, tipoNegocioId: restaurante.id, nombre: "Cupón 10% próxima visita", tipoEstrategia: "CUPON", descripcion: "10% de descuento en tu próxima compra", requierePago: false, duracionDias: 30, descuentoPct: 10, estado: "ACTIVA" },
  });
  const estrPuntosRest = await db.estrategia.create({
    data: { empresaId: empRestaurante.id, tipoNegocioId: restaurante.id, nombre: "Puntos Sabor", tipoEstrategia: "PUNTOS", descripcion: "5 puntos por consumo + 1 punto por cada RD$100", requierePago: false, duracionDias: 365, puntosPorConsumo: 5, puntosPorMonto: 100, estado: "ACTIVA" },
  });
  const estrPromoRest = await db.estrategia.create({
    data: { empresaId: empRestaurante.id, tipoNegocioId: restaurante.id, nombre: "Promo Mitad de Mes", tipoEstrategia: "PROMOCION_TIEMPO", descripcion: "15% de descuento del 1 al 15 del mes", requierePago: false, duracionDias: 15, descuentoPct: 15, fechaInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), fechaFin: new Date(new Date().getFullYear(), new Date().getMonth(), 15, 23, 59), estado: "ACTIVA" },
  });

  // 6. Clientes de prueba
  const clientePedro = await db.cliente.create({
    data: {
      userId: clienteUser.id,
      nombre: "Pedro Cliente",
      telefono: "809-555-5555",
      email: "cliente@fidelix.com",
      fechaNacimiento: new Date("1990-05-15"),
      empresaId: empCarwash.id,
      tipoNegocioId: carwash.id,
      estado: "ACTIVO",
      camposDinamicos: {
        create: [
          { clave: "marca", valor: "Toyota" },
          { clave: "modelo", valor: "Corolla" },
          { clave: "anio", valor: "2021" },
          { clave: "color", valor: "Blanco" },
          { clave: "placa", valor: "A123456" },
        ],
      },
    },
  });
  const clienteAna = await db.cliente.create({
    data: {
      userId: clienteUser2.id,
      nombre: "Ana Comensal",
      telefono: "809-666-6666",
      email: "ana@fidelix.com",
      fechaNacimiento: new Date("1995-09-20"),
      empresaId: empRestaurante.id,
      tipoNegocioId: restaurante.id,
      estado: "ACTIVO",
      camposDinamicos: { create: [{ clave: "preferencias", valor: "Vegetariana" }, { clave: "frecuencia", valor: "Semanal" }] },
    },
  });

  // QRs
  const { randomUUID } = await import("crypto");
  await db.qrToken.create({ data: { clienteId: clientePedro.id, empresaId: empCarwash.id, token: randomUUID(), activo: true } });
  await db.qrToken.create({ data: { clienteId: clienteAna.id, empresaId: empRestaurante.id, token: randomUUID(), activo: true } });

  // Asignar membresía Silver ACTIVA a Pedro (pago confirmado) + estrategia de conteo
  await db.clienteEstrategia.create({
    data: {
      clienteId: clientePedro.id, estrategiaId: estrSilver.id, empresaId: empCarwash.id, estado: "ACTIVA",
      fechaInicio: new Date(), fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usosDisponibles: 2, usosConsumidos: 2, pagoConfirmado: true, montoPagado: 999,
    },
  });
  await db.clienteEstrategia.create({
    data: { clienteId: clientePedro.id, estrategiaId: estrConteoCar.id, empresaId: empCarwash.id, estado: "ACTIVA", fechaInicio: new Date(), fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), visitasAcumuladas: 3 },
  });
  // Ana: membresía almuerzo pendiente de pago
  await db.clienteEstrategia.create({
    data: { clienteId: clienteAna.id, estrategiaId: estrAlmuerzo.id, empresaId: empRestaurante.id, estado: "PENDIENTE", pagoConfirmado: false, montoPagado: 0 },
  });

  // Transacciones de historial para Pedro
  await db.transaccion.create({ data: { clienteId: clientePedro.id, empresaId: empCarwash.id, estrategiaId: estrSilver.id, tipoConsumo: "Lavado básico", montoConsumo: 0, beneficioAplicado: "Incluido en membresía (Membresía Silver)", usosDescontados: 1, empleadoId: empleadoCarwash.id, fechaTransaccion: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) } });
  await db.transaccion.create({ data: { clienteId: clientePedro.id, empresaId: empCarwash.id, estrategiaId: estrSilver.id, tipoConsumo: "Lavado básico", montoConsumo: 0, beneficioAplicado: "Incluido en membresía (Membresía Silver)", usosDescontados: 1, empleadoId: empleadoCarwash.id, fechaTransaccion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } });

  // 7. Integraciones de ejemplo (webhook a URL de prueba)
  await db.integracion.create({
    data: { empresaId: empCarwash.id, tipoIntegracion: "WEBHOOK", webhookUrl: "https://httpbin.org/post", apiKey: "fx_key_carwash_123", tokenSecreto: "fx_secret_carwash", eventos: JSON.stringify(["CLIENTE_CREADO", "VISITA_REGISTRADA", "MEMBRESIA_ACTIVADA", "PAGO_CONFIRMADO"]), estado: "ACTIVA", ultimaSincronizacion: new Date() },
  });
  await db.integracion.create({
    data: { empresaId: empRestaurante.id, tipoIntegracion: "API_REST", apiUrl: "https://httpbin.org/post", apiKey: "fx_key_rest_123", tokenSecreto: "fx_secret_rest", eventos: JSON.stringify(["CLIENTE_CREADO", "BENEFICIO_USADO", "VISITA_REGISTRADA"]), estado: "ACTIVA" },
  });

  void superadmin; void adminCarwash; void adminRestaurante; void estrGold; void estrPuntosCar; void estrConteoRest; void estrCuponRest; void estrPuntosRest; void estrPromoRest;

  return { seeded: true, message: "Seed completado: 2 tipos de negocio, 2 empresas, estrategias, 7 usuarios y 2 clientes de prueba." };
}
