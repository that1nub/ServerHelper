bot.on('messageReactionAdd', (re, user) => {
    if (user.bot) return;
    
    if (re.partial) {
        re.fetch().then(fullReaction => {
            doReactFunction(fullReaction, user, true)
        }).catch(console.log);
    } else {
        doReactFunction(re, user, true);
    }
});

bot.on('messageReactionRemove', (re, user) => {
    if (user.bot) return;

    if (re.partial) {
        re.fetch().then(fullReaction => {
            doReactFunction(fullReaction, user, false)
        }).catch(console.log);
    } else {
        doReactFunction(re, user, false);
    }
});
