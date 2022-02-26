const http = require("http");
const fs = require("fs");
const WebSocketServer = require('websocket').server;
const getLast10Lines = require('./utils.js').getLast10Lines;
const getNewAddedLines = require('./utils.js').getNewAddedLines;
const { logger } = require('./utils/logging');

const LOGFILE = "test.txt";
const PORT = 8000; //can use env later

let lastLine;
const server = http.createServer(function (req, res) {
    if (req.url == "/getAllLines"){
        fs.readFile(LOGFILE, function (err, data) {
            if (err) {
                logger.error(err.message);
                res.writeHead(404, {'content-type': 'text/html'});
                res.write(`${LOGFILE} not found.`);
                res.end();
            }
            else {
                res.write(data);
                res.end();
            }
        });
    }
})

server.listen(PORT, function(){
    logger.info(`server listening on ${8000}`);
});

wsServer = new WebSocketServer({
    httpServer: server
});

let connections = [];

wsServer.on('request', function(request) {
    connections.push(request.accept(null, request.origin));
});

wsServer.on('connect', connection => {
    getLast10Lines(LOGFILE)
    .then(lines => {
        connection.send(lines);
    })
    .catch(err => {
       connection.send(JSON.stringify( err ));
    });
    
    connection.on('close', function(connection) {
        let i = connections.indexOf(connection);
        connections.splice(i, 1)
    });
});

fs.watchFile(LOGFILE, (curr, prev) => {

    if (curr.ctimeMs == 0) {
        connections.forEach( c => {
            c.send(JSON.stringify( { error: "File doesn't exists at the moment." } ));
        });
    } else if (curr.mtime !== prev.mtime){
        getNewAddedLines(LOGFILE, lastLine)
        .then(lines => {
            if (lines.length > 0) {
                connections.forEach( c => {
                    c.send( lines );
                });
            }
        })
        .catch(error => {
            connections.forEach( c => {
                c.send(JSON.stringify( { error } ));
            });
        });
    }
});