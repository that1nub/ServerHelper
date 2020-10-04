new Command({
    title: "Test",
    desc: "Test",
    call: ['test'],
    onCall: function(parsedArgs, args, message) {
        new Jimp(512, 512, 0x000000ff, (err, img) => {
            if (err) {
                console.log(err.stack);
                return;
            }

            img.drawBox(128, 128, 256, 256, 0x0096ffff); // Custom function
            img.getBufferAsync(Jimp.MIME_PNG).then(imgData => {
                message.channel.msg({files: [imgData]});
            });
        });
    }
});
