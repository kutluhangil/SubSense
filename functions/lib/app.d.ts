import express from "express";
declare const app: import("express-serve-static-core").Express;
export declare const authenticate: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<void>;
export default app;
