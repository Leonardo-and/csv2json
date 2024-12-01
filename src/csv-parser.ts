import { createReadStream } from 'node:fs'
import { extname } from 'node:path'
import { createInterface } from 'node:readline'
import { CSVParserOptions, CSVParserResult } from './types'
import { CSVParserError } from './errors'

export class CSVParser {
  private static readonly DEFAULT_OPTIONS: CSVParserOptions = {
    delimiter: ',',
    encoding: 'utf-8' as BufferEncoding,
    skipEmptyLines: true,
  } as const

  private readonly options: typeof CSVParser.DEFAULT_OPTIONS

  constructor(options: CSVParserOptions = {}) {
    this.options = {
      ...options,
      ...CSVParser.DEFAULT_OPTIONS,
    }
  }

  private validateFile(filePath: string) {
    if (!filePath) {
      throw new CSVParserError('File path is required')
    }

    const fileExtension = extname(filePath).toLowerCase()
    if (fileExtension !== '.csv') {
      throw new CSVParserError(
        'Invalid file type. Only CSV files are supported.',
      )
    }
  }

  private parseLine(
    line: string,
    headers?: string[],
  ): Record<string, string> | string[] {
    const cells = line
      .split(this.options.delimiter as string)
      .map((cell) => cell.trim())

    if (!headers) {
      return cells
    }

    return headers.reduce(
      (obj, header, index) => {
        obj[header] = cells[index] || ''
        return obj
      },
      {} as Record<string, string>,
    )
  }

  public async parse(filePath: string): Promise<CSVParserResult> {
    let readStream
    try {
      this.validateFile(filePath)

      readStream = createReadStream(filePath, {
        encoding: this.options.encoding,
      })

      const rl = createInterface({
        input: readStream,
        crlfDelay: Infinity,
      })

      const data: Record<string, string>[] = []
      let headers: string[] | undefined

      for await (const line of rl) {
        const sanitizedLine = line.trim()
        if (!sanitizedLine && this.options.skipEmptyLines) continue

        if (!headers) {
          headers = this.parseLine(sanitizedLine) as string[]
          continue
        }

        const parsedLine = this.parseLine(sanitizedLine, headers) as Record<
          string,
          string
        >
        data.push(parsedLine)
      }

      return { data }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      return {
        data: [],
        error,
      }
    } finally {
      if (readStream) {
        readStream.destroy()
      }
    }
  }

  public async parseToJSON(filePath: string): Promise<string> {
    const { data, error } = await this.parse(filePath)

    if (error) {
      throw error
    }

    return JSON.stringify(data, null, 2)
  }

  async convert(filePath: string): Promise<string | null> {
    try {
      const isCsv = extname(filePath) === '.csv'
      if (!isCsv) {
        throw new Error('File is not a CSV file')
      }

      const readStream = createReadStream(filePath, { encoding: 'utf-8' })
      const rl = createInterface({ input: readStream })

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
