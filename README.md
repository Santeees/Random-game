# Juego multijugador de minijuegos (React + Node + Socket.IO)

Aplicación web en tiempo real que permite crear y unirse a sesiones multijugador, jugar una serie de minijuegos y ver resultados por partida y finales. Incluye bots, sala de espera con estado de preparación, y motor de juego que selecciona minijuegos y calcula posiciones/ganadores.

## Tecnologías
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Estado: Zustand
- Iconos: lucide-react
- Routing: React Router
- Backend: Node + Express + Socket.IO
- Deploy (opcional): Vercel (`api/index.ts` serverless y `vercel.json` para rewrites)
- Proxy de desarrollo: Vite proxy `/api` → `http://localhost:3001`

## Requisitos
- Node.js 18+ y npm
- Puertos libres: `5173` (frontend) y `3001` (backend)

## Instalación y ejecución
1. Instala dependencias:
   ```bash
   npm install