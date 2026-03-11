import { handleRequest } from "./src/routes";

const server = Bun.serve({
  port: 3001,
  fetch: handleRequest,
});

console.log(`Backend running at http://localhost:${server.port}`);
