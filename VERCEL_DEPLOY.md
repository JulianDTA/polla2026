# Despliegue en Vercel (Polla Mundialista 2026)

Este proyecto está perfectamente configurado para ser desplegado en Vercel utilizando una arquitectura de **Monorepositorio (dos proyectos separados en Vercel apuntando al mismo repositorio)**.

El código ya cuenta con las siguientes preparaciones para Vercel:
1. **Backend Serverless:** `backend/server.js` exporta la app de Express (`module.exports = app;`), lo cual es un requisito de `@vercel/node`.
2. **Cron Jobs Nativos:** `backend/vercel.json` define las tareas programadas (crons) nativas de Vercel. Además, las rutas GET correspondientes en `admin.js` están listas para ser ejecutadas de forma segura.
3. **Frontend Vite:** `frontend/vercel.json` está preconfigurado para compilar la aplicación Vue 3 y manejar correctamente las rutas SPA.

## Pasos para desplegar

### 1. Preparar el Repositorio
Asegúrate de que todo el código esté subido a un repositorio en GitHub, GitLab o Bitbucket.

### 2. Desplegar el Backend
1. Ve a tu panel de Vercel y haz clic en **Add New Project**.
2. Importa el repositorio del proyecto.
3. En la sección **Configure Project**:
   - **Project Name:** `polla-backend` (o el nombre que prefieras).
   - **Framework Preset:** Selecciona `Other` o `Node.js`.
   - **Root Directory:** Haz clic en `Edit` y selecciona la carpeta `backend`.
4. Despliega la sección de **Environment Variables** y añade las siguientes variables clave (los valores los obtienes de tu `.env` o Supabase):
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: URL de tu frontend (puedes configurarlo después de desplegar el frontend, o usar `*` inicialmente).
   - `SUPABASE_URL`: Tu URL de Supabase.
   - `SUPABASE_SERVICE_KEY`: Service Role Key de Supabase.
   - `SUPABASE_ANON_KEY`: Anon Key de Supabase.
   - `FIFA_API_KEY`: Tu API Key para football.api-sports.io.
   - `FIFA_API_BASE_URL`: `https://v3.football.api-sports.io`
   - `ADMIN_SECRET_KEY`: Una contraseña segura para tu panel admin.
   - `CRON_SECRET`: Vercel genera y usa esta variable automáticamente, pero es buena práctica saber que protege los endpoints de Cron.
5. Haz clic en **Deploy**. 

*Nota: Una vez desplegado, copia el dominio asignado (ej. `https://polla-backend.vercel.app`). Lo necesitarás para el frontend.*

### 3. Desplegar el Frontend
1. Ve nuevamente al panel de Vercel y haz clic en **Add New Project**.
2. Importa el **mismo** repositorio del proyecto.
3. En la sección **Configure Project**:
   - **Project Name:** `polla-frontend`
   - **Framework Preset:** Vercel debería detectar automáticamente `Vite`.
   - **Root Directory:** Haz clic en `Edit` y selecciona la carpeta `frontend`.
4. Despliega la sección de **Environment Variables** y añade:
   - `VITE_SUPABASE_URL`: Tu URL de Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Tu Anon Key de Supabase.
   - `VITE_API_URL`: Aquí debes pegar el dominio del backend que obtuviste en el paso anterior **MÁS el sufijo `/api`**. Ejemplo: `https://polla-backend.vercel.app/api`.
5. Haz clic en **Deploy**.

### 4. Detalles Finales
1. **CORS:** Vuelve al proyecto del Backend en Vercel, entra a *Settings > Environment Variables* y actualiza `FRONTEND_URL` con la URL real de tu frontend desplegado (ej. `https://polla-frontend.vercel.app`).
2. **Base de Datos:** Asegúrate de que las tablas en Supabase estén creadas según tus esquemas (y de correr cualquier función RPC necesaria, como `calculate_match_points` y `refresh_user_points`).
3. **Admin UI:** Accede al frontend, inicia sesión con tu usuario y dirígete a `/admin` usando el `ADMIN_SECRET_KEY` para forzar la primera sincronización de partidos.
