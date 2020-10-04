global.copyObject = function(obj, temp) {
	if (!(typeof obj == "object" && typeof temp == "object"))
		throw new Error('copyObject: Two objects expected, got ' + typeof obj + ' and ' + typeof temp);
	let tempKeys = Object.keys(temp);
	for (let i = 0; i < tempKeys.length; i++) {
		if (typeof temp[tempKeys[i]] == "object") {
			if (typeof obj[tempKeys[i]] != "object")
				obj[tempKeys[i]] = {};
			Object.setPrototypeOf(obj[tempKeys[i]], temp[tempKeys[i]].__proto__);
			copyObject(obj[tempKeys[i]], temp[tempKeys[i]]);
		} else
			if (typeof obj[tempKeys[i]] != typeof temp[tempKeys[i]]){
				obj[tempKeys[i]] = temp[tempKeys[i]];
				// console.log(tempKeys[i] + " = " + temp[tempKeys[i]]);
			}
	}
	return obj;
}

global.isArray    = function(variable) { return variable instanceof Array      }
global.isMap      = function(variable) { return variable instanceof Map        }
global.isObject   = function(variable) { return typeof variable === "object"   }
global.isNumber   = function(variable) { return typeof variable === "number"   }
global.isString   = function(variable) { return typeof variable === "string"   }
global.isBool     = function(variable) { return typeof variable === "boolean"  }
global.isFunction = function(variable) { return typeof variable === "function" }
