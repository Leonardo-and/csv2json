import { createReadStream } from 'node:fs'
import { resolve, extname } from 'node:path'
import readline from 'node:readline'

export class CSVToJSONConverter {
  async convert(filePath: string): Promise<string | null> {
    try {
      const isCsv = extname(filePath) === '.csv'
      if (!isCsv) {
        throw new Error('File is not a CSV file')
      }

      const readStream = createReadStream(filePath, {encoding: 'utf-8'})
      const rl = readline.createInterface({input: readStream})

      const jsonData: Record<string, string>[] = []

      let header: string[] | null = null

      for await (const line of rl) {
        const sanitizedLine = line.trim()
        if (!sanitizedLine) continue

        const cells = sanitizedLine.split(',').map((cell) => cell.trim())
        if (!header) {
            header = cells
        } else {
            const obj: Record<string, string> = {}
            header.forEach((header, index) => {
                obj[header] = cells[index] || ''
            })
            jsonData.push(obj)
        }
      }

      return JSON.stringify(jsonData, null, 2)
    } catch (error) {
      console.error('Error:', error)
      return null
    }
  }
}
