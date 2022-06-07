// import { NextFunction, Request, Response } from "express";
// import { BadRequestError } from "./errors";

/**
 * @param {Error} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 *
 * @returns {void}
 */

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.code = 400;
    this.name = "BadRequestError";
  }
}

export default function (err, req, res, next) {
  if (err instanceof BadRequestError) {
    return res.status(400).send({
      status: false,
      msg: err.message,
    });
  }
  res.status(500).send({
    status: false,
    msg: "System error",
  });
}
