function s(o) {
    return JSON.stringify(o);
}

bot.on('guildCreate', guild => {
    try {
        let plugins = botInfo.def.guilds.plugins; 

        DataBase.query(
            `INSERT INTO guilds VALUES ('${guild.id}', '${guild.ownerID}')`
        );

        DataBase.query(
            `INSERT INTO guildConfig VALUES ('${guild.id}', '${plugins.prefix}', '${s(plugins.modroles)}', '${s(plugins.strike_punishments)}', '${s(plugins.join)}', '${s(plugins.leave)}', '${s(plugins.selfassign)}', '${s(plugins.auto_moderation)}', '${s(plugins.leveling)}', '${s(plugins.logging)}')`.replace(/"/g, '\\"')
        );

        DataBase.query(
            `CREATE TABLE \`applications_${guild.id}\` (
                applicationID varchar(10) NOT NULL, 
                title varchar(100), 
                description text, 
                acceptingResponses tinyint(1) DEFAULT '1', 
                acceptedRoles longtext        DEFAULT '[]', 
                questions longtext            DEFAULT '[]', 
                responses longtext            DEFAULT '[]', 
                blacklisted longtext          DEFAULT '[]', 
                PRIMARY KEY (applicationID)
            )`
        );
    } catch (err) {
        console.log(err.stack);
    }
});
