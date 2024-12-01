export interface CSVParserOptions {
  delimiter?: string
  encoding?: BufferEncoding
  skipEmptyLines?: boolean
}

export interface CSVParserResult {
  data: Record<string, string>[]
  error?: Error
}
