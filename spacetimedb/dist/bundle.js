import * as _syscalls2_0 from "spacetime:sys@2.0";
import { moduleHooks } from "spacetime:sys@2.0";

//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/node_modules/.pnpm/headers-polyfill@4.0.3/node_modules/headers-polyfill/lib/index.mjs
var __create$1 = Object.create;
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$1 = Object.getOwnPropertyNames;
var __getProtoOf$1 = Object.getPrototypeOf;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __commonJS$1 = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames$1(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps$1 = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames$1(from)) if (!__hasOwnProp$1.call(to, key) && key !== except) __defProp$1(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc$1(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM$1 = (mod, isNodeMode, target) => (target = mod != null ? __create$1(__getProtoOf$1(mod)) : {}, __copyProps$1(isNodeMode || !mod || !mod.__esModule ? __defProp$1(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
var import_set_cookie_parser = __toESM$1(__commonJS$1({ "node_modules/set-cookie-parser/lib/set-cookie.js"(exports, module) {
	"use strict";
	var defaultParseOptions = {
		decodeValues: true,
		map: false,
		silent: false
	};
	function isNonEmptyString(str) {
		return typeof str === "string" && !!str.trim();
	}
	function parseString(setCookieValue, options) {
		var parts = setCookieValue.split(";").filter(isNonEmptyString);
		var parsed = parseNameValuePair(parts.shift());
		var name = parsed.name;
		var value = parsed.value;
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		try {
			value = options.decodeValues ? decodeURIComponent(value) : value;
		} catch (e) {
			console.error("set-cookie-parser encountered an error while decoding a cookie with value '" + value + "'. Set options.decodeValues to false to disable this feature.", e);
		}
		var cookie = {
			name,
			value
		};
		parts.forEach(function(part) {
			var sides = part.split("=");
			var key = sides.shift().trimLeft().toLowerCase();
			var value2 = sides.join("=");
			if (key === "expires") cookie.expires = new Date(value2);
			else if (key === "max-age") cookie.maxAge = parseInt(value2, 10);
			else if (key === "secure") cookie.secure = true;
			else if (key === "httponly") cookie.httpOnly = true;
			else if (key === "samesite") cookie.sameSite = value2;
			else cookie[key] = value2;
		});
		return cookie;
	}
	function parseNameValuePair(nameValuePairStr) {
		var name = "";
		var value = "";
		var nameValueArr = nameValuePairStr.split("=");
		if (nameValueArr.length > 1) {
			name = nameValueArr.shift();
			value = nameValueArr.join("=");
		} else value = nameValuePairStr;
		return {
			name,
			value
		};
	}
	function parse(input, options) {
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!input) if (!options.map) return [];
		else return {};
		if (input.headers) if (typeof input.headers.getSetCookie === "function") input = input.headers.getSetCookie();
		else if (input.headers["set-cookie"]) input = input.headers["set-cookie"];
		else {
			var sch = input.headers[Object.keys(input.headers).find(function(key) {
				return key.toLowerCase() === "set-cookie";
			})];
			if (!sch && input.headers.cookie && !options.silent) console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning.");
			input = sch;
		}
		if (!Array.isArray(input)) input = [input];
		options = options ? Object.assign({}, defaultParseOptions, options) : defaultParseOptions;
		if (!options.map) return input.filter(isNonEmptyString).map(function(str) {
			return parseString(str, options);
		});
		else return input.filter(isNonEmptyString).reduce(function(cookies2, str) {
			var cookie = parseString(str, options);
			cookies2[cookie.name] = cookie;
			return cookies2;
		}, {});
	}
	function splitCookiesString2(cookiesString) {
		if (Array.isArray(cookiesString)) return cookiesString;
		if (typeof cookiesString !== "string") return [];
		var cookiesStrings = [];
		var pos = 0;
		var start;
		var ch;
		var lastComma;
		var nextStart;
		var cookiesSeparatorFound;
		function skipWhitespace() {
			while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
			return pos < cookiesString.length;
		}
		function notSpecialChar() {
			ch = cookiesString.charAt(pos);
			return ch !== "=" && ch !== ";" && ch !== ",";
		}
		while (pos < cookiesString.length) {
			start = pos;
			cookiesSeparatorFound = false;
			while (skipWhitespace()) {
				ch = cookiesString.charAt(pos);
				if (ch === ",") {
					lastComma = pos;
					pos += 1;
					skipWhitespace();
					nextStart = pos;
					while (pos < cookiesString.length && notSpecialChar()) pos += 1;
					if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
						cookiesSeparatorFound = true;
						pos = nextStart;
						cookiesStrings.push(cookiesString.substring(start, lastComma));
						start = pos;
					} else pos = lastComma + 1;
				} else pos += 1;
			}
			if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
		}
		return cookiesStrings;
	}
	module.exports = parse;
	module.exports.parse = parse;
	module.exports.parseString = parseString;
	module.exports.splitCookiesString = splitCookiesString2;
} })());
var HEADERS_INVALID_CHARACTERS = /[^a-z0-9\-#$%&'*+.^_`|~]/i;
function normalizeHeaderName(name) {
	if (HEADERS_INVALID_CHARACTERS.test(name) || name.trim() === "") throw new TypeError("Invalid character in header field name");
	return name.trim().toLowerCase();
}
var charCodesToRemove = [
	String.fromCharCode(10),
	String.fromCharCode(13),
	String.fromCharCode(9),
	String.fromCharCode(32)
];
var HEADER_VALUE_REMOVE_REGEXP = new RegExp(`(^[${charCodesToRemove.join("")}]|$[${charCodesToRemove.join("")}])`, "g");
function normalizeHeaderValue(value) {
	return value.replace(HEADER_VALUE_REMOVE_REGEXP, "");
}
function isValidHeaderName(value) {
	if (typeof value !== "string") return false;
	if (value.length === 0) return false;
	for (let i = 0; i < value.length; i++) {
		const character = value.charCodeAt(i);
		if (character > 127 || !isToken(character)) return false;
	}
	return true;
}
function isToken(value) {
	return ![
		127,
		32,
		"(",
		")",
		"<",
		">",
		"@",
		",",
		";",
		":",
		"\\",
		"\"",
		"/",
		"[",
		"]",
		"?",
		"=",
		"{",
		"}"
	].includes(value);
}
function isValidHeaderValue(value) {
	if (typeof value !== "string") return false;
	if (value.trim() !== value) return false;
	for (let i = 0; i < value.length; i++) {
		const character = value.charCodeAt(i);
		if (character === 0 || character === 10 || character === 13) return false;
	}
	return true;
}
var NORMALIZED_HEADERS = Symbol("normalizedHeaders");
var RAW_HEADER_NAMES = Symbol("rawHeaderNames");
var HEADER_VALUE_DELIMITER = ", ";
var _a, _b, _c;
var Headers = class _Headers {
	constructor(init) {
		this[_a] = {};
		this[_b] = /* @__PURE__ */ new Map();
		this[_c] = "Headers";
		if (["Headers", "HeadersPolyfill"].includes(init?.constructor.name) || init instanceof _Headers || typeof globalThis.Headers !== "undefined" && init instanceof globalThis.Headers) init.forEach((value, name) => {
			this.append(name, value);
		}, this);
		else if (Array.isArray(init)) init.forEach(([name, value]) => {
			this.append(name, Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value);
		});
		else if (init) Object.getOwnPropertyNames(init).forEach((name) => {
			const value = init[name];
			this.append(name, Array.isArray(value) ? value.join(HEADER_VALUE_DELIMITER) : value);
		});
	}
	[(_a = NORMALIZED_HEADERS, _b = RAW_HEADER_NAMES, _c = Symbol.toStringTag, Symbol.iterator)]() {
		return this.entries();
	}
	*keys() {
		for (const [name] of this.entries()) yield name;
	}
	*values() {
		for (const [, value] of this.entries()) yield value;
	}
	*entries() {
		let sortedKeys = Object.keys(this[NORMALIZED_HEADERS]).sort((a, b) => a.localeCompare(b));
		for (const name of sortedKeys) if (name === "set-cookie") for (const value of this.getSetCookie()) yield [name, value];
		else yield [name, this.get(name)];
	}
	/**
	* Returns a boolean stating whether a `Headers` object contains a certain header.
	*/
	has(name) {
		if (!isValidHeaderName(name)) throw new TypeError(`Invalid header name "${name}"`);
		return this[NORMALIZED_HEADERS].hasOwnProperty(normalizeHeaderName(name));
	}
	/**
	* Returns a `ByteString` sequence of all the values of a header with a given name.
	*/
	get(name) {
		if (!isValidHeaderName(name)) throw TypeError(`Invalid header name "${name}"`);
		return this[NORMALIZED_HEADERS][normalizeHeaderName(name)] ?? null;
	}
	/**
	* Sets a new value for an existing header inside a `Headers` object, or adds the header if it does not already exist.
	*/
	set(name, value) {
		if (!isValidHeaderName(name) || !isValidHeaderValue(value)) return;
		const normalizedName = normalizeHeaderName(name);
		const normalizedValue = normalizeHeaderValue(value);
		this[NORMALIZED_HEADERS][normalizedName] = normalizeHeaderValue(normalizedValue);
		this[RAW_HEADER_NAMES].set(normalizedName, name);
	}
	/**
	* Appends a new value onto an existing header inside a `Headers` object, or adds the header if it does not already exist.
	*/
	append(name, value) {
		if (!isValidHeaderName(name) || !isValidHeaderValue(value)) return;
		const normalizedName = normalizeHeaderName(name);
		const normalizedValue = normalizeHeaderValue(value);
		let resolvedValue = this.has(normalizedName) ? `${this.get(normalizedName)}, ${normalizedValue}` : normalizedValue;
		this.set(name, resolvedValue);
	}
	/**
	* Deletes a header from the `Headers` object.
	*/
	delete(name) {
		if (!isValidHeaderName(name)) return;
		if (!this.has(name)) return;
		const normalizedName = normalizeHeaderName(name);
		delete this[NORMALIZED_HEADERS][normalizedName];
		this[RAW_HEADER_NAMES].delete(normalizedName);
	}
	/**
	* Traverses the `Headers` object,
	* calling the given callback for each header.
	*/
	forEach(callback, thisArg) {
		for (const [name, value] of this.entries()) callback.call(thisArg, value, name, this);
	}
	/**
	* Returns an array containing the values
	* of all Set-Cookie headers associated
	* with a response
	*/
	getSetCookie() {
		const setCookieHeader = this.get("set-cookie");
		if (setCookieHeader === null) return [];
		if (setCookieHeader === "") return [""];
		return (0, import_set_cookie_parser.splitCookiesString)(setCookieHeader);
	}
};
function headersToList(headers) {
	const headersList = [];
	headers.forEach((value, name) => {
		const resolvedValue = value.includes(",") ? value.split(",").map((value2) => value2.trim()) : value;
		headersList.push([name, resolvedValue]);
	});
	return headersList;
}

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/node_modules/.pnpm/spacetimedb@2.0.3/node_modules/spacetimedb/dist/server/index.mjs
typeof globalThis !== "undefined" && (globalThis.global = globalThis.global || globalThis, globalThis.window = globalThis.window || globalThis);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
	return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") {
		for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: () => from[key],
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(__defProp(target, "default", {
	value: mod,
	enumerable: true
}), mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var require_base64_js = __commonJS({ "../../node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js"(exports) {
	exports.byteLength = byteLength;
	exports.toByteArray = toByteArray;
	exports.fromByteArray = fromByteArray2;
	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
	var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	for (i = 0, len = code.length; i < len; ++i) {
		lookup[i] = code[i];
		revLookup[code.charCodeAt(i)] = i;
	}
	var i;
	var len;
	revLookup["-".charCodeAt(0)] = 62;
	revLookup["_".charCodeAt(0)] = 63;
	function getLens(b64) {
		var len2 = b64.length;
		if (len2 % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
		var validLen = b64.indexOf("=");
		if (validLen === -1) validLen = len2;
		var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
		return [validLen, placeHoldersLen];
	}
	function byteLength(b64) {
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function _byteLength(b64, validLen, placeHoldersLen) {
		return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
	}
	function toByteArray(b64) {
		var tmp;
		var lens = getLens(b64);
		var validLen = lens[0];
		var placeHoldersLen = lens[1];
		var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
		var curByte = 0;
		var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
		var i2;
		for (i2 = 0; i2 < len2; i2 += 4) {
			tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
			arr[curByte++] = tmp >> 16 & 255;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 2) {
			tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
			arr[curByte++] = tmp & 255;
		}
		if (placeHoldersLen === 1) {
			tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
			arr[curByte++] = tmp >> 8 & 255;
			arr[curByte++] = tmp & 255;
		}
		return arr;
	}
	function tripletToBase64(num) {
		return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
	}
	function encodeChunk(uint8, start, end) {
		var tmp;
		var output = [];
		for (var i2 = start; i2 < end; i2 += 3) {
			tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
			output.push(tripletToBase64(tmp));
		}
		return output.join("");
	}
	function fromByteArray2(uint8) {
		var tmp;
		var len2 = uint8.length;
		var extraBytes = len2 % 3;
		var parts = [];
		var maxChunkLength = 16383;
		for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
		if (extraBytes === 1) {
			tmp = uint8[len2 - 1];
			parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
		} else if (extraBytes === 2) {
			tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
			parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
		}
		return parts.join("");
	}
} });
var require_codes = __commonJS({ "../../node_modules/.pnpm/statuses@2.0.2/node_modules/statuses/codes.json"(exports, module) {
	module.exports = {
		"100": "Continue",
		"101": "Switching Protocols",
		"102": "Processing",
		"103": "Early Hints",
		"200": "OK",
		"201": "Created",
		"202": "Accepted",
		"203": "Non-Authoritative Information",
		"204": "No Content",
		"205": "Reset Content",
		"206": "Partial Content",
		"207": "Multi-Status",
		"208": "Already Reported",
		"226": "IM Used",
		"300": "Multiple Choices",
		"301": "Moved Permanently",
		"302": "Found",
		"303": "See Other",
		"304": "Not Modified",
		"305": "Use Proxy",
		"307": "Temporary Redirect",
		"308": "Permanent Redirect",
		"400": "Bad Request",
		"401": "Unauthorized",
		"402": "Payment Required",
		"403": "Forbidden",
		"404": "Not Found",
		"405": "Method Not Allowed",
		"406": "Not Acceptable",
		"407": "Proxy Authentication Required",
		"408": "Request Timeout",
		"409": "Conflict",
		"410": "Gone",
		"411": "Length Required",
		"412": "Precondition Failed",
		"413": "Payload Too Large",
		"414": "URI Too Long",
		"415": "Unsupported Media Type",
		"416": "Range Not Satisfiable",
		"417": "Expectation Failed",
		"418": "I'm a Teapot",
		"421": "Misdirected Request",
		"422": "Unprocessable Entity",
		"423": "Locked",
		"424": "Failed Dependency",
		"425": "Too Early",
		"426": "Upgrade Required",
		"428": "Precondition Required",
		"429": "Too Many Requests",
		"431": "Request Header Fields Too Large",
		"451": "Unavailable For Legal Reasons",
		"500": "Internal Server Error",
		"501": "Not Implemented",
		"502": "Bad Gateway",
		"503": "Service Unavailable",
		"504": "Gateway Timeout",
		"505": "HTTP Version Not Supported",
		"506": "Variant Also Negotiates",
		"507": "Insufficient Storage",
		"508": "Loop Detected",
		"509": "Bandwidth Limit Exceeded",
		"510": "Not Extended",
		"511": "Network Authentication Required"
	};
} });
var require_statuses = __commonJS({ "../../node_modules/.pnpm/statuses@2.0.2/node_modules/statuses/index.js"(exports, module) {
	var codes = require_codes();
	module.exports = status2;
	status2.message = codes;
	status2.code = createMessageToStatusCodeMap(codes);
	status2.codes = createStatusCodeList(codes);
	status2.redirect = {
		300: true,
		301: true,
		302: true,
		303: true,
		305: true,
		307: true,
		308: true
	};
	status2.empty = {
		204: true,
		205: true,
		304: true
	};
	status2.retry = {
		502: true,
		503: true,
		504: true
	};
	function createMessageToStatusCodeMap(codes2) {
		var map = {};
		Object.keys(codes2).forEach(function forEachCode(code) {
			var message = codes2[code];
			var status3 = Number(code);
			map[message.toLowerCase()] = status3;
		});
		return map;
	}
	function createStatusCodeList(codes2) {
		return Object.keys(codes2).map(function mapCode(code) {
			return Number(code);
		});
	}
	function getStatusCode(message) {
		var msg = message.toLowerCase();
		if (!Object.prototype.hasOwnProperty.call(status2.code, msg)) throw new Error("invalid status message: \"" + message + "\"");
		return status2.code[msg];
	}
	function getStatusMessage(code) {
		if (!Object.prototype.hasOwnProperty.call(status2.message, code)) throw new Error("invalid status code: " + code);
		return status2.message[code];
	}
	function status2(code) {
		if (typeof code === "number") return getStatusMessage(code);
		if (typeof code !== "string") throw new TypeError("code must be a number or string");
		var n = parseInt(code, 10);
		if (!isNaN(n)) return getStatusMessage(n);
		return getStatusCode(code);
	}
} });
var util_stub_exports = {};
__export(util_stub_exports, { inspect: () => inspect });
var inspect;
var init_util_stub = __esm({ "src/util-stub.ts"() {
	inspect = {};
} });
var require_util_inspect = __commonJS({ "../../node_modules/.pnpm/object-inspect@1.13.4/node_modules/object-inspect/util.inspect.js"(exports, module) {
	module.exports = (init_util_stub(), __toCommonJS(util_stub_exports)).inspect;
} });
var require_object_inspect = __commonJS({ "../../node_modules/.pnpm/object-inspect@1.13.4/node_modules/object-inspect/index.js"(exports, module) {
	var hasMap = typeof Map === "function" && Map.prototype;
	var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
	var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
	var mapForEach = hasMap && Map.prototype.forEach;
	var hasSet = typeof Set === "function" && Set.prototype;
	var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
	var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
	var setForEach = hasSet && Set.prototype.forEach;
	var weakMapHas = typeof WeakMap === "function" && WeakMap.prototype ? WeakMap.prototype.has : null;
	var weakSetHas = typeof WeakSet === "function" && WeakSet.prototype ? WeakSet.prototype.has : null;
	var weakRefDeref = typeof WeakRef === "function" && WeakRef.prototype ? WeakRef.prototype.deref : null;
	var booleanValueOf = Boolean.prototype.valueOf;
	var objectToString = Object.prototype.toString;
	var functionToString = Function.prototype.toString;
	var $match = String.prototype.match;
	var $slice = String.prototype.slice;
	var $replace = String.prototype.replace;
	var $toUpperCase = String.prototype.toUpperCase;
	var $toLowerCase = String.prototype.toLowerCase;
	var $test = RegExp.prototype.test;
	var $concat = Array.prototype.concat;
	var $join = Array.prototype.join;
	var $arrSlice = Array.prototype.slice;
	var $floor = Math.floor;
	var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
	var gOPS = Object.getOwnPropertySymbols;
	var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
	var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
	var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
		return O.__proto__;
	} : null);
	function addNumericSeparator(num, str) {
		if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) return str;
		var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
		if (typeof num === "number") {
			var int = num < 0 ? -$floor(-num) : $floor(num);
			if (int !== num) {
				var intStr = String(int);
				var dec = $slice.call(str, intStr.length + 1);
				return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
			}
		}
		return $replace.call(str, sepRegex, "$&_");
	}
	var utilInspect = require_util_inspect();
	var inspectCustom = utilInspect.custom;
	var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
	var quotes = {
		__proto__: null,
		"double": "\"",
		single: "'"
	};
	var quoteREs = {
		__proto__: null,
		"double": /(["\\])/g,
		single: /(['\\])/g
	};
	module.exports = function inspect_(obj, options, depth, seen) {
		var opts = options || {};
		if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) throw new TypeError("option \"quoteStyle\" must be \"single\" or \"double\"");
		if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) throw new TypeError("option \"maxStringLength\", if provided, must be a positive integer, Infinity, or `null`");
		var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
		if (typeof customInspect !== "boolean" && customInspect !== "symbol") throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
		if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) throw new TypeError("option \"indent\" must be \"\\t\", an integer > 0, or `null`");
		if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") throw new TypeError("option \"numericSeparator\", if provided, must be `true` or `false`");
		var numericSeparator = opts.numericSeparator;
		if (typeof obj === "undefined") return "undefined";
		if (obj === null) return "null";
		if (typeof obj === "boolean") return obj ? "true" : "false";
		if (typeof obj === "string") return inspectString(obj, opts);
		if (typeof obj === "number") {
			if (obj === 0) return Infinity / obj > 0 ? "0" : "-0";
			var str = String(obj);
			return numericSeparator ? addNumericSeparator(obj, str) : str;
		}
		if (typeof obj === "bigint") {
			var bigIntStr = String(obj) + "n";
			return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
		}
		var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
		if (typeof depth === "undefined") depth = 0;
		if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") return isArray(obj) ? "[Array]" : "[Object]";
		var indent = getIndent(opts, depth);
		if (typeof seen === "undefined") seen = [];
		else if (indexOf(seen, obj) >= 0) return "[Circular]";
		function inspect3(value, from, noIndent) {
			if (from) {
				seen = $arrSlice.call(seen);
				seen.push(from);
			}
			if (noIndent) {
				var newOpts = { depth: opts.depth };
				if (has(opts, "quoteStyle")) newOpts.quoteStyle = opts.quoteStyle;
				return inspect_(value, newOpts, depth + 1, seen);
			}
			return inspect_(value, opts, depth + 1, seen);
		}
		if (typeof obj === "function" && !isRegExp(obj)) {
			var name = nameOf(obj);
			var keys = arrObjKeys(obj, inspect3);
			return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
		}
		if (isSymbol(obj)) {
			var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
			return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
		}
		if (isElement(obj)) {
			var s = "<" + $toLowerCase.call(String(obj.nodeName));
			var attrs = obj.attributes || [];
			for (var i = 0; i < attrs.length; i++) s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
			s += ">";
			if (obj.childNodes && obj.childNodes.length) s += "...";
			s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
			return s;
		}
		if (isArray(obj)) {
			if (obj.length === 0) return "[]";
			var xs = arrObjKeys(obj, inspect3);
			if (indent && !singleLineValues(xs)) return "[" + indentedJoin(xs, indent) + "]";
			return "[ " + $join.call(xs, ", ") + " ]";
		}
		if (isError(obj)) {
			var parts = arrObjKeys(obj, inspect3);
			if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect3(obj.cause), parts), ", ") + " }";
			if (parts.length === 0) return "[" + String(obj) + "]";
			return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
		}
		if (typeof obj === "object" && customInspect) {
			if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) return utilInspect(obj, { depth: maxDepth - depth });
			else if (customInspect !== "symbol" && typeof obj.inspect === "function") return obj.inspect();
		}
		if (isMap(obj)) {
			var mapParts = [];
			if (mapForEach) mapForEach.call(obj, function(value, key) {
				mapParts.push(inspect3(key, obj, true) + " => " + inspect3(value, obj));
			});
			return collectionOf("Map", mapSize.call(obj), mapParts, indent);
		}
		if (isSet(obj)) {
			var setParts = [];
			if (setForEach) setForEach.call(obj, function(value) {
				setParts.push(inspect3(value, obj));
			});
			return collectionOf("Set", setSize.call(obj), setParts, indent);
		}
		if (isWeakMap(obj)) return weakCollectionOf("WeakMap");
		if (isWeakSet(obj)) return weakCollectionOf("WeakSet");
		if (isWeakRef(obj)) return weakCollectionOf("WeakRef");
		if (isNumber(obj)) return markBoxed(inspect3(Number(obj)));
		if (isBigInt(obj)) return markBoxed(inspect3(bigIntValueOf.call(obj)));
		if (isBoolean(obj)) return markBoxed(booleanValueOf.call(obj));
		if (isString(obj)) return markBoxed(inspect3(String(obj)));
		if (typeof window !== "undefined" && obj === window) return "{ [object Window] }";
		if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) return "{ [object globalThis] }";
		if (!isDate(obj) && !isRegExp(obj)) {
			var ys = arrObjKeys(obj, inspect3);
			var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
			var protoTag = obj instanceof Object ? "" : "null prototype";
			var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
			var tag = (isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "") + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
			if (ys.length === 0) return tag + "{}";
			if (indent) return tag + "{" + indentedJoin(ys, indent) + "}";
			return tag + "{ " + $join.call(ys, ", ") + " }";
		}
		return String(obj);
	};
	function wrapQuotes(s, defaultStyle, opts) {
		var quoteChar = quotes[opts.quoteStyle || defaultStyle];
		return quoteChar + s + quoteChar;
	}
	function quote(s) {
		return $replace.call(String(s), /"/g, "&quot;");
	}
	function canTrustToString(obj) {
		return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
	}
	function isArray(obj) {
		return toStr(obj) === "[object Array]" && canTrustToString(obj);
	}
	function isDate(obj) {
		return toStr(obj) === "[object Date]" && canTrustToString(obj);
	}
	function isRegExp(obj) {
		return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
	}
	function isError(obj) {
		return toStr(obj) === "[object Error]" && canTrustToString(obj);
	}
	function isString(obj) {
		return toStr(obj) === "[object String]" && canTrustToString(obj);
	}
	function isNumber(obj) {
		return toStr(obj) === "[object Number]" && canTrustToString(obj);
	}
	function isBoolean(obj) {
		return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
	}
	function isSymbol(obj) {
		if (hasShammedSymbols) return obj && typeof obj === "object" && obj instanceof Symbol;
		if (typeof obj === "symbol") return true;
		if (!obj || typeof obj !== "object" || !symToString) return false;
		try {
			symToString.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	function isBigInt(obj) {
		if (!obj || typeof obj !== "object" || !bigIntValueOf) return false;
		try {
			bigIntValueOf.call(obj);
			return true;
		} catch (e) {}
		return false;
	}
	var hasOwn2 = Object.prototype.hasOwnProperty || function(key) {
		return key in this;
	};
	function has(obj, key) {
		return hasOwn2.call(obj, key);
	}
	function toStr(obj) {
		return objectToString.call(obj);
	}
	function nameOf(f) {
		if (f.name) return f.name;
		var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
		if (m) return m[1];
		return null;
	}
	function indexOf(xs, x) {
		if (xs.indexOf) return xs.indexOf(x);
		for (var i = 0, l = xs.length; i < l; i++) if (xs[i] === x) return i;
		return -1;
	}
	function isMap(x) {
		if (!mapSize || !x || typeof x !== "object") return false;
		try {
			mapSize.call(x);
			try {
				setSize.call(x);
			} catch (s) {
				return true;
			}
			return x instanceof Map;
		} catch (e) {}
		return false;
	}
	function isWeakMap(x) {
		if (!weakMapHas || !x || typeof x !== "object") return false;
		try {
			weakMapHas.call(x, weakMapHas);
			try {
				weakSetHas.call(x, weakSetHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakMap;
		} catch (e) {}
		return false;
	}
	function isWeakRef(x) {
		if (!weakRefDeref || !x || typeof x !== "object") return false;
		try {
			weakRefDeref.call(x);
			return true;
		} catch (e) {}
		return false;
	}
	function isSet(x) {
		if (!setSize || !x || typeof x !== "object") return false;
		try {
			setSize.call(x);
			try {
				mapSize.call(x);
			} catch (m) {
				return true;
			}
			return x instanceof Set;
		} catch (e) {}
		return false;
	}
	function isWeakSet(x) {
		if (!weakSetHas || !x || typeof x !== "object") return false;
		try {
			weakSetHas.call(x, weakSetHas);
			try {
				weakMapHas.call(x, weakMapHas);
			} catch (s) {
				return true;
			}
			return x instanceof WeakSet;
		} catch (e) {}
		return false;
	}
	function isElement(x) {
		if (!x || typeof x !== "object") return false;
		if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) return true;
		return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
	}
	function inspectString(str, opts) {
		if (str.length > opts.maxStringLength) {
			var remaining = str.length - opts.maxStringLength;
			var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
			return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
		}
		var quoteRE = quoteREs[opts.quoteStyle || "single"];
		quoteRE.lastIndex = 0;
		return wrapQuotes($replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte), "single", opts);
	}
	function lowbyte(c) {
		var n = c.charCodeAt(0);
		var x = {
			8: "b",
			9: "t",
			10: "n",
			12: "f",
			13: "r"
		}[n];
		if (x) return "\\" + x;
		return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
	}
	function markBoxed(str) {
		return "Object(" + str + ")";
	}
	function weakCollectionOf(type) {
		return type + " { ? }";
	}
	function collectionOf(type, size, entries, indent) {
		var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
		return type + " (" + size + ") {" + joinedEntries + "}";
	}
	function singleLineValues(xs) {
		for (var i = 0; i < xs.length; i++) if (indexOf(xs[i], "\n") >= 0) return false;
		return true;
	}
	function getIndent(opts, depth) {
		var baseIndent;
		if (opts.indent === "	") baseIndent = "	";
		else if (typeof opts.indent === "number" && opts.indent > 0) baseIndent = $join.call(Array(opts.indent + 1), " ");
		else return null;
		return {
			base: baseIndent,
			prev: $join.call(Array(depth + 1), baseIndent)
		};
	}
	function indentedJoin(xs, indent) {
		if (xs.length === 0) return "";
		var lineJoiner = "\n" + indent.prev + indent.base;
		return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
	}
	function arrObjKeys(obj, inspect3) {
		var isArr = isArray(obj);
		var xs = [];
		if (isArr) {
			xs.length = obj.length;
			for (var i = 0; i < obj.length; i++) xs[i] = has(obj, i) ? inspect3(obj[i], obj) : "";
		}
		var syms = typeof gOPS === "function" ? gOPS(obj) : [];
		var symMap;
		if (hasShammedSymbols) {
			symMap = {};
			for (var k = 0; k < syms.length; k++) symMap["$" + syms[k]] = syms[k];
		}
		for (var key in obj) {
			if (!has(obj, key)) continue;
			if (isArr && String(Number(key)) === key && key < obj.length) continue;
			if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) continue;
			else if ($test.call(/[^\w$]/, key)) xs.push(inspect3(key, obj) + ": " + inspect3(obj[key], obj));
			else xs.push(key + ": " + inspect3(obj[key], obj));
		}
		if (typeof gOPS === "function") {
			for (var j = 0; j < syms.length; j++) if (isEnumerable.call(obj, syms[j])) xs.push("[" + inspect3(syms[j]) + "]: " + inspect3(obj[syms[j]], obj));
		}
		return xs;
	}
} });
var TimeDuration = class _TimeDuration {
	__time_duration_micros__;
	static MICROS_PER_MILLIS = 1000n;
	/**
	* Get the algebraic type representation of the {@link TimeDuration} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__time_duration_micros__",
			algebraicType: AlgebraicType.I64
		}] });
	}
	static isTimeDuration(algebraicType) {
		if (algebraicType.tag !== "Product") return false;
		const elements = algebraicType.value.elements;
		if (elements.length !== 1) return false;
		const microsElement = elements[0];
		return microsElement.name === "__time_duration_micros__" && microsElement.algebraicType.tag === "I64";
	}
	get micros() {
		return this.__time_duration_micros__;
	}
	get millis() {
		return Number(this.micros / _TimeDuration.MICROS_PER_MILLIS);
	}
	constructor(micros) {
		this.__time_duration_micros__ = micros;
	}
	static fromMillis(millis) {
		return new _TimeDuration(BigInt(millis) * _TimeDuration.MICROS_PER_MILLIS);
	}
	/** This outputs the same string format that we use in the host and in Rust modules */
	toString() {
		const micros = this.micros;
		const sign = micros < 0 ? "-" : "+";
		const pos = micros < 0 ? -micros : micros;
		const secs = pos / 1000000n;
		const micros_remaining = pos % 1000000n;
		return `${sign}${secs}.${String(micros_remaining).padStart(6, "0")}`;
	}
};
var Timestamp = class _Timestamp {
	__timestamp_micros_since_unix_epoch__;
	static MICROS_PER_MILLIS = 1000n;
	get microsSinceUnixEpoch() {
		return this.__timestamp_micros_since_unix_epoch__;
	}
	constructor(micros) {
		this.__timestamp_micros_since_unix_epoch__ = micros;
	}
	/**
	* Get the algebraic type representation of the {@link Timestamp} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__timestamp_micros_since_unix_epoch__",
			algebraicType: AlgebraicType.I64
		}] });
	}
	static isTimestamp(algebraicType) {
		if (algebraicType.tag !== "Product") return false;
		const elements = algebraicType.value.elements;
		if (elements.length !== 1) return false;
		const microsElement = elements[0];
		return microsElement.name === "__timestamp_micros_since_unix_epoch__" && microsElement.algebraicType.tag === "I64";
	}
	/**
	* The Unix epoch, the midnight at the beginning of January 1, 1970, UTC.
	*/
	static UNIX_EPOCH = new _Timestamp(0n);
	/**
	* Get a `Timestamp` representing the execution environment's belief of the current moment in time.
	*/
	static now() {
		return _Timestamp.fromDate(/* @__PURE__ */ new Date());
	}
	/** Convert to milliseconds since Unix epoch. */
	toMillis() {
		return this.microsSinceUnixEpoch / 1000n;
	}
	/**
	* Get a `Timestamp` representing the same point in time as `date`.
	*/
	static fromDate(date) {
		const millis = date.getTime();
		return new _Timestamp(BigInt(millis) * _Timestamp.MICROS_PER_MILLIS);
	}
	/**
	* Get a `Date` representing approximately the same point in time as `this`.
	*
	* This method truncates to millisecond precision,
	* and throws `RangeError` if the `Timestamp` is outside the range representable as a `Date`.
	*/
	toDate() {
		const millis = this.__timestamp_micros_since_unix_epoch__ / _Timestamp.MICROS_PER_MILLIS;
		if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) throw new RangeError("Timestamp is outside of the representable range of JS's Date");
		return new Date(Number(millis));
	}
	/**
	* Get an ISO 8601 / RFC 3339 formatted string representation of this timestamp with microsecond precision.
	*
	* This method preserves the full microsecond precision of the timestamp,
	* and throws `RangeError` if the `Timestamp` is outside the range representable in ISO format.
	*
	* @returns ISO 8601 formatted string with microsecond precision (e.g., '2025-02-17T10:30:45.123456Z')
	*/
	toISOString() {
		const micros = this.__timestamp_micros_since_unix_epoch__;
		const millis = micros / _Timestamp.MICROS_PER_MILLIS;
		if (millis > BigInt(Number.MAX_SAFE_INTEGER) || millis < BigInt(Number.MIN_SAFE_INTEGER)) throw new RangeError("Timestamp is outside of the representable range for ISO string formatting");
		const isoBase = new Date(Number(millis)).toISOString();
		const microsRemainder = Math.abs(Number(micros % 1000000n));
		const fractionalPart = String(microsRemainder).padStart(6, "0");
		return isoBase.replace(/\.\d{3}Z$/, `.${fractionalPart}Z`);
	}
	since(other) {
		return new TimeDuration(this.__timestamp_micros_since_unix_epoch__ - other.__timestamp_micros_since_unix_epoch__);
	}
};
var Uuid = class _Uuid {
	__uuid__;
	/**
	* The nil UUID (all zeros).
	*
	* @example
	* ```ts
	* const uuid = Uuid.NIL;
	* console.assert(
	*   uuid.toString() === "00000000-0000-0000-0000-000000000000"
	* );
	* ```
	*/
	static NIL = new _Uuid(0n);
	static MAX_UUID_BIGINT = 340282366920938463463374607431768211455n;
	/**
	* The max UUID (all ones).
	*
	* @example
	* ```ts
	* const uuid = Uuid.MAX;
	* console.assert(
	*   uuid.toString() === "ffffffff-ffff-ffff-ffff-ffffffffffff"
	* );
	* ```
	*/
	static MAX = new _Uuid(_Uuid.MAX_UUID_BIGINT);
	/**
	* Create a UUID from a raw 128-bit value.
	*
	* @param u - Unsigned 128-bit integer
	* @throws {Error} If the value is outside the valid UUID range
	*/
	constructor(u) {
		if (u < 0n || u > _Uuid.MAX_UUID_BIGINT) throw new Error("Invalid UUID: must be between 0 and `MAX_UUID_BIGINT`");
		this.__uuid__ = u;
	}
	/**
	* Create a UUID `v4` from explicit random bytes.
	*
	* This method assumes the bytes are already sufficiently random.
	* It only sets the appropriate bits for the UUID version and variant.
	*
	* @param bytes - Exactly 16 random bytes
	* @returns A UUID `v4`
	* @throws {Error} If `bytes.length !== 16`
	*
	* @example
	* ```ts
	* const randomBytes = new Uint8Array(16);
	* const uuid = Uuid.fromRandomBytesV4(randomBytes);
	*
	* console.assert(
	*   uuid.toString() === "00000000-0000-4000-8000-000000000000"
	* );
	* ```
	*/
	static fromRandomBytesV4(bytes) {
		if (bytes.length !== 16) throw new Error("UUID v4 requires 16 bytes");
		const arr = new Uint8Array(bytes);
		arr[6] = arr[6] & 15 | 64;
		arr[8] = arr[8] & 63 | 128;
		return new _Uuid(_Uuid.bytesToBigInt(arr));
	}
	/**
	* Generate a UUID `v7` using a monotonic counter from `0` to `2^31 - 1`,
	* a timestamp, and 4 random bytes.
	*
	* The counter wraps around on overflow.
	*
	* The UUID `v7` is structured as follows:
	*
	* ```ascii
	* ┌───────────────────────────────────────────────┬───────────────────┐
	* | B0  | B1  | B2  | B3  | B4  | B5              |         B6        |
	* ├───────────────────────────────────────────────┼───────────────────┤
	* |                 unix_ts_ms                    |      version 7    |
	* └───────────────────────────────────────────────┴───────────────────┘
	* ┌──────────────┬─────────┬──────────────────┬───────────────────────┐
	* | B7           | B8      | B9  | B10 | B11  | B12 | B13 | B14 | B15 |
	* ├──────────────┼─────────┼──────────────────┼───────────────────────┤
	* | counter_high | variant |    counter_low   |        random         |
	* └──────────────┴─────────┴──────────────────┴───────────────────────┘
	* ```
	*
	* @param counter - Mutable monotonic counter (31-bit)
	* @param now - Timestamp since the Unix epoch
	* @param randomBytes - Exactly 4 random bytes
	* @returns A UUID `v7`
	*
	* @throws {Error} If the `counter` is negative
	* @throws {Error} If the `timestamp` is before the Unix epoch
	* @throws {Error} If `randomBytes.length !== 4`
	*
	* @example
	* ```ts
	* const now = Timestamp.fromMillis(1_686_000_000_000n);
	* const counter = { value: 1 };
	* const randomBytes = new Uint8Array(4);
	*
	* const uuid = Uuid.fromCounterV7(counter, now, randomBytes);
	*
	* console.assert(
	*   uuid.toString() === "0000647e-5180-7000-8000-000200000000"
	* );
	* ```
	*/
	static fromCounterV7(counter, now, randomBytes) {
		if (randomBytes.length !== 4) throw new Error("`fromCounterV7` requires `randomBytes.length == 4`");
		if (counter.value < 0) throw new Error("`fromCounterV7` uuid `counter` must be non-negative");
		if (now.__timestamp_micros_since_unix_epoch__ < 0) throw new Error("`fromCounterV7` `timestamp` before unix epoch");
		const counterVal = counter.value;
		counter.value = counterVal + 1 & 2147483647;
		const tsMs = now.toMillis() & 281474976710655n;
		const bytes = new Uint8Array(16);
		bytes[0] = Number(tsMs >> 40n & 255n);
		bytes[1] = Number(tsMs >> 32n & 255n);
		bytes[2] = Number(tsMs >> 24n & 255n);
		bytes[3] = Number(tsMs >> 16n & 255n);
		bytes[4] = Number(tsMs >> 8n & 255n);
		bytes[5] = Number(tsMs & 255n);
		bytes[7] = counterVal >>> 23 & 255;
		bytes[9] = counterVal >>> 15 & 255;
		bytes[10] = counterVal >>> 7 & 255;
		bytes[11] = (counterVal & 127) << 1 & 255;
		bytes[12] |= randomBytes[0] & 127;
		bytes[13] = randomBytes[1];
		bytes[14] = randomBytes[2];
		bytes[15] = randomBytes[3];
		bytes[6] = bytes[6] & 15 | 112;
		bytes[8] = bytes[8] & 63 | 128;
		return new _Uuid(_Uuid.bytesToBigInt(bytes));
	}
	/**
	* Parse a UUID from a string representation.
	*
	* @param s - UUID string
	* @returns Parsed UUID
	* @throws {Error} If the string is not a valid UUID
	*
	* @example
	* ```ts
	* const s = "01888d6e-5c00-7000-8000-000000000000";
	* const uuid = Uuid.parse(s);
	*
	* console.assert(uuid.toString() === s);
	* ```
	*/
	static parse(s) {
		const hex = s.replace(/-/g, "");
		if (hex.length !== 32) throw new Error("Invalid hex UUID");
		let v = 0n;
		for (let i = 0; i < 32; i += 2) v = v << 8n | BigInt(parseInt(hex.slice(i, i + 2), 16));
		return new _Uuid(v);
	}
	/** Convert to string (hyphenated form). */
	toString() {
		const hex = [..._Uuid.bigIntToBytes(this.__uuid__)].map((b) => b.toString(16).padStart(2, "0")).join("");
		return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
	}
	/** Convert to bigint (u128). */
	asBigInt() {
		return this.__uuid__;
	}
	/** Return a `Uint8Array` of 16 bytes. */
	toBytes() {
		return _Uuid.bigIntToBytes(this.__uuid__);
	}
	static bytesToBigInt(bytes) {
		let result = 0n;
		for (const b of bytes) result = result << 8n | BigInt(b);
		return result;
	}
	static bigIntToBytes(value) {
		const bytes = new Uint8Array(16);
		for (let i = 15; i >= 0; i--) {
			bytes[i] = Number(value & 255n);
			value >>= 8n;
		}
		return bytes;
	}
	/**
	* Returns the version of this UUID.
	*
	* This represents the algorithm used to generate the value.
	*
	* @returns A `UuidVersion`
	* @throws {Error} If the version field is not recognized
	*/
	getVersion() {
		const version = this.toBytes()[6] >> 4 & 15;
		switch (version) {
			case 4: return "V4";
			case 7: return "V7";
			default:
				if (this == _Uuid.NIL) return "Nil";
				if (this == _Uuid.MAX) return "Max";
				throw new Error(`Unsupported UUID version: ${version}`);
		}
	}
	/**
	* Extract the monotonic counter from a UUIDv7.
	*
	* Intended for testing and diagnostics.
	* Behavior is undefined if called on a non-V7 UUID.
	*
	* @returns 31-bit counter value
	*/
	getCounter() {
		const bytes = this.toBytes();
		const high = bytes[7];
		const mid1 = bytes[9];
		const mid2 = bytes[10];
		const low = bytes[11] >>> 1;
		return high << 23 | mid1 << 15 | mid2 << 7 | low | 0;
	}
	compareTo(other) {
		if (this.__uuid__ < other.__uuid__) return -1;
		if (this.__uuid__ > other.__uuid__) return 1;
		return 0;
	}
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__uuid__",
			algebraicType: AlgebraicType.U128
		}] });
	}
};
var BinaryReader = class {
	/**
	* The DataView used to read values from the binary data.
	*
	* Note: The DataView's `byteOffset` is relative to the beginning of the
	* underlying ArrayBuffer, not the start of the provided Uint8Array input.
	* This `BinaryReader`'s `#offset` field is used to track the current read position
	* relative to the start of the provided Uint8Array input.
	*/
	view;
	/**
	* Represents the offset (in bytes) relative to the start of the DataView
	* and provided Uint8Array input.
	*
	* Note: This is *not* the absolute byte offset within the underlying ArrayBuffer.
	*/
	offset = 0;
	constructor(input) {
		this.view = input instanceof DataView ? input : new DataView(input.buffer, input.byteOffset, input.byteLength);
		this.offset = 0;
	}
	reset(view) {
		this.view = view;
		this.offset = 0;
	}
	get remaining() {
		return this.view.byteLength - this.offset;
	}
	/** Ensure we have at least `n` bytes left to read */
	#ensure(n) {
		if (this.offset + n > this.view.byteLength) throw new RangeError(`Tried to read ${n} byte(s) at relative offset ${this.offset}, but only ${this.remaining} byte(s) remain`);
	}
	readUInt8Array() {
		const length = this.readU32();
		this.#ensure(length);
		return this.readBytes(length);
	}
	readBool() {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value !== 0;
	}
	readByte() {
		const value = this.view.getUint8(this.offset);
		this.offset += 1;
		return value;
	}
	readBytes(length) {
		const array = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, length);
		this.offset += length;
		return array;
	}
	readI8() {
		const value = this.view.getInt8(this.offset);
		this.offset += 1;
		return value;
	}
	readU8() {
		return this.readByte();
	}
	readI16() {
		const value = this.view.getInt16(this.offset, true);
		this.offset += 2;
		return value;
	}
	readU16() {
		const value = this.view.getUint16(this.offset, true);
		this.offset += 2;
		return value;
	}
	readI32() {
		const value = this.view.getInt32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readU32() {
		const value = this.view.getUint32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readI64() {
		const value = this.view.getBigInt64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readU64() {
		const value = this.view.getBigUint64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readU128() {
		const lowerPart = this.view.getBigUint64(this.offset, true);
		const upperPart = this.view.getBigUint64(this.offset + 8, true);
		this.offset += 16;
		return (upperPart << BigInt(64)) + lowerPart;
	}
	readI128() {
		const lowerPart = this.view.getBigUint64(this.offset, true);
		const upperPart = this.view.getBigInt64(this.offset + 8, true);
		this.offset += 16;
		return (upperPart << BigInt(64)) + lowerPart;
	}
	readU256() {
		const p0 = this.view.getBigUint64(this.offset, true);
		const p1 = this.view.getBigUint64(this.offset + 8, true);
		const p2 = this.view.getBigUint64(this.offset + 16, true);
		const p3 = this.view.getBigUint64(this.offset + 24, true);
		this.offset += 32;
		return (p3 << BigInt(192)) + (p2 << BigInt(128)) + (p1 << BigInt(64)) + p0;
	}
	readI256() {
		const p0 = this.view.getBigUint64(this.offset, true);
		const p1 = this.view.getBigUint64(this.offset + 8, true);
		const p2 = this.view.getBigUint64(this.offset + 16, true);
		const p3 = this.view.getBigInt64(this.offset + 24, true);
		this.offset += 32;
		return (p3 << BigInt(192)) + (p2 << BigInt(128)) + (p1 << BigInt(64)) + p0;
	}
	readF32() {
		const value = this.view.getFloat32(this.offset, true);
		this.offset += 4;
		return value;
	}
	readF64() {
		const value = this.view.getFloat64(this.offset, true);
		this.offset += 8;
		return value;
	}
	readString() {
		const uint8Array = this.readUInt8Array();
		return new TextDecoder("utf-8").decode(uint8Array);
	}
};
var import_base64_js = __toESM(require_base64_js());
var ArrayBufferPrototypeTransfer = ArrayBuffer.prototype.transfer ?? function(newByteLength) {
	if (newByteLength === void 0) return this.slice();
	else if (newByteLength <= this.byteLength) return this.slice(0, newByteLength);
	else {
		const copy = new Uint8Array(newByteLength);
		copy.set(new Uint8Array(this));
		return copy.buffer;
	}
};
var ResizableBuffer = class {
	buffer;
	view;
	constructor(init) {
		this.buffer = typeof init === "number" ? new ArrayBuffer(init) : init;
		this.view = new DataView(this.buffer);
	}
	get capacity() {
		return this.buffer.byteLength;
	}
	grow(newSize) {
		if (newSize <= this.buffer.byteLength) return;
		this.buffer = ArrayBufferPrototypeTransfer.call(this.buffer, newSize);
		this.view = new DataView(this.buffer);
	}
};
var BinaryWriter = class {
	buffer;
	offset = 0;
	constructor(init) {
		this.buffer = typeof init === "number" ? new ResizableBuffer(init) : init;
	}
	reset(buffer) {
		this.buffer = buffer;
		this.offset = 0;
	}
	expandBuffer(additionalCapacity) {
		const minCapacity = this.offset + additionalCapacity + 1;
		if (minCapacity <= this.buffer.capacity) return;
		let newCapacity = this.buffer.capacity * 2;
		if (newCapacity < minCapacity) newCapacity = minCapacity;
		this.buffer.grow(newCapacity);
	}
	toBase64() {
		return (0, import_base64_js.fromByteArray)(this.getBuffer());
	}
	getBuffer() {
		return new Uint8Array(this.buffer.buffer, 0, this.offset);
	}
	get view() {
		return this.buffer.view;
	}
	writeUInt8Array(value) {
		const length = value.length;
		this.expandBuffer(4 + length);
		this.writeU32(length);
		new Uint8Array(this.buffer.buffer, this.offset).set(value);
		this.offset += length;
	}
	writeBool(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value ? 1 : 0);
		this.offset += 1;
	}
	writeByte(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}
	writeI8(value) {
		this.expandBuffer(1);
		this.view.setInt8(this.offset, value);
		this.offset += 1;
	}
	writeU8(value) {
		this.expandBuffer(1);
		this.view.setUint8(this.offset, value);
		this.offset += 1;
	}
	writeI16(value) {
		this.expandBuffer(2);
		this.view.setInt16(this.offset, value, true);
		this.offset += 2;
	}
	writeU16(value) {
		this.expandBuffer(2);
		this.view.setUint16(this.offset, value, true);
		this.offset += 2;
	}
	writeI32(value) {
		this.expandBuffer(4);
		this.view.setInt32(this.offset, value, true);
		this.offset += 4;
	}
	writeU32(value) {
		this.expandBuffer(4);
		this.view.setUint32(this.offset, value, true);
		this.offset += 4;
	}
	writeI64(value) {
		this.expandBuffer(8);
		this.view.setBigInt64(this.offset, value, true);
		this.offset += 8;
	}
	writeU64(value) {
		this.expandBuffer(8);
		this.view.setBigUint64(this.offset, value, true);
		this.offset += 8;
	}
	writeU128(value) {
		this.expandBuffer(16);
		const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
		const upperPart = value >> BigInt(64);
		this.view.setBigUint64(this.offset, lowerPart, true);
		this.view.setBigUint64(this.offset + 8, upperPart, true);
		this.offset += 16;
	}
	writeI128(value) {
		this.expandBuffer(16);
		const lowerPart = value & BigInt("0xFFFFFFFFFFFFFFFF");
		const upperPart = value >> BigInt(64);
		this.view.setBigInt64(this.offset, lowerPart, true);
		this.view.setBigInt64(this.offset + 8, upperPart, true);
		this.offset += 16;
	}
	writeU256(value) {
		this.expandBuffer(32);
		const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
		const p0 = value & low_64_mask;
		const p1 = value >> BigInt(64) & low_64_mask;
		const p2 = value >> BigInt(128) & low_64_mask;
		const p3 = value >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, p0, true);
		this.view.setBigUint64(this.offset + 8, p1, true);
		this.view.setBigUint64(this.offset + 16, p2, true);
		this.view.setBigUint64(this.offset + 24, p3, true);
		this.offset += 32;
	}
	writeI256(value) {
		this.expandBuffer(32);
		const low_64_mask = BigInt("0xFFFFFFFFFFFFFFFF");
		const p0 = value & low_64_mask;
		const p1 = value >> BigInt(64) & low_64_mask;
		const p2 = value >> BigInt(128) & low_64_mask;
		const p3 = value >> BigInt(192);
		this.view.setBigUint64(this.offset + 0, p0, true);
		this.view.setBigUint64(this.offset + 8, p1, true);
		this.view.setBigUint64(this.offset + 16, p2, true);
		this.view.setBigInt64(this.offset + 24, p3, true);
		this.offset += 32;
	}
	writeF32(value) {
		this.expandBuffer(4);
		this.view.setFloat32(this.offset, value, true);
		this.offset += 4;
	}
	writeF64(value) {
		this.expandBuffer(8);
		this.view.setFloat64(this.offset, value, true);
		this.offset += 8;
	}
	writeString(value) {
		const encodedString = new TextEncoder().encode(value);
		this.writeUInt8Array(encodedString);
	}
};
function uint8ArrayToHexString(array) {
	return Array.prototype.map.call(array.reverse(), (x) => ("00" + x.toString(16)).slice(-2)).join("");
}
function uint8ArrayToU128(array) {
	if (array.length != 16) throw new Error(`Uint8Array is not 16 bytes long: ${array}`);
	return new BinaryReader(array).readU128();
}
function uint8ArrayToU256(array) {
	if (array.length != 32) throw new Error(`Uint8Array is not 32 bytes long: [${array}]`);
	return new BinaryReader(array).readU256();
}
function hexStringToUint8Array(str) {
	if (str.startsWith("0x")) str = str.slice(2);
	const matches = str.match(/.{1,2}/g) || [];
	return Uint8Array.from(matches.map((byte) => parseInt(byte, 16))).reverse();
}
function hexStringToU128(str) {
	return uint8ArrayToU128(hexStringToUint8Array(str));
}
function hexStringToU256(str) {
	return uint8ArrayToU256(hexStringToUint8Array(str));
}
function u128ToUint8Array(data) {
	const writer = new BinaryWriter(16);
	writer.writeU128(data);
	return writer.getBuffer();
}
function u128ToHexString(data) {
	return uint8ArrayToHexString(u128ToUint8Array(data));
}
function u256ToUint8Array(data) {
	const writer = new BinaryWriter(32);
	writer.writeU256(data);
	return writer.getBuffer();
}
function u256ToHexString(data) {
	return uint8ArrayToHexString(u256ToUint8Array(data));
}
function toPascalCase(s) {
	const str = toCamelCase(s);
	return str.charAt(0).toUpperCase() + str.slice(1);
}
function toCamelCase(s) {
	const str = s.replace(/[-_]+/g, "_").replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
	return str.charAt(0).toLowerCase() + str.slice(1);
}
function bsatnBaseSize(typespace, ty) {
	const assumedArrayLength = 4;
	while (ty.tag === "Ref") ty = typespace.types[ty.value];
	if (ty.tag === "Product") {
		let sum = 0;
		for (const { algebraicType: elem } of ty.value.elements) sum += bsatnBaseSize(typespace, elem);
		return sum;
	} else if (ty.tag === "Sum") {
		let min = Infinity;
		for (const { algebraicType: vari } of ty.value.variants) {
			const vSize = bsatnBaseSize(typespace, vari);
			if (vSize < min) min = vSize;
		}
		if (min === Infinity) min = 0;
		return 4 + min;
	} else if (ty.tag == "Array") return 4 + assumedArrayLength * bsatnBaseSize(typespace, ty.value);
	return {
		String: 4 + assumedArrayLength,
		Sum: 1,
		Bool: 1,
		I8: 1,
		U8: 1,
		I16: 2,
		U16: 2,
		I32: 4,
		U32: 4,
		F32: 4,
		I64: 8,
		U64: 8,
		F64: 8,
		I128: 16,
		U128: 16,
		I256: 32,
		U256: 32
	}[ty.tag];
}
var hasOwn = Object.hasOwn;
var ConnectionId = class _ConnectionId {
	__connection_id__;
	/**
	* Creates a new `ConnectionId`.
	*/
	constructor(data) {
		this.__connection_id__ = data;
	}
	/**
	* Get the algebraic type representation of the {@link ConnectionId} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__connection_id__",
			algebraicType: AlgebraicType.U128
		}] });
	}
	isZero() {
		return this.__connection_id__ === BigInt(0);
	}
	static nullIfZero(addr) {
		if (addr.isZero()) return null;
		else return addr;
	}
	static random() {
		function randomU8() {
			return Math.floor(Math.random() * 255);
		}
		let result = BigInt(0);
		for (let i = 0; i < 16; i++) result = result << BigInt(8) | BigInt(randomU8());
		return new _ConnectionId(result);
	}
	/**
	* Compare two connection IDs for equality.
	*/
	isEqual(other) {
		return this.__connection_id__ == other.__connection_id__;
	}
	/**
	* Check if two connection IDs are equal.
	*/
	equals(other) {
		return this.isEqual(other);
	}
	/**
	* Print the connection ID as a hexadecimal string.
	*/
	toHexString() {
		return u128ToHexString(this.__connection_id__);
	}
	/**
	* Convert the connection ID to a Uint8Array.
	*/
	toUint8Array() {
		return u128ToUint8Array(this.__connection_id__);
	}
	/**
	* Parse a connection ID from a hexadecimal string.
	*/
	static fromString(str) {
		return new _ConnectionId(hexStringToU128(str));
	}
	static fromStringOrNull(str) {
		const addr = _ConnectionId.fromString(str);
		if (addr.isZero()) return null;
		else return addr;
	}
};
var Identity = class _Identity {
	__identity__;
	/**
	* Creates a new `Identity`.
	*
	* `data` can be a hexadecimal string or a `bigint`.
	*/
	constructor(data) {
		this.__identity__ = typeof data === "string" ? hexStringToU256(data) : data;
	}
	/**
	* Get the algebraic type representation of the {@link Identity} type.
	* @returns The algebraic type representation of the type.
	*/
	static getAlgebraicType() {
		return AlgebraicType.Product({ elements: [{
			name: "__identity__",
			algebraicType: AlgebraicType.U256
		}] });
	}
	/**
	* Check if two identities are equal.
	*/
	isEqual(other) {
		return this.toHexString() === other.toHexString();
	}
	/**
	* Check if two identities are equal.
	*/
	equals(other) {
		return this.isEqual(other);
	}
	/**
	* Print the identity as a hexadecimal string.
	*/
	toHexString() {
		return u256ToHexString(this.__identity__);
	}
	/**
	* Convert the address to a Uint8Array.
	*/
	toUint8Array() {
		return u256ToUint8Array(this.__identity__);
	}
	/**
	* Parse an Identity from a hexadecimal string.
	*/
	static fromString(str) {
		return new _Identity(str);
	}
	/**
	* Zero identity (0x0000000000000000000000000000000000000000000000000000000000000000)
	*/
	static zero() {
		return new _Identity(0n);
	}
	toString() {
		return this.toHexString();
	}
};
var SERIALIZERS = /* @__PURE__ */ new Map();
var DESERIALIZERS = /* @__PURE__ */ new Map();
var AlgebraicType = {
	Ref: (value) => ({
		tag: "Ref",
		value
	}),
	Sum: (value) => ({
		tag: "Sum",
		value
	}),
	Product: (value) => ({
		tag: "Product",
		value
	}),
	Array: (value) => ({
		tag: "Array",
		value
	}),
	String: { tag: "String" },
	Bool: { tag: "Bool" },
	I8: { tag: "I8" },
	U8: { tag: "U8" },
	I16: { tag: "I16" },
	U16: { tag: "U16" },
	I32: { tag: "I32" },
	U32: { tag: "U32" },
	I64: { tag: "I64" },
	U64: { tag: "U64" },
	I128: { tag: "I128" },
	U128: { tag: "U128" },
	I256: { tag: "I256" },
	U256: { tag: "U256" },
	F32: { tag: "F32" },
	F64: { tag: "F64" },
	makeSerializer(ty, typespace) {
		if (ty.tag === "Ref") {
			if (!typespace) throw new Error("cannot serialize refs without a typespace");
			while (ty.tag === "Ref") ty = typespace.types[ty.value];
		}
		switch (ty.tag) {
			case "Product": return ProductType.makeSerializer(ty.value, typespace);
			case "Sum": return SumType.makeSerializer(ty.value, typespace);
			case "Array": if (ty.value.tag === "U8") return serializeUint8Array;
			else {
				const serialize = AlgebraicType.makeSerializer(ty.value, typespace);
				return (writer, value) => {
					writer.writeU32(value.length);
					for (const elem of value) serialize(writer, elem);
				};
			}
			default: return primitiveSerializers[ty.tag];
		}
	},
	serializeValue(writer, ty, value, typespace) {
		AlgebraicType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		if (ty.tag === "Ref") {
			if (!typespace) throw new Error("cannot deserialize refs without a typespace");
			while (ty.tag === "Ref") ty = typespace.types[ty.value];
		}
		switch (ty.tag) {
			case "Product": return ProductType.makeDeserializer(ty.value, typespace);
			case "Sum": return SumType.makeDeserializer(ty.value, typespace);
			case "Array": if (ty.value.tag === "U8") return deserializeUint8Array;
			else {
				const deserialize = AlgebraicType.makeDeserializer(ty.value, typespace);
				return (reader) => {
					const length = reader.readU32();
					const result = Array(length);
					for (let i = 0; i < length; i++) result[i] = deserialize(reader);
					return result;
				};
			}
			default: return primitiveDeserializers[ty.tag];
		}
	},
	deserializeValue(reader, ty, typespace) {
		return AlgebraicType.makeDeserializer(ty, typespace)(reader);
	},
	intoMapKey: function(ty, value) {
		switch (ty.tag) {
			case "U8":
			case "U16":
			case "U32":
			case "U64":
			case "U128":
			case "U256":
			case "I8":
			case "I16":
			case "I32":
			case "I64":
			case "I128":
			case "I256":
			case "F32":
			case "F64":
			case "String":
			case "Bool": return value;
			case "Product": return ProductType.intoMapKey(ty.value, value);
			default: {
				const writer = new BinaryWriter(10);
				AlgebraicType.serializeValue(writer, ty, value);
				return writer.toBase64();
			}
		}
	}
};
function bindCall(f) {
	return Function.prototype.call.bind(f);
}
var primitiveSerializers = {
	Bool: bindCall(BinaryWriter.prototype.writeBool),
	I8: bindCall(BinaryWriter.prototype.writeI8),
	U8: bindCall(BinaryWriter.prototype.writeU8),
	I16: bindCall(BinaryWriter.prototype.writeI16),
	U16: bindCall(BinaryWriter.prototype.writeU16),
	I32: bindCall(BinaryWriter.prototype.writeI32),
	U32: bindCall(BinaryWriter.prototype.writeU32),
	I64: bindCall(BinaryWriter.prototype.writeI64),
	U64: bindCall(BinaryWriter.prototype.writeU64),
	I128: bindCall(BinaryWriter.prototype.writeI128),
	U128: bindCall(BinaryWriter.prototype.writeU128),
	I256: bindCall(BinaryWriter.prototype.writeI256),
	U256: bindCall(BinaryWriter.prototype.writeU256),
	F32: bindCall(BinaryWriter.prototype.writeF32),
	F64: bindCall(BinaryWriter.prototype.writeF64),
	String: bindCall(BinaryWriter.prototype.writeString)
};
Object.freeze(primitiveSerializers);
var serializeUint8Array = bindCall(BinaryWriter.prototype.writeUInt8Array);
var primitiveDeserializers = {
	Bool: bindCall(BinaryReader.prototype.readBool),
	I8: bindCall(BinaryReader.prototype.readI8),
	U8: bindCall(BinaryReader.prototype.readU8),
	I16: bindCall(BinaryReader.prototype.readI16),
	U16: bindCall(BinaryReader.prototype.readU16),
	I32: bindCall(BinaryReader.prototype.readI32),
	U32: bindCall(BinaryReader.prototype.readU32),
	I64: bindCall(BinaryReader.prototype.readI64),
	U64: bindCall(BinaryReader.prototype.readU64),
	I128: bindCall(BinaryReader.prototype.readI128),
	U128: bindCall(BinaryReader.prototype.readU128),
	I256: bindCall(BinaryReader.prototype.readI256),
	U256: bindCall(BinaryReader.prototype.readU256),
	F32: bindCall(BinaryReader.prototype.readF32),
	F64: bindCall(BinaryReader.prototype.readF64),
	String: bindCall(BinaryReader.prototype.readString)
};
Object.freeze(primitiveDeserializers);
var deserializeUint8Array = bindCall(BinaryReader.prototype.readUInt8Array);
var primitiveSizes = {
	Bool: 1,
	I8: 1,
	U8: 1,
	I16: 2,
	U16: 2,
	I32: 4,
	U32: 4,
	I64: 8,
	U64: 8,
	I128: 16,
	U128: 16,
	I256: 32,
	U256: 32,
	F32: 4,
	F64: 8
};
var fixedSizePrimitives = new Set(Object.keys(primitiveSizes));
var isFixedSizeProduct = (ty) => ty.elements.every(({ algebraicType }) => fixedSizePrimitives.has(algebraicType.tag));
var productSize = (ty) => ty.elements.reduce((acc, { algebraicType }) => acc + primitiveSizes[algebraicType.tag], 0);
var primitiveJSName = {
	Bool: "Uint8",
	I8: "Int8",
	U8: "Uint8",
	I16: "Int16",
	U16: "Uint16",
	I32: "Int32",
	U32: "Uint32",
	I64: "BigInt64",
	U64: "BigUint64",
	F32: "Float32",
	F64: "Float64"
};
var specialProductDeserializers = {
	__time_duration_micros__: (reader) => new TimeDuration(reader.readI64()),
	__timestamp_micros_since_unix_epoch__: (reader) => new Timestamp(reader.readI64()),
	__identity__: (reader) => new Identity(reader.readU256()),
	__connection_id__: (reader) => new ConnectionId(reader.readU128()),
	__uuid__: (reader) => new Uuid(reader.readU128())
};
Object.freeze(specialProductDeserializers);
var unitDeserializer = () => ({});
var getElementInitializer = (element) => {
	let init;
	switch (element.algebraicType.tag) {
		case "String":
			init = "''";
			break;
		case "Bool":
			init = "false";
			break;
		case "I8":
		case "U8":
		case "I16":
		case "U16":
		case "I32":
		case "U32":
			init = "0";
			break;
		case "I64":
		case "U64":
		case "I128":
		case "U128":
		case "I256":
		case "U256":
			init = "0n";
			break;
		case "F32":
		case "F64":
			init = "0.0";
			break;
		default: init = "undefined";
	}
	return `${element.name}: ${init}`;
};
var ProductType = {
	makeSerializer(ty, typespace) {
		let serializer = SERIALIZERS.get(ty);
		if (serializer != null) return serializer;
		if (isFixedSizeProduct(ty)) {
			const body2 = `"use strict";
writer.expandBuffer(${productSize(ty)});
const view = writer.view;
${ty.elements.map(({ name, algebraicType: { tag } }) => tag in primitiveJSName ? `view.set${primitiveJSName[tag]}(writer.offset, value.${name}, ${primitiveSizes[tag] > 1 ? "true" : ""});
writer.offset += ${primitiveSizes[tag]};` : `writer.write${tag}(value.${name});`).join("\n")}`;
			serializer = Function("writer", "value", body2);
			SERIALIZERS.set(ty, serializer);
			return serializer;
		}
		const serializers = {};
		const body = "\"use strict\";\n" + ty.elements.map((element) => `this.${element.name}(writer, value.${element.name});`).join("\n");
		serializer = Function("writer", "value", body).bind(serializers);
		SERIALIZERS.set(ty, serializer);
		for (const { name, algebraicType } of ty.elements) serializers[name] = AlgebraicType.makeSerializer(algebraicType, typespace);
		Object.freeze(serializers);
		return serializer;
	},
	serializeValue(writer, ty, value, typespace) {
		ProductType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		switch (ty.elements.length) {
			case 0: return unitDeserializer;
			case 1: {
				const fieldName = ty.elements[0].name;
				if (hasOwn(specialProductDeserializers, fieldName)) return specialProductDeserializers[fieldName];
			}
		}
		let deserializer = DESERIALIZERS.get(ty);
		if (deserializer != null) return deserializer;
		if (isFixedSizeProduct(ty)) {
			const body = `"use strict";
const result = { ${ty.elements.map(getElementInitializer).join(", ")} };
const view = reader.view;
${ty.elements.map(({ name, algebraicType: { tag } }) => tag in primitiveJSName ? `result.${name} = view.get${primitiveJSName[tag]}(reader.offset, ${primitiveSizes[tag] > 1 ? "true" : ""});
reader.offset += ${primitiveSizes[tag]};` : `result.${name} = reader.read${tag}();`).join("\n")}
return result;`;
			deserializer = Function("reader", body);
			DESERIALIZERS.set(ty, deserializer);
			return deserializer;
		}
		const deserializers = {};
		deserializer = Function("reader", `"use strict";
const result = { ${ty.elements.map(getElementInitializer).join(", ")} };
${ty.elements.map(({ name }) => `result.${name} = this.${name}(reader);`).join("\n")}
return result;`).bind(deserializers);
		DESERIALIZERS.set(ty, deserializer);
		for (const { name, algebraicType } of ty.elements) deserializers[name] = AlgebraicType.makeDeserializer(algebraicType, typespace);
		Object.freeze(deserializers);
		return deserializer;
	},
	deserializeValue(reader, ty, typespace) {
		return ProductType.makeDeserializer(ty, typespace)(reader);
	},
	intoMapKey(ty, value) {
		if (ty.elements.length === 1) {
			const fieldName = ty.elements[0].name;
			if (hasOwn(specialProductDeserializers, fieldName)) return value[fieldName];
		}
		const writer = new BinaryWriter(10);
		AlgebraicType.serializeValue(writer, AlgebraicType.Product(ty), value);
		return writer.toBase64();
	}
};
var SumType = {
	makeSerializer(ty, typespace) {
		if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
			const serialize = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			return (writer, value) => {
				if (value !== null && value !== void 0) {
					writer.writeByte(0);
					serialize(writer, value);
				} else writer.writeByte(1);
			};
		} else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
			const serializeOk = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			const serializeErr = AlgebraicType.makeSerializer(ty.variants[0].algebraicType, typespace);
			return (writer, value) => {
				if ("ok" in value) {
					writer.writeU8(0);
					serializeOk(writer, value.ok);
				} else if ("err" in value) {
					writer.writeU8(1);
					serializeErr(writer, value.err);
				} else throw new TypeError("could not serialize result: object had neither a `ok` nor an `err` field");
			};
		} else {
			let serializer = SERIALIZERS.get(ty);
			if (serializer != null) return serializer;
			const serializers = {};
			const body = `switch (value.tag) {
${ty.variants.map(({ name }, i) => `  case ${JSON.stringify(name)}:
    writer.writeByte(${i});
    return this.${name}(writer, value.value);`).join("\n")}
  default:
    throw new TypeError(
      \`Could not serialize sum type; unknown tag \${value.tag}\`
    )
}
`;
			serializer = Function("writer", "value", body).bind(serializers);
			SERIALIZERS.set(ty, serializer);
			for (const { name, algebraicType } of ty.variants) serializers[name] = AlgebraicType.makeSerializer(algebraicType, typespace);
			Object.freeze(serializers);
			return serializer;
		}
	},
	serializeValue(writer, ty, value, typespace) {
		SumType.makeSerializer(ty, typespace)(writer, value);
	},
	makeDeserializer(ty, typespace) {
		if (ty.variants.length == 2 && ty.variants[0].name === "some" && ty.variants[1].name === "none") {
			const deserialize = AlgebraicType.makeDeserializer(ty.variants[0].algebraicType, typespace);
			return (reader) => {
				const tag = reader.readU8();
				if (tag === 0) return deserialize(reader);
				else if (tag === 1) return;
				else throw `Can't deserialize an option type, couldn't find ${tag} tag`;
			};
		} else if (ty.variants.length == 2 && ty.variants[0].name === "ok" && ty.variants[1].name === "err") {
			const deserializeOk = AlgebraicType.makeDeserializer(ty.variants[0].algebraicType, typespace);
			const deserializeErr = AlgebraicType.makeDeserializer(ty.variants[1].algebraicType, typespace);
			return (reader) => {
				const tag = reader.readByte();
				if (tag === 0) return { ok: deserializeOk(reader) };
				else if (tag === 1) return { err: deserializeErr(reader) };
				else throw `Can't deserialize a result type, couldn't find ${tag} tag`;
			};
		} else {
			let deserializer = DESERIALIZERS.get(ty);
			if (deserializer != null) return deserializer;
			const deserializers = {};
			deserializer = Function("reader", `switch (reader.readU8()) {
${ty.variants.map(({ name }, i) => `case ${i}: return { tag: ${JSON.stringify(name)}, value: this.${name}(reader) };`).join("\n")} }`).bind(deserializers);
			DESERIALIZERS.set(ty, deserializer);
			for (const { name, algebraicType } of ty.variants) deserializers[name] = AlgebraicType.makeDeserializer(algebraicType, typespace);
			Object.freeze(deserializers);
			return deserializer;
		}
	},
	deserializeValue(reader, ty, typespace) {
		return SumType.makeDeserializer(ty, typespace)(reader);
	}
};
var Option = { getAlgebraicType(innerType) {
	return AlgebraicType.Sum({ variants: [{
		name: "some",
		algebraicType: innerType
	}, {
		name: "none",
		algebraicType: AlgebraicType.Product({ elements: [] })
	}] });
} };
var Result = { getAlgebraicType(okType, errType) {
	return AlgebraicType.Sum({ variants: [{
		name: "ok",
		algebraicType: okType
	}, {
		name: "err",
		algebraicType: errType
	}] });
} };
var ScheduleAt = {
	interval(value) {
		return Interval(value);
	},
	time(value) {
		return Time(value);
	},
	getAlgebraicType() {
		return AlgebraicType.Sum({ variants: [{
			name: "Interval",
			algebraicType: TimeDuration.getAlgebraicType()
		}, {
			name: "Time",
			algebraicType: Timestamp.getAlgebraicType()
		}] });
	},
	isScheduleAt(algebraicType) {
		if (algebraicType.tag !== "Sum") return false;
		const variants = algebraicType.value.variants;
		if (variants.length !== 2) return false;
		const intervalVariant = variants.find((v) => v.name === "Interval");
		const timeVariant = variants.find((v) => v.name === "Time");
		if (!intervalVariant || !timeVariant) return false;
		return TimeDuration.isTimeDuration(intervalVariant.algebraicType) && Timestamp.isTimestamp(timeVariant.algebraicType);
	}
};
var Interval = (micros) => ({
	tag: "Interval",
	value: new TimeDuration(micros)
});
var Time = (microsSinceUnixEpoch) => ({
	tag: "Time",
	value: new Timestamp(microsSinceUnixEpoch)
});
var schedule_at_default = ScheduleAt;
function set(x, t2) {
	return {
		...x,
		...t2
	};
}
var TypeBuilder = class {
	/**
	* The TypeScript phantom type. This is not stored at runtime,
	* but is visible to the compiler
	*/
	type;
	/**
	* The SpacetimeDB algebraic type (run‑time value). In addition to storing
	* the runtime representation of the `AlgebraicType`, it also captures
	* the TypeScript type information of the `AlgebraicType`. That is to say
	* the value is not merely an `AlgebraicType`, but is constructed to be
	* the corresponding concrete `AlgebraicType` for the TypeScript type `Type`.
	*
	* e.g. `string` corresponds to `AlgebraicType.String`
	*/
	algebraicType;
	constructor(algebraicType) {
		this.algebraicType = algebraicType;
	}
	optional() {
		return new OptionBuilder(this);
	}
	serialize(writer, value) {
		(this.serialize = AlgebraicType.makeSerializer(this.algebraicType))(writer, value);
	}
	deserialize(reader) {
		return (this.deserialize = AlgebraicType.makeDeserializer(this.algebraicType))(reader);
	}
};
var U8Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U8);
	}
	index(algorithm = "btree") {
		return new U8ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U8ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U8ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U8ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U16Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U16);
	}
	index(algorithm = "btree") {
		return new U16ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U16ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U16ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U16ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U32);
	}
	index(algorithm = "btree") {
		return new U32ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U32ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U64);
	}
	index(algorithm = "btree") {
		return new U64ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U64ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U128Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U128);
	}
	index(algorithm = "btree") {
		return new U128ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U128ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U128ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U128ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var U256Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.U256);
	}
	index(algorithm = "btree") {
		return new U256ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new U256ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new U256ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new U256ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I8Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I8);
	}
	index(algorithm = "btree") {
		return new I8ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I8ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I8ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I8ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I16Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I16);
	}
	index(algorithm = "btree") {
		return new I16ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I16ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I16ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I16ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I32);
	}
	index(algorithm = "btree") {
		return new I32ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I32ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I64);
	}
	index(algorithm = "btree") {
		return new I64ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I64ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I128Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I128);
	}
	index(algorithm = "btree") {
		return new I128ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I128ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I128ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I128ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var I256Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.I256);
	}
	index(algorithm = "btree") {
		return new I256ColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new I256ColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new I256ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new I256ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var F32Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.F32);
	}
	default(value) {
		return new F32ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new F32ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var F64Builder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.F64);
	}
	default(value) {
		return new F64ColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new F64ColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var BoolBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.Bool);
	}
	index(algorithm = "btree") {
		return new BoolColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new BoolColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new BoolColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new BoolColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new BoolColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var StringBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.String);
	}
	index(algorithm = "btree") {
		return new StringColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new StringColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new StringColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new StringColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new StringColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ArrayBuilder = class extends TypeBuilder {
	element;
	constructor(element) {
		super(AlgebraicType.Array(element.algebraicType));
		this.element = element;
	}
	default(value) {
		return new ArrayColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ArrayColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ByteArrayBuilder = class extends TypeBuilder {
	constructor() {
		super(AlgebraicType.Array(AlgebraicType.U8));
	}
	default(value) {
		return new ByteArrayColumnBuilder(set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ByteArrayColumnBuilder(set(defaultMetadata, { name }));
	}
};
var OptionBuilder = class extends TypeBuilder {
	value;
	constructor(value) {
		super(Option.getAlgebraicType(value.algebraicType));
		this.value = value;
	}
	default(value) {
		return new OptionColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new OptionColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ProductBuilder = class extends TypeBuilder {
	typeName;
	elements;
	constructor(elements, name) {
		function elementsArrayFromElementsObj(obj) {
			return Object.keys(obj).map((key) => ({
				name: key,
				get algebraicType() {
					return obj[key].algebraicType;
				}
			}));
		}
		super(AlgebraicType.Product({ elements: elementsArrayFromElementsObj(elements) }));
		this.typeName = name;
		this.elements = elements;
	}
	default(value) {
		return new ProductColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ProductColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ResultBuilder = class extends TypeBuilder {
	ok;
	err;
	constructor(ok, err) {
		super(Result.getAlgebraicType(ok.algebraicType, err.algebraicType));
		this.ok = ok;
		this.err = err;
	}
	default(value) {
		return new ResultColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
};
var UnitBuilder = class extends TypeBuilder {
	constructor() {
		super({
			tag: "Product",
			value: { elements: [] }
		});
	}
};
var RowBuilder = class extends TypeBuilder {
	row;
	typeName;
	constructor(row, name) {
		const mappedRow = Object.fromEntries(Object.entries(row).map(([colName, builder]) => [colName, builder instanceof ColumnBuilder ? builder : new ColumnBuilder(builder, {})]));
		const elements = Object.keys(mappedRow).map((name2) => ({
			name: name2,
			get algebraicType() {
				return mappedRow[name2].typeBuilder.algebraicType;
			}
		}));
		super(AlgebraicType.Product({ elements }));
		this.row = mappedRow;
		this.typeName = name;
	}
};
var SumBuilderImpl = class extends TypeBuilder {
	variants;
	typeName;
	constructor(variants, name) {
		function variantsArrayFromVariantsObj(variants2) {
			return Object.keys(variants2).map((key) => ({
				name: key,
				get algebraicType() {
					return variants2[key].algebraicType;
				}
			}));
		}
		super(AlgebraicType.Sum({ variants: variantsArrayFromVariantsObj(variants) }));
		this.variants = variants;
		this.typeName = name;
		for (const key of Object.keys(variants)) {
			const desc = Object.getOwnPropertyDescriptor(variants, key);
			const isAccessor = !!desc && (typeof desc.get === "function" || typeof desc.set === "function");
			let isUnit2 = false;
			if (!isAccessor) isUnit2 = variants[key] instanceof UnitBuilder;
			if (isUnit2) {
				const constant = this.create(key);
				Object.defineProperty(this, key, {
					value: constant,
					writable: false,
					enumerable: true,
					configurable: false
				});
			} else {
				const fn = ((value) => this.create(key, value));
				Object.defineProperty(this, key, {
					value: fn,
					writable: false,
					enumerable: true,
					configurable: false
				});
			}
		}
	}
	create(tag, value) {
		return value === void 0 ? { tag } : {
			tag,
			value
		};
	}
	default(value) {
		return new SumColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new SumColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var SumBuilder = SumBuilderImpl;
var SimpleSumBuilderImpl = class extends SumBuilderImpl {
	index(algorithm = "btree") {
		return new SimpleSumColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new SimpleSumColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
};
var ScheduleAtBuilder = class extends TypeBuilder {
	constructor() {
		super(schedule_at_default.getAlgebraicType());
	}
	default(value) {
		return new ScheduleAtColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ScheduleAtColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var IdentityBuilder = class extends TypeBuilder {
	constructor() {
		super(Identity.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new IdentityColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var ConnectionIdBuilder = class extends TypeBuilder {
	constructor() {
		super(ConnectionId.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new ConnectionIdColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var TimestampBuilder = class extends TypeBuilder {
	constructor() {
		super(Timestamp.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new TimestampColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var TimeDurationBuilder = class extends TypeBuilder {
	constructor() {
		super(TimeDuration.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new TimeDurationColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var UuidBuilder = class extends TypeBuilder {
	constructor() {
		super(Uuid.getAlgebraicType());
	}
	index(algorithm = "btree") {
		return new UuidColumnBuilder(this, set(defaultMetadata, { indexType: algorithm }));
	}
	unique() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new UuidColumnBuilder(this, set(defaultMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new UuidColumnBuilder(this, set(defaultMetadata, { defaultValue: value }));
	}
	name(name) {
		return new UuidColumnBuilder(this, set(defaultMetadata, { name }));
	}
};
var defaultMetadata = {};
var ColumnBuilder = class {
	typeBuilder;
	columnMetadata;
	constructor(typeBuilder, metadata) {
		this.typeBuilder = typeBuilder;
		this.columnMetadata = metadata;
	}
	serialize(writer, value) {
		this.typeBuilder.serialize(writer, value);
	}
	deserialize(reader) {
		return this.typeBuilder.deserialize(reader);
	}
};
var U8ColumnBuilder = class _U8ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U16ColumnBuilder = class _U16ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U32ColumnBuilder = class _U32ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U64ColumnBuilder = class _U64ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U128ColumnBuilder = class _U128ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var U256ColumnBuilder = class _U256ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _U256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I8ColumnBuilder = class _I8ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I8ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I16ColumnBuilder = class _I16ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I16ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I32ColumnBuilder = class _I32ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I64ColumnBuilder = class _I64ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I128ColumnBuilder = class _I128ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I128ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var I256ColumnBuilder = class _I256ColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	autoInc() {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isAutoIncrement: true }));
	}
	default(value) {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _I256ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var F32ColumnBuilder = class _F32ColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _F32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _F32ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var F64ColumnBuilder = class _F64ColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _F64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _F64ColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var BoolColumnBuilder = class _BoolColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _BoolColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var StringColumnBuilder = class _StringColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _StringColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ArrayColumnBuilder = class _ArrayColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ArrayColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ArrayColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ByteArrayColumnBuilder = class _ByteArrayColumnBuilder extends ColumnBuilder {
	constructor(metadata) {
		super(new TypeBuilder(AlgebraicType.Array(AlgebraicType.U8)), metadata);
	}
	default(value) {
		return new _ByteArrayColumnBuilder(set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ByteArrayColumnBuilder(set(this.columnMetadata, { name }));
	}
};
var OptionColumnBuilder = class _OptionColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _OptionColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _OptionColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ResultColumnBuilder = class _ResultColumnBuilder extends ColumnBuilder {
	constructor(typeBuilder, metadata) {
		super(typeBuilder, metadata);
	}
	default(value) {
		return new _ResultColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
};
var ProductColumnBuilder = class _ProductColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ProductColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ProductColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var SumColumnBuilder = class _SumColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _SumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var SimpleSumColumnBuilder = class _SimpleSumColumnBuilder extends SumColumnBuilder {
	index(algorithm = "btree") {
		return new _SimpleSumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	primaryKey() {
		return new _SimpleSumColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
};
var ScheduleAtColumnBuilder = class _ScheduleAtColumnBuilder extends ColumnBuilder {
	default(value) {
		return new _ScheduleAtColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ScheduleAtColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var IdentityColumnBuilder = class _IdentityColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _IdentityColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var ConnectionIdColumnBuilder = class _ConnectionIdColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _ConnectionIdColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var TimestampColumnBuilder = class _TimestampColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _TimestampColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var TimeDurationColumnBuilder = class _TimeDurationColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _TimeDurationColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var UuidColumnBuilder = class _UuidColumnBuilder extends ColumnBuilder {
	index(algorithm = "btree") {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { indexType: algorithm }));
	}
	unique() {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isUnique: true }));
	}
	primaryKey() {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { isPrimaryKey: true }));
	}
	default(value) {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { defaultValue: value }));
	}
	name(name) {
		return new _UuidColumnBuilder(this.typeBuilder, set(this.columnMetadata, { name }));
	}
};
var RefBuilder = class extends TypeBuilder {
	ref;
	/** The phantom type of the pointee of this ref. */
	__spacetimeType;
	constructor(ref) {
		super(AlgebraicType.Ref(ref));
		this.ref = ref;
	}
};
var enumImpl = ((nameOrObj, maybeObj) => {
	let obj = nameOrObj;
	let name = void 0;
	if (typeof nameOrObj === "string") {
		if (!maybeObj) throw new TypeError("When providing a name, you must also provide the variants object or array.");
		obj = maybeObj;
		name = nameOrObj;
	}
	if (Array.isArray(obj)) {
		const simpleVariantsObj = {};
		for (const variant of obj) simpleVariantsObj[variant] = new UnitBuilder();
		return new SimpleSumBuilderImpl(simpleVariantsObj, name);
	}
	return new SumBuilder(obj, name);
});
var t = {
	bool: () => new BoolBuilder(),
	string: () => new StringBuilder(),
	number: () => new F64Builder(),
	i8: () => new I8Builder(),
	u8: () => new U8Builder(),
	i16: () => new I16Builder(),
	u16: () => new U16Builder(),
	i32: () => new I32Builder(),
	u32: () => new U32Builder(),
	i64: () => new I64Builder(),
	u64: () => new U64Builder(),
	i128: () => new I128Builder(),
	u128: () => new U128Builder(),
	i256: () => new I256Builder(),
	u256: () => new U256Builder(),
	f32: () => new F32Builder(),
	f64: () => new F64Builder(),
	object: ((nameOrObj, maybeObj) => {
		if (typeof nameOrObj === "string") {
			if (!maybeObj) throw new TypeError("When providing a name, you must also provide the object.");
			return new ProductBuilder(maybeObj, nameOrObj);
		}
		return new ProductBuilder(nameOrObj, void 0);
	}),
	row: ((nameOrObj, maybeObj) => {
		const [obj, name] = typeof nameOrObj === "string" ? [maybeObj, nameOrObj] : [nameOrObj, void 0];
		return new RowBuilder(obj, name);
	}),
	array(e) {
		return new ArrayBuilder(e);
	},
	enum: enumImpl,
	unit() {
		return new UnitBuilder();
	},
	lazy(thunk) {
		let cached = null;
		const get = () => cached ??= thunk();
		return new Proxy({}, {
			get(_t, prop, recv) {
				const target = get();
				const val = Reflect.get(target, prop, recv);
				return typeof val === "function" ? val.bind(target) : val;
			},
			set(_t, prop, value, recv) {
				return Reflect.set(get(), prop, value, recv);
			},
			has(_t, prop) {
				return prop in get();
			},
			ownKeys() {
				return Reflect.ownKeys(get());
			},
			getOwnPropertyDescriptor(_t, prop) {
				return Object.getOwnPropertyDescriptor(get(), prop);
			},
			getPrototypeOf() {
				return Object.getPrototypeOf(get());
			}
		});
	},
	scheduleAt: () => {
		return new ScheduleAtBuilder();
	},
	option(value) {
		return new OptionBuilder(value);
	},
	result(ok, err) {
		return new ResultBuilder(ok, err);
	},
	identity: () => {
		return new IdentityBuilder();
	},
	connectionId: () => {
		return new ConnectionIdBuilder();
	},
	timestamp: () => {
		return new TimestampBuilder();
	},
	timeDuration: () => {
		return new TimeDurationBuilder();
	},
	uuid: () => {
		return new UuidBuilder();
	},
	byteArray: () => {
		return new ByteArrayBuilder();
	}
};
var AlgebraicType2 = t.enum("AlgebraicType", {
	Ref: t.u32(),
	get Sum() {
		return SumType2;
	},
	get Product() {
		return ProductType2;
	},
	get Array() {
		return AlgebraicType2;
	},
	String: t.unit(),
	Bool: t.unit(),
	I8: t.unit(),
	U8: t.unit(),
	I16: t.unit(),
	U16: t.unit(),
	I32: t.unit(),
	U32: t.unit(),
	I64: t.unit(),
	U64: t.unit(),
	I128: t.unit(),
	U128: t.unit(),
	I256: t.unit(),
	U256: t.unit(),
	F32: t.unit(),
	F64: t.unit()
});
var CaseConversionPolicy = t.enum("CaseConversionPolicy", {
	None: t.unit(),
	SnakeCase: t.unit()
});
var ExplicitNameEntry = t.enum("ExplicitNameEntry", {
	get Table() {
		return NameMapping;
	},
	get Function() {
		return NameMapping;
	},
	get Index() {
		return NameMapping;
	}
});
var ExplicitNames = t.object("ExplicitNames", { get entries() {
	return t.array(ExplicitNameEntry);
} });
var FunctionVisibility = t.enum("FunctionVisibility", {
	Private: t.unit(),
	ClientCallable: t.unit()
});
var HttpHeaderPair = t.object("HttpHeaderPair", {
	name: t.string(),
	value: t.byteArray()
});
var HttpHeaders = t.object("HttpHeaders", { get entries() {
	return t.array(HttpHeaderPair);
} });
var HttpMethod = t.enum("HttpMethod", {
	Get: t.unit(),
	Head: t.unit(),
	Post: t.unit(),
	Put: t.unit(),
	Delete: t.unit(),
	Connect: t.unit(),
	Options: t.unit(),
	Trace: t.unit(),
	Patch: t.unit(),
	Extension: t.string()
});
var HttpRequest = t.object("HttpRequest", {
	get method() {
		return HttpMethod;
	},
	get headers() {
		return HttpHeaders;
	},
	timeout: t.option(t.timeDuration()),
	uri: t.string(),
	get version() {
		return HttpVersion;
	}
});
var HttpResponse = t.object("HttpResponse", {
	get headers() {
		return HttpHeaders;
	},
	get version() {
		return HttpVersion;
	},
	code: t.u16()
});
var HttpVersion = t.enum("HttpVersion", {
	Http09: t.unit(),
	Http10: t.unit(),
	Http11: t.unit(),
	Http2: t.unit(),
	Http3: t.unit()
});
var IndexType = t.enum("IndexType", {
	BTree: t.unit(),
	Hash: t.unit()
});
var Lifecycle = t.enum("Lifecycle", {
	Init: t.unit(),
	OnConnect: t.unit(),
	OnDisconnect: t.unit()
});
var MiscModuleExport = t.enum("MiscModuleExport", { get TypeAlias() {
	return TypeAlias;
} });
var NameMapping = t.object("NameMapping", {
	sourceName: t.string(),
	canonicalName: t.string()
});
var ProductType2 = t.object("ProductType", { get elements() {
	return t.array(ProductTypeElement);
} });
var ProductTypeElement = t.object("ProductTypeElement", {
	name: t.option(t.string()),
	get algebraicType() {
		return AlgebraicType2;
	}
});
var RawColumnDefV8 = t.object("RawColumnDefV8", {
	colName: t.string(),
	get colType() {
		return AlgebraicType2;
	}
});
var RawColumnDefaultValueV10 = t.object("RawColumnDefaultValueV10", {
	colId: t.u16(),
	value: t.byteArray()
});
var RawColumnDefaultValueV9 = t.object("RawColumnDefaultValueV9", {
	table: t.string(),
	colId: t.u16(),
	value: t.byteArray()
});
var RawConstraintDataV9 = t.enum("RawConstraintDataV9", { get Unique() {
	return RawUniqueConstraintDataV9;
} });
var RawConstraintDefV10 = t.object("RawConstraintDefV10", {
	sourceName: t.option(t.string()),
	get data() {
		return RawConstraintDataV9;
	}
});
var RawConstraintDefV8 = t.object("RawConstraintDefV8", {
	constraintName: t.string(),
	constraints: t.u8(),
	columns: t.array(t.u16())
});
var RawConstraintDefV9 = t.object("RawConstraintDefV9", {
	name: t.option(t.string()),
	get data() {
		return RawConstraintDataV9;
	}
});
var RawIndexAlgorithm = t.enum("RawIndexAlgorithm", {
	BTree: t.array(t.u16()),
	Hash: t.array(t.u16()),
	Direct: t.u16()
});
var RawIndexDefV10 = t.object("RawIndexDefV10", {
	sourceName: t.option(t.string()),
	accessorName: t.option(t.string()),
	get algorithm() {
		return RawIndexAlgorithm;
	}
});
var RawIndexDefV8 = t.object("RawIndexDefV8", {
	indexName: t.string(),
	isUnique: t.bool(),
	get indexType() {
		return IndexType;
	},
	columns: t.array(t.u16())
});
var RawIndexDefV9 = t.object("RawIndexDefV9", {
	name: t.option(t.string()),
	accessorName: t.option(t.string()),
	get algorithm() {
		return RawIndexAlgorithm;
	}
});
var RawLifeCycleReducerDefV10 = t.object("RawLifeCycleReducerDefV10", {
	get lifecycleSpec() {
		return Lifecycle;
	},
	functionName: t.string()
});
var RawMiscModuleExportV9 = t.enum("RawMiscModuleExportV9", {
	get ColumnDefaultValue() {
		return RawColumnDefaultValueV9;
	},
	get Procedure() {
		return RawProcedureDefV9;
	},
	get View() {
		return RawViewDefV9;
	}
});
var RawModuleDef = t.enum("RawModuleDef", {
	get V8BackCompat() {
		return RawModuleDefV8;
	},
	get V9() {
		return RawModuleDefV9;
	},
	get V10() {
		return RawModuleDefV10;
	}
});
var RawModuleDefV10 = t.object("RawModuleDefV10", { get sections() {
	return t.array(RawModuleDefV10Section);
} });
var RawModuleDefV10Section = t.enum("RawModuleDefV10Section", {
	get Typespace() {
		return Typespace;
	},
	get Types() {
		return t.array(RawTypeDefV10);
	},
	get Tables() {
		return t.array(RawTableDefV10);
	},
	get Reducers() {
		return t.array(RawReducerDefV10);
	},
	get Procedures() {
		return t.array(RawProcedureDefV10);
	},
	get Views() {
		return t.array(RawViewDefV10);
	},
	get Schedules() {
		return t.array(RawScheduleDefV10);
	},
	get LifeCycleReducers() {
		return t.array(RawLifeCycleReducerDefV10);
	},
	get RowLevelSecurity() {
		return t.array(RawRowLevelSecurityDefV9);
	},
	get CaseConversionPolicy() {
		return CaseConversionPolicy;
	},
	get ExplicitNames() {
		return ExplicitNames;
	}
});
var RawModuleDefV8 = t.object("RawModuleDefV8", {
	get typespace() {
		return Typespace;
	},
	get tables() {
		return t.array(TableDesc);
	},
	get reducers() {
		return t.array(ReducerDef);
	},
	get miscExports() {
		return t.array(MiscModuleExport);
	}
});
var RawModuleDefV9 = t.object("RawModuleDefV9", {
	get typespace() {
		return Typespace;
	},
	get tables() {
		return t.array(RawTableDefV9);
	},
	get reducers() {
		return t.array(RawReducerDefV9);
	},
	get types() {
		return t.array(RawTypeDefV9);
	},
	get miscExports() {
		return t.array(RawMiscModuleExportV9);
	},
	get rowLevelSecurity() {
		return t.array(RawRowLevelSecurityDefV9);
	}
});
var RawProcedureDefV10 = t.object("RawProcedureDefV10", {
	sourceName: t.string(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	},
	get visibility() {
		return FunctionVisibility;
	}
});
var RawProcedureDefV9 = t.object("RawProcedureDefV9", {
	name: t.string(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var RawReducerDefV10 = t.object("RawReducerDefV10", {
	sourceName: t.string(),
	get params() {
		return ProductType2;
	},
	get visibility() {
		return FunctionVisibility;
	},
	get okReturnType() {
		return AlgebraicType2;
	},
	get errReturnType() {
		return AlgebraicType2;
	}
});
var RawReducerDefV9 = t.object("RawReducerDefV9", {
	name: t.string(),
	get params() {
		return ProductType2;
	},
	get lifecycle() {
		return t.option(Lifecycle);
	}
});
var RawRowLevelSecurityDefV9 = t.object("RawRowLevelSecurityDefV9", { sql: t.string() });
var RawScheduleDefV10 = t.object("RawScheduleDefV10", {
	sourceName: t.option(t.string()),
	tableName: t.string(),
	scheduleAtCol: t.u16(),
	functionName: t.string()
});
var RawScheduleDefV9 = t.object("RawScheduleDefV9", {
	name: t.option(t.string()),
	reducerName: t.string(),
	scheduledAtColumn: t.u16()
});
var RawScopedTypeNameV10 = t.object("RawScopedTypeNameV10", {
	scope: t.array(t.string()),
	sourceName: t.string()
});
var RawScopedTypeNameV9 = t.object("RawScopedTypeNameV9", {
	scope: t.array(t.string()),
	name: t.string()
});
var RawSequenceDefV10 = t.object("RawSequenceDefV10", {
	sourceName: t.option(t.string()),
	column: t.u16(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	increment: t.i128()
});
var RawSequenceDefV8 = t.object("RawSequenceDefV8", {
	sequenceName: t.string(),
	colPos: t.u16(),
	increment: t.i128(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	allocated: t.i128()
});
var RawSequenceDefV9 = t.object("RawSequenceDefV9", {
	name: t.option(t.string()),
	column: t.u16(),
	start: t.option(t.i128()),
	minValue: t.option(t.i128()),
	maxValue: t.option(t.i128()),
	increment: t.i128()
});
var RawTableDefV10 = t.object("RawTableDefV10", {
	sourceName: t.string(),
	productTypeRef: t.u32(),
	primaryKey: t.array(t.u16()),
	get indexes() {
		return t.array(RawIndexDefV10);
	},
	get constraints() {
		return t.array(RawConstraintDefV10);
	},
	get sequences() {
		return t.array(RawSequenceDefV10);
	},
	get tableType() {
		return TableType;
	},
	get tableAccess() {
		return TableAccess;
	},
	get defaultValues() {
		return t.array(RawColumnDefaultValueV10);
	},
	isEvent: t.bool()
});
var RawTableDefV8 = t.object("RawTableDefV8", {
	tableName: t.string(),
	get columns() {
		return t.array(RawColumnDefV8);
	},
	get indexes() {
		return t.array(RawIndexDefV8);
	},
	get constraints() {
		return t.array(RawConstraintDefV8);
	},
	get sequences() {
		return t.array(RawSequenceDefV8);
	},
	tableType: t.string(),
	tableAccess: t.string(),
	scheduled: t.option(t.string())
});
var RawTableDefV9 = t.object("RawTableDefV9", {
	name: t.string(),
	productTypeRef: t.u32(),
	primaryKey: t.array(t.u16()),
	get indexes() {
		return t.array(RawIndexDefV9);
	},
	get constraints() {
		return t.array(RawConstraintDefV9);
	},
	get sequences() {
		return t.array(RawSequenceDefV9);
	},
	get schedule() {
		return t.option(RawScheduleDefV9);
	},
	get tableType() {
		return TableType;
	},
	get tableAccess() {
		return TableAccess;
	}
});
var RawTypeDefV10 = t.object("RawTypeDefV10", {
	get sourceName() {
		return RawScopedTypeNameV10;
	},
	ty: t.u32(),
	customOrdering: t.bool()
});
var RawTypeDefV9 = t.object("RawTypeDefV9", {
	get name() {
		return RawScopedTypeNameV9;
	},
	ty: t.u32(),
	customOrdering: t.bool()
});
var RawUniqueConstraintDataV9 = t.object("RawUniqueConstraintDataV9", { columns: t.array(t.u16()) });
var RawViewDefV10 = t.object("RawViewDefV10", {
	sourceName: t.string(),
	index: t.u32(),
	isPublic: t.bool(),
	isAnonymous: t.bool(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var RawViewDefV9 = t.object("RawViewDefV9", {
	name: t.string(),
	index: t.u32(),
	isPublic: t.bool(),
	isAnonymous: t.bool(),
	get params() {
		return ProductType2;
	},
	get returnType() {
		return AlgebraicType2;
	}
});
var ReducerDef = t.object("ReducerDef", {
	name: t.string(),
	get args() {
		return t.array(ProductTypeElement);
	}
});
var SumType2 = t.object("SumType", { get variants() {
	return t.array(SumTypeVariant);
} });
var SumTypeVariant = t.object("SumTypeVariant", {
	name: t.option(t.string()),
	get algebraicType() {
		return AlgebraicType2;
	}
});
var TableAccess = t.enum("TableAccess", {
	Public: t.unit(),
	Private: t.unit()
});
var TableDesc = t.object("TableDesc", {
	get schema() {
		return RawTableDefV8;
	},
	data: t.u32()
});
var TableType = t.enum("TableType", {
	System: t.unit(),
	User: t.unit()
});
var TypeAlias = t.object("TypeAlias", {
	name: t.string(),
	ty: t.u32()
});
var Typespace = t.object("Typespace", { get types() {
	return t.array(AlgebraicType2);
} });
var ViewResultHeader = t.enum("ViewResultHeader", {
	RowData: t.unit(),
	RawSql: t.string()
});
function tableToSchema(accName, schema2, tableDef) {
	const getColName = (i) => schema2.rowType.algebraicType.value.elements[i].name;
	return {
		sourceName: schema2.tableName || accName,
		accessorName: accName,
		columns: schema2.rowType.row,
		rowType: schema2.rowSpacetimeType,
		constraints: tableDef.constraints.map((c) => ({
			name: c.sourceName,
			constraint: "unique",
			columns: c.data.value.columns.map(getColName)
		})),
		indexes: tableDef.indexes.map((idx) => {
			const columnIds = idx.algorithm.tag === "Direct" ? [idx.algorithm.value] : idx.algorithm.value;
			return {
				name: idx.accessorName,
				unique: tableDef.constraints.some((c) => c.data.value.columns.every((col) => columnIds.includes(col))),
				algorithm: idx.algorithm.tag.toLowerCase(),
				columns: columnIds.map(getColName)
			};
		}),
		tableDef,
		...tableDef.isEvent ? { isEvent: true } : {}
	};
}
var ModuleContext = class {
	#compoundTypes = /* @__PURE__ */ new Map();
	/**
	* The global module definition that gets populated by calls to `reducer()` and lifecycle hooks.
	*/
	#moduleDef = {
		typespace: { types: [] },
		tables: [],
		reducers: [],
		types: [],
		rowLevelSecurity: [],
		schedules: [],
		procedures: [],
		views: [],
		lifeCycleReducers: [],
		caseConversionPolicy: { tag: "SnakeCase" },
		explicitNames: { entries: [] }
	};
	get moduleDef() {
		return this.#moduleDef;
	}
	rawModuleDefV10() {
		const sections = [];
		const push = (s) => {
			if (s) sections.push(s);
		};
		const module = this.#moduleDef;
		push(module.typespace && {
			tag: "Typespace",
			value: module.typespace
		});
		push(module.types && {
			tag: "Types",
			value: module.types
		});
		push(module.tables && {
			tag: "Tables",
			value: module.tables
		});
		push(module.reducers && {
			tag: "Reducers",
			value: module.reducers
		});
		push(module.procedures && {
			tag: "Procedures",
			value: module.procedures
		});
		push(module.views && {
			tag: "Views",
			value: module.views
		});
		push(module.schedules && {
			tag: "Schedules",
			value: module.schedules
		});
		push(module.lifeCycleReducers && {
			tag: "LifeCycleReducers",
			value: module.lifeCycleReducers
		});
		push(module.rowLevelSecurity && {
			tag: "RowLevelSecurity",
			value: module.rowLevelSecurity
		});
		push(module.explicitNames && {
			tag: "ExplicitNames",
			value: module.explicitNames
		});
		push(module.caseConversionPolicy && {
			tag: "CaseConversionPolicy",
			value: module.caseConversionPolicy
		});
		return { sections };
	}
	/**
	* Set the case conversion policy for this module.
	* Called by the settings mechanism.
	*/
	setCaseConversionPolicy(policy) {
		this.#moduleDef.caseConversionPolicy = policy;
	}
	get typespace() {
		return this.#moduleDef.typespace;
	}
	/**
	* Resolves the actual type of a TypeBuilder by following its references until it reaches a non-ref type.
	* @param typespace The typespace to resolve types against.
	* @param typeBuilder The TypeBuilder to resolve.
	* @returns The resolved algebraic type.
	*/
	resolveType(typeBuilder) {
		let ty = typeBuilder.algebraicType;
		while (ty.tag === "Ref") ty = this.typespace.types[ty.value];
		return ty;
	}
	/**
	* Adds a type to the module definition's typespace as a `Ref` if it is a named compound type (Product or Sum).
	* Otherwise, returns the type as is.
	* @param name
	* @param ty
	* @returns
	*/
	registerTypesRecursively(typeBuilder) {
		if (typeBuilder instanceof ProductBuilder && !isUnit(typeBuilder) || typeBuilder instanceof SumBuilder || typeBuilder instanceof RowBuilder) return this.#registerCompoundTypeRecursively(typeBuilder);
		else if (typeBuilder instanceof OptionBuilder) return new OptionBuilder(this.registerTypesRecursively(typeBuilder.value));
		else if (typeBuilder instanceof ResultBuilder) return new ResultBuilder(this.registerTypesRecursively(typeBuilder.ok), this.registerTypesRecursively(typeBuilder.err));
		else if (typeBuilder instanceof ArrayBuilder) return new ArrayBuilder(this.registerTypesRecursively(typeBuilder.element));
		else return typeBuilder;
	}
	#registerCompoundTypeRecursively(typeBuilder) {
		const ty = typeBuilder.algebraicType;
		const name = typeBuilder.typeName;
		if (name === void 0) throw new Error(`Missing type name for ${typeBuilder.constructor.name ?? "TypeBuilder"} ${JSON.stringify(typeBuilder)}`);
		let r = this.#compoundTypes.get(ty);
		if (r != null) return r;
		const newTy = typeBuilder instanceof RowBuilder || typeBuilder instanceof ProductBuilder ? {
			tag: "Product",
			value: { elements: [] }
		} : {
			tag: "Sum",
			value: { variants: [] }
		};
		r = new RefBuilder(this.#moduleDef.typespace.types.length);
		this.#moduleDef.typespace.types.push(newTy);
		this.#compoundTypes.set(ty, r);
		if (typeBuilder instanceof RowBuilder) for (const [name2, elem] of Object.entries(typeBuilder.row)) newTy.value.elements.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(elem.typeBuilder).algebraicType
		});
		else if (typeBuilder instanceof ProductBuilder) for (const [name2, elem] of Object.entries(typeBuilder.elements)) newTy.value.elements.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(elem).algebraicType
		});
		else if (typeBuilder instanceof SumBuilder) for (const [name2, variant] of Object.entries(typeBuilder.variants)) newTy.value.variants.push({
			name: name2,
			algebraicType: this.registerTypesRecursively(variant).algebraicType
		});
		this.#moduleDef.types.push({
			sourceName: splitName(name),
			ty: r.ref,
			customOrdering: true
		});
		return r;
	}
};
function isUnit(typeBuilder) {
	return typeBuilder.typeName == null && typeBuilder.algebraicType.value.elements.length === 0;
}
function splitName(name) {
	const scope = name.split(".");
	return {
		sourceName: scope.pop(),
		scope
	};
}
var import_statuses = __toESM(require_statuses());
var Range = class {
	#from;
	#to;
	constructor(from, to) {
		this.#from = from ?? { tag: "unbounded" };
		this.#to = to ?? { tag: "unbounded" };
	}
	get from() {
		return this.#from;
	}
	get to() {
		return this.#to;
	}
};
function table(opts, row, ..._) {
	const { name, public: isPublic = false, indexes: userIndexes = [], scheduled, event: isEvent = false } = opts;
	const colIds = /* @__PURE__ */ new Map();
	const colNameList = [];
	if (!(row instanceof RowBuilder)) row = new RowBuilder(row);
	row.algebraicType.value.elements.forEach((elem, i) => {
		colIds.set(elem.name, i);
		colNameList.push(elem.name);
	});
	const pk = [];
	const indexes = [];
	const constraints = [];
	const sequences = [];
	let scheduleAtCol;
	const defaultValues = [];
	for (const [name2, builder] of Object.entries(row.row)) {
		const meta = builder.columnMetadata;
		if (meta.isPrimaryKey) pk.push(colIds.get(name2));
		const isUnique = meta.isUnique || meta.isPrimaryKey;
		if (meta.indexType || isUnique) {
			const algo = meta.indexType ?? "btree";
			const id = colIds.get(name2);
			let algorithm;
			switch (algo) {
				case "btree":
					algorithm = RawIndexAlgorithm.BTree([id]);
					break;
				case "hash":
					algorithm = RawIndexAlgorithm.Hash([id]);
					break;
				case "direct":
					algorithm = RawIndexAlgorithm.Direct(id);
					break;
			}
			indexes.push({
				sourceName: void 0,
				accessorName: name2,
				algorithm
			});
		}
		if (isUnique) constraints.push({
			sourceName: void 0,
			data: {
				tag: "Unique",
				value: { columns: [colIds.get(name2)] }
			}
		});
		if (meta.isAutoIncrement) sequences.push({
			sourceName: void 0,
			start: void 0,
			minValue: void 0,
			maxValue: void 0,
			column: colIds.get(name2),
			increment: 1n
		});
		if (meta.defaultValue) {
			const writer = new BinaryWriter(16);
			builder.serialize(writer, meta.defaultValue);
			defaultValues.push({
				colId: colIds.get(name2),
				value: writer.getBuffer()
			});
		}
		if (scheduled) {
			const algebraicType = builder.typeBuilder.algebraicType;
			if (schedule_at_default.isScheduleAt(algebraicType)) scheduleAtCol = colIds.get(name2);
		}
	}
	for (const indexOpts of userIndexes ?? []) {
		let algorithm;
		switch (indexOpts.algorithm) {
			case "btree":
				algorithm = {
					tag: "BTree",
					value: indexOpts.columns.map((c) => colIds.get(c))
				};
				break;
			case "hash":
				algorithm = {
					tag: "Hash",
					value: indexOpts.columns.map((c) => colIds.get(c))
				};
				break;
			case "direct":
				algorithm = {
					tag: "Direct",
					value: colIds.get(indexOpts.column)
				};
				break;
		}
		indexes.push({
			sourceName: void 0,
			accessorName: indexOpts.accessor,
			algorithm,
			canonicalName: indexOpts.name
		});
	}
	for (const constraintOpts of opts.constraints ?? []) if (constraintOpts.constraint === "unique") {
		const data = {
			tag: "Unique",
			value: { columns: constraintOpts.columns.map((c) => colIds.get(c)) }
		};
		constraints.push({
			sourceName: constraintOpts.name,
			data
		});
		continue;
	}
	const productType = row.algebraicType.value;
	return {
		rowType: row,
		tableName: name,
		rowSpacetimeType: productType,
		tableDef: (ctx, accName) => {
			const tableName = name ?? accName;
			if (row.typeName === void 0) row.typeName = toPascalCase(tableName);
			for (const index of indexes) {
				const sourceName = index.sourceName = `${accName}_${(index.algorithm.tag === "Direct" ? [index.algorithm.value] : index.algorithm.value).map((i) => colNameList[i]).join("_")}_idx_${index.algorithm.tag.toLowerCase()}`;
				const { canonicalName } = index;
				if (canonicalName !== void 0) ctx.moduleDef.explicitNames.entries.push(ExplicitNameEntry.Index({
					sourceName,
					canonicalName
				}));
			}
			return {
				sourceName: accName,
				productTypeRef: ctx.registerTypesRecursively(row).ref,
				primaryKey: pk,
				indexes,
				constraints,
				sequences,
				tableType: { tag: "User" },
				tableAccess: { tag: isPublic ? "Public" : "Private" },
				defaultValues,
				isEvent
			};
		},
		idxs: {},
		constraints,
		schedule: scheduled && scheduleAtCol !== void 0 ? {
			scheduleAtCol,
			reducer: scheduled
		} : void 0
	};
}
var QueryBrand = Symbol("QueryBrand");
var isRowTypedQuery = (val) => !!val && typeof val === "object" && QueryBrand in val;
function toSql(q) {
	return q.toSql();
}
var SemijoinImpl = class _SemijoinImpl {
	constructor(sourceQuery, filterQuery, joinCondition) {
		this.sourceQuery = sourceQuery;
		this.filterQuery = filterQuery;
		this.joinCondition = joinCondition;
		if (sourceQuery.table.sourceName === filterQuery.table.sourceName) throw new Error("Cannot semijoin a table to itself");
	}
	[QueryBrand] = true;
	type = "semijoin";
	build() {
		return this;
	}
	where(predicate) {
		return new _SemijoinImpl(this.sourceQuery.where(predicate), this.filterQuery, this.joinCondition);
	}
	toSql() {
		const left = this.filterQuery;
		const right = this.sourceQuery;
		const leftTable = quoteIdentifier(left.table.sourceName);
		const rightTable = quoteIdentifier(right.table.sourceName);
		let sql = `SELECT ${rightTable}.* FROM ${leftTable} JOIN ${rightTable} ON ${booleanExprToSql(this.joinCondition)}`;
		const clauses = [];
		if (left.whereClause) clauses.push(booleanExprToSql(left.whereClause));
		if (right.whereClause) clauses.push(booleanExprToSql(right.whereClause));
		if (clauses.length > 0) {
			const whereSql = clauses.length === 1 ? clauses[0] : clauses.map(wrapInParens).join(" AND ");
			sql += ` WHERE ${whereSql}`;
		}
		return sql;
	}
};
var FromBuilder = class _FromBuilder {
	constructor(table2, whereClause) {
		this.table = table2;
		this.whereClause = whereClause;
	}
	[QueryBrand] = true;
	where(predicate) {
		const newCondition = predicate(this.table.cols);
		const nextWhere = this.whereClause ? this.whereClause.and(newCondition) : newCondition;
		return new _FromBuilder(this.table, nextWhere);
	}
	rightSemijoin(right, on) {
		const sourceQuery = new _FromBuilder(right);
		const joinCondition = on(this.table.indexedCols, right.indexedCols);
		return new SemijoinImpl(sourceQuery, this, joinCondition);
	}
	leftSemijoin(right, on) {
		const filterQuery = new _FromBuilder(right);
		const joinCondition = on(this.table.indexedCols, right.indexedCols);
		return new SemijoinImpl(this, filterQuery, joinCondition);
	}
	toSql() {
		return renderSelectSqlWithJoins(this.table, this.whereClause);
	}
	build() {
		return this;
	}
};
var TableRefImpl = class {
	[QueryBrand] = true;
	type = "table";
	sourceName;
	accessorName;
	cols;
	indexedCols;
	tableDef;
	get columns() {
		return this.tableDef.columns;
	}
	get indexes() {
		return this.tableDef.indexes;
	}
	get rowType() {
		return this.tableDef.rowType;
	}
	get constraints() {
		return this.tableDef.constraints;
	}
	constructor(tableDef) {
		this.sourceName = tableDef.sourceName;
		this.accessorName = tableDef.accessorName;
		this.cols = createRowExpr(tableDef);
		this.indexedCols = this.cols;
		this.tableDef = tableDef;
		Object.freeze(this);
	}
	asFrom() {
		return new FromBuilder(this);
	}
	rightSemijoin(other, on) {
		return this.asFrom().rightSemijoin(other, on);
	}
	leftSemijoin(other, on) {
		return this.asFrom().leftSemijoin(other, on);
	}
	build() {
		return this.asFrom().build();
	}
	toSql() {
		return this.asFrom().toSql();
	}
	where(predicate) {
		return this.asFrom().where(predicate);
	}
};
function createTableRefFromDef(tableDef) {
	return new TableRefImpl(tableDef);
}
function makeQueryBuilder(schema2) {
	const qb = /* @__PURE__ */ Object.create(null);
	for (const table2 of Object.values(schema2.tables)) {
		const ref = createTableRefFromDef(table2);
		qb[table2.accessorName] = ref;
	}
	return Object.freeze(qb);
}
function createRowExpr(tableDef) {
	const row = {};
	for (const columnName of Object.keys(tableDef.columns)) {
		const columnBuilder = tableDef.columns[columnName];
		const column = new ColumnExpression(tableDef.sourceName, columnName, columnBuilder.typeBuilder.algebraicType);
		row[columnName] = Object.freeze(column);
	}
	return Object.freeze(row);
}
function renderSelectSqlWithJoins(table2, where, extraClauses = []) {
	const sql = `SELECT * FROM ${quoteIdentifier(table2.sourceName)}`;
	const clauses = [];
	if (where) clauses.push(booleanExprToSql(where));
	clauses.push(...extraClauses);
	if (clauses.length === 0) return sql;
	return `${sql} WHERE ${clauses.length === 1 ? clauses[0] : clauses.map(wrapInParens).join(" AND ")}`;
}
var ColumnExpression = class {
	type = "column";
	column;
	table;
	tsValueType;
	spacetimeType;
	constructor(table2, column, spacetimeType) {
		this.table = table2;
		this.column = column;
		this.spacetimeType = spacetimeType;
	}
	eq(x) {
		return new BooleanExpr({
			type: "eq",
			left: this,
			right: normalizeValue(x)
		});
	}
	ne(x) {
		return new BooleanExpr({
			type: "ne",
			left: this,
			right: normalizeValue(x)
		});
	}
	lt(x) {
		return new BooleanExpr({
			type: "lt",
			left: this,
			right: normalizeValue(x)
		});
	}
	lte(x) {
		return new BooleanExpr({
			type: "lte",
			left: this,
			right: normalizeValue(x)
		});
	}
	gt(x) {
		return new BooleanExpr({
			type: "gt",
			left: this,
			right: normalizeValue(x)
		});
	}
	gte(x) {
		return new BooleanExpr({
			type: "gte",
			left: this,
			right: normalizeValue(x)
		});
	}
};
function literal(value) {
	return {
		type: "literal",
		value
	};
}
function normalizeValue(val) {
	if (val.type === "literal") return val;
	if (typeof val === "object" && val != null && "type" in val && val.type === "column") return val;
	return literal(val);
}
var BooleanExpr = class _BooleanExpr {
	constructor(data) {
		this.data = data;
	}
	and(other) {
		return new _BooleanExpr({
			type: "and",
			clauses: [this.data, other.data]
		});
	}
	or(other) {
		return new _BooleanExpr({
			type: "or",
			clauses: [this.data, other.data]
		});
	}
	not() {
		return new _BooleanExpr({
			type: "not",
			clause: this.data
		});
	}
};
function booleanExprToSql(expr, tableAlias) {
	const data = expr instanceof BooleanExpr ? expr.data : expr;
	switch (data.type) {
		case "eq": return `${valueExprToSql(data.left)} = ${valueExprToSql(data.right)}`;
		case "ne": return `${valueExprToSql(data.left)} <> ${valueExprToSql(data.right)}`;
		case "gt": return `${valueExprToSql(data.left)} > ${valueExprToSql(data.right)}`;
		case "gte": return `${valueExprToSql(data.left)} >= ${valueExprToSql(data.right)}`;
		case "lt": return `${valueExprToSql(data.left)} < ${valueExprToSql(data.right)}`;
		case "lte": return `${valueExprToSql(data.left)} <= ${valueExprToSql(data.right)}`;
		case "and": return data.clauses.map((c) => booleanExprToSql(c)).map(wrapInParens).join(" AND ");
		case "or": return data.clauses.map((c) => booleanExprToSql(c)).map(wrapInParens).join(" OR ");
		case "not": return `NOT ${wrapInParens(booleanExprToSql(data.clause))}`;
	}
}
function wrapInParens(sql) {
	return `(${sql})`;
}
function valueExprToSql(expr, tableAlias) {
	if (isLiteralExpr(expr)) return literalValueToSql(expr.value);
	const table2 = expr.table;
	return `${quoteIdentifier(table2)}.${quoteIdentifier(expr.column)}`;
}
function literalValueToSql(value) {
	if (value === null || value === void 0) return "NULL";
	if (value instanceof Identity || value instanceof ConnectionId) return `0x${value.toHexString()}`;
	if (value instanceof Timestamp) return `'${value.toISOString()}'`;
	switch (typeof value) {
		case "number":
		case "bigint": return String(value);
		case "boolean": return value ? "TRUE" : "FALSE";
		case "string": return `'${value.replace(/'/g, "''")}'`;
		default: return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
	}
}
function quoteIdentifier(name) {
	return `"${name.replace(/"/g, "\"\"")}"`;
}
function isLiteralExpr(expr) {
	return expr.type === "literal";
}
function makeViewExport(ctx, opts, params, ret, fn) {
	const viewExport = fn.bind();
	viewExport[exportContext] = ctx;
	viewExport[registerExport] = (ctx2, exportName) => {
		registerView(ctx2, opts, exportName, false, params, ret, fn);
	};
	return viewExport;
}
function makeAnonViewExport(ctx, opts, params, ret, fn) {
	const viewExport = fn.bind();
	viewExport[exportContext] = ctx;
	viewExport[registerExport] = (ctx2, exportName) => {
		registerView(ctx2, opts, exportName, true, params, ret, fn);
	};
	return viewExport;
}
function registerView(ctx, opts, exportName, anon, params, ret, fn) {
	const paramsBuilder = new RowBuilder(params, toPascalCase(exportName));
	let returnType = ctx.registerTypesRecursively(ret).algebraicType;
	const { typespace } = ctx;
	const { value: paramType } = ctx.resolveType(ctx.registerTypesRecursively(paramsBuilder));
	ctx.moduleDef.views.push({
		sourceName: exportName,
		index: (anon ? ctx.anonViews : ctx.views).length,
		isPublic: opts.public,
		isAnonymous: anon,
		params: paramType,
		returnType
	});
	if (opts.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	if (returnType.tag == "Sum") {
		const originalFn = fn;
		fn = ((ctx2, args) => {
			const ret2 = originalFn(ctx2, args);
			return ret2 == null ? [] : [ret2];
		});
		returnType = AlgebraicType.Array(returnType.value.variants[0].algebraicType);
	}
	(anon ? ctx.anonViews : ctx.views).push({
		fn,
		deserializeParams: ProductType.makeDeserializer(paramType, typespace),
		serializeReturn: AlgebraicType.makeSerializer(returnType, typespace),
		returnTypeBaseSize: bsatnBaseSize(typespace, returnType)
	});
}
var SenderError = class extends Error {
	constructor(message) {
		super(message);
	}
	get name() {
		return "SenderError";
	}
};
var SpacetimeHostError = class extends Error {
	constructor(message) {
		super(message);
	}
	get name() {
		return "SpacetimeHostError";
	}
};
var errorData = {
	HostCallFailure: 1,
	NotInTransaction: 2,
	BsatnDecodeError: 3,
	NoSuchTable: 4,
	NoSuchIndex: 5,
	NoSuchIter: 6,
	NoSuchConsoleTimer: 7,
	NoSuchBytes: 8,
	NoSpace: 9,
	BufferTooSmall: 11,
	UniqueAlreadyExists: 12,
	ScheduleAtDelayTooLong: 13,
	IndexNotUnique: 14,
	NoSuchRow: 15,
	AutoIncOverflow: 16,
	WouldBlockTransaction: 17,
	TransactionNotAnonymous: 18,
	TransactionIsReadOnly: 19,
	TransactionIsMut: 20,
	HttpError: 21
};
function mapEntries(x, f) {
	return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, f(k, v)]));
}
var errnoToClass = /* @__PURE__ */ new Map();
var errors = Object.freeze(mapEntries(errorData, (name, code) => {
	const cls = Object.defineProperty(class extends SpacetimeHostError {
		get name() {
			return name;
		}
	}, "name", {
		value: name,
		writable: false
	});
	errnoToClass.set(code, cls);
	return cls;
}));
function getErrorConstructor(code) {
	return errnoToClass.get(code) ?? SpacetimeHostError;
}
var SBigInt = typeof BigInt !== "undefined" ? BigInt : void 0;
var One = typeof BigInt !== "undefined" ? BigInt(1) : void 0;
var ThirtyTwo = typeof BigInt !== "undefined" ? BigInt(32) : void 0;
var NumValues = typeof BigInt !== "undefined" ? BigInt(4294967296) : void 0;
function unsafeUniformBigIntDistribution(from, to, rng) {
	var diff = to - from + One;
	var FinalNumValues = NumValues;
	var NumIterations = 1;
	while (FinalNumValues < diff) {
		FinalNumValues <<= ThirtyTwo;
		++NumIterations;
	}
	var value = generateNext(NumIterations, rng);
	if (value < diff) return value + from;
	if (value + diff < FinalNumValues) return value % diff + from;
	var MaxAcceptedRandom = FinalNumValues - FinalNumValues % diff;
	while (value >= MaxAcceptedRandom) value = generateNext(NumIterations, rng);
	return value % diff + from;
}
function generateNext(NumIterations, rng) {
	var value = SBigInt(rng.unsafeNext() + 2147483648);
	for (var num = 1; num < NumIterations; ++num) {
		var out = rng.unsafeNext();
		value = (value << ThirtyTwo) + SBigInt(out + 2147483648);
	}
	return value;
}
function unsafeUniformIntDistributionInternal(rangeSize, rng) {
	var MaxAllowed = rangeSize > 2 ? ~~(4294967296 / rangeSize) * rangeSize : 4294967296;
	var deltaV = rng.unsafeNext() + 2147483648;
	while (deltaV >= MaxAllowed) deltaV = rng.unsafeNext() + 2147483648;
	return deltaV % rangeSize;
}
function fromNumberToArrayInt64(out, n) {
	if (n < 0) {
		var posN = -n;
		out.sign = -1;
		out.data[0] = ~~(posN / 4294967296);
		out.data[1] = posN >>> 0;
	} else {
		out.sign = 1;
		out.data[0] = ~~(n / 4294967296);
		out.data[1] = n >>> 0;
	}
	return out;
}
function substractArrayInt64(out, arrayIntA, arrayIntB) {
	var lowA = arrayIntA.data[1];
	var highA = arrayIntA.data[0];
	var signA = arrayIntA.sign;
	var lowB = arrayIntB.data[1];
	var highB = arrayIntB.data[0];
	var signB = arrayIntB.sign;
	out.sign = 1;
	if (signA === 1 && signB === -1) {
		var low_1 = lowA + lowB;
		var high = highA + highB + (low_1 > 4294967295 ? 1 : 0);
		out.data[0] = high >>> 0;
		out.data[1] = low_1 >>> 0;
		return out;
	}
	var lowFirst = lowA;
	var highFirst = highA;
	var lowSecond = lowB;
	var highSecond = highB;
	if (signA === -1) {
		lowFirst = lowB;
		highFirst = highB;
		lowSecond = lowA;
		highSecond = highA;
	}
	var reminderLow = 0;
	var low = lowFirst - lowSecond;
	if (low < 0) {
		reminderLow = 1;
		low = low >>> 0;
	}
	out.data[0] = highFirst - highSecond - reminderLow;
	out.data[1] = low;
	return out;
}
function unsafeUniformArrayIntDistributionInternal(out, rangeSize, rng) {
	var rangeLength = rangeSize.length;
	while (true) {
		for (var index = 0; index !== rangeLength; ++index) out[index] = unsafeUniformIntDistributionInternal(index === 0 ? rangeSize[0] + 1 : 4294967296, rng);
		for (var index = 0; index !== rangeLength; ++index) {
			var current = out[index];
			var currentInRange = rangeSize[index];
			if (current < currentInRange) return out;
			else if (current > currentInRange) break;
		}
	}
}
var safeNumberMaxSafeInteger = Number.MAX_SAFE_INTEGER;
var sharedA = {
	sign: 1,
	data: [0, 0]
};
var sharedB = {
	sign: 1,
	data: [0, 0]
};
var sharedC = {
	sign: 1,
	data: [0, 0]
};
var sharedData = [0, 0];
function uniformLargeIntInternal(from, to, rangeSize, rng) {
	var rangeSizeArrayIntValue = rangeSize <= safeNumberMaxSafeInteger ? fromNumberToArrayInt64(sharedC, rangeSize) : substractArrayInt64(sharedC, fromNumberToArrayInt64(sharedA, to), fromNumberToArrayInt64(sharedB, from));
	if (rangeSizeArrayIntValue.data[1] === 4294967295) {
		rangeSizeArrayIntValue.data[0] += 1;
		rangeSizeArrayIntValue.data[1] = 0;
	} else rangeSizeArrayIntValue.data[1] += 1;
	unsafeUniformArrayIntDistributionInternal(sharedData, rangeSizeArrayIntValue.data, rng);
	return sharedData[0] * 4294967296 + sharedData[1] + from;
}
function unsafeUniformIntDistribution(from, to, rng) {
	var rangeSize = to - from;
	if (rangeSize <= 4294967295) return unsafeUniformIntDistributionInternal(rangeSize + 1, rng) + from;
	return uniformLargeIntInternal(from, to, rangeSize, rng);
}
var XoroShiro128Plus = (function() {
	function XoroShiro128Plus2(s01, s00, s11, s10) {
		this.s01 = s01;
		this.s00 = s00;
		this.s11 = s11;
		this.s10 = s10;
	}
	XoroShiro128Plus2.prototype.clone = function() {
		return new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
	};
	XoroShiro128Plus2.prototype.next = function() {
		var nextRng = new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
		return [nextRng.unsafeNext(), nextRng];
	};
	XoroShiro128Plus2.prototype.unsafeNext = function() {
		var out = this.s00 + this.s10 | 0;
		var a0 = this.s10 ^ this.s00;
		var a1 = this.s11 ^ this.s01;
		var s00 = this.s00;
		var s01 = this.s01;
		this.s00 = s00 << 24 ^ s01 >>> 8 ^ a0 ^ a0 << 16;
		this.s01 = s01 << 24 ^ s00 >>> 8 ^ a1 ^ (a1 << 16 | a0 >>> 16);
		this.s10 = a1 << 5 ^ a0 >>> 27;
		this.s11 = a0 << 5 ^ a1 >>> 27;
		return out;
	};
	XoroShiro128Plus2.prototype.jump = function() {
		var nextRng = new XoroShiro128Plus2(this.s01, this.s00, this.s11, this.s10);
		nextRng.unsafeJump();
		return nextRng;
	};
	XoroShiro128Plus2.prototype.unsafeJump = function() {
		var ns01 = 0;
		var ns00 = 0;
		var ns11 = 0;
		var ns10 = 0;
		var jump = [
			3639956645,
			3750757012,
			1261568508,
			386426335
		];
		for (var i = 0; i !== 4; ++i) for (var mask = 1; mask; mask <<= 1) {
			if (jump[i] & mask) {
				ns01 ^= this.s01;
				ns00 ^= this.s00;
				ns11 ^= this.s11;
				ns10 ^= this.s10;
			}
			this.unsafeNext();
		}
		this.s01 = ns01;
		this.s00 = ns00;
		this.s11 = ns11;
		this.s10 = ns10;
	};
	XoroShiro128Plus2.prototype.getState = function() {
		return [
			this.s01,
			this.s00,
			this.s11,
			this.s10
		];
	};
	return XoroShiro128Plus2;
})();
function fromState(state) {
	if (!(state.length === 4)) throw new Error("The state must have been produced by a xoroshiro128plus RandomGenerator");
	return new XoroShiro128Plus(state[0], state[1], state[2], state[3]);
}
var xoroshiro128plus = Object.assign(function(seed) {
	return new XoroShiro128Plus(-1, ~seed, seed | 0, 0);
}, { fromState });
var { asUintN } = BigInt;
function pcg32(state) {
	state = asUintN(64, state * 6364136223846793005n + 11634580027462260723n);
	const xorshifted = Number(asUintN(32, (state >> 18n ^ state) >> 27n));
	const rot = Number(asUintN(32, state >> 59n));
	return xorshifted >> rot | xorshifted << 32 - rot;
}
function generateFloat64(rng) {
	const g1 = unsafeUniformIntDistribution(0, (1 << 26) - 1, rng);
	const g2 = unsafeUniformIntDistribution(0, (1 << 27) - 1, rng);
	return (g1 * Math.pow(2, 27) + g2) * Math.pow(2, -53);
}
function makeRandom(seed) {
	const rng = xoroshiro128plus(pcg32(seed.microsSinceUnixEpoch));
	const random = () => generateFloat64(rng);
	random.fill = (array) => {
		const elem = array.at(0);
		if (typeof elem === "bigint") {
			const upper = (1n << BigInt(array.BYTES_PER_ELEMENT * 8)) - 1n;
			for (let i = 0; i < array.length; i++) array[i] = unsafeUniformBigIntDistribution(0n, upper, rng);
		} else if (typeof elem === "number") {
			const upper = (1 << array.BYTES_PER_ELEMENT * 8) - 1;
			for (let i = 0; i < array.length; i++) array[i] = unsafeUniformIntDistribution(0, upper, rng);
		}
		return array;
	};
	random.uint32 = () => rng.unsafeNext();
	random.integerInRange = (min, max) => unsafeUniformIntDistribution(min, max, rng);
	random.bigintInRange = (min, max) => unsafeUniformBigIntDistribution(min, max, rng);
	return random;
}
var { freeze } = Object;
var sys = _syscalls2_0;
function parseJsonObject(json) {
	let value;
	try {
		value = JSON.parse(json);
	} catch {
		throw new Error("Invalid JSON: failed to parse string");
	}
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a JSON object at the top level");
	return value;
}
var JwtClaimsImpl = class {
	/**
	* Creates a new JwtClaims instance.
	* @param rawPayload The JWT payload as a raw JSON string.
	* @param identity The identity for this JWT. We are only taking this because we don't have a blake3 implementation (which we need to compute it).
	*/
	constructor(rawPayload, identity) {
		this.rawPayload = rawPayload;
		this.fullPayload = parseJsonObject(rawPayload);
		this._identity = identity;
	}
	fullPayload;
	_identity;
	get identity() {
		return this._identity;
	}
	get subject() {
		return this.fullPayload["sub"];
	}
	get issuer() {
		return this.fullPayload["iss"];
	}
	get audience() {
		const aud = this.fullPayload["aud"];
		if (aud == null) return [];
		return typeof aud === "string" ? [aud] : aud;
	}
};
var AuthCtxImpl = class _AuthCtxImpl {
	isInternal;
	_jwtSource;
	_initializedJWT = false;
	_jwtClaims;
	_senderIdentity;
	constructor(opts) {
		this.isInternal = opts.isInternal;
		this._jwtSource = opts.jwtSource;
		this._senderIdentity = opts.senderIdentity;
	}
	_initializeJWT() {
		if (this._initializedJWT) return;
		this._initializedJWT = true;
		const token = this._jwtSource();
		if (!token) this._jwtClaims = null;
		else this._jwtClaims = new JwtClaimsImpl(token, this._senderIdentity);
		Object.freeze(this);
	}
	/** Lazily compute whether a JWT exists and is parseable. */
	get hasJWT() {
		this._initializeJWT();
		return this._jwtClaims !== null;
	}
	/** Lazily parse the JwtClaims only when accessed. */
	get jwt() {
		this._initializeJWT();
		return this._jwtClaims;
	}
	/** Create a context representing internal (non-user) requests. */
	static internal() {
		return new _AuthCtxImpl({
			isInternal: true,
			jwtSource: () => null,
			senderIdentity: Identity.zero()
		});
	}
	/** If there is a connection id, look up the JWT payload from the system tables. */
	static fromSystemTables(connectionId, sender) {
		if (connectionId === null) return new _AuthCtxImpl({
			isInternal: false,
			jwtSource: () => null,
			senderIdentity: sender
		});
		return new _AuthCtxImpl({
			isInternal: false,
			jwtSource: () => {
				const payloadBuf = sys.get_jwt_payload(connectionId.__connection_id__);
				if (payloadBuf.length === 0) return null;
				return new TextDecoder().decode(payloadBuf);
			},
			senderIdentity: sender
		});
	}
};
var ReducerCtxImpl = class ReducerCtx {
	#identity;
	#senderAuth;
	#uuidCounter;
	#random;
	sender;
	timestamp;
	connectionId;
	db;
	constructor(sender, timestamp, connectionId, dbView) {
		Object.seal(this);
		this.sender = sender;
		this.timestamp = timestamp;
		this.connectionId = connectionId;
		this.db = dbView;
	}
	/** Reset the `ReducerCtx` to be used for a new transaction */
	static reset(me, sender, timestamp, connectionId) {
		me.sender = sender;
		me.timestamp = timestamp;
		me.connectionId = connectionId;
		me.#uuidCounter = void 0;
		me.#senderAuth = void 0;
	}
	get identity() {
		return this.#identity ??= new Identity(sys.identity());
	}
	get senderAuth() {
		return this.#senderAuth ??= AuthCtxImpl.fromSystemTables(this.connectionId, this.sender);
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	/**
	* Create a new random {@link Uuid} `v4` using this `ReducerCtx`'s RNG.
	*/
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	/**
	* Create a new sortable {@link Uuid} `v7` using this `ReducerCtx`'s RNG, counter,
	* and timestamp.
	*/
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
var callUserFunction = function __spacetimedb_end_short_backtrace(fn, ...args) {
	return fn(...args);
};
var makeHooks = (schema2) => new ModuleHooksImpl(schema2);
var ModuleHooksImpl = class {
	#schema;
	#dbView_;
	#reducerArgsDeserializers;
	/** Cache the `ReducerCtx` object to avoid allocating anew for ever reducer call. */
	#reducerCtx_;
	constructor(schema2) {
		this.#schema = schema2;
		this.#reducerArgsDeserializers = schema2.moduleDef.reducers.map(({ params }) => ProductType.makeDeserializer(params, schema2.typespace));
	}
	get #dbView() {
		return this.#dbView_ ??= freeze(Object.fromEntries(Object.values(this.#schema.schemaType.tables).map((table2) => [table2.accessorName, makeTableView(this.#schema.typespace, table2.tableDef)])));
	}
	get #reducerCtx() {
		return this.#reducerCtx_ ??= new ReducerCtxImpl(Identity.zero(), Timestamp.UNIX_EPOCH, null, this.#dbView);
	}
	__describe_module__() {
		const writer = new BinaryWriter(128);
		RawModuleDef.serialize(writer, RawModuleDef.V10(this.#schema.rawModuleDefV10()));
		return writer.getBuffer();
	}
	__get_error_constructor__(code) {
		return getErrorConstructor(code);
	}
	get __sender_error_class__() {
		return SenderError;
	}
	__call_reducer__(reducerId, sender, connId, timestamp, argsBuf) {
		const moduleCtx = this.#schema;
		const deserializeArgs = this.#reducerArgsDeserializers[reducerId];
		BINARY_READER.reset(argsBuf);
		const args = deserializeArgs(BINARY_READER);
		const senderIdentity = new Identity(sender);
		const ctx = this.#reducerCtx;
		ReducerCtxImpl.reset(ctx, senderIdentity, new Timestamp(timestamp), ConnectionId.nullIfZero(new ConnectionId(connId)));
		callUserFunction(moduleCtx.reducers[reducerId], ctx, args);
	}
	__call_view__(id, sender, argsBuf) {
		const moduleCtx = this.#schema;
		const { fn, deserializeParams, serializeReturn, returnTypeBaseSize } = moduleCtx.views[id];
		const ret = callUserFunction(fn, freeze({
			sender: new Identity(sender),
			db: this.#dbView,
			from: makeQueryBuilder(moduleCtx.schemaType)
		}), deserializeParams(new BinaryReader(argsBuf)));
		const retBuf = new BinaryWriter(returnTypeBaseSize);
		if (isRowTypedQuery(ret)) {
			const query = toSql(ret);
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RawSql(query));
		} else {
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RowData);
			serializeReturn(retBuf, ret);
		}
		return { data: retBuf.getBuffer() };
	}
	__call_view_anon__(id, argsBuf) {
		const moduleCtx = this.#schema;
		const { fn, deserializeParams, serializeReturn, returnTypeBaseSize } = moduleCtx.anonViews[id];
		const ret = callUserFunction(fn, freeze({
			db: this.#dbView,
			from: makeQueryBuilder(moduleCtx.schemaType)
		}), deserializeParams(new BinaryReader(argsBuf)));
		const retBuf = new BinaryWriter(returnTypeBaseSize);
		if (isRowTypedQuery(ret)) {
			const query = toSql(ret);
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RawSql(query));
		} else {
			ViewResultHeader.serialize(retBuf, ViewResultHeader.RowData);
			serializeReturn(retBuf, ret);
		}
		return { data: retBuf.getBuffer() };
	}
	__call_procedure__(id, sender, connection_id, timestamp, args) {
		return callProcedure(this.#schema, id, new Identity(sender), ConnectionId.nullIfZero(new ConnectionId(connection_id)), new Timestamp(timestamp), args, () => this.#dbView);
	}
};
var BINARY_WRITER = new BinaryWriter(0);
var BINARY_READER = new BinaryReader(new Uint8Array());
function makeTableView(typespace, table2) {
	const table_id = sys.table_id_from_name(table2.sourceName);
	const rowType = typespace.types[table2.productTypeRef];
	if (rowType.tag !== "Product") throw "impossible";
	const serializeRow = AlgebraicType.makeSerializer(rowType, typespace);
	const deserializeRow = AlgebraicType.makeDeserializer(rowType, typespace);
	const sequences = table2.sequences.map((seq) => {
		const col = rowType.value.elements[seq.column];
		const colType = col.algebraicType;
		let sequenceTrigger;
		switch (colType.tag) {
			case "U8":
			case "I8":
			case "U16":
			case "I16":
			case "U32":
			case "I32":
				sequenceTrigger = 0;
				break;
			case "U64":
			case "I64":
			case "U128":
			case "I128":
			case "U256":
			case "I256":
				sequenceTrigger = 0n;
				break;
			default: throw new TypeError("invalid sequence type");
		}
		return {
			colName: col.name,
			sequenceTrigger,
			deserialize: AlgebraicType.makeDeserializer(colType, typespace)
		};
	});
	const hasAutoIncrement = sequences.length > 0;
	const iter = () => tableIterator(sys.datastore_table_scan_bsatn(table_id), deserializeRow);
	const integrateGeneratedColumns = hasAutoIncrement ? (row, ret_buf) => {
		BINARY_READER.reset(ret_buf);
		for (const { colName, deserialize, sequenceTrigger } of sequences) if (row[colName] === sequenceTrigger) row[colName] = deserialize(BINARY_READER);
	} : null;
	const tableMethods = {
		count: () => sys.datastore_table_row_count(table_id),
		iter,
		[Symbol.iterator]: () => iter(),
		insert: (row) => {
			const buf = LEAF_BUF;
			BINARY_WRITER.reset(buf);
			serializeRow(BINARY_WRITER, row);
			sys.datastore_insert_bsatn(table_id, buf.buffer, BINARY_WRITER.offset);
			const ret = { ...row };
			integrateGeneratedColumns?.(ret, buf.view);
			return ret;
		},
		delete: (row) => {
			const buf = LEAF_BUF;
			BINARY_WRITER.reset(buf);
			BINARY_WRITER.writeU32(1);
			serializeRow(BINARY_WRITER, row);
			return sys.datastore_delete_all_by_eq_bsatn(table_id, buf.buffer, BINARY_WRITER.offset) > 0;
		}
	};
	const tableView = Object.assign(/* @__PURE__ */ Object.create(null), tableMethods);
	for (const indexDef of table2.indexes) {
		const index_id = sys.index_id_from_name(indexDef.sourceName);
		let column_ids;
		let isHashIndex = false;
		switch (indexDef.algorithm.tag) {
			case "Hash":
				isHashIndex = true;
				column_ids = indexDef.algorithm.value;
				break;
			case "BTree":
				column_ids = indexDef.algorithm.value;
				break;
			case "Direct":
				column_ids = [indexDef.algorithm.value];
				break;
		}
		const numColumns = column_ids.length;
		const columnSet = new Set(column_ids);
		const isUnique = table2.constraints.filter((x) => x.data.tag === "Unique").some((x) => columnSet.isSubsetOf(new Set(x.data.value.columns)));
		const isPrimaryKey = isUnique && column_ids.length === table2.primaryKey.length && column_ids.every((id, i) => table2.primaryKey[i] === id);
		const indexSerializers = column_ids.map((id) => AlgebraicType.makeSerializer(rowType.value.elements[id].algebraicType, typespace));
		const serializePoint = (buffer, colVal) => {
			BINARY_WRITER.reset(buffer);
			for (let i = 0; i < numColumns; i++) indexSerializers[i](BINARY_WRITER, colVal[i]);
			return BINARY_WRITER.offset;
		};
		const serializeSingleElement = numColumns === 1 ? indexSerializers[0] : null;
		const serializeSinglePoint = serializeSingleElement && ((buffer, colVal) => {
			BINARY_WRITER.reset(buffer);
			serializeSingleElement(BINARY_WRITER, colVal);
			return BINARY_WRITER.offset;
		});
		let index;
		if (isUnique && serializeSinglePoint) {
			const base = {
				find: (colVal) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, colVal);
					return tableIterateOne(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (colVal) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, colVal);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len) > 0;
				}
			};
			if (isPrimaryKey) base.update = (row) => {
				const buf = LEAF_BUF;
				BINARY_WRITER.reset(buf);
				serializeRow(BINARY_WRITER, row);
				sys.datastore_update_bsatn(table_id, index_id, buf.buffer, BINARY_WRITER.offset);
				integrateGeneratedColumns?.(row, buf.view);
				return row;
			};
			index = base;
		} else if (isUnique) {
			const base = {
				find: (colVal) => {
					if (colVal.length !== numColumns) throw new TypeError("wrong number of elements");
					const buf = LEAF_BUF;
					const point_len = serializePoint(buf, colVal);
					return tableIterateOne(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (colVal) => {
					if (colVal.length !== numColumns) throw new TypeError("wrong number of elements");
					const buf = LEAF_BUF;
					const point_len = serializePoint(buf, colVal);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len) > 0;
				}
			};
			if (isPrimaryKey) base.update = (row) => {
				const buf = LEAF_BUF;
				BINARY_WRITER.reset(buf);
				serializeRow(BINARY_WRITER, row);
				sys.datastore_update_bsatn(table_id, index_id, buf.buffer, BINARY_WRITER.offset);
				integrateGeneratedColumns?.(row, buf.view);
				return row;
			};
			index = base;
		} else if (serializeSinglePoint) {
			const rawIndex = {
				filter: (range) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, range);
					return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
				},
				delete: (range) => {
					const buf = LEAF_BUF;
					const point_len = serializeSinglePoint(buf, range);
					return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
				}
			};
			if (isHashIndex) index = rawIndex;
			else index = rawIndex;
		} else if (isHashIndex) index = {
			filter: (range) => {
				const buf = LEAF_BUF;
				const point_len = serializePoint(buf, range);
				return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
			},
			delete: (range) => {
				const buf = LEAF_BUF;
				const point_len = serializePoint(buf, range);
				return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
			}
		};
		else {
			const serializeRange = (buffer, range) => {
				if (range.length > numColumns) throw new TypeError("too many elements");
				BINARY_WRITER.reset(buffer);
				const writer = BINARY_WRITER;
				const prefix_elems = range.length - 1;
				for (let i = 0; i < prefix_elems; i++) indexSerializers[i](writer, range[i]);
				const rstartOffset = writer.offset;
				const term = range[range.length - 1];
				const serializeTerm = indexSerializers[range.length - 1];
				if (term instanceof Range) {
					const writeBound = (bound) => {
						writer.writeU8({
							included: 0,
							excluded: 1,
							unbounded: 2
						}[bound.tag]);
						if (bound.tag !== "unbounded") serializeTerm(writer, bound.value);
					};
					writeBound(term.from);
					const rstartLen = writer.offset - rstartOffset;
					writeBound(term.to);
					return [
						rstartOffset,
						prefix_elems,
						rstartLen,
						writer.offset - rstartLen
					];
				} else {
					writer.writeU8(0);
					serializeTerm(writer, term);
					return [
						rstartOffset,
						prefix_elems,
						writer.offset,
						0
					];
				}
			};
			index = {
				filter: (range) => {
					if (range.length === numColumns) {
						const buf = LEAF_BUF;
						const point_len = serializePoint(buf, range);
						return tableIterator(sys.datastore_index_scan_point_bsatn(index_id, buf.buffer, point_len), deserializeRow);
					} else {
						const buf = LEAF_BUF;
						const args = serializeRange(buf, range);
						return tableIterator(sys.datastore_index_scan_range_bsatn(index_id, buf.buffer, ...args), deserializeRow);
					}
				},
				delete: (range) => {
					if (range.length === numColumns) {
						const buf = LEAF_BUF;
						const point_len = serializePoint(buf, range);
						return sys.datastore_delete_by_index_scan_point_bsatn(index_id, buf.buffer, point_len);
					} else {
						const buf = LEAF_BUF;
						const args = serializeRange(buf, range);
						return sys.datastore_delete_by_index_scan_range_bsatn(index_id, buf.buffer, ...args);
					}
				}
			};
		}
		if (Object.hasOwn(tableView, indexDef.accessorName)) freeze(Object.assign(tableView[indexDef.accessorName], index));
		else tableView[indexDef.accessorName] = freeze(index);
	}
	return freeze(tableView);
}
function* tableIterator(id, deserialize) {
	using iter = new IteratorHandle(id);
	const iterBuf = takeBuf();
	try {
		let amt;
		while (amt = iter.advance(iterBuf)) {
			const reader = new BinaryReader(iterBuf.view);
			while (reader.offset < amt) yield deserialize(reader);
		}
	} finally {
		returnBuf(iterBuf);
	}
}
function tableIterateOne(id, deserialize) {
	const buf = LEAF_BUF;
	if (advanceIterRaw(id, buf) !== 0) {
		BINARY_READER.reset(buf.view);
		return deserialize(BINARY_READER);
	}
	return null;
}
function advanceIterRaw(id, buf) {
	while (true) try {
		return 0 | sys.row_iter_bsatn_advance(id, buf.buffer);
	} catch (e) {
		if (e && typeof e === "object" && hasOwn(e, "__buffer_too_small__")) {
			buf.grow(e.__buffer_too_small__);
			continue;
		}
		throw e;
	}
}
var DEFAULT_BUFFER_CAPACITY = 32 * 1024 * 2;
var ITER_BUFS = [new ResizableBuffer(DEFAULT_BUFFER_CAPACITY)];
var ITER_BUF_COUNT = 1;
function takeBuf() {
	return ITER_BUF_COUNT ? ITER_BUFS[--ITER_BUF_COUNT] : new ResizableBuffer(DEFAULT_BUFFER_CAPACITY);
}
function returnBuf(buf) {
	ITER_BUFS[ITER_BUF_COUNT++] = buf;
}
var LEAF_BUF = new ResizableBuffer(DEFAULT_BUFFER_CAPACITY);
var IteratorHandle = class _IteratorHandle {
	#id;
	static #finalizationRegistry = new FinalizationRegistry(sys.row_iter_bsatn_close);
	constructor(id) {
		this.#id = id;
		_IteratorHandle.#finalizationRegistry.register(this, id, this);
	}
	/** Unregister this object with the finalization registry and return the id */
	#detach() {
		const id = this.#id;
		this.#id = -1;
		_IteratorHandle.#finalizationRegistry.unregister(this);
		return id;
	}
	/** Call `row_iter_bsatn_advance`, returning 0 if this iterator has been exhausted. */
	advance(buf) {
		if (this.#id === -1) return 0;
		const ret = advanceIterRaw(this.#id, buf);
		if (ret <= 0) this.#detach();
		return ret < 0 ? -ret : ret;
	}
	[Symbol.dispose]() {
		if (this.#id >= 0) {
			const id = this.#detach();
			sys.row_iter_bsatn_close(id);
		}
	}
};
var { freeze: freeze2 } = Object;
var textEncoder = new TextEncoder();
var textDecoder = new TextDecoder("utf-8");
var makeResponse = Symbol("makeResponse");
var SyncResponse = class _SyncResponse {
	#body;
	#inner;
	constructor(body, init) {
		if (body == null) this.#body = null;
		else if (typeof body === "string") this.#body = body;
		else this.#body = new Uint8Array(body).buffer;
		this.#inner = {
			headers: new Headers(init?.headers),
			status: init?.status ?? 200,
			statusText: init?.statusText ?? "",
			type: "default",
			url: null,
			aborted: false
		};
	}
	static [makeResponse](body, inner) {
		const me = new _SyncResponse(body);
		me.#inner = inner;
		return me;
	}
	get headers() {
		return this.#inner.headers;
	}
	get status() {
		return this.#inner.status;
	}
	get statusText() {
		return this.#inner.statusText;
	}
	get ok() {
		return 200 <= this.#inner.status && this.#inner.status <= 299;
	}
	get url() {
		return this.#inner.url ?? "";
	}
	get type() {
		return this.#inner.type;
	}
	arrayBuffer() {
		return this.bytes().buffer;
	}
	bytes() {
		if (this.#body == null) return new Uint8Array();
		else if (typeof this.#body === "string") return textEncoder.encode(this.#body);
		else return new Uint8Array(this.#body);
	}
	json() {
		return JSON.parse(this.text());
	}
	text() {
		if (this.#body == null) return "";
		else if (typeof this.#body === "string") return this.#body;
		else return textDecoder.decode(this.#body);
	}
};
var requestBaseSize = bsatnBaseSize({ types: [] }, HttpRequest.algebraicType);
var methods = /* @__PURE__ */ new Map([
	["GET", { tag: "Get" }],
	["HEAD", { tag: "Head" }],
	["POST", { tag: "Post" }],
	["PUT", { tag: "Put" }],
	["DELETE", { tag: "Delete" }],
	["CONNECT", { tag: "Connect" }],
	["OPTIONS", { tag: "Options" }],
	["TRACE", { tag: "Trace" }],
	["PATCH", { tag: "Patch" }]
]);
function fetch(url, init = {}) {
	const method = methods.get(init.method?.toUpperCase() ?? "GET") ?? {
		tag: "Extension",
		value: init.method
	};
	const headers = { entries: headersToList(new Headers(init.headers)).flatMap(([k, v]) => Array.isArray(v) ? v.map((v2) => [k, v2]) : [[k, v]]).map(([name, value]) => ({
		name,
		value: textEncoder.encode(value)
	})) };
	const uri = "" + url;
	const request = freeze2({
		method,
		headers,
		timeout: init.timeout,
		uri,
		version: { tag: "Http11" }
	});
	const requestBuf = new BinaryWriter(requestBaseSize);
	HttpRequest.serialize(requestBuf, request);
	const body = init.body == null ? new Uint8Array() : typeof init.body === "string" ? init.body : new Uint8Array(init.body);
	const [responseBuf, responseBody] = sys.procedure_http_request(requestBuf.getBuffer(), body);
	const response = HttpResponse.deserialize(new BinaryReader(responseBuf));
	return SyncResponse[makeResponse](responseBody, {
		type: "basic",
		url: uri,
		status: response.code,
		statusText: (0, import_statuses.default)(response.code),
		headers: new Headers(),
		aborted: false
	});
}
freeze2(fetch);
var httpClient = freeze2({ fetch });
function makeProcedureExport(ctx, opts, params, ret, fn) {
	const name = opts?.name;
	const procedureExport = (...args) => fn(...args);
	procedureExport[exportContext] = ctx;
	procedureExport[registerExport] = (ctx2, exportName) => {
		registerProcedure(ctx2, name ?? exportName, params, ret, fn);
		ctx2.functionExports.set(procedureExport, name ?? exportName);
	};
	return procedureExport;
}
var TransactionCtxImpl = class TransactionCtx extends ReducerCtxImpl {};
function registerProcedure(ctx, exportName, params, ret, fn, opts) {
	ctx.defineFunction(exportName);
	const paramsType = { elements: Object.entries(params).map(([n, c]) => ({
		name: n,
		algebraicType: ctx.registerTypesRecursively("typeBuilder" in c ? c.typeBuilder : c).algebraicType
	})) };
	const returnType = ctx.registerTypesRecursively(ret).algebraicType;
	ctx.moduleDef.procedures.push({
		sourceName: exportName,
		params: paramsType,
		returnType,
		visibility: FunctionVisibility.ClientCallable
	});
	const { typespace } = ctx;
	ctx.procedures.push({
		fn,
		deserializeArgs: ProductType.makeDeserializer(paramsType, typespace),
		serializeReturn: AlgebraicType.makeSerializer(returnType, typespace),
		returnTypeBaseSize: bsatnBaseSize(typespace, returnType)
	});
}
function callProcedure(moduleCtx, id, sender, connectionId, timestamp, argsBuf, dbView) {
	const { fn, deserializeArgs, serializeReturn, returnTypeBaseSize } = moduleCtx.procedures[id];
	const args = deserializeArgs(new BinaryReader(argsBuf));
	const ret = callUserFunction(fn, new ProcedureCtxImpl(sender, timestamp, connectionId, dbView), args);
	const retBuf = new BinaryWriter(returnTypeBaseSize);
	serializeReturn(retBuf, ret);
	return retBuf.getBuffer();
}
var ProcedureCtxImpl = class ProcedureCtx {
	constructor(sender, timestamp, connectionId, dbView) {
		this.sender = sender;
		this.timestamp = timestamp;
		this.connectionId = connectionId;
		this.#dbView = dbView;
	}
	#identity;
	#uuidCounter;
	#random;
	#dbView;
	get identity() {
		return this.#identity ??= new Identity(sys.identity());
	}
	get random() {
		return this.#random ??= makeRandom(this.timestamp);
	}
	get http() {
		return httpClient;
	}
	withTx(body) {
		const run = () => {
			const timestamp = sys.procedure_start_mut_tx();
			try {
				return body(new TransactionCtxImpl(this.sender, new Timestamp(timestamp), this.connectionId, this.#dbView()));
			} catch (e) {
				sys.procedure_abort_mut_tx();
				throw e;
			}
		};
		let res = run();
		try {
			sys.procedure_commit_mut_tx();
			return res;
		} catch {}
		console.warn("committing anonymous transaction failed");
		res = run();
		try {
			sys.procedure_commit_mut_tx();
			return res;
		} catch (e) {
			throw new Error("transaction retry failed again", { cause: e });
		}
	}
	newUuidV4() {
		const bytes = this.random.fill(new Uint8Array(16));
		return Uuid.fromRandomBytesV4(bytes);
	}
	newUuidV7() {
		const bytes = this.random.fill(new Uint8Array(4));
		const counter = this.#uuidCounter ??= { value: 0 };
		return Uuid.fromCounterV7(counter, this.timestamp, bytes);
	}
};
function makeReducerExport(ctx, opts, params, fn, lifecycle) {
	const reducerExport = (...args) => fn(...args);
	reducerExport[exportContext] = ctx;
	reducerExport[registerExport] = (ctx2, exportName) => {
		registerReducer(ctx2, exportName, params, fn, opts, lifecycle);
		ctx2.functionExports.set(reducerExport, exportName);
	};
	return reducerExport;
}
function registerReducer(ctx, exportName, params, fn, opts, lifecycle) {
	ctx.defineFunction(exportName);
	if (!(params instanceof RowBuilder)) params = new RowBuilder(params);
	if (params.typeName === void 0) params.typeName = toPascalCase(exportName);
	const ref = ctx.registerTypesRecursively(params);
	const paramsType = ctx.resolveType(ref).value;
	const isLifecycle = lifecycle != null;
	ctx.moduleDef.reducers.push({
		sourceName: exportName,
		params: paramsType,
		visibility: FunctionVisibility.ClientCallable,
		okReturnType: AlgebraicType.Product({ elements: [] }),
		errReturnType: AlgebraicType.String
	});
	if (opts?.name != null) ctx.moduleDef.explicitNames.entries.push({
		tag: "Function",
		value: {
			sourceName: exportName,
			canonicalName: opts.name
		}
	});
	if (isLifecycle) ctx.moduleDef.lifeCycleReducers.push({
		lifecycleSpec: lifecycle,
		functionName: exportName
	});
	if (!fn.name) Object.defineProperty(fn, "name", {
		value: exportName,
		writable: false
	});
	ctx.reducers.push(fn);
}
var SchemaInner = class extends ModuleContext {
	schemaType;
	existingFunctions = /* @__PURE__ */ new Set();
	reducers = [];
	procedures = [];
	views = [];
	anonViews = [];
	/**
	* Maps ReducerExport objects to the name of the reducer.
	* Used for resolving the reducers of scheduled tables.
	*/
	functionExports = /* @__PURE__ */ new Map();
	pendingSchedules = [];
	constructor(getSchemaType) {
		super();
		this.schemaType = getSchemaType(this);
	}
	defineFunction(name) {
		if (this.existingFunctions.has(name)) throw new TypeError(`There is already a reducer or procedure with the name '${name}'`);
		this.existingFunctions.add(name);
	}
	resolveSchedules() {
		for (const { reducer, scheduleAtCol, tableName } of this.pendingSchedules) {
			const functionName = this.functionExports.get(reducer());
			if (functionName === void 0) {
				const msg = `Table ${tableName} defines a schedule, but it seems like the associated function was not exported.`;
				throw new TypeError(msg);
			}
			this.moduleDef.schedules.push({
				sourceName: void 0,
				tableName,
				scheduleAtCol,
				functionName
			});
		}
	}
};
var Schema = class {
	#ctx;
	constructor(ctx) {
		this.#ctx = ctx;
	}
	[moduleHooks](exports) {
		const registeredSchema = this.#ctx;
		for (const [name, moduleExport] of Object.entries(exports)) {
			if (name === "default") continue;
			if (!isModuleExport(moduleExport)) throw new TypeError("exporting something that is not a spacetime export");
			checkExportContext(moduleExport, registeredSchema);
			moduleExport[registerExport](registeredSchema, name);
		}
		registeredSchema.resolveSchedules();
		return makeHooks(registeredSchema);
	}
	get schemaType() {
		return this.#ctx.schemaType;
	}
	get moduleDef() {
		return this.#ctx.moduleDef;
	}
	get typespace() {
		return this.#ctx.typespace;
	}
	reducer(...args) {
		let opts, params = {}, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2: {
				let arg1;
				[arg1, fn] = args;
				if (typeof arg1.name === "string") opts = arg1;
				else params = arg1;
				break;
			}
			case 3:
				[opts, params, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, params, fn);
	}
	init(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.Init);
	}
	clientConnected(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.OnConnect);
	}
	clientDisconnected(...args) {
		let opts, fn;
		switch (args.length) {
			case 1:
				[fn] = args;
				break;
			case 2:
				[opts, fn] = args;
				break;
		}
		return makeReducerExport(this.#ctx, opts, {}, fn, Lifecycle.OnDisconnect);
	}
	view(opts, ret, fn) {
		return makeViewExport(this.#ctx, opts, {}, ret, fn);
	}
	anonymousView(opts, ret, fn) {
		return makeAnonViewExport(this.#ctx, opts, {}, ret, fn);
	}
	procedure(...args) {
		let opts, params = {}, ret, fn;
		switch (args.length) {
			case 2:
				[ret, fn] = args;
				break;
			case 3: {
				let arg1;
				[arg1, ret, fn] = args;
				if (typeof arg1.name === "string") opts = arg1;
				else params = arg1;
				break;
			}
			case 4:
				[opts, params, ret, fn] = args;
				break;
		}
		return makeProcedureExport(this.#ctx, opts, params, ret, fn);
	}
	/**
	* Bundle multiple reducers, procedures, etc into one value to export.
	* The name they will be exported with is their corresponding key in the `exports` argument.
	*/
	exportGroup(exports) {
		return {
			[exportContext]: this.#ctx,
			[registerExport](ctx, _exportName) {
				for (const [exportName, moduleExport] of Object.entries(exports)) {
					checkExportContext(moduleExport, ctx);
					moduleExport[registerExport](ctx, exportName);
				}
			}
		};
	}
	clientVisibilityFilter = { sql: (filter) => ({
		[exportContext]: this.#ctx,
		[registerExport](ctx, _exportName) {
			ctx.moduleDef.rowLevelSecurity.push({ sql: filter });
		}
	}) };
};
var registerExport = Symbol("SpacetimeDB.registerExport");
var exportContext = Symbol("SpacetimeDB.exportContext");
function isModuleExport(x) {
	return (typeof x === "function" || typeof x === "object") && x !== null && registerExport in x;
}
function checkExportContext(exp, schema2) {
	if (exp[exportContext] != null && exp[exportContext] !== schema2) throw new TypeError("multiple schemas are not supported");
}
function schema(tables, moduleSettings) {
	return new Schema(new SchemaInner((ctx2) => {
		if (moduleSettings?.CASE_CONVERSION_POLICY != null) ctx2.setCaseConversionPolicy(moduleSettings.CASE_CONVERSION_POLICY);
		const tableSchemas = {};
		for (const [accName, table2] of Object.entries(tables)) {
			const tableDef = table2.tableDef(ctx2, accName);
			tableSchemas[accName] = tableToSchema(accName, table2, tableDef);
			ctx2.moduleDef.tables.push(tableDef);
			if (table2.schedule) ctx2.pendingSchedules.push({
				...table2.schedule,
				tableName: tableDef.sourceName
			});
			if (table2.tableName) ctx2.moduleDef.explicitNames.entries.push({
				tag: "Table",
				value: {
					sourceName: accName,
					canonicalName: table2.tableName
				}
			});
		}
		return { tables: tableSchemas };
	}));
}
var import_object_inspect = __toESM(require_object_inspect());
var fmtLog = (...data) => data.map((x) => typeof x === "string" ? x : (0, import_object_inspect.default)(x)).join(" ");
var console_level_error = 0;
var console_level_warn = 1;
var console_level_info = 2;
var console_level_debug = 3;
var console_level_trace = 4;
var timerMap = /* @__PURE__ */ new Map();
var console2 = {
	__proto__: {},
	[Symbol.toStringTag]: "console",
	assert: (condition = false, ...data) => {
		if (!condition) sys.console_log(console_level_error, fmtLog(...data));
	},
	clear: () => {},
	debug: (...data) => {
		sys.console_log(console_level_debug, fmtLog(...data));
	},
	error: (...data) => {
		sys.console_log(console_level_error, fmtLog(...data));
	},
	info: (...data) => {
		sys.console_log(console_level_info, fmtLog(...data));
	},
	log: (...data) => {
		sys.console_log(console_level_info, fmtLog(...data));
	},
	table: (tabularData, _properties) => {
		sys.console_log(console_level_info, fmtLog(tabularData));
	},
	trace: (...data) => {
		sys.console_log(console_level_trace, fmtLog(...data));
	},
	warn: (...data) => {
		sys.console_log(console_level_warn, fmtLog(...data));
	},
	dir: (_item, _options) => {},
	dirxml: (..._data) => {},
	count: (_label = "default") => {},
	countReset: (_label = "default") => {},
	group: (..._data) => {},
	groupCollapsed: (..._data) => {},
	groupEnd: () => {},
	time: (label = "default") => {
		if (timerMap.has(label)) {
			sys.console_log(console_level_warn, `Timer '${label}' already exists.`);
			return;
		}
		timerMap.set(label, sys.console_timer_start(label));
	},
	timeLog: (label = "default", ...data) => {
		sys.console_log(console_level_info, fmtLog(label, ...data));
	},
	timeEnd: (label = "default") => {
		const spanId = timerMap.get(label);
		if (spanId === void 0) {
			sys.console_log(console_level_warn, `Timer '${label}' does not exist.`);
			return;
		}
		sys.console_timer_end(spanId);
		timerMap.delete(label);
	},
	timeStamp: () => {},
	profile: () => {},
	profileEnd: () => {}
};
globalThis.console = console2;

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/types/enums.ts
const Role = t.enum("Role", {
	Admin: t.unit(),
	TournamentHost: t.unit(),
	User: t.unit()
});
const Path = t.enum("Path", {
	Abundance: t.unit(),
	Destruction: t.unit(),
	Erudition: t.unit(),
	Harmony: t.unit(),
	Hunt: t.unit(),
	Nihility: t.unit(),
	Preservation: t.unit(),
	Remembrance: t.unit(),
	Elation: t.unit()
});
const Element = t.enum("Element", {
	Fire: t.unit(),
	Ice: t.unit(),
	Imaginary: t.unit(),
	Lightning: t.unit(),
	Physical: t.unit(),
	Quantum: t.unit(),
	Wind: t.unit()
});
const CharRole = t.enum("CharRole", {
	Dps: t.unit(),
	Sustain: t.unit(),
	Support: t.unit()
});
const GameMode = t.enum("GameMode", {
	MemoryOfChaos: t.unit(),
	ApocalypticShadow: t.unit(),
	AnomalyArbitration: t.unit()
});
const DraftMode = t.enum("DraftMode", {
	Classic: t.unit(),
	Auction: t.unit()
});
const BanMode = t.enum("BanMode", {
	None: t.unit(),
	Two: t.unit(),
	Four: t.unit(),
	Six: t.unit()
});
const LobbyStage = t.enum("LobbyStage", {
	Waiting: t.unit(),
	Drafting: t.unit(),
	Finished: t.unit()
});
const ParticipationRole = t.enum("ParticipationRole", {
	Player: t.unit(),
	Spectator: t.unit()
});
const TeamLabel = t.enum("TeamLabel", {
	Spectator: t.unit(),
	Blue: t.unit(),
	Red: t.unit()
});
const MatchResult = t.enum("MatchResult", {
	BlueWins: t.unit(),
	RedWins: t.unit(),
	Draw: t.unit(),
	Aborted: t.unit()
});
const ActionType = t.enum("ActionType", {
	Pick: t.unit(),
	Ban: t.unit(),
	Nominate: t.unit(),
	Bid: t.unit(),
	AuctionSold: t.unit(),
	Pause: t.unit(),
	Undo: t.unit()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/user.ts
const User = table({
	name: "user",
	public: true,
	indexes: [{
		name: "user_username",
		algorithm: "btree",
		columns: ["username"],
		unique: true
	}, {
		name: "user_discord_id",
		algorithm: "btree",
		columns: ["discordId"]
	}]
}, {
	identity: t.identity().primaryKey(),
	username: t.string(),
	displayName: t.string(),
	isGuest: t.bool(),
	lastLoginAt: t.timestamp(),
	role: Role,
	discordId: t.string().optional(),
	avatarCharacterName: t.string()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrCharacter.ts
const HsrCharacter = table({
	name: "hsr_character",
	public: true,
	indexes: [
		{
			name: "character_by_path",
			algorithm: "btree",
			columns: ["path"]
		},
		{
			name: "character_by_element",
			algorithm: "btree",
			columns: ["element"]
		},
		{
			name: "character_by_role",
			algorithm: "btree",
			columns: ["role"]
		}
	]
}, {
	name: t.string().primaryKey(),
	displayName: t.string(),
	aliases: t.array(t.string()),
	rarity: t.u8(),
	path: Path,
	element: Element,
	role: CharRole,
	imageUrl: t.string()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrLightcone.ts
const HsrLightcone = table({
	name: "hsr_lightcone",
	public: true,
	indexes: [{
		name: "lightcone_by_path",
		algorithm: "btree",
		columns: ["path"]
	}]
}, {
	name: t.string().primaryKey(),
	displayName: t.string(),
	aliases: t.array(t.string()),
	path: Path,
	rarity: t.u8(),
	imageUrl: t.string(),
	posX: t.i32(),
	posY: t.i32(),
	width: t.i32()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/types/structs.ts
const LobbyConfig = t.object("LobbyConfig", {
	team_size: t.u8(),
	draft_mode: DraftMode,
	ban_mode: BanMode,
	standard_turn_seconds: t.u32(),
	reserve_bank_seconds: t.u32(),
	auction_budget: t.f32().optional(),
	roster_diff_advantage: t.f32(),
	roster_threshold: t.f32(),
	under_threshold_advantage: t.f32(),
	above_threshold_penalty: t.f32(),
	death_penalty: t.f32()
});
const PlayerSnapshot = t.object("PlayerSnapshot", {
	identity: t.identity(),
	display_name: t.string(),
	avatar_url: t.string()
});
const TimerState = t.object("TimerState", {
	turn_start_at: t.timestamp(),
	team_blue_reserve_ms: t.u32(),
	team_red_reserve_ms: t.u32(),
	is_paused: t.bool(),
	accumulated_pause_ms: t.u32()
});
const DraftStep = t.object("DraftStep", {
	action_required: ActionType,
	team_turn: TeamLabel
});
const EidolonCost = t.object("EidolonCost", {
	e0: t.f32(),
	e1: t.f32(),
	e2: t.f32(),
	e3: t.f32(),
	e4: t.f32(),
	e5: t.f32(),
	e6: t.f32()
});
const SuperimpositionCost = t.object("SuperimpositionCost", {
	s1: t.f32(),
	s2: t.f32(),
	s3: t.f32(),
	s4: t.f32(),
	s5: t.f32()
});
const PickPayload = t.object("PickPayload", {
	character_name: t.string(),
	eidolon: t.u8(),
	cost_paid: t.f32()
});
const BanPayload = t.object("BanPayload", { character_name: t.string() });
const BidPayload = t.object("BidPayload", {
	amount: t.f32(),
	target_character: t.string()
});
const AuctionSoldPayload = t.object("AuctionSoldPayload", {
	character_name: t.string(),
	winning_amount: t.f32(),
	winning_team: TeamLabel,
	eidolon: t.u8()
});
const NominatePayload = t.object("NominatePayload", {
	character_name: t.string(),
	eidolon: t.u8()
});
const UndoPayload = t.object("UndoPayload", { original_sequence_id: t.u32() });
const PausePayload = t.object("PausePayload", {
	time_remaining_ms: t.u32(),
	is_auto_pause: t.bool()
});
const StepPayload = t.enum("StepPayload", {
	Pick: PickPayload,
	Ban: BanPayload,
	Bid: BidPayload,
	AuctionSold: AuctionSoldPayload,
	Nominate: NominatePayload,
	Undo: UndoPayload,
	Pause: PausePayload
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrCharacterCost.ts
const HsrCharacterCost = table({
	name: "hsr_character_cost",
	public: true,
	primaryKey: ["characterName", "gameMode"]
}, {
	characterName: t.string(),
	gameMode: GameMode,
	classicCosts: EidolonCost,
	auctionBaseBid: EidolonCost
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrLightconeCost.ts
const HsrLightconeCost = table({
	name: "hsr_lightcone_cost",
	public: true
}, {
	lightconeName: t.string().primaryKey(),
	classicCosts: SuperimpositionCost,
	auctionBaseBid: SuperimpositionCost
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrSynergyCost.ts
const HsrSynergyCost = table({
	name: "hsr_synergy_cost",
	public: true,
	indexes: [{
		name: "synergy_source_mode",
		algorithm: "btree",
		columns: ["sourceName", "gameMode"]
	}, {
		name: "synergy_target",
		algorithm: "btree",
		columns: ["targetName"]
	}]
}, {
	id: t.u32().primaryKey().autoInc(),
	sourceName: t.string(),
	targetName: t.string(),
	gameMode: GameMode,
	costModifier: t.f32()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/lobby.ts
const Lobby = table({
	name: "lobby",
	public: true,
	indexes: [{
		name: "lobby_join_code",
		algorithm: "btree",
		columns: ["joinCode"],
		unique: true
	}, {
		name: "lobby_host",
		algorithm: "btree",
		columns: ["hostIdentity"]
	}]
}, {
	id: t.u32().primaryKey().autoInc(),
	joinCode: t.string(),
	hostIdentity: t.identity(),
	teamBlueAlias: t.string(),
	teamRedAlias: t.string(),
	hostDisconnectTime: t.timestamp().optional(),
	lastActivityAt: t.timestamp(),
	stage: LobbyStage,
	config: LobbyConfig
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/lobbyMember.ts
const LobbyMember = table({
	name: "lobby_member",
	public: true,
	primaryKey: ["lobbyId", "userIdentity"],
	indexes: [{
		name: "lobby_member_lobby_id",
		algorithm: "btree",
		columns: ["lobbyId"]
	}]
}, {
	lobbyId: t.u32(),
	userIdentity: t.identity(),
	isOnline: t.bool(),
	participationRole: ParticipationRole,
	isReferee: t.bool(),
	teamSlot: TeamLabel
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/lobbyCursorEvent.ts
const LobbyCursorEvent = table({
	name: "lobby_cursor_event",
	public: true,
	event: true
}, {
	lobbyId: t.u32(),
	sender: t.identity(),
	x: t.f32(),
	y: t.f32(),
	timestamp: t.timestamp()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSession.ts
const MatchSession = table({
	name: "match_session",
	public: true
}, {
	lobbyId: t.u32().primaryKey(),
	turnIndex: t.u32(),
	draftSequence: t.array(DraftStep),
	timerState: TimerState,
	teamBlueBudget: t.f32(),
	teamRedBudget: t.f32()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSessionStep.ts
const MatchSessionStep = table({
	name: "match_session_step",
	public: true,
	indexes: [{
		name: "match_history_lobby",
		algorithm: "btree",
		columns: ["lobbyId"]
	}]
}, {
	id: t.u32().primaryKey().autoInc(),
	lobbyId: t.u32(),
	sequence: t.u32(),
	actor: t.identity(),
	actorSlot: TeamLabel,
	action: ActionType,
	payload: StepPayload,
	timestamp: t.timestamp()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSessionHistory.ts
const MatchSessionHistory = table({
	name: "match_session_history",
	public: true,
	indexes: [{
		name: "history_played_at",
		algorithm: "btree",
		columns: ["playedAt"]
	}, {
		name: "history_game_mode",
		algorithm: "btree",
		columns: ["gameMode"]
	}]
}, {
	id: t.string().primaryKey(),
	lobbyCode: t.string(),
	playedAt: t.timestamp(),
	draftMode: DraftMode,
	gameMode: GameMode,
	teamBlueAlias: t.string(),
	teamRedAlias: t.string(),
	blueTeamMembers: t.array(PlayerSnapshot),
	redTeamMembers: t.array(PlayerSnapshot),
	snapshotConfig: LobbyConfig,
	result: MatchResult,
	rosterBlue: t.string(),
	rosterRed: t.string()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSessionStepHistory.ts
const MatchSessionStepHistory = table({
	name: "match_session_step_history",
	public: true
}, {
	matchId: t.string().primaryKey(),
	steps: t.string()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/schema.ts
const spacetimedb = schema({
	User,
	HsrCharacter,
	HsrLightcone,
	HsrCharacterCost,
	HsrLightconeCost,
	HsrSynergyCost,
	Lobby,
	LobbyMember,
	LobbyCursorEvent,
	MatchSession,
	MatchSessionStep,
	MatchSessionHistory,
	MatchSessionStepHistory
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/reducers/auth.ts
const DEFAULT_AVATAR = "match7th";
const register_guest = spacetimedb.reducer({ displayName: t.string() }, (ctx, { displayName }) => {
	const existingUser = ctx.db.User.identity.find(ctx.sender);
	if (existingUser) {
		ctx.db.User.identity.update({
			...existingUser,
			displayName,
			lastLoginAt: ctx.timestamp
		});
		return;
	}
	ctx.db.User.insert({
		identity: ctx.sender,
		username: `guest_${ctx.sender.toHexString().substring(0, 24)}`,
		displayName,
		isGuest: true,
		lastLoginAt: ctx.timestamp,
		role: { tag: "User" },
		discordId: void 0,
		avatarCharacterName: DEFAULT_AVATAR
	});
});
const register_discord_user = spacetimedb.reducer({
	discordId: t.string(),
	username: t.string(),
	displayName: t.string()
}, (ctx, { discordId, username, displayName }) => {
	const existingUser = ctx.db.User.identity.find(ctx.sender);
	if (!existingUser || existingUser.discordId !== discordId) {
		if (Array.from(ctx.db.User.iter()).some((user) => user.discordId === discordId)) throw new Error("This Discord ID is already registered to another user.");
	}
	if (existingUser) {
		ctx.db.User.identity.update({
			...existingUser,
			username,
			displayName,
			discordId,
			lastLoginAt: ctx.timestamp,
			isGuest: false
		});
		return;
	}
	ctx.db.User.insert({
		identity: ctx.sender,
		username,
		displayName,
		isGuest: false,
		lastLoginAt: ctx.timestamp,
		role: { tag: "User" },
		discordId,
		avatarCharacterName: DEFAULT_AVATAR
	});
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/reducers/cursor.ts
const broadcast_cursor = spacetimedb.reducer({
	lobbyId: t.u32(),
	x: t.f32(),
	y: t.f32()
}, (ctx, { lobbyId, x, y }) => {
	if (!ctx.db.LobbyMember.primaryKey.find({
		lobbyId,
		userIdentity: ctx.sender
	})) return;
	ctx.db.LobbyCursorEvent.insert({
		lobbyId,
		sender: ctx.sender,
		x,
		y,
		timestamp: ctx.timestamp
	});
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/index.ts
spacetimedb.clientConnected((ctx) => {
	console.log(`Client connected: ${ctx.sender.toHexString()}`);
});
spacetimedb.clientDisconnected((ctx) => {
	console.log(`Client disconnected: ${ctx.sender.toHexString()}`);
});
var src_default = spacetimedb;

//#endregion
export { broadcast_cursor, src_default as default, register_discord_user, register_guest };
//# debugId=4000b234-1978-40fc-828f-ef59a818f9f2
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibmFtZXMiOlsiX19jcmVhdGUiLCJfX2RlZlByb3AiLCJfX2dldE93blByb3BEZXNjIiwiX19nZXRPd25Qcm9wTmFtZXMiLCJfX2dldFByb3RvT2YiLCJfX2hhc093blByb3AiLCJfX2NvbW1vbkpTIiwiX19jb3B5UHJvcHMiLCJfX3RvRVNNIiwiI2Vuc3VyZSIsIiNtb2R1bGVEZWYiLCIjcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSIsIiNjb21wb3VuZFR5cGVzIiwiI2Zyb20iLCIjdG8iLCIjdXVpZENvdW50ZXIiLCIjc2VuZGVyQXV0aCIsIiNpZGVudGl0eSIsIiNyYW5kb20iLCIjc2NoZW1hIiwiI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVycyIsIiNkYlZpZXciLCIjZGJWaWV3XyIsIiNyZWR1Y2VyQ3R4IiwiI3JlZHVjZXJDdHhfIiwiI2ZpbmFsaXphdGlvblJlZ2lzdHJ5IiwiI2lkIiwiI2RldGFjaCIsIiNib2R5IiwiI2lubmVyIiwiI2N0eCJdLCJzb3VyY2VzIjpbIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvbm9kZV9tb2R1bGVzLy5wbnBtL2hlYWRlcnMtcG9seWZpbGxANC4wLjMvbm9kZV9tb2R1bGVzL2hlYWRlcnMtcG9seWZpbGwvbGliL2luZGV4Lm1qcyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvbm9kZV9tb2R1bGVzLy5wbnBtL3NwYWNldGltZWRiQDIuMC4zL25vZGVfbW9kdWxlcy9zcGFjZXRpbWVkYi9kaXN0L3NlcnZlci9pbmRleC5tanMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90eXBlcy9lbnVtcy50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy91c2VyLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL2hzckNoYXJhY3Rlci50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9oc3JMaWdodGNvbmUudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90eXBlcy9zdHJ1Y3RzLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL2hzckNoYXJhY3RlckNvc3QudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90YWJsZXMvaHNyTGlnaHRjb25lQ29zdC50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9oc3JTeW5lcmd5Q29zdC50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieS50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieU1lbWJlci50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieUN1cnNvckV2ZW50LnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL21hdGNoU2Vzc2lvbi50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9tYXRjaFNlc3Npb25TdGVwLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL21hdGNoU2Vzc2lvbkhpc3RvcnkudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90YWJsZXMvbWF0Y2hTZXNzaW9uU3RlcEhpc3RvcnkudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9zY2hlbWEudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9yZWR1Y2Vycy9hdXRoLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvcmVkdWNlcnMvY3Vyc29yLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIF9fY3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcbnZhciBfX2RlZlByb3AgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG52YXIgX19nZXRPd25Qcm9wRGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG52YXIgX19nZXRPd25Qcm9wTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcbnZhciBfX2dldFByb3RvT2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG52YXIgX19oYXNPd25Qcm9wID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBfX2NvbW1vbkpTID0gKGNiLCBtb2QpID0+IGZ1bmN0aW9uIF9fcmVxdWlyZSgpIHtcbiAgcmV0dXJuIG1vZCB8fCAoMCwgY2JbX19nZXRPd25Qcm9wTmFtZXMoY2IpWzBdXSkoKG1vZCA9IHsgZXhwb3J0czoge30gfSkuZXhwb3J0cywgbW9kKSwgbW9kLmV4cG9ydHM7XG59O1xudmFyIF9fY29weVByb3BzID0gKHRvLCBmcm9tLCBleGNlcHQsIGRlc2MpID0+IHtcbiAgaWYgKGZyb20gJiYgdHlwZW9mIGZyb20gPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGZyb20gPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGZvciAobGV0IGtleSBvZiBfX2dldE93blByb3BOYW1lcyhmcm9tKSlcbiAgICAgIGlmICghX19oYXNPd25Qcm9wLmNhbGwodG8sIGtleSkgJiYga2V5ICE9PSBleGNlcHQpXG4gICAgICAgIF9fZGVmUHJvcCh0bywga2V5LCB7IGdldDogKCkgPT4gZnJvbVtrZXldLCBlbnVtZXJhYmxlOiAhKGRlc2MgPSBfX2dldE93blByb3BEZXNjKGZyb20sIGtleSkpIHx8IGRlc2MuZW51bWVyYWJsZSB9KTtcbiAgfVxuICByZXR1cm4gdG87XG59O1xudmFyIF9fdG9FU00gPSAobW9kLCBpc05vZGVNb2RlLCB0YXJnZXQpID0+ICh0YXJnZXQgPSBtb2QgIT0gbnVsbCA/IF9fY3JlYXRlKF9fZ2V0UHJvdG9PZihtb2QpKSA6IHt9LCBfX2NvcHlQcm9wcyhcbiAgLy8gSWYgdGhlIGltcG9ydGVyIGlzIGluIG5vZGUgY29tcGF0aWJpbGl0eSBtb2RlIG9yIHRoaXMgaXMgbm90IGFuIEVTTVxuICAvLyBmaWxlIHRoYXQgaGFzIGJlZW4gY29udmVydGVkIHRvIGEgQ29tbW9uSlMgZmlsZSB1c2luZyBhIEJhYmVsLVxuICAvLyBjb21wYXRpYmxlIHRyYW5zZm9ybSAoaS5lLiBcIl9fZXNNb2R1bGVcIiBoYXMgbm90IGJlZW4gc2V0KSwgdGhlbiBzZXRcbiAgLy8gXCJkZWZhdWx0XCIgdG8gdGhlIENvbW1vbkpTIFwibW9kdWxlLmV4cG9ydHNcIiBmb3Igbm9kZSBjb21wYXRpYmlsaXR5LlxuICBpc05vZGVNb2RlIHx8ICFtb2QgfHwgIW1vZC5fX2VzTW9kdWxlID8gX19kZWZQcm9wKHRhcmdldCwgXCJkZWZhdWx0XCIsIHsgdmFsdWU6IG1vZCwgZW51bWVyYWJsZTogdHJ1ZSB9KSA6IHRhcmdldCxcbiAgbW9kXG4pKTtcblxuLy8gbm9kZV9tb2R1bGVzL3NldC1jb29raWUtcGFyc2VyL2xpYi9zZXQtY29va2llLmpzXG52YXIgcmVxdWlyZV9zZXRfY29va2llID0gX19jb21tb25KUyh7XG4gIFwibm9kZV9tb2R1bGVzL3NldC1jb29raWUtcGFyc2VyL2xpYi9zZXQtY29va2llLmpzXCIoZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGRlZmF1bHRQYXJzZU9wdGlvbnMgPSB7XG4gICAgICBkZWNvZGVWYWx1ZXM6IHRydWUsXG4gICAgICBtYXA6IGZhbHNlLFxuICAgICAgc2lsZW50OiBmYWxzZVxuICAgIH07XG4gICAgZnVuY3Rpb24gaXNOb25FbXB0eVN0cmluZyhzdHIpIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygc3RyID09PSBcInN0cmluZ1wiICYmICEhc3RyLnRyaW0oKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcGFyc2VTdHJpbmcoc2V0Q29va2llVmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBwYXJ0cyA9IHNldENvb2tpZVZhbHVlLnNwbGl0KFwiO1wiKS5maWx0ZXIoaXNOb25FbXB0eVN0cmluZyk7XG4gICAgICB2YXIgbmFtZVZhbHVlUGFpclN0ciA9IHBhcnRzLnNoaWZ0KCk7XG4gICAgICB2YXIgcGFyc2VkID0gcGFyc2VOYW1lVmFsdWVQYWlyKG5hbWVWYWx1ZVBhaXJTdHIpO1xuICAgICAgdmFyIG5hbWUgPSBwYXJzZWQubmFtZTtcbiAgICAgIHZhciB2YWx1ZSA9IHBhcnNlZC52YWx1ZTtcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdFBhcnNlT3B0aW9ucywgb3B0aW9ucykgOiBkZWZhdWx0UGFyc2VPcHRpb25zO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFsdWUgPSBvcHRpb25zLmRlY29kZVZhbHVlcyA/IGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICBcInNldC1jb29raWUtcGFyc2VyIGVuY291bnRlcmVkIGFuIGVycm9yIHdoaWxlIGRlY29kaW5nIGEgY29va2llIHdpdGggdmFsdWUgJ1wiICsgdmFsdWUgKyBcIicuIFNldCBvcHRpb25zLmRlY29kZVZhbHVlcyB0byBmYWxzZSB0byBkaXNhYmxlIHRoaXMgZmVhdHVyZS5cIixcbiAgICAgICAgICBlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICB2YXIgY29va2llID0ge1xuICAgICAgICBuYW1lLFxuICAgICAgICB2YWx1ZVxuICAgICAgfTtcbiAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCkge1xuICAgICAgICB2YXIgc2lkZXMgPSBwYXJ0LnNwbGl0KFwiPVwiKTtcbiAgICAgICAgdmFyIGtleSA9IHNpZGVzLnNoaWZ0KCkudHJpbUxlZnQoKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB2YXIgdmFsdWUyID0gc2lkZXMuam9pbihcIj1cIik7XG4gICAgICAgIGlmIChrZXkgPT09IFwiZXhwaXJlc1wiKSB7XG4gICAgICAgICAgY29va2llLmV4cGlyZXMgPSBuZXcgRGF0ZSh2YWx1ZTIpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJtYXgtYWdlXCIpIHtcbiAgICAgICAgICBjb29raWUubWF4QWdlID0gcGFyc2VJbnQodmFsdWUyLCAxMCk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcInNlY3VyZVwiKSB7XG4gICAgICAgICAgY29va2llLnNlY3VyZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcImh0dHBvbmx5XCIpIHtcbiAgICAgICAgICBjb29raWUuaHR0cE9ubHkgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzYW1lc2l0ZVwiKSB7XG4gICAgICAgICAgY29va2llLnNhbWVTaXRlID0gdmFsdWUyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvb2tpZVtrZXldID0gdmFsdWUyO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBjb29raWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBhcnNlTmFtZVZhbHVlUGFpcihuYW1lVmFsdWVQYWlyU3RyKSB7XG4gICAgICB2YXIgbmFtZSA9IFwiXCI7XG4gICAgICB2YXIgdmFsdWUgPSBcIlwiO1xuICAgICAgdmFyIG5hbWVWYWx1ZUFyciA9IG5hbWVWYWx1ZVBhaXJTdHIuc3BsaXQoXCI9XCIpO1xuICAgICAgaWYgKG5hbWVWYWx1ZUFyci5sZW5ndGggPiAxKSB7XG4gICAgICAgIG5hbWUgPSBuYW1lVmFsdWVBcnIuc2hpZnQoKTtcbiAgICAgICAgdmFsdWUgPSBuYW1lVmFsdWVBcnIuam9pbihcIj1cIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IG5hbWVWYWx1ZVBhaXJTdHI7XG4gICAgICB9XG4gICAgICByZXR1cm4geyBuYW1lLCB2YWx1ZSB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBwYXJzZShpbnB1dCwgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UGFyc2VPcHRpb25zLCBvcHRpb25zKSA6IGRlZmF1bHRQYXJzZU9wdGlvbnM7XG4gICAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgIGlmICghb3B0aW9ucy5tYXApIHtcbiAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaW5wdXQuaGVhZGVycykge1xuICAgICAgICBpZiAodHlwZW9mIGlucHV0LmhlYWRlcnMuZ2V0U2V0Q29va2llID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBpbnB1dCA9IGlucHV0LmhlYWRlcnMuZ2V0U2V0Q29va2llKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5wdXQuaGVhZGVyc1tcInNldC1jb29raWVcIl0pIHtcbiAgICAgICAgICBpbnB1dCA9IGlucHV0LmhlYWRlcnNbXCJzZXQtY29va2llXCJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBzY2ggPSBpbnB1dC5oZWFkZXJzW09iamVjdC5rZXlzKGlucHV0LmhlYWRlcnMpLmZpbmQoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKCkgPT09IFwic2V0LWNvb2tpZVwiO1xuICAgICAgICAgIH0pXTtcbiAgICAgICAgICBpZiAoIXNjaCAmJiBpbnB1dC5oZWFkZXJzLmNvb2tpZSAmJiAhb3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAgICAgXCJXYXJuaW5nOiBzZXQtY29va2llLXBhcnNlciBhcHBlYXJzIHRvIGhhdmUgYmVlbiBjYWxsZWQgb24gYSByZXF1ZXN0IG9iamVjdC4gSXQgaXMgZGVzaWduZWQgdG8gcGFyc2UgU2V0LUNvb2tpZSBoZWFkZXJzIGZyb20gcmVzcG9uc2VzLCBub3QgQ29va2llIGhlYWRlcnMgZnJvbSByZXF1ZXN0cy4gU2V0IHRoZSBvcHRpb24ge3NpbGVudDogdHJ1ZX0gdG8gc3VwcHJlc3MgdGhpcyB3YXJuaW5nLlwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbnB1dCA9IHNjaDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0KSkge1xuICAgICAgICBpbnB1dCA9IFtpbnB1dF07XG4gICAgICB9XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyA/IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQYXJzZU9wdGlvbnMsIG9wdGlvbnMpIDogZGVmYXVsdFBhcnNlT3B0aW9ucztcbiAgICAgIGlmICghb3B0aW9ucy5tYXApIHtcbiAgICAgICAgcmV0dXJuIGlucHV0LmZpbHRlcihpc05vbkVtcHR5U3RyaW5nKS5tYXAoZnVuY3Rpb24oc3RyKSB7XG4gICAgICAgICAgcmV0dXJuIHBhcnNlU3RyaW5nKHN0ciwgb3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGNvb2tpZXMgPSB7fTtcbiAgICAgICAgcmV0dXJuIGlucHV0LmZpbHRlcihpc05vbkVtcHR5U3RyaW5nKS5yZWR1Y2UoZnVuY3Rpb24oY29va2llczIsIHN0cikge1xuICAgICAgICAgIHZhciBjb29raWUgPSBwYXJzZVN0cmluZyhzdHIsIG9wdGlvbnMpO1xuICAgICAgICAgIGNvb2tpZXMyW2Nvb2tpZS5uYW1lXSA9IGNvb2tpZTtcbiAgICAgICAgICByZXR1cm4gY29va2llczI7XG4gICAgICAgIH0sIGNvb2tpZXMpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzcGxpdENvb2tpZXNTdHJpbmcyKGNvb2tpZXNTdHJpbmcpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvb2tpZXNTdHJpbmcpKSB7XG4gICAgICAgIHJldHVybiBjb29raWVzU3RyaW5nO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBjb29raWVzU3RyaW5nICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICAgIHZhciBjb29raWVzU3RyaW5ncyA9IFtdO1xuICAgICAgdmFyIHBvcyA9IDA7XG4gICAgICB2YXIgc3RhcnQ7XG4gICAgICB2YXIgY2g7XG4gICAgICB2YXIgbGFzdENvbW1hO1xuICAgICAgdmFyIG5leHRTdGFydDtcbiAgICAgIHZhciBjb29raWVzU2VwYXJhdG9yRm91bmQ7XG4gICAgICBmdW5jdGlvbiBza2lwV2hpdGVzcGFjZSgpIHtcbiAgICAgICAgd2hpbGUgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoICYmIC9cXHMvLnRlc3QoY29va2llc1N0cmluZy5jaGFyQXQocG9zKSkpIHtcbiAgICAgICAgICBwb3MgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9zIDwgY29va2llc1N0cmluZy5sZW5ndGg7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBub3RTcGVjaWFsQ2hhcigpIHtcbiAgICAgICAgY2ggPSBjb29raWVzU3RyaW5nLmNoYXJBdChwb3MpO1xuICAgICAgICByZXR1cm4gY2ggIT09IFwiPVwiICYmIGNoICE9PSBcIjtcIiAmJiBjaCAhPT0gXCIsXCI7XG4gICAgICB9XG4gICAgICB3aGlsZSAocG9zIDwgY29va2llc1N0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgc3RhcnQgPSBwb3M7XG4gICAgICAgIGNvb2tpZXNTZXBhcmF0b3JGb3VuZCA9IGZhbHNlO1xuICAgICAgICB3aGlsZSAoc2tpcFdoaXRlc3BhY2UoKSkge1xuICAgICAgICAgIGNoID0gY29va2llc1N0cmluZy5jaGFyQXQocG9zKTtcbiAgICAgICAgICBpZiAoY2ggPT09IFwiLFwiKSB7XG4gICAgICAgICAgICBsYXN0Q29tbWEgPSBwb3M7XG4gICAgICAgICAgICBwb3MgKz0gMTtcbiAgICAgICAgICAgIHNraXBXaGl0ZXNwYWNlKCk7XG4gICAgICAgICAgICBuZXh0U3RhcnQgPSBwb3M7XG4gICAgICAgICAgICB3aGlsZSAocG9zIDwgY29va2llc1N0cmluZy5sZW5ndGggJiYgbm90U3BlY2lhbENoYXIoKSkge1xuICAgICAgICAgICAgICBwb3MgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCAmJiBjb29raWVzU3RyaW5nLmNoYXJBdChwb3MpID09PSBcIj1cIikge1xuICAgICAgICAgICAgICBjb29raWVzU2VwYXJhdG9yRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICBwb3MgPSBuZXh0U3RhcnQ7XG4gICAgICAgICAgICAgIGNvb2tpZXNTdHJpbmdzLnB1c2goY29va2llc1N0cmluZy5zdWJzdHJpbmcoc3RhcnQsIGxhc3RDb21tYSkpO1xuICAgICAgICAgICAgICBzdGFydCA9IHBvcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBvcyA9IGxhc3RDb21tYSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvcyArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvb2tpZXNTZXBhcmF0b3JGb3VuZCB8fCBwb3MgPj0gY29va2llc1N0cmluZy5sZW5ndGgpIHtcbiAgICAgICAgICBjb29raWVzU3RyaW5ncy5wdXNoKGNvb2tpZXNTdHJpbmcuc3Vic3RyaW5nKHN0YXJ0LCBjb29raWVzU3RyaW5nLmxlbmd0aCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gY29va2llc1N0cmluZ3M7XG4gICAgfVxuICAgIG1vZHVsZS5leHBvcnRzID0gcGFyc2U7XG4gICAgbW9kdWxlLmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbiAgICBtb2R1bGUuZXhwb3J0cy5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuICAgIG1vZHVsZS5leHBvcnRzLnNwbGl0Q29va2llc1N0cmluZyA9IHNwbGl0Q29va2llc1N0cmluZzI7XG4gIH1cbn0pO1xuXG4vLyBzcmMvSGVhZGVycy50c1xudmFyIGltcG9ydF9zZXRfY29va2llX3BhcnNlciA9IF9fdG9FU00ocmVxdWlyZV9zZXRfY29va2llKCkpO1xuXG4vLyBzcmMvdXRpbHMvbm9ybWFsaXplSGVhZGVyTmFtZS50c1xudmFyIEhFQURFUlNfSU5WQUxJRF9DSEFSQUNURVJTID0gL1teYS16MC05XFwtIyQlJicqKy5eX2B8fl0vaTtcbmZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSkge1xuICBpZiAoSEVBREVSU19JTlZBTElEX0NIQVJBQ1RFUlMudGVzdChuYW1lKSB8fCBuYW1lLnRyaW0oKSA9PT0gXCJcIikge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZVwiKTtcbiAgfVxuICByZXR1cm4gbmFtZS50cmltKCkudG9Mb3dlckNhc2UoKTtcbn1cblxuLy8gc3JjL3V0aWxzL25vcm1hbGl6ZUhlYWRlclZhbHVlLnRzXG52YXIgY2hhckNvZGVzVG9SZW1vdmUgPSBbXG4gIFN0cmluZy5mcm9tQ2hhckNvZGUoMTApLFxuICBTdHJpbmcuZnJvbUNoYXJDb2RlKDEzKSxcbiAgU3RyaW5nLmZyb21DaGFyQ29kZSg5KSxcbiAgU3RyaW5nLmZyb21DaGFyQ29kZSgzMilcbl07XG52YXIgSEVBREVSX1ZBTFVFX1JFTU9WRV9SRUdFWFAgPSBuZXcgUmVnRXhwKFxuICBgKF5bJHtjaGFyQ29kZXNUb1JlbW92ZS5qb2luKFwiXCIpfV18JFske2NoYXJDb2Rlc1RvUmVtb3ZlLmpvaW4oXCJcIil9XSlgLFxuICBcImdcIlxuKTtcbmZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlclZhbHVlKHZhbHVlKSB7XG4gIGNvbnN0IG5leHRWYWx1ZSA9IHZhbHVlLnJlcGxhY2UoSEVBREVSX1ZBTFVFX1JFTU9WRV9SRUdFWFAsIFwiXCIpO1xuICByZXR1cm4gbmV4dFZhbHVlO1xufVxuXG4vLyBzcmMvdXRpbHMvaXNWYWxpZEhlYWRlck5hbWUudHNcbmZ1bmN0aW9uIGlzVmFsaWRIZWFkZXJOYW1lKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwic3RyaW5nXCIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY2hhcmFjdGVyID0gdmFsdWUuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoY2hhcmFjdGVyID4gMTI3IHx8ICFpc1Rva2VuKGNoYXJhY3RlcikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBpc1Rva2VuKHZhbHVlKSB7XG4gIHJldHVybiAhW1xuICAgIDEyNyxcbiAgICAzMixcbiAgICBcIihcIixcbiAgICBcIilcIixcbiAgICBcIjxcIixcbiAgICBcIj5cIixcbiAgICBcIkBcIixcbiAgICBcIixcIixcbiAgICBcIjtcIixcbiAgICBcIjpcIixcbiAgICBcIlxcXFxcIixcbiAgICAnXCInLFxuICAgIFwiL1wiLFxuICAgIFwiW1wiLFxuICAgIFwiXVwiLFxuICAgIFwiP1wiLFxuICAgIFwiPVwiLFxuICAgIFwie1wiLFxuICAgIFwifVwiXG4gIF0uaW5jbHVkZXModmFsdWUpO1xufVxuXG4vLyBzcmMvdXRpbHMvaXNWYWxpZEhlYWRlclZhbHVlLnRzXG5mdW5jdGlvbiBpc1ZhbGlkSGVhZGVyVmFsdWUodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAodmFsdWUudHJpbSgpICE9PSB2YWx1ZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY2hhcmFjdGVyID0gdmFsdWUuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoXG4gICAgICAvLyBOVUwuXG4gICAgICBjaGFyYWN0ZXIgPT09IDAgfHwgLy8gSFRUUCBuZXdsaW5lIGJ5dGVzLlxuICAgICAgY2hhcmFjdGVyID09PSAxMCB8fCBjaGFyYWN0ZXIgPT09IDEzXG4gICAgKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vLyBzcmMvSGVhZGVycy50c1xudmFyIE5PUk1BTElaRURfSEVBREVSUyA9IFN5bWJvbChcIm5vcm1hbGl6ZWRIZWFkZXJzXCIpO1xudmFyIFJBV19IRUFERVJfTkFNRVMgPSBTeW1ib2woXCJyYXdIZWFkZXJOYW1lc1wiKTtcbnZhciBIRUFERVJfVkFMVUVfREVMSU1JVEVSID0gXCIsIFwiO1xudmFyIF9hLCBfYiwgX2M7XG52YXIgSGVhZGVycyA9IGNsYXNzIF9IZWFkZXJzIHtcbiAgY29uc3RydWN0b3IoaW5pdCkge1xuICAgIC8vIE5vcm1hbGl6ZWQgaGVhZGVyIHtcIm5hbWVcIjpcImEsIGJcIn0gc3RvcmFnZS5cbiAgICB0aGlzW19hXSA9IHt9O1xuICAgIC8vIEtlZXBzIHRoZSBtYXBwaW5nIGJldHdlZW4gdGhlIHJhdyBoZWFkZXIgbmFtZVxuICAgIC8vIGFuZCB0aGUgbm9ybWFsaXplZCBoZWFkZXIgbmFtZSB0byBlYXNlIHRoZSBsb29rdXAuXG4gICAgdGhpc1tfYl0gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHRoaXNbX2NdID0gXCJIZWFkZXJzXCI7XG4gICAgaWYgKFtcIkhlYWRlcnNcIiwgXCJIZWFkZXJzUG9seWZpbGxcIl0uaW5jbHVkZXMoaW5pdD8uY29uc3RydWN0b3IubmFtZSkgfHwgaW5pdCBpbnN0YW5jZW9mIF9IZWFkZXJzIHx8IHR5cGVvZiBnbG9iYWxUaGlzLkhlYWRlcnMgIT09IFwidW5kZWZpbmVkXCIgJiYgaW5pdCBpbnN0YW5jZW9mIGdsb2JhbFRoaXMuSGVhZGVycykge1xuICAgICAgY29uc3QgaW5pdGlhbEhlYWRlcnMgPSBpbml0O1xuICAgICAgaW5pdGlhbEhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIG5hbWUpID0+IHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGluaXQpKSB7XG4gICAgICBpbml0LmZvckVhY2goKFtuYW1lLCB2YWx1ZV0pID0+IHtcbiAgICAgICAgdGhpcy5hcHBlbmQoXG4gICAgICAgICAgbmFtZSxcbiAgICAgICAgICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLmpvaW4oSEVBREVSX1ZBTFVFX0RFTElNSVRFUikgOiB2YWx1ZVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChpbml0KSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhpbml0KS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaW5pdFtuYW1lXTtcbiAgICAgICAgdGhpcy5hcHBlbmQoXG4gICAgICAgICAgbmFtZSxcbiAgICAgICAgICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLmpvaW4oSEVBREVSX1ZBTFVFX0RFTElNSVRFUikgOiB2YWx1ZVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIFsoX2EgPSBOT1JNQUxJWkVEX0hFQURFUlMsIF9iID0gUkFXX0hFQURFUl9OQU1FUywgX2MgPSBTeW1ib2wudG9TdHJpbmdUYWcsIFN5bWJvbC5pdGVyYXRvcildKCkge1xuICAgIHJldHVybiB0aGlzLmVudHJpZXMoKTtcbiAgfVxuICAqa2V5cygpIHtcbiAgICBmb3IgKGNvbnN0IFtuYW1lXSBvZiB0aGlzLmVudHJpZXMoKSkge1xuICAgICAgeWllbGQgbmFtZTtcbiAgICB9XG4gIH1cbiAgKnZhbHVlcygpIHtcbiAgICBmb3IgKGNvbnN0IFssIHZhbHVlXSBvZiB0aGlzLmVudHJpZXMoKSkge1xuICAgICAgeWllbGQgdmFsdWU7XG4gICAgfVxuICB9XG4gICplbnRyaWVzKCkge1xuICAgIGxldCBzb3J0ZWRLZXlzID0gT2JqZWN0LmtleXModGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdKS5zb3J0KFxuICAgICAgKGEsIGIpID0+IGEubG9jYWxlQ29tcGFyZShiKVxuICAgICk7XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHNvcnRlZEtleXMpIHtcbiAgICAgIGlmIChuYW1lID09PSBcInNldC1jb29raWVcIikge1xuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHRoaXMuZ2V0U2V0Q29va2llKCkpIHtcbiAgICAgICAgICB5aWVsZCBbbmFtZSwgdmFsdWVdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB5aWVsZCBbbmFtZSwgdGhpcy5nZXQobmFtZSldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gc3RhdGluZyB3aGV0aGVyIGEgYEhlYWRlcnNgIG9iamVjdCBjb250YWlucyBhIGNlcnRhaW4gaGVhZGVyLlxuICAgKi9cbiAgaGFzKG5hbWUpIHtcbiAgICBpZiAoIWlzVmFsaWRIZWFkZXJOYW1lKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGhlYWRlciBuYW1lIFwiJHtuYW1lfVwiYCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzW05PUk1BTElaRURfSEVBREVSU10uaGFzT3duUHJvcGVydHkobm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKSk7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBgQnl0ZVN0cmluZ2Agc2VxdWVuY2Ugb2YgYWxsIHRoZSB2YWx1ZXMgb2YgYSBoZWFkZXIgd2l0aCBhIGdpdmVuIG5hbWUuXG4gICAqL1xuICBnZXQobmFtZSkge1xuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcihgSW52YWxpZCBoZWFkZXIgbmFtZSBcIiR7bmFtZX1cImApO1xuICAgIH1cbiAgICByZXR1cm4gdGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdW25vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSldID8/IG51bGw7XG4gIH1cbiAgLyoqXG4gICAqIFNldHMgYSBuZXcgdmFsdWUgZm9yIGFuIGV4aXN0aW5nIGhlYWRlciBpbnNpZGUgYSBgSGVhZGVyc2Agb2JqZWN0LCBvciBhZGRzIHRoZSBoZWFkZXIgaWYgaXQgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cbiAgICovXG4gIHNldChuYW1lLCB2YWx1ZSkge1xuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkgfHwgIWlzVmFsaWRIZWFkZXJWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpO1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRWYWx1ZSA9IG5vcm1hbGl6ZUhlYWRlclZhbHVlKHZhbHVlKTtcbiAgICB0aGlzW05PUk1BTElaRURfSEVBREVSU11bbm9ybWFsaXplZE5hbWVdID0gbm9ybWFsaXplSGVhZGVyVmFsdWUobm9ybWFsaXplZFZhbHVlKTtcbiAgICB0aGlzW1JBV19IRUFERVJfTkFNRVNdLnNldChub3JtYWxpemVkTmFtZSwgbmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIEFwcGVuZHMgYSBuZXcgdmFsdWUgb250byBhbiBleGlzdGluZyBoZWFkZXIgaW5zaWRlIGEgYEhlYWRlcnNgIG9iamVjdCwgb3IgYWRkcyB0aGUgaGVhZGVyIGlmIGl0IGRvZXMgbm90IGFscmVhZHkgZXhpc3QuXG4gICAqL1xuICBhcHBlbmQobmFtZSwgdmFsdWUpIHtcbiAgICBpZiAoIWlzVmFsaWRIZWFkZXJOYW1lKG5hbWUpIHx8ICFpc1ZhbGlkSGVhZGVyVmFsdWUodmFsdWUpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5vcm1hbGl6ZWROYW1lID0gbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKTtcbiAgICBjb25zdCBub3JtYWxpemVkVmFsdWUgPSBub3JtYWxpemVIZWFkZXJWYWx1ZSh2YWx1ZSk7XG4gICAgbGV0IHJlc29sdmVkVmFsdWUgPSB0aGlzLmhhcyhub3JtYWxpemVkTmFtZSkgPyBgJHt0aGlzLmdldChub3JtYWxpemVkTmFtZSl9LCAke25vcm1hbGl6ZWRWYWx1ZX1gIDogbm9ybWFsaXplZFZhbHVlO1xuICAgIHRoaXMuc2V0KG5hbWUsIHJlc29sdmVkVmFsdWUpO1xuICB9XG4gIC8qKlxuICAgKiBEZWxldGVzIGEgaGVhZGVyIGZyb20gdGhlIGBIZWFkZXJzYCBvYmplY3QuXG4gICAqL1xuICBkZWxldGUobmFtZSkge1xuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmhhcyhuYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IG5vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSk7XG4gICAgZGVsZXRlIHRoaXNbTk9STUFMSVpFRF9IRUFERVJTXVtub3JtYWxpemVkTmFtZV07XG4gICAgdGhpc1tSQVdfSEVBREVSX05BTUVTXS5kZWxldGUobm9ybWFsaXplZE5hbWUpO1xuICB9XG4gIC8qKlxuICAgKiBUcmF2ZXJzZXMgdGhlIGBIZWFkZXJzYCBvYmplY3QsXG4gICAqIGNhbGxpbmcgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBlYWNoIGhlYWRlci5cbiAgICovXG4gIGZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgdGhpcy5lbnRyaWVzKCkpIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIG5hbWUsIHRoaXMpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSB2YWx1ZXNcbiAgICogb2YgYWxsIFNldC1Db29raWUgaGVhZGVycyBhc3NvY2lhdGVkXG4gICAqIHdpdGggYSByZXNwb25zZVxuICAgKi9cbiAgZ2V0U2V0Q29va2llKCkge1xuICAgIGNvbnN0IHNldENvb2tpZUhlYWRlciA9IHRoaXMuZ2V0KFwic2V0LWNvb2tpZVwiKTtcbiAgICBpZiAoc2V0Q29va2llSGVhZGVyID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmIChzZXRDb29raWVIZWFkZXIgPT09IFwiXCIpIHtcbiAgICAgIHJldHVybiBbXCJcIl07XG4gICAgfVxuICAgIHJldHVybiAoMCwgaW1wb3J0X3NldF9jb29raWVfcGFyc2VyLnNwbGl0Q29va2llc1N0cmluZykoc2V0Q29va2llSGVhZGVyKTtcbiAgfVxufTtcblxuLy8gc3JjL2dldFJhd0hlYWRlcnMudHNcbmZ1bmN0aW9uIGdldFJhd0hlYWRlcnMoaGVhZGVycykge1xuICBjb25zdCByYXdIZWFkZXJzID0ge307XG4gIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBoZWFkZXJzLmVudHJpZXMoKSkge1xuICAgIHJhd0hlYWRlcnNbaGVhZGVyc1tSQVdfSEVBREVSX05BTUVTXS5nZXQobmFtZSldID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHJhd0hlYWRlcnM7XG59XG5cbi8vIHNyYy90cmFuc2Zvcm1lcnMvaGVhZGVyc1RvTGlzdC50c1xuZnVuY3Rpb24gaGVhZGVyc1RvTGlzdChoZWFkZXJzKSB7XG4gIGNvbnN0IGhlYWRlcnNMaXN0ID0gW107XG4gIGhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIG5hbWUpID0+IHtcbiAgICBjb25zdCByZXNvbHZlZFZhbHVlID0gdmFsdWUuaW5jbHVkZXMoXCIsXCIpID8gdmFsdWUuc3BsaXQoXCIsXCIpLm1hcCgodmFsdWUyKSA9PiB2YWx1ZTIudHJpbSgpKSA6IHZhbHVlO1xuICAgIGhlYWRlcnNMaXN0LnB1c2goW25hbWUsIHJlc29sdmVkVmFsdWVdKTtcbiAgfSk7XG4gIHJldHVybiBoZWFkZXJzTGlzdDtcbn1cblxuLy8gc3JjL3RyYW5zZm9ybWVycy9oZWFkZXJzVG9TdHJpbmcudHNcbmZ1bmN0aW9uIGhlYWRlcnNUb1N0cmluZyhoZWFkZXJzKSB7XG4gIGNvbnN0IGxpc3QgPSBoZWFkZXJzVG9MaXN0KGhlYWRlcnMpO1xuICBjb25zdCBsaW5lcyA9IGxpc3QubWFwKChbbmFtZSwgdmFsdWVdKSA9PiB7XG4gICAgY29uc3QgdmFsdWVzID0gW10uY29uY2F0KHZhbHVlKTtcbiAgICByZXR1cm4gYCR7bmFtZX06ICR7dmFsdWVzLmpvaW4oXCIsIFwiKX1gO1xuICB9KTtcbiAgcmV0dXJuIGxpbmVzLmpvaW4oXCJcXHJcXG5cIik7XG59XG5cbi8vIHNyYy90cmFuc2Zvcm1lcnMvaGVhZGVyc1RvT2JqZWN0LnRzXG52YXIgc2luZ2xlVmFsdWVIZWFkZXJzID0gW1widXNlci1hZ2VudFwiXTtcbmZ1bmN0aW9uIGhlYWRlcnNUb09iamVjdChoZWFkZXJzKSB7XG4gIGNvbnN0IGhlYWRlcnNPYmplY3QgPSB7fTtcbiAgaGVhZGVycy5mb3JFYWNoKCh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgIGNvbnN0IGlzTXVsdGlWYWx1ZSA9ICFzaW5nbGVWYWx1ZUhlYWRlcnMuaW5jbHVkZXMobmFtZS50b0xvd2VyQ2FzZSgpKSAmJiB2YWx1ZS5pbmNsdWRlcyhcIixcIik7XG4gICAgaGVhZGVyc09iamVjdFtuYW1lXSA9IGlzTXVsdGlWYWx1ZSA/IHZhbHVlLnNwbGl0KFwiLFwiKS5tYXAoKHMpID0+IHMudHJpbSgpKSA6IHZhbHVlO1xuICB9KTtcbiAgcmV0dXJuIGhlYWRlcnNPYmplY3Q7XG59XG5cbi8vIHNyYy90cmFuc2Zvcm1lcnMvc3RyaW5nVG9IZWFkZXJzLnRzXG5mdW5jdGlvbiBzdHJpbmdUb0hlYWRlcnMoc3RyKSB7XG4gIGNvbnN0IGxpbmVzID0gc3RyLnRyaW0oKS5zcGxpdCgvW1xcclxcbl0rLyk7XG4gIHJldHVybiBsaW5lcy5yZWR1Y2UoKGhlYWRlcnMsIGxpbmUpID0+IHtcbiAgICBpZiAobGluZS50cmltKCkgPT09IFwiXCIpIHtcbiAgICAgIHJldHVybiBoZWFkZXJzO1xuICAgIH1cbiAgICBjb25zdCBwYXJ0cyA9IGxpbmUuc3BsaXQoXCI6IFwiKTtcbiAgICBjb25zdCBuYW1lID0gcGFydHMuc2hpZnQoKTtcbiAgICBjb25zdCB2YWx1ZSA9IHBhcnRzLmpvaW4oXCI6IFwiKTtcbiAgICBoZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XG4gICAgcmV0dXJuIGhlYWRlcnM7XG4gIH0sIG5ldyBIZWFkZXJzKCkpO1xufVxuXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2xpc3RUb0hlYWRlcnMudHNcbmZ1bmN0aW9uIGxpc3RUb0hlYWRlcnMobGlzdCkge1xuICBjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcbiAgbGlzdC5mb3JFYWNoKChbbmFtZSwgdmFsdWVdKSA9PiB7XG4gICAgY29uc3QgdmFsdWVzID0gW10uY29uY2F0KHZhbHVlKTtcbiAgICB2YWx1ZXMuZm9yRWFjaCgodmFsdWUyKSA9PiB7XG4gICAgICBoZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZTIpO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIGhlYWRlcnM7XG59XG5cbi8vIHNyYy90cmFuc2Zvcm1lcnMvcmVkdWNlSGVhZGVyc09iamVjdC50c1xuZnVuY3Rpb24gcmVkdWNlSGVhZGVyc09iamVjdChoZWFkZXJzLCByZWR1Y2VyLCBpbml0aWFsU3RhdGUpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGhlYWRlcnMpLnJlZHVjZSgobmV4dEhlYWRlcnMsIG5hbWUpID0+IHtcbiAgICByZXR1cm4gcmVkdWNlcihuZXh0SGVhZGVycywgbmFtZSwgaGVhZGVyc1tuYW1lXSk7XG4gIH0sIGluaXRpYWxTdGF0ZSk7XG59XG5cbi8vIHNyYy90cmFuc2Zvcm1lcnMvb2JqZWN0VG9IZWFkZXJzLnRzXG5mdW5jdGlvbiBvYmplY3RUb0hlYWRlcnMoaGVhZGVyc09iamVjdCkge1xuICByZXR1cm4gcmVkdWNlSGVhZGVyc09iamVjdChcbiAgICBoZWFkZXJzT2JqZWN0LFxuICAgIChoZWFkZXJzLCBuYW1lLCB2YWx1ZSkgPT4ge1xuICAgICAgY29uc3QgdmFsdWVzID0gW10uY29uY2F0KHZhbHVlKS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICB2YWx1ZXMuZm9yRWFjaCgodmFsdWUyKSA9PiB7XG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlMik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBoZWFkZXJzO1xuICAgIH0sXG4gICAgbmV3IEhlYWRlcnMoKVxuICApO1xufVxuXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2ZsYXR0ZW5IZWFkZXJzTGlzdC50c1xuZnVuY3Rpb24gZmxhdHRlbkhlYWRlcnNMaXN0KGxpc3QpIHtcbiAgcmV0dXJuIGxpc3QubWFwKChbbmFtZSwgdmFsdWVzXSkgPT4ge1xuICAgIHJldHVybiBbbmFtZSwgW10uY29uY2F0KHZhbHVlcykuam9pbihcIiwgXCIpXTtcbiAgfSk7XG59XG5cbi8vIHNyYy90cmFuc2Zvcm1lcnMvZmxhdHRlbkhlYWRlcnNPYmplY3QudHNcbmZ1bmN0aW9uIGZsYXR0ZW5IZWFkZXJzT2JqZWN0KGhlYWRlcnNPYmplY3QpIHtcbiAgcmV0dXJuIHJlZHVjZUhlYWRlcnNPYmplY3QoXG4gICAgaGVhZGVyc09iamVjdCxcbiAgICAoaGVhZGVycywgbmFtZSwgdmFsdWUpID0+IHtcbiAgICAgIGhlYWRlcnNbbmFtZV0gPSBbXS5jb25jYXQodmFsdWUpLmpvaW4oXCIsIFwiKTtcbiAgICAgIHJldHVybiBoZWFkZXJzO1xuICAgIH0sXG4gICAge31cbiAgKTtcbn1cbmV4cG9ydCB7XG4gIEhlYWRlcnMsXG4gIGZsYXR0ZW5IZWFkZXJzTGlzdCxcbiAgZmxhdHRlbkhlYWRlcnNPYmplY3QsXG4gIGdldFJhd0hlYWRlcnMsXG4gIGhlYWRlcnNUb0xpc3QsXG4gIGhlYWRlcnNUb09iamVjdCxcbiAgaGVhZGVyc1RvU3RyaW5nLFxuICBsaXN0VG9IZWFkZXJzLFxuICBvYmplY3RUb0hlYWRlcnMsXG4gIHJlZHVjZUhlYWRlcnNPYmplY3QsXG4gIHN0cmluZ1RvSGVhZGVyc1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXAiLCJpbXBvcnQgKiBhcyBfc3lzY2FsbHMyXzAgZnJvbSAnc3BhY2V0aW1lOnN5c0AyLjAnO1xuaW1wb3J0IHsgbW9kdWxlSG9va3MgfSBmcm9tICdzcGFjZXRpbWU6c3lzQDIuMCc7XG5pbXBvcnQgeyBoZWFkZXJzVG9MaXN0LCBIZWFkZXJzIH0gZnJvbSAnaGVhZGVycy1wb2x5ZmlsbCc7XG5cbnR5cGVvZiBnbG9iYWxUaGlzIT09XCJ1bmRlZmluZWRcIiYmKChnbG9iYWxUaGlzLmdsb2JhbD1nbG9iYWxUaGlzLmdsb2JhbHx8Z2xvYmFsVGhpcyksKGdsb2JhbFRoaXMud2luZG93PWdsb2JhbFRoaXMud2luZG93fHxnbG9iYWxUaGlzKSk7XG52YXIgX19jcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xudmFyIF9fZGVmUHJvcCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcbnZhciBfX2dldE93blByb3BEZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbnZhciBfX2dldE93blByb3BOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzO1xudmFyIF9fZ2V0UHJvdG9PZiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbnZhciBfX2hhc093blByb3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIF9fZXNtID0gKGZuLCByZXMpID0+IGZ1bmN0aW9uIF9faW5pdCgpIHtcbiAgcmV0dXJuIGZuICYmIChyZXMgPSAoMCwgZm5bX19nZXRPd25Qcm9wTmFtZXMoZm4pWzBdXSkoZm4gPSAwKSksIHJlcztcbn07XG52YXIgX19jb21tb25KUyA9IChjYiwgbW9kKSA9PiBmdW5jdGlvbiBfX3JlcXVpcmUoKSB7XG4gIHJldHVybiBtb2QgfHwgKDAsIGNiW19fZ2V0T3duUHJvcE5hbWVzKGNiKVswXV0pKChtb2QgPSB7IGV4cG9ydHM6IHt9IH0pLmV4cG9ydHMsIG1vZCksIG1vZC5leHBvcnRzO1xufTtcbnZhciBfX2V4cG9ydCA9ICh0YXJnZXQsIGFsbCkgPT4ge1xuICBmb3IgKHZhciBuYW1lIGluIGFsbClcbiAgICBfX2RlZlByb3AodGFyZ2V0LCBuYW1lLCB7IGdldDogYWxsW25hbWVdLCBlbnVtZXJhYmxlOiB0cnVlIH0pO1xufTtcbnZhciBfX2NvcHlQcm9wcyA9ICh0bywgZnJvbSwgZXhjZXB0LCBkZXNjKSA9PiB7XG4gIGlmIChmcm9tICYmIHR5cGVvZiBmcm9tID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBmcm9tID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBmb3IgKGxldCBrZXkgb2YgX19nZXRPd25Qcm9wTmFtZXMoZnJvbSkpXG4gICAgICBpZiAoIV9faGFzT3duUHJvcC5jYWxsKHRvLCBrZXkpICYmIGtleSAhPT0gZXhjZXB0KVxuICAgICAgICBfX2RlZlByb3AodG8sIGtleSwgeyBnZXQ6ICgpID0+IGZyb21ba2V5XSwgZW51bWVyYWJsZTogIShkZXNjID0gX19nZXRPd25Qcm9wRGVzYyhmcm9tLCBrZXkpKSB8fCBkZXNjLmVudW1lcmFibGUgfSk7XG4gIH1cbiAgcmV0dXJuIHRvO1xufTtcbnZhciBfX3RvRVNNID0gKG1vZCwgaXNOb2RlTW9kZSwgdGFyZ2V0KSA9PiAodGFyZ2V0ID0gbW9kICE9IG51bGwgPyBfX2NyZWF0ZShfX2dldFByb3RvT2YobW9kKSkgOiB7fSwgX19jb3B5UHJvcHMoXG4gIC8vIElmIHRoZSBpbXBvcnRlciBpcyBpbiBub2RlIGNvbXBhdGliaWxpdHkgbW9kZSBvciB0aGlzIGlzIG5vdCBhbiBFU01cbiAgLy8gZmlsZSB0aGF0IGhhcyBiZWVuIGNvbnZlcnRlZCB0byBhIENvbW1vbkpTIGZpbGUgdXNpbmcgYSBCYWJlbC1cbiAgLy8gY29tcGF0aWJsZSB0cmFuc2Zvcm0gKGkuZS4gXCJfX2VzTW9kdWxlXCIgaGFzIG5vdCBiZWVuIHNldCksIHRoZW4gc2V0XG4gIC8vIFwiZGVmYXVsdFwiIHRvIHRoZSBDb21tb25KUyBcIm1vZHVsZS5leHBvcnRzXCIgZm9yIG5vZGUgY29tcGF0aWJpbGl0eS5cbiAgX19kZWZQcm9wKHRhcmdldCwgXCJkZWZhdWx0XCIsIHsgdmFsdWU6IG1vZCwgZW51bWVyYWJsZTogdHJ1ZSB9KSAsXG4gIG1vZFxuKSk7XG52YXIgX190b0NvbW1vbkpTID0gKG1vZCkgPT4gX19jb3B5UHJvcHMoX19kZWZQcm9wKHt9LCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KSwgbW9kKTtcblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2Jhc2U2NC1qc0AxLjUuMS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzXG52YXIgcmVxdWlyZV9iYXNlNjRfanMgPSBfX2NvbW1vbkpTKHtcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vYmFzZTY0LWpzQDEuNS4xL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvaW5kZXguanNcIihleHBvcnRzKSB7XG4gICAgZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aDtcbiAgICBleHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXk7XG4gICAgZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheTI7XG4gICAgdmFyIGxvb2t1cCA9IFtdO1xuICAgIHZhciByZXZMb29rdXAgPSBbXTtcbiAgICB2YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09IFwidW5kZWZpbmVkXCIgPyBVaW50OEFycmF5IDogQXJyYXk7XG4gICAgdmFyIGNvZGUgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky9cIjtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBsb29rdXBbaV0gPSBjb2RlW2ldO1xuICAgICAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpO1xuICAgIH1cbiAgICB2YXIgaTtcbiAgICB2YXIgbGVuO1xuICAgIHJldkxvb2t1cFtcIi1cIi5jaGFyQ29kZUF0KDApXSA9IDYyO1xuICAgIHJldkxvb2t1cFtcIl9cIi5jaGFyQ29kZUF0KDApXSA9IDYzO1xuICAgIGZ1bmN0aW9uIGdldExlbnMoYjY0KSB7XG4gICAgICB2YXIgbGVuMiA9IGI2NC5sZW5ndGg7XG4gICAgICBpZiAobGVuMiAlIDQgPiAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDRcIik7XG4gICAgICB9XG4gICAgICB2YXIgdmFsaWRMZW4gPSBiNjQuaW5kZXhPZihcIj1cIik7XG4gICAgICBpZiAodmFsaWRMZW4gPT09IC0xKSB2YWxpZExlbiA9IGxlbjI7XG4gICAgICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gdmFsaWRMZW4gPT09IGxlbjIgPyAwIDogNCAtIHZhbGlkTGVuICUgNDtcbiAgICAgIHJldHVybiBbdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbl07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGJ5dGVMZW5ndGgoYjY0KSB7XG4gICAgICB2YXIgbGVucyA9IGdldExlbnMoYjY0KTtcbiAgICAgIHZhciB2YWxpZExlbiA9IGxlbnNbMF07XG4gICAgICB2YXIgcGxhY2VIb2xkZXJzTGVuID0gbGVuc1sxXTtcbiAgICAgIHJldHVybiAodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQgLSBwbGFjZUhvbGRlcnNMZW47XG4gICAgfVxuICAgIGZ1bmN0aW9uIF9ieXRlTGVuZ3RoKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikge1xuICAgICAgcmV0dXJuICh2YWxpZExlbiArIHBsYWNlSG9sZGVyc0xlbikgKiAzIC8gNCAtIHBsYWNlSG9sZGVyc0xlbjtcbiAgICB9XG4gICAgZnVuY3Rpb24gdG9CeXRlQXJyYXkoYjY0KSB7XG4gICAgICB2YXIgdG1wO1xuICAgICAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NCk7XG4gICAgICB2YXIgdmFsaWRMZW4gPSBsZW5zWzBdO1xuICAgICAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IGxlbnNbMV07XG4gICAgICB2YXIgYXJyID0gbmV3IEFycihfYnl0ZUxlbmd0aChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pKTtcbiAgICAgIHZhciBjdXJCeXRlID0gMDtcbiAgICAgIHZhciBsZW4yID0gcGxhY2VIb2xkZXJzTGVuID4gMCA/IHZhbGlkTGVuIC0gNCA6IHZhbGlkTGVuO1xuICAgICAgdmFyIGkyO1xuICAgICAgZm9yIChpMiA9IDA7IGkyIDwgbGVuMjsgaTIgKz0gNCkge1xuICAgICAgICB0bXAgPSByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIpXSA8PCAxOCB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDEpXSA8PCAxMiB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDIpXSA8PCA2IHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMyldO1xuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCA+PiAxNiAmIDI1NTtcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgPj4gOCAmIDI1NTtcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAyNTU7XG4gICAgICB9XG4gICAgICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAyKSB7XG4gICAgICAgIHRtcCA9IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMildIDw8IDIgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAxKV0gPj4gNDtcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAyNTU7XG4gICAgICB9XG4gICAgICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAxKSB7XG4gICAgICAgIHRtcCA9IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMildIDw8IDEwIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMSldIDw8IDQgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAyKV0gPj4gMjtcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgPj4gOCAmIDI1NTtcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAyNTU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH1cbiAgICBmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQobnVtKSB7XG4gICAgICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDYzXSArIGxvb2t1cFtudW0gPj4gMTIgJiA2M10gKyBsb29rdXBbbnVtID4+IDYgJiA2M10gKyBsb29rdXBbbnVtICYgNjNdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBlbmNvZGVDaHVuayh1aW50OCwgc3RhcnQsIGVuZCkge1xuICAgICAgdmFyIHRtcDtcbiAgICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICAgIGZvciAodmFyIGkyID0gc3RhcnQ7IGkyIDwgZW5kOyBpMiArPSAzKSB7XG4gICAgICAgIHRtcCA9ICh1aW50OFtpMl0gPDwgMTYgJiAxNjcxMTY4MCkgKyAodWludDhbaTIgKyAxXSA8PCA4ICYgNjUyODApICsgKHVpbnQ4W2kyICsgMl0gJiAyNTUpO1xuICAgICAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0LmpvaW4oXCJcIik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGZyb21CeXRlQXJyYXkyKHVpbnQ4KSB7XG4gICAgICB2YXIgdG1wO1xuICAgICAgdmFyIGxlbjIgPSB1aW50OC5sZW5ndGg7XG4gICAgICB2YXIgZXh0cmFCeXRlcyA9IGxlbjIgJSAzO1xuICAgICAgdmFyIHBhcnRzID0gW107XG4gICAgICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MztcbiAgICAgIGZvciAodmFyIGkyID0gMCwgbGVuMjIgPSBsZW4yIC0gZXh0cmFCeXRlczsgaTIgPCBsZW4yMjsgaTIgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICAgICAgcGFydHMucHVzaChlbmNvZGVDaHVuayh1aW50OCwgaTIsIGkyICsgbWF4Q2h1bmtMZW5ndGggPiBsZW4yMiA/IGxlbjIyIDogaTIgKyBtYXhDaHVua0xlbmd0aCkpO1xuICAgICAgfVxuICAgICAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICAgICAgdG1wID0gdWludDhbbGVuMiAtIDFdO1xuICAgICAgICBwYXJ0cy5wdXNoKFxuICAgICAgICAgIGxvb2t1cFt0bXAgPj4gMl0gKyBsb29rdXBbdG1wIDw8IDQgJiA2M10gKyBcIj09XCJcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgICAgICB0bXAgPSAodWludDhbbGVuMiAtIDJdIDw8IDgpICsgdWludDhbbGVuMiAtIDFdO1xuICAgICAgICBwYXJ0cy5wdXNoKFxuICAgICAgICAgIGxvb2t1cFt0bXAgPj4gMTBdICsgbG9va3VwW3RtcCA+PiA0ICYgNjNdICsgbG9va3VwW3RtcCA8PCAyICYgNjNdICsgXCI9XCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXJ0cy5qb2luKFwiXCIpO1xuICAgIH1cbiAgfVxufSk7XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zdGF0dXNlc0AyLjAuMi9ub2RlX21vZHVsZXMvc3RhdHVzZXMvY29kZXMuanNvblxudmFyIHJlcXVpcmVfY29kZXMgPSBfX2NvbW1vbkpTKHtcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc3RhdHVzZXNAMi4wLjIvbm9kZV9tb2R1bGVzL3N0YXR1c2VzL2NvZGVzLmpzb25cIihleHBvcnRzLCBtb2R1bGUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgIFwiMTAwXCI6IFwiQ29udGludWVcIixcbiAgICAgIFwiMTAxXCI6IFwiU3dpdGNoaW5nIFByb3RvY29sc1wiLFxuICAgICAgXCIxMDJcIjogXCJQcm9jZXNzaW5nXCIsXG4gICAgICBcIjEwM1wiOiBcIkVhcmx5IEhpbnRzXCIsXG4gICAgICBcIjIwMFwiOiBcIk9LXCIsXG4gICAgICBcIjIwMVwiOiBcIkNyZWF0ZWRcIixcbiAgICAgIFwiMjAyXCI6IFwiQWNjZXB0ZWRcIixcbiAgICAgIFwiMjAzXCI6IFwiTm9uLUF1dGhvcml0YXRpdmUgSW5mb3JtYXRpb25cIixcbiAgICAgIFwiMjA0XCI6IFwiTm8gQ29udGVudFwiLFxuICAgICAgXCIyMDVcIjogXCJSZXNldCBDb250ZW50XCIsXG4gICAgICBcIjIwNlwiOiBcIlBhcnRpYWwgQ29udGVudFwiLFxuICAgICAgXCIyMDdcIjogXCJNdWx0aS1TdGF0dXNcIixcbiAgICAgIFwiMjA4XCI6IFwiQWxyZWFkeSBSZXBvcnRlZFwiLFxuICAgICAgXCIyMjZcIjogXCJJTSBVc2VkXCIsXG4gICAgICBcIjMwMFwiOiBcIk11bHRpcGxlIENob2ljZXNcIixcbiAgICAgIFwiMzAxXCI6IFwiTW92ZWQgUGVybWFuZW50bHlcIixcbiAgICAgIFwiMzAyXCI6IFwiRm91bmRcIixcbiAgICAgIFwiMzAzXCI6IFwiU2VlIE90aGVyXCIsXG4gICAgICBcIjMwNFwiOiBcIk5vdCBNb2RpZmllZFwiLFxuICAgICAgXCIzMDVcIjogXCJVc2UgUHJveHlcIixcbiAgICAgIFwiMzA3XCI6IFwiVGVtcG9yYXJ5IFJlZGlyZWN0XCIsXG4gICAgICBcIjMwOFwiOiBcIlBlcm1hbmVudCBSZWRpcmVjdFwiLFxuICAgICAgXCI0MDBcIjogXCJCYWQgUmVxdWVzdFwiLFxuICAgICAgXCI0MDFcIjogXCJVbmF1dGhvcml6ZWRcIixcbiAgICAgIFwiNDAyXCI6IFwiUGF5bWVudCBSZXF1aXJlZFwiLFxuICAgICAgXCI0MDNcIjogXCJGb3JiaWRkZW5cIixcbiAgICAgIFwiNDA0XCI6IFwiTm90IEZvdW5kXCIsXG4gICAgICBcIjQwNVwiOiBcIk1ldGhvZCBOb3QgQWxsb3dlZFwiLFxuICAgICAgXCI0MDZcIjogXCJOb3QgQWNjZXB0YWJsZVwiLFxuICAgICAgXCI0MDdcIjogXCJQcm94eSBBdXRoZW50aWNhdGlvbiBSZXF1aXJlZFwiLFxuICAgICAgXCI0MDhcIjogXCJSZXF1ZXN0IFRpbWVvdXRcIixcbiAgICAgIFwiNDA5XCI6IFwiQ29uZmxpY3RcIixcbiAgICAgIFwiNDEwXCI6IFwiR29uZVwiLFxuICAgICAgXCI0MTFcIjogXCJMZW5ndGggUmVxdWlyZWRcIixcbiAgICAgIFwiNDEyXCI6IFwiUHJlY29uZGl0aW9uIEZhaWxlZFwiLFxuICAgICAgXCI0MTNcIjogXCJQYXlsb2FkIFRvbyBMYXJnZVwiLFxuICAgICAgXCI0MTRcIjogXCJVUkkgVG9vIExvbmdcIixcbiAgICAgIFwiNDE1XCI6IFwiVW5zdXBwb3J0ZWQgTWVkaWEgVHlwZVwiLFxuICAgICAgXCI0MTZcIjogXCJSYW5nZSBOb3QgU2F0aXNmaWFibGVcIixcbiAgICAgIFwiNDE3XCI6IFwiRXhwZWN0YXRpb24gRmFpbGVkXCIsXG4gICAgICBcIjQxOFwiOiBcIkknbSBhIFRlYXBvdFwiLFxuICAgICAgXCI0MjFcIjogXCJNaXNkaXJlY3RlZCBSZXF1ZXN0XCIsXG4gICAgICBcIjQyMlwiOiBcIlVucHJvY2Vzc2FibGUgRW50aXR5XCIsXG4gICAgICBcIjQyM1wiOiBcIkxvY2tlZFwiLFxuICAgICAgXCI0MjRcIjogXCJGYWlsZWQgRGVwZW5kZW5jeVwiLFxuICAgICAgXCI0MjVcIjogXCJUb28gRWFybHlcIixcbiAgICAgIFwiNDI2XCI6IFwiVXBncmFkZSBSZXF1aXJlZFwiLFxuICAgICAgXCI0MjhcIjogXCJQcmVjb25kaXRpb24gUmVxdWlyZWRcIixcbiAgICAgIFwiNDI5XCI6IFwiVG9vIE1hbnkgUmVxdWVzdHNcIixcbiAgICAgIFwiNDMxXCI6IFwiUmVxdWVzdCBIZWFkZXIgRmllbGRzIFRvbyBMYXJnZVwiLFxuICAgICAgXCI0NTFcIjogXCJVbmF2YWlsYWJsZSBGb3IgTGVnYWwgUmVhc29uc1wiLFxuICAgICAgXCI1MDBcIjogXCJJbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcIixcbiAgICAgIFwiNTAxXCI6IFwiTm90IEltcGxlbWVudGVkXCIsXG4gICAgICBcIjUwMlwiOiBcIkJhZCBHYXRld2F5XCIsXG4gICAgICBcIjUwM1wiOiBcIlNlcnZpY2UgVW5hdmFpbGFibGVcIixcbiAgICAgIFwiNTA0XCI6IFwiR2F0ZXdheSBUaW1lb3V0XCIsXG4gICAgICBcIjUwNVwiOiBcIkhUVFAgVmVyc2lvbiBOb3QgU3VwcG9ydGVkXCIsXG4gICAgICBcIjUwNlwiOiBcIlZhcmlhbnQgQWxzbyBOZWdvdGlhdGVzXCIsXG4gICAgICBcIjUwN1wiOiBcIkluc3VmZmljaWVudCBTdG9yYWdlXCIsXG4gICAgICBcIjUwOFwiOiBcIkxvb3AgRGV0ZWN0ZWRcIixcbiAgICAgIFwiNTA5XCI6IFwiQmFuZHdpZHRoIExpbWl0IEV4Y2VlZGVkXCIsXG4gICAgICBcIjUxMFwiOiBcIk5vdCBFeHRlbmRlZFwiLFxuICAgICAgXCI1MTFcIjogXCJOZXR3b3JrIEF1dGhlbnRpY2F0aW9uIFJlcXVpcmVkXCJcbiAgICB9O1xuICB9XG59KTtcblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0YXR1c2VzQDIuMC4yL25vZGVfbW9kdWxlcy9zdGF0dXNlcy9pbmRleC5qc1xudmFyIHJlcXVpcmVfc3RhdHVzZXMgPSBfX2NvbW1vbkpTKHtcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc3RhdHVzZXNAMi4wLjIvbm9kZV9tb2R1bGVzL3N0YXR1c2VzL2luZGV4LmpzXCIoZXhwb3J0cywgbW9kdWxlKSB7XG4gICAgdmFyIGNvZGVzID0gcmVxdWlyZV9jb2RlcygpO1xuICAgIG1vZHVsZS5leHBvcnRzID0gc3RhdHVzMjtcbiAgICBzdGF0dXMyLm1lc3NhZ2UgPSBjb2RlcztcbiAgICBzdGF0dXMyLmNvZGUgPSBjcmVhdGVNZXNzYWdlVG9TdGF0dXNDb2RlTWFwKGNvZGVzKTtcbiAgICBzdGF0dXMyLmNvZGVzID0gY3JlYXRlU3RhdHVzQ29kZUxpc3QoY29kZXMpO1xuICAgIHN0YXR1czIucmVkaXJlY3QgPSB7XG4gICAgICAzMDA6IHRydWUsXG4gICAgICAzMDE6IHRydWUsXG4gICAgICAzMDI6IHRydWUsXG4gICAgICAzMDM6IHRydWUsXG4gICAgICAzMDU6IHRydWUsXG4gICAgICAzMDc6IHRydWUsXG4gICAgICAzMDg6IHRydWVcbiAgICB9O1xuICAgIHN0YXR1czIuZW1wdHkgPSB7XG4gICAgICAyMDQ6IHRydWUsXG4gICAgICAyMDU6IHRydWUsXG4gICAgICAzMDQ6IHRydWVcbiAgICB9O1xuICAgIHN0YXR1czIucmV0cnkgPSB7XG4gICAgICA1MDI6IHRydWUsXG4gICAgICA1MDM6IHRydWUsXG4gICAgICA1MDQ6IHRydWVcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VUb1N0YXR1c0NvZGVNYXAoY29kZXMyKSB7XG4gICAgICB2YXIgbWFwID0ge307XG4gICAgICBPYmplY3Qua2V5cyhjb2RlczIpLmZvckVhY2goZnVuY3Rpb24gZm9yRWFjaENvZGUoY29kZSkge1xuICAgICAgICB2YXIgbWVzc2FnZSA9IGNvZGVzMltjb2RlXTtcbiAgICAgICAgdmFyIHN0YXR1czMgPSBOdW1iZXIoY29kZSk7XG4gICAgICAgIG1hcFttZXNzYWdlLnRvTG93ZXJDYXNlKCldID0gc3RhdHVzMztcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlU3RhdHVzQ29kZUxpc3QoY29kZXMyKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMoY29kZXMyKS5tYXAoZnVuY3Rpb24gbWFwQ29kZShjb2RlKSB7XG4gICAgICAgIHJldHVybiBOdW1iZXIoY29kZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0U3RhdHVzQ29kZShtZXNzYWdlKSB7XG4gICAgICB2YXIgbXNnID0gbWVzc2FnZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc3RhdHVzMi5jb2RlLCBtc2cpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzdGF0dXMgbWVzc2FnZTogXCInICsgbWVzc2FnZSArICdcIicpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0YXR1czIuY29kZVttc2ddO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZXRTdGF0dXNNZXNzYWdlKGNvZGUpIHtcbiAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHN0YXR1czIubWVzc2FnZSwgY29kZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBzdGF0dXMgY29kZTogXCIgKyBjb2RlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGF0dXMyLm1lc3NhZ2VbY29kZV07XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN0YXR1czIoY29kZSkge1xuICAgICAgaWYgKHR5cGVvZiBjb2RlID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHJldHVybiBnZXRTdGF0dXNNZXNzYWdlKGNvZGUpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBjb2RlICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjb2RlIG11c3QgYmUgYSBudW1iZXIgb3Igc3RyaW5nXCIpO1xuICAgICAgfVxuICAgICAgdmFyIG4gPSBwYXJzZUludChjb2RlLCAxMCk7XG4gICAgICBpZiAoIWlzTmFOKG4pKSB7XG4gICAgICAgIHJldHVybiBnZXRTdGF0dXNNZXNzYWdlKG4pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGdldFN0YXR1c0NvZGUoY29kZSk7XG4gICAgfVxuICB9XG59KTtcblxuLy8gc3JjL3V0aWwtc3R1Yi50c1xudmFyIHV0aWxfc3R1Yl9leHBvcnRzID0ge307XG5fX2V4cG9ydCh1dGlsX3N0dWJfZXhwb3J0cywge1xuICBpbnNwZWN0OiAoKSA9PiBpbnNwZWN0XG59KTtcbnZhciBpbnNwZWN0O1xudmFyIGluaXRfdXRpbF9zdHViID0gX19lc20oe1xuICBcInNyYy91dGlsLXN0dWIudHNcIigpIHtcbiAgICBpbnNwZWN0ID0ge307XG4gIH1cbn0pO1xuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vb2JqZWN0LWluc3BlY3RAMS4xMy40L25vZGVfbW9kdWxlcy9vYmplY3QtaW5zcGVjdC91dGlsLmluc3BlY3QuanNcbnZhciByZXF1aXJlX3V0aWxfaW5zcGVjdCA9IF9fY29tbW9uSlMoe1xuICBcIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtaW5zcGVjdEAxLjEzLjQvbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L3V0aWwuaW5zcGVjdC5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gKGluaXRfdXRpbF9zdHViKCksIF9fdG9Db21tb25KUyh1dGlsX3N0dWJfZXhwb3J0cykpLmluc3BlY3Q7XG4gIH1cbn0pO1xuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vb2JqZWN0LWluc3BlY3RAMS4xMy40L25vZGVfbW9kdWxlcy9vYmplY3QtaW5zcGVjdC9pbmRleC5qc1xudmFyIHJlcXVpcmVfb2JqZWN0X2luc3BlY3QgPSBfX2NvbW1vbkpTKHtcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vb2JqZWN0LWluc3BlY3RAMS4xMy40L25vZGVfbW9kdWxlcy9vYmplY3QtaW5zcGVjdC9pbmRleC5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xuICAgIHZhciBoYXNNYXAgPSB0eXBlb2YgTWFwID09PSBcImZ1bmN0aW9uXCIgJiYgTWFwLnByb3RvdHlwZTtcbiAgICB2YXIgbWFwU2l6ZURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIGhhc01hcCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTWFwLnByb3RvdHlwZSwgXCJzaXplXCIpIDogbnVsbDtcbiAgICB2YXIgbWFwU2l6ZSA9IGhhc01hcCAmJiBtYXBTaXplRGVzY3JpcHRvciAmJiB0eXBlb2YgbWFwU2l6ZURlc2NyaXB0b3IuZ2V0ID09PSBcImZ1bmN0aW9uXCIgPyBtYXBTaXplRGVzY3JpcHRvci5nZXQgOiBudWxsO1xuICAgIHZhciBtYXBGb3JFYWNoID0gaGFzTWFwICYmIE1hcC5wcm90b3R5cGUuZm9yRWFjaDtcbiAgICB2YXIgaGFzU2V0ID0gdHlwZW9mIFNldCA9PT0gXCJmdW5jdGlvblwiICYmIFNldC5wcm90b3R5cGU7XG4gICAgdmFyIHNldFNpemVEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciAmJiBoYXNTZXQgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKFNldC5wcm90b3R5cGUsIFwic2l6ZVwiKSA6IG51bGw7XG4gICAgdmFyIHNldFNpemUgPSBoYXNTZXQgJiYgc2V0U2l6ZURlc2NyaXB0b3IgJiYgdHlwZW9mIHNldFNpemVEZXNjcmlwdG9yLmdldCA9PT0gXCJmdW5jdGlvblwiID8gc2V0U2l6ZURlc2NyaXB0b3IuZ2V0IDogbnVsbDtcbiAgICB2YXIgc2V0Rm9yRWFjaCA9IGhhc1NldCAmJiBTZXQucHJvdG90eXBlLmZvckVhY2g7XG4gICAgdmFyIGhhc1dlYWtNYXAgPSB0eXBlb2YgV2Vha01hcCA9PT0gXCJmdW5jdGlvblwiICYmIFdlYWtNYXAucHJvdG90eXBlO1xuICAgIHZhciB3ZWFrTWFwSGFzID0gaGFzV2Vha01hcCA/IFdlYWtNYXAucHJvdG90eXBlLmhhcyA6IG51bGw7XG4gICAgdmFyIGhhc1dlYWtTZXQgPSB0eXBlb2YgV2Vha1NldCA9PT0gXCJmdW5jdGlvblwiICYmIFdlYWtTZXQucHJvdG90eXBlO1xuICAgIHZhciB3ZWFrU2V0SGFzID0gaGFzV2Vha1NldCA/IFdlYWtTZXQucHJvdG90eXBlLmhhcyA6IG51bGw7XG4gICAgdmFyIGhhc1dlYWtSZWYgPSB0eXBlb2YgV2Vha1JlZiA9PT0gXCJmdW5jdGlvblwiICYmIFdlYWtSZWYucHJvdG90eXBlO1xuICAgIHZhciB3ZWFrUmVmRGVyZWYgPSBoYXNXZWFrUmVmID8gV2Vha1JlZi5wcm90b3R5cGUuZGVyZWYgOiBudWxsO1xuICAgIHZhciBib29sZWFuVmFsdWVPZiA9IEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2Y7XG4gICAgdmFyIG9iamVjdFRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgICB2YXIgZnVuY3Rpb25Ub1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcbiAgICB2YXIgJG1hdGNoID0gU3RyaW5nLnByb3RvdHlwZS5tYXRjaDtcbiAgICB2YXIgJHNsaWNlID0gU3RyaW5nLnByb3RvdHlwZS5zbGljZTtcbiAgICB2YXIgJHJlcGxhY2UgPSBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2U7XG4gICAgdmFyICR0b1VwcGVyQ2FzZSA9IFN0cmluZy5wcm90b3R5cGUudG9VcHBlckNhc2U7XG4gICAgdmFyICR0b0xvd2VyQ2FzZSA9IFN0cmluZy5wcm90b3R5cGUudG9Mb3dlckNhc2U7XG4gICAgdmFyICR0ZXN0ID0gUmVnRXhwLnByb3RvdHlwZS50ZXN0O1xuICAgIHZhciAkY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcbiAgICB2YXIgJGpvaW4gPSBBcnJheS5wcm90b3R5cGUuam9pbjtcbiAgICB2YXIgJGFyclNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuICAgIHZhciAkZmxvb3IgPSBNYXRoLmZsb29yO1xuICAgIHZhciBiaWdJbnRWYWx1ZU9mID0gdHlwZW9mIEJpZ0ludCA9PT0gXCJmdW5jdGlvblwiID8gQmlnSW50LnByb3RvdHlwZS52YWx1ZU9mIDogbnVsbDtcbiAgICB2YXIgZ09QUyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG4gICAgdmFyIHN5bVRvU3RyaW5nID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBTeW1ib2wucHJvdG90eXBlLnRvU3RyaW5nIDogbnVsbDtcbiAgICB2YXIgaGFzU2hhbW1lZFN5bWJvbHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJvYmplY3RcIjtcbiAgICB2YXIgdG9TdHJpbmdUYWcgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLnRvU3RyaW5nVGFnICYmICh0eXBlb2YgU3ltYm9sLnRvU3RyaW5nVGFnID09PSBoYXNTaGFtbWVkU3ltYm9scyA/IFwib2JqZWN0XCIgOiBcInN5bWJvbFwiKSA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IG51bGw7XG4gICAgdmFyIGlzRW51bWVyYWJsZSA9IE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGU7XG4gICAgdmFyIGdQTyA9ICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJmdW5jdGlvblwiID8gUmVmbGVjdC5nZXRQcm90b3R5cGVPZiA6IE9iamVjdC5nZXRQcm90b3R5cGVPZikgfHwgKFtdLl9fcHJvdG9fXyA9PT0gQXJyYXkucHJvdG90eXBlID8gZnVuY3Rpb24oTykge1xuICAgICAgcmV0dXJuIE8uX19wcm90b19fO1xuICAgIH0gOiBudWxsKTtcbiAgICBmdW5jdGlvbiBhZGROdW1lcmljU2VwYXJhdG9yKG51bSwgc3RyKSB7XG4gICAgICBpZiAobnVtID09PSBJbmZpbml0eSB8fCBudW0gPT09IC1JbmZpbml0eSB8fCBudW0gIT09IG51bSB8fCBudW0gJiYgbnVtID4gLTFlMyAmJiBudW0gPCAxZTMgfHwgJHRlc3QuY2FsbCgvZS8sIHN0cikpIHtcbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgIH1cbiAgICAgIHZhciBzZXBSZWdleCA9IC9bMC05XSg/PSg/OlswLTldezN9KSsoPyFbMC05XSkpL2c7XG4gICAgICBpZiAodHlwZW9mIG51bSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICB2YXIgaW50ID0gbnVtIDwgMCA/IC0kZmxvb3IoLW51bSkgOiAkZmxvb3IobnVtKTtcbiAgICAgICAgaWYgKGludCAhPT0gbnVtKSB7XG4gICAgICAgICAgdmFyIGludFN0ciA9IFN0cmluZyhpbnQpO1xuICAgICAgICAgIHZhciBkZWMgPSAkc2xpY2UuY2FsbChzdHIsIGludFN0ci5sZW5ndGggKyAxKTtcbiAgICAgICAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChpbnRTdHIsIHNlcFJlZ2V4LCBcIiQmX1wiKSArIFwiLlwiICsgJHJlcGxhY2UuY2FsbCgkcmVwbGFjZS5jYWxsKGRlYywgLyhbMC05XXszfSkvZywgXCIkJl9cIiksIC9fJC8sIFwiXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChzdHIsIHNlcFJlZ2V4LCBcIiQmX1wiKTtcbiAgICB9XG4gICAgdmFyIHV0aWxJbnNwZWN0ID0gcmVxdWlyZV91dGlsX2luc3BlY3QoKTtcbiAgICB2YXIgaW5zcGVjdEN1c3RvbSA9IHV0aWxJbnNwZWN0LmN1c3RvbTtcbiAgICB2YXIgaW5zcGVjdFN5bWJvbCA9IGlzU3ltYm9sKGluc3BlY3RDdXN0b20pID8gaW5zcGVjdEN1c3RvbSA6IG51bGw7XG4gICAgdmFyIHF1b3RlcyA9IHtcbiAgICAgIF9fcHJvdG9fXzogbnVsbCxcbiAgICAgIFwiZG91YmxlXCI6ICdcIicsXG4gICAgICBzaW5nbGU6IFwiJ1wiXG4gICAgfTtcbiAgICB2YXIgcXVvdGVSRXMgPSB7XG4gICAgICBfX3Byb3RvX186IG51bGwsXG4gICAgICBcImRvdWJsZVwiOiAvKFtcIlxcXFxdKS9nLFxuICAgICAgc2luZ2xlOiAvKFsnXFxcXF0pL2dcbiAgICB9O1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5zcGVjdF8ob2JqLCBvcHRpb25zLCBkZXB0aCwgc2Vlbikge1xuICAgICAgdmFyIG9wdHMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgaWYgKGhhcyhvcHRzLCBcInF1b3RlU3R5bGVcIikgJiYgIWhhcyhxdW90ZXMsIG9wdHMucXVvdGVTdHlsZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwicXVvdGVTdHlsZVwiIG11c3QgYmUgXCJzaW5nbGVcIiBvciBcImRvdWJsZVwiJyk7XG4gICAgICB9XG4gICAgICBpZiAoaGFzKG9wdHMsIFwibWF4U3RyaW5nTGVuZ3RoXCIpICYmICh0eXBlb2Ygb3B0cy5tYXhTdHJpbmdMZW5ndGggPT09IFwibnVtYmVyXCIgPyBvcHRzLm1heFN0cmluZ0xlbmd0aCA8IDAgJiYgb3B0cy5tYXhTdHJpbmdMZW5ndGggIT09IEluZmluaXR5IDogb3B0cy5tYXhTdHJpbmdMZW5ndGggIT09IG51bGwpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBcIm1heFN0cmluZ0xlbmd0aFwiLCBpZiBwcm92aWRlZCwgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXIsIEluZmluaXR5LCBvciBgbnVsbGAnKTtcbiAgICAgIH1cbiAgICAgIHZhciBjdXN0b21JbnNwZWN0ID0gaGFzKG9wdHMsIFwiY3VzdG9tSW5zcGVjdFwiKSA/IG9wdHMuY3VzdG9tSW5zcGVjdCA6IHRydWU7XG4gICAgICBpZiAodHlwZW9mIGN1c3RvbUluc3BlY3QgIT09IFwiYm9vbGVhblwiICYmIGN1c3RvbUluc3BlY3QgIT09IFwic3ltYm9sXCIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm9wdGlvbiBcXFwiY3VzdG9tSW5zcGVjdFxcXCIsIGlmIHByb3ZpZGVkLCBtdXN0IGJlIGB0cnVlYCwgYGZhbHNlYCwgb3IgYCdzeW1ib2wnYFwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXMob3B0cywgXCJpbmRlbnRcIikgJiYgb3B0cy5pbmRlbnQgIT09IG51bGwgJiYgb3B0cy5pbmRlbnQgIT09IFwiXHRcIiAmJiAhKHBhcnNlSW50KG9wdHMuaW5kZW50LCAxMCkgPT09IG9wdHMuaW5kZW50ICYmIG9wdHMuaW5kZW50ID4gMCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwiaW5kZW50XCIgbXVzdCBiZSBcIlxcXFx0XCIsIGFuIGludGVnZXIgPiAwLCBvciBgbnVsbGAnKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXMob3B0cywgXCJudW1lcmljU2VwYXJhdG9yXCIpICYmIHR5cGVvZiBvcHRzLm51bWVyaWNTZXBhcmF0b3IgIT09IFwiYm9vbGVhblwiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBcIm51bWVyaWNTZXBhcmF0b3JcIiwgaWYgcHJvdmlkZWQsIG11c3QgYmUgYHRydWVgIG9yIGBmYWxzZWAnKTtcbiAgICAgIH1cbiAgICAgIHZhciBudW1lcmljU2VwYXJhdG9yID0gb3B0cy5udW1lcmljU2VwYXJhdG9yO1xuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XG4gICAgICB9XG4gICAgICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICByZXR1cm4gb2JqID8gXCJ0cnVlXCIgOiBcImZhbHNlXCI7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICByZXR1cm4gaW5zcGVjdFN0cmluZyhvYmosIG9wdHMpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgaWYgKG9iaiA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBJbmZpbml0eSAvIG9iaiA+IDAgPyBcIjBcIiA6IFwiLTBcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc3RyID0gU3RyaW5nKG9iaik7XG4gICAgICAgIHJldHVybiBudW1lcmljU2VwYXJhdG9yID8gYWRkTnVtZXJpY1NlcGFyYXRvcihvYmosIHN0cikgOiBzdHI7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJiaWdpbnRcIikge1xuICAgICAgICB2YXIgYmlnSW50U3RyID0gU3RyaW5nKG9iaikgKyBcIm5cIjtcbiAgICAgICAgcmV0dXJuIG51bWVyaWNTZXBhcmF0b3IgPyBhZGROdW1lcmljU2VwYXJhdG9yKG9iaiwgYmlnSW50U3RyKSA6IGJpZ0ludFN0cjtcbiAgICAgIH1cbiAgICAgIHZhciBtYXhEZXB0aCA9IHR5cGVvZiBvcHRzLmRlcHRoID09PSBcInVuZGVmaW5lZFwiID8gNSA6IG9wdHMuZGVwdGg7XG4gICAgICBpZiAodHlwZW9mIGRlcHRoID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGRlcHRoID0gMDtcbiAgICAgIH1cbiAgICAgIGlmIChkZXB0aCA+PSBtYXhEZXB0aCAmJiBtYXhEZXB0aCA+IDAgJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gaXNBcnJheShvYmopID8gXCJbQXJyYXldXCIgOiBcIltPYmplY3RdXCI7XG4gICAgICB9XG4gICAgICB2YXIgaW5kZW50ID0gZ2V0SW5kZW50KG9wdHMsIGRlcHRoKTtcbiAgICAgIGlmICh0eXBlb2Ygc2VlbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBzZWVuID0gW107XG4gICAgICB9IGVsc2UgaWYgKGluZGV4T2Yoc2Vlbiwgb2JqKSA+PSAwKSB7XG4gICAgICAgIHJldHVybiBcIltDaXJjdWxhcl1cIjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGluc3BlY3QzKHZhbHVlLCBmcm9tLCBub0luZGVudCkge1xuICAgICAgICBpZiAoZnJvbSkge1xuICAgICAgICAgIHNlZW4gPSAkYXJyU2xpY2UuY2FsbChzZWVuKTtcbiAgICAgICAgICBzZWVuLnB1c2goZnJvbSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vSW5kZW50KSB7XG4gICAgICAgICAgdmFyIG5ld09wdHMgPSB7XG4gICAgICAgICAgICBkZXB0aDogb3B0cy5kZXB0aFxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKGhhcyhvcHRzLCBcInF1b3RlU3R5bGVcIikpIHtcbiAgICAgICAgICAgIG5ld09wdHMucXVvdGVTdHlsZSA9IG9wdHMucXVvdGVTdHlsZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGluc3BlY3RfKHZhbHVlLCBuZXdPcHRzLCBkZXB0aCArIDEsIHNlZW4pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbnNwZWN0Xyh2YWx1ZSwgb3B0cywgZGVwdGggKyAxLCBzZWVuKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcImZ1bmN0aW9uXCIgJiYgIWlzUmVnRXhwKG9iaikpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBuYW1lT2Yob2JqKTtcbiAgICAgICAgdmFyIGtleXMgPSBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpO1xuICAgICAgICByZXR1cm4gXCJbRnVuY3Rpb25cIiArIChuYW1lID8gXCI6IFwiICsgbmFtZSA6IFwiIChhbm9ueW1vdXMpXCIpICsgXCJdXCIgKyAoa2V5cy5sZW5ndGggPiAwID8gXCIgeyBcIiArICRqb2luLmNhbGwoa2V5cywgXCIsIFwiKSArIFwiIH1cIiA6IFwiXCIpO1xuICAgICAgfVxuICAgICAgaWYgKGlzU3ltYm9sKG9iaikpIHtcbiAgICAgICAgdmFyIHN5bVN0cmluZyA9IGhhc1NoYW1tZWRTeW1ib2xzID8gJHJlcGxhY2UuY2FsbChTdHJpbmcob2JqKSwgL14oU3ltYm9sXFwoLipcXCkpX1teKV0qJC8sIFwiJDFcIikgOiBzeW1Ub1N0cmluZy5jYWxsKG9iaik7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmICFoYXNTaGFtbWVkU3ltYm9scyA/IG1hcmtCb3hlZChzeW1TdHJpbmcpIDogc3ltU3RyaW5nO1xuICAgICAgfVxuICAgICAgaWYgKGlzRWxlbWVudChvYmopKSB7XG4gICAgICAgIHZhciBzID0gXCI8XCIgKyAkdG9Mb3dlckNhc2UuY2FsbChTdHJpbmcob2JqLm5vZGVOYW1lKSk7XG4gICAgICAgIHZhciBhdHRycyA9IG9iai5hdHRyaWJ1dGVzIHx8IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgcyArPSBcIiBcIiArIGF0dHJzW2ldLm5hbWUgKyBcIj1cIiArIHdyYXBRdW90ZXMocXVvdGUoYXR0cnNbaV0udmFsdWUpLCBcImRvdWJsZVwiLCBvcHRzKTtcbiAgICAgICAgfVxuICAgICAgICBzICs9IFwiPlwiO1xuICAgICAgICBpZiAob2JqLmNoaWxkTm9kZXMgJiYgb2JqLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgcyArPSBcIi4uLlwiO1xuICAgICAgICB9XG4gICAgICAgIHMgKz0gXCI8L1wiICsgJHRvTG93ZXJDYXNlLmNhbGwoU3RyaW5nKG9iai5ub2RlTmFtZSkpICsgXCI+XCI7XG4gICAgICAgIHJldHVybiBzO1xuICAgICAgfVxuICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xuICAgICAgICBpZiAob2JqLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBcIltdXCI7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHhzID0gYXJyT2JqS2V5cyhvYmosIGluc3BlY3QzKTtcbiAgICAgICAgaWYgKGluZGVudCAmJiAhc2luZ2xlTGluZVZhbHVlcyh4cykpIHtcbiAgICAgICAgICByZXR1cm4gXCJbXCIgKyBpbmRlbnRlZEpvaW4oeHMsIGluZGVudCkgKyBcIl1cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJbIFwiICsgJGpvaW4uY2FsbCh4cywgXCIsIFwiKSArIFwiIF1cIjtcbiAgICAgIH1cbiAgICAgIGlmIChpc0Vycm9yKG9iaikpIHtcbiAgICAgICAgdmFyIHBhcnRzID0gYXJyT2JqS2V5cyhvYmosIGluc3BlY3QzKTtcbiAgICAgICAgaWYgKCEoXCJjYXVzZVwiIGluIEVycm9yLnByb3RvdHlwZSkgJiYgXCJjYXVzZVwiIGluIG9iaiAmJiAhaXNFbnVtZXJhYmxlLmNhbGwob2JqLCBcImNhdXNlXCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFwieyBbXCIgKyBTdHJpbmcob2JqKSArIFwiXSBcIiArICRqb2luLmNhbGwoJGNvbmNhdC5jYWxsKFwiW2NhdXNlXTogXCIgKyBpbnNwZWN0MyhvYmouY2F1c2UpLCBwYXJ0cyksIFwiLCBcIikgKyBcIiB9XCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBcIltcIiArIFN0cmluZyhvYmopICsgXCJdXCI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwieyBbXCIgKyBTdHJpbmcob2JqKSArIFwiXSBcIiArICRqb2luLmNhbGwocGFydHMsIFwiLCBcIikgKyBcIiB9XCI7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBjdXN0b21JbnNwZWN0KSB7XG4gICAgICAgIGlmIChpbnNwZWN0U3ltYm9sICYmIHR5cGVvZiBvYmpbaW5zcGVjdFN5bWJvbF0gPT09IFwiZnVuY3Rpb25cIiAmJiB1dGlsSW5zcGVjdCkge1xuICAgICAgICAgIHJldHVybiB1dGlsSW5zcGVjdChvYmosIHsgZGVwdGg6IG1heERlcHRoIC0gZGVwdGggfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoY3VzdG9tSW5zcGVjdCAhPT0gXCJzeW1ib2xcIiAmJiB0eXBlb2Ygb2JqLmluc3BlY3QgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiBvYmouaW5zcGVjdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaXNNYXAob2JqKSkge1xuICAgICAgICB2YXIgbWFwUGFydHMgPSBbXTtcbiAgICAgICAgaWYgKG1hcEZvckVhY2gpIHtcbiAgICAgICAgICBtYXBGb3JFYWNoLmNhbGwob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBtYXBQYXJ0cy5wdXNoKGluc3BlY3QzKGtleSwgb2JqLCB0cnVlKSArIFwiID0+IFwiICsgaW5zcGVjdDModmFsdWUsIG9iaikpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uT2YoXCJNYXBcIiwgbWFwU2l6ZS5jYWxsKG9iaiksIG1hcFBhcnRzLCBpbmRlbnQpO1xuICAgICAgfVxuICAgICAgaWYgKGlzU2V0KG9iaikpIHtcbiAgICAgICAgdmFyIHNldFBhcnRzID0gW107XG4gICAgICAgIGlmIChzZXRGb3JFYWNoKSB7XG4gICAgICAgICAgc2V0Rm9yRWFjaC5jYWxsKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIHNldFBhcnRzLnB1c2goaW5zcGVjdDModmFsdWUsIG9iaikpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uT2YoXCJTZXRcIiwgc2V0U2l6ZS5jYWxsKG9iaiksIHNldFBhcnRzLCBpbmRlbnQpO1xuICAgICAgfVxuICAgICAgaWYgKGlzV2Vha01hcChvYmopKSB7XG4gICAgICAgIHJldHVybiB3ZWFrQ29sbGVjdGlvbk9mKFwiV2Vha01hcFwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1dlYWtTZXQob2JqKSkge1xuICAgICAgICByZXR1cm4gd2Vha0NvbGxlY3Rpb25PZihcIldlYWtTZXRcIik7XG4gICAgICB9XG4gICAgICBpZiAoaXNXZWFrUmVmKG9iaikpIHtcbiAgICAgICAgcmV0dXJuIHdlYWtDb2xsZWN0aW9uT2YoXCJXZWFrUmVmXCIpO1xuICAgICAgfVxuICAgICAgaWYgKGlzTnVtYmVyKG9iaikpIHtcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChpbnNwZWN0MyhOdW1iZXIob2JqKSkpO1xuICAgICAgfVxuICAgICAgaWYgKGlzQmlnSW50KG9iaikpIHtcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChpbnNwZWN0MyhiaWdJbnRWYWx1ZU9mLmNhbGwob2JqKSkpO1xuICAgICAgfVxuICAgICAgaWYgKGlzQm9vbGVhbihvYmopKSB7XG4gICAgICAgIHJldHVybiBtYXJrQm94ZWQoYm9vbGVhblZhbHVlT2YuY2FsbChvYmopKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1N0cmluZyhvYmopKSB7XG4gICAgICAgIHJldHVybiBtYXJrQm94ZWQoaW5zcGVjdDMoU3RyaW5nKG9iaikpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIG9iaiA9PT0gd2luZG93KSB7XG4gICAgICAgIHJldHVybiBcInsgW29iamVjdCBXaW5kb3ddIH1cIjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvYmogPT09IGdsb2JhbFRoaXMgfHwgdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvYmogPT09IGdsb2JhbCkge1xuICAgICAgICByZXR1cm4gXCJ7IFtvYmplY3QgZ2xvYmFsVGhpc10gfVwiO1xuICAgICAgfVxuICAgICAgaWYgKCFpc0RhdGUob2JqKSAmJiAhaXNSZWdFeHAob2JqKSkge1xuICAgICAgICB2YXIgeXMgPSBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpO1xuICAgICAgICB2YXIgaXNQbGFpbk9iamVjdCA9IGdQTyA/IGdQTyhvYmopID09PSBPYmplY3QucHJvdG90eXBlIDogb2JqIGluc3RhbmNlb2YgT2JqZWN0IHx8IG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xuICAgICAgICB2YXIgcHJvdG9UYWcgPSBvYmogaW5zdGFuY2VvZiBPYmplY3QgPyBcIlwiIDogXCJudWxsIHByb3RvdHlwZVwiO1xuICAgICAgICB2YXIgc3RyaW5nVGFnID0gIWlzUGxhaW5PYmplY3QgJiYgdG9TdHJpbmdUYWcgJiYgT2JqZWN0KG9iaikgPT09IG9iaiAmJiB0b1N0cmluZ1RhZyBpbiBvYmogPyAkc2xpY2UuY2FsbCh0b1N0cihvYmopLCA4LCAtMSkgOiBwcm90b1RhZyA/IFwiT2JqZWN0XCIgOiBcIlwiO1xuICAgICAgICB2YXIgY29uc3RydWN0b3JUYWcgPSBpc1BsYWluT2JqZWN0IHx8IHR5cGVvZiBvYmouY29uc3RydWN0b3IgIT09IFwiZnVuY3Rpb25cIiA/IFwiXCIgOiBvYmouY29uc3RydWN0b3IubmFtZSA/IG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgOiBcIlwiO1xuICAgICAgICB2YXIgdGFnID0gY29uc3RydWN0b3JUYWcgKyAoc3RyaW5nVGFnIHx8IHByb3RvVGFnID8gXCJbXCIgKyAkam9pbi5jYWxsKCRjb25jYXQuY2FsbChbXSwgc3RyaW5nVGFnIHx8IFtdLCBwcm90b1RhZyB8fCBbXSksIFwiOiBcIikgKyBcIl0gXCIgOiBcIlwiKTtcbiAgICAgICAgaWYgKHlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiB0YWcgKyBcInt9XCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGVudCkge1xuICAgICAgICAgIHJldHVybiB0YWcgKyBcIntcIiArIGluZGVudGVkSm9pbih5cywgaW5kZW50KSArIFwifVwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0YWcgKyBcInsgXCIgKyAkam9pbi5jYWxsKHlzLCBcIiwgXCIpICsgXCIgfVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFN0cmluZyhvYmopO1xuICAgIH07XG4gICAgZnVuY3Rpb24gd3JhcFF1b3RlcyhzLCBkZWZhdWx0U3R5bGUsIG9wdHMpIHtcbiAgICAgIHZhciBzdHlsZSA9IG9wdHMucXVvdGVTdHlsZSB8fCBkZWZhdWx0U3R5bGU7XG4gICAgICB2YXIgcXVvdGVDaGFyID0gcXVvdGVzW3N0eWxlXTtcbiAgICAgIHJldHVybiBxdW90ZUNoYXIgKyBzICsgcXVvdGVDaGFyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBxdW90ZShzKSB7XG4gICAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChTdHJpbmcocyksIC9cIi9nLCBcIiZxdW90O1wiKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2FuVHJ1c3RUb1N0cmluZyhvYmopIHtcbiAgICAgIHJldHVybiAhdG9TdHJpbmdUYWcgfHwgISh0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmICh0b1N0cmluZ1RhZyBpbiBvYmogfHwgdHlwZW9mIG9ialt0b1N0cmluZ1RhZ10gIT09IFwidW5kZWZpbmVkXCIpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNBcnJheShvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc0RhdGUob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IERhdGVdXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1JlZ0V4cChvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgUmVnRXhwXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNFcnJvcihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgRXJyb3JdXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1N0cmluZyhvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgU3RyaW5nXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNOdW1iZXIob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IE51bWJlcl1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzQm9vbGVhbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgQm9vbGVhbl1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzU3ltYm9sKG9iaikge1xuICAgICAgaWYgKGhhc1NoYW1tZWRTeW1ib2xzKSB7XG4gICAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogaW5zdGFuY2VvZiBTeW1ib2w7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJzeW1ib2xcIikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmICghb2JqIHx8IHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIgfHwgIXN5bVRvU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHN5bVRvU3RyaW5nLmNhbGwob2JqKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzQmlnSW50KG9iaikge1xuICAgICAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiAhPT0gXCJvYmplY3RcIiB8fCAhYmlnSW50VmFsdWVPZikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBiaWdJbnRWYWx1ZU9mLmNhbGwob2JqKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBoYXNPd24yID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSB8fCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBrZXkgaW4gdGhpcztcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGhhcyhvYmosIGtleSkge1xuICAgICAgcmV0dXJuIGhhc093bjIuY2FsbChvYmosIGtleSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvU3RyKG9iaikge1xuICAgICAgcmV0dXJuIG9iamVjdFRvU3RyaW5nLmNhbGwob2JqKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbmFtZU9mKGYpIHtcbiAgICAgIGlmIChmLm5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGYubmFtZTtcbiAgICAgIH1cbiAgICAgIHZhciBtID0gJG1hdGNoLmNhbGwoZnVuY3Rpb25Ub1N0cmluZy5jYWxsKGYpLCAvXmZ1bmN0aW9uXFxzKihbXFx3JF0rKS8pO1xuICAgICAgaWYgKG0pIHtcbiAgICAgICAgcmV0dXJuIG1bMV07XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5kZXhPZih4cywgeCkge1xuICAgICAgaWYgKHhzLmluZGV4T2YpIHtcbiAgICAgICAgcmV0dXJuIHhzLmluZGV4T2YoeCk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHhzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAoeHNbaV0gPT09IHgpIHtcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc01hcCh4KSB7XG4gICAgICBpZiAoIW1hcFNpemUgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgbWFwU2l6ZS5jYWxsKHgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHNldFNpemUuY2FsbCh4KTtcbiAgICAgICAgfSBjYXRjaCAocykge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgTWFwO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpc1dlYWtNYXAoeCkge1xuICAgICAgaWYgKCF3ZWFrTWFwSGFzIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHdlYWtNYXBIYXMuY2FsbCh4LCB3ZWFrTWFwSGFzKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB3ZWFrU2V0SGFzLmNhbGwoeCwgd2Vha1NldEhhcyk7XG4gICAgICAgIH0gY2F0Y2ggKHMpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geCBpbnN0YW5jZW9mIFdlYWtNYXA7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzV2Vha1JlZih4KSB7XG4gICAgICBpZiAoIXdlYWtSZWZEZXJlZiB8fCAheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICB3ZWFrUmVmRGVyZWYuY2FsbCh4KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzU2V0KHgpIHtcbiAgICAgIGlmICghc2V0U2l6ZSB8fCAheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBzZXRTaXplLmNhbGwoeCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbWFwU2l6ZS5jYWxsKHgpO1xuICAgICAgICB9IGNhdGNoIChtKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBTZXQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzV2Vha1NldCh4KSB7XG4gICAgICBpZiAoIXdlYWtTZXRIYXMgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgd2Vha1NldEhhcy5jYWxsKHgsIHdlYWtTZXRIYXMpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHdlYWtNYXBIYXMuY2FsbCh4LCB3ZWFrTWFwSGFzKTtcbiAgICAgICAgfSBjYXRjaCAocykge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgV2Vha1NldDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNFbGVtZW50KHgpIHtcbiAgICAgIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIEhUTUxFbGVtZW50ICE9PSBcInVuZGVmaW5lZFwiICYmIHggaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0eXBlb2YgeC5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgeC5nZXRBdHRyaWJ1dGUgPT09IFwiZnVuY3Rpb25cIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5zcGVjdFN0cmluZyhzdHIsIG9wdHMpIHtcbiAgICAgIGlmIChzdHIubGVuZ3RoID4gb3B0cy5tYXhTdHJpbmdMZW5ndGgpIHtcbiAgICAgICAgdmFyIHJlbWFpbmluZyA9IHN0ci5sZW5ndGggLSBvcHRzLm1heFN0cmluZ0xlbmd0aDtcbiAgICAgICAgdmFyIHRyYWlsZXIgPSBcIi4uLiBcIiArIHJlbWFpbmluZyArIFwiIG1vcmUgY2hhcmFjdGVyXCIgKyAocmVtYWluaW5nID4gMSA/IFwic1wiIDogXCJcIik7XG4gICAgICAgIHJldHVybiBpbnNwZWN0U3RyaW5nKCRzbGljZS5jYWxsKHN0ciwgMCwgb3B0cy5tYXhTdHJpbmdMZW5ndGgpLCBvcHRzKSArIHRyYWlsZXI7XG4gICAgICB9XG4gICAgICB2YXIgcXVvdGVSRSA9IHF1b3RlUkVzW29wdHMucXVvdGVTdHlsZSB8fCBcInNpbmdsZVwiXTtcbiAgICAgIHF1b3RlUkUubGFzdEluZGV4ID0gMDtcbiAgICAgIHZhciBzID0gJHJlcGxhY2UuY2FsbCgkcmVwbGFjZS5jYWxsKHN0ciwgcXVvdGVSRSwgXCJcXFxcJDFcIiksIC9bXFx4MDAtXFx4MWZdL2csIGxvd2J5dGUpO1xuICAgICAgcmV0dXJuIHdyYXBRdW90ZXMocywgXCJzaW5nbGVcIiwgb3B0cyk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGxvd2J5dGUoYykge1xuICAgICAgdmFyIG4gPSBjLmNoYXJDb2RlQXQoMCk7XG4gICAgICB2YXIgeCA9IHtcbiAgICAgICAgODogXCJiXCIsXG4gICAgICAgIDk6IFwidFwiLFxuICAgICAgICAxMDogXCJuXCIsXG4gICAgICAgIDEyOiBcImZcIixcbiAgICAgICAgMTM6IFwiclwiXG4gICAgICB9W25dO1xuICAgICAgaWYgKHgpIHtcbiAgICAgICAgcmV0dXJuIFwiXFxcXFwiICsgeDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcIlxcXFx4XCIgKyAobiA8IDE2ID8gXCIwXCIgOiBcIlwiKSArICR0b1VwcGVyQ2FzZS5jYWxsKG4udG9TdHJpbmcoMTYpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbWFya0JveGVkKHN0cikge1xuICAgICAgcmV0dXJuIFwiT2JqZWN0KFwiICsgc3RyICsgXCIpXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHdlYWtDb2xsZWN0aW9uT2YodHlwZSkge1xuICAgICAgcmV0dXJuIHR5cGUgKyBcIiB7ID8gfVwiO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb2xsZWN0aW9uT2YodHlwZSwgc2l6ZSwgZW50cmllcywgaW5kZW50KSB7XG4gICAgICB2YXIgam9pbmVkRW50cmllcyA9IGluZGVudCA/IGluZGVudGVkSm9pbihlbnRyaWVzLCBpbmRlbnQpIDogJGpvaW4uY2FsbChlbnRyaWVzLCBcIiwgXCIpO1xuICAgICAgcmV0dXJuIHR5cGUgKyBcIiAoXCIgKyBzaXplICsgXCIpIHtcIiArIGpvaW5lZEVudHJpZXMgKyBcIn1cIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2luZ2xlTGluZVZhbHVlcyh4cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaW5kZXhPZih4c1tpXSwgXCJcXG5cIikgPj0gMCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldEluZGVudChvcHRzLCBkZXB0aCkge1xuICAgICAgdmFyIGJhc2VJbmRlbnQ7XG4gICAgICBpZiAob3B0cy5pbmRlbnQgPT09IFwiXHRcIikge1xuICAgICAgICBiYXNlSW5kZW50ID0gXCJcdFwiO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0cy5pbmRlbnQgPT09IFwibnVtYmVyXCIgJiYgb3B0cy5pbmRlbnQgPiAwKSB7XG4gICAgICAgIGJhc2VJbmRlbnQgPSAkam9pbi5jYWxsKEFycmF5KG9wdHMuaW5kZW50ICsgMSksIFwiIFwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYmFzZTogYmFzZUluZGVudCxcbiAgICAgICAgcHJldjogJGpvaW4uY2FsbChBcnJheShkZXB0aCArIDEpLCBiYXNlSW5kZW50KVxuICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5kZW50ZWRKb2luKHhzLCBpbmRlbnQpIHtcbiAgICAgIGlmICh4cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICB9XG4gICAgICB2YXIgbGluZUpvaW5lciA9IFwiXFxuXCIgKyBpbmRlbnQucHJldiArIGluZGVudC5iYXNlO1xuICAgICAgcmV0dXJuIGxpbmVKb2luZXIgKyAkam9pbi5jYWxsKHhzLCBcIixcIiArIGxpbmVKb2luZXIpICsgXCJcXG5cIiArIGluZGVudC5wcmV2O1xuICAgIH1cbiAgICBmdW5jdGlvbiBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpIHtcbiAgICAgIHZhciBpc0FyciA9IGlzQXJyYXkob2JqKTtcbiAgICAgIHZhciB4cyA9IFtdO1xuICAgICAgaWYgKGlzQXJyKSB7XG4gICAgICAgIHhzLmxlbmd0aCA9IG9iai5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgeHNbaV0gPSBoYXMob2JqLCBpKSA/IGluc3BlY3QzKG9ialtpXSwgb2JqKSA6IFwiXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBzeW1zID0gdHlwZW9mIGdPUFMgPT09IFwiZnVuY3Rpb25cIiA/IGdPUFMob2JqKSA6IFtdO1xuICAgICAgdmFyIHN5bU1hcDtcbiAgICAgIGlmIChoYXNTaGFtbWVkU3ltYm9scykge1xuICAgICAgICBzeW1NYXAgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCBzeW1zLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgc3ltTWFwW1wiJFwiICsgc3ltc1trXV0gPSBzeW1zW2tdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmICghaGFzKG9iaiwga2V5KSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc0FyciAmJiBTdHJpbmcoTnVtYmVyKGtleSkpID09PSBrZXkgJiYga2V5IDwgb2JqLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYXNTaGFtbWVkU3ltYm9scyAmJiBzeW1NYXBbXCIkXCIgKyBrZXldIGluc3RhbmNlb2YgU3ltYm9sKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAoJHRlc3QuY2FsbCgvW15cXHckXS8sIGtleSkpIHtcbiAgICAgICAgICB4cy5wdXNoKGluc3BlY3QzKGtleSwgb2JqKSArIFwiOiBcIiArIGluc3BlY3QzKG9ialtrZXldLCBvYmopKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB4cy5wdXNoKGtleSArIFwiOiBcIiArIGluc3BlY3QzKG9ialtrZXldLCBvYmopKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBnT1BTID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzeW1zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKGlzRW51bWVyYWJsZS5jYWxsKG9iaiwgc3ltc1tqXSkpIHtcbiAgICAgICAgICAgIHhzLnB1c2goXCJbXCIgKyBpbnNwZWN0MyhzeW1zW2pdKSArIFwiXTogXCIgKyBpbnNwZWN0MyhvYmpbc3ltc1tqXV0sIG9iaikpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHhzO1xuICAgIH1cbiAgfVxufSk7XG5cbi8vIHNyYy9saWIvdGltZV9kdXJhdGlvbi50c1xudmFyIFRpbWVEdXJhdGlvbiA9IGNsYXNzIF9UaW1lRHVyYXRpb24ge1xuICBfX3RpbWVfZHVyYXRpb25fbWljcm9zX187XG4gIHN0YXRpYyBNSUNST1NfUEVSX01JTExJUyA9IDEwMDBuO1xuICAvKipcbiAgICogR2V0IHRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUge0BsaW5rIFRpbWVEdXJhdGlvbn0gdHlwZS5cbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XG4gICAgICBlbGVtZW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJfX3RpbWVfZHVyYXRpb25fbWljcm9zX19cIixcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLkk2NFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG4gIH1cbiAgc3RhdGljIGlzVGltZUR1cmF0aW9uKGFsZ2VicmFpY1R5cGUpIHtcbiAgICBpZiAoYWxnZWJyYWljVHlwZS50YWcgIT09IFwiUHJvZHVjdFwiKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGVsZW1lbnRzID0gYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cztcbiAgICBpZiAoZWxlbWVudHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IG1pY3Jvc0VsZW1lbnQgPSBlbGVtZW50c1swXTtcbiAgICByZXR1cm4gbWljcm9zRWxlbWVudC5uYW1lID09PSBcIl9fdGltZV9kdXJhdGlvbl9taWNyb3NfX1wiICYmIG1pY3Jvc0VsZW1lbnQuYWxnZWJyYWljVHlwZS50YWcgPT09IFwiSTY0XCI7XG4gIH1cbiAgZ2V0IG1pY3JvcygpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWVfZHVyYXRpb25fbWljcm9zX187XG4gIH1cbiAgZ2V0IG1pbGxpcygpIHtcbiAgICByZXR1cm4gTnVtYmVyKHRoaXMubWljcm9zIC8gX1RpbWVEdXJhdGlvbi5NSUNST1NfUEVSX01JTExJUyk7XG4gIH1cbiAgY29uc3RydWN0b3IobWljcm9zKSB7XG4gICAgdGhpcy5fX3RpbWVfZHVyYXRpb25fbWljcm9zX18gPSBtaWNyb3M7XG4gIH1cbiAgc3RhdGljIGZyb21NaWxsaXMobWlsbGlzKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uKEJpZ0ludChtaWxsaXMpICogX1RpbWVEdXJhdGlvbi5NSUNST1NfUEVSX01JTExJUyk7XG4gIH1cbiAgLyoqIFRoaXMgb3V0cHV0cyB0aGUgc2FtZSBzdHJpbmcgZm9ybWF0IHRoYXQgd2UgdXNlIGluIHRoZSBob3N0IGFuZCBpbiBSdXN0IG1vZHVsZXMgKi9cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgbWljcm9zID0gdGhpcy5taWNyb3M7XG4gICAgY29uc3Qgc2lnbiA9IG1pY3JvcyA8IDAgPyBcIi1cIiA6IFwiK1wiO1xuICAgIGNvbnN0IHBvcyA9IG1pY3JvcyA8IDAgPyAtbWljcm9zIDogbWljcm9zO1xuICAgIGNvbnN0IHNlY3MgPSBwb3MgLyAxMDAwMDAwbjtcbiAgICBjb25zdCBtaWNyb3NfcmVtYWluaW5nID0gcG9zICUgMTAwMDAwMG47XG4gICAgcmV0dXJuIGAke3NpZ259JHtzZWNzfS4ke1N0cmluZyhtaWNyb3NfcmVtYWluaW5nKS5wYWRTdGFydCg2LCBcIjBcIil9YDtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi90aW1lc3RhbXAudHNcbnZhciBUaW1lc3RhbXAgPSBjbGFzcyBfVGltZXN0YW1wIHtcbiAgX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcbiAgc3RhdGljIE1JQ1JPU19QRVJfTUlMTElTID0gMTAwMG47XG4gIGdldCBtaWNyb3NTaW5jZVVuaXhFcG9jaCgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xuICB9XG4gIGNvbnN0cnVjdG9yKG1pY3Jvcykge1xuICAgIHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXyA9IG1pY3JvcztcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUge0BsaW5rIFRpbWVzdGFtcH0gdHlwZS5cbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XG4gICAgICBlbGVtZW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXCIsXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogQWxnZWJyYWljVHlwZS5JNjRcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pO1xuICB9XG4gIHN0YXRpYyBpc1RpbWVzdGFtcChhbGdlYnJhaWNUeXBlKSB7XG4gICAgaWYgKGFsZ2VicmFpY1R5cGUudGFnICE9PSBcIlByb2R1Y3RcIikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBlbGVtZW50cyA9IGFsZ2VicmFpY1R5cGUudmFsdWUuZWxlbWVudHM7XG4gICAgaWYgKGVsZW1lbnRzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBtaWNyb3NFbGVtZW50ID0gZWxlbWVudHNbMF07XG4gICAgcmV0dXJuIG1pY3Jvc0VsZW1lbnQubmFtZSA9PT0gXCJfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXCIgJiYgbWljcm9zRWxlbWVudC5hbGdlYnJhaWNUeXBlLnRhZyA9PT0gXCJJNjRcIjtcbiAgfVxuICAvKipcbiAgICogVGhlIFVuaXggZXBvY2gsIHRoZSBtaWRuaWdodCBhdCB0aGUgYmVnaW5uaW5nIG9mIEphbnVhcnkgMSwgMTk3MCwgVVRDLlxuICAgKi9cbiAgc3RhdGljIFVOSVhfRVBPQ0ggPSBuZXcgX1RpbWVzdGFtcCgwbik7XG4gIC8qKlxuICAgKiBHZXQgYSBgVGltZXN0YW1wYCByZXByZXNlbnRpbmcgdGhlIGV4ZWN1dGlvbiBlbnZpcm9ubWVudCdzIGJlbGllZiBvZiB0aGUgY3VycmVudCBtb21lbnQgaW4gdGltZS5cbiAgICovXG4gIHN0YXRpYyBub3coKSB7XG4gICAgcmV0dXJuIF9UaW1lc3RhbXAuZnJvbURhdGUoLyogQF9fUFVSRV9fICovIG5ldyBEYXRlKCkpO1xuICB9XG4gIC8qKiBDb252ZXJ0IHRvIG1pbGxpc2Vjb25kcyBzaW5jZSBVbml4IGVwb2NoLiAqL1xuICB0b01pbGxpcygpIHtcbiAgICByZXR1cm4gdGhpcy5taWNyb3NTaW5jZVVuaXhFcG9jaCAvIDEwMDBuO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgYSBgVGltZXN0YW1wYCByZXByZXNlbnRpbmcgdGhlIHNhbWUgcG9pbnQgaW4gdGltZSBhcyBgZGF0ZWAuXG4gICAqL1xuICBzdGF0aWMgZnJvbURhdGUoZGF0ZSkge1xuICAgIGNvbnN0IG1pbGxpcyA9IGRhdGUuZ2V0VGltZSgpO1xuICAgIGNvbnN0IG1pY3JvcyA9IEJpZ0ludChtaWxsaXMpICogX1RpbWVzdGFtcC5NSUNST1NfUEVSX01JTExJUztcbiAgICByZXR1cm4gbmV3IF9UaW1lc3RhbXAobWljcm9zKTtcbiAgfVxuICAvKipcbiAgICogR2V0IGEgYERhdGVgIHJlcHJlc2VudGluZyBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIHBvaW50IGluIHRpbWUgYXMgYHRoaXNgLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCB0cnVuY2F0ZXMgdG8gbWlsbGlzZWNvbmQgcHJlY2lzaW9uLFxuICAgKiBhbmQgdGhyb3dzIGBSYW5nZUVycm9yYCBpZiB0aGUgYFRpbWVzdGFtcGAgaXMgb3V0c2lkZSB0aGUgcmFuZ2UgcmVwcmVzZW50YWJsZSBhcyBhIGBEYXRlYC5cbiAgICovXG4gIHRvRGF0ZSgpIHtcbiAgICBjb25zdCBtaWNyb3MgPSB0aGlzLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX187XG4gICAgY29uc3QgbWlsbGlzID0gbWljcm9zIC8gX1RpbWVzdGFtcC5NSUNST1NfUEVSX01JTExJUztcbiAgICBpZiAobWlsbGlzID4gQmlnSW50KE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSB8fCBtaWxsaXMgPCBCaWdJbnQoTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIpKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgICAgXCJUaW1lc3RhbXAgaXMgb3V0c2lkZSBvZiB0aGUgcmVwcmVzZW50YWJsZSByYW5nZSBvZiBKUydzIERhdGVcIlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBEYXRlKE51bWJlcihtaWxsaXMpKTtcbiAgfVxuICAvKipcbiAgICogR2V0IGFuIElTTyA4NjAxIC8gUkZDIDMzMzkgZm9ybWF0dGVkIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHRpbWVzdGFtcCB3aXRoIG1pY3Jvc2Vjb25kIHByZWNpc2lvbi5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgcHJlc2VydmVzIHRoZSBmdWxsIG1pY3Jvc2Vjb25kIHByZWNpc2lvbiBvZiB0aGUgdGltZXN0YW1wLFxuICAgKiBhbmQgdGhyb3dzIGBSYW5nZUVycm9yYCBpZiB0aGUgYFRpbWVzdGFtcGAgaXMgb3V0c2lkZSB0aGUgcmFuZ2UgcmVwcmVzZW50YWJsZSBpbiBJU08gZm9ybWF0LlxuICAgKlxuICAgKiBAcmV0dXJucyBJU08gODYwMSBmb3JtYXR0ZWQgc3RyaW5nIHdpdGggbWljcm9zZWNvbmQgcHJlY2lzaW9uIChlLmcuLCAnMjAyNS0wMi0xN1QxMDozMDo0NS4xMjM0NTZaJylcbiAgICovXG4gIHRvSVNPU3RyaW5nKCkge1xuICAgIGNvbnN0IG1pY3JvcyA9IHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcbiAgICBjb25zdCBtaWxsaXMgPSBtaWNyb3MgLyBfVGltZXN0YW1wLk1JQ1JPU19QRVJfTUlMTElTO1xuICAgIGlmIChtaWxsaXMgPiBCaWdJbnQoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHx8IG1pbGxpcyA8IEJpZ0ludChOdW1iZXIuTUlOX1NBRkVfSU5URUdFUikpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxuICAgICAgICBcIlRpbWVzdGFtcCBpcyBvdXRzaWRlIG9mIHRoZSByZXByZXNlbnRhYmxlIHJhbmdlIGZvciBJU08gc3RyaW5nIGZvcm1hdHRpbmdcIlxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKE51bWJlcihtaWxsaXMpKTtcbiAgICBjb25zdCBpc29CYXNlID0gZGF0ZS50b0lTT1N0cmluZygpO1xuICAgIGNvbnN0IG1pY3Jvc1JlbWFpbmRlciA9IE1hdGguYWJzKE51bWJlcihtaWNyb3MgJSAxMDAwMDAwbikpO1xuICAgIGNvbnN0IGZyYWN0aW9uYWxQYXJ0ID0gU3RyaW5nKG1pY3Jvc1JlbWFpbmRlcikucGFkU3RhcnQoNiwgXCIwXCIpO1xuICAgIHJldHVybiBpc29CYXNlLnJlcGxhY2UoL1xcLlxcZHszfVokLywgYC4ke2ZyYWN0aW9uYWxQYXJ0fVpgKTtcbiAgfVxuICBzaW5jZShvdGhlcikge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uKFxuICAgICAgdGhpcy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fIC0gb3RoZXIuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfX1xuICAgICk7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvdXVpZC50c1xudmFyIFV1aWQgPSBjbGFzcyBfVXVpZCB7XG4gIF9fdXVpZF9fO1xuICAvKipcbiAgICogVGhlIG5pbCBVVUlEIChhbGwgemVyb3MpLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGB0c1xuICAgKiBjb25zdCB1dWlkID0gVXVpZC5OSUw7XG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxuICAgKiAgIHV1aWQudG9TdHJpbmcoKSA9PT0gXCIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDBcIlxuICAgKiApO1xuICAgKiBgYGBcbiAgICovXG4gIHN0YXRpYyBOSUwgPSBuZXcgX1V1aWQoMG4pO1xuICBzdGF0aWMgTUFYX1VVSURfQklHSU5UID0gMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm47XG4gIC8qKlxuICAgKiBUaGUgbWF4IFVVSUQgKGFsbCBvbmVzKS5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHNcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuTUFYO1xuICAgKiBjb25zb2xlLmFzc2VydChcbiAgICogICB1dWlkLnRvU3RyaW5nKCkgPT09IFwiZmZmZmZmZmYtZmZmZi1mZmZmLWZmZmYtZmZmZmZmZmZmZmZmXCJcbiAgICogKTtcbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgTUFYID0gbmV3IF9VdWlkKF9VdWlkLk1BWF9VVUlEX0JJR0lOVCk7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBVVUlEIGZyb20gYSByYXcgMTI4LWJpdCB2YWx1ZS5cbiAgICpcbiAgICogQHBhcmFtIHUgLSBVbnNpZ25lZCAxMjgtYml0IGludGVnZXJcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSB2YWx1ZSBpcyBvdXRzaWRlIHRoZSB2YWxpZCBVVUlEIHJhbmdlXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih1KSB7XG4gICAgaWYgKHUgPCAwbiB8fCB1ID4gX1V1aWQuTUFYX1VVSURfQklHSU5UKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIFVVSUQ6IG11c3QgYmUgYmV0d2VlbiAwIGFuZCBgTUFYX1VVSURfQklHSU5UYFwiKTtcbiAgICB9XG4gICAgdGhpcy5fX3V1aWRfXyA9IHU7XG4gIH1cbiAgLyoqXG4gICAqIENyZWF0ZSBhIFVVSUQgYHY0YCBmcm9tIGV4cGxpY2l0IHJhbmRvbSBieXRlcy5cbiAgICpcbiAgICogVGhpcyBtZXRob2QgYXNzdW1lcyB0aGUgYnl0ZXMgYXJlIGFscmVhZHkgc3VmZmljaWVudGx5IHJhbmRvbS5cbiAgICogSXQgb25seSBzZXRzIHRoZSBhcHByb3ByaWF0ZSBiaXRzIGZvciB0aGUgVVVJRCB2ZXJzaW9uIGFuZCB2YXJpYW50LlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgLSBFeGFjdGx5IDE2IHJhbmRvbSBieXRlc1xuICAgKiBAcmV0dXJucyBBIFVVSUQgYHY0YFxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgYGJ5dGVzLmxlbmd0aCAhPT0gMTZgXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHRzXG4gICAqIGNvbnN0IHJhbmRvbUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoMTYpO1xuICAgKiBjb25zdCB1dWlkID0gVXVpZC5mcm9tUmFuZG9tQnl0ZXNWNChyYW5kb21CeXRlcyk7XG4gICAqXG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxuICAgKiAgIHV1aWQudG9TdHJpbmcoKSA9PT0gXCIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDBcIlxuICAgKiApO1xuICAgKiBgYGBcbiAgICovXG4gIHN0YXRpYyBmcm9tUmFuZG9tQnl0ZXNWNChieXRlcykge1xuICAgIGlmIChieXRlcy5sZW5ndGggIT09IDE2KSB0aHJvdyBuZXcgRXJyb3IoXCJVVUlEIHY0IHJlcXVpcmVzIDE2IGJ5dGVzXCIpO1xuICAgIGNvbnN0IGFyciA9IG5ldyBVaW50OEFycmF5KGJ5dGVzKTtcbiAgICBhcnJbNl0gPSBhcnJbNl0gJiAxNSB8IDY0O1xuICAgIGFycls4XSA9IGFycls4XSAmIDYzIHwgMTI4O1xuICAgIHJldHVybiBuZXcgX1V1aWQoX1V1aWQuYnl0ZXNUb0JpZ0ludChhcnIpKTtcbiAgfVxuICAvKipcbiAgICogR2VuZXJhdGUgYSBVVUlEIGB2N2AgdXNpbmcgYSBtb25vdG9uaWMgY291bnRlciBmcm9tIGAwYCB0byBgMl4zMSAtIDFgLFxuICAgKiBhIHRpbWVzdGFtcCwgYW5kIDQgcmFuZG9tIGJ5dGVzLlxuICAgKlxuICAgKiBUaGUgY291bnRlciB3cmFwcyBhcm91bmQgb24gb3ZlcmZsb3cuXG4gICAqXG4gICAqIFRoZSBVVUlEIGB2N2AgaXMgc3RydWN0dXJlZCBhcyBmb2xsb3dzOlxuICAgKlxuICAgKiBgYGBhc2NpaVxuICAgKiDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJBcbiAgICogfCBCMCAgfCBCMSAgfCBCMiAgfCBCMyAgfCBCNCAgfCBCNSAgICAgICAgICAgICAgfCAgICAgICAgIEI2ICAgICAgICB8XG4gICAqIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpFxuICAgKiB8ICAgICAgICAgICAgICAgICB1bml4X3RzX21zICAgICAgICAgICAgICAgICAgICB8ICAgICAgdmVyc2lvbiA3ICAgIHxcbiAgICog4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXG4gICAqIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxuICAgKiB8IEI3ICAgICAgICAgICB8IEI4ICAgICAgfCBCOSAgfCBCMTAgfCBCMTEgIHwgQjEyIHwgQjEzIHwgQjE0IHwgQjE1IHxcbiAgICog4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkXG4gICAqIHwgY291bnRlcl9oaWdoIHwgdmFyaWFudCB8ICAgIGNvdW50ZXJfbG93ICAgfCAgICAgICAgcmFuZG9tICAgICAgICAgfFxuICAgKiDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilLTilIDilIDilIDilIDilIDilIDilIDilIDilIDilLTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilLTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJhcbiAgICogYGBgXG4gICAqXG4gICAqIEBwYXJhbSBjb3VudGVyIC0gTXV0YWJsZSBtb25vdG9uaWMgY291bnRlciAoMzEtYml0KVxuICAgKiBAcGFyYW0gbm93IC0gVGltZXN0YW1wIHNpbmNlIHRoZSBVbml4IGVwb2NoXG4gICAqIEBwYXJhbSByYW5kb21CeXRlcyAtIEV4YWN0bHkgNCByYW5kb20gYnl0ZXNcbiAgICogQHJldHVybnMgQSBVVUlEIGB2N2BcbiAgICpcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBgY291bnRlcmAgaXMgbmVnYXRpdmVcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBgdGltZXN0YW1wYCBpcyBiZWZvcmUgdGhlIFVuaXggZXBvY2hcbiAgICogQHRocm93cyB7RXJyb3J9IElmIGByYW5kb21CeXRlcy5sZW5ndGggIT09IDRgXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHRzXG4gICAqIGNvbnN0IG5vdyA9IFRpbWVzdGFtcC5mcm9tTWlsbGlzKDFfNjg2XzAwMF8wMDBfMDAwbik7XG4gICAqIGNvbnN0IGNvdW50ZXIgPSB7IHZhbHVlOiAxIH07XG4gICAqIGNvbnN0IHJhbmRvbUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoNCk7XG4gICAqXG4gICAqIGNvbnN0IHV1aWQgPSBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgbm93LCByYW5kb21CeXRlcyk7XG4gICAqXG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxuICAgKiAgIHV1aWQudG9TdHJpbmcoKSA9PT0gXCIwMDAwNjQ3ZS01MTgwLTcwMDAtODAwMC0wMDAyMDAwMDAwMDBcIlxuICAgKiApO1xuICAgKiBgYGBcbiAgICovXG4gIHN0YXRpYyBmcm9tQ291bnRlclY3KGNvdW50ZXIsIG5vdywgcmFuZG9tQnl0ZXMpIHtcbiAgICBpZiAocmFuZG9tQnl0ZXMubGVuZ3RoICE9PSA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJgZnJvbUNvdW50ZXJWN2AgcmVxdWlyZXMgYHJhbmRvbUJ5dGVzLmxlbmd0aCA9PSA0YFwiKTtcbiAgICB9XG4gICAgaWYgKGNvdW50ZXIudmFsdWUgPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJgZnJvbUNvdW50ZXJWN2AgdXVpZCBgY291bnRlcmAgbXVzdCBiZSBub24tbmVnYXRpdmVcIik7XG4gICAgfVxuICAgIGlmIChub3cuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXyA8IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImBmcm9tQ291bnRlclY3YCBgdGltZXN0YW1wYCBiZWZvcmUgdW5peCBlcG9jaFwiKTtcbiAgICB9XG4gICAgY29uc3QgY291bnRlclZhbCA9IGNvdW50ZXIudmFsdWU7XG4gICAgY291bnRlci52YWx1ZSA9IGNvdW50ZXJWYWwgKyAxICYgMjE0NzQ4MzY0NztcbiAgICBjb25zdCB0c01zID0gbm93LnRvTWlsbGlzKCkgJiAweGZmZmZmZmZmZmZmZm47XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgxNik7XG4gICAgYnl0ZXNbMF0gPSBOdW1iZXIodHNNcyA+PiA0MG4gJiAweGZmbik7XG4gICAgYnl0ZXNbMV0gPSBOdW1iZXIodHNNcyA+PiAzMm4gJiAweGZmbik7XG4gICAgYnl0ZXNbMl0gPSBOdW1iZXIodHNNcyA+PiAyNG4gJiAweGZmbik7XG4gICAgYnl0ZXNbM10gPSBOdW1iZXIodHNNcyA+PiAxNm4gJiAweGZmbik7XG4gICAgYnl0ZXNbNF0gPSBOdW1iZXIodHNNcyA+PiA4biAmIDB4ZmZuKTtcbiAgICBieXRlc1s1XSA9IE51bWJlcih0c01zICYgMHhmZm4pO1xuICAgIGJ5dGVzWzddID0gY291bnRlclZhbCA+Pj4gMjMgJiAyNTU7XG4gICAgYnl0ZXNbOV0gPSBjb3VudGVyVmFsID4+PiAxNSAmIDI1NTtcbiAgICBieXRlc1sxMF0gPSBjb3VudGVyVmFsID4+PiA3ICYgMjU1O1xuICAgIGJ5dGVzWzExXSA9IChjb3VudGVyVmFsICYgMTI3KSA8PCAxICYgMjU1O1xuICAgIGJ5dGVzWzEyXSB8PSByYW5kb21CeXRlc1swXSAmIDEyNztcbiAgICBieXRlc1sxM10gPSByYW5kb21CeXRlc1sxXTtcbiAgICBieXRlc1sxNF0gPSByYW5kb21CeXRlc1syXTtcbiAgICBieXRlc1sxNV0gPSByYW5kb21CeXRlc1szXTtcbiAgICBieXRlc1s2XSA9IGJ5dGVzWzZdICYgMTUgfCAxMTI7XG4gICAgYnl0ZXNbOF0gPSBieXRlc1s4XSAmIDYzIHwgMTI4O1xuICAgIHJldHVybiBuZXcgX1V1aWQoX1V1aWQuYnl0ZXNUb0JpZ0ludChieXRlcykpO1xuICB9XG4gIC8qKlxuICAgKiBQYXJzZSBhIFVVSUQgZnJvbSBhIHN0cmluZyByZXByZXNlbnRhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHMgLSBVVUlEIHN0cmluZ1xuICAgKiBAcmV0dXJucyBQYXJzZWQgVVVJRFxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHN0cmluZyBpcyBub3QgYSB2YWxpZCBVVUlEXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIGBgYHRzXG4gICAqIGNvbnN0IHMgPSBcIjAxODg4ZDZlLTVjMDAtNzAwMC04MDAwLTAwMDAwMDAwMDAwMFwiO1xuICAgKiBjb25zdCB1dWlkID0gVXVpZC5wYXJzZShzKTtcbiAgICpcbiAgICogY29uc29sZS5hc3NlcnQodXVpZC50b1N0cmluZygpID09PSBzKTtcbiAgICogYGBgXG4gICAqL1xuICBzdGF0aWMgcGFyc2Uocykge1xuICAgIGNvbnN0IGhleCA9IHMucmVwbGFjZSgvLS9nLCBcIlwiKTtcbiAgICBpZiAoaGV4Lmxlbmd0aCAhPT0gMzIpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaGV4IFVVSURcIik7XG4gICAgbGV0IHYgPSAwbjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDMyOyBpICs9IDIpIHtcbiAgICAgIHYgPSB2IDw8IDhuIHwgQmlnSW50KHBhcnNlSW50KGhleC5zbGljZShpLCBpICsgMiksIDE2KSk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgX1V1aWQodik7XG4gIH1cbiAgLyoqIENvbnZlcnQgdG8gc3RyaW5nIChoeXBoZW5hdGVkIGZvcm0pLiAqL1xuICB0b1N0cmluZygpIHtcbiAgICBjb25zdCBieXRlcyA9IF9VdWlkLmJpZ0ludFRvQnl0ZXModGhpcy5fX3V1aWRfXyk7XG4gICAgY29uc3QgaGV4ID0gWy4uLmJ5dGVzXS5tYXAoKGIpID0+IGIudG9TdHJpbmcoMTYpLnBhZFN0YXJ0KDIsIFwiMFwiKSkuam9pbihcIlwiKTtcbiAgICByZXR1cm4gaGV4LnNsaWNlKDAsIDgpICsgXCItXCIgKyBoZXguc2xpY2UoOCwgMTIpICsgXCItXCIgKyBoZXguc2xpY2UoMTIsIDE2KSArIFwiLVwiICsgaGV4LnNsaWNlKDE2LCAyMCkgKyBcIi1cIiArIGhleC5zbGljZSgyMCk7XG4gIH1cbiAgLyoqIENvbnZlcnQgdG8gYmlnaW50ICh1MTI4KS4gKi9cbiAgYXNCaWdJbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX191dWlkX187XG4gIH1cbiAgLyoqIFJldHVybiBhIGBVaW50OEFycmF5YCBvZiAxNiBieXRlcy4gKi9cbiAgdG9CeXRlcygpIHtcbiAgICByZXR1cm4gX1V1aWQuYmlnSW50VG9CeXRlcyh0aGlzLl9fdXVpZF9fKTtcbiAgfVxuICBzdGF0aWMgYnl0ZXNUb0JpZ0ludChieXRlcykge1xuICAgIGxldCByZXN1bHQgPSAwbjtcbiAgICBmb3IgKGNvbnN0IGIgb2YgYnl0ZXMpIHJlc3VsdCA9IHJlc3VsdCA8PCA4biB8IEJpZ0ludChiKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIHN0YXRpYyBiaWdJbnRUb0J5dGVzKHZhbHVlKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgxNik7XG4gICAgZm9yIChsZXQgaSA9IDE1OyBpID49IDA7IGktLSkge1xuICAgICAgYnl0ZXNbaV0gPSBOdW1iZXIodmFsdWUgJiAweGZmbik7XG4gICAgICB2YWx1ZSA+Pj0gOG47XG4gICAgfVxuICAgIHJldHVybiBieXRlcztcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmVyc2lvbiBvZiB0aGlzIFVVSUQuXG4gICAqXG4gICAqIFRoaXMgcmVwcmVzZW50cyB0aGUgYWxnb3JpdGhtIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIHZhbHVlLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIGBVdWlkVmVyc2lvbmBcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSB2ZXJzaW9uIGZpZWxkIGlzIG5vdCByZWNvZ25pemVkXG4gICAqL1xuICBnZXRWZXJzaW9uKCkge1xuICAgIGNvbnN0IHZlcnNpb24gPSB0aGlzLnRvQnl0ZXMoKVs2XSA+PiA0ICYgMTU7XG4gICAgc3dpdGNoICh2ZXJzaW9uKSB7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIHJldHVybiBcIlY0XCI7XG4gICAgICBjYXNlIDc6XG4gICAgICAgIHJldHVybiBcIlY3XCI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAodGhpcyA9PSBfVXVpZC5OSUwpIHtcbiAgICAgICAgICByZXR1cm4gXCJOaWxcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcyA9PSBfVXVpZC5NQVgpIHtcbiAgICAgICAgICByZXR1cm4gXCJNYXhcIjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIFVVSUQgdmVyc2lvbjogJHt2ZXJzaW9ufWApO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogRXh0cmFjdCB0aGUgbW9ub3RvbmljIGNvdW50ZXIgZnJvbSBhIFVVSUR2Ny5cbiAgICpcbiAgICogSW50ZW5kZWQgZm9yIHRlc3RpbmcgYW5kIGRpYWdub3N0aWNzLlxuICAgKiBCZWhhdmlvciBpcyB1bmRlZmluZWQgaWYgY2FsbGVkIG9uIGEgbm9uLVY3IFVVSUQuXG4gICAqXG4gICAqIEByZXR1cm5zIDMxLWJpdCBjb3VudGVyIHZhbHVlXG4gICAqL1xuICBnZXRDb3VudGVyKCkge1xuICAgIGNvbnN0IGJ5dGVzID0gdGhpcy50b0J5dGVzKCk7XG4gICAgY29uc3QgaGlnaCA9IGJ5dGVzWzddO1xuICAgIGNvbnN0IG1pZDEgPSBieXRlc1s5XTtcbiAgICBjb25zdCBtaWQyID0gYnl0ZXNbMTBdO1xuICAgIGNvbnN0IGxvdyA9IGJ5dGVzWzExXSA+Pj4gMTtcbiAgICByZXR1cm4gaGlnaCA8PCAyMyB8IG1pZDEgPDwgMTUgfCBtaWQyIDw8IDcgfCBsb3cgfCAwO1xuICB9XG4gIGNvbXBhcmVUbyhvdGhlcikge1xuICAgIGlmICh0aGlzLl9fdXVpZF9fIDwgb3RoZXIuX191dWlkX18pIHJldHVybiAtMTtcbiAgICBpZiAodGhpcy5fX3V1aWRfXyA+IG90aGVyLl9fdXVpZF9fKSByZXR1cm4gMTtcbiAgICByZXR1cm4gMDtcbiAgfVxuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcbiAgICAgIGVsZW1lbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIl9fdXVpZF9fXCIsXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogQWxnZWJyYWljVHlwZS5VMTI4XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi9iaW5hcnlfcmVhZGVyLnRzXG52YXIgQmluYXJ5UmVhZGVyID0gY2xhc3Mge1xuICAvKipcbiAgICogVGhlIERhdGFWaWV3IHVzZWQgdG8gcmVhZCB2YWx1ZXMgZnJvbSB0aGUgYmluYXJ5IGRhdGEuXG4gICAqXG4gICAqIE5vdGU6IFRoZSBEYXRhVmlldydzIGBieXRlT2Zmc2V0YCBpcyByZWxhdGl2ZSB0byB0aGUgYmVnaW5uaW5nIG9mIHRoZVxuICAgKiB1bmRlcmx5aW5nIEFycmF5QnVmZmVyLCBub3QgdGhlIHN0YXJ0IG9mIHRoZSBwcm92aWRlZCBVaW50OEFycmF5IGlucHV0LlxuICAgKiBUaGlzIGBCaW5hcnlSZWFkZXJgJ3MgYCNvZmZzZXRgIGZpZWxkIGlzIHVzZWQgdG8gdHJhY2sgdGhlIGN1cnJlbnQgcmVhZCBwb3NpdGlvblxuICAgKiByZWxhdGl2ZSB0byB0aGUgc3RhcnQgb2YgdGhlIHByb3ZpZGVkIFVpbnQ4QXJyYXkgaW5wdXQuXG4gICAqL1xuICB2aWV3O1xuICAvKipcbiAgICogUmVwcmVzZW50cyB0aGUgb2Zmc2V0IChpbiBieXRlcykgcmVsYXRpdmUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBEYXRhVmlld1xuICAgKiBhbmQgcHJvdmlkZWQgVWludDhBcnJheSBpbnB1dC5cbiAgICpcbiAgICogTm90ZTogVGhpcyBpcyAqbm90KiB0aGUgYWJzb2x1dGUgYnl0ZSBvZmZzZXQgd2l0aGluIHRoZSB1bmRlcmx5aW5nIEFycmF5QnVmZmVyLlxuICAgKi9cbiAgb2Zmc2V0ID0gMDtcbiAgY29uc3RydWN0b3IoaW5wdXQpIHtcbiAgICB0aGlzLnZpZXcgPSBpbnB1dCBpbnN0YW5jZW9mIERhdGFWaWV3ID8gaW5wdXQgOiBuZXcgRGF0YVZpZXcoaW5wdXQuYnVmZmVyLCBpbnB1dC5ieXRlT2Zmc2V0LCBpbnB1dC5ieXRlTGVuZ3RoKTtcbiAgICB0aGlzLm9mZnNldCA9IDA7XG4gIH1cbiAgcmVzZXQodmlldykge1xuICAgIHRoaXMudmlldyA9IHZpZXc7XG4gICAgdGhpcy5vZmZzZXQgPSAwO1xuICB9XG4gIGdldCByZW1haW5pbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMudmlldy5ieXRlTGVuZ3RoIC0gdGhpcy5vZmZzZXQ7XG4gIH1cbiAgLyoqIEVuc3VyZSB3ZSBoYXZlIGF0IGxlYXN0IGBuYCBieXRlcyBsZWZ0IHRvIHJlYWQgKi9cbiAgI2Vuc3VyZShuKSB7XG4gICAgaWYgKHRoaXMub2Zmc2V0ICsgbiA+IHRoaXMudmlldy5ieXRlTGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgICAgYFRyaWVkIHRvIHJlYWQgJHtufSBieXRlKHMpIGF0IHJlbGF0aXZlIG9mZnNldCAke3RoaXMub2Zmc2V0fSwgYnV0IG9ubHkgJHt0aGlzLnJlbWFpbmluZ30gYnl0ZShzKSByZW1haW5gXG4gICAgICApO1xuICAgIH1cbiAgfVxuICByZWFkVUludDhBcnJheSgpIHtcbiAgICBjb25zdCBsZW5ndGggPSB0aGlzLnJlYWRVMzIoKTtcbiAgICB0aGlzLiNlbnN1cmUobGVuZ3RoKTtcbiAgICByZXR1cm4gdGhpcy5yZWFkQnl0ZXMobGVuZ3RoKTtcbiAgfVxuICByZWFkQm9vbCgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRVaW50OCh0aGlzLm9mZnNldCk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcbiAgICByZXR1cm4gdmFsdWUgIT09IDA7XG4gIH1cbiAgcmVhZEJ5dGUoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0VWludDgodGhpcy5vZmZzZXQpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRCeXRlcyhsZW5ndGgpIHtcbiAgICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KFxuICAgICAgdGhpcy52aWV3LmJ1ZmZlcixcbiAgICAgIHRoaXMudmlldy5ieXRlT2Zmc2V0ICsgdGhpcy5vZmZzZXQsXG4gICAgICBsZW5ndGhcbiAgICApO1xuICAgIHRoaXMub2Zmc2V0ICs9IGxlbmd0aDtcbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cbiAgcmVhZEk4KCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldEludDgodGhpcy5vZmZzZXQpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRVOCgpIHtcbiAgICByZXR1cm4gdGhpcy5yZWFkQnl0ZSgpO1xuICB9XG4gIHJlYWRJMTYoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0SW50MTYodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDI7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRVMTYoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0VWludDE2KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAyO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkSTMyKCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldEludDMyKHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSA0O1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZWFkVTMyKCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQzMih0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZEk2NCgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gODtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZFU2NCgpIHtcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDg7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRVMTI4KCkge1xuICAgIGNvbnN0IGxvd2VyUGFydCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIGNvbnN0IHVwcGVyUGFydCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAxNjtcbiAgICByZXR1cm4gKHVwcGVyUGFydCA8PCBCaWdJbnQoNjQpKSArIGxvd2VyUGFydDtcbiAgfVxuICByZWFkSTEyOCgpIHtcbiAgICBjb25zdCBsb3dlclBhcnQgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcbiAgICBjb25zdCB1cHBlclBhcnQgPSB0aGlzLnZpZXcuZ2V0QmlnSW50NjQodGhpcy5vZmZzZXQgKyA4LCB0cnVlKTtcbiAgICB0aGlzLm9mZnNldCArPSAxNjtcbiAgICByZXR1cm4gKHVwcGVyUGFydCA8PCBCaWdJbnQoNjQpKSArIGxvd2VyUGFydDtcbiAgfVxuICByZWFkVTI1NigpIHtcbiAgICBjb25zdCBwMCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIGNvbnN0IHAxID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDgsIHRydWUpO1xuICAgIGNvbnN0IHAyID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDE2LCB0cnVlKTtcbiAgICBjb25zdCBwMyA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyAyNCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMzI7XG4gICAgcmV0dXJuIChwMyA8PCBCaWdJbnQoMyAqIDY0KSkgKyAocDIgPDwgQmlnSW50KDIgKiA2NCkpICsgKHAxIDw8IEJpZ0ludCgxICogNjQpKSArIHAwO1xuICB9XG4gIHJlYWRJMjU2KCkge1xuICAgIGNvbnN0IHAwID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgY29uc3QgcDEgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdHJ1ZSk7XG4gICAgY29uc3QgcDIgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgMTYsIHRydWUpO1xuICAgIGNvbnN0IHAzID0gdGhpcy52aWV3LmdldEJpZ0ludDY0KHRoaXMub2Zmc2V0ICsgMjQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDMyO1xuICAgIHJldHVybiAocDMgPDwgQmlnSW50KDMgKiA2NCkpICsgKHAyIDw8IEJpZ0ludCgyICogNjQpKSArIChwMSA8PCBCaWdJbnQoMSAqIDY0KSkgKyBwMDtcbiAgfVxuICByZWFkRjMyKCkge1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldEZsb2F0MzIodGhpcy5vZmZzZXQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJlYWRGNjQoKSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0RmxvYXQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gODtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmVhZFN0cmluZygpIHtcbiAgICBjb25zdCB1aW50OEFycmF5ID0gdGhpcy5yZWFkVUludDhBcnJheSgpO1xuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoXCJ1dGYtOFwiKS5kZWNvZGUodWludDhBcnJheSk7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvYmluYXJ5X3dyaXRlci50c1xudmFyIGltcG9ydF9iYXNlNjRfanMgPSBfX3RvRVNNKHJlcXVpcmVfYmFzZTY0X2pzKCkpO1xudmFyIEFycmF5QnVmZmVyUHJvdG90eXBlVHJhbnNmZXIgPSBBcnJheUJ1ZmZlci5wcm90b3R5cGUudHJhbnNmZXIgPz8gZnVuY3Rpb24obmV3Qnl0ZUxlbmd0aCkge1xuICBpZiAobmV3Qnl0ZUxlbmd0aCA9PT0gdm9pZCAwKSB7XG4gICAgcmV0dXJuIHRoaXMuc2xpY2UoKTtcbiAgfSBlbHNlIGlmIChuZXdCeXRlTGVuZ3RoIDw9IHRoaXMuYnl0ZUxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzLnNsaWNlKDAsIG5ld0J5dGVMZW5ndGgpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGNvcHkgPSBuZXcgVWludDhBcnJheShuZXdCeXRlTGVuZ3RoKTtcbiAgICBjb3B5LnNldChuZXcgVWludDhBcnJheSh0aGlzKSk7XG4gICAgcmV0dXJuIGNvcHkuYnVmZmVyO1xuICB9XG59O1xudmFyIFJlc2l6YWJsZUJ1ZmZlciA9IGNsYXNzIHtcbiAgYnVmZmVyO1xuICB2aWV3O1xuICBjb25zdHJ1Y3Rvcihpbml0KSB7XG4gICAgdGhpcy5idWZmZXIgPSB0eXBlb2YgaW5pdCA9PT0gXCJudW1iZXJcIiA/IG5ldyBBcnJheUJ1ZmZlcihpbml0KSA6IGluaXQ7XG4gICAgdGhpcy52aWV3ID0gbmV3IERhdGFWaWV3KHRoaXMuYnVmZmVyKTtcbiAgfVxuICBnZXQgY2FwYWNpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLmJ5dGVMZW5ndGg7XG4gIH1cbiAgZ3JvdyhuZXdTaXplKSB7XG4gICAgaWYgKG5ld1NpemUgPD0gdGhpcy5idWZmZXIuYnl0ZUxlbmd0aCkgcmV0dXJuO1xuICAgIHRoaXMuYnVmZmVyID0gQXJyYXlCdWZmZXJQcm90b3R5cGVUcmFuc2Zlci5jYWxsKHRoaXMuYnVmZmVyLCBuZXdTaXplKTtcbiAgICB0aGlzLnZpZXcgPSBuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIpO1xuICB9XG59O1xudmFyIEJpbmFyeVdyaXRlciA9IGNsYXNzIHtcbiAgYnVmZmVyO1xuICBvZmZzZXQgPSAwO1xuICBjb25zdHJ1Y3Rvcihpbml0KSB7XG4gICAgdGhpcy5idWZmZXIgPSB0eXBlb2YgaW5pdCA9PT0gXCJudW1iZXJcIiA/IG5ldyBSZXNpemFibGVCdWZmZXIoaW5pdCkgOiBpbml0O1xuICB9XG4gIHJlc2V0KGJ1ZmZlcikge1xuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgfVxuICBleHBhbmRCdWZmZXIoYWRkaXRpb25hbENhcGFjaXR5KSB7XG4gICAgY29uc3QgbWluQ2FwYWNpdHkgPSB0aGlzLm9mZnNldCArIGFkZGl0aW9uYWxDYXBhY2l0eSArIDE7XG4gICAgaWYgKG1pbkNhcGFjaXR5IDw9IHRoaXMuYnVmZmVyLmNhcGFjaXR5KSByZXR1cm47XG4gICAgbGV0IG5ld0NhcGFjaXR5ID0gdGhpcy5idWZmZXIuY2FwYWNpdHkgKiAyO1xuICAgIGlmIChuZXdDYXBhY2l0eSA8IG1pbkNhcGFjaXR5KSBuZXdDYXBhY2l0eSA9IG1pbkNhcGFjaXR5O1xuICAgIHRoaXMuYnVmZmVyLmdyb3cobmV3Q2FwYWNpdHkpO1xuICB9XG4gIHRvQmFzZTY0KCkge1xuICAgIHJldHVybiAoMCwgaW1wb3J0X2Jhc2U2NF9qcy5mcm9tQnl0ZUFycmF5KSh0aGlzLmdldEJ1ZmZlcigpKTtcbiAgfVxuICBnZXRCdWZmZXIoKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHRoaXMuYnVmZmVyLmJ1ZmZlciwgMCwgdGhpcy5vZmZzZXQpO1xuICB9XG4gIGdldCB2aWV3KCkge1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlci52aWV3O1xuICB9XG4gIHdyaXRlVUludDhBcnJheSh2YWx1ZSkge1xuICAgIGNvbnN0IGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig0ICsgbGVuZ3RoKTtcbiAgICB0aGlzLndyaXRlVTMyKGxlbmd0aCk7XG4gICAgbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIuYnVmZmVyLCB0aGlzLm9mZnNldCkuc2V0KHZhbHVlKTtcbiAgICB0aGlzLm9mZnNldCArPSBsZW5ndGg7XG4gIH1cbiAgd3JpdGVCb29sKHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMSk7XG4gICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSA/IDEgOiAwKTtcbiAgICB0aGlzLm9mZnNldCArPSAxO1xuICB9XG4gIHdyaXRlQnl0ZSh2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDEpO1xuICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLm9mZnNldCwgdmFsdWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE7XG4gIH1cbiAgd3JpdGVJOCh2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDEpO1xuICAgIHRoaXMudmlldy5zZXRJbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcbiAgfVxuICB3cml0ZVU4KHZhbHVlKSB7XG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMSk7XG4gICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcbiAgfVxuICB3cml0ZUkxNih2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDIpO1xuICAgIHRoaXMudmlldy5zZXRJbnQxNih0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDI7XG4gIH1cbiAgd3JpdGVVMTYodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigyKTtcbiAgICB0aGlzLnZpZXcuc2V0VWludDE2KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMjtcbiAgfVxuICB3cml0ZUkzMih2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDQpO1xuICAgIHRoaXMudmlldy5zZXRJbnQzMih0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gIH1cbiAgd3JpdGVVMzIodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig0KTtcbiAgICB0aGlzLnZpZXcuc2V0VWludDMyKHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcbiAgfVxuICB3cml0ZUk2NCh2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDgpO1xuICAgIHRoaXMudmlldy5zZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDg7XG4gIH1cbiAgd3JpdGVVNjQodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig4KTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gODtcbiAgfVxuICB3cml0ZVUxMjgodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxNik7XG4gICAgY29uc3QgbG93ZXJQYXJ0ID0gdmFsdWUgJiBCaWdJbnQoXCIweEZGRkZGRkZGRkZGRkZGRkZcIik7XG4gICAgY29uc3QgdXBwZXJQYXJ0ID0gdmFsdWUgPj4gQmlnSW50KDY0KTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCBsb3dlclBhcnQsIHRydWUpO1xuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4LCB1cHBlclBhcnQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE2O1xuICB9XG4gIHdyaXRlSTEyOCh2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDE2KTtcbiAgICBjb25zdCBsb3dlclBhcnQgPSB2YWx1ZSAmIEJpZ0ludChcIjB4RkZGRkZGRkZGRkZGRkZGRlwiKTtcbiAgICBjb25zdCB1cHBlclBhcnQgPSB2YWx1ZSA+PiBCaWdJbnQoNjQpO1xuICAgIHRoaXMudmlldy5zZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCwgbG93ZXJQYXJ0LCB0cnVlKTtcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQgKyA4LCB1cHBlclBhcnQsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDE2O1xuICB9XG4gIHdyaXRlVTI1Nih2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDMyKTtcbiAgICBjb25zdCBsb3dfNjRfbWFzayA9IEJpZ0ludChcIjB4RkZGRkZGRkZGRkZGRkZGRlwiKTtcbiAgICBjb25zdCBwMCA9IHZhbHVlICYgbG93XzY0X21hc2s7XG4gICAgY29uc3QgcDEgPSB2YWx1ZSA+PiBCaWdJbnQoNjQgKiAxKSAmIGxvd182NF9tYXNrO1xuICAgIGNvbnN0IHAyID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMikgJiBsb3dfNjRfbWFzaztcbiAgICBjb25zdCBwMyA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDMpO1xuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMCwgcDAsIHRydWUpO1xuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMSwgcDEsIHRydWUpO1xuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMiwgcDIsIHRydWUpO1xuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMywgcDMsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDMyO1xuICB9XG4gIHdyaXRlSTI1Nih2YWx1ZSkge1xuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDMyKTtcbiAgICBjb25zdCBsb3dfNjRfbWFzayA9IEJpZ0ludChcIjB4RkZGRkZGRkZGRkZGRkZGRlwiKTtcbiAgICBjb25zdCBwMCA9IHZhbHVlICYgbG93XzY0X21hc2s7XG4gICAgY29uc3QgcDEgPSB2YWx1ZSA+PiBCaWdJbnQoNjQgKiAxKSAmIGxvd182NF9tYXNrO1xuICAgIGNvbnN0IHAyID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMikgJiBsb3dfNjRfbWFzaztcbiAgICBjb25zdCBwMyA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDMpO1xuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMCwgcDAsIHRydWUpO1xuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMSwgcDEsIHRydWUpO1xuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMiwgcDIsIHRydWUpO1xuICAgIHRoaXMudmlldy5zZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCArIDggKiAzLCBwMywgdHJ1ZSk7XG4gICAgdGhpcy5vZmZzZXQgKz0gMzI7XG4gIH1cbiAgd3JpdGVGMzIodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig0KTtcbiAgICB0aGlzLnZpZXcuc2V0RmxvYXQzMih0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XG4gIH1cbiAgd3JpdGVGNjQodmFsdWUpIHtcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig4KTtcbiAgICB0aGlzLnZpZXcuc2V0RmxvYXQ2NCh0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xuICAgIHRoaXMub2Zmc2V0ICs9IDg7XG4gIH1cbiAgd3JpdGVTdHJpbmcodmFsdWUpIHtcbiAgICBjb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgZW5jb2RlZFN0cmluZyA9IGVuY29kZXIuZW5jb2RlKHZhbHVlKTtcbiAgICB0aGlzLndyaXRlVUludDhBcnJheShlbmNvZGVkU3RyaW5nKTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi91dGlsLnRzXG5mdW5jdGlvbiB1aW50OEFycmF5VG9IZXhTdHJpbmcoYXJyYXkpIHtcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChhcnJheS5yZXZlcnNlKCksICh4KSA9PiAoXCIwMFwiICsgeC50b1N0cmluZygxNikpLnNsaWNlKC0yKSkuam9pbihcIlwiKTtcbn1cbmZ1bmN0aW9uIHVpbnQ4QXJyYXlUb1UxMjgoYXJyYXkpIHtcbiAgaWYgKGFycmF5Lmxlbmd0aCAhPSAxNikge1xuICAgIHRocm93IG5ldyBFcnJvcihgVWludDhBcnJheSBpcyBub3QgMTYgYnl0ZXMgbG9uZzogJHthcnJheX1gKTtcbiAgfVxuICByZXR1cm4gbmV3IEJpbmFyeVJlYWRlcihhcnJheSkucmVhZFUxMjgoKTtcbn1cbmZ1bmN0aW9uIHVpbnQ4QXJyYXlUb1UyNTYoYXJyYXkpIHtcbiAgaWYgKGFycmF5Lmxlbmd0aCAhPSAzMikge1xuICAgIHRocm93IG5ldyBFcnJvcihgVWludDhBcnJheSBpcyBub3QgMzIgYnl0ZXMgbG9uZzogWyR7YXJyYXl9XWApO1xuICB9XG4gIHJldHVybiBuZXcgQmluYXJ5UmVhZGVyKGFycmF5KS5yZWFkVTI1NigpO1xufVxuZnVuY3Rpb24gaGV4U3RyaW5nVG9VaW50OEFycmF5KHN0cikge1xuICBpZiAoc3RyLnN0YXJ0c1dpdGgoXCIweFwiKSkge1xuICAgIHN0ciA9IHN0ci5zbGljZSgyKTtcbiAgfVxuICBjb25zdCBtYXRjaGVzID0gc3RyLm1hdGNoKC8uezEsMn0vZykgfHwgW107XG4gIGNvbnN0IGRhdGEgPSBVaW50OEFycmF5LmZyb20oXG4gICAgbWF0Y2hlcy5tYXAoKGJ5dGUpID0+IHBhcnNlSW50KGJ5dGUsIDE2KSlcbiAgKTtcbiAgcmV0dXJuIGRhdGEucmV2ZXJzZSgpO1xufVxuZnVuY3Rpb24gaGV4U3RyaW5nVG9VMTI4KHN0cikge1xuICByZXR1cm4gdWludDhBcnJheVRvVTEyOChoZXhTdHJpbmdUb1VpbnQ4QXJyYXkoc3RyKSk7XG59XG5mdW5jdGlvbiBoZXhTdHJpbmdUb1UyNTYoc3RyKSB7XG4gIHJldHVybiB1aW50OEFycmF5VG9VMjU2KGhleFN0cmluZ1RvVWludDhBcnJheShzdHIpKTtcbn1cbmZ1bmN0aW9uIHUxMjhUb1VpbnQ4QXJyYXkoZGF0YSkge1xuICBjb25zdCB3cml0ZXIgPSBuZXcgQmluYXJ5V3JpdGVyKDE2KTtcbiAgd3JpdGVyLndyaXRlVTEyOChkYXRhKTtcbiAgcmV0dXJuIHdyaXRlci5nZXRCdWZmZXIoKTtcbn1cbmZ1bmN0aW9uIHUxMjhUb0hleFN0cmluZyhkYXRhKSB7XG4gIHJldHVybiB1aW50OEFycmF5VG9IZXhTdHJpbmcodTEyOFRvVWludDhBcnJheShkYXRhKSk7XG59XG5mdW5jdGlvbiB1MjU2VG9VaW50OEFycmF5KGRhdGEpIHtcbiAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigzMik7XG4gIHdyaXRlci53cml0ZVUyNTYoZGF0YSk7XG4gIHJldHVybiB3cml0ZXIuZ2V0QnVmZmVyKCk7XG59XG5mdW5jdGlvbiB1MjU2VG9IZXhTdHJpbmcoZGF0YSkge1xuICByZXR1cm4gdWludDhBcnJheVRvSGV4U3RyaW5nKHUyNTZUb1VpbnQ4QXJyYXkoZGF0YSkpO1xufVxuZnVuY3Rpb24gdG9QYXNjYWxDYXNlKHMpIHtcbiAgY29uc3Qgc3RyID0gdG9DYW1lbENhc2Uocyk7XG4gIHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XG59XG5mdW5jdGlvbiB0b0NhbWVsQ2FzZShzKSB7XG4gIGNvbnN0IHN0ciA9IHMucmVwbGFjZSgvWy1fXSsvZywgXCJfXCIpLnJlcGxhY2UoL18oW2EtekEtWjAtOV0pL2csIChfLCBjKSA9PiBjLnRvVXBwZXJDYXNlKCkpO1xuICByZXR1cm4gc3RyLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpICsgc3RyLnNsaWNlKDEpO1xufVxuZnVuY3Rpb24gYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHR5KSB7XG4gIGNvbnN0IGFzc3VtZWRBcnJheUxlbmd0aCA9IDQ7XG4gIHdoaWxlICh0eS50YWcgPT09IFwiUmVmXCIpIHR5ID0gdHlwZXNwYWNlLnR5cGVzW3R5LnZhbHVlXTtcbiAgaWYgKHR5LnRhZyA9PT0gXCJQcm9kdWN0XCIpIHtcbiAgICBsZXQgc3VtID0gMDtcbiAgICBmb3IgKGNvbnN0IHsgYWxnZWJyYWljVHlwZTogZWxlbSB9IG9mIHR5LnZhbHVlLmVsZW1lbnRzKSB7XG4gICAgICBzdW0gKz0gYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIGVsZW0pO1xuICAgIH1cbiAgICByZXR1cm4gc3VtO1xuICB9IGVsc2UgaWYgKHR5LnRhZyA9PT0gXCJTdW1cIikge1xuICAgIGxldCBtaW4gPSBJbmZpbml0eTtcbiAgICBmb3IgKGNvbnN0IHsgYWxnZWJyYWljVHlwZTogdmFyaSB9IG9mIHR5LnZhbHVlLnZhcmlhbnRzKSB7XG4gICAgICBjb25zdCB2U2l6ZSA9IGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCB2YXJpKTtcbiAgICAgIGlmICh2U2l6ZSA8IG1pbikgbWluID0gdlNpemU7XG4gICAgfVxuICAgIGlmIChtaW4gPT09IEluZmluaXR5KSBtaW4gPSAwO1xuICAgIHJldHVybiA0ICsgbWluO1xuICB9IGVsc2UgaWYgKHR5LnRhZyA9PSBcIkFycmF5XCIpIHtcbiAgICByZXR1cm4gNCArIGFzc3VtZWRBcnJheUxlbmd0aCAqIGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCB0eS52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBTdHJpbmc6IDQgKyBhc3N1bWVkQXJyYXlMZW5ndGgsXG4gICAgU3VtOiAxLFxuICAgIEJvb2w6IDEsXG4gICAgSTg6IDEsXG4gICAgVTg6IDEsXG4gICAgSTE2OiAyLFxuICAgIFUxNjogMixcbiAgICBJMzI6IDQsXG4gICAgVTMyOiA0LFxuICAgIEYzMjogNCxcbiAgICBJNjQ6IDgsXG4gICAgVTY0OiA4LFxuICAgIEY2NDogOCxcbiAgICBJMTI4OiAxNixcbiAgICBVMTI4OiAxNixcbiAgICBJMjU2OiAzMixcbiAgICBVMjU2OiAzMlxuICB9W3R5LnRhZ107XG59XG52YXIgaGFzT3duID0gT2JqZWN0Lmhhc093bjtcblxuLy8gc3JjL2xpYi9jb25uZWN0aW9uX2lkLnRzXG52YXIgQ29ubmVjdGlvbklkID0gY2xhc3MgX0Nvbm5lY3Rpb25JZCB7XG4gIF9fY29ubmVjdGlvbl9pZF9fO1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgQ29ubmVjdGlvbklkYC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICB0aGlzLl9fY29ubmVjdGlvbl9pZF9fID0gZGF0YTtcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUge0BsaW5rIENvbm5lY3Rpb25JZH0gdHlwZS5cbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XG4gICAgICBlbGVtZW50czogW1xuICAgICAgICB7IG5hbWU6IFwiX19jb25uZWN0aW9uX2lkX19cIiwgYWxnZWJyYWljVHlwZTogQWxnZWJyYWljVHlwZS5VMTI4IH1cbiAgICAgIF1cbiAgICB9KTtcbiAgfVxuICBpc1plcm8oKSB7XG4gICAgcmV0dXJuIHRoaXMuX19jb25uZWN0aW9uX2lkX18gPT09IEJpZ0ludCgwKTtcbiAgfVxuICBzdGF0aWMgbnVsbElmWmVybyhhZGRyKSB7XG4gICAgaWYgKGFkZHIuaXNaZXJvKCkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYWRkcjtcbiAgICB9XG4gIH1cbiAgc3RhdGljIHJhbmRvbSgpIHtcbiAgICBmdW5jdGlvbiByYW5kb21VOCgpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTUpO1xuICAgIH1cbiAgICBsZXQgcmVzdWx0ID0gQmlnSW50KDApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKykge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0IDw8IEJpZ0ludCg4KSB8IEJpZ0ludChyYW5kb21VOCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkKHJlc3VsdCk7XG4gIH1cbiAgLyoqXG4gICAqIENvbXBhcmUgdHdvIGNvbm5lY3Rpb24gSURzIGZvciBlcXVhbGl0eS5cbiAgICovXG4gIGlzRXF1YWwob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fX2Nvbm5lY3Rpb25faWRfXyA9PSBvdGhlci5fX2Nvbm5lY3Rpb25faWRfXztcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdHdvIGNvbm5lY3Rpb24gSURzIGFyZSBlcXVhbC5cbiAgICovXG4gIGVxdWFscyhvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmlzRXF1YWwob3RoZXIpO1xuICB9XG4gIC8qKlxuICAgKiBQcmludCB0aGUgY29ubmVjdGlvbiBJRCBhcyBhIGhleGFkZWNpbWFsIHN0cmluZy5cbiAgICovXG4gIHRvSGV4U3RyaW5nKCkge1xuICAgIHJldHVybiB1MTI4VG9IZXhTdHJpbmcodGhpcy5fX2Nvbm5lY3Rpb25faWRfXyk7XG4gIH1cbiAgLyoqXG4gICAqIENvbnZlcnQgdGhlIGNvbm5lY3Rpb24gSUQgdG8gYSBVaW50OEFycmF5LlxuICAgKi9cbiAgdG9VaW50OEFycmF5KCkge1xuICAgIHJldHVybiB1MTI4VG9VaW50OEFycmF5KHRoaXMuX19jb25uZWN0aW9uX2lkX18pO1xuICB9XG4gIC8qKlxuICAgKiBQYXJzZSBhIGNvbm5lY3Rpb24gSUQgZnJvbSBhIGhleGFkZWNpbWFsIHN0cmluZy5cbiAgICovXG4gIHN0YXRpYyBmcm9tU3RyaW5nKHN0cikge1xuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZChoZXhTdHJpbmdUb1UxMjgoc3RyKSk7XG4gIH1cbiAgc3RhdGljIGZyb21TdHJpbmdPck51bGwoc3RyKSB7XG4gICAgY29uc3QgYWRkciA9IF9Db25uZWN0aW9uSWQuZnJvbVN0cmluZyhzdHIpO1xuICAgIGlmIChhZGRyLmlzWmVybygpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFkZHI7XG4gICAgfVxuICB9XG59O1xuXG4vLyBzcmMvbGliL2lkZW50aXR5LnRzXG52YXIgSWRlbnRpdHkgPSBjbGFzcyBfSWRlbnRpdHkge1xuICBfX2lkZW50aXR5X187XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBJZGVudGl0eWAuXG4gICAqXG4gICAqIGBkYXRhYCBjYW4gYmUgYSBoZXhhZGVjaW1hbCBzdHJpbmcgb3IgYSBgYmlnaW50YC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcbiAgICB0aGlzLl9faWRlbnRpdHlfXyA9IHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiID8gaGV4U3RyaW5nVG9VMjU2KGRhdGEpIDogZGF0YTtcbiAgfVxuICAvKipcbiAgICogR2V0IHRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUge0BsaW5rIElkZW50aXR5fSB0eXBlLlxuICAgKiBAcmV0dXJucyBUaGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHR5cGUuXG4gICAqL1xuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcbiAgICAgIGVsZW1lbnRzOiBbeyBuYW1lOiBcIl9faWRlbnRpdHlfX1wiLCBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLlUyNTYgfV1cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogQ2hlY2sgaWYgdHdvIGlkZW50aXRpZXMgYXJlIGVxdWFsLlxuICAgKi9cbiAgaXNFcXVhbChvdGhlcikge1xuICAgIHJldHVybiB0aGlzLnRvSGV4U3RyaW5nKCkgPT09IG90aGVyLnRvSGV4U3RyaW5nKCk7XG4gIH1cbiAgLyoqXG4gICAqIENoZWNrIGlmIHR3byBpZGVudGl0aWVzIGFyZSBlcXVhbC5cbiAgICovXG4gIGVxdWFscyhvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmlzRXF1YWwob3RoZXIpO1xuICB9XG4gIC8qKlxuICAgKiBQcmludCB0aGUgaWRlbnRpdHkgYXMgYSBoZXhhZGVjaW1hbCBzdHJpbmcuXG4gICAqL1xuICB0b0hleFN0cmluZygpIHtcbiAgICByZXR1cm4gdTI1NlRvSGV4U3RyaW5nKHRoaXMuX19pZGVudGl0eV9fKTtcbiAgfVxuICAvKipcbiAgICogQ29udmVydCB0aGUgYWRkcmVzcyB0byBhIFVpbnQ4QXJyYXkuXG4gICAqL1xuICB0b1VpbnQ4QXJyYXkoKSB7XG4gICAgcmV0dXJuIHUyNTZUb1VpbnQ4QXJyYXkodGhpcy5fX2lkZW50aXR5X18pO1xuICB9XG4gIC8qKlxuICAgKiBQYXJzZSBhbiBJZGVudGl0eSBmcm9tIGEgaGV4YWRlY2ltYWwgc3RyaW5nLlxuICAgKi9cbiAgc3RhdGljIGZyb21TdHJpbmcoc3RyKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHkoc3RyKTtcbiAgfVxuICAvKipcbiAgICogWmVybyBpZGVudGl0eSAoMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwKVxuICAgKi9cbiAgc3RhdGljIHplcm8oKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHkoMG4pO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnRvSGV4U3RyaW5nKCk7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvYWxnZWJyYWljX3R5cGUudHNcbnZhciBTRVJJQUxJWkVSUyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgREVTRVJJQUxJWkVSUyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgQWxnZWJyYWljVHlwZSA9IHtcbiAgUmVmOiAodmFsdWUpID0+ICh7IHRhZzogXCJSZWZcIiwgdmFsdWUgfSksXG4gIFN1bTogKHZhbHVlKSA9PiAoe1xuICAgIHRhZzogXCJTdW1cIixcbiAgICB2YWx1ZVxuICB9KSxcbiAgUHJvZHVjdDogKHZhbHVlKSA9PiAoe1xuICAgIHRhZzogXCJQcm9kdWN0XCIsXG4gICAgdmFsdWVcbiAgfSksXG4gIEFycmF5OiAodmFsdWUpID0+ICh7XG4gICAgdGFnOiBcIkFycmF5XCIsXG4gICAgdmFsdWVcbiAgfSksXG4gIFN0cmluZzogeyB0YWc6IFwiU3RyaW5nXCIgfSxcbiAgQm9vbDogeyB0YWc6IFwiQm9vbFwiIH0sXG4gIEk4OiB7IHRhZzogXCJJOFwiIH0sXG4gIFU4OiB7IHRhZzogXCJVOFwiIH0sXG4gIEkxNjogeyB0YWc6IFwiSTE2XCIgfSxcbiAgVTE2OiB7IHRhZzogXCJVMTZcIiB9LFxuICBJMzI6IHsgdGFnOiBcIkkzMlwiIH0sXG4gIFUzMjogeyB0YWc6IFwiVTMyXCIgfSxcbiAgSTY0OiB7IHRhZzogXCJJNjRcIiB9LFxuICBVNjQ6IHsgdGFnOiBcIlU2NFwiIH0sXG4gIEkxMjg6IHsgdGFnOiBcIkkxMjhcIiB9LFxuICBVMTI4OiB7IHRhZzogXCJVMTI4XCIgfSxcbiAgSTI1NjogeyB0YWc6IFwiSTI1NlwiIH0sXG4gIFUyNTY6IHsgdGFnOiBcIlUyNTZcIiB9LFxuICBGMzI6IHsgdGFnOiBcIkYzMlwiIH0sXG4gIEY2NDogeyB0YWc6IFwiRjY0XCIgfSxcbiAgbWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xuICAgIGlmICh0eS50YWcgPT09IFwiUmVmXCIpIHtcbiAgICAgIGlmICghdHlwZXNwYWNlKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3Qgc2VyaWFsaXplIHJlZnMgd2l0aG91dCBhIHR5cGVzcGFjZVwiKTtcbiAgICAgIHdoaWxlICh0eS50YWcgPT09IFwiUmVmXCIpIHR5ID0gdHlwZXNwYWNlLnR5cGVzW3R5LnZhbHVlXTtcbiAgICB9XG4gICAgc3dpdGNoICh0eS50YWcpIHtcbiAgICAgIGNhc2UgXCJQcm9kdWN0XCI6XG4gICAgICAgIHJldHVybiBQcm9kdWN0VHlwZS5tYWtlU2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcbiAgICAgIGNhc2UgXCJTdW1cIjpcbiAgICAgICAgcmV0dXJuIFN1bVR5cGUubWFrZVNlcmlhbGl6ZXIodHkudmFsdWUsIHR5cGVzcGFjZSk7XG4gICAgICBjYXNlIFwiQXJyYXlcIjpcbiAgICAgICAgaWYgKHR5LnZhbHVlLnRhZyA9PT0gXCJVOFwiKSB7XG4gICAgICAgICAgcmV0dXJuIHNlcmlhbGl6ZVVpbnQ4QXJyYXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcbiAgICAgICAgICByZXR1cm4gKHdyaXRlciwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIHdyaXRlci53cml0ZVUzMih2YWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCBlbGVtIG9mIHZhbHVlKSB7XG4gICAgICAgICAgICAgIHNlcmlhbGl6ZSh3cml0ZXIsIGVsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBwcmltaXRpdmVTZXJpYWxpemVyc1t0eS50YWddO1xuICAgIH1cbiAgfSxcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZVNlcmlhbGl6ZXJgIGluc3RlYWQuICovXG4gIHNlcmlhbGl6ZVZhbHVlKHdyaXRlciwgdHksIHZhbHVlLCB0eXBlc3BhY2UpIHtcbiAgICBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHdyaXRlciwgdmFsdWUpO1xuICB9LFxuICBtYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcbiAgICBpZiAodHkudGFnID09PSBcIlJlZlwiKSB7XG4gICAgICBpZiAoIXR5cGVzcGFjZSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY2Fubm90IGRlc2VyaWFsaXplIHJlZnMgd2l0aG91dCBhIHR5cGVzcGFjZVwiKTtcbiAgICAgIHdoaWxlICh0eS50YWcgPT09IFwiUmVmXCIpIHR5ID0gdHlwZXNwYWNlLnR5cGVzW3R5LnZhbHVlXTtcbiAgICB9XG4gICAgc3dpdGNoICh0eS50YWcpIHtcbiAgICAgIGNhc2UgXCJQcm9kdWN0XCI6XG4gICAgICAgIHJldHVybiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xuICAgICAgY2FzZSBcIlN1bVwiOlxuICAgICAgICByZXR1cm4gU3VtVHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xuICAgICAgY2FzZSBcIkFycmF5XCI6XG4gICAgICAgIGlmICh0eS52YWx1ZS50YWcgPT09IFwiVThcIikge1xuICAgICAgICAgIHJldHVybiBkZXNlcmlhbGl6ZVVpbnQ4QXJyYXk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZGVzZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXG4gICAgICAgICAgICB0eS52YWx1ZSxcbiAgICAgICAgICAgIHR5cGVzcGFjZVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIChyZWFkZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IHJlYWRlci5yZWFkVTMyKCk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICByZXN1bHRbaV0gPSBkZXNlcmlhbGl6ZShyZWFkZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gcHJpbWl0aXZlRGVzZXJpYWxpemVyc1t0eS50YWddO1xuICAgIH1cbiAgfSxcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZURlc2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cbiAgZGVzZXJpYWxpemVWYWx1ZShyZWFkZXIsIHR5LCB0eXBlc3BhY2UpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHJlYWRlcik7XG4gIH0sXG4gIC8qKlxuICAgKiBDb252ZXJ0IGEgdmFsdWUgb2YgdGhlIGFsZ2VicmFpYyB0eXBlIGludG8gc29tZXRoaW5nIHRoYXQgY2FuIGJlIHVzZWQgYXMgYSBrZXkgaW4gYSBtYXAuXG4gICAqIFRoZXJlIGFyZSBubyBndWFyYW50ZWVzIGFib3V0IGJlaW5nIGFibGUgdG8gb3JkZXIgaXQuXG4gICAqIFRoaXMgaXMgb25seSBndWFyYW50ZWVkIHRvIGJlIGNvbXBhcmFibGUgdG8gb3RoZXIgdmFsdWVzIG9mIHRoZSBzYW1lIHR5cGUuXG4gICAqIEBwYXJhbSB2YWx1ZSBBIHZhbHVlIG9mIHRoZSBhbGdlYnJhaWMgdHlwZVxuICAgKiBAcmV0dXJucyBTb21ldGhpbmcgdGhhdCBjYW4gYmUgdXNlZCBhcyBhIGtleSBpbiBhIG1hcC5cbiAgICovXG4gIGludG9NYXBLZXk6IGZ1bmN0aW9uKHR5LCB2YWx1ZSkge1xuICAgIHN3aXRjaCAodHkudGFnKSB7XG4gICAgICBjYXNlIFwiVThcIjpcbiAgICAgIGNhc2UgXCJVMTZcIjpcbiAgICAgIGNhc2UgXCJVMzJcIjpcbiAgICAgIGNhc2UgXCJVNjRcIjpcbiAgICAgIGNhc2UgXCJVMTI4XCI6XG4gICAgICBjYXNlIFwiVTI1NlwiOlxuICAgICAgY2FzZSBcIkk4XCI6XG4gICAgICBjYXNlIFwiSTE2XCI6XG4gICAgICBjYXNlIFwiSTMyXCI6XG4gICAgICBjYXNlIFwiSTY0XCI6XG4gICAgICBjYXNlIFwiSTEyOFwiOlxuICAgICAgY2FzZSBcIkkyNTZcIjpcbiAgICAgIGNhc2UgXCJGMzJcIjpcbiAgICAgIGNhc2UgXCJGNjRcIjpcbiAgICAgIGNhc2UgXCJTdHJpbmdcIjpcbiAgICAgIGNhc2UgXCJCb29sXCI6XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIGNhc2UgXCJQcm9kdWN0XCI6XG4gICAgICAgIHJldHVybiBQcm9kdWN0VHlwZS5pbnRvTWFwS2V5KHR5LnZhbHVlLCB2YWx1ZSk7XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTApO1xuICAgICAgICBBbGdlYnJhaWNUeXBlLnNlcmlhbGl6ZVZhbHVlKHdyaXRlciwgdHksIHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHdyaXRlci50b0Jhc2U2NCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcbmZ1bmN0aW9uIGJpbmRDYWxsKGYpIHtcbiAgcmV0dXJuIEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsLmJpbmQoZik7XG59XG52YXIgcHJpbWl0aXZlU2VyaWFsaXplcnMgPSB7XG4gIEJvb2w6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVCb29sKSxcbiAgSTg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJOCksXG4gIFU4OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTgpLFxuICBJMTY6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJMTYpLFxuICBVMTY6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMTYpLFxuICBJMzI6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJMzIpLFxuICBVMzI6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMzIpLFxuICBJNjQ6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJNjQpLFxuICBVNjQ6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVNjQpLFxuICBJMTI4OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTEyOCksXG4gIFUxMjg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMTI4KSxcbiAgSTI1NjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUkyNTYpLFxuICBVMjU2OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTI1NiksXG4gIEYzMjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUYzMiksXG4gIEY2NDogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUY2NCksXG4gIFN0cmluZzogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVN0cmluZylcbn07XG5PYmplY3QuZnJlZXplKHByaW1pdGl2ZVNlcmlhbGl6ZXJzKTtcbnZhciBzZXJpYWxpemVVaW50OEFycmF5ID0gYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVVJbnQ4QXJyYXkpO1xudmFyIHByaW1pdGl2ZURlc2VyaWFsaXplcnMgPSB7XG4gIEJvb2w6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEJvb2wpLFxuICBJODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTgpLFxuICBVODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTgpLFxuICBJMTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEkxNiksXG4gIFUxNjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTE2KSxcbiAgSTMyOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRJMzIpLFxuICBVMzI6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFUzMiksXG4gIEk2NDogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTY0KSxcbiAgVTY0OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVNjQpLFxuICBJMTI4OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRJMTI4KSxcbiAgVTEyODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTEyOCksXG4gIEkyNTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEkyNTYpLFxuICBVMjU2OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVMjU2KSxcbiAgRjMyOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRGMzIpLFxuICBGNjQ6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEY2NCksXG4gIFN0cmluZzogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkU3RyaW5nKVxufTtcbk9iamVjdC5mcmVlemUocHJpbWl0aXZlRGVzZXJpYWxpemVycyk7XG52YXIgZGVzZXJpYWxpemVVaW50OEFycmF5ID0gYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVUludDhBcnJheSk7XG52YXIgcHJpbWl0aXZlU2l6ZXMgPSB7XG4gIEJvb2w6IDEsXG4gIEk4OiAxLFxuICBVODogMSxcbiAgSTE2OiAyLFxuICBVMTY6IDIsXG4gIEkzMjogNCxcbiAgVTMyOiA0LFxuICBJNjQ6IDgsXG4gIFU2NDogOCxcbiAgSTEyODogMTYsXG4gIFUxMjg6IDE2LFxuICBJMjU2OiAzMixcbiAgVTI1NjogMzIsXG4gIEYzMjogNCxcbiAgRjY0OiA4XG59O1xudmFyIGZpeGVkU2l6ZVByaW1pdGl2ZXMgPSBuZXcgU2V0KE9iamVjdC5rZXlzKHByaW1pdGl2ZVNpemVzKSk7XG52YXIgaXNGaXhlZFNpemVQcm9kdWN0ID0gKHR5KSA9PiB0eS5lbGVtZW50cy5ldmVyeShcbiAgKHsgYWxnZWJyYWljVHlwZSB9KSA9PiBmaXhlZFNpemVQcmltaXRpdmVzLmhhcyhhbGdlYnJhaWNUeXBlLnRhZylcbik7XG52YXIgcHJvZHVjdFNpemUgPSAodHkpID0+IHR5LmVsZW1lbnRzLnJlZHVjZShcbiAgKGFjYywgeyBhbGdlYnJhaWNUeXBlIH0pID0+IGFjYyArIHByaW1pdGl2ZVNpemVzW2FsZ2VicmFpY1R5cGUudGFnXSxcbiAgMFxuKTtcbnZhciBwcmltaXRpdmVKU05hbWUgPSB7XG4gIEJvb2w6IFwiVWludDhcIixcbiAgSTg6IFwiSW50OFwiLFxuICBVODogXCJVaW50OFwiLFxuICBJMTY6IFwiSW50MTZcIixcbiAgVTE2OiBcIlVpbnQxNlwiLFxuICBJMzI6IFwiSW50MzJcIixcbiAgVTMyOiBcIlVpbnQzMlwiLFxuICBJNjQ6IFwiQmlnSW50NjRcIixcbiAgVTY0OiBcIkJpZ1VpbnQ2NFwiLFxuICBGMzI6IFwiRmxvYXQzMlwiLFxuICBGNjQ6IFwiRmxvYXQ2NFwiXG59O1xudmFyIHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVycyA9IHtcbiAgX190aW1lX2R1cmF0aW9uX21pY3Jvc19fOiAocmVhZGVyKSA9PiBuZXcgVGltZUR1cmF0aW9uKHJlYWRlci5yZWFkSTY0KCkpLFxuICBfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fOiAocmVhZGVyKSA9PiBuZXcgVGltZXN0YW1wKHJlYWRlci5yZWFkSTY0KCkpLFxuICBfX2lkZW50aXR5X186IChyZWFkZXIpID0+IG5ldyBJZGVudGl0eShyZWFkZXIucmVhZFUyNTYoKSksXG4gIF9fY29ubmVjdGlvbl9pZF9fOiAocmVhZGVyKSA9PiBuZXcgQ29ubmVjdGlvbklkKHJlYWRlci5yZWFkVTEyOCgpKSxcbiAgX191dWlkX186IChyZWFkZXIpID0+IG5ldyBVdWlkKHJlYWRlci5yZWFkVTEyOCgpKVxufTtcbk9iamVjdC5mcmVlemUoc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzKTtcbnZhciB1bml0RGVzZXJpYWxpemVyID0gKCkgPT4gKHt9KTtcbnZhciBnZXRFbGVtZW50SW5pdGlhbGl6ZXIgPSAoZWxlbWVudCkgPT4ge1xuICBsZXQgaW5pdDtcbiAgc3dpdGNoIChlbGVtZW50LmFsZ2VicmFpY1R5cGUudGFnKSB7XG4gICAgY2FzZSBcIlN0cmluZ1wiOlxuICAgICAgaW5pdCA9IFwiJydcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJCb29sXCI6XG4gICAgICBpbml0ID0gXCJmYWxzZVwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIkk4XCI6XG4gICAgY2FzZSBcIlU4XCI6XG4gICAgY2FzZSBcIkkxNlwiOlxuICAgIGNhc2UgXCJVMTZcIjpcbiAgICBjYXNlIFwiSTMyXCI6XG4gICAgY2FzZSBcIlUzMlwiOlxuICAgICAgaW5pdCA9IFwiMFwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIkk2NFwiOlxuICAgIGNhc2UgXCJVNjRcIjpcbiAgICBjYXNlIFwiSTEyOFwiOlxuICAgIGNhc2UgXCJVMTI4XCI6XG4gICAgY2FzZSBcIkkyNTZcIjpcbiAgICBjYXNlIFwiVTI1NlwiOlxuICAgICAgaW5pdCA9IFwiMG5cIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJGMzJcIjpcbiAgICBjYXNlIFwiRjY0XCI6XG4gICAgICBpbml0ID0gXCIwLjBcIjtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBpbml0ID0gXCJ1bmRlZmluZWRcIjtcbiAgfVxuICByZXR1cm4gYCR7ZWxlbWVudC5uYW1lfTogJHtpbml0fWA7XG59O1xudmFyIFByb2R1Y3RUeXBlID0ge1xuICBtYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XG4gICAgbGV0IHNlcmlhbGl6ZXIgPSBTRVJJQUxJWkVSUy5nZXQodHkpO1xuICAgIGlmIChzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBzZXJpYWxpemVyO1xuICAgIGlmIChpc0ZpeGVkU2l6ZVByb2R1Y3QodHkpKSB7XG4gICAgICBjb25zdCBzaXplID0gcHJvZHVjdFNpemUodHkpO1xuICAgICAgY29uc3QgYm9keTIgPSBgXCJ1c2Ugc3RyaWN0XCI7XG53cml0ZXIuZXhwYW5kQnVmZmVyKCR7c2l6ZX0pO1xuY29uc3QgdmlldyA9IHdyaXRlci52aWV3O1xuJHt0eS5lbGVtZW50cy5tYXAoXG4gICAgICAgICh7IG5hbWUsIGFsZ2VicmFpY1R5cGU6IHsgdGFnIH0gfSkgPT4gdGFnIGluIHByaW1pdGl2ZUpTTmFtZSA/IGB2aWV3LnNldCR7cHJpbWl0aXZlSlNOYW1lW3RhZ119KHdyaXRlci5vZmZzZXQsIHZhbHVlLiR7bmFtZX0sICR7cHJpbWl0aXZlU2l6ZXNbdGFnXSA+IDEgPyBcInRydWVcIiA6IFwiXCJ9KTtcbndyaXRlci5vZmZzZXQgKz0gJHtwcmltaXRpdmVTaXplc1t0YWddfTtgIDogYHdyaXRlci53cml0ZSR7dGFnfSh2YWx1ZS4ke25hbWV9KTtgXG4gICAgICApLmpvaW4oXCJcXG5cIil9YDtcbiAgICAgIHNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcIndyaXRlclwiLCBcInZhbHVlXCIsIGJvZHkyKTtcbiAgICAgIFNFUklBTElaRVJTLnNldCh0eSwgc2VyaWFsaXplcik7XG4gICAgICByZXR1cm4gc2VyaWFsaXplcjtcbiAgICB9XG4gICAgY29uc3Qgc2VyaWFsaXplcnMgPSB7fTtcbiAgICBjb25zdCBib2R5ID0gJ1widXNlIHN0cmljdFwiO1xcbicgKyB0eS5lbGVtZW50cy5tYXAoXG4gICAgICAoZWxlbWVudCkgPT4gYHRoaXMuJHtlbGVtZW50Lm5hbWV9KHdyaXRlciwgdmFsdWUuJHtlbGVtZW50Lm5hbWV9KTtgXG4gICAgKS5qb2luKFwiXFxuXCIpO1xuICAgIHNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcIndyaXRlclwiLCBcInZhbHVlXCIsIGJvZHkpLmJpbmQoXG4gICAgICBzZXJpYWxpemVyc1xuICAgICk7XG4gICAgU0VSSUFMSVpFUlMuc2V0KHR5LCBzZXJpYWxpemVyKTtcbiAgICBmb3IgKGNvbnN0IHsgbmFtZSwgYWxnZWJyYWljVHlwZSB9IG9mIHR5LmVsZW1lbnRzKSB7XG4gICAgICBzZXJpYWxpemVyc1tuYW1lXSA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICAgIGFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKTtcbiAgICB9XG4gICAgT2JqZWN0LmZyZWV6ZShzZXJpYWxpemVycyk7XG4gICAgcmV0dXJuIHNlcmlhbGl6ZXI7XG4gIH0sXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VTZXJpYWxpemVyYCBpbnN0ZWFkLiAqL1xuICBzZXJpYWxpemVWYWx1ZSh3cml0ZXIsIHR5LCB2YWx1ZSwgdHlwZXNwYWNlKSB7XG4gICAgUHJvZHVjdFR5cGUubWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkod3JpdGVyLCB2YWx1ZSk7XG4gIH0sXG4gIG1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xuICAgIHN3aXRjaCAodHkuZWxlbWVudHMubGVuZ3RoKSB7XG4gICAgICBjYXNlIDA6XG4gICAgICAgIHJldHVybiB1bml0RGVzZXJpYWxpemVyO1xuICAgICAgY2FzZSAxOiB7XG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IHR5LmVsZW1lbnRzWzBdLm5hbWU7XG4gICAgICAgIGlmIChoYXNPd24oc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzLCBmaWVsZE5hbWUpKVxuICAgICAgICAgIHJldHVybiBzcGVjaWFsUHJvZHVjdERlc2VyaWFsaXplcnNbZmllbGROYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IGRlc2VyaWFsaXplciA9IERFU0VSSUFMSVpFUlMuZ2V0KHR5KTtcbiAgICBpZiAoZGVzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBkZXNlcmlhbGl6ZXI7XG4gICAgaWYgKGlzRml4ZWRTaXplUHJvZHVjdCh0eSkpIHtcbiAgICAgIGNvbnN0IGJvZHkgPSBgXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCByZXN1bHQgPSB7ICR7dHkuZWxlbWVudHMubWFwKGdldEVsZW1lbnRJbml0aWFsaXplcikuam9pbihcIiwgXCIpfSB9O1xuY29uc3QgdmlldyA9IHJlYWRlci52aWV3O1xuJHt0eS5lbGVtZW50cy5tYXAoXG4gICAgICAgICh7IG5hbWUsIGFsZ2VicmFpY1R5cGU6IHsgdGFnIH0gfSkgPT4gdGFnIGluIHByaW1pdGl2ZUpTTmFtZSA/IGByZXN1bHQuJHtuYW1lfSA9IHZpZXcuZ2V0JHtwcmltaXRpdmVKU05hbWVbdGFnXX0ocmVhZGVyLm9mZnNldCwgJHtwcmltaXRpdmVTaXplc1t0YWddID4gMSA/IFwidHJ1ZVwiIDogXCJcIn0pO1xucmVhZGVyLm9mZnNldCArPSAke3ByaW1pdGl2ZVNpemVzW3RhZ119O2AgOiBgcmVzdWx0LiR7bmFtZX0gPSByZWFkZXIucmVhZCR7dGFnfSgpO2BcbiAgICAgICkuam9pbihcIlxcblwiKX1cbnJldHVybiByZXN1bHQ7YDtcbiAgICAgIGRlc2VyaWFsaXplciA9IEZ1bmN0aW9uKFwicmVhZGVyXCIsIGJvZHkpO1xuICAgICAgREVTRVJJQUxJWkVSUy5zZXQodHksIGRlc2VyaWFsaXplcik7XG4gICAgICByZXR1cm4gZGVzZXJpYWxpemVyO1xuICAgIH1cbiAgICBjb25zdCBkZXNlcmlhbGl6ZXJzID0ge307XG4gICAgZGVzZXJpYWxpemVyID0gRnVuY3Rpb24oXG4gICAgICBcInJlYWRlclwiLFxuICAgICAgYFwidXNlIHN0cmljdFwiO1xuY29uc3QgcmVzdWx0ID0geyAke3R5LmVsZW1lbnRzLm1hcChnZXRFbGVtZW50SW5pdGlhbGl6ZXIpLmpvaW4oXCIsIFwiKX0gfTtcbiR7dHkuZWxlbWVudHMubWFwKCh7IG5hbWUgfSkgPT4gYHJlc3VsdC4ke25hbWV9ID0gdGhpcy4ke25hbWV9KHJlYWRlcik7YCkuam9pbihcIlxcblwiKX1cbnJldHVybiByZXN1bHQ7YFxuICAgICkuYmluZChkZXNlcmlhbGl6ZXJzKTtcbiAgICBERVNFUklBTElaRVJTLnNldCh0eSwgZGVzZXJpYWxpemVyKTtcbiAgICBmb3IgKGNvbnN0IHsgbmFtZSwgYWxnZWJyYWljVHlwZSB9IG9mIHR5LmVsZW1lbnRzKSB7XG4gICAgICBkZXNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxuICAgICAgICBhbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgICk7XG4gICAgfVxuICAgIE9iamVjdC5mcmVlemUoZGVzZXJpYWxpemVycyk7XG4gICAgcmV0dXJuIGRlc2VyaWFsaXplcjtcbiAgfSxcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZURlc2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cbiAgZGVzZXJpYWxpemVWYWx1ZShyZWFkZXIsIHR5LCB0eXBlc3BhY2UpIHtcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKShyZWFkZXIpO1xuICB9LFxuICBpbnRvTWFwS2V5KHR5LCB2YWx1ZSkge1xuICAgIGlmICh0eS5lbGVtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IHR5LmVsZW1lbnRzWzBdLm5hbWU7XG4gICAgICBpZiAoaGFzT3duKHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVycywgZmllbGROYW1lKSkge1xuICAgICAgICByZXR1cm4gdmFsdWVbZmllbGROYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigxMCk7XG4gICAgQWxnZWJyYWljVHlwZS5zZXJpYWxpemVWYWx1ZSh3cml0ZXIsIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh0eSksIHZhbHVlKTtcbiAgICByZXR1cm4gd3JpdGVyLnRvQmFzZTY0KCk7XG4gIH1cbn07XG52YXIgU3VtVHlwZSA9IHtcbiAgbWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xuICAgIGlmICh0eS52YXJpYW50cy5sZW5ndGggPT0gMiAmJiB0eS52YXJpYW50c1swXS5uYW1lID09PSBcInNvbWVcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcIm5vbmVcIikge1xuICAgICAgY29uc3Qgc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcbiAgICAgICAgdHkudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZSxcbiAgICAgICAgdHlwZXNwYWNlXG4gICAgICApO1xuICAgICAgcmV0dXJuICh3cml0ZXIsIHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgd3JpdGVyLndyaXRlQnl0ZSgwKTtcbiAgICAgICAgICBzZXJpYWxpemUod3JpdGVyLCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd3JpdGVyLndyaXRlQnl0ZSgxKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHR5LnZhcmlhbnRzLmxlbmd0aCA9PSAyICYmIHR5LnZhcmlhbnRzWzBdLm5hbWUgPT09IFwib2tcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcImVyclwiKSB7XG4gICAgICBjb25zdCBzZXJpYWxpemVPayA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICAgIHR5LnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKTtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZUVyciA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICAgIHR5LnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKTtcbiAgICAgIHJldHVybiAod3JpdGVyLCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAoXCJva1wiIGluIHZhbHVlKSB7XG4gICAgICAgICAgd3JpdGVyLndyaXRlVTgoMCk7XG4gICAgICAgICAgc2VyaWFsaXplT2sod3JpdGVyLCB2YWx1ZS5vayk7XG4gICAgICAgIH0gZWxzZSBpZiAoXCJlcnJcIiBpbiB2YWx1ZSkge1xuICAgICAgICAgIHdyaXRlci53cml0ZVU4KDEpO1xuICAgICAgICAgIHNlcmlhbGl6ZUVycih3cml0ZXIsIHZhbHVlLmVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgIFwiY291bGQgbm90IHNlcmlhbGl6ZSByZXN1bHQ6IG9iamVjdCBoYWQgbmVpdGhlciBhIGBva2Agbm9yIGFuIGBlcnJgIGZpZWxkXCJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgc2VyaWFsaXplciA9IFNFUklBTElaRVJTLmdldCh0eSk7XG4gICAgICBpZiAoc2VyaWFsaXplciAhPSBudWxsKSByZXR1cm4gc2VyaWFsaXplcjtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZXJzID0ge307XG4gICAgICBjb25zdCBib2R5ID0gYHN3aXRjaCAodmFsdWUudGFnKSB7XG4ke3R5LnZhcmlhbnRzLm1hcChcbiAgICAgICAgKHsgbmFtZSB9LCBpKSA9PiBgICBjYXNlICR7SlNPTi5zdHJpbmdpZnkobmFtZSl9OlxuICAgIHdyaXRlci53cml0ZUJ5dGUoJHtpfSk7XG4gICAgcmV0dXJuIHRoaXMuJHtuYW1lfSh3cml0ZXIsIHZhbHVlLnZhbHVlKTtgXG4gICAgICApLmpvaW4oXCJcXG5cIil9XG4gIGRlZmF1bHQ6XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgIFxcYENvdWxkIG5vdCBzZXJpYWxpemUgc3VtIHR5cGU7IHVua25vd24gdGFnIFxcJHt2YWx1ZS50YWd9XFxgXG4gICAgKVxufVxuYDtcbiAgICAgIHNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcIndyaXRlclwiLCBcInZhbHVlXCIsIGJvZHkpLmJpbmQoXG4gICAgICAgIHNlcmlhbGl6ZXJzXG4gICAgICApO1xuICAgICAgU0VSSUFMSVpFUlMuc2V0KHR5LCBzZXJpYWxpemVyKTtcbiAgICAgIGZvciAoY29uc3QgeyBuYW1lLCBhbGdlYnJhaWNUeXBlIH0gb2YgdHkudmFyaWFudHMpIHtcbiAgICAgICAgc2VyaWFsaXplcnNbbmFtZV0gPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxuICAgICAgICAgIGFsZ2VicmFpY1R5cGUsXG4gICAgICAgICAgdHlwZXNwYWNlXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBPYmplY3QuZnJlZXplKHNlcmlhbGl6ZXJzKTtcbiAgICAgIHJldHVybiBzZXJpYWxpemVyO1xuICAgIH1cbiAgfSxcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZVNlcmlhbGl6ZXJgIGluc3RlYWQuICovXG4gIHNlcmlhbGl6ZVZhbHVlKHdyaXRlciwgdHksIHZhbHVlLCB0eXBlc3BhY2UpIHtcbiAgICBTdW1UeXBlLm1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHdyaXRlciwgdmFsdWUpO1xuICB9LFxuICBtYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcbiAgICBpZiAodHkudmFyaWFudHMubGVuZ3RoID09IDIgJiYgdHkudmFyaWFudHNbMF0ubmFtZSA9PT0gXCJzb21lXCIgJiYgdHkudmFyaWFudHNbMV0ubmFtZSA9PT0gXCJub25lXCIpIHtcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgICk7XG4gICAgICByZXR1cm4gKHJlYWRlcikgPT4ge1xuICAgICAgICBjb25zdCB0YWcgPSByZWFkZXIucmVhZFU4KCk7XG4gICAgICAgIGlmICh0YWcgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4gZGVzZXJpYWxpemUocmVhZGVyKTtcbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGBDYW4ndCBkZXNlcmlhbGl6ZSBhbiBvcHRpb24gdHlwZSwgY291bGRuJ3QgZmluZCAke3RhZ30gdGFnYDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHR5LnZhcmlhbnRzLmxlbmd0aCA9PSAyICYmIHR5LnZhcmlhbnRzWzBdLm5hbWUgPT09IFwib2tcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcImVyclwiKSB7XG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZU9rID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxuICAgICAgICB0eXBlc3BhY2VcbiAgICAgICk7XG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZUVyciA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcbiAgICAgICAgdHkudmFyaWFudHNbMV0uYWxnZWJyYWljVHlwZSxcbiAgICAgICAgdHlwZXNwYWNlXG4gICAgICApO1xuICAgICAgcmV0dXJuIChyZWFkZXIpID0+IHtcbiAgICAgICAgY29uc3QgdGFnID0gcmVhZGVyLnJlYWRCeXRlKCk7XG4gICAgICAgIGlmICh0YWcgPT09IDApIHtcbiAgICAgICAgICByZXR1cm4geyBvazogZGVzZXJpYWxpemVPayhyZWFkZXIpIH07XG4gICAgICAgIH0gZWxzZSBpZiAodGFnID09PSAxKSB7XG4gICAgICAgICAgcmV0dXJuIHsgZXJyOiBkZXNlcmlhbGl6ZUVycihyZWFkZXIpIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgYENhbid0IGRlc2VyaWFsaXplIGEgcmVzdWx0IHR5cGUsIGNvdWxkbid0IGZpbmQgJHt0YWd9IHRhZ2A7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBkZXNlcmlhbGl6ZXIgPSBERVNFUklBTElaRVJTLmdldCh0eSk7XG4gICAgICBpZiAoZGVzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBkZXNlcmlhbGl6ZXI7XG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZXJzID0ge307XG4gICAgICBkZXNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcbiAgICAgICAgXCJyZWFkZXJcIixcbiAgICAgICAgYHN3aXRjaCAocmVhZGVyLnJlYWRVOCgpKSB7XG4ke3R5LnZhcmlhbnRzLm1hcChcbiAgICAgICAgICAoeyBuYW1lIH0sIGkpID0+IGBjYXNlICR7aX06IHJldHVybiB7IHRhZzogJHtKU09OLnN0cmluZ2lmeShuYW1lKX0sIHZhbHVlOiB0aGlzLiR7bmFtZX0ocmVhZGVyKSB9O2BcbiAgICAgICAgKS5qb2luKFwiXFxuXCIpfSB9YFxuICAgICAgKS5iaW5kKGRlc2VyaWFsaXplcnMpO1xuICAgICAgREVTRVJJQUxJWkVSUy5zZXQodHksIGRlc2VyaWFsaXplcik7XG4gICAgICBmb3IgKGNvbnN0IHsgbmFtZSwgYWxnZWJyYWljVHlwZSB9IG9mIHR5LnZhcmlhbnRzKSB7XG4gICAgICAgIGRlc2VyaWFsaXplcnNbbmFtZV0gPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXG4gICAgICAgICAgYWxnZWJyYWljVHlwZSxcbiAgICAgICAgICB0eXBlc3BhY2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIE9iamVjdC5mcmVlemUoZGVzZXJpYWxpemVycyk7XG4gICAgICByZXR1cm4gZGVzZXJpYWxpemVyO1xuICAgIH1cbiAgfSxcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZURlc2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cbiAgZGVzZXJpYWxpemVWYWx1ZShyZWFkZXIsIHR5LCB0eXBlc3BhY2UpIHtcbiAgICByZXR1cm4gU3VtVHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHJlYWRlcik7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvb3B0aW9uLnRzXG52YXIgT3B0aW9uID0ge1xuICBnZXRBbGdlYnJhaWNUeXBlKGlubmVyVHlwZSkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlN1bSh7XG4gICAgICB2YXJpYW50czogW1xuICAgICAgICB7IG5hbWU6IFwic29tZVwiLCBhbGdlYnJhaWNUeXBlOiBpbm5lclR5cGUgfSxcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IFwibm9uZVwiLFxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7IGVsZW1lbnRzOiBbXSB9KVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvcmVzdWx0LnRzXG52YXIgUmVzdWx0ID0ge1xuICBnZXRBbGdlYnJhaWNUeXBlKG9rVHlwZSwgZXJyVHlwZSkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlN1bSh7XG4gICAgICB2YXJpYW50czogW1xuICAgICAgICB7IG5hbWU6IFwib2tcIiwgYWxnZWJyYWljVHlwZTogb2tUeXBlIH0sXG4gICAgICAgIHsgbmFtZTogXCJlcnJcIiwgYWxnZWJyYWljVHlwZTogZXJyVHlwZSB9XG4gICAgICBdXG4gICAgfSk7XG4gIH1cbn07XG5cbi8vIHNyYy9saWIvc2NoZWR1bGVfYXQudHNcbnZhciBTY2hlZHVsZUF0ID0ge1xuICBpbnRlcnZhbCh2YWx1ZSkge1xuICAgIHJldHVybiBJbnRlcnZhbCh2YWx1ZSk7XG4gIH0sXG4gIHRpbWUodmFsdWUpIHtcbiAgICByZXR1cm4gVGltZSh2YWx1ZSk7XG4gIH0sXG4gIGdldEFsZ2VicmFpY1R5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuU3VtKHtcbiAgICAgIHZhcmlhbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIkludGVydmFsXCIsXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogVGltZUR1cmF0aW9uLmdldEFsZ2VicmFpY1R5cGUoKVxuICAgICAgICB9LFxuICAgICAgICB7IG5hbWU6IFwiVGltZVwiLCBhbGdlYnJhaWNUeXBlOiBUaW1lc3RhbXAuZ2V0QWxnZWJyYWljVHlwZSgpIH1cbiAgICAgIF1cbiAgICB9KTtcbiAgfSxcbiAgaXNTY2hlZHVsZUF0KGFsZ2VicmFpY1R5cGUpIHtcbiAgICBpZiAoYWxnZWJyYWljVHlwZS50YWcgIT09IFwiU3VtXCIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgdmFyaWFudHMgPSBhbGdlYnJhaWNUeXBlLnZhbHVlLnZhcmlhbnRzO1xuICAgIGlmICh2YXJpYW50cy5sZW5ndGggIT09IDIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgaW50ZXJ2YWxWYXJpYW50ID0gdmFyaWFudHMuZmluZCgodikgPT4gdi5uYW1lID09PSBcIkludGVydmFsXCIpO1xuICAgIGNvbnN0IHRpbWVWYXJpYW50ID0gdmFyaWFudHMuZmluZCgodikgPT4gdi5uYW1lID09PSBcIlRpbWVcIik7XG4gICAgaWYgKCFpbnRlcnZhbFZhcmlhbnQgfHwgIXRpbWVWYXJpYW50KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBUaW1lRHVyYXRpb24uaXNUaW1lRHVyYXRpb24oaW50ZXJ2YWxWYXJpYW50LmFsZ2VicmFpY1R5cGUpICYmIFRpbWVzdGFtcC5pc1RpbWVzdGFtcCh0aW1lVmFyaWFudC5hbGdlYnJhaWNUeXBlKTtcbiAgfVxufTtcbnZhciBJbnRlcnZhbCA9IChtaWNyb3MpID0+ICh7XG4gIHRhZzogXCJJbnRlcnZhbFwiLFxuICB2YWx1ZTogbmV3IFRpbWVEdXJhdGlvbihtaWNyb3MpXG59KTtcbnZhciBUaW1lID0gKG1pY3Jvc1NpbmNlVW5peEVwb2NoKSA9PiAoe1xuICB0YWc6IFwiVGltZVwiLFxuICB2YWx1ZTogbmV3IFRpbWVzdGFtcChtaWNyb3NTaW5jZVVuaXhFcG9jaClcbn0pO1xudmFyIHNjaGVkdWxlX2F0X2RlZmF1bHQgPSBTY2hlZHVsZUF0O1xuXG4vLyBzcmMvbGliL3R5cGVfdXRpbC50c1xuZnVuY3Rpb24gc2V0KHgsIHQyKSB7XG4gIHJldHVybiB7IC4uLngsIC4uLnQyIH07XG59XG5cbi8vIHNyYy9saWIvdHlwZV9idWlsZGVycy50c1xudmFyIFR5cGVCdWlsZGVyID0gY2xhc3Mge1xuICAvKipcbiAgICogVGhlIFR5cGVTY3JpcHQgcGhhbnRvbSB0eXBlLiBUaGlzIGlzIG5vdCBzdG9yZWQgYXQgcnVudGltZSxcbiAgICogYnV0IGlzIHZpc2libGUgdG8gdGhlIGNvbXBpbGVyXG4gICAqL1xuICB0eXBlO1xuICAvKipcbiAgICogVGhlIFNwYWNldGltZURCIGFsZ2VicmFpYyB0eXBlIChydW7igJF0aW1lIHZhbHVlKS4gSW4gYWRkaXRpb24gdG8gc3RvcmluZ1xuICAgKiB0aGUgcnVudGltZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgYEFsZ2VicmFpY1R5cGVgLCBpdCBhbHNvIGNhcHR1cmVzXG4gICAqIHRoZSBUeXBlU2NyaXB0IHR5cGUgaW5mb3JtYXRpb24gb2YgdGhlIGBBbGdlYnJhaWNUeXBlYC4gVGhhdCBpcyB0byBzYXlcbiAgICogdGhlIHZhbHVlIGlzIG5vdCBtZXJlbHkgYW4gYEFsZ2VicmFpY1R5cGVgLCBidXQgaXMgY29uc3RydWN0ZWQgdG8gYmVcbiAgICogdGhlIGNvcnJlc3BvbmRpbmcgY29uY3JldGUgYEFsZ2VicmFpY1R5cGVgIGZvciB0aGUgVHlwZVNjcmlwdCB0eXBlIGBUeXBlYC5cbiAgICpcbiAgICogZS5nLiBgc3RyaW5nYCBjb3JyZXNwb25kcyB0byBgQWxnZWJyYWljVHlwZS5TdHJpbmdgXG4gICAqL1xuICBhbGdlYnJhaWNUeXBlO1xuICBjb25zdHJ1Y3RvcihhbGdlYnJhaWNUeXBlKSB7XG4gICAgdGhpcy5hbGdlYnJhaWNUeXBlID0gYWxnZWJyYWljVHlwZTtcbiAgfVxuICBvcHRpb25hbCgpIHtcbiAgICByZXR1cm4gbmV3IE9wdGlvbkJ1aWxkZXIodGhpcyk7XG4gIH1cbiAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpIHtcbiAgICBjb25zdCBzZXJpYWxpemUgPSB0aGlzLnNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICB0aGlzLmFsZ2VicmFpY1R5cGVcbiAgICApO1xuICAgIHNlcmlhbGl6ZSh3cml0ZXIsIHZhbHVlKTtcbiAgfVxuICBkZXNlcmlhbGl6ZShyZWFkZXIpIHtcbiAgICBjb25zdCBkZXNlcmlhbGl6ZSA9IHRoaXMuZGVzZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXG4gICAgICB0aGlzLmFsZ2VicmFpY1R5cGVcbiAgICApO1xuICAgIHJldHVybiBkZXNlcmlhbGl6ZShyZWFkZXIpO1xuICB9XG59O1xudmFyIFU4QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlU4KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVMTZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTE2KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVTE2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVMzJCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTMyKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVNjRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTY0KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVMTI4QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlUxMjgpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFUyNTZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTI1Nik7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgSThCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTgpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEkxNkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JMTYpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJMTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBJMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEkzMkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JMzIpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEk2NEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JNjQpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEkxMjhCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTEyOCk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgSTI1NkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JMjU2KTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBGMzJCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuRjMyKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBGMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBGMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgRjY0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkY2NCk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgRjY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgRjY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIEJvb2xCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuQm9vbCk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBCb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBCb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgQm9vbENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBCb29sQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFN0cmluZ0J1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5TdHJpbmcpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgQXJyYXlCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGVsZW1lbnQ7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkFycmF5KGVsZW1lbnQuYWxnZWJyYWljVHlwZSkpO1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgQXJyYXlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBBcnJheUNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBCeXRlQXJyYXlCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuQXJyYXkoQWxnZWJyYWljVHlwZS5VOCkpO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIoXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgQnl0ZUFycmF5Q29sdW1uQnVpbGRlcihzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIE9wdGlvbkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgdmFsdWU7XG4gIGNvbnN0cnVjdG9yKHZhbHVlKSB7XG4gICAgc3VwZXIoT3B0aW9uLmdldEFsZ2VicmFpY1R5cGUodmFsdWUuYWxnZWJyYWljVHlwZSkpO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBPcHRpb25Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBPcHRpb25Db2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgUHJvZHVjdEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgdHlwZU5hbWU7XG4gIGVsZW1lbnRzO1xuICBjb25zdHJ1Y3RvcihlbGVtZW50cywgbmFtZSkge1xuICAgIGZ1bmN0aW9uIGVsZW1lbnRzQXJyYXlGcm9tRWxlbWVudHNPYmoob2JqKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoKGtleSkgPT4gKHtcbiAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAvLyBMYXppbHkgcmVzb2x2ZSB0aGUgdW5kZXJseWluZyBvYmplY3QncyBhbGdlYnJhaWNUeXBlLlxuICAgICAgICAvLyBUaGlzIHdpbGwgY2FsbCBvYmpba2V5XS5hbGdlYnJhaWNUeXBlIG9ubHkgd2hlbiBzb21lb25lXG4gICAgICAgIC8vIGFjdHVhbGx5IHJlYWRzIHRoaXMgcHJvcGVydHkuXG4gICAgICAgIGdldCBhbGdlYnJhaWNUeXBlKCkge1xuICAgICAgICAgIHJldHVybiBvYmpba2V5XS5hbGdlYnJhaWNUeXBlO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfVxuICAgIHN1cGVyKFxuICAgICAgQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcbiAgICAgICAgZWxlbWVudHM6IGVsZW1lbnRzQXJyYXlGcm9tRWxlbWVudHNPYmooZWxlbWVudHMpXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy50eXBlTmFtZSA9IG5hbWU7XG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFByb2R1Y3RDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9kdWN0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFJlc3VsdEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgb2s7XG4gIGVycjtcbiAgY29uc3RydWN0b3Iob2ssIGVycikge1xuICAgIHN1cGVyKFJlc3VsdC5nZXRBbGdlYnJhaWNUeXBlKG9rLmFsZ2VicmFpY1R5cGUsIGVyci5hbGdlYnJhaWNUeXBlKSk7XG4gICAgdGhpcy5vayA9IG9rO1xuICAgIHRoaXMuZXJyID0gZXJyO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFJlc3VsdENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pKTtcbiAgfVxufTtcbnZhciBVbml0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7IHRhZzogXCJQcm9kdWN0XCIsIHZhbHVlOiB7IGVsZW1lbnRzOiBbXSB9IH0pO1xuICB9XG59O1xudmFyIFJvd0J1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgcm93O1xuICB0eXBlTmFtZTtcbiAgY29uc3RydWN0b3Iocm93LCBuYW1lKSB7XG4gICAgY29uc3QgbWFwcGVkUm93ID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgT2JqZWN0LmVudHJpZXMocm93KS5tYXAoKFtjb2xOYW1lLCBidWlsZGVyXSkgPT4gW1xuICAgICAgICBjb2xOYW1lLFxuICAgICAgICBidWlsZGVyIGluc3RhbmNlb2YgQ29sdW1uQnVpbGRlciA/IGJ1aWxkZXIgOiBuZXcgQ29sdW1uQnVpbGRlcihidWlsZGVyLCB7fSlcbiAgICAgIF0pXG4gICAgKTtcbiAgICBjb25zdCBlbGVtZW50cyA9IE9iamVjdC5rZXlzKG1hcHBlZFJvdykubWFwKChuYW1lMikgPT4gKHtcbiAgICAgIG5hbWU6IG5hbWUyLFxuICAgICAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XG4gICAgICAgIHJldHVybiBtYXBwZWRSb3dbbmFtZTJdLnR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGU7XG4gICAgICB9XG4gICAgfSkpO1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7IGVsZW1lbnRzIH0pKTtcbiAgICB0aGlzLnJvdyA9IG1hcHBlZFJvdztcbiAgICB0aGlzLnR5cGVOYW1lID0gbmFtZTtcbiAgfVxufTtcbnZhciBTdW1CdWlsZGVySW1wbCA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICB2YXJpYW50cztcbiAgdHlwZU5hbWU7XG4gIGNvbnN0cnVjdG9yKHZhcmlhbnRzLCBuYW1lKSB7XG4gICAgZnVuY3Rpb24gdmFyaWFudHNBcnJheUZyb21WYXJpYW50c09iaih2YXJpYW50czIpIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyh2YXJpYW50czIpLm1hcCgoa2V5KSA9PiAoe1xuICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgIC8vIExhemlseSByZXNvbHZlIHRoZSB1bmRlcmx5aW5nIG9iamVjdCdzIGFsZ2VicmFpY1R5cGUuXG4gICAgICAgIC8vIFRoaXMgd2lsbCBjYWxsIG9ialtrZXldLmFsZ2VicmFpY1R5cGUgb25seSB3aGVuIHNvbWVvbmVcbiAgICAgICAgLy8gYWN0dWFsbHkgcmVhZHMgdGhpcyBwcm9wZXJ0eS5cbiAgICAgICAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XG4gICAgICAgICAgcmV0dXJuIHZhcmlhbnRzMltrZXldLmFsZ2VicmFpY1R5cGU7XG4gICAgICAgIH1cbiAgICAgIH0pKTtcbiAgICB9XG4gICAgc3VwZXIoXG4gICAgICBBbGdlYnJhaWNUeXBlLlN1bSh7XG4gICAgICAgIHZhcmlhbnRzOiB2YXJpYW50c0FycmF5RnJvbVZhcmlhbnRzT2JqKHZhcmlhbnRzKVxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMudmFyaWFudHMgPSB2YXJpYW50cztcbiAgICB0aGlzLnR5cGVOYW1lID0gbmFtZTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh2YXJpYW50cykpIHtcbiAgICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHZhcmlhbnRzLCBrZXkpO1xuICAgICAgY29uc3QgaXNBY2Nlc3NvciA9ICEhZGVzYyAmJiAodHlwZW9mIGRlc2MuZ2V0ID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIGRlc2Muc2V0ID09PSBcImZ1bmN0aW9uXCIpO1xuICAgICAgbGV0IGlzVW5pdDIgPSBmYWxzZTtcbiAgICAgIGlmICghaXNBY2Nlc3Nvcikge1xuICAgICAgICBjb25zdCB2YXJpYW50ID0gdmFyaWFudHNba2V5XTtcbiAgICAgICAgaXNVbml0MiA9IHZhcmlhbnQgaW5zdGFuY2VvZiBVbml0QnVpbGRlcjtcbiAgICAgIH1cbiAgICAgIGlmIChpc1VuaXQyKSB7XG4gICAgICAgIGNvbnN0IGNvbnN0YW50ID0gdGhpcy5jcmVhdGUoa2V5KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGtleSwge1xuICAgICAgICAgIHZhbHVlOiBjb25zdGFudCxcbiAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZm4gPSAoKHZhbHVlKSA9PiB0aGlzLmNyZWF0ZShrZXksIHZhbHVlKSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIHtcbiAgICAgICAgICB2YWx1ZTogZm4sXG4gICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY3JlYXRlKHRhZywgdmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHZvaWQgMCA/IHsgdGFnIH0gOiB7IHRhZywgdmFsdWUgfTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBTdW1Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBTdW1Db2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgU3VtQnVpbGRlciA9IFN1bUJ1aWxkZXJJbXBsO1xudmFyIFNpbXBsZVN1bUJ1aWxkZXJJbXBsID0gY2xhc3MgZXh0ZW5kcyBTdW1CdWlsZGVySW1wbCB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgU2ltcGxlU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgU2ltcGxlU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgU2ltcGxlU3VtQnVpbGRlciA9IFNpbXBsZVN1bUJ1aWxkZXJJbXBsO1xudmFyIFNjaGVkdWxlQXRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHNjaGVkdWxlX2F0X2RlZmF1bHQuZ2V0QWxnZWJyYWljVHlwZSgpKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBJZGVudGl0eUJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoSWRlbnRpdHkuZ2V0QWxnZWJyYWljVHlwZSgpKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBDb25uZWN0aW9uSWRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKENvbm5lY3Rpb25JZC5nZXRBbGdlYnJhaWNUeXBlKCkpO1xuICB9XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xuICB9XG59O1xudmFyIFRpbWVzdGFtcEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoVGltZXN0YW1wLmdldEFsZ2VicmFpY1R5cGUoKSk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcyxcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgVGltZUR1cmF0aW9uQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihUaW1lRHVyYXRpb24uZ2V0QWxnZWJyYWljVHlwZSgpKTtcbiAgfVxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBVdWlkQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihVdWlkLmdldEFsZ2VicmFpY1R5cGUoKSk7XG4gIH1cbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMsXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLFxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFV1aWRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XG4gIH1cbn07XG52YXIgZGVmYXVsdE1ldGFkYXRhID0ge307XG52YXIgQ29sdW1uQnVpbGRlciA9IGNsYXNzIHtcbiAgdHlwZUJ1aWxkZXI7XG4gIGNvbHVtbk1ldGFkYXRhO1xuICBjb25zdHJ1Y3Rvcih0eXBlQnVpbGRlciwgbWV0YWRhdGEpIHtcbiAgICB0aGlzLnR5cGVCdWlsZGVyID0gdHlwZUJ1aWxkZXI7XG4gICAgdGhpcy5jb2x1bW5NZXRhZGF0YSA9IG1ldGFkYXRhO1xuICB9XG4gIHNlcmlhbGl6ZSh3cml0ZXIsIHZhbHVlKSB7XG4gICAgdGhpcy50eXBlQnVpbGRlci5zZXJpYWxpemUod3JpdGVyLCB2YWx1ZSk7XG4gIH1cbiAgZGVzZXJpYWxpemUocmVhZGVyKSB7XG4gICAgcmV0dXJuIHRoaXMudHlwZUJ1aWxkZXIuZGVzZXJpYWxpemUocmVhZGVyKTtcbiAgfVxufTtcbnZhciBVOENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVThDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9VOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBVMTZDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1UxNkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFUzMkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVTMyQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgVTY0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VNjRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9VNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBVMTI4Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VMTI4Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgVTI1NkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVTI1NkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1UyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEk4Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JOENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0k4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0k4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEkxNkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSTE2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgSTMyQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9JMzJDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9JMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBJNjRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0k2NENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX0k2NENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGF1dG9JbmMoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEkxMjhDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0kxMjhDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBhdXRvSW5jKCkge1xuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9JMTI4Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBJMjU2Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JMjU2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgYXV0b0luYygpIHtcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSTI1NkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgRjMyQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9GMzJDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9GMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9GMzJDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEY2NENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfRjY0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfRjY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfRjY0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBCb29sQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9Cb29sQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBTdHJpbmdDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1N0cmluZ0NvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1N0cmluZ0NvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfU3RyaW5nQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEFycmF5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9BcnJheUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0FycmF5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXG4gICAgICB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfQXJyYXlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfQnl0ZUFycmF5Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcihtZXRhZGF0YSkge1xuICAgIHN1cGVyKG5ldyBUeXBlQnVpbGRlcihBbGdlYnJhaWNUeXBlLkFycmF5KEFsZ2VicmFpY1R5cGUuVTgpKSwgbWV0YWRhdGEpO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9CeXRlQXJyYXlDb2x1bW5CdWlsZGVyKFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfQnl0ZUFycmF5Q29sdW1uQnVpbGRlcihzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pKTtcbiAgfVxufTtcbnZhciBPcHRpb25Db2x1bW5CdWlsZGVyID0gY2xhc3MgX09wdGlvbkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX09wdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX09wdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgUmVzdWx0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9SZXN1bHRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKHR5cGVCdWlsZGVyLCBtZXRhZGF0YSkge1xuICAgIHN1cGVyKHR5cGVCdWlsZGVyLCBtZXRhZGF0YSk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1Jlc3VsdENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxuICAgICAgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFByb2R1Y3RDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1Byb2R1Y3RDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9Qcm9kdWN0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9Qcm9kdWN0Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBTdW1Db2x1bW5CdWlsZGVyID0gY2xhc3MgX1N1bUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1N1bUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBTaW1wbGVTdW1Db2x1bW5CdWlsZGVyID0gY2xhc3MgX1NpbXBsZVN1bUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBTdW1Db2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfU2ltcGxlU3VtQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9TaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX1NjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1NjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIElkZW50aXR5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX0lkZW50aXR5Q29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgcHJpbWFyeUtleSgpIHtcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxuICAgICk7XG4gIH1cbiAgZGVmYXVsdCh2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXG4gICAgKTtcbiAgfVxufTtcbnZhciBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxuICAgICk7XG4gIH1cbiAgdW5pcXVlKCkge1xuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIGRlZmF1bHQodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcbiAgICApO1xuICB9XG4gIG5hbWUobmFtZSkge1xuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcbiAgICApO1xuICB9XG4gIHVuaXF1ZSgpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBwcmltYXJ5S2V5KCkge1xuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXG4gICAgKTtcbiAgfVxuICBuYW1lKG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcbiAgICApO1xuICB9XG59O1xudmFyIFV1aWRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1V1aWRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xuICAgIHJldHVybiBuZXcgX1V1aWRDb2x1bW5CdWlsZGVyKFxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXG4gICAgKTtcbiAgfVxuICB1bmlxdWUoKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcbiAgICApO1xuICB9XG4gIHByaW1hcnlLZXkoKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXG4gICAgKTtcbiAgfVxuICBkZWZhdWx0KHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxuICAgICk7XG4gIH1cbiAgbmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxuICAgICk7XG4gIH1cbn07XG52YXIgUmVmQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xuICByZWY7XG4gIC8qKiBUaGUgcGhhbnRvbSB0eXBlIG9mIHRoZSBwb2ludGVlIG9mIHRoaXMgcmVmLiAqL1xuICBfX3NwYWNldGltZVR5cGU7XG4gIGNvbnN0cnVjdG9yKHJlZikge1xuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuUmVmKHJlZikpO1xuICAgIHRoaXMucmVmID0gcmVmO1xuICB9XG59O1xudmFyIGVudW1JbXBsID0gKChuYW1lT3JPYmosIG1heWJlT2JqKSA9PiB7XG4gIGxldCBvYmogPSBuYW1lT3JPYmo7XG4gIGxldCBuYW1lID0gdm9pZCAwO1xuICBpZiAodHlwZW9mIG5hbWVPck9iaiA9PT0gXCJzdHJpbmdcIikge1xuICAgIGlmICghbWF5YmVPYmopIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIFwiV2hlbiBwcm92aWRpbmcgYSBuYW1lLCB5b3UgbXVzdCBhbHNvIHByb3ZpZGUgdGhlIHZhcmlhbnRzIG9iamVjdCBvciBhcnJheS5cIlxuICAgICAgKTtcbiAgICB9XG4gICAgb2JqID0gbWF5YmVPYmo7XG4gICAgbmFtZSA9IG5hbWVPck9iajtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgY29uc3Qgc2ltcGxlVmFyaWFudHNPYmogPSB7fTtcbiAgICBmb3IgKGNvbnN0IHZhcmlhbnQgb2Ygb2JqKSB7XG4gICAgICBzaW1wbGVWYXJpYW50c09ialt2YXJpYW50XSA9IG5ldyBVbml0QnVpbGRlcigpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFNpbXBsZVN1bUJ1aWxkZXJJbXBsKHNpbXBsZVZhcmlhbnRzT2JqLCBuYW1lKTtcbiAgfVxuICByZXR1cm4gbmV3IFN1bUJ1aWxkZXIob2JqLCBuYW1lKTtcbn0pO1xudmFyIHQgPSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBCb29sYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgYm9vbGVhbmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEJvb2xCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgYm9vbDogKCkgPT4gbmV3IEJvb2xCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBTdHJpbmdgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBzdHJpbmdgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBTdHJpbmdCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgc3RyaW5nOiAoKSA9PiBuZXcgU3RyaW5nQnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgRjY0QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIG51bWJlcjogKCkgPT4gbmV3IEY2NEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEk4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSThCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgaTg6ICgpID0+IG5ldyBJOEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFU4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVThCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgdTg6ICgpID0+IG5ldyBVOEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkxNmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEkxNkJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBpMTY6ICgpID0+IG5ldyBJMTZCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBVMTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMTZCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgdTE2OiAoKSA9PiBuZXcgVTE2QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgSTMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTMyQnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGkzMjogKCkgPT4gbmV3IEkzMkJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUzMmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFUzMkJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICB1MzI6ICgpID0+IG5ldyBVMzJCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBJNjRgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJNjRCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgaTY0OiAoKSA9PiBuZXcgSTY0QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVTY0QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIHU2NDogKCkgPT4gbmV3IFU2NEJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkxMjhgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJMTI4QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGkxMjg6ICgpID0+IG5ldyBJMTI4QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTEyOGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFUxMjhCdWlsZGVyfSBpbnN0YW5jZVxuICAgKi9cbiAgdTEyODogKCkgPT4gbmV3IFUxMjhCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBJMjU2YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTI1NkJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBpMjU2OiAoKSA9PiBuZXcgSTI1NkJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUyNTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMjU2QnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIHUyNTY6ICgpID0+IG5ldyBVMjU2QnVpbGRlcigpLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgRjMyQnVpbGRlcn0gaW5zdGFuY2VcbiAgICovXG4gIGYzMjogKCkgPT4gbmV3IEYzMkJ1aWxkZXIoKSxcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYEY2NGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEY2NEJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBmNjQ6ICgpID0+IG5ldyBGNjRCdWlsZGVyKCksXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBQcm9kdWN0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9ucy4gUHJvZHVjdCB0eXBlcyBpbiBTcGFjZXRpbWVEQlxuICAgKiBhcmUgZXNzZW50aWFsbHkgdGhlIHNhbWUgYXMgb2JqZWN0cyBpbiBKYXZhU2NyaXB0L1R5cGVTY3JpcHQuXG4gICAqIFByb3BlcnRpZXMgb2YgdGhlIG9iamVjdCBtdXN0IGFsc28gYmUge0BsaW5rIFR5cGVCdWlsZGVyfXMuXG4gICAqIFJlcHJlc2VudGVkIGFzIGFuIG9iamVjdCB3aXRoIHNwZWNpZmljIHByb3BlcnRpZXMgaW4gVHlwZVNjcmlwdC5cbiAgICpcbiAgICogQHBhcmFtIG5hbWUgKG9wdGlvbmFsKSBBIGRpc3BsYXkgbmFtZSBmb3IgdGhlIHByb2R1Y3QgdHlwZS4gSWYgb21pdHRlZCwgYW4gYW5vbnltb3VzIHByb2R1Y3QgdHlwZSBpcyBjcmVhdGVkLlxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgZGVmaW5pbmcgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHR5cGUsIHdob3NlIHByb3BlcnR5XG4gICAqIHZhbHVlcyBtdXN0IGJlIHtAbGluayBUeXBlQnVpbGRlcn1zLlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgUHJvZHVjdEJ1aWxkZXJ9IGluc3RhbmNlLlxuICAgKi9cbiAgb2JqZWN0OiAoKG5hbWVPck9iaiwgbWF5YmVPYmopID0+IHtcbiAgICBpZiAodHlwZW9mIG5hbWVPck9iaiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgaWYgKCFtYXliZU9iaikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiV2hlbiBwcm92aWRpbmcgYSBuYW1lLCB5b3UgbXVzdCBhbHNvIHByb3ZpZGUgdGhlIG9iamVjdC5cIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBQcm9kdWN0QnVpbGRlcihtYXliZU9iaiwgbmFtZU9yT2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9kdWN0QnVpbGRlcihuYW1lT3JPYmosIHZvaWQgMCk7XG4gIH0pLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgUm93YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9ucy4gUm93IHR5cGVzIGluIFNwYWNldGltZURCXG4gICAqIGFyZSBzaW1pbGFyIHRvIGBQcm9kdWN0YCB0eXBlcywgYnV0IGFyZSBzcGVjaWZpY2FsbHkgdXNlZCB0byBkZWZpbmUgdGhlIHNjaGVtYSBvZiBhIHRhYmxlIHJvdy5cbiAgICogUHJvcGVydGllcyBvZiB0aGUgb2JqZWN0IG11c3QgYWxzbyBiZSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IG9yIHtAbGluayBDb2x1bW5CdWlsZGVyfXMuXG4gICAqXG4gICAqIFlvdSBjYW4gcmVwcmVzZW50IGEgYFJvd2AgYXMgZWl0aGVyIGEge0BsaW5rIFJvd09ian0gb3IgYW4ge0BsaW5rIFJvd0J1aWxkZXJ9IHR5cGUgd2hlblxuICAgKiBkZWZpbmluZyBhIHRhYmxlIHNjaGVtYS5cbiAgICpcbiAgICogVGhlIHtAbGluayBSb3dCdWlsZGVyfSB0eXBlIGlzIHVzZWZ1bCB3aGVuIHlvdSB3YW50IHRvIGNyZWF0ZSBhIHR5cGUgd2hpY2ggY2FuIGJlIHVzZWQgYW55d2hlcmVcbiAgICogYSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGlzIGFjY2VwdGVkLCBzdWNoIGFzIGluIG5lc3RlZCBvYmplY3RzIG9yIGFycmF5cywgb3IgYXMgdGhlIGFyZ3VtZW50XG4gICAqIHRvIGEgc2NoZWR1bGVkIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgZGVmaW5pbmcgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHJvdywgd2hvc2UgcHJvcGVydHlcbiAgICogdmFsdWVzIG11c3QgYmUge0BsaW5rIFR5cGVCdWlsZGVyfXMgb3Ige0BsaW5rIENvbHVtbkJ1aWxkZXJ9cy5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFJvd0J1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICByb3c6ICgobmFtZU9yT2JqLCBtYXliZU9iaikgPT4ge1xuICAgIGNvbnN0IFtvYmosIG5hbWVdID0gdHlwZW9mIG5hbWVPck9iaiA9PT0gXCJzdHJpbmdcIiA/IFttYXliZU9iaiwgbmFtZU9yT2JqXSA6IFtuYW1lT3JPYmosIHZvaWQgMF07XG4gICAgcmV0dXJuIG5ldyBSb3dCdWlsZGVyKG9iaiwgbmFtZSk7XG4gIH0pLFxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zLlxuICAgKiBSZXByZXNlbnRlZCBhcyBhbiBhcnJheSBpbiBUeXBlU2NyaXB0LlxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0eXBlIG9mIHRoZSBhcnJheSwgd2hpY2ggbXVzdCBiZSBhIGBUeXBlQnVpbGRlcmAuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBBcnJheUJ1aWxkZXJ9IGluc3RhbmNlXG4gICAqL1xuICBhcnJheShlKSB7XG4gICAgcmV0dXJuIG5ldyBBcnJheUJ1aWxkZXIoZSk7XG4gIH0sXG4gIGVudW06IGVudW1JbXBsLFxuICAvKipcbiAgICogVGhpcyBpcyBhIHNwZWNpYWwgaGVscGVyIGZ1bmN0aW9uIGZvciBjb252ZW5pZW50bHkgY3JlYXRpbmcgYFByb2R1Y3RgIHR5cGUgY29sdW1ucyB3aXRoIG5vIGZpZWxkcy5cbiAgICpcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFByb2R1Y3RCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIG5vIGZpZWxkcy5cbiAgICovXG4gIHVuaXQoKSB7XG4gICAgcmV0dXJuIG5ldyBVbml0QnVpbGRlcigpO1xuICB9LFxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxhemlseS1ldmFsdWF0ZWQge0BsaW5rIFR5cGVCdWlsZGVyfS4gVGhpcyBpcyB1c2VmdWwgZm9yIGNyZWF0aW5nXG4gICAqIHJlY3Vyc2l2ZSB0eXBlcywgc3VjaCBhcyBhIHRyZWUgb3IgbGlua2VkIGxpc3QuXG4gICAqIEBwYXJhbSB0aHVuayBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHtAbGluayBUeXBlQnVpbGRlcn0uXG4gICAqIEByZXR1cm5zIEEgcHJveHkge0BsaW5rIFR5cGVCdWlsZGVyfSB0aGF0IGV2YWx1YXRlcyB0aGUgdGh1bmsgb24gZmlyc3QgYWNjZXNzLlxuICAgKi9cbiAgbGF6eSh0aHVuaykge1xuICAgIGxldCBjYWNoZWQgPSBudWxsO1xuICAgIGNvbnN0IGdldCA9ICgpID0+IGNhY2hlZCA/Pz0gdGh1bmsoKTtcbiAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eSh7fSwge1xuICAgICAgZ2V0KF90LCBwcm9wLCByZWN2KSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGdldCgpO1xuICAgICAgICBjb25zdCB2YWwgPSBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3AsIHJlY3YpO1xuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gXCJmdW5jdGlvblwiID8gdmFsLmJpbmQodGFyZ2V0KSA6IHZhbDtcbiAgICAgIH0sXG4gICAgICBzZXQoX3QsIHByb3AsIHZhbHVlLCByZWN2KSB7XG4gICAgICAgIHJldHVybiBSZWZsZWN0LnNldChnZXQoKSwgcHJvcCwgdmFsdWUsIHJlY3YpO1xuICAgICAgfSxcbiAgICAgIGhhcyhfdCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gcHJvcCBpbiBnZXQoKTtcbiAgICAgIH0sXG4gICAgICBvd25LZXlzKCkge1xuICAgICAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKGdldCgpKTtcbiAgICAgIH0sXG4gICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoX3QsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZ2V0KCksIHByb3ApO1xuICAgICAgfSxcbiAgICAgIGdldFByb3RvdHlwZU9mKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKGdldCgpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcHJveHk7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgc3BlY2lhbCBoZWxwZXIgZnVuY3Rpb24gZm9yIGNvbnZlbmllbnRseSBjcmVhdGluZyB7QGxpbmsgU2NoZWR1bGVBdH0gdHlwZSBjb2x1bW5zLlxuICAgKiBAcmV0dXJucyBBIG5ldyBDb2x1bW5CdWlsZGVyIGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBTY2hlZHVsZUF0fSB0eXBlLlxuICAgKi9cbiAgc2NoZWR1bGVBdDogKCkgPT4ge1xuICAgIHJldHVybiBuZXcgU2NoZWR1bGVBdEJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBPcHRpb259IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGVudW0gd2l0aCBhIGBzb21lYCBhbmQgYG5vbmVgIHZhcmlhbnQuXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgY29udGFpbmVkIGluIHRoZSBgc29tZWAgdmFyaWFudCBvZiB0aGUgYE9wdGlvbmAuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBPcHRpb25CdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgT3B0aW9ufSB0eXBlLlxuICAgKi9cbiAgb3B0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBPcHRpb25CdWlsZGVyKHZhbHVlKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBSZXN1bHR9IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGVudW0gd2l0aCBhbiBgb2tgIGFuZCBgZXJyYCB2YXJpYW50LlxuICAgKiBAcGFyYW0gb2sgVGhlIHR5cGUgb2YgdGhlIHZhbHVlIGNvbnRhaW5lZCBpbiB0aGUgYG9rYCB2YXJpYW50IG9mIHRoZSBgUmVzdWx0YC5cbiAgICogQHBhcmFtIGVyciBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgY29udGFpbmVkIGluIHRoZSBgZXJyYCB2YXJpYW50IG9mIHRoZSBgUmVzdWx0YC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFJlc3VsdEJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBSZXN1bHR9IHR5cGUuXG4gICAqL1xuICByZXN1bHQob2ssIGVycikge1xuICAgIHJldHVybiBuZXcgUmVzdWx0QnVpbGRlcihvaywgZXJyKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBJZGVudGl0eX0gdHlwZS5cbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX19pZGVudGl0eV9fYCBlbGVtZW50LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBJZGVudGl0eX0gdHlwZS5cbiAgICovXG4gIGlkZW50aXR5OiAoKSA9PiB7XG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBDb25uZWN0aW9uSWR9IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGBvYmplY3RgIHdpdGggYSBzaW5nbGUgYF9fY29ubmVjdGlvbl9pZF9fYCBlbGVtZW50LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBDb25uZWN0aW9uSWR9IHR5cGUuXG4gICAqL1xuICBjb25uZWN0aW9uSWQ6ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZEJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBUaW1lc3RhbXB9IHR5cGUuXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGBvYmplY3RgIHdpdGggYSBzaW5nbGUgYF9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19gIGVsZW1lbnQuXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIFRpbWVzdGFtcH0gdHlwZS5cbiAgICovXG4gIHRpbWVzdGFtcDogKCkgPT4ge1xuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQnVpbGRlcigpO1xuICB9LFxuICAvKipcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFRpbWVEdXJhdGlvbn0gdHlwZS5cbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX190aW1lX2R1cmF0aW9uX21pY3Jvc19fYCBlbGVtZW50LlxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBUaW1lRHVyYXRpb259IHR5cGUuXG4gICAqL1xuICB0aW1lRHVyYXRpb246ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkJ1aWxkZXIoKTtcbiAgfSxcbiAgLyoqXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBVdWlkfSB0eXBlLlxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgb2JqZWN0YCB3aXRoIGEgc2luZ2xlIGBfX3V1aWRfX2AgZWxlbWVudC5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFR5cGVCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgVXVpZH0gdHlwZS5cbiAgICovXG4gIHV1aWQ6ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IFV1aWRCdWlsZGVyKCk7XG4gIH0sXG4gIC8qKlxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSBgQnl0ZUFycmF5YCB0eXBlLlxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgYXJyYXlgIG9mIGB1OGAuXG4gICAqIFRoZSBUeXBlU2NyaXB0IHJlcHJlc2VudGF0aW9uIGlzIHtAbGluayBVaW50OEFycmF5fS5cbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEJ5dGVBcnJheUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIGBCeXRlQXJyYXlgIHR5cGUuXG4gICAqL1xuICBieXRlQXJyYXk6ICgpID0+IHtcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUJ1aWxkZXIoKTtcbiAgfVxufTtcblxuLy8gc3JjL2xpYi9hdXRvZ2VuL3R5cGVzLnRzXG52YXIgQWxnZWJyYWljVHlwZTIgPSB0LmVudW0oXCJBbGdlYnJhaWNUeXBlXCIsIHtcbiAgUmVmOiB0LnUzMigpLFxuICBnZXQgU3VtKCkge1xuICAgIHJldHVybiBTdW1UeXBlMjtcbiAgfSxcbiAgZ2V0IFByb2R1Y3QoKSB7XG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcbiAgfSxcbiAgZ2V0IEFycmF5KCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfSxcbiAgU3RyaW5nOiB0LnVuaXQoKSxcbiAgQm9vbDogdC51bml0KCksXG4gIEk4OiB0LnVuaXQoKSxcbiAgVTg6IHQudW5pdCgpLFxuICBJMTY6IHQudW5pdCgpLFxuICBVMTY6IHQudW5pdCgpLFxuICBJMzI6IHQudW5pdCgpLFxuICBVMzI6IHQudW5pdCgpLFxuICBJNjQ6IHQudW5pdCgpLFxuICBVNjQ6IHQudW5pdCgpLFxuICBJMTI4OiB0LnVuaXQoKSxcbiAgVTEyODogdC51bml0KCksXG4gIEkyNTY6IHQudW5pdCgpLFxuICBVMjU2OiB0LnVuaXQoKSxcbiAgRjMyOiB0LnVuaXQoKSxcbiAgRjY0OiB0LnVuaXQoKVxufSk7XG52YXIgQ2FzZUNvbnZlcnNpb25Qb2xpY3kgPSB0LmVudW0oXCJDYXNlQ29udmVyc2lvblBvbGljeVwiLCB7XG4gIE5vbmU6IHQudW5pdCgpLFxuICBTbmFrZUNhc2U6IHQudW5pdCgpXG59KTtcbnZhciBFeHBsaWNpdE5hbWVFbnRyeSA9IHQuZW51bShcIkV4cGxpY2l0TmFtZUVudHJ5XCIsIHtcbiAgZ2V0IFRhYmxlKCkge1xuICAgIHJldHVybiBOYW1lTWFwcGluZztcbiAgfSxcbiAgZ2V0IEZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBOYW1lTWFwcGluZztcbiAgfSxcbiAgZ2V0IEluZGV4KCkge1xuICAgIHJldHVybiBOYW1lTWFwcGluZztcbiAgfVxufSk7XG52YXIgRXhwbGljaXROYW1lcyA9IHQub2JqZWN0KFwiRXhwbGljaXROYW1lc1wiLCB7XG4gIGdldCBlbnRyaWVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KEV4cGxpY2l0TmFtZUVudHJ5KTtcbiAgfVxufSk7XG52YXIgRnVuY3Rpb25WaXNpYmlsaXR5ID0gdC5lbnVtKFwiRnVuY3Rpb25WaXNpYmlsaXR5XCIsIHtcbiAgUHJpdmF0ZTogdC51bml0KCksXG4gIENsaWVudENhbGxhYmxlOiB0LnVuaXQoKVxufSk7XG52YXIgSHR0cEhlYWRlclBhaXIgPSB0Lm9iamVjdChcIkh0dHBIZWFkZXJQYWlyXCIsIHtcbiAgbmFtZTogdC5zdHJpbmcoKSxcbiAgdmFsdWU6IHQuYnl0ZUFycmF5KClcbn0pO1xudmFyIEh0dHBIZWFkZXJzID0gdC5vYmplY3QoXCJIdHRwSGVhZGVyc1wiLCB7XG4gIGdldCBlbnRyaWVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KEh0dHBIZWFkZXJQYWlyKTtcbiAgfVxufSk7XG52YXIgSHR0cE1ldGhvZCA9IHQuZW51bShcIkh0dHBNZXRob2RcIiwge1xuICBHZXQ6IHQudW5pdCgpLFxuICBIZWFkOiB0LnVuaXQoKSxcbiAgUG9zdDogdC51bml0KCksXG4gIFB1dDogdC51bml0KCksXG4gIERlbGV0ZTogdC51bml0KCksXG4gIENvbm5lY3Q6IHQudW5pdCgpLFxuICBPcHRpb25zOiB0LnVuaXQoKSxcbiAgVHJhY2U6IHQudW5pdCgpLFxuICBQYXRjaDogdC51bml0KCksXG4gIEV4dGVuc2lvbjogdC5zdHJpbmcoKVxufSk7XG52YXIgSHR0cFJlcXVlc3QgPSB0Lm9iamVjdChcIkh0dHBSZXF1ZXN0XCIsIHtcbiAgZ2V0IG1ldGhvZCgpIHtcbiAgICByZXR1cm4gSHR0cE1ldGhvZDtcbiAgfSxcbiAgZ2V0IGhlYWRlcnMoKSB7XG4gICAgcmV0dXJuIEh0dHBIZWFkZXJzO1xuICB9LFxuICB0aW1lb3V0OiB0Lm9wdGlvbih0LnRpbWVEdXJhdGlvbigpKSxcbiAgdXJpOiB0LnN0cmluZygpLFxuICBnZXQgdmVyc2lvbigpIHtcbiAgICByZXR1cm4gSHR0cFZlcnNpb247XG4gIH1cbn0pO1xudmFyIEh0dHBSZXNwb25zZSA9IHQub2JqZWN0KFwiSHR0cFJlc3BvbnNlXCIsIHtcbiAgZ2V0IGhlYWRlcnMoKSB7XG4gICAgcmV0dXJuIEh0dHBIZWFkZXJzO1xuICB9LFxuICBnZXQgdmVyc2lvbigpIHtcbiAgICByZXR1cm4gSHR0cFZlcnNpb247XG4gIH0sXG4gIGNvZGU6IHQudTE2KClcbn0pO1xudmFyIEh0dHBWZXJzaW9uID0gdC5lbnVtKFwiSHR0cFZlcnNpb25cIiwge1xuICBIdHRwMDk6IHQudW5pdCgpLFxuICBIdHRwMTA6IHQudW5pdCgpLFxuICBIdHRwMTE6IHQudW5pdCgpLFxuICBIdHRwMjogdC51bml0KCksXG4gIEh0dHAzOiB0LnVuaXQoKVxufSk7XG52YXIgSW5kZXhUeXBlID0gdC5lbnVtKFwiSW5kZXhUeXBlXCIsIHtcbiAgQlRyZWU6IHQudW5pdCgpLFxuICBIYXNoOiB0LnVuaXQoKVxufSk7XG52YXIgTGlmZWN5Y2xlID0gdC5lbnVtKFwiTGlmZWN5Y2xlXCIsIHtcbiAgSW5pdDogdC51bml0KCksXG4gIE9uQ29ubmVjdDogdC51bml0KCksXG4gIE9uRGlzY29ubmVjdDogdC51bml0KClcbn0pO1xudmFyIE1pc2NNb2R1bGVFeHBvcnQgPSB0LmVudW0oXCJNaXNjTW9kdWxlRXhwb3J0XCIsIHtcbiAgZ2V0IFR5cGVBbGlhcygpIHtcbiAgICByZXR1cm4gVHlwZUFsaWFzO1xuICB9XG59KTtcbnZhciBOYW1lTWFwcGluZyA9IHQub2JqZWN0KFwiTmFtZU1hcHBpbmdcIiwge1xuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxuICBjYW5vbmljYWxOYW1lOiB0LnN0cmluZygpXG59KTtcbnZhciBQcm9kdWN0VHlwZTIgPSB0Lm9iamVjdChcIlByb2R1Y3RUeXBlXCIsIHtcbiAgZ2V0IGVsZW1lbnRzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFByb2R1Y3RUeXBlRWxlbWVudCk7XG4gIH1cbn0pO1xudmFyIFByb2R1Y3RUeXBlRWxlbWVudCA9IHQub2JqZWN0KFwiUHJvZHVjdFR5cGVFbGVtZW50XCIsIHtcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGdldCBhbGdlYnJhaWNUeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfVxufSk7XG52YXIgUmF3Q29sdW1uRGVmVjggPSB0Lm9iamVjdChcIlJhd0NvbHVtbkRlZlY4XCIsIHtcbiAgY29sTmFtZTogdC5zdHJpbmcoKSxcbiAgZ2V0IGNvbFR5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9XG59KTtcbnZhciBSYXdDb2x1bW5EZWZhdWx0VmFsdWVWMTAgPSB0Lm9iamVjdChcIlJhd0NvbHVtbkRlZmF1bHRWYWx1ZVYxMFwiLCB7XG4gIGNvbElkOiB0LnUxNigpLFxuICB2YWx1ZTogdC5ieXRlQXJyYXkoKVxufSk7XG52YXIgUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjkgPSB0Lm9iamVjdChcIlJhd0NvbHVtbkRlZmF1bHRWYWx1ZVY5XCIsIHtcbiAgdGFibGU6IHQuc3RyaW5nKCksXG4gIGNvbElkOiB0LnUxNigpLFxuICB2YWx1ZTogdC5ieXRlQXJyYXkoKVxufSk7XG52YXIgUmF3Q29uc3RyYWludERhdGFWOSA9IHQuZW51bShcIlJhd0NvbnN0cmFpbnREYXRhVjlcIiwge1xuICBnZXQgVW5pcXVlKCkge1xuICAgIHJldHVybiBSYXdVbmlxdWVDb25zdHJhaW50RGF0YVY5O1xuICB9XG59KTtcbnZhciBSYXdDb25zdHJhaW50RGVmVjEwID0gdC5vYmplY3QoXCJSYXdDb25zdHJhaW50RGVmVjEwXCIsIHtcbiAgc291cmNlTmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiBSYXdDb25zdHJhaW50RGF0YVY5O1xuICB9XG59KTtcbnZhciBSYXdDb25zdHJhaW50RGVmVjggPSB0Lm9iamVjdChcIlJhd0NvbnN0cmFpbnREZWZWOFwiLCB7XG4gIGNvbnN0cmFpbnROYW1lOiB0LnN0cmluZygpLFxuICBjb25zdHJhaW50czogdC51OCgpLFxuICBjb2x1bW5zOiB0LmFycmF5KHQudTE2KCkpXG59KTtcbnZhciBSYXdDb25zdHJhaW50RGVmVjkgPSB0Lm9iamVjdChcIlJhd0NvbnN0cmFpbnREZWZWOVwiLCB7XG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBnZXQgZGF0YSgpIHtcbiAgICByZXR1cm4gUmF3Q29uc3RyYWludERhdGFWOTtcbiAgfVxufSk7XG52YXIgUmF3SW5kZXhBbGdvcml0aG0gPSB0LmVudW0oXCJSYXdJbmRleEFsZ29yaXRobVwiLCB7XG4gIEJUcmVlOiB0LmFycmF5KHQudTE2KCkpLFxuICBIYXNoOiB0LmFycmF5KHQudTE2KCkpLFxuICBEaXJlY3Q6IHQudTE2KClcbn0pO1xudmFyIFJhd0luZGV4RGVmVjEwID0gdC5vYmplY3QoXCJSYXdJbmRleERlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBhY2Nlc3Nvck5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxuICBnZXQgYWxnb3JpdGhtKCkge1xuICAgIHJldHVybiBSYXdJbmRleEFsZ29yaXRobTtcbiAgfVxufSk7XG52YXIgUmF3SW5kZXhEZWZWOCA9IHQub2JqZWN0KFwiUmF3SW5kZXhEZWZWOFwiLCB7XG4gIGluZGV4TmFtZTogdC5zdHJpbmcoKSxcbiAgaXNVbmlxdWU6IHQuYm9vbCgpLFxuICBnZXQgaW5kZXhUeXBlKCkge1xuICAgIHJldHVybiBJbmRleFR5cGU7XG4gIH0sXG4gIGNvbHVtbnM6IHQuYXJyYXkodC51MTYoKSlcbn0pO1xudmFyIFJhd0luZGV4RGVmVjkgPSB0Lm9iamVjdChcIlJhd0luZGV4RGVmVjlcIiwge1xuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgYWNjZXNzb3JOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcbiAgZ2V0IGFsZ29yaXRobSgpIHtcbiAgICByZXR1cm4gUmF3SW5kZXhBbGdvcml0aG07XG4gIH1cbn0pO1xudmFyIFJhd0xpZmVDeWNsZVJlZHVjZXJEZWZWMTAgPSB0Lm9iamVjdChcbiAgXCJSYXdMaWZlQ3ljbGVSZWR1Y2VyRGVmVjEwXCIsXG4gIHtcbiAgICBnZXQgbGlmZWN5Y2xlU3BlYygpIHtcbiAgICAgIHJldHVybiBMaWZlY3ljbGU7XG4gICAgfSxcbiAgICBmdW5jdGlvbk5hbWU6IHQuc3RyaW5nKClcbiAgfVxuKTtcbnZhciBSYXdNaXNjTW9kdWxlRXhwb3J0VjkgPSB0LmVudW0oXCJSYXdNaXNjTW9kdWxlRXhwb3J0VjlcIiwge1xuICBnZXQgQ29sdW1uRGVmYXVsdFZhbHVlKCkge1xuICAgIHJldHVybiBSYXdDb2x1bW5EZWZhdWx0VmFsdWVWOTtcbiAgfSxcbiAgZ2V0IFByb2NlZHVyZSgpIHtcbiAgICByZXR1cm4gUmF3UHJvY2VkdXJlRGVmVjk7XG4gIH0sXG4gIGdldCBWaWV3KCkge1xuICAgIHJldHVybiBSYXdWaWV3RGVmVjk7XG4gIH1cbn0pO1xudmFyIFJhd01vZHVsZURlZiA9IHQuZW51bShcIlJhd01vZHVsZURlZlwiLCB7XG4gIGdldCBWOEJhY2tDb21wYXQoKSB7XG4gICAgcmV0dXJuIFJhd01vZHVsZURlZlY4O1xuICB9LFxuICBnZXQgVjkoKSB7XG4gICAgcmV0dXJuIFJhd01vZHVsZURlZlY5O1xuICB9LFxuICBnZXQgVjEwKCkge1xuICAgIHJldHVybiBSYXdNb2R1bGVEZWZWMTA7XG4gIH1cbn0pO1xudmFyIFJhd01vZHVsZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3TW9kdWxlRGVmVjEwXCIsIHtcbiAgZ2V0IHNlY3Rpb25zKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd01vZHVsZURlZlYxMFNlY3Rpb24pO1xuICB9XG59KTtcbnZhciBSYXdNb2R1bGVEZWZWMTBTZWN0aW9uID0gdC5lbnVtKFwiUmF3TW9kdWxlRGVmVjEwU2VjdGlvblwiLCB7XG4gIGdldCBUeXBlc3BhY2UoKSB7XG4gICAgcmV0dXJuIFR5cGVzcGFjZTtcbiAgfSxcbiAgZ2V0IFR5cGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1R5cGVEZWZWMTApO1xuICB9LFxuICBnZXQgVGFibGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1RhYmxlRGVmVjEwKTtcbiAgfSxcbiAgZ2V0IFJlZHVjZXJzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1JlZHVjZXJEZWZWMTApO1xuICB9LFxuICBnZXQgUHJvY2VkdXJlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdQcm9jZWR1cmVEZWZWMTApO1xuICB9LFxuICBnZXQgVmlld3MoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Vmlld0RlZlYxMCk7XG4gIH0sXG4gIGdldCBTY2hlZHVsZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3U2NoZWR1bGVEZWZWMTApO1xuICB9LFxuICBnZXQgTGlmZUN5Y2xlUmVkdWNlcnMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3TGlmZUN5Y2xlUmVkdWNlckRlZlYxMCk7XG4gIH0sXG4gIGdldCBSb3dMZXZlbFNlY3VyaXR5KCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1Jvd0xldmVsU2VjdXJpdHlEZWZWOSk7XG4gIH0sXG4gIGdldCBDYXNlQ29udmVyc2lvblBvbGljeSgpIHtcbiAgICByZXR1cm4gQ2FzZUNvbnZlcnNpb25Qb2xpY3k7XG4gIH0sXG4gIGdldCBFeHBsaWNpdE5hbWVzKCkge1xuICAgIHJldHVybiBFeHBsaWNpdE5hbWVzO1xuICB9XG59KTtcbnZhciBSYXdNb2R1bGVEZWZWOCA9IHQub2JqZWN0KFwiUmF3TW9kdWxlRGVmVjhcIiwge1xuICBnZXQgdHlwZXNwYWNlKCkge1xuICAgIHJldHVybiBUeXBlc3BhY2U7XG4gIH0sXG4gIGdldCB0YWJsZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoVGFibGVEZXNjKTtcbiAgfSxcbiAgZ2V0IHJlZHVjZXJzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJlZHVjZXJEZWYpO1xuICB9LFxuICBnZXQgbWlzY0V4cG9ydHMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoTWlzY01vZHVsZUV4cG9ydCk7XG4gIH1cbn0pO1xudmFyIFJhd01vZHVsZURlZlY5ID0gdC5vYmplY3QoXCJSYXdNb2R1bGVEZWZWOVwiLCB7XG4gIGdldCB0eXBlc3BhY2UoKSB7XG4gICAgcmV0dXJuIFR5cGVzcGFjZTtcbiAgfSxcbiAgZ2V0IHRhYmxlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdUYWJsZURlZlY5KTtcbiAgfSxcbiAgZ2V0IHJlZHVjZXJzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1JlZHVjZXJEZWZWOSk7XG4gIH0sXG4gIGdldCB0eXBlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdUeXBlRGVmVjkpO1xuICB9LFxuICBnZXQgbWlzY0V4cG9ydHMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3TWlzY01vZHVsZUV4cG9ydFY5KTtcbiAgfSxcbiAgZ2V0IHJvd0xldmVsU2VjdXJpdHkoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Um93TGV2ZWxTZWN1cml0eURlZlY5KTtcbiAgfVxufSk7XG52YXIgUmF3UHJvY2VkdXJlRGVmVjEwID0gdC5vYmplY3QoXCJSYXdQcm9jZWR1cmVEZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxuICBnZXQgcGFyYW1zKCkge1xuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XG4gIH0sXG4gIGdldCByZXR1cm5UeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfSxcbiAgZ2V0IHZpc2liaWxpdHkoKSB7XG4gICAgcmV0dXJuIEZ1bmN0aW9uVmlzaWJpbGl0eTtcbiAgfVxufSk7XG52YXIgUmF3UHJvY2VkdXJlRGVmVjkgPSB0Lm9iamVjdChcIlJhd1Byb2NlZHVyZURlZlY5XCIsIHtcbiAgbmFtZTogdC5zdHJpbmcoKSxcbiAgZ2V0IHBhcmFtcygpIHtcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xuICB9LFxuICBnZXQgcmV0dXJuVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH1cbn0pO1xudmFyIFJhd1JlZHVjZXJEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1JlZHVjZXJEZWZWMTBcIiwge1xuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxuICBnZXQgcGFyYW1zKCkge1xuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XG4gIH0sXG4gIGdldCB2aXNpYmlsaXR5KCkge1xuICAgIHJldHVybiBGdW5jdGlvblZpc2liaWxpdHk7XG4gIH0sXG4gIGdldCBva1JldHVyblR5cGUoKSB7XG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xuICB9LFxuICBnZXQgZXJyUmV0dXJuVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH1cbn0pO1xudmFyIFJhd1JlZHVjZXJEZWZWOSA9IHQub2JqZWN0KFwiUmF3UmVkdWNlckRlZlY5XCIsIHtcbiAgbmFtZTogdC5zdHJpbmcoKSxcbiAgZ2V0IHBhcmFtcygpIHtcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xuICB9LFxuICBnZXQgbGlmZWN5Y2xlKCkge1xuICAgIHJldHVybiB0Lm9wdGlvbihMaWZlY3ljbGUpO1xuICB9XG59KTtcbnZhciBSYXdSb3dMZXZlbFNlY3VyaXR5RGVmVjkgPSB0Lm9iamVjdChcIlJhd1Jvd0xldmVsU2VjdXJpdHlEZWZWOVwiLCB7XG4gIHNxbDogdC5zdHJpbmcoKVxufSk7XG52YXIgUmF3U2NoZWR1bGVEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1NjaGVkdWxlRGVmVjEwXCIsIHtcbiAgc291cmNlTmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIHRhYmxlTmFtZTogdC5zdHJpbmcoKSxcbiAgc2NoZWR1bGVBdENvbDogdC51MTYoKSxcbiAgZnVuY3Rpb25OYW1lOiB0LnN0cmluZygpXG59KTtcbnZhciBSYXdTY2hlZHVsZURlZlY5ID0gdC5vYmplY3QoXCJSYXdTY2hlZHVsZURlZlY5XCIsIHtcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIHJlZHVjZXJOYW1lOiB0LnN0cmluZygpLFxuICBzY2hlZHVsZWRBdENvbHVtbjogdC51MTYoKVxufSk7XG52YXIgUmF3U2NvcGVkVHlwZU5hbWVWMTAgPSB0Lm9iamVjdChcIlJhd1Njb3BlZFR5cGVOYW1lVjEwXCIsIHtcbiAgc2NvcGU6IHQuYXJyYXkodC5zdHJpbmcoKSksXG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKClcbn0pO1xudmFyIFJhd1Njb3BlZFR5cGVOYW1lVjkgPSB0Lm9iamVjdChcIlJhd1Njb3BlZFR5cGVOYW1lVjlcIiwge1xuICBzY29wZTogdC5hcnJheSh0LnN0cmluZygpKSxcbiAgbmFtZTogdC5zdHJpbmcoKVxufSk7XG52YXIgUmF3U2VxdWVuY2VEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1NlcXVlbmNlRGVmVjEwXCIsIHtcbiAgc291cmNlTmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGNvbHVtbjogdC51MTYoKSxcbiAgc3RhcnQ6IHQub3B0aW9uKHQuaTEyOCgpKSxcbiAgbWluVmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcbiAgbWF4VmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcbiAgaW5jcmVtZW50OiB0LmkxMjgoKVxufSk7XG52YXIgUmF3U2VxdWVuY2VEZWZWOCA9IHQub2JqZWN0KFwiUmF3U2VxdWVuY2VEZWZWOFwiLCB7XG4gIHNlcXVlbmNlTmFtZTogdC5zdHJpbmcoKSxcbiAgY29sUG9zOiB0LnUxNigpLFxuICBpbmNyZW1lbnQ6IHQuaTEyOCgpLFxuICBzdGFydDogdC5vcHRpb24odC5pMTI4KCkpLFxuICBtaW5WYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxuICBtYXhWYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxuICBhbGxvY2F0ZWQ6IHQuaTEyOCgpXG59KTtcbnZhciBSYXdTZXF1ZW5jZURlZlY5ID0gdC5vYmplY3QoXCJSYXdTZXF1ZW5jZURlZlY5XCIsIHtcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGNvbHVtbjogdC51MTYoKSxcbiAgc3RhcnQ6IHQub3B0aW9uKHQuaTEyOCgpKSxcbiAgbWluVmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcbiAgbWF4VmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcbiAgaW5jcmVtZW50OiB0LmkxMjgoKVxufSk7XG52YXIgUmF3VGFibGVEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1RhYmxlRGVmVjEwXCIsIHtcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcbiAgcHJvZHVjdFR5cGVSZWY6IHQudTMyKCksXG4gIHByaW1hcnlLZXk6IHQuYXJyYXkodC51MTYoKSksXG4gIGdldCBpbmRleGVzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0luZGV4RGVmVjEwKTtcbiAgfSxcbiAgZ2V0IGNvbnN0cmFpbnRzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbnN0cmFpbnREZWZWMTApO1xuICB9LFxuICBnZXQgc2VxdWVuY2VzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1NlcXVlbmNlRGVmVjEwKTtcbiAgfSxcbiAgZ2V0IHRhYmxlVHlwZSgpIHtcbiAgICByZXR1cm4gVGFibGVUeXBlO1xuICB9LFxuICBnZXQgdGFibGVBY2Nlc3MoKSB7XG4gICAgcmV0dXJuIFRhYmxlQWNjZXNzO1xuICB9LFxuICBnZXQgZGVmYXVsdFZhbHVlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb2x1bW5EZWZhdWx0VmFsdWVWMTApO1xuICB9LFxuICBpc0V2ZW50OiB0LmJvb2woKVxufSk7XG52YXIgUmF3VGFibGVEZWZWOCA9IHQub2JqZWN0KFwiUmF3VGFibGVEZWZWOFwiLCB7XG4gIHRhYmxlTmFtZTogdC5zdHJpbmcoKSxcbiAgZ2V0IGNvbHVtbnMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Q29sdW1uRGVmVjgpO1xuICB9LFxuICBnZXQgaW5kZXhlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdJbmRleERlZlY4KTtcbiAgfSxcbiAgZ2V0IGNvbnN0cmFpbnRzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbnN0cmFpbnREZWZWOCk7XG4gIH0sXG4gIGdldCBzZXF1ZW5jZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3U2VxdWVuY2VEZWZWOCk7XG4gIH0sXG4gIHRhYmxlVHlwZTogdC5zdHJpbmcoKSxcbiAgdGFibGVBY2Nlc3M6IHQuc3RyaW5nKCksXG4gIHNjaGVkdWxlZDogdC5vcHRpb24odC5zdHJpbmcoKSlcbn0pO1xudmFyIFJhd1RhYmxlRGVmVjkgPSB0Lm9iamVjdChcIlJhd1RhYmxlRGVmVjlcIiwge1xuICBuYW1lOiB0LnN0cmluZygpLFxuICBwcm9kdWN0VHlwZVJlZjogdC51MzIoKSxcbiAgcHJpbWFyeUtleTogdC5hcnJheSh0LnUxNigpKSxcbiAgZ2V0IGluZGV4ZXMoKSB7XG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3SW5kZXhEZWZWOSk7XG4gIH0sXG4gIGdldCBjb25zdHJhaW50cygpIHtcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb25zdHJhaW50RGVmVjkpO1xuICB9LFxuICBnZXQgc2VxdWVuY2VzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFJhd1NlcXVlbmNlRGVmVjkpO1xuICB9LFxuICBnZXQgc2NoZWR1bGUoKSB7XG4gICAgcmV0dXJuIHQub3B0aW9uKFJhd1NjaGVkdWxlRGVmVjkpO1xuICB9LFxuICBnZXQgdGFibGVUeXBlKCkge1xuICAgIHJldHVybiBUYWJsZVR5cGU7XG4gIH0sXG4gIGdldCB0YWJsZUFjY2VzcygpIHtcbiAgICByZXR1cm4gVGFibGVBY2Nlc3M7XG4gIH1cbn0pO1xudmFyIFJhd1R5cGVEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1R5cGVEZWZWMTBcIiwge1xuICBnZXQgc291cmNlTmFtZSgpIHtcbiAgICByZXR1cm4gUmF3U2NvcGVkVHlwZU5hbWVWMTA7XG4gIH0sXG4gIHR5OiB0LnUzMigpLFxuICBjdXN0b21PcmRlcmluZzogdC5ib29sKClcbn0pO1xudmFyIFJhd1R5cGVEZWZWOSA9IHQub2JqZWN0KFwiUmF3VHlwZURlZlY5XCIsIHtcbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIFJhd1Njb3BlZFR5cGVOYW1lVjk7XG4gIH0sXG4gIHR5OiB0LnUzMigpLFxuICBjdXN0b21PcmRlcmluZzogdC5ib29sKClcbn0pO1xudmFyIFJhd1VuaXF1ZUNvbnN0cmFpbnREYXRhVjkgPSB0Lm9iamVjdChcbiAgXCJSYXdVbmlxdWVDb25zdHJhaW50RGF0YVY5XCIsXG4gIHtcbiAgICBjb2x1bW5zOiB0LmFycmF5KHQudTE2KCkpXG4gIH1cbik7XG52YXIgUmF3Vmlld0RlZlYxMCA9IHQub2JqZWN0KFwiUmF3Vmlld0RlZlYxMFwiLCB7XG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXG4gIGluZGV4OiB0LnUzMigpLFxuICBpc1B1YmxpYzogdC5ib29sKCksXG4gIGlzQW5vbnltb3VzOiB0LmJvb2woKSxcbiAgZ2V0IHBhcmFtcygpIHtcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xuICB9LFxuICBnZXQgcmV0dXJuVHlwZSgpIHtcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XG4gIH1cbn0pO1xudmFyIFJhd1ZpZXdEZWZWOSA9IHQub2JqZWN0KFwiUmF3Vmlld0RlZlY5XCIsIHtcbiAgbmFtZTogdC5zdHJpbmcoKSxcbiAgaW5kZXg6IHQudTMyKCksXG4gIGlzUHVibGljOiB0LmJvb2woKSxcbiAgaXNBbm9ueW1vdXM6IHQuYm9vbCgpLFxuICBnZXQgcGFyYW1zKCkge1xuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XG4gIH0sXG4gIGdldCByZXR1cm5UeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfVxufSk7XG52YXIgUmVkdWNlckRlZiA9IHQub2JqZWN0KFwiUmVkdWNlckRlZlwiLCB7XG4gIG5hbWU6IHQuc3RyaW5nKCksXG4gIGdldCBhcmdzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFByb2R1Y3RUeXBlRWxlbWVudCk7XG4gIH1cbn0pO1xudmFyIFN1bVR5cGUyID0gdC5vYmplY3QoXCJTdW1UeXBlXCIsIHtcbiAgZ2V0IHZhcmlhbnRzKCkge1xuICAgIHJldHVybiB0LmFycmF5KFN1bVR5cGVWYXJpYW50KTtcbiAgfVxufSk7XG52YXIgU3VtVHlwZVZhcmlhbnQgPSB0Lm9iamVjdChcIlN1bVR5cGVWYXJpYW50XCIsIHtcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXG4gIGdldCBhbGdlYnJhaWNUeXBlKCkge1xuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcbiAgfVxufSk7XG52YXIgVGFibGVBY2Nlc3MgPSB0LmVudW0oXCJUYWJsZUFjY2Vzc1wiLCB7XG4gIFB1YmxpYzogdC51bml0KCksXG4gIFByaXZhdGU6IHQudW5pdCgpXG59KTtcbnZhciBUYWJsZURlc2MgPSB0Lm9iamVjdChcIlRhYmxlRGVzY1wiLCB7XG4gIGdldCBzY2hlbWEoKSB7XG4gICAgcmV0dXJuIFJhd1RhYmxlRGVmVjg7XG4gIH0sXG4gIGRhdGE6IHQudTMyKClcbn0pO1xudmFyIFRhYmxlVHlwZSA9IHQuZW51bShcIlRhYmxlVHlwZVwiLCB7XG4gIFN5c3RlbTogdC51bml0KCksXG4gIFVzZXI6IHQudW5pdCgpXG59KTtcbnZhciBUeXBlQWxpYXMgPSB0Lm9iamVjdChcIlR5cGVBbGlhc1wiLCB7XG4gIG5hbWU6IHQuc3RyaW5nKCksXG4gIHR5OiB0LnUzMigpXG59KTtcbnZhciBUeXBlc3BhY2UgPSB0Lm9iamVjdChcIlR5cGVzcGFjZVwiLCB7XG4gIGdldCB0eXBlcygpIHtcbiAgICByZXR1cm4gdC5hcnJheShBbGdlYnJhaWNUeXBlMik7XG4gIH1cbn0pO1xudmFyIFZpZXdSZXN1bHRIZWFkZXIgPSB0LmVudW0oXCJWaWV3UmVzdWx0SGVhZGVyXCIsIHtcbiAgUm93RGF0YTogdC51bml0KCksXG4gIFJhd1NxbDogdC5zdHJpbmcoKVxufSk7XG5cbi8vIHNyYy9saWIvc2NoZW1hLnRzXG5mdW5jdGlvbiB0YWJsZVRvU2NoZW1hKGFjY05hbWUsIHNjaGVtYTIsIHRhYmxlRGVmKSB7XG4gIGNvbnN0IGdldENvbE5hbWUgPSAoaSkgPT4gc2NoZW1hMi5yb3dUeXBlLmFsZ2VicmFpY1R5cGUudmFsdWUuZWxlbWVudHNbaV0ubmFtZTtcbiAgcmV0dXJuIHtcbiAgICAvLyBGb3IgY2xpZW50LGBzY2hhbWEudGFibGVOYW1lYCB3aWxsIGFsd2F5cyBiZSB0aGVyZSBhcyBjYW5vbmljYWwgbmFtZS5cbiAgICAvLyBGb3IgbW9kdWxlLCBpZiBleHBsaWNpdCBuYW1lIGlzIG5vdCBwcm92aWRlZCB2aWEgYG5hbWVgLCBhY2Nlc3NvciBuYW1lIHdpbGxcbiAgICAvLyBiZSB1c2VkLCBpdCBpcyBzdG9yZWQgYXMgYWxpYXMgaW4gZGF0YWJhc2UsIGhlbmNlIHdvcmtzIGluIHF1ZXJ5IGJ1aWxkZXIuXG4gICAgc291cmNlTmFtZTogc2NoZW1hMi50YWJsZU5hbWUgfHwgYWNjTmFtZSxcbiAgICBhY2Nlc3Nvck5hbWU6IGFjY05hbWUsXG4gICAgY29sdW1uczogc2NoZW1hMi5yb3dUeXBlLnJvdyxcbiAgICAvLyB0eXBlZCBhcyBUW2ldWydyb3dUeXBlJ11bJ3JvdyddIHVuZGVyIFRhYmxlc1RvU2NoZW1hPFQ+XG4gICAgcm93VHlwZTogc2NoZW1hMi5yb3dTcGFjZXRpbWVUeXBlLFxuICAgIGNvbnN0cmFpbnRzOiB0YWJsZURlZi5jb25zdHJhaW50cy5tYXAoKGMpID0+ICh7XG4gICAgICBuYW1lOiBjLnNvdXJjZU5hbWUsXG4gICAgICBjb25zdHJhaW50OiBcInVuaXF1ZVwiLFxuICAgICAgY29sdW1uczogYy5kYXRhLnZhbHVlLmNvbHVtbnMubWFwKGdldENvbE5hbWUpXG4gICAgfSkpLFxuICAgIC8vIFRPRE86IGhvcnJpYmxlIGhvcnJpYmxlIGhvcnJpYmxlLiB3ZSBzbXVnZ2xlIHRoaXMgYEFycmF5PFVudHlwZWRJbmRleD5gXG4gICAgLy8gYnkgY2FzdGluZyBpdCB0byBhbiBgQXJyYXk8SW5kZXhPcHRzPmAgYXMgYFRhYmxlVG9TY2hlbWFgIGV4cGVjdHMuXG4gICAgLy8gVGhpcyBpcyB0aGVuIHVzZWQgaW4gYFRhYmxlQ2FjaGVJbXBsLmNvbnN0cnVjdG9yYCBhbmQgd2hvIGtub3dzIHdoZXJlIGVsc2UuXG4gICAgLy8gV2Ugc2hvdWxkIHN0b3AgbHlpbmcgYWJvdXQgb3VyIHR5cGVzLlxuICAgIGluZGV4ZXM6IHRhYmxlRGVmLmluZGV4ZXMubWFwKChpZHgpID0+IHtcbiAgICAgIGNvbnN0IGNvbHVtbklkcyA9IGlkeC5hbGdvcml0aG0udGFnID09PSBcIkRpcmVjdFwiID8gW2lkeC5hbGdvcml0aG0udmFsdWVdIDogaWR4LmFsZ29yaXRobS52YWx1ZTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG5hbWU6IGlkeC5hY2Nlc3Nvck5hbWUsXG4gICAgICAgIHVuaXF1ZTogdGFibGVEZWYuY29uc3RyYWludHMuc29tZShcbiAgICAgICAgICAoYykgPT4gYy5kYXRhLnZhbHVlLmNvbHVtbnMuZXZlcnkoKGNvbCkgPT4gY29sdW1uSWRzLmluY2x1ZGVzKGNvbCkpXG4gICAgICAgICksXG4gICAgICAgIGFsZ29yaXRobTogaWR4LmFsZ29yaXRobS50YWcudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgY29sdW1uczogY29sdW1uSWRzLm1hcChnZXRDb2xOYW1lKVxuICAgICAgfTtcbiAgICB9KSxcbiAgICB0YWJsZURlZixcbiAgICAuLi50YWJsZURlZi5pc0V2ZW50ID8geyBpc0V2ZW50OiB0cnVlIH0gOiB7fVxuICB9O1xufVxudmFyIE1vZHVsZUNvbnRleHQgPSBjbGFzcyB7XG4gICNjb21wb3VuZFR5cGVzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgLyoqXG4gICAqIFRoZSBnbG9iYWwgbW9kdWxlIGRlZmluaXRpb24gdGhhdCBnZXRzIHBvcHVsYXRlZCBieSBjYWxscyB0byBgcmVkdWNlcigpYCBhbmQgbGlmZWN5Y2xlIGhvb2tzLlxuICAgKi9cbiAgI21vZHVsZURlZiA9IHtcbiAgICB0eXBlc3BhY2U6IHsgdHlwZXM6IFtdIH0sXG4gICAgdGFibGVzOiBbXSxcbiAgICByZWR1Y2VyczogW10sXG4gICAgdHlwZXM6IFtdLFxuICAgIHJvd0xldmVsU2VjdXJpdHk6IFtdLFxuICAgIHNjaGVkdWxlczogW10sXG4gICAgcHJvY2VkdXJlczogW10sXG4gICAgdmlld3M6IFtdLFxuICAgIGxpZmVDeWNsZVJlZHVjZXJzOiBbXSxcbiAgICBjYXNlQ29udmVyc2lvblBvbGljeTogeyB0YWc6IFwiU25ha2VDYXNlXCIgfSxcbiAgICBleHBsaWNpdE5hbWVzOiB7XG4gICAgICBlbnRyaWVzOiBbXVxuICAgIH1cbiAgfTtcbiAgZ2V0IG1vZHVsZURlZigpIHtcbiAgICByZXR1cm4gdGhpcy4jbW9kdWxlRGVmO1xuICB9XG4gIHJhd01vZHVsZURlZlYxMCgpIHtcbiAgICBjb25zdCBzZWN0aW9ucyA9IFtdO1xuICAgIGNvbnN0IHB1c2ggPSAocykgPT4ge1xuICAgICAgaWYgKHMpIHNlY3Rpb25zLnB1c2gocyk7XG4gICAgfTtcbiAgICBjb25zdCBtb2R1bGUgPSB0aGlzLiNtb2R1bGVEZWY7XG4gICAgcHVzaChtb2R1bGUudHlwZXNwYWNlICYmIHsgdGFnOiBcIlR5cGVzcGFjZVwiLCB2YWx1ZTogbW9kdWxlLnR5cGVzcGFjZSB9KTtcbiAgICBwdXNoKG1vZHVsZS50eXBlcyAmJiB7IHRhZzogXCJUeXBlc1wiLCB2YWx1ZTogbW9kdWxlLnR5cGVzIH0pO1xuICAgIHB1c2gobW9kdWxlLnRhYmxlcyAmJiB7IHRhZzogXCJUYWJsZXNcIiwgdmFsdWU6IG1vZHVsZS50YWJsZXMgfSk7XG4gICAgcHVzaChtb2R1bGUucmVkdWNlcnMgJiYgeyB0YWc6IFwiUmVkdWNlcnNcIiwgdmFsdWU6IG1vZHVsZS5yZWR1Y2VycyB9KTtcbiAgICBwdXNoKG1vZHVsZS5wcm9jZWR1cmVzICYmIHsgdGFnOiBcIlByb2NlZHVyZXNcIiwgdmFsdWU6IG1vZHVsZS5wcm9jZWR1cmVzIH0pO1xuICAgIHB1c2gobW9kdWxlLnZpZXdzICYmIHsgdGFnOiBcIlZpZXdzXCIsIHZhbHVlOiBtb2R1bGUudmlld3MgfSk7XG4gICAgcHVzaChtb2R1bGUuc2NoZWR1bGVzICYmIHsgdGFnOiBcIlNjaGVkdWxlc1wiLCB2YWx1ZTogbW9kdWxlLnNjaGVkdWxlcyB9KTtcbiAgICBwdXNoKFxuICAgICAgbW9kdWxlLmxpZmVDeWNsZVJlZHVjZXJzICYmIHtcbiAgICAgICAgdGFnOiBcIkxpZmVDeWNsZVJlZHVjZXJzXCIsXG4gICAgICAgIHZhbHVlOiBtb2R1bGUubGlmZUN5Y2xlUmVkdWNlcnNcbiAgICAgIH1cbiAgICApO1xuICAgIHB1c2goXG4gICAgICBtb2R1bGUucm93TGV2ZWxTZWN1cml0eSAmJiB7XG4gICAgICAgIHRhZzogXCJSb3dMZXZlbFNlY3VyaXR5XCIsXG4gICAgICAgIHZhbHVlOiBtb2R1bGUucm93TGV2ZWxTZWN1cml0eVxuICAgICAgfVxuICAgICk7XG4gICAgcHVzaChcbiAgICAgIG1vZHVsZS5leHBsaWNpdE5hbWVzICYmIHtcbiAgICAgICAgdGFnOiBcIkV4cGxpY2l0TmFtZXNcIixcbiAgICAgICAgdmFsdWU6IG1vZHVsZS5leHBsaWNpdE5hbWVzXG4gICAgICB9XG4gICAgKTtcbiAgICBwdXNoKFxuICAgICAgbW9kdWxlLmNhc2VDb252ZXJzaW9uUG9saWN5ICYmIHtcbiAgICAgICAgdGFnOiBcIkNhc2VDb252ZXJzaW9uUG9saWN5XCIsXG4gICAgICAgIHZhbHVlOiBtb2R1bGUuY2FzZUNvbnZlcnNpb25Qb2xpY3lcbiAgICAgIH1cbiAgICApO1xuICAgIHJldHVybiB7IHNlY3Rpb25zIH07XG4gIH1cbiAgLyoqXG4gICAqIFNldCB0aGUgY2FzZSBjb252ZXJzaW9uIHBvbGljeSBmb3IgdGhpcyBtb2R1bGUuXG4gICAqIENhbGxlZCBieSB0aGUgc2V0dGluZ3MgbWVjaGFuaXNtLlxuICAgKi9cbiAgc2V0Q2FzZUNvbnZlcnNpb25Qb2xpY3kocG9saWN5KSB7XG4gICAgdGhpcy4jbW9kdWxlRGVmLmNhc2VDb252ZXJzaW9uUG9saWN5ID0gcG9saWN5O1xuICB9XG4gIGdldCB0eXBlc3BhY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuI21vZHVsZURlZi50eXBlc3BhY2U7XG4gIH1cbiAgLyoqXG4gICAqIFJlc29sdmVzIHRoZSBhY3R1YWwgdHlwZSBvZiBhIFR5cGVCdWlsZGVyIGJ5IGZvbGxvd2luZyBpdHMgcmVmZXJlbmNlcyB1bnRpbCBpdCByZWFjaGVzIGEgbm9uLXJlZiB0eXBlLlxuICAgKiBAcGFyYW0gdHlwZXNwYWNlIFRoZSB0eXBlc3BhY2UgdG8gcmVzb2x2ZSB0eXBlcyBhZ2FpbnN0LlxuICAgKiBAcGFyYW0gdHlwZUJ1aWxkZXIgVGhlIFR5cGVCdWlsZGVyIHRvIHJlc29sdmUuXG4gICAqIEByZXR1cm5zIFRoZSByZXNvbHZlZCBhbGdlYnJhaWMgdHlwZS5cbiAgICovXG4gIHJlc29sdmVUeXBlKHR5cGVCdWlsZGVyKSB7XG4gICAgbGV0IHR5ID0gdHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZTtcbiAgICB3aGlsZSAodHkudGFnID09PSBcIlJlZlwiKSB7XG4gICAgICB0eSA9IHRoaXMudHlwZXNwYWNlLnR5cGVzW3R5LnZhbHVlXTtcbiAgICB9XG4gICAgcmV0dXJuIHR5O1xuICB9XG4gIC8qKlxuICAgKiBBZGRzIGEgdHlwZSB0byB0aGUgbW9kdWxlIGRlZmluaXRpb24ncyB0eXBlc3BhY2UgYXMgYSBgUmVmYCBpZiBpdCBpcyBhIG5hbWVkIGNvbXBvdW5kIHR5cGUgKFByb2R1Y3Qgb3IgU3VtKS5cbiAgICogT3RoZXJ3aXNlLCByZXR1cm5zIHRoZSB0eXBlIGFzIGlzLlxuICAgKiBAcGFyYW0gbmFtZVxuICAgKiBAcGFyYW0gdHlcbiAgICogQHJldHVybnNcbiAgICovXG4gIHJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlcikge1xuICAgIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFByb2R1Y3RCdWlsZGVyICYmICFpc1VuaXQodHlwZUJ1aWxkZXIpIHx8IHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgU3VtQnVpbGRlciB8fCB0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFJvd0J1aWxkZXIpIHtcbiAgICAgIHJldHVybiB0aGlzLiNyZWdpc3RlckNvbXBvdW5kVHlwZVJlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgT3B0aW9uQnVpbGRlcikge1xuICAgICAgcmV0dXJuIG5ldyBPcHRpb25CdWlsZGVyKFxuICAgICAgICB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlci52YWx1ZSlcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFJlc3VsdEJ1aWxkZXIpIHtcbiAgICAgIHJldHVybiBuZXcgUmVzdWx0QnVpbGRlcihcbiAgICAgICAgdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIub2spLFxuICAgICAgICB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlci5lcnIpXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBBcnJheUJ1aWxkZXIpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlCdWlsZGVyKFxuICAgICAgICB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlci5lbGVtZW50KVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHR5cGVCdWlsZGVyO1xuICAgIH1cbiAgfVxuICAjcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSh0eXBlQnVpbGRlcikge1xuICAgIGNvbnN0IHR5ID0gdHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZTtcbiAgICBjb25zdCBuYW1lID0gdHlwZUJ1aWxkZXIudHlwZU5hbWU7XG4gICAgaWYgKG5hbWUgPT09IHZvaWQgMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgTWlzc2luZyB0eXBlIG5hbWUgZm9yICR7dHlwZUJ1aWxkZXIuY29uc3RydWN0b3IubmFtZSA/PyBcIlR5cGVCdWlsZGVyXCJ9ICR7SlNPTi5zdHJpbmdpZnkodHlwZUJ1aWxkZXIpfWBcbiAgICAgICk7XG4gICAgfVxuICAgIGxldCByID0gdGhpcy4jY29tcG91bmRUeXBlcy5nZXQodHkpO1xuICAgIGlmIChyICE9IG51bGwpIHtcbiAgICAgIHJldHVybiByO1xuICAgIH1cbiAgICBjb25zdCBuZXdUeSA9IHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUm93QnVpbGRlciB8fCB0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFByb2R1Y3RCdWlsZGVyID8ge1xuICAgICAgdGFnOiBcIlByb2R1Y3RcIixcbiAgICAgIHZhbHVlOiB7IGVsZW1lbnRzOiBbXSB9XG4gICAgfSA6IHtcbiAgICAgIHRhZzogXCJTdW1cIixcbiAgICAgIHZhbHVlOiB7IHZhcmlhbnRzOiBbXSB9XG4gICAgfTtcbiAgICByID0gbmV3IFJlZkJ1aWxkZXIodGhpcy4jbW9kdWxlRGVmLnR5cGVzcGFjZS50eXBlcy5sZW5ndGgpO1xuICAgIHRoaXMuI21vZHVsZURlZi50eXBlc3BhY2UudHlwZXMucHVzaChuZXdUeSk7XG4gICAgdGhpcy4jY29tcG91bmRUeXBlcy5zZXQodHksIHIpO1xuICAgIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFJvd0J1aWxkZXIpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUyLCBlbGVtXSBvZiBPYmplY3QuZW50cmllcyh0eXBlQnVpbGRlci5yb3cpKSB7XG4gICAgICAgIG5ld1R5LnZhbHVlLmVsZW1lbnRzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IG5hbWUyLFxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KGVsZW0udHlwZUJ1aWxkZXIpLmFsZ2VicmFpY1R5cGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFByb2R1Y3RCdWlsZGVyKSB7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lMiwgZWxlbV0gb2YgT2JqZWN0LmVudHJpZXModHlwZUJ1aWxkZXIuZWxlbWVudHMpKSB7XG4gICAgICAgIG5ld1R5LnZhbHVlLmVsZW1lbnRzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IG5hbWUyLFxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KGVsZW0pLmFsZ2VicmFpY1R5cGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFN1bUJ1aWxkZXIpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUyLCB2YXJpYW50XSBvZiBPYmplY3QuZW50cmllcyh0eXBlQnVpbGRlci52YXJpYW50cykpIHtcbiAgICAgICAgbmV3VHkudmFsdWUudmFyaWFudHMucHVzaCh7XG4gICAgICAgICAgbmFtZTogbmFtZTIsXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodmFyaWFudCkuYWxnZWJyYWljVHlwZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy4jbW9kdWxlRGVmLnR5cGVzLnB1c2goe1xuICAgICAgc291cmNlTmFtZTogc3BsaXROYW1lKG5hbWUpLFxuICAgICAgdHk6IHIucmVmLFxuICAgICAgY3VzdG9tT3JkZXJpbmc6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gcjtcbiAgfVxufTtcbmZ1bmN0aW9uIGlzVW5pdCh0eXBlQnVpbGRlcikge1xuICByZXR1cm4gdHlwZUJ1aWxkZXIudHlwZU5hbWUgPT0gbnVsbCAmJiB0eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlLnZhbHVlLmVsZW1lbnRzLmxlbmd0aCA9PT0gMDtcbn1cbmZ1bmN0aW9uIHNwbGl0TmFtZShuYW1lKSB7XG4gIGNvbnN0IHNjb3BlID0gbmFtZS5zcGxpdChcIi5cIik7XG4gIHJldHVybiB7IHNvdXJjZU5hbWU6IHNjb3BlLnBvcCgpLCBzY29wZSB9O1xufVxuXG4vLyBzcmMvc2VydmVyL2h0dHBfaW50ZXJuYWwudHNcbnZhciBpbXBvcnRfc3RhdHVzZXMgPSBfX3RvRVNNKHJlcXVpcmVfc3RhdHVzZXMoKSk7XG5cbi8vIHNyYy9zZXJ2ZXIvcmFuZ2UudHNcbnZhciBSYW5nZSA9IGNsYXNzIHtcbiAgI2Zyb207XG4gICN0bztcbiAgY29uc3RydWN0b3IoZnJvbSwgdG8pIHtcbiAgICB0aGlzLiNmcm9tID0gZnJvbSA/PyB7IHRhZzogXCJ1bmJvdW5kZWRcIiB9O1xuICAgIHRoaXMuI3RvID0gdG8gPz8geyB0YWc6IFwidW5ib3VuZGVkXCIgfTtcbiAgfVxuICBnZXQgZnJvbSgpIHtcbiAgICByZXR1cm4gdGhpcy4jZnJvbTtcbiAgfVxuICBnZXQgdG8oKSB7XG4gICAgcmV0dXJuIHRoaXMuI3RvO1xuICB9XG59O1xuXG4vLyBzcmMvbGliL3RhYmxlLnRzXG5mdW5jdGlvbiB0YWJsZShvcHRzLCByb3csIC4uLl8pIHtcbiAgY29uc3Qge1xuICAgIG5hbWUsXG4gICAgcHVibGljOiBpc1B1YmxpYyA9IGZhbHNlLFxuICAgIGluZGV4ZXM6IHVzZXJJbmRleGVzID0gW10sXG4gICAgc2NoZWR1bGVkLFxuICAgIGV2ZW50OiBpc0V2ZW50ID0gZmFsc2VcbiAgfSA9IG9wdHM7XG4gIGNvbnN0IGNvbElkcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGNvbnN0IGNvbE5hbWVMaXN0ID0gW107XG4gIGlmICghKHJvdyBpbnN0YW5jZW9mIFJvd0J1aWxkZXIpKSB7XG4gICAgcm93ID0gbmV3IFJvd0J1aWxkZXIocm93KTtcbiAgfVxuICByb3cuYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cy5mb3JFYWNoKChlbGVtLCBpKSA9PiB7XG4gICAgY29sSWRzLnNldChlbGVtLm5hbWUsIGkpO1xuICAgIGNvbE5hbWVMaXN0LnB1c2goZWxlbS5uYW1lKTtcbiAgfSk7XG4gIGNvbnN0IHBrID0gW107XG4gIGNvbnN0IGluZGV4ZXMgPSBbXTtcbiAgY29uc3QgY29uc3RyYWludHMgPSBbXTtcbiAgY29uc3Qgc2VxdWVuY2VzID0gW107XG4gIGxldCBzY2hlZHVsZUF0Q29sO1xuICBjb25zdCBkZWZhdWx0VmFsdWVzID0gW107XG4gIGZvciAoY29uc3QgW25hbWUyLCBidWlsZGVyXSBvZiBPYmplY3QuZW50cmllcyhyb3cucm93KSkge1xuICAgIGNvbnN0IG1ldGEgPSBidWlsZGVyLmNvbHVtbk1ldGFkYXRhO1xuICAgIGlmIChtZXRhLmlzUHJpbWFyeUtleSkge1xuICAgICAgcGsucHVzaChjb2xJZHMuZ2V0KG5hbWUyKSk7XG4gICAgfVxuICAgIGNvbnN0IGlzVW5pcXVlID0gbWV0YS5pc1VuaXF1ZSB8fCBtZXRhLmlzUHJpbWFyeUtleTtcbiAgICBpZiAobWV0YS5pbmRleFR5cGUgfHwgaXNVbmlxdWUpIHtcbiAgICAgIGNvbnN0IGFsZ28gPSBtZXRhLmluZGV4VHlwZSA/PyBcImJ0cmVlXCI7XG4gICAgICBjb25zdCBpZCA9IGNvbElkcy5nZXQobmFtZTIpO1xuICAgICAgbGV0IGFsZ29yaXRobTtcbiAgICAgIHN3aXRjaCAoYWxnbykge1xuICAgICAgICBjYXNlIFwiYnRyZWVcIjpcbiAgICAgICAgICBhbGdvcml0aG0gPSBSYXdJbmRleEFsZ29yaXRobS5CVHJlZShbaWRdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImhhc2hcIjpcbiAgICAgICAgICBhbGdvcml0aG0gPSBSYXdJbmRleEFsZ29yaXRobS5IYXNoKFtpZF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZGlyZWN0XCI6XG4gICAgICAgICAgYWxnb3JpdGhtID0gUmF3SW5kZXhBbGdvcml0aG0uRGlyZWN0KGlkKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGluZGV4ZXMucHVzaCh7XG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcbiAgICAgICAgLy8gVW5uYW1lZCBpbmRleGVzIHdpbGwgYmUgYXNzaWduZWQgYSBnbG9iYWxseSB1bmlxdWUgbmFtZVxuICAgICAgICBhY2Nlc3Nvck5hbWU6IG5hbWUyLFxuICAgICAgICBhbGdvcml0aG1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoaXNVbmlxdWUpIHtcbiAgICAgIGNvbnN0cmFpbnRzLnB1c2goe1xuICAgICAgICBzb3VyY2VOYW1lOiB2b2lkIDAsXG4gICAgICAgIGRhdGE6IHsgdGFnOiBcIlVuaXF1ZVwiLCB2YWx1ZTogeyBjb2x1bW5zOiBbY29sSWRzLmdldChuYW1lMildIH0gfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChtZXRhLmlzQXV0b0luY3JlbWVudCkge1xuICAgICAgc2VxdWVuY2VzLnB1c2goe1xuICAgICAgICBzb3VyY2VOYW1lOiB2b2lkIDAsXG4gICAgICAgIHN0YXJ0OiB2b2lkIDAsXG4gICAgICAgIG1pblZhbHVlOiB2b2lkIDAsXG4gICAgICAgIG1heFZhbHVlOiB2b2lkIDAsXG4gICAgICAgIGNvbHVtbjogY29sSWRzLmdldChuYW1lMiksXG4gICAgICAgIGluY3JlbWVudDogMW5cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAobWV0YS5kZWZhdWx0VmFsdWUpIHtcbiAgICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTYpO1xuICAgICAgYnVpbGRlci5zZXJpYWxpemUod3JpdGVyLCBtZXRhLmRlZmF1bHRWYWx1ZSk7XG4gICAgICBkZWZhdWx0VmFsdWVzLnB1c2goe1xuICAgICAgICBjb2xJZDogY29sSWRzLmdldChuYW1lMiksXG4gICAgICAgIHZhbHVlOiB3cml0ZXIuZ2V0QnVmZmVyKClcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoc2NoZWR1bGVkKSB7XG4gICAgICBjb25zdCBhbGdlYnJhaWNUeXBlID0gYnVpbGRlci50eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlO1xuICAgICAgaWYgKHNjaGVkdWxlX2F0X2RlZmF1bHQuaXNTY2hlZHVsZUF0KGFsZ2VicmFpY1R5cGUpKSB7XG4gICAgICAgIHNjaGVkdWxlQXRDb2wgPSBjb2xJZHMuZ2V0KG5hbWUyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBpbmRleE9wdHMgb2YgdXNlckluZGV4ZXMgPz8gW10pIHtcbiAgICBsZXQgYWxnb3JpdGhtO1xuICAgIHN3aXRjaCAoaW5kZXhPcHRzLmFsZ29yaXRobSkge1xuICAgICAgY2FzZSBcImJ0cmVlXCI6XG4gICAgICAgIGFsZ29yaXRobSA9IHtcbiAgICAgICAgICB0YWc6IFwiQlRyZWVcIixcbiAgICAgICAgICB2YWx1ZTogaW5kZXhPcHRzLmNvbHVtbnMubWFwKChjKSA9PiBjb2xJZHMuZ2V0KGMpKVxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJoYXNoXCI6XG4gICAgICAgIGFsZ29yaXRobSA9IHtcbiAgICAgICAgICB0YWc6IFwiSGFzaFwiLFxuICAgICAgICAgIHZhbHVlOiBpbmRleE9wdHMuY29sdW1ucy5tYXAoKGMpID0+IGNvbElkcy5nZXQoYykpXG4gICAgICAgIH07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImRpcmVjdFwiOlxuICAgICAgICBhbGdvcml0aG0gPSB7IHRhZzogXCJEaXJlY3RcIiwgdmFsdWU6IGNvbElkcy5nZXQoaW5kZXhPcHRzLmNvbHVtbikgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGluZGV4ZXMucHVzaCh7XG4gICAgICBzb3VyY2VOYW1lOiB2b2lkIDAsXG4gICAgICBhY2Nlc3Nvck5hbWU6IGluZGV4T3B0cy5hY2Nlc3NvcixcbiAgICAgIGFsZ29yaXRobSxcbiAgICAgIGNhbm9uaWNhbE5hbWU6IGluZGV4T3B0cy5uYW1lXG4gICAgfSk7XG4gIH1cbiAgZm9yIChjb25zdCBjb25zdHJhaW50T3B0cyBvZiBvcHRzLmNvbnN0cmFpbnRzID8/IFtdKSB7XG4gICAgaWYgKGNvbnN0cmFpbnRPcHRzLmNvbnN0cmFpbnQgPT09IFwidW5pcXVlXCIpIHtcbiAgICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHRhZzogXCJVbmlxdWVcIixcbiAgICAgICAgdmFsdWU6IHsgY29sdW1uczogY29uc3RyYWludE9wdHMuY29sdW1ucy5tYXAoKGMpID0+IGNvbElkcy5nZXQoYykpIH1cbiAgICAgIH07XG4gICAgICBjb25zdHJhaW50cy5wdXNoKHsgc291cmNlTmFtZTogY29uc3RyYWludE9wdHMubmFtZSwgZGF0YSB9KTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgfVxuICBjb25zdCBwcm9kdWN0VHlwZSA9IHJvdy5hbGdlYnJhaWNUeXBlLnZhbHVlO1xuICBjb25zdCBzY2hlZHVsZSA9IHNjaGVkdWxlZCAmJiBzY2hlZHVsZUF0Q29sICE9PSB2b2lkIDAgPyB7IHNjaGVkdWxlQXRDb2wsIHJlZHVjZXI6IHNjaGVkdWxlZCB9IDogdm9pZCAwO1xuICByZXR1cm4ge1xuICAgIHJvd1R5cGU6IHJvdyxcbiAgICB0YWJsZU5hbWU6IG5hbWUsXG4gICAgcm93U3BhY2V0aW1lVHlwZTogcHJvZHVjdFR5cGUsXG4gICAgdGFibGVEZWY6IChjdHgsIGFjY05hbWUpID0+IHtcbiAgICAgIGNvbnN0IHRhYmxlTmFtZSA9IG5hbWUgPz8gYWNjTmFtZTtcbiAgICAgIGlmIChyb3cudHlwZU5hbWUgPT09IHZvaWQgMCkge1xuICAgICAgICByb3cudHlwZU5hbWUgPSB0b1Bhc2NhbENhc2UodGFibGVOYW1lKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgaW5kZXggb2YgaW5kZXhlcykge1xuICAgICAgICBjb25zdCBjb2xzID0gaW5kZXguYWxnb3JpdGhtLnRhZyA9PT0gXCJEaXJlY3RcIiA/IFtpbmRleC5hbGdvcml0aG0udmFsdWVdIDogaW5kZXguYWxnb3JpdGhtLnZhbHVlO1xuICAgICAgICBjb25zdCBjb2xTID0gY29scy5tYXAoKGkpID0+IGNvbE5hbWVMaXN0W2ldKS5qb2luKFwiX1wiKTtcbiAgICAgICAgY29uc3Qgc291cmNlTmFtZSA9IGluZGV4LnNvdXJjZU5hbWUgPSBgJHthY2NOYW1lfV8ke2NvbFN9X2lkeF8ke2luZGV4LmFsZ29yaXRobS50YWcudG9Mb3dlckNhc2UoKX1gO1xuICAgICAgICBjb25zdCB7IGNhbm9uaWNhbE5hbWUgfSA9IGluZGV4O1xuICAgICAgICBpZiAoY2Fub25pY2FsTmFtZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaChcbiAgICAgICAgICAgIEV4cGxpY2l0TmFtZUVudHJ5LkluZGV4KHsgc291cmNlTmFtZSwgY2Fub25pY2FsTmFtZSB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZU5hbWU6IGFjY05hbWUsXG4gICAgICAgIHByb2R1Y3RUeXBlUmVmOiBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHJvdykucmVmLFxuICAgICAgICBwcmltYXJ5S2V5OiBwayxcbiAgICAgICAgaW5kZXhlcyxcbiAgICAgICAgY29uc3RyYWludHMsXG4gICAgICAgIHNlcXVlbmNlcyxcbiAgICAgICAgdGFibGVUeXBlOiB7IHRhZzogXCJVc2VyXCIgfSxcbiAgICAgICAgdGFibGVBY2Nlc3M6IHsgdGFnOiBpc1B1YmxpYyA/IFwiUHVibGljXCIgOiBcIlByaXZhdGVcIiB9LFxuICAgICAgICBkZWZhdWx0VmFsdWVzLFxuICAgICAgICBpc0V2ZW50XG4gICAgICB9O1xuICAgIH0sXG4gICAgaWR4czoge30sXG4gICAgY29uc3RyYWludHMsXG4gICAgc2NoZWR1bGVcbiAgfTtcbn1cblxuLy8gc3JjL2xpYi9xdWVyeS50c1xudmFyIFF1ZXJ5QnJhbmQgPSBTeW1ib2woXCJRdWVyeUJyYW5kXCIpO1xudmFyIGlzUm93VHlwZWRRdWVyeSA9ICh2YWwpID0+ICEhdmFsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgUXVlcnlCcmFuZCBpbiB2YWw7XG52YXIgaXNUeXBlZFF1ZXJ5ID0gKHZhbCkgPT4gISF2YWwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiBRdWVyeUJyYW5kIGluIHZhbDtcbmZ1bmN0aW9uIHRvU3FsKHEpIHtcbiAgcmV0dXJuIHEudG9TcWwoKTtcbn1cbnZhciBTZW1pam9pbkltcGwgPSBjbGFzcyBfU2VtaWpvaW5JbXBsIHtcbiAgY29uc3RydWN0b3Ioc291cmNlUXVlcnksIGZpbHRlclF1ZXJ5LCBqb2luQ29uZGl0aW9uKSB7XG4gICAgdGhpcy5zb3VyY2VRdWVyeSA9IHNvdXJjZVF1ZXJ5O1xuICAgIHRoaXMuZmlsdGVyUXVlcnkgPSBmaWx0ZXJRdWVyeTtcbiAgICB0aGlzLmpvaW5Db25kaXRpb24gPSBqb2luQ29uZGl0aW9uO1xuICAgIGlmIChzb3VyY2VRdWVyeS50YWJsZS5zb3VyY2VOYW1lID09PSBmaWx0ZXJRdWVyeS50YWJsZS5zb3VyY2VOYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgc2VtaWpvaW4gYSB0YWJsZSB0byBpdHNlbGZcIik7XG4gICAgfVxuICB9XG4gIFtRdWVyeUJyYW5kXSA9IHRydWU7XG4gIHR5cGUgPSBcInNlbWlqb2luXCI7XG4gIGJ1aWxkKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHdoZXJlKHByZWRpY2F0ZSkge1xuICAgIGNvbnN0IG5leHRTb3VyY2VRdWVyeSA9IHRoaXMuc291cmNlUXVlcnkud2hlcmUocHJlZGljYXRlKTtcbiAgICByZXR1cm4gbmV3IF9TZW1pam9pbkltcGwoXG4gICAgICBuZXh0U291cmNlUXVlcnksXG4gICAgICB0aGlzLmZpbHRlclF1ZXJ5LFxuICAgICAgdGhpcy5qb2luQ29uZGl0aW9uXG4gICAgKTtcbiAgfVxuICB0b1NxbCgpIHtcbiAgICBjb25zdCBsZWZ0ID0gdGhpcy5maWx0ZXJRdWVyeTtcbiAgICBjb25zdCByaWdodCA9IHRoaXMuc291cmNlUXVlcnk7XG4gICAgY29uc3QgbGVmdFRhYmxlID0gcXVvdGVJZGVudGlmaWVyKGxlZnQudGFibGUuc291cmNlTmFtZSk7XG4gICAgY29uc3QgcmlnaHRUYWJsZSA9IHF1b3RlSWRlbnRpZmllcihyaWdodC50YWJsZS5zb3VyY2VOYW1lKTtcbiAgICBsZXQgc3FsID0gYFNFTEVDVCAke3JpZ2h0VGFibGV9LiogRlJPTSAke2xlZnRUYWJsZX0gSk9JTiAke3JpZ2h0VGFibGV9IE9OICR7Ym9vbGVhbkV4cHJUb1NxbCh0aGlzLmpvaW5Db25kaXRpb24pfWA7XG4gICAgY29uc3QgY2xhdXNlcyA9IFtdO1xuICAgIGlmIChsZWZ0LndoZXJlQ2xhdXNlKSB7XG4gICAgICBjbGF1c2VzLnB1c2goYm9vbGVhbkV4cHJUb1NxbChsZWZ0LndoZXJlQ2xhdXNlKSk7XG4gICAgfVxuICAgIGlmIChyaWdodC53aGVyZUNsYXVzZSkge1xuICAgICAgY2xhdXNlcy5wdXNoKGJvb2xlYW5FeHByVG9TcWwocmlnaHQud2hlcmVDbGF1c2UpKTtcbiAgICB9XG4gICAgaWYgKGNsYXVzZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3Qgd2hlcmVTcWwgPSBjbGF1c2VzLmxlbmd0aCA9PT0gMSA/IGNsYXVzZXNbMF0gOiBjbGF1c2VzLm1hcCh3cmFwSW5QYXJlbnMpLmpvaW4oXCIgQU5EIFwiKTtcbiAgICAgIHNxbCArPSBgIFdIRVJFICR7d2hlcmVTcWx9YDtcbiAgICB9XG4gICAgcmV0dXJuIHNxbDtcbiAgfVxufTtcbnZhciBGcm9tQnVpbGRlciA9IGNsYXNzIF9Gcm9tQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKHRhYmxlMiwgd2hlcmVDbGF1c2UpIHtcbiAgICB0aGlzLnRhYmxlID0gdGFibGUyO1xuICAgIHRoaXMud2hlcmVDbGF1c2UgPSB3aGVyZUNsYXVzZTtcbiAgfVxuICBbUXVlcnlCcmFuZF0gPSB0cnVlO1xuICB3aGVyZShwcmVkaWNhdGUpIHtcbiAgICBjb25zdCBuZXdDb25kaXRpb24gPSBwcmVkaWNhdGUodGhpcy50YWJsZS5jb2xzKTtcbiAgICBjb25zdCBuZXh0V2hlcmUgPSB0aGlzLndoZXJlQ2xhdXNlID8gdGhpcy53aGVyZUNsYXVzZS5hbmQobmV3Q29uZGl0aW9uKSA6IG5ld0NvbmRpdGlvbjtcbiAgICByZXR1cm4gbmV3IF9Gcm9tQnVpbGRlcih0aGlzLnRhYmxlLCBuZXh0V2hlcmUpO1xuICB9XG4gIHJpZ2h0U2VtaWpvaW4ocmlnaHQsIG9uKSB7XG4gICAgY29uc3Qgc291cmNlUXVlcnkgPSBuZXcgX0Zyb21CdWlsZGVyKHJpZ2h0KTtcbiAgICBjb25zdCBqb2luQ29uZGl0aW9uID0gb24oXG4gICAgICB0aGlzLnRhYmxlLmluZGV4ZWRDb2xzLFxuICAgICAgcmlnaHQuaW5kZXhlZENvbHNcbiAgICApO1xuICAgIHJldHVybiBuZXcgU2VtaWpvaW5JbXBsKHNvdXJjZVF1ZXJ5LCB0aGlzLCBqb2luQ29uZGl0aW9uKTtcbiAgfVxuICBsZWZ0U2VtaWpvaW4ocmlnaHQsIG9uKSB7XG4gICAgY29uc3QgZmlsdGVyUXVlcnkgPSBuZXcgX0Zyb21CdWlsZGVyKHJpZ2h0KTtcbiAgICBjb25zdCBqb2luQ29uZGl0aW9uID0gb24oXG4gICAgICB0aGlzLnRhYmxlLmluZGV4ZWRDb2xzLFxuICAgICAgcmlnaHQuaW5kZXhlZENvbHNcbiAgICApO1xuICAgIHJldHVybiBuZXcgU2VtaWpvaW5JbXBsKHRoaXMsIGZpbHRlclF1ZXJ5LCBqb2luQ29uZGl0aW9uKTtcbiAgfVxuICB0b1NxbCgpIHtcbiAgICByZXR1cm4gcmVuZGVyU2VsZWN0U3FsV2l0aEpvaW5zKHRoaXMudGFibGUsIHRoaXMud2hlcmVDbGF1c2UpO1xuICB9XG4gIGJ1aWxkKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xudmFyIFRhYmxlUmVmSW1wbCA9IGNsYXNzIHtcbiAgW1F1ZXJ5QnJhbmRdID0gdHJ1ZTtcbiAgdHlwZSA9IFwidGFibGVcIjtcbiAgc291cmNlTmFtZTtcbiAgYWNjZXNzb3JOYW1lO1xuICBjb2xzO1xuICBpbmRleGVkQ29scztcbiAgdGFibGVEZWY7XG4gIC8vIERlbGVnYXRlIFVudHlwZWRUYWJsZURlZiBwcm9wZXJ0aWVzIGZyb20gdGFibGVEZWYgc28gdGhpcyBjYW4gYmUgdXNlZCBhcyBhIHRhYmxlIGRlZi5cbiAgZ2V0IGNvbHVtbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFibGVEZWYuY29sdW1ucztcbiAgfVxuICBnZXQgaW5kZXhlcygpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZURlZi5pbmRleGVzO1xuICB9XG4gIGdldCByb3dUeXBlKCkge1xuICAgIHJldHVybiB0aGlzLnRhYmxlRGVmLnJvd1R5cGU7XG4gIH1cbiAgZ2V0IGNvbnN0cmFpbnRzKCkge1xuICAgIHJldHVybiB0aGlzLnRhYmxlRGVmLmNvbnN0cmFpbnRzO1xuICB9XG4gIGNvbnN0cnVjdG9yKHRhYmxlRGVmKSB7XG4gICAgdGhpcy5zb3VyY2VOYW1lID0gdGFibGVEZWYuc291cmNlTmFtZTtcbiAgICB0aGlzLmFjY2Vzc29yTmFtZSA9IHRhYmxlRGVmLmFjY2Vzc29yTmFtZTtcbiAgICB0aGlzLmNvbHMgPSBjcmVhdGVSb3dFeHByKHRhYmxlRGVmKTtcbiAgICB0aGlzLmluZGV4ZWRDb2xzID0gdGhpcy5jb2xzO1xuICAgIHRoaXMudGFibGVEZWYgPSB0YWJsZURlZjtcbiAgICBPYmplY3QuZnJlZXplKHRoaXMpO1xuICB9XG4gIGFzRnJvbSgpIHtcbiAgICByZXR1cm4gbmV3IEZyb21CdWlsZGVyKHRoaXMpO1xuICB9XG4gIHJpZ2h0U2VtaWpvaW4ob3RoZXIsIG9uKSB7XG4gICAgcmV0dXJuIHRoaXMuYXNGcm9tKCkucmlnaHRTZW1pam9pbihvdGhlciwgb24pO1xuICB9XG4gIGxlZnRTZW1pam9pbihvdGhlciwgb24pIHtcbiAgICByZXR1cm4gdGhpcy5hc0Zyb20oKS5sZWZ0U2VtaWpvaW4ob3RoZXIsIG9uKTtcbiAgfVxuICBidWlsZCgpIHtcbiAgICByZXR1cm4gdGhpcy5hc0Zyb20oKS5idWlsZCgpO1xuICB9XG4gIHRvU3FsKCkge1xuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLnRvU3FsKCk7XG4gIH1cbiAgd2hlcmUocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuYXNGcm9tKCkud2hlcmUocHJlZGljYXRlKTtcbiAgfVxufTtcbmZ1bmN0aW9uIGNyZWF0ZVRhYmxlUmVmRnJvbURlZih0YWJsZURlZikge1xuICByZXR1cm4gbmV3IFRhYmxlUmVmSW1wbCh0YWJsZURlZik7XG59XG5mdW5jdGlvbiBtYWtlUXVlcnlCdWlsZGVyKHNjaGVtYTIpIHtcbiAgY29uc3QgcWIgPSAvKiBAX19QVVJFX18gKi8gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgZm9yIChjb25zdCB0YWJsZTIgb2YgT2JqZWN0LnZhbHVlcyhzY2hlbWEyLnRhYmxlcykpIHtcbiAgICBjb25zdCByZWYgPSBjcmVhdGVUYWJsZVJlZkZyb21EZWYoXG4gICAgICB0YWJsZTJcbiAgICApO1xuICAgIHFiW3RhYmxlMi5hY2Nlc3Nvck5hbWVdID0gcmVmO1xuICB9XG4gIHJldHVybiBPYmplY3QuZnJlZXplKHFiKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVJvd0V4cHIodGFibGVEZWYpIHtcbiAgY29uc3Qgcm93ID0ge307XG4gIGZvciAoY29uc3QgY29sdW1uTmFtZSBvZiBPYmplY3Qua2V5cyh0YWJsZURlZi5jb2x1bW5zKSkge1xuICAgIGNvbnN0IGNvbHVtbkJ1aWxkZXIgPSB0YWJsZURlZi5jb2x1bW5zW2NvbHVtbk5hbWVdO1xuICAgIGNvbnN0IGNvbHVtbiA9IG5ldyBDb2x1bW5FeHByZXNzaW9uKFxuICAgICAgdGFibGVEZWYuc291cmNlTmFtZSxcbiAgICAgIGNvbHVtbk5hbWUsXG4gICAgICBjb2x1bW5CdWlsZGVyLnR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGVcbiAgICApO1xuICAgIHJvd1tjb2x1bW5OYW1lXSA9IE9iamVjdC5mcmVlemUoY29sdW1uKTtcbiAgfVxuICByZXR1cm4gT2JqZWN0LmZyZWV6ZShyb3cpO1xufVxuZnVuY3Rpb24gcmVuZGVyU2VsZWN0U3FsV2l0aEpvaW5zKHRhYmxlMiwgd2hlcmUsIGV4dHJhQ2xhdXNlcyA9IFtdKSB7XG4gIGNvbnN0IHF1b3RlZFRhYmxlID0gcXVvdGVJZGVudGlmaWVyKHRhYmxlMi5zb3VyY2VOYW1lKTtcbiAgY29uc3Qgc3FsID0gYFNFTEVDVCAqIEZST00gJHtxdW90ZWRUYWJsZX1gO1xuICBjb25zdCBjbGF1c2VzID0gW107XG4gIGlmICh3aGVyZSkgY2xhdXNlcy5wdXNoKGJvb2xlYW5FeHByVG9TcWwod2hlcmUpKTtcbiAgY2xhdXNlcy5wdXNoKC4uLmV4dHJhQ2xhdXNlcyk7XG4gIGlmIChjbGF1c2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHNxbDtcbiAgY29uc3Qgd2hlcmVTcWwgPSBjbGF1c2VzLmxlbmd0aCA9PT0gMSA/IGNsYXVzZXNbMF0gOiBjbGF1c2VzLm1hcCh3cmFwSW5QYXJlbnMpLmpvaW4oXCIgQU5EIFwiKTtcbiAgcmV0dXJuIGAke3NxbH0gV0hFUkUgJHt3aGVyZVNxbH1gO1xufVxudmFyIENvbHVtbkV4cHJlc3Npb24gPSBjbGFzcyB7XG4gIHR5cGUgPSBcImNvbHVtblwiO1xuICBjb2x1bW47XG4gIHRhYmxlO1xuICAvLyBwaGFudG9tOiBhY3R1YWwgcnVudGltZSB2YWx1ZSBpcyB1bmRlZmluZWRcbiAgdHNWYWx1ZVR5cGU7XG4gIHNwYWNldGltZVR5cGU7XG4gIGNvbnN0cnVjdG9yKHRhYmxlMiwgY29sdW1uLCBzcGFjZXRpbWVUeXBlKSB7XG4gICAgdGhpcy50YWJsZSA9IHRhYmxlMjtcbiAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcbiAgICB0aGlzLnNwYWNldGltZVR5cGUgPSBzcGFjZXRpbWVUeXBlO1xuICB9XG4gIGVxKHgpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcbiAgICAgIHR5cGU6IFwiZXFcIixcbiAgICAgIGxlZnQ6IHRoaXMsXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcbiAgICB9KTtcbiAgfVxuICBuZSh4KSB7XG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcIm5lXCIsXG4gICAgICBsZWZ0OiB0aGlzLFxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXG4gICAgfSk7XG4gIH1cbiAgbHQoeCkge1xuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJsdFwiLFxuICAgICAgbGVmdDogdGhpcyxcbiAgICAgIHJpZ2h0OiBub3JtYWxpemVWYWx1ZSh4KVxuICAgIH0pO1xuICB9XG4gIGx0ZSh4KSB7XG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XG4gICAgICB0eXBlOiBcImx0ZVwiLFxuICAgICAgbGVmdDogdGhpcyxcbiAgICAgIHJpZ2h0OiBub3JtYWxpemVWYWx1ZSh4KVxuICAgIH0pO1xuICB9XG4gIGd0KHgpIHtcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcbiAgICAgIHR5cGU6IFwiZ3RcIixcbiAgICAgIGxlZnQ6IHRoaXMsXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcbiAgICB9KTtcbiAgfVxuICBndGUoeCkge1xuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgICAgdHlwZTogXCJndGVcIixcbiAgICAgIGxlZnQ6IHRoaXMsXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcbiAgICB9KTtcbiAgfVxufTtcbmZ1bmN0aW9uIGxpdGVyYWwodmFsdWUpIHtcbiAgcmV0dXJuIHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlIH07XG59XG5mdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWwpIHtcbiAgaWYgKHZhbC50eXBlID09PSBcImxpdGVyYWxcIilcbiAgICByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiB2YWwgIT0gbnVsbCAmJiBcInR5cGVcIiBpbiB2YWwgJiYgdmFsLnR5cGUgPT09IFwiY29sdW1uXCIpIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG4gIHJldHVybiBsaXRlcmFsKHZhbCk7XG59XG52YXIgQm9vbGVhbkV4cHIgPSBjbGFzcyBfQm9vbGVhbkV4cHIge1xuICBjb25zdHJ1Y3RvcihkYXRhKSB7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxuICBhbmQob3RoZXIpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sZWFuRXhwcih7IHR5cGU6IFwiYW5kXCIsIGNsYXVzZXM6IFt0aGlzLmRhdGEsIG90aGVyLmRhdGFdIH0pO1xuICB9XG4gIG9yKG90aGVyKSB7XG4gICAgcmV0dXJuIG5ldyBfQm9vbGVhbkV4cHIoeyB0eXBlOiBcIm9yXCIsIGNsYXVzZXM6IFt0aGlzLmRhdGEsIG90aGVyLmRhdGFdIH0pO1xuICB9XG4gIG5vdCgpIHtcbiAgICByZXR1cm4gbmV3IF9Cb29sZWFuRXhwcih7IHR5cGU6IFwibm90XCIsIGNsYXVzZTogdGhpcy5kYXRhIH0pO1xuICB9XG59O1xuZnVuY3Rpb24gbm90KGNsYXVzZSkge1xuICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHsgdHlwZTogXCJub3RcIiwgY2xhdXNlOiBjbGF1c2UuZGF0YSB9KTtcbn1cbmZ1bmN0aW9uIGFuZCguLi5jbGF1c2VzKSB7XG4gIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgIHR5cGU6IFwiYW5kXCIsXG4gICAgY2xhdXNlczogY2xhdXNlcy5tYXAoKGMpID0+IGMuZGF0YSlcbiAgfSk7XG59XG5mdW5jdGlvbiBvciguLi5jbGF1c2VzKSB7XG4gIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xuICAgIHR5cGU6IFwib3JcIixcbiAgICBjbGF1c2VzOiBjbGF1c2VzLm1hcCgoYykgPT4gYy5kYXRhKVxuICB9KTtcbn1cbmZ1bmN0aW9uIGJvb2xlYW5FeHByVG9TcWwoZXhwciwgdGFibGVBbGlhcykge1xuICBjb25zdCBkYXRhID0gZXhwciBpbnN0YW5jZW9mIEJvb2xlYW5FeHByID8gZXhwci5kYXRhIDogZXhwcjtcbiAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICBjYXNlIFwiZXFcIjpcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA9ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcbiAgICBjYXNlIFwibmVcIjpcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA8PiAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XG4gICAgY2FzZSBcImd0XCI6XG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPiAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XG4gICAgY2FzZSBcImd0ZVwiOlxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9ID49ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcbiAgICBjYXNlIFwibHRcIjpcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA8ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcbiAgICBjYXNlIFwibHRlXCI6XG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPD0gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xuICAgIGNhc2UgXCJhbmRcIjpcbiAgICAgIHJldHVybiBkYXRhLmNsYXVzZXMubWFwKChjKSA9PiBib29sZWFuRXhwclRvU3FsKGMpKS5tYXAod3JhcEluUGFyZW5zKS5qb2luKFwiIEFORCBcIik7XG4gICAgY2FzZSBcIm9yXCI6XG4gICAgICByZXR1cm4gZGF0YS5jbGF1c2VzLm1hcCgoYykgPT4gYm9vbGVhbkV4cHJUb1NxbChjKSkubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBPUiBcIik7XG4gICAgY2FzZSBcIm5vdFwiOlxuICAgICAgcmV0dXJuIGBOT1QgJHt3cmFwSW5QYXJlbnMoYm9vbGVhbkV4cHJUb1NxbChkYXRhLmNsYXVzZSkpfWA7XG4gIH1cbn1cbmZ1bmN0aW9uIHdyYXBJblBhcmVucyhzcWwpIHtcbiAgcmV0dXJuIGAoJHtzcWx9KWA7XG59XG5mdW5jdGlvbiB2YWx1ZUV4cHJUb1NxbChleHByLCB0YWJsZUFsaWFzKSB7XG4gIGlmIChpc0xpdGVyYWxFeHByKGV4cHIpKSB7XG4gICAgcmV0dXJuIGxpdGVyYWxWYWx1ZVRvU3FsKGV4cHIudmFsdWUpO1xuICB9XG4gIGNvbnN0IHRhYmxlMiA9IGV4cHIudGFibGU7XG4gIHJldHVybiBgJHtxdW90ZUlkZW50aWZpZXIodGFibGUyKX0uJHtxdW90ZUlkZW50aWZpZXIoZXhwci5jb2x1bW4pfWA7XG59XG5mdW5jdGlvbiBsaXRlcmFsVmFsdWVUb1NxbCh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHZvaWQgMCkge1xuICAgIHJldHVybiBcIk5VTExcIjtcbiAgfVxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBJZGVudGl0eSB8fCB2YWx1ZSBpbnN0YW5jZW9mIENvbm5lY3Rpb25JZCkge1xuICAgIHJldHVybiBgMHgke3ZhbHVlLnRvSGV4U3RyaW5nKCl9YDtcbiAgfVxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUaW1lc3RhbXApIHtcbiAgICByZXR1cm4gYCcke3ZhbHVlLnRvSVNPU3RyaW5nKCl9J2A7XG4gIH1cbiAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgY2FzZSBcImJpZ2ludFwiOlxuICAgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSk7XG4gICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgIHJldHVybiB2YWx1ZSA/IFwiVFJVRVwiIDogXCJGQUxTRVwiO1xuICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgIHJldHVybiBgJyR7dmFsdWUucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gYCcke0pTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2A7XG4gIH1cbn1cbmZ1bmN0aW9uIHF1b3RlSWRlbnRpZmllcihuYW1lKSB7XG4gIHJldHVybiBgXCIke25hbWUucmVwbGFjZSgvXCIvZywgJ1wiXCInKX1cImA7XG59XG5mdW5jdGlvbiBpc0xpdGVyYWxFeHByKGV4cHIpIHtcbiAgcmV0dXJuIGV4cHIudHlwZSA9PT0gXCJsaXRlcmFsXCI7XG59XG5mdW5jdGlvbiBldmFsdWF0ZUJvb2xlYW5FeHByKGV4cHIsIHJvdykge1xuICByZXR1cm4gZXZhbHVhdGVEYXRhKGV4cHIuZGF0YSwgcm93KTtcbn1cbmZ1bmN0aW9uIGV2YWx1YXRlRGF0YShkYXRhLCByb3cpIHtcbiAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICBjYXNlIFwiZXFcIjpcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpID09PSByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcbiAgICBjYXNlIFwibmVcIjpcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpICE9PSByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcbiAgICBjYXNlIFwiZ3RcIjpcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpID4gcmVzb2x2ZVZhbHVlKGRhdGEucmlnaHQsIHJvdyk7XG4gICAgY2FzZSBcImd0ZVwiOlxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgPj0gcmVzb2x2ZVZhbHVlKGRhdGEucmlnaHQsIHJvdyk7XG4gICAgY2FzZSBcImx0XCI6XG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA8IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xuICAgIGNhc2UgXCJsdGVcIjpcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpIDw9IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xuICAgIGNhc2UgXCJhbmRcIjpcbiAgICAgIHJldHVybiBkYXRhLmNsYXVzZXMuZXZlcnkoKGMpID0+IGV2YWx1YXRlRGF0YShjLCByb3cpKTtcbiAgICBjYXNlIFwib3JcIjpcbiAgICAgIHJldHVybiBkYXRhLmNsYXVzZXMuc29tZSgoYykgPT4gZXZhbHVhdGVEYXRhKGMsIHJvdykpO1xuICAgIGNhc2UgXCJub3RcIjpcbiAgICAgIHJldHVybiAhZXZhbHVhdGVEYXRhKGRhdGEuY2xhdXNlLCByb3cpO1xuICB9XG59XG5mdW5jdGlvbiByZXNvbHZlVmFsdWUoZXhwciwgcm93KSB7XG4gIGlmIChpc0xpdGVyYWxFeHByKGV4cHIpKSB7XG4gICAgcmV0dXJuIHRvQ29tcGFyYWJsZVZhbHVlKGV4cHIudmFsdWUpO1xuICB9XG4gIHJldHVybiB0b0NvbXBhcmFibGVWYWx1ZShyb3dbZXhwci5jb2x1bW5dKTtcbn1cbmZ1bmN0aW9uIGlzSGV4U2VyaWFsaXphYmxlTGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlLnRvSGV4U3RyaW5nID09PSBcImZ1bmN0aW9uXCI7XG59XG5mdW5jdGlvbiBpc1RpbWVzdGFtcExpa2UodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIpIHJldHVybiBmYWxzZTtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgVGltZXN0YW1wKSByZXR1cm4gdHJ1ZTtcbiAgY29uc3QgbWljcm9zID0gdmFsdWVbXCJfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXCJdO1xuICByZXR1cm4gdHlwZW9mIG1pY3JvcyA9PT0gXCJiaWdpbnRcIjtcbn1cbmZ1bmN0aW9uIHRvQ29tcGFyYWJsZVZhbHVlKHZhbHVlKSB7XG4gIGlmIChpc0hleFNlcmlhbGl6YWJsZUxpa2UodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvSGV4U3RyaW5nKCk7XG4gIH1cbiAgaWYgKGlzVGltZXN0YW1wTGlrZSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWUuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiBnZXRRdWVyeVRhYmxlTmFtZShxdWVyeSkge1xuICBpZiAocXVlcnkudGFibGUpIHJldHVybiBxdWVyeS50YWJsZS5uYW1lO1xuICBpZiAocXVlcnkubmFtZSkgcmV0dXJuIHF1ZXJ5Lm5hbWU7XG4gIGlmIChxdWVyeS5zb3VyY2VRdWVyeSkgcmV0dXJuIHF1ZXJ5LnNvdXJjZVF1ZXJ5LnRhYmxlLm5hbWU7XG4gIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBleHRyYWN0IHRhYmxlIG5hbWUgZnJvbSBxdWVyeVwiKTtcbn1cbmZ1bmN0aW9uIGdldFF1ZXJ5QWNjZXNzb3JOYW1lKHF1ZXJ5KSB7XG4gIGlmIChxdWVyeS50YWJsZSkgcmV0dXJuIHF1ZXJ5LnRhYmxlLmFjY2Vzc29yTmFtZTtcbiAgaWYgKHF1ZXJ5LmFjY2Vzc29yTmFtZSkgcmV0dXJuIHF1ZXJ5LmFjY2Vzc29yTmFtZTtcbiAgaWYgKHF1ZXJ5LnNvdXJjZVF1ZXJ5KSByZXR1cm4gcXVlcnkuc291cmNlUXVlcnkudGFibGUuYWNjZXNzb3JOYW1lO1xuICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZXh0cmFjdCBhY2Nlc3NvciBuYW1lIGZyb20gcXVlcnlcIik7XG59XG5mdW5jdGlvbiBnZXRRdWVyeVdoZXJlQ2xhdXNlKHF1ZXJ5KSB7XG4gIGlmIChxdWVyeS53aGVyZUNsYXVzZSkgcmV0dXJuIHF1ZXJ5LndoZXJlQ2xhdXNlO1xuICByZXR1cm4gdm9pZCAwO1xufVxuXG4vLyBzcmMvc2VydmVyL3ZpZXdzLnRzXG5mdW5jdGlvbiBtYWtlVmlld0V4cG9ydChjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbikge1xuICBjb25zdCB2aWV3RXhwb3J0ID0gKFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHlwZXNjcmlwdCBpbmNvcnJlY3RseSBzYXlzIEZ1bmN0aW9uI2JpbmQgcmVxdWlyZXMgYW4gYXJndW1lbnQuXG4gICAgZm4uYmluZCgpXG4gICk7XG4gIHZpZXdFeHBvcnRbZXhwb3J0Q29udGV4dF0gPSBjdHg7XG4gIHZpZXdFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdID0gKGN0eDIsIGV4cG9ydE5hbWUpID0+IHtcbiAgICByZWdpc3RlclZpZXcoY3R4Miwgb3B0cywgZXhwb3J0TmFtZSwgZmFsc2UsIHBhcmFtcywgcmV0LCBmbik7XG4gIH07XG4gIHJldHVybiB2aWV3RXhwb3J0O1xufVxuZnVuY3Rpb24gbWFrZUFub25WaWV3RXhwb3J0KGN0eCwgb3B0cywgcGFyYW1zLCByZXQsIGZuKSB7XG4gIGNvbnN0IHZpZXdFeHBvcnQgPSAoXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlc2NyaXB0IGluY29ycmVjdGx5IHNheXMgRnVuY3Rpb24jYmluZCByZXF1aXJlcyBhbiBhcmd1bWVudC5cbiAgICBmbi5iaW5kKClcbiAgKTtcbiAgdmlld0V4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcbiAgdmlld0V4cG9ydFtyZWdpc3RlckV4cG9ydF0gPSAoY3R4MiwgZXhwb3J0TmFtZSkgPT4ge1xuICAgIHJlZ2lzdGVyVmlldyhjdHgyLCBvcHRzLCBleHBvcnROYW1lLCB0cnVlLCBwYXJhbXMsIHJldCwgZm4pO1xuICB9O1xuICByZXR1cm4gdmlld0V4cG9ydDtcbn1cbmZ1bmN0aW9uIHJlZ2lzdGVyVmlldyhjdHgsIG9wdHMsIGV4cG9ydE5hbWUsIGFub24sIHBhcmFtcywgcmV0LCBmbikge1xuICBjb25zdCBwYXJhbXNCdWlsZGVyID0gbmV3IFJvd0J1aWxkZXIocGFyYW1zLCB0b1Bhc2NhbENhc2UoZXhwb3J0TmFtZSkpO1xuICBsZXQgcmV0dXJuVHlwZSA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocmV0KS5hbGdlYnJhaWNUeXBlO1xuICBjb25zdCB7IHR5cGVzcGFjZSB9ID0gY3R4O1xuICBjb25zdCB7IHZhbHVlOiBwYXJhbVR5cGUgfSA9IGN0eC5yZXNvbHZlVHlwZShcbiAgICBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHBhcmFtc0J1aWxkZXIpXG4gICk7XG4gIGN0eC5tb2R1bGVEZWYudmlld3MucHVzaCh7XG4gICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcbiAgICBpbmRleDogKGFub24gPyBjdHguYW5vblZpZXdzIDogY3R4LnZpZXdzKS5sZW5ndGgsXG4gICAgaXNQdWJsaWM6IG9wdHMucHVibGljLFxuICAgIGlzQW5vbnltb3VzOiBhbm9uLFxuICAgIHBhcmFtczogcGFyYW1UeXBlLFxuICAgIHJldHVyblR5cGVcbiAgfSk7XG4gIGlmIChvcHRzLm5hbWUgIT0gbnVsbCkge1xuICAgIGN0eC5tb2R1bGVEZWYuZXhwbGljaXROYW1lcy5lbnRyaWVzLnB1c2goe1xuICAgICAgdGFnOiBcIkZ1bmN0aW9uXCIsXG4gICAgICB2YWx1ZToge1xuICAgICAgICBzb3VyY2VOYW1lOiBleHBvcnROYW1lLFxuICAgICAgICBjYW5vbmljYWxOYW1lOiBvcHRzLm5hbWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBpZiAocmV0dXJuVHlwZS50YWcgPT0gXCJTdW1cIikge1xuICAgIGNvbnN0IG9yaWdpbmFsRm4gPSBmbjtcbiAgICBmbiA9ICgoY3R4MiwgYXJncykgPT4ge1xuICAgICAgY29uc3QgcmV0MiA9IG9yaWdpbmFsRm4oY3R4MiwgYXJncyk7XG4gICAgICByZXR1cm4gcmV0MiA9PSBudWxsID8gW10gOiBbcmV0Ml07XG4gICAgfSk7XG4gICAgcmV0dXJuVHlwZSA9IEFsZ2VicmFpY1R5cGUuQXJyYXkoXG4gICAgICByZXR1cm5UeXBlLnZhbHVlLnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGVcbiAgICApO1xuICB9XG4gIChhbm9uID8gY3R4LmFub25WaWV3cyA6IGN0eC52aWV3cykucHVzaCh7XG4gICAgZm4sXG4gICAgZGVzZXJpYWxpemVQYXJhbXM6IFByb2R1Y3RUeXBlLm1ha2VEZXNlcmlhbGl6ZXIocGFyYW1UeXBlLCB0eXBlc3BhY2UpLFxuICAgIHNlcmlhbGl6ZVJldHVybjogQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihyZXR1cm5UeXBlLCB0eXBlc3BhY2UpLFxuICAgIHJldHVyblR5cGVCYXNlU2l6ZTogYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHJldHVyblR5cGUpXG4gIH0pO1xufVxuXG4vLyBzcmMvbGliL2Vycm9ycy50c1xudmFyIFNlbmRlckVycm9yID0gY2xhc3MgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gXCJTZW5kZXJFcnJvclwiO1xuICB9XG59O1xuXG4vLyBzcmMvc2VydmVyL2Vycm9ycy50c1xudmFyIFNwYWNldGltZUhvc3RFcnJvciA9IGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIFwiU3BhY2V0aW1lSG9zdEVycm9yXCI7XG4gIH1cbn07XG52YXIgZXJyb3JEYXRhID0ge1xuICAvKipcbiAgICogQSBnZW5lcmljIGVycm9yIGNsYXNzIGZvciB1bmtub3duIGVycm9yIGNvZGVzLlxuICAgKi9cbiAgSG9zdENhbGxGYWlsdXJlOiAxLFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGFuIEFCSSBjYWxsIHdhcyBtYWRlIG91dHNpZGUgb2YgYSB0cmFuc2FjdGlvbi5cbiAgICovXG4gIE5vdEluVHJhbnNhY3Rpb246IDIsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgQlNBVE4gZGVjb2RpbmcgZmFpbGVkLlxuICAgKiBUaGlzIHR5cGljYWxseSBtZWFucyB0aGF0IHRoZSBkYXRhIGNvdWxkIG5vdCBiZSBkZWNvZGVkIHRvIHRoZSBleHBlY3RlZCB0eXBlLlxuICAgKi9cbiAgQnNhdG5EZWNvZGVFcnJvcjogMyxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCB0YWJsZSBkb2VzIG5vdCBleGlzdC5cbiAgICovXG4gIE5vU3VjaFRhYmxlOiA0LFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgc3BlY2lmaWVkIGluZGV4IGRvZXMgbm90IGV4aXN0LlxuICAgKi9cbiAgTm9TdWNoSW5kZXg6IDUsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSBzcGVjaWZpZWQgcm93IGl0ZXJhdG9yIGlzIG5vdCB2YWxpZC5cbiAgICovXG4gIE5vU3VjaEl0ZXI6IDYsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSBzcGVjaWZpZWQgY29uc29sZSB0aW1lciBkb2VzIG5vdCBleGlzdC5cbiAgICovXG4gIE5vU3VjaENvbnNvbGVUaW1lcjogNyxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCBieXRlcyBzb3VyY2Ugb3Igc2luayBpcyBub3QgdmFsaWQuXG4gICAqL1xuICBOb1N1Y2hCeXRlczogOCxcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHByb3ZpZGVkIHNpbmsgaGFzIG5vIG1vcmUgc3BhY2UgbGVmdC5cbiAgICovXG4gIE5vU3BhY2U6IDksXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgdGhlcmUgaXMgbm8gbW9yZSBzcGFjZSBpbiB0aGUgZGF0YWJhc2UuXG4gICAqL1xuICBCdWZmZXJUb29TbWFsbDogMTEsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSB2YWx1ZSB3aXRoIGEgZ2l2ZW4gdW5pcXVlIGlkZW50aWZpZXIgYWxyZWFkeSBleGlzdHMuXG4gICAqL1xuICBVbmlxdWVBbHJlYWR5RXhpc3RzOiAxMixcbiAgLyoqXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCB0aGUgc3BlY2lmaWVkIGRlbGF5IGluIHNjaGVkdWxpbmcgYSByb3cgd2FzIHRvbyBsb25nLlxuICAgKi9cbiAgU2NoZWR1bGVBdERlbGF5VG9vTG9uZzogMTMsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gaW5kZXggd2FzIG5vdCB1bmlxdWUgd2hlbiBpdCB3YXMgZXhwZWN0ZWQgdG8gYmUuXG4gICAqL1xuICBJbmRleE5vdFVuaXF1ZTogMTQsXG4gIC8qKlxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gaW5kZXggd2FzIG5vdCB1bmlxdWUgd2hlbiBpdCB3YXMgZXhwZWN0ZWQgdG8gYmUuXG4gICAqL1xuICBOb1N1Y2hSb3c6IDE1LFxuICAvKipcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGFuIGF1dG8taW5jcmVtZW50IHNlcXVlbmNlIGhhcyBvdmVyZmxvd2VkLlxuICAgKi9cbiAgQXV0b0luY092ZXJmbG93OiAxNixcbiAgV291bGRCbG9ja1RyYW5zYWN0aW9uOiAxNyxcbiAgVHJhbnNhY3Rpb25Ob3RBbm9ueW1vdXM6IDE4LFxuICBUcmFuc2FjdGlvbklzUmVhZE9ubHk6IDE5LFxuICBUcmFuc2FjdGlvbklzTXV0OiAyMCxcbiAgSHR0cEVycm9yOiAyMVxufTtcbmZ1bmN0aW9uIG1hcEVudHJpZXMoeCwgZikge1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKHgpLm1hcCgoW2ssIHZdKSA9PiBbaywgZihrLCB2KV0pXG4gICk7XG59XG52YXIgZXJybm9Ub0NsYXNzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBlcnJvcnMgPSBPYmplY3QuZnJlZXplKFxuICBtYXBFbnRyaWVzKGVycm9yRGF0YSwgKG5hbWUsIGNvZGUpID0+IHtcbiAgICBjb25zdCBjbHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICBjbGFzcyBleHRlbmRzIFNwYWNldGltZUhvc3RFcnJvciB7XG4gICAgICAgIGdldCBuYW1lKCkge1xuICAgICAgICAgIHJldHVybiBuYW1lO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJuYW1lXCIsXG4gICAgICB7IHZhbHVlOiBuYW1lLCB3cml0YWJsZTogZmFsc2UgfVxuICAgICk7XG4gICAgZXJybm9Ub0NsYXNzLnNldChjb2RlLCBjbHMpO1xuICAgIHJldHVybiBjbHM7XG4gIH0pXG4pO1xuZnVuY3Rpb24gZ2V0RXJyb3JDb25zdHJ1Y3Rvcihjb2RlKSB7XG4gIHJldHVybiBlcnJub1RvQ2xhc3MuZ2V0KGNvZGUpID8/IFNwYWNldGltZUhvc3RFcnJvcjtcbn1cblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL1Vuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24uanNcbnZhciBTQmlnSW50ID0gdHlwZW9mIEJpZ0ludCAhPT0gXCJ1bmRlZmluZWRcIiA/IEJpZ0ludCA6IHZvaWQgMDtcbnZhciBPbmUgPSB0eXBlb2YgQmlnSW50ICE9PSBcInVuZGVmaW5lZFwiID8gQmlnSW50KDEpIDogdm9pZCAwO1xudmFyIFRoaXJ0eVR3byA9IHR5cGVvZiBCaWdJbnQgIT09IFwidW5kZWZpbmVkXCIgPyBCaWdJbnQoMzIpIDogdm9pZCAwO1xudmFyIE51bVZhbHVlcyA9IHR5cGVvZiBCaWdJbnQgIT09IFwidW5kZWZpbmVkXCIgPyBCaWdJbnQoNDI5NDk2NzI5NikgOiB2b2lkIDA7XG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtQmlnSW50RGlzdHJpYnV0aW9uKGZyb20sIHRvLCBybmcpIHtcbiAgdmFyIGRpZmYgPSB0byAtIGZyb20gKyBPbmU7XG4gIHZhciBGaW5hbE51bVZhbHVlcyA9IE51bVZhbHVlcztcbiAgdmFyIE51bUl0ZXJhdGlvbnMgPSAxO1xuICB3aGlsZSAoRmluYWxOdW1WYWx1ZXMgPCBkaWZmKSB7XG4gICAgRmluYWxOdW1WYWx1ZXMgPDw9IFRoaXJ0eVR3bztcbiAgICArK051bUl0ZXJhdGlvbnM7XG4gIH1cbiAgdmFyIHZhbHVlID0gZ2VuZXJhdGVOZXh0KE51bUl0ZXJhdGlvbnMsIHJuZyk7XG4gIGlmICh2YWx1ZSA8IGRpZmYpIHtcbiAgICByZXR1cm4gdmFsdWUgKyBmcm9tO1xuICB9XG4gIGlmICh2YWx1ZSArIGRpZmYgPCBGaW5hbE51bVZhbHVlcykge1xuICAgIHJldHVybiB2YWx1ZSAlIGRpZmYgKyBmcm9tO1xuICB9XG4gIHZhciBNYXhBY2NlcHRlZFJhbmRvbSA9IEZpbmFsTnVtVmFsdWVzIC0gRmluYWxOdW1WYWx1ZXMgJSBkaWZmO1xuICB3aGlsZSAodmFsdWUgPj0gTWF4QWNjZXB0ZWRSYW5kb20pIHtcbiAgICB2YWx1ZSA9IGdlbmVyYXRlTmV4dChOdW1JdGVyYXRpb25zLCBybmcpO1xuICB9XG4gIHJldHVybiB2YWx1ZSAlIGRpZmYgKyBmcm9tO1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVOZXh0KE51bUl0ZXJhdGlvbnMsIHJuZykge1xuICB2YXIgdmFsdWUgPSBTQmlnSW50KHJuZy51bnNhZmVOZXh0KCkgKyAyMTQ3NDgzNjQ4KTtcbiAgZm9yICh2YXIgbnVtID0gMTsgbnVtIDwgTnVtSXRlcmF0aW9uczsgKytudW0pIHtcbiAgICB2YXIgb3V0ID0gcm5nLnVuc2FmZU5leHQoKTtcbiAgICB2YWx1ZSA9ICh2YWx1ZSA8PCBUaGlydHlUd28pICsgU0JpZ0ludChvdXQgKyAyMTQ3NDgzNjQ4KTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wdXJlLXJhbmRANy4wLjEvbm9kZV9tb2R1bGVzL3B1cmUtcmFuZC9saWIvZXNtL2Rpc3RyaWJ1dGlvbi9pbnRlcm5hbHMvVW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbkludGVybmFsLmpzXG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uSW50ZXJuYWwocmFuZ2VTaXplLCBybmcpIHtcbiAgdmFyIE1heEFsbG93ZWQgPSByYW5nZVNpemUgPiAyID8gfn4oNDI5NDk2NzI5NiAvIHJhbmdlU2l6ZSkgKiByYW5nZVNpemUgOiA0Mjk0OTY3Mjk2O1xuICB2YXIgZGVsdGFWID0gcm5nLnVuc2FmZU5leHQoKSArIDIxNDc0ODM2NDg7XG4gIHdoaWxlIChkZWx0YVYgPj0gTWF4QWxsb3dlZCkge1xuICAgIGRlbHRhViA9IHJuZy51bnNhZmVOZXh0KCkgKyAyMTQ3NDgzNjQ4O1xuICB9XG4gIHJldHVybiBkZWx0YVYgJSByYW5nZVNpemU7XG59XG5cbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wdXJlLXJhbmRANy4wLjEvbm9kZV9tb2R1bGVzL3B1cmUtcmFuZC9saWIvZXNtL2Rpc3RyaWJ1dGlvbi9pbnRlcm5hbHMvQXJyYXlJbnQ2NC5qc1xuZnVuY3Rpb24gZnJvbU51bWJlclRvQXJyYXlJbnQ2NChvdXQsIG4pIHtcbiAgaWYgKG4gPCAwKSB7XG4gICAgdmFyIHBvc04gPSAtbjtcbiAgICBvdXQuc2lnbiA9IC0xO1xuICAgIG91dC5kYXRhWzBdID0gfn4ocG9zTiAvIDQyOTQ5NjcyOTYpO1xuICAgIG91dC5kYXRhWzFdID0gcG9zTiA+Pj4gMDtcbiAgfSBlbHNlIHtcbiAgICBvdXQuc2lnbiA9IDE7XG4gICAgb3V0LmRhdGFbMF0gPSB+fihuIC8gNDI5NDk2NzI5Nik7XG4gICAgb3V0LmRhdGFbMV0gPSBuID4+PiAwO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5mdW5jdGlvbiBzdWJzdHJhY3RBcnJheUludDY0KG91dCwgYXJyYXlJbnRBLCBhcnJheUludEIpIHtcbiAgdmFyIGxvd0EgPSBhcnJheUludEEuZGF0YVsxXTtcbiAgdmFyIGhpZ2hBID0gYXJyYXlJbnRBLmRhdGFbMF07XG4gIHZhciBzaWduQSA9IGFycmF5SW50QS5zaWduO1xuICB2YXIgbG93QiA9IGFycmF5SW50Qi5kYXRhWzFdO1xuICB2YXIgaGlnaEIgPSBhcnJheUludEIuZGF0YVswXTtcbiAgdmFyIHNpZ25CID0gYXJyYXlJbnRCLnNpZ247XG4gIG91dC5zaWduID0gMTtcbiAgaWYgKHNpZ25BID09PSAxICYmIHNpZ25CID09PSAtMSkge1xuICAgIHZhciBsb3dfMSA9IGxvd0EgKyBsb3dCO1xuICAgIHZhciBoaWdoID0gaGlnaEEgKyBoaWdoQiArIChsb3dfMSA+IDQyOTQ5NjcyOTUgPyAxIDogMCk7XG4gICAgb3V0LmRhdGFbMF0gPSBoaWdoID4+PiAwO1xuICAgIG91dC5kYXRhWzFdID0gbG93XzEgPj4+IDA7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuICB2YXIgbG93Rmlyc3QgPSBsb3dBO1xuICB2YXIgaGlnaEZpcnN0ID0gaGlnaEE7XG4gIHZhciBsb3dTZWNvbmQgPSBsb3dCO1xuICB2YXIgaGlnaFNlY29uZCA9IGhpZ2hCO1xuICBpZiAoc2lnbkEgPT09IC0xKSB7XG4gICAgbG93Rmlyc3QgPSBsb3dCO1xuICAgIGhpZ2hGaXJzdCA9IGhpZ2hCO1xuICAgIGxvd1NlY29uZCA9IGxvd0E7XG4gICAgaGlnaFNlY29uZCA9IGhpZ2hBO1xuICB9XG4gIHZhciByZW1pbmRlckxvdyA9IDA7XG4gIHZhciBsb3cgPSBsb3dGaXJzdCAtIGxvd1NlY29uZDtcbiAgaWYgKGxvdyA8IDApIHtcbiAgICByZW1pbmRlckxvdyA9IDE7XG4gICAgbG93ID0gbG93ID4+PiAwO1xuICB9XG4gIG91dC5kYXRhWzBdID0gaGlnaEZpcnN0IC0gaGlnaFNlY29uZCAtIHJlbWluZGVyTG93O1xuICBvdXQuZGF0YVsxXSA9IGxvdztcbiAgcmV0dXJuIG91dDtcbn1cblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL2ludGVybmFscy9VbnNhZmVVbmlmb3JtQXJyYXlJbnREaXN0cmlidXRpb25JbnRlcm5hbC5qc1xuZnVuY3Rpb24gdW5zYWZlVW5pZm9ybUFycmF5SW50RGlzdHJpYnV0aW9uSW50ZXJuYWwob3V0LCByYW5nZVNpemUsIHJuZykge1xuICB2YXIgcmFuZ2VMZW5ndGggPSByYW5nZVNpemUubGVuZ3RoO1xuICB3aGlsZSAodHJ1ZSkge1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggIT09IHJhbmdlTGVuZ3RoOyArK2luZGV4KSB7XG4gICAgICB2YXIgaW5kZXhSYW5nZVNpemUgPSBpbmRleCA9PT0gMCA/IHJhbmdlU2l6ZVswXSArIDEgOiA0Mjk0OTY3Mjk2O1xuICAgICAgdmFyIGcgPSB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uSW50ZXJuYWwoaW5kZXhSYW5nZVNpemUsIHJuZyk7XG4gICAgICBvdXRbaW5kZXhdID0gZztcbiAgICB9XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCAhPT0gcmFuZ2VMZW5ndGg7ICsraW5kZXgpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gb3V0W2luZGV4XTtcbiAgICAgIHZhciBjdXJyZW50SW5SYW5nZSA9IHJhbmdlU2l6ZVtpbmRleF07XG4gICAgICBpZiAoY3VycmVudCA8IGN1cnJlbnRJblJhbmdlKSB7XG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnQgPiBjdXJyZW50SW5SYW5nZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL1Vuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24uanNcbnZhciBzYWZlTnVtYmVyTWF4U2FmZUludGVnZXIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcbnZhciBzaGFyZWRBID0geyBzaWduOiAxLCBkYXRhOiBbMCwgMF0gfTtcbnZhciBzaGFyZWRCID0geyBzaWduOiAxLCBkYXRhOiBbMCwgMF0gfTtcbnZhciBzaGFyZWRDID0geyBzaWduOiAxLCBkYXRhOiBbMCwgMF0gfTtcbnZhciBzaGFyZWREYXRhID0gWzAsIDBdO1xuZnVuY3Rpb24gdW5pZm9ybUxhcmdlSW50SW50ZXJuYWwoZnJvbSwgdG8sIHJhbmdlU2l6ZSwgcm5nKSB7XG4gIHZhciByYW5nZVNpemVBcnJheUludFZhbHVlID0gcmFuZ2VTaXplIDw9IHNhZmVOdW1iZXJNYXhTYWZlSW50ZWdlciA/IGZyb21OdW1iZXJUb0FycmF5SW50NjQoc2hhcmVkQywgcmFuZ2VTaXplKSA6IHN1YnN0cmFjdEFycmF5SW50NjQoc2hhcmVkQywgZnJvbU51bWJlclRvQXJyYXlJbnQ2NChzaGFyZWRBLCB0byksIGZyb21OdW1iZXJUb0FycmF5SW50NjQoc2hhcmVkQiwgZnJvbSkpO1xuICBpZiAocmFuZ2VTaXplQXJyYXlJbnRWYWx1ZS5kYXRhWzFdID09PSA0Mjk0OTY3Mjk1KSB7XG4gICAgcmFuZ2VTaXplQXJyYXlJbnRWYWx1ZS5kYXRhWzBdICs9IDE7XG4gICAgcmFuZ2VTaXplQXJyYXlJbnRWYWx1ZS5kYXRhWzFdID0gMDtcbiAgfSBlbHNlIHtcbiAgICByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMV0gKz0gMTtcbiAgfVxuICB1bnNhZmVVbmlmb3JtQXJyYXlJbnREaXN0cmlidXRpb25JbnRlcm5hbChzaGFyZWREYXRhLCByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGEsIHJuZyk7XG4gIHJldHVybiBzaGFyZWREYXRhWzBdICogNDI5NDk2NzI5NiArIHNoYXJlZERhdGFbMV0gKyBmcm9tO1xufVxuZnVuY3Rpb24gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbihmcm9tLCB0bywgcm5nKSB7XG4gIHZhciByYW5nZVNpemUgPSB0byAtIGZyb207XG4gIGlmIChyYW5nZVNpemUgPD0gNDI5NDk2NzI5NSkge1xuICAgIHZhciBnID0gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbkludGVybmFsKHJhbmdlU2l6ZSArIDEsIHJuZyk7XG4gICAgcmV0dXJuIGcgKyBmcm9tO1xuICB9XG4gIHJldHVybiB1bmlmb3JtTGFyZ2VJbnRJbnRlcm5hbChmcm9tLCB0bywgcmFuZ2VTaXplLCBybmcpO1xufVxuXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9nZW5lcmF0b3IvWG9yb1NoaXJvLmpzXG52YXIgWG9yb1NoaXJvMTI4UGx1cyA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gWG9yb1NoaXJvMTI4UGx1czIoczAxLCBzMDAsIHMxMSwgczEwKSB7XG4gICAgdGhpcy5zMDEgPSBzMDE7XG4gICAgdGhpcy5zMDAgPSBzMDA7XG4gICAgdGhpcy5zMTEgPSBzMTE7XG4gICAgdGhpcy5zMTAgPSBzMTA7XG4gIH1cbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBYb3JvU2hpcm8xMjhQbHVzMih0aGlzLnMwMSwgdGhpcy5zMDAsIHRoaXMuczExLCB0aGlzLnMxMCk7XG4gIH07XG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5leHRSbmcgPSBuZXcgWG9yb1NoaXJvMTI4UGx1czIodGhpcy5zMDEsIHRoaXMuczAwLCB0aGlzLnMxMSwgdGhpcy5zMTApO1xuICAgIHZhciBvdXQgPSBuZXh0Um5nLnVuc2FmZU5leHQoKTtcbiAgICByZXR1cm4gW291dCwgbmV4dFJuZ107XG4gIH07XG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS51bnNhZmVOZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG91dCA9IHRoaXMuczAwICsgdGhpcy5zMTAgfCAwO1xuICAgIHZhciBhMCA9IHRoaXMuczEwIF4gdGhpcy5zMDA7XG4gICAgdmFyIGExID0gdGhpcy5zMTEgXiB0aGlzLnMwMTtcbiAgICB2YXIgczAwID0gdGhpcy5zMDA7XG4gICAgdmFyIHMwMSA9IHRoaXMuczAxO1xuICAgIHRoaXMuczAwID0gczAwIDw8IDI0IF4gczAxID4+PiA4IF4gYTAgXiBhMCA8PCAxNjtcbiAgICB0aGlzLnMwMSA9IHMwMSA8PCAyNCBeIHMwMCA+Pj4gOCBeIGExIF4gKGExIDw8IDE2IHwgYTAgPj4+IDE2KTtcbiAgICB0aGlzLnMxMCA9IGExIDw8IDUgXiBhMCA+Pj4gMjc7XG4gICAgdGhpcy5zMTEgPSBhMCA8PCA1IF4gYTEgPj4+IDI3O1xuICAgIHJldHVybiBvdXQ7XG4gIH07XG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS5qdW1wID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5leHRSbmcgPSBuZXcgWG9yb1NoaXJvMTI4UGx1czIodGhpcy5zMDEsIHRoaXMuczAwLCB0aGlzLnMxMSwgdGhpcy5zMTApO1xuICAgIG5leHRSbmcudW5zYWZlSnVtcCgpO1xuICAgIHJldHVybiBuZXh0Um5nO1xuICB9O1xuICBYb3JvU2hpcm8xMjhQbHVzMi5wcm90b3R5cGUudW5zYWZlSnVtcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuczAxID0gMDtcbiAgICB2YXIgbnMwMCA9IDA7XG4gICAgdmFyIG5zMTEgPSAwO1xuICAgIHZhciBuczEwID0gMDtcbiAgICB2YXIganVtcCA9IFszNjM5OTU2NjQ1LCAzNzUwNzU3MDEyLCAxMjYxNTY4NTA4LCAzODY0MjYzMzVdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpICE9PSA0OyArK2kpIHtcbiAgICAgIGZvciAodmFyIG1hc2sgPSAxOyBtYXNrOyBtYXNrIDw8PSAxKSB7XG4gICAgICAgIGlmIChqdW1wW2ldICYgbWFzaykge1xuICAgICAgICAgIG5zMDEgXj0gdGhpcy5zMDE7XG4gICAgICAgICAgbnMwMCBePSB0aGlzLnMwMDtcbiAgICAgICAgICBuczExIF49IHRoaXMuczExO1xuICAgICAgICAgIG5zMTAgXj0gdGhpcy5zMTA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51bnNhZmVOZXh0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuczAxID0gbnMwMTtcbiAgICB0aGlzLnMwMCA9IG5zMDA7XG4gICAgdGhpcy5zMTEgPSBuczExO1xuICAgIHRoaXMuczEwID0gbnMxMDtcbiAgfTtcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFt0aGlzLnMwMSwgdGhpcy5zMDAsIHRoaXMuczExLCB0aGlzLnMxMF07XG4gIH07XG4gIHJldHVybiBYb3JvU2hpcm8xMjhQbHVzMjtcbn0pKCk7XG5mdW5jdGlvbiBmcm9tU3RhdGUoc3RhdGUpIHtcbiAgdmFyIHZhbGlkID0gc3RhdGUubGVuZ3RoID09PSA0O1xuICBpZiAoIXZhbGlkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0YXRlIG11c3QgaGF2ZSBiZWVuIHByb2R1Y2VkIGJ5IGEgeG9yb3NoaXJvMTI4cGx1cyBSYW5kb21HZW5lcmF0b3JcIik7XG4gIH1cbiAgcmV0dXJuIG5ldyBYb3JvU2hpcm8xMjhQbHVzKHN0YXRlWzBdLCBzdGF0ZVsxXSwgc3RhdGVbMl0sIHN0YXRlWzNdKTtcbn1cbnZhciB4b3Jvc2hpcm8xMjhwbHVzID0gT2JqZWN0LmFzc2lnbihmdW5jdGlvbihzZWVkKSB7XG4gIHJldHVybiBuZXcgWG9yb1NoaXJvMTI4UGx1cygtMSwgfnNlZWQsIHNlZWQgfCAwLCAwKTtcbn0sIHsgZnJvbVN0YXRlIH0pO1xuXG4vLyBzcmMvc2VydmVyL3JuZy50c1xudmFyIHsgYXNVaW50TiB9ID0gQmlnSW50O1xuZnVuY3Rpb24gcGNnMzIoc3RhdGUpIHtcbiAgY29uc3QgTVVMID0gNjM2NDEzNjIyMzg0Njc5MzAwNW47XG4gIGNvbnN0IElOQyA9IDExNjM0NTgwMDI3NDYyMjYwNzIzbjtcbiAgc3RhdGUgPSBhc1VpbnROKDY0LCBzdGF0ZSAqIE1VTCArIElOQyk7XG4gIGNvbnN0IHhvcnNoaWZ0ZWQgPSBOdW1iZXIoYXNVaW50TigzMiwgKHN0YXRlID4+IDE4biBeIHN0YXRlKSA+PiAyN24pKTtcbiAgY29uc3Qgcm90ID0gTnVtYmVyKGFzVWludE4oMzIsIHN0YXRlID4+IDU5bikpO1xuICByZXR1cm4geG9yc2hpZnRlZCA+PiByb3QgfCB4b3JzaGlmdGVkIDw8IDMyIC0gcm90O1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVGbG9hdDY0KHJuZykge1xuICBjb25zdCBnMSA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgKDEgPDwgMjYpIC0gMSwgcm5nKTtcbiAgY29uc3QgZzIgPSB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uKDAsICgxIDw8IDI3KSAtIDEsIHJuZyk7XG4gIGNvbnN0IHZhbHVlID0gKGcxICogTWF0aC5wb3coMiwgMjcpICsgZzIpICogTWF0aC5wb3coMiwgLTUzKTtcbiAgcmV0dXJuIHZhbHVlO1xufVxuZnVuY3Rpb24gbWFrZVJhbmRvbShzZWVkKSB7XG4gIGNvbnN0IHJuZyA9IHhvcm9zaGlybzEyOHBsdXMocGNnMzIoc2VlZC5taWNyb3NTaW5jZVVuaXhFcG9jaCkpO1xuICBjb25zdCByYW5kb20gPSAoKSA9PiBnZW5lcmF0ZUZsb2F0NjQocm5nKTtcbiAgcmFuZG9tLmZpbGwgPSAoYXJyYXkpID0+IHtcbiAgICBjb25zdCBlbGVtID0gYXJyYXkuYXQoMCk7XG4gICAgaWYgKHR5cGVvZiBlbGVtID09PSBcImJpZ2ludFwiKSB7XG4gICAgICBjb25zdCB1cHBlciA9ICgxbiA8PCBCaWdJbnQoYXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiA4KSkgLSAxbjtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyYXlbaV0gPSB1bnNhZmVVbmlmb3JtQmlnSW50RGlzdHJpYnV0aW9uKDBuLCB1cHBlciwgcm5nKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbGVtID09PSBcIm51bWJlclwiKSB7XG4gICAgICBjb25zdCB1cHBlciA9ICgxIDw8IGFycmF5LkJZVEVTX1BFUl9FTEVNRU5UICogOCkgLSAxO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheVtpXSA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgdXBwZXIsIHJuZyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfTtcbiAgcmFuZG9tLnVpbnQzMiA9ICgpID0+IHJuZy51bnNhZmVOZXh0KCk7XG4gIHJhbmRvbS5pbnRlZ2VySW5SYW5nZSA9IChtaW4sIG1heCkgPT4gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbihtaW4sIG1heCwgcm5nKTtcbiAgcmFuZG9tLmJpZ2ludEluUmFuZ2UgPSAobWluLCBtYXgpID0+IHVuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24obWluLCBtYXgsIHJuZyk7XG4gIHJldHVybiByYW5kb207XG59XG5cbi8vIHNyYy9zZXJ2ZXIvcnVudGltZS50c1xudmFyIHsgZnJlZXplIH0gPSBPYmplY3Q7XG52YXIgc3lzID0gX3N5c2NhbGxzMl8wO1xuZnVuY3Rpb24gcGFyc2VKc29uT2JqZWN0KGpzb24pIHtcbiAgbGV0IHZhbHVlO1xuICB0cnkge1xuICAgIHZhbHVlID0gSlNPTi5wYXJzZShqc29uKTtcbiAgfSBjYXRjaCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBKU09OOiBmYWlsZWQgdG8gcGFyc2Ugc3RyaW5nXCIpO1xuICB9XG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBhIEpTT04gb2JqZWN0IGF0IHRoZSB0b3AgbGV2ZWxcIik7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxudmFyIEp3dENsYWltc0ltcGwgPSBjbGFzcyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IEp3dENsYWltcyBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHJhd1BheWxvYWQgVGhlIEpXVCBwYXlsb2FkIGFzIGEgcmF3IEpTT04gc3RyaW5nLlxuICAgKiBAcGFyYW0gaWRlbnRpdHkgVGhlIGlkZW50aXR5IGZvciB0aGlzIEpXVC4gV2UgYXJlIG9ubHkgdGFraW5nIHRoaXMgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIGEgYmxha2UzIGltcGxlbWVudGF0aW9uICh3aGljaCB3ZSBuZWVkIHRvIGNvbXB1dGUgaXQpLlxuICAgKi9cbiAgY29uc3RydWN0b3IocmF3UGF5bG9hZCwgaWRlbnRpdHkpIHtcbiAgICB0aGlzLnJhd1BheWxvYWQgPSByYXdQYXlsb2FkO1xuICAgIHRoaXMuZnVsbFBheWxvYWQgPSBwYXJzZUpzb25PYmplY3QocmF3UGF5bG9hZCk7XG4gICAgdGhpcy5faWRlbnRpdHkgPSBpZGVudGl0eTtcbiAgfVxuICBmdWxsUGF5bG9hZDtcbiAgX2lkZW50aXR5O1xuICBnZXQgaWRlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lkZW50aXR5O1xuICB9XG4gIGdldCBzdWJqZWN0KCkge1xuICAgIHJldHVybiB0aGlzLmZ1bGxQYXlsb2FkW1wic3ViXCJdO1xuICB9XG4gIGdldCBpc3N1ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnVsbFBheWxvYWRbXCJpc3NcIl07XG4gIH1cbiAgZ2V0IGF1ZGllbmNlKCkge1xuICAgIGNvbnN0IGF1ZCA9IHRoaXMuZnVsbFBheWxvYWRbXCJhdWRcIl07XG4gICAgaWYgKGF1ZCA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiB0eXBlb2YgYXVkID09PSBcInN0cmluZ1wiID8gW2F1ZF0gOiBhdWQ7XG4gIH1cbn07XG52YXIgQXV0aEN0eEltcGwgPSBjbGFzcyBfQXV0aEN0eEltcGwge1xuICBpc0ludGVybmFsO1xuICAvLyBTb3VyY2Ugb2YgdGhlIEpXVCBwYXlsb2FkIHN0cmluZywgaWYgdGhlcmUgaXMgb25lLlxuICBfand0U291cmNlO1xuICAvLyBXaGV0aGVyIHdlIGhhdmUgaW5pdGlhbGl6ZWQgdGhlIEpXVCBjbGFpbXMuXG4gIF9pbml0aWFsaXplZEpXVCA9IGZhbHNlO1xuICBfand0Q2xhaW1zO1xuICBfc2VuZGVySWRlbnRpdHk7XG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICB0aGlzLmlzSW50ZXJuYWwgPSBvcHRzLmlzSW50ZXJuYWw7XG4gICAgdGhpcy5fand0U291cmNlID0gb3B0cy5qd3RTb3VyY2U7XG4gICAgdGhpcy5fc2VuZGVySWRlbnRpdHkgPSBvcHRzLnNlbmRlcklkZW50aXR5O1xuICB9XG4gIF9pbml0aWFsaXplSldUKCkge1xuICAgIGlmICh0aGlzLl9pbml0aWFsaXplZEpXVCkgcmV0dXJuO1xuICAgIHRoaXMuX2luaXRpYWxpemVkSldUID0gdHJ1ZTtcbiAgICBjb25zdCB0b2tlbiA9IHRoaXMuX2p3dFNvdXJjZSgpO1xuICAgIGlmICghdG9rZW4pIHtcbiAgICAgIHRoaXMuX2p3dENsYWltcyA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2p3dENsYWltcyA9IG5ldyBKd3RDbGFpbXNJbXBsKHRva2VuLCB0aGlzLl9zZW5kZXJJZGVudGl0eSk7XG4gICAgfVxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XG4gIH1cbiAgLyoqIExhemlseSBjb21wdXRlIHdoZXRoZXIgYSBKV1QgZXhpc3RzIGFuZCBpcyBwYXJzZWFibGUuICovXG4gIGdldCBoYXNKV1QoKSB7XG4gICAgdGhpcy5faW5pdGlhbGl6ZUpXVCgpO1xuICAgIHJldHVybiB0aGlzLl9qd3RDbGFpbXMgIT09IG51bGw7XG4gIH1cbiAgLyoqIExhemlseSBwYXJzZSB0aGUgSnd0Q2xhaW1zIG9ubHkgd2hlbiBhY2Nlc3NlZC4gKi9cbiAgZ2V0IGp3dCgpIHtcbiAgICB0aGlzLl9pbml0aWFsaXplSldUKCk7XG4gICAgcmV0dXJuIHRoaXMuX2p3dENsYWltcztcbiAgfVxuICAvKiogQ3JlYXRlIGEgY29udGV4dCByZXByZXNlbnRpbmcgaW50ZXJuYWwgKG5vbi11c2VyKSByZXF1ZXN0cy4gKi9cbiAgc3RhdGljIGludGVybmFsKCkge1xuICAgIHJldHVybiBuZXcgX0F1dGhDdHhJbXBsKHtcbiAgICAgIGlzSW50ZXJuYWw6IHRydWUsXG4gICAgICBqd3RTb3VyY2U6ICgpID0+IG51bGwsXG4gICAgICBzZW5kZXJJZGVudGl0eTogSWRlbnRpdHkuemVybygpXG4gICAgfSk7XG4gIH1cbiAgLyoqIElmIHRoZXJlIGlzIGEgY29ubmVjdGlvbiBpZCwgbG9vayB1cCB0aGUgSldUIHBheWxvYWQgZnJvbSB0aGUgc3lzdGVtIHRhYmxlcy4gKi9cbiAgc3RhdGljIGZyb21TeXN0ZW1UYWJsZXMoY29ubmVjdGlvbklkLCBzZW5kZXIpIHtcbiAgICBpZiAoY29ubmVjdGlvbklkID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbmV3IF9BdXRoQ3R4SW1wbCh7XG4gICAgICAgIGlzSW50ZXJuYWw6IGZhbHNlLFxuICAgICAgICBqd3RTb3VyY2U6ICgpID0+IG51bGwsXG4gICAgICAgIHNlbmRlcklkZW50aXR5OiBzZW5kZXJcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IF9BdXRoQ3R4SW1wbCh7XG4gICAgICBpc0ludGVybmFsOiBmYWxzZSxcbiAgICAgIGp3dFNvdXJjZTogKCkgPT4ge1xuICAgICAgICBjb25zdCBwYXlsb2FkQnVmID0gc3lzLmdldF9qd3RfcGF5bG9hZChjb25uZWN0aW9uSWQuX19jb25uZWN0aW9uX2lkX18pO1xuICAgICAgICBpZiAocGF5bG9hZEJ1Zi5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICBjb25zdCBwYXlsb2FkU3RyID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHBheWxvYWRCdWYpO1xuICAgICAgICByZXR1cm4gcGF5bG9hZFN0cjtcbiAgICAgIH0sXG4gICAgICBzZW5kZXJJZGVudGl0eTogc2VuZGVyXG4gICAgfSk7XG4gIH1cbn07XG52YXIgUmVkdWNlckN0eEltcGwgPSBjbGFzcyBSZWR1Y2VyQ3R4IHtcbiAgI2lkZW50aXR5O1xuICAjc2VuZGVyQXV0aDtcbiAgI3V1aWRDb3VudGVyO1xuICAjcmFuZG9tO1xuICBzZW5kZXI7XG4gIHRpbWVzdGFtcDtcbiAgY29ubmVjdGlvbklkO1xuICBkYjtcbiAgY29uc3RydWN0b3Ioc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCwgZGJWaWV3KSB7XG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XG4gICAgdGhpcy5zZW5kZXIgPSBzZW5kZXI7XG4gICAgdGhpcy50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgdGhpcy5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XG4gICAgdGhpcy5kYiA9IGRiVmlldztcbiAgfVxuICAvKiogUmVzZXQgdGhlIGBSZWR1Y2VyQ3R4YCB0byBiZSB1c2VkIGZvciBhIG5ldyB0cmFuc2FjdGlvbiAqL1xuICBzdGF0aWMgcmVzZXQobWUsIHNlbmRlciwgdGltZXN0YW1wLCBjb25uZWN0aW9uSWQpIHtcbiAgICBtZS5zZW5kZXIgPSBzZW5kZXI7XG4gICAgbWUudGltZXN0YW1wID0gdGltZXN0YW1wO1xuICAgIG1lLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcbiAgICBtZS4jdXVpZENvdW50ZXIgPSB2b2lkIDA7XG4gICAgbWUuI3NlbmRlckF1dGggPSB2b2lkIDA7XG4gIH1cbiAgZ2V0IGlkZW50aXR5KCkge1xuICAgIHJldHVybiB0aGlzLiNpZGVudGl0eSA/Pz0gbmV3IElkZW50aXR5KHN5cy5pZGVudGl0eSgpKTtcbiAgfVxuICBnZXQgc2VuZGVyQXV0aCgpIHtcbiAgICByZXR1cm4gdGhpcy4jc2VuZGVyQXV0aCA/Pz0gQXV0aEN0eEltcGwuZnJvbVN5c3RlbVRhYmxlcyhcbiAgICAgIHRoaXMuY29ubmVjdGlvbklkLFxuICAgICAgdGhpcy5zZW5kZXJcbiAgICApO1xuICB9XG4gIGdldCByYW5kb20oKSB7XG4gICAgcmV0dXJuIHRoaXMuI3JhbmRvbSA/Pz0gbWFrZVJhbmRvbSh0aGlzLnRpbWVzdGFtcCk7XG4gIH1cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyByYW5kb20ge0BsaW5rIFV1aWR9IGB2NGAgdXNpbmcgdGhpcyBgUmVkdWNlckN0eGAncyBSTkcuXG4gICAqL1xuICBuZXdVdWlkVjQoKSB7XG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnJhbmRvbS5maWxsKG5ldyBVaW50OEFycmF5KDE2KSk7XG4gICAgcmV0dXJuIFV1aWQuZnJvbVJhbmRvbUJ5dGVzVjQoYnl0ZXMpO1xuICB9XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgc29ydGFibGUge0BsaW5rIFV1aWR9IGB2N2AgdXNpbmcgdGhpcyBgUmVkdWNlckN0eGAncyBSTkcsIGNvdW50ZXIsXG4gICAqIGFuZCB0aW1lc3RhbXAuXG4gICAqL1xuICBuZXdVdWlkVjcoKSB7XG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnJhbmRvbS5maWxsKG5ldyBVaW50OEFycmF5KDQpKTtcbiAgICBjb25zdCBjb3VudGVyID0gdGhpcy4jdXVpZENvdW50ZXIgPz89IHsgdmFsdWU6IDAgfTtcbiAgICByZXR1cm4gVXVpZC5mcm9tQ291bnRlclY3KGNvdW50ZXIsIHRoaXMudGltZXN0YW1wLCBieXRlcyk7XG4gIH1cbn07XG52YXIgY2FsbFVzZXJGdW5jdGlvbiA9IGZ1bmN0aW9uIF9fc3BhY2V0aW1lZGJfZW5kX3Nob3J0X2JhY2t0cmFjZShmbiwgLi4uYXJncykge1xuICByZXR1cm4gZm4oLi4uYXJncyk7XG59O1xudmFyIG1ha2VIb29rcyA9IChzY2hlbWEyKSA9PiBuZXcgTW9kdWxlSG9va3NJbXBsKHNjaGVtYTIpO1xudmFyIE1vZHVsZUhvb2tzSW1wbCA9IGNsYXNzIHtcbiAgI3NjaGVtYTtcbiAgI2RiVmlld187XG4gICNyZWR1Y2VyQXJnc0Rlc2VyaWFsaXplcnM7XG4gIC8qKiBDYWNoZSB0aGUgYFJlZHVjZXJDdHhgIG9iamVjdCB0byBhdm9pZCBhbGxvY2F0aW5nIGFuZXcgZm9yIGV2ZXIgcmVkdWNlciBjYWxsLiAqL1xuICAjcmVkdWNlckN0eF87XG4gIGNvbnN0cnVjdG9yKHNjaGVtYTIpIHtcbiAgICB0aGlzLiNzY2hlbWEgPSBzY2hlbWEyO1xuICAgIHRoaXMuI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVycyA9IHNjaGVtYTIubW9kdWxlRGVmLnJlZHVjZXJzLm1hcChcbiAgICAgICh7IHBhcmFtcyB9KSA9PiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHBhcmFtcywgc2NoZW1hMi50eXBlc3BhY2UpXG4gICAgKTtcbiAgfVxuICBnZXQgI2RiVmlldygpIHtcbiAgICByZXR1cm4gdGhpcy4jZGJWaWV3XyA/Pz0gZnJlZXplKFxuICAgICAgT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMuI3NjaGVtYS5zY2hlbWFUeXBlLnRhYmxlcykubWFwKCh0YWJsZTIpID0+IFtcbiAgICAgICAgICB0YWJsZTIuYWNjZXNzb3JOYW1lLFxuICAgICAgICAgIG1ha2VUYWJsZVZpZXcodGhpcy4jc2NoZW1hLnR5cGVzcGFjZSwgdGFibGUyLnRhYmxlRGVmKVxuICAgICAgICBdKVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgZ2V0ICNyZWR1Y2VyQ3R4KCkge1xuICAgIHJldHVybiB0aGlzLiNyZWR1Y2VyQ3R4XyA/Pz0gbmV3IFJlZHVjZXJDdHhJbXBsKFxuICAgICAgSWRlbnRpdHkuemVybygpLFxuICAgICAgVGltZXN0YW1wLlVOSVhfRVBPQ0gsXG4gICAgICBudWxsLFxuICAgICAgdGhpcy4jZGJWaWV3XG4gICAgKTtcbiAgfVxuICBfX2Rlc2NyaWJlX21vZHVsZV9fKCkge1xuICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTI4KTtcbiAgICBSYXdNb2R1bGVEZWYuc2VyaWFsaXplKFxuICAgICAgd3JpdGVyLFxuICAgICAgUmF3TW9kdWxlRGVmLlYxMCh0aGlzLiNzY2hlbWEucmF3TW9kdWxlRGVmVjEwKCkpXG4gICAgKTtcbiAgICByZXR1cm4gd3JpdGVyLmdldEJ1ZmZlcigpO1xuICB9XG4gIF9fZ2V0X2Vycm9yX2NvbnN0cnVjdG9yX18oY29kZSkge1xuICAgIHJldHVybiBnZXRFcnJvckNvbnN0cnVjdG9yKGNvZGUpO1xuICB9XG4gIGdldCBfX3NlbmRlcl9lcnJvcl9jbGFzc19fKCkge1xuICAgIHJldHVybiBTZW5kZXJFcnJvcjtcbiAgfVxuICBfX2NhbGxfcmVkdWNlcl9fKHJlZHVjZXJJZCwgc2VuZGVyLCBjb25uSWQsIHRpbWVzdGFtcCwgYXJnc0J1Zikge1xuICAgIGNvbnN0IG1vZHVsZUN0eCA9IHRoaXMuI3NjaGVtYTtcbiAgICBjb25zdCBkZXNlcmlhbGl6ZUFyZ3MgPSB0aGlzLiNyZWR1Y2VyQXJnc0Rlc2VyaWFsaXplcnNbcmVkdWNlcklkXTtcbiAgICBCSU5BUllfUkVBREVSLnJlc2V0KGFyZ3NCdWYpO1xuICAgIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZUFyZ3MoQklOQVJZX1JFQURFUik7XG4gICAgY29uc3Qgc2VuZGVySWRlbnRpdHkgPSBuZXcgSWRlbnRpdHkoc2VuZGVyKTtcbiAgICBjb25zdCBjdHggPSB0aGlzLiNyZWR1Y2VyQ3R4O1xuICAgIFJlZHVjZXJDdHhJbXBsLnJlc2V0KFxuICAgICAgY3R4LFxuICAgICAgc2VuZGVySWRlbnRpdHksXG4gICAgICBuZXcgVGltZXN0YW1wKHRpbWVzdGFtcCksXG4gICAgICBDb25uZWN0aW9uSWQubnVsbElmWmVybyhuZXcgQ29ubmVjdGlvbklkKGNvbm5JZCkpXG4gICAgKTtcbiAgICBjYWxsVXNlckZ1bmN0aW9uKG1vZHVsZUN0eC5yZWR1Y2Vyc1tyZWR1Y2VySWRdLCBjdHgsIGFyZ3MpO1xuICB9XG4gIF9fY2FsbF92aWV3X18oaWQsIHNlbmRlciwgYXJnc0J1Zikge1xuICAgIGNvbnN0IG1vZHVsZUN0eCA9IHRoaXMuI3NjaGVtYTtcbiAgICBjb25zdCB7IGZuLCBkZXNlcmlhbGl6ZVBhcmFtcywgc2VyaWFsaXplUmV0dXJuLCByZXR1cm5UeXBlQmFzZVNpemUgfSA9IG1vZHVsZUN0eC52aWV3c1tpZF07XG4gICAgY29uc3QgY3R4ID0gZnJlZXplKHtcbiAgICAgIHNlbmRlcjogbmV3IElkZW50aXR5KHNlbmRlciksXG4gICAgICAvLyB0aGlzIGlzIHRoZSBub24tcmVhZG9ubHkgRGJWaWV3LCBidXQgdGhlIHR5cGluZyBmb3IgdGhlIHVzZXIgd2lsbCBiZVxuICAgICAgLy8gdGhlIHJlYWRvbmx5IG9uZSwgYW5kIGlmIHRoZXkgZG8gY2FsbCBtdXRhdGluZyBmdW5jdGlvbnMgaXQgd2lsbCBmYWlsXG4gICAgICAvLyBhdCBydW50aW1lXG4gICAgICBkYjogdGhpcy4jZGJWaWV3LFxuICAgICAgZnJvbTogbWFrZVF1ZXJ5QnVpbGRlcihtb2R1bGVDdHguc2NoZW1hVHlwZSlcbiAgICB9KTtcbiAgICBjb25zdCBhcmdzID0gZGVzZXJpYWxpemVQYXJhbXMobmV3IEJpbmFyeVJlYWRlcihhcmdzQnVmKSk7XG4gICAgY29uc3QgcmV0ID0gY2FsbFVzZXJGdW5jdGlvbihmbiwgY3R4LCBhcmdzKTtcbiAgICBjb25zdCByZXRCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKHJldHVyblR5cGVCYXNlU2l6ZSk7XG4gICAgaWYgKGlzUm93VHlwZWRRdWVyeShyZXQpKSB7XG4gICAgICBjb25zdCBxdWVyeSA9IHRvU3FsKHJldCk7XG4gICAgICBWaWV3UmVzdWx0SGVhZGVyLnNlcmlhbGl6ZShyZXRCdWYsIFZpZXdSZXN1bHRIZWFkZXIuUmF3U3FsKHF1ZXJ5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFZpZXdSZXN1bHRIZWFkZXIuc2VyaWFsaXplKHJldEJ1ZiwgVmlld1Jlc3VsdEhlYWRlci5Sb3dEYXRhKTtcbiAgICAgIHNlcmlhbGl6ZVJldHVybihyZXRCdWYsIHJldCk7XG4gICAgfVxuICAgIHJldHVybiB7IGRhdGE6IHJldEJ1Zi5nZXRCdWZmZXIoKSB9O1xuICB9XG4gIF9fY2FsbF92aWV3X2Fub25fXyhpZCwgYXJnc0J1Zikge1xuICAgIGNvbnN0IG1vZHVsZUN0eCA9IHRoaXMuI3NjaGVtYTtcbiAgICBjb25zdCB7IGZuLCBkZXNlcmlhbGl6ZVBhcmFtcywgc2VyaWFsaXplUmV0dXJuLCByZXR1cm5UeXBlQmFzZVNpemUgfSA9IG1vZHVsZUN0eC5hbm9uVmlld3NbaWRdO1xuICAgIGNvbnN0IGN0eCA9IGZyZWV6ZSh7XG4gICAgICAvLyB0aGlzIGlzIHRoZSBub24tcmVhZG9ubHkgRGJWaWV3LCBidXQgdGhlIHR5cGluZyBmb3IgdGhlIHVzZXIgd2lsbCBiZVxuICAgICAgLy8gdGhlIHJlYWRvbmx5IG9uZSwgYW5kIGlmIHRoZXkgZG8gY2FsbCBtdXRhdGluZyBmdW5jdGlvbnMgaXQgd2lsbCBmYWlsXG4gICAgICAvLyBhdCBydW50aW1lXG4gICAgICBkYjogdGhpcy4jZGJWaWV3LFxuICAgICAgZnJvbTogbWFrZVF1ZXJ5QnVpbGRlcihtb2R1bGVDdHguc2NoZW1hVHlwZSlcbiAgICB9KTtcbiAgICBjb25zdCBhcmdzID0gZGVzZXJpYWxpemVQYXJhbXMobmV3IEJpbmFyeVJlYWRlcihhcmdzQnVmKSk7XG4gICAgY29uc3QgcmV0ID0gY2FsbFVzZXJGdW5jdGlvbihmbiwgY3R4LCBhcmdzKTtcbiAgICBjb25zdCByZXRCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKHJldHVyblR5cGVCYXNlU2l6ZSk7XG4gICAgaWYgKGlzUm93VHlwZWRRdWVyeShyZXQpKSB7XG4gICAgICBjb25zdCBxdWVyeSA9IHRvU3FsKHJldCk7XG4gICAgICBWaWV3UmVzdWx0SGVhZGVyLnNlcmlhbGl6ZShyZXRCdWYsIFZpZXdSZXN1bHRIZWFkZXIuUmF3U3FsKHF1ZXJ5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIFZpZXdSZXN1bHRIZWFkZXIuc2VyaWFsaXplKHJldEJ1ZiwgVmlld1Jlc3VsdEhlYWRlci5Sb3dEYXRhKTtcbiAgICAgIHNlcmlhbGl6ZVJldHVybihyZXRCdWYsIHJldCk7XG4gICAgfVxuICAgIHJldHVybiB7IGRhdGE6IHJldEJ1Zi5nZXRCdWZmZXIoKSB9O1xuICB9XG4gIF9fY2FsbF9wcm9jZWR1cmVfXyhpZCwgc2VuZGVyLCBjb25uZWN0aW9uX2lkLCB0aW1lc3RhbXAsIGFyZ3MpIHtcbiAgICByZXR1cm4gY2FsbFByb2NlZHVyZShcbiAgICAgIHRoaXMuI3NjaGVtYSxcbiAgICAgIGlkLFxuICAgICAgbmV3IElkZW50aXR5KHNlbmRlciksXG4gICAgICBDb25uZWN0aW9uSWQubnVsbElmWmVybyhuZXcgQ29ubmVjdGlvbklkKGNvbm5lY3Rpb25faWQpKSxcbiAgICAgIG5ldyBUaW1lc3RhbXAodGltZXN0YW1wKSxcbiAgICAgIGFyZ3MsXG4gICAgICAoKSA9PiB0aGlzLiNkYlZpZXdcbiAgICApO1xuICB9XG59O1xudmFyIEJJTkFSWV9XUklURVIgPSBuZXcgQmluYXJ5V3JpdGVyKDApO1xudmFyIEJJTkFSWV9SRUFERVIgPSBuZXcgQmluYXJ5UmVhZGVyKG5ldyBVaW50OEFycmF5KCkpO1xuZnVuY3Rpb24gbWFrZVRhYmxlVmlldyh0eXBlc3BhY2UsIHRhYmxlMikge1xuICBjb25zdCB0YWJsZV9pZCA9IHN5cy50YWJsZV9pZF9mcm9tX25hbWUodGFibGUyLnNvdXJjZU5hbWUpO1xuICBjb25zdCByb3dUeXBlID0gdHlwZXNwYWNlLnR5cGVzW3RhYmxlMi5wcm9kdWN0VHlwZVJlZl07XG4gIGlmIChyb3dUeXBlLnRhZyAhPT0gXCJQcm9kdWN0XCIpIHtcbiAgICB0aHJvdyBcImltcG9zc2libGVcIjtcbiAgfVxuICBjb25zdCBzZXJpYWxpemVSb3cgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHJvd1R5cGUsIHR5cGVzcGFjZSk7XG4gIGNvbnN0IGRlc2VyaWFsaXplUm93ID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKHJvd1R5cGUsIHR5cGVzcGFjZSk7XG4gIGNvbnN0IHNlcXVlbmNlcyA9IHRhYmxlMi5zZXF1ZW5jZXMubWFwKChzZXEpID0+IHtcbiAgICBjb25zdCBjb2wgPSByb3dUeXBlLnZhbHVlLmVsZW1lbnRzW3NlcS5jb2x1bW5dO1xuICAgIGNvbnN0IGNvbFR5cGUgPSBjb2wuYWxnZWJyYWljVHlwZTtcbiAgICBsZXQgc2VxdWVuY2VUcmlnZ2VyO1xuICAgIHN3aXRjaCAoY29sVHlwZS50YWcpIHtcbiAgICAgIGNhc2UgXCJVOFwiOlxuICAgICAgY2FzZSBcIkk4XCI6XG4gICAgICBjYXNlIFwiVTE2XCI6XG4gICAgICBjYXNlIFwiSTE2XCI6XG4gICAgICBjYXNlIFwiVTMyXCI6XG4gICAgICBjYXNlIFwiSTMyXCI6XG4gICAgICAgIHNlcXVlbmNlVHJpZ2dlciA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIlU2NFwiOlxuICAgICAgY2FzZSBcIkk2NFwiOlxuICAgICAgY2FzZSBcIlUxMjhcIjpcbiAgICAgIGNhc2UgXCJJMTI4XCI6XG4gICAgICBjYXNlIFwiVTI1NlwiOlxuICAgICAgY2FzZSBcIkkyNTZcIjpcbiAgICAgICAgc2VxdWVuY2VUcmlnZ2VyID0gMG47XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImludmFsaWQgc2VxdWVuY2UgdHlwZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbE5hbWU6IGNvbC5uYW1lLFxuICAgICAgc2VxdWVuY2VUcmlnZ2VyLFxuICAgICAgZGVzZXJpYWxpemU6IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihjb2xUeXBlLCB0eXBlc3BhY2UpXG4gICAgfTtcbiAgfSk7XG4gIGNvbnN0IGhhc0F1dG9JbmNyZW1lbnQgPSBzZXF1ZW5jZXMubGVuZ3RoID4gMDtcbiAgY29uc3QgaXRlciA9ICgpID0+IHRhYmxlSXRlcmF0b3Ioc3lzLmRhdGFzdG9yZV90YWJsZV9zY2FuX2JzYXRuKHRhYmxlX2lkKSwgZGVzZXJpYWxpemVSb3cpO1xuICBjb25zdCBpbnRlZ3JhdGVHZW5lcmF0ZWRDb2x1bW5zID0gaGFzQXV0b0luY3JlbWVudCA/IChyb3csIHJldF9idWYpID0+IHtcbiAgICBCSU5BUllfUkVBREVSLnJlc2V0KHJldF9idWYpO1xuICAgIGZvciAoY29uc3QgeyBjb2xOYW1lLCBkZXNlcmlhbGl6ZSwgc2VxdWVuY2VUcmlnZ2VyIH0gb2Ygc2VxdWVuY2VzKSB7XG4gICAgICBpZiAocm93W2NvbE5hbWVdID09PSBzZXF1ZW5jZVRyaWdnZXIpIHtcbiAgICAgICAgcm93W2NvbE5hbWVdID0gZGVzZXJpYWxpemUoQklOQVJZX1JFQURFUik7XG4gICAgICB9XG4gICAgfVxuICB9IDogbnVsbDtcbiAgY29uc3QgdGFibGVNZXRob2RzID0ge1xuICAgIGNvdW50OiAoKSA9PiBzeXMuZGF0YXN0b3JlX3RhYmxlX3Jvd19jb3VudCh0YWJsZV9pZCksXG4gICAgaXRlcixcbiAgICBbU3ltYm9sLml0ZXJhdG9yXTogKCkgPT4gaXRlcigpLFxuICAgIGluc2VydDogKHJvdykgPT4ge1xuICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XG4gICAgICBzZXJpYWxpemVSb3coQklOQVJZX1dSSVRFUiwgcm93KTtcbiAgICAgIHN5cy5kYXRhc3RvcmVfaW5zZXJ0X2JzYXRuKHRhYmxlX2lkLCBidWYuYnVmZmVyLCBCSU5BUllfV1JJVEVSLm9mZnNldCk7XG4gICAgICBjb25zdCByZXQgPSB7IC4uLnJvdyB9O1xuICAgICAgaW50ZWdyYXRlR2VuZXJhdGVkQ29sdW1ucz8uKHJldCwgYnVmLnZpZXcpO1xuICAgICAgcmV0dXJuIHJldDtcbiAgICB9LFxuICAgIGRlbGV0ZTogKHJvdykgPT4ge1xuICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XG4gICAgICBCSU5BUllfV1JJVEVSLndyaXRlVTMyKDEpO1xuICAgICAgc2VyaWFsaXplUm93KEJJTkFSWV9XUklURVIsIHJvdyk7XG4gICAgICBjb25zdCBjb3VudCA9IHN5cy5kYXRhc3RvcmVfZGVsZXRlX2FsbF9ieV9lcV9ic2F0bihcbiAgICAgICAgdGFibGVfaWQsXG4gICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgIEJJTkFSWV9XUklURVIub2Zmc2V0XG4gICAgICApO1xuICAgICAgcmV0dXJuIGNvdW50ID4gMDtcbiAgICB9XG4gIH07XG4gIGNvbnN0IHRhYmxlVmlldyA9IE9iamVjdC5hc3NpZ24oXG4gICAgLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgdGFibGVNZXRob2RzXG4gICk7XG4gIGZvciAoY29uc3QgaW5kZXhEZWYgb2YgdGFibGUyLmluZGV4ZXMpIHtcbiAgICBjb25zdCBpbmRleF9pZCA9IHN5cy5pbmRleF9pZF9mcm9tX25hbWUoaW5kZXhEZWYuc291cmNlTmFtZSk7XG4gICAgbGV0IGNvbHVtbl9pZHM7XG4gICAgbGV0IGlzSGFzaEluZGV4ID0gZmFsc2U7XG4gICAgc3dpdGNoIChpbmRleERlZi5hbGdvcml0aG0udGFnKSB7XG4gICAgICBjYXNlIFwiSGFzaFwiOlxuICAgICAgICBpc0hhc2hJbmRleCA9IHRydWU7XG4gICAgICAgIGNvbHVtbl9pZHMgPSBpbmRleERlZi5hbGdvcml0aG0udmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkJUcmVlXCI6XG4gICAgICAgIGNvbHVtbl9pZHMgPSBpbmRleERlZi5hbGdvcml0aG0udmFsdWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkRpcmVjdFwiOlxuICAgICAgICBjb2x1bW5faWRzID0gW2luZGV4RGVmLmFsZ29yaXRobS52YWx1ZV07XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjb25zdCBudW1Db2x1bW5zID0gY29sdW1uX2lkcy5sZW5ndGg7XG4gICAgY29uc3QgY29sdW1uU2V0ID0gbmV3IFNldChjb2x1bW5faWRzKTtcbiAgICBjb25zdCBpc1VuaXF1ZSA9IHRhYmxlMi5jb25zdHJhaW50cy5maWx0ZXIoKHgpID0+IHguZGF0YS50YWcgPT09IFwiVW5pcXVlXCIpLnNvbWUoKHgpID0+IGNvbHVtblNldC5pc1N1YnNldE9mKG5ldyBTZXQoeC5kYXRhLnZhbHVlLmNvbHVtbnMpKSk7XG4gICAgY29uc3QgaXNQcmltYXJ5S2V5ID0gaXNVbmlxdWUgJiYgY29sdW1uX2lkcy5sZW5ndGggPT09IHRhYmxlMi5wcmltYXJ5S2V5Lmxlbmd0aCAmJiBjb2x1bW5faWRzLmV2ZXJ5KChpZCwgaSkgPT4gdGFibGUyLnByaW1hcnlLZXlbaV0gPT09IGlkKTtcbiAgICBjb25zdCBpbmRleFNlcmlhbGl6ZXJzID0gY29sdW1uX2lkcy5tYXAoXG4gICAgICAoaWQpID0+IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXG4gICAgICAgIHJvd1R5cGUudmFsdWUuZWxlbWVudHNbaWRdLmFsZ2VicmFpY1R5cGUsXG4gICAgICAgIHR5cGVzcGFjZVxuICAgICAgKVxuICAgICk7XG4gICAgY29uc3Qgc2VyaWFsaXplUG9pbnQgPSAoYnVmZmVyLCBjb2xWYWwpID0+IHtcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmZmVyKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQ29sdW1uczsgaSsrKSB7XG4gICAgICAgIGluZGV4U2VyaWFsaXplcnNbaV0oQklOQVJZX1dSSVRFUiwgY29sVmFsW2ldKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBCSU5BUllfV1JJVEVSLm9mZnNldDtcbiAgICB9O1xuICAgIGNvbnN0IHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQgPSBudW1Db2x1bW5zID09PSAxID8gaW5kZXhTZXJpYWxpemVyc1swXSA6IG51bGw7XG4gICAgY29uc3Qgc2VyaWFsaXplU2luZ2xlUG9pbnQgPSBzZXJpYWxpemVTaW5nbGVFbGVtZW50ICYmICgoYnVmZmVyLCBjb2xWYWwpID0+IHtcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmZmVyKTtcbiAgICAgIHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQoQklOQVJZX1dSSVRFUiwgY29sVmFsKTtcbiAgICAgIHJldHVybiBCSU5BUllfV1JJVEVSLm9mZnNldDtcbiAgICB9KTtcbiAgICBsZXQgaW5kZXg7XG4gICAgaWYgKGlzVW5pcXVlICYmIHNlcmlhbGl6ZVNpbmdsZVBvaW50KSB7XG4gICAgICBjb25zdCBiYXNlID0ge1xuICAgICAgICBmaW5kOiAoY29sVmFsKSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplU2luZ2xlUG9pbnQoYnVmLCBjb2xWYWwpO1xuICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdGVPbmUoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGU6IChjb2xWYWwpID0+IHtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVTaW5nbGVQb2ludChidWYsIGNvbFZhbCk7XG4gICAgICAgICAgY29uc3QgbnVtID0gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIG51bSA+IDA7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBpZiAoaXNQcmltYXJ5S2V5KSB7XG4gICAgICAgIGJhc2UudXBkYXRlID0gKHJvdykgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmKTtcbiAgICAgICAgICBzZXJpYWxpemVSb3coQklOQVJZX1dSSVRFUiwgcm93KTtcbiAgICAgICAgICBzeXMuZGF0YXN0b3JlX3VwZGF0ZV9ic2F0bihcbiAgICAgICAgICAgIHRhYmxlX2lkLFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgQklOQVJZX1dSSVRFUi5vZmZzZXRcbiAgICAgICAgICApO1xuICAgICAgICAgIGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnM/Lihyb3csIGJ1Zi52aWV3KTtcbiAgICAgICAgICByZXR1cm4gcm93O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaW5kZXggPSBiYXNlO1xuICAgIH0gZWxzZSBpZiAoaXNVbmlxdWUpIHtcbiAgICAgIGNvbnN0IGJhc2UgPSB7XG4gICAgICAgIGZpbmQ6IChjb2xWYWwpID0+IHtcbiAgICAgICAgICBpZiAoY29sVmFsLmxlbmd0aCAhPT0gbnVtQ29sdW1ucykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIndyb25nIG51bWJlciBvZiBlbGVtZW50c1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCBjb2xWYWwpO1xuICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdGVPbmUoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xuICAgICAgICB9LFxuICAgICAgICBkZWxldGU6IChjb2xWYWwpID0+IHtcbiAgICAgICAgICBpZiAoY29sVmFsLmxlbmd0aCAhPT0gbnVtQ29sdW1ucylcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ3cm9uZyBudW1iZXIgb2YgZWxlbWVudHNcIik7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCBjb2xWYWwpO1xuICAgICAgICAgIGNvbnN0IG51bSA9IHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBudW0gPiAwO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKGlzUHJpbWFyeUtleSkge1xuICAgICAgICBiYXNlLnVwZGF0ZSA9IChyb3cpID0+IHtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XG4gICAgICAgICAgc2VyaWFsaXplUm93KEJJTkFSWV9XUklURVIsIHJvdyk7XG4gICAgICAgICAgc3lzLmRhdGFzdG9yZV91cGRhdGVfYnNhdG4oXG4gICAgICAgICAgICB0YWJsZV9pZCxcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIEJJTkFSWV9XUklURVIub2Zmc2V0XG4gICAgICAgICAgKTtcbiAgICAgICAgICBpbnRlZ3JhdGVHZW5lcmF0ZWRDb2x1bW5zPy4ocm93LCBidWYudmlldyk7XG4gICAgICAgICAgcmV0dXJuIHJvdztcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gYmFzZTtcbiAgICB9IGVsc2UgaWYgKHNlcmlhbGl6ZVNpbmdsZVBvaW50KSB7XG4gICAgICBjb25zdCByYXdJbmRleCA9IHtcbiAgICAgICAgZmlsdGVyOiAocmFuZ2UpID0+IHtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVTaW5nbGVQb2ludChidWYsIHJhbmdlKTtcbiAgICAgICAgICBjb25zdCBpdGVyX2lkID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxuICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxuICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRvcihpdGVyX2lkLCBkZXNlcmlhbGl6ZVJvdyk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZTogKHJhbmdlKSA9PiB7XG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplU2luZ2xlUG9pbnQoYnVmLCByYW5nZSk7XG4gICAgICAgICAgcmV0dXJuIHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgaWYgKGlzSGFzaEluZGV4KSB7XG4gICAgICAgIGluZGV4ID0gcmF3SW5kZXg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmRleCA9IHJhd0luZGV4O1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNIYXNoSW5kZXgpIHtcbiAgICAgIGluZGV4ID0ge1xuICAgICAgICBmaWx0ZXI6IChyYW5nZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXG4gICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICBwb2ludF9sZW5cbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGVsZXRlOiAocmFuZ2UpID0+IHtcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVQb2ludChidWYsIHJhbmdlKTtcbiAgICAgICAgICByZXR1cm4gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcbiAgICAgICAgICAgIGluZGV4X2lkLFxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZVJhbmdlID0gKGJ1ZmZlciwgcmFuZ2UpID0+IHtcbiAgICAgICAgaWYgKHJhbmdlLmxlbmd0aCA+IG51bUNvbHVtbnMpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ0b28gbWFueSBlbGVtZW50c1wiKTtcbiAgICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWZmZXIpO1xuICAgICAgICBjb25zdCB3cml0ZXIgPSBCSU5BUllfV1JJVEVSO1xuICAgICAgICBjb25zdCBwcmVmaXhfZWxlbXMgPSByYW5nZS5sZW5ndGggLSAxO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeF9lbGVtczsgaSsrKSB7XG4gICAgICAgICAgaW5kZXhTZXJpYWxpemVyc1tpXSh3cml0ZXIsIHJhbmdlW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByc3RhcnRPZmZzZXQgPSB3cml0ZXIub2Zmc2V0O1xuICAgICAgICBjb25zdCB0ZXJtID0gcmFuZ2VbcmFuZ2UubGVuZ3RoIC0gMV07XG4gICAgICAgIGNvbnN0IHNlcmlhbGl6ZVRlcm0gPSBpbmRleFNlcmlhbGl6ZXJzW3JhbmdlLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAodGVybSBpbnN0YW5jZW9mIFJhbmdlKSB7XG4gICAgICAgICAgY29uc3Qgd3JpdGVCb3VuZCA9IChib3VuZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGFncyA9IHsgaW5jbHVkZWQ6IDAsIGV4Y2x1ZGVkOiAxLCB1bmJvdW5kZWQ6IDIgfTtcbiAgICAgICAgICAgIHdyaXRlci53cml0ZVU4KHRhZ3NbYm91bmQudGFnXSk7XG4gICAgICAgICAgICBpZiAoYm91bmQudGFnICE9PSBcInVuYm91bmRlZFwiKSBzZXJpYWxpemVUZXJtKHdyaXRlciwgYm91bmQudmFsdWUpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgd3JpdGVCb3VuZCh0ZXJtLmZyb20pO1xuICAgICAgICAgIGNvbnN0IHJzdGFydExlbiA9IHdyaXRlci5vZmZzZXQgLSByc3RhcnRPZmZzZXQ7XG4gICAgICAgICAgd3JpdGVCb3VuZCh0ZXJtLnRvKTtcbiAgICAgICAgICBjb25zdCByZW5kTGVuID0gd3JpdGVyLm9mZnNldCAtIHJzdGFydExlbjtcbiAgICAgICAgICByZXR1cm4gW3JzdGFydE9mZnNldCwgcHJlZml4X2VsZW1zLCByc3RhcnRMZW4sIHJlbmRMZW5dO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdyaXRlci53cml0ZVU4KDApO1xuICAgICAgICAgIHNlcmlhbGl6ZVRlcm0od3JpdGVyLCB0ZXJtKTtcbiAgICAgICAgICBjb25zdCByc3RhcnRMZW4gPSB3cml0ZXIub2Zmc2V0O1xuICAgICAgICAgIGNvbnN0IHJlbmRMZW4gPSAwO1xuICAgICAgICAgIHJldHVybiBbcnN0YXJ0T2Zmc2V0LCBwcmVmaXhfZWxlbXMsIHJzdGFydExlbiwgcmVuZExlbl07XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBpbmRleCA9IHtcbiAgICAgICAgZmlsdGVyOiAocmFuZ2UpID0+IHtcbiAgICAgICAgICBpZiAocmFuZ2UubGVuZ3RoID09PSBudW1Db2x1bW5zKSB7XG4gICAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgcmFuZ2UpO1xuICAgICAgICAgICAgY29uc3QgaXRlcl9pZCA9IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXG4gICAgICAgICAgICAgIHBvaW50X2xlblxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgICBjb25zdCBhcmdzID0gc2VyaWFsaXplUmFuZ2UoYnVmLCByYW5nZSk7XG4gICAgICAgICAgICBjb25zdCBpdGVyX2lkID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3JhbmdlX2JzYXRuKFxuICAgICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgICAgLi4uYXJnc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGV0ZTogKHJhbmdlKSA9PiB7XG4gICAgICAgICAgaWYgKHJhbmdlLmxlbmd0aCA9PT0gbnVtQ29sdW1ucykge1xuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XG4gICAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVQb2ludChidWYsIHJhbmdlKTtcbiAgICAgICAgICAgIHJldHVybiBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9ieV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxuICAgICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgICAgcG9pbnRfbGVuXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBzZXJpYWxpemVSYW5nZShidWYsIHJhbmdlKTtcbiAgICAgICAgICAgIHJldHVybiBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9ieV9pbmRleF9zY2FuX3JhbmdlX2JzYXRuKFxuICAgICAgICAgICAgICBpbmRleF9pZCxcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcbiAgICAgICAgICAgICAgLi4uYXJnc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICAgIGlmIChPYmplY3QuaGFzT3duKHRhYmxlVmlldywgaW5kZXhEZWYuYWNjZXNzb3JOYW1lKSkge1xuICAgICAgZnJlZXplKE9iamVjdC5hc3NpZ24odGFibGVWaWV3W2luZGV4RGVmLmFjY2Vzc29yTmFtZV0sIGluZGV4KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhYmxlVmlld1tpbmRleERlZi5hY2Nlc3Nvck5hbWVdID0gZnJlZXplKGluZGV4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZyZWV6ZSh0YWJsZVZpZXcpO1xufVxuZnVuY3Rpb24qIHRhYmxlSXRlcmF0b3IoaWQsIGRlc2VyaWFsaXplKSB7XG4gIHVzaW5nIGl0ZXIgPSBuZXcgSXRlcmF0b3JIYW5kbGUoaWQpO1xuICBjb25zdCBpdGVyQnVmID0gdGFrZUJ1ZigpO1xuICB0cnkge1xuICAgIGxldCBhbXQ7XG4gICAgd2hpbGUgKGFtdCA9IGl0ZXIuYWR2YW5jZShpdGVyQnVmKSkge1xuICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEJpbmFyeVJlYWRlcihpdGVyQnVmLnZpZXcpO1xuICAgICAgd2hpbGUgKHJlYWRlci5vZmZzZXQgPCBhbXQpIHtcbiAgICAgICAgeWllbGQgZGVzZXJpYWxpemUocmVhZGVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgcmV0dXJuQnVmKGl0ZXJCdWYpO1xuICB9XG59XG5mdW5jdGlvbiB0YWJsZUl0ZXJhdGVPbmUoaWQsIGRlc2VyaWFsaXplKSB7XG4gIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xuICBjb25zdCByZXQgPSBhZHZhbmNlSXRlclJhdyhpZCwgYnVmKTtcbiAgaWYgKHJldCAhPT0gMCkge1xuICAgIEJJTkFSWV9SRUFERVIucmVzZXQoYnVmLnZpZXcpO1xuICAgIHJldHVybiBkZXNlcmlhbGl6ZShCSU5BUllfUkVBREVSKTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIGFkdmFuY2VJdGVyUmF3KGlkLCBidWYpIHtcbiAgd2hpbGUgKHRydWUpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIDAgfCBzeXMucm93X2l0ZXJfYnNhdG5fYWR2YW5jZShpZCwgYnVmLmJ1ZmZlcik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgJiYgdHlwZW9mIGUgPT09IFwib2JqZWN0XCIgJiYgaGFzT3duKGUsIFwiX19idWZmZXJfdG9vX3NtYWxsX19cIikpIHtcbiAgICAgICAgYnVmLmdyb3coZS5fX2J1ZmZlcl90b29fc21hbGxfXyk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cbn1cbnZhciBERUZBVUxUX0JVRkZFUl9DQVBBQ0lUWSA9IDMyICogMTAyNCAqIDI7XG52YXIgSVRFUl9CVUZTID0gW1xuICBuZXcgUmVzaXphYmxlQnVmZmVyKERFRkFVTFRfQlVGRkVSX0NBUEFDSVRZKVxuXTtcbnZhciBJVEVSX0JVRl9DT1VOVCA9IDE7XG5mdW5jdGlvbiB0YWtlQnVmKCkge1xuICByZXR1cm4gSVRFUl9CVUZfQ09VTlQgPyBJVEVSX0JVRlNbLS1JVEVSX0JVRl9DT1VOVF0gOiBuZXcgUmVzaXphYmxlQnVmZmVyKERFRkFVTFRfQlVGRkVSX0NBUEFDSVRZKTtcbn1cbmZ1bmN0aW9uIHJldHVybkJ1ZihidWYpIHtcbiAgSVRFUl9CVUZTW0lURVJfQlVGX0NPVU5UKytdID0gYnVmO1xufVxudmFyIExFQUZfQlVGID0gbmV3IFJlc2l6YWJsZUJ1ZmZlcihERUZBVUxUX0JVRkZFUl9DQVBBQ0lUWSk7XG52YXIgSXRlcmF0b3JIYW5kbGUgPSBjbGFzcyBfSXRlcmF0b3JIYW5kbGUge1xuICAjaWQ7XG4gIHN0YXRpYyAjZmluYWxpemF0aW9uUmVnaXN0cnkgPSBuZXcgRmluYWxpemF0aW9uUmVnaXN0cnkoXG4gICAgc3lzLnJvd19pdGVyX2JzYXRuX2Nsb3NlXG4gICk7XG4gIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgdGhpcy4jaWQgPSBpZDtcbiAgICBfSXRlcmF0b3JIYW5kbGUuI2ZpbmFsaXphdGlvblJlZ2lzdHJ5LnJlZ2lzdGVyKHRoaXMsIGlkLCB0aGlzKTtcbiAgfVxuICAvKiogVW5yZWdpc3RlciB0aGlzIG9iamVjdCB3aXRoIHRoZSBmaW5hbGl6YXRpb24gcmVnaXN0cnkgYW5kIHJldHVybiB0aGUgaWQgKi9cbiAgI2RldGFjaCgpIHtcbiAgICBjb25zdCBpZCA9IHRoaXMuI2lkO1xuICAgIHRoaXMuI2lkID0gLTE7XG4gICAgX0l0ZXJhdG9ySGFuZGxlLiNmaW5hbGl6YXRpb25SZWdpc3RyeS51bnJlZ2lzdGVyKHRoaXMpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKiogQ2FsbCBgcm93X2l0ZXJfYnNhdG5fYWR2YW5jZWAsIHJldHVybmluZyAwIGlmIHRoaXMgaXRlcmF0b3IgaGFzIGJlZW4gZXhoYXVzdGVkLiAqL1xuICBhZHZhbmNlKGJ1Zikge1xuICAgIGlmICh0aGlzLiNpZCA9PT0gLTEpIHJldHVybiAwO1xuICAgIGNvbnN0IHJldCA9IGFkdmFuY2VJdGVyUmF3KHRoaXMuI2lkLCBidWYpO1xuICAgIGlmIChyZXQgPD0gMCkgdGhpcy4jZGV0YWNoKCk7XG4gICAgcmV0dXJuIHJldCA8IDAgPyAtcmV0IDogcmV0O1xuICB9XG4gIFtTeW1ib2wuZGlzcG9zZV0oKSB7XG4gICAgaWYgKHRoaXMuI2lkID49IDApIHtcbiAgICAgIGNvbnN0IGlkID0gdGhpcy4jZGV0YWNoKCk7XG4gICAgICBzeXMucm93X2l0ZXJfYnNhdG5fY2xvc2UoaWQpO1xuICAgIH1cbiAgfVxufTtcblxuLy8gc3JjL3NlcnZlci9odHRwX2ludGVybmFsLnRzXG52YXIgeyBmcmVlemU6IGZyZWV6ZTIgfSA9IE9iamVjdDtcbnZhciB0ZXh0RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xudmFyIHRleHREZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKFxuICBcInV0Zi04XCJcbiAgLyogeyBmYXRhbDogdHJ1ZSB9ICovXG4pO1xudmFyIG1ha2VSZXNwb25zZSA9IFN5bWJvbChcIm1ha2VSZXNwb25zZVwiKTtcbnZhciBTeW5jUmVzcG9uc2UgPSBjbGFzcyBfU3luY1Jlc3BvbnNlIHtcbiAgI2JvZHk7XG4gICNpbm5lcjtcbiAgY29uc3RydWN0b3IoYm9keSwgaW5pdCkge1xuICAgIGlmIChib2R5ID09IG51bGwpIHtcbiAgICAgIHRoaXMuI2JvZHkgPSBudWxsO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHRoaXMuI2JvZHkgPSBib2R5O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiNib2R5ID0gbmV3IFVpbnQ4QXJyYXkoYm9keSkuYnVmZmVyO1xuICAgIH1cbiAgICB0aGlzLiNpbm5lciA9IHtcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKGluaXQ/LmhlYWRlcnMpLFxuICAgICAgc3RhdHVzOiBpbml0Py5zdGF0dXMgPz8gMjAwLFxuICAgICAgc3RhdHVzVGV4dDogaW5pdD8uc3RhdHVzVGV4dCA/PyBcIlwiLFxuICAgICAgdHlwZTogXCJkZWZhdWx0XCIsXG4gICAgICB1cmw6IG51bGwsXG4gICAgICBhYm9ydGVkOiBmYWxzZVxuICAgIH07XG4gIH1cbiAgc3RhdGljIFttYWtlUmVzcG9uc2VdKGJvZHksIGlubmVyKSB7XG4gICAgY29uc3QgbWUgPSBuZXcgX1N5bmNSZXNwb25zZShib2R5KTtcbiAgICBtZS4jaW5uZXIgPSBpbm5lcjtcbiAgICByZXR1cm4gbWU7XG4gIH1cbiAgZ2V0IGhlYWRlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLmhlYWRlcnM7XG4gIH1cbiAgZ2V0IHN0YXR1cygpIHtcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIuc3RhdHVzO1xuICB9XG4gIGdldCBzdGF0dXNUZXh0KCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci5zdGF0dXNUZXh0O1xuICB9XG4gIGdldCBvaygpIHtcbiAgICByZXR1cm4gMjAwIDw9IHRoaXMuI2lubmVyLnN0YXR1cyAmJiB0aGlzLiNpbm5lci5zdGF0dXMgPD0gMjk5O1xuICB9XG4gIGdldCB1cmwoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLnVybCA/PyBcIlwiO1xuICB9XG4gIGdldCB0eXBlKCkge1xuICAgIHJldHVybiB0aGlzLiNpbm5lci50eXBlO1xuICB9XG4gIGFycmF5QnVmZmVyKCkge1xuICAgIHJldHVybiB0aGlzLmJ5dGVzKCkuYnVmZmVyO1xuICB9XG4gIGJ5dGVzKCkge1xuICAgIGlmICh0aGlzLiNib2R5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBuZXcgVWludDhBcnJheSgpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuI2JvZHkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiB0ZXh0RW5jb2Rlci5lbmNvZGUodGhpcy4jYm9keSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgVWludDhBcnJheSh0aGlzLiNib2R5KTtcbiAgICB9XG4gIH1cbiAganNvbigpIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLnRleHQoKSk7XG4gIH1cbiAgdGV4dCgpIHtcbiAgICBpZiAodGhpcy4jYm9keSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gXCJcIjtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLiNib2R5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICByZXR1cm4gdGhpcy4jYm9keTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRleHREZWNvZGVyLmRlY29kZSh0aGlzLiNib2R5KTtcbiAgICB9XG4gIH1cbn07XG52YXIgcmVxdWVzdEJhc2VTaXplID0gYnNhdG5CYXNlU2l6ZSh7IHR5cGVzOiBbXSB9LCBIdHRwUmVxdWVzdC5hbGdlYnJhaWNUeXBlKTtcbnZhciBtZXRob2RzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoW1xuICBbXCJHRVRcIiwgeyB0YWc6IFwiR2V0XCIgfV0sXG4gIFtcIkhFQURcIiwgeyB0YWc6IFwiSGVhZFwiIH1dLFxuICBbXCJQT1NUXCIsIHsgdGFnOiBcIlBvc3RcIiB9XSxcbiAgW1wiUFVUXCIsIHsgdGFnOiBcIlB1dFwiIH1dLFxuICBbXCJERUxFVEVcIiwgeyB0YWc6IFwiRGVsZXRlXCIgfV0sXG4gIFtcIkNPTk5FQ1RcIiwgeyB0YWc6IFwiQ29ubmVjdFwiIH1dLFxuICBbXCJPUFRJT05TXCIsIHsgdGFnOiBcIk9wdGlvbnNcIiB9XSxcbiAgW1wiVFJBQ0VcIiwgeyB0YWc6IFwiVHJhY2VcIiB9XSxcbiAgW1wiUEFUQ0hcIiwgeyB0YWc6IFwiUGF0Y2hcIiB9XVxuXSk7XG5mdW5jdGlvbiBmZXRjaCh1cmwsIGluaXQgPSB7fSkge1xuICBjb25zdCBtZXRob2QgPSBtZXRob2RzLmdldChpbml0Lm1ldGhvZD8udG9VcHBlckNhc2UoKSA/PyBcIkdFVFwiKSA/PyB7XG4gICAgdGFnOiBcIkV4dGVuc2lvblwiLFxuICAgIHZhbHVlOiBpbml0Lm1ldGhvZFxuICB9O1xuICBjb25zdCBoZWFkZXJzID0ge1xuICAgIC8vIGFueXMgYmVjYXVzZSB0aGUgdHlwaW5ncyBhcmUgd29ua3kgLSBzZWUgY29tbWVudCBpbiBTeW5jUmVzcG9uc2UuY29uc3RydWN0b3JcbiAgICBlbnRyaWVzOiBoZWFkZXJzVG9MaXN0KG5ldyBIZWFkZXJzKGluaXQuaGVhZGVycykpLmZsYXRNYXAoKFtrLCB2XSkgPT4gQXJyYXkuaXNBcnJheSh2KSA/IHYubWFwKCh2MikgPT4gW2ssIHYyXSkgOiBbW2ssIHZdXSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoeyBuYW1lLCB2YWx1ZTogdGV4dEVuY29kZXIuZW5jb2RlKHZhbHVlKSB9KSlcbiAgfTtcbiAgY29uc3QgdXJpID0gXCJcIiArIHVybDtcbiAgY29uc3QgcmVxdWVzdCA9IGZyZWV6ZTIoe1xuICAgIG1ldGhvZCxcbiAgICBoZWFkZXJzLFxuICAgIHRpbWVvdXQ6IGluaXQudGltZW91dCxcbiAgICB1cmksXG4gICAgdmVyc2lvbjogeyB0YWc6IFwiSHR0cDExXCIgfVxuICB9KTtcbiAgY29uc3QgcmVxdWVzdEJ1ZiA9IG5ldyBCaW5hcnlXcml0ZXIocmVxdWVzdEJhc2VTaXplKTtcbiAgSHR0cFJlcXVlc3Quc2VyaWFsaXplKHJlcXVlc3RCdWYsIHJlcXVlc3QpO1xuICBjb25zdCBib2R5ID0gaW5pdC5ib2R5ID09IG51bGwgPyBuZXcgVWludDhBcnJheSgpIDogdHlwZW9mIGluaXQuYm9keSA9PT0gXCJzdHJpbmdcIiA/IGluaXQuYm9keSA6IG5ldyBVaW50OEFycmF5KGluaXQuYm9keSk7XG4gIGNvbnN0IFtyZXNwb25zZUJ1ZiwgcmVzcG9uc2VCb2R5XSA9IHN5cy5wcm9jZWR1cmVfaHR0cF9yZXF1ZXN0KFxuICAgIHJlcXVlc3RCdWYuZ2V0QnVmZmVyKCksXG4gICAgYm9keVxuICApO1xuICBjb25zdCByZXNwb25zZSA9IEh0dHBSZXNwb25zZS5kZXNlcmlhbGl6ZShuZXcgQmluYXJ5UmVhZGVyKHJlc3BvbnNlQnVmKSk7XG4gIHJldHVybiBTeW5jUmVzcG9uc2VbbWFrZVJlc3BvbnNlXShyZXNwb25zZUJvZHksIHtcbiAgICB0eXBlOiBcImJhc2ljXCIsXG4gICAgdXJsOiB1cmksXG4gICAgc3RhdHVzOiByZXNwb25zZS5jb2RlLFxuICAgIHN0YXR1c1RleHQ6ICgwLCBpbXBvcnRfc3RhdHVzZXMuZGVmYXVsdCkocmVzcG9uc2UuY29kZSksXG4gICAgaGVhZGVyczogbmV3IEhlYWRlcnMoKSxcbiAgICBhYm9ydGVkOiBmYWxzZVxuICB9KTtcbn1cbmZyZWV6ZTIoZmV0Y2gpO1xudmFyIGh0dHBDbGllbnQgPSBmcmVlemUyKHsgZmV0Y2ggfSk7XG5cbi8vIHNyYy9zZXJ2ZXIvcHJvY2VkdXJlcy50c1xuZnVuY3Rpb24gbWFrZVByb2NlZHVyZUV4cG9ydChjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbikge1xuICBjb25zdCBuYW1lID0gb3B0cz8ubmFtZTtcbiAgY29uc3QgcHJvY2VkdXJlRXhwb3J0ID0gKC4uLmFyZ3MpID0+IGZuKC4uLmFyZ3MpO1xuICBwcm9jZWR1cmVFeHBvcnRbZXhwb3J0Q29udGV4dF0gPSBjdHg7XG4gIHByb2NlZHVyZUV4cG9ydFtyZWdpc3RlckV4cG9ydF0gPSAoY3R4MiwgZXhwb3J0TmFtZSkgPT4ge1xuICAgIHJlZ2lzdGVyUHJvY2VkdXJlKGN0eDIsIG5hbWUgPz8gZXhwb3J0TmFtZSwgcGFyYW1zLCByZXQsIGZuKTtcbiAgICBjdHgyLmZ1bmN0aW9uRXhwb3J0cy5zZXQoXG4gICAgICBwcm9jZWR1cmVFeHBvcnQsXG4gICAgICBuYW1lID8/IGV4cG9ydE5hbWVcbiAgICApO1xuICB9O1xuICByZXR1cm4gcHJvY2VkdXJlRXhwb3J0O1xufVxudmFyIFRyYW5zYWN0aW9uQ3R4SW1wbCA9IGNsYXNzIFRyYW5zYWN0aW9uQ3R4IGV4dGVuZHMgUmVkdWNlckN0eEltcGwge1xufTtcbmZ1bmN0aW9uIHJlZ2lzdGVyUHJvY2VkdXJlKGN0eCwgZXhwb3J0TmFtZSwgcGFyYW1zLCByZXQsIGZuLCBvcHRzKSB7XG4gIGN0eC5kZWZpbmVGdW5jdGlvbihleHBvcnROYW1lKTtcbiAgY29uc3QgcGFyYW1zVHlwZSA9IHtcbiAgICBlbGVtZW50czogT2JqZWN0LmVudHJpZXMocGFyYW1zKS5tYXAoKFtuLCBjXSkgPT4gKHtcbiAgICAgIG5hbWU6IG4sXG4gICAgICBhbGdlYnJhaWNUeXBlOiBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KFxuICAgICAgICBcInR5cGVCdWlsZGVyXCIgaW4gYyA/IGMudHlwZUJ1aWxkZXIgOiBjXG4gICAgICApLmFsZ2VicmFpY1R5cGVcbiAgICB9KSlcbiAgfTtcbiAgY29uc3QgcmV0dXJuVHlwZSA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocmV0KS5hbGdlYnJhaWNUeXBlO1xuICBjdHgubW9kdWxlRGVmLnByb2NlZHVyZXMucHVzaCh7XG4gICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcbiAgICBwYXJhbXM6IHBhcmFtc1R5cGUsXG4gICAgcmV0dXJuVHlwZSxcbiAgICB2aXNpYmlsaXR5OiBGdW5jdGlvblZpc2liaWxpdHkuQ2xpZW50Q2FsbGFibGVcbiAgfSk7XG4gIGNvbnN0IHsgdHlwZXNwYWNlIH0gPSBjdHg7XG4gIGN0eC5wcm9jZWR1cmVzLnB1c2goe1xuICAgIGZuLFxuICAgIGRlc2VyaWFsaXplQXJnczogUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcihwYXJhbXNUeXBlLCB0eXBlc3BhY2UpLFxuICAgIHNlcmlhbGl6ZVJldHVybjogQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihyZXR1cm5UeXBlLCB0eXBlc3BhY2UpLFxuICAgIHJldHVyblR5cGVCYXNlU2l6ZTogYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHJldHVyblR5cGUpXG4gIH0pO1xufVxuZnVuY3Rpb24gY2FsbFByb2NlZHVyZShtb2R1bGVDdHgsIGlkLCBzZW5kZXIsIGNvbm5lY3Rpb25JZCwgdGltZXN0YW1wLCBhcmdzQnVmLCBkYlZpZXcpIHtcbiAgY29uc3QgeyBmbiwgZGVzZXJpYWxpemVBcmdzLCBzZXJpYWxpemVSZXR1cm4sIHJldHVyblR5cGVCYXNlU2l6ZSB9ID0gbW9kdWxlQ3R4LnByb2NlZHVyZXNbaWRdO1xuICBjb25zdCBhcmdzID0gZGVzZXJpYWxpemVBcmdzKG5ldyBCaW5hcnlSZWFkZXIoYXJnc0J1ZikpO1xuICBjb25zdCBjdHggPSBuZXcgUHJvY2VkdXJlQ3R4SW1wbChcbiAgICBzZW5kZXIsXG4gICAgdGltZXN0YW1wLFxuICAgIGNvbm5lY3Rpb25JZCxcbiAgICBkYlZpZXdcbiAgKTtcbiAgY29uc3QgcmV0ID0gY2FsbFVzZXJGdW5jdGlvbihmbiwgY3R4LCBhcmdzKTtcbiAgY29uc3QgcmV0QnVmID0gbmV3IEJpbmFyeVdyaXRlcihyZXR1cm5UeXBlQmFzZVNpemUpO1xuICBzZXJpYWxpemVSZXR1cm4ocmV0QnVmLCByZXQpO1xuICByZXR1cm4gcmV0QnVmLmdldEJ1ZmZlcigpO1xufVxudmFyIFByb2NlZHVyZUN0eEltcGwgPSBjbGFzcyBQcm9jZWR1cmVDdHgge1xuICBjb25zdHJ1Y3RvcihzZW5kZXIsIHRpbWVzdGFtcCwgY29ubmVjdGlvbklkLCBkYlZpZXcpIHtcbiAgICB0aGlzLnNlbmRlciA9IHNlbmRlcjtcbiAgICB0aGlzLnRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcbiAgICB0aGlzLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcbiAgICB0aGlzLiNkYlZpZXcgPSBkYlZpZXc7XG4gIH1cbiAgI2lkZW50aXR5O1xuICAjdXVpZENvdW50ZXI7XG4gICNyYW5kb207XG4gICNkYlZpZXc7XG4gIGdldCBpZGVudGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy4jaWRlbnRpdHkgPz89IG5ldyBJZGVudGl0eShzeXMuaWRlbnRpdHkoKSk7XG4gIH1cbiAgZ2V0IHJhbmRvbSgpIHtcbiAgICByZXR1cm4gdGhpcy4jcmFuZG9tID8/PSBtYWtlUmFuZG9tKHRoaXMudGltZXN0YW1wKTtcbiAgfVxuICBnZXQgaHR0cCgpIHtcbiAgICByZXR1cm4gaHR0cENsaWVudDtcbiAgfVxuICB3aXRoVHgoYm9keSkge1xuICAgIGNvbnN0IHJ1biA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHN5cy5wcm9jZWR1cmVfc3RhcnRfbXV0X3R4KCk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjdHggPSBuZXcgVHJhbnNhY3Rpb25DdHhJbXBsKFxuICAgICAgICAgIHRoaXMuc2VuZGVyLFxuICAgICAgICAgIG5ldyBUaW1lc3RhbXAodGltZXN0YW1wKSxcbiAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25JZCxcbiAgICAgICAgICB0aGlzLiNkYlZpZXcoKVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gYm9keShjdHgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzeXMucHJvY2VkdXJlX2Fib3J0X211dF90eCgpO1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH07XG4gICAgbGV0IHJlcyA9IHJ1bigpO1xuICAgIHRyeSB7XG4gICAgICBzeXMucHJvY2VkdXJlX2NvbW1pdF9tdXRfdHgoKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfSBjYXRjaCB7XG4gICAgfVxuICAgIGNvbnNvbGUud2FybihcImNvbW1pdHRpbmcgYW5vbnltb3VzIHRyYW5zYWN0aW9uIGZhaWxlZFwiKTtcbiAgICByZXMgPSBydW4oKTtcbiAgICB0cnkge1xuICAgICAgc3lzLnByb2NlZHVyZV9jb21taXRfbXV0X3R4KCk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInRyYW5zYWN0aW9uIHJldHJ5IGZhaWxlZCBhZ2FpblwiLCB7IGNhdXNlOiBlIH0pO1xuICAgIH1cbiAgfVxuICBuZXdVdWlkVjQoKSB7XG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnJhbmRvbS5maWxsKG5ldyBVaW50OEFycmF5KDE2KSk7XG4gICAgcmV0dXJuIFV1aWQuZnJvbVJhbmRvbUJ5dGVzVjQoYnl0ZXMpO1xuICB9XG4gIG5ld1V1aWRWNygpIHtcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoNCkpO1xuICAgIGNvbnN0IGNvdW50ZXIgPSB0aGlzLiN1dWlkQ291bnRlciA/Pz0geyB2YWx1ZTogMCB9O1xuICAgIHJldHVybiBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgdGhpcy50aW1lc3RhbXAsIGJ5dGVzKTtcbiAgfVxufTtcblxuLy8gc3JjL3NlcnZlci9yZWR1Y2Vycy50c1xuZnVuY3Rpb24gbWFrZVJlZHVjZXJFeHBvcnQoY3R4LCBvcHRzLCBwYXJhbXMsIGZuLCBsaWZlY3ljbGUpIHtcbiAgY29uc3QgcmVkdWNlckV4cG9ydCA9ICguLi5hcmdzKSA9PiBmbiguLi5hcmdzKTtcbiAgcmVkdWNlckV4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcbiAgcmVkdWNlckV4cG9ydFtyZWdpc3RlckV4cG9ydF0gPSAoY3R4MiwgZXhwb3J0TmFtZSkgPT4ge1xuICAgIHJlZ2lzdGVyUmVkdWNlcihjdHgyLCBleHBvcnROYW1lLCBwYXJhbXMsIGZuLCBvcHRzLCBsaWZlY3ljbGUpO1xuICAgIGN0eDIuZnVuY3Rpb25FeHBvcnRzLnNldChcbiAgICAgIHJlZHVjZXJFeHBvcnQsXG4gICAgICBleHBvcnROYW1lXG4gICAgKTtcbiAgfTtcbiAgcmV0dXJuIHJlZHVjZXJFeHBvcnQ7XG59XG5mdW5jdGlvbiByZWdpc3RlclJlZHVjZXIoY3R4LCBleHBvcnROYW1lLCBwYXJhbXMsIGZuLCBvcHRzLCBsaWZlY3ljbGUpIHtcbiAgY3R4LmRlZmluZUZ1bmN0aW9uKGV4cG9ydE5hbWUpO1xuICBpZiAoIShwYXJhbXMgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSkge1xuICAgIHBhcmFtcyA9IG5ldyBSb3dCdWlsZGVyKHBhcmFtcyk7XG4gIH1cbiAgaWYgKHBhcmFtcy50eXBlTmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgcGFyYW1zLnR5cGVOYW1lID0gdG9QYXNjYWxDYXNlKGV4cG9ydE5hbWUpO1xuICB9XG4gIGNvbnN0IHJlZiA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocGFyYW1zKTtcbiAgY29uc3QgcGFyYW1zVHlwZSA9IGN0eC5yZXNvbHZlVHlwZShyZWYpLnZhbHVlO1xuICBjb25zdCBpc0xpZmVjeWNsZSA9IGxpZmVjeWNsZSAhPSBudWxsO1xuICBjdHgubW9kdWxlRGVmLnJlZHVjZXJzLnB1c2goe1xuICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgcGFyYW1zOiBwYXJhbXNUeXBlLFxuICAgIC8vTW9kdWxlRGVmIHZhbGlkYXRpb24gY29kZSBpcyByZXNwb25zaWJsZSB0byBtYXJrIHByaXZhdGUgcmVkdWNlcnNcbiAgICB2aXNpYmlsaXR5OiBGdW5jdGlvblZpc2liaWxpdHkuQ2xpZW50Q2FsbGFibGUsXG4gICAgLy9IYXJkY29kZWQgZm9yIG5vdyAtIHJlZHVjZXJzIGRvIG5vdCByZXR1cm4gdmFsdWVzIHlldFxuICAgIG9rUmV0dXJuVHlwZTogQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHsgZWxlbWVudHM6IFtdIH0pLFxuICAgIGVyclJldHVyblR5cGU6IEFsZ2VicmFpY1R5cGUuU3RyaW5nXG4gIH0pO1xuICBpZiAob3B0cz8ubmFtZSAhPSBudWxsKSB7XG4gICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XG4gICAgICB0YWc6IFwiRnVuY3Rpb25cIixcbiAgICAgIHZhbHVlOiB7XG4gICAgICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXG4gICAgICAgIGNhbm9uaWNhbE5hbWU6IG9wdHMubmFtZVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGlmIChpc0xpZmVjeWNsZSkge1xuICAgIGN0eC5tb2R1bGVEZWYubGlmZUN5Y2xlUmVkdWNlcnMucHVzaCh7XG4gICAgICBsaWZlY3ljbGVTcGVjOiBsaWZlY3ljbGUsXG4gICAgICBmdW5jdGlvbk5hbWU6IGV4cG9ydE5hbWVcbiAgICB9KTtcbiAgfVxuICBpZiAoIWZuLm5hbWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIFwibmFtZVwiLCB7IHZhbHVlOiBleHBvcnROYW1lLCB3cml0YWJsZTogZmFsc2UgfSk7XG4gIH1cbiAgY3R4LnJlZHVjZXJzLnB1c2goZm4pO1xufVxuXG4vLyBzcmMvc2VydmVyL3NjaGVtYS50c1xudmFyIFNjaGVtYUlubmVyID0gY2xhc3MgZXh0ZW5kcyBNb2R1bGVDb250ZXh0IHtcbiAgc2NoZW1hVHlwZTtcbiAgZXhpc3RpbmdGdW5jdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xuICByZWR1Y2VycyA9IFtdO1xuICBwcm9jZWR1cmVzID0gW107XG4gIHZpZXdzID0gW107XG4gIGFub25WaWV3cyA9IFtdO1xuICAvKipcbiAgICogTWFwcyBSZWR1Y2VyRXhwb3J0IG9iamVjdHMgdG8gdGhlIG5hbWUgb2YgdGhlIHJlZHVjZXIuXG4gICAqIFVzZWQgZm9yIHJlc29sdmluZyB0aGUgcmVkdWNlcnMgb2Ygc2NoZWR1bGVkIHRhYmxlcy5cbiAgICovXG4gIGZ1bmN0aW9uRXhwb3J0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIHBlbmRpbmdTY2hlZHVsZXMgPSBbXTtcbiAgY29uc3RydWN0b3IoZ2V0U2NoZW1hVHlwZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zY2hlbWFUeXBlID0gZ2V0U2NoZW1hVHlwZSh0aGlzKTtcbiAgfVxuICBkZWZpbmVGdW5jdGlvbihuYW1lKSB7XG4gICAgaWYgKHRoaXMuZXhpc3RpbmdGdW5jdGlvbnMuaGFzKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBgVGhlcmUgaXMgYWxyZWFkeSBhIHJlZHVjZXIgb3IgcHJvY2VkdXJlIHdpdGggdGhlIG5hbWUgJyR7bmFtZX0nYFxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5leGlzdGluZ0Z1bmN0aW9ucy5hZGQobmFtZSk7XG4gIH1cbiAgcmVzb2x2ZVNjaGVkdWxlcygpIHtcbiAgICBmb3IgKGNvbnN0IHsgcmVkdWNlciwgc2NoZWR1bGVBdENvbCwgdGFibGVOYW1lIH0gb2YgdGhpcy5wZW5kaW5nU2NoZWR1bGVzKSB7XG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSB0aGlzLmZ1bmN0aW9uRXhwb3J0cy5nZXQocmVkdWNlcigpKTtcbiAgICAgIGlmIChmdW5jdGlvbk5hbWUgPT09IHZvaWQgMCkge1xuICAgICAgICBjb25zdCBtc2cgPSBgVGFibGUgJHt0YWJsZU5hbWV9IGRlZmluZXMgYSBzY2hlZHVsZSwgYnV0IGl0IHNlZW1zIGxpa2UgdGhlIGFzc29jaWF0ZWQgZnVuY3Rpb24gd2FzIG5vdCBleHBvcnRlZC5gO1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB0aGlzLm1vZHVsZURlZi5zY2hlZHVsZXMucHVzaCh7XG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcbiAgICAgICAgdGFibGVOYW1lLFxuICAgICAgICBzY2hlZHVsZUF0Q29sLFxuICAgICAgICBmdW5jdGlvbk5hbWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufTtcbnZhciBTY2hlbWEgPSBjbGFzcyB7XG4gICNjdHg7XG4gIGNvbnN0cnVjdG9yKGN0eCkge1xuICAgIHRoaXMuI2N0eCA9IGN0eDtcbiAgfVxuICBbbW9kdWxlSG9va3NdKGV4cG9ydHMpIHtcbiAgICBjb25zdCByZWdpc3RlcmVkU2NoZW1hID0gdGhpcy4jY3R4O1xuICAgIGZvciAoY29uc3QgW25hbWUsIG1vZHVsZUV4cG9ydF0gb2YgT2JqZWN0LmVudHJpZXMoZXhwb3J0cykpIHtcbiAgICAgIGlmIChuYW1lID09PSBcImRlZmF1bHRcIikgY29udGludWU7XG4gICAgICBpZiAoIWlzTW9kdWxlRXhwb3J0KG1vZHVsZUV4cG9ydCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcImV4cG9ydGluZyBzb21ldGhpbmcgdGhhdCBpcyBub3QgYSBzcGFjZXRpbWUgZXhwb3J0XCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNoZWNrRXhwb3J0Q29udGV4dChtb2R1bGVFeHBvcnQsIHJlZ2lzdGVyZWRTY2hlbWEpO1xuICAgICAgbW9kdWxlRXhwb3J0W3JlZ2lzdGVyRXhwb3J0XShyZWdpc3RlcmVkU2NoZW1hLCBuYW1lKTtcbiAgICB9XG4gICAgcmVnaXN0ZXJlZFNjaGVtYS5yZXNvbHZlU2NoZWR1bGVzKCk7XG4gICAgcmV0dXJuIG1ha2VIb29rcyhyZWdpc3RlcmVkU2NoZW1hKTtcbiAgfVxuICBnZXQgc2NoZW1hVHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy4jY3R4LnNjaGVtYVR5cGU7XG4gIH1cbiAgZ2V0IG1vZHVsZURlZigpIHtcbiAgICByZXR1cm4gdGhpcy4jY3R4Lm1vZHVsZURlZjtcbiAgfVxuICBnZXQgdHlwZXNwYWNlKCkge1xuICAgIHJldHVybiB0aGlzLiNjdHgudHlwZXNwYWNlO1xuICB9XG4gIHJlZHVjZXIoLi4uYXJncykge1xuICAgIGxldCBvcHRzLCBwYXJhbXMgPSB7fSwgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBbZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6IHtcbiAgICAgICAgbGV0IGFyZzE7XG4gICAgICAgIFthcmcxLCBmbl0gPSBhcmdzO1xuICAgICAgICBpZiAodHlwZW9mIGFyZzEubmFtZSA9PT0gXCJzdHJpbmdcIikgb3B0cyA9IGFyZzE7XG4gICAgICAgIGVsc2UgcGFyYW1zID0gYXJnMTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlIDM6XG4gICAgICAgIFtvcHRzLCBwYXJhbXMsIGZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVJlZHVjZXJFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCBwYXJhbXMsIGZuKTtcbiAgfVxuICBpbml0KC4uLmFyZ3MpIHtcbiAgICBsZXQgb3B0cywgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBbZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIFtvcHRzLCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VSZWR1Y2VyRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywge30sIGZuLCBMaWZlY3ljbGUuSW5pdCk7XG4gIH1cbiAgY2xpZW50Q29ubmVjdGVkKC4uLmFyZ3MpIHtcbiAgICBsZXQgb3B0cywgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBbZm5dID0gYXJncztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIFtvcHRzLCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VSZWR1Y2VyRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywge30sIGZuLCBMaWZlY3ljbGUuT25Db25uZWN0KTtcbiAgfVxuICBjbGllbnREaXNjb25uZWN0ZWQoLi4uYXJncykge1xuICAgIGxldCBvcHRzLCBmbjtcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIFtmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgW29wdHMsIGZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVJlZHVjZXJFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCB7fSwgZm4sIExpZmVjeWNsZS5PbkRpc2Nvbm5lY3QpO1xuICB9XG4gIHZpZXcob3B0cywgcmV0LCBmbikge1xuICAgIHJldHVybiBtYWtlVmlld0V4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHt9LCByZXQsIGZuKTtcbiAgfVxuICAvLyBUT0RPOiByZS1lbmFibGUgb25jZSBwYXJhbWV0ZXJpemVkIHZpZXdzIGFyZSBzdXBwb3J0ZWQgaW4gU1FMXG4gIC8vIHZpZXc8UmV0IGV4dGVuZHMgVmlld1JldHVyblR5cGVCdWlsZGVyPihcbiAgLy8gICBvcHRzOiBWaWV3T3B0cyxcbiAgLy8gICByZXQ6IFJldCxcbiAgLy8gICBmbjogVmlld0ZuPFMsIHt9LCBSZXQ+XG4gIC8vICk6IHZvaWQ7XG4gIC8vIHZpZXc8UGFyYW1zIGV4dGVuZHMgUGFyYW1zT2JqLCBSZXQgZXh0ZW5kcyBWaWV3UmV0dXJuVHlwZUJ1aWxkZXI+KFxuICAvLyAgIG9wdHM6IFZpZXdPcHRzLFxuICAvLyAgIHBhcmFtczogUGFyYW1zLFxuICAvLyAgIHJldDogUmV0LFxuICAvLyAgIGZuOiBWaWV3Rm48Uywge30sIFJldD5cbiAgLy8gKTogdm9pZDtcbiAgLy8gdmlldzxQYXJhbXMgZXh0ZW5kcyBQYXJhbXNPYmosIFJldCBleHRlbmRzIFZpZXdSZXR1cm5UeXBlQnVpbGRlcj4oXG4gIC8vICAgb3B0czogVmlld09wdHMsXG4gIC8vICAgcGFyYW1zT3JSZXQ6IFJldCB8IFBhcmFtcyxcbiAgLy8gICByZXRPckZuOiBWaWV3Rm48Uywge30sIFJldD4gfCBSZXQsXG4gIC8vICAgbWF5YmVGbj86IFZpZXdGbjxTLCBQYXJhbXMsIFJldD5cbiAgLy8gKTogdm9pZCB7XG4gIC8vICAgaWYgKHR5cGVvZiByZXRPckZuID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vICAgICBkZWZpbmVWaWV3KG5hbWUsIGZhbHNlLCB7fSwgcGFyYW1zT3JSZXQgYXMgUmV0LCByZXRPckZuKTtcbiAgLy8gICB9IGVsc2Uge1xuICAvLyAgICAgZGVmaW5lVmlldyhuYW1lLCBmYWxzZSwgcGFyYW1zT3JSZXQgYXMgUGFyYW1zLCByZXRPckZuLCBtYXliZUZuISk7XG4gIC8vICAgfVxuICAvLyB9XG4gIGFub255bW91c1ZpZXcob3B0cywgcmV0LCBmbikge1xuICAgIHJldHVybiBtYWtlQW5vblZpZXdFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCB7fSwgcmV0LCBmbik7XG4gIH1cbiAgcHJvY2VkdXJlKC4uLmFyZ3MpIHtcbiAgICBsZXQgb3B0cywgcGFyYW1zID0ge30sIHJldCwgZm47XG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgICAgY2FzZSAyOlxuICAgICAgICBbcmV0LCBmbl0gPSBhcmdzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzoge1xuICAgICAgICBsZXQgYXJnMTtcbiAgICAgICAgW2FyZzEsIHJldCwgZm5dID0gYXJncztcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcxLm5hbWUgPT09IFwic3RyaW5nXCIpIG9wdHMgPSBhcmcxO1xuICAgICAgICBlbHNlIHBhcmFtcyA9IGFyZzE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSA0OlxuICAgICAgICBbb3B0cywgcGFyYW1zLCByZXQsIGZuXSA9IGFyZ3M7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVByb2NlZHVyZUV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbik7XG4gIH1cbiAgLyoqXG4gICAqIEJ1bmRsZSBtdWx0aXBsZSByZWR1Y2VycywgcHJvY2VkdXJlcywgZXRjIGludG8gb25lIHZhbHVlIHRvIGV4cG9ydC5cbiAgICogVGhlIG5hbWUgdGhleSB3aWxsIGJlIGV4cG9ydGVkIHdpdGggaXMgdGhlaXIgY29ycmVzcG9uZGluZyBrZXkgaW4gdGhlIGBleHBvcnRzYCBhcmd1bWVudC5cbiAgICovXG4gIGV4cG9ydEdyb3VwKGV4cG9ydHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgW2V4cG9ydENvbnRleHRdOiB0aGlzLiNjdHgsXG4gICAgICBbcmVnaXN0ZXJFeHBvcnRdKGN0eCwgX2V4cG9ydE5hbWUpIHtcbiAgICAgICAgZm9yIChjb25zdCBbZXhwb3J0TmFtZSwgbW9kdWxlRXhwb3J0XSBvZiBPYmplY3QuZW50cmllcyhleHBvcnRzKSkge1xuICAgICAgICAgIGNoZWNrRXhwb3J0Q29udGV4dChtb2R1bGVFeHBvcnQsIGN0eCk7XG4gICAgICAgICAgbW9kdWxlRXhwb3J0W3JlZ2lzdGVyRXhwb3J0XShjdHgsIGV4cG9ydE5hbWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBjbGllbnRWaXNpYmlsaXR5RmlsdGVyID0ge1xuICAgIHNxbDogKGZpbHRlcikgPT4gKHtcbiAgICAgIFtleHBvcnRDb250ZXh0XTogdGhpcy4jY3R4LFxuICAgICAgW3JlZ2lzdGVyRXhwb3J0XShjdHgsIF9leHBvcnROYW1lKSB7XG4gICAgICAgIGN0eC5tb2R1bGVEZWYucm93TGV2ZWxTZWN1cml0eS5wdXNoKHsgc3FsOiBmaWx0ZXIgfSk7XG4gICAgICB9XG4gICAgfSlcbiAgfTtcbn07XG52YXIgcmVnaXN0ZXJFeHBvcnQgPSBTeW1ib2woXCJTcGFjZXRpbWVEQi5yZWdpc3RlckV4cG9ydFwiKTtcbnZhciBleHBvcnRDb250ZXh0ID0gU3ltYm9sKFwiU3BhY2V0aW1lREIuZXhwb3J0Q29udGV4dFwiKTtcbmZ1bmN0aW9uIGlzTW9kdWxlRXhwb3J0KHgpIHtcbiAgcmV0dXJuICh0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiB4ID09PSBcIm9iamVjdFwiKSAmJiB4ICE9PSBudWxsICYmIHJlZ2lzdGVyRXhwb3J0IGluIHg7XG59XG5mdW5jdGlvbiBjaGVja0V4cG9ydENvbnRleHQoZXhwLCBzY2hlbWEyKSB7XG4gIGlmIChleHBbZXhwb3J0Q29udGV4dF0gIT0gbnVsbCAmJiBleHBbZXhwb3J0Q29udGV4dF0gIT09IHNjaGVtYTIpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwibXVsdGlwbGUgc2NoZW1hcyBhcmUgbm90IHN1cHBvcnRlZFwiKTtcbiAgfVxufVxuZnVuY3Rpb24gc2NoZW1hKHRhYmxlcywgbW9kdWxlU2V0dGluZ3MpIHtcbiAgY29uc3QgY3R4ID0gbmV3IFNjaGVtYUlubmVyKChjdHgyKSA9PiB7XG4gICAgaWYgKG1vZHVsZVNldHRpbmdzPy5DQVNFX0NPTlZFUlNJT05fUE9MSUNZICE9IG51bGwpIHtcbiAgICAgIGN0eDIuc2V0Q2FzZUNvbnZlcnNpb25Qb2xpY3kobW9kdWxlU2V0dGluZ3MuQ0FTRV9DT05WRVJTSU9OX1BPTElDWSk7XG4gICAgfVxuICAgIGNvbnN0IHRhYmxlU2NoZW1hcyA9IHt9O1xuICAgIGZvciAoY29uc3QgW2FjY05hbWUsIHRhYmxlMl0gb2YgT2JqZWN0LmVudHJpZXModGFibGVzKSkge1xuICAgICAgY29uc3QgdGFibGVEZWYgPSB0YWJsZTIudGFibGVEZWYoY3R4MiwgYWNjTmFtZSk7XG4gICAgICB0YWJsZVNjaGVtYXNbYWNjTmFtZV0gPSB0YWJsZVRvU2NoZW1hKGFjY05hbWUsIHRhYmxlMiwgdGFibGVEZWYpO1xuICAgICAgY3R4Mi5tb2R1bGVEZWYudGFibGVzLnB1c2godGFibGVEZWYpO1xuICAgICAgaWYgKHRhYmxlMi5zY2hlZHVsZSkge1xuICAgICAgICBjdHgyLnBlbmRpbmdTY2hlZHVsZXMucHVzaCh7XG4gICAgICAgICAgLi4udGFibGUyLnNjaGVkdWxlLFxuICAgICAgICAgIHRhYmxlTmFtZTogdGFibGVEZWYuc291cmNlTmFtZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmICh0YWJsZTIudGFibGVOYW1lKSB7XG4gICAgICAgIGN0eDIubW9kdWxlRGVmLmV4cGxpY2l0TmFtZXMuZW50cmllcy5wdXNoKHtcbiAgICAgICAgICB0YWc6IFwiVGFibGVcIixcbiAgICAgICAgICB2YWx1ZToge1xuICAgICAgICAgICAgc291cmNlTmFtZTogYWNjTmFtZSxcbiAgICAgICAgICAgIGNhbm9uaWNhbE5hbWU6IHRhYmxlMi50YWJsZU5hbWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyB0YWJsZXM6IHRhYmxlU2NoZW1hcyB9O1xuICB9KTtcbiAgcmV0dXJuIG5ldyBTY2hlbWEoY3R4KTtcbn1cblxuLy8gc3JjL3NlcnZlci9jb25zb2xlLnRzXG52YXIgaW1wb3J0X29iamVjdF9pbnNwZWN0ID0gX190b0VTTShyZXF1aXJlX29iamVjdF9pbnNwZWN0KCkpO1xudmFyIGZtdExvZyA9ICguLi5kYXRhKSA9PiBkYXRhLm1hcCgoeCkgPT4gdHlwZW9mIHggPT09IFwic3RyaW5nXCIgPyB4IDogKDAsIGltcG9ydF9vYmplY3RfaW5zcGVjdC5kZWZhdWx0KSh4KSkuam9pbihcIiBcIik7XG52YXIgY29uc29sZV9sZXZlbF9lcnJvciA9IDA7XG52YXIgY29uc29sZV9sZXZlbF93YXJuID0gMTtcbnZhciBjb25zb2xlX2xldmVsX2luZm8gPSAyO1xudmFyIGNvbnNvbGVfbGV2ZWxfZGVidWcgPSAzO1xudmFyIGNvbnNvbGVfbGV2ZWxfdHJhY2UgPSA0O1xudmFyIHRpbWVyTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBjb25zb2xlMiA9IHtcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB3ZSB3YW50IGEgYmxhbmsgcHJvdG90eXBlLCBidXQgdHlwZXNjcmlwdCBjb21wbGFpbnNcbiAgX19wcm90b19fOiB7fSxcbiAgW1N5bWJvbC50b1N0cmluZ1RhZ106IFwiY29uc29sZVwiLFxuICBhc3NlcnQ6IChjb25kaXRpb24gPSBmYWxzZSwgLi4uZGF0YSkgPT4ge1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9lcnJvciwgZm10TG9nKC4uLmRhdGEpKTtcbiAgICB9XG4gIH0sXG4gIGNsZWFyOiAoKSA9PiB7XG4gIH0sXG4gIGRlYnVnOiAoLi4uZGF0YSkgPT4ge1xuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2RlYnVnLCBmbXRMb2coLi4uZGF0YSkpO1xuICB9LFxuICBlcnJvcjogKC4uLmRhdGEpID0+IHtcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9lcnJvciwgZm10TG9nKC4uLmRhdGEpKTtcbiAgfSxcbiAgaW5mbzogKC4uLmRhdGEpID0+IHtcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2coLi4uZGF0YSkpO1xuICB9LFxuICBsb2c6ICguLi5kYXRhKSA9PiB7XG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfaW5mbywgZm10TG9nKC4uLmRhdGEpKTtcbiAgfSxcbiAgdGFibGU6ICh0YWJ1bGFyRGF0YSwgX3Byb3BlcnRpZXMpID0+IHtcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2codGFidWxhckRhdGEpKTtcbiAgfSxcbiAgdHJhY2U6ICguLi5kYXRhKSA9PiB7XG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfdHJhY2UsIGZtdExvZyguLi5kYXRhKSk7XG4gIH0sXG4gIHdhcm46ICguLi5kYXRhKSA9PiB7XG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgZm10TG9nKC4uLmRhdGEpKTtcbiAgfSxcbiAgZGlyOiAoX2l0ZW0sIF9vcHRpb25zKSA9PiB7XG4gIH0sXG4gIGRpcnhtbDogKC4uLl9kYXRhKSA9PiB7XG4gIH0sXG4gIC8vIENvdW50aW5nXG4gIGNvdW50OiAoX2xhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcbiAgfSxcbiAgY291bnRSZXNldDogKF9sYWJlbCA9IFwiZGVmYXVsdFwiKSA9PiB7XG4gIH0sXG4gIC8vIEdyb3VwaW5nXG4gIGdyb3VwOiAoLi4uX2RhdGEpID0+IHtcbiAgfSxcbiAgZ3JvdXBDb2xsYXBzZWQ6ICguLi5fZGF0YSkgPT4ge1xuICB9LFxuICBncm91cEVuZDogKCkgPT4ge1xuICB9LFxuICAvLyBUaW1pbmdcbiAgdGltZTogKGxhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcbiAgICBpZiAodGltZXJNYXAuaGFzKGxhYmVsKSkge1xuICAgICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgYFRpbWVyICcke2xhYmVsfScgYWxyZWFkeSBleGlzdHMuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRpbWVyTWFwLnNldChsYWJlbCwgc3lzLmNvbnNvbGVfdGltZXJfc3RhcnQobGFiZWwpKTtcbiAgfSxcbiAgdGltZUxvZzogKGxhYmVsID0gXCJkZWZhdWx0XCIsIC4uLmRhdGEpID0+IHtcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2cobGFiZWwsIC4uLmRhdGEpKTtcbiAgfSxcbiAgdGltZUVuZDogKGxhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcbiAgICBjb25zdCBzcGFuSWQgPSB0aW1lck1hcC5nZXQobGFiZWwpO1xuICAgIGlmIChzcGFuSWQgPT09IHZvaWQgMCkge1xuICAgICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgYFRpbWVyICcke2xhYmVsfScgZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHN5cy5jb25zb2xlX3RpbWVyX2VuZChzcGFuSWQpO1xuICAgIHRpbWVyTWFwLmRlbGV0ZShsYWJlbCk7XG4gIH0sXG4gIC8vIEFkZGl0aW9uYWwgY29uc29sZSBtZXRob2RzIHRvIHNhdGlzZnkgdGhlIENvbnNvbGUgaW50ZXJmYWNlXG4gIHRpbWVTdGFtcDogKCkgPT4ge1xuICB9LFxuICBwcm9maWxlOiAoKSA9PiB7XG4gIH0sXG4gIHByb2ZpbGVFbmQ6ICgpID0+IHtcbiAgfVxufTtcblxuLy8gc3JjL3NlcnZlci9wb2x5ZmlsbHMudHNcbmdsb2JhbFRoaXMuY29uc29sZSA9IGNvbnNvbGUyO1xuLyohIEJ1bmRsZWQgbGljZW5zZSBpbmZvcm1hdGlvbjpcblxuc3RhdHVzZXMvaW5kZXguanM6XG4gICgqIVxuICAgKiBzdGF0dXNlc1xuICAgKiBDb3B5cmlnaHQoYykgMjAxNCBKb25hdGhhbiBPbmdcbiAgICogQ29weXJpZ2h0KGMpIDIwMTYgRG91Z2xhcyBDaHJpc3RvcGhlciBXaWxzb25cbiAgICogTUlUIExpY2Vuc2VkXG4gICAqKVxuKi9cblxuZXhwb3J0IHsgQXJyYXlCdWlsZGVyLCBBcnJheUNvbHVtbkJ1aWxkZXIsIEJvb2xCdWlsZGVyLCBCb29sQ29sdW1uQnVpbGRlciwgQm9vbGVhbkV4cHIsIEJ5dGVBcnJheUJ1aWxkZXIsIEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIsIENhc2VDb252ZXJzaW9uUG9saWN5LCBDb2x1bW5CdWlsZGVyLCBDb2x1bW5FeHByZXNzaW9uLCBDb25uZWN0aW9uSWRCdWlsZGVyLCBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyLCBGMzJCdWlsZGVyLCBGMzJDb2x1bW5CdWlsZGVyLCBGNjRCdWlsZGVyLCBGNjRDb2x1bW5CdWlsZGVyLCBJMTI4QnVpbGRlciwgSTEyOENvbHVtbkJ1aWxkZXIsIEkxNkJ1aWxkZXIsIEkxNkNvbHVtbkJ1aWxkZXIsIEkyNTZCdWlsZGVyLCBJMjU2Q29sdW1uQnVpbGRlciwgSTMyQnVpbGRlciwgSTMyQ29sdW1uQnVpbGRlciwgSTY0QnVpbGRlciwgSTY0Q29sdW1uQnVpbGRlciwgSThCdWlsZGVyLCBJOENvbHVtbkJ1aWxkZXIsIElkZW50aXR5QnVpbGRlciwgSWRlbnRpdHlDb2x1bW5CdWlsZGVyLCBPcHRpb25CdWlsZGVyLCBPcHRpb25Db2x1bW5CdWlsZGVyLCBQcm9kdWN0QnVpbGRlciwgUHJvZHVjdENvbHVtbkJ1aWxkZXIsIFJlZkJ1aWxkZXIsIFJlc3VsdEJ1aWxkZXIsIFJlc3VsdENvbHVtbkJ1aWxkZXIsIFJvd0J1aWxkZXIsIFNjaGVkdWxlQXRCdWlsZGVyLCBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlciwgU2VuZGVyRXJyb3IsIFNpbXBsZVN1bUJ1aWxkZXIsIFNpbXBsZVN1bUNvbHVtbkJ1aWxkZXIsIFNwYWNldGltZUhvc3RFcnJvciwgU3RyaW5nQnVpbGRlciwgU3RyaW5nQ29sdW1uQnVpbGRlciwgU3VtQnVpbGRlciwgU3VtQ29sdW1uQnVpbGRlciwgVGltZUR1cmF0aW9uQnVpbGRlciwgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlciwgVGltZXN0YW1wQnVpbGRlciwgVGltZXN0YW1wQ29sdW1uQnVpbGRlciwgVHlwZUJ1aWxkZXIsIFUxMjhCdWlsZGVyLCBVMTI4Q29sdW1uQnVpbGRlciwgVTE2QnVpbGRlciwgVTE2Q29sdW1uQnVpbGRlciwgVTI1NkJ1aWxkZXIsIFUyNTZDb2x1bW5CdWlsZGVyLCBVMzJCdWlsZGVyLCBVMzJDb2x1bW5CdWlsZGVyLCBVNjRCdWlsZGVyLCBVNjRDb2x1bW5CdWlsZGVyLCBVOEJ1aWxkZXIsIFU4Q29sdW1uQnVpbGRlciwgVXVpZEJ1aWxkZXIsIFV1aWRDb2x1bW5CdWlsZGVyLCBhbmQsIGNyZWF0ZVRhYmxlUmVmRnJvbURlZiwgZXJyb3JzLCBldmFsdWF0ZUJvb2xlYW5FeHByLCBnZXRRdWVyeUFjY2Vzc29yTmFtZSwgZ2V0UXVlcnlUYWJsZU5hbWUsIGdldFF1ZXJ5V2hlcmVDbGF1c2UsIGlzUm93VHlwZWRRdWVyeSwgaXNUeXBlZFF1ZXJ5LCBsaXRlcmFsLCBtYWtlUXVlcnlCdWlsZGVyLCBub3QsIG9yLCBzY2hlbWEsIHQsIHRhYmxlLCB0b0NhbWVsQ2FzZSwgdG9Db21wYXJhYmxlVmFsdWUsIHRvU3FsIH07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5tanMubWFwXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5tanMubWFwIiwiaW1wb3J0IHsgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcblxyXG5leHBvcnQgY29uc3QgUm9sZSA9IHQuZW51bSgnUm9sZScsIHtcclxuICAgIEFkbWluOiB0LnVuaXQoKSxcclxuICAgIFRvdXJuYW1lbnRIb3N0OiB0LnVuaXQoKSxcclxuICAgIFVzZXI6IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBQYXRoID0gdC5lbnVtKCdQYXRoJywge1xyXG4gICAgQWJ1bmRhbmNlOiB0LnVuaXQoKSxcclxuICAgIERlc3RydWN0aW9uOiB0LnVuaXQoKSxcclxuICAgIEVydWRpdGlvbjogdC51bml0KCksXHJcbiAgICBIYXJtb255OiB0LnVuaXQoKSxcclxuICAgIEh1bnQ6IHQudW5pdCgpLFxyXG4gICAgTmloaWxpdHk6IHQudW5pdCgpLFxyXG4gICAgUHJlc2VydmF0aW9uOiB0LnVuaXQoKSxcclxuICAgIFJlbWVtYnJhbmNlOiB0LnVuaXQoKSxcclxuICAgIEVsYXRpb246IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBFbGVtZW50ID0gdC5lbnVtKCdFbGVtZW50Jywge1xyXG4gICAgRmlyZTogdC51bml0KCksXHJcbiAgICBJY2U6IHQudW5pdCgpLFxyXG4gICAgSW1hZ2luYXJ5OiB0LnVuaXQoKSxcclxuICAgIExpZ2h0bmluZzogdC51bml0KCksXHJcbiAgICBQaHlzaWNhbDogdC51bml0KCksXHJcbiAgICBRdWFudHVtOiB0LnVuaXQoKSxcclxuICAgIFdpbmQ6IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBDaGFyUm9sZSA9IHQuZW51bSgnQ2hhclJvbGUnLCB7XHJcbiAgICBEcHM6IHQudW5pdCgpLFxyXG4gICAgU3VzdGFpbjogdC51bml0KCksXHJcbiAgICBTdXBwb3J0OiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgR2FtZU1vZGUgPSB0LmVudW0oJ0dhbWVNb2RlJywge1xyXG4gICAgTWVtb3J5T2ZDaGFvczogdC51bml0KCksXHJcbiAgICBBcG9jYWx5cHRpY1NoYWRvdzogdC51bml0KCksXHJcbiAgICBBbm9tYWx5QXJiaXRyYXRpb246IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBEcmFmdE1vZGUgPSB0LmVudW0oJ0RyYWZ0TW9kZScsIHtcclxuICAgIENsYXNzaWM6IHQudW5pdCgpLFxyXG4gICAgQXVjdGlvbjogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEJhbk1vZGUgPSB0LmVudW0oJ0Jhbk1vZGUnLCB7XHJcbiAgICBOb25lOiB0LnVuaXQoKSxcclxuICAgIFR3bzogdC51bml0KCksXHJcbiAgICBGb3VyOiB0LnVuaXQoKSxcclxuICAgIFNpeDogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IExvYmJ5U3RhZ2UgPSB0LmVudW0oJ0xvYmJ5U3RhZ2UnLCB7XHJcbiAgICBXYWl0aW5nOiB0LnVuaXQoKSxcclxuICAgIERyYWZ0aW5nOiB0LnVuaXQoKSxcclxuICAgIEZpbmlzaGVkOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgUGFydGljaXBhdGlvblJvbGUgPSB0LmVudW0oJ1BhcnRpY2lwYXRpb25Sb2xlJywge1xyXG4gICAgUGxheWVyOiB0LnVuaXQoKSxcclxuICAgIFNwZWN0YXRvcjogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRlYW1MYWJlbCA9IHQuZW51bSgnVGVhbUxhYmVsJywge1xyXG4gICAgU3BlY3RhdG9yOiB0LnVuaXQoKSxcclxuICAgIEJsdWU6IHQudW5pdCgpLFxyXG4gICAgUmVkOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgTWF0Y2hSZXN1bHQgPSB0LmVudW0oJ01hdGNoUmVzdWx0Jywge1xyXG4gICAgQmx1ZVdpbnM6IHQudW5pdCgpLFxyXG4gICAgUmVkV2luczogdC51bml0KCksXHJcbiAgICBEcmF3OiB0LnVuaXQoKSxcclxuICAgIEFib3J0ZWQ6IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBBY3Rpb25UeXBlID0gdC5lbnVtKCdBY3Rpb25UeXBlJywge1xyXG4gICAgUGljazogdC51bml0KCksXHJcbiAgICBCYW46IHQudW5pdCgpLFxyXG4gICAgTm9taW5hdGU6IHQudW5pdCgpLFxyXG4gICAgQmlkOiB0LnVuaXQoKSxcclxuICAgIEF1Y3Rpb25Tb2xkOiB0LnVuaXQoKSxcclxuICAgIFBhdXNlOiB0LnVuaXQoKSxcclxuICAgIFVuZG86IHQudW5pdCgpLFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IFJvbGUgfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcblxyXG5leHBvcnQgY29uc3QgVXNlciA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICd1c2VyJyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIGluZGV4ZXM6IFtcclxuICAgICAgICB7IG5hbWU6ICd1c2VyX3VzZXJuYW1lJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3VzZXJuYW1lJ10sIHVuaXF1ZTogdHJ1ZSB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3VzZXJfZGlzY29yZF9pZCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydkaXNjb3JkSWQnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBpZGVudGl0eTogdC5pZGVudGl0eSgpLnByaW1hcnlLZXkoKSxcclxuICAgIHVzZXJuYW1lOiB0LnN0cmluZygpLFxyXG4gICAgZGlzcGxheU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgICBpc0d1ZXN0OiB0LmJvb2woKSxcclxuICAgIGxhc3RMb2dpbkF0OiB0LnRpbWVzdGFtcCgpLFxyXG4gICAgcm9sZTogUm9sZSxcclxuICAgIGRpc2NvcmRJZDogdC5zdHJpbmcoKS5vcHRpb25hbCgpLFxyXG4gICAgYXZhdGFyQ2hhcmFjdGVyTmFtZTogdC5zdHJpbmcoKSwgLy8gRksgcmVmZXJlbmNlIHRvIEhzckNoYXJhY3RlciBuYW1lXHJcbn0pOyIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgUGF0aCwgRWxlbWVudCwgQ2hhclJvbGUgfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcblxyXG5leHBvcnQgY29uc3QgSHNyQ2hhcmFjdGVyID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ2hzcl9jaGFyYWN0ZXInLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2NoYXJhY3Rlcl9ieV9wYXRoJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3BhdGgnXSB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2NoYXJhY3Rlcl9ieV9lbGVtZW50JywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ2VsZW1lbnQnXSB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2NoYXJhY3Rlcl9ieV9yb2xlJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3JvbGUnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBuYW1lOiB0LnN0cmluZygpLnByaW1hcnlLZXkoKSxcclxuICAgIGRpc3BsYXlOYW1lOiB0LnN0cmluZygpLFxyXG4gICAgYWxpYXNlczogdC5hcnJheSh0LnN0cmluZygpKSxcclxuICAgIHJhcml0eTogdC51OCgpLFxyXG4gICAgcGF0aDogUGF0aCxcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQsXHJcbiAgICByb2xlOiBDaGFyUm9sZSxcclxuICAgIGltYWdlVXJsOiB0LnN0cmluZygpLFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IFBhdGggfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcblxyXG5leHBvcnQgY29uc3QgSHNyTGlnaHRjb25lID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ2hzcl9saWdodGNvbmUnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2xpZ2h0Y29uZV9ieV9wYXRoJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3BhdGgnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBuYW1lOiB0LnN0cmluZygpLnByaW1hcnlLZXkoKSxcclxuICAgIGRpc3BsYXlOYW1lOiB0LnN0cmluZygpLFxyXG4gICAgYWxpYXNlczogdC5hcnJheSh0LnN0cmluZygpKSxcclxuICAgIHBhdGg6IFBhdGgsXHJcbiAgICByYXJpdHk6IHQudTgoKSxcclxuICAgIGltYWdlVXJsOiB0LnN0cmluZygpLFxyXG5cclxuICAgIC8vIENTUyBwb3NpdGlvbmluZyBjb3JyZWN0aW9ucyBmb3IgdGhlIFVJXHJcbiAgICBwb3NYOiB0LmkzMigpLFxyXG4gICAgcG9zWTogdC5pMzIoKSxcclxuICAgIHdpZHRoOiB0LmkzMigpLFxyXG59KTsiLCJpbXBvcnQgeyB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHtcclxuICAgIERyYWZ0TW9kZSxcclxuICAgIEJhbk1vZGUsXHJcbiAgICBBY3Rpb25UeXBlLFxyXG4gICAgVGVhbUxhYmVsXHJcbn0gZnJvbSAnLi9lbnVtcyc7XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLSBTVFJVQ1RTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5leHBvcnQgY29uc3QgTG9iYnlDb25maWcgPSB0Lm9iamVjdCgnTG9iYnlDb25maWcnLCB7XHJcbiAgICB0ZWFtX3NpemU6IHQudTgoKSwgICAgICAgICAgICAgICAvLyAxLCAyLCBvciAzXHJcbiAgICBkcmFmdF9tb2RlOiBEcmFmdE1vZGUsXHJcbiAgICBiYW5fbW9kZTogQmFuTW9kZSxcclxuICAgIHN0YW5kYXJkX3R1cm5fc2Vjb25kczogdC51MzIoKSxcclxuICAgIHJlc2VydmVfYmFua19zZWNvbmRzOiB0LnUzMigpLFxyXG4gICAgYXVjdGlvbl9idWRnZXQ6IHQuZjMyKCkub3B0aW9uYWwoKSxcclxuXHJcbiAgICAvLyBCYWxhbmNlIE1hdGhcclxuICAgIHJvc3Rlcl9kaWZmX2FkdmFudGFnZTogdC5mMzIoKSxcclxuICAgIHJvc3Rlcl90aHJlc2hvbGQ6IHQuZjMyKCksXHJcbiAgICB1bmRlcl90aHJlc2hvbGRfYWR2YW50YWdlOiB0LmYzMigpLFxyXG4gICAgYWJvdmVfdGhyZXNob2xkX3BlbmFsdHk6IHQuZjMyKCksXHJcbiAgICBkZWF0aF9wZW5hbHR5OiB0LmYzMigpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBQbGF5ZXJTbmFwc2hvdCA9IHQub2JqZWN0KCdQbGF5ZXJTbmFwc2hvdCcsIHtcclxuICAgIGlkZW50aXR5OiB0LmlkZW50aXR5KCksXHJcbiAgICBkaXNwbGF5X25hbWU6IHQuc3RyaW5nKCksXHJcbiAgICBhdmF0YXJfdXJsOiB0LnN0cmluZygpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBUaW1lclN0YXRlID0gdC5vYmplY3QoJ1RpbWVyU3RhdGUnLCB7XHJcbiAgICB0dXJuX3N0YXJ0X2F0OiB0LnRpbWVzdGFtcCgpLFxyXG4gICAgdGVhbV9ibHVlX3Jlc2VydmVfbXM6IHQudTMyKCksXHJcbiAgICB0ZWFtX3JlZF9yZXNlcnZlX21zOiB0LnUzMigpLFxyXG4gICAgaXNfcGF1c2VkOiB0LmJvb2woKSxcclxuICAgIGFjY3VtdWxhdGVkX3BhdXNlX21zOiB0LnUzMigpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBEcmFmdFN0ZXAgPSB0Lm9iamVjdCgnRHJhZnRTdGVwJywge1xyXG4gICAgYWN0aW9uX3JlcXVpcmVkOiBBY3Rpb25UeXBlLFxyXG4gICAgdGVhbV90dXJuOiBUZWFtTGFiZWwsXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEVpZG9sb25Db3N0ID0gdC5vYmplY3QoJ0VpZG9sb25Db3N0Jywge1xyXG4gICAgZTA6IHQuZjMyKCksXHJcbiAgICBlMTogdC5mMzIoKSxcclxuICAgIGUyOiB0LmYzMigpLFxyXG4gICAgZTM6IHQuZjMyKCksXHJcbiAgICBlNDogdC5mMzIoKSxcclxuICAgIGU1OiB0LmYzMigpLFxyXG4gICAgZTY6IHQuZjMyKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFN1cGVyaW1wb3NpdGlvbkNvc3QgPSB0Lm9iamVjdCgnU3VwZXJpbXBvc2l0aW9uQ29zdCcsIHtcclxuICAgIHMxOiB0LmYzMigpLFxyXG4gICAgczI6IHQuZjMyKCksXHJcbiAgICBzMzogdC5mMzIoKSxcclxuICAgIHM0OiB0LmYzMigpLFxyXG4gICAgczU6IHQuZjMyKCksXHJcbn0pO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0gQUNUSU9OIFBBWUxPQURTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEluc3RlYWQgb2YgYSByYXcgSlNPTiBzdHJpbmcsIHdlIGRlZmluZSBhIFN1bSBUeXBlIChUYWdnZWQgVW5pb24pLlxyXG4vLyBUaGlzIHJlcGxhY2VzIHRoZSBcIkpTT05cIiBjb2x1bW4gd2l0aCBhIHR5cGUtc2FmZSBzdHJ1Y3R1cmUuXHJcblxyXG5leHBvcnQgY29uc3QgUGlja1BheWxvYWQgPSB0Lm9iamVjdCgnUGlja1BheWxvYWQnLCB7XHJcbiAgICBjaGFyYWN0ZXJfbmFtZTogdC5zdHJpbmcoKSxcclxuICAgIGVpZG9sb246IHQudTgoKSxcclxuICAgIGNvc3RfcGFpZDogdC5mMzIoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgQmFuUGF5bG9hZCA9IHQub2JqZWN0KCdCYW5QYXlsb2FkJywge1xyXG4gICAgY2hhcmFjdGVyX25hbWU6IHQuc3RyaW5nKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEJpZFBheWxvYWQgPSB0Lm9iamVjdCgnQmlkUGF5bG9hZCcsIHtcclxuICAgIGFtb3VudDogdC5mMzIoKSxcclxuICAgIHRhcmdldF9jaGFyYWN0ZXI6IHQuc3RyaW5nKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEF1Y3Rpb25Tb2xkUGF5bG9hZCA9IHQub2JqZWN0KCdBdWN0aW9uU29sZFBheWxvYWQnLCB7XHJcbiAgICBjaGFyYWN0ZXJfbmFtZTogdC5zdHJpbmcoKSxcclxuICAgIHdpbm5pbmdfYW1vdW50OiB0LmYzMigpLFxyXG4gICAgd2lubmluZ190ZWFtOiBUZWFtTGFiZWwsICAgIC8vIFdobyBhY3R1YWxseSBnb3QgaXRcclxuICAgIGVpZG9sb246IHQudTgoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgTm9taW5hdGVQYXlsb2FkID0gdC5vYmplY3QoJ05vbWluYXRlUGF5bG9hZCcsIHtcclxuICAgIGNoYXJhY3Rlcl9uYW1lOiB0LnN0cmluZygpLFxyXG4gICAgZWlkb2xvbjogdC51OCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBVbmRvUGF5bG9hZCA9IHQub2JqZWN0KCdVbmRvUGF5bG9hZCcsIHtcclxuICAgIG9yaWdpbmFsX3NlcXVlbmNlX2lkOiB0LnUzMigpLCAvLyBUaGUgSUQgb2YgdGhlIHN0ZXAgd2UgYXJlIHJldmVydGluZ1xyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBQYXVzZVBheWxvYWQgPSB0Lm9iamVjdCgnUGF1c2VQYXlsb2FkJywge1xyXG4gICAgdGltZV9yZW1haW5pbmdfbXM6IHQudTMyKCksICAgICAgICAvLyBTbmFwc2hvdCBvZiB0aGUgY2xvY2sgd2hlbiBwYXVzZWRcclxuICAgIGlzX2F1dG9fcGF1c2U6IHQuYm9vbCgpLCAgICAgICAgICAgLy8gVHJ1ZSBpZiBzeXN0ZW0gcGF1c2VkIChkaXNjb25uZWN0KSwgRmFsc2UgaWYgbWFudWFsXHJcbn0pO1xyXG5cclxuLy8gVGhlIFwiUG9seW1vcnBoaWNcIiBFbnVtIGNvbnRhaW5pbmcgdGhlIHNwZWNpZmljIHBheWxvYWRzXHJcbmV4cG9ydCBjb25zdCBTdGVwUGF5bG9hZCA9IHQuZW51bSgnU3RlcFBheWxvYWQnLCB7XHJcbiAgICBQaWNrOiBQaWNrUGF5bG9hZCxcclxuICAgIEJhbjogQmFuUGF5bG9hZCxcclxuICAgIEJpZDogQmlkUGF5bG9hZCxcclxuICAgIEF1Y3Rpb25Tb2xkOiBBdWN0aW9uU29sZFBheWxvYWQsXHJcbiAgICBOb21pbmF0ZTogTm9taW5hdGVQYXlsb2FkLFxyXG4gICAgVW5kbzogVW5kb1BheWxvYWQsXHJcbiAgICBQYXVzZTogUGF1c2VQYXlsb2FkLFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IEdhbWVNb2RlIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5pbXBvcnQgeyBFaWRvbG9uQ29zdCB9IGZyb20gJy4uL3R5cGVzL3N0cnVjdHMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IEhzckNoYXJhY3RlckNvc3QgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnaHNyX2NoYXJhY3Rlcl9jb3N0JyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIHByaW1hcnlLZXk6IFsnY2hhcmFjdGVyTmFtZScsICdnYW1lTW9kZSddLFxyXG59LCB7XHJcbiAgICBjaGFyYWN0ZXJOYW1lOiB0LnN0cmluZygpLFxyXG4gICAgZ2FtZU1vZGU6IEdhbWVNb2RlLFxyXG4gICAgY2xhc3NpY0Nvc3RzOiBFaWRvbG9uQ29zdCxcclxuICAgIGF1Y3Rpb25CYXNlQmlkOiBFaWRvbG9uQ29zdCxcclxufSk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBTdXBlcmltcG9zaXRpb25Db3N0IH0gZnJvbSAnLi4vdHlwZXMvc3RydWN0cyc7XHJcblxyXG5leHBvcnQgY29uc3QgSHNyTGlnaHRjb25lQ29zdCA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdoc3JfbGlnaHRjb25lX2Nvc3QnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG59LCB7XHJcbiAgICBsaWdodGNvbmVOYW1lOiB0LnN0cmluZygpLnByaW1hcnlLZXkoKSxcclxuICAgIGNsYXNzaWNDb3N0czogU3VwZXJpbXBvc2l0aW9uQ29zdCxcclxuICAgIGF1Y3Rpb25CYXNlQmlkOiBTdXBlcmltcG9zaXRpb25Db3N0LFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IEdhbWVNb2RlIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IEhzclN5bmVyZ3lDb3N0ID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ2hzcl9zeW5lcmd5X2Nvc3QnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ3N5bmVyZ3lfc291cmNlX21vZGUnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsnc291cmNlTmFtZScsICdnYW1lTW9kZSddIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnc3luZXJneV90YXJnZXQnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsndGFyZ2V0TmFtZSddIH0sXHJcbiAgICBdXHJcbn0sIHtcclxuICAgIGlkOiB0LnUzMigpLnByaW1hcnlLZXkoKS5hdXRvSW5jKCksXHJcbiAgICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxyXG4gICAgdGFyZ2V0TmFtZTogdC5zdHJpbmcoKSxcclxuICAgIGdhbWVNb2RlOiBHYW1lTW9kZSxcclxuICAgIGNvc3RNb2RpZmllcjogdC5mMzIoKSxcclxufSk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBMb2JieVN0YWdlIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5pbXBvcnQgeyBMb2JieUNvbmZpZyB9IGZyb20gJy4uL3R5cGVzL3N0cnVjdHMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IExvYmJ5ID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ2xvYmJ5JyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIGluZGV4ZXM6IFtcclxuICAgICAgICAvLyBVbmlxdWUgaW5kZXggZm9yIHRoZSA2LWNoYXIgam9pbiBjb2RlXHJcbiAgICAgICAgeyBuYW1lOiAnbG9iYnlfam9pbl9jb2RlJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ2pvaW5Db2RlJ10sIHVuaXF1ZTogdHJ1ZSB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2xvYmJ5X2hvc3QnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsnaG9zdElkZW50aXR5J10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLmF1dG9JbmMoKSxcclxuICAgIGpvaW5Db2RlOiB0LnN0cmluZygpLFxyXG4gICAgaG9zdElkZW50aXR5OiB0LmlkZW50aXR5KCksXHJcbiAgICB0ZWFtQmx1ZUFsaWFzOiB0LnN0cmluZygpLFxyXG4gICAgdGVhbVJlZEFsaWFzOiB0LnN0cmluZygpLFxyXG5cclxuICAgIC8vIExpZmVjeWNsZSAmIEdhcmJhZ2UgQ29sbGVjdGlvblxyXG4gICAgaG9zdERpc2Nvbm5lY3RUaW1lOiB0LnRpbWVzdGFtcCgpLm9wdGlvbmFsKCksXHJcbiAgICBsYXN0QWN0aXZpdHlBdDogdC50aW1lc3RhbXAoKSxcclxuXHJcbiAgICBzdGFnZTogTG9iYnlTdGFnZSxcclxuICAgIGNvbmZpZzogTG9iYnlDb25maWcsXHJcbn0pOyIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgUGFydGljaXBhdGlvblJvbGUsIFRlYW1MYWJlbCB9IGZyb20gJy4uL3R5cGVzL2VudW1zJztcclxuXHJcbmV4cG9ydCBjb25zdCBMb2JieU1lbWJlciA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdsb2JieV9tZW1iZXInLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgcHJpbWFyeUtleTogWydsb2JieUlkJywgJ3VzZXJJZGVudGl0eSddLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2xvYmJ5X21lbWJlcl9sb2JieV9pZCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydsb2JieUlkJ10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgbG9iYnlJZDogdC51MzIoKSxcclxuICAgIHVzZXJJZGVudGl0eTogdC5pZGVudGl0eSgpLFxyXG5cclxuICAgIGlzT25saW5lOiB0LmJvb2woKSxcclxuICAgIHBhcnRpY2lwYXRpb25Sb2xlOiBQYXJ0aWNpcGF0aW9uUm9sZSwgLy8gUGxheWVyIHZzIFNwZWN0YXRvclxyXG4gICAgaXNSZWZlcmVlOiB0LmJvb2woKSwgICAgLy8gQWRtaW4gcG93ZXJzIHdpdGhpbiB0aGlzIGxvYmJ5XHJcbiAgICB0ZWFtU2xvdDogVGVhbUxhYmVsLCAgICAvLyBCbHVlLCBSZWQsIG9yIFNwZWN0YXRvclxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcblxyXG5leHBvcnQgY29uc3QgTG9iYnlDdXJzb3JFdmVudCA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdsb2JieV9jdXJzb3JfZXZlbnQnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgZXZlbnQ6IHRydWUsIC8vIEJyb2FkY2FzdHMgb25JbnNlcnQsIHRoZW4gZGVsZXRlcyBpbW1lZGlhdGVseS5cclxufSwge1xyXG4gICAgbG9iYnlJZDogdC51MzIoKSxcclxuICAgIHNlbmRlcjogdC5pZGVudGl0eSgpLCAvLyBXaG8gbW92ZWQgdGhlIG1vdXNlXHJcbiAgICB4OiB0LmYzMigpLFxyXG4gICAgeTogdC5mMzIoKSxcclxuICAgIHRpbWVzdGFtcDogdC50aW1lc3RhbXAoKSxcclxufSk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBEcmFmdFN0ZXAsIFRpbWVyU3RhdGUgfSBmcm9tICcuLi90eXBlcy9zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjb25zdCBNYXRjaFNlc3Npb24gPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnbWF0Y2hfc2Vzc2lvbicsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICAvLyAxLXRvLTEgcmVsYXRpb25zaGlwIHdpdGggTG9iYnk6IFRoZSBMb2JieSBJRCBpcyB0aGUgUHJpbWFyeSBLZXlcclxufSwge1xyXG4gICAgbG9iYnlJZDogdC51MzIoKS5wcmltYXJ5S2V5KCksXHJcblxyXG4gICAgLy8gVGhlIGN1cnJlbnQgaW5kZXggaW50byB0aGUgJ2RyYWZ0U2VxdWVuY2UnIGFycmF5ICgwLWJhc2VkKVxyXG4gICAgdHVybkluZGV4OiB0LnUzMigpLFxyXG5cclxuICAgIC8vIFRoZSBnZW5lcmF0ZWQgc2NyaXB0IGZvciB0aGlzIG1hdGNoIChlLmcuIFtCYW4gQmx1ZSwgQmFuIFJlZCwgUGljayBCbHVlLi4uXSlcclxuICAgIGRyYWZ0U2VxdWVuY2U6IHQuYXJyYXkoRHJhZnRTdGVwKSxcclxuXHJcbiAgICAvLyBUcmFja3MgdHVybiB0aW1lcnMsIHJlc2VydmVzLCBhbmQgcGF1c2Ugc3RhdGVcclxuICAgIHRpbWVyU3RhdGU6IFRpbWVyU3RhdGUsXHJcblxyXG4gICAgLy8gQXVjdGlvbiBNb2RlIEJ1ZGdldHMgKElnbm9yZWQgaW4gQ2xhc3NpYylcclxuICAgIHRlYW1CbHVlQnVkZ2V0OiB0LmYzMigpLFxyXG4gICAgdGVhbVJlZEJ1ZGdldDogdC5mMzIoKSxcclxufSk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBBY3Rpb25UeXBlLCBUZWFtTGFiZWwgfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcbmltcG9ydCB7IFN0ZXBQYXlsb2FkIH0gZnJvbSAnLi4vdHlwZXMvc3RydWN0cyc7XHJcblxyXG5leHBvcnQgY29uc3QgTWF0Y2hTZXNzaW9uU3RlcCA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdtYXRjaF9zZXNzaW9uX3N0ZXAnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIC8vIEZhc3QgbG9va3VwOiBcIkdldCBmdWxsIGhpc3RvcnkgZm9yIExvYmJ5IDEyM1wiXHJcbiAgICAgICAgeyBuYW1lOiAnbWF0Y2hfaGlzdG9yeV9sb2JieScsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydsb2JieUlkJ10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLmF1dG9JbmMoKSxcclxuXHJcbiAgICBsb2JieUlkOiB0LnUzMigpLCAgICAgIC8vIEZLIHRvIExvYmJ5L01hdGNoU2Vzc2lvblxyXG4gICAgc2VxdWVuY2U6IHQudTMyKCksICAgICAvLyAxLCAyLCAzLi4uIChTdHJpY3Qgb3JkZXJpbmcpXHJcblxyXG4gICAgYWN0b3I6IHQuaWRlbnRpdHkoKSwgICAvLyBXaG8gcGVyZm9ybWVkIHRoZSBhY3Rpb25cclxuICAgIGFjdG9yU2xvdDogVGVhbUxhYmVsLCAgLy8gQmx1ZS9SZWQvU3BlY3RhdG9yXHJcblxyXG4gICAgYWN0aW9uOiBBY3Rpb25UeXBlLCAgICAvLyBQaWNrLCBCYW4sIEJpZC4uLlxyXG5cclxuICAgIHBheWxvYWQ6IFN0ZXBQYXlsb2FkLFxyXG4gICAgdGltZXN0YW1wOiB0LnRpbWVzdGFtcCgpLFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IERyYWZ0TW9kZSwgR2FtZU1vZGUsIE1hdGNoUmVzdWx0IH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5pbXBvcnQgeyBQbGF5ZXJTbmFwc2hvdCwgTG9iYnlDb25maWcgfSBmcm9tICcuLi90eXBlcy9zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjb25zdCBNYXRjaFNlc3Npb25IaXN0b3J5ID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ21hdGNoX3Nlc3Npb25faGlzdG9yeScsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICBpbmRleGVzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnaGlzdG9yeV9wbGF5ZWRfYXQnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsncGxheWVkQXQnXSB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2hpc3RvcnlfZ2FtZV9tb2RlJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ2dhbWVNb2RlJ10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgaWQ6IHQuc3RyaW5nKCkucHJpbWFyeUtleSgpLCAvLyBVVUlEIGdlbmVyYXRlZCBhdCBnYW1lIGVuZFxyXG4gICAgbG9iYnlDb2RlOiB0LnN0cmluZygpLCAgICAgICAvLyBLZXB0IGZvciByZWZlcmVuY2UgKGUuZy4gXCJYN0s5UDJcIilcclxuICAgIHBsYXllZEF0OiB0LnRpbWVzdGFtcCgpLFxyXG5cclxuICAgIGRyYWZ0TW9kZTogRHJhZnRNb2RlLFxyXG4gICAgZ2FtZU1vZGU6IEdhbWVNb2RlLFxyXG5cclxuICAgIHRlYW1CbHVlQWxpYXM6IHQuc3RyaW5nKCksXHJcbiAgICB0ZWFtUmVkQWxpYXM6IHQuc3RyaW5nKCksXHJcblxyXG4gICAgLy8gRnVsbCBzbmFwc2hvdHMgb2YgcGxheWVycyBhdCB0aGUgdGltZSBvZiB0aGUgbWF0Y2hcclxuICAgIGJsdWVUZWFtTWVtYmVyczogdC5hcnJheShQbGF5ZXJTbmFwc2hvdCksXHJcbiAgICByZWRUZWFtTWVtYmVyczogdC5hcnJheShQbGF5ZXJTbmFwc2hvdCksXHJcblxyXG4gICAgc25hcHNob3RDb25maWc6IExvYmJ5Q29uZmlnLCAvLyBUaGUgZXhhY3QgcnVsZXMgdXNlZCAoU25hcHNob3QpXHJcblxyXG4gICAgcmVzdWx0OiBNYXRjaFJlc3VsdCxcclxuXHJcbiAgICAvLyBTZXJpYWxpemVkIEpTT04gYmxvYnMgY29udGFpbmluZyB0aGUgZmluYWwgdGVhbSBjb21wc1xyXG4gICAgLy8gKENoYXJhY3RlciBOYW1lLCBFaWRvbG9uLCBDb3N0IFBhaWQsIGV0Yy4pXHJcbiAgICByb3N0ZXJCbHVlOiB0LnN0cmluZygpLFxyXG4gICAgcm9zdGVyUmVkOiB0LnN0cmluZygpLFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcblxyXG5leHBvcnQgY29uc3QgTWF0Y2hTZXNzaW9uU3RlcEhpc3RvcnkgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnbWF0Y2hfc2Vzc2lvbl9zdGVwX2hpc3RvcnknLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgLy8gVGhlIFBLIGlzIHRoZSBNYXRjaCBJRCBpdHNlbGYgKDEtdG8tMSByZWxhdGlvbiB3aXRoIEhpc3RvcnkgdGFibGUpXHJcbn0sIHtcclxuICAgIG1hdGNoSWQ6IHQuc3RyaW5nKCkucHJpbWFyeUtleSgpLCAvLyBGSyB0byBNYXRjaFNlc3Npb25IaXN0b3J5LmlkXHJcblxyXG4gICAgLy8gQSBzaW5nbGUgbWFzc2l2ZSBKU09OIHN0cmluZyBjb250YWluaW5nIHRoZSBmdWxsIGFycmF5IG9mIHN0ZXBzLlxyXG4gICAgLy8gQ2xpZW50cyBmZXRjaCB0aGlzIG9ubHkgd2hlbiBcIldhdGNoIFJlcGxheVwiIGlzIGNsaWNrZWQuXHJcbiAgICBzdGVwczogdC5zdHJpbmcoKSxcclxufSk7IiwiaW1wb3J0IHsgc2NoZW1hIH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vdGFibGVzL3VzZXInO1xyXG5pbXBvcnQgeyBIc3JDaGFyYWN0ZXIgfSBmcm9tICcuL3RhYmxlcy9oc3JDaGFyYWN0ZXInO1xyXG5pbXBvcnQgeyBIc3JMaWdodGNvbmUgfSBmcm9tICcuL3RhYmxlcy9oc3JMaWdodGNvbmUnO1xyXG5pbXBvcnQgeyBIc3JDaGFyYWN0ZXJDb3N0IH0gZnJvbSAnLi90YWJsZXMvaHNyQ2hhcmFjdGVyQ29zdCc7XHJcbmltcG9ydCB7IEhzckxpZ2h0Y29uZUNvc3QgfSBmcm9tICcuL3RhYmxlcy9oc3JMaWdodGNvbmVDb3N0JztcclxuaW1wb3J0IHsgSHNyU3luZXJneUNvc3QgfSBmcm9tICcuL3RhYmxlcy9oc3JTeW5lcmd5Q29zdCc7XHJcbmltcG9ydCB7IExvYmJ5IH0gZnJvbSAnLi90YWJsZXMvbG9iYnknO1xyXG5pbXBvcnQgeyBMb2JieU1lbWJlciB9IGZyb20gJy4vdGFibGVzL2xvYmJ5TWVtYmVyJztcclxuaW1wb3J0IHsgTG9iYnlDdXJzb3JFdmVudCB9IGZyb20gJy4vdGFibGVzL2xvYmJ5Q3Vyc29yRXZlbnQnO1xyXG5pbXBvcnQgeyBNYXRjaFNlc3Npb24gfSBmcm9tICcuL3RhYmxlcy9tYXRjaFNlc3Npb24nO1xyXG5pbXBvcnQgeyBNYXRjaFNlc3Npb25TdGVwIH0gZnJvbSAnLi90YWJsZXMvbWF0Y2hTZXNzaW9uU3RlcCc7XHJcbmltcG9ydCB7IE1hdGNoU2Vzc2lvbkhpc3RvcnkgfSBmcm9tICcuL3RhYmxlcy9tYXRjaFNlc3Npb25IaXN0b3J5JztcclxuaW1wb3J0IHsgTWF0Y2hTZXNzaW9uU3RlcEhpc3RvcnkgfSBmcm9tICcuL3RhYmxlcy9tYXRjaFNlc3Npb25TdGVwSGlzdG9yeSc7XHJcblxyXG5jb25zdCBzcGFjZXRpbWVkYiA9IHNjaGVtYSh7XHJcbiAgICAvLyBVc2VyIC8gQXV0aFxyXG4gICAgVXNlcixcclxuXHJcbiAgICAvLyBTdGF0aWMgQXNzZXRzXHJcbiAgICBIc3JDaGFyYWN0ZXIsXHJcbiAgICBIc3JMaWdodGNvbmUsXHJcblxyXG4gICAgLy8gRWNvbm9teVxyXG4gICAgSHNyQ2hhcmFjdGVyQ29zdCxcclxuICAgIEhzckxpZ2h0Y29uZUNvc3QsXHJcbiAgICBIc3JTeW5lcmd5Q29zdCxcclxuXHJcbiAgICAvLyBMb2JieSBTeXN0ZW1cclxuICAgIExvYmJ5LFxyXG4gICAgTG9iYnlNZW1iZXIsXHJcbiAgICBMb2JieUN1cnNvckV2ZW50LFxyXG5cclxuICAgIC8vIEFjdGl2ZSBHYW1lXHJcbiAgICBNYXRjaFNlc3Npb24sXHJcbiAgICBNYXRjaFNlc3Npb25TdGVwLFxyXG5cclxuICAgIC8vIEhpc3RvcnlcclxuICAgIE1hdGNoU2Vzc2lvbkhpc3RvcnksXHJcbiAgICBNYXRjaFNlc3Npb25TdGVwSGlzdG9yeSxcclxufSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzcGFjZXRpbWVkYjsiLCJpbXBvcnQgeyB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHNwYWNldGltZWRiIGZyb20gJy4uL3NjaGVtYSc7XHJcbmltcG9ydCB7IFNlbmRlckVycm9yIH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuXHJcbmNvbnN0IERFRkFVTFRfQVZBVEFSID0gXCJtYXRjaDd0aFwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyX2d1ZXN0ID0gc3BhY2V0aW1lZGIucmVkdWNlcihcclxuICAgIHsgZGlzcGxheU5hbWU6IHQuc3RyaW5nKCkgfSxcclxuICAgIChjdHgsIHsgZGlzcGxheU5hbWUgfSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGV4aXN0aW5nVXNlciA9IGN0eC5kYi5Vc2VyLmlkZW50aXR5LmZpbmQoY3R4LnNlbmRlcik7XHJcblxyXG4gICAgICAgIGlmIChleGlzdGluZ1VzZXIpIHtcclxuICAgICAgICAgICAgY3R4LmRiLlVzZXIuaWRlbnRpdHkudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLmV4aXN0aW5nVXNlcixcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lLFxyXG4gICAgICAgICAgICAgICAgbGFzdExvZ2luQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHguZGIuVXNlci5pbnNlcnQoe1xyXG4gICAgICAgICAgICBpZGVudGl0eTogY3R4LnNlbmRlcixcclxuICAgICAgICAgICAgdXNlcm5hbWU6IGBndWVzdF8ke2N0eC5zZW5kZXIudG9IZXhTdHJpbmcoKS5zdWJzdHJpbmcoMCwgMjQpfWAsXHJcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBkaXNwbGF5TmFtZSxcclxuICAgICAgICAgICAgaXNHdWVzdDogdHJ1ZSxcclxuICAgICAgICAgICAgbGFzdExvZ2luQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICAgICAgICAgIHJvbGU6IHsgdGFnOiAnVXNlcicgfSxcclxuICAgICAgICAgICAgZGlzY29yZElkOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgIGF2YXRhckNoYXJhY3Rlck5hbWU6IERFRkFVTFRfQVZBVEFSLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4pO1xyXG5cclxuZXhwb3J0IGNvbnN0IHJlZ2lzdGVyX2Rpc2NvcmRfdXNlciA9IHNwYWNldGltZWRiLnJlZHVjZXIoXHJcbiAgICB7XHJcbiAgICAgICAgZGlzY29yZElkOiB0LnN0cmluZygpLFxyXG4gICAgICAgIHVzZXJuYW1lOiB0LnN0cmluZygpLFxyXG4gICAgICAgIGRpc3BsYXlOYW1lOiB0LnN0cmluZygpLFxyXG4gICAgfSxcclxuICAgIChjdHgsIHsgZGlzY29yZElkLCB1c2VybmFtZSwgZGlzcGxheU5hbWUgfSkgPT4ge1xyXG4gICAgICAgIC8vIDEuIEZhc3QgTygxKSBsb29rdXAgZmlyc3RcclxuICAgICAgICBjb25zdCBleGlzdGluZ1VzZXIgPSBjdHguZGIuVXNlci5pZGVudGl0eS5maW5kKGN0eC5zZW5kZXIpO1xyXG5cclxuICAgICAgICAvLyAyLiBPbmx5IGRvIHRoZSBleHBlbnNpdmUgTyhOKSB0YWJsZSBzY2FuIGlmIG5lY2Vzc2FyeS5cclxuICAgICAgICBpZiAoIWV4aXN0aW5nVXNlciB8fCBleGlzdGluZ1VzZXIuZGlzY29yZElkICE9PSBkaXNjb3JkSWQpIHtcclxuICAgICAgICAgICAgLy8gVXNpbmcgLnNvbWUoKSBpcyBmYXN0ZXIgdGhhbiAuZmluZCgpIGJlY2F1c2UgaXQgc3RvcHMgc2VhcmNoaW5nIFxyXG4gICAgICAgICAgICAvLyB0aGUgbWlsbGlzZWNvbmQgaXQgZmluZHMgYSBzaW5nbGUgbWF0Y2guXHJcbiAgICAgICAgICAgIGNvbnN0IGlzVGFrZW4gPSBBcnJheS5mcm9tKGN0eC5kYi5Vc2VyLml0ZXIoKSkuc29tZShcclxuICAgICAgICAgICAgICAgIHVzZXIgPT4gdXNlci5kaXNjb3JkSWQgPT09IGRpc2NvcmRJZFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzVGFrZW4pIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgRGlzY29yZCBJRCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQgdG8gYW5vdGhlciB1c2VyLlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gMy4gUHJvY2VlZCB3aXRoIFVwZGF0ZSBvciBJbnNlcnRcclxuICAgICAgICBpZiAoZXhpc3RpbmdVc2VyKSB7XHJcbiAgICAgICAgICAgIGN0eC5kYi5Vc2VyLmlkZW50aXR5LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5leGlzdGluZ1VzZXIsXHJcbiAgICAgICAgICAgICAgICB1c2VybmFtZSxcclxuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lLFxyXG4gICAgICAgICAgICAgICAgZGlzY29yZElkLFxyXG4gICAgICAgICAgICAgICAgbGFzdExvZ2luQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICAgICAgICAgICAgICBpc0d1ZXN0OiBmYWxzZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGN0eC5kYi5Vc2VyLmluc2VydCh7XHJcbiAgICAgICAgICAgIGlkZW50aXR5OiBjdHguc2VuZGVyLFxyXG4gICAgICAgICAgICB1c2VybmFtZSxcclxuICAgICAgICAgICAgZGlzcGxheU5hbWUsXHJcbiAgICAgICAgICAgIGlzR3Vlc3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICBsYXN0TG9naW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgICAgICAgICAgcm9sZTogeyB0YWc6ICdVc2VyJyB9LFxyXG4gICAgICAgICAgICBkaXNjb3JkSWQsXHJcbiAgICAgICAgICAgIGF2YXRhckNoYXJhY3Rlck5hbWU6IERFRkFVTFRfQVZBVEFSLFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4pOyIsImltcG9ydCBzcGFjZXRpbWVkYiBmcm9tICcuLi9zY2hlbWEnO1xyXG5pbXBvcnQgeyB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuXHJcbmV4cG9ydCBjb25zdCBicm9hZGNhc3RfY3Vyc29yID0gc3BhY2V0aW1lZGIucmVkdWNlcih7XHJcbiAgICBsb2JieUlkOiB0LnUzMigpLFxyXG4gICAgeDogdC5mMzIoKSxcclxuICAgIHk6IHQuZjMyKCksXHJcbn0sIChjdHgsIHsgbG9iYnlJZCwgeCwgeSB9KSA9PiB7XHJcbiAgICAvLyAxLiBWYWxpZGF0aW9uOiBVc2UgdGhlIENvbXBvc2l0ZSBQcmltYXJ5IEtleSBmb3IgYW4gTygxKSBpbnN0YW50IGxvb2t1cFxyXG4gICAgLy8gV2UgcGFzcyBhbiBvYmplY3QgbWF0Y2hpbmcgdGhlIFBLIHN0cnVjdHVyZSB7IGxvYmJ5SWQsIHVzZXJJZGVudGl0eSB9XHJcbiAgICBjb25zdCBtZW1iZXJUYWJsZSA9IGN0eC5kYi5Mb2JieU1lbWJlciBhcyBhbnk7IC8vIHRoaXMgaXMgYWxtb3N0IG5lY2Vzc2FyeSBmb3IgYW55IGZpbHRlciBvbiBhbnkgdGFibGUgZHVlIHRvIHR5cGVzY3JpcHQgc2RmIGNvbmZsaWN0c1xyXG4gICAgY29uc3QgbWVtYmVyc2hpcCA9IG1lbWJlclRhYmxlLnByaW1hcnlLZXkuZmluZCh7XHJcbiAgICAgICAgbG9iYnlJZCxcclxuICAgICAgICB1c2VySWRlbnRpdHk6IGN0eC5zZW5kZXJcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghbWVtYmVyc2hpcCkge1xyXG4gICAgICAgIC8vIFVzZXIgaXMgbm90IGluIHRoaXMgbG9iYnksIGlnbm9yZSB0aGUgcmVxdWVzdFxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyAyLiBCcm9hZGNhc3RcclxuICAgIGN0eC5kYi5Mb2JieUN1cnNvckV2ZW50Lmluc2VydCh7XHJcbiAgICAgICAgbG9iYnlJZCxcclxuICAgICAgICBzZW5kZXI6IGN0eC5zZW5kZXIsXHJcbiAgICAgICAgeCxcclxuICAgICAgICB5LFxyXG4gICAgICAgIHRpbWVzdGFtcDogY3R4LnRpbWVzdGFtcCxcclxuICAgIH0pO1xyXG59KTsiLCJpbXBvcnQgc3BhY2V0aW1lZGIgZnJvbSAnLi9zY2hlbWEnO1xyXG5leHBvcnQgeyByZWdpc3Rlcl9ndWVzdCwgcmVnaXN0ZXJfZGlzY29yZF91c2VyIH0gZnJvbSAnLi9yZWR1Y2Vycy9hdXRoJztcclxuZXhwb3J0IHsgYnJvYWRjYXN0X2N1cnNvciB9IGZyb20gJy4vcmVkdWNlcnMvY3Vyc29yJztcclxuXHJcbnNwYWNldGltZWRiLmNsaWVudENvbm5lY3RlZCgoY3R4KSA9PiB7XHJcbiAgY29uc29sZS5sb2coYENsaWVudCBjb25uZWN0ZWQ6ICR7Y3R4LnNlbmRlci50b0hleFN0cmluZygpfWApO1xyXG59KTtcclxuXHJcbnNwYWNldGltZWRiLmNsaWVudERpc2Nvbm5lY3RlZCgoY3R4KSA9PiB7XHJcbiAgY29uc29sZS5sb2coYENsaWVudCBkaXNjb25uZWN0ZWQ6ICR7Y3R4LnNlbmRlci50b0hleFN0cmluZygpfWApO1xyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNwYWNldGltZWRiOyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLElBQUlBLGFBQVcsT0FBTztBQUN0QixJQUFJQyxjQUFZLE9BQU87QUFDdkIsSUFBSUMscUJBQW1CLE9BQU87QUFDOUIsSUFBSUMsc0JBQW9CLE9BQU87QUFDL0IsSUFBSUMsaUJBQWUsT0FBTztBQUMxQixJQUFJQyxpQkFBZSxPQUFPLFVBQVU7QUFDcEMsSUFBSUMsZ0JBQWMsSUFBSSxRQUFRLFNBQVMsWUFBWTtBQUNqRCxRQUFPLFFBQVEsR0FBRyxHQUFHSCxvQkFBa0IsR0FBRyxDQUFDLE1BQU0sTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsU0FBUyxJQUFJLEVBQUUsSUFBSTs7QUFFN0YsSUFBSUksaUJBQWUsSUFBSSxNQUFNLFFBQVEsU0FBUztBQUM1QyxLQUFJLFFBQVEsT0FBTyxTQUFTLFlBQVksT0FBTyxTQUFTLFlBQ3REO09BQUssSUFBSSxPQUFPSixvQkFBa0IsS0FBSyxDQUNyQyxLQUFJLENBQUNFLGVBQWEsS0FBSyxJQUFJLElBQUksSUFBSSxRQUFRLE9BQ3pDLGFBQVUsSUFBSSxLQUFLO0dBQUUsV0FBVyxLQUFLO0dBQU0sWUFBWSxFQUFFLE9BQU9ILG1CQUFpQixNQUFNLElBQUksS0FBSyxLQUFLO0dBQVksQ0FBQzs7QUFFeEgsUUFBTzs7QUFFVCxJQUFJTSxhQUFXLEtBQUssWUFBWSxZQUFZLFNBQVMsT0FBTyxPQUFPUixXQUFTSSxl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QUFJO0VBQ2pCLE1BQU0sRUFBRSxLQUFLLFFBQVE7RUFDckIsV0FBVztFQUNYLHFCQUFxQjtFQUN4QixDQUFDO0VBRVQ7QUFFRCxNQUFhLHdCQUF3QixZQUFZLFFBQzdDO0NBQ0ksV0FBVyxFQUFFLFFBQVE7Q0FDckIsVUFBVSxFQUFFLFFBQVE7Q0FDcEIsYUFBYSxFQUFFLFFBQVE7Q0FDMUIsR0FDQSxLQUFLLEVBQUUsV0FBVyxVQUFVLGtCQUFrQjtDQUUzQyxNQUFNLGVBQWUsSUFBSSxHQUFHLEtBQUssU0FBUyxLQUFLLElBQUksT0FBTztBQUcxRCxLQUFJLENBQUMsZ0JBQWdCLGFBQWEsY0FBYyxXQU81QztNQUpnQixNQUFNLEtBQUssSUFBSSxHQUFHLEtBQUssTUFBTSxDQUFDLENBQUMsTUFDM0MsU0FBUSxLQUFLLGNBQWMsVUFDOUIsQ0FHRyxPQUFNLElBQUksTUFBTSx5REFBeUQ7O0FBS2pGLEtBQUksY0FBYztBQUNkLE1BQUksR0FBRyxLQUFLLFNBQVMsT0FBTztHQUN4QixHQUFHO0dBQ0g7R0FDQTtHQUNBO0dBQ0EsYUFBYSxJQUFJO0dBQ2pCLFNBQVM7R0FDWixDQUFDO0FBQ0Y7O0FBR0osS0FBSSxHQUFHLEtBQUssT0FBTztFQUNmLFVBQVUsSUFBSTtFQUNkO0VBQ0E7RUFDQSxTQUFTO0VBQ1QsYUFBYSxJQUFJO0VBQ2pCLE1BQU0sRUFBRSxLQUFLLFFBQVE7RUFDckI7RUFDQSxxQkFBcUI7RUFDeEIsQ0FBQztFQUVUOzs7O0FDN0VELE1BQWEsbUJBQW1CLFlBQVksUUFBUTtDQUNoRCxTQUFTLEVBQUUsS0FBSztDQUNoQixHQUFHLEVBQUUsS0FBSztDQUNWLEdBQUcsRUFBRSxLQUFLO0NBQ2IsR0FBRyxLQUFLLEVBQUUsU0FBUyxHQUFHLFFBQVE7QUFTM0IsS0FBSSxDQU5nQixJQUFJLEdBQUcsWUFDSSxXQUFXLEtBQUs7RUFDM0M7RUFDQSxjQUFjLElBQUk7RUFDckIsQ0FBQyxDQUlFO0FBSUosS0FBSSxHQUFHLGlCQUFpQixPQUFPO0VBQzNCO0VBQ0EsUUFBUSxJQUFJO0VBQ1o7RUFDQTtFQUNBLFdBQVcsSUFBSTtFQUNsQixDQUFDO0VBQ0o7Ozs7QUN6QkYsWUFBWSxpQkFBaUIsUUFBUTtBQUNuQyxTQUFRLElBQUkscUJBQXFCLElBQUksT0FBTyxhQUFhLEdBQUc7RUFDNUQ7QUFFRixZQUFZLG9CQUFvQixRQUFRO0FBQ3RDLFNBQVEsSUFBSSx3QkFBd0IsSUFBSSxPQUFPLGFBQWEsR0FBRztFQUMvRDtBQUVGLGtCQUFlIiwiZGVidWdJZCI6IjQwMDBiMjM0LTE5NzgtNDBmYy04MjhmLWVmNTlhODE4ZjlmMiJ9