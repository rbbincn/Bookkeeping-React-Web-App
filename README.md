# Bookkeeping Web App

This is a Bookkeeping React application.
- React + TypeScript + Vite frontend, Redux Toolkit for state, Chart.js for analytics,
- Mock frontend backend (simulates latency)
- Reusable components: TransactionForm, Pagination, TransactionList
- Unit testing setup (Jest + Testing Library)
- E2E: Cypress
- Express: HTTP server with SPA history fallback
- Containerized via Docker

## Features
- CRUD: create, read (paginated), update, delete transactions
- Filters: by date range, type, and category
- History & Analytics: monthly summary, totals, and a bar chart (Chart.js)
- Mock backend: localStorage + artificial latency and random error injection
- Custom reusable components: `DatePicker`, `Pagination`, `TransactionForm` (no third‑party UI libs)
- Tests: Jest unit tests and Cypress E2E
- Deployment: Express serves static `dist` with proper SPA fallback for history mode
- Containerization: multi-stage Dockerfile

## Project Structure

- `src/`: Contains the source code for the application.
  - `main.tsx`: Entry point of the application.
  - `components/`: Contains React components.
    - `DatePicker`, `Pagination` built from scratch.
    - `TransactionForm`, `TransactionTable` is handcrafted (no third-party UI libraries).
- `index.html`: Main HTML file for the application.
- `tsconfig.json`: TypeScript configuration file.
- `package.json`: npm configuration file.

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/rbbincn/Bookkeeping-React-Web-App.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Getting Started (Local Dev)
```bash
npm install
npm run dev
# open http://localhost:5173
```

## Build & Serve (Production-like)
```bash
npm run build
npm start
# open http://localhost:8080
```

The Express server:
- Serves `/dist` with long-term caching for static assets.
- Sends `index.html` as a fallback for all non-file GETs, supporting client-side routing (history mode).

## Testing
**Unit tests**
```bash
npm test
```

**E2E (Cypress)**
In one terminal:
```bash
npm run dev
```
In another:
```bash
npm run cy:open   # or npm run cy:run
```

## Docker
Build and run the container:
```bash
docker build -t bookkeeping-app
docker run -p 8080:8080 --name bookkeeping bookkeeping-app
```

## Performance & Deployment Notes
- **CDN**: Static assets in `dist/assets` are cached via Vercel’s built-in global CDN with long-term immutable caching (Cache-Control: public, max-age=31536000, immutable).