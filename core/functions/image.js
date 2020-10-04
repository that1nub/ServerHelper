Jimp.prototype.setDrawColor = function(color = 0xffffffff) {
    if (!isNumber(color) && !isString(color)) throw new Error("Image.setDrawColor: Bad argument #1: Must be a hexadecimal (string or number), got " + typeof color);

    if (isString(color)) {
        if (!color.match(/^#[0-f]{8}$/)) throw new Error("Image.setDrawColor: Bad argument #1: String hexadecimal doesn't follow format \"#rrggbbaa\"");
    }

    this._drawColor = color;
}

Jimp.prototype.drawBox = function(x = 0, y = 0, w = 64, h = 64) {
    if (!isNumber(x)) throw new Error("Image.drawBox: Bad argument #1: must be a number, got " + typeof x);
    if (!isNumber(y)) throw new Error("Image.drawBox: Bad argument #2: must be a number, got " + typeof y);
    if (!isNumber(w)) throw new Error("Image.drawBox: Bad argument #3: must be a number, got " + typeof w);
    if (!isNumber(h)) throw new Error("Image.drawBox: Bad argument #4: must be a number, got " + typeof h);

    for (let px = x; px < x + w; px++) {
        for (let py = y; py < y + h; py++) {
            this.setPixelColor(this._drawColor || 0xffffffff, px, py);
        }
    }
}

Jimp.prototype.drawText = function(text, font, x, y, w, h) {
    if (!isNumber(x))    throw new Error("Image.drawText: Bad Argument #3: Expected a number, got " + typeof x);
    if (!isNumber(y))    throw new Error("Image.drawText: Bad Argument #4: Expected a number, got " + typeof y);
    if (!isNumber(w))    throw new Error("Image.drawText: Bad Argument #5: Expected a number, got " + typeof w);
    if (!isNumber(h))    throw new Error("Image.drawText: Bad Argument #6: Expected a number, got " + typeof h);

    this.print(font, x, y, {text: String(text), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE}, w, h)
}
