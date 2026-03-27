#  Ecocun — Proyecto React PWA con Vite

Aplicación creada con **React + TypeScript + Vite + TailwindCSS**, estructurada de manera simple para **principiantes**.  
Incluye sistema de **rutas**, **tema claro/oscuro** y soporte **PWA (Progressive Web App)**.

---

## Cómo ejecutar el proyecto

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el entorno de desarrollo:
   ```bash
   npm run dev
   ```

3. Abre la URL que aparece en la terminal (por ejemplo: `http://localhost:5173`).

---

## Estructura del proyecto
   ```bash
    .
    ├── public/                 # Archivos públicos (favicon, manifest, etc.)
    ├── src/                    # TODO el código de la aplicación
    │   ├── app/                # Lógica y estructura de la app (layout, router, páginas, etc.)
    │   │   ├── components/     # Componentes reutilizables (botones, tarjetas, etc.)
    │   │   ├── layout/         # Estructuras de interfaz, navbar, footer, etc.
    │   │   ├── pages/          # Cada carpeta aquí es una página o vista de la app
    │   │   ├── pwa/            # Archivos relacionados con la PWA (badge, estilos, registro)
    │   │   └── router/         # Rutas y subrutas de la aplicación
    │   ├── assets/             # Imágenes, íconos y recursos estáticos
    │   ├── index.css           # Estilos globales (Tailwind base + utilidades)
    │   ├── main.tsx            # Punto de entrada principal de React
    │   └── vite-env.d.ts       # Tipos de Vite (no modificar)
    ├── index.html              # HTML base donde Vite inyecta la app
    ├── vite.config.ts          # Configuración de Vite (plugins, alias, etc.)
    ├── tsconfig*.json          # Configuración de TypeScript
    └── eslint.config.js        # Reglas de linting (formato y calidad del código)
   ```
---

##  Explicación de carpetas

### src/app/pages/
Cada subcarpeta representa una página (ruta) de la aplicación:
- Auth/ → pantallas de login y registro
- Campaigns/ → vista de campañas
- Ecoaporta/ → vista de participación Ecoaporta
- Home/ → página principal
- Maps/ → página con mapa interactivo
- not-found/ → pantalla 404

 Regla práctica:
- Si el componente solo se usa en una página, déjalo dentro de su carpeta.
- Si se reutiliza en varias páginas, muévelo a app/components/.

### src/app/layout/
Contiene Layout.tsx, la estructura visual común:
- Navbar con navegación y tema claro/oscuro.
- <Outlet /> para renderizar la página activa.
- Footer con texto de derechos o info adicional.

### src/app/router/
Define las rutas:
- AppRoutes.tsx → rutas principales.
- AuthRoutes.tsx → rutas de autenticación.
- HomeRoutes.tsx → rutas del módulo Home.


### src/app/pwa/
Elementos relacionados con la PWA:
- PWABadge.tsx y PWABadge.css → muestran un indicador o botón para instalar la app.

---

##  Cómo funciona el enrutamiento

index.html → main.tsx → Layout.tsx (navbar/footer)
                               ↓
                             <Outlet /> → AppRoutes / AuthRoutes / HomeRoutes

Cada ruta carga una página desde src/app/pages/.

---

## Comentarios para entender el código

main.tsx
- Punto de entrada de la app React.
- Monta la app dentro de <div id="root"> en index.html.
- Aquí se pueden agregar Providers globales o registrar la PWA.

Layout.tsx
- Plantilla general con navbar, footer y tema claro/oscuro.
- Usa localStorage para recordar el tema y muestra el contenido de la página actual dentro de <Outlet />.

AppRoutes.tsx
- Define las rutas principales:
  "/" → Home
  "/maps" → Map
  "/auth/*" → subrutas de autenticación
  "*" → página 404

Home.tsx
- Página principal (Home).

NotResults.tsx
- Página 404 (no encontrado).

PWABadge.tsx
- Componente visual de PWA.

---

##  Alias de importación @ (opcional)

Para importar más limpio (sin rutas largas):

```
import Layout from '@/app/layout/Layout'
import Home from '@/app/pages/Home/Home'
```

---

## Agregar una página nueva

1. Crea una nueva carpeta en src/app/pages/:
   src/app/pages/Reports/Reports.tsx

2. Agrega la ruta en AppRoutes.tsx:
   { path: '/reports', element: <Reports /> }

3. (Opcional) Agrega el enlace al navbar en Layout.tsx.

---

##  PWA (más adelante)

- Agrega manifest.webmanifest en /public.
- Usa vite-plugin-pwa para generar el service worker.
- Registra el SW desde main.tsx o app/pwa/registerSW.ts.

---

##  Convenciones

| Tipo | Convención | Ejemplo |
|------|-------------|----------|
| Componentes | PascalCase | Home.tsx, Button.tsx |
| Funciones y hooks | camelCase | useToggle(), fetchData() |
| Carpetas | PascalCase (páginas) | Home/, Maps/ |
| Commits | Conventional Commits | chore: reorganize folders |
| Estilos | Tailwind | className="bg-gray-50 dark:bg-gray-900" |

---
