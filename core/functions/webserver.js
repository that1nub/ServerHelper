global.encryption = {
    key: "6pOvVAhTp9pmCBNbgPbgbEC2EwC1zHUh",
    pass: "Password"
}

http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(req.url);
    res.end();
}).listen(42069);
