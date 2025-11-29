import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { createProxyMiddleware } from "http-proxy-middleware";

const PYTHON_BACKEND = 'http://localhost:5001';

async function proxyToPython(req: Request, res: Response) {
  const path = req.originalUrl;
  const url = `${PYTHON_BACKEND}${path}`;
  
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? JSON.stringify(req.body) 
        : undefined,
    });
    
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json') 
      ? await response.json() 
      : await response.text();
    
    res.status(response.status);
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(502).json({ error: 'Python backend not available' });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  const socketProxy = createProxyMiddleware({
    target: PYTHON_BACKEND,
    changeOrigin: true,
    ws: true,
    logger: console,
  });
  
  app.use('/socket.io', socketProxy);
  
  httpServer.on('upgrade', (req, socket, head) => {
    if (req.url?.startsWith('/socket.io')) {
      (socketProxy as any).upgrade(req, socket, head);
    }
  });
  
  app.all('/api/*', proxyToPython);

  return httpServer;
}
