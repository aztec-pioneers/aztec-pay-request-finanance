import { handleRequest } from "./src/routes";

const server = Bun.serve({
  port: process.env.PORT || 3001,
  hostname: "0.0.0.0",
  fetch: handleRequest,
});

console.log(`Backend running at http://localhost:${server.port}`);
