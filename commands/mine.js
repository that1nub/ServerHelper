let mineCost = 10; // How much it costs to mine
let cooldown = time.m * 5; // How long a normal person must wait to mine

let orePrice = {
    coal: 8.50,
    copper: 14.30,
    iron: 24.98,
    gold: 42.34,
    diamond: 79.43
};

new Command({
    title: "Mine",
    desc: "Mine some blocks.",
    call: ['mine'],
    onCall: function(parsedArgs, args, message) {
        // Make sure they have a mine generated
        message.author.checkMine();

        let data = storage.users.get(message.author.id);
        let mine = data.mine;
        let inv  = data.inventory.mine;

        // This is an object if their message includes "-regen"
        // This will let them "mine -regen {user}"
        if (parsedArgs.regen) {
            // They must be a developer to use this command
            if (botInfo.developers.includes(message.author.id)) {
                // If they specify another argument, find a user from it
                if (parsedArgs.regen.length > 0) {
                    let targs = findUser(parsedArgs.regen.join(' '));
                    if (targs.length == 1) {
                        // findUser returns a structure like this: [{user: Discord.User, member: Discord.GuildMember}]
                        // member is only defined if the second argument is a Discord.Guild object
                        let targ = targs[0].user;

                        // Make sure the target has data to begin with
                        targ.setupStorage();

                        // The "true" argument forces a new generation
                        targ.checkMine(true);

                        message.channel.msg(`${botInfo.emotes.success}|Regenerated **${targ.tag}**'s mine.`);
                    } else if (targs.length > 1) message.channel.msg(`${botInfo.emotes.fail}|More than one user found.`);
                    else message.channel.msg(`${botInfo.emotes.fail}|No users found.`);
                } else { // If they left the argument blank for "-regen", they must be targetting themself
                    message.author.checkMine(true);
                    message.channel.msg(`${botInfo.emotes.success}|Regenerated **your** mine.`);
                }
            } else message.channel.msg(`${botInfo.emotes.fail}|You must be a developer to use this.`);
            return;
        } else if (parsedArgs.all) {
            // They must be a developer to use this command
            if (botInfo.developers.includes(message.author.id)) {
                for (let x in mine) {
                    for (let y in mine[x]) {
                        let block = mine[x][y];
                        if (!block.mined) {
                            block.mined = true;
                            block.visible = true;

                            if (block.type !== "stone")
                                inv[block.type]++;
                        }
                    }
                }
                message.author.saveStorage();
                genMineImage(message.channel, mine, {type: "all blocks"});
            } else message.channel.msg(`${botInfo.emotes.fail}|You must be a developer to use this.`);
            return;
        }

        // They specified an argument, so they want to do something with mines
        if (args.length > 0) {
            switch(args[0].toLowerCase()) {
                case "inv": case "inventory": {
                    let lines = [
                        `${botInfo.emotes.coal} coal: **${inv.coal}**`,
                        `${botInfo.emotes.copper} copper: **${inv.copper}**`,
                        `${botInfo.emotes.iron} iron: **${inv.iron}**`,
                        `${botInfo.emotes.gold} gold: **${inv.gold}**`,
                        `${botInfo.emotes.diamond} diamond: **${inv.diamond}**`
                    ];

                    message.channel.msg(`${botInfo.emotes.info}|Here's all the ores in your inventory:\n${lines.join('\n')}`);
                } break;

                case "sell": case "sellall": {
                    let coal = orePrice.coal * inv.coal;
                    let copper = orePrice.copper * inv.copper;
                    let iron = orePrice.iron * inv.iron;
                    let gold = orePrice.gold * inv.gold;
                    let diamond = orePrice.diamond * inv.diamond;

                    let earned = coal + copper + iron + gold + diamond;
                    if (earned !== 0) {
                        let tax = -(earned * .0825);

                        let received = earned + tax;

                        data.currency.balance += received;
                        data.currency.earned += received;

                        message.author.saveStorage();

                        let obj = {
                            [`Coal (x${inv.coal})`]:       coal.toFixed(2),
                            [`Copper (x${inv.copper})`]:   copper.toFixed(2),
                            [`Iron (x${inv.iron})`]:       iron.toFixed(2),
                            [`Gold (x${inv.gold})`]:       gold.toFixed(2),
                            [`Diamond (x${inv.diamond})`]: diamond.toFixed(2),
                            "Div1":                        "",
                            "Earned":                      earned.toFixed(2),
                            "Tax":                         tax.toFixed(2),
                            "Div2":                        "",
                            "Received":                    received.toFixed(2),
                            "Balance":                     data.currency.balance.toFixed(2)
                        }
                        message.channel.msg(botInfo.emotes.success + "|You have sold all your ores. Here's your receipt.```\n" + spaceObject(obj, "| ", " |", ": ", " ", "-", 3) + "```");

                        // Reset their inventory
                        inv.coal = 0;
                        inv.copper = 0;
                        inv.iron = 0;
                        inv.gold = 0;
                        inv.diamond = 0;
                    } else message.channel.msg(`${botInfo.emotes.fail}|You have no ores to sell.`);
                } break;

                default: {
                    // They must want to mine a block
                    if (data.currency.balance < mineCost) {
                        message.channel.msg(`${botInfo.emotes.fail}|You don't have enough money to do this. You need **$${mineCost}**!`);
                        return;
                    }

                    // We need to ratelimit non devs to keep them mining throughout the day.
                    let now = message.createdTimestamp;
                    if (now - data.last.mined < cooldown) {
                        if (!botInfo.developers.includes(message.author.id)) {
                            let timeLeft = formatTime((data.last.mined + cooldown) - now);
                            message.channel.msg(`${botInfo.emotes.fail}|You must wait **${timeLeft}** before mining again.`);
                            return;
                        }
                    }

                    let pos = args[0].toLowerCase();
                    let [x, y] = [pos[0], pos[1]];

                    // This invalidPos bool will send a message, stating if their desired mine position is invalid.
                    let invalidPos = false;
                    if (pos.length == 2) { // A position will only be 2 letters long
                        if (mine.hasOwnProperty(x)) {
                            if (mine[x].hasOwnProperty(y)) {
                                let block = mine[x][y];
                                if (!block.mined) {
                                    block.mined = true;
                                    block.visible = true;

                                    if (block.type !== "stone")
                                        inv[block.type]++;

                                    data.last.mined = now;
                                    data.currency.balance -= mineCost;

                                    let [lp, rp] = [letters.indexOf(x), letters.indexOf(y)];

                                    if (mine[letters[lp - 1]]) {
                                        let left = mine[letters[lp - 1]][y];
                                        left.visible = true;
                                    }
                                    if (mine[letters[lp + 1]]) {
                                        let right = mine[letters[lp + 1]][y];
                                        right.visible = true;
                                    }

                                    if (mine[x][letters[rp - 1]]) {
                                        let up = mine[x][letters[rp - 1]];
                                        up.visible = true;
                                    }
                                    if (mine[x][letters[rp + 1]]) {
                                        let down = mine[x][letters[rp + 1]];
                                        down.visible = true;
                                    }

                                    message.author.saveStorage();

                                    genMineImage(message.channel, mine, block);
                                } else message.channel.msg(`${botInfo.emotes.fail}|You have already mined this block.`);
                            } else invalidPos = true;
                        } else invalidPos = true;
                    } else invalidPos = true;

                    if (invalidPos)
                        message.channel.msg(`${botInfo.emotes.fail}|Invalid position.`);
                } break;
            }
        } else {
            genMineImage(message.channel, mine);
        }
    }
});

function genMineImage(channel, mine, minedBlock) {
    // Just so the user knows the bot got their request, the bot should appear "typing" while it's processing an image
    channel.startTyping(10);
    new Jimp(300, 300, 0x2b2e33ff, (err, img) => {
        if (err) {
            channel.msg(`${botInfo.emotes.fail}|Unable to generate image.`);
            return;
        }

        img.setDrawColor(0x16171aff);
        for (let x in mine) {
            for (let y in mine[x]) {
                // Something went wrong in how data is stored (something inconsistent), but flipping this in rendering fixed the issue
                let block = mine[y][x];

                let [xPos, yPos] = [letters.indexOf(x) * 30, letters.indexOf(y) * 30];

                if (!block.mined) {
                    if (block.visible) {
                        // We want stone to appear behind every ore
                        img.blit(minerals.stone, xPos, yPos);

                        // If there's no ore, we don't want to render the image twice
                        if (block.type !== "stone") {
                            img.blit(minerals[block.type], xPos, yPos);
                        }
                    }
                } else {
                    // Since they already mined it, we want to remove the stone, then show the ore.
                    img.drawBox(xPos, yPos, 30, 30);
                    if (block.type !== "stone") {
                        img.blit(minerals[block.type], xPos, yPos);
                    }
                }
            }
        }

        // We want to overlay the letters on top of the mine so they know what position mines what
        img.blit(minerals.letters, 0, 0);

        img.getBufferAsync(Jimp.MIME_PNG).then(imgData => {
            let regenTime = formatTime((mine.lastGenerated + time.d) - Date.now());
            channel.msg(`${minedBlock ? `${botInfo.emotes.success}|You spent **$${mineCost}** to mine and got ${botInfo.emotes[minedBlock.type] ? botInfo.emotes[minedBlock.type] + " " : ""}**${minedBlock.type}**.\n` : ""}${botInfo.emotes.info}|Your mine will regenerate in **${regenTime}**.`, {files: [{attachment: imgData, name: 'mine.png'}]}).then(() => {channel.stopTyping(true);});
        });
    });
}
