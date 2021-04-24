http.createServer(function(req, res) {        
    let body = '';
    req.on('data', function(data) {
        body += data;
    });
    req.on('end', function() {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        if (req.method === "POST") {
            let posted = {};

            let query = body.split('&');
            for (let i = 0; i < query.length; i++) {
                let sides = query[i].split('=');
                posted[decodeURIComponent(sides[0])] = decodeURIComponent(sides[1]);
            }

            if (storage.guilds.get(posted['guild_id'])) {
                res.write("Success!");
                syncGuild(posted['guild_id']);
            } else {
                res.write("Invalid Guild ID: not on guild or guild doesn't exist");
            }
        } else {
            res.write("mhm, you aren't the correct application, are you. you shouldn't be here.");
        }
        res.end();
    });
}).listen(42069);
