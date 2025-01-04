class appError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

// exporting individual clas
module.exports = appError;
