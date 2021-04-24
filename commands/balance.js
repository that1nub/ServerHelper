new Command({
    title: "Balance",
    desc: "Check your nCoin balance.",
    category: "Currency",
    call: ['bal', 'balance'],
    onCall: function(parsedArgs, args, message) {
        let targ = {user: message.author};
        if (message.guild)
            targ.member = message.member;

        let debug;
        if (args[0]) {
            let newTarg = findUser(args[0], message.guild);
            debug = newTarg[0] || {};
            if (newTarg[0])
                targ = newTarg[0];
        }

        let data = storage.users.get(targ.user.id);

        let name = targ.user.username;
        if (targ.member)
            name = targ.member.displayName;

        if (data) {
            message.channel.msg(`${botInfo.emotes.info}|**${name}**'s balance is **$${data.currency.balance.toFixed(2)}**.`);
        } else {
            message.channel.msg(`${botInfo.emotes.info}|**${name}**'s balance is **$${botInfo.def.users.currency.balance.toFixed(2)}**.`);
        }
    }
});
