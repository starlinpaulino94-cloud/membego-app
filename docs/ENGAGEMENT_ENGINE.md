# Engagement Engine — Roadmap por fases

MembeGo no debe sentirse como un panel administrativo, sino como una app que el
usuario quiere abrir todos los días. La estrategia (inspirada en Temu/TikTok pero
orientada a **fidelización**, no a vender productos) es construir un **Engagement
Engine**: una capa central que alimenta campañas, banners, urgencia, celebraciones,
gamificación y personalización — reutilizada por todos los módulos.

**Principio rector:** ninguna pantalla "muerta"; siempre algo que se mueve, cambia,
genera curiosidad o recompensa. **Regla dura:** siempre datos REALES, nunca inventados.

---

## Fase 1 — Home vivo + kit de animaciones reutilizable  ✅ (en curso)
Sin cambios de base de datos. Todo con datos que ya existen.
- Kit reutilizable: `Countdown`, `Confetti`, glow/pulse/bounce/shine/float.
- "Momentos vivos" en el Home (`/mis-membresias`): saludo personalizado + tarjetas
  con datos reales — beneficio pendiente por reclamar (CTA que palpita), beneficio
  que vence pronto (contador), progreso de Invita y Gana.
- Resolver central `modules/engagement/momentos.ts` que arma el feed desde la BD.

## Fase 2 — Motor de Campañas (requiere schema)
Modelo `MarketingCampaign` con tipo, fechas, prioridad, empresas, beneficio, banner,
animación. Tipos: Flash Sale, Oferta del día, Fin de semana, Happy Hour, Primera
compra, Bienvenida, Regreso (+30 días), Cumpleaños, Cerca de vencer, Personalizada.
Admin para crearlas y programarlas; activación/expiración automática.

## Fase 3 — Carruseles tipo Netflix
Filas horizontales reutilizando datos: 🔥 Ofertas · ❤️ Empresas que sigues ·
🎁 Beneficios · ⭐ Recomendaciones · 👑 Exclusivas de miembro · 🏆 Destacadas.

## Fase 4 — Urgencia y prueba social (datos reales)
"Quedan X cupones", "245 personas ya reclamaron", "Juan reclamó hace 2 min".
Todo desde eventos reales (nunca inventado). Genera FOMO.

## Fase 5 — Banners dinámicos rotativos (schema)
Varios banners por empresa que rotan con animación; prioridad configurable.

## Fase 6 — Gamificación (schema)
Niveles, logros, insignias, retos, puntos, ranking, rachas, ruleta, rasca y gana,
misiones, calendario de recompensas. Todo sobre el mismo motor.

## Fase 7 — Personalización por empresa (schema)
Tema, colores, animaciones, tipos de campaña, prioridad, banners por empresa.

## Fase 8 — Popups inteligentes + Sistema de eventos + Recomendaciones
Popups importantes (no molestos) disparados por eventos del motor
(registro → bienvenida → regalo → invita → confeti). Recomendaciones por
comportamiento del usuario.

---

## Arquitectura
- `modules/engagement/` — resolvers server-side que arman feeds desde datos reales.
- `components/engagement/` — kit visual reutilizable (contadores, celebraciones,
  tarjetas vivas, animaciones). Respeta `prefers-reduced-motion`.
- Cada nueva función (referidos, cupones, puntos, alianzas) reutiliza esta capa en
  lugar de construir un módulo aislado.
