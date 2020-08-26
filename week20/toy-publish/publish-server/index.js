const http = require('http');
const https = require('https');
const fs = require('fs');
const unzip = require('unzipper');

const server = http.createServer((req, res) => {

  if (req.url.match(/^\/auth/)) {
    return auth(req, res);
  }

  if (req.url.match(/^\/favicon.ico/)) {
    res.writeHead(404, {
      'Content-Type': 'text/plain'
    });
    res.end('Not Found');
    return;
  }

  // 文件系统部分 Start
  const fileSys = () => {
    let matched = req.url.match(/filename=([^&]+)/);
    let filename = (matched && matched[1]);
    // console.log(filename);
    if (!filename) {
      return;
    }

    // let writeStream = fs.createWriteStream('../server/public/' + filename);

    let writeStream = unzip.Extract({
      path: '../server/public'
    });
    req.pipe(writeStream);

    // 与 pipe 等效
    // req.on('data', trunk => {
    //   writeStream.write(trunk);
    // })
    // req.on('end', trunk => {
    //   writeStream.end(trunk);
    // })

    req.on('end', () => {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      });
      res.end('okay');
    })
  }
  // fileSys();
  // 文件系统部分 End

  // OAuth Start
  console.log(req.headers);

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/user',
    method: 'GET',
    headers: {
      Authorization: `token ${req.headers.token}`,
      'User-Agent': 'toy-publish',
    },
  };
  console.log('options ' + options);

  const request = https.request(options, (response) => {
    let body = '';
    response.on('data', (d) => {
      if (d) {
        body += d.toString();
      }
    });

    response.on('end', () => {
      console.log(body);
      let user = JSON.parse(body);
      const writeStrem = unzip.Extract({
        path: '../server/public'
      });
      req.pipe(writeStrem);
      req.on('end', () => {
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end('okay');
      });
    });
  });
  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
})

server.listen(8081);

function auth(req, res) {
  let code = req.url.match(/code=([^&]+)/)[1];
  console.log(code);

  let state = 'abc123';
  let client_id = 'Iv1.ab67a7893d5befda';
  let client_secret = '8a34d7d7ca32c39f47d878d63235ed6c5406cbfb';
  let redirect_uri = encodeURIComponent('http://localhost:8081/auth');

  // let authURI = `https://github.com/login/oauth/authorize?client_id=Iv1.ab67a7893d5befda&redirect_uri=${encodeURIComponent('http://localhost:8000')}`

  // let code = '191982a60dc6dbda7a91';
  let params = `code=${code}&state=${state}&client_secret=${client_secret}&client_id=${client_id}&redirect_uri=${redirect_uri}`;

  // let xhr = new XMLHttpRequest;
  // xhr.open('POST', `https://github.com/login/oauth/access_token?${params}`, true);
  const url = `https://github.com/login/oauth/access_token?${params}`

  const options = {
    hostname: 'github.com',
    port: 443,
    path: `/login/oauth/access_token?${params}`,
    method: 'POST',
  }

  const request = https.request(options, (response) => {
    response.on('data', (d) => {
      console.log(d.toString());
      let result = d.toString().match(/access_token([^&]+)/);
      if (result) {
        let token = result[1];
        res.writeHead(200, {
          'access_token': token,
          'Content-Type': 'text/html'
        });
        res.end(`<a href="http://localhost:8080/publish?token${token}">publish</a>`);
      } else {
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end('error');
      }
    });
  })

  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
}