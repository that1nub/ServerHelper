let swap = {
    a: "z",
    b: "y",
    c: "x",
    d: "w",
    e: "v",
    f: "u",
    g: "t",
    h: "s",
    i: "r",
    j: "q",
    k: "p",
    l: "o",
    m: "n",
    n: "m",
    o: "l",
    p: "k",
    q: "j",
    r: "i",
    s: "h",
    t: "g",
    u: "f",
    v: "e",
    w: "d",
    x: "c",
    y: "b",
    z: "a",
    A: "Z",
    B: "Y",
    C: "X",
    D: "W",
    E: "V",
    F: "U",
    G: "T",
    H: "S",
    I: "R",
    J: "Q",
    K: "P",
    L: "O",
    M: "N",
    N: "M",
    O: "L",
    P: "K",
    Q: "J",
    R: "I",
    S: "H",
    T: "G",
    U: "F",
    V: "E",
    W: "D",
    X: "C",
    Y: "B",
    Z: "A",
};
swap[1] = 9; 
swap[2] = 8; 
swap[3] = 7; 
swap[4] = 6; 
swap[5] = 5; 
swap[6] = 4; 
swap[7] = 3; 
swap[8] = 2; 
swap[9] = 1; 

function swapStr(str) {
    let newStr = "";
    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        newStr += swap[char] !== undefined ? swap[char] : char;
    }
    return newStr
}

new Command({
    title: "Custom Language",
    desc: "All this does is take your input, and give the opposite letter in the alphabet. A becomes Z, B becomes Y, and so on.",
    call: ['invert'],
    onCall: function(parsedArgs, args, message, rawArgString) {
        if (!message.guild) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to use this.`);
        }
        
        let arg = rawArgString.trim();
        if (arg === "") {
            message.channel.msg(`${botInfo.emotes.fail}|You must supply some text.`);
            return;
        }

        message.delete();
        if (!message.guild) {
            message.channel.msg(`${message.author.username}: ${swapStr(arg)}`);
        } else {
            message.channel.createWebhook(message.member.displayName, {avatar: message.author.displayAvatarURL()}).then(webhook => {
                webhook.send(swapStr(arg)).then(msg => {
                    webhook.delete();
                }).catch(err => {
                    message.channel.msg(message.member.displayName + ": " + swapStr(arg));
                    webhook.delete();
                });
            }).catch(err => {
                message.channel.msg(message.member.displayName + ": " + swapStr(arg));
            });
        }
    }
});