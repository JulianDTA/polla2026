# ⚽ Polla Mundialista 2026

Plataforma de predicciones para el **FIFA World Cup 2026** (USA · Canadá · México).  
Stack: **Vue 3 + Node.js/Express + Supabase + Render**

---

## Características

- 🔐 Registro e inicio de sesión (Supabase Auth)
- ⚽ Predicciones de marcador para los 104 partidos
- 🏆 Predicción de campeón del torneo
- 📊 Tabla de posiciones en tiempo real
- 🔄 Sincronización automática con la API oficial de la FIFA (API-Football)
- 🤖 Cálculo automático de puntos al terminar cada partido

**Sistema de puntos:**
| Acierto | Puntos |
|---------|--------|
| Marcador exacto | 3 pts |
| Resultado correcto (G/E/P) | 1 pt |
| Campeón correcto | 5 pts |

---

## Setup local

### 1. Clonar e instalar

```bash
git clone <tu-repo>

# Backend
cd worldcup-polla-2026/backend
npm install
cp .env.example .env    # Completar variables

# Frontend
cd ../frontend
npm install
cp .env.example .env.local   # Completar variables
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. En **Project Settings > API**, copia:
   - `Project URL` → `SUPABASE_URL` (backend y frontend)
   - `anon / public` → `SUPABASE_ANON_KEY` (backend y frontend)
   - `service_role / secret` → `SUPABASE_SERVICE_KEY` (solo backend ⚠️)
4. En **Authentication > URL Configuration**, agrega `http://localhost:5173` como Site URL

### 3. Configurar API de la FIFA

La app usa [API-Football v3](https://www.api-football.com/) para obtener datos reales.

1. Regístrate en [api-football.com](https://www.api-football.com/) y obtén tu API key
2. Agrega la key al `.env` del backend: `FIFA_API_KEY=tu_key`
3. Sincroniza los partidos llamando al endpoint de sync (ver abajo)

> Si usas RapidAPI en lugar del host directo, descomenta las líneas correspondientes en `backend/src/config/fifaApi.js`

### 4. Sincronizar partidos

Después de configurar todo, popula la base de datos con los partidos:

```bash
curl -X POST http://localhost:3001/api/admin/sync \
  -H "x-admin-key: TU_ADMIN_SECRET_KEY"
```

Esto obtiene los 104 partidos de la API y los guarda en Supabase.

### 5. Correr en desarrollo

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

---

## Deploy en Render

### Opción A: Usar render.yaml (recomendado)

1. Sube el código a GitHub/GitLab
2. En [render.com](https://render.com), crea un nuevo **Blueprint** y apunta a tu repo
3. Render detecta `render.yaml` automáticamente y crea los dos servicios
4. Configura las variables de entorno en el dashboard de Render:

**Backend (`polla-backend`):**
| Variable | Valor |
|----------|-------|
| `SUPABASE_URL` | Tu URL de Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key (secreto) |
| `SUPABASE_ANON_KEY` | Anon key |
| `FIFA_API_KEY` | Tu API key de API-Football |
| `FRONTEND_URL` | URL del frontend en Render |
| `ADMIN_SECRET_KEY` | Generado automáticamente por Render |

**Frontend (`polla-frontend`):**
| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | Tu URL de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key |
| `VITE_API_URL` | URL del backend **con /api**: `https://polla-backend.onrender.com/api` |

5. Una vez desplegado, sincroniza los partidos:

```bash
curl -X POST https://polla-backend.onrender.com/api/admin/sync \
  -H "x-admin-key: TU_ADMIN_SECRET_KEY"
```

6. En Supabase → **Authentication → URL Configuration**, agrega la URL del frontend como Site URL

### Opción B: Servicios separados

- Backend: **New Web Service** → Runtime: Node → Root: `backend` → `npm start`
- Frontend: **New Static Site** → Root: `frontend` → Build: `npm install && npm run build` → Publish: `dist`

---

## Endpoints de la API

### Públicos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/matches` | Todos los partidos (con predicción del usuario si está autenticado) |
| GET | `/api/matches/standings` | Tabla de posiciones de fase de grupos |
| GET | `/api/matches/teams` | Lista de equipos |
| GET | `/api/leaderboard` | Tabla de posiciones de usuarios |
| GET | `/api/health` | Health check |

### Autenticados (Bearer token de Supabase)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/predictions` | Mis predicciones |
| POST | `/api/predictions` | Crear/actualizar predicción |
| GET | `/api/predictions/champion` | Mi predicción de campeón |
| POST | `/api/predictions/champion` | Guardar predicción de campeón |

### Admin (header `x-admin-key`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/admin/sync` | Sincronizar todos los partidos desde la FIFA API |
| POST | `/api/admin/sync-live` | Actualizar solo partidos en vivo |
| POST | `/api/admin/calculate-points` | Calcular puntos para partidos terminados |
| POST | `/api/admin/award-champion-points` | Otorgar puntos al campeón correcto |

---

## Estructura del proyecto

```
worldcup-polla-2026/
├── backend/
│   ├── server.js              # Entry point + cron jobs
│   ├── src/
│   │   ├── config/
│   │   │   ├── supabase.js    # Supabase admin client
│   │   │   └── fifaApi.js     # FIFA API client + normalizer
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT + admin auth
│   │   └── routes/
│   │       ├── matches.js
│   │       ├── predictions.js
│   │       ├── leaderboard.js
│   │       └── admin.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── views/             # Pages
│   │   ├── components/        # Reusable UI
│   │   ├── stores/            # Pinia state
│   │   ├── services/api.js    # Axios API client
│   │   └── supabase.js        # Supabase anon client
│   └── .env.example
├── supabase/
│   └── schema.sql             # Run in Supabase SQL Editor
└── render.yaml                # Render deployment config
```

---

## Flujo de la polla

1. **Antes del torneo**: los usuarios hacen predicciones de marcador para cada partido y eligen su campeón
2. **Durante el torneo**: el backend sincroniza automáticamente los resultados cada 2 minutos cuando hay partidos en vivo
3. **Al terminar cada partido**: el backend calcula los puntos automáticamente
4. **Al terminar el torneo**: el admin llama a `/api/admin/award-champion-points` con el equipo ganador

---

## Licencia

MIT — úsalo libremente para tu grupo de amigos, trabajo o familia 🌍
