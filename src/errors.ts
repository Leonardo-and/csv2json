export class CSVParserError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CSVParserError'
  }
}
