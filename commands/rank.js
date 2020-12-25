new Command({
    title: "Rank",
    desc: "Get someone's rank the current server.",
    category: "User Information",
    call: ['rank'],
    onCall: function(parsedArgs, args, message) {
        if (!message.guild) {
            message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to check a rank.`);
            return;
        }

        let sto = storage.guilds.get(message.guild.id);
        let [levels, leveling] = [sto.levels, sto.plugins.leveling];

        if (!leveling.enabled) {
            message.channel.msg(`${botInfo.emotes.fail}|The leveling plugin is currently disabled.`);
            return;
        }

        message.channel.startTyping(10);

        let targ = {user: message.author, member: message.member};

        if (args[0]) {
            let newTarg = findUser(args[0], message.guild);
            if (newTarg[0])
                targ = newTarg[0];
        }
        let lvl = levels[targ.user.id];
        if (!lvl) lvl = botInfo.def.level;

        let blevel = botInfo.leveling;
        let xptolvl = Math.round(blevel.base + (blevel.multiplier * (lvl.is - 1)));

        let points = [];
        let keys = Object.keys(levels);
        for (let i = 0; i < keys.length; i++) {
            let r = levels[keys[i]];

            if (!points.includes(r.totalExperience))
                points.push(r.totalExperience);
        }
        points.sort(function(a, b){return b - a});

        let rank = keys.length + 1;
        for (let i = 0; i < points.length; i++) {
            if (lvl.totalExperience == points[i]) {
                rank = i + 1;
            }
        }

        let [w, h] = [300, 100]; // Output image width and height
        let [aw, ah] = [h-16, h-16]; // Avatar image width and height
        let [bx, by, bw, bh] = [h, h-h/4, w-h-8, h/4-8]; // XP bar pos and size

        new Jimp(w, h, 0x00000064, (err, img) => {
            if (err) {
                console.log(err.stack);
                return;
            }

            new Jimp(bw, bh, 0x00000032, (err, xpBar) => {
                if (err) {
                    console.log(err.stack);
                    return;
                }

                xpBar.setDrawColor(0x0096ffff);
                xpBar.drawBox(0, 0, bw * (lvl.experience/xptolvl), bh);

                Jimp.read(targ.user.displayAvatarURL({format: "png", size: 128}), (err, avatar) => {
                    if (err) {
                        console.log(err.stack);
                        return;
                    }

                    Jimp.read(`${directory.images}/circle_mask.png`, (err, mask) => {
                        if (err) {
                            console.log(err.stack);
                            return;
                        }

                        Jimp.read(`${directory.images}/bar_mask.png`, (err, bm) => {
                            if (err) {
                                console.log(err.stack);
                                return;
                            }

                            avatar.resize(aw, ah);
                            mask.resize(aw, ah);

                            avatar.mask(mask, 0, 0);
                            img.blit(avatar, 8, 8);

                            bm.resize(bw, bh);
                            xpBar.mask(bm, 0, 0);
                            img.blit(xpBar, bx, by);

                            img.drawText(targ.user.tag, fonts.whiteSans16, h, 4, w-h, 16);
                            img.drawText(`Rank: ${rank}`, fonts.whiteSans16, h, 24, w-h, 16);

                            img.print(fonts.whiteSans16, bx, by-24, `Level: ${lvl.is}`, bw/2, 16);
                            img.print(fonts.whiteSans16, bx + bw/2, by-24, {text: `XP: ${lvl.experience}/${xptolvl}`, alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT}, bw/2, 16);

                            img.getBufferAsync(Jimp.MIME_PNG).then(imgData => {
                                message.channel.msg({files: [imgData]}).then(() => {message.channel.stopTyping(true);});
                            });
                        });
                    });
                });
            });
        });
    }
});
