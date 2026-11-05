# Boundary --- 3D Cricket Stadium Operations

Boundary is an interactive, browser-based 3D cricket stadium operations
dashboard and match-day simulator. It combines a low-poly 3D stadium
scene with an operations interface for exploring stadium areas,
monitoring simulated match-day activity, and trying basic operational
actions.

> **Project status:** Front-end prototype. The match score, attendance,
> gate telemetry, concession data, transport information, alerts, and
> other operational figures are currently sample/simulated data. The
> project does not currently connect to a live cricket scoring provider,
> real stadium sensors, a database, or a production operations backend.

## Features

-   **Interactive 3D stadium:** Explore the stadium scene and switch
    between areas such as the field, stands, gates, parking, and metro.
-   **Match centre:** View a sample cricket match state, including runs,
    wickets, overs, target, run rates, batter and bowler details.
-   **Match-day timeline:** Select milestones such as gates opening,
    toss, powerplay, innings break, chase phase, and result ceremony.
-   **Operations dashboard:** Review sample gate activity, turnstile
    lanes, queue/wait times, concession stalls, stock levels, revenue,
    and transport status.
-   **Operational actions:** Try actions such as toggling a gate lane,
    restocking a concession, and changing the simulated weather state.
-   **Detail inspector:** Select supported 3D entities or operational
    rows to inspect their details and available actions.
-   **Alerts panel:** Review sample operational alerts and acknowledge
    unresolved items.
-   **Character Studio:** Open a 3D character customisation experience,
    preview outfit options, and trigger character emotes.
-   **Weather and ambience:** Switch the simulated weather/scene state
    and use procedural sound effects.
-   **Cinema mode:** Hide the dashboard overlays to focus on the 3D
    stadium. Press **H** to toggle cinema mode.

## Technology Stack

-   [React](https://react.dev/) 19
-   [TypeScript](https://www.typescriptlang.org/)
-   [Vite](https://vite.dev/) 8
-   [Three.js](https://threejs.org/) for 3D rendering
-   [Tailwind CSS](https://tailwindcss.com/) 4 with the Vite plugin
-   [Lucide React](https://lucide.dev/) for icons
-   [Motion](https://motion.dev/) for interface animation
-   [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) for
    celebration effects
-   Web Audio API for procedural stadium sound effects

## Requirements

-   Node.js (use a current LTS release)
-   npm
-   A modern browser with WebGL support for the 3D scene

Check your installed versions:

``` bash
node -v
npm -v
```

## Getting Started

1.  Clone or download this repository.

2.  Open a terminal in the project root (the folder containing
    `package.json`).

3.  Install dependencies:

    ``` bash
    npm install
    ```

4.  Start the Vite development server:

    ``` bash
    npm run dev
    ```

5.  Open the local URL printed in the terminal. The project is
    configured to use port `3000` by default. If that port is already
    occupied, Vite may select another available port; use the exact URL
    and port shown in the terminal.

### Running in a Dev Tunnel

If you are using a VS Code Dev Tunnel or a forwarded port, start Vite so
it listens on all network interfaces:

``` bash
npm run dev -- --host 0.0.0.0 --port 3001
```

Forward the same port (`3001`) in the VS Code **Ports** panel and open
the forwarded URL. If the terminal reports that the port is already in
use, either stop the process using it or choose another port and forward
that same port.

## Available Scripts

  -----------------------------------------------------------------------
  Command                             Description
  ----------------------------------- -----------------------------------
  `npm run dev`                       Starts the Vite development server.

  `npm run build`                     Creates a production build in the
                                      `dist/` directory.

  `npm run preview`                   Serves the production build locally
                                      for preview.

  `npm run lint`                      Runs the TypeScript compiler
                                      without emitting files
                                      (`tsc --noEmit`).

  `npm run clean`                     Removes the generated `dist/`
                                      directory and `server.js` if
                                      present.
  -----------------------------------------------------------------------

To test a production build:

``` bash
npm run build
npm run preview
```

## Project Structure

``` text
boundary-3d-cricket-stadium/
├── public/
│   └── assets/                 # Public static assets
├── src/
│   ├── components/
│   │   ├── three/
│   │   │   ├── StadiumCanvas.tsx       # Three.js scene and canvas integration
│   │   │   ├── StadiumBuilder.ts       # Stadium scene construction
│   │   │   ├── MatchSimulator.ts       # Match simulation logic
│   │   │   ├── CrowdSystem.ts          # Stadium crowd system
│   │   │   └── PixarCharacterBuilder.ts# Procedural 3D character builder
│   │   ├── ui/
│   │   │   ├── TopNav.tsx              # Main navigation and scene controls
│   │   │   ├── KpiCards.tsx             # Match-day KPI cards
│   │   │   ├── MatchMilestoneTracker.tsx# Match timeline
│   │   │   ├── OperationsDrawer.tsx     # Gates, stalls and transport panels
│   │   │   ├── DetailInspector.tsx     # Selected entity details/actions
│   │   │   ├── AlertsModal.tsx          # Operational alerts
│   │   │   └── CharacterStudioModal.tsx # 3D character customisation
│   │   └── AudioEngine.ts               # Procedural audio effects
│   ├── types/
│   │   └── stadium.ts                   # Shared TypeScript data models
│   ├── App.tsx                          # Main application state and layout
│   ├── main.tsx                         # React entry point
│   └── index.css                        # Global styles and Tailwind imports
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## How to Use the Dashboard

1.  Start the application and wait for the 3D stadium scene to load.
2.  Use the top navigation to change the weather or focus the camera on
    a stadium area.
3.  Review the match KPIs and match-day timeline.
4.  Open the operations drawer to switch between gate, concession/stall,
    and transport information.
5.  Select a gate, stall, or supported stadium object to open its detail
    inspector.
6.  Try the available controls. For example, toggle a gate lane or
    restock a concession to see the sample dashboard state update.
7.  Open the alerts panel to acknowledge an alert.
8.  Open Character Studio to preview character outfits and emotes.
9.  Press **H** or use the cinema-mode control to hide or restore the
    dashboard overlays.

Some values are intentionally illustrative and should not be interpreted
as real match or venue information.

## Configuration and API Notes

The current checked-in front-end source uses local React state and
sample data. Although the dependency list includes the Google Gen AI SDK
and the project archive may contain Gemini-related environment
configuration, the inspected application source does not currently make
a Gemini API request.

There is no configured production database, authentication service, live
scoring integration, or real sensor feed in the current implementation.

If Gemini functionality is added later:

-   Keep the Gemini API key on a trusted server-side environment.
-   Do **not** expose a private API key in browser code or in variables
    prefixed with `VITE_`.
-   Add a server-side API route that validates requests and calls
    Gemini.
-   Document the required environment variable names in a separate
    `.env.example` file, using placeholder values only.

For local environment variables, keep secrets in an untracked
`.env.local` file and ensure `.env*` files containing real credentials
are ignored by Git. Never commit API keys, passwords, or private tokens.

## Troubleshooting

### The browser shows a blank white page

1.  Check the VS Code terminal for Vite or TypeScript errors.
2.  Open browser Developer Tools → **Console** and inspect the first red
    error.
3.  Open Developer Tools → **Network** and check whether JavaScript
    modules are returning errors such as `404`, `500`, or `504`.
4.  Confirm that the browser is using the same port that Vite reports in
    the terminal.
5.  Restart the development server after resolving the first underlying
    error.

### Port 3000 is already in use

Vite may automatically choose another port. Use the URL shown in the
terminal, or start on a known free port:

``` bash
npm run dev -- --host 0.0.0.0 --port 3001
```

### 3D scene does not render

-   Use a modern browser with WebGL enabled.
-   Update your graphics drivers/browser.
-   Try disabling browser extensions that interfere with WebGL.
-   Check the browser console for WebGL or shader errors.

### Dependency installation fails

Use a supported Node.js LTS release and try:

``` bash
npm install
```

If npm reports a dependency-resolution error, inspect the exact
conflicting package versions in `package.json` and the npm error output
before using `--force` or `--legacy-peer-deps`.

## Development Notes

-   Keep reusable TypeScript interfaces in `src/types/stadium.ts`.
-   Keep 3D scene construction and simulation logic in
    `src/components/three/`.
-   Keep dashboard and modal components in `src/components/ui/`.
-   Keep API credentials out of source control.
-   Clearly label simulated values if connecting real-world data in a
    future version.

## Future Enhancements

Possible next steps for evolving the prototype include:

-   Integrating a verified live cricket score API.
-   Adding a secure backend and persistent database.
-   Connecting real or simulated sensor streams to the operations
    dashboard.
-   Adding authentication and role-based access for stadium operators.
-   Adding historical match-day analytics, reports, and export tools.
-   Improving accessibility, mobile layouts, and automated tests.

## License

No license is currently specified. Add a `LICENSE` file before
distributing or reusing this project publicly.
