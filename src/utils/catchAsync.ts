import { Request, Response, NextFunction, RequestHandler } from "express";

const catchAsync =
  <
    P = any,
    ResBody = any,
    ReqBody = any,
    ReqQuery = any,
    Locals extends Record<string, any> = Record<string, any>,
  >(
    fn: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>,
  ): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> =>
  (
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction,
  ) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default catchAsync;
