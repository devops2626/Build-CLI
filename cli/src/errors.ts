export class CliError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'CliError';
  }
}

export class FetchError extends CliError {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message, 'FETCH_ERROR');
    this.name = 'FetchError';
  }
}
