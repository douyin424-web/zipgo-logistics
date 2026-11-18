'use strict';

class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code || undefined;
  }
}

const badRequest = (message) => new HttpError(400, message, 'bad_request');
const unauthorized = (message = 'Please log in again.') => new HttpError(401, message, 'unauthorized');
const forbidden = (message = 'You are not allowed to do this.') => new HttpError(403, message, 'forbidden');
const notFound = (message = 'Not found.') => new HttpError(404, message, 'not_found');
const conflict = (message) => new HttpError(409, message, 'conflict');
const tooMany = (message = 'Too many requests. Please wait a minute and try again.') => new HttpError(429, message, 'rate_limited');

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict, tooMany };
