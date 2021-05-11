global.copyObject = function(obj, temp) {
	if (!(isObject(obj) && isObject(temp)))
		throw new Error('copyObject: Two objects expected, got ' + typeof obj + ' and ' + typeof temp);
	let tempKeys = Object.keys(temp);
	for (let i = 0; i < tempKeys.length; i++) {
		if (isObject(temp[tempKeys[i]])) {
			if (!isObject(obj[tempKeys[i]]) && !isArray(temp[tempKeys[i]]))
				obj[tempKeys[i]] = {};
			else if (!isArray(obj[tempKeys[i]]) && isArray(temp[tempKeys[i]]))
				obj[tempKeys[i]] = [];
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
