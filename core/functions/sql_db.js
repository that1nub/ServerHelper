try {
    let db = botInfo.database;
    MySQL.createConnection({
        host: db.host,
        database: db.database,
        user: db.user,
        password: db.password,
        multipleStatements: true
    }).then(connection => {
        global.DataBase = connection;
    }).catch(console.log);
} catch (err) {
    console.log(err);
}

global.syncGuild = function(guildID) {
    if (DataBase !== undefined) {
        try {
            DataBase.query(`SELECT * FROM guildConfig WHERE guildID = ${guildID}`)
            .then(result => {
                let res = result[0][0];
                cache.guilds.set(guildID, res);
                cache.lastSync.set(guildID, Date.now());

                if (storage.guilds.get(guildID)) {
                    storage.guilds.get(guildID).plugins.prefix = res.prefix;
                    if (!toSave.guilds.has(guildID)) toSave.guilds.add(guildID);
                }
            }).catch(console.log);
        } catch (err) {
            console.log(err.stack);
        }
    }
}
