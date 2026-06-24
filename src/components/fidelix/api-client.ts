// Cliente API para FIDELIX QR. Lanza Error con .message legible.

export type SessionUser = {
  id: string;
  email: string;
  nombre: string;
  telefono: string | null;
  rol: "SUPERADMIN" | "ADMIN_EMPRESA" | "EMPLEADO" | "CLIENTE";
  empresaId: string | null;
};

async function req<T = unknown>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && typeof data === "object" && "error" in data && typeof (data as Record<string, unknown>).error === "string")
      ? (data as Record<string, string>).error
      : `Error ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  get: <T = unknown>(url: string) => req<T>(url),
  post: <T = unknown>(url: string, body?: unknown) =>
    req<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T = unknown>(url: string, body?: unknown) =>
    req<T>(url, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T = unknown>(url: string) => req<T>(url, { method: "DELETE" }),
};

// Tipos de datos compartidos con el backend
export type TipoNegocio = {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  icono: string | null;
  color: string | null;
  camposDef: CampoDef[];
};
export type CampoDef = {
  id: string;
  clave: string;
  etiqueta: string;
  tipo: string;
  requerido: boolean;
  orden: number;
  opciones: string | null;
};
export type Empresa = {
  id: string;
  nombre: string;
  tipoNegocioId: string;
  logo: string | null;
  telefono: string | null;
  direccion: string | null;
  estado: string;
  tipoNegocio?: TipoNegocio;
  estrategias?: Estrategia[];
  _count?: { clientes: number; estrategias: number; usuarios: number };
};
export type Estrategia = {
  id: string;
  empresaId: string;
  tipoNegocioId: string;
  nombre: string;
  tipoEstrategia: "MEMBRESIA" | "CONTEO_VISITAS" | "PUNTOS" | "CUPON" | "PROMOCION_TIEMPO";
  descripcion: string | null;
  requierePago: boolean;
  precio: number;
  duracionDias: number;
  cantidadUsos: number;
  metaVisitas: number;
  puntosPorConsumo: number;
  puntosPorMonto: number;
  recompensa: string | null;
  descuentoPct: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  estado: string;
  tipoNegocio?: TipoNegocio;
  empresa?: Empresa;
};
export type Cliente = {
  id: string;
  userId: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  fechaNacimiento: string | null;
  empresaId: string;
  tipoNegocioId: string;
  estado: string;
  tipoNegocio?: TipoNegocio;
  empresa?: Empresa;
  camposDinamicos?: { id: string; clave: string; valor: string }[];
  qrTokens?: { id: string; token: string; activo: boolean }[];
  estrategias?: (ClienteEstrategia & { estrategia: Estrategia })[];
  transacciones?: Transaccion[];
};
export type ClienteEstrategia = {
  id: string;
  clienteId: string;
  estrategiaId: string;
  empresaId: string;
  estado: string;
  fechaInicio: string | null;
  fechaVencimiento: string | null;
  usosDisponibles: number;
  usosConsumidos: number;
  visitasAcumuladas: number;
  puntosAcumulados: number;
  pagoConfirmado: boolean;
  montoPagado: number;
  estrategia?: Estrategia;
  cliente?: Cliente;
};
export type Transaccion = {
  id: string;
  clienteId: string;
  empresaId: string;
  tipoConsumo: string;
  montoConsumo: number;
  puntosGenerados: number;
  beneficioAplicado: string | null;
  usosDescontados: number;
  fechaTransaccion: string;
  empleado?: { id: string; nombre: string } | null;
  cliente?: { id: string; nombre: string };
  estrategia?: { id: string; nombre: string } | null;
};
export type Integracion = {
  id: string;
  empresaId: string;
  tipoIntegracion: string;
  apiUrl: string | null;
  apiKey: string | null;
  webhookUrl: string | null;
  tokenSecreto: string | null;
  eventos: string | null;
  estado: string;
  ultimaSincronizacion: string | null;
  _count?: { logs: number };
};
export type IntegrationLog = {
  id: string;
  integracionId: string;
  empresaId: string;
  evento: string;
  payload: string | null;
  respuesta: string | null;
  estado: string;
  error: string | null;
  createdAt: string;
};

export type ScanResult = {
  cliente: {
    id: string;
    nombre: string;
    telefono: string | null;
    email: string | null;
    tipoNegocio: TipoNegocio;
    empresa: { id: string; nombre: string };
    camposDinamicos: { id: string; clave: string; valor: string }[];
  };
  estrategias: (ClienteEstrategia & { estrategia: Estrategia })[];
  historial: Transaccion[];
};
