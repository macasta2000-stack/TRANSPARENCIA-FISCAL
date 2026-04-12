# CLAUDE.md — Deploy HASTA CUÁNDO a Cloudflare Pages

## CONTEXTO

Este proyecto ya está 100% terminado y pusheado en el branch `claude/tax-freedom-day-calculator-j1wwG` del repo `macasta2000-stack/TRANSPARENCIA-FISCAL`.

Es una calculadora de Tax Freedom Day para Argentina hecha en React + Vite. El build genera archivos estáticos en `dist/`.

## TU ÚNICA TAREA

Deployar este proyecto a Cloudflare Pages. Nada más. No toques código.

## PASOS

1. Cloná el repo si no está clonado:
   ```
   git clone https://github.com/macasta2000-stack/TRANSPARENCIA-FISCAL.git
   cd TRANSPARENCIA-FISCAL
   git checkout claude/tax-freedom-day-calculator-j1wwG
   ```

2. Instalá dependencias y buildeá:
   ```
   npm install
   npm run build
   ```

3. Deployá a Cloudflare Pages:
   ```
   npx wrangler pages deploy dist/ --project-name=transparencia-fiscal
   ```
   
   Si wrangler pide login, ejecutá primero:
   ```
   npx wrangler login
   ```
   Esto abre el browser para autenticar con Cloudflare. Aceptá los permisos.

4. Si el proyecto no existe en Cloudflare Pages, wrangler te pregunta si querés crearlo. Decí que sí.

5. Una vez deployado, mostrá la URL al usuario (será algo como `transparencia-fiscal.pages.dev`).

## NOTAS

- Build command: `npm run build`
- Output dir: `dist`
- Framework: React + Vite
- No hay backend, no hay variables de entorno, no hay secrets. Es 100% estático.
- Si `wrangler login` no funciona, pedile al usuario el `CLOUDFLARE_API_TOKEN` y usalo así:
  ```
  CLOUDFLARE_API_TOKEN=<token> npx wrangler pages deploy dist/ --project-name=transparencia-fiscal
  ```
