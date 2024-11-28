import { resolve } from 'node:path'
import { CSVToJSONConverter } from './index'

async function main() {
  const converter = new CSVToJSONConverter()
  const json = await converter.convert(resolve(__dirname, '../example.csv'))
  console.log(json)
}

main()
