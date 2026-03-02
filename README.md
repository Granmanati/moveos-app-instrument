# MOVE OS — App

Sistema clínico adaptativo para gestión de movimiento.

## Stack

- **Vite 7** + **React 19** + **TypeScript**
- **React Router v6** — navegación entre pantallas
- **CSS Modules** — estilos scoped por componente
- **Tokens de diseño** — mapeados desde `recursos/estilo-visual.json`
- **Google Fonts** — Inter (UI) + Material Symbols (iconos)

## Instalación y arranque

```bash
# Instalar dependencias
npm install

# Iniciar dev server
npm run dev
# → http://localhost:5173
```

## Estructura del proyecto

```
src/
├── components/
│   ├── AppLayout.tsx       # Wrapper: contenido + BottomNav
│   ├── BottomNav.tsx       # Nav inferior de 5 tabs
├── pages/
│   ├── HomePage.tsx        # / — Estado del sistema, sesión de hoy
│   ├── TodayPage.tsx       # /today — Patrones y ejecución
│   ├── ExplorePage.tsx     # /explore — Biblioteca de vídeos clínicos
│   ├── ProgressPage.tsx    # /progress — KPIs, tendencias, historial
│   └── ProfilePage.tsx     # /profile — Plan, configuración
├── data/
│   └── mockData.ts         # Datos estáticos desacoplados
├── App.tsx                 # Router principal
└── index.css               # Tokens CSS (colores, tipografía, spacing)
```

## Rutas

| Ruta | Pantalla |
|---|---|
| `/` | Home — métricas y sesión del día |
| `/today` | Today — patrones de sesión |
| `/explore` | Explorar — biblioteca clínica |
| `/progress` | Progreso — historial y tendencias |
| `/profile` | Perfil — plan y configuración |

## Tokens de diseño

Los tokens CSS en `src/index.css` mapean directamente `recursos/estilo-visual.json`:

| Variable CSS | Valor | Uso |
|---|---|---|
| `--bg-base` | `#0B0B0E` | Fondo base |
| `--surface-1` | `#101015` | Cards y paneles |
| `--accent` | `#2D7CFF` | Accent primario |
| `--text-primary` | `#F4F4F6` | Texto principal |
| `--success` | `#3BD47A` | Métricas positivas |
| `--warning` | `#FFB020` | Alertas carga/dolor |
| `--danger` | `#FF4D4D` | Errores críticos |

> **Regla de marca:** Nunca usar colores fuera de estos tokens. Si falta un valor, consultar `recursos/estilo-visual.json` o usar los fallbacks baseline de MOVE OS.

## Sistema de diseño completo

Ver [`DESIGN.md`](../DESIGN.md) en la raíz del proyecto.

## Próximos pasos

1. **Supabase auth** — Google login con sesión real
2. **Datos reales** — reemplazar `mockData.ts` con queries Supabase
3. **Roles** — Free/Premium/Pro/Admin con RLS en backend
4. **Nuevas pantallas** — generadas con `enhance-prompt` + tokens de marca
