# CLAUDE.md — Proyecto HASTA CUÁNDO

## QUÉ ES

Calculadora de Tax Freedom Day para Argentina. React + Vite. 100% estático, sin backend.
Ya está funcionando y deployado en Cloudflare Pages en `transparencia-fiscal.pages.dev`.

## REPO

`macasta2000-stack/TRANSPARENCIA-FISCAL`, branch `claude/tax-freedom-day-calculator-j1wwG`.

## STACK

- React 18 + Vite
- html2canvas para card shareable
- CSS custom puro (sin librerías UI)
- Fuentes: Bebas Neue (display) + DM Sans (body)
- Deploy: Cloudflare Pages (conectado a Git, auto-deploy en push)

## ESTRUCTURA

```
src/
├── main.jsx                          # Entry point
├── App.jsx                           # App shell, 4-step wizard
├── index.css                         # Todos los estilos globales
├── components/
│   ├── ProgressBar.jsx               # Barra de progreso 4 pasos
│   ├── CategorySlider.jsx            # Input por categoría con desglose expandible
│   ├── StepSueldo.jsx                # Paso 1: sueldo + tipo + relación laboral
│   ├── StepUbicacion.jsx             # Paso 2: provincia + municipio
│   ├── StepGastos.jsx                # Paso 3: categorías de gasto
│   ├── StepAuto.jsx                  # Paso 3: sección auto
│   ├── StepInmueble.jsx              # Paso 3: sección inmueble
│   ├── ResultadoFinal.jsx            # Paso 4: resultado con desglose por nivel de gobierno
│   └── ShareCard.jsx                 # Card 1080x1080 para compartir
├── data/
│   ├── provincias.js                 # 5 provincias MVP con municipios
│   ├── impuestos-nacionales.js       # IVA, ganancias, aportes, contribuciones, monotributo, combustibles, telecom, servicios regulados, costos regulatorios
│   ├── impuestos-provinciales.js     # IIBB por provincia y categoría con normativa
│   ├── impuestos-municipales.js      # ABL, TISH, DReI, alumbrado por jurisdicción
│   ├── automotor.js                  # Escalas progresivas patente por provincia
│   └── categorias-gasto.js           # 10 categorías de gasto con tipo IVA y IIBB key
├── utils/
│   ├── calcularSueldo.js             # Dependencia/monotributo/autónomo con items detallados
│   ├── calcularConsumo.js            # Desglose por impuesto individual por categoría
│   ├── calcularAutomotor.js          # Patente + impuestos en seguro + costos regulatorios
│   ├── calcularInmueble.js           # ABL/inmobiliario
│   ├── taxFreedomDay.js              # Cálculo final + agrupación por nivel de gobierno
│   └── generarCard.js                # html2canvas + Web Share API
└── hooks/
    └── useCalculadora.js             # Estado global del wizard
```

## QUÉ YA TIENE (V2 actual)

- 4 pasos: Sueldo → Ubicación → Gastos → Resultado
- Cada impuesto tiene: nombre, tasa, nivel de gobierno (nacional/provincial/municipal), normativa legal
- Resultado muestra barra visual de colores por nivel + secciones expandibles
- CategorySlider muestra desglose individual al hacer click en "~$X en imp."
- Nafta: ICL, CO2, infraestructura hídrica, gasoil desglosados
- Telecom: impuesto interno 17%, ENACOM, FSU desglosados
- Servicios públicos: alumbrado municipal, fondos fideicomiso, tasas regulatorias
- Auto: patente + IVA/IIBB/SSN/bomberos del seguro + VTV como costo regulatorio
- Sección "Costos Regulatorios" separada
- Card shareable 1080x1080 para Instagram/WhatsApp
- Mobile first (480px max)

## IDENTIDAD VISUAL

```
--bg: #0A0A0A          (negro)
--surface: #111111
--surface-2: #1A1A1A
--accent: #FF3B3B       (rojo urgente)
--accent-2: #FF8C00     (naranja alerta)
--text: #F5F5F0
--text-muted: #888888
--border: #2A2A2A
```

Niveles de gobierno en el desglose:
- Nacional: #FF3B3B (rojo)
- Provincial: #FF8C00 (naranja)  
- Municipal: #FFD600 (amarillo)

## COMANDOS

```bash
npm install          # Instalar deps
npm run dev          # Dev server
npm run build        # Build producción → dist/
```

## DEPLOY

Cloudflare Pages conectado al repo. Cada push al branch se deploya automáticamente.
Si no funciona el auto-deploy:
```bash
npx wrangler login
npx wrangler pages deploy dist/ --project-name=transparencia-fiscal
```
