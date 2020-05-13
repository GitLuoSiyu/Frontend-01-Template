const http = require('http')

const serve = http.createServer((req, res) => {
  console.log(req.headers)
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('X-Foo', 'bar')
  res.writeHead(200, { 'Content-Type': 'plain' })
  res.end('ok')
})

serve.listen(8088)