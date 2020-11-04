new Command({
    title: "Avatar",
    desc: "Get someone's avatar link.",
    call: ['avatar'],
    onCall: function(parsedArgs, args, message) {
        let targ = {user: message.author};

        if (args[0]) {
            let newTarg = findUser(args[0]);
            if (newTarg[0])
                targ = newTarg[0];
        }

        message.channel.msg(targ.user.displayAvatarURL({dynamic: true}));
    }
});
