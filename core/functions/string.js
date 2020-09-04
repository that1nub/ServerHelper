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
