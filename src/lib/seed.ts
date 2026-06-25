import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

// Seed idempotente: crea tipos de negocio, empresas con branding, beneficios, usuarios y clientes de prueba.
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
          { clave: "preferencia_alimentaria", etiqueta: "Preferencia alimentaria (opcional)", tipo: "textarea", requerido: false, orden: 1 },
          { clave: "fecha_cumpleanos", etiqueta: "Fecha de cumpleaños (opcional)", tipo: "date", requerido: false, orden: 2 },
        ],
      },
    },
  });

  // 2. Empresas con identidad propia
  const empCarwash = await db.empresa.create({
    data: {
      nombre: "CARTOWN Wash & Detailing",
      tipoNegocioId: carwash.id,
      telefono: "809-555-0100",
      whatsapp: "809-555-0100",
      direccion: "Av. 27 de Febrero #100",
      ciudad: "Santiago",
      colorPrincipal: "#1e40af",
      colorSecundario: "#0ea5e9",
      descripcionPublica: "El mejor lavado y detallado de vehículos de la ciudad. Servicios básicos, premium y especializados con productos de alta calidad.",
      horario: "Lun a Dom · 8:00 AM - 8:00 PM",
      redesSociales: JSON.stringify({ instagram: "@cartown.do", facebook: "CARTOWNdo" }),
      textoBienvenida: "¡Bienvenido a CARTOWN! Cuida tu vehículo con nosotros y aprovecha beneficios exclusivos.",
      terminosCondiciones: "Los beneficios son personales e intransferibles. Vence según la duración del plan.",
      estado: "ACTIVA",
    },
  });
  const empRestaurante = await db.empresa.create({
    data: {
      nombre: "Sabor Dominicano",
      tipoNegocioId: restaurante.id,
      telefono: "809-555-0200",
      whatsapp: "809-555-0200",
      direccion: "Calle El Sol #45",
      ciudad: "Santo Domingo",
      colorPrincipal: "#ea580c",
      colorSecundario: "#f97316",
      descripcionPublica: "Auténtica comida dominicana. Almuerzos ejecutivos, desayunos y cenas en un ambiente familiar.",
      horario: "Lun a Dom · 11:00 AM - 11:00 PM",
      redesSociales: JSON.stringify({ instagram: "@sabordominicano", facebook: "SaborDominicanoDO" }),
      textoBienvenida: "¡Disfruta el verdadero sabor dominano! Te esperamos con beneficios especiales.",
      terminosCondiciones: "Las promociones aplican solo en el local. No acumulable con otras ofertas.",
      estado: "ACTIVA",
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

  // 4. Beneficios Carwash (solo Membresía, Conteo, Cupón)
  const benSilver = await db.estrategia.create({
    data: { empresaId: empCarwash.id, tipoNegocioId: carwash.id, nombre: "Plan Silver", tipoEstrategia: "MEMBRESIA", descripcion: "Incluye 4 lavados básicos al mes", requierePago: true, precio: 999, duracionDias: 30, cantidadUsos: 4, terminos: "Válido por 30 días. Solo lavado básico. Intransferible.", estado: "ACTIVA" },
  });
  const benGold = await db.estrategia.create({
    data: { empresaId: empCarwash.id, tipoNegocioId: carwash.id, nombre: "Plan Gold", tipoEstrategia: "MEMBRESIA", descripcion: "Incluye 4 lavados premium al mes", requierePago: true, precio: 1499, duracionDias: 30, cantidadUsos: 4, terminos: "Válido por 30 días. Solo lavado premium. Intransferible.", estado: "ACTIVA" },
  });
  const benConteoCar = await db.estrategia.create({
    data: { empresaId: empCarwash.id, tipoNegocioId: carwash.id, nombre: "Lava 5 y la 6ta GRATIS", tipoEstrategia: "CONTEO_VISITAS", descripcion: "Acumula 5 lavados y el 6to es gratis", requierePago: false, duracionDias: 365, metaVisitas: 6, descuentoPct: 100, recompensa: "6to lavado gratis", terminos: "Válido por 1 año. El lavado gratis aplica al servicio básico.", estado: "ACTIVA" },
  });

  // 5. Beneficios Restaurante
  const benAlmuerzo = await db.estrategia.create({
    data: { empresaId: empRestaurante.id, tipoNegocioId: restaurante.id, nombre: "Almuerzo Ejecutivo", tipoEstrategia: "MEMBRESIA", descripcion: "Incluye 5 almuerzos al mes", requierePago: true, precio: 1999, duracionDias: 30, cantidadUsos: 5, terminos: "Válido por 30 días. Menú ejecutivo de lunes a viernes.", estado: "ACTIVA" },
  });
  const benConteoRest = await db.estrategia.create({
    data: { empresaId: empRestaurante.id, tipoNegocioId: restaurante.id, nombre: "Compra 5 y la 6ta 50% descuento", tipoEstrategia: "CONTEO_VISITAS", descripcion: "Acumula 5 comidas y la 6ta con 50% de descuento", requierePago: false, duracionDias: 365, metaVisitas: 6, descuentoPct: 50, recompensa: "50% de descuento", terminos: "Válido por 1 año. Descuento sobre el plato de menor valor.", estado: "ACTIVA" },
  });
  const benCuponRest = await db.estrategia.create({
    data: { empresaId: empRestaurante.id, tipoNegocioId: restaurante.id, nombre: "Cupón 10% próxima visita", tipoEstrategia: "CUPON", descripcion: "10% de descuento en tu próxima visita", requierePago: false, duracionDias: 30, cantidadUsos: 1, descuentoPct: 10, terminos: "Un solo uso. Vence en 30 días. No acumulable.", estado: "ACTIVA" },
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
      camposDinamicos: { create: [{ clave: "preferencia_alimentaria", valor: "Vegetariana" }, { clave: "fecha_cumpleanos", valor: "1995-09-20" }] },
    },
  });

  // QRs
  const { randomUUID } = await import("crypto");
  await db.qrToken.create({ data: { clienteId: clientePedro.id, empresaId: empCarwash.id, token: randomUUID(), activo: true } });
  await db.qrToken.create({ data: { clienteId: clienteAna.id, empresaId: empRestaurante.id, token: randomUUID(), activo: true } });

  // Asignar Plan Silver ACTIVO a Pedro (pago confirmado) + conteo
  await db.clienteEstrategia.create({
    data: {
      clienteId: clientePedro.id, estrategiaId: benSilver.id, empresaId: empCarwash.id, estado: "ACTIVA",
      fechaInicio: new Date(), fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usosDisponibles: 2, usosConsumidos: 2, pagoConfirmado: true, montoPagado: 999,
    },
  });
  await db.clienteEstrategia.create({
    data: { clienteId: clientePedro.id, estrategiaId: benConteoCar.id, empresaId: empCarwash.id, estado: "ACTIVA", fechaInicio: new Date(), fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), visitasAcumuladas: 3 },
  });
  // Ana: Almuerzo Ejecutivo pendiente de pago
  await db.clienteEstrategia.create({
    data: { clienteId: clienteAna.id, estrategiaId: benAlmuerzo.id, empresaId: empRestaurante.id, estado: "PENDIENTE", pagoConfirmado: false, montoPagado: 0 },
  });

  // Transacciones de historial para Pedro
  await db.transaccion.create({ data: { clienteId: clientePedro.id, empresaId: empCarwash.id, estrategiaId: benSilver.id, tipoConsumo: "Lavado básico", montoConsumo: 0, beneficioAplicado: "Incluido en Plan Silver", usosDescontados: 1, empleadoId: empleadoCarwash.id, fechaTransaccion: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) } });
  await db.transaccion.create({ data: { clienteId: clientePedro.id, empresaId: empCarwash.id, estrategiaId: benSilver.id, tipoConsumo: "Lavado básico", montoConsumo: 0, beneficioAplicado: "Incluido en Plan Silver", usosDescontados: 1, empleadoId: empleadoCarwash.id, fechaTransaccion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } });

  // 7. Integraciones de ejemplo (webhook a URL de prueba) — módulo interno, no público
  await db.integracion.create({
    data: { empresaId: empCarwash.id, tipoIntegracion: "WEBHOOK", webhookUrl: "https://httpbin.org/post", apiKey: "fx_key_cartown_123", tokenSecreto: "fx_secret_cartown", eventos: JSON.stringify(["CLIENTE_CREADO", "QR_GENERADO", "BENEFICIO_ACTIVADO", "USO_CONFIRMADO", "PAGO_CONFIRMADO"]), estado: "ACTIVA", ultimaSincronizacion: new Date() },
  });

  void superadmin; void adminCarwash; void adminRestaurante; void benGold; void benConteoRest; void benCuponRest;

  return { seeded: true, message: "Seed completado: 2 tipos de negocio, 2 empresas con branding, 6 beneficios, 7 usuarios y 2 clientes de prueba." };
}
