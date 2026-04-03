import type { Request, Response, NextFunction } from "express";

type MonitoringOptions = {
  slowThresholdMs?: number;
};

export function monitorRequests(options: MonitoringOptions = {}) {
  const slowThresholdMs = options.slowThresholdMs ?? 2000;

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on("finish", () => {
      const durationMs = Date.now() - startTime;

      if (durationMs >= slowThresholdMs) {
        console.warn(`[slow] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`);
      }
    });

    next();
  };
}
