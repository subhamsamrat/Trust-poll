import 'dotenv/config';
import http from 'http';
import app from "./src/app.js";
import { initSocket } from "./src/socket/socket.js";

const PORT = process.env.PORT || 6000;

async function main() {
  try {
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log('Fail to start Server', error);
  }
}
main();

