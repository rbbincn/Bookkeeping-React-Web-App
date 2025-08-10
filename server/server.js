// Simple Express server to serve Vite build and support SPA history fallback
import express from 'express'
import compression from 'compression'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8080
const dist = path.resolve(__dirname, '../dist')

app.use(compression())
app.use(express.static(dist, { index: false, maxAge: '1y', setHeaders(res, filePath) {
  if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache')
}}))

// SPA fallback for client-side routing
app.get('*', (req, res) => {
  // If the request looks like a file (has an extension), send 404
  if (path.extname(req.path)) {
    return res.status(404).send('Not found')
  }
  res.sendFile(path.join(dist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
