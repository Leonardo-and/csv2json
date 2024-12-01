import { resolve } from 'node:path'
import { CSVParser } from './index'

async function main() {
  try {
    const parser = new CSVParser({
      delimiter: ',',
      skipEmptyLines: true,
      encoding: 'utf-8',
    })

    const result = await parser.parseToJSON(resolve(__dirname, 'example.csv'))

    console.log(result)
  } catch (error) {
    console.error('Error: ' + error)
    process.exit(1)
  }
}

main()
