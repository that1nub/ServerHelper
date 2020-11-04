new Command({
    title: "Daily",
    desc: "Claim a daily amount of money, with $100 base income + 5x streak (bonus), and a 8.25% tax.",
    call: ['daily'],
    onCall: function(parsedArgs, args, message) {
        let now = message.createdTimestamp;
        let userData = storage.users.get(message.author.id);
        let lastUsed = userData.last.daily;
        if (now - lastUsed >= time.d) {
            let income = {
                base: 100,
                bonus: 5 * userData.streak.daily,
            }
            income.earned = income.base + income.bonus;
            income.tax = -(income.earned * .0825);
            income.received = income.earned + income.tax;

            userData.streak.daily++;
            userData.currency.balance += income.received;
            userData.currency.earned += income.received;
            userData.last.daily = now;

            message.author.saveStorage();

            let obj = {
                "Income": income.base.toFixed(2),
                "Bonus": income.bonus.toFixed(2),
                "Div1": "",
                "Earned": income.earned.toFixed(2),
                "Tax": income.tax.toFixed(2),
                "Div2": "",
                "Received": income.received.toFixed(2),
                "Balance": userData.currency.balance.toFixed(2)
            }
            message.channel.msg(botInfo.emotes.success + "|Daily claimed.```\n" + spaceObject(obj, "| ", " |", ": ", " ", "-", 3) + "```");
        } else {
            message.channel.msg(`${botInfo.emotes.fail}|You must wait a day to claim your daily income.\nYou will be able to claimed in **${formatTime((lastUsed + time.d) - now)}**.`);
        }
    }
});
