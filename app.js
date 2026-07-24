const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Jenkins CI/CD Pipeline! Rishabh This side\n');
});

server.listen(3000, () => console.log('App running on port 3000'));