global.minerals = {};
Jimp.read(directory.images + '/mine/stone.png', (err, img) => {
    if (err) {
        console.log(err.stack);
        return;
    }
    minerals.stone = img;
});
Jimp.read(directory.images + '/mine/coal.png', (err, img) => {
    if (err) {
        console.log(err.stack);
        return;
    }
    minerals.coal = img;
});
Jimp.read(directory.images + '/mine/copper.png', (err, img) => {
    if (err) {
        console.log(err.stack);
        return;
    }
    minerals.copper = img;
});
Jimp.read(directory.images + '/mine/iron.png', (err, img) => {
    if (err) {
        console.log(err.stack);
        return;
    }
    minerals.iron = img;
});
Jimp.read(directory.images + '/mine/gold.png', (err, img) => {
    if (err) {
        console.log(err.stack);
        return;
    }
    minerals.gold = img;
});
Jimp.read(directory.images + '/mine/diamond.png', (err, img) => {
    if (err) {
        console.log(err.stack);
        return;
    }
    minerals.diamond = img;
});
Jimp.read(directory.images + '/mine/Letter_Overlay.png', (err, img) => {
    if (err) {
        console.log(err.stack);
        return;
    }
    minerals.letters = img;
});

global.letters = "abcdefghij".split(''); // Cheating :)
function generateMine(id, date) {
    let data = storage.users.get(id);
    if (data) {
        let mine = data.mine;
        for (let x = 0; x < letters.length; x++) {
            if (!isObject(mine[letters[x]]))
                mine[letters[x]] = {};

            let mx = mine[letters[x]];
            for (let y = 0; y < letters.length; y++) {
                let rng = Math.floor(Math.random() * 100) + 1;

                if (!isObject(mx[letters[y]]))
                    mx[letters[y]] = {};

                let m = mx[letters[y]];

                if (rng <= 35) // 35% chance of the block being stone
                    m.type = "stone";
                else if (rng <= 60) // 25% chance of the block being stone
                    m.type = "coal";
                else if (rng <= 80) // 20% chance of the block being copper
                    m.type = "copper";
                else if (rng <= 90) // 10% chance of the block being iron
                    m.type = "iron";
                else if (rng <= 97) // 7% chance of the block being gold
                    m.type = "gold";
                else if (rng <= 100) // 3% chance of the block being diamond
                    m.type = "diamond";

                m.visible = false;
                m.mined = false;
            }
        }
        mine.lastGenerated = date;
    }
}

Discord.User.prototype.checkMine = function(forceGen) {
    let data = storage.users.get(this.id);
    if (data) {
        let now = Date.now();
        if (!forceGen) {
            if (now - data.mine.lastGenerated >= time.d) {
                generateMine(this.id, now);
            }
        } else {
            generateMine(this.id, now);
        }
    }
}
