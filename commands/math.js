new Command({
    title: "Math",
    desc: "Perform some math calculations.",
    call: ['math', 'matheval'],
    onCall: function(parsedArgs, args, message) {
        if (args.length > 0) {
            try {
                let exp = args.join(' ')
                              .replace(/•/g, '*')
                              .replace(/×/g, '*')
                              .replace(/÷/g, '/')
                              .replace(/⁰/g, '^0')
                              .replace(/¹/g, '^1')
                              .replace(/²/g, '^2')
                              .replace(/³/g, '^3')
                              .replace(/⁴/g, '^4')
                              .replace(/⁵/g, '^5')
                              .replace(/⁶/g, '^6')
                              .replace(/⁷/g, '^7')
                              .replace(/⁸/g, '^8')
                              .replace(/⁹/g, '^9')
                              .replace(/π/g, 'pi')
                              .replace(/√/g, 'sqrt')
                              .replace(/°/g, '*(pi/180)');

                let eval = mathEval(exp);
                message.channel.msg(`\`\`\`\n${eval}\`\`\``);
            } catch (err) {
                message.channel.msg(`${botInfo.emotes.fail}|Your math equation failed:\`\`\`\n${err}\`\`\``);
            }
        } else message.channel.msg(`${botInfo.emotes.fail}|You need at least one argument.`);
    }
});
