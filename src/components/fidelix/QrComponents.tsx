"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Camera, CameraOff, X } from "lucide-react";

// Muestra un QR generado a partir de un token
export function QrDisplay({ token, label, size = 220 }: { token: string; label?: string; size?: number }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    QRCode.toDataURL(token, { width: size * 2, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } })
      .then(setUrl)
      .catch(() => setUrl(""));
  }, [token, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-sm">
        {url ? (
          <img src={url} alt="QR" width={size} height={size} className="rounded-lg" />
        ) : (
          <div style={{ width: size, height: size }} className="animate-pulse rounded-lg bg-slate-100" />
        )}
      </div>
      {label && <p className="text-xs text-muted-foreground text-center">{label}</p>}
      {url && (
        <a href={url} download={`pase-digital-${token.slice(0, 8)}.png`}>
          <Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" /> Descargar</Button>
        </a>
      )}
      <p className="font-mono text-[10px] text-slate-400 break-all max-w-[220px] text-center">{token}</p>
    </div>
  );
}

// Scanner de QR con cámara (html5-qrcode)
export function QrScanner({ onScan, onError }: { onScan: (token: string) => void; onError?: (msg: string) => void }) {
  const containerId = "pase-digital-qr-reader";
  const scannerRef = useRef<any>(null);
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const lastScanRef = useRef<{ token: string; t: number }>({ token: "", t: 0 });

  async function start() {
    setStarting(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded: string) => {
          const now = Date.now();
          // Evitar duplicados en 3s
          if (decoded === lastScanRef.current.token && now - lastScanRef.current.t < 3000) return;
          lastScanRef.current = { token: decoded, t: now };
          onScan(decoded.trim());
        },
        () => {}
      );
      setActive(true);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "No se pudo acceder a la cámara");
    } finally {
      setStarting(false);
    }
  }

  async function stop() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {}
    setActive(false);
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div id={containerId} className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-slate-900 aspect-square flex items-center justify-center">
        {!active && (
          <div className="text-center text-slate-400 p-6">
            <Camera className="mx-auto h-10 w-10 mb-2" />
            <p className="text-sm">Cámara inactiva</p>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-2">
        {!active ? (
          <Button onClick={start} disabled={starting}>
            {starting ? "Iniciando..." : <><Camera className="mr-1.5 h-4 w-4" /> Activar cámara</>}
          </Button>
        ) : (
          <Button variant="outline" onClick={stop}><CameraOff className="mr-1.5 h-4 w-4" /> Detener</Button>
        )}
      </div>
      <p className="text-xs text-center text-muted-foreground">
        Apunta la cámara al código QR del cliente. El escaneo solo valida, no consume beneficios.
      </p>
    </div>
  );
}

// Entrada manual de token (alternativa si no hay cámara)
export function ManualTokenInput({ onSubmit }: { onSubmit: (token: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-mono"
        placeholder="Pega el token UUID del QR..."
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      <Button size="sm" onClick={() => onSubmit(val.trim())} disabled={!val.trim()}>Validar</Button>
    </div>
  );
}
