global.spaceObject = function(inObject, leftSide, rightSide, pairSpacer, normalSpacer, hrSpacer, align){
    'use strict';
    // Store the value names as 'keys'
    let keys = Object.keys( inObject );
    let output = [];

    // Go through, placing the variable and its stringified value in the output
    let maxLen = 0;
    for(let i = 0; i < keys.length; i++) {
        // Stringify the value
        let text;
        switch(typeof inObject[keys[i]]) {
            case 'number': {
                text = ''+inObject[keys[i]];
            } break;
            case 'string': {
                text = ''+inObject[keys[i]];
            } break;
            case 'default': {
                text = 'undefined';
            } break;
            default: {
                text = '???';
            } break;
        }
        // Place in output
        if(text !== '') {
            output[i] = text;
        } else {
            // If the string is empty, then a horizontal line is signified, and -1 is inserted as the text
            output[i] = -1;
        }
        // Measure greatest string length
        let thisLen = output[i].length + keys[i].length + pairSpacer.length;
        if(thisLen > maxLen)
        maxLen = thisLen;
    }

    // Loop through the output, adding the correct spacing
    for(let i = 0; i < output.length; i++) {
        let modify = output[i];
        let charsNeeded = maxLen - (modify.length + pairSpacer.length + keys[i].length);
        if(modify === -1) {
            // Add horizontal line
            charsNeeded = maxLen;
            modify = hrSpacer.repeat(Math.ceil(charsNeeded/(hrSpacer.length))).substring(0, charsNeeded);
        } else {
            // Add line of text
            switch(align) {
                case 0: { // Left align
                    modify = keys[i] + pairSpacer + normalSpacer.repeat(charsNeeded) + modify;
                } break;
                case 1: { // Center align
                    modify = normalSpacer.repeat(Math.floor(charsNeeded/2)) + keys[i] + pairSpacer + modify + normalSpacer.repeat(  Math.ceil(charsNeeded/2));
                } break;
                case 2: { // Right align
                    modify = normalSpacer.repeat(charsNeeded) + keys[i] + pairSpacer + modify;
                } break;
                case 3: { // Center split
                    modify = keys[i] + pairSpacer + normalSpacer.repeat(charsNeeded) + modify;
                } break;
                default: { // Add no spacing
                    modify = keys[i] + pairSpacer + modify;
                } break;
            }
        }
        output[i] = leftSide + modify + rightSide;
    }

    // Return and stitch together the output
    return output.join('\n');
}

// This function returns a string of what is interpretted, but doesn't actually parse and run it.
global.parsePunishment = function(input) {
    if (!isString(input)) throw new Error("parsePunishment: Bad argument #1: Expected a string, got " + typeof input);

    let out = [];

    let punishments = input.split(/;+/g);
    for (let i = 0; i < punishments.length; i++) {
        punishments[i] = punishments[i].trim();

        let args = punishments[i].split(/ +/g);

        switch (args.shift().toLowerCase()) {
            case "mute": {
                if (!isString(args[0])) args[0] = "forever"

                let time = parseTime(args[0]);
                if (isNumber(time) && Number.isFinite(time)) {
                    out.push(`Mute member for ${formatTime(time)}.`);
                } else {
                    out.push("Mute member indefinitely.");
                }
            } break;

            case "delete": {
                out.push("Delete member's message that caused infraction.");
            } break;

            case "kick": {
                out.push("Kick member.");
            } break;

            case "ban": {
                if (!isString(args[0])) args[0] = "forever"

                let time = parseTime(args[0]);
                if (isNumber(time) && Number.isFinite(time)) {
                    out.push(`Temporarily ban member for ${formatTime(time)}.`);
                } else {
                    out.push("Permanently ban member.");
                }
            } break;

            default: {
                out.push("Invalid input.");
            } break;
        }
    }

    return out;
}
