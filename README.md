# Bookkeeping Web App

https://bookkeeping-web-app.vercel.app/

This is a Bookkeeping React application.
- React + TypeScript + Vite frontend, Redux Toolkit for state, Chart.js for analytics,
- Mock frontend backend (simulates latency)
- Reusable components: TransactionForm, Pagination, TransactionList
- Unit testing setup (Jest + React Testing Library)
- E2E: Cypress
- Express: HTTP server with SPA history fallback
- Containerized via Docker

## Features
- CRUD: create, read (paginated), update, delete transactions
- Filters: by date range, type, and category
- History & Analytics: monthly summary, totals, and a bar chart (Chart.js)
- Mock backend: localStorage + artificial latency and random error injection
- Custom reusable components: `Pagination`, `TransactionTable` (no third‑party UI libs)
- Tests: Jest unit tests and Cypress E2E
- Containerization: multi-stage Dockerfile

## Project Structure

- `src/`: Contains the source code for the application.
  - `main.tsx`: Entry point of the application.
  - `components/`: Contains React components.
    - `Pagination` built from scratch.
    - `TransactionForm`, `TransactionTable` is handcrafted (no third-party UI libraries).
- `index.html`: Main HTML file for the application.
- `tsconfig.json`: TypeScript configuration file.
- `package.json`: npm configuration file.

## Setup Instructions

### 1. Clone the repository:
   ```
   git clone https://github.com/rbbincn/Bookkeeping-React-Web-App.git
   ```

### 2. Install dependencies:
   ``` 
   npm install
   ```

### 3. Getting Started (Local)
```bash
npm install
npm run dev
# open http://localhost:5173
```

### 4. Build & Serve (Production-like)
```bash
npm run build
npm start
# open http://localhost:8080
```

### 5. The Express server:
- Serves `/dist` with long-term caching for static assets.
- Sends `index.html` as a fallback for all non-file GETs, supporting client-side routing (history mode).

## Testing

This project includes **unit tests** (Jest + React Testing Library) and **end-to-end (E2E) tests** (Cypress) to ensure both business logic correctness and critical user flows.

### 1. Unit & Component Tests (Jest + RTL)

Located in `src/__tests__/`, covering:

- **Redux Slice Logic (sync + async)**  
  - `transactionsSlice.test.ts`: `setFilters` updates filter state & pagination.
  - `transactionsSlice.async.test.ts`: `fetchList`, `createTx` (Create), `updateTx` (Update), `deleteTx` (Delete) — with mocked API, asserting `loading/error` and list refresh.
- **Custom Components**  
  - `pagination.test.tsx`: Pagination interactions (Prev/Next, page changes).  
  - `TransactionForm.test.tsx`: Form validation (numeric amount), successful submit callback.  
  - `TransactionTable.test.tsx`: Edit/Delete callbacks, empty state rendering.
- **Utility Functions**  
  - `utils.validation.test.ts`: `isNumeric` positive/negative cases.

> Run unit tests:
```bash
npm test
# or with coverage
npm test -- --coverage
```

### 2. End-to-End Tests (Cypress)

Located in `cypress/e2e/`, covering:

- **Add / Delete / Edit**: End-to-end flows for creating, deleting, and editing transactions.
- **Filtering**: By **Category Type** with assertions ensuring results match the filter criteria.
- **Pagination**: Navigation controls update the page and display the correct data.
- **Stability**: To avoid intermittent failures from the mock API’s 8% random network error, tests stub `Math.random` for deterministic behavior.

> Run E2E tests:
```bash
# 1: start dev server
npm run dev

# 2: open Cypress UI, run headless
npm run cy:run
```

## Docker
Build and run the container:
```bash
docker build -t bookkeeping-app
docker run -p 8080:8080 --name bookkeeping bookkeeping-app
```

## Performance & Deployment Notes
- **CDN**: Static assets in `dist/assets` are cached via Vercel’s built-in global CDN with long-term immutable caching (Cache-Control: public, max-age=31536000, immutable).
- **Deployment**: using vercel binding github

## Live URL
- https://bookkeeping-web-app.vercel.app/