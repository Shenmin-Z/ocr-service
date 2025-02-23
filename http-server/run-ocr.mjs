import { spawn } from 'node:child_process'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, rmSync, mkdirSync } from 'node:fs'
import { globSync } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function runNDL_OCR(bookName) {
  const input = resolve(__dirname, 'uploads', bookName)
  const output = resolve(__dirname, 'output', bookName)
  mkdirSync(output, { recursive: true })
  const ndlOcr = spawn('python', ['main.py', 'infer', input, output, '-a'], {
    cwd: resolve(__dirname, '../'),
  })

  return new Promise((res, rej) => {
    ndlOcr.on('error', rej)
    ndlOcr.on('close', (code) => {
      if (code === 0) {
        res('done')
      } else {
        rej(`exited with code ${code}`)
      }
    })
  })
}

export function getResult(bookName) {
  const output = resolve(__dirname, 'output', bookName)
  const jsonFiles = globSync('**/json/*.json', { cwd: output })

  const result = {}

  jsonFiles.forEach((f) => {
    try {
      const content = JSON.parse(readFileSync(resolve(output, f)))
      content.txt = content.contents.map((i) => i[4]).join('\n')
      result[basename(f)] = content
    } catch {}
  })

  return result
}

export function deleteFiles() {
  const input = resolve(__dirname, 'uploads')
  const output = resolve(__dirname, 'output')

  ;[(input, output)].forEach((dir) => {
    rmSync(dir, { recursive: true, force: true })
  })
}
