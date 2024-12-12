class CustomError extends Error {
  constructor(error) {
    super(error.message);
    this.code = error.code;
    this.name = 'Custom Error';
  }
}

export default CustomError;
