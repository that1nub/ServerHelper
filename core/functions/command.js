global.Command = function(obj) {
	if (!isObject(obj))          throw new Error('Command: bad argument #1: must be an object, got ' + typeof obj);
	if (!isArray(obj.call))      throw new Error('Command: bad argument "call": must be an array, got ' + typeof obj.call);
	if (!isFunction(obj.onCall)) throw new Error('Command: bad argument "onCall": must be a function, got ' + typeof obj.onCall);

	obj.title          = isString(obj.title)          ? obj.title          : "Undefined";
	obj.can            = isObject(obj.can)            ? obj.can            : [];
	obj.category       = isObject(obj.category)       ? obj.category       : {emote: "", text: "Other"};
	obj.category.emote = isString(obj.category.emote) ? obj.category.emote : "";
	obj.category.text  = isString(obj.category.text)  ? obj.category.text  : "Other";
	obj.usage          = isString(obj.usage)          ? obj.usage          : "";
	obj.examples       = isObject(obj.examples)       ? obj.examples       : [];
	obj.hideFromHelp   = isBool(obj.hideFromHelp)     ? obj.hideFromHelp   : false;

	if (isString(obj.desc) && obj.desc.length)
		obj.desc = {brief: obj.desc.substring(0, 74), full: obj.desc}; //Brief is 75 characters of the description
	else if (isObject(obj.desc)) {
		obj.desc.brief = isString(obj.desc.brief) ? obj.desc.brief.substring(0, 74) : "No set description.";
		obj.desc.full  = isString(obj.desc.full)  ? obj.desc.full                   : "No set description.";
	}
	else
		obj.desc = {brief: "No set description.", full: "No set description."};

	Object.assign(this, obj);

	this.id = commands.length;

	for (let i = 0; i < commands.length; i++) {
		if (commands[i].title == this.title) {
			this.id = commands[i].id;
			break;
		}
	}

	commands[this.id] = this;

	console.log('Registered command: ' + obj.title);
}
