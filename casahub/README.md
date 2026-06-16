# Casa Hub

App doméstica para gestionar menú, compras, tareas y rutinas del hogar.

## PIN de acceso
El PIN por defecto es `2810`. Para cambiarlo, editá la línea en `src/main.jsx`:
```js
const CORRECT_PIN = "2810"
```

## Deploy en Vercel (paso a paso)

1. Creá cuenta en https://github.com (gratis)
2. Creá cuenta en https://vercel.com (gratis, con tu cuenta de GitHub)
3. Subí esta carpeta a un repo de GitHub
4. En Vercel → "Add New Project" → elegí el repo
5. Framework: **Vite** (lo detecta solo)
6. Click "Deploy" → en 2 minutos tenés la URL

## Desarrollo local
```bash
npm install
npm run dev
```
