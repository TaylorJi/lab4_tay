const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

let dictionary = [];
let counter = 0;

http.createServer((req, res) => {
    const q = url.parse(req.url, true);
    const headers = {
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',  // to allow cross-origin requests
        'Access-Control-Allow-Methods': 'GET, POST'
    };

    if (q.pathname === '/search') {
        fs.readFile(path.join(__dirname, 'search.html'), (err, data) => {
            if (err) {
                res.writeHead(404, headers);
                res.end(JSON.stringify({ error: "Not Found Search" }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return // return to prevent the rest of the code from running
    }

    if (q.pathname === '/') {
        fs.readFile(path.join(__dirname, 'store.html'), (err, data) => {
            if (err) {
                res.writeHead(404, headers);
                res.end(JSON.stringify({ error: "Not Found Search" }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return // return to prevent the rest of the code from running
    }


    if (q.pathname === "/api/definitions/" && req.method === "POST") {
        let body = "";
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            const { word, definition } = JSON.parse(body);
            if (!word || !definition || !/^[a-zA-Z\s]+$/.test(word)) { // check if word and definition are valid, and if word contains only letters and spaces
                res.writeHead(400, headers);
                res.end(JSON.stringify({ error: "Invalid word or definition provided." }));
                return;  // callback exits the function
            }
            // check if word already exists in the dictionary
            const existing = dictionary.find(item => item.word.toLowerCase() === word.toLowerCase());
            if (existing) {
                res.writeHead(400, headers);
                res.end(JSON.stringify({ error: `The word '${word}' already exists in the dictionary.` }));
                return; // callback exits the function
            }
            // if word is valid and doesn't exist, add it to the dictionary
            dictionary.push({ word, definition });
            counter++;
            res.writeHead(200, headers);
            res.end(JSON.stringify({
                message: `Request #${counter}\nNew entry recorded:\n${word} : ${definition}`
            }));
        });
    } else if (q.pathname === "/api/definitions/" && req.method === "GET") {
        const { word } = q.query; // get the word from the query string
        if (!word || !/^[a-zA-Z\s]+$/.test(word)) { // check if word is valid
            res.writeHead(400, headers);
            res.end(JSON.stringify({ error: "Invalid word provided." }));
            return;  // callback exits the function
        }
        const entry = dictionary.find(item => item.word.toLowerCase() === word.toLowerCase()); // case insensitive, make them all lowercase
        counter++;
        // if word is not found, return 404, otherwise return the word and definition
        if (!entry) {
            res.writeHead(404, headers);
            res.end(JSON.stringify({ message: `Request#${counter}, word '${word}' not found!` }));
            return;  // callback exits the function
        }
        res.writeHead(200, headers);
        res.end(JSON.stringify({ 
            message: `Request #${counter}\nWord found:\n${entry.word} : ${entry.definition}`
         }));
    } else {
        res.writeHead(404, headers);
        res.end(JSON.stringify({ error: "Not Found" }));
    }
}).listen(10000, () => {
    console.log('Backend server is running on http://localhost:10000/');
});