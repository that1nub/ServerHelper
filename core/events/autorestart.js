global.restarting = false;
global.restartTime = new Date();
restartTime.setHours(0);
restartTime.setMinutes(9);
restartTime.setSeconds(0);
restartTime.setMilliseconds(0);
restartTime.setDate(restartTime.getDate() + 1);

bot.on('ready', () => {
    console.log("Bot automatically restarting @ " + restartTime);
});

setInterval(() => {
    let currentTime = new Date();
    if (currentTime >= restartTime) {
        console.log('Restart sequence initiated.');

        restartTime.setDate(restartTime.getDate() + 1);
        restarting = true;

        setTimeout(() => {
            if (restarting) {
                process.exit();
            }
        }, time.m);
    }
}, 1000);
