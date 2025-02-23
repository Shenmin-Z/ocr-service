import express from 'express'
import bodyParser from 'body-parser'
import multer from 'multer'
import { resolve, dirname } from 'node:path'
import { mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { runNDL_OCR, getResult, deleteFiles } from './run-ocr.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = 3000

app.use(bodyParser.json())

app.get('/health-check', (_, res) => {
  res.send('OK!')
})

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const { bookName } = req.body
    const path = resolve(__dirname, 'uploads', bookName, 'img')
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true })
    }
    cb(null, path)
  },
  filename(req, file, cb) {
    cb(null, file.originalname)
  },
})
const upload = multer({
  storage,
})

let busy = false

// curl -H "Content-Type: application/json" --data '{"bookName":"123"}' http://localhost:3000/start-ocr
app.post('/start-ocr', upload.fields([{ name: 'image' }]), async (req, res) => {
  try {
    if (busy) {
      res.json({ status: 'busy' })
      return
    }
    busy = true

    const { bookName } = req.body
    await runNDL_OCR(bookName)
    const result = getResult(bookName)
    deleteFiles()
    res.json({ status: 'ok', result })
  } catch (e) {
    res.json({ status: 'failed' })
  } finally {
    busy = false
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
