const fs = require("fs");
const readline = require("readline");
const { logger } = require('./utils/logging');

const getLast10Lines = (filename) => {
    return new Promise((resolve, reject) => {
        fs.accessSync(filename, error => {
            reject( error )
        });
        let lines = [];
        let r1 = readline.createInterface({
            input: fs.createReadStream(filename),
            output: process.stdout,
            terminal: false
        });
        
        r1.on('error', error => {
            reject(error);
        });

        r1.on('line', input => {
            lines.push(input)
        });
    
        r1.on('close', () => {
            lastLine = lines.length > 0 ? lines[lines.length-1] : '';
            logger.info({
                message: "last 10 lines requested",
                lines: lines
            })
            resolve(lines.slice(-10));
        });
    })
}

const getNewAddedLines = (filename) => {
    return new Promise((resolve, reject) => {
        fs.accessSync(filename, error => {
            reject( error )
        });

        let lines = [];
        let register = false;
        let r1 = readline.createInterface({
            input: fs.createReadStream(filename),
            output: process.stdout,
            terminal: false
        });

        r1.on('line', input => {
            if (register || lastLine == '') {
                lines.push(input)
            } else if (input === lastLine) {
                register = true;
            }
        });
    
        r1.on('close', () => {
            lastLine = lines.length > 0 ? lines[lines.length-1] : '';
            logger.info({
                message: "new lines added",
                lines: lines
            })
            resolve(lines);
        });
    })
}

module.exports = {
    getLast10Lines,
    getNewAddedLines
}