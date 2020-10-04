global.fonts = {};
global.masks = {};

Jimp.loadFont(Jimp.FONT_SANS_16_WHITE).then(font => {
    fonts.whiteSans16 = font;
});
Jimp.loadFont(Jimp.FONT_SANS_8_WHITE).then(font => {
    fonts.whiteSans8 = font;
});
