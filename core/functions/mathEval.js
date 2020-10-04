'use strict';

var mathEval = undefined;

(function mathEvalWrapper() {

mathEval = function mathEval(input) {
	// Make sure input is valid
	if(typeof(input) == 'number') return input;
	if(typeof(input) != 'string') throw new Error('Input must be a string');

	// Split on all operands

	let inSplit = [''];
	let pVal = 0;
	for(let i = 0; i < input.length; i++) {
		// Count parenthesis
		if(input[i] == '(')
			pVal++;
		else if(input[i] == ')') {
			pVal--;
			if(pVal < 0) {
				throw new Error('Uneven parenthesis');
			}
		}
		// Populate the split array
		let opNum = -1;
		if(pVal == 0) {
			// Check if this is an operand
			for(let o = 0; o < ops.length; o++) {
				if(input.substr(i, ops[o].length) == ops[o]) {
					opNum = o;
					break;
				}
			}
		}
		if(opNum != -1) {
			// Add this operator to the array
			inSplit.push(ops[opNum]);
			inSplit.push('');
			// Move the read position forwards
			// This is only used for operators with longer names
			i += ops[opNum].length - 1;
		} else {
			// Add this character to the array
			inSplit[inSplit.length - 1] += input[i];
		}
	}

	// Throw an error if parenthesis do not match
	if(pVal != 0) {
		throw new Error('Unmatched parenthesis found');
	}

	// If there is only a single operand, attempt to evaluate
	if(inSplit.length == 1) {

		//console.log('Single: ' + input);

		if(inSplit[0] == '') {
			// Throw an error if any operand has no counterpart
			throw new Error('Empty string used as an operand');
		}
		let tryFloat = Number(inSplit[0]);
		if(!Number.isNaN(tryFloat)) {
			return tryFloat;
		}
		// Attempt to evaluate parenthetical
		let firstP = -1;
		let pHasZeroed = false;
		pVal = 0;
			// Verify corrent parenthesis
		for(let i = 0; i < inSplit[0].length; i++) {
			// Count parenthesis
			if(inSplit[0][i] == '(') {
				pVal++;
				if(firstP == -1) {
					firstP = i;
				}
			} else if(inSplit[0][i] == ')') {
				pVal--;
				// Make sure parenthesis cover the entire right operand
				if(pVal == 0) {
					if(pHasZeroed) {
						throw new Error('Back to back parenthesis may not be used');
					}
					pHasZeroed = true;
				}
			}
		}
		// Operate only if there was a set of parenthesis
		if(firstP > -1) {
			// Separate body and function
			let pFunc = inSplit[0].substring(0, firstP).trim().toLowerCase();
			let pBody = inSplit[0].substring(firstP, inSplit[0].length).trim();
			pBody = pBody.substring(1, pBody.length - 1);
			// Call the function, if it exists
			if(funcs.has(pFunc)) {
				// Function input is a string, but output is expected to be a number
				return funcs.get(pFunc)(pBody);
			} else {
				throw new Error('Unknown function \''+pFunc+'\'');
			}
		} else {
			// Call the function without a body
			let pFunc = inSplit[0].trim();
			if(funcs.has(pFunc)) {
				return funcs.get(pFunc)();
			} else {
				throw new Error('Unknown function \''+pFunc+'\'');
			}
		}
	} else {
		while(inSplit.length > 1) {
			// If there are multiple operands
			// Find the operator of the lowest order and furthest left
			let minOrder = Infinity;
			let minOp = '';
			let minOpPos = -1;
			for(let i = 1; i < inSplit.length - 1; i += 2) {
				let newOpInd = ops.indexOf(inSplit[i]);
				if(newOpInd == -1)
					throw new Error('Unknown operator, this error should never occur');
				let newOrder = order[newOpInd];
				// Check for unary operators
				// Unary operators should be evaluated before all otheres
				// Check if it is in the list of unary functions
				let uniInd = uniOps.indexOf(inSplit[i]);
				if(uniInd != -1) {
					let lo = inSplit[i - 1];
					if(typeof(lo) == 'string') lo = lo.trim();
					let ro = inSplit[i + 1];
					if(typeof(ro) == 'string') ro = ro.trim();
					if((lo == '') != (ro == '')) {
						// This operator has one value on the left or right
						// Set the order to the order for the unary operator
						newOrder = uniOrder[uniInd];
					} else if((lo == '') && (ro == '')) {
						// This only occurs when the operator has a blank value on both sides
						// For unary operators, it should wait until it can be evaluated later
						newOpInd = Infinity;
					}
				}

				if(newOrder < minOrder) {
					minOrder = newOrder;
					minOp = inSplit[i];
					minOpPos = i;
				}
			}
			if((minOrder == Infinity) || (minOp == '') || (minOpPos == -1))
				throw new Error('No operators found, this error should never occur');

			// Evaluate both operands, then call operator specified
			//console.log("Multi ("+minOp+"): " + inSplit[minOpPos - 1] + ", " + inSplit[minOpPos + 1]);

			let leftOperand = inSplit[minOpPos - 1];
			if(typeof(leftOperand) == "string") {
				leftOperand = leftOperand.trim();
				if(leftOperand == '') leftOperand = undefined;
				else leftOperand = mathEval(leftOperand);
			}

			let rightOperand = inSplit[minOpPos + 1];
			if(typeof(rightOperand) == "string") {
				rightOperand = rightOperand.trim();
				if(rightOperand == '') rightOperand = undefined;
				else rightOperand = mathEval(rightOperand);
			}

			let ret = funcs.get(minOp)(
				leftOperand,
				rightOperand
			);
			if((ret == undefined) || (Number.isNaN(ret)))
				throw new Error('Operator \'' + minOp +'\' used incorrectly');
			inSplit.splice(minOpPos - 1, 3, ret);
		}
		return inSplit[0];
	}

}

// A helper function for making functions
// Splits an input string on all commas not in ()
function smartSplit(input) {
	let output = [];
	let pVal = 0;
	let lastComma = -1;
	for(let i = 0; i < input.length; i++) {
		if(input[i] == '(')
			pVal++;
		else if(input[i] == ')')
			pVal--;
		else if(pVal == 0) {
			if(input[i] == ',') {
				output.push(input.substring(lastComma + 1, i));
				lastComma = i;
			}
		}
	}
	output.push(input.substring(lastComma + 1, input.length));
	return output;
}

// The map of all parenthetical functions
// Functions take a string, and output a number
// This means you may have to mathEval the input first
const funcs = new Map();

funcs.set('', function funcNone(input) {
	if(!input) throw new Error('Parenthesis can not be empty');
	return mathEval(input);
});
funcs.set('pi', function funcPi(input) {
	if(input) throw new Error('Pi can not be used as a function');
	return Math.PI;
});
funcs.set('e', function funcE(input) {
	if(input) throw new Error('e can not be used as a function');
	return Math.E;
});
funcs.set('sin', function funcSin(input) {
	if(!input) throw new Error('Sine must have an input');
	return Math.sin(mathEval(input));
});
funcs.set('asin', function funcAsin(input) {
	if(!input) throw new Error('Inverse sine must have an input');
	return Math.asin(mathEval(input));
});
funcs.set('csc', function funcCsc(input) {
	if(!input) throw new Error('Cosecant must have an input');
	return 1 / Math.sin(mathEval(input));
});
funcs.set('cos', function funcCos(input) {
	if(!input) throw new Error('Cosine must have an input');
	return Math.cos(mathEval(input));
});
funcs.set('acos', function funcAcos(input) {
	if(!input) throw new Error('Inverse cosine must have an input');
	return Math.acos(mathEval(input));
});
funcs.set('sec', function funcSec(input) {
	if(!input) throw new Error('Secant must have an input');
	return 1 / Math.cos(mathEval(input));
});
funcs.set('tan', function funcTan(input) {
	if(!input) throw new Error('Tangent must have an input');
	return Math.tan(mathEval(input));
});
funcs.set('atan', function funcAtan(input) {
	if(!input) throw new Error('Inverse tangent must have an input');
	return Math.atan(mathEval(input));
});
funcs.set('cot', function funcCot(input) {
	if(!input) throw new Error('Cotangent must have an input');
	return 1 / Math.tan(mathEval(input));
});
funcs.set('rand', function funcRand(input) {
	if(!input) return Math.random();
	let args = smartSplit(input);
	if(args.length == 1) {
		return Math.random() * mathEval(args[0]);
	} else if(args.length == 2) {
		let min = mathEval(args[0]);
		let max = mathEval(args[1]);
		return Math.random() * (max - min) + min;
	} else {
		throw new Error('Random given too many arguments');
	}
});
funcs.set('sqrt', function funcSqrt(input) {
	if(!input) throw new Error('Square root must be given an input');
	return Math.sqrt(mathEval(input));
});
funcs.set('cbrt', function funcCbrt(input) {
	if(!input) throw new Error('Cube root must be given an input');
	return Math.cbrt(mathEval(input));
});
funcs.set('root', function funcCbrt(input) {
	if(!input) throw new Error('Nth root must be given an input');
	let args = smartSplit(input);
	if(args.length != 2) throw new Error('Nth root must be given two arguments');
	return Math.pow(mathEval(args[0]), 1 / mathEval(args[1]));
});
funcs.set('abs', function funcSqrt(input) {
	if(!input) throw new Error('Absolute value must be given an input');
	return Math.abs(mathEval(input));
});
funcs.set('log', function funcLog(input) {
	if(!input) throw new Error('Logarithm must be given an input');
	let args = smartSplit(input);
	if(args.length == 1) {
		// Default to base 10
		return Math.log(mathEval(args[0])) / Math.LN10;
	} else if(args.length == 2) {
		// Second argument acts as base
		return Math.log(mathEval(args[0])) / Math.log(mathEval(args[1]));
	} else {
		throw new Error('Logarithm given too many arguments');
	}
});
funcs.set('ln', function funcLn(input) {
	if(!input) throw new Error('Natural logarithm must be given an input');
	return Math.log(mathEval(input));
});
funcs.set('round', function funcRound(input) {
	if(!input) throw new Error('Round must be given an input');
	let args = smartSplit(input);
	if(args.length == 1) {
		return Math.round(mathEval(args[0]));
	} else if(args.length == 2) {
		let points = 10 ** Math.floor(mathEval(args[1]));
		return Math.round(mathEval(args[0]) * points) / points;
	} else throw new Error('Round given too many arguments');
})
funcs.set('floor', function funcFloor(input) {
	if(!input) throw new Error('Floor must be given an input');
	return Math.floor(mathEval(input));
});
funcs.set('ceil', function funcCeil(input) {
	if(!input) throw new Error('Ceil must be given an input');
	return Math.ceil(mathEval(input));
});
funcs.set('max', function funcMax(input) {
	if(!input) throw new Error('Maximum muse be given an input');
	let args = smartSplit(input);
	for(let i = 0; i < args.length; i++) {
		args[i] = mathEval(args[i]);
	}
	return Math.max(...args);
});
funcs.set('min', function funcMin(input) {
	if(!input) throw new Error('Minimum muse be given an input');
	let args = smartSplit(input);
	for(let i = 0; i < args.length; i++) {
		args[i] = mathEval(args[i]);
	}
	return Math.min(...args);
});
funcs.set('deg', function funcDeg(input){
	if(!input) throw new Error('Degree conversion must have an input.');
	let args = smartSplit(input);
	if(args.length === 1){
		return mathEval(args[0]) * (Math.PI / 180);
	} else throw new Error('Degree conversion contains too many arguments');
});
funcs.set('rad', function funcDeg(input){
	if(!input) throw new Error('Radian conversion must have an input.');
	let args = smartSplit(input);
	if(args.length === 1){
		return mathEval(args[0]) * (180 / Math.PI);
	} else throw new Error('Radian conversion contains too many arguments');
});
funcs.set('n', function funcNeg(input){
	if(!input) throw new Error('Negate must have an input.');
	let args = smartSplit(input);
	if(args.length === 1){
		return -mathEval(args[0]);
	} else throw new Error('Negate contains too many arguments');
});

// A list of all operators
// Operators act as special functions, and always take two arguments
// The order of each operator, executed from lowest to highest
// All unary operators should be repeated in the 'ops' list, for splitting
const ops = ['^','**','*','/','%','mod','+','-'];
const order=[ 0,  0,   1,  1,  1,   1,   2,  2 ];
const uniOps = ['-'];
const uniOrder=[-1 ];

funcs.set('^', function opExp(a, b) {return Math.pow(a, b);});
funcs.set('**', function opExp(a, b) {return Math.pow(a, b);});
funcs.set('*', function opMul(a, b) {return a * b;});
funcs.set('/', function opDiv(a, b) {return a / b;});
funcs.set('+', function opAdd(a, b) {return a + b;});
funcs.set('-', function opSub(a, b) {return (a ? a : 0) - b;});
funcs.set('%', function opMod(a, b) {return a % b;});
funcs.set('mod', function opMod(a, b) {return a % b;});

})();

global.mathEval = mathEval;
// Run only if this is in node
if(typeof(process) != 'undefined') {
	exports.mathEval = mathEval;
}
