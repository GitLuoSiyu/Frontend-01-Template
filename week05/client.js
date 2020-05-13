const net = require('net');

class Request {
    constructor(options) {
        this.method = options.method || "GET"
        this.host = options.host
        this.port = options.port || '8080'
        this.path = options.path || '/'
        this.headers = options.headers || {}
        this.body = options.body || {}
        this.bodyText = ''

        if (this.headers["Content-Type"] === undefined) {
            this.headers["Content-Type"] = "application/x-www-form-urlencoded"
        }

        if (this.headers["Content-Type"] === "application/x-www-form-urlencoded") {
            this.bodyText = Object.keys(this.body).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(this.body[key])}`).join("&")
        } else if (this.headers["Content-Type"] === "application/json") {
            this.bodyText = JSON.stringify(this.body)
        }

        this.headers["Content-Length"] = this.bodyText.length
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join("\r\n")}
\r
${this.bodyText}`
    }

    send(client) {
        if (client) {
            client.write(this.toString())
        } else {
            const responseParser = new ResponseParser()
            return new Promise((resolve, reject) => {
                client = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    client.write(this.toString())
                });
                client.on('data', (data) => {
                    responseParser.receive(data.toString())
                    console.log(responseParser.statusLine)
                    console.log(responseParser.headers)
                    // resolve(data.toString());
                    client.end();
                });
                client.on('error', (error) => {
                    reject(error)
                    client.end()
                });
            })

        }
    }
}


class ResponseParser {
    constructor() {
        this.WAITING_STATUS_LINE = 0
        this.WAITING_STATUS_LINE_END = 1
        this.WAITING_HEADER_NAME = 2
        this.WAITING_HEADER_SPACE = 3
        this.WAITING_HEADER_VALUE = 4
        this.WAITING_HEADER_LINE_END = 5
        this.WAITING_HEADER_BLOCK_END = 6
        this.WAITING_BODY = 7

        this.current = this.WAITING_STATUS_LINE
        this.statusLine = ''
        this.headers = {}
        this.headerName = ''
        this.headerValue = ''
    }

    receive(string) {
        console.log(string, 1111)
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i))
        }
    }

    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
                this.current = this.WAITING_STATUS_LINE_END
            } else {
                this.statusLine += char
            }
        } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME
            }
        } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
                this.current = this.WAITING_HEADER_SPACE
            }
            if (char === '\r') {
                this.current = this.WAITING_BODY
            } else {
                this.headerName += char
            }
        } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
                this.current = this.WAITING_HEADER_VALUE
            }
        } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_LINE_END
                this.headers[this.headerName] = this.headerValue
                this.headerName = ""
                this.headerValue = ""
            } else {
                this.headerValue += char
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME
            }
        }
    }
}



void async function () {
    const request = new Request({
        method: 'POST',
        host: "127.0.0.1",
        port: 8088,
        path: '/',
        headers: {
            "X-Foo": "11111"
        },
        body: {
            name: 'winter'
        }
    })

    const response = await request.send()
    console.log(response)
}()