# 🎮 EmUltron — Emulador N64 en el Navegador (Proyecto Académico)

Aplicación web académica desarrollada con **Vite + React + TypeScript + Tailwind CSS**.  
Permite explorar un catálogo de juegos de Nintendo 64 y ejecutarlos directamente en el navegador mediante **EmulatorJS.com**, sin plugins ni descargas adicionales.  
Consume la **API de IGDB (Twitch)** para obtener metadatos de cada juego, con traducción automática al español en el browser.

> **Nota:** Los ROMs incluidos son de uso estrictamente educativo. Este sitio no tiene fines comerciales ni distribuye software con derechos registrados.

---

## 🌐 Sitio en Producción

🔗 https://emultron.vercel.app/

---

## ✨ Características Principales

- **Catálogo visual de juegos N64** con portadas, géneros, año de lanzamiento, desarrollador y número de jugadores.
- **Emulación en el navegador** vía EmulatorJS.com, sin plugins ni instalaciones externas.
- **CRUD de Favoritos** con persistencia en `localStorage`: agregar, ver, editar nota y calificación, y eliminar.
- **Consumo de APIs externas**: Twitch OAuth → IGDB (metadatos) y Google Translate (traducciones al español en tiempo real, sin API key).
- **Catálogo base de fallback** con caché local (`igdbCache.ts`) para un inicio instantáneo, mientras los datos en vivo se resuelven en background.
- **Diseño responsivo, mobile-first** con tema oscuro gaming.
- **Arquitectura modular**: separación clara en `components/`, `pages/`, `hooks/`, `services/` y `types/`.

---

## 🚀 Cómo Ejecutar el Proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (opcional — requerido para datos live de IGDB)
cp .env .env.local
# Editar .env.local con tus credenciales de Twitch Developer:
#   VITE_TWITCH_CLIENT_ID=tu_client_id
#   VITE_TWITCH_CLIENT_SECRET=tu_client_secret

# 3. Ejecutar en modo desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:5173
```

> **Nota:** Si no se configuran las variables de entorno de IGDB, la aplicación carga igualmente usando el caché local (`igdbCache.ts`) con los metadatos precargados.

---

## 📂 Estructura del Proyecto

```
EmUltron/
├── public/
│   ├── roms/               ← Archivos .z64 de los juegos
│   └── covers/             ← Portadas locales (fallback)
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── GameCard.tsx
│   │   ├── GameGrid.tsx
│   │   ├── GameModal.tsx   ← Incluye el CRUD de favoritos
│   │   └── EmulatorPlayer.tsx
│   ├── pages/
│   │   ├── HomePage.tsx    ← Catálogo principal + panel de favoritos
│   │   └── EmulatorPage.tsx
│   ├── hooks/
│   │   ├── useEmulator.ts
│   │   ├── useGamesData.ts
│   │   └── useFavorites.ts ← Lógica CRUD con localStorage
│   ├── services/
│   │   └── igdbService.ts  ← Integración IGDB API + traducción inline
│   ├── data/
│   │   ├── gamesConfig.ts  ← Catálogo base de juegos
│   │   └── igdbCache.ts    ← Metadatos en caché (sin conexión)
│   └── types/
│       └── index.ts
├── vite.config.ts
├── tailwind.config.js
└── index.html
```

---

## 🕹️ CRUD de Favoritos

| Operación  | Descripción                         | Implementación                          |
| ---------- | ----------------------------------- | --------------------------------------- |
| **Create** | Agregar juego a favoritos           | Botón ♡ en `GameCard` / `GameModal`     |
| **Read**   | Ver lista de favoritos              | Tab "Mis Favoritos" en `HomePage`       |
| **Update** | Editar nota personal y calificación | Edición inline en modal y panel lateral |
| **Delete** | Eliminar juego de favoritos         | Botón 🗑 en el panel de favoritos       |

Los datos se persisten en `localStorage` bajo la clave `emultron_favorites_v1`.

---

## 🌐 Consumo de APIs

### 1. Twitch OAuth

`POST /api/twitch-token` → obtiene un Bearer token para autenticarse en IGDB.

### 2. IGDB (Internet Games Database)

`POST /api/igdb/games` → consulta nombre, descripción, portada, rating y URL del juego.  
Un proxy en `vite.config.ts` reenvía estas rutas a `api.igdb.com/v4/` para evitar restricciones CORS.

### 3. Google Translate (sin API key)

`GET translate.googleapis.com/translate_a/single` → traduce las descripciones del inglés al español directamente en el browser, sin pasos de build externos.

**Flujo general:** el catálogo base se sirve desde `igdbCache.ts` de forma instantánea. Los juegos nuevos se resuelven en runtime siguiendo el ciclo: Twitch → IGDB → Translate → render.

---

## 🎨 Decisiones de Diseño y Técnicas Implementadas

- **Vite + React + TypeScript**: entorno de desarrollo moderno con tipado estático para mayor robustez y mantenibilidad del código.
- **Tailwind CSS**: diseño utility-first que permite iterar rápidamente en la UI sin escribir CSS personalizado en la mayoría de los casos.
- **EmulatorJS.com**: integración vía script CDN que abstrae los cores de emulación (mupen64plus-nx y parallel-n64), evitando la necesidad de compilar WebAssembly manualmente.
- **Caché local con `igdbCache.ts`**: permite que la aplicación funcione sin conexión o sin credenciales de IGDB, mostrando metadatos precargados mientras se resuelven los datos en vivo.
- **Proxy en `vite.config.ts`**: redirige las llamadas a IGDB y Twitch desde el frontend para evitar errores CORS durante el desarrollo.
- **Arquitectura de hooks personalizados**: `useFavorites`, `useGamesData` y `useEmulator` encapsulan la lógica de negocio y la mantienen separada de los componentes visuales.
- **Diseño responsivo y mobile-first**: media queries y clases responsivas de Tailwind garantizan una experiencia de uso correcta en móviles, tablets y escritorio.
- **Tema oscuro gaming**: paleta de colores oscuros con acentos en los colores propios de cada juego (`color` en `gamesConfig.ts`), generando un look and feel coherente con la estética retro.

Las portadas, ROMs y marcas de los juegos pertenecen a sus respectivos propietarios (Nintendo, Rare, LucasArts). Este proyecto se desarrolló con fines únicamente académicos.

---

## ⚡ Cores de Emulación N64

| Core             | Rendimiento | Uso recomendado                                     |
| ---------------- | ----------- | --------------------------------------------------- |
| `mupen64plus-nx` | Alto        | Recomendado — usado por defecto en todos los juegos |
| `parallel-n64`   | Medio       | Mayor compatibilidad en algunos títulos específicos |

---

## 🧱 Stack Tecnológico

Vite · React 18 · TypeScript · Tailwind CSS · React Router v6 · EmulatorJS.com · IGDB API · Twitch OAuth · Google Translate API

---

## 📄 Licencia

Este proyecto es de carácter académico y no cuenta con una licencia de uso comercial. Puede ser utilizado con fines educativos y de aprendizaje.

---

## 👥 Créditos

- **Desarrollador**: Fidel Alarcon Leiva
- **Docente**: Patricio Araya Castro
- **Institución**: INACAP Maipú – Ingeniería en Informática
- **Año**: 2026
