import * as _syscalls2_0 from "spacetime:sys@2.0";
import { moduleHooks } from "spacetime:sys@2.0";

//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/node_modules/headers-polyfill/lib/index.mjs
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
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/node_modules/spacetimedb/dist/server/index.mjs
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
		name: "user_discord_id",
		accessor: "user_discord_id",
		algorithm: "btree",
		columns: ["discordId"]
	}]
}, {
	id: t.u32().primaryKey().autoInc(),
	username: t.string().unique(),
	displayName: t.string(),
	isGuest: t.bool(),
	lastLoginAt: t.timestamp(),
	role: Role,
	discordId: t.string().optional(),
	avatarCharacterName: t.string()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/userIdentity.ts
/**
* Maps SpacetimeDB identities (per-device) to persistent User IDs (many-to-one).
* Each device/browser generates a unique identity; this table links them all
* back to a single User record.
*/
const UserIdentity = table({
	name: "user_identity",
	public: true,
	indexes: [{
		name: "user_identity_user_id",
		accessor: "user_identity_user_id",
		algorithm: "btree",
		columns: ["userId"]
	}]
}, {
	identity: t.identity().primaryKey(),
	userId: t.u32(),
	lastSeenAt: t.timestamp()
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrCharacter.ts
const HsrCharacter = table({
	name: "hsr_character",
	public: true,
	indexes: [
		{
			name: "character_by_path",
			accessor: "character_by_path",
			algorithm: "btree",
			columns: ["path"]
		},
		{
			name: "character_by_element",
			accessor: "character_by_element",
			algorithm: "btree",
			columns: ["element"]
		},
		{
			name: "character_by_role",
			accessor: "character_by_role",
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
		accessor: "lightcone_by_path",
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
	userId: t.u32(),
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
		accessor: "synergy_source_mode",
		algorithm: "btree",
		columns: ["sourceName", "gameMode"]
	}, {
		name: "synergy_target",
		accessor: "synergy_target",
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
		name: "lobby_host",
		accessor: "lobby_host",
		algorithm: "btree",
		columns: ["hostUserId"]
	}]
}, {
	id: t.u32().primaryKey().autoInc(),
	joinCode: t.string().unique(),
	hostUserId: t.u32(),
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
	primaryKey: ["lobbyId", "userId"],
	indexes: [{
		name: "lobby_member_lobby_id",
		accessor: "lobby_member_lobby_id",
		algorithm: "btree",
		columns: ["lobbyId"]
	}]
}, {
	lobbyId: t.u32(),
	userId: t.u32(),
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
	senderUserId: t.u32(),
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
		accessor: "match_history_lobby",
		algorithm: "btree",
		columns: ["lobbyId"]
	}]
}, {
	id: t.u32().primaryKey().autoInc(),
	lobbyId: t.u32(),
	sequence: t.u32(),
	actorUserId: t.u32(),
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
		accessor: "history_played_at",
		algorithm: "btree",
		columns: ["playedAt"]
	}, {
		name: "history_game_mode",
		accessor: "history_game_mode",
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
	UserIdentity,
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
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/reducers/cursor.ts
const broadcast_cursor = spacetimedb.reducer({
	lobbyId: t.u32(),
	x: t.f32(),
	y: t.f32()
}, (ctx, { lobbyId, x, y }) => {
	const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
	if (!mapping) return;
	if (!ctx.db.LobbyMember.primaryKey.find({
		lobbyId,
		userId: mapping.userId
	})) return;
	ctx.db.LobbyCursorEvent.insert({
		lobbyId,
		senderUserId: mapping.userId,
		x,
		y,
		timestamp: ctx.timestamp
	});
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/reducers/auth.ts
/**
* Helper: resolve ctx.sender → UserIdentity → User.
* Returns { mapping, user } or null if identity is not linked.
*/
function resolveUser(ctx) {
	const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
	if (!mapping) return null;
	const user = ctx.db.User.id.find(mapping.userId);
	if (!user) return null;
	return {
		mapping,
		user
	};
}
/**
* Login as a guest user.
* - If identity already linked → update lastLoginAt (no-op).
* - Otherwise → create a new User + UserIdentity mapping.
*/
const login_as_guest = spacetimedb.reducer((ctx) => {
	const resolved = resolveUser(ctx);
	if (resolved) {
		ctx.db.User.id.update({
			...resolved.user,
			lastLoginAt: ctx.timestamp
		});
		ctx.db.UserIdentity.identity.update({
			...resolved.mapping,
			lastSeenAt: ctx.timestamp
		});
		return;
	}
	const guestUsername = `Guest_${ctx.sender.toHexString().slice(0, 8)}`;
	const newUser = ctx.db.User.insert({
		id: 0,
		username: guestUsername,
		displayName: guestUsername,
		isGuest: true,
		lastLoginAt: ctx.timestamp,
		role: { tag: "User" },
		discordId: void 0,
		avatarCharacterName: "march7th"
	});
	ctx.db.UserIdentity.insert({
		identity: ctx.sender,
		userId: newUser.id,
		lastSeenAt: ctx.timestamp
	});
});
/**
* Helper: delete a guest User if no identities remain linked to it.
*/
function cleanupOrphanedGuest(ctx, guestUserId) {
	if ([...ctx.db.UserIdentity.user_identity_user_id.filter(guestUserId)].length === 0) ctx.db.User.id.delete(guestUserId);
}
/**
* Register/link a Discord account.
*
* Case 1a: Identity linked to a user that already owns this discordId → refresh login.
* Case 1b: Identity linked to a guest, but another user owns this discordId →
*           re-point identity to the existing Discord user, delete orphaned guest.
* Case 1c: Identity linked to a guest, discordId not taken → upgrade guest in-place.
* Case 2:  Identity NOT linked, but a User with this discordId exists →
*           link this identity to that existing user (cross-device login).
* Case 3:  Neither → create a new verified user + link identity.
*/
const register_discord_user = spacetimedb.reducer({
	discordId: t.string(),
	discordUsername: t.string()
}, (ctx, { discordId, discordUsername }) => {
	if (!discordId || discordId.length === 0) throw new SenderError("discordId is required");
	if (!discordUsername || discordUsername.length === 0) throw new SenderError("discordUsername is required");
	const existingByDiscord = [...ctx.db.User.user_discord_id.filter(discordId)];
	const discordOwner = existingByDiscord.length > 0 ? existingByDiscord[0] : null;
	const resolved = resolveUser(ctx);
	if (resolved) {
		if (discordOwner && discordOwner.id !== resolved.user.id) {
			const oldGuestId = resolved.user.id;
			const wasGuest = resolved.user.isGuest;
			ctx.db.UserIdentity.identity.update({
				identity: ctx.sender,
				userId: discordOwner.id,
				lastSeenAt: ctx.timestamp
			});
			ctx.db.User.id.update({
				...discordOwner,
				lastLoginAt: ctx.timestamp
			});
			if (wasGuest) cleanupOrphanedGuest(ctx, oldGuestId);
			return;
		}
		ctx.db.User.id.update({
			...resolved.user,
			username: resolved.user.isGuest ? discordUsername : resolved.user.username,
			displayName: resolved.user.isGuest ? discordUsername : resolved.user.displayName,
			isGuest: false,
			discordId,
			lastLoginAt: ctx.timestamp
		});
		ctx.db.UserIdentity.identity.update({
			...resolved.mapping,
			lastSeenAt: ctx.timestamp
		});
		return;
	}
	if (discordOwner) {
		ctx.db.UserIdentity.insert({
			identity: ctx.sender,
			userId: discordOwner.id,
			lastSeenAt: ctx.timestamp
		});
		ctx.db.User.id.update({
			...discordOwner,
			lastLoginAt: ctx.timestamp
		});
		return;
	}
	const newUser = ctx.db.User.insert({
		id: 0,
		username: discordUsername,
		displayName: discordUsername,
		isGuest: false,
		lastLoginAt: ctx.timestamp,
		role: { tag: "User" },
		discordId,
		avatarCharacterName: "march7th"
	});
	ctx.db.UserIdentity.insert({
		identity: ctx.sender,
		userId: newUser.id,
		lastSeenAt: ctx.timestamp
	});
});
/**
* Delete a guest account permanently.
* Only works for guest users (no Discord linked).
* Removes the UserIdentity mapping and the User row.
*/
const delete_guest_account = spacetimedb.reducer((ctx) => {
	const resolved = resolveUser(ctx);
	if (!resolved) throw new SenderError("No account found for this identity.");
	if (!resolved.user.isGuest) throw new SenderError("Only guest accounts can be deleted this way. Verified accounts persist across devices.");
	ctx.db.UserIdentity.identity.delete(ctx.sender);
	if ([...ctx.db.UserIdentity.user_identity_user_id.filter(resolved.user.id)].length === 0) ctx.db.User.id.delete(resolved.user.id);
});
/**
* Update the caller's display name.
* Only non-empty strings are accepted. Max 32 characters.
*/
const update_display_name = spacetimedb.reducer({ newDisplayName: t.string() }, (ctx, { newDisplayName }) => {
	const trimmed = newDisplayName.trim();
	if (trimmed.length === 0) throw new SenderError("Display name cannot be empty");
	if (trimmed.length > 32) throw new SenderError("Display name must be 32 characters or fewer");
	const resolved = resolveUser(ctx);
	if (!resolved) throw new SenderError("User not found — login first");
	ctx.db.User.id.update({
		...resolved.user,
		displayName: trimmed
	});
});
/**
* Update the caller's username.
* Only verified (non-guest) users with a linked Discord can change their username.
* Uniqueness is enforced by the database constraint.
*/
const update_username = spacetimedb.reducer({ newUsername: t.string() }, (ctx, { newUsername }) => {
	const trimmed = newUsername.trim();
	if (trimmed.length === 0) throw new SenderError("Username cannot be empty");
	if (trimmed.length > 32) throw new SenderError("Username must be 32 characters or fewer");
	const resolved = resolveUser(ctx);
	if (!resolved) throw new SenderError("User not found — login first");
	if (resolved.user.isGuest) throw new SenderError("Guest users cannot change their username. Link your Discord account first.");
	ctx.db.User.id.update({
		...resolved.user,
		username: trimmed
	});
});
/**
* Update the caller's avatar character.
* The characterName should reference an existing HsrCharacter name.
*/
const update_avatar = spacetimedb.reducer({ characterName: t.string() }, (ctx, { characterName }) => {
	const resolved = resolveUser(ctx);
	if (!resolved) throw new SenderError("User not found — login first");
	ctx.db.User.id.update({
		...resolved.user,
		avatarCharacterName: characterName
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
export { broadcast_cursor, src_default as default, delete_guest_account, login_as_guest, register_discord_user, update_avatar, update_display_name, update_username };
//# debugId=99ba2ed4-34b8-432b-b6ef-e488448ef040
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibmFtZXMiOlsiX19jcmVhdGUiLCJfX2RlZlByb3AiLCJfX2dldE93blByb3BEZXNjIiwiX19nZXRPd25Qcm9wTmFtZXMiLCJfX2dldFByb3RvT2YiLCJfX2hhc093blByb3AiLCJfX2NvbW1vbkpTIiwiX19jb3B5UHJvcHMiLCJfX3RvRVNNIiwiI2Vuc3VyZSIsIiNtb2R1bGVEZWYiLCIjcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSIsIiNjb21wb3VuZFR5cGVzIiwiI2Zyb20iLCIjdG8iLCIjdXVpZENvdW50ZXIiLCIjc2VuZGVyQXV0aCIsIiNpZGVudGl0eSIsIiNyYW5kb20iLCIjc2NoZW1hIiwiI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVycyIsIiNkYlZpZXciLCIjZGJWaWV3XyIsIiNyZWR1Y2VyQ3R4IiwiI3JlZHVjZXJDdHhfIiwiI2ZpbmFsaXphdGlvblJlZ2lzdHJ5IiwiI2lkIiwiI2RldGFjaCIsIiNib2R5IiwiI2lubmVyIiwiI2N0eCJdLCJzb3VyY2VzIjpbIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvbm9kZV9tb2R1bGVzL2hlYWRlcnMtcG9seWZpbGwvbGliL2luZGV4Lm1qcyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvbm9kZV9tb2R1bGVzL3NwYWNldGltZWRiL2Rpc3Qvc2VydmVyL2luZGV4Lm1qcyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3R5cGVzL2VudW1zLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL3VzZXIudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90YWJsZXMvdXNlcklkZW50aXR5LnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL2hzckNoYXJhY3Rlci50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9oc3JMaWdodGNvbmUudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90eXBlcy9zdHJ1Y3RzLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL2hzckNoYXJhY3RlckNvc3QudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90YWJsZXMvaHNyTGlnaHRjb25lQ29zdC50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9oc3JTeW5lcmd5Q29zdC50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieS50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieU1lbWJlci50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieUN1cnNvckV2ZW50LnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL21hdGNoU2Vzc2lvbi50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9tYXRjaFNlc3Npb25TdGVwLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL21hdGNoU2Vzc2lvbkhpc3RvcnkudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90YWJsZXMvbWF0Y2hTZXNzaW9uU3RlcEhpc3RvcnkudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9zY2hlbWEudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9yZWR1Y2Vycy9jdXJzb3IudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9yZWR1Y2Vycy9hdXRoLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIF9fY3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcclxudmFyIF9fZGVmUHJvcCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcclxudmFyIF9fZ2V0T3duUHJvcERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xyXG52YXIgX19nZXRPd25Qcm9wTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcclxudmFyIF9fZ2V0UHJvdG9PZiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcclxudmFyIF9faGFzT3duUHJvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XHJcbnZhciBfX2NvbW1vbkpTID0gKGNiLCBtb2QpID0+IGZ1bmN0aW9uIF9fcmVxdWlyZSgpIHtcclxuICByZXR1cm4gbW9kIHx8ICgwLCBjYltfX2dldE93blByb3BOYW1lcyhjYilbMF1dKSgobW9kID0geyBleHBvcnRzOiB7fSB9KS5leHBvcnRzLCBtb2QpLCBtb2QuZXhwb3J0cztcclxufTtcclxudmFyIF9fY29weVByb3BzID0gKHRvLCBmcm9tLCBleGNlcHQsIGRlc2MpID0+IHtcclxuICBpZiAoZnJvbSAmJiB0eXBlb2YgZnJvbSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgZnJvbSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICBmb3IgKGxldCBrZXkgb2YgX19nZXRPd25Qcm9wTmFtZXMoZnJvbSkpXHJcbiAgICAgIGlmICghX19oYXNPd25Qcm9wLmNhbGwodG8sIGtleSkgJiYga2V5ICE9PSBleGNlcHQpXHJcbiAgICAgICAgX19kZWZQcm9wKHRvLCBrZXksIHsgZ2V0OiAoKSA9PiBmcm9tW2tleV0sIGVudW1lcmFibGU6ICEoZGVzYyA9IF9fZ2V0T3duUHJvcERlc2MoZnJvbSwga2V5KSkgfHwgZGVzYy5lbnVtZXJhYmxlIH0pO1xyXG4gIH1cclxuICByZXR1cm4gdG87XHJcbn07XHJcbnZhciBfX3RvRVNNID0gKG1vZCwgaXNOb2RlTW9kZSwgdGFyZ2V0KSA9PiAodGFyZ2V0ID0gbW9kICE9IG51bGwgPyBfX2NyZWF0ZShfX2dldFByb3RvT2YobW9kKSkgOiB7fSwgX19jb3B5UHJvcHMoXHJcbiAgLy8gSWYgdGhlIGltcG9ydGVyIGlzIGluIG5vZGUgY29tcGF0aWJpbGl0eSBtb2RlIG9yIHRoaXMgaXMgbm90IGFuIEVTTVxyXG4gIC8vIGZpbGUgdGhhdCBoYXMgYmVlbiBjb252ZXJ0ZWQgdG8gYSBDb21tb25KUyBmaWxlIHVzaW5nIGEgQmFiZWwtXHJcbiAgLy8gY29tcGF0aWJsZSB0cmFuc2Zvcm0gKGkuZS4gXCJfX2VzTW9kdWxlXCIgaGFzIG5vdCBiZWVuIHNldCksIHRoZW4gc2V0XHJcbiAgLy8gXCJkZWZhdWx0XCIgdG8gdGhlIENvbW1vbkpTIFwibW9kdWxlLmV4cG9ydHNcIiBmb3Igbm9kZSBjb21wYXRpYmlsaXR5LlxyXG4gIGlzTm9kZU1vZGUgfHwgIW1vZCB8fCAhbW9kLl9fZXNNb2R1bGUgPyBfX2RlZlByb3AodGFyZ2V0LCBcImRlZmF1bHRcIiwgeyB2YWx1ZTogbW9kLCBlbnVtZXJhYmxlOiB0cnVlIH0pIDogdGFyZ2V0LFxyXG4gIG1vZFxyXG4pKTtcclxuXHJcbi8vIG5vZGVfbW9kdWxlcy9zZXQtY29va2llLXBhcnNlci9saWIvc2V0LWNvb2tpZS5qc1xyXG52YXIgcmVxdWlyZV9zZXRfY29va2llID0gX19jb21tb25KUyh7XHJcbiAgXCJub2RlX21vZHVsZXMvc2V0LWNvb2tpZS1wYXJzZXIvbGliL3NldC1jb29raWUuanNcIihleHBvcnRzLCBtb2R1bGUpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgdmFyIGRlZmF1bHRQYXJzZU9wdGlvbnMgPSB7XHJcbiAgICAgIGRlY29kZVZhbHVlczogdHJ1ZSxcclxuICAgICAgbWFwOiBmYWxzZSxcclxuICAgICAgc2lsZW50OiBmYWxzZVxyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIGlzTm9uRW1wdHlTdHJpbmcoc3RyKSB7XHJcbiAgICAgIHJldHVybiB0eXBlb2Ygc3RyID09PSBcInN0cmluZ1wiICYmICEhc3RyLnRyaW0oKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHBhcnNlU3RyaW5nKHNldENvb2tpZVZhbHVlLCBvcHRpb25zKSB7XHJcbiAgICAgIHZhciBwYXJ0cyA9IHNldENvb2tpZVZhbHVlLnNwbGl0KFwiO1wiKS5maWx0ZXIoaXNOb25FbXB0eVN0cmluZyk7XHJcbiAgICAgIHZhciBuYW1lVmFsdWVQYWlyU3RyID0gcGFydHMuc2hpZnQoKTtcclxuICAgICAgdmFyIHBhcnNlZCA9IHBhcnNlTmFtZVZhbHVlUGFpcihuYW1lVmFsdWVQYWlyU3RyKTtcclxuICAgICAgdmFyIG5hbWUgPSBwYXJzZWQubmFtZTtcclxuICAgICAgdmFyIHZhbHVlID0gcGFyc2VkLnZhbHVlO1xyXG4gICAgICBvcHRpb25zID0gb3B0aW9ucyA/IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQYXJzZU9wdGlvbnMsIG9wdGlvbnMpIDogZGVmYXVsdFBhcnNlT3B0aW9ucztcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB2YWx1ZSA9IG9wdGlvbnMuZGVjb2RlVmFsdWVzID8gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSA6IHZhbHVlO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcclxuICAgICAgICAgIFwic2V0LWNvb2tpZS1wYXJzZXIgZW5jb3VudGVyZWQgYW4gZXJyb3Igd2hpbGUgZGVjb2RpbmcgYSBjb29raWUgd2l0aCB2YWx1ZSAnXCIgKyB2YWx1ZSArIFwiJy4gU2V0IG9wdGlvbnMuZGVjb2RlVmFsdWVzIHRvIGZhbHNlIHRvIGRpc2FibGUgdGhpcyBmZWF0dXJlLlwiLFxyXG4gICAgICAgICAgZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGNvb2tpZSA9IHtcclxuICAgICAgICBuYW1lLFxyXG4gICAgICAgIHZhbHVlXHJcbiAgICAgIH07XHJcbiAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24ocGFydCkge1xyXG4gICAgICAgIHZhciBzaWRlcyA9IHBhcnQuc3BsaXQoXCI9XCIpO1xyXG4gICAgICAgIHZhciBrZXkgPSBzaWRlcy5zaGlmdCgpLnRyaW1MZWZ0KCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB2YXIgdmFsdWUyID0gc2lkZXMuam9pbihcIj1cIik7XHJcbiAgICAgICAgaWYgKGtleSA9PT0gXCJleHBpcmVzXCIpIHtcclxuICAgICAgICAgIGNvb2tpZS5leHBpcmVzID0gbmV3IERhdGUodmFsdWUyKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJtYXgtYWdlXCIpIHtcclxuICAgICAgICAgIGNvb2tpZS5tYXhBZ2UgPSBwYXJzZUludCh2YWx1ZTIsIDEwKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzZWN1cmVcIikge1xyXG4gICAgICAgICAgY29va2llLnNlY3VyZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwiaHR0cG9ubHlcIikge1xyXG4gICAgICAgICAgY29va2llLmh0dHBPbmx5ID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzYW1lc2l0ZVwiKSB7XHJcbiAgICAgICAgICBjb29raWUuc2FtZVNpdGUgPSB2YWx1ZTI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvb2tpZVtrZXldID0gdmFsdWUyO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBjb29raWU7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBwYXJzZU5hbWVWYWx1ZVBhaXIobmFtZVZhbHVlUGFpclN0cikge1xyXG4gICAgICB2YXIgbmFtZSA9IFwiXCI7XHJcbiAgICAgIHZhciB2YWx1ZSA9IFwiXCI7XHJcbiAgICAgIHZhciBuYW1lVmFsdWVBcnIgPSBuYW1lVmFsdWVQYWlyU3RyLnNwbGl0KFwiPVwiKTtcclxuICAgICAgaWYgKG5hbWVWYWx1ZUFyci5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgbmFtZSA9IG5hbWVWYWx1ZUFyci5zaGlmdCgpO1xyXG4gICAgICAgIHZhbHVlID0gbmFtZVZhbHVlQXJyLmpvaW4oXCI9XCIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhbHVlID0gbmFtZVZhbHVlUGFpclN0cjtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4geyBuYW1lLCB2YWx1ZSB9O1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcGFyc2UoaW5wdXQsIG9wdGlvbnMpIHtcclxuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UGFyc2VPcHRpb25zLCBvcHRpb25zKSA6IGRlZmF1bHRQYXJzZU9wdGlvbnM7XHJcbiAgICAgIGlmICghaW5wdXQpIHtcclxuICAgICAgICBpZiAoIW9wdGlvbnMubWFwKSB7XHJcbiAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiB7fTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlucHV0LmhlYWRlcnMpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGlucHV0LmhlYWRlcnMuZ2V0U2V0Q29va2llID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgIGlucHV0ID0gaW5wdXQuaGVhZGVycy5nZXRTZXRDb29raWUoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGlucHV0LmhlYWRlcnNbXCJzZXQtY29va2llXCJdKSB7XHJcbiAgICAgICAgICBpbnB1dCA9IGlucHV0LmhlYWRlcnNbXCJzZXQtY29va2llXCJdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgc2NoID0gaW5wdXQuaGVhZGVyc1tPYmplY3Qua2V5cyhpbnB1dC5oZWFkZXJzKS5maW5kKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICByZXR1cm4ga2V5LnRvTG93ZXJDYXNlKCkgPT09IFwic2V0LWNvb2tpZVwiO1xyXG4gICAgICAgICAgfSldO1xyXG4gICAgICAgICAgaWYgKCFzY2ggJiYgaW5wdXQuaGVhZGVycy5jb29raWUgJiYgIW9wdGlvbnMuc2lsZW50KSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICAgICAgICBcIldhcm5pbmc6IHNldC1jb29raWUtcGFyc2VyIGFwcGVhcnMgdG8gaGF2ZSBiZWVuIGNhbGxlZCBvbiBhIHJlcXVlc3Qgb2JqZWN0LiBJdCBpcyBkZXNpZ25lZCB0byBwYXJzZSBTZXQtQ29va2llIGhlYWRlcnMgZnJvbSByZXNwb25zZXMsIG5vdCBDb29raWUgaGVhZGVycyBmcm9tIHJlcXVlc3RzLiBTZXQgdGhlIG9wdGlvbiB7c2lsZW50OiB0cnVlfSB0byBzdXBwcmVzcyB0aGlzIHdhcm5pbmcuXCJcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlucHV0ID0gc2NoO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoaW5wdXQpKSB7XHJcbiAgICAgICAgaW5wdXQgPSBbaW5wdXRdO1xyXG4gICAgICB9XHJcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdFBhcnNlT3B0aW9ucywgb3B0aW9ucykgOiBkZWZhdWx0UGFyc2VPcHRpb25zO1xyXG4gICAgICBpZiAoIW9wdGlvbnMubWFwKSB7XHJcbiAgICAgICAgcmV0dXJuIGlucHV0LmZpbHRlcihpc05vbkVtcHR5U3RyaW5nKS5tYXAoZnVuY3Rpb24oc3RyKSB7XHJcbiAgICAgICAgICByZXR1cm4gcGFyc2VTdHJpbmcoc3RyLCBvcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YXIgY29va2llcyA9IHt9O1xyXG4gICAgICAgIHJldHVybiBpbnB1dC5maWx0ZXIoaXNOb25FbXB0eVN0cmluZykucmVkdWNlKGZ1bmN0aW9uKGNvb2tpZXMyLCBzdHIpIHtcclxuICAgICAgICAgIHZhciBjb29raWUgPSBwYXJzZVN0cmluZyhzdHIsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgY29va2llczJbY29va2llLm5hbWVdID0gY29va2llO1xyXG4gICAgICAgICAgcmV0dXJuIGNvb2tpZXMyO1xyXG4gICAgICAgIH0sIGNvb2tpZXMpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBzcGxpdENvb2tpZXNTdHJpbmcyKGNvb2tpZXNTdHJpbmcpIHtcclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY29va2llc1N0cmluZykpIHtcclxuICAgICAgICByZXR1cm4gY29va2llc1N0cmluZztcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIGNvb2tpZXNTdHJpbmcgIT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGNvb2tpZXNTdHJpbmdzID0gW107XHJcbiAgICAgIHZhciBwb3MgPSAwO1xyXG4gICAgICB2YXIgc3RhcnQ7XHJcbiAgICAgIHZhciBjaDtcclxuICAgICAgdmFyIGxhc3RDb21tYTtcclxuICAgICAgdmFyIG5leHRTdGFydDtcclxuICAgICAgdmFyIGNvb2tpZXNTZXBhcmF0b3JGb3VuZDtcclxuICAgICAgZnVuY3Rpb24gc2tpcFdoaXRlc3BhY2UoKSB7XHJcbiAgICAgICAgd2hpbGUgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoICYmIC9cXHMvLnRlc3QoY29va2llc1N0cmluZy5jaGFyQXQocG9zKSkpIHtcclxuICAgICAgICAgIHBvcyArPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcG9zIDwgY29va2llc1N0cmluZy5sZW5ndGg7XHJcbiAgICAgIH1cclxuICAgICAgZnVuY3Rpb24gbm90U3BlY2lhbENoYXIoKSB7XHJcbiAgICAgICAgY2ggPSBjb29raWVzU3RyaW5nLmNoYXJBdChwb3MpO1xyXG4gICAgICAgIHJldHVybiBjaCAhPT0gXCI9XCIgJiYgY2ggIT09IFwiO1wiICYmIGNoICE9PSBcIixcIjtcclxuICAgICAgfVxyXG4gICAgICB3aGlsZSAocG9zIDwgY29va2llc1N0cmluZy5sZW5ndGgpIHtcclxuICAgICAgICBzdGFydCA9IHBvcztcclxuICAgICAgICBjb29raWVzU2VwYXJhdG9yRm91bmQgPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAoc2tpcFdoaXRlc3BhY2UoKSkge1xyXG4gICAgICAgICAgY2ggPSBjb29raWVzU3RyaW5nLmNoYXJBdChwb3MpO1xyXG4gICAgICAgICAgaWYgKGNoID09PSBcIixcIikge1xyXG4gICAgICAgICAgICBsYXN0Q29tbWEgPSBwb3M7XHJcbiAgICAgICAgICAgIHBvcyArPSAxO1xyXG4gICAgICAgICAgICBza2lwV2hpdGVzcGFjZSgpO1xyXG4gICAgICAgICAgICBuZXh0U3RhcnQgPSBwb3M7XHJcbiAgICAgICAgICAgIHdoaWxlIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCAmJiBub3RTcGVjaWFsQ2hhcigpKSB7XHJcbiAgICAgICAgICAgICAgcG9zICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoICYmIGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcykgPT09IFwiPVwiKSB7XHJcbiAgICAgICAgICAgICAgY29va2llc1NlcGFyYXRvckZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBwb3MgPSBuZXh0U3RhcnQ7XHJcbiAgICAgICAgICAgICAgY29va2llc1N0cmluZ3MucHVzaChjb29raWVzU3RyaW5nLnN1YnN0cmluZyhzdGFydCwgbGFzdENvbW1hKSk7XHJcbiAgICAgICAgICAgICAgc3RhcnQgPSBwb3M7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcG9zID0gbGFzdENvbW1hICsgMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcG9zICs9IDE7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghY29va2llc1NlcGFyYXRvckZvdW5kIHx8IHBvcyA+PSBjb29raWVzU3RyaW5nLmxlbmd0aCkge1xyXG4gICAgICAgICAgY29va2llc1N0cmluZ3MucHVzaChjb29raWVzU3RyaW5nLnN1YnN0cmluZyhzdGFydCwgY29va2llc1N0cmluZy5sZW5ndGgpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNvb2tpZXNTdHJpbmdzO1xyXG4gICAgfVxyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBwYXJzZTtcclxuICAgIG1vZHVsZS5leHBvcnRzLnBhcnNlID0gcGFyc2U7XHJcbiAgICBtb2R1bGUuZXhwb3J0cy5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xyXG4gICAgbW9kdWxlLmV4cG9ydHMuc3BsaXRDb29raWVzU3RyaW5nID0gc3BsaXRDb29raWVzU3RyaW5nMjtcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gc3JjL0hlYWRlcnMudHNcclxudmFyIGltcG9ydF9zZXRfY29va2llX3BhcnNlciA9IF9fdG9FU00ocmVxdWlyZV9zZXRfY29va2llKCkpO1xyXG5cclxuLy8gc3JjL3V0aWxzL25vcm1hbGl6ZUhlYWRlck5hbWUudHNcclxudmFyIEhFQURFUlNfSU5WQUxJRF9DSEFSQUNURVJTID0gL1teYS16MC05XFwtIyQlJicqKy5eX2B8fl0vaTtcclxuZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKSB7XHJcbiAgaWYgKEhFQURFUlNfSU5WQUxJRF9DSEFSQUNURVJTLnRlc3QobmFtZSkgfHwgbmFtZS50cmltKCkgPT09IFwiXCIpIHtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZVwiKTtcclxuICB9XHJcbiAgcmV0dXJuIG5hbWUudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbn1cclxuXHJcbi8vIHNyYy91dGlscy9ub3JtYWxpemVIZWFkZXJWYWx1ZS50c1xyXG52YXIgY2hhckNvZGVzVG9SZW1vdmUgPSBbXHJcbiAgU3RyaW5nLmZyb21DaGFyQ29kZSgxMCksXHJcbiAgU3RyaW5nLmZyb21DaGFyQ29kZSgxMyksXHJcbiAgU3RyaW5nLmZyb21DaGFyQ29kZSg5KSxcclxuICBTdHJpbmcuZnJvbUNoYXJDb2RlKDMyKVxyXG5dO1xyXG52YXIgSEVBREVSX1ZBTFVFX1JFTU9WRV9SRUdFWFAgPSBuZXcgUmVnRXhwKFxyXG4gIGAoXlske2NoYXJDb2Rlc1RvUmVtb3ZlLmpvaW4oXCJcIil9XXwkWyR7Y2hhckNvZGVzVG9SZW1vdmUuam9pbihcIlwiKX1dKWAsXHJcbiAgXCJnXCJcclxuKTtcclxuZnVuY3Rpb24gbm9ybWFsaXplSGVhZGVyVmFsdWUodmFsdWUpIHtcclxuICBjb25zdCBuZXh0VmFsdWUgPSB2YWx1ZS5yZXBsYWNlKEhFQURFUl9WQUxVRV9SRU1PVkVfUkVHRVhQLCBcIlwiKTtcclxuICByZXR1cm4gbmV4dFZhbHVlO1xyXG59XHJcblxyXG4vLyBzcmMvdXRpbHMvaXNWYWxpZEhlYWRlck5hbWUudHNcclxuZnVuY3Rpb24gaXNWYWxpZEhlYWRlck5hbWUodmFsdWUpIHtcclxuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGlmICh2YWx1ZS5sZW5ndGggPT09IDApIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY2hhcmFjdGVyID0gdmFsdWUuY2hhckNvZGVBdChpKTtcclxuICAgIGlmIChjaGFyYWN0ZXIgPiAxMjcgfHwgIWlzVG9rZW4oY2hhcmFjdGVyKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcbmZ1bmN0aW9uIGlzVG9rZW4odmFsdWUpIHtcclxuICByZXR1cm4gIVtcclxuICAgIDEyNyxcclxuICAgIDMyLFxyXG4gICAgXCIoXCIsXHJcbiAgICBcIilcIixcclxuICAgIFwiPFwiLFxyXG4gICAgXCI+XCIsXHJcbiAgICBcIkBcIixcclxuICAgIFwiLFwiLFxyXG4gICAgXCI7XCIsXHJcbiAgICBcIjpcIixcclxuICAgIFwiXFxcXFwiLFxyXG4gICAgJ1wiJyxcclxuICAgIFwiL1wiLFxyXG4gICAgXCJbXCIsXHJcbiAgICBcIl1cIixcclxuICAgIFwiP1wiLFxyXG4gICAgXCI9XCIsXHJcbiAgICBcIntcIixcclxuICAgIFwifVwiXHJcbiAgXS5pbmNsdWRlcyh2YWx1ZSk7XHJcbn1cclxuXHJcbi8vIHNyYy91dGlscy9pc1ZhbGlkSGVhZGVyVmFsdWUudHNcclxuZnVuY3Rpb24gaXNWYWxpZEhlYWRlclZhbHVlKHZhbHVlKSB7XHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBpZiAodmFsdWUudHJpbSgpICE9PSB2YWx1ZSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjb25zdCBjaGFyYWN0ZXIgPSB2YWx1ZS5jaGFyQ29kZUF0KGkpO1xyXG4gICAgaWYgKFxyXG4gICAgICAvLyBOVUwuXHJcbiAgICAgIGNoYXJhY3RlciA9PT0gMCB8fCAvLyBIVFRQIG5ld2xpbmUgYnl0ZXMuXHJcbiAgICAgIGNoYXJhY3RlciA9PT0gMTAgfHwgY2hhcmFjdGVyID09PSAxM1xyXG4gICAgKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbi8vIHNyYy9IZWFkZXJzLnRzXHJcbnZhciBOT1JNQUxJWkVEX0hFQURFUlMgPSBTeW1ib2woXCJub3JtYWxpemVkSGVhZGVyc1wiKTtcclxudmFyIFJBV19IRUFERVJfTkFNRVMgPSBTeW1ib2woXCJyYXdIZWFkZXJOYW1lc1wiKTtcclxudmFyIEhFQURFUl9WQUxVRV9ERUxJTUlURVIgPSBcIiwgXCI7XHJcbnZhciBfYSwgX2IsIF9jO1xyXG52YXIgSGVhZGVycyA9IGNsYXNzIF9IZWFkZXJzIHtcclxuICBjb25zdHJ1Y3Rvcihpbml0KSB7XHJcbiAgICAvLyBOb3JtYWxpemVkIGhlYWRlciB7XCJuYW1lXCI6XCJhLCBiXCJ9IHN0b3JhZ2UuXHJcbiAgICB0aGlzW19hXSA9IHt9O1xyXG4gICAgLy8gS2VlcHMgdGhlIG1hcHBpbmcgYmV0d2VlbiB0aGUgcmF3IGhlYWRlciBuYW1lXHJcbiAgICAvLyBhbmQgdGhlIG5vcm1hbGl6ZWQgaGVhZGVyIG5hbWUgdG8gZWFzZSB0aGUgbG9va3VwLlxyXG4gICAgdGhpc1tfYl0gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xyXG4gICAgdGhpc1tfY10gPSBcIkhlYWRlcnNcIjtcclxuICAgIGlmIChbXCJIZWFkZXJzXCIsIFwiSGVhZGVyc1BvbHlmaWxsXCJdLmluY2x1ZGVzKGluaXQ/LmNvbnN0cnVjdG9yLm5hbWUpIHx8IGluaXQgaW5zdGFuY2VvZiBfSGVhZGVycyB8fCB0eXBlb2YgZ2xvYmFsVGhpcy5IZWFkZXJzICE9PSBcInVuZGVmaW5lZFwiICYmIGluaXQgaW5zdGFuY2VvZiBnbG9iYWxUaGlzLkhlYWRlcnMpIHtcclxuICAgICAgY29uc3QgaW5pdGlhbEhlYWRlcnMgPSBpbml0O1xyXG4gICAgICBpbml0aWFsSGVhZGVycy5mb3JFYWNoKCh2YWx1ZSwgbmFtZSkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKTtcclxuICAgICAgfSwgdGhpcyk7XHJcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoaW5pdCkpIHtcclxuICAgICAgaW5pdC5mb3JFYWNoKChbbmFtZSwgdmFsdWVdKSA9PiB7XHJcbiAgICAgICAgdGhpcy5hcHBlbmQoXHJcbiAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZS5qb2luKEhFQURFUl9WQUxVRV9ERUxJTUlURVIpIDogdmFsdWVcclxuICAgICAgICApO1xyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSBpZiAoaW5pdCkge1xyXG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhpbml0KS5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdmFsdWUgPSBpbml0W25hbWVdO1xyXG4gICAgICAgIHRoaXMuYXBwZW5kKFxyXG4gICAgICAgICAgbmFtZSxcclxuICAgICAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUuam9pbihIRUFERVJfVkFMVUVfREVMSU1JVEVSKSA6IHZhbHVlXHJcbiAgICAgICAgKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFsoX2EgPSBOT1JNQUxJWkVEX0hFQURFUlMsIF9iID0gUkFXX0hFQURFUl9OQU1FUywgX2MgPSBTeW1ib2wudG9TdHJpbmdUYWcsIFN5bWJvbC5pdGVyYXRvcildKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZW50cmllcygpO1xyXG4gIH1cclxuICAqa2V5cygpIHtcclxuICAgIGZvciAoY29uc3QgW25hbWVdIG9mIHRoaXMuZW50cmllcygpKSB7XHJcbiAgICAgIHlpZWxkIG5hbWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gICp2YWx1ZXMoKSB7XHJcbiAgICBmb3IgKGNvbnN0IFssIHZhbHVlXSBvZiB0aGlzLmVudHJpZXMoKSkge1xyXG4gICAgICB5aWVsZCB2YWx1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgKmVudHJpZXMoKSB7XHJcbiAgICBsZXQgc29ydGVkS2V5cyA9IE9iamVjdC5rZXlzKHRoaXNbTk9STUFMSVpFRF9IRUFERVJTXSkuc29ydChcclxuICAgICAgKGEsIGIpID0+IGEubG9jYWxlQ29tcGFyZShiKVxyXG4gICAgKTtcclxuICAgIGZvciAoY29uc3QgbmFtZSBvZiBzb3J0ZWRLZXlzKSB7XHJcbiAgICAgIGlmIChuYW1lID09PSBcInNldC1jb29raWVcIikge1xyXG4gICAgICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdGhpcy5nZXRTZXRDb29raWUoKSkge1xyXG4gICAgICAgICAgeWllbGQgW25hbWUsIHZhbHVlXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgeWllbGQgW25hbWUsIHRoaXMuZ2V0KG5hbWUpXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICAvKipcclxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBzdGF0aW5nIHdoZXRoZXIgYSBgSGVhZGVyc2Agb2JqZWN0IGNvbnRhaW5zIGEgY2VydGFpbiBoZWFkZXIuXHJcbiAgICovXHJcbiAgaGFzKG5hbWUpIHtcclxuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBoZWFkZXIgbmFtZSBcIiR7bmFtZX1cImApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXNbTk9STUFMSVpFRF9IRUFERVJTXS5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGBCeXRlU3RyaW5nYCBzZXF1ZW5jZSBvZiBhbGwgdGhlIHZhbHVlcyBvZiBhIGhlYWRlciB3aXRoIGEgZ2l2ZW4gbmFtZS5cclxuICAgKi9cclxuICBnZXQobmFtZSkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGVhZGVyTmFtZShuYW1lKSkge1xyXG4gICAgICB0aHJvdyBUeXBlRXJyb3IoYEludmFsaWQgaGVhZGVyIG5hbWUgXCIke25hbWV9XCJgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzW05PUk1BTElaRURfSEVBREVSU11bbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKV0gPz8gbnVsbDtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogU2V0cyBhIG5ldyB2YWx1ZSBmb3IgYW4gZXhpc3RpbmcgaGVhZGVyIGluc2lkZSBhIGBIZWFkZXJzYCBvYmplY3QsIG9yIGFkZHMgdGhlIGhlYWRlciBpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LlxyXG4gICAqL1xyXG4gIHNldChuYW1lLCB2YWx1ZSkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGVhZGVyTmFtZShuYW1lKSB8fCAhaXNWYWxpZEhlYWRlclZhbHVlKHZhbHVlKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IG5vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSk7XHJcbiAgICBjb25zdCBub3JtYWxpemVkVmFsdWUgPSBub3JtYWxpemVIZWFkZXJWYWx1ZSh2YWx1ZSk7XHJcbiAgICB0aGlzW05PUk1BTElaRURfSEVBREVSU11bbm9ybWFsaXplZE5hbWVdID0gbm9ybWFsaXplSGVhZGVyVmFsdWUobm9ybWFsaXplZFZhbHVlKTtcclxuICAgIHRoaXNbUkFXX0hFQURFUl9OQU1FU10uc2V0KG5vcm1hbGl6ZWROYW1lLCBuYW1lKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogQXBwZW5kcyBhIG5ldyB2YWx1ZSBvbnRvIGFuIGV4aXN0aW5nIGhlYWRlciBpbnNpZGUgYSBgSGVhZGVyc2Agb2JqZWN0LCBvciBhZGRzIHRoZSBoZWFkZXIgaWYgaXQgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cclxuICAgKi9cclxuICBhcHBlbmQobmFtZSwgdmFsdWUpIHtcclxuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkgfHwgIWlzVmFsaWRIZWFkZXJWYWx1ZSh2YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpO1xyXG4gICAgY29uc3Qgbm9ybWFsaXplZFZhbHVlID0gbm9ybWFsaXplSGVhZGVyVmFsdWUodmFsdWUpO1xyXG4gICAgbGV0IHJlc29sdmVkVmFsdWUgPSB0aGlzLmhhcyhub3JtYWxpemVkTmFtZSkgPyBgJHt0aGlzLmdldChub3JtYWxpemVkTmFtZSl9LCAke25vcm1hbGl6ZWRWYWx1ZX1gIDogbm9ybWFsaXplZFZhbHVlO1xyXG4gICAgdGhpcy5zZXQobmFtZSwgcmVzb2x2ZWRWYWx1ZSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIERlbGV0ZXMgYSBoZWFkZXIgZnJvbSB0aGUgYEhlYWRlcnNgIG9iamVjdC5cclxuICAgKi9cclxuICBkZWxldGUobmFtZSkge1xyXG4gICAgaWYgKCFpc1ZhbGlkSGVhZGVyTmFtZShuYW1lKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBpZiAoIXRoaXMuaGFzKG5hbWUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IG5vcm1hbGl6ZWROYW1lID0gbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKTtcclxuICAgIGRlbGV0ZSB0aGlzW05PUk1BTElaRURfSEVBREVSU11bbm9ybWFsaXplZE5hbWVdO1xyXG4gICAgdGhpc1tSQVdfSEVBREVSX05BTUVTXS5kZWxldGUobm9ybWFsaXplZE5hbWUpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBUcmF2ZXJzZXMgdGhlIGBIZWFkZXJzYCBvYmplY3QsXHJcbiAgICogY2FsbGluZyB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGVhY2ggaGVhZGVyLlxyXG4gICAqL1xyXG4gIGZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpIHtcclxuICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiB0aGlzLmVudHJpZXMoKSkge1xyXG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBuYW1lLCB0aGlzKTtcclxuICAgIH1cclxuICB9XHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSB2YWx1ZXNcclxuICAgKiBvZiBhbGwgU2V0LUNvb2tpZSBoZWFkZXJzIGFzc29jaWF0ZWRcclxuICAgKiB3aXRoIGEgcmVzcG9uc2VcclxuICAgKi9cclxuICBnZXRTZXRDb29raWUoKSB7XHJcbiAgICBjb25zdCBzZXRDb29raWVIZWFkZXIgPSB0aGlzLmdldChcInNldC1jb29raWVcIik7XHJcbiAgICBpZiAoc2V0Q29va2llSGVhZGVyID09PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIGlmIChzZXRDb29raWVIZWFkZXIgPT09IFwiXCIpIHtcclxuICAgICAgcmV0dXJuIFtcIlwiXTtcclxuICAgIH1cclxuICAgIHJldHVybiAoMCwgaW1wb3J0X3NldF9jb29raWVfcGFyc2VyLnNwbGl0Q29va2llc1N0cmluZykoc2V0Q29va2llSGVhZGVyKTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvZ2V0UmF3SGVhZGVycy50c1xyXG5mdW5jdGlvbiBnZXRSYXdIZWFkZXJzKGhlYWRlcnMpIHtcclxuICBjb25zdCByYXdIZWFkZXJzID0ge307XHJcbiAgZm9yIChjb25zdCBbbmFtZSwgdmFsdWVdIG9mIGhlYWRlcnMuZW50cmllcygpKSB7XHJcbiAgICByYXdIZWFkZXJzW2hlYWRlcnNbUkFXX0hFQURFUl9OQU1FU10uZ2V0KG5hbWUpXSA9IHZhbHVlO1xyXG4gIH1cclxuICByZXR1cm4gcmF3SGVhZGVycztcclxufVxyXG5cclxuLy8gc3JjL3RyYW5zZm9ybWVycy9oZWFkZXJzVG9MaXN0LnRzXHJcbmZ1bmN0aW9uIGhlYWRlcnNUb0xpc3QoaGVhZGVycykge1xyXG4gIGNvbnN0IGhlYWRlcnNMaXN0ID0gW107XHJcbiAgaGVhZGVycy5mb3JFYWNoKCh2YWx1ZSwgbmFtZSkgPT4ge1xyXG4gICAgY29uc3QgcmVzb2x2ZWRWYWx1ZSA9IHZhbHVlLmluY2x1ZGVzKFwiLFwiKSA/IHZhbHVlLnNwbGl0KFwiLFwiKS5tYXAoKHZhbHVlMikgPT4gdmFsdWUyLnRyaW0oKSkgOiB2YWx1ZTtcclxuICAgIGhlYWRlcnNMaXN0LnB1c2goW25hbWUsIHJlc29sdmVkVmFsdWVdKTtcclxuICB9KTtcclxuICByZXR1cm4gaGVhZGVyc0xpc3Q7XHJcbn1cclxuXHJcbi8vIHNyYy90cmFuc2Zvcm1lcnMvaGVhZGVyc1RvU3RyaW5nLnRzXHJcbmZ1bmN0aW9uIGhlYWRlcnNUb1N0cmluZyhoZWFkZXJzKSB7XHJcbiAgY29uc3QgbGlzdCA9IGhlYWRlcnNUb0xpc3QoaGVhZGVycyk7XHJcbiAgY29uc3QgbGluZXMgPSBsaXN0Lm1hcCgoW25hbWUsIHZhbHVlXSkgPT4ge1xyXG4gICAgY29uc3QgdmFsdWVzID0gW10uY29uY2F0KHZhbHVlKTtcclxuICAgIHJldHVybiBgJHtuYW1lfTogJHt2YWx1ZXMuam9pbihcIiwgXCIpfWA7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIGxpbmVzLmpvaW4oXCJcXHJcXG5cIik7XHJcbn1cclxuXHJcbi8vIHNyYy90cmFuc2Zvcm1lcnMvaGVhZGVyc1RvT2JqZWN0LnRzXHJcbnZhciBzaW5nbGVWYWx1ZUhlYWRlcnMgPSBbXCJ1c2VyLWFnZW50XCJdO1xyXG5mdW5jdGlvbiBoZWFkZXJzVG9PYmplY3QoaGVhZGVycykge1xyXG4gIGNvbnN0IGhlYWRlcnNPYmplY3QgPSB7fTtcclxuICBoZWFkZXJzLmZvckVhY2goKHZhbHVlLCBuYW1lKSA9PiB7XHJcbiAgICBjb25zdCBpc011bHRpVmFsdWUgPSAhc2luZ2xlVmFsdWVIZWFkZXJzLmluY2x1ZGVzKG5hbWUudG9Mb3dlckNhc2UoKSkgJiYgdmFsdWUuaW5jbHVkZXMoXCIsXCIpO1xyXG4gICAgaGVhZGVyc09iamVjdFtuYW1lXSA9IGlzTXVsdGlWYWx1ZSA/IHZhbHVlLnNwbGl0KFwiLFwiKS5tYXAoKHMpID0+IHMudHJpbSgpKSA6IHZhbHVlO1xyXG4gIH0pO1xyXG4gIHJldHVybiBoZWFkZXJzT2JqZWN0O1xyXG59XHJcblxyXG4vLyBzcmMvdHJhbnNmb3JtZXJzL3N0cmluZ1RvSGVhZGVycy50c1xyXG5mdW5jdGlvbiBzdHJpbmdUb0hlYWRlcnMoc3RyKSB7XHJcbiAgY29uc3QgbGluZXMgPSBzdHIudHJpbSgpLnNwbGl0KC9bXFxyXFxuXSsvKTtcclxuICByZXR1cm4gbGluZXMucmVkdWNlKChoZWFkZXJzLCBsaW5lKSA9PiB7XHJcbiAgICBpZiAobGluZS50cmltKCkgPT09IFwiXCIpIHtcclxuICAgICAgcmV0dXJuIGhlYWRlcnM7XHJcbiAgICB9XHJcbiAgICBjb25zdCBwYXJ0cyA9IGxpbmUuc3BsaXQoXCI6IFwiKTtcclxuICAgIGNvbnN0IG5hbWUgPSBwYXJ0cy5zaGlmdCgpO1xyXG4gICAgY29uc3QgdmFsdWUgPSBwYXJ0cy5qb2luKFwiOiBcIik7XHJcbiAgICBoZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XHJcbiAgICByZXR1cm4gaGVhZGVycztcclxuICB9LCBuZXcgSGVhZGVycygpKTtcclxufVxyXG5cclxuLy8gc3JjL3RyYW5zZm9ybWVycy9saXN0VG9IZWFkZXJzLnRzXHJcbmZ1bmN0aW9uIGxpc3RUb0hlYWRlcnMobGlzdCkge1xyXG4gIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xyXG4gIGxpc3QuZm9yRWFjaCgoW25hbWUsIHZhbHVlXSkgPT4ge1xyXG4gICAgY29uc3QgdmFsdWVzID0gW10uY29uY2F0KHZhbHVlKTtcclxuICAgIHZhbHVlcy5mb3JFYWNoKCh2YWx1ZTIpID0+IHtcclxuICAgICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUyKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG4gIHJldHVybiBoZWFkZXJzO1xyXG59XHJcblxyXG4vLyBzcmMvdHJhbnNmb3JtZXJzL3JlZHVjZUhlYWRlcnNPYmplY3QudHNcclxuZnVuY3Rpb24gcmVkdWNlSGVhZGVyc09iamVjdChoZWFkZXJzLCByZWR1Y2VyLCBpbml0aWFsU3RhdGUpIHtcclxuICByZXR1cm4gT2JqZWN0LmtleXMoaGVhZGVycykucmVkdWNlKChuZXh0SGVhZGVycywgbmFtZSkgPT4ge1xyXG4gICAgcmV0dXJuIHJlZHVjZXIobmV4dEhlYWRlcnMsIG5hbWUsIGhlYWRlcnNbbmFtZV0pO1xyXG4gIH0sIGluaXRpYWxTdGF0ZSk7XHJcbn1cclxuXHJcbi8vIHNyYy90cmFuc2Zvcm1lcnMvb2JqZWN0VG9IZWFkZXJzLnRzXHJcbmZ1bmN0aW9uIG9iamVjdFRvSGVhZGVycyhoZWFkZXJzT2JqZWN0KSB7XHJcbiAgcmV0dXJuIHJlZHVjZUhlYWRlcnNPYmplY3QoXHJcbiAgICBoZWFkZXJzT2JqZWN0LFxyXG4gICAgKGhlYWRlcnMsIG5hbWUsIHZhbHVlKSA9PiB7XHJcbiAgICAgIGNvbnN0IHZhbHVlcyA9IFtdLmNvbmNhdCh2YWx1ZSkuZmlsdGVyKEJvb2xlYW4pO1xyXG4gICAgICB2YWx1ZXMuZm9yRWFjaCgodmFsdWUyKSA9PiB7XHJcbiAgICAgICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUyKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBoZWFkZXJzO1xyXG4gICAgfSxcclxuICAgIG5ldyBIZWFkZXJzKClcclxuICApO1xyXG59XHJcblxyXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2ZsYXR0ZW5IZWFkZXJzTGlzdC50c1xyXG5mdW5jdGlvbiBmbGF0dGVuSGVhZGVyc0xpc3QobGlzdCkge1xyXG4gIHJldHVybiBsaXN0Lm1hcCgoW25hbWUsIHZhbHVlc10pID0+IHtcclxuICAgIHJldHVybiBbbmFtZSwgW10uY29uY2F0KHZhbHVlcykuam9pbihcIiwgXCIpXTtcclxuICB9KTtcclxufVxyXG5cclxuLy8gc3JjL3RyYW5zZm9ybWVycy9mbGF0dGVuSGVhZGVyc09iamVjdC50c1xyXG5mdW5jdGlvbiBmbGF0dGVuSGVhZGVyc09iamVjdChoZWFkZXJzT2JqZWN0KSB7XHJcbiAgcmV0dXJuIHJlZHVjZUhlYWRlcnNPYmplY3QoXHJcbiAgICBoZWFkZXJzT2JqZWN0LFxyXG4gICAgKGhlYWRlcnMsIG5hbWUsIHZhbHVlKSA9PiB7XHJcbiAgICAgIGhlYWRlcnNbbmFtZV0gPSBbXS5jb25jYXQodmFsdWUpLmpvaW4oXCIsIFwiKTtcclxuICAgICAgcmV0dXJuIGhlYWRlcnM7XHJcbiAgICB9LFxyXG4gICAge31cclxuICApO1xyXG59XHJcbmV4cG9ydCB7XHJcbiAgSGVhZGVycyxcclxuICBmbGF0dGVuSGVhZGVyc0xpc3QsXHJcbiAgZmxhdHRlbkhlYWRlcnNPYmplY3QsXHJcbiAgZ2V0UmF3SGVhZGVycyxcclxuICBoZWFkZXJzVG9MaXN0LFxyXG4gIGhlYWRlcnNUb09iamVjdCxcclxuICBoZWFkZXJzVG9TdHJpbmcsXHJcbiAgbGlzdFRvSGVhZGVycyxcclxuICBvYmplY3RUb0hlYWRlcnMsXHJcbiAgcmVkdWNlSGVhZGVyc09iamVjdCxcclxuICBzdHJpbmdUb0hlYWRlcnNcclxufTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcCIsImltcG9ydCAqIGFzIF9zeXNjYWxsczJfMCBmcm9tICdzcGFjZXRpbWU6c3lzQDIuMCc7XHJcbmltcG9ydCB7IG1vZHVsZUhvb2tzIH0gZnJvbSAnc3BhY2V0aW1lOnN5c0AyLjAnO1xyXG5pbXBvcnQgeyBoZWFkZXJzVG9MaXN0LCBIZWFkZXJzIH0gZnJvbSAnaGVhZGVycy1wb2x5ZmlsbCc7XHJcblxyXG50eXBlb2YgZ2xvYmFsVGhpcyE9PVwidW5kZWZpbmVkXCImJigoZ2xvYmFsVGhpcy5nbG9iYWw9Z2xvYmFsVGhpcy5nbG9iYWx8fGdsb2JhbFRoaXMpLChnbG9iYWxUaGlzLndpbmRvdz1nbG9iYWxUaGlzLndpbmRvd3x8Z2xvYmFsVGhpcykpO1xyXG52YXIgX19jcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xyXG52YXIgX19kZWZQcm9wID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xyXG52YXIgX19nZXRPd25Qcm9wRGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XHJcbnZhciBfX2dldE93blByb3BOYW1lcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzO1xyXG52YXIgX19nZXRQcm90b09mID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xyXG52YXIgX19oYXNPd25Qcm9wID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcclxudmFyIF9fZXNtID0gKGZuLCByZXMpID0+IGZ1bmN0aW9uIF9faW5pdCgpIHtcclxuICByZXR1cm4gZm4gJiYgKHJlcyA9ICgwLCBmbltfX2dldE93blByb3BOYW1lcyhmbilbMF1dKShmbiA9IDApKSwgcmVzO1xyXG59O1xyXG52YXIgX19jb21tb25KUyA9IChjYiwgbW9kKSA9PiBmdW5jdGlvbiBfX3JlcXVpcmUoKSB7XHJcbiAgcmV0dXJuIG1vZCB8fCAoMCwgY2JbX19nZXRPd25Qcm9wTmFtZXMoY2IpWzBdXSkoKG1vZCA9IHsgZXhwb3J0czoge30gfSkuZXhwb3J0cywgbW9kKSwgbW9kLmV4cG9ydHM7XHJcbn07XHJcbnZhciBfX2V4cG9ydCA9ICh0YXJnZXQsIGFsbCkgPT4ge1xyXG4gIGZvciAodmFyIG5hbWUgaW4gYWxsKVxyXG4gICAgX19kZWZQcm9wKHRhcmdldCwgbmFtZSwgeyBnZXQ6IGFsbFtuYW1lXSwgZW51bWVyYWJsZTogdHJ1ZSB9KTtcclxufTtcclxudmFyIF9fY29weVByb3BzID0gKHRvLCBmcm9tLCBleGNlcHQsIGRlc2MpID0+IHtcclxuICBpZiAoZnJvbSAmJiB0eXBlb2YgZnJvbSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgZnJvbSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICBmb3IgKGxldCBrZXkgb2YgX19nZXRPd25Qcm9wTmFtZXMoZnJvbSkpXHJcbiAgICAgIGlmICghX19oYXNPd25Qcm9wLmNhbGwodG8sIGtleSkgJiYga2V5ICE9PSBleGNlcHQpXHJcbiAgICAgICAgX19kZWZQcm9wKHRvLCBrZXksIHsgZ2V0OiAoKSA9PiBmcm9tW2tleV0sIGVudW1lcmFibGU6ICEoZGVzYyA9IF9fZ2V0T3duUHJvcERlc2MoZnJvbSwga2V5KSkgfHwgZGVzYy5lbnVtZXJhYmxlIH0pO1xyXG4gIH1cclxuICByZXR1cm4gdG87XHJcbn07XHJcbnZhciBfX3RvRVNNID0gKG1vZCwgaXNOb2RlTW9kZSwgdGFyZ2V0KSA9PiAodGFyZ2V0ID0gbW9kICE9IG51bGwgPyBfX2NyZWF0ZShfX2dldFByb3RvT2YobW9kKSkgOiB7fSwgX19jb3B5UHJvcHMoXHJcbiAgLy8gSWYgdGhlIGltcG9ydGVyIGlzIGluIG5vZGUgY29tcGF0aWJpbGl0eSBtb2RlIG9yIHRoaXMgaXMgbm90IGFuIEVTTVxyXG4gIC8vIGZpbGUgdGhhdCBoYXMgYmVlbiBjb252ZXJ0ZWQgdG8gYSBDb21tb25KUyBmaWxlIHVzaW5nIGEgQmFiZWwtXHJcbiAgLy8gY29tcGF0aWJsZSB0cmFuc2Zvcm0gKGkuZS4gXCJfX2VzTW9kdWxlXCIgaGFzIG5vdCBiZWVuIHNldCksIHRoZW4gc2V0XHJcbiAgLy8gXCJkZWZhdWx0XCIgdG8gdGhlIENvbW1vbkpTIFwibW9kdWxlLmV4cG9ydHNcIiBmb3Igbm9kZSBjb21wYXRpYmlsaXR5LlxyXG4gIF9fZGVmUHJvcCh0YXJnZXQsIFwiZGVmYXVsdFwiLCB7IHZhbHVlOiBtb2QsIGVudW1lcmFibGU6IHRydWUgfSkgLFxyXG4gIG1vZFxyXG4pKTtcclxudmFyIF9fdG9Db21tb25KUyA9IChtb2QpID0+IF9fY29weVByb3BzKF9fZGVmUHJvcCh7fSwgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSksIG1vZCk7XHJcblxyXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vYmFzZTY0LWpzQDEuNS4xL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvaW5kZXguanNcclxudmFyIHJlcXVpcmVfYmFzZTY0X2pzID0gX19jb21tb25KUyh7XHJcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vYmFzZTY0LWpzQDEuNS4xL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvaW5kZXguanNcIihleHBvcnRzKSB7XHJcbiAgICBleHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoO1xyXG4gICAgZXhwb3J0cy50b0J5dGVBcnJheSA9IHRvQnl0ZUFycmF5O1xyXG4gICAgZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheTI7XHJcbiAgICB2YXIgbG9va3VwID0gW107XHJcbiAgICB2YXIgcmV2TG9va3VwID0gW107XHJcbiAgICB2YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09IFwidW5kZWZpbmVkXCIgPyBVaW50OEFycmF5IDogQXJyYXk7XHJcbiAgICB2YXIgY29kZSA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrL1wiO1xyXG4gICAgZm9yIChpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICBsb29rdXBbaV0gPSBjb2RlW2ldO1xyXG4gICAgICByZXZMb29rdXBbY29kZS5jaGFyQ29kZUF0KGkpXSA9IGk7XHJcbiAgICB9XHJcbiAgICB2YXIgaTtcclxuICAgIHZhciBsZW47XHJcbiAgICByZXZMb29rdXBbXCItXCIuY2hhckNvZGVBdCgwKV0gPSA2MjtcclxuICAgIHJldkxvb2t1cFtcIl9cIi5jaGFyQ29kZUF0KDApXSA9IDYzO1xyXG4gICAgZnVuY3Rpb24gZ2V0TGVucyhiNjQpIHtcclxuICAgICAgdmFyIGxlbjIgPSBiNjQubGVuZ3RoO1xyXG4gICAgICBpZiAobGVuMiAlIDQgPiAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNFwiKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgdmFsaWRMZW4gPSBiNjQuaW5kZXhPZihcIj1cIik7XHJcbiAgICAgIGlmICh2YWxpZExlbiA9PT0gLTEpIHZhbGlkTGVuID0gbGVuMjtcclxuICAgICAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IHZhbGlkTGVuID09PSBsZW4yID8gMCA6IDQgLSB2YWxpZExlbiAlIDQ7XHJcbiAgICAgIHJldHVybiBbdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbl07XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBieXRlTGVuZ3RoKGI2NCkge1xyXG4gICAgICB2YXIgbGVucyA9IGdldExlbnMoYjY0KTtcclxuICAgICAgdmFyIHZhbGlkTGVuID0gbGVuc1swXTtcclxuICAgICAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IGxlbnNbMV07XHJcbiAgICAgIHJldHVybiAodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQgLSBwbGFjZUhvbGRlcnNMZW47XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfYnl0ZUxlbmd0aChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pIHtcclxuICAgICAgcmV0dXJuICh2YWxpZExlbiArIHBsYWNlSG9sZGVyc0xlbikgKiAzIC8gNCAtIHBsYWNlSG9sZGVyc0xlbjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHRvQnl0ZUFycmF5KGI2NCkge1xyXG4gICAgICB2YXIgdG1wO1xyXG4gICAgICB2YXIgbGVucyA9IGdldExlbnMoYjY0KTtcclxuICAgICAgdmFyIHZhbGlkTGVuID0gbGVuc1swXTtcclxuICAgICAgdmFyIHBsYWNlSG9sZGVyc0xlbiA9IGxlbnNbMV07XHJcbiAgICAgIHZhciBhcnIgPSBuZXcgQXJyKF9ieXRlTGVuZ3RoKGI2NCwgdmFsaWRMZW4sIHBsYWNlSG9sZGVyc0xlbikpO1xyXG4gICAgICB2YXIgY3VyQnl0ZSA9IDA7XHJcbiAgICAgIHZhciBsZW4yID0gcGxhY2VIb2xkZXJzTGVuID4gMCA/IHZhbGlkTGVuIC0gNCA6IHZhbGlkTGVuO1xyXG4gICAgICB2YXIgaTI7XHJcbiAgICAgIGZvciAoaTIgPSAwOyBpMiA8IGxlbjI7IGkyICs9IDQpIHtcclxuICAgICAgICB0bXAgPSByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIpXSA8PCAxOCB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDEpXSA8PCAxMiB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDIpXSA8PCA2IHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMyldO1xyXG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wID4+IDE2ICYgMjU1O1xyXG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wID4+IDggJiAyNTU7XHJcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAyNTU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHBsYWNlSG9sZGVyc0xlbiA9PT0gMikge1xyXG4gICAgICAgIHRtcCA9IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMildIDw8IDIgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAxKV0gPj4gNDtcclxuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCAmIDI1NTtcclxuICAgICAgfVxyXG4gICAgICBpZiAocGxhY2VIb2xkZXJzTGVuID09PSAxKSB7XHJcbiAgICAgICAgdG1wID0gcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyKV0gPDwgMTAgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAxKV0gPDwgNCB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDIpXSA+PiAyO1xyXG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wID4+IDggJiAyNTU7XHJcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAyNTU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NChudW0pIHtcclxuICAgICAgcmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiA2M10gKyBsb29rdXBbbnVtID4+IDEyICYgNjNdICsgbG9va3VwW251bSA+PiA2ICYgNjNdICsgbG9va3VwW251bSAmIDYzXTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGVuY29kZUNodW5rKHVpbnQ4LCBzdGFydCwgZW5kKSB7XHJcbiAgICAgIHZhciB0bXA7XHJcbiAgICAgIHZhciBvdXRwdXQgPSBbXTtcclxuICAgICAgZm9yICh2YXIgaTIgPSBzdGFydDsgaTIgPCBlbmQ7IGkyICs9IDMpIHtcclxuICAgICAgICB0bXAgPSAodWludDhbaTJdIDw8IDE2ICYgMTY3MTE2ODApICsgKHVpbnQ4W2kyICsgMV0gPDwgOCAmIDY1MjgwKSArICh1aW50OFtpMiArIDJdICYgMjU1KTtcclxuICAgICAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG91dHB1dC5qb2luKFwiXCIpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZnJvbUJ5dGVBcnJheTIodWludDgpIHtcclxuICAgICAgdmFyIHRtcDtcclxuICAgICAgdmFyIGxlbjIgPSB1aW50OC5sZW5ndGg7XHJcbiAgICAgIHZhciBleHRyYUJ5dGVzID0gbGVuMiAlIDM7XHJcbiAgICAgIHZhciBwYXJ0cyA9IFtdO1xyXG4gICAgICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MztcclxuICAgICAgZm9yICh2YXIgaTIgPSAwLCBsZW4yMiA9IGxlbjIgLSBleHRyYUJ5dGVzOyBpMiA8IGxlbjIyOyBpMiArPSBtYXhDaHVua0xlbmd0aCkge1xyXG4gICAgICAgIHBhcnRzLnB1c2goZW5jb2RlQ2h1bmsodWludDgsIGkyLCBpMiArIG1heENodW5rTGVuZ3RoID4gbGVuMjIgPyBsZW4yMiA6IGkyICsgbWF4Q2h1bmtMZW5ndGgpKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xyXG4gICAgICAgIHRtcCA9IHVpbnQ4W2xlbjIgLSAxXTtcclxuICAgICAgICBwYXJ0cy5wdXNoKFxyXG4gICAgICAgICAgbG9va3VwW3RtcCA+PiAyXSArIGxvb2t1cFt0bXAgPDwgNCAmIDYzXSArIFwiPT1cIlxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xyXG4gICAgICAgIHRtcCA9ICh1aW50OFtsZW4yIC0gMl0gPDwgOCkgKyB1aW50OFtsZW4yIC0gMV07XHJcbiAgICAgICAgcGFydHMucHVzaChcclxuICAgICAgICAgIGxvb2t1cFt0bXAgPj4gMTBdICsgbG9va3VwW3RtcCA+PiA0ICYgNjNdICsgbG9va3VwW3RtcCA8PCAyICYgNjNdICsgXCI9XCJcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBwYXJ0cy5qb2luKFwiXCIpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc3RhdHVzZXNAMi4wLjIvbm9kZV9tb2R1bGVzL3N0YXR1c2VzL2NvZGVzLmpzb25cclxudmFyIHJlcXVpcmVfY29kZXMgPSBfX2NvbW1vbkpTKHtcclxuICBcIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zdGF0dXNlc0AyLjAuMi9ub2RlX21vZHVsZXMvc3RhdHVzZXMvY29kZXMuanNvblwiKGV4cG9ydHMsIG1vZHVsZSkge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAgIFwiMTAwXCI6IFwiQ29udGludWVcIixcclxuICAgICAgXCIxMDFcIjogXCJTd2l0Y2hpbmcgUHJvdG9jb2xzXCIsXHJcbiAgICAgIFwiMTAyXCI6IFwiUHJvY2Vzc2luZ1wiLFxyXG4gICAgICBcIjEwM1wiOiBcIkVhcmx5IEhpbnRzXCIsXHJcbiAgICAgIFwiMjAwXCI6IFwiT0tcIixcclxuICAgICAgXCIyMDFcIjogXCJDcmVhdGVkXCIsXHJcbiAgICAgIFwiMjAyXCI6IFwiQWNjZXB0ZWRcIixcclxuICAgICAgXCIyMDNcIjogXCJOb24tQXV0aG9yaXRhdGl2ZSBJbmZvcm1hdGlvblwiLFxyXG4gICAgICBcIjIwNFwiOiBcIk5vIENvbnRlbnRcIixcclxuICAgICAgXCIyMDVcIjogXCJSZXNldCBDb250ZW50XCIsXHJcbiAgICAgIFwiMjA2XCI6IFwiUGFydGlhbCBDb250ZW50XCIsXHJcbiAgICAgIFwiMjA3XCI6IFwiTXVsdGktU3RhdHVzXCIsXHJcbiAgICAgIFwiMjA4XCI6IFwiQWxyZWFkeSBSZXBvcnRlZFwiLFxyXG4gICAgICBcIjIyNlwiOiBcIklNIFVzZWRcIixcclxuICAgICAgXCIzMDBcIjogXCJNdWx0aXBsZSBDaG9pY2VzXCIsXHJcbiAgICAgIFwiMzAxXCI6IFwiTW92ZWQgUGVybWFuZW50bHlcIixcclxuICAgICAgXCIzMDJcIjogXCJGb3VuZFwiLFxyXG4gICAgICBcIjMwM1wiOiBcIlNlZSBPdGhlclwiLFxyXG4gICAgICBcIjMwNFwiOiBcIk5vdCBNb2RpZmllZFwiLFxyXG4gICAgICBcIjMwNVwiOiBcIlVzZSBQcm94eVwiLFxyXG4gICAgICBcIjMwN1wiOiBcIlRlbXBvcmFyeSBSZWRpcmVjdFwiLFxyXG4gICAgICBcIjMwOFwiOiBcIlBlcm1hbmVudCBSZWRpcmVjdFwiLFxyXG4gICAgICBcIjQwMFwiOiBcIkJhZCBSZXF1ZXN0XCIsXHJcbiAgICAgIFwiNDAxXCI6IFwiVW5hdXRob3JpemVkXCIsXHJcbiAgICAgIFwiNDAyXCI6IFwiUGF5bWVudCBSZXF1aXJlZFwiLFxyXG4gICAgICBcIjQwM1wiOiBcIkZvcmJpZGRlblwiLFxyXG4gICAgICBcIjQwNFwiOiBcIk5vdCBGb3VuZFwiLFxyXG4gICAgICBcIjQwNVwiOiBcIk1ldGhvZCBOb3QgQWxsb3dlZFwiLFxyXG4gICAgICBcIjQwNlwiOiBcIk5vdCBBY2NlcHRhYmxlXCIsXHJcbiAgICAgIFwiNDA3XCI6IFwiUHJveHkgQXV0aGVudGljYXRpb24gUmVxdWlyZWRcIixcclxuICAgICAgXCI0MDhcIjogXCJSZXF1ZXN0IFRpbWVvdXRcIixcclxuICAgICAgXCI0MDlcIjogXCJDb25mbGljdFwiLFxyXG4gICAgICBcIjQxMFwiOiBcIkdvbmVcIixcclxuICAgICAgXCI0MTFcIjogXCJMZW5ndGggUmVxdWlyZWRcIixcclxuICAgICAgXCI0MTJcIjogXCJQcmVjb25kaXRpb24gRmFpbGVkXCIsXHJcbiAgICAgIFwiNDEzXCI6IFwiUGF5bG9hZCBUb28gTGFyZ2VcIixcclxuICAgICAgXCI0MTRcIjogXCJVUkkgVG9vIExvbmdcIixcclxuICAgICAgXCI0MTVcIjogXCJVbnN1cHBvcnRlZCBNZWRpYSBUeXBlXCIsXHJcbiAgICAgIFwiNDE2XCI6IFwiUmFuZ2UgTm90IFNhdGlzZmlhYmxlXCIsXHJcbiAgICAgIFwiNDE3XCI6IFwiRXhwZWN0YXRpb24gRmFpbGVkXCIsXHJcbiAgICAgIFwiNDE4XCI6IFwiSSdtIGEgVGVhcG90XCIsXHJcbiAgICAgIFwiNDIxXCI6IFwiTWlzZGlyZWN0ZWQgUmVxdWVzdFwiLFxyXG4gICAgICBcIjQyMlwiOiBcIlVucHJvY2Vzc2FibGUgRW50aXR5XCIsXHJcbiAgICAgIFwiNDIzXCI6IFwiTG9ja2VkXCIsXHJcbiAgICAgIFwiNDI0XCI6IFwiRmFpbGVkIERlcGVuZGVuY3lcIixcclxuICAgICAgXCI0MjVcIjogXCJUb28gRWFybHlcIixcclxuICAgICAgXCI0MjZcIjogXCJVcGdyYWRlIFJlcXVpcmVkXCIsXHJcbiAgICAgIFwiNDI4XCI6IFwiUHJlY29uZGl0aW9uIFJlcXVpcmVkXCIsXHJcbiAgICAgIFwiNDI5XCI6IFwiVG9vIE1hbnkgUmVxdWVzdHNcIixcclxuICAgICAgXCI0MzFcIjogXCJSZXF1ZXN0IEhlYWRlciBGaWVsZHMgVG9vIExhcmdlXCIsXHJcbiAgICAgIFwiNDUxXCI6IFwiVW5hdmFpbGFibGUgRm9yIExlZ2FsIFJlYXNvbnNcIixcclxuICAgICAgXCI1MDBcIjogXCJJbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcIixcclxuICAgICAgXCI1MDFcIjogXCJOb3QgSW1wbGVtZW50ZWRcIixcclxuICAgICAgXCI1MDJcIjogXCJCYWQgR2F0ZXdheVwiLFxyXG4gICAgICBcIjUwM1wiOiBcIlNlcnZpY2UgVW5hdmFpbGFibGVcIixcclxuICAgICAgXCI1MDRcIjogXCJHYXRld2F5IFRpbWVvdXRcIixcclxuICAgICAgXCI1MDVcIjogXCJIVFRQIFZlcnNpb24gTm90IFN1cHBvcnRlZFwiLFxyXG4gICAgICBcIjUwNlwiOiBcIlZhcmlhbnQgQWxzbyBOZWdvdGlhdGVzXCIsXHJcbiAgICAgIFwiNTA3XCI6IFwiSW5zdWZmaWNpZW50IFN0b3JhZ2VcIixcclxuICAgICAgXCI1MDhcIjogXCJMb29wIERldGVjdGVkXCIsXHJcbiAgICAgIFwiNTA5XCI6IFwiQmFuZHdpZHRoIExpbWl0IEV4Y2VlZGVkXCIsXHJcbiAgICAgIFwiNTEwXCI6IFwiTm90IEV4dGVuZGVkXCIsXHJcbiAgICAgIFwiNTExXCI6IFwiTmV0d29yayBBdXRoZW50aWNhdGlvbiBSZXF1aXJlZFwiXHJcbiAgICB9O1xyXG4gIH1cclxufSk7XHJcblxyXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc3RhdHVzZXNAMi4wLjIvbm9kZV9tb2R1bGVzL3N0YXR1c2VzL2luZGV4LmpzXHJcbnZhciByZXF1aXJlX3N0YXR1c2VzID0gX19jb21tb25KUyh7XHJcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc3RhdHVzZXNAMi4wLjIvbm9kZV9tb2R1bGVzL3N0YXR1c2VzL2luZGV4LmpzXCIoZXhwb3J0cywgbW9kdWxlKSB7XHJcbiAgICB2YXIgY29kZXMgPSByZXF1aXJlX2NvZGVzKCk7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHN0YXR1czI7XHJcbiAgICBzdGF0dXMyLm1lc3NhZ2UgPSBjb2RlcztcclxuICAgIHN0YXR1czIuY29kZSA9IGNyZWF0ZU1lc3NhZ2VUb1N0YXR1c0NvZGVNYXAoY29kZXMpO1xyXG4gICAgc3RhdHVzMi5jb2RlcyA9IGNyZWF0ZVN0YXR1c0NvZGVMaXN0KGNvZGVzKTtcclxuICAgIHN0YXR1czIucmVkaXJlY3QgPSB7XHJcbiAgICAgIDMwMDogdHJ1ZSxcclxuICAgICAgMzAxOiB0cnVlLFxyXG4gICAgICAzMDI6IHRydWUsXHJcbiAgICAgIDMwMzogdHJ1ZSxcclxuICAgICAgMzA1OiB0cnVlLFxyXG4gICAgICAzMDc6IHRydWUsXHJcbiAgICAgIDMwODogdHJ1ZVxyXG4gICAgfTtcclxuICAgIHN0YXR1czIuZW1wdHkgPSB7XHJcbiAgICAgIDIwNDogdHJ1ZSxcclxuICAgICAgMjA1OiB0cnVlLFxyXG4gICAgICAzMDQ6IHRydWVcclxuICAgIH07XHJcbiAgICBzdGF0dXMyLnJldHJ5ID0ge1xyXG4gICAgICA1MDI6IHRydWUsXHJcbiAgICAgIDUwMzogdHJ1ZSxcclxuICAgICAgNTA0OiB0cnVlXHJcbiAgICB9O1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlTWVzc2FnZVRvU3RhdHVzQ29kZU1hcChjb2RlczIpIHtcclxuICAgICAgdmFyIG1hcCA9IHt9O1xyXG4gICAgICBPYmplY3Qua2V5cyhjb2RlczIpLmZvckVhY2goZnVuY3Rpb24gZm9yRWFjaENvZGUoY29kZSkge1xyXG4gICAgICAgIHZhciBtZXNzYWdlID0gY29kZXMyW2NvZGVdO1xyXG4gICAgICAgIHZhciBzdGF0dXMzID0gTnVtYmVyKGNvZGUpO1xyXG4gICAgICAgIG1hcFttZXNzYWdlLnRvTG93ZXJDYXNlKCldID0gc3RhdHVzMztcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBtYXA7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVTdGF0dXNDb2RlTGlzdChjb2RlczIpIHtcclxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGNvZGVzMikubWFwKGZ1bmN0aW9uIG1hcENvZGUoY29kZSkge1xyXG4gICAgICAgIHJldHVybiBOdW1iZXIoY29kZSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZ2V0U3RhdHVzQ29kZShtZXNzYWdlKSB7XHJcbiAgICAgIHZhciBtc2cgPSBtZXNzYWdlLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgIGlmICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHN0YXR1czIuY29kZSwgbXNnKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzdGF0dXMgbWVzc2FnZTogXCInICsgbWVzc2FnZSArICdcIicpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBzdGF0dXMyLmNvZGVbbXNnXTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGdldFN0YXR1c01lc3NhZ2UoY29kZSkge1xyXG4gICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzdGF0dXMyLm1lc3NhZ2UsIGNvZGUpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBzdGF0dXMgY29kZTogXCIgKyBjb2RlKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3RhdHVzMi5tZXNzYWdlW2NvZGVdO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc3RhdHVzMihjb2RlKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgY29kZSA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgIHJldHVybiBnZXRTdGF0dXNNZXNzYWdlKGNvZGUpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2YgY29kZSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJjb2RlIG11c3QgYmUgYSBudW1iZXIgb3Igc3RyaW5nXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBuID0gcGFyc2VJbnQoY29kZSwgMTApO1xyXG4gICAgICBpZiAoIWlzTmFOKG4pKSB7XHJcbiAgICAgICAgcmV0dXJuIGdldFN0YXR1c01lc3NhZ2Uobik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGdldFN0YXR1c0NvZGUoY29kZSk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIHNyYy91dGlsLXN0dWIudHNcclxudmFyIHV0aWxfc3R1Yl9leHBvcnRzID0ge307XHJcbl9fZXhwb3J0KHV0aWxfc3R1Yl9leHBvcnRzLCB7XHJcbiAgaW5zcGVjdDogKCkgPT4gaW5zcGVjdFxyXG59KTtcclxudmFyIGluc3BlY3Q7XHJcbnZhciBpbml0X3V0aWxfc3R1YiA9IF9fZXNtKHtcclxuICBcInNyYy91dGlsLXN0dWIudHNcIigpIHtcclxuICAgIGluc3BlY3QgPSB7fTtcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL29iamVjdC1pbnNwZWN0QDEuMTMuNC9ub2RlX21vZHVsZXMvb2JqZWN0LWluc3BlY3QvdXRpbC5pbnNwZWN0LmpzXHJcbnZhciByZXF1aXJlX3V0aWxfaW5zcGVjdCA9IF9fY29tbW9uSlMoe1xyXG4gIFwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL29iamVjdC1pbnNwZWN0QDEuMTMuNC9ub2RlX21vZHVsZXMvb2JqZWN0LWluc3BlY3QvdXRpbC5pbnNwZWN0LmpzXCIoZXhwb3J0cywgbW9kdWxlKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IChpbml0X3V0aWxfc3R1YigpLCBfX3RvQ29tbW9uSlModXRpbF9zdHViX2V4cG9ydHMpKS5pbnNwZWN0O1xyXG4gIH1cclxufSk7XHJcblxyXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vb2JqZWN0LWluc3BlY3RAMS4xMy40L25vZGVfbW9kdWxlcy9vYmplY3QtaW5zcGVjdC9pbmRleC5qc1xyXG52YXIgcmVxdWlyZV9vYmplY3RfaW5zcGVjdCA9IF9fY29tbW9uSlMoe1xyXG4gIFwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL29iamVjdC1pbnNwZWN0QDEuMTMuNC9ub2RlX21vZHVsZXMvb2JqZWN0LWluc3BlY3QvaW5kZXguanNcIihleHBvcnRzLCBtb2R1bGUpIHtcclxuICAgIHZhciBoYXNNYXAgPSB0eXBlb2YgTWFwID09PSBcImZ1bmN0aW9uXCIgJiYgTWFwLnByb3RvdHlwZTtcclxuICAgIHZhciBtYXBTaXplRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgJiYgaGFzTWFwID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihNYXAucHJvdG90eXBlLCBcInNpemVcIikgOiBudWxsO1xyXG4gICAgdmFyIG1hcFNpemUgPSBoYXNNYXAgJiYgbWFwU2l6ZURlc2NyaXB0b3IgJiYgdHlwZW9mIG1hcFNpemVEZXNjcmlwdG9yLmdldCA9PT0gXCJmdW5jdGlvblwiID8gbWFwU2l6ZURlc2NyaXB0b3IuZ2V0IDogbnVsbDtcclxuICAgIHZhciBtYXBGb3JFYWNoID0gaGFzTWFwICYmIE1hcC5wcm90b3R5cGUuZm9yRWFjaDtcclxuICAgIHZhciBoYXNTZXQgPSB0eXBlb2YgU2V0ID09PSBcImZ1bmN0aW9uXCIgJiYgU2V0LnByb3RvdHlwZTtcclxuICAgIHZhciBzZXRTaXplRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgJiYgaGFzU2V0ID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihTZXQucHJvdG90eXBlLCBcInNpemVcIikgOiBudWxsO1xyXG4gICAgdmFyIHNldFNpemUgPSBoYXNTZXQgJiYgc2V0U2l6ZURlc2NyaXB0b3IgJiYgdHlwZW9mIHNldFNpemVEZXNjcmlwdG9yLmdldCA9PT0gXCJmdW5jdGlvblwiID8gc2V0U2l6ZURlc2NyaXB0b3IuZ2V0IDogbnVsbDtcclxuICAgIHZhciBzZXRGb3JFYWNoID0gaGFzU2V0ICYmIFNldC5wcm90b3R5cGUuZm9yRWFjaDtcclxuICAgIHZhciBoYXNXZWFrTWFwID0gdHlwZW9mIFdlYWtNYXAgPT09IFwiZnVuY3Rpb25cIiAmJiBXZWFrTWFwLnByb3RvdHlwZTtcclxuICAgIHZhciB3ZWFrTWFwSGFzID0gaGFzV2Vha01hcCA/IFdlYWtNYXAucHJvdG90eXBlLmhhcyA6IG51bGw7XHJcbiAgICB2YXIgaGFzV2Vha1NldCA9IHR5cGVvZiBXZWFrU2V0ID09PSBcImZ1bmN0aW9uXCIgJiYgV2Vha1NldC5wcm90b3R5cGU7XHJcbiAgICB2YXIgd2Vha1NldEhhcyA9IGhhc1dlYWtTZXQgPyBXZWFrU2V0LnByb3RvdHlwZS5oYXMgOiBudWxsO1xyXG4gICAgdmFyIGhhc1dlYWtSZWYgPSB0eXBlb2YgV2Vha1JlZiA9PT0gXCJmdW5jdGlvblwiICYmIFdlYWtSZWYucHJvdG90eXBlO1xyXG4gICAgdmFyIHdlYWtSZWZEZXJlZiA9IGhhc1dlYWtSZWYgPyBXZWFrUmVmLnByb3RvdHlwZS5kZXJlZiA6IG51bGw7XHJcbiAgICB2YXIgYm9vbGVhblZhbHVlT2YgPSBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mO1xyXG4gICAgdmFyIG9iamVjdFRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcclxuICAgIHZhciBmdW5jdGlvblRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xyXG4gICAgdmFyICRtYXRjaCA9IFN0cmluZy5wcm90b3R5cGUubWF0Y2g7XHJcbiAgICB2YXIgJHNsaWNlID0gU3RyaW5nLnByb3RvdHlwZS5zbGljZTtcclxuICAgIHZhciAkcmVwbGFjZSA9IFN0cmluZy5wcm90b3R5cGUucmVwbGFjZTtcclxuICAgIHZhciAkdG9VcHBlckNhc2UgPSBTdHJpbmcucHJvdG90eXBlLnRvVXBwZXJDYXNlO1xyXG4gICAgdmFyICR0b0xvd2VyQ2FzZSA9IFN0cmluZy5wcm90b3R5cGUudG9Mb3dlckNhc2U7XHJcbiAgICB2YXIgJHRlc3QgPSBSZWdFeHAucHJvdG90eXBlLnRlc3Q7XHJcbiAgICB2YXIgJGNvbmNhdCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQ7XHJcbiAgICB2YXIgJGpvaW4gPSBBcnJheS5wcm90b3R5cGUuam9pbjtcclxuICAgIHZhciAkYXJyU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XHJcbiAgICB2YXIgJGZsb29yID0gTWF0aC5mbG9vcjtcclxuICAgIHZhciBiaWdJbnRWYWx1ZU9mID0gdHlwZW9mIEJpZ0ludCA9PT0gXCJmdW5jdGlvblwiID8gQmlnSW50LnByb3RvdHlwZS52YWx1ZU9mIDogbnVsbDtcclxuICAgIHZhciBnT1BTID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcclxuICAgIHZhciBzeW1Ub1N0cmluZyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gU3ltYm9sLnByb3RvdHlwZS50b1N0cmluZyA6IG51bGw7XHJcbiAgICB2YXIgaGFzU2hhbW1lZFN5bWJvbHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJvYmplY3RcIjtcclxuICAgIHZhciB0b1N0cmluZ1RhZyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wudG9TdHJpbmdUYWcgJiYgKHR5cGVvZiBTeW1ib2wudG9TdHJpbmdUYWcgPT09IGhhc1NoYW1tZWRTeW1ib2xzID8gXCJvYmplY3RcIiA6IFwic3ltYm9sXCIpID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogbnVsbDtcclxuICAgIHZhciBpc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xyXG4gICAgdmFyIGdQTyA9ICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJmdW5jdGlvblwiID8gUmVmbGVjdC5nZXRQcm90b3R5cGVPZiA6IE9iamVjdC5nZXRQcm90b3R5cGVPZikgfHwgKFtdLl9fcHJvdG9fXyA9PT0gQXJyYXkucHJvdG90eXBlID8gZnVuY3Rpb24oTykge1xyXG4gICAgICByZXR1cm4gTy5fX3Byb3RvX187XHJcbiAgICB9IDogbnVsbCk7XHJcbiAgICBmdW5jdGlvbiBhZGROdW1lcmljU2VwYXJhdG9yKG51bSwgc3RyKSB7XHJcbiAgICAgIGlmIChudW0gPT09IEluZmluaXR5IHx8IG51bSA9PT0gLUluZmluaXR5IHx8IG51bSAhPT0gbnVtIHx8IG51bSAmJiBudW0gPiAtMWUzICYmIG51bSA8IDFlMyB8fCAkdGVzdC5jYWxsKC9lLywgc3RyKSkge1xyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHNlcFJlZ2V4ID0gL1swLTldKD89KD86WzAtOV17M30pKyg/IVswLTldKSkvZztcclxuICAgICAgaWYgKHR5cGVvZiBudW0gPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICB2YXIgaW50ID0gbnVtIDwgMCA/IC0kZmxvb3IoLW51bSkgOiAkZmxvb3IobnVtKTtcclxuICAgICAgICBpZiAoaW50ICE9PSBudW0pIHtcclxuICAgICAgICAgIHZhciBpbnRTdHIgPSBTdHJpbmcoaW50KTtcclxuICAgICAgICAgIHZhciBkZWMgPSAkc2xpY2UuY2FsbChzdHIsIGludFN0ci5sZW5ndGggKyAxKTtcclxuICAgICAgICAgIHJldHVybiAkcmVwbGFjZS5jYWxsKGludFN0ciwgc2VwUmVnZXgsIFwiJCZfXCIpICsgXCIuXCIgKyAkcmVwbGFjZS5jYWxsKCRyZXBsYWNlLmNhbGwoZGVjLCAvKFswLTldezN9KS9nLCBcIiQmX1wiKSwgL18kLywgXCJcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAkcmVwbGFjZS5jYWxsKHN0ciwgc2VwUmVnZXgsIFwiJCZfXCIpO1xyXG4gICAgfVxyXG4gICAgdmFyIHV0aWxJbnNwZWN0ID0gcmVxdWlyZV91dGlsX2luc3BlY3QoKTtcclxuICAgIHZhciBpbnNwZWN0Q3VzdG9tID0gdXRpbEluc3BlY3QuY3VzdG9tO1xyXG4gICAgdmFyIGluc3BlY3RTeW1ib2wgPSBpc1N5bWJvbChpbnNwZWN0Q3VzdG9tKSA/IGluc3BlY3RDdXN0b20gOiBudWxsO1xyXG4gICAgdmFyIHF1b3RlcyA9IHtcclxuICAgICAgX19wcm90b19fOiBudWxsLFxyXG4gICAgICBcImRvdWJsZVwiOiAnXCInLFxyXG4gICAgICBzaW5nbGU6IFwiJ1wiXHJcbiAgICB9O1xyXG4gICAgdmFyIHF1b3RlUkVzID0ge1xyXG4gICAgICBfX3Byb3RvX186IG51bGwsXHJcbiAgICAgIFwiZG91YmxlXCI6IC8oW1wiXFxcXF0pL2csXHJcbiAgICAgIHNpbmdsZTogLyhbJ1xcXFxdKS9nXHJcbiAgICB9O1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbnNwZWN0XyhvYmosIG9wdGlvbnMsIGRlcHRoLCBzZWVuKSB7XHJcbiAgICAgIHZhciBvcHRzID0gb3B0aW9ucyB8fCB7fTtcclxuICAgICAgaWYgKGhhcyhvcHRzLCBcInF1b3RlU3R5bGVcIikgJiYgIWhhcyhxdW90ZXMsIG9wdHMucXVvdGVTdHlsZSkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gXCJxdW90ZVN0eWxlXCIgbXVzdCBiZSBcInNpbmdsZVwiIG9yIFwiZG91YmxlXCInKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaGFzKG9wdHMsIFwibWF4U3RyaW5nTGVuZ3RoXCIpICYmICh0eXBlb2Ygb3B0cy5tYXhTdHJpbmdMZW5ndGggPT09IFwibnVtYmVyXCIgPyBvcHRzLm1heFN0cmluZ0xlbmd0aCA8IDAgJiYgb3B0cy5tYXhTdHJpbmdMZW5ndGggIT09IEluZmluaXR5IDogb3B0cy5tYXhTdHJpbmdMZW5ndGggIT09IG51bGwpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwibWF4U3RyaW5nTGVuZ3RoXCIsIGlmIHByb3ZpZGVkLCBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlciwgSW5maW5pdHksIG9yIGBudWxsYCcpO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBjdXN0b21JbnNwZWN0ID0gaGFzKG9wdHMsIFwiY3VzdG9tSW5zcGVjdFwiKSA/IG9wdHMuY3VzdG9tSW5zcGVjdCA6IHRydWU7XHJcbiAgICAgIGlmICh0eXBlb2YgY3VzdG9tSW5zcGVjdCAhPT0gXCJib29sZWFuXCIgJiYgY3VzdG9tSW5zcGVjdCAhPT0gXCJzeW1ib2xcIikge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJvcHRpb24gXFxcImN1c3RvbUluc3BlY3RcXFwiLCBpZiBwcm92aWRlZCwgbXVzdCBiZSBgdHJ1ZWAsIGBmYWxzZWAsIG9yIGAnc3ltYm9sJ2BcIik7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGhhcyhvcHRzLCBcImluZGVudFwiKSAmJiBvcHRzLmluZGVudCAhPT0gbnVsbCAmJiBvcHRzLmluZGVudCAhPT0gXCJcdFwiICYmICEocGFyc2VJbnQob3B0cy5pbmRlbnQsIDEwKSA9PT0gb3B0cy5pbmRlbnQgJiYgb3B0cy5pbmRlbnQgPiAwKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBcImluZGVudFwiIG11c3QgYmUgXCJcXFxcdFwiLCBhbiBpbnRlZ2VyID4gMCwgb3IgYG51bGxgJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGhhcyhvcHRzLCBcIm51bWVyaWNTZXBhcmF0b3JcIikgJiYgdHlwZW9mIG9wdHMubnVtZXJpY1NlcGFyYXRvciAhPT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gXCJudW1lcmljU2VwYXJhdG9yXCIsIGlmIHByb3ZpZGVkLCBtdXN0IGJlIGB0cnVlYCBvciBgZmFsc2VgJyk7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIG51bWVyaWNTZXBhcmF0b3IgPSBvcHRzLm51bWVyaWNTZXBhcmF0b3I7XHJcbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIFwidW5kZWZpbmVkXCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG9iaiA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBcIm51bGxcIjtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICByZXR1cm4gb2JqID8gXCJ0cnVlXCIgOiBcImZhbHNlXCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICByZXR1cm4gaW5zcGVjdFN0cmluZyhvYmosIG9wdHMpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgaWYgKG9iaiA9PT0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIEluZmluaXR5IC8gb2JqID4gMCA/IFwiMFwiIDogXCItMFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc3RyID0gU3RyaW5nKG9iaik7XHJcbiAgICAgICAgcmV0dXJuIG51bWVyaWNTZXBhcmF0b3IgPyBhZGROdW1lcmljU2VwYXJhdG9yKG9iaiwgc3RyKSA6IHN0cjtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJiaWdpbnRcIikge1xyXG4gICAgICAgIHZhciBiaWdJbnRTdHIgPSBTdHJpbmcob2JqKSArIFwiblwiO1xyXG4gICAgICAgIHJldHVybiBudW1lcmljU2VwYXJhdG9yID8gYWRkTnVtZXJpY1NlcGFyYXRvcihvYmosIGJpZ0ludFN0cikgOiBiaWdJbnRTdHI7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIG1heERlcHRoID0gdHlwZW9mIG9wdHMuZGVwdGggPT09IFwidW5kZWZpbmVkXCIgPyA1IDogb3B0cy5kZXB0aDtcclxuICAgICAgaWYgKHR5cGVvZiBkZXB0aCA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIGRlcHRoID0gMDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZGVwdGggPj0gbWF4RGVwdGggJiYgbWF4RGVwdGggPiAwICYmIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICByZXR1cm4gaXNBcnJheShvYmopID8gXCJbQXJyYXldXCIgOiBcIltPYmplY3RdXCI7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIGluZGVudCA9IGdldEluZGVudChvcHRzLCBkZXB0aCk7XHJcbiAgICAgIGlmICh0eXBlb2Ygc2VlbiA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHNlZW4gPSBbXTtcclxuICAgICAgfSBlbHNlIGlmIChpbmRleE9mKHNlZW4sIG9iaikgPj0gMCkge1xyXG4gICAgICAgIHJldHVybiBcIltDaXJjdWxhcl1cIjtcclxuICAgICAgfVxyXG4gICAgICBmdW5jdGlvbiBpbnNwZWN0Myh2YWx1ZSwgZnJvbSwgbm9JbmRlbnQpIHtcclxuICAgICAgICBpZiAoZnJvbSkge1xyXG4gICAgICAgICAgc2VlbiA9ICRhcnJTbGljZS5jYWxsKHNlZW4pO1xyXG4gICAgICAgICAgc2Vlbi5wdXNoKGZyb20pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9JbmRlbnQpIHtcclxuICAgICAgICAgIHZhciBuZXdPcHRzID0ge1xyXG4gICAgICAgICAgICBkZXB0aDogb3B0cy5kZXB0aFxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIGlmIChoYXMob3B0cywgXCJxdW90ZVN0eWxlXCIpKSB7XHJcbiAgICAgICAgICAgIG5ld09wdHMucXVvdGVTdHlsZSA9IG9wdHMucXVvdGVTdHlsZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBpbnNwZWN0Xyh2YWx1ZSwgbmV3T3B0cywgZGVwdGggKyAxLCBzZWVuKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGluc3BlY3RfKHZhbHVlLCBvcHRzLCBkZXB0aCArIDEsIHNlZW4pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcImZ1bmN0aW9uXCIgJiYgIWlzUmVnRXhwKG9iaikpIHtcclxuICAgICAgICB2YXIgbmFtZSA9IG5hbWVPZihvYmopO1xyXG4gICAgICAgIHZhciBrZXlzID0gYXJyT2JqS2V5cyhvYmosIGluc3BlY3QzKTtcclxuICAgICAgICByZXR1cm4gXCJbRnVuY3Rpb25cIiArIChuYW1lID8gXCI6IFwiICsgbmFtZSA6IFwiIChhbm9ueW1vdXMpXCIpICsgXCJdXCIgKyAoa2V5cy5sZW5ndGggPiAwID8gXCIgeyBcIiArICRqb2luLmNhbGwoa2V5cywgXCIsIFwiKSArIFwiIH1cIiA6IFwiXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1N5bWJvbChvYmopKSB7XHJcbiAgICAgICAgdmFyIHN5bVN0cmluZyA9IGhhc1NoYW1tZWRTeW1ib2xzID8gJHJlcGxhY2UuY2FsbChTdHJpbmcob2JqKSwgL14oU3ltYm9sXFwoLipcXCkpX1teKV0qJC8sIFwiJDFcIikgOiBzeW1Ub1N0cmluZy5jYWxsKG9iaik7XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgIWhhc1NoYW1tZWRTeW1ib2xzID8gbWFya0JveGVkKHN5bVN0cmluZykgOiBzeW1TdHJpbmc7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzRWxlbWVudChvYmopKSB7XHJcbiAgICAgICAgdmFyIHMgPSBcIjxcIiArICR0b0xvd2VyQ2FzZS5jYWxsKFN0cmluZyhvYmoubm9kZU5hbWUpKTtcclxuICAgICAgICB2YXIgYXR0cnMgPSBvYmouYXR0cmlidXRlcyB8fCBbXTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBzICs9IFwiIFwiICsgYXR0cnNbaV0ubmFtZSArIFwiPVwiICsgd3JhcFF1b3RlcyhxdW90ZShhdHRyc1tpXS52YWx1ZSksIFwiZG91YmxlXCIsIG9wdHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzICs9IFwiPlwiO1xyXG4gICAgICAgIGlmIChvYmouY2hpbGROb2RlcyAmJiBvYmouY2hpbGROb2Rlcy5sZW5ndGgpIHtcclxuICAgICAgICAgIHMgKz0gXCIuLi5cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcyArPSBcIjwvXCIgKyAkdG9Mb3dlckNhc2UuY2FsbChTdHJpbmcob2JqLm5vZGVOYW1lKSkgKyBcIj5cIjtcclxuICAgICAgICByZXR1cm4gcztcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNBcnJheShvYmopKSB7XHJcbiAgICAgICAgaWYgKG9iai5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIHJldHVybiBcIltdXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciB4cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0Myk7XHJcbiAgICAgICAgaWYgKGluZGVudCAmJiAhc2luZ2xlTGluZVZhbHVlcyh4cykpIHtcclxuICAgICAgICAgIHJldHVybiBcIltcIiArIGluZGVudGVkSm9pbih4cywgaW5kZW50KSArIFwiXVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gXCJbIFwiICsgJGpvaW4uY2FsbCh4cywgXCIsIFwiKSArIFwiIF1cIjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNFcnJvcihvYmopKSB7XHJcbiAgICAgICAgdmFyIHBhcnRzID0gYXJyT2JqS2V5cyhvYmosIGluc3BlY3QzKTtcclxuICAgICAgICBpZiAoIShcImNhdXNlXCIgaW4gRXJyb3IucHJvdG90eXBlKSAmJiBcImNhdXNlXCIgaW4gb2JqICYmICFpc0VudW1lcmFibGUuY2FsbChvYmosIFwiY2F1c2VcIikpIHtcclxuICAgICAgICAgIHJldHVybiBcInsgW1wiICsgU3RyaW5nKG9iaikgKyBcIl0gXCIgKyAkam9pbi5jYWxsKCRjb25jYXQuY2FsbChcIltjYXVzZV06IFwiICsgaW5zcGVjdDMob2JqLmNhdXNlKSwgcGFydHMpLCBcIiwgXCIpICsgXCIgfVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGFydHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gXCJbXCIgKyBTdHJpbmcob2JqKSArIFwiXVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gXCJ7IFtcIiArIFN0cmluZyhvYmopICsgXCJdIFwiICsgJGpvaW4uY2FsbChwYXJ0cywgXCIsIFwiKSArIFwiIH1cIjtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBjdXN0b21JbnNwZWN0KSB7XHJcbiAgICAgICAgaWYgKGluc3BlY3RTeW1ib2wgJiYgdHlwZW9mIG9ialtpbnNwZWN0U3ltYm9sXSA9PT0gXCJmdW5jdGlvblwiICYmIHV0aWxJbnNwZWN0KSB7XHJcbiAgICAgICAgICByZXR1cm4gdXRpbEluc3BlY3Qob2JqLCB7IGRlcHRoOiBtYXhEZXB0aCAtIGRlcHRoIH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY3VzdG9tSW5zcGVjdCAhPT0gXCJzeW1ib2xcIiAmJiB0eXBlb2Ygb2JqLmluc3BlY3QgPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgcmV0dXJuIG9iai5pbnNwZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc01hcChvYmopKSB7XHJcbiAgICAgICAgdmFyIG1hcFBhcnRzID0gW107XHJcbiAgICAgICAgaWYgKG1hcEZvckVhY2gpIHtcclxuICAgICAgICAgIG1hcEZvckVhY2guY2FsbChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICAgICAgbWFwUGFydHMucHVzaChpbnNwZWN0MyhrZXksIG9iaiwgdHJ1ZSkgKyBcIiA9PiBcIiArIGluc3BlY3QzKHZhbHVlLCBvYmopKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29sbGVjdGlvbk9mKFwiTWFwXCIsIG1hcFNpemUuY2FsbChvYmopLCBtYXBQYXJ0cywgaW5kZW50KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNTZXQob2JqKSkge1xyXG4gICAgICAgIHZhciBzZXRQYXJ0cyA9IFtdO1xyXG4gICAgICAgIGlmIChzZXRGb3JFYWNoKSB7XHJcbiAgICAgICAgICBzZXRGb3JFYWNoLmNhbGwob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICBzZXRQYXJ0cy5wdXNoKGluc3BlY3QzKHZhbHVlLCBvYmopKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29sbGVjdGlvbk9mKFwiU2V0XCIsIHNldFNpemUuY2FsbChvYmopLCBzZXRQYXJ0cywgaW5kZW50KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNXZWFrTWFwKG9iaikpIHtcclxuICAgICAgICByZXR1cm4gd2Vha0NvbGxlY3Rpb25PZihcIldlYWtNYXBcIik7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzV2Vha1NldChvYmopKSB7XHJcbiAgICAgICAgcmV0dXJuIHdlYWtDb2xsZWN0aW9uT2YoXCJXZWFrU2V0XCIpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1dlYWtSZWYob2JqKSkge1xyXG4gICAgICAgIHJldHVybiB3ZWFrQ29sbGVjdGlvbk9mKFwiV2Vha1JlZlwiKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNOdW1iZXIob2JqKSkge1xyXG4gICAgICAgIHJldHVybiBtYXJrQm94ZWQoaW5zcGVjdDMoTnVtYmVyKG9iaikpKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNCaWdJbnQob2JqKSkge1xyXG4gICAgICAgIHJldHVybiBtYXJrQm94ZWQoaW5zcGVjdDMoYmlnSW50VmFsdWVPZi5jYWxsKG9iaikpKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNCb29sZWFuKG9iaikpIHtcclxuICAgICAgICByZXR1cm4gbWFya0JveGVkKGJvb2xlYW5WYWx1ZU9mLmNhbGwob2JqKSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzU3RyaW5nKG9iaikpIHtcclxuICAgICAgICByZXR1cm4gbWFya0JveGVkKGluc3BlY3QzKFN0cmluZyhvYmopKSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgJiYgb2JqID09PSB3aW5kb3cpIHtcclxuICAgICAgICByZXR1cm4gXCJ7IFtvYmplY3QgV2luZG93XSB9XCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzICE9PSBcInVuZGVmaW5lZFwiICYmIG9iaiA9PT0gZ2xvYmFsVGhpcyB8fCB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiICYmIG9iaiA9PT0gZ2xvYmFsKSB7XHJcbiAgICAgICAgcmV0dXJuIFwieyBbb2JqZWN0IGdsb2JhbFRoaXNdIH1cIjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIWlzRGF0ZShvYmopICYmICFpc1JlZ0V4cChvYmopKSB7XHJcbiAgICAgICAgdmFyIHlzID0gYXJyT2JqS2V5cyhvYmosIGluc3BlY3QzKTtcclxuICAgICAgICB2YXIgaXNQbGFpbk9iamVjdCA9IGdQTyA/IGdQTyhvYmopID09PSBPYmplY3QucHJvdG90eXBlIDogb2JqIGluc3RhbmNlb2YgT2JqZWN0IHx8IG9iai5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xyXG4gICAgICAgIHZhciBwcm90b1RhZyA9IG9iaiBpbnN0YW5jZW9mIE9iamVjdCA/IFwiXCIgOiBcIm51bGwgcHJvdG90eXBlXCI7XHJcbiAgICAgICAgdmFyIHN0cmluZ1RhZyA9ICFpc1BsYWluT2JqZWN0ICYmIHRvU3RyaW5nVGFnICYmIE9iamVjdChvYmopID09PSBvYmogJiYgdG9TdHJpbmdUYWcgaW4gb2JqID8gJHNsaWNlLmNhbGwodG9TdHIob2JqKSwgOCwgLTEpIDogcHJvdG9UYWcgPyBcIk9iamVjdFwiIDogXCJcIjtcclxuICAgICAgICB2YXIgY29uc3RydWN0b3JUYWcgPSBpc1BsYWluT2JqZWN0IHx8IHR5cGVvZiBvYmouY29uc3RydWN0b3IgIT09IFwiZnVuY3Rpb25cIiA/IFwiXCIgOiBvYmouY29uc3RydWN0b3IubmFtZSA/IG9iai5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgOiBcIlwiO1xyXG4gICAgICAgIHZhciB0YWcgPSBjb25zdHJ1Y3RvclRhZyArIChzdHJpbmdUYWcgfHwgcHJvdG9UYWcgPyBcIltcIiArICRqb2luLmNhbGwoJGNvbmNhdC5jYWxsKFtdLCBzdHJpbmdUYWcgfHwgW10sIHByb3RvVGFnIHx8IFtdKSwgXCI6IFwiKSArIFwiXSBcIiA6IFwiXCIpO1xyXG4gICAgICAgIGlmICh5cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgIHJldHVybiB0YWcgKyBcInt9XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpbmRlbnQpIHtcclxuICAgICAgICAgIHJldHVybiB0YWcgKyBcIntcIiArIGluZGVudGVkSm9pbih5cywgaW5kZW50KSArIFwifVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGFnICsgXCJ7IFwiICsgJGpvaW4uY2FsbCh5cywgXCIsIFwiKSArIFwiIH1cIjtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gU3RyaW5nKG9iaik7XHJcbiAgICB9O1xyXG4gICAgZnVuY3Rpb24gd3JhcFF1b3RlcyhzLCBkZWZhdWx0U3R5bGUsIG9wdHMpIHtcclxuICAgICAgdmFyIHN0eWxlID0gb3B0cy5xdW90ZVN0eWxlIHx8IGRlZmF1bHRTdHlsZTtcclxuICAgICAgdmFyIHF1b3RlQ2hhciA9IHF1b3Rlc1tzdHlsZV07XHJcbiAgICAgIHJldHVybiBxdW90ZUNoYXIgKyBzICsgcXVvdGVDaGFyO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcXVvdGUocykge1xyXG4gICAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChTdHJpbmcocyksIC9cIi9nLCBcIiZxdW90O1wiKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGNhblRydXN0VG9TdHJpbmcob2JqKSB7XHJcbiAgICAgIHJldHVybiAhdG9TdHJpbmdUYWcgfHwgISh0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmICh0b1N0cmluZ1RhZyBpbiBvYmogfHwgdHlwZW9mIG9ialt0b1N0cmluZ1RhZ10gIT09IFwidW5kZWZpbmVkXCIpKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzQXJyYXkob2JqKSB7XHJcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgQXJyYXldXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNEYXRlKG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IERhdGVdXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNSZWdFeHAob2JqKSB7XHJcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgUmVnRXhwXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzRXJyb3Iob2JqKSB7XHJcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgRXJyb3JdXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNTdHJpbmcob2JqKSB7XHJcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgU3RyaW5nXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzTnVtYmVyKG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IE51bWJlcl1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc0Jvb2xlYW4ob2JqKSB7XHJcbiAgICAgIHJldHVybiB0b1N0cihvYmopID09PSBcIltvYmplY3QgQm9vbGVhbl1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc1N5bWJvbChvYmopIHtcclxuICAgICAgaWYgKGhhc1NoYW1tZWRTeW1ib2xzKSB7XHJcbiAgICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmIG9iaiBpbnN0YW5jZW9mIFN5bWJvbDtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJzeW1ib2xcIikge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICghb2JqIHx8IHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIgfHwgIXN5bVRvU3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc3ltVG9TdHJpbmcuY2FsbChvYmopO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNCaWdJbnQob2JqKSB7XHJcbiAgICAgIGlmICghb2JqIHx8IHR5cGVvZiBvYmogIT09IFwib2JqZWN0XCIgfHwgIWJpZ0ludFZhbHVlT2YpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBiaWdJbnRWYWx1ZU9mLmNhbGwob2JqKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciBoYXNPd24yID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSB8fCBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgcmV0dXJuIGtleSBpbiB0aGlzO1xyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIGhhcyhvYmosIGtleSkge1xyXG4gICAgICByZXR1cm4gaGFzT3duMi5jYWxsKG9iaiwga2V5KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHRvU3RyKG9iaikge1xyXG4gICAgICByZXR1cm4gb2JqZWN0VG9TdHJpbmcuY2FsbChvYmopO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbmFtZU9mKGYpIHtcclxuICAgICAgaWYgKGYubmFtZSkge1xyXG4gICAgICAgIHJldHVybiBmLm5hbWU7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIG0gPSAkbWF0Y2guY2FsbChmdW5jdGlvblRvU3RyaW5nLmNhbGwoZiksIC9eZnVuY3Rpb25cXHMqKFtcXHckXSspLyk7XHJcbiAgICAgIGlmIChtKSB7XHJcbiAgICAgICAgcmV0dXJuIG1bMV07XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpbmRleE9mKHhzLCB4KSB7XHJcbiAgICAgIGlmICh4cy5pbmRleE9mKSB7XHJcbiAgICAgICAgcmV0dXJuIHhzLmluZGV4T2YoeCk7XHJcbiAgICAgIH1cclxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB4cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoeHNbaV0gPT09IHgpIHtcclxuICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc01hcCh4KSB7XHJcbiAgICAgIGlmICghbWFwU2l6ZSB8fCAheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIG1hcFNpemUuY2FsbCh4KTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgc2V0U2l6ZS5jYWxsKHgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKHMpIHtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geCBpbnN0YW5jZW9mIE1hcDtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzV2Vha01hcCh4KSB7XHJcbiAgICAgIGlmICghd2Vha01hcEhhcyB8fCAheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHdlYWtNYXBIYXMuY2FsbCh4LCB3ZWFrTWFwSGFzKTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgd2Vha1NldEhhcy5jYWxsKHgsIHdlYWtTZXRIYXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggKHMpIHtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4geCBpbnN0YW5jZW9mIFdlYWtNYXA7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc1dlYWtSZWYoeCkge1xyXG4gICAgICBpZiAoIXdlYWtSZWZEZXJlZiB8fCAheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHdlYWtSZWZEZXJlZi5jYWxsKHgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNTZXQoeCkge1xyXG4gICAgICBpZiAoIXNldFNpemUgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBzZXRTaXplLmNhbGwoeCk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIG1hcFNpemUuY2FsbCh4KTtcclxuICAgICAgICB9IGNhdGNoIChtKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBTZXQ7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc1dlYWtTZXQoeCkge1xyXG4gICAgICBpZiAoIXdlYWtTZXRIYXMgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgdHJ5IHtcclxuICAgICAgICB3ZWFrU2V0SGFzLmNhbGwoeCwgd2Vha1NldEhhcyk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHdlYWtNYXBIYXMuY2FsbCh4LCB3ZWFrTWFwSGFzKTtcclxuICAgICAgICB9IGNhdGNoIChzKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBXZWFrU2V0O1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNFbGVtZW50KHgpIHtcclxuICAgICAgaWYgKCF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2YgSFRNTEVsZW1lbnQgIT09IFwidW5kZWZpbmVkXCIgJiYgeCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHR5cGVvZiB4Lm5vZGVOYW1lID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiB4LmdldEF0dHJpYnV0ZSA9PT0gXCJmdW5jdGlvblwiO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaW5zcGVjdFN0cmluZyhzdHIsIG9wdHMpIHtcclxuICAgICAgaWYgKHN0ci5sZW5ndGggPiBvcHRzLm1heFN0cmluZ0xlbmd0aCkge1xyXG4gICAgICAgIHZhciByZW1haW5pbmcgPSBzdHIubGVuZ3RoIC0gb3B0cy5tYXhTdHJpbmdMZW5ndGg7XHJcbiAgICAgICAgdmFyIHRyYWlsZXIgPSBcIi4uLiBcIiArIHJlbWFpbmluZyArIFwiIG1vcmUgY2hhcmFjdGVyXCIgKyAocmVtYWluaW5nID4gMSA/IFwic1wiIDogXCJcIik7XHJcbiAgICAgICAgcmV0dXJuIGluc3BlY3RTdHJpbmcoJHNsaWNlLmNhbGwoc3RyLCAwLCBvcHRzLm1heFN0cmluZ0xlbmd0aCksIG9wdHMpICsgdHJhaWxlcjtcclxuICAgICAgfVxyXG4gICAgICB2YXIgcXVvdGVSRSA9IHF1b3RlUkVzW29wdHMucXVvdGVTdHlsZSB8fCBcInNpbmdsZVwiXTtcclxuICAgICAgcXVvdGVSRS5sYXN0SW5kZXggPSAwO1xyXG4gICAgICB2YXIgcyA9ICRyZXBsYWNlLmNhbGwoJHJlcGxhY2UuY2FsbChzdHIsIHF1b3RlUkUsIFwiXFxcXCQxXCIpLCAvW1xceDAwLVxceDFmXS9nLCBsb3dieXRlKTtcclxuICAgICAgcmV0dXJuIHdyYXBRdW90ZXMocywgXCJzaW5nbGVcIiwgb3B0cyk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBsb3dieXRlKGMpIHtcclxuICAgICAgdmFyIG4gPSBjLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgIHZhciB4ID0ge1xyXG4gICAgICAgIDg6IFwiYlwiLFxyXG4gICAgICAgIDk6IFwidFwiLFxyXG4gICAgICAgIDEwOiBcIm5cIixcclxuICAgICAgICAxMjogXCJmXCIsXHJcbiAgICAgICAgMTM6IFwiclwiXHJcbiAgICAgIH1bbl07XHJcbiAgICAgIGlmICh4KSB7XHJcbiAgICAgICAgcmV0dXJuIFwiXFxcXFwiICsgeDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gXCJcXFxceFwiICsgKG4gPCAxNiA/IFwiMFwiIDogXCJcIikgKyAkdG9VcHBlckNhc2UuY2FsbChuLnRvU3RyaW5nKDE2KSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBtYXJrQm94ZWQoc3RyKSB7XHJcbiAgICAgIHJldHVybiBcIk9iamVjdChcIiArIHN0ciArIFwiKVwiO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gd2Vha0NvbGxlY3Rpb25PZih0eXBlKSB7XHJcbiAgICAgIHJldHVybiB0eXBlICsgXCIgeyA/IH1cIjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGNvbGxlY3Rpb25PZih0eXBlLCBzaXplLCBlbnRyaWVzLCBpbmRlbnQpIHtcclxuICAgICAgdmFyIGpvaW5lZEVudHJpZXMgPSBpbmRlbnQgPyBpbmRlbnRlZEpvaW4oZW50cmllcywgaW5kZW50KSA6ICRqb2luLmNhbGwoZW50cmllcywgXCIsIFwiKTtcclxuICAgICAgcmV0dXJuIHR5cGUgKyBcIiAoXCIgKyBzaXplICsgXCIpIHtcIiArIGpvaW5lZEVudHJpZXMgKyBcIn1cIjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHNpbmdsZUxpbmVWYWx1ZXMoeHMpIHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChpbmRleE9mKHhzW2ldLCBcIlxcblwiKSA+PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZ2V0SW5kZW50KG9wdHMsIGRlcHRoKSB7XHJcbiAgICAgIHZhciBiYXNlSW5kZW50O1xyXG4gICAgICBpZiAob3B0cy5pbmRlbnQgPT09IFwiXHRcIikge1xyXG4gICAgICAgIGJhc2VJbmRlbnQgPSBcIlx0XCI7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdHMuaW5kZW50ID09PSBcIm51bWJlclwiICYmIG9wdHMuaW5kZW50ID4gMCkge1xyXG4gICAgICAgIGJhc2VJbmRlbnQgPSAkam9pbi5jYWxsKEFycmF5KG9wdHMuaW5kZW50ICsgMSksIFwiIFwiKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGJhc2U6IGJhc2VJbmRlbnQsXHJcbiAgICAgICAgcHJldjogJGpvaW4uY2FsbChBcnJheShkZXB0aCArIDEpLCBiYXNlSW5kZW50KVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaW5kZW50ZWRKb2luKHhzLCBpbmRlbnQpIHtcclxuICAgICAgaWYgKHhzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBsaW5lSm9pbmVyID0gXCJcXG5cIiArIGluZGVudC5wcmV2ICsgaW5kZW50LmJhc2U7XHJcbiAgICAgIHJldHVybiBsaW5lSm9pbmVyICsgJGpvaW4uY2FsbCh4cywgXCIsXCIgKyBsaW5lSm9pbmVyKSArIFwiXFxuXCIgKyBpbmRlbnQucHJldjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGFyck9iaktleXMob2JqLCBpbnNwZWN0Mykge1xyXG4gICAgICB2YXIgaXNBcnIgPSBpc0FycmF5KG9iaik7XHJcbiAgICAgIHZhciB4cyA9IFtdO1xyXG4gICAgICBpZiAoaXNBcnIpIHtcclxuICAgICAgICB4cy5sZW5ndGggPSBvYmoubGVuZ3RoO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICB4c1tpXSA9IGhhcyhvYmosIGkpID8gaW5zcGVjdDMob2JqW2ldLCBvYmopIDogXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHN5bXMgPSB0eXBlb2YgZ09QUyA9PT0gXCJmdW5jdGlvblwiID8gZ09QUyhvYmopIDogW107XHJcbiAgICAgIHZhciBzeW1NYXA7XHJcbiAgICAgIGlmIChoYXNTaGFtbWVkU3ltYm9scykge1xyXG4gICAgICAgIHN5bU1hcCA9IHt9O1xyXG4gICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgc3ltcy5sZW5ndGg7IGsrKykge1xyXG4gICAgICAgICAgc3ltTWFwW1wiJFwiICsgc3ltc1trXV0gPSBzeW1zW2tdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XHJcbiAgICAgICAgaWYgKCFoYXMob2JqLCBrZXkpKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzQXJyICYmIFN0cmluZyhOdW1iZXIoa2V5KSkgPT09IGtleSAmJiBrZXkgPCBvYmoubGVuZ3RoKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhc1NoYW1tZWRTeW1ib2xzICYmIHN5bU1hcFtcIiRcIiArIGtleV0gaW5zdGFuY2VvZiBTeW1ib2wpIHtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoJHRlc3QuY2FsbCgvW15cXHckXS8sIGtleSkpIHtcclxuICAgICAgICAgIHhzLnB1c2goaW5zcGVjdDMoa2V5LCBvYmopICsgXCI6IFwiICsgaW5zcGVjdDMob2JqW2tleV0sIG9iaikpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB4cy5wdXNoKGtleSArIFwiOiBcIiArIGluc3BlY3QzKG9ialtrZXldLCBvYmopKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBnT1BTID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN5bXMubGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgIGlmIChpc0VudW1lcmFibGUuY2FsbChvYmosIHN5bXNbal0pKSB7XHJcbiAgICAgICAgICAgIHhzLnB1c2goXCJbXCIgKyBpbnNwZWN0MyhzeW1zW2pdKSArIFwiXTogXCIgKyBpbnNwZWN0MyhvYmpbc3ltc1tqXV0sIG9iaikpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4geHM7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIHNyYy9saWIvdGltZV9kdXJhdGlvbi50c1xyXG52YXIgVGltZUR1cmF0aW9uID0gY2xhc3MgX1RpbWVEdXJhdGlvbiB7XHJcbiAgX190aW1lX2R1cmF0aW9uX21pY3Jvc19fO1xyXG4gIHN0YXRpYyBNSUNST1NfUEVSX01JTExJUyA9IDEwMDBuO1xyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHtAbGluayBUaW1lRHVyYXRpb259IHR5cGUuXHJcbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRBbGdlYnJhaWNUeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XHJcbiAgICAgIGVsZW1lbnRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJfX3RpbWVfZHVyYXRpb25fbWljcm9zX19cIixcclxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IEFsZ2VicmFpY1R5cGUuSTY0XHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9KTtcclxuICB9XHJcbiAgc3RhdGljIGlzVGltZUR1cmF0aW9uKGFsZ2VicmFpY1R5cGUpIHtcclxuICAgIGlmIChhbGdlYnJhaWNUeXBlLnRhZyAhPT0gXCJQcm9kdWN0XCIpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZWxlbWVudHMgPSBhbGdlYnJhaWNUeXBlLnZhbHVlLmVsZW1lbnRzO1xyXG4gICAgaWYgKGVsZW1lbnRzLmxlbmd0aCAhPT0gMSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBjb25zdCBtaWNyb3NFbGVtZW50ID0gZWxlbWVudHNbMF07XHJcbiAgICByZXR1cm4gbWljcm9zRWxlbWVudC5uYW1lID09PSBcIl9fdGltZV9kdXJhdGlvbl9taWNyb3NfX1wiICYmIG1pY3Jvc0VsZW1lbnQuYWxnZWJyYWljVHlwZS50YWcgPT09IFwiSTY0XCI7XHJcbiAgfVxyXG4gIGdldCBtaWNyb3MoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fX3RpbWVfZHVyYXRpb25fbWljcm9zX187XHJcbiAgfVxyXG4gIGdldCBtaWxsaXMoKSB7XHJcbiAgICByZXR1cm4gTnVtYmVyKHRoaXMubWljcm9zIC8gX1RpbWVEdXJhdGlvbi5NSUNST1NfUEVSX01JTExJUyk7XHJcbiAgfVxyXG4gIGNvbnN0cnVjdG9yKG1pY3Jvcykge1xyXG4gICAgdGhpcy5fX3RpbWVfZHVyYXRpb25fbWljcm9zX18gPSBtaWNyb3M7XHJcbiAgfVxyXG4gIHN0YXRpYyBmcm9tTWlsbGlzKG1pbGxpcykge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uKEJpZ0ludChtaWxsaXMpICogX1RpbWVEdXJhdGlvbi5NSUNST1NfUEVSX01JTExJUyk7XHJcbiAgfVxyXG4gIC8qKiBUaGlzIG91dHB1dHMgdGhlIHNhbWUgc3RyaW5nIGZvcm1hdCB0aGF0IHdlIHVzZSBpbiB0aGUgaG9zdCBhbmQgaW4gUnVzdCBtb2R1bGVzICovXHJcbiAgdG9TdHJpbmcoKSB7XHJcbiAgICBjb25zdCBtaWNyb3MgPSB0aGlzLm1pY3JvcztcclxuICAgIGNvbnN0IHNpZ24gPSBtaWNyb3MgPCAwID8gXCItXCIgOiBcIitcIjtcclxuICAgIGNvbnN0IHBvcyA9IG1pY3JvcyA8IDAgPyAtbWljcm9zIDogbWljcm9zO1xyXG4gICAgY29uc3Qgc2VjcyA9IHBvcyAvIDEwMDAwMDBuO1xyXG4gICAgY29uc3QgbWljcm9zX3JlbWFpbmluZyA9IHBvcyAlIDEwMDAwMDBuO1xyXG4gICAgcmV0dXJuIGAke3NpZ259JHtzZWNzfS4ke1N0cmluZyhtaWNyb3NfcmVtYWluaW5nKS5wYWRTdGFydCg2LCBcIjBcIil9YDtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL3RpbWVzdGFtcC50c1xyXG52YXIgVGltZXN0YW1wID0gY2xhc3MgX1RpbWVzdGFtcCB7XHJcbiAgX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcclxuICBzdGF0aWMgTUlDUk9TX1BFUl9NSUxMSVMgPSAxMDAwbjtcclxuICBnZXQgbWljcm9zU2luY2VVbml4RXBvY2goKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xyXG4gIH1cclxuICBjb25zdHJ1Y3RvcihtaWNyb3MpIHtcclxuICAgIHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXyA9IG1pY3JvcztcclxuICB9XHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUge0BsaW5rIFRpbWVzdGFtcH0gdHlwZS5cclxuICAgKiBAcmV0dXJucyBUaGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHR5cGUuXHJcbiAgICovXHJcbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcclxuICAgICAgZWxlbWVudHM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBuYW1lOiBcIl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19cIixcclxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IEFsZ2VicmFpY1R5cGUuSTY0XHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9KTtcclxuICB9XHJcbiAgc3RhdGljIGlzVGltZXN0YW1wKGFsZ2VicmFpY1R5cGUpIHtcclxuICAgIGlmIChhbGdlYnJhaWNUeXBlLnRhZyAhPT0gXCJQcm9kdWN0XCIpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZWxlbWVudHMgPSBhbGdlYnJhaWNUeXBlLnZhbHVlLmVsZW1lbnRzO1xyXG4gICAgaWYgKGVsZW1lbnRzLmxlbmd0aCAhPT0gMSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBjb25zdCBtaWNyb3NFbGVtZW50ID0gZWxlbWVudHNbMF07XHJcbiAgICByZXR1cm4gbWljcm9zRWxlbWVudC5uYW1lID09PSBcIl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19cIiAmJiBtaWNyb3NFbGVtZW50LmFsZ2VicmFpY1R5cGUudGFnID09PSBcIkk2NFwiO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBUaGUgVW5peCBlcG9jaCwgdGhlIG1pZG5pZ2h0IGF0IHRoZSBiZWdpbm5pbmcgb2YgSmFudWFyeSAxLCAxOTcwLCBVVEMuXHJcbiAgICovXHJcbiAgc3RhdGljIFVOSVhfRVBPQ0ggPSBuZXcgX1RpbWVzdGFtcCgwbik7XHJcbiAgLyoqXHJcbiAgICogR2V0IGEgYFRpbWVzdGFtcGAgcmVwcmVzZW50aW5nIHRoZSBleGVjdXRpb24gZW52aXJvbm1lbnQncyBiZWxpZWYgb2YgdGhlIGN1cnJlbnQgbW9tZW50IGluIHRpbWUuXHJcbiAgICovXHJcbiAgc3RhdGljIG5vdygpIHtcclxuICAgIHJldHVybiBfVGltZXN0YW1wLmZyb21EYXRlKC8qIEBfX1BVUkVfXyAqLyBuZXcgRGF0ZSgpKTtcclxuICB9XHJcbiAgLyoqIENvbnZlcnQgdG8gbWlsbGlzZWNvbmRzIHNpbmNlIFVuaXggZXBvY2guICovXHJcbiAgdG9NaWxsaXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5taWNyb3NTaW5jZVVuaXhFcG9jaCAvIDEwMDBuO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBHZXQgYSBgVGltZXN0YW1wYCByZXByZXNlbnRpbmcgdGhlIHNhbWUgcG9pbnQgaW4gdGltZSBhcyBgZGF0ZWAuXHJcbiAgICovXHJcbiAgc3RhdGljIGZyb21EYXRlKGRhdGUpIHtcclxuICAgIGNvbnN0IG1pbGxpcyA9IGRhdGUuZ2V0VGltZSgpO1xyXG4gICAgY29uc3QgbWljcm9zID0gQmlnSW50KG1pbGxpcykgKiBfVGltZXN0YW1wLk1JQ1JPU19QRVJfTUlMTElTO1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wKG1pY3Jvcyk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEdldCBhIGBEYXRlYCByZXByZXNlbnRpbmcgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBwb2ludCBpbiB0aW1lIGFzIGB0aGlzYC5cclxuICAgKlxyXG4gICAqIFRoaXMgbWV0aG9kIHRydW5jYXRlcyB0byBtaWxsaXNlY29uZCBwcmVjaXNpb24sXHJcbiAgICogYW5kIHRocm93cyBgUmFuZ2VFcnJvcmAgaWYgdGhlIGBUaW1lc3RhbXBgIGlzIG91dHNpZGUgdGhlIHJhbmdlIHJlcHJlc2VudGFibGUgYXMgYSBgRGF0ZWAuXHJcbiAgICovXHJcbiAgdG9EYXRlKCkge1xyXG4gICAgY29uc3QgbWljcm9zID0gdGhpcy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xyXG4gICAgY29uc3QgbWlsbGlzID0gbWljcm9zIC8gX1RpbWVzdGFtcC5NSUNST1NfUEVSX01JTExJUztcclxuICAgIGlmIChtaWxsaXMgPiBCaWdJbnQoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHx8IG1pbGxpcyA8IEJpZ0ludChOdW1iZXIuTUlOX1NBRkVfSU5URUdFUikpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXHJcbiAgICAgICAgXCJUaW1lc3RhbXAgaXMgb3V0c2lkZSBvZiB0aGUgcmVwcmVzZW50YWJsZSByYW5nZSBvZiBKUydzIERhdGVcIlxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBEYXRlKE51bWJlcihtaWxsaXMpKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogR2V0IGFuIElTTyA4NjAxIC8gUkZDIDMzMzkgZm9ybWF0dGVkIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHRpbWVzdGFtcCB3aXRoIG1pY3Jvc2Vjb25kIHByZWNpc2lvbi5cclxuICAgKlxyXG4gICAqIFRoaXMgbWV0aG9kIHByZXNlcnZlcyB0aGUgZnVsbCBtaWNyb3NlY29uZCBwcmVjaXNpb24gb2YgdGhlIHRpbWVzdGFtcCxcclxuICAgKiBhbmQgdGhyb3dzIGBSYW5nZUVycm9yYCBpZiB0aGUgYFRpbWVzdGFtcGAgaXMgb3V0c2lkZSB0aGUgcmFuZ2UgcmVwcmVzZW50YWJsZSBpbiBJU08gZm9ybWF0LlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgSVNPIDg2MDEgZm9ybWF0dGVkIHN0cmluZyB3aXRoIG1pY3Jvc2Vjb25kIHByZWNpc2lvbiAoZS5nLiwgJzIwMjUtMDItMTdUMTA6MzA6NDUuMTIzNDU2WicpXHJcbiAgICovXHJcbiAgdG9JU09TdHJpbmcoKSB7XHJcbiAgICBjb25zdCBtaWNyb3MgPSB0aGlzLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX187XHJcbiAgICBjb25zdCBtaWxsaXMgPSBtaWNyb3MgLyBfVGltZXN0YW1wLk1JQ1JPU19QRVJfTUlMTElTO1xyXG4gICAgaWYgKG1pbGxpcyA+IEJpZ0ludChOdW1iZXIuTUFYX1NBRkVfSU5URUdFUikgfHwgbWlsbGlzIDwgQmlnSW50KE51bWJlci5NSU5fU0FGRV9JTlRFR0VSKSkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcclxuICAgICAgICBcIlRpbWVzdGFtcCBpcyBvdXRzaWRlIG9mIHRoZSByZXByZXNlbnRhYmxlIHJhbmdlIGZvciBJU08gc3RyaW5nIGZvcm1hdHRpbmdcIlxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKE51bWJlcihtaWxsaXMpKTtcclxuICAgIGNvbnN0IGlzb0Jhc2UgPSBkYXRlLnRvSVNPU3RyaW5nKCk7XHJcbiAgICBjb25zdCBtaWNyb3NSZW1haW5kZXIgPSBNYXRoLmFicyhOdW1iZXIobWljcm9zICUgMTAwMDAwMG4pKTtcclxuICAgIGNvbnN0IGZyYWN0aW9uYWxQYXJ0ID0gU3RyaW5nKG1pY3Jvc1JlbWFpbmRlcikucGFkU3RhcnQoNiwgXCIwXCIpO1xyXG4gICAgcmV0dXJuIGlzb0Jhc2UucmVwbGFjZSgvXFwuXFxkezN9WiQvLCBgLiR7ZnJhY3Rpb25hbFBhcnR9WmApO1xyXG4gIH1cclxuICBzaW5jZShvdGhlcikge1xyXG4gICAgcmV0dXJuIG5ldyBUaW1lRHVyYXRpb24oXHJcbiAgICAgIHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXyAtIG90aGVyLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX19cclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2xpYi91dWlkLnRzXHJcbnZhciBVdWlkID0gY2xhc3MgX1V1aWQge1xyXG4gIF9fdXVpZF9fO1xyXG4gIC8qKlxyXG4gICAqIFRoZSBuaWwgVVVJRCAoYWxsIHplcm9zKS5cclxuICAgKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogYGBgdHNcclxuICAgKiBjb25zdCB1dWlkID0gVXVpZC5OSUw7XHJcbiAgICogY29uc29sZS5hc3NlcnQoXHJcbiAgICogICB1dWlkLnRvU3RyaW5nKCkgPT09IFwiMDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwXCJcclxuICAgKiApO1xyXG4gICAqIGBgYFxyXG4gICAqL1xyXG4gIHN0YXRpYyBOSUwgPSBuZXcgX1V1aWQoMG4pO1xyXG4gIHN0YXRpYyBNQVhfVVVJRF9CSUdJTlQgPSAweGZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmbjtcclxuICAvKipcclxuICAgKiBUaGUgbWF4IFVVSUQgKGFsbCBvbmVzKS5cclxuICAgKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogYGBgdHNcclxuICAgKiBjb25zdCB1dWlkID0gVXVpZC5NQVg7XHJcbiAgICogY29uc29sZS5hc3NlcnQoXHJcbiAgICogICB1dWlkLnRvU3RyaW5nKCkgPT09IFwiZmZmZmZmZmYtZmZmZi1mZmZmLWZmZmYtZmZmZmZmZmZmZmZmXCJcclxuICAgKiApO1xyXG4gICAqIGBgYFxyXG4gICAqL1xyXG4gIHN0YXRpYyBNQVggPSBuZXcgX1V1aWQoX1V1aWQuTUFYX1VVSURfQklHSU5UKTtcclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBVVUlEIGZyb20gYSByYXcgMTI4LWJpdCB2YWx1ZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB1IC0gVW5zaWduZWQgMTI4LWJpdCBpbnRlZ2VyXHJcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSB2YWx1ZSBpcyBvdXRzaWRlIHRoZSB2YWxpZCBVVUlEIHJhbmdlXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IodSkge1xyXG4gICAgaWYgKHUgPCAwbiB8fCB1ID4gX1V1aWQuTUFYX1VVSURfQklHSU5UKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgVVVJRDogbXVzdCBiZSBiZXR3ZWVuIDAgYW5kIGBNQVhfVVVJRF9CSUdJTlRgXCIpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fX3V1aWRfXyA9IHU7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIFVVSUQgYHY0YCBmcm9tIGV4cGxpY2l0IHJhbmRvbSBieXRlcy5cclxuICAgKlxyXG4gICAqIFRoaXMgbWV0aG9kIGFzc3VtZXMgdGhlIGJ5dGVzIGFyZSBhbHJlYWR5IHN1ZmZpY2llbnRseSByYW5kb20uXHJcbiAgICogSXQgb25seSBzZXRzIHRoZSBhcHByb3ByaWF0ZSBiaXRzIGZvciB0aGUgVVVJRCB2ZXJzaW9uIGFuZCB2YXJpYW50LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGJ5dGVzIC0gRXhhY3RseSAxNiByYW5kb20gYnl0ZXNcclxuICAgKiBAcmV0dXJucyBBIFVVSUQgYHY0YFxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiBgYnl0ZXMubGVuZ3RoICE9PSAxNmBcclxuICAgKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogYGBgdHNcclxuICAgKiBjb25zdCByYW5kb21CeXRlcyA9IG5ldyBVaW50OEFycmF5KDE2KTtcclxuICAgKiBjb25zdCB1dWlkID0gVXVpZC5mcm9tUmFuZG9tQnl0ZXNWNChyYW5kb21CeXRlcyk7XHJcbiAgICpcclxuICAgKiBjb25zb2xlLmFzc2VydChcclxuICAgKiAgIHV1aWQudG9TdHJpbmcoKSA9PT0gXCIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDBcIlxyXG4gICAqICk7XHJcbiAgICogYGBgXHJcbiAgICovXHJcbiAgc3RhdGljIGZyb21SYW5kb21CeXRlc1Y0KGJ5dGVzKSB7XHJcbiAgICBpZiAoYnl0ZXMubGVuZ3RoICE9PSAxNikgdGhyb3cgbmV3IEVycm9yKFwiVVVJRCB2NCByZXF1aXJlcyAxNiBieXRlc1wiKTtcclxuICAgIGNvbnN0IGFyciA9IG5ldyBVaW50OEFycmF5KGJ5dGVzKTtcclxuICAgIGFycls2XSA9IGFycls2XSAmIDE1IHwgNjQ7XHJcbiAgICBhcnJbOF0gPSBhcnJbOF0gJiA2MyB8IDEyODtcclxuICAgIHJldHVybiBuZXcgX1V1aWQoX1V1aWQuYnl0ZXNUb0JpZ0ludChhcnIpKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogR2VuZXJhdGUgYSBVVUlEIGB2N2AgdXNpbmcgYSBtb25vdG9uaWMgY291bnRlciBmcm9tIGAwYCB0byBgMl4zMSAtIDFgLFxyXG4gICAqIGEgdGltZXN0YW1wLCBhbmQgNCByYW5kb20gYnl0ZXMuXHJcbiAgICpcclxuICAgKiBUaGUgY291bnRlciB3cmFwcyBhcm91bmQgb24gb3ZlcmZsb3cuXHJcbiAgICpcclxuICAgKiBUaGUgVVVJRCBgdjdgIGlzIHN0cnVjdHVyZWQgYXMgZm9sbG93czpcclxuICAgKlxyXG4gICAqIGBgYGFzY2lpXHJcbiAgICog4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXHJcbiAgICogfCBCMCAgfCBCMSAgfCBCMiAgfCBCMyAgfCBCNCAgfCBCNSAgICAgICAgICAgICAgfCAgICAgICAgIEI2ICAgICAgICB8XHJcbiAgICog4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkXHJcbiAgICogfCAgICAgICAgICAgICAgICAgdW5peF90c19tcyAgICAgICAgICAgICAgICAgICAgfCAgICAgIHZlcnNpb24gNyAgICB8XHJcbiAgICog4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXHJcbiAgICog4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSs4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQXHJcbiAgICogfCBCNyAgICAgICAgICAgfCBCOCAgICAgIHwgQjkgIHwgQjEwIHwgQjExICB8IEIxMiB8IEIxMyB8IEIxNCB8IEIxNSB8XHJcbiAgICog4pSc4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS84pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSkXHJcbiAgICogfCBjb3VudGVyX2hpZ2ggfCB2YXJpYW50IHwgICAgY291bnRlcl9sb3cgICB8ICAgICAgICByYW5kb20gICAgICAgICB8XHJcbiAgICog4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pS04pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYXHJcbiAgICogYGBgXHJcbiAgICpcclxuICAgKiBAcGFyYW0gY291bnRlciAtIE11dGFibGUgbW9ub3RvbmljIGNvdW50ZXIgKDMxLWJpdClcclxuICAgKiBAcGFyYW0gbm93IC0gVGltZXN0YW1wIHNpbmNlIHRoZSBVbml4IGVwb2NoXHJcbiAgICogQHBhcmFtIHJhbmRvbUJ5dGVzIC0gRXhhY3RseSA0IHJhbmRvbSBieXRlc1xyXG4gICAqIEByZXR1cm5zIEEgVVVJRCBgdjdgXHJcbiAgICpcclxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIGBjb3VudGVyYCBpcyBuZWdhdGl2ZVxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgYHRpbWVzdGFtcGAgaXMgYmVmb3JlIHRoZSBVbml4IGVwb2NoXHJcbiAgICogQHRocm93cyB7RXJyb3J9IElmIGByYW5kb21CeXRlcy5sZW5ndGggIT09IDRgXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIGBgYHRzXHJcbiAgICogY29uc3Qgbm93ID0gVGltZXN0YW1wLmZyb21NaWxsaXMoMV82ODZfMDAwXzAwMF8wMDBuKTtcclxuICAgKiBjb25zdCBjb3VudGVyID0geyB2YWx1ZTogMSB9O1xyXG4gICAqIGNvbnN0IHJhbmRvbUJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoNCk7XHJcbiAgICpcclxuICAgKiBjb25zdCB1dWlkID0gVXVpZC5mcm9tQ291bnRlclY3KGNvdW50ZXIsIG5vdywgcmFuZG9tQnl0ZXMpO1xyXG4gICAqXHJcbiAgICogY29uc29sZS5hc3NlcnQoXHJcbiAgICogICB1dWlkLnRvU3RyaW5nKCkgPT09IFwiMDAwMDY0N2UtNTE4MC03MDAwLTgwMDAtMDAwMjAwMDAwMDAwXCJcclxuICAgKiApO1xyXG4gICAqIGBgYFxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tQ291bnRlclY3KGNvdW50ZXIsIG5vdywgcmFuZG9tQnl0ZXMpIHtcclxuICAgIGlmIChyYW5kb21CeXRlcy5sZW5ndGggIT09IDQpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYGZyb21Db3VudGVyVjdgIHJlcXVpcmVzIGByYW5kb21CeXRlcy5sZW5ndGggPT0gNGBcIik7XHJcbiAgICB9XHJcbiAgICBpZiAoY291bnRlci52YWx1ZSA8IDApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYGZyb21Db3VudGVyVjdgIHV1aWQgYGNvdW50ZXJgIG11c3QgYmUgbm9uLW5lZ2F0aXZlXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKG5vdy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fIDwgMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJgZnJvbUNvdW50ZXJWN2AgYHRpbWVzdGFtcGAgYmVmb3JlIHVuaXggZXBvY2hcIik7XHJcbiAgICB9XHJcbiAgICBjb25zdCBjb3VudGVyVmFsID0gY291bnRlci52YWx1ZTtcclxuICAgIGNvdW50ZXIudmFsdWUgPSBjb3VudGVyVmFsICsgMSAmIDIxNDc0ODM2NDc7XHJcbiAgICBjb25zdCB0c01zID0gbm93LnRvTWlsbGlzKCkgJiAweGZmZmZmZmZmZmZmZm47XHJcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KDE2KTtcclxuICAgIGJ5dGVzWzBdID0gTnVtYmVyKHRzTXMgPj4gNDBuICYgMHhmZm4pO1xyXG4gICAgYnl0ZXNbMV0gPSBOdW1iZXIodHNNcyA+PiAzMm4gJiAweGZmbik7XHJcbiAgICBieXRlc1syXSA9IE51bWJlcih0c01zID4+IDI0biAmIDB4ZmZuKTtcclxuICAgIGJ5dGVzWzNdID0gTnVtYmVyKHRzTXMgPj4gMTZuICYgMHhmZm4pO1xyXG4gICAgYnl0ZXNbNF0gPSBOdW1iZXIodHNNcyA+PiA4biAmIDB4ZmZuKTtcclxuICAgIGJ5dGVzWzVdID0gTnVtYmVyKHRzTXMgJiAweGZmbik7XHJcbiAgICBieXRlc1s3XSA9IGNvdW50ZXJWYWwgPj4+IDIzICYgMjU1O1xyXG4gICAgYnl0ZXNbOV0gPSBjb3VudGVyVmFsID4+PiAxNSAmIDI1NTtcclxuICAgIGJ5dGVzWzEwXSA9IGNvdW50ZXJWYWwgPj4+IDcgJiAyNTU7XHJcbiAgICBieXRlc1sxMV0gPSAoY291bnRlclZhbCAmIDEyNykgPDwgMSAmIDI1NTtcclxuICAgIGJ5dGVzWzEyXSB8PSByYW5kb21CeXRlc1swXSAmIDEyNztcclxuICAgIGJ5dGVzWzEzXSA9IHJhbmRvbUJ5dGVzWzFdO1xyXG4gICAgYnl0ZXNbMTRdID0gcmFuZG9tQnl0ZXNbMl07XHJcbiAgICBieXRlc1sxNV0gPSByYW5kb21CeXRlc1szXTtcclxuICAgIGJ5dGVzWzZdID0gYnl0ZXNbNl0gJiAxNSB8IDExMjtcclxuICAgIGJ5dGVzWzhdID0gYnl0ZXNbOF0gJiA2MyB8IDEyODtcclxuICAgIHJldHVybiBuZXcgX1V1aWQoX1V1aWQuYnl0ZXNUb0JpZ0ludChieXRlcykpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBQYXJzZSBhIFVVSUQgZnJvbSBhIHN0cmluZyByZXByZXNlbnRhdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBzIC0gVVVJRCBzdHJpbmdcclxuICAgKiBAcmV0dXJucyBQYXJzZWQgVVVJRFxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgc3RyaW5nIGlzIG5vdCBhIHZhbGlkIFVVSURcclxuICAgKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogYGBgdHNcclxuICAgKiBjb25zdCBzID0gXCIwMTg4OGQ2ZS01YzAwLTcwMDAtODAwMC0wMDAwMDAwMDAwMDBcIjtcclxuICAgKiBjb25zdCB1dWlkID0gVXVpZC5wYXJzZShzKTtcclxuICAgKlxyXG4gICAqIGNvbnNvbGUuYXNzZXJ0KHV1aWQudG9TdHJpbmcoKSA9PT0gcyk7XHJcbiAgICogYGBgXHJcbiAgICovXHJcbiAgc3RhdGljIHBhcnNlKHMpIHtcclxuICAgIGNvbnN0IGhleCA9IHMucmVwbGFjZSgvLS9nLCBcIlwiKTtcclxuICAgIGlmIChoZXgubGVuZ3RoICE9PSAzMikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBoZXggVVVJRFwiKTtcclxuICAgIGxldCB2ID0gMG47XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDMyOyBpICs9IDIpIHtcclxuICAgICAgdiA9IHYgPDwgOG4gfCBCaWdJbnQocGFyc2VJbnQoaGV4LnNsaWNlKGksIGkgKyAyKSwgMTYpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgX1V1aWQodik7XHJcbiAgfVxyXG4gIC8qKiBDb252ZXJ0IHRvIHN0cmluZyAoaHlwaGVuYXRlZCBmb3JtKS4gKi9cclxuICB0b1N0cmluZygpIHtcclxuICAgIGNvbnN0IGJ5dGVzID0gX1V1aWQuYmlnSW50VG9CeXRlcyh0aGlzLl9fdXVpZF9fKTtcclxuICAgIGNvbnN0IGhleCA9IFsuLi5ieXRlc10ubWFwKChiKSA9PiBiLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCBcIjBcIikpLmpvaW4oXCJcIik7XHJcbiAgICByZXR1cm4gaGV4LnNsaWNlKDAsIDgpICsgXCItXCIgKyBoZXguc2xpY2UoOCwgMTIpICsgXCItXCIgKyBoZXguc2xpY2UoMTIsIDE2KSArIFwiLVwiICsgaGV4LnNsaWNlKDE2LCAyMCkgKyBcIi1cIiArIGhleC5zbGljZSgyMCk7XHJcbiAgfVxyXG4gIC8qKiBDb252ZXJ0IHRvIGJpZ2ludCAodTEyOCkuICovXHJcbiAgYXNCaWdJbnQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fX3V1aWRfXztcclxuICB9XHJcbiAgLyoqIFJldHVybiBhIGBVaW50OEFycmF5YCBvZiAxNiBieXRlcy4gKi9cclxuICB0b0J5dGVzKCkge1xyXG4gICAgcmV0dXJuIF9VdWlkLmJpZ0ludFRvQnl0ZXModGhpcy5fX3V1aWRfXyk7XHJcbiAgfVxyXG4gIHN0YXRpYyBieXRlc1RvQmlnSW50KGJ5dGVzKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gMG47XHJcbiAgICBmb3IgKGNvbnN0IGIgb2YgYnl0ZXMpIHJlc3VsdCA9IHJlc3VsdCA8PCA4biB8IEJpZ0ludChiKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG4gIHN0YXRpYyBiaWdJbnRUb0J5dGVzKHZhbHVlKSB7XHJcbiAgICBjb25zdCBieXRlcyA9IG5ldyBVaW50OEFycmF5KDE2KTtcclxuICAgIGZvciAobGV0IGkgPSAxNTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgYnl0ZXNbaV0gPSBOdW1iZXIodmFsdWUgJiAweGZmbik7XHJcbiAgICAgIHZhbHVlID4+PSA4bjtcclxuICAgIH1cclxuICAgIHJldHVybiBieXRlcztcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgdmVyc2lvbiBvZiB0aGlzIFVVSUQuXHJcbiAgICpcclxuICAgKiBUaGlzIHJlcHJlc2VudHMgdGhlIGFsZ29yaXRobSB1c2VkIHRvIGdlbmVyYXRlIHRoZSB2YWx1ZS5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIEEgYFV1aWRWZXJzaW9uYFxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgdmVyc2lvbiBmaWVsZCBpcyBub3QgcmVjb2duaXplZFxyXG4gICAqL1xyXG4gIGdldFZlcnNpb24oKSB7XHJcbiAgICBjb25zdCB2ZXJzaW9uID0gdGhpcy50b0J5dGVzKClbNl0gPj4gNCAmIDE1O1xyXG4gICAgc3dpdGNoICh2ZXJzaW9uKSB7XHJcbiAgICAgIGNhc2UgNDpcclxuICAgICAgICByZXR1cm4gXCJWNFwiO1xyXG4gICAgICBjYXNlIDc6XHJcbiAgICAgICAgcmV0dXJuIFwiVjdcIjtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBpZiAodGhpcyA9PSBfVXVpZC5OSUwpIHtcclxuICAgICAgICAgIHJldHVybiBcIk5pbFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcyA9PSBfVXVpZC5NQVgpIHtcclxuICAgICAgICAgIHJldHVybiBcIk1heFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIFVVSUQgdmVyc2lvbjogJHt2ZXJzaW9ufWApO1xyXG4gICAgfVxyXG4gIH1cclxuICAvKipcclxuICAgKiBFeHRyYWN0IHRoZSBtb25vdG9uaWMgY291bnRlciBmcm9tIGEgVVVJRHY3LlxyXG4gICAqXHJcbiAgICogSW50ZW5kZWQgZm9yIHRlc3RpbmcgYW5kIGRpYWdub3N0aWNzLlxyXG4gICAqIEJlaGF2aW9yIGlzIHVuZGVmaW5lZCBpZiBjYWxsZWQgb24gYSBub24tVjcgVVVJRC5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIDMxLWJpdCBjb3VudGVyIHZhbHVlXHJcbiAgICovXHJcbiAgZ2V0Q291bnRlcigpIHtcclxuICAgIGNvbnN0IGJ5dGVzID0gdGhpcy50b0J5dGVzKCk7XHJcbiAgICBjb25zdCBoaWdoID0gYnl0ZXNbN107XHJcbiAgICBjb25zdCBtaWQxID0gYnl0ZXNbOV07XHJcbiAgICBjb25zdCBtaWQyID0gYnl0ZXNbMTBdO1xyXG4gICAgY29uc3QgbG93ID0gYnl0ZXNbMTFdID4+PiAxO1xyXG4gICAgcmV0dXJuIGhpZ2ggPDwgMjMgfCBtaWQxIDw8IDE1IHwgbWlkMiA8PCA3IHwgbG93IHwgMDtcclxuICB9XHJcbiAgY29tcGFyZVRvKG90aGVyKSB7XHJcbiAgICBpZiAodGhpcy5fX3V1aWRfXyA8IG90aGVyLl9fdXVpZF9fKSByZXR1cm4gLTE7XHJcbiAgICBpZiAodGhpcy5fX3V1aWRfXyA+IG90aGVyLl9fdXVpZF9fKSByZXR1cm4gMTtcclxuICAgIHJldHVybiAwO1xyXG4gIH1cclxuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xyXG4gICAgICBlbGVtZW50czogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIG5hbWU6IFwiX191dWlkX19cIixcclxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IEFsZ2VicmFpY1R5cGUuVTEyOFxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2xpYi9iaW5hcnlfcmVhZGVyLnRzXHJcbnZhciBCaW5hcnlSZWFkZXIgPSBjbGFzcyB7XHJcbiAgLyoqXHJcbiAgICogVGhlIERhdGFWaWV3IHVzZWQgdG8gcmVhZCB2YWx1ZXMgZnJvbSB0aGUgYmluYXJ5IGRhdGEuXHJcbiAgICpcclxuICAgKiBOb3RlOiBUaGUgRGF0YVZpZXcncyBgYnl0ZU9mZnNldGAgaXMgcmVsYXRpdmUgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGVcclxuICAgKiB1bmRlcmx5aW5nIEFycmF5QnVmZmVyLCBub3QgdGhlIHN0YXJ0IG9mIHRoZSBwcm92aWRlZCBVaW50OEFycmF5IGlucHV0LlxyXG4gICAqIFRoaXMgYEJpbmFyeVJlYWRlcmAncyBgI29mZnNldGAgZmllbGQgaXMgdXNlZCB0byB0cmFjayB0aGUgY3VycmVudCByZWFkIHBvc2l0aW9uXHJcbiAgICogcmVsYXRpdmUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBwcm92aWRlZCBVaW50OEFycmF5IGlucHV0LlxyXG4gICAqL1xyXG4gIHZpZXc7XHJcbiAgLyoqXHJcbiAgICogUmVwcmVzZW50cyB0aGUgb2Zmc2V0IChpbiBieXRlcykgcmVsYXRpdmUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBEYXRhVmlld1xyXG4gICAqIGFuZCBwcm92aWRlZCBVaW50OEFycmF5IGlucHV0LlxyXG4gICAqXHJcbiAgICogTm90ZTogVGhpcyBpcyAqbm90KiB0aGUgYWJzb2x1dGUgYnl0ZSBvZmZzZXQgd2l0aGluIHRoZSB1bmRlcmx5aW5nIEFycmF5QnVmZmVyLlxyXG4gICAqL1xyXG4gIG9mZnNldCA9IDA7XHJcbiAgY29uc3RydWN0b3IoaW5wdXQpIHtcclxuICAgIHRoaXMudmlldyA9IGlucHV0IGluc3RhbmNlb2YgRGF0YVZpZXcgPyBpbnB1dCA6IG5ldyBEYXRhVmlldyhpbnB1dC5idWZmZXIsIGlucHV0LmJ5dGVPZmZzZXQsIGlucHV0LmJ5dGVMZW5ndGgpO1xyXG4gICAgdGhpcy5vZmZzZXQgPSAwO1xyXG4gIH1cclxuICByZXNldCh2aWV3KSB7XHJcbiAgICB0aGlzLnZpZXcgPSB2aWV3O1xyXG4gICAgdGhpcy5vZmZzZXQgPSAwO1xyXG4gIH1cclxuICBnZXQgcmVtYWluaW5nKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudmlldy5ieXRlTGVuZ3RoIC0gdGhpcy5vZmZzZXQ7XHJcbiAgfVxyXG4gIC8qKiBFbnN1cmUgd2UgaGF2ZSBhdCBsZWFzdCBgbmAgYnl0ZXMgbGVmdCB0byByZWFkICovXHJcbiAgI2Vuc3VyZShuKSB7XHJcbiAgICBpZiAodGhpcy5vZmZzZXQgKyBuID4gdGhpcy52aWV3LmJ5dGVMZW5ndGgpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXHJcbiAgICAgICAgYFRyaWVkIHRvIHJlYWQgJHtufSBieXRlKHMpIGF0IHJlbGF0aXZlIG9mZnNldCAke3RoaXMub2Zmc2V0fSwgYnV0IG9ubHkgJHt0aGlzLnJlbWFpbmluZ30gYnl0ZShzKSByZW1haW5gXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJlYWRVSW50OEFycmF5KCkge1xyXG4gICAgY29uc3QgbGVuZ3RoID0gdGhpcy5yZWFkVTMyKCk7XHJcbiAgICB0aGlzLiNlbnN1cmUobGVuZ3RoKTtcclxuICAgIHJldHVybiB0aGlzLnJlYWRCeXRlcyhsZW5ndGgpO1xyXG4gIH1cclxuICByZWFkQm9vbCgpIHtcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQ4KHRoaXMub2Zmc2V0KTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDE7XHJcbiAgICByZXR1cm4gdmFsdWUgIT09IDA7XHJcbiAgfVxyXG4gIHJlYWRCeXRlKCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0VWludDgodGhpcy5vZmZzZXQpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcbiAgcmVhZEJ5dGVzKGxlbmd0aCkge1xyXG4gICAgY29uc3QgYXJyYXkgPSBuZXcgVWludDhBcnJheShcclxuICAgICAgdGhpcy52aWV3LmJ1ZmZlcixcclxuICAgICAgdGhpcy52aWV3LmJ5dGVPZmZzZXQgKyB0aGlzLm9mZnNldCxcclxuICAgICAgbGVuZ3RoXHJcbiAgICApO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gbGVuZ3RoO1xyXG4gICAgcmV0dXJuIGFycmF5O1xyXG4gIH1cclxuICByZWFkSTgoKSB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRJbnQ4KHRoaXMub2Zmc2V0KTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDE7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG4gIHJlYWRVOCgpIHtcclxuICAgIHJldHVybiB0aGlzLnJlYWRCeXRlKCk7XHJcbiAgfVxyXG4gIHJlYWRJMTYoKSB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRJbnQxNih0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAyO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkVTE2KCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0VWludDE2KHRoaXMub2Zmc2V0LCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDI7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG4gIHJlYWRJMzIoKSB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRJbnQzMih0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA0O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkVTMyKCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0VWludDMyKHRoaXMub2Zmc2V0LCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG4gIHJlYWRJNjQoKSB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA4O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkVTY0KCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDg7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG4gIHJlYWRVMTI4KCkge1xyXG4gICAgY29uc3QgbG93ZXJQYXJ0ID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICBjb25zdCB1cHBlclBhcnQgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxNjtcclxuICAgIHJldHVybiAodXBwZXJQYXJ0IDw8IEJpZ0ludCg2NCkpICsgbG93ZXJQYXJ0O1xyXG4gIH1cclxuICByZWFkSTEyOCgpIHtcclxuICAgIGNvbnN0IGxvd2VyUGFydCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgY29uc3QgdXBwZXJQYXJ0ID0gdGhpcy52aWV3LmdldEJpZ0ludDY0KHRoaXMub2Zmc2V0ICsgOCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxNjtcclxuICAgIHJldHVybiAodXBwZXJQYXJ0IDw8IEJpZ0ludCg2NCkpICsgbG93ZXJQYXJ0O1xyXG4gIH1cclxuICByZWFkVTI1NigpIHtcclxuICAgIGNvbnN0IHAwID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICBjb25zdCBwMSA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4LCB0cnVlKTtcclxuICAgIGNvbnN0IHAyID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDE2LCB0cnVlKTtcclxuICAgIGNvbnN0IHAzID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDI0LCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDMyO1xyXG4gICAgcmV0dXJuIChwMyA8PCBCaWdJbnQoMyAqIDY0KSkgKyAocDIgPDwgQmlnSW50KDIgKiA2NCkpICsgKHAxIDw8IEJpZ0ludCgxICogNjQpKSArIHAwO1xyXG4gIH1cclxuICByZWFkSTI1NigpIHtcclxuICAgIGNvbnN0IHAwID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICBjb25zdCBwMSA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4LCB0cnVlKTtcclxuICAgIGNvbnN0IHAyID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDE2LCB0cnVlKTtcclxuICAgIGNvbnN0IHAzID0gdGhpcy52aWV3LmdldEJpZ0ludDY0KHRoaXMub2Zmc2V0ICsgMjQsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMzI7XHJcbiAgICByZXR1cm4gKHAzIDw8IEJpZ0ludCgzICogNjQpKSArIChwMiA8PCBCaWdJbnQoMiAqIDY0KSkgKyAocDEgPDwgQmlnSW50KDEgKiA2NCkpICsgcDA7XHJcbiAgfVxyXG4gIHJlYWRGMzIoKSB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRGbG9hdDMyKHRoaXMub2Zmc2V0LCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG4gIHJlYWRGNjQoKSB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRGbG9hdDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDg7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG4gIHJlYWRTdHJpbmcoKSB7XHJcbiAgICBjb25zdCB1aW50OEFycmF5ID0gdGhpcy5yZWFkVUludDhBcnJheSgpO1xyXG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcihcInV0Zi04XCIpLmRlY29kZSh1aW50OEFycmF5KTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL2JpbmFyeV93cml0ZXIudHNcclxudmFyIGltcG9ydF9iYXNlNjRfanMgPSBfX3RvRVNNKHJlcXVpcmVfYmFzZTY0X2pzKCkpO1xyXG52YXIgQXJyYXlCdWZmZXJQcm90b3R5cGVUcmFuc2ZlciA9IEFycmF5QnVmZmVyLnByb3RvdHlwZS50cmFuc2ZlciA/PyBmdW5jdGlvbihuZXdCeXRlTGVuZ3RoKSB7XHJcbiAgaWYgKG5ld0J5dGVMZW5ndGggPT09IHZvaWQgMCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2xpY2UoKTtcclxuICB9IGVsc2UgaWYgKG5ld0J5dGVMZW5ndGggPD0gdGhpcy5ieXRlTGVuZ3RoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zbGljZSgwLCBuZXdCeXRlTGVuZ3RoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgY29uc3QgY29weSA9IG5ldyBVaW50OEFycmF5KG5ld0J5dGVMZW5ndGgpO1xyXG4gICAgY29weS5zZXQobmV3IFVpbnQ4QXJyYXkodGhpcykpO1xyXG4gICAgcmV0dXJuIGNvcHkuYnVmZmVyO1xyXG4gIH1cclxufTtcclxudmFyIFJlc2l6YWJsZUJ1ZmZlciA9IGNsYXNzIHtcclxuICBidWZmZXI7XHJcbiAgdmlldztcclxuICBjb25zdHJ1Y3Rvcihpbml0KSB7XHJcbiAgICB0aGlzLmJ1ZmZlciA9IHR5cGVvZiBpbml0ID09PSBcIm51bWJlclwiID8gbmV3IEFycmF5QnVmZmVyKGluaXQpIDogaW5pdDtcclxuICAgIHRoaXMudmlldyA9IG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlcik7XHJcbiAgfVxyXG4gIGdldCBjYXBhY2l0eSgpIHtcclxuICAgIHJldHVybiB0aGlzLmJ1ZmZlci5ieXRlTGVuZ3RoO1xyXG4gIH1cclxuICBncm93KG5ld1NpemUpIHtcclxuICAgIGlmIChuZXdTaXplIDw9IHRoaXMuYnVmZmVyLmJ5dGVMZW5ndGgpIHJldHVybjtcclxuICAgIHRoaXMuYnVmZmVyID0gQXJyYXlCdWZmZXJQcm90b3R5cGVUcmFuc2Zlci5jYWxsKHRoaXMuYnVmZmVyLCBuZXdTaXplKTtcclxuICAgIHRoaXMudmlldyA9IG5ldyBEYXRhVmlldyh0aGlzLmJ1ZmZlcik7XHJcbiAgfVxyXG59O1xyXG52YXIgQmluYXJ5V3JpdGVyID0gY2xhc3Mge1xyXG4gIGJ1ZmZlcjtcclxuICBvZmZzZXQgPSAwO1xyXG4gIGNvbnN0cnVjdG9yKGluaXQpIHtcclxuICAgIHRoaXMuYnVmZmVyID0gdHlwZW9mIGluaXQgPT09IFwibnVtYmVyXCIgPyBuZXcgUmVzaXphYmxlQnVmZmVyKGluaXQpIDogaW5pdDtcclxuICB9XHJcbiAgcmVzZXQoYnVmZmVyKSB7XHJcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcclxuICAgIHRoaXMub2Zmc2V0ID0gMDtcclxuICB9XHJcbiAgZXhwYW5kQnVmZmVyKGFkZGl0aW9uYWxDYXBhY2l0eSkge1xyXG4gICAgY29uc3QgbWluQ2FwYWNpdHkgPSB0aGlzLm9mZnNldCArIGFkZGl0aW9uYWxDYXBhY2l0eSArIDE7XHJcbiAgICBpZiAobWluQ2FwYWNpdHkgPD0gdGhpcy5idWZmZXIuY2FwYWNpdHkpIHJldHVybjtcclxuICAgIGxldCBuZXdDYXBhY2l0eSA9IHRoaXMuYnVmZmVyLmNhcGFjaXR5ICogMjtcclxuICAgIGlmIChuZXdDYXBhY2l0eSA8IG1pbkNhcGFjaXR5KSBuZXdDYXBhY2l0eSA9IG1pbkNhcGFjaXR5O1xyXG4gICAgdGhpcy5idWZmZXIuZ3JvdyhuZXdDYXBhY2l0eSk7XHJcbiAgfVxyXG4gIHRvQmFzZTY0KCkge1xyXG4gICAgcmV0dXJuICgwLCBpbXBvcnRfYmFzZTY0X2pzLmZyb21CeXRlQXJyYXkpKHRoaXMuZ2V0QnVmZmVyKCkpO1xyXG4gIH1cclxuICBnZXRCdWZmZXIoKSB7XHJcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIuYnVmZmVyLCAwLCB0aGlzLm9mZnNldCk7XHJcbiAgfVxyXG4gIGdldCB2aWV3KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYnVmZmVyLnZpZXc7XHJcbiAgfVxyXG4gIHdyaXRlVUludDhBcnJheSh2YWx1ZSkge1xyXG4gICAgY29uc3QgbGVuZ3RoID0gdmFsdWUubGVuZ3RoO1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoNCArIGxlbmd0aCk7XHJcbiAgICB0aGlzLndyaXRlVTMyKGxlbmd0aCk7XHJcbiAgICBuZXcgVWludDhBcnJheSh0aGlzLmJ1ZmZlci5idWZmZXIsIHRoaXMub2Zmc2V0KS5zZXQodmFsdWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gbGVuZ3RoO1xyXG4gIH1cclxuICB3cml0ZUJvb2wodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDEpO1xyXG4gICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSA/IDEgOiAwKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDE7XHJcbiAgfVxyXG4gIHdyaXRlQnl0ZSh2YWx1ZSkge1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMSk7XHJcbiAgICB0aGlzLnZpZXcuc2V0VWludDgodGhpcy5vZmZzZXQsIHZhbHVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDE7XHJcbiAgfVxyXG4gIHdyaXRlSTgodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDEpO1xyXG4gICAgdGhpcy52aWV3LnNldEludDgodGhpcy5vZmZzZXQsIHZhbHVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDE7XHJcbiAgfVxyXG4gIHdyaXRlVTgodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDEpO1xyXG4gICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxO1xyXG4gIH1cclxuICB3cml0ZUkxNih2YWx1ZSkge1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMik7XHJcbiAgICB0aGlzLnZpZXcuc2V0SW50MTYodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDI7XHJcbiAgfVxyXG4gIHdyaXRlVTE2KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigyKTtcclxuICAgIHRoaXMudmlldy5zZXRVaW50MTYodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDI7XHJcbiAgfVxyXG4gIHdyaXRlSTMyKHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig0KTtcclxuICAgIHRoaXMudmlldy5zZXRJbnQzMih0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcclxuICB9XHJcbiAgd3JpdGVVMzIodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDQpO1xyXG4gICAgdGhpcy52aWV3LnNldFVpbnQzMih0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcclxuICB9XHJcbiAgd3JpdGVJNjQodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDgpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ0ludDY0KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA4O1xyXG4gIH1cclxuICB3cml0ZVU2NCh2YWx1ZSkge1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoOCk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA4O1xyXG4gIH1cclxuICB3cml0ZVUxMjgodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDE2KTtcclxuICAgIGNvbnN0IGxvd2VyUGFydCA9IHZhbHVlICYgQmlnSW50KFwiMHhGRkZGRkZGRkZGRkZGRkZGXCIpO1xyXG4gICAgY29uc3QgdXBwZXJQYXJ0ID0gdmFsdWUgPj4gQmlnSW50KDY0KTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIGxvd2VyUGFydCwgdHJ1ZSk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdXBwZXJQYXJ0LCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDE2O1xyXG4gIH1cclxuICB3cml0ZUkxMjgodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDE2KTtcclxuICAgIGNvbnN0IGxvd2VyUGFydCA9IHZhbHVlICYgQmlnSW50KFwiMHhGRkZGRkZGRkZGRkZGRkZGXCIpO1xyXG4gICAgY29uc3QgdXBwZXJQYXJ0ID0gdmFsdWUgPj4gQmlnSW50KDY0KTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCwgbG93ZXJQYXJ0LCB0cnVlKTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCArIDgsIHVwcGVyUGFydCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxNjtcclxuICB9XHJcbiAgd3JpdGVVMjU2KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigzMik7XHJcbiAgICBjb25zdCBsb3dfNjRfbWFzayA9IEJpZ0ludChcIjB4RkZGRkZGRkZGRkZGRkZGRlwiKTtcclxuICAgIGNvbnN0IHAwID0gdmFsdWUgJiBsb3dfNjRfbWFzaztcclxuICAgIGNvbnN0IHAxID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMSkgJiBsb3dfNjRfbWFzaztcclxuICAgIGNvbnN0IHAyID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMikgJiBsb3dfNjRfbWFzaztcclxuICAgIGNvbnN0IHAzID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMyk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDAsIHAwLCB0cnVlKTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMSwgcDEsIHRydWUpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAyLCBwMiwgdHJ1ZSk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDMsIHAzLCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDMyO1xyXG4gIH1cclxuICB3cml0ZUkyNTYodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDMyKTtcclxuICAgIGNvbnN0IGxvd182NF9tYXNrID0gQmlnSW50KFwiMHhGRkZGRkZGRkZGRkZGRkZGXCIpO1xyXG4gICAgY29uc3QgcDAgPSB2YWx1ZSAmIGxvd182NF9tYXNrO1xyXG4gICAgY29uc3QgcDEgPSB2YWx1ZSA+PiBCaWdJbnQoNjQgKiAxKSAmIGxvd182NF9tYXNrO1xyXG4gICAgY29uc3QgcDIgPSB2YWx1ZSA+PiBCaWdJbnQoNjQgKiAyKSAmIGxvd182NF9tYXNrO1xyXG4gICAgY29uc3QgcDMgPSB2YWx1ZSA+PiBCaWdJbnQoNjQgKiAzKTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMCwgcDAsIHRydWUpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAxLCBwMSwgdHJ1ZSk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDIsIHAyLCB0cnVlKTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCArIDggKiAzLCBwMywgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAzMjtcclxuICB9XHJcbiAgd3JpdGVGMzIodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDQpO1xyXG4gICAgdGhpcy52aWV3LnNldEZsb2F0MzIodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XHJcbiAgfVxyXG4gIHdyaXRlRjY0KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig4KTtcclxuICAgIHRoaXMudmlldy5zZXRGbG9hdDY0KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA4O1xyXG4gIH1cclxuICB3cml0ZVN0cmluZyh2YWx1ZSkge1xyXG4gICAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xyXG4gICAgY29uc3QgZW5jb2RlZFN0cmluZyA9IGVuY29kZXIuZW5jb2RlKHZhbHVlKTtcclxuICAgIHRoaXMud3JpdGVVSW50OEFycmF5KGVuY29kZWRTdHJpbmcpO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvdXRpbC50c1xyXG5mdW5jdGlvbiB1aW50OEFycmF5VG9IZXhTdHJpbmcoYXJyYXkpIHtcclxuICByZXR1cm4gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGFycmF5LnJldmVyc2UoKSwgKHgpID0+IChcIjAwXCIgKyB4LnRvU3RyaW5nKDE2KSkuc2xpY2UoLTIpKS5qb2luKFwiXCIpO1xyXG59XHJcbmZ1bmN0aW9uIHVpbnQ4QXJyYXlUb1UxMjgoYXJyYXkpIHtcclxuICBpZiAoYXJyYXkubGVuZ3RoICE9IDE2KSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVpbnQ4QXJyYXkgaXMgbm90IDE2IGJ5dGVzIGxvbmc6ICR7YXJyYXl9YCk7XHJcbiAgfVxyXG4gIHJldHVybiBuZXcgQmluYXJ5UmVhZGVyKGFycmF5KS5yZWFkVTEyOCgpO1xyXG59XHJcbmZ1bmN0aW9uIHVpbnQ4QXJyYXlUb1UyNTYoYXJyYXkpIHtcclxuICBpZiAoYXJyYXkubGVuZ3RoICE9IDMyKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFVpbnQ4QXJyYXkgaXMgbm90IDMyIGJ5dGVzIGxvbmc6IFske2FycmF5fV1gKTtcclxuICB9XHJcbiAgcmV0dXJuIG5ldyBCaW5hcnlSZWFkZXIoYXJyYXkpLnJlYWRVMjU2KCk7XHJcbn1cclxuZnVuY3Rpb24gaGV4U3RyaW5nVG9VaW50OEFycmF5KHN0cikge1xyXG4gIGlmIChzdHIuc3RhcnRzV2l0aChcIjB4XCIpKSB7XHJcbiAgICBzdHIgPSBzdHIuc2xpY2UoMik7XHJcbiAgfVxyXG4gIGNvbnN0IG1hdGNoZXMgPSBzdHIubWF0Y2goLy57MSwyfS9nKSB8fCBbXTtcclxuICBjb25zdCBkYXRhID0gVWludDhBcnJheS5mcm9tKFxyXG4gICAgbWF0Y2hlcy5tYXAoKGJ5dGUpID0+IHBhcnNlSW50KGJ5dGUsIDE2KSlcclxuICApO1xyXG4gIHJldHVybiBkYXRhLnJldmVyc2UoKTtcclxufVxyXG5mdW5jdGlvbiBoZXhTdHJpbmdUb1UxMjgoc3RyKSB7XHJcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb1UxMjgoaGV4U3RyaW5nVG9VaW50OEFycmF5KHN0cikpO1xyXG59XHJcbmZ1bmN0aW9uIGhleFN0cmluZ1RvVTI1NihzdHIpIHtcclxuICByZXR1cm4gdWludDhBcnJheVRvVTI1NihoZXhTdHJpbmdUb1VpbnQ4QXJyYXkoc3RyKSk7XHJcbn1cclxuZnVuY3Rpb24gdTEyOFRvVWludDhBcnJheShkYXRhKSB7XHJcbiAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigxNik7XHJcbiAgd3JpdGVyLndyaXRlVTEyOChkYXRhKTtcclxuICByZXR1cm4gd3JpdGVyLmdldEJ1ZmZlcigpO1xyXG59XHJcbmZ1bmN0aW9uIHUxMjhUb0hleFN0cmluZyhkYXRhKSB7XHJcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb0hleFN0cmluZyh1MTI4VG9VaW50OEFycmF5KGRhdGEpKTtcclxufVxyXG5mdW5jdGlvbiB1MjU2VG9VaW50OEFycmF5KGRhdGEpIHtcclxuICBjb25zdCB3cml0ZXIgPSBuZXcgQmluYXJ5V3JpdGVyKDMyKTtcclxuICB3cml0ZXIud3JpdGVVMjU2KGRhdGEpO1xyXG4gIHJldHVybiB3cml0ZXIuZ2V0QnVmZmVyKCk7XHJcbn1cclxuZnVuY3Rpb24gdTI1NlRvSGV4U3RyaW5nKGRhdGEpIHtcclxuICByZXR1cm4gdWludDhBcnJheVRvSGV4U3RyaW5nKHUyNTZUb1VpbnQ4QXJyYXkoZGF0YSkpO1xyXG59XHJcbmZ1bmN0aW9uIHRvUGFzY2FsQ2FzZShzKSB7XHJcbiAgY29uc3Qgc3RyID0gdG9DYW1lbENhc2Uocyk7XHJcbiAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcclxufVxyXG5mdW5jdGlvbiB0b0NhbWVsQ2FzZShzKSB7XHJcbiAgY29uc3Qgc3RyID0gcy5yZXBsYWNlKC9bLV9dKy9nLCBcIl9cIikucmVwbGFjZSgvXyhbYS16QS1aMC05XSkvZywgKF8sIGMpID0+IGMudG9VcHBlckNhc2UoKSk7XHJcbiAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcclxufVxyXG5mdW5jdGlvbiBic2F0bkJhc2VTaXplKHR5cGVzcGFjZSwgdHkpIHtcclxuICBjb25zdCBhc3N1bWVkQXJyYXlMZW5ndGggPSA0O1xyXG4gIHdoaWxlICh0eS50YWcgPT09IFwiUmVmXCIpIHR5ID0gdHlwZXNwYWNlLnR5cGVzW3R5LnZhbHVlXTtcclxuICBpZiAodHkudGFnID09PSBcIlByb2R1Y3RcIikge1xyXG4gICAgbGV0IHN1bSA9IDA7XHJcbiAgICBmb3IgKGNvbnN0IHsgYWxnZWJyYWljVHlwZTogZWxlbSB9IG9mIHR5LnZhbHVlLmVsZW1lbnRzKSB7XHJcbiAgICAgIHN1bSArPSBic2F0bkJhc2VTaXplKHR5cGVzcGFjZSwgZWxlbSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3VtO1xyXG4gIH0gZWxzZSBpZiAodHkudGFnID09PSBcIlN1bVwiKSB7XHJcbiAgICBsZXQgbWluID0gSW5maW5pdHk7XHJcbiAgICBmb3IgKGNvbnN0IHsgYWxnZWJyYWljVHlwZTogdmFyaSB9IG9mIHR5LnZhbHVlLnZhcmlhbnRzKSB7XHJcbiAgICAgIGNvbnN0IHZTaXplID0gYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHZhcmkpO1xyXG4gICAgICBpZiAodlNpemUgPCBtaW4pIG1pbiA9IHZTaXplO1xyXG4gICAgfVxyXG4gICAgaWYgKG1pbiA9PT0gSW5maW5pdHkpIG1pbiA9IDA7XHJcbiAgICByZXR1cm4gNCArIG1pbjtcclxuICB9IGVsc2UgaWYgKHR5LnRhZyA9PSBcIkFycmF5XCIpIHtcclxuICAgIHJldHVybiA0ICsgYXNzdW1lZEFycmF5TGVuZ3RoICogYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHR5LnZhbHVlKTtcclxuICB9XHJcbiAgcmV0dXJuIHtcclxuICAgIFN0cmluZzogNCArIGFzc3VtZWRBcnJheUxlbmd0aCxcclxuICAgIFN1bTogMSxcclxuICAgIEJvb2w6IDEsXHJcbiAgICBJODogMSxcclxuICAgIFU4OiAxLFxyXG4gICAgSTE2OiAyLFxyXG4gICAgVTE2OiAyLFxyXG4gICAgSTMyOiA0LFxyXG4gICAgVTMyOiA0LFxyXG4gICAgRjMyOiA0LFxyXG4gICAgSTY0OiA4LFxyXG4gICAgVTY0OiA4LFxyXG4gICAgRjY0OiA4LFxyXG4gICAgSTEyODogMTYsXHJcbiAgICBVMTI4OiAxNixcclxuICAgIEkyNTY6IDMyLFxyXG4gICAgVTI1NjogMzJcclxuICB9W3R5LnRhZ107XHJcbn1cclxudmFyIGhhc093biA9IE9iamVjdC5oYXNPd247XHJcblxyXG4vLyBzcmMvbGliL2Nvbm5lY3Rpb25faWQudHNcclxudmFyIENvbm5lY3Rpb25JZCA9IGNsYXNzIF9Db25uZWN0aW9uSWQge1xyXG4gIF9fY29ubmVjdGlvbl9pZF9fO1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYENvbm5lY3Rpb25JZGAuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgdGhpcy5fX2Nvbm5lY3Rpb25faWRfXyA9IGRhdGE7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHtAbGluayBDb25uZWN0aW9uSWR9IHR5cGUuXHJcbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRBbGdlYnJhaWNUeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XHJcbiAgICAgIGVsZW1lbnRzOiBbXHJcbiAgICAgICAgeyBuYW1lOiBcIl9fY29ubmVjdGlvbl9pZF9fXCIsIGFsZ2VicmFpY1R5cGU6IEFsZ2VicmFpY1R5cGUuVTEyOCB9XHJcbiAgICAgIF1cclxuICAgIH0pO1xyXG4gIH1cclxuICBpc1plcm8oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fX2Nvbm5lY3Rpb25faWRfXyA9PT0gQmlnSW50KDApO1xyXG4gIH1cclxuICBzdGF0aWMgbnVsbElmWmVybyhhZGRyKSB7XHJcbiAgICBpZiAoYWRkci5pc1plcm8oKSkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBhZGRyO1xyXG4gICAgfVxyXG4gIH1cclxuICBzdGF0aWMgcmFuZG9tKCkge1xyXG4gICAgZnVuY3Rpb24gcmFuZG9tVTgoKSB7XHJcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAyNTUpO1xyXG4gICAgfVxyXG4gICAgbGV0IHJlc3VsdCA9IEJpZ0ludCgwKTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTY7IGkrKykge1xyXG4gICAgICByZXN1bHQgPSByZXN1bHQgPDwgQmlnSW50KDgpIHwgQmlnSW50KHJhbmRvbVU4KCkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkKHJlc3VsdCk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENvbXBhcmUgdHdvIGNvbm5lY3Rpb24gSURzIGZvciBlcXVhbGl0eS5cclxuICAgKi9cclxuICBpc0VxdWFsKG90aGVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fX2Nvbm5lY3Rpb25faWRfXyA9PSBvdGhlci5fX2Nvbm5lY3Rpb25faWRfXztcclxuICB9XHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgaWYgdHdvIGNvbm5lY3Rpb24gSURzIGFyZSBlcXVhbC5cclxuICAgKi9cclxuICBlcXVhbHMob3RoZXIpIHtcclxuICAgIHJldHVybiB0aGlzLmlzRXF1YWwob3RoZXIpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBQcmludCB0aGUgY29ubmVjdGlvbiBJRCBhcyBhIGhleGFkZWNpbWFsIHN0cmluZy5cclxuICAgKi9cclxuICB0b0hleFN0cmluZygpIHtcclxuICAgIHJldHVybiB1MTI4VG9IZXhTdHJpbmcodGhpcy5fX2Nvbm5lY3Rpb25faWRfXyk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgdGhlIGNvbm5lY3Rpb24gSUQgdG8gYSBVaW50OEFycmF5LlxyXG4gICAqL1xyXG4gIHRvVWludDhBcnJheSgpIHtcclxuICAgIHJldHVybiB1MTI4VG9VaW50OEFycmF5KHRoaXMuX19jb25uZWN0aW9uX2lkX18pO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBQYXJzZSBhIGNvbm5lY3Rpb24gSUQgZnJvbSBhIGhleGFkZWNpbWFsIHN0cmluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZnJvbVN0cmluZyhzdHIpIHtcclxuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZChoZXhTdHJpbmdUb1UxMjgoc3RyKSk7XHJcbiAgfVxyXG4gIHN0YXRpYyBmcm9tU3RyaW5nT3JOdWxsKHN0cikge1xyXG4gICAgY29uc3QgYWRkciA9IF9Db25uZWN0aW9uSWQuZnJvbVN0cmluZyhzdHIpO1xyXG4gICAgaWYgKGFkZHIuaXNaZXJvKCkpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gYWRkcjtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL2lkZW50aXR5LnRzXHJcbnZhciBJZGVudGl0eSA9IGNsYXNzIF9JZGVudGl0eSB7XHJcbiAgX19pZGVudGl0eV9fO1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYElkZW50aXR5YC5cclxuICAgKlxyXG4gICAqIGBkYXRhYCBjYW4gYmUgYSBoZXhhZGVjaW1hbCBzdHJpbmcgb3IgYSBgYmlnaW50YC5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICB0aGlzLl9faWRlbnRpdHlfXyA9IHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiID8gaGV4U3RyaW5nVG9VMjU2KGRhdGEpIDogZGF0YTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUge0BsaW5rIElkZW50aXR5fSB0eXBlLlxyXG4gICAqIEByZXR1cm5zIFRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHlwZS5cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xyXG4gICAgICBlbGVtZW50czogW3sgbmFtZTogXCJfX2lkZW50aXR5X19cIiwgYWxnZWJyYWljVHlwZTogQWxnZWJyYWljVHlwZS5VMjU2IH1dXHJcbiAgICB9KTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogQ2hlY2sgaWYgdHdvIGlkZW50aXRpZXMgYXJlIGVxdWFsLlxyXG4gICAqL1xyXG4gIGlzRXF1YWwob3RoZXIpIHtcclxuICAgIHJldHVybiB0aGlzLnRvSGV4U3RyaW5nKCkgPT09IG90aGVyLnRvSGV4U3RyaW5nKCk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENoZWNrIGlmIHR3byBpZGVudGl0aWVzIGFyZSBlcXVhbC5cclxuICAgKi9cclxuICBlcXVhbHMob3RoZXIpIHtcclxuICAgIHJldHVybiB0aGlzLmlzRXF1YWwob3RoZXIpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBQcmludCB0aGUgaWRlbnRpdHkgYXMgYSBoZXhhZGVjaW1hbCBzdHJpbmcuXHJcbiAgICovXHJcbiAgdG9IZXhTdHJpbmcoKSB7XHJcbiAgICByZXR1cm4gdTI1NlRvSGV4U3RyaW5nKHRoaXMuX19pZGVudGl0eV9fKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogQ29udmVydCB0aGUgYWRkcmVzcyB0byBhIFVpbnQ4QXJyYXkuXHJcbiAgICovXHJcbiAgdG9VaW50OEFycmF5KCkge1xyXG4gICAgcmV0dXJuIHUyNTZUb1VpbnQ4QXJyYXkodGhpcy5fX2lkZW50aXR5X18pO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBQYXJzZSBhbiBJZGVudGl0eSBmcm9tIGEgaGV4YWRlY2ltYWwgc3RyaW5nLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tU3RyaW5nKHN0cikge1xyXG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHkoc3RyKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogWmVybyBpZGVudGl0eSAoMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwKVxyXG4gICAqL1xyXG4gIHN0YXRpYyB6ZXJvKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHkoMG4pO1xyXG4gIH1cclxuICB0b1N0cmluZygpIHtcclxuICAgIHJldHVybiB0aGlzLnRvSGV4U3RyaW5nKCk7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2xpYi9hbGdlYnJhaWNfdHlwZS50c1xyXG52YXIgU0VSSUFMSVpFUlMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xyXG52YXIgREVTRVJJQUxJWkVSUyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XHJcbnZhciBBbGdlYnJhaWNUeXBlID0ge1xyXG4gIFJlZjogKHZhbHVlKSA9PiAoeyB0YWc6IFwiUmVmXCIsIHZhbHVlIH0pLFxyXG4gIFN1bTogKHZhbHVlKSA9PiAoe1xyXG4gICAgdGFnOiBcIlN1bVwiLFxyXG4gICAgdmFsdWVcclxuICB9KSxcclxuICBQcm9kdWN0OiAodmFsdWUpID0+ICh7XHJcbiAgICB0YWc6IFwiUHJvZHVjdFwiLFxyXG4gICAgdmFsdWVcclxuICB9KSxcclxuICBBcnJheTogKHZhbHVlKSA9PiAoe1xyXG4gICAgdGFnOiBcIkFycmF5XCIsXHJcbiAgICB2YWx1ZVxyXG4gIH0pLFxyXG4gIFN0cmluZzogeyB0YWc6IFwiU3RyaW5nXCIgfSxcclxuICBCb29sOiB7IHRhZzogXCJCb29sXCIgfSxcclxuICBJODogeyB0YWc6IFwiSThcIiB9LFxyXG4gIFU4OiB7IHRhZzogXCJVOFwiIH0sXHJcbiAgSTE2OiB7IHRhZzogXCJJMTZcIiB9LFxyXG4gIFUxNjogeyB0YWc6IFwiVTE2XCIgfSxcclxuICBJMzI6IHsgdGFnOiBcIkkzMlwiIH0sXHJcbiAgVTMyOiB7IHRhZzogXCJVMzJcIiB9LFxyXG4gIEk2NDogeyB0YWc6IFwiSTY0XCIgfSxcclxuICBVNjQ6IHsgdGFnOiBcIlU2NFwiIH0sXHJcbiAgSTEyODogeyB0YWc6IFwiSTEyOFwiIH0sXHJcbiAgVTEyODogeyB0YWc6IFwiVTEyOFwiIH0sXHJcbiAgSTI1NjogeyB0YWc6IFwiSTI1NlwiIH0sXHJcbiAgVTI1NjogeyB0YWc6IFwiVTI1NlwiIH0sXHJcbiAgRjMyOiB7IHRhZzogXCJGMzJcIiB9LFxyXG4gIEY2NDogeyB0YWc6IFwiRjY0XCIgfSxcclxuICBtYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XHJcbiAgICBpZiAodHkudGFnID09PSBcIlJlZlwiKSB7XHJcbiAgICAgIGlmICghdHlwZXNwYWNlKVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhbm5vdCBzZXJpYWxpemUgcmVmcyB3aXRob3V0IGEgdHlwZXNwYWNlXCIpO1xyXG4gICAgICB3aGlsZSAodHkudGFnID09PSBcIlJlZlwiKSB0eSA9IHR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XHJcbiAgICB9XHJcbiAgICBzd2l0Y2ggKHR5LnRhZykge1xyXG4gICAgICBjYXNlIFwiUHJvZHVjdFwiOlxyXG4gICAgICAgIHJldHVybiBQcm9kdWN0VHlwZS5tYWtlU2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcclxuICAgICAgY2FzZSBcIlN1bVwiOlxyXG4gICAgICAgIHJldHVybiBTdW1UeXBlLm1ha2VTZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xyXG4gICAgICBjYXNlIFwiQXJyYXlcIjpcclxuICAgICAgICBpZiAodHkudmFsdWUudGFnID09PSBcIlU4XCIpIHtcclxuICAgICAgICAgIHJldHVybiBzZXJpYWxpemVVaW50OEFycmF5O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zdCBzZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xyXG4gICAgICAgICAgcmV0dXJuICh3cml0ZXIsIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgICAgIHdyaXRlci53cml0ZVUzMih2YWx1ZS5sZW5ndGgpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVsZW0gb2YgdmFsdWUpIHtcclxuICAgICAgICAgICAgICBzZXJpYWxpemUod3JpdGVyLCBlbGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuIHByaW1pdGl2ZVNlcmlhbGl6ZXJzW3R5LnRhZ107XHJcbiAgICB9XHJcbiAgfSxcclxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBtYWtlU2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cclxuICBzZXJpYWxpemVWYWx1ZSh3cml0ZXIsIHR5LCB2YWx1ZSwgdHlwZXNwYWNlKSB7XHJcbiAgICBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHdyaXRlciwgdmFsdWUpO1xyXG4gIH0sXHJcbiAgbWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XHJcbiAgICBpZiAodHkudGFnID09PSBcIlJlZlwiKSB7XHJcbiAgICAgIGlmICghdHlwZXNwYWNlKVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhbm5vdCBkZXNlcmlhbGl6ZSByZWZzIHdpdGhvdXQgYSB0eXBlc3BhY2VcIik7XHJcbiAgICAgIHdoaWxlICh0eS50YWcgPT09IFwiUmVmXCIpIHR5ID0gdHlwZXNwYWNlLnR5cGVzW3R5LnZhbHVlXTtcclxuICAgIH1cclxuICAgIHN3aXRjaCAodHkudGFnKSB7XHJcbiAgICAgIGNhc2UgXCJQcm9kdWN0XCI6XHJcbiAgICAgICAgcmV0dXJuIFByb2R1Y3RUeXBlLm1ha2VEZXNlcmlhbGl6ZXIodHkudmFsdWUsIHR5cGVzcGFjZSk7XHJcbiAgICAgIGNhc2UgXCJTdW1cIjpcclxuICAgICAgICByZXR1cm4gU3VtVHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xyXG4gICAgICBjYXNlIFwiQXJyYXlcIjpcclxuICAgICAgICBpZiAodHkudmFsdWUudGFnID09PSBcIlU4XCIpIHtcclxuICAgICAgICAgIHJldHVybiBkZXNlcmlhbGl6ZVVpbnQ4QXJyYXk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnN0IGRlc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxyXG4gICAgICAgICAgICB0eS52YWx1ZSxcclxuICAgICAgICAgICAgdHlwZXNwYWNlXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgcmV0dXJuIChyZWFkZXIpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbGVuZ3RoID0gcmVhZGVyLnJlYWRVMzIoKTtcclxuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgIHJlc3VsdFtpXSA9IGRlc2VyaWFsaXplKHJlYWRlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiBwcmltaXRpdmVEZXNlcmlhbGl6ZXJzW3R5LnRhZ107XHJcbiAgICB9XHJcbiAgfSxcclxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBtYWtlRGVzZXJpYWxpemVyYCBpbnN0ZWFkLiAqL1xyXG4gIGRlc2VyaWFsaXplVmFsdWUocmVhZGVyLCB0eSwgdHlwZXNwYWNlKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHJlYWRlcik7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBDb252ZXJ0IGEgdmFsdWUgb2YgdGhlIGFsZ2VicmFpYyB0eXBlIGludG8gc29tZXRoaW5nIHRoYXQgY2FuIGJlIHVzZWQgYXMgYSBrZXkgaW4gYSBtYXAuXHJcbiAgICogVGhlcmUgYXJlIG5vIGd1YXJhbnRlZXMgYWJvdXQgYmVpbmcgYWJsZSB0byBvcmRlciBpdC5cclxuICAgKiBUaGlzIGlzIG9ubHkgZ3VhcmFudGVlZCB0byBiZSBjb21wYXJhYmxlIHRvIG90aGVyIHZhbHVlcyBvZiB0aGUgc2FtZSB0eXBlLlxyXG4gICAqIEBwYXJhbSB2YWx1ZSBBIHZhbHVlIG9mIHRoZSBhbGdlYnJhaWMgdHlwZVxyXG4gICAqIEByZXR1cm5zIFNvbWV0aGluZyB0aGF0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGluIGEgbWFwLlxyXG4gICAqL1xyXG4gIGludG9NYXBLZXk6IGZ1bmN0aW9uKHR5LCB2YWx1ZSkge1xyXG4gICAgc3dpdGNoICh0eS50YWcpIHtcclxuICAgICAgY2FzZSBcIlU4XCI6XHJcbiAgICAgIGNhc2UgXCJVMTZcIjpcclxuICAgICAgY2FzZSBcIlUzMlwiOlxyXG4gICAgICBjYXNlIFwiVTY0XCI6XHJcbiAgICAgIGNhc2UgXCJVMTI4XCI6XHJcbiAgICAgIGNhc2UgXCJVMjU2XCI6XHJcbiAgICAgIGNhc2UgXCJJOFwiOlxyXG4gICAgICBjYXNlIFwiSTE2XCI6XHJcbiAgICAgIGNhc2UgXCJJMzJcIjpcclxuICAgICAgY2FzZSBcIkk2NFwiOlxyXG4gICAgICBjYXNlIFwiSTEyOFwiOlxyXG4gICAgICBjYXNlIFwiSTI1NlwiOlxyXG4gICAgICBjYXNlIFwiRjMyXCI6XHJcbiAgICAgIGNhc2UgXCJGNjRcIjpcclxuICAgICAgY2FzZSBcIlN0cmluZ1wiOlxyXG4gICAgICBjYXNlIFwiQm9vbFwiOlxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgY2FzZSBcIlByb2R1Y3RcIjpcclxuICAgICAgICByZXR1cm4gUHJvZHVjdFR5cGUuaW50b01hcEtleSh0eS52YWx1ZSwgdmFsdWUpO1xyXG4gICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigxMCk7XHJcbiAgICAgICAgQWxnZWJyYWljVHlwZS5zZXJpYWxpemVWYWx1ZSh3cml0ZXIsIHR5LCB2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHdyaXRlci50b0Jhc2U2NCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5mdW5jdGlvbiBiaW5kQ2FsbChmKSB7XHJcbiAgcmV0dXJuIEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsLmJpbmQoZik7XHJcbn1cclxudmFyIHByaW1pdGl2ZVNlcmlhbGl6ZXJzID0ge1xyXG4gIEJvb2w6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVCb29sKSxcclxuICBJODogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUk4KSxcclxuICBVODogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVU4KSxcclxuICBJMTY6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJMTYpLFxyXG4gIFUxNjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVUxNiksXHJcbiAgSTMyOiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTMyKSxcclxuICBVMzI6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMzIpLFxyXG4gIEk2NDogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUk2NCksXHJcbiAgVTY0OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTY0KSxcclxuICBJMTI4OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTEyOCksXHJcbiAgVTEyODogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVUxMjgpLFxyXG4gIEkyNTY6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJMjU2KSxcclxuICBVMjU2OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTI1NiksXHJcbiAgRjMyOiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlRjMyKSxcclxuICBGNjQ6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVGNjQpLFxyXG4gIFN0cmluZzogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVN0cmluZylcclxufTtcclxuT2JqZWN0LmZyZWV6ZShwcmltaXRpdmVTZXJpYWxpemVycyk7XHJcbnZhciBzZXJpYWxpemVVaW50OEFycmF5ID0gYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVVJbnQ4QXJyYXkpO1xyXG52YXIgcHJpbWl0aXZlRGVzZXJpYWxpemVycyA9IHtcclxuICBCb29sOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRCb29sKSxcclxuICBJODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTgpLFxyXG4gIFU4OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVOCksXHJcbiAgSTE2OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRJMTYpLFxyXG4gIFUxNjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTE2KSxcclxuICBJMzI6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEkzMiksXHJcbiAgVTMyOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVMzIpLFxyXG4gIEk2NDogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTY0KSxcclxuICBVNjQ6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFU2NCksXHJcbiAgSTEyODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTEyOCksXHJcbiAgVTEyODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTEyOCksXHJcbiAgSTI1NjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTI1NiksXHJcbiAgVTI1NjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTI1NiksXHJcbiAgRjMyOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRGMzIpLFxyXG4gIEY2NDogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkRjY0KSxcclxuICBTdHJpbmc6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFN0cmluZylcclxufTtcclxuT2JqZWN0LmZyZWV6ZShwcmltaXRpdmVEZXNlcmlhbGl6ZXJzKTtcclxudmFyIGRlc2VyaWFsaXplVWludDhBcnJheSA9IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFVJbnQ4QXJyYXkpO1xyXG52YXIgcHJpbWl0aXZlU2l6ZXMgPSB7XHJcbiAgQm9vbDogMSxcclxuICBJODogMSxcclxuICBVODogMSxcclxuICBJMTY6IDIsXHJcbiAgVTE2OiAyLFxyXG4gIEkzMjogNCxcclxuICBVMzI6IDQsXHJcbiAgSTY0OiA4LFxyXG4gIFU2NDogOCxcclxuICBJMTI4OiAxNixcclxuICBVMTI4OiAxNixcclxuICBJMjU2OiAzMixcclxuICBVMjU2OiAzMixcclxuICBGMzI6IDQsXHJcbiAgRjY0OiA4XHJcbn07XHJcbnZhciBmaXhlZFNpemVQcmltaXRpdmVzID0gbmV3IFNldChPYmplY3Qua2V5cyhwcmltaXRpdmVTaXplcykpO1xyXG52YXIgaXNGaXhlZFNpemVQcm9kdWN0ID0gKHR5KSA9PiB0eS5lbGVtZW50cy5ldmVyeShcclxuICAoeyBhbGdlYnJhaWNUeXBlIH0pID0+IGZpeGVkU2l6ZVByaW1pdGl2ZXMuaGFzKGFsZ2VicmFpY1R5cGUudGFnKVxyXG4pO1xyXG52YXIgcHJvZHVjdFNpemUgPSAodHkpID0+IHR5LmVsZW1lbnRzLnJlZHVjZShcclxuICAoYWNjLCB7IGFsZ2VicmFpY1R5cGUgfSkgPT4gYWNjICsgcHJpbWl0aXZlU2l6ZXNbYWxnZWJyYWljVHlwZS50YWddLFxyXG4gIDBcclxuKTtcclxudmFyIHByaW1pdGl2ZUpTTmFtZSA9IHtcclxuICBCb29sOiBcIlVpbnQ4XCIsXHJcbiAgSTg6IFwiSW50OFwiLFxyXG4gIFU4OiBcIlVpbnQ4XCIsXHJcbiAgSTE2OiBcIkludDE2XCIsXHJcbiAgVTE2OiBcIlVpbnQxNlwiLFxyXG4gIEkzMjogXCJJbnQzMlwiLFxyXG4gIFUzMjogXCJVaW50MzJcIixcclxuICBJNjQ6IFwiQmlnSW50NjRcIixcclxuICBVNjQ6IFwiQmlnVWludDY0XCIsXHJcbiAgRjMyOiBcIkZsb2F0MzJcIixcclxuICBGNjQ6IFwiRmxvYXQ2NFwiXHJcbn07XHJcbnZhciBzcGVjaWFsUHJvZHVjdERlc2VyaWFsaXplcnMgPSB7XHJcbiAgX190aW1lX2R1cmF0aW9uX21pY3Jvc19fOiAocmVhZGVyKSA9PiBuZXcgVGltZUR1cmF0aW9uKHJlYWRlci5yZWFkSTY0KCkpLFxyXG4gIF9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX186IChyZWFkZXIpID0+IG5ldyBUaW1lc3RhbXAocmVhZGVyLnJlYWRJNjQoKSksXHJcbiAgX19pZGVudGl0eV9fOiAocmVhZGVyKSA9PiBuZXcgSWRlbnRpdHkocmVhZGVyLnJlYWRVMjU2KCkpLFxyXG4gIF9fY29ubmVjdGlvbl9pZF9fOiAocmVhZGVyKSA9PiBuZXcgQ29ubmVjdGlvbklkKHJlYWRlci5yZWFkVTEyOCgpKSxcclxuICBfX3V1aWRfXzogKHJlYWRlcikgPT4gbmV3IFV1aWQocmVhZGVyLnJlYWRVMTI4KCkpXHJcbn07XHJcbk9iamVjdC5mcmVlemUoc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzKTtcclxudmFyIHVuaXREZXNlcmlhbGl6ZXIgPSAoKSA9PiAoe30pO1xyXG52YXIgZ2V0RWxlbWVudEluaXRpYWxpemVyID0gKGVsZW1lbnQpID0+IHtcclxuICBsZXQgaW5pdDtcclxuICBzd2l0Y2ggKGVsZW1lbnQuYWxnZWJyYWljVHlwZS50YWcpIHtcclxuICAgIGNhc2UgXCJTdHJpbmdcIjpcclxuICAgICAgaW5pdCA9IFwiJydcIjtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIFwiQm9vbFwiOlxyXG4gICAgICBpbml0ID0gXCJmYWxzZVwiO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgXCJJOFwiOlxyXG4gICAgY2FzZSBcIlU4XCI6XHJcbiAgICBjYXNlIFwiSTE2XCI6XHJcbiAgICBjYXNlIFwiVTE2XCI6XHJcbiAgICBjYXNlIFwiSTMyXCI6XHJcbiAgICBjYXNlIFwiVTMyXCI6XHJcbiAgICAgIGluaXQgPSBcIjBcIjtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIFwiSTY0XCI6XHJcbiAgICBjYXNlIFwiVTY0XCI6XHJcbiAgICBjYXNlIFwiSTEyOFwiOlxyXG4gICAgY2FzZSBcIlUxMjhcIjpcclxuICAgIGNhc2UgXCJJMjU2XCI6XHJcbiAgICBjYXNlIFwiVTI1NlwiOlxyXG4gICAgICBpbml0ID0gXCIwblwiO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgXCJGMzJcIjpcclxuICAgIGNhc2UgXCJGNjRcIjpcclxuICAgICAgaW5pdCA9IFwiMC4wXCI7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgaW5pdCA9IFwidW5kZWZpbmVkXCI7XHJcbiAgfVxyXG4gIHJldHVybiBgJHtlbGVtZW50Lm5hbWV9OiAke2luaXR9YDtcclxufTtcclxudmFyIFByb2R1Y3RUeXBlID0ge1xyXG4gIG1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcclxuICAgIGxldCBzZXJpYWxpemVyID0gU0VSSUFMSVpFUlMuZ2V0KHR5KTtcclxuICAgIGlmIChzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBzZXJpYWxpemVyO1xyXG4gICAgaWYgKGlzRml4ZWRTaXplUHJvZHVjdCh0eSkpIHtcclxuICAgICAgY29uc3Qgc2l6ZSA9IHByb2R1Y3RTaXplKHR5KTtcclxuICAgICAgY29uc3QgYm9keTIgPSBgXCJ1c2Ugc3RyaWN0XCI7XHJcbndyaXRlci5leHBhbmRCdWZmZXIoJHtzaXplfSk7XHJcbmNvbnN0IHZpZXcgPSB3cml0ZXIudmlldztcclxuJHt0eS5lbGVtZW50cy5tYXAoXHJcbiAgICAgICAgKHsgbmFtZSwgYWxnZWJyYWljVHlwZTogeyB0YWcgfSB9KSA9PiB0YWcgaW4gcHJpbWl0aXZlSlNOYW1lID8gYHZpZXcuc2V0JHtwcmltaXRpdmVKU05hbWVbdGFnXX0od3JpdGVyLm9mZnNldCwgdmFsdWUuJHtuYW1lfSwgJHtwcmltaXRpdmVTaXplc1t0YWddID4gMSA/IFwidHJ1ZVwiIDogXCJcIn0pO1xyXG53cml0ZXIub2Zmc2V0ICs9ICR7cHJpbWl0aXZlU2l6ZXNbdGFnXX07YCA6IGB3cml0ZXIud3JpdGUke3RhZ30odmFsdWUuJHtuYW1lfSk7YFxyXG4gICAgICApLmpvaW4oXCJcXG5cIil9YDtcclxuICAgICAgc2VyaWFsaXplciA9IEZ1bmN0aW9uKFwid3JpdGVyXCIsIFwidmFsdWVcIiwgYm9keTIpO1xyXG4gICAgICBTRVJJQUxJWkVSUy5zZXQodHksIHNlcmlhbGl6ZXIpO1xyXG4gICAgICByZXR1cm4gc2VyaWFsaXplcjtcclxuICAgIH1cclxuICAgIGNvbnN0IHNlcmlhbGl6ZXJzID0ge307XHJcbiAgICBjb25zdCBib2R5ID0gJ1widXNlIHN0cmljdFwiO1xcbicgKyB0eS5lbGVtZW50cy5tYXAoXHJcbiAgICAgIChlbGVtZW50KSA9PiBgdGhpcy4ke2VsZW1lbnQubmFtZX0od3JpdGVyLCB2YWx1ZS4ke2VsZW1lbnQubmFtZX0pO2BcclxuICAgICkuam9pbihcIlxcblwiKTtcclxuICAgIHNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcIndyaXRlclwiLCBcInZhbHVlXCIsIGJvZHkpLmJpbmQoXHJcbiAgICAgIHNlcmlhbGl6ZXJzXHJcbiAgICApO1xyXG4gICAgU0VSSUFMSVpFUlMuc2V0KHR5LCBzZXJpYWxpemVyKTtcclxuICAgIGZvciAoY29uc3QgeyBuYW1lLCBhbGdlYnJhaWNUeXBlIH0gb2YgdHkuZWxlbWVudHMpIHtcclxuICAgICAgc2VyaWFsaXplcnNbbmFtZV0gPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxyXG4gICAgICAgIGFsZ2VicmFpY1R5cGUsXHJcbiAgICAgICAgdHlwZXNwYWNlXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZnJlZXplKHNlcmlhbGl6ZXJzKTtcclxuICAgIHJldHVybiBzZXJpYWxpemVyO1xyXG4gIH0sXHJcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZVNlcmlhbGl6ZXJgIGluc3RlYWQuICovXHJcbiAgc2VyaWFsaXplVmFsdWUod3JpdGVyLCB0eSwgdmFsdWUsIHR5cGVzcGFjZSkge1xyXG4gICAgUHJvZHVjdFR5cGUubWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkod3JpdGVyLCB2YWx1ZSk7XHJcbiAgfSxcclxuICBtYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcclxuICAgIHN3aXRjaCAodHkuZWxlbWVudHMubGVuZ3RoKSB7XHJcbiAgICAgIGNhc2UgMDpcclxuICAgICAgICByZXR1cm4gdW5pdERlc2VyaWFsaXplcjtcclxuICAgICAgY2FzZSAxOiB7XHJcbiAgICAgICAgY29uc3QgZmllbGROYW1lID0gdHkuZWxlbWVudHNbMF0ubmFtZTtcclxuICAgICAgICBpZiAoaGFzT3duKHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVycywgZmllbGROYW1lKSlcclxuICAgICAgICAgIHJldHVybiBzcGVjaWFsUHJvZHVjdERlc2VyaWFsaXplcnNbZmllbGROYW1lXTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgbGV0IGRlc2VyaWFsaXplciA9IERFU0VSSUFMSVpFUlMuZ2V0KHR5KTtcclxuICAgIGlmIChkZXNlcmlhbGl6ZXIgIT0gbnVsbCkgcmV0dXJuIGRlc2VyaWFsaXplcjtcclxuICAgIGlmIChpc0ZpeGVkU2l6ZVByb2R1Y3QodHkpKSB7XHJcbiAgICAgIGNvbnN0IGJvZHkgPSBgXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IHJlc3VsdCA9IHsgJHt0eS5lbGVtZW50cy5tYXAoZ2V0RWxlbWVudEluaXRpYWxpemVyKS5qb2luKFwiLCBcIil9IH07XHJcbmNvbnN0IHZpZXcgPSByZWFkZXIudmlldztcclxuJHt0eS5lbGVtZW50cy5tYXAoXHJcbiAgICAgICAgKHsgbmFtZSwgYWxnZWJyYWljVHlwZTogeyB0YWcgfSB9KSA9PiB0YWcgaW4gcHJpbWl0aXZlSlNOYW1lID8gYHJlc3VsdC4ke25hbWV9ID0gdmlldy5nZXQke3ByaW1pdGl2ZUpTTmFtZVt0YWddfShyZWFkZXIub2Zmc2V0LCAke3ByaW1pdGl2ZVNpemVzW3RhZ10gPiAxID8gXCJ0cnVlXCIgOiBcIlwifSk7XHJcbnJlYWRlci5vZmZzZXQgKz0gJHtwcmltaXRpdmVTaXplc1t0YWddfTtgIDogYHJlc3VsdC4ke25hbWV9ID0gcmVhZGVyLnJlYWQke3RhZ30oKTtgXHJcbiAgICAgICkuam9pbihcIlxcblwiKX1cclxucmV0dXJuIHJlc3VsdDtgO1xyXG4gICAgICBkZXNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcInJlYWRlclwiLCBib2R5KTtcclxuICAgICAgREVTRVJJQUxJWkVSUy5zZXQodHksIGRlc2VyaWFsaXplcik7XHJcbiAgICAgIHJldHVybiBkZXNlcmlhbGl6ZXI7XHJcbiAgICB9XHJcbiAgICBjb25zdCBkZXNlcmlhbGl6ZXJzID0ge307XHJcbiAgICBkZXNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcclxuICAgICAgXCJyZWFkZXJcIixcclxuICAgICAgYFwidXNlIHN0cmljdFwiO1xyXG5jb25zdCByZXN1bHQgPSB7ICR7dHkuZWxlbWVudHMubWFwKGdldEVsZW1lbnRJbml0aWFsaXplcikuam9pbihcIiwgXCIpfSB9O1xyXG4ke3R5LmVsZW1lbnRzLm1hcCgoeyBuYW1lIH0pID0+IGByZXN1bHQuJHtuYW1lfSA9IHRoaXMuJHtuYW1lfShyZWFkZXIpO2ApLmpvaW4oXCJcXG5cIil9XHJcbnJldHVybiByZXN1bHQ7YFxyXG4gICAgKS5iaW5kKGRlc2VyaWFsaXplcnMpO1xyXG4gICAgREVTRVJJQUxJWkVSUy5zZXQodHksIGRlc2VyaWFsaXplcik7XHJcbiAgICBmb3IgKGNvbnN0IHsgbmFtZSwgYWxnZWJyYWljVHlwZSB9IG9mIHR5LmVsZW1lbnRzKSB7XHJcbiAgICAgIGRlc2VyaWFsaXplcnNbbmFtZV0gPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXHJcbiAgICAgICAgYWxnZWJyYWljVHlwZSxcclxuICAgICAgICB0eXBlc3BhY2VcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIE9iamVjdC5mcmVlemUoZGVzZXJpYWxpemVycyk7XHJcbiAgICByZXR1cm4gZGVzZXJpYWxpemVyO1xyXG4gIH0sXHJcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZURlc2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cclxuICBkZXNlcmlhbGl6ZVZhbHVlKHJlYWRlciwgdHksIHR5cGVzcGFjZSkge1xyXG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlLm1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkocmVhZGVyKTtcclxuICB9LFxyXG4gIGludG9NYXBLZXkodHksIHZhbHVlKSB7XHJcbiAgICBpZiAodHkuZWxlbWVudHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IHR5LmVsZW1lbnRzWzBdLm5hbWU7XHJcbiAgICAgIGlmIChoYXNPd24oc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzLCBmaWVsZE5hbWUpKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlW2ZpZWxkTmFtZV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTApO1xyXG4gICAgQWxnZWJyYWljVHlwZS5zZXJpYWxpemVWYWx1ZSh3cml0ZXIsIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh0eSksIHZhbHVlKTtcclxuICAgIHJldHVybiB3cml0ZXIudG9CYXNlNjQoKTtcclxuICB9XHJcbn07XHJcbnZhciBTdW1UeXBlID0ge1xyXG4gIG1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcclxuICAgIGlmICh0eS52YXJpYW50cy5sZW5ndGggPT0gMiAmJiB0eS52YXJpYW50c1swXS5uYW1lID09PSBcInNvbWVcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcIm5vbmVcIikge1xyXG4gICAgICBjb25zdCBzZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxyXG4gICAgICAgIHR5LnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGUsXHJcbiAgICAgICAgdHlwZXNwYWNlXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiAod3JpdGVyLCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICB3cml0ZXIud3JpdGVCeXRlKDApO1xyXG4gICAgICAgICAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB3cml0ZXIud3JpdGVCeXRlKDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH0gZWxzZSBpZiAodHkudmFyaWFudHMubGVuZ3RoID09IDIgJiYgdHkudmFyaWFudHNbMF0ubmFtZSA9PT0gXCJva1wiICYmIHR5LnZhcmlhbnRzWzFdLm5hbWUgPT09IFwiZXJyXCIpIHtcclxuICAgICAgY29uc3Qgc2VyaWFsaXplT2sgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxyXG4gICAgICAgIHR5LnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGUsXHJcbiAgICAgICAgdHlwZXNwYWNlXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZUVyciA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXHJcbiAgICAgICAgdHkudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZSxcclxuICAgICAgICB0eXBlc3BhY2VcclxuICAgICAgKTtcclxuICAgICAgcmV0dXJuICh3cml0ZXIsIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgaWYgKFwib2tcIiBpbiB2YWx1ZSkge1xyXG4gICAgICAgICAgd3JpdGVyLndyaXRlVTgoMCk7XHJcbiAgICAgICAgICBzZXJpYWxpemVPayh3cml0ZXIsIHZhbHVlLm9rKTtcclxuICAgICAgICB9IGVsc2UgaWYgKFwiZXJyXCIgaW4gdmFsdWUpIHtcclxuICAgICAgICAgIHdyaXRlci53cml0ZVU4KDEpO1xyXG4gICAgICAgICAgc2VyaWFsaXplRXJyKHdyaXRlciwgdmFsdWUuZXJyKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcclxuICAgICAgICAgICAgXCJjb3VsZCBub3Qgc2VyaWFsaXplIHJlc3VsdDogb2JqZWN0IGhhZCBuZWl0aGVyIGEgYG9rYCBub3IgYW4gYGVycmAgZmllbGRcIlxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgc2VyaWFsaXplciA9IFNFUklBTElaRVJTLmdldCh0eSk7XHJcbiAgICAgIGlmIChzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBzZXJpYWxpemVyO1xyXG4gICAgICBjb25zdCBzZXJpYWxpemVycyA9IHt9O1xyXG4gICAgICBjb25zdCBib2R5ID0gYHN3aXRjaCAodmFsdWUudGFnKSB7XHJcbiR7dHkudmFyaWFudHMubWFwKFxyXG4gICAgICAgICh7IG5hbWUgfSwgaSkgPT4gYCAgY2FzZSAke0pTT04uc3RyaW5naWZ5KG5hbWUpfTpcclxuICAgIHdyaXRlci53cml0ZUJ5dGUoJHtpfSk7XHJcbiAgICByZXR1cm4gdGhpcy4ke25hbWV9KHdyaXRlciwgdmFsdWUudmFsdWUpO2BcclxuICAgICAgKS5qb2luKFwiXFxuXCIpfVxyXG4gIGRlZmF1bHQ6XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxyXG4gICAgICBcXGBDb3VsZCBub3Qgc2VyaWFsaXplIHN1bSB0eXBlOyB1bmtub3duIHRhZyBcXCR7dmFsdWUudGFnfVxcYFxyXG4gICAgKVxyXG59XHJcbmA7XHJcbiAgICAgIHNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcIndyaXRlclwiLCBcInZhbHVlXCIsIGJvZHkpLmJpbmQoXHJcbiAgICAgICAgc2VyaWFsaXplcnNcclxuICAgICAgKTtcclxuICAgICAgU0VSSUFMSVpFUlMuc2V0KHR5LCBzZXJpYWxpemVyKTtcclxuICAgICAgZm9yIChjb25zdCB7IG5hbWUsIGFsZ2VicmFpY1R5cGUgfSBvZiB0eS52YXJpYW50cykge1xyXG4gICAgICAgIHNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcclxuICAgICAgICAgIGFsZ2VicmFpY1R5cGUsXHJcbiAgICAgICAgICB0eXBlc3BhY2VcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIE9iamVjdC5mcmVlemUoc2VyaWFsaXplcnMpO1xyXG4gICAgICByZXR1cm4gc2VyaWFsaXplcjtcclxuICAgIH1cclxuICB9LFxyXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VTZXJpYWxpemVyYCBpbnN0ZWFkLiAqL1xyXG4gIHNlcmlhbGl6ZVZhbHVlKHdyaXRlciwgdHksIHZhbHVlLCB0eXBlc3BhY2UpIHtcclxuICAgIFN1bVR5cGUubWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkod3JpdGVyLCB2YWx1ZSk7XHJcbiAgfSxcclxuICBtYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpIHtcclxuICAgIGlmICh0eS52YXJpYW50cy5sZW5ndGggPT0gMiAmJiB0eS52YXJpYW50c1swXS5uYW1lID09PSBcInNvbWVcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcIm5vbmVcIikge1xyXG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcclxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICApO1xyXG4gICAgICByZXR1cm4gKHJlYWRlcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRhZyA9IHJlYWRlci5yZWFkVTgoKTtcclxuICAgICAgICBpZiAodGFnID09PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gZGVzZXJpYWxpemUocmVhZGVyKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRhZyA9PT0gMSkge1xyXG4gICAgICAgICAgcmV0dXJuIHZvaWQgMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhyb3cgYENhbid0IGRlc2VyaWFsaXplIGFuIG9wdGlvbiB0eXBlLCBjb3VsZG4ndCBmaW5kICR7dGFnfSB0YWdgO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH0gZWxzZSBpZiAodHkudmFyaWFudHMubGVuZ3RoID09IDIgJiYgdHkudmFyaWFudHNbMF0ubmFtZSA9PT0gXCJva1wiICYmIHR5LnZhcmlhbnRzWzFdLm5hbWUgPT09IFwiZXJyXCIpIHtcclxuICAgICAgY29uc3QgZGVzZXJpYWxpemVPayA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcclxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBkZXNlcmlhbGl6ZUVyciA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcclxuICAgICAgICB0eS52YXJpYW50c1sxXS5hbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICApO1xyXG4gICAgICByZXR1cm4gKHJlYWRlcikgPT4ge1xyXG4gICAgICAgIGNvbnN0IHRhZyA9IHJlYWRlci5yZWFkQnl0ZSgpO1xyXG4gICAgICAgIGlmICh0YWcgPT09IDApIHtcclxuICAgICAgICAgIHJldHVybiB7IG9rOiBkZXNlcmlhbGl6ZU9rKHJlYWRlcikgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRhZyA9PT0gMSkge1xyXG4gICAgICAgICAgcmV0dXJuIHsgZXJyOiBkZXNlcmlhbGl6ZUVycihyZWFkZXIpIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRocm93IGBDYW4ndCBkZXNlcmlhbGl6ZSBhIHJlc3VsdCB0eXBlLCBjb3VsZG4ndCBmaW5kICR7dGFnfSB0YWdgO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBkZXNlcmlhbGl6ZXIgPSBERVNFUklBTElaRVJTLmdldCh0eSk7XHJcbiAgICAgIGlmIChkZXNlcmlhbGl6ZXIgIT0gbnVsbCkgcmV0dXJuIGRlc2VyaWFsaXplcjtcclxuICAgICAgY29uc3QgZGVzZXJpYWxpemVycyA9IHt9O1xyXG4gICAgICBkZXNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcclxuICAgICAgICBcInJlYWRlclwiLFxyXG4gICAgICAgIGBzd2l0Y2ggKHJlYWRlci5yZWFkVTgoKSkge1xyXG4ke3R5LnZhcmlhbnRzLm1hcChcclxuICAgICAgICAgICh7IG5hbWUgfSwgaSkgPT4gYGNhc2UgJHtpfTogcmV0dXJuIHsgdGFnOiAke0pTT04uc3RyaW5naWZ5KG5hbWUpfSwgdmFsdWU6IHRoaXMuJHtuYW1lfShyZWFkZXIpIH07YFxyXG4gICAgICAgICkuam9pbihcIlxcblwiKX0gfWBcclxuICAgICAgKS5iaW5kKGRlc2VyaWFsaXplcnMpO1xyXG4gICAgICBERVNFUklBTElaRVJTLnNldCh0eSwgZGVzZXJpYWxpemVyKTtcclxuICAgICAgZm9yIChjb25zdCB7IG5hbWUsIGFsZ2VicmFpY1R5cGUgfSBvZiB0eS52YXJpYW50cykge1xyXG4gICAgICAgIGRlc2VyaWFsaXplcnNbbmFtZV0gPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgICAgdHlwZXNwYWNlXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBPYmplY3QuZnJlZXplKGRlc2VyaWFsaXplcnMpO1xyXG4gICAgICByZXR1cm4gZGVzZXJpYWxpemVyO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZURlc2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cclxuICBkZXNlcmlhbGl6ZVZhbHVlKHJlYWRlciwgdHksIHR5cGVzcGFjZSkge1xyXG4gICAgcmV0dXJuIFN1bVR5cGUubWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKShyZWFkZXIpO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvb3B0aW9uLnRzXHJcbnZhciBPcHRpb24gPSB7XHJcbiAgZ2V0QWxnZWJyYWljVHlwZShpbm5lclR5cGUpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlN1bSh7XHJcbiAgICAgIHZhcmlhbnRzOiBbXHJcbiAgICAgICAgeyBuYW1lOiBcInNvbWVcIiwgYWxnZWJyYWljVHlwZTogaW5uZXJUeXBlIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJub25lXCIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLlByb2R1Y3QoeyBlbGVtZW50czogW10gfSlcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvcmVzdWx0LnRzXHJcbnZhciBSZXN1bHQgPSB7XHJcbiAgZ2V0QWxnZWJyYWljVHlwZShva1R5cGUsIGVyclR5cGUpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlN1bSh7XHJcbiAgICAgIHZhcmlhbnRzOiBbXHJcbiAgICAgICAgeyBuYW1lOiBcIm9rXCIsIGFsZ2VicmFpY1R5cGU6IG9rVHlwZSB9LFxyXG4gICAgICAgIHsgbmFtZTogXCJlcnJcIiwgYWxnZWJyYWljVHlwZTogZXJyVHlwZSB9XHJcbiAgICAgIF1cclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvc2NoZWR1bGVfYXQudHNcclxudmFyIFNjaGVkdWxlQXQgPSB7XHJcbiAgaW50ZXJ2YWwodmFsdWUpIHtcclxuICAgIHJldHVybiBJbnRlcnZhbCh2YWx1ZSk7XHJcbiAgfSxcclxuICB0aW1lKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gVGltZSh2YWx1ZSk7XHJcbiAgfSxcclxuICBnZXRBbGdlYnJhaWNUeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuU3VtKHtcclxuICAgICAgdmFyaWFudHM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBuYW1lOiBcIkludGVydmFsXCIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBUaW1lRHVyYXRpb24uZ2V0QWxnZWJyYWljVHlwZSgpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7IG5hbWU6IFwiVGltZVwiLCBhbGdlYnJhaWNUeXBlOiBUaW1lc3RhbXAuZ2V0QWxnZWJyYWljVHlwZSgpIH1cclxuICAgICAgXVxyXG4gICAgfSk7XHJcbiAgfSxcclxuICBpc1NjaGVkdWxlQXQoYWxnZWJyYWljVHlwZSkge1xyXG4gICAgaWYgKGFsZ2VicmFpY1R5cGUudGFnICE9PSBcIlN1bVwiKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IHZhcmlhbnRzID0gYWxnZWJyYWljVHlwZS52YWx1ZS52YXJpYW50cztcclxuICAgIGlmICh2YXJpYW50cy5sZW5ndGggIT09IDIpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgaW50ZXJ2YWxWYXJpYW50ID0gdmFyaWFudHMuZmluZCgodikgPT4gdi5uYW1lID09PSBcIkludGVydmFsXCIpO1xyXG4gICAgY29uc3QgdGltZVZhcmlhbnQgPSB2YXJpYW50cy5maW5kKCh2KSA9PiB2Lm5hbWUgPT09IFwiVGltZVwiKTtcclxuICAgIGlmICghaW50ZXJ2YWxWYXJpYW50IHx8ICF0aW1lVmFyaWFudCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gVGltZUR1cmF0aW9uLmlzVGltZUR1cmF0aW9uKGludGVydmFsVmFyaWFudC5hbGdlYnJhaWNUeXBlKSAmJiBUaW1lc3RhbXAuaXNUaW1lc3RhbXAodGltZVZhcmlhbnQuYWxnZWJyYWljVHlwZSk7XHJcbiAgfVxyXG59O1xyXG52YXIgSW50ZXJ2YWwgPSAobWljcm9zKSA9PiAoe1xyXG4gIHRhZzogXCJJbnRlcnZhbFwiLFxyXG4gIHZhbHVlOiBuZXcgVGltZUR1cmF0aW9uKG1pY3JvcylcclxufSk7XHJcbnZhciBUaW1lID0gKG1pY3Jvc1NpbmNlVW5peEVwb2NoKSA9PiAoe1xyXG4gIHRhZzogXCJUaW1lXCIsXHJcbiAgdmFsdWU6IG5ldyBUaW1lc3RhbXAobWljcm9zU2luY2VVbml4RXBvY2gpXHJcbn0pO1xyXG52YXIgc2NoZWR1bGVfYXRfZGVmYXVsdCA9IFNjaGVkdWxlQXQ7XHJcblxyXG4vLyBzcmMvbGliL3R5cGVfdXRpbC50c1xyXG5mdW5jdGlvbiBzZXQoeCwgdDIpIHtcclxuICByZXR1cm4geyAuLi54LCAuLi50MiB9O1xyXG59XHJcblxyXG4vLyBzcmMvbGliL3R5cGVfYnVpbGRlcnMudHNcclxudmFyIFR5cGVCdWlsZGVyID0gY2xhc3Mge1xyXG4gIC8qKlxyXG4gICAqIFRoZSBUeXBlU2NyaXB0IHBoYW50b20gdHlwZS4gVGhpcyBpcyBub3Qgc3RvcmVkIGF0IHJ1bnRpbWUsXHJcbiAgICogYnV0IGlzIHZpc2libGUgdG8gdGhlIGNvbXBpbGVyXHJcbiAgICovXHJcbiAgdHlwZTtcclxuICAvKipcclxuICAgKiBUaGUgU3BhY2V0aW1lREIgYWxnZWJyYWljIHR5cGUgKHJ1buKAkXRpbWUgdmFsdWUpLiBJbiBhZGRpdGlvbiB0byBzdG9yaW5nXHJcbiAgICogdGhlIHJ1bnRpbWUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGBBbGdlYnJhaWNUeXBlYCwgaXQgYWxzbyBjYXB0dXJlc1xyXG4gICAqIHRoZSBUeXBlU2NyaXB0IHR5cGUgaW5mb3JtYXRpb24gb2YgdGhlIGBBbGdlYnJhaWNUeXBlYC4gVGhhdCBpcyB0byBzYXlcclxuICAgKiB0aGUgdmFsdWUgaXMgbm90IG1lcmVseSBhbiBgQWxnZWJyYWljVHlwZWAsIGJ1dCBpcyBjb25zdHJ1Y3RlZCB0byBiZVxyXG4gICAqIHRoZSBjb3JyZXNwb25kaW5nIGNvbmNyZXRlIGBBbGdlYnJhaWNUeXBlYCBmb3IgdGhlIFR5cGVTY3JpcHQgdHlwZSBgVHlwZWAuXHJcbiAgICpcclxuICAgKiBlLmcuIGBzdHJpbmdgIGNvcnJlc3BvbmRzIHRvIGBBbGdlYnJhaWNUeXBlLlN0cmluZ2BcclxuICAgKi9cclxuICBhbGdlYnJhaWNUeXBlO1xyXG4gIGNvbnN0cnVjdG9yKGFsZ2VicmFpY1R5cGUpIHtcclxuICAgIHRoaXMuYWxnZWJyYWljVHlwZSA9IGFsZ2VicmFpY1R5cGU7XHJcbiAgfVxyXG4gIG9wdGlvbmFsKCkge1xyXG4gICAgcmV0dXJuIG5ldyBPcHRpb25CdWlsZGVyKHRoaXMpO1xyXG4gIH1cclxuICBzZXJpYWxpemUod3JpdGVyLCB2YWx1ZSkge1xyXG4gICAgY29uc3Qgc2VyaWFsaXplID0gdGhpcy5zZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxyXG4gICAgICB0aGlzLmFsZ2VicmFpY1R5cGVcclxuICAgICk7XHJcbiAgICBzZXJpYWxpemUod3JpdGVyLCB2YWx1ZSk7XHJcbiAgfVxyXG4gIGRlc2VyaWFsaXplKHJlYWRlcikge1xyXG4gICAgY29uc3QgZGVzZXJpYWxpemUgPSB0aGlzLmRlc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxyXG4gICAgICB0aGlzLmFsZ2VicmFpY1R5cGVcclxuICAgICk7XHJcbiAgICByZXR1cm4gZGVzZXJpYWxpemUocmVhZGVyKTtcclxuICB9XHJcbn07XHJcbnZhciBVOEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTgpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFUxNkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTE2KTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgVTE2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgVTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBVMzJCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlUzMik7XHJcbiAgfVxyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgVTY0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VNjQpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVNjRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBVNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFUxMjhCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlUxMjgpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFUyNTZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlUyNTYpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEk4QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JOCk7XHJcbiAgfVxyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgSTE2QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JMTYpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJMTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBJMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEkzMkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTMyKTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgSTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBJNjRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkk2NCk7XHJcbiAgfVxyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IEk2NENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IEk2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgSTEyOEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTEyOCk7XHJcbiAgfVxyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgSTI1NkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTI1Nik7XHJcbiAgfVxyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgRjMyQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5GMzIpO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEYzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEYzMkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBGNjRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkY2NCk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgRjY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgRjY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEJvb2xCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkJvb2wpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgQm9vbENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgQm9vbENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgQm9vbENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBTdHJpbmdCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlN0cmluZyk7XHJcbiAgfVxyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IFN0cmluZ0NvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFN0cmluZ0NvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFN0cmluZ0NvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFN0cmluZ0NvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBBcnJheUJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBlbGVtZW50O1xyXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuQXJyYXkoZWxlbWVudC5hbGdlYnJhaWNUeXBlKSk7XHJcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEFycmF5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgQXJyYXlDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgQnl0ZUFycmF5QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5BcnJheShBbGdlYnJhaWNUeXBlLlU4KSk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgQnl0ZUFycmF5Q29sdW1uQnVpbGRlcihcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgQnl0ZUFycmF5Q29sdW1uQnVpbGRlcihzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIE9wdGlvbkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICB2YWx1ZTtcclxuICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xyXG4gICAgc3VwZXIoT3B0aW9uLmdldEFsZ2VicmFpY1R5cGUodmFsdWUuYWxnZWJyYWljVHlwZSkpO1xyXG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IE9wdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IE9wdGlvbkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBQcm9kdWN0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIHR5cGVOYW1lO1xyXG4gIGVsZW1lbnRzO1xyXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnRzLCBuYW1lKSB7XHJcbiAgICBmdW5jdGlvbiBlbGVtZW50c0FycmF5RnJvbUVsZW1lbnRzT2JqKG9iaikge1xyXG4gICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoKGtleSkgPT4gKHtcclxuICAgICAgICBuYW1lOiBrZXksXHJcbiAgICAgICAgLy8gTGF6aWx5IHJlc29sdmUgdGhlIHVuZGVybHlpbmcgb2JqZWN0J3MgYWxnZWJyYWljVHlwZS5cclxuICAgICAgICAvLyBUaGlzIHdpbGwgY2FsbCBvYmpba2V5XS5hbGdlYnJhaWNUeXBlIG9ubHkgd2hlbiBzb21lb25lXHJcbiAgICAgICAgLy8gYWN0dWFsbHkgcmVhZHMgdGhpcyBwcm9wZXJ0eS5cclxuICAgICAgICBnZXQgYWxnZWJyYWljVHlwZSgpIHtcclxuICAgICAgICAgIHJldHVybiBvYmpba2V5XS5hbGdlYnJhaWNUeXBlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSkpO1xyXG4gICAgfVxyXG4gICAgc3VwZXIoXHJcbiAgICAgIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XHJcbiAgICAgICAgZWxlbWVudHM6IGVsZW1lbnRzQXJyYXlGcm9tRWxlbWVudHNPYmooZWxlbWVudHMpXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gICAgdGhpcy50eXBlTmFtZSA9IG5hbWU7XHJcbiAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgUHJvZHVjdENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb2R1Y3RDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgUmVzdWx0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIG9rO1xyXG4gIGVycjtcclxuICBjb25zdHJ1Y3RvcihvaywgZXJyKSB7XHJcbiAgICBzdXBlcihSZXN1bHQuZ2V0QWxnZWJyYWljVHlwZShvay5hbGdlYnJhaWNUeXBlLCBlcnIuYWxnZWJyYWljVHlwZSkpO1xyXG4gICAgdGhpcy5vayA9IG9rO1xyXG4gICAgdGhpcy5lcnIgPSBlcnI7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgUmVzdWx0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFVuaXRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcih7IHRhZzogXCJQcm9kdWN0XCIsIHZhbHVlOiB7IGVsZW1lbnRzOiBbXSB9IH0pO1xyXG4gIH1cclxufTtcclxudmFyIFJvd0J1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICByb3c7XHJcbiAgdHlwZU5hbWU7XHJcbiAgY29uc3RydWN0b3Iocm93LCBuYW1lKSB7XHJcbiAgICBjb25zdCBtYXBwZWRSb3cgPSBPYmplY3QuZnJvbUVudHJpZXMoXHJcbiAgICAgIE9iamVjdC5lbnRyaWVzKHJvdykubWFwKChbY29sTmFtZSwgYnVpbGRlcl0pID0+IFtcclxuICAgICAgICBjb2xOYW1lLFxyXG4gICAgICAgIGJ1aWxkZXIgaW5zdGFuY2VvZiBDb2x1bW5CdWlsZGVyID8gYnVpbGRlciA6IG5ldyBDb2x1bW5CdWlsZGVyKGJ1aWxkZXIsIHt9KVxyXG4gICAgICBdKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGVsZW1lbnRzID0gT2JqZWN0LmtleXMobWFwcGVkUm93KS5tYXAoKG5hbWUyKSA9PiAoe1xyXG4gICAgICBuYW1lOiBuYW1lMixcclxuICAgICAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIG1hcHBlZFJvd1tuYW1lMl0udHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZTtcclxuICAgICAgfVxyXG4gICAgfSkpO1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHsgZWxlbWVudHMgfSkpO1xyXG4gICAgdGhpcy5yb3cgPSBtYXBwZWRSb3c7XHJcbiAgICB0aGlzLnR5cGVOYW1lID0gbmFtZTtcclxuICB9XHJcbn07XHJcbnZhciBTdW1CdWlsZGVySW1wbCA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIHZhcmlhbnRzO1xyXG4gIHR5cGVOYW1lO1xyXG4gIGNvbnN0cnVjdG9yKHZhcmlhbnRzLCBuYW1lKSB7XHJcbiAgICBmdW5jdGlvbiB2YXJpYW50c0FycmF5RnJvbVZhcmlhbnRzT2JqKHZhcmlhbnRzMikge1xyXG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModmFyaWFudHMyKS5tYXAoKGtleSkgPT4gKHtcclxuICAgICAgICBuYW1lOiBrZXksXHJcbiAgICAgICAgLy8gTGF6aWx5IHJlc29sdmUgdGhlIHVuZGVybHlpbmcgb2JqZWN0J3MgYWxnZWJyYWljVHlwZS5cclxuICAgICAgICAvLyBUaGlzIHdpbGwgY2FsbCBvYmpba2V5XS5hbGdlYnJhaWNUeXBlIG9ubHkgd2hlbiBzb21lb25lXHJcbiAgICAgICAgLy8gYWN0dWFsbHkgcmVhZHMgdGhpcyBwcm9wZXJ0eS5cclxuICAgICAgICBnZXQgYWxnZWJyYWljVHlwZSgpIHtcclxuICAgICAgICAgIHJldHVybiB2YXJpYW50czJba2V5XS5hbGdlYnJhaWNUeXBlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSkpO1xyXG4gICAgfVxyXG4gICAgc3VwZXIoXHJcbiAgICAgIEFsZ2VicmFpY1R5cGUuU3VtKHtcclxuICAgICAgICB2YXJpYW50czogdmFyaWFudHNBcnJheUZyb21WYXJpYW50c09iaih2YXJpYW50cylcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgICB0aGlzLnZhcmlhbnRzID0gdmFyaWFudHM7XHJcbiAgICB0aGlzLnR5cGVOYW1lID0gbmFtZTtcclxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHZhcmlhbnRzKSkge1xyXG4gICAgICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YXJpYW50cywga2V5KTtcclxuICAgICAgY29uc3QgaXNBY2Nlc3NvciA9ICEhZGVzYyAmJiAodHlwZW9mIGRlc2MuZ2V0ID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIGRlc2Muc2V0ID09PSBcImZ1bmN0aW9uXCIpO1xyXG4gICAgICBsZXQgaXNVbml0MiA9IGZhbHNlO1xyXG4gICAgICBpZiAoIWlzQWNjZXNzb3IpIHtcclxuICAgICAgICBjb25zdCB2YXJpYW50ID0gdmFyaWFudHNba2V5XTtcclxuICAgICAgICBpc1VuaXQyID0gdmFyaWFudCBpbnN0YW5jZW9mIFVuaXRCdWlsZGVyO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1VuaXQyKSB7XHJcbiAgICAgICAgY29uc3QgY29uc3RhbnQgPSB0aGlzLmNyZWF0ZShrZXkpO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIHtcclxuICAgICAgICAgIHZhbHVlOiBjb25zdGFudCxcclxuICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgZm4gPSAoKHZhbHVlKSA9PiB0aGlzLmNyZWF0ZShrZXksIHZhbHVlKSk7XHJcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGtleSwge1xyXG4gICAgICAgICAgdmFsdWU6IGZuLFxyXG4gICAgICAgICAgd3JpdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogZmFsc2VcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBjcmVhdGUodGFnLCB2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHZhbHVlID09PSB2b2lkIDAgPyB7IHRhZyB9IDogeyB0YWcsIHZhbHVlIH07XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgU3VtQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgU3VtQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFN1bUJ1aWxkZXIgPSBTdW1CdWlsZGVySW1wbDtcclxudmFyIFNpbXBsZVN1bUJ1aWxkZXJJbXBsID0gY2xhc3MgZXh0ZW5kcyBTdW1CdWlsZGVySW1wbCB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFNpbXBsZVN1bUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFNpbXBsZVN1bUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFNpbXBsZVN1bUJ1aWxkZXIgPSBTaW1wbGVTdW1CdWlsZGVySW1wbDtcclxudmFyIFNjaGVkdWxlQXRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihzY2hlZHVsZV9hdF9kZWZhdWx0LmdldEFsZ2VicmFpY1R5cGUoKSk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFNjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgSWRlbnRpdHlCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihJZGVudGl0eS5nZXRBbGdlYnJhaWNUeXBlKCkpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIENvbm5lY3Rpb25JZEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKENvbm5lY3Rpb25JZC5nZXRBbGdlYnJhaWNUeXBlKCkpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFRpbWVzdGFtcEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFRpbWVzdGFtcC5nZXRBbGdlYnJhaWNUeXBlKCkpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFRpbWVEdXJhdGlvbkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKFRpbWVEdXJhdGlvbi5nZXRBbGdlYnJhaWNUeXBlKCkpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBUaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBUaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFV1aWRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihVdWlkLmdldEFsZ2VicmFpY1R5cGUoKSk7XHJcbiAgfVxyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFV1aWRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgZGVmYXVsdE1ldGFkYXRhID0ge307XHJcbnZhciBDb2x1bW5CdWlsZGVyID0gY2xhc3Mge1xyXG4gIHR5cGVCdWlsZGVyO1xyXG4gIGNvbHVtbk1ldGFkYXRhO1xyXG4gIGNvbnN0cnVjdG9yKHR5cGVCdWlsZGVyLCBtZXRhZGF0YSkge1xyXG4gICAgdGhpcy50eXBlQnVpbGRlciA9IHR5cGVCdWlsZGVyO1xyXG4gICAgdGhpcy5jb2x1bW5NZXRhZGF0YSA9IG1ldGFkYXRhO1xyXG4gIH1cclxuICBzZXJpYWxpemUod3JpdGVyLCB2YWx1ZSkge1xyXG4gICAgdGhpcy50eXBlQnVpbGRlci5zZXJpYWxpemUod3JpdGVyLCB2YWx1ZSk7XHJcbiAgfVxyXG4gIGRlc2VyaWFsaXplKHJlYWRlcikge1xyXG4gICAgcmV0dXJuIHRoaXMudHlwZUJ1aWxkZXIuZGVzZXJpYWxpemUocmVhZGVyKTtcclxuICB9XHJcbn07XHJcbnZhciBVOENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVThDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFUxNkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVTE2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBVMzJDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1UzMkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgVTY0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VNjRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFUxMjhDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1UxMjhDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1UxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFUyNTZDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1UyNTZDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX1UyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1UyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1UyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEk4Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JOENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX0k4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0k4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgX0k4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgSTE2Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JMTZDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEkzMkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSTMyQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBJNjRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0k2NENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX0k2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0k2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgX0k2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0k2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgSTEyOENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSTEyOENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgSTI1NkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSTI1NkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgRjMyQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9GMzJDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfRjMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0YzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgRjY0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9GNjRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfRjY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0Y2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgQm9vbENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfQm9vbENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfQm9vbENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfQm9vbENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfQm9vbENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Cb29sQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBTdHJpbmdDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1N0cmluZ0NvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX1N0cmluZ0NvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1N0cmluZ0NvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfU3RyaW5nQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1N0cmluZ0NvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgQXJyYXlDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0FycmF5Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0FycmF5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0FycmF5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBCeXRlQXJyYXlDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0J5dGVBcnJheUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcihtZXRhZGF0YSkge1xyXG4gICAgc3VwZXIobmV3IFR5cGVCdWlsZGVyKEFsZ2VicmFpY1R5cGUuQXJyYXkoQWxnZWJyYWljVHlwZS5VOCkpLCBtZXRhZGF0YSk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0J5dGVBcnJheUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfQnl0ZUFycmF5Q29sdW1uQnVpbGRlcihzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBPcHRpb25Db2x1bW5CdWlsZGVyID0gY2xhc3MgX09wdGlvbkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9PcHRpb25Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfT3B0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBSZXN1bHRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1Jlc3VsdENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBjb25zdHJ1Y3Rvcih0eXBlQnVpbGRlciwgbWV0YWRhdGEpIHtcclxuICAgIHN1cGVyKHR5cGVCdWlsZGVyLCBtZXRhZGF0YSk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1Jlc3VsdENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBQcm9kdWN0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9Qcm9kdWN0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1Byb2R1Y3RDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1Byb2R1Y3RDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFN1bUNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfU3VtQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1N1bUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfU3VtQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBTaW1wbGVTdW1Db2x1bW5CdWlsZGVyID0gY2xhc3MgX1NpbXBsZVN1bUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBTdW1Db2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX1NpbXBsZVN1bUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfU2ltcGxlU3VtQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFNjaGVkdWxlQXRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1NjaGVkdWxlQXRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfU2NoZWR1bGVBdENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgSWRlbnRpdHlDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0lkZW50aXR5Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0lkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgVGltZXN0YW1wQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9UaW1lc3RhbXBDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9UaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9UaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBUaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyID0gY2xhc3MgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFV1aWRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1V1aWRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX1V1aWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1V1aWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1V1aWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1V1aWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFJlZkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICByZWY7XHJcbiAgLyoqIFRoZSBwaGFudG9tIHR5cGUgb2YgdGhlIHBvaW50ZWUgb2YgdGhpcyByZWYuICovXHJcbiAgX19zcGFjZXRpbWVUeXBlO1xyXG4gIGNvbnN0cnVjdG9yKHJlZikge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5SZWYocmVmKSk7XHJcbiAgICB0aGlzLnJlZiA9IHJlZjtcclxuICB9XHJcbn07XHJcbnZhciBlbnVtSW1wbCA9ICgobmFtZU9yT2JqLCBtYXliZU9iaikgPT4ge1xyXG4gIGxldCBvYmogPSBuYW1lT3JPYmo7XHJcbiAgbGV0IG5hbWUgPSB2b2lkIDA7XHJcbiAgaWYgKHR5cGVvZiBuYW1lT3JPYmogPT09IFwic3RyaW5nXCIpIHtcclxuICAgIGlmICghbWF5YmVPYmopIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcclxuICAgICAgICBcIldoZW4gcHJvdmlkaW5nIGEgbmFtZSwgeW91IG11c3QgYWxzbyBwcm92aWRlIHRoZSB2YXJpYW50cyBvYmplY3Qgb3IgYXJyYXkuXCJcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIG9iaiA9IG1heWJlT2JqO1xyXG4gICAgbmFtZSA9IG5hbWVPck9iajtcclxuICB9XHJcbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xyXG4gICAgY29uc3Qgc2ltcGxlVmFyaWFudHNPYmogPSB7fTtcclxuICAgIGZvciAoY29uc3QgdmFyaWFudCBvZiBvYmopIHtcclxuICAgICAgc2ltcGxlVmFyaWFudHNPYmpbdmFyaWFudF0gPSBuZXcgVW5pdEJ1aWxkZXIoKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgU2ltcGxlU3VtQnVpbGRlckltcGwoc2ltcGxlVmFyaWFudHNPYmosIG5hbWUpO1xyXG4gIH1cclxuICByZXR1cm4gbmV3IFN1bUJ1aWxkZXIob2JqLCBuYW1lKTtcclxufSk7XHJcbnZhciB0ID0ge1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYEJvb2xgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJvb2xlYW5gIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEJvb2xCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGJvb2w6ICgpID0+IG5ldyBCb29sQnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYFN0cmluZ2Age0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgc3RyaW5nYCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBTdHJpbmdCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHN0cmluZzogKCkgPT4gbmV3IFN0cmluZ0J1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBGNjRgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgRjY0QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBudW1iZXI6ICgpID0+IG5ldyBGNjRCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgSThgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSThCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGk4OiAoKSA9PiBuZXcgSThCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgVThgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVThCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHU4OiAoKSA9PiBuZXcgVThCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgSTE2YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEkxNkJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgaTE2OiAoKSA9PiBuZXcgSTE2QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUxNmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMTZCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHUxNjogKCkgPT4gbmV3IFUxNkJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBJMzJgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTMyQnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBpMzI6ICgpID0+IG5ldyBJMzJCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFUzMkJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgdTMyOiAoKSA9PiBuZXcgVTMyQnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYEk2NGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJNjRCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGk2NDogKCkgPT4gbmV3IEk2NEJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBVNjRgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVTY0QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICB1NjQ6ICgpID0+IG5ldyBVNjRCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgSTEyOGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJMTI4QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBpMTI4OiAoKSA9PiBuZXcgSTEyOEJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBVMTI4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFUxMjhCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHUxMjg6ICgpID0+IG5ldyBVMTI4QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkyNTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTI1NkJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgaTI1NjogKCkgPT4gbmV3IEkyNTZCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTI1NmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMjU2QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICB1MjU2OiAoKSA9PiBuZXcgVTI1NkJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBGMzJgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgRjMyQnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBmMzI6ICgpID0+IG5ldyBGMzJCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEY2NEJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgZjY0OiAoKSA9PiBuZXcgRjY0QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYFByb2R1Y3RgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zLiBQcm9kdWN0IHR5cGVzIGluIFNwYWNldGltZURCXHJcbiAgICogYXJlIGVzc2VudGlhbGx5IHRoZSBzYW1lIGFzIG9iamVjdHMgaW4gSmF2YVNjcmlwdC9UeXBlU2NyaXB0LlxyXG4gICAqIFByb3BlcnRpZXMgb2YgdGhlIG9iamVjdCBtdXN0IGFsc28gYmUge0BsaW5rIFR5cGVCdWlsZGVyfXMuXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYW4gb2JqZWN0IHdpdGggc3BlY2lmaWMgcHJvcGVydGllcyBpbiBUeXBlU2NyaXB0LlxyXG4gICAqXHJcbiAgICogQHBhcmFtIG5hbWUgKG9wdGlvbmFsKSBBIGRpc3BsYXkgbmFtZSBmb3IgdGhlIHByb2R1Y3QgdHlwZS4gSWYgb21pdHRlZCwgYW4gYW5vbnltb3VzIHByb2R1Y3QgdHlwZSBpcyBjcmVhdGVkLlxyXG4gICAqIEBwYXJhbSBvYmogVGhlIG9iamVjdCBkZWZpbmluZyB0aGUgcHJvcGVydGllcyBvZiB0aGUgdHlwZSwgd2hvc2UgcHJvcGVydHlcclxuICAgKiB2YWx1ZXMgbXVzdCBiZSB7QGxpbmsgVHlwZUJ1aWxkZXJ9cy5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgUHJvZHVjdEJ1aWxkZXJ9IGluc3RhbmNlLlxyXG4gICAqL1xyXG4gIG9iamVjdDogKChuYW1lT3JPYmosIG1heWJlT2JqKSA9PiB7XHJcbiAgICBpZiAodHlwZW9mIG5hbWVPck9iaiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICBpZiAoIW1heWJlT2JqKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcclxuICAgICAgICAgIFwiV2hlbiBwcm92aWRpbmcgYSBuYW1lLCB5b3UgbXVzdCBhbHNvIHByb3ZpZGUgdGhlIG9iamVjdC5cIlxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ldyBQcm9kdWN0QnVpbGRlcihtYXliZU9iaiwgbmFtZU9yT2JqKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgUHJvZHVjdEJ1aWxkZXIobmFtZU9yT2JqLCB2b2lkIDApO1xyXG4gIH0pLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYFJvd2Age0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnMuIFJvdyB0eXBlcyBpbiBTcGFjZXRpbWVEQlxyXG4gICAqIGFyZSBzaW1pbGFyIHRvIGBQcm9kdWN0YCB0eXBlcywgYnV0IGFyZSBzcGVjaWZpY2FsbHkgdXNlZCB0byBkZWZpbmUgdGhlIHNjaGVtYSBvZiBhIHRhYmxlIHJvdy5cclxuICAgKiBQcm9wZXJ0aWVzIG9mIHRoZSBvYmplY3QgbXVzdCBhbHNvIGJlIHtAbGluayBUeXBlQnVpbGRlcn0gb3Ige0BsaW5rIENvbHVtbkJ1aWxkZXJ9cy5cclxuICAgKlxyXG4gICAqIFlvdSBjYW4gcmVwcmVzZW50IGEgYFJvd2AgYXMgZWl0aGVyIGEge0BsaW5rIFJvd09ian0gb3IgYW4ge0BsaW5rIFJvd0J1aWxkZXJ9IHR5cGUgd2hlblxyXG4gICAqIGRlZmluaW5nIGEgdGFibGUgc2NoZW1hLlxyXG4gICAqXHJcbiAgICogVGhlIHtAbGluayBSb3dCdWlsZGVyfSB0eXBlIGlzIHVzZWZ1bCB3aGVuIHlvdSB3YW50IHRvIGNyZWF0ZSBhIHR5cGUgd2hpY2ggY2FuIGJlIHVzZWQgYW55d2hlcmVcclxuICAgKiBhIHtAbGluayBUeXBlQnVpbGRlcn0gaXMgYWNjZXB0ZWQsIHN1Y2ggYXMgaW4gbmVzdGVkIG9iamVjdHMgb3IgYXJyYXlzLCBvciBhcyB0aGUgYXJndW1lbnRcclxuICAgKiB0byBhIHNjaGVkdWxlZCBmdW5jdGlvbi5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBvYmogVGhlIG9iamVjdCBkZWZpbmluZyB0aGUgcHJvcGVydGllcyBvZiB0aGUgcm93LCB3aG9zZSBwcm9wZXJ0eVxyXG4gICAqIHZhbHVlcyBtdXN0IGJlIHtAbGluayBUeXBlQnVpbGRlcn1zIG9yIHtAbGluayBDb2x1bW5CdWlsZGVyfXMuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFJvd0J1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgcm93OiAoKG5hbWVPck9iaiwgbWF5YmVPYmopID0+IHtcclxuICAgIGNvbnN0IFtvYmosIG5hbWVdID0gdHlwZW9mIG5hbWVPck9iaiA9PT0gXCJzdHJpbmdcIiA/IFttYXliZU9iaiwgbmFtZU9yT2JqXSA6IFtuYW1lT3JPYmosIHZvaWQgMF07XHJcbiAgICByZXR1cm4gbmV3IFJvd0J1aWxkZXIob2JqLCBuYW1lKTtcclxuICB9KSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBBcnJheWAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnMuXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYW4gYXJyYXkgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0eXBlIG9mIHRoZSBhcnJheSwgd2hpY2ggbXVzdCBiZSBhIGBUeXBlQnVpbGRlcmAuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEFycmF5QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBhcnJheShlKSB7XHJcbiAgICByZXR1cm4gbmV3IEFycmF5QnVpbGRlcihlKTtcclxuICB9LFxyXG4gIGVudW06IGVudW1JbXBsLFxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgYSBzcGVjaWFsIGhlbHBlciBmdW5jdGlvbiBmb3IgY29udmVuaWVudGx5IGNyZWF0aW5nIGBQcm9kdWN0YCB0eXBlIGNvbHVtbnMgd2l0aCBubyBmaWVsZHMuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgUHJvZHVjdEJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggbm8gZmllbGRzLlxyXG4gICAqL1xyXG4gIHVuaXQoKSB7XHJcbiAgICByZXR1cm4gbmV3IFVuaXRCdWlsZGVyKCk7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbGF6aWx5LWV2YWx1YXRlZCB7QGxpbmsgVHlwZUJ1aWxkZXJ9LiBUaGlzIGlzIHVzZWZ1bCBmb3IgY3JlYXRpbmdcclxuICAgKiByZWN1cnNpdmUgdHlwZXMsIHN1Y2ggYXMgYSB0cmVlIG9yIGxpbmtlZCBsaXN0LlxyXG4gICAqIEBwYXJhbSB0aHVuayBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHtAbGluayBUeXBlQnVpbGRlcn0uXHJcbiAgICogQHJldHVybnMgQSBwcm94eSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IHRoYXQgZXZhbHVhdGVzIHRoZSB0aHVuayBvbiBmaXJzdCBhY2Nlc3MuXHJcbiAgICovXHJcbiAgbGF6eSh0aHVuaykge1xyXG4gICAgbGV0IGNhY2hlZCA9IG51bGw7XHJcbiAgICBjb25zdCBnZXQgPSAoKSA9PiBjYWNoZWQgPz89IHRodW5rKCk7XHJcbiAgICBjb25zdCBwcm94eSA9IG5ldyBQcm94eSh7fSwge1xyXG4gICAgICBnZXQoX3QsIHByb3AsIHJlY3YpIHtcclxuICAgICAgICBjb25zdCB0YXJnZXQgPSBnZXQoKTtcclxuICAgICAgICBjb25zdCB2YWwgPSBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3AsIHJlY3YpO1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgdmFsID09PSBcImZ1bmN0aW9uXCIgPyB2YWwuYmluZCh0YXJnZXQpIDogdmFsO1xyXG4gICAgICB9LFxyXG4gICAgICBzZXQoX3QsIHByb3AsIHZhbHVlLCByZWN2KSB7XHJcbiAgICAgICAgcmV0dXJuIFJlZmxlY3Quc2V0KGdldCgpLCBwcm9wLCB2YWx1ZSwgcmVjdik7XHJcbiAgICAgIH0sXHJcbiAgICAgIGhhcyhfdCwgcHJvcCkge1xyXG4gICAgICAgIHJldHVybiBwcm9wIGluIGdldCgpO1xyXG4gICAgICB9LFxyXG4gICAgICBvd25LZXlzKCkge1xyXG4gICAgICAgIHJldHVybiBSZWZsZWN0Lm93bktleXMoZ2V0KCkpO1xyXG4gICAgICB9LFxyXG4gICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoX3QsIHByb3ApIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihnZXQoKSwgcHJvcCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGdldFByb3RvdHlwZU9mKCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZ2V0KCkpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBwcm94eTtcclxuICB9LFxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgYSBzcGVjaWFsIGhlbHBlciBmdW5jdGlvbiBmb3IgY29udmVuaWVudGx5IGNyZWF0aW5nIHtAbGluayBTY2hlZHVsZUF0fSB0eXBlIGNvbHVtbnMuXHJcbiAgICogQHJldHVybnMgQSBuZXcgQ29sdW1uQnVpbGRlciBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgU2NoZWR1bGVBdH0gdHlwZS5cclxuICAgKi9cclxuICBzY2hlZHVsZUF0OiAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IFNjaGVkdWxlQXRCdWlsZGVyKCk7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSB7QGxpbmsgT3B0aW9ufSB0eXBlLlxyXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGVudW0gd2l0aCBhIGBzb21lYCBhbmQgYG5vbmVgIHZhcmlhbnQuXHJcbiAgICogQHBhcmFtIHZhbHVlIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZSBjb250YWluZWQgaW4gdGhlIGBzb21lYCB2YXJpYW50IG9mIHRoZSBgT3B0aW9uYC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgT3B0aW9uQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIE9wdGlvbn0gdHlwZS5cclxuICAgKi9cclxuICBvcHRpb24odmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgT3B0aW9uQnVpbGRlcih2YWx1ZSk7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSB7QGxpbmsgUmVzdWx0fSB0eXBlLlxyXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGVudW0gd2l0aCBhbiBgb2tgIGFuZCBgZXJyYCB2YXJpYW50LlxyXG4gICAqIEBwYXJhbSBvayBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgY29udGFpbmVkIGluIHRoZSBgb2tgIHZhcmlhbnQgb2YgdGhlIGBSZXN1bHRgLlxyXG4gICAqIEBwYXJhbSBlcnIgVGhlIHR5cGUgb2YgdGhlIHZhbHVlIGNvbnRhaW5lZCBpbiB0aGUgYGVycmAgdmFyaWFudCBvZiB0aGUgYFJlc3VsdGAuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFJlc3VsdEJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBSZXN1bHR9IHR5cGUuXHJcbiAgICovXHJcbiAgcmVzdWx0KG9rLCBlcnIpIHtcclxuICAgIHJldHVybiBuZXcgUmVzdWx0QnVpbGRlcihvaywgZXJyKTtcclxuICB9LFxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBJZGVudGl0eX0gdHlwZS5cclxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgb2JqZWN0YCB3aXRoIGEgc2luZ2xlIGBfX2lkZW50aXR5X19gIGVsZW1lbnQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFR5cGVCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgSWRlbnRpdHl9IHR5cGUuXHJcbiAgICovXHJcbiAgaWRlbnRpdHk6ICgpID0+IHtcclxuICAgIHJldHVybiBuZXcgSWRlbnRpdHlCdWlsZGVyKCk7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSB7QGxpbmsgQ29ubmVjdGlvbklkfSB0eXBlLlxyXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGBvYmplY3RgIHdpdGggYSBzaW5nbGUgYF9fY29ubmVjdGlvbl9pZF9fYCBlbGVtZW50LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIENvbm5lY3Rpb25JZH0gdHlwZS5cclxuICAgKi9cclxuICBjb25uZWN0aW9uSWQ6ICgpID0+IHtcclxuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQnVpbGRlcigpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFRpbWVzdGFtcH0gdHlwZS5cclxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgb2JqZWN0YCB3aXRoIGEgc2luZ2xlIGBfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fYCBlbGVtZW50LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIFRpbWVzdGFtcH0gdHlwZS5cclxuICAgKi9cclxuICB0aW1lc3RhbXA6ICgpID0+IHtcclxuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQnVpbGRlcigpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFRpbWVEdXJhdGlvbn0gdHlwZS5cclxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgb2JqZWN0YCB3aXRoIGEgc2luZ2xlIGBfX3RpbWVfZHVyYXRpb25fbWljcm9zX19gIGVsZW1lbnQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFR5cGVCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgVGltZUR1cmF0aW9ufSB0eXBlLlxyXG4gICAqL1xyXG4gIHRpbWVEdXJhdGlvbjogKCkgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBUaW1lRHVyYXRpb25CdWlsZGVyKCk7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSB7QGxpbmsgVXVpZH0gdHlwZS5cclxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgb2JqZWN0YCB3aXRoIGEgc2luZ2xlIGBfX3V1aWRfX2AgZWxlbWVudC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBVdWlkfSB0eXBlLlxyXG4gICAqL1xyXG4gIHV1aWQ6ICgpID0+IHtcclxuICAgIHJldHVybiBuZXcgVXVpZEJ1aWxkZXIoKTtcclxuICB9LFxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIGBCeXRlQXJyYXlgIHR5cGUuXHJcbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYGFycmF5YCBvZiBgdThgLlxyXG4gICAqIFRoZSBUeXBlU2NyaXB0IHJlcHJlc2VudGF0aW9uIGlzIHtAbGluayBVaW50OEFycmF5fS5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgQnl0ZUFycmF5QnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUgYEJ5dGVBcnJheWAgdHlwZS5cclxuICAgKi9cclxuICBieXRlQXJyYXk6ICgpID0+IHtcclxuICAgIHJldHVybiBuZXcgQnl0ZUFycmF5QnVpbGRlcigpO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvYXV0b2dlbi90eXBlcy50c1xyXG52YXIgQWxnZWJyYWljVHlwZTIgPSB0LmVudW0oXCJBbGdlYnJhaWNUeXBlXCIsIHtcclxuICBSZWY6IHQudTMyKCksXHJcbiAgZ2V0IFN1bSgpIHtcclxuICAgIHJldHVybiBTdW1UeXBlMjtcclxuICB9LFxyXG4gIGdldCBQcm9kdWN0KCkge1xyXG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcclxuICB9LFxyXG4gIGdldCBBcnJheSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcclxuICB9LFxyXG4gIFN0cmluZzogdC51bml0KCksXHJcbiAgQm9vbDogdC51bml0KCksXHJcbiAgSTg6IHQudW5pdCgpLFxyXG4gIFU4OiB0LnVuaXQoKSxcclxuICBJMTY6IHQudW5pdCgpLFxyXG4gIFUxNjogdC51bml0KCksXHJcbiAgSTMyOiB0LnVuaXQoKSxcclxuICBVMzI6IHQudW5pdCgpLFxyXG4gIEk2NDogdC51bml0KCksXHJcbiAgVTY0OiB0LnVuaXQoKSxcclxuICBJMTI4OiB0LnVuaXQoKSxcclxuICBVMTI4OiB0LnVuaXQoKSxcclxuICBJMjU2OiB0LnVuaXQoKSxcclxuICBVMjU2OiB0LnVuaXQoKSxcclxuICBGMzI6IHQudW5pdCgpLFxyXG4gIEY2NDogdC51bml0KClcclxufSk7XHJcbnZhciBDYXNlQ29udmVyc2lvblBvbGljeSA9IHQuZW51bShcIkNhc2VDb252ZXJzaW9uUG9saWN5XCIsIHtcclxuICBOb25lOiB0LnVuaXQoKSxcclxuICBTbmFrZUNhc2U6IHQudW5pdCgpXHJcbn0pO1xyXG52YXIgRXhwbGljaXROYW1lRW50cnkgPSB0LmVudW0oXCJFeHBsaWNpdE5hbWVFbnRyeVwiLCB7XHJcbiAgZ2V0IFRhYmxlKCkge1xyXG4gICAgcmV0dXJuIE5hbWVNYXBwaW5nO1xyXG4gIH0sXHJcbiAgZ2V0IEZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIE5hbWVNYXBwaW5nO1xyXG4gIH0sXHJcbiAgZ2V0IEluZGV4KCkge1xyXG4gICAgcmV0dXJuIE5hbWVNYXBwaW5nO1xyXG4gIH1cclxufSk7XHJcbnZhciBFeHBsaWNpdE5hbWVzID0gdC5vYmplY3QoXCJFeHBsaWNpdE5hbWVzXCIsIHtcclxuICBnZXQgZW50cmllcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KEV4cGxpY2l0TmFtZUVudHJ5KTtcclxuICB9XHJcbn0pO1xyXG52YXIgRnVuY3Rpb25WaXNpYmlsaXR5ID0gdC5lbnVtKFwiRnVuY3Rpb25WaXNpYmlsaXR5XCIsIHtcclxuICBQcml2YXRlOiB0LnVuaXQoKSxcclxuICBDbGllbnRDYWxsYWJsZTogdC51bml0KClcclxufSk7XHJcbnZhciBIdHRwSGVhZGVyUGFpciA9IHQub2JqZWN0KFwiSHR0cEhlYWRlclBhaXJcIiwge1xyXG4gIG5hbWU6IHQuc3RyaW5nKCksXHJcbiAgdmFsdWU6IHQuYnl0ZUFycmF5KClcclxufSk7XHJcbnZhciBIdHRwSGVhZGVycyA9IHQub2JqZWN0KFwiSHR0cEhlYWRlcnNcIiwge1xyXG4gIGdldCBlbnRyaWVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoSHR0cEhlYWRlclBhaXIpO1xyXG4gIH1cclxufSk7XHJcbnZhciBIdHRwTWV0aG9kID0gdC5lbnVtKFwiSHR0cE1ldGhvZFwiLCB7XHJcbiAgR2V0OiB0LnVuaXQoKSxcclxuICBIZWFkOiB0LnVuaXQoKSxcclxuICBQb3N0OiB0LnVuaXQoKSxcclxuICBQdXQ6IHQudW5pdCgpLFxyXG4gIERlbGV0ZTogdC51bml0KCksXHJcbiAgQ29ubmVjdDogdC51bml0KCksXHJcbiAgT3B0aW9uczogdC51bml0KCksXHJcbiAgVHJhY2U6IHQudW5pdCgpLFxyXG4gIFBhdGNoOiB0LnVuaXQoKSxcclxuICBFeHRlbnNpb246IHQuc3RyaW5nKClcclxufSk7XHJcbnZhciBIdHRwUmVxdWVzdCA9IHQub2JqZWN0KFwiSHR0cFJlcXVlc3RcIiwge1xyXG4gIGdldCBtZXRob2QoKSB7XHJcbiAgICByZXR1cm4gSHR0cE1ldGhvZDtcclxuICB9LFxyXG4gIGdldCBoZWFkZXJzKCkge1xyXG4gICAgcmV0dXJuIEh0dHBIZWFkZXJzO1xyXG4gIH0sXHJcbiAgdGltZW91dDogdC5vcHRpb24odC50aW1lRHVyYXRpb24oKSksXHJcbiAgdXJpOiB0LnN0cmluZygpLFxyXG4gIGdldCB2ZXJzaW9uKCkge1xyXG4gICAgcmV0dXJuIEh0dHBWZXJzaW9uO1xyXG4gIH1cclxufSk7XHJcbnZhciBIdHRwUmVzcG9uc2UgPSB0Lm9iamVjdChcIkh0dHBSZXNwb25zZVwiLCB7XHJcbiAgZ2V0IGhlYWRlcnMoKSB7XHJcbiAgICByZXR1cm4gSHR0cEhlYWRlcnM7XHJcbiAgfSxcclxuICBnZXQgdmVyc2lvbigpIHtcclxuICAgIHJldHVybiBIdHRwVmVyc2lvbjtcclxuICB9LFxyXG4gIGNvZGU6IHQudTE2KClcclxufSk7XHJcbnZhciBIdHRwVmVyc2lvbiA9IHQuZW51bShcIkh0dHBWZXJzaW9uXCIsIHtcclxuICBIdHRwMDk6IHQudW5pdCgpLFxyXG4gIEh0dHAxMDogdC51bml0KCksXHJcbiAgSHR0cDExOiB0LnVuaXQoKSxcclxuICBIdHRwMjogdC51bml0KCksXHJcbiAgSHR0cDM6IHQudW5pdCgpXHJcbn0pO1xyXG52YXIgSW5kZXhUeXBlID0gdC5lbnVtKFwiSW5kZXhUeXBlXCIsIHtcclxuICBCVHJlZTogdC51bml0KCksXHJcbiAgSGFzaDogdC51bml0KClcclxufSk7XHJcbnZhciBMaWZlY3ljbGUgPSB0LmVudW0oXCJMaWZlY3ljbGVcIiwge1xyXG4gIEluaXQ6IHQudW5pdCgpLFxyXG4gIE9uQ29ubmVjdDogdC51bml0KCksXHJcbiAgT25EaXNjb25uZWN0OiB0LnVuaXQoKVxyXG59KTtcclxudmFyIE1pc2NNb2R1bGVFeHBvcnQgPSB0LmVudW0oXCJNaXNjTW9kdWxlRXhwb3J0XCIsIHtcclxuICBnZXQgVHlwZUFsaWFzKCkge1xyXG4gICAgcmV0dXJuIFR5cGVBbGlhcztcclxuICB9XHJcbn0pO1xyXG52YXIgTmFtZU1hcHBpbmcgPSB0Lm9iamVjdChcIk5hbWVNYXBwaW5nXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxyXG4gIGNhbm9uaWNhbE5hbWU6IHQuc3RyaW5nKClcclxufSk7XHJcbnZhciBQcm9kdWN0VHlwZTIgPSB0Lm9iamVjdChcIlByb2R1Y3RUeXBlXCIsIHtcclxuICBnZXQgZWxlbWVudHMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShQcm9kdWN0VHlwZUVsZW1lbnQpO1xyXG4gIH1cclxufSk7XHJcbnZhciBQcm9kdWN0VHlwZUVsZW1lbnQgPSB0Lm9iamVjdChcIlByb2R1Y3RUeXBlRWxlbWVudFwiLCB7XHJcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd0NvbHVtbkRlZlY4ID0gdC5vYmplY3QoXCJSYXdDb2x1bW5EZWZWOFwiLCB7XHJcbiAgY29sTmFtZTogdC5zdHJpbmcoKSxcclxuICBnZXQgY29sVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjEwID0gdC5vYmplY3QoXCJSYXdDb2x1bW5EZWZhdWx0VmFsdWVWMTBcIiwge1xyXG4gIGNvbElkOiB0LnUxNigpLFxyXG4gIHZhbHVlOiB0LmJ5dGVBcnJheSgpXHJcbn0pO1xyXG52YXIgUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjkgPSB0Lm9iamVjdChcIlJhd0NvbHVtbkRlZmF1bHRWYWx1ZVY5XCIsIHtcclxuICB0YWJsZTogdC5zdHJpbmcoKSxcclxuICBjb2xJZDogdC51MTYoKSxcclxuICB2YWx1ZTogdC5ieXRlQXJyYXkoKVxyXG59KTtcclxudmFyIFJhd0NvbnN0cmFpbnREYXRhVjkgPSB0LmVudW0oXCJSYXdDb25zdHJhaW50RGF0YVY5XCIsIHtcclxuICBnZXQgVW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIFJhd1VuaXF1ZUNvbnN0cmFpbnREYXRhVjk7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd0NvbnN0cmFpbnREZWZWMTAgPSB0Lm9iamVjdChcIlJhd0NvbnN0cmFpbnREZWZWMTBcIiwge1xyXG4gIHNvdXJjZU5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGdldCBkYXRhKCkge1xyXG4gICAgcmV0dXJuIFJhd0NvbnN0cmFpbnREYXRhVjk7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd0NvbnN0cmFpbnREZWZWOCA9IHQub2JqZWN0KFwiUmF3Q29uc3RyYWludERlZlY4XCIsIHtcclxuICBjb25zdHJhaW50TmFtZTogdC5zdHJpbmcoKSxcclxuICBjb25zdHJhaW50czogdC51OCgpLFxyXG4gIGNvbHVtbnM6IHQuYXJyYXkodC51MTYoKSlcclxufSk7XHJcbnZhciBSYXdDb25zdHJhaW50RGVmVjkgPSB0Lm9iamVjdChcIlJhd0NvbnN0cmFpbnREZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgZ2V0IGRhdGEoKSB7XHJcbiAgICByZXR1cm4gUmF3Q29uc3RyYWludERhdGFWOTtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3SW5kZXhBbGdvcml0aG0gPSB0LmVudW0oXCJSYXdJbmRleEFsZ29yaXRobVwiLCB7XHJcbiAgQlRyZWU6IHQuYXJyYXkodC51MTYoKSksXHJcbiAgSGFzaDogdC5hcnJheSh0LnUxNigpKSxcclxuICBEaXJlY3Q6IHQudTE2KClcclxufSk7XHJcbnZhciBSYXdJbmRleERlZlYxMCA9IHQub2JqZWN0KFwiUmF3SW5kZXhEZWZWMTBcIiwge1xyXG4gIHNvdXJjZU5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGFjY2Vzc29yTmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgZ2V0IGFsZ29yaXRobSgpIHtcclxuICAgIHJldHVybiBSYXdJbmRleEFsZ29yaXRobTtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3SW5kZXhEZWZWOCA9IHQub2JqZWN0KFwiUmF3SW5kZXhEZWZWOFwiLCB7XHJcbiAgaW5kZXhOYW1lOiB0LnN0cmluZygpLFxyXG4gIGlzVW5pcXVlOiB0LmJvb2woKSxcclxuICBnZXQgaW5kZXhUeXBlKCkge1xyXG4gICAgcmV0dXJuIEluZGV4VHlwZTtcclxuICB9LFxyXG4gIGNvbHVtbnM6IHQuYXJyYXkodC51MTYoKSlcclxufSk7XHJcbnZhciBSYXdJbmRleERlZlY5ID0gdC5vYmplY3QoXCJSYXdJbmRleERlZlY5XCIsIHtcclxuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICBhY2Nlc3Nvck5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGdldCBhbGdvcml0aG0oKSB7XHJcbiAgICByZXR1cm4gUmF3SW5kZXhBbGdvcml0aG07XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd0xpZmVDeWNsZVJlZHVjZXJEZWZWMTAgPSB0Lm9iamVjdChcclxuICBcIlJhd0xpZmVDeWNsZVJlZHVjZXJEZWZWMTBcIixcclxuICB7XHJcbiAgICBnZXQgbGlmZWN5Y2xlU3BlYygpIHtcclxuICAgICAgcmV0dXJuIExpZmVjeWNsZTtcclxuICAgIH0sXHJcbiAgICBmdW5jdGlvbk5hbWU6IHQuc3RyaW5nKClcclxuICB9XHJcbik7XHJcbnZhciBSYXdNaXNjTW9kdWxlRXhwb3J0VjkgPSB0LmVudW0oXCJSYXdNaXNjTW9kdWxlRXhwb3J0VjlcIiwge1xyXG4gIGdldCBDb2x1bW5EZWZhdWx0VmFsdWUoKSB7XHJcbiAgICByZXR1cm4gUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjk7XHJcbiAgfSxcclxuICBnZXQgUHJvY2VkdXJlKCkge1xyXG4gICAgcmV0dXJuIFJhd1Byb2NlZHVyZURlZlY5O1xyXG4gIH0sXHJcbiAgZ2V0IFZpZXcoKSB7XHJcbiAgICByZXR1cm4gUmF3Vmlld0RlZlY5O1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdNb2R1bGVEZWYgPSB0LmVudW0oXCJSYXdNb2R1bGVEZWZcIiwge1xyXG4gIGdldCBWOEJhY2tDb21wYXQoKSB7XHJcbiAgICByZXR1cm4gUmF3TW9kdWxlRGVmVjg7XHJcbiAgfSxcclxuICBnZXQgVjkoKSB7XHJcbiAgICByZXR1cm4gUmF3TW9kdWxlRGVmVjk7XHJcbiAgfSxcclxuICBnZXQgVjEwKCkge1xyXG4gICAgcmV0dXJuIFJhd01vZHVsZURlZlYxMDtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3TW9kdWxlRGVmVjEwID0gdC5vYmplY3QoXCJSYXdNb2R1bGVEZWZWMTBcIiwge1xyXG4gIGdldCBzZWN0aW9ucygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd01vZHVsZURlZlYxMFNlY3Rpb24pO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdNb2R1bGVEZWZWMTBTZWN0aW9uID0gdC5lbnVtKFwiUmF3TW9kdWxlRGVmVjEwU2VjdGlvblwiLCB7XHJcbiAgZ2V0IFR5cGVzcGFjZSgpIHtcclxuICAgIHJldHVybiBUeXBlc3BhY2U7XHJcbiAgfSxcclxuICBnZXQgVHlwZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdUeXBlRGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCBUYWJsZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdUYWJsZURlZlYxMCk7XHJcbiAgfSxcclxuICBnZXQgUmVkdWNlcnMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdSZWR1Y2VyRGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCBQcm9jZWR1cmVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3UHJvY2VkdXJlRGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCBWaWV3cygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1ZpZXdEZWZWMTApO1xyXG4gIH0sXHJcbiAgZ2V0IFNjaGVkdWxlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1NjaGVkdWxlRGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCBMaWZlQ3ljbGVSZWR1Y2VycygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd0xpZmVDeWNsZVJlZHVjZXJEZWZWMTApO1xyXG4gIH0sXHJcbiAgZ2V0IFJvd0xldmVsU2VjdXJpdHkoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdSb3dMZXZlbFNlY3VyaXR5RGVmVjkpO1xyXG4gIH0sXHJcbiAgZ2V0IENhc2VDb252ZXJzaW9uUG9saWN5KCkge1xyXG4gICAgcmV0dXJuIENhc2VDb252ZXJzaW9uUG9saWN5O1xyXG4gIH0sXHJcbiAgZ2V0IEV4cGxpY2l0TmFtZXMoKSB7XHJcbiAgICByZXR1cm4gRXhwbGljaXROYW1lcztcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3TW9kdWxlRGVmVjggPSB0Lm9iamVjdChcIlJhd01vZHVsZURlZlY4XCIsIHtcclxuICBnZXQgdHlwZXNwYWNlKCkge1xyXG4gICAgcmV0dXJuIFR5cGVzcGFjZTtcclxuICB9LFxyXG4gIGdldCB0YWJsZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShUYWJsZURlc2MpO1xyXG4gIH0sXHJcbiAgZ2V0IHJlZHVjZXJzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmVkdWNlckRlZik7XHJcbiAgfSxcclxuICBnZXQgbWlzY0V4cG9ydHMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShNaXNjTW9kdWxlRXhwb3J0KTtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3TW9kdWxlRGVmVjkgPSB0Lm9iamVjdChcIlJhd01vZHVsZURlZlY5XCIsIHtcclxuICBnZXQgdHlwZXNwYWNlKCkge1xyXG4gICAgcmV0dXJuIFR5cGVzcGFjZTtcclxuICB9LFxyXG4gIGdldCB0YWJsZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdUYWJsZURlZlY5KTtcclxuICB9LFxyXG4gIGdldCByZWR1Y2VycygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1JlZHVjZXJEZWZWOSk7XHJcbiAgfSxcclxuICBnZXQgdHlwZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdUeXBlRGVmVjkpO1xyXG4gIH0sXHJcbiAgZ2V0IG1pc2NFeHBvcnRzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3TWlzY01vZHVsZUV4cG9ydFY5KTtcclxuICB9LFxyXG4gIGdldCByb3dMZXZlbFNlY3VyaXR5KCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Um93TGV2ZWxTZWN1cml0eURlZlY5KTtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3UHJvY2VkdXJlRGVmVjEwID0gdC5vYmplY3QoXCJSYXdQcm9jZWR1cmVEZWZWMTBcIiwge1xyXG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgZ2V0IHBhcmFtcygpIHtcclxuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XHJcbiAgfSxcclxuICBnZXQgcmV0dXJuVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcclxuICB9LFxyXG4gIGdldCB2aXNpYmlsaXR5KCkge1xyXG4gICAgcmV0dXJuIEZ1bmN0aW9uVmlzaWJpbGl0eTtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3UHJvY2VkdXJlRGVmVjkgPSB0Lm9iamVjdChcIlJhd1Byb2NlZHVyZURlZlY5XCIsIHtcclxuICBuYW1lOiB0LnN0cmluZygpLFxyXG4gIGdldCBwYXJhbXMoKSB7XHJcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xyXG4gIH0sXHJcbiAgZ2V0IHJldHVyblR5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd1JlZHVjZXJEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1JlZHVjZXJEZWZWMTBcIiwge1xyXG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgZ2V0IHBhcmFtcygpIHtcclxuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XHJcbiAgfSxcclxuICBnZXQgdmlzaWJpbGl0eSgpIHtcclxuICAgIHJldHVybiBGdW5jdGlvblZpc2liaWxpdHk7XHJcbiAgfSxcclxuICBnZXQgb2tSZXR1cm5UeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xyXG4gIH0sXHJcbiAgZ2V0IGVyclJldHVyblR5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd1JlZHVjZXJEZWZWOSA9IHQub2JqZWN0KFwiUmF3UmVkdWNlckRlZlY5XCIsIHtcclxuICBuYW1lOiB0LnN0cmluZygpLFxyXG4gIGdldCBwYXJhbXMoKSB7XHJcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xyXG4gIH0sXHJcbiAgZ2V0IGxpZmVjeWNsZSgpIHtcclxuICAgIHJldHVybiB0Lm9wdGlvbihMaWZlY3ljbGUpO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdSb3dMZXZlbFNlY3VyaXR5RGVmVjkgPSB0Lm9iamVjdChcIlJhd1Jvd0xldmVsU2VjdXJpdHlEZWZWOVwiLCB7XHJcbiAgc3FsOiB0LnN0cmluZygpXHJcbn0pO1xyXG52YXIgUmF3U2NoZWR1bGVEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1NjaGVkdWxlRGVmVjEwXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICB0YWJsZU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgc2NoZWR1bGVBdENvbDogdC51MTYoKSxcclxuICBmdW5jdGlvbk5hbWU6IHQuc3RyaW5nKClcclxufSk7XHJcbnZhciBSYXdTY2hlZHVsZURlZlY5ID0gdC5vYmplY3QoXCJSYXdTY2hlZHVsZURlZlY5XCIsIHtcclxuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICByZWR1Y2VyTmFtZTogdC5zdHJpbmcoKSxcclxuICBzY2hlZHVsZWRBdENvbHVtbjogdC51MTYoKVxyXG59KTtcclxudmFyIFJhd1Njb3BlZFR5cGVOYW1lVjEwID0gdC5vYmplY3QoXCJSYXdTY29wZWRUeXBlTmFtZVYxMFwiLCB7XHJcbiAgc2NvcGU6IHQuYXJyYXkodC5zdHJpbmcoKSksXHJcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKVxyXG59KTtcclxudmFyIFJhd1Njb3BlZFR5cGVOYW1lVjkgPSB0Lm9iamVjdChcIlJhd1Njb3BlZFR5cGVOYW1lVjlcIiwge1xyXG4gIHNjb3BlOiB0LmFycmF5KHQuc3RyaW5nKCkpLFxyXG4gIG5hbWU6IHQuc3RyaW5nKClcclxufSk7XHJcbnZhciBSYXdTZXF1ZW5jZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3U2VxdWVuY2VEZWZWMTBcIiwge1xyXG4gIHNvdXJjZU5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGNvbHVtbjogdC51MTYoKSxcclxuICBzdGFydDogdC5vcHRpb24odC5pMTI4KCkpLFxyXG4gIG1pblZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXHJcbiAgbWF4VmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcclxuICBpbmNyZW1lbnQ6IHQuaTEyOCgpXHJcbn0pO1xyXG52YXIgUmF3U2VxdWVuY2VEZWZWOCA9IHQub2JqZWN0KFwiUmF3U2VxdWVuY2VEZWZWOFwiLCB7XHJcbiAgc2VxdWVuY2VOYW1lOiB0LnN0cmluZygpLFxyXG4gIGNvbFBvczogdC51MTYoKSxcclxuICBpbmNyZW1lbnQ6IHQuaTEyOCgpLFxyXG4gIHN0YXJ0OiB0Lm9wdGlvbih0LmkxMjgoKSksXHJcbiAgbWluVmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcclxuICBtYXhWYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxyXG4gIGFsbG9jYXRlZDogdC5pMTI4KClcclxufSk7XHJcbnZhciBSYXdTZXF1ZW5jZURlZlY5ID0gdC5vYmplY3QoXCJSYXdTZXF1ZW5jZURlZlY5XCIsIHtcclxuICBuYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICBjb2x1bW46IHQudTE2KCksXHJcbiAgc3RhcnQ6IHQub3B0aW9uKHQuaTEyOCgpKSxcclxuICBtaW5WYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxyXG4gIG1heFZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXHJcbiAgaW5jcmVtZW50OiB0LmkxMjgoKVxyXG59KTtcclxudmFyIFJhd1RhYmxlRGVmVjEwID0gdC5vYmplY3QoXCJSYXdUYWJsZURlZlYxMFwiLCB7XHJcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcclxuICBwcm9kdWN0VHlwZVJlZjogdC51MzIoKSxcclxuICBwcmltYXJ5S2V5OiB0LmFycmF5KHQudTE2KCkpLFxyXG4gIGdldCBpbmRleGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3SW5kZXhEZWZWMTApO1xyXG4gIH0sXHJcbiAgZ2V0IGNvbnN0cmFpbnRzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Q29uc3RyYWludERlZlYxMCk7XHJcbiAgfSxcclxuICBnZXQgc2VxdWVuY2VzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3U2VxdWVuY2VEZWZWMTApO1xyXG4gIH0sXHJcbiAgZ2V0IHRhYmxlVHlwZSgpIHtcclxuICAgIHJldHVybiBUYWJsZVR5cGU7XHJcbiAgfSxcclxuICBnZXQgdGFibGVBY2Nlc3MoKSB7XHJcbiAgICByZXR1cm4gVGFibGVBY2Nlc3M7XHJcbiAgfSxcclxuICBnZXQgZGVmYXVsdFZhbHVlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVYxMCk7XHJcbiAgfSxcclxuICBpc0V2ZW50OiB0LmJvb2woKVxyXG59KTtcclxudmFyIFJhd1RhYmxlRGVmVjggPSB0Lm9iamVjdChcIlJhd1RhYmxlRGVmVjhcIiwge1xyXG4gIHRhYmxlTmFtZTogdC5zdHJpbmcoKSxcclxuICBnZXQgY29sdW1ucygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbHVtbkRlZlY4KTtcclxuICB9LFxyXG4gIGdldCBpbmRleGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3SW5kZXhEZWZWOCk7XHJcbiAgfSxcclxuICBnZXQgY29uc3RyYWludHMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb25zdHJhaW50RGVmVjgpO1xyXG4gIH0sXHJcbiAgZ2V0IHNlcXVlbmNlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1NlcXVlbmNlRGVmVjgpO1xyXG4gIH0sXHJcbiAgdGFibGVUeXBlOiB0LnN0cmluZygpLFxyXG4gIHRhYmxlQWNjZXNzOiB0LnN0cmluZygpLFxyXG4gIHNjaGVkdWxlZDogdC5vcHRpb24odC5zdHJpbmcoKSlcclxufSk7XHJcbnZhciBSYXdUYWJsZURlZlY5ID0gdC5vYmplY3QoXCJSYXdUYWJsZURlZlY5XCIsIHtcclxuICBuYW1lOiB0LnN0cmluZygpLFxyXG4gIHByb2R1Y3RUeXBlUmVmOiB0LnUzMigpLFxyXG4gIHByaW1hcnlLZXk6IHQuYXJyYXkodC51MTYoKSksXHJcbiAgZ2V0IGluZGV4ZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdJbmRleERlZlY5KTtcclxuICB9LFxyXG4gIGdldCBjb25zdHJhaW50cygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbnN0cmFpbnREZWZWOSk7XHJcbiAgfSxcclxuICBnZXQgc2VxdWVuY2VzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3U2VxdWVuY2VEZWZWOSk7XHJcbiAgfSxcclxuICBnZXQgc2NoZWR1bGUoKSB7XHJcbiAgICByZXR1cm4gdC5vcHRpb24oUmF3U2NoZWR1bGVEZWZWOSk7XHJcbiAgfSxcclxuICBnZXQgdGFibGVUeXBlKCkge1xyXG4gICAgcmV0dXJuIFRhYmxlVHlwZTtcclxuICB9LFxyXG4gIGdldCB0YWJsZUFjY2VzcygpIHtcclxuICAgIHJldHVybiBUYWJsZUFjY2VzcztcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3VHlwZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3VHlwZURlZlYxMFwiLCB7XHJcbiAgZ2V0IHNvdXJjZU5hbWUoKSB7XHJcbiAgICByZXR1cm4gUmF3U2NvcGVkVHlwZU5hbWVWMTA7XHJcbiAgfSxcclxuICB0eTogdC51MzIoKSxcclxuICBjdXN0b21PcmRlcmluZzogdC5ib29sKClcclxufSk7XHJcbnZhciBSYXdUeXBlRGVmVjkgPSB0Lm9iamVjdChcIlJhd1R5cGVEZWZWOVwiLCB7XHJcbiAgZ2V0IG5hbWUoKSB7XHJcbiAgICByZXR1cm4gUmF3U2NvcGVkVHlwZU5hbWVWOTtcclxuICB9LFxyXG4gIHR5OiB0LnUzMigpLFxyXG4gIGN1c3RvbU9yZGVyaW5nOiB0LmJvb2woKVxyXG59KTtcclxudmFyIFJhd1VuaXF1ZUNvbnN0cmFpbnREYXRhVjkgPSB0Lm9iamVjdChcclxuICBcIlJhd1VuaXF1ZUNvbnN0cmFpbnREYXRhVjlcIixcclxuICB7XHJcbiAgICBjb2x1bW5zOiB0LmFycmF5KHQudTE2KCkpXHJcbiAgfVxyXG4pO1xyXG52YXIgUmF3Vmlld0RlZlYxMCA9IHQub2JqZWN0KFwiUmF3Vmlld0RlZlYxMFwiLCB7XHJcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcclxuICBpbmRleDogdC51MzIoKSxcclxuICBpc1B1YmxpYzogdC5ib29sKCksXHJcbiAgaXNBbm9ueW1vdXM6IHQuYm9vbCgpLFxyXG4gIGdldCBwYXJhbXMoKSB7XHJcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xyXG4gIH0sXHJcbiAgZ2V0IHJldHVyblR5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd1ZpZXdEZWZWOSA9IHQub2JqZWN0KFwiUmF3Vmlld0RlZlY5XCIsIHtcclxuICBuYW1lOiB0LnN0cmluZygpLFxyXG4gIGluZGV4OiB0LnUzMigpLFxyXG4gIGlzUHVibGljOiB0LmJvb2woKSxcclxuICBpc0Fub255bW91czogdC5ib29sKCksXHJcbiAgZ2V0IHBhcmFtcygpIHtcclxuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XHJcbiAgfSxcclxuICBnZXQgcmV0dXJuVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcclxuICB9XHJcbn0pO1xyXG52YXIgUmVkdWNlckRlZiA9IHQub2JqZWN0KFwiUmVkdWNlckRlZlwiLCB7XHJcbiAgbmFtZTogdC5zdHJpbmcoKSxcclxuICBnZXQgYXJncygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFByb2R1Y3RUeXBlRWxlbWVudCk7XHJcbiAgfVxyXG59KTtcclxudmFyIFN1bVR5cGUyID0gdC5vYmplY3QoXCJTdW1UeXBlXCIsIHtcclxuICBnZXQgdmFyaWFudHMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShTdW1UeXBlVmFyaWFudCk7XHJcbiAgfVxyXG59KTtcclxudmFyIFN1bVR5cGVWYXJpYW50ID0gdC5vYmplY3QoXCJTdW1UeXBlVmFyaWFudFwiLCB7XHJcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfVxyXG59KTtcclxudmFyIFRhYmxlQWNjZXNzID0gdC5lbnVtKFwiVGFibGVBY2Nlc3NcIiwge1xyXG4gIFB1YmxpYzogdC51bml0KCksXHJcbiAgUHJpdmF0ZTogdC51bml0KClcclxufSk7XHJcbnZhciBUYWJsZURlc2MgPSB0Lm9iamVjdChcIlRhYmxlRGVzY1wiLCB7XHJcbiAgZ2V0IHNjaGVtYSgpIHtcclxuICAgIHJldHVybiBSYXdUYWJsZURlZlY4O1xyXG4gIH0sXHJcbiAgZGF0YTogdC51MzIoKVxyXG59KTtcclxudmFyIFRhYmxlVHlwZSA9IHQuZW51bShcIlRhYmxlVHlwZVwiLCB7XHJcbiAgU3lzdGVtOiB0LnVuaXQoKSxcclxuICBVc2VyOiB0LnVuaXQoKVxyXG59KTtcclxudmFyIFR5cGVBbGlhcyA9IHQub2JqZWN0KFwiVHlwZUFsaWFzXCIsIHtcclxuICBuYW1lOiB0LnN0cmluZygpLFxyXG4gIHR5OiB0LnUzMigpXHJcbn0pO1xyXG52YXIgVHlwZXNwYWNlID0gdC5vYmplY3QoXCJUeXBlc3BhY2VcIiwge1xyXG4gIGdldCB0eXBlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KEFsZ2VicmFpY1R5cGUyKTtcclxuICB9XHJcbn0pO1xyXG52YXIgVmlld1Jlc3VsdEhlYWRlciA9IHQuZW51bShcIlZpZXdSZXN1bHRIZWFkZXJcIiwge1xyXG4gIFJvd0RhdGE6IHQudW5pdCgpLFxyXG4gIFJhd1NxbDogdC5zdHJpbmcoKVxyXG59KTtcclxuXHJcbi8vIHNyYy9saWIvc2NoZW1hLnRzXHJcbmZ1bmN0aW9uIHRhYmxlVG9TY2hlbWEoYWNjTmFtZSwgc2NoZW1hMiwgdGFibGVEZWYpIHtcclxuICBjb25zdCBnZXRDb2xOYW1lID0gKGkpID0+IHNjaGVtYTIucm93VHlwZS5hbGdlYnJhaWNUeXBlLnZhbHVlLmVsZW1lbnRzW2ldLm5hbWU7XHJcbiAgcmV0dXJuIHtcclxuICAgIC8vIEZvciBjbGllbnQsYHNjaGFtYS50YWJsZU5hbWVgIHdpbGwgYWx3YXlzIGJlIHRoZXJlIGFzIGNhbm9uaWNhbCBuYW1lLlxyXG4gICAgLy8gRm9yIG1vZHVsZSwgaWYgZXhwbGljaXQgbmFtZSBpcyBub3QgcHJvdmlkZWQgdmlhIGBuYW1lYCwgYWNjZXNzb3IgbmFtZSB3aWxsXHJcbiAgICAvLyBiZSB1c2VkLCBpdCBpcyBzdG9yZWQgYXMgYWxpYXMgaW4gZGF0YWJhc2UsIGhlbmNlIHdvcmtzIGluIHF1ZXJ5IGJ1aWxkZXIuXHJcbiAgICBzb3VyY2VOYW1lOiBzY2hlbWEyLnRhYmxlTmFtZSB8fCBhY2NOYW1lLFxyXG4gICAgYWNjZXNzb3JOYW1lOiBhY2NOYW1lLFxyXG4gICAgY29sdW1uczogc2NoZW1hMi5yb3dUeXBlLnJvdyxcclxuICAgIC8vIHR5cGVkIGFzIFRbaV1bJ3Jvd1R5cGUnXVsncm93J10gdW5kZXIgVGFibGVzVG9TY2hlbWE8VD5cclxuICAgIHJvd1R5cGU6IHNjaGVtYTIucm93U3BhY2V0aW1lVHlwZSxcclxuICAgIGNvbnN0cmFpbnRzOiB0YWJsZURlZi5jb25zdHJhaW50cy5tYXAoKGMpID0+ICh7XHJcbiAgICAgIG5hbWU6IGMuc291cmNlTmFtZSxcclxuICAgICAgY29uc3RyYWludDogXCJ1bmlxdWVcIixcclxuICAgICAgY29sdW1uczogYy5kYXRhLnZhbHVlLmNvbHVtbnMubWFwKGdldENvbE5hbWUpXHJcbiAgICB9KSksXHJcbiAgICAvLyBUT0RPOiBob3JyaWJsZSBob3JyaWJsZSBob3JyaWJsZS4gd2Ugc211Z2dsZSB0aGlzIGBBcnJheTxVbnR5cGVkSW5kZXg+YFxyXG4gICAgLy8gYnkgY2FzdGluZyBpdCB0byBhbiBgQXJyYXk8SW5kZXhPcHRzPmAgYXMgYFRhYmxlVG9TY2hlbWFgIGV4cGVjdHMuXHJcbiAgICAvLyBUaGlzIGlzIHRoZW4gdXNlZCBpbiBgVGFibGVDYWNoZUltcGwuY29uc3RydWN0b3JgIGFuZCB3aG8ga25vd3Mgd2hlcmUgZWxzZS5cclxuICAgIC8vIFdlIHNob3VsZCBzdG9wIGx5aW5nIGFib3V0IG91ciB0eXBlcy5cclxuICAgIGluZGV4ZXM6IHRhYmxlRGVmLmluZGV4ZXMubWFwKChpZHgpID0+IHtcclxuICAgICAgY29uc3QgY29sdW1uSWRzID0gaWR4LmFsZ29yaXRobS50YWcgPT09IFwiRGlyZWN0XCIgPyBbaWR4LmFsZ29yaXRobS52YWx1ZV0gOiBpZHguYWxnb3JpdGhtLnZhbHVlO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIG5hbWU6IGlkeC5hY2Nlc3Nvck5hbWUsXHJcbiAgICAgICAgdW5pcXVlOiB0YWJsZURlZi5jb25zdHJhaW50cy5zb21lKFxyXG4gICAgICAgICAgKGMpID0+IGMuZGF0YS52YWx1ZS5jb2x1bW5zLmV2ZXJ5KChjb2wpID0+IGNvbHVtbklkcy5pbmNsdWRlcyhjb2wpKVxyXG4gICAgICAgICksXHJcbiAgICAgICAgYWxnb3JpdGhtOiBpZHguYWxnb3JpdGhtLnRhZy50b0xvd2VyQ2FzZSgpLFxyXG4gICAgICAgIGNvbHVtbnM6IGNvbHVtbklkcy5tYXAoZ2V0Q29sTmFtZSlcclxuICAgICAgfTtcclxuICAgIH0pLFxyXG4gICAgdGFibGVEZWYsXHJcbiAgICAuLi50YWJsZURlZi5pc0V2ZW50ID8geyBpc0V2ZW50OiB0cnVlIH0gOiB7fVxyXG4gIH07XHJcbn1cclxudmFyIE1vZHVsZUNvbnRleHQgPSBjbGFzcyB7XHJcbiAgI2NvbXBvdW5kVHlwZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xyXG4gIC8qKlxyXG4gICAqIFRoZSBnbG9iYWwgbW9kdWxlIGRlZmluaXRpb24gdGhhdCBnZXRzIHBvcHVsYXRlZCBieSBjYWxscyB0byBgcmVkdWNlcigpYCBhbmQgbGlmZWN5Y2xlIGhvb2tzLlxyXG4gICAqL1xyXG4gICNtb2R1bGVEZWYgPSB7XHJcbiAgICB0eXBlc3BhY2U6IHsgdHlwZXM6IFtdIH0sXHJcbiAgICB0YWJsZXM6IFtdLFxyXG4gICAgcmVkdWNlcnM6IFtdLFxyXG4gICAgdHlwZXM6IFtdLFxyXG4gICAgcm93TGV2ZWxTZWN1cml0eTogW10sXHJcbiAgICBzY2hlZHVsZXM6IFtdLFxyXG4gICAgcHJvY2VkdXJlczogW10sXHJcbiAgICB2aWV3czogW10sXHJcbiAgICBsaWZlQ3ljbGVSZWR1Y2VyczogW10sXHJcbiAgICBjYXNlQ29udmVyc2lvblBvbGljeTogeyB0YWc6IFwiU25ha2VDYXNlXCIgfSxcclxuICAgIGV4cGxpY2l0TmFtZXM6IHtcclxuICAgICAgZW50cmllczogW11cclxuICAgIH1cclxuICB9O1xyXG4gIGdldCBtb2R1bGVEZWYoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jbW9kdWxlRGVmO1xyXG4gIH1cclxuICByYXdNb2R1bGVEZWZWMTAoKSB7XHJcbiAgICBjb25zdCBzZWN0aW9ucyA9IFtdO1xyXG4gICAgY29uc3QgcHVzaCA9IChzKSA9PiB7XHJcbiAgICAgIGlmIChzKSBzZWN0aW9ucy5wdXNoKHMpO1xyXG4gICAgfTtcclxuICAgIGNvbnN0IG1vZHVsZSA9IHRoaXMuI21vZHVsZURlZjtcclxuICAgIHB1c2gobW9kdWxlLnR5cGVzcGFjZSAmJiB7IHRhZzogXCJUeXBlc3BhY2VcIiwgdmFsdWU6IG1vZHVsZS50eXBlc3BhY2UgfSk7XHJcbiAgICBwdXNoKG1vZHVsZS50eXBlcyAmJiB7IHRhZzogXCJUeXBlc1wiLCB2YWx1ZTogbW9kdWxlLnR5cGVzIH0pO1xyXG4gICAgcHVzaChtb2R1bGUudGFibGVzICYmIHsgdGFnOiBcIlRhYmxlc1wiLCB2YWx1ZTogbW9kdWxlLnRhYmxlcyB9KTtcclxuICAgIHB1c2gobW9kdWxlLnJlZHVjZXJzICYmIHsgdGFnOiBcIlJlZHVjZXJzXCIsIHZhbHVlOiBtb2R1bGUucmVkdWNlcnMgfSk7XHJcbiAgICBwdXNoKG1vZHVsZS5wcm9jZWR1cmVzICYmIHsgdGFnOiBcIlByb2NlZHVyZXNcIiwgdmFsdWU6IG1vZHVsZS5wcm9jZWR1cmVzIH0pO1xyXG4gICAgcHVzaChtb2R1bGUudmlld3MgJiYgeyB0YWc6IFwiVmlld3NcIiwgdmFsdWU6IG1vZHVsZS52aWV3cyB9KTtcclxuICAgIHB1c2gobW9kdWxlLnNjaGVkdWxlcyAmJiB7IHRhZzogXCJTY2hlZHVsZXNcIiwgdmFsdWU6IG1vZHVsZS5zY2hlZHVsZXMgfSk7XHJcbiAgICBwdXNoKFxyXG4gICAgICBtb2R1bGUubGlmZUN5Y2xlUmVkdWNlcnMgJiYge1xyXG4gICAgICAgIHRhZzogXCJMaWZlQ3ljbGVSZWR1Y2Vyc1wiLFxyXG4gICAgICAgIHZhbHVlOiBtb2R1bGUubGlmZUN5Y2xlUmVkdWNlcnNcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHB1c2goXHJcbiAgICAgIG1vZHVsZS5yb3dMZXZlbFNlY3VyaXR5ICYmIHtcclxuICAgICAgICB0YWc6IFwiUm93TGV2ZWxTZWN1cml0eVwiLFxyXG4gICAgICAgIHZhbHVlOiBtb2R1bGUucm93TGV2ZWxTZWN1cml0eVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgcHVzaChcclxuICAgICAgbW9kdWxlLmV4cGxpY2l0TmFtZXMgJiYge1xyXG4gICAgICAgIHRhZzogXCJFeHBsaWNpdE5hbWVzXCIsXHJcbiAgICAgICAgdmFsdWU6IG1vZHVsZS5leHBsaWNpdE5hbWVzXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICBwdXNoKFxyXG4gICAgICBtb2R1bGUuY2FzZUNvbnZlcnNpb25Qb2xpY3kgJiYge1xyXG4gICAgICAgIHRhZzogXCJDYXNlQ29udmVyc2lvblBvbGljeVwiLFxyXG4gICAgICAgIHZhbHVlOiBtb2R1bGUuY2FzZUNvbnZlcnNpb25Qb2xpY3lcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHJldHVybiB7IHNlY3Rpb25zIH07XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgY2FzZSBjb252ZXJzaW9uIHBvbGljeSBmb3IgdGhpcyBtb2R1bGUuXHJcbiAgICogQ2FsbGVkIGJ5IHRoZSBzZXR0aW5ncyBtZWNoYW5pc20uXHJcbiAgICovXHJcbiAgc2V0Q2FzZUNvbnZlcnNpb25Qb2xpY3kocG9saWN5KSB7XHJcbiAgICB0aGlzLiNtb2R1bGVEZWYuY2FzZUNvbnZlcnNpb25Qb2xpY3kgPSBwb2xpY3k7XHJcbiAgfVxyXG4gIGdldCB0eXBlc3BhY2UoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jbW9kdWxlRGVmLnR5cGVzcGFjZTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUmVzb2x2ZXMgdGhlIGFjdHVhbCB0eXBlIG9mIGEgVHlwZUJ1aWxkZXIgYnkgZm9sbG93aW5nIGl0cyByZWZlcmVuY2VzIHVudGlsIGl0IHJlYWNoZXMgYSBub24tcmVmIHR5cGUuXHJcbiAgICogQHBhcmFtIHR5cGVzcGFjZSBUaGUgdHlwZXNwYWNlIHRvIHJlc29sdmUgdHlwZXMgYWdhaW5zdC5cclxuICAgKiBAcGFyYW0gdHlwZUJ1aWxkZXIgVGhlIFR5cGVCdWlsZGVyIHRvIHJlc29sdmUuXHJcbiAgICogQHJldHVybnMgVGhlIHJlc29sdmVkIGFsZ2VicmFpYyB0eXBlLlxyXG4gICAqL1xyXG4gIHJlc29sdmVUeXBlKHR5cGVCdWlsZGVyKSB7XHJcbiAgICBsZXQgdHkgPSB0eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlO1xyXG4gICAgd2hpbGUgKHR5LnRhZyA9PT0gXCJSZWZcIikge1xyXG4gICAgICB0eSA9IHRoaXMudHlwZXNwYWNlLnR5cGVzW3R5LnZhbHVlXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0eTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogQWRkcyBhIHR5cGUgdG8gdGhlIG1vZHVsZSBkZWZpbml0aW9uJ3MgdHlwZXNwYWNlIGFzIGEgYFJlZmAgaWYgaXQgaXMgYSBuYW1lZCBjb21wb3VuZCB0eXBlIChQcm9kdWN0IG9yIFN1bSkuXHJcbiAgICogT3RoZXJ3aXNlLCByZXR1cm5zIHRoZSB0eXBlIGFzIGlzLlxyXG4gICAqIEBwYXJhbSBuYW1lXHJcbiAgICogQHBhcmFtIHR5XHJcbiAgICogQHJldHVybnNcclxuICAgKi9cclxuICByZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIpIHtcclxuICAgIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFByb2R1Y3RCdWlsZGVyICYmICFpc1VuaXQodHlwZUJ1aWxkZXIpIHx8IHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgU3VtQnVpbGRlciB8fCB0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFJvd0J1aWxkZXIpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuI3JlZ2lzdGVyQ29tcG91bmRUeXBlUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIpO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIE9wdGlvbkJ1aWxkZXIpIHtcclxuICAgICAgcmV0dXJuIG5ldyBPcHRpb25CdWlsZGVyKFxyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyLnZhbHVlKVxyXG4gICAgICApO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFJlc3VsdEJ1aWxkZXIpIHtcclxuICAgICAgcmV0dXJuIG5ldyBSZXN1bHRCdWlsZGVyKFxyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyLm9rKSxcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlci5lcnIpXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgQXJyYXlCdWlsZGVyKSB7XHJcbiAgICAgIHJldHVybiBuZXcgQXJyYXlCdWlsZGVyKFxyXG4gICAgICAgIHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyLmVsZW1lbnQpXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdHlwZUJ1aWxkZXI7XHJcbiAgICB9XHJcbiAgfVxyXG4gICNyZWdpc3RlckNvbXBvdW5kVHlwZVJlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyKSB7XHJcbiAgICBjb25zdCB0eSA9IHR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGU7XHJcbiAgICBjb25zdCBuYW1lID0gdHlwZUJ1aWxkZXIudHlwZU5hbWU7XHJcbiAgICBpZiAobmFtZSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICBgTWlzc2luZyB0eXBlIG5hbWUgZm9yICR7dHlwZUJ1aWxkZXIuY29uc3RydWN0b3IubmFtZSA/PyBcIlR5cGVCdWlsZGVyXCJ9ICR7SlNPTi5zdHJpbmdpZnkodHlwZUJ1aWxkZXIpfWBcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGxldCByID0gdGhpcy4jY29tcG91bmRUeXBlcy5nZXQodHkpO1xyXG4gICAgaWYgKHIgIT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gcjtcclxuICAgIH1cclxuICAgIGNvbnN0IG5ld1R5ID0gdHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSb3dCdWlsZGVyIHx8IHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUHJvZHVjdEJ1aWxkZXIgPyB7XHJcbiAgICAgIHRhZzogXCJQcm9kdWN0XCIsXHJcbiAgICAgIHZhbHVlOiB7IGVsZW1lbnRzOiBbXSB9XHJcbiAgICB9IDoge1xyXG4gICAgICB0YWc6IFwiU3VtXCIsXHJcbiAgICAgIHZhbHVlOiB7IHZhcmlhbnRzOiBbXSB9XHJcbiAgICB9O1xyXG4gICAgciA9IG5ldyBSZWZCdWlsZGVyKHRoaXMuI21vZHVsZURlZi50eXBlc3BhY2UudHlwZXMubGVuZ3RoKTtcclxuICAgIHRoaXMuI21vZHVsZURlZi50eXBlc3BhY2UudHlwZXMucHVzaChuZXdUeSk7XHJcbiAgICB0aGlzLiNjb21wb3VuZFR5cGVzLnNldCh0eSwgcik7XHJcbiAgICBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSB7XHJcbiAgICAgIGZvciAoY29uc3QgW25hbWUyLCBlbGVtXSBvZiBPYmplY3QuZW50cmllcyh0eXBlQnVpbGRlci5yb3cpKSB7XHJcbiAgICAgICAgbmV3VHkudmFsdWUuZWxlbWVudHMucHVzaCh7XHJcbiAgICAgICAgICBuYW1lOiBuYW1lMixcclxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KGVsZW0udHlwZUJ1aWxkZXIpLmFsZ2VicmFpY1R5cGVcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFByb2R1Y3RCdWlsZGVyKSB7XHJcbiAgICAgIGZvciAoY29uc3QgW25hbWUyLCBlbGVtXSBvZiBPYmplY3QuZW50cmllcyh0eXBlQnVpbGRlci5lbGVtZW50cykpIHtcclxuICAgICAgICBuZXdUeS52YWx1ZS5lbGVtZW50cy5wdXNoKHtcclxuICAgICAgICAgIG5hbWU6IG5hbWUyLFxyXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkoZWxlbSkuYWxnZWJyYWljVHlwZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgU3VtQnVpbGRlcikge1xyXG4gICAgICBmb3IgKGNvbnN0IFtuYW1lMiwgdmFyaWFudF0gb2YgT2JqZWN0LmVudHJpZXModHlwZUJ1aWxkZXIudmFyaWFudHMpKSB7XHJcbiAgICAgICAgbmV3VHkudmFsdWUudmFyaWFudHMucHVzaCh7XHJcbiAgICAgICAgICBuYW1lOiBuYW1lMixcclxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHZhcmlhbnQpLmFsZ2VicmFpY1R5cGVcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy4jbW9kdWxlRGVmLnR5cGVzLnB1c2goe1xyXG4gICAgICBzb3VyY2VOYW1lOiBzcGxpdE5hbWUobmFtZSksXHJcbiAgICAgIHR5OiByLnJlZixcclxuICAgICAgY3VzdG9tT3JkZXJpbmc6IHRydWVcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHI7XHJcbiAgfVxyXG59O1xyXG5mdW5jdGlvbiBpc1VuaXQodHlwZUJ1aWxkZXIpIHtcclxuICByZXR1cm4gdHlwZUJ1aWxkZXIudHlwZU5hbWUgPT0gbnVsbCAmJiB0eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlLnZhbHVlLmVsZW1lbnRzLmxlbmd0aCA9PT0gMDtcclxufVxyXG5mdW5jdGlvbiBzcGxpdE5hbWUobmFtZSkge1xyXG4gIGNvbnN0IHNjb3BlID0gbmFtZS5zcGxpdChcIi5cIik7XHJcbiAgcmV0dXJuIHsgc291cmNlTmFtZTogc2NvcGUucG9wKCksIHNjb3BlIH07XHJcbn1cclxuXHJcbi8vIHNyYy9zZXJ2ZXIvaHR0cF9pbnRlcm5hbC50c1xyXG52YXIgaW1wb3J0X3N0YXR1c2VzID0gX190b0VTTShyZXF1aXJlX3N0YXR1c2VzKCkpO1xyXG5cclxuLy8gc3JjL3NlcnZlci9yYW5nZS50c1xyXG52YXIgUmFuZ2UgPSBjbGFzcyB7XHJcbiAgI2Zyb207XHJcbiAgI3RvO1xyXG4gIGNvbnN0cnVjdG9yKGZyb20sIHRvKSB7XHJcbiAgICB0aGlzLiNmcm9tID0gZnJvbSA/PyB7IHRhZzogXCJ1bmJvdW5kZWRcIiB9O1xyXG4gICAgdGhpcy4jdG8gPSB0byA/PyB7IHRhZzogXCJ1bmJvdW5kZWRcIiB9O1xyXG4gIH1cclxuICBnZXQgZnJvbSgpIHtcclxuICAgIHJldHVybiB0aGlzLiNmcm9tO1xyXG4gIH1cclxuICBnZXQgdG8oKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jdG87XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2xpYi90YWJsZS50c1xyXG5mdW5jdGlvbiB0YWJsZShvcHRzLCByb3csIC4uLl8pIHtcclxuICBjb25zdCB7XHJcbiAgICBuYW1lLFxyXG4gICAgcHVibGljOiBpc1B1YmxpYyA9IGZhbHNlLFxyXG4gICAgaW5kZXhlczogdXNlckluZGV4ZXMgPSBbXSxcclxuICAgIHNjaGVkdWxlZCxcclxuICAgIGV2ZW50OiBpc0V2ZW50ID0gZmFsc2VcclxuICB9ID0gb3B0cztcclxuICBjb25zdCBjb2xJZHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xyXG4gIGNvbnN0IGNvbE5hbWVMaXN0ID0gW107XHJcbiAgaWYgKCEocm93IGluc3RhbmNlb2YgUm93QnVpbGRlcikpIHtcclxuICAgIHJvdyA9IG5ldyBSb3dCdWlsZGVyKHJvdyk7XHJcbiAgfVxyXG4gIHJvdy5hbGdlYnJhaWNUeXBlLnZhbHVlLmVsZW1lbnRzLmZvckVhY2goKGVsZW0sIGkpID0+IHtcclxuICAgIGNvbElkcy5zZXQoZWxlbS5uYW1lLCBpKTtcclxuICAgIGNvbE5hbWVMaXN0LnB1c2goZWxlbS5uYW1lKTtcclxuICB9KTtcclxuICBjb25zdCBwayA9IFtdO1xyXG4gIGNvbnN0IGluZGV4ZXMgPSBbXTtcclxuICBjb25zdCBjb25zdHJhaW50cyA9IFtdO1xyXG4gIGNvbnN0IHNlcXVlbmNlcyA9IFtdO1xyXG4gIGxldCBzY2hlZHVsZUF0Q29sO1xyXG4gIGNvbnN0IGRlZmF1bHRWYWx1ZXMgPSBbXTtcclxuICBmb3IgKGNvbnN0IFtuYW1lMiwgYnVpbGRlcl0gb2YgT2JqZWN0LmVudHJpZXMocm93LnJvdykpIHtcclxuICAgIGNvbnN0IG1ldGEgPSBidWlsZGVyLmNvbHVtbk1ldGFkYXRhO1xyXG4gICAgaWYgKG1ldGEuaXNQcmltYXJ5S2V5KSB7XHJcbiAgICAgIHBrLnB1c2goY29sSWRzLmdldChuYW1lMikpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgaXNVbmlxdWUgPSBtZXRhLmlzVW5pcXVlIHx8IG1ldGEuaXNQcmltYXJ5S2V5O1xyXG4gICAgaWYgKG1ldGEuaW5kZXhUeXBlIHx8IGlzVW5pcXVlKSB7XHJcbiAgICAgIGNvbnN0IGFsZ28gPSBtZXRhLmluZGV4VHlwZSA/PyBcImJ0cmVlXCI7XHJcbiAgICAgIGNvbnN0IGlkID0gY29sSWRzLmdldChuYW1lMik7XHJcbiAgICAgIGxldCBhbGdvcml0aG07XHJcbiAgICAgIHN3aXRjaCAoYWxnbykge1xyXG4gICAgICAgIGNhc2UgXCJidHJlZVwiOlxyXG4gICAgICAgICAgYWxnb3JpdGhtID0gUmF3SW5kZXhBbGdvcml0aG0uQlRyZWUoW2lkXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiaGFzaFwiOlxyXG4gICAgICAgICAgYWxnb3JpdGhtID0gUmF3SW5kZXhBbGdvcml0aG0uSGFzaChbaWRdKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJkaXJlY3RcIjpcclxuICAgICAgICAgIGFsZ29yaXRobSA9IFJhd0luZGV4QWxnb3JpdGhtLkRpcmVjdChpZCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBpbmRleGVzLnB1c2goe1xyXG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcclxuICAgICAgICAvLyBVbm5hbWVkIGluZGV4ZXMgd2lsbCBiZSBhc3NpZ25lZCBhIGdsb2JhbGx5IHVuaXF1ZSBuYW1lXHJcbiAgICAgICAgYWNjZXNzb3JOYW1lOiBuYW1lMixcclxuICAgICAgICBhbGdvcml0aG1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAoaXNVbmlxdWUpIHtcclxuICAgICAgY29uc3RyYWludHMucHVzaCh7XHJcbiAgICAgICAgc291cmNlTmFtZTogdm9pZCAwLFxyXG4gICAgICAgIGRhdGE6IHsgdGFnOiBcIlVuaXF1ZVwiLCB2YWx1ZTogeyBjb2x1bW5zOiBbY29sSWRzLmdldChuYW1lMildIH0gfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmIChtZXRhLmlzQXV0b0luY3JlbWVudCkge1xyXG4gICAgICBzZXF1ZW5jZXMucHVzaCh7XHJcbiAgICAgICAgc291cmNlTmFtZTogdm9pZCAwLFxyXG4gICAgICAgIHN0YXJ0OiB2b2lkIDAsXHJcbiAgICAgICAgbWluVmFsdWU6IHZvaWQgMCxcclxuICAgICAgICBtYXhWYWx1ZTogdm9pZCAwLFxyXG4gICAgICAgIGNvbHVtbjogY29sSWRzLmdldChuYW1lMiksXHJcbiAgICAgICAgaW5jcmVtZW50OiAxblxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmIChtZXRhLmRlZmF1bHRWYWx1ZSkge1xyXG4gICAgICBjb25zdCB3cml0ZXIgPSBuZXcgQmluYXJ5V3JpdGVyKDE2KTtcclxuICAgICAgYnVpbGRlci5zZXJpYWxpemUod3JpdGVyLCBtZXRhLmRlZmF1bHRWYWx1ZSk7XHJcbiAgICAgIGRlZmF1bHRWYWx1ZXMucHVzaCh7XHJcbiAgICAgICAgY29sSWQ6IGNvbElkcy5nZXQobmFtZTIpLFxyXG4gICAgICAgIHZhbHVlOiB3cml0ZXIuZ2V0QnVmZmVyKClcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAoc2NoZWR1bGVkKSB7XHJcbiAgICAgIGNvbnN0IGFsZ2VicmFpY1R5cGUgPSBidWlsZGVyLnR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGU7XHJcbiAgICAgIGlmIChzY2hlZHVsZV9hdF9kZWZhdWx0LmlzU2NoZWR1bGVBdChhbGdlYnJhaWNUeXBlKSkge1xyXG4gICAgICAgIHNjaGVkdWxlQXRDb2wgPSBjb2xJZHMuZ2V0KG5hbWUyKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBmb3IgKGNvbnN0IGluZGV4T3B0cyBvZiB1c2VySW5kZXhlcyA/PyBbXSkge1xyXG4gICAgbGV0IGFsZ29yaXRobTtcclxuICAgIHN3aXRjaCAoaW5kZXhPcHRzLmFsZ29yaXRobSkge1xyXG4gICAgICBjYXNlIFwiYnRyZWVcIjpcclxuICAgICAgICBhbGdvcml0aG0gPSB7XHJcbiAgICAgICAgICB0YWc6IFwiQlRyZWVcIixcclxuICAgICAgICAgIHZhbHVlOiBpbmRleE9wdHMuY29sdW1ucy5tYXAoKGMpID0+IGNvbElkcy5nZXQoYykpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImhhc2hcIjpcclxuICAgICAgICBhbGdvcml0aG0gPSB7XHJcbiAgICAgICAgICB0YWc6IFwiSGFzaFwiLFxyXG4gICAgICAgICAgdmFsdWU6IGluZGV4T3B0cy5jb2x1bW5zLm1hcCgoYykgPT4gY29sSWRzLmdldChjKSlcclxuICAgICAgICB9O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiZGlyZWN0XCI6XHJcbiAgICAgICAgYWxnb3JpdGhtID0geyB0YWc6IFwiRGlyZWN0XCIsIHZhbHVlOiBjb2xJZHMuZ2V0KGluZGV4T3B0cy5jb2x1bW4pIH07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBpbmRleGVzLnB1c2goe1xyXG4gICAgICBzb3VyY2VOYW1lOiB2b2lkIDAsXHJcbiAgICAgIGFjY2Vzc29yTmFtZTogaW5kZXhPcHRzLmFjY2Vzc29yLFxyXG4gICAgICBhbGdvcml0aG0sXHJcbiAgICAgIGNhbm9uaWNhbE5hbWU6IGluZGV4T3B0cy5uYW1lXHJcbiAgICB9KTtcclxuICB9XHJcbiAgZm9yIChjb25zdCBjb25zdHJhaW50T3B0cyBvZiBvcHRzLmNvbnN0cmFpbnRzID8/IFtdKSB7XHJcbiAgICBpZiAoY29uc3RyYWludE9wdHMuY29uc3RyYWludCA9PT0gXCJ1bmlxdWVcIikge1xyXG4gICAgICBjb25zdCBkYXRhID0ge1xyXG4gICAgICAgIHRhZzogXCJVbmlxdWVcIixcclxuICAgICAgICB2YWx1ZTogeyBjb2x1bW5zOiBjb25zdHJhaW50T3B0cy5jb2x1bW5zLm1hcCgoYykgPT4gY29sSWRzLmdldChjKSkgfVxyXG4gICAgICB9O1xyXG4gICAgICBjb25zdHJhaW50cy5wdXNoKHsgc291cmNlTmFtZTogY29uc3RyYWludE9wdHMubmFtZSwgZGF0YSB9KTtcclxuICAgICAgY29udGludWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGNvbnN0IHByb2R1Y3RUeXBlID0gcm93LmFsZ2VicmFpY1R5cGUudmFsdWU7XHJcbiAgY29uc3Qgc2NoZWR1bGUgPSBzY2hlZHVsZWQgJiYgc2NoZWR1bGVBdENvbCAhPT0gdm9pZCAwID8geyBzY2hlZHVsZUF0Q29sLCByZWR1Y2VyOiBzY2hlZHVsZWQgfSA6IHZvaWQgMDtcclxuICByZXR1cm4ge1xyXG4gICAgcm93VHlwZTogcm93LFxyXG4gICAgdGFibGVOYW1lOiBuYW1lLFxyXG4gICAgcm93U3BhY2V0aW1lVHlwZTogcHJvZHVjdFR5cGUsXHJcbiAgICB0YWJsZURlZjogKGN0eCwgYWNjTmFtZSkgPT4ge1xyXG4gICAgICBjb25zdCB0YWJsZU5hbWUgPSBuYW1lID8/IGFjY05hbWU7XHJcbiAgICAgIGlmIChyb3cudHlwZU5hbWUgPT09IHZvaWQgMCkge1xyXG4gICAgICAgIHJvdy50eXBlTmFtZSA9IHRvUGFzY2FsQ2FzZSh0YWJsZU5hbWUpO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAoY29uc3QgaW5kZXggb2YgaW5kZXhlcykge1xyXG4gICAgICAgIGNvbnN0IGNvbHMgPSBpbmRleC5hbGdvcml0aG0udGFnID09PSBcIkRpcmVjdFwiID8gW2luZGV4LmFsZ29yaXRobS52YWx1ZV0gOiBpbmRleC5hbGdvcml0aG0udmFsdWU7XHJcbiAgICAgICAgY29uc3QgY29sUyA9IGNvbHMubWFwKChpKSA9PiBjb2xOYW1lTGlzdFtpXSkuam9pbihcIl9cIik7XHJcbiAgICAgICAgY29uc3Qgc291cmNlTmFtZSA9IGluZGV4LnNvdXJjZU5hbWUgPSBgJHthY2NOYW1lfV8ke2NvbFN9X2lkeF8ke2luZGV4LmFsZ29yaXRobS50YWcudG9Mb3dlckNhc2UoKX1gO1xyXG4gICAgICAgIGNvbnN0IHsgY2Fub25pY2FsTmFtZSB9ID0gaW5kZXg7XHJcbiAgICAgICAgaWYgKGNhbm9uaWNhbE5hbWUgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaChcclxuICAgICAgICAgICAgRXhwbGljaXROYW1lRW50cnkuSW5kZXgoeyBzb3VyY2VOYW1lLCBjYW5vbmljYWxOYW1lIH0pXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHNvdXJjZU5hbWU6IGFjY05hbWUsXHJcbiAgICAgICAgcHJvZHVjdFR5cGVSZWY6IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocm93KS5yZWYsXHJcbiAgICAgICAgcHJpbWFyeUtleTogcGssXHJcbiAgICAgICAgaW5kZXhlcyxcclxuICAgICAgICBjb25zdHJhaW50cyxcclxuICAgICAgICBzZXF1ZW5jZXMsXHJcbiAgICAgICAgdGFibGVUeXBlOiB7IHRhZzogXCJVc2VyXCIgfSxcclxuICAgICAgICB0YWJsZUFjY2VzczogeyB0YWc6IGlzUHVibGljID8gXCJQdWJsaWNcIiA6IFwiUHJpdmF0ZVwiIH0sXHJcbiAgICAgICAgZGVmYXVsdFZhbHVlcyxcclxuICAgICAgICBpc0V2ZW50XHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgaWR4czoge30sXHJcbiAgICBjb25zdHJhaW50cyxcclxuICAgIHNjaGVkdWxlXHJcbiAgfTtcclxufVxyXG5cclxuLy8gc3JjL2xpYi9xdWVyeS50c1xyXG52YXIgUXVlcnlCcmFuZCA9IFN5bWJvbChcIlF1ZXJ5QnJhbmRcIik7XHJcbnZhciBpc1Jvd1R5cGVkUXVlcnkgPSAodmFsKSA9PiAhIXZhbCAmJiB0eXBlb2YgdmFsID09PSBcIm9iamVjdFwiICYmIFF1ZXJ5QnJhbmQgaW4gdmFsO1xyXG52YXIgaXNUeXBlZFF1ZXJ5ID0gKHZhbCkgPT4gISF2YWwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiBRdWVyeUJyYW5kIGluIHZhbDtcclxuZnVuY3Rpb24gdG9TcWwocSkge1xyXG4gIHJldHVybiBxLnRvU3FsKCk7XHJcbn1cclxudmFyIFNlbWlqb2luSW1wbCA9IGNsYXNzIF9TZW1pam9pbkltcGwge1xyXG4gIGNvbnN0cnVjdG9yKHNvdXJjZVF1ZXJ5LCBmaWx0ZXJRdWVyeSwgam9pbkNvbmRpdGlvbikge1xyXG4gICAgdGhpcy5zb3VyY2VRdWVyeSA9IHNvdXJjZVF1ZXJ5O1xyXG4gICAgdGhpcy5maWx0ZXJRdWVyeSA9IGZpbHRlclF1ZXJ5O1xyXG4gICAgdGhpcy5qb2luQ29uZGl0aW9uID0gam9pbkNvbmRpdGlvbjtcclxuICAgIGlmIChzb3VyY2VRdWVyeS50YWJsZS5zb3VyY2VOYW1lID09PSBmaWx0ZXJRdWVyeS50YWJsZS5zb3VyY2VOYW1lKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzZW1pam9pbiBhIHRhYmxlIHRvIGl0c2VsZlwiKTtcclxuICAgIH1cclxuICB9XHJcbiAgW1F1ZXJ5QnJhbmRdID0gdHJ1ZTtcclxuICB0eXBlID0gXCJzZW1pam9pblwiO1xyXG4gIGJ1aWxkKCkge1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG4gIHdoZXJlKHByZWRpY2F0ZSkge1xyXG4gICAgY29uc3QgbmV4dFNvdXJjZVF1ZXJ5ID0gdGhpcy5zb3VyY2VRdWVyeS53aGVyZShwcmVkaWNhdGUpO1xyXG4gICAgcmV0dXJuIG5ldyBfU2VtaWpvaW5JbXBsKFxyXG4gICAgICBuZXh0U291cmNlUXVlcnksXHJcbiAgICAgIHRoaXMuZmlsdGVyUXVlcnksXHJcbiAgICAgIHRoaXMuam9pbkNvbmRpdGlvblxyXG4gICAgKTtcclxuICB9XHJcbiAgdG9TcWwoKSB7XHJcbiAgICBjb25zdCBsZWZ0ID0gdGhpcy5maWx0ZXJRdWVyeTtcclxuICAgIGNvbnN0IHJpZ2h0ID0gdGhpcy5zb3VyY2VRdWVyeTtcclxuICAgIGNvbnN0IGxlZnRUYWJsZSA9IHF1b3RlSWRlbnRpZmllcihsZWZ0LnRhYmxlLnNvdXJjZU5hbWUpO1xyXG4gICAgY29uc3QgcmlnaHRUYWJsZSA9IHF1b3RlSWRlbnRpZmllcihyaWdodC50YWJsZS5zb3VyY2VOYW1lKTtcclxuICAgIGxldCBzcWwgPSBgU0VMRUNUICR7cmlnaHRUYWJsZX0uKiBGUk9NICR7bGVmdFRhYmxlfSBKT0lOICR7cmlnaHRUYWJsZX0gT04gJHtib29sZWFuRXhwclRvU3FsKHRoaXMuam9pbkNvbmRpdGlvbil9YDtcclxuICAgIGNvbnN0IGNsYXVzZXMgPSBbXTtcclxuICAgIGlmIChsZWZ0LndoZXJlQ2xhdXNlKSB7XHJcbiAgICAgIGNsYXVzZXMucHVzaChib29sZWFuRXhwclRvU3FsKGxlZnQud2hlcmVDbGF1c2UpKTtcclxuICAgIH1cclxuICAgIGlmIChyaWdodC53aGVyZUNsYXVzZSkge1xyXG4gICAgICBjbGF1c2VzLnB1c2goYm9vbGVhbkV4cHJUb1NxbChyaWdodC53aGVyZUNsYXVzZSkpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNsYXVzZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCB3aGVyZVNxbCA9IGNsYXVzZXMubGVuZ3RoID09PSAxID8gY2xhdXNlc1swXSA6IGNsYXVzZXMubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBBTkQgXCIpO1xyXG4gICAgICBzcWwgKz0gYCBXSEVSRSAke3doZXJlU3FsfWA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3FsO1xyXG4gIH1cclxufTtcclxudmFyIEZyb21CdWlsZGVyID0gY2xhc3MgX0Zyb21CdWlsZGVyIHtcclxuICBjb25zdHJ1Y3Rvcih0YWJsZTIsIHdoZXJlQ2xhdXNlKSB7XHJcbiAgICB0aGlzLnRhYmxlID0gdGFibGUyO1xyXG4gICAgdGhpcy53aGVyZUNsYXVzZSA9IHdoZXJlQ2xhdXNlO1xyXG4gIH1cclxuICBbUXVlcnlCcmFuZF0gPSB0cnVlO1xyXG4gIHdoZXJlKHByZWRpY2F0ZSkge1xyXG4gICAgY29uc3QgbmV3Q29uZGl0aW9uID0gcHJlZGljYXRlKHRoaXMudGFibGUuY29scyk7XHJcbiAgICBjb25zdCBuZXh0V2hlcmUgPSB0aGlzLndoZXJlQ2xhdXNlID8gdGhpcy53aGVyZUNsYXVzZS5hbmQobmV3Q29uZGl0aW9uKSA6IG5ld0NvbmRpdGlvbjtcclxuICAgIHJldHVybiBuZXcgX0Zyb21CdWlsZGVyKHRoaXMudGFibGUsIG5leHRXaGVyZSk7XHJcbiAgfVxyXG4gIHJpZ2h0U2VtaWpvaW4ocmlnaHQsIG9uKSB7XHJcbiAgICBjb25zdCBzb3VyY2VRdWVyeSA9IG5ldyBfRnJvbUJ1aWxkZXIocmlnaHQpO1xyXG4gICAgY29uc3Qgam9pbkNvbmRpdGlvbiA9IG9uKFxyXG4gICAgICB0aGlzLnRhYmxlLmluZGV4ZWRDb2xzLFxyXG4gICAgICByaWdodC5pbmRleGVkQ29sc1xyXG4gICAgKTtcclxuICAgIHJldHVybiBuZXcgU2VtaWpvaW5JbXBsKHNvdXJjZVF1ZXJ5LCB0aGlzLCBqb2luQ29uZGl0aW9uKTtcclxuICB9XHJcbiAgbGVmdFNlbWlqb2luKHJpZ2h0LCBvbikge1xyXG4gICAgY29uc3QgZmlsdGVyUXVlcnkgPSBuZXcgX0Zyb21CdWlsZGVyKHJpZ2h0KTtcclxuICAgIGNvbnN0IGpvaW5Db25kaXRpb24gPSBvbihcclxuICAgICAgdGhpcy50YWJsZS5pbmRleGVkQ29scyxcclxuICAgICAgcmlnaHQuaW5kZXhlZENvbHNcclxuICAgICk7XHJcbiAgICByZXR1cm4gbmV3IFNlbWlqb2luSW1wbCh0aGlzLCBmaWx0ZXJRdWVyeSwgam9pbkNvbmRpdGlvbik7XHJcbiAgfVxyXG4gIHRvU3FsKCkge1xyXG4gICAgcmV0dXJuIHJlbmRlclNlbGVjdFNxbFdpdGhKb2lucyh0aGlzLnRhYmxlLCB0aGlzLndoZXJlQ2xhdXNlKTtcclxuICB9XHJcbiAgYnVpbGQoKSB7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcbn07XHJcbnZhciBUYWJsZVJlZkltcGwgPSBjbGFzcyB7XHJcbiAgW1F1ZXJ5QnJhbmRdID0gdHJ1ZTtcclxuICB0eXBlID0gXCJ0YWJsZVwiO1xyXG4gIHNvdXJjZU5hbWU7XHJcbiAgYWNjZXNzb3JOYW1lO1xyXG4gIGNvbHM7XHJcbiAgaW5kZXhlZENvbHM7XHJcbiAgdGFibGVEZWY7XHJcbiAgLy8gRGVsZWdhdGUgVW50eXBlZFRhYmxlRGVmIHByb3BlcnRpZXMgZnJvbSB0YWJsZURlZiBzbyB0aGlzIGNhbiBiZSB1c2VkIGFzIGEgdGFibGUgZGVmLlxyXG4gIGdldCBjb2x1bW5zKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudGFibGVEZWYuY29sdW1ucztcclxuICB9XHJcbiAgZ2V0IGluZGV4ZXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50YWJsZURlZi5pbmRleGVzO1xyXG4gIH1cclxuICBnZXQgcm93VHlwZSgpIHtcclxuICAgIHJldHVybiB0aGlzLnRhYmxlRGVmLnJvd1R5cGU7XHJcbiAgfVxyXG4gIGdldCBjb25zdHJhaW50cygpIHtcclxuICAgIHJldHVybiB0aGlzLnRhYmxlRGVmLmNvbnN0cmFpbnRzO1xyXG4gIH1cclxuICBjb25zdHJ1Y3Rvcih0YWJsZURlZikge1xyXG4gICAgdGhpcy5zb3VyY2VOYW1lID0gdGFibGVEZWYuc291cmNlTmFtZTtcclxuICAgIHRoaXMuYWNjZXNzb3JOYW1lID0gdGFibGVEZWYuYWNjZXNzb3JOYW1lO1xyXG4gICAgdGhpcy5jb2xzID0gY3JlYXRlUm93RXhwcih0YWJsZURlZik7XHJcbiAgICB0aGlzLmluZGV4ZWRDb2xzID0gdGhpcy5jb2xzO1xyXG4gICAgdGhpcy50YWJsZURlZiA9IHRhYmxlRGVmO1xyXG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcclxuICB9XHJcbiAgYXNGcm9tKCkge1xyXG4gICAgcmV0dXJuIG5ldyBGcm9tQnVpbGRlcih0aGlzKTtcclxuICB9XHJcbiAgcmlnaHRTZW1pam9pbihvdGhlciwgb24pIHtcclxuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLnJpZ2h0U2VtaWpvaW4ob3RoZXIsIG9uKTtcclxuICB9XHJcbiAgbGVmdFNlbWlqb2luKG90aGVyLCBvbikge1xyXG4gICAgcmV0dXJuIHRoaXMuYXNGcm9tKCkubGVmdFNlbWlqb2luKG90aGVyLCBvbik7XHJcbiAgfVxyXG4gIGJ1aWxkKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXNGcm9tKCkuYnVpbGQoKTtcclxuICB9XHJcbiAgdG9TcWwoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hc0Zyb20oKS50b1NxbCgpO1xyXG4gIH1cclxuICB3aGVyZShwcmVkaWNhdGUpIHtcclxuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLndoZXJlKHByZWRpY2F0ZSk7XHJcbiAgfVxyXG59O1xyXG5mdW5jdGlvbiBjcmVhdGVUYWJsZVJlZkZyb21EZWYodGFibGVEZWYpIHtcclxuICByZXR1cm4gbmV3IFRhYmxlUmVmSW1wbCh0YWJsZURlZik7XHJcbn1cclxuZnVuY3Rpb24gbWFrZVF1ZXJ5QnVpbGRlcihzY2hlbWEyKSB7XHJcbiAgY29uc3QgcWIgPSAvKiBAX19QVVJFX18gKi8gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBmb3IgKGNvbnN0IHRhYmxlMiBvZiBPYmplY3QudmFsdWVzKHNjaGVtYTIudGFibGVzKSkge1xyXG4gICAgY29uc3QgcmVmID0gY3JlYXRlVGFibGVSZWZGcm9tRGVmKFxyXG4gICAgICB0YWJsZTJcclxuICAgICk7XHJcbiAgICBxYlt0YWJsZTIuYWNjZXNzb3JOYW1lXSA9IHJlZjtcclxuICB9XHJcbiAgcmV0dXJuIE9iamVjdC5mcmVlemUocWIpO1xyXG59XHJcbmZ1bmN0aW9uIGNyZWF0ZVJvd0V4cHIodGFibGVEZWYpIHtcclxuICBjb25zdCByb3cgPSB7fTtcclxuICBmb3IgKGNvbnN0IGNvbHVtbk5hbWUgb2YgT2JqZWN0LmtleXModGFibGVEZWYuY29sdW1ucykpIHtcclxuICAgIGNvbnN0IGNvbHVtbkJ1aWxkZXIgPSB0YWJsZURlZi5jb2x1bW5zW2NvbHVtbk5hbWVdO1xyXG4gICAgY29uc3QgY29sdW1uID0gbmV3IENvbHVtbkV4cHJlc3Npb24oXHJcbiAgICAgIHRhYmxlRGVmLnNvdXJjZU5hbWUsXHJcbiAgICAgIGNvbHVtbk5hbWUsXHJcbiAgICAgIGNvbHVtbkJ1aWxkZXIudHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZVxyXG4gICAgKTtcclxuICAgIHJvd1tjb2x1bW5OYW1lXSA9IE9iamVjdC5mcmVlemUoY29sdW1uKTtcclxuICB9XHJcbiAgcmV0dXJuIE9iamVjdC5mcmVlemUocm93KTtcclxufVxyXG5mdW5jdGlvbiByZW5kZXJTZWxlY3RTcWxXaXRoSm9pbnModGFibGUyLCB3aGVyZSwgZXh0cmFDbGF1c2VzID0gW10pIHtcclxuICBjb25zdCBxdW90ZWRUYWJsZSA9IHF1b3RlSWRlbnRpZmllcih0YWJsZTIuc291cmNlTmFtZSk7XHJcbiAgY29uc3Qgc3FsID0gYFNFTEVDVCAqIEZST00gJHtxdW90ZWRUYWJsZX1gO1xyXG4gIGNvbnN0IGNsYXVzZXMgPSBbXTtcclxuICBpZiAod2hlcmUpIGNsYXVzZXMucHVzaChib29sZWFuRXhwclRvU3FsKHdoZXJlKSk7XHJcbiAgY2xhdXNlcy5wdXNoKC4uLmV4dHJhQ2xhdXNlcyk7XHJcbiAgaWYgKGNsYXVzZXMubGVuZ3RoID09PSAwKSByZXR1cm4gc3FsO1xyXG4gIGNvbnN0IHdoZXJlU3FsID0gY2xhdXNlcy5sZW5ndGggPT09IDEgPyBjbGF1c2VzWzBdIDogY2xhdXNlcy5tYXAod3JhcEluUGFyZW5zKS5qb2luKFwiIEFORCBcIik7XHJcbiAgcmV0dXJuIGAke3NxbH0gV0hFUkUgJHt3aGVyZVNxbH1gO1xyXG59XHJcbnZhciBDb2x1bW5FeHByZXNzaW9uID0gY2xhc3Mge1xyXG4gIHR5cGUgPSBcImNvbHVtblwiO1xyXG4gIGNvbHVtbjtcclxuICB0YWJsZTtcclxuICAvLyBwaGFudG9tOiBhY3R1YWwgcnVudGltZSB2YWx1ZSBpcyB1bmRlZmluZWRcclxuICB0c1ZhbHVlVHlwZTtcclxuICBzcGFjZXRpbWVUeXBlO1xyXG4gIGNvbnN0cnVjdG9yKHRhYmxlMiwgY29sdW1uLCBzcGFjZXRpbWVUeXBlKSB7XHJcbiAgICB0aGlzLnRhYmxlID0gdGFibGUyO1xyXG4gICAgdGhpcy5jb2x1bW4gPSBjb2x1bW47XHJcbiAgICB0aGlzLnNwYWNldGltZVR5cGUgPSBzcGFjZXRpbWVUeXBlO1xyXG4gIH1cclxuICBlcSh4KSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcclxuICAgICAgdHlwZTogXCJlcVwiLFxyXG4gICAgICBsZWZ0OiB0aGlzLFxyXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcclxuICAgIH0pO1xyXG4gIH1cclxuICBuZSh4KSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcclxuICAgICAgdHlwZTogXCJuZVwiLFxyXG4gICAgICBsZWZ0OiB0aGlzLFxyXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcclxuICAgIH0pO1xyXG4gIH1cclxuICBsdCh4KSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcclxuICAgICAgdHlwZTogXCJsdFwiLFxyXG4gICAgICBsZWZ0OiB0aGlzLFxyXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcclxuICAgIH0pO1xyXG4gIH1cclxuICBsdGUoeCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICAgIHR5cGU6IFwibHRlXCIsXHJcbiAgICAgIGxlZnQ6IHRoaXMsXHJcbiAgICAgIHJpZ2h0OiBub3JtYWxpemVWYWx1ZSh4KVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGd0KHgpIHtcclxuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xyXG4gICAgICB0eXBlOiBcImd0XCIsXHJcbiAgICAgIGxlZnQ6IHRoaXMsXHJcbiAgICAgIHJpZ2h0OiBub3JtYWxpemVWYWx1ZSh4KVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGd0ZSh4KSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcclxuICAgICAgdHlwZTogXCJndGVcIixcclxuICAgICAgbGVmdDogdGhpcyxcclxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXHJcbiAgICB9KTtcclxuICB9XHJcbn07XHJcbmZ1bmN0aW9uIGxpdGVyYWwodmFsdWUpIHtcclxuICByZXR1cm4geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWUgfTtcclxufVxyXG5mdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWwpIHtcclxuICBpZiAodmFsLnR5cGUgPT09IFwibGl0ZXJhbFwiKVxyXG4gICAgcmV0dXJuIHZhbDtcclxuICBpZiAodHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiB2YWwgIT0gbnVsbCAmJiBcInR5cGVcIiBpbiB2YWwgJiYgdmFsLnR5cGUgPT09IFwiY29sdW1uXCIpIHtcclxuICAgIHJldHVybiB2YWw7XHJcbiAgfVxyXG4gIHJldHVybiBsaXRlcmFsKHZhbCk7XHJcbn1cclxudmFyIEJvb2xlYW5FeHByID0gY2xhc3MgX0Jvb2xlYW5FeHByIHtcclxuICBjb25zdHJ1Y3RvcihkYXRhKSB7XHJcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xyXG4gIH1cclxuICBhbmQob3RoZXIpIHtcclxuICAgIHJldHVybiBuZXcgX0Jvb2xlYW5FeHByKHsgdHlwZTogXCJhbmRcIiwgY2xhdXNlczogW3RoaXMuZGF0YSwgb3RoZXIuZGF0YV0gfSk7XHJcbiAgfVxyXG4gIG9yKG90aGVyKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Cb29sZWFuRXhwcih7IHR5cGU6IFwib3JcIiwgY2xhdXNlczogW3RoaXMuZGF0YSwgb3RoZXIuZGF0YV0gfSk7XHJcbiAgfVxyXG4gIG5vdCgpIHtcclxuICAgIHJldHVybiBuZXcgX0Jvb2xlYW5FeHByKHsgdHlwZTogXCJub3RcIiwgY2xhdXNlOiB0aGlzLmRhdGEgfSk7XHJcbiAgfVxyXG59O1xyXG5mdW5jdGlvbiBub3QoY2xhdXNlKSB7XHJcbiAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7IHR5cGU6IFwibm90XCIsIGNsYXVzZTogY2xhdXNlLmRhdGEgfSk7XHJcbn1cclxuZnVuY3Rpb24gYW5kKC4uLmNsYXVzZXMpIHtcclxuICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcclxuICAgIHR5cGU6IFwiYW5kXCIsXHJcbiAgICBjbGF1c2VzOiBjbGF1c2VzLm1hcCgoYykgPT4gYy5kYXRhKVxyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIG9yKC4uLmNsYXVzZXMpIHtcclxuICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcclxuICAgIHR5cGU6IFwib3JcIixcclxuICAgIGNsYXVzZXM6IGNsYXVzZXMubWFwKChjKSA9PiBjLmRhdGEpXHJcbiAgfSk7XHJcbn1cclxuZnVuY3Rpb24gYm9vbGVhbkV4cHJUb1NxbChleHByLCB0YWJsZUFsaWFzKSB7XHJcbiAgY29uc3QgZGF0YSA9IGV4cHIgaW5zdGFuY2VvZiBCb29sZWFuRXhwciA/IGV4cHIuZGF0YSA6IGV4cHI7XHJcbiAgc3dpdGNoIChkYXRhLnR5cGUpIHtcclxuICAgIGNhc2UgXCJlcVwiOlxyXG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPSAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XHJcbiAgICBjYXNlIFwibmVcIjpcclxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9IDw+ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcclxuICAgIGNhc2UgXCJndFwiOlxyXG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPiAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XHJcbiAgICBjYXNlIFwiZ3RlXCI6XHJcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA+PSAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XHJcbiAgICBjYXNlIFwibHRcIjpcclxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9IDwgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xyXG4gICAgY2FzZSBcImx0ZVwiOlxyXG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPD0gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xyXG4gICAgY2FzZSBcImFuZFwiOlxyXG4gICAgICByZXR1cm4gZGF0YS5jbGF1c2VzLm1hcCgoYykgPT4gYm9vbGVhbkV4cHJUb1NxbChjKSkubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBBTkQgXCIpO1xyXG4gICAgY2FzZSBcIm9yXCI6XHJcbiAgICAgIHJldHVybiBkYXRhLmNsYXVzZXMubWFwKChjKSA9PiBib29sZWFuRXhwclRvU3FsKGMpKS5tYXAod3JhcEluUGFyZW5zKS5qb2luKFwiIE9SIFwiKTtcclxuICAgIGNhc2UgXCJub3RcIjpcclxuICAgICAgcmV0dXJuIGBOT1QgJHt3cmFwSW5QYXJlbnMoYm9vbGVhbkV4cHJUb1NxbChkYXRhLmNsYXVzZSkpfWA7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIHdyYXBJblBhcmVucyhzcWwpIHtcclxuICByZXR1cm4gYCgke3NxbH0pYDtcclxufVxyXG5mdW5jdGlvbiB2YWx1ZUV4cHJUb1NxbChleHByLCB0YWJsZUFsaWFzKSB7XHJcbiAgaWYgKGlzTGl0ZXJhbEV4cHIoZXhwcikpIHtcclxuICAgIHJldHVybiBsaXRlcmFsVmFsdWVUb1NxbChleHByLnZhbHVlKTtcclxuICB9XHJcbiAgY29uc3QgdGFibGUyID0gZXhwci50YWJsZTtcclxuICByZXR1cm4gYCR7cXVvdGVJZGVudGlmaWVyKHRhYmxlMil9LiR7cXVvdGVJZGVudGlmaWVyKGV4cHIuY29sdW1uKX1gO1xyXG59XHJcbmZ1bmN0aW9uIGxpdGVyYWxWYWx1ZVRvU3FsKHZhbHVlKSB7XHJcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB2b2lkIDApIHtcclxuICAgIHJldHVybiBcIk5VTExcIjtcclxuICB9XHJcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSWRlbnRpdHkgfHwgdmFsdWUgaW5zdGFuY2VvZiBDb25uZWN0aW9uSWQpIHtcclxuICAgIHJldHVybiBgMHgke3ZhbHVlLnRvSGV4U3RyaW5nKCl9YDtcclxuICB9XHJcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgVGltZXN0YW1wKSB7XHJcbiAgICByZXR1cm4gYCcke3ZhbHVlLnRvSVNPU3RyaW5nKCl9J2A7XHJcbiAgfVxyXG4gIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XHJcbiAgICBjYXNlIFwibnVtYmVyXCI6XHJcbiAgICBjYXNlIFwiYmlnaW50XCI6XHJcbiAgICAgIHJldHVybiBTdHJpbmcodmFsdWUpO1xyXG4gICAgY2FzZSBcImJvb2xlYW5cIjpcclxuICAgICAgcmV0dXJuIHZhbHVlID8gXCJUUlVFXCIgOiBcIkZBTFNFXCI7XHJcbiAgICBjYXNlIFwic3RyaW5nXCI6XHJcbiAgICAgIHJldHVybiBgJyR7dmFsdWUucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgcmV0dXJuIGAnJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSkucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiBxdW90ZUlkZW50aWZpZXIobmFtZSkge1xyXG4gIHJldHVybiBgXCIke25hbWUucmVwbGFjZSgvXCIvZywgJ1wiXCInKX1cImA7XHJcbn1cclxuZnVuY3Rpb24gaXNMaXRlcmFsRXhwcihleHByKSB7XHJcbiAgcmV0dXJuIGV4cHIudHlwZSA9PT0gXCJsaXRlcmFsXCI7XHJcbn1cclxuZnVuY3Rpb24gZXZhbHVhdGVCb29sZWFuRXhwcihleHByLCByb3cpIHtcclxuICByZXR1cm4gZXZhbHVhdGVEYXRhKGV4cHIuZGF0YSwgcm93KTtcclxufVxyXG5mdW5jdGlvbiBldmFsdWF0ZURhdGEoZGF0YSwgcm93KSB7XHJcbiAgc3dpdGNoIChkYXRhLnR5cGUpIHtcclxuICAgIGNhc2UgXCJlcVwiOlxyXG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA9PT0gcmVzb2x2ZVZhbHVlKGRhdGEucmlnaHQsIHJvdyk7XHJcbiAgICBjYXNlIFwibmVcIjpcclxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgIT09IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xyXG4gICAgY2FzZSBcImd0XCI6XHJcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpID4gcmVzb2x2ZVZhbHVlKGRhdGEucmlnaHQsIHJvdyk7XHJcbiAgICBjYXNlIFwiZ3RlXCI6XHJcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpID49IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xyXG4gICAgY2FzZSBcImx0XCI6XHJcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpIDwgcmVzb2x2ZVZhbHVlKGRhdGEucmlnaHQsIHJvdyk7XHJcbiAgICBjYXNlIFwibHRlXCI6XHJcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpIDw9IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xyXG4gICAgY2FzZSBcImFuZFwiOlxyXG4gICAgICByZXR1cm4gZGF0YS5jbGF1c2VzLmV2ZXJ5KChjKSA9PiBldmFsdWF0ZURhdGEoYywgcm93KSk7XHJcbiAgICBjYXNlIFwib3JcIjpcclxuICAgICAgcmV0dXJuIGRhdGEuY2xhdXNlcy5zb21lKChjKSA9PiBldmFsdWF0ZURhdGEoYywgcm93KSk7XHJcbiAgICBjYXNlIFwibm90XCI6XHJcbiAgICAgIHJldHVybiAhZXZhbHVhdGVEYXRhKGRhdGEuY2xhdXNlLCByb3cpO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiByZXNvbHZlVmFsdWUoZXhwciwgcm93KSB7XHJcbiAgaWYgKGlzTGl0ZXJhbEV4cHIoZXhwcikpIHtcclxuICAgIHJldHVybiB0b0NvbXBhcmFibGVWYWx1ZShleHByLnZhbHVlKTtcclxuICB9XHJcbiAgcmV0dXJuIHRvQ29tcGFyYWJsZVZhbHVlKHJvd1tleHByLmNvbHVtbl0pO1xyXG59XHJcbmZ1bmN0aW9uIGlzSGV4U2VyaWFsaXphYmxlTGlrZSh2YWx1ZSkge1xyXG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsdWUudG9IZXhTdHJpbmcgPT09IFwiZnVuY3Rpb25cIjtcclxufVxyXG5mdW5jdGlvbiBpc1RpbWVzdGFtcExpa2UodmFsdWUpIHtcclxuICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIGZhbHNlO1xyXG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRpbWVzdGFtcCkgcmV0dXJuIHRydWU7XHJcbiAgY29uc3QgbWljcm9zID0gdmFsdWVbXCJfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXCJdO1xyXG4gIHJldHVybiB0eXBlb2YgbWljcm9zID09PSBcImJpZ2ludFwiO1xyXG59XHJcbmZ1bmN0aW9uIHRvQ29tcGFyYWJsZVZhbHVlKHZhbHVlKSB7XHJcbiAgaWYgKGlzSGV4U2VyaWFsaXphYmxlTGlrZSh2YWx1ZSkpIHtcclxuICAgIHJldHVybiB2YWx1ZS50b0hleFN0cmluZygpO1xyXG4gIH1cclxuICBpZiAoaXNUaW1lc3RhbXBMaWtlKHZhbHVlKSkge1xyXG4gICAgcmV0dXJuIHZhbHVlLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX187XHJcbiAgfVxyXG4gIHJldHVybiB2YWx1ZTtcclxufVxyXG5mdW5jdGlvbiBnZXRRdWVyeVRhYmxlTmFtZShxdWVyeSkge1xyXG4gIGlmIChxdWVyeS50YWJsZSkgcmV0dXJuIHF1ZXJ5LnRhYmxlLm5hbWU7XHJcbiAgaWYgKHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS5uYW1lO1xyXG4gIGlmIChxdWVyeS5zb3VyY2VRdWVyeSkgcmV0dXJuIHF1ZXJ5LnNvdXJjZVF1ZXJ5LnRhYmxlLm5hbWU7XHJcbiAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGV4dHJhY3QgdGFibGUgbmFtZSBmcm9tIHF1ZXJ5XCIpO1xyXG59XHJcbmZ1bmN0aW9uIGdldFF1ZXJ5QWNjZXNzb3JOYW1lKHF1ZXJ5KSB7XHJcbiAgaWYgKHF1ZXJ5LnRhYmxlKSByZXR1cm4gcXVlcnkudGFibGUuYWNjZXNzb3JOYW1lO1xyXG4gIGlmIChxdWVyeS5hY2Nlc3Nvck5hbWUpIHJldHVybiBxdWVyeS5hY2Nlc3Nvck5hbWU7XHJcbiAgaWYgKHF1ZXJ5LnNvdXJjZVF1ZXJ5KSByZXR1cm4gcXVlcnkuc291cmNlUXVlcnkudGFibGUuYWNjZXNzb3JOYW1lO1xyXG4gIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBleHRyYWN0IGFjY2Vzc29yIG5hbWUgZnJvbSBxdWVyeVwiKTtcclxufVxyXG5mdW5jdGlvbiBnZXRRdWVyeVdoZXJlQ2xhdXNlKHF1ZXJ5KSB7XHJcbiAgaWYgKHF1ZXJ5LndoZXJlQ2xhdXNlKSByZXR1cm4gcXVlcnkud2hlcmVDbGF1c2U7XHJcbiAgcmV0dXJuIHZvaWQgMDtcclxufVxyXG5cclxuLy8gc3JjL3NlcnZlci92aWV3cy50c1xyXG5mdW5jdGlvbiBtYWtlVmlld0V4cG9ydChjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbikge1xyXG4gIGNvbnN0IHZpZXdFeHBvcnQgPSAoXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHR5cGVzY3JpcHQgaW5jb3JyZWN0bHkgc2F5cyBGdW5jdGlvbiNiaW5kIHJlcXVpcmVzIGFuIGFyZ3VtZW50LlxyXG4gICAgZm4uYmluZCgpXHJcbiAgKTtcclxuICB2aWV3RXhwb3J0W2V4cG9ydENvbnRleHRdID0gY3R4O1xyXG4gIHZpZXdFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdID0gKGN0eDIsIGV4cG9ydE5hbWUpID0+IHtcclxuICAgIHJlZ2lzdGVyVmlldyhjdHgyLCBvcHRzLCBleHBvcnROYW1lLCBmYWxzZSwgcGFyYW1zLCByZXQsIGZuKTtcclxuICB9O1xyXG4gIHJldHVybiB2aWV3RXhwb3J0O1xyXG59XHJcbmZ1bmN0aW9uIG1ha2VBbm9uVmlld0V4cG9ydChjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbikge1xyXG4gIGNvbnN0IHZpZXdFeHBvcnQgPSAoXHJcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHR5cGVzY3JpcHQgaW5jb3JyZWN0bHkgc2F5cyBGdW5jdGlvbiNiaW5kIHJlcXVpcmVzIGFuIGFyZ3VtZW50LlxyXG4gICAgZm4uYmluZCgpXHJcbiAgKTtcclxuICB2aWV3RXhwb3J0W2V4cG9ydENvbnRleHRdID0gY3R4O1xyXG4gIHZpZXdFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdID0gKGN0eDIsIGV4cG9ydE5hbWUpID0+IHtcclxuICAgIHJlZ2lzdGVyVmlldyhjdHgyLCBvcHRzLCBleHBvcnROYW1lLCB0cnVlLCBwYXJhbXMsIHJldCwgZm4pO1xyXG4gIH07XHJcbiAgcmV0dXJuIHZpZXdFeHBvcnQ7XHJcbn1cclxuZnVuY3Rpb24gcmVnaXN0ZXJWaWV3KGN0eCwgb3B0cywgZXhwb3J0TmFtZSwgYW5vbiwgcGFyYW1zLCByZXQsIGZuKSB7XHJcbiAgY29uc3QgcGFyYW1zQnVpbGRlciA9IG5ldyBSb3dCdWlsZGVyKHBhcmFtcywgdG9QYXNjYWxDYXNlKGV4cG9ydE5hbWUpKTtcclxuICBsZXQgcmV0dXJuVHlwZSA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocmV0KS5hbGdlYnJhaWNUeXBlO1xyXG4gIGNvbnN0IHsgdHlwZXNwYWNlIH0gPSBjdHg7XHJcbiAgY29uc3QgeyB2YWx1ZTogcGFyYW1UeXBlIH0gPSBjdHgucmVzb2x2ZVR5cGUoXHJcbiAgICBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHBhcmFtc0J1aWxkZXIpXHJcbiAgKTtcclxuICBjdHgubW9kdWxlRGVmLnZpZXdzLnB1c2goe1xyXG4gICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcclxuICAgIGluZGV4OiAoYW5vbiA/IGN0eC5hbm9uVmlld3MgOiBjdHgudmlld3MpLmxlbmd0aCxcclxuICAgIGlzUHVibGljOiBvcHRzLnB1YmxpYyxcclxuICAgIGlzQW5vbnltb3VzOiBhbm9uLFxyXG4gICAgcGFyYW1zOiBwYXJhbVR5cGUsXHJcbiAgICByZXR1cm5UeXBlXHJcbiAgfSk7XHJcbiAgaWYgKG9wdHMubmFtZSAhPSBudWxsKSB7XHJcbiAgICBjdHgubW9kdWxlRGVmLmV4cGxpY2l0TmFtZXMuZW50cmllcy5wdXNoKHtcclxuICAgICAgdGFnOiBcIkZ1bmN0aW9uXCIsXHJcbiAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcclxuICAgICAgICBjYW5vbmljYWxOYW1lOiBvcHRzLm5hbWVcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGlmIChyZXR1cm5UeXBlLnRhZyA9PSBcIlN1bVwiKSB7XHJcbiAgICBjb25zdCBvcmlnaW5hbEZuID0gZm47XHJcbiAgICBmbiA9ICgoY3R4MiwgYXJncykgPT4ge1xyXG4gICAgICBjb25zdCByZXQyID0gb3JpZ2luYWxGbihjdHgyLCBhcmdzKTtcclxuICAgICAgcmV0dXJuIHJldDIgPT0gbnVsbCA/IFtdIDogW3JldDJdO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm5UeXBlID0gQWxnZWJyYWljVHlwZS5BcnJheShcclxuICAgICAgcmV0dXJuVHlwZS52YWx1ZS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlXHJcbiAgICApO1xyXG4gIH1cclxuICAoYW5vbiA/IGN0eC5hbm9uVmlld3MgOiBjdHgudmlld3MpLnB1c2goe1xyXG4gICAgZm4sXHJcbiAgICBkZXNlcmlhbGl6ZVBhcmFtczogUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcihwYXJhbVR5cGUsIHR5cGVzcGFjZSksXHJcbiAgICBzZXJpYWxpemVSZXR1cm46IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIocmV0dXJuVHlwZSwgdHlwZXNwYWNlKSxcclxuICAgIHJldHVyblR5cGVCYXNlU2l6ZTogYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHJldHVyblR5cGUpXHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIHNyYy9saWIvZXJyb3JzLnRzXHJcbnZhciBTZW5kZXJFcnJvciA9IGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcclxuICAgIHN1cGVyKG1lc3NhZ2UpO1xyXG4gIH1cclxuICBnZXQgbmFtZSgpIHtcclxuICAgIHJldHVybiBcIlNlbmRlckVycm9yXCI7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL3NlcnZlci9lcnJvcnMudHNcclxudmFyIFNwYWNldGltZUhvc3RFcnJvciA9IGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xyXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcclxuICAgIHN1cGVyKG1lc3NhZ2UpO1xyXG4gIH1cclxuICBnZXQgbmFtZSgpIHtcclxuICAgIHJldHVybiBcIlNwYWNldGltZUhvc3RFcnJvclwiO1xyXG4gIH1cclxufTtcclxudmFyIGVycm9yRGF0YSA9IHtcclxuICAvKipcclxuICAgKiBBIGdlbmVyaWMgZXJyb3IgY2xhc3MgZm9yIHVua25vd24gZXJyb3IgY29kZXMuXHJcbiAgICovXHJcbiAgSG9zdENhbGxGYWlsdXJlOiAxLFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhbiBBQkkgY2FsbCB3YXMgbWFkZSBvdXRzaWRlIG9mIGEgdHJhbnNhY3Rpb24uXHJcbiAgICovXHJcbiAgTm90SW5UcmFuc2FjdGlvbjogMixcclxuICAvKipcclxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgQlNBVE4gZGVjb2RpbmcgZmFpbGVkLlxyXG4gICAqIFRoaXMgdHlwaWNhbGx5IG1lYW5zIHRoYXQgdGhlIGRhdGEgY291bGQgbm90IGJlIGRlY29kZWQgdG8gdGhlIGV4cGVjdGVkIHR5cGUuXHJcbiAgICovXHJcbiAgQnNhdG5EZWNvZGVFcnJvcjogMyxcclxuICAvKipcclxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSBzcGVjaWZpZWQgdGFibGUgZG9lcyBub3QgZXhpc3QuXHJcbiAgICovXHJcbiAgTm9TdWNoVGFibGU6IDQsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgc3BlY2lmaWVkIGluZGV4IGRvZXMgbm90IGV4aXN0LlxyXG4gICAqL1xyXG4gIE5vU3VjaEluZGV4OiA1LFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCByb3cgaXRlcmF0b3IgaXMgbm90IHZhbGlkLlxyXG4gICAqL1xyXG4gIE5vU3VjaEl0ZXI6IDYsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgc3BlY2lmaWVkIGNvbnNvbGUgdGltZXIgZG9lcyBub3QgZXhpc3QuXHJcbiAgICovXHJcbiAgTm9TdWNoQ29uc29sZVRpbWVyOiA3LFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCBieXRlcyBzb3VyY2Ugb3Igc2luayBpcyBub3QgdmFsaWQuXHJcbiAgICovXHJcbiAgTm9TdWNoQnl0ZXM6IDgsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgcHJvdmlkZWQgc2luayBoYXMgbm8gbW9yZSBzcGFjZSBsZWZ0LlxyXG4gICAqL1xyXG4gIE5vU3BhY2U6IDksXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IHRoZXJlIGlzIG5vIG1vcmUgc3BhY2UgaW4gdGhlIGRhdGFiYXNlLlxyXG4gICAqL1xyXG4gIEJ1ZmZlclRvb1NtYWxsOiAxMSxcclxuICAvKipcclxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSB2YWx1ZSB3aXRoIGEgZ2l2ZW4gdW5pcXVlIGlkZW50aWZpZXIgYWxyZWFkeSBleGlzdHMuXHJcbiAgICovXHJcbiAgVW5pcXVlQWxyZWFkeUV4aXN0czogMTIsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IHRoZSBzcGVjaWZpZWQgZGVsYXkgaW4gc2NoZWR1bGluZyBhIHJvdyB3YXMgdG9vIGxvbmcuXHJcbiAgICovXHJcbiAgU2NoZWR1bGVBdERlbGF5VG9vTG9uZzogMTMsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGFuIGluZGV4IHdhcyBub3QgdW5pcXVlIHdoZW4gaXQgd2FzIGV4cGVjdGVkIHRvIGJlLlxyXG4gICAqL1xyXG4gIEluZGV4Tm90VW5pcXVlOiAxNCxcclxuICAvKipcclxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gaW5kZXggd2FzIG5vdCB1bmlxdWUgd2hlbiBpdCB3YXMgZXhwZWN0ZWQgdG8gYmUuXHJcbiAgICovXHJcbiAgTm9TdWNoUm93OiAxNSxcclxuICAvKipcclxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gYXV0by1pbmNyZW1lbnQgc2VxdWVuY2UgaGFzIG92ZXJmbG93ZWQuXHJcbiAgICovXHJcbiAgQXV0b0luY092ZXJmbG93OiAxNixcclxuICBXb3VsZEJsb2NrVHJhbnNhY3Rpb246IDE3LFxyXG4gIFRyYW5zYWN0aW9uTm90QW5vbnltb3VzOiAxOCxcclxuICBUcmFuc2FjdGlvbklzUmVhZE9ubHk6IDE5LFxyXG4gIFRyYW5zYWN0aW9uSXNNdXQ6IDIwLFxyXG4gIEh0dHBFcnJvcjogMjFcclxufTtcclxuZnVuY3Rpb24gbWFwRW50cmllcyh4LCBmKSB7XHJcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcclxuICAgIE9iamVjdC5lbnRyaWVzKHgpLm1hcCgoW2ssIHZdKSA9PiBbaywgZihrLCB2KV0pXHJcbiAgKTtcclxufVxyXG52YXIgZXJybm9Ub0NsYXNzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcclxudmFyIGVycm9ycyA9IE9iamVjdC5mcmVlemUoXHJcbiAgbWFwRW50cmllcyhlcnJvckRhdGEsIChuYW1lLCBjb2RlKSA9PiB7XHJcbiAgICBjb25zdCBjbHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoXHJcbiAgICAgIGNsYXNzIGV4dGVuZHMgU3BhY2V0aW1lSG9zdEVycm9yIHtcclxuICAgICAgICBnZXQgbmFtZSgpIHtcclxuICAgICAgICAgIHJldHVybiBuYW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgXCJuYW1lXCIsXHJcbiAgICAgIHsgdmFsdWU6IG5hbWUsIHdyaXRhYmxlOiBmYWxzZSB9XHJcbiAgICApO1xyXG4gICAgZXJybm9Ub0NsYXNzLnNldChjb2RlLCBjbHMpO1xyXG4gICAgcmV0dXJuIGNscztcclxuICB9KVxyXG4pO1xyXG5mdW5jdGlvbiBnZXRFcnJvckNvbnN0cnVjdG9yKGNvZGUpIHtcclxuICByZXR1cm4gZXJybm9Ub0NsYXNzLmdldChjb2RlKSA/PyBTcGFjZXRpbWVIb3N0RXJyb3I7XHJcbn1cclxuXHJcbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wdXJlLXJhbmRANy4wLjEvbm9kZV9tb2R1bGVzL3B1cmUtcmFuZC9saWIvZXNtL2Rpc3RyaWJ1dGlvbi9VbnNhZmVVbmlmb3JtQmlnSW50RGlzdHJpYnV0aW9uLmpzXHJcbnZhciBTQmlnSW50ID0gdHlwZW9mIEJpZ0ludCAhPT0gXCJ1bmRlZmluZWRcIiA/IEJpZ0ludCA6IHZvaWQgMDtcclxudmFyIE9uZSA9IHR5cGVvZiBCaWdJbnQgIT09IFwidW5kZWZpbmVkXCIgPyBCaWdJbnQoMSkgOiB2b2lkIDA7XHJcbnZhciBUaGlydHlUd28gPSB0eXBlb2YgQmlnSW50ICE9PSBcInVuZGVmaW5lZFwiID8gQmlnSW50KDMyKSA6IHZvaWQgMDtcclxudmFyIE51bVZhbHVlcyA9IHR5cGVvZiBCaWdJbnQgIT09IFwidW5kZWZpbmVkXCIgPyBCaWdJbnQoNDI5NDk2NzI5NikgOiB2b2lkIDA7XHJcbmZ1bmN0aW9uIHVuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24oZnJvbSwgdG8sIHJuZykge1xyXG4gIHZhciBkaWZmID0gdG8gLSBmcm9tICsgT25lO1xyXG4gIHZhciBGaW5hbE51bVZhbHVlcyA9IE51bVZhbHVlcztcclxuICB2YXIgTnVtSXRlcmF0aW9ucyA9IDE7XHJcbiAgd2hpbGUgKEZpbmFsTnVtVmFsdWVzIDwgZGlmZikge1xyXG4gICAgRmluYWxOdW1WYWx1ZXMgPDw9IFRoaXJ0eVR3bztcclxuICAgICsrTnVtSXRlcmF0aW9ucztcclxuICB9XHJcbiAgdmFyIHZhbHVlID0gZ2VuZXJhdGVOZXh0KE51bUl0ZXJhdGlvbnMsIHJuZyk7XHJcbiAgaWYgKHZhbHVlIDwgZGlmZikge1xyXG4gICAgcmV0dXJuIHZhbHVlICsgZnJvbTtcclxuICB9XHJcbiAgaWYgKHZhbHVlICsgZGlmZiA8IEZpbmFsTnVtVmFsdWVzKSB7XHJcbiAgICByZXR1cm4gdmFsdWUgJSBkaWZmICsgZnJvbTtcclxuICB9XHJcbiAgdmFyIE1heEFjY2VwdGVkUmFuZG9tID0gRmluYWxOdW1WYWx1ZXMgLSBGaW5hbE51bVZhbHVlcyAlIGRpZmY7XHJcbiAgd2hpbGUgKHZhbHVlID49IE1heEFjY2VwdGVkUmFuZG9tKSB7XHJcbiAgICB2YWx1ZSA9IGdlbmVyYXRlTmV4dChOdW1JdGVyYXRpb25zLCBybmcpO1xyXG4gIH1cclxuICByZXR1cm4gdmFsdWUgJSBkaWZmICsgZnJvbTtcclxufVxyXG5mdW5jdGlvbiBnZW5lcmF0ZU5leHQoTnVtSXRlcmF0aW9ucywgcm5nKSB7XHJcbiAgdmFyIHZhbHVlID0gU0JpZ0ludChybmcudW5zYWZlTmV4dCgpICsgMjE0NzQ4MzY0OCk7XHJcbiAgZm9yICh2YXIgbnVtID0gMTsgbnVtIDwgTnVtSXRlcmF0aW9uczsgKytudW0pIHtcclxuICAgIHZhciBvdXQgPSBybmcudW5zYWZlTmV4dCgpO1xyXG4gICAgdmFsdWUgPSAodmFsdWUgPDwgVGhpcnR5VHdvKSArIFNCaWdJbnQob3V0ICsgMjE0NzQ4MzY0OCk7XHJcbiAgfVxyXG4gIHJldHVybiB2YWx1ZTtcclxufVxyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL2ludGVybmFscy9VbnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uSW50ZXJuYWwuanNcclxuZnVuY3Rpb24gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbkludGVybmFsKHJhbmdlU2l6ZSwgcm5nKSB7XHJcbiAgdmFyIE1heEFsbG93ZWQgPSByYW5nZVNpemUgPiAyID8gfn4oNDI5NDk2NzI5NiAvIHJhbmdlU2l6ZSkgKiByYW5nZVNpemUgOiA0Mjk0OTY3Mjk2O1xyXG4gIHZhciBkZWx0YVYgPSBybmcudW5zYWZlTmV4dCgpICsgMjE0NzQ4MzY0ODtcclxuICB3aGlsZSAoZGVsdGFWID49IE1heEFsbG93ZWQpIHtcclxuICAgIGRlbHRhViA9IHJuZy51bnNhZmVOZXh0KCkgKyAyMTQ3NDgzNjQ4O1xyXG4gIH1cclxuICByZXR1cm4gZGVsdGFWICUgcmFuZ2VTaXplO1xyXG59XHJcblxyXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9kaXN0cmlidXRpb24vaW50ZXJuYWxzL0FycmF5SW50NjQuanNcclxuZnVuY3Rpb24gZnJvbU51bWJlclRvQXJyYXlJbnQ2NChvdXQsIG4pIHtcclxuICBpZiAobiA8IDApIHtcclxuICAgIHZhciBwb3NOID0gLW47XHJcbiAgICBvdXQuc2lnbiA9IC0xO1xyXG4gICAgb3V0LmRhdGFbMF0gPSB+fihwb3NOIC8gNDI5NDk2NzI5Nik7XHJcbiAgICBvdXQuZGF0YVsxXSA9IHBvc04gPj4+IDA7XHJcbiAgfSBlbHNlIHtcclxuICAgIG91dC5zaWduID0gMTtcclxuICAgIG91dC5kYXRhWzBdID0gfn4obiAvIDQyOTQ5NjcyOTYpO1xyXG4gICAgb3V0LmRhdGFbMV0gPSBuID4+PiAwO1xyXG4gIH1cclxuICByZXR1cm4gb3V0O1xyXG59XHJcbmZ1bmN0aW9uIHN1YnN0cmFjdEFycmF5SW50NjQob3V0LCBhcnJheUludEEsIGFycmF5SW50Qikge1xyXG4gIHZhciBsb3dBID0gYXJyYXlJbnRBLmRhdGFbMV07XHJcbiAgdmFyIGhpZ2hBID0gYXJyYXlJbnRBLmRhdGFbMF07XHJcbiAgdmFyIHNpZ25BID0gYXJyYXlJbnRBLnNpZ247XHJcbiAgdmFyIGxvd0IgPSBhcnJheUludEIuZGF0YVsxXTtcclxuICB2YXIgaGlnaEIgPSBhcnJheUludEIuZGF0YVswXTtcclxuICB2YXIgc2lnbkIgPSBhcnJheUludEIuc2lnbjtcclxuICBvdXQuc2lnbiA9IDE7XHJcbiAgaWYgKHNpZ25BID09PSAxICYmIHNpZ25CID09PSAtMSkge1xyXG4gICAgdmFyIGxvd18xID0gbG93QSArIGxvd0I7XHJcbiAgICB2YXIgaGlnaCA9IGhpZ2hBICsgaGlnaEIgKyAobG93XzEgPiA0Mjk0OTY3Mjk1ID8gMSA6IDApO1xyXG4gICAgb3V0LmRhdGFbMF0gPSBoaWdoID4+PiAwO1xyXG4gICAgb3V0LmRhdGFbMV0gPSBsb3dfMSA+Pj4gMDtcclxuICAgIHJldHVybiBvdXQ7XHJcbiAgfVxyXG4gIHZhciBsb3dGaXJzdCA9IGxvd0E7XHJcbiAgdmFyIGhpZ2hGaXJzdCA9IGhpZ2hBO1xyXG4gIHZhciBsb3dTZWNvbmQgPSBsb3dCO1xyXG4gIHZhciBoaWdoU2Vjb25kID0gaGlnaEI7XHJcbiAgaWYgKHNpZ25BID09PSAtMSkge1xyXG4gICAgbG93Rmlyc3QgPSBsb3dCO1xyXG4gICAgaGlnaEZpcnN0ID0gaGlnaEI7XHJcbiAgICBsb3dTZWNvbmQgPSBsb3dBO1xyXG4gICAgaGlnaFNlY29uZCA9IGhpZ2hBO1xyXG4gIH1cclxuICB2YXIgcmVtaW5kZXJMb3cgPSAwO1xyXG4gIHZhciBsb3cgPSBsb3dGaXJzdCAtIGxvd1NlY29uZDtcclxuICBpZiAobG93IDwgMCkge1xyXG4gICAgcmVtaW5kZXJMb3cgPSAxO1xyXG4gICAgbG93ID0gbG93ID4+PiAwO1xyXG4gIH1cclxuICBvdXQuZGF0YVswXSA9IGhpZ2hGaXJzdCAtIGhpZ2hTZWNvbmQgLSByZW1pbmRlckxvdztcclxuICBvdXQuZGF0YVsxXSA9IGxvdztcclxuICByZXR1cm4gb3V0O1xyXG59XHJcblxyXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9kaXN0cmlidXRpb24vaW50ZXJuYWxzL1Vuc2FmZVVuaWZvcm1BcnJheUludERpc3RyaWJ1dGlvbkludGVybmFsLmpzXHJcbmZ1bmN0aW9uIHVuc2FmZVVuaWZvcm1BcnJheUludERpc3RyaWJ1dGlvbkludGVybmFsKG91dCwgcmFuZ2VTaXplLCBybmcpIHtcclxuICB2YXIgcmFuZ2VMZW5ndGggPSByYW5nZVNpemUubGVuZ3RoO1xyXG4gIHdoaWxlICh0cnVlKSB7XHJcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4ICE9PSByYW5nZUxlbmd0aDsgKytpbmRleCkge1xyXG4gICAgICB2YXIgaW5kZXhSYW5nZVNpemUgPSBpbmRleCA9PT0gMCA/IHJhbmdlU2l6ZVswXSArIDEgOiA0Mjk0OTY3Mjk2O1xyXG4gICAgICB2YXIgZyA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb25JbnRlcm5hbChpbmRleFJhbmdlU2l6ZSwgcm5nKTtcclxuICAgICAgb3V0W2luZGV4XSA9IGc7XHJcbiAgICB9XHJcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4ICE9PSByYW5nZUxlbmd0aDsgKytpbmRleCkge1xyXG4gICAgICB2YXIgY3VycmVudCA9IG91dFtpbmRleF07XHJcbiAgICAgIHZhciBjdXJyZW50SW5SYW5nZSA9IHJhbmdlU2l6ZVtpbmRleF07XHJcbiAgICAgIGlmIChjdXJyZW50IDwgY3VycmVudEluUmFuZ2UpIHtcclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnQgPiBjdXJyZW50SW5SYW5nZSkge1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9kaXN0cmlidXRpb24vVW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbi5qc1xyXG52YXIgc2FmZU51bWJlck1heFNhZmVJbnRlZ2VyID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XHJcbnZhciBzaGFyZWRBID0geyBzaWduOiAxLCBkYXRhOiBbMCwgMF0gfTtcclxudmFyIHNoYXJlZEIgPSB7IHNpZ246IDEsIGRhdGE6IFswLCAwXSB9O1xyXG52YXIgc2hhcmVkQyA9IHsgc2lnbjogMSwgZGF0YTogWzAsIDBdIH07XHJcbnZhciBzaGFyZWREYXRhID0gWzAsIDBdO1xyXG5mdW5jdGlvbiB1bmlmb3JtTGFyZ2VJbnRJbnRlcm5hbChmcm9tLCB0bywgcmFuZ2VTaXplLCBybmcpIHtcclxuICB2YXIgcmFuZ2VTaXplQXJyYXlJbnRWYWx1ZSA9IHJhbmdlU2l6ZSA8PSBzYWZlTnVtYmVyTWF4U2FmZUludGVnZXIgPyBmcm9tTnVtYmVyVG9BcnJheUludDY0KHNoYXJlZEMsIHJhbmdlU2l6ZSkgOiBzdWJzdHJhY3RBcnJheUludDY0KHNoYXJlZEMsIGZyb21OdW1iZXJUb0FycmF5SW50NjQoc2hhcmVkQSwgdG8pLCBmcm9tTnVtYmVyVG9BcnJheUludDY0KHNoYXJlZEIsIGZyb20pKTtcclxuICBpZiAocmFuZ2VTaXplQXJyYXlJbnRWYWx1ZS5kYXRhWzFdID09PSA0Mjk0OTY3Mjk1KSB7XHJcbiAgICByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMF0gKz0gMTtcclxuICAgIHJhbmdlU2l6ZUFycmF5SW50VmFsdWUuZGF0YVsxXSA9IDA7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJhbmdlU2l6ZUFycmF5SW50VmFsdWUuZGF0YVsxXSArPSAxO1xyXG4gIH1cclxuICB1bnNhZmVVbmlmb3JtQXJyYXlJbnREaXN0cmlidXRpb25JbnRlcm5hbChzaGFyZWREYXRhLCByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGEsIHJuZyk7XHJcbiAgcmV0dXJuIHNoYXJlZERhdGFbMF0gKiA0Mjk0OTY3Mjk2ICsgc2hhcmVkRGF0YVsxXSArIGZyb207XHJcbn1cclxuZnVuY3Rpb24gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbihmcm9tLCB0bywgcm5nKSB7XHJcbiAgdmFyIHJhbmdlU2l6ZSA9IHRvIC0gZnJvbTtcclxuICBpZiAocmFuZ2VTaXplIDw9IDQyOTQ5NjcyOTUpIHtcclxuICAgIHZhciBnID0gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbkludGVybmFsKHJhbmdlU2l6ZSArIDEsIHJuZyk7XHJcbiAgICByZXR1cm4gZyArIGZyb207XHJcbiAgfVxyXG4gIHJldHVybiB1bmlmb3JtTGFyZ2VJbnRJbnRlcm5hbChmcm9tLCB0bywgcmFuZ2VTaXplLCBybmcpO1xyXG59XHJcblxyXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9nZW5lcmF0b3IvWG9yb1NoaXJvLmpzXHJcbnZhciBYb3JvU2hpcm8xMjhQbHVzID0gKGZ1bmN0aW9uKCkge1xyXG4gIGZ1bmN0aW9uIFhvcm9TaGlybzEyOFBsdXMyKHMwMSwgczAwLCBzMTEsIHMxMCkge1xyXG4gICAgdGhpcy5zMDEgPSBzMDE7XHJcbiAgICB0aGlzLnMwMCA9IHMwMDtcclxuICAgIHRoaXMuczExID0gczExO1xyXG4gICAgdGhpcy5zMTAgPSBzMTA7XHJcbiAgfVxyXG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIG5ldyBYb3JvU2hpcm8xMjhQbHVzMih0aGlzLnMwMSwgdGhpcy5zMDAsIHRoaXMuczExLCB0aGlzLnMxMCk7XHJcbiAgfTtcclxuICBYb3JvU2hpcm8xMjhQbHVzMi5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG5leHRSbmcgPSBuZXcgWG9yb1NoaXJvMTI4UGx1czIodGhpcy5zMDEsIHRoaXMuczAwLCB0aGlzLnMxMSwgdGhpcy5zMTApO1xyXG4gICAgdmFyIG91dCA9IG5leHRSbmcudW5zYWZlTmV4dCgpO1xyXG4gICAgcmV0dXJuIFtvdXQsIG5leHRSbmddO1xyXG4gIH07XHJcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLnVuc2FmZU5leHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBvdXQgPSB0aGlzLnMwMCArIHRoaXMuczEwIHwgMDtcclxuICAgIHZhciBhMCA9IHRoaXMuczEwIF4gdGhpcy5zMDA7XHJcbiAgICB2YXIgYTEgPSB0aGlzLnMxMSBeIHRoaXMuczAxO1xyXG4gICAgdmFyIHMwMCA9IHRoaXMuczAwO1xyXG4gICAgdmFyIHMwMSA9IHRoaXMuczAxO1xyXG4gICAgdGhpcy5zMDAgPSBzMDAgPDwgMjQgXiBzMDEgPj4+IDggXiBhMCBeIGEwIDw8IDE2O1xyXG4gICAgdGhpcy5zMDEgPSBzMDEgPDwgMjQgXiBzMDAgPj4+IDggXiBhMSBeIChhMSA8PCAxNiB8IGEwID4+PiAxNik7XHJcbiAgICB0aGlzLnMxMCA9IGExIDw8IDUgXiBhMCA+Pj4gMjc7XHJcbiAgICB0aGlzLnMxMSA9IGEwIDw8IDUgXiBhMSA+Pj4gMjc7XHJcbiAgICByZXR1cm4gb3V0O1xyXG4gIH07XHJcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLmp1bXAgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBuZXh0Um5nID0gbmV3IFhvcm9TaGlybzEyOFBsdXMyKHRoaXMuczAxLCB0aGlzLnMwMCwgdGhpcy5zMTEsIHRoaXMuczEwKTtcclxuICAgIG5leHRSbmcudW5zYWZlSnVtcCgpO1xyXG4gICAgcmV0dXJuIG5leHRSbmc7XHJcbiAgfTtcclxuICBYb3JvU2hpcm8xMjhQbHVzMi5wcm90b3R5cGUudW5zYWZlSnVtcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIG5zMDEgPSAwO1xyXG4gICAgdmFyIG5zMDAgPSAwO1xyXG4gICAgdmFyIG5zMTEgPSAwO1xyXG4gICAgdmFyIG5zMTAgPSAwO1xyXG4gICAgdmFyIGp1bXAgPSBbMzYzOTk1NjY0NSwgMzc1MDc1NzAxMiwgMTI2MTU2ODUwOCwgMzg2NDI2MzM1XTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpICE9PSA0OyArK2kpIHtcclxuICAgICAgZm9yICh2YXIgbWFzayA9IDE7IG1hc2s7IG1hc2sgPDw9IDEpIHtcclxuICAgICAgICBpZiAoanVtcFtpXSAmIG1hc2spIHtcclxuICAgICAgICAgIG5zMDEgXj0gdGhpcy5zMDE7XHJcbiAgICAgICAgICBuczAwIF49IHRoaXMuczAwO1xyXG4gICAgICAgICAgbnMxMSBePSB0aGlzLnMxMTtcclxuICAgICAgICAgIG5zMTAgXj0gdGhpcy5zMTA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudW5zYWZlTmV4dCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnMwMSA9IG5zMDE7XHJcbiAgICB0aGlzLnMwMCA9IG5zMDA7XHJcbiAgICB0aGlzLnMxMSA9IG5zMTE7XHJcbiAgICB0aGlzLnMxMCA9IG5zMTA7XHJcbiAgfTtcclxuICBYb3JvU2hpcm8xMjhQbHVzMi5wcm90b3R5cGUuZ2V0U3RhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBbdGhpcy5zMDEsIHRoaXMuczAwLCB0aGlzLnMxMSwgdGhpcy5zMTBdO1xyXG4gIH07XHJcbiAgcmV0dXJuIFhvcm9TaGlybzEyOFBsdXMyO1xyXG59KSgpO1xyXG5mdW5jdGlvbiBmcm9tU3RhdGUoc3RhdGUpIHtcclxuICB2YXIgdmFsaWQgPSBzdGF0ZS5sZW5ndGggPT09IDQ7XHJcbiAgaWYgKCF2YWxpZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHN0YXRlIG11c3QgaGF2ZSBiZWVuIHByb2R1Y2VkIGJ5IGEgeG9yb3NoaXJvMTI4cGx1cyBSYW5kb21HZW5lcmF0b3JcIik7XHJcbiAgfVxyXG4gIHJldHVybiBuZXcgWG9yb1NoaXJvMTI4UGx1cyhzdGF0ZVswXSwgc3RhdGVbMV0sIHN0YXRlWzJdLCBzdGF0ZVszXSk7XHJcbn1cclxudmFyIHhvcm9zaGlybzEyOHBsdXMgPSBPYmplY3QuYXNzaWduKGZ1bmN0aW9uKHNlZWQpIHtcclxuICByZXR1cm4gbmV3IFhvcm9TaGlybzEyOFBsdXMoLTEsIH5zZWVkLCBzZWVkIHwgMCwgMCk7XHJcbn0sIHsgZnJvbVN0YXRlIH0pO1xyXG5cclxuLy8gc3JjL3NlcnZlci9ybmcudHNcclxudmFyIHsgYXNVaW50TiB9ID0gQmlnSW50O1xyXG5mdW5jdGlvbiBwY2czMihzdGF0ZSkge1xyXG4gIGNvbnN0IE1VTCA9IDYzNjQxMzYyMjM4NDY3OTMwMDVuO1xyXG4gIGNvbnN0IElOQyA9IDExNjM0NTgwMDI3NDYyMjYwNzIzbjtcclxuICBzdGF0ZSA9IGFzVWludE4oNjQsIHN0YXRlICogTVVMICsgSU5DKTtcclxuICBjb25zdCB4b3JzaGlmdGVkID0gTnVtYmVyKGFzVWludE4oMzIsIChzdGF0ZSA+PiAxOG4gXiBzdGF0ZSkgPj4gMjduKSk7XHJcbiAgY29uc3Qgcm90ID0gTnVtYmVyKGFzVWludE4oMzIsIHN0YXRlID4+IDU5bikpO1xyXG4gIHJldHVybiB4b3JzaGlmdGVkID4+IHJvdCB8IHhvcnNoaWZ0ZWQgPDwgMzIgLSByb3Q7XHJcbn1cclxuZnVuY3Rpb24gZ2VuZXJhdGVGbG9hdDY0KHJuZykge1xyXG4gIGNvbnN0IGcxID0gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbigwLCAoMSA8PCAyNikgLSAxLCBybmcpO1xyXG4gIGNvbnN0IGcyID0gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbigwLCAoMSA8PCAyNykgLSAxLCBybmcpO1xyXG4gIGNvbnN0IHZhbHVlID0gKGcxICogTWF0aC5wb3coMiwgMjcpICsgZzIpICogTWF0aC5wb3coMiwgLTUzKTtcclxuICByZXR1cm4gdmFsdWU7XHJcbn1cclxuZnVuY3Rpb24gbWFrZVJhbmRvbShzZWVkKSB7XHJcbiAgY29uc3Qgcm5nID0geG9yb3NoaXJvMTI4cGx1cyhwY2czMihzZWVkLm1pY3Jvc1NpbmNlVW5peEVwb2NoKSk7XHJcbiAgY29uc3QgcmFuZG9tID0gKCkgPT4gZ2VuZXJhdGVGbG9hdDY0KHJuZyk7XHJcbiAgcmFuZG9tLmZpbGwgPSAoYXJyYXkpID0+IHtcclxuICAgIGNvbnN0IGVsZW0gPSBhcnJheS5hdCgwKTtcclxuICAgIGlmICh0eXBlb2YgZWxlbSA9PT0gXCJiaWdpbnRcIikge1xyXG4gICAgICBjb25zdCB1cHBlciA9ICgxbiA8PCBCaWdJbnQoYXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiA4KSkgLSAxbjtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFycmF5W2ldID0gdW5zYWZlVW5pZm9ybUJpZ0ludERpc3RyaWJ1dGlvbigwbiwgdXBwZXIsIHJuZyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVsZW0gPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgY29uc3QgdXBwZXIgPSAoMSA8PCBhcnJheS5CWVRFU19QRVJfRUxFTUVOVCAqIDgpIC0gMTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGFycmF5W2ldID0gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbigwLCB1cHBlciwgcm5nKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFycmF5O1xyXG4gIH07XHJcbiAgcmFuZG9tLnVpbnQzMiA9ICgpID0+IHJuZy51bnNhZmVOZXh0KCk7XHJcbiAgcmFuZG9tLmludGVnZXJJblJhbmdlID0gKG1pbiwgbWF4KSA9PiB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uKG1pbiwgbWF4LCBybmcpO1xyXG4gIHJhbmRvbS5iaWdpbnRJblJhbmdlID0gKG1pbiwgbWF4KSA9PiB1bnNhZmVVbmlmb3JtQmlnSW50RGlzdHJpYnV0aW9uKG1pbiwgbWF4LCBybmcpO1xyXG4gIHJldHVybiByYW5kb207XHJcbn1cclxuXHJcbi8vIHNyYy9zZXJ2ZXIvcnVudGltZS50c1xyXG52YXIgeyBmcmVlemUgfSA9IE9iamVjdDtcclxudmFyIHN5cyA9IF9zeXNjYWxsczJfMDtcclxuZnVuY3Rpb24gcGFyc2VKc29uT2JqZWN0KGpzb24pIHtcclxuICBsZXQgdmFsdWU7XHJcbiAgdHJ5IHtcclxuICAgIHZhbHVlID0gSlNPTi5wYXJzZShqc29uKTtcclxuICB9IGNhdGNoIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgSlNPTjogZmFpbGVkIHRvIHBhcnNlIHN0cmluZ1wiKTtcclxuICB9XHJcbiAgaWYgKHZhbHVlID09PSBudWxsIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiRXhwZWN0ZWQgYSBKU09OIG9iamVjdCBhdCB0aGUgdG9wIGxldmVsXCIpO1xyXG4gIH1cclxuICByZXR1cm4gdmFsdWU7XHJcbn1cclxudmFyIEp3dENsYWltc0ltcGwgPSBjbGFzcyB7XHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBKd3RDbGFpbXMgaW5zdGFuY2UuXHJcbiAgICogQHBhcmFtIHJhd1BheWxvYWQgVGhlIEpXVCBwYXlsb2FkIGFzIGEgcmF3IEpTT04gc3RyaW5nLlxyXG4gICAqIEBwYXJhbSBpZGVudGl0eSBUaGUgaWRlbnRpdHkgZm9yIHRoaXMgSldULiBXZSBhcmUgb25seSB0YWtpbmcgdGhpcyBiZWNhdXNlIHdlIGRvbid0IGhhdmUgYSBibGFrZTMgaW1wbGVtZW50YXRpb24gKHdoaWNoIHdlIG5lZWQgdG8gY29tcHV0ZSBpdCkuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IocmF3UGF5bG9hZCwgaWRlbnRpdHkpIHtcclxuICAgIHRoaXMucmF3UGF5bG9hZCA9IHJhd1BheWxvYWQ7XHJcbiAgICB0aGlzLmZ1bGxQYXlsb2FkID0gcGFyc2VKc29uT2JqZWN0KHJhd1BheWxvYWQpO1xyXG4gICAgdGhpcy5faWRlbnRpdHkgPSBpZGVudGl0eTtcclxuICB9XHJcbiAgZnVsbFBheWxvYWQ7XHJcbiAgX2lkZW50aXR5O1xyXG4gIGdldCBpZGVudGl0eSgpIHtcclxuICAgIHJldHVybiB0aGlzLl9pZGVudGl0eTtcclxuICB9XHJcbiAgZ2V0IHN1YmplY3QoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mdWxsUGF5bG9hZFtcInN1YlwiXTtcclxuICB9XHJcbiAgZ2V0IGlzc3VlcigpIHtcclxuICAgIHJldHVybiB0aGlzLmZ1bGxQYXlsb2FkW1wiaXNzXCJdO1xyXG4gIH1cclxuICBnZXQgYXVkaWVuY2UoKSB7XHJcbiAgICBjb25zdCBhdWQgPSB0aGlzLmZ1bGxQYXlsb2FkW1wiYXVkXCJdO1xyXG4gICAgaWYgKGF1ZCA9PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiBbXTtcclxuICAgIH1cclxuICAgIHJldHVybiB0eXBlb2YgYXVkID09PSBcInN0cmluZ1wiID8gW2F1ZF0gOiBhdWQ7XHJcbiAgfVxyXG59O1xyXG52YXIgQXV0aEN0eEltcGwgPSBjbGFzcyBfQXV0aEN0eEltcGwge1xyXG4gIGlzSW50ZXJuYWw7XHJcbiAgLy8gU291cmNlIG9mIHRoZSBKV1QgcGF5bG9hZCBzdHJpbmcsIGlmIHRoZXJlIGlzIG9uZS5cclxuICBfand0U291cmNlO1xyXG4gIC8vIFdoZXRoZXIgd2UgaGF2ZSBpbml0aWFsaXplZCB0aGUgSldUIGNsYWltcy5cclxuICBfaW5pdGlhbGl6ZWRKV1QgPSBmYWxzZTtcclxuICBfand0Q2xhaW1zO1xyXG4gIF9zZW5kZXJJZGVudGl0eTtcclxuICBjb25zdHJ1Y3RvcihvcHRzKSB7XHJcbiAgICB0aGlzLmlzSW50ZXJuYWwgPSBvcHRzLmlzSW50ZXJuYWw7XHJcbiAgICB0aGlzLl9qd3RTb3VyY2UgPSBvcHRzLmp3dFNvdXJjZTtcclxuICAgIHRoaXMuX3NlbmRlcklkZW50aXR5ID0gb3B0cy5zZW5kZXJJZGVudGl0eTtcclxuICB9XHJcbiAgX2luaXRpYWxpemVKV1QoKSB7XHJcbiAgICBpZiAodGhpcy5faW5pdGlhbGl6ZWRKV1QpIHJldHVybjtcclxuICAgIHRoaXMuX2luaXRpYWxpemVkSldUID0gdHJ1ZTtcclxuICAgIGNvbnN0IHRva2VuID0gdGhpcy5fand0U291cmNlKCk7XHJcbiAgICBpZiAoIXRva2VuKSB7XHJcbiAgICAgIHRoaXMuX2p3dENsYWltcyA9IG51bGw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9qd3RDbGFpbXMgPSBuZXcgSnd0Q2xhaW1zSW1wbCh0b2tlbiwgdGhpcy5fc2VuZGVySWRlbnRpdHkpO1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcclxuICB9XHJcbiAgLyoqIExhemlseSBjb21wdXRlIHdoZXRoZXIgYSBKV1QgZXhpc3RzIGFuZCBpcyBwYXJzZWFibGUuICovXHJcbiAgZ2V0IGhhc0pXVCgpIHtcclxuICAgIHRoaXMuX2luaXRpYWxpemVKV1QoKTtcclxuICAgIHJldHVybiB0aGlzLl9qd3RDbGFpbXMgIT09IG51bGw7XHJcbiAgfVxyXG4gIC8qKiBMYXppbHkgcGFyc2UgdGhlIEp3dENsYWltcyBvbmx5IHdoZW4gYWNjZXNzZWQuICovXHJcbiAgZ2V0IGp3dCgpIHtcclxuICAgIHRoaXMuX2luaXRpYWxpemVKV1QoKTtcclxuICAgIHJldHVybiB0aGlzLl9qd3RDbGFpbXM7XHJcbiAgfVxyXG4gIC8qKiBDcmVhdGUgYSBjb250ZXh0IHJlcHJlc2VudGluZyBpbnRlcm5hbCAobm9uLXVzZXIpIHJlcXVlc3RzLiAqL1xyXG4gIHN0YXRpYyBpbnRlcm5hbCgpIHtcclxuICAgIHJldHVybiBuZXcgX0F1dGhDdHhJbXBsKHtcclxuICAgICAgaXNJbnRlcm5hbDogdHJ1ZSxcclxuICAgICAgand0U291cmNlOiAoKSA9PiBudWxsLFxyXG4gICAgICBzZW5kZXJJZGVudGl0eTogSWRlbnRpdHkuemVybygpXHJcbiAgICB9KTtcclxuICB9XHJcbiAgLyoqIElmIHRoZXJlIGlzIGEgY29ubmVjdGlvbiBpZCwgbG9vayB1cCB0aGUgSldUIHBheWxvYWQgZnJvbSB0aGUgc3lzdGVtIHRhYmxlcy4gKi9cclxuICBzdGF0aWMgZnJvbVN5c3RlbVRhYmxlcyhjb25uZWN0aW9uSWQsIHNlbmRlcikge1xyXG4gICAgaWYgKGNvbm5lY3Rpb25JZCA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gbmV3IF9BdXRoQ3R4SW1wbCh7XHJcbiAgICAgICAgaXNJbnRlcm5hbDogZmFsc2UsXHJcbiAgICAgICAgand0U291cmNlOiAoKSA9PiBudWxsLFxyXG4gICAgICAgIHNlbmRlcklkZW50aXR5OiBzZW5kZXJcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IF9BdXRoQ3R4SW1wbCh7XHJcbiAgICAgIGlzSW50ZXJuYWw6IGZhbHNlLFxyXG4gICAgICBqd3RTb3VyY2U6ICgpID0+IHtcclxuICAgICAgICBjb25zdCBwYXlsb2FkQnVmID0gc3lzLmdldF9qd3RfcGF5bG9hZChjb25uZWN0aW9uSWQuX19jb25uZWN0aW9uX2lkX18pO1xyXG4gICAgICAgIGlmIChwYXlsb2FkQnVmLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY29uc3QgcGF5bG9hZFN0ciA9IG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwYXlsb2FkQnVmKTtcclxuICAgICAgICByZXR1cm4gcGF5bG9hZFN0cjtcclxuICAgICAgfSxcclxuICAgICAgc2VuZGVySWRlbnRpdHk6IHNlbmRlclxyXG4gICAgfSk7XHJcbiAgfVxyXG59O1xyXG52YXIgUmVkdWNlckN0eEltcGwgPSBjbGFzcyBSZWR1Y2VyQ3R4IHtcclxuICAjaWRlbnRpdHk7XHJcbiAgI3NlbmRlckF1dGg7XHJcbiAgI3V1aWRDb3VudGVyO1xyXG4gICNyYW5kb207XHJcbiAgc2VuZGVyO1xyXG4gIHRpbWVzdGFtcDtcclxuICBjb25uZWN0aW9uSWQ7XHJcbiAgZGI7XHJcbiAgY29uc3RydWN0b3Ioc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCwgZGJWaWV3KSB7XHJcbiAgICBPYmplY3Quc2VhbCh0aGlzKTtcclxuICAgIHRoaXMuc2VuZGVyID0gc2VuZGVyO1xyXG4gICAgdGhpcy50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XHJcbiAgICB0aGlzLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcclxuICAgIHRoaXMuZGIgPSBkYlZpZXc7XHJcbiAgfVxyXG4gIC8qKiBSZXNldCB0aGUgYFJlZHVjZXJDdHhgIHRvIGJlIHVzZWQgZm9yIGEgbmV3IHRyYW5zYWN0aW9uICovXHJcbiAgc3RhdGljIHJlc2V0KG1lLCBzZW5kZXIsIHRpbWVzdGFtcCwgY29ubmVjdGlvbklkKSB7XHJcbiAgICBtZS5zZW5kZXIgPSBzZW5kZXI7XHJcbiAgICBtZS50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XHJcbiAgICBtZS5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XHJcbiAgICBtZS4jdXVpZENvdW50ZXIgPSB2b2lkIDA7XHJcbiAgICBtZS4jc2VuZGVyQXV0aCA9IHZvaWQgMDtcclxuICB9XHJcbiAgZ2V0IGlkZW50aXR5KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI2lkZW50aXR5ID8/PSBuZXcgSWRlbnRpdHkoc3lzLmlkZW50aXR5KCkpO1xyXG4gIH1cclxuICBnZXQgc2VuZGVyQXV0aCgpIHtcclxuICAgIHJldHVybiB0aGlzLiNzZW5kZXJBdXRoID8/PSBBdXRoQ3R4SW1wbC5mcm9tU3lzdGVtVGFibGVzKFxyXG4gICAgICB0aGlzLmNvbm5lY3Rpb25JZCxcclxuICAgICAgdGhpcy5zZW5kZXJcclxuICAgICk7XHJcbiAgfVxyXG4gIGdldCByYW5kb20oKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jcmFuZG9tID8/PSBtYWtlUmFuZG9tKHRoaXMudGltZXN0YW1wKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgbmV3IHJhbmRvbSB7QGxpbmsgVXVpZH0gYHY0YCB1c2luZyB0aGlzIGBSZWR1Y2VyQ3R4YCdzIFJORy5cclxuICAgKi9cclxuICBuZXdVdWlkVjQoKSB7XHJcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoMTYpKTtcclxuICAgIHJldHVybiBVdWlkLmZyb21SYW5kb21CeXRlc1Y0KGJ5dGVzKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgbmV3IHNvcnRhYmxlIHtAbGluayBVdWlkfSBgdjdgIHVzaW5nIHRoaXMgYFJlZHVjZXJDdHhgJ3MgUk5HLCBjb3VudGVyLFxyXG4gICAqIGFuZCB0aW1lc3RhbXAuXHJcbiAgICovXHJcbiAgbmV3VXVpZFY3KCkge1xyXG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnJhbmRvbS5maWxsKG5ldyBVaW50OEFycmF5KDQpKTtcclxuICAgIGNvbnN0IGNvdW50ZXIgPSB0aGlzLiN1dWlkQ291bnRlciA/Pz0geyB2YWx1ZTogMCB9O1xyXG4gICAgcmV0dXJuIFV1aWQuZnJvbUNvdW50ZXJWNyhjb3VudGVyLCB0aGlzLnRpbWVzdGFtcCwgYnl0ZXMpO1xyXG4gIH1cclxufTtcclxudmFyIGNhbGxVc2VyRnVuY3Rpb24gPSBmdW5jdGlvbiBfX3NwYWNldGltZWRiX2VuZF9zaG9ydF9iYWNrdHJhY2UoZm4sIC4uLmFyZ3MpIHtcclxuICByZXR1cm4gZm4oLi4uYXJncyk7XHJcbn07XHJcbnZhciBtYWtlSG9va3MgPSAoc2NoZW1hMikgPT4gbmV3IE1vZHVsZUhvb2tzSW1wbChzY2hlbWEyKTtcclxudmFyIE1vZHVsZUhvb2tzSW1wbCA9IGNsYXNzIHtcclxuICAjc2NoZW1hO1xyXG4gICNkYlZpZXdfO1xyXG4gICNyZWR1Y2VyQXJnc0Rlc2VyaWFsaXplcnM7XHJcbiAgLyoqIENhY2hlIHRoZSBgUmVkdWNlckN0eGAgb2JqZWN0IHRvIGF2b2lkIGFsbG9jYXRpbmcgYW5ldyBmb3IgZXZlciByZWR1Y2VyIGNhbGwuICovXHJcbiAgI3JlZHVjZXJDdHhfO1xyXG4gIGNvbnN0cnVjdG9yKHNjaGVtYTIpIHtcclxuICAgIHRoaXMuI3NjaGVtYSA9IHNjaGVtYTI7XHJcbiAgICB0aGlzLiNyZWR1Y2VyQXJnc0Rlc2VyaWFsaXplcnMgPSBzY2hlbWEyLm1vZHVsZURlZi5yZWR1Y2Vycy5tYXAoXHJcbiAgICAgICh7IHBhcmFtcyB9KSA9PiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHBhcmFtcywgc2NoZW1hMi50eXBlc3BhY2UpXHJcbiAgICApO1xyXG4gIH1cclxuICBnZXQgI2RiVmlldygpIHtcclxuICAgIHJldHVybiB0aGlzLiNkYlZpZXdfID8/PSBmcmVlemUoXHJcbiAgICAgIE9iamVjdC5mcm9tRW50cmllcyhcclxuICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMuI3NjaGVtYS5zY2hlbWFUeXBlLnRhYmxlcykubWFwKCh0YWJsZTIpID0+IFtcclxuICAgICAgICAgIHRhYmxlMi5hY2Nlc3Nvck5hbWUsXHJcbiAgICAgICAgICBtYWtlVGFibGVWaWV3KHRoaXMuI3NjaGVtYS50eXBlc3BhY2UsIHRhYmxlMi50YWJsZURlZilcclxuICAgICAgICBdKVxyXG4gICAgICApXHJcbiAgICApO1xyXG4gIH1cclxuICBnZXQgI3JlZHVjZXJDdHgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jcmVkdWNlckN0eF8gPz89IG5ldyBSZWR1Y2VyQ3R4SW1wbChcclxuICAgICAgSWRlbnRpdHkuemVybygpLFxyXG4gICAgICBUaW1lc3RhbXAuVU5JWF9FUE9DSCxcclxuICAgICAgbnVsbCxcclxuICAgICAgdGhpcy4jZGJWaWV3XHJcbiAgICApO1xyXG4gIH1cclxuICBfX2Rlc2NyaWJlX21vZHVsZV9fKCkge1xyXG4gICAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigxMjgpO1xyXG4gICAgUmF3TW9kdWxlRGVmLnNlcmlhbGl6ZShcclxuICAgICAgd3JpdGVyLFxyXG4gICAgICBSYXdNb2R1bGVEZWYuVjEwKHRoaXMuI3NjaGVtYS5yYXdNb2R1bGVEZWZWMTAoKSlcclxuICAgICk7XHJcbiAgICByZXR1cm4gd3JpdGVyLmdldEJ1ZmZlcigpO1xyXG4gIH1cclxuICBfX2dldF9lcnJvcl9jb25zdHJ1Y3Rvcl9fKGNvZGUpIHtcclxuICAgIHJldHVybiBnZXRFcnJvckNvbnN0cnVjdG9yKGNvZGUpO1xyXG4gIH1cclxuICBnZXQgX19zZW5kZXJfZXJyb3JfY2xhc3NfXygpIHtcclxuICAgIHJldHVybiBTZW5kZXJFcnJvcjtcclxuICB9XHJcbiAgX19jYWxsX3JlZHVjZXJfXyhyZWR1Y2VySWQsIHNlbmRlciwgY29ubklkLCB0aW1lc3RhbXAsIGFyZ3NCdWYpIHtcclxuICAgIGNvbnN0IG1vZHVsZUN0eCA9IHRoaXMuI3NjaGVtYTtcclxuICAgIGNvbnN0IGRlc2VyaWFsaXplQXJncyA9IHRoaXMuI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVyc1tyZWR1Y2VySWRdO1xyXG4gICAgQklOQVJZX1JFQURFUi5yZXNldChhcmdzQnVmKTtcclxuICAgIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZUFyZ3MoQklOQVJZX1JFQURFUik7XHJcbiAgICBjb25zdCBzZW5kZXJJZGVudGl0eSA9IG5ldyBJZGVudGl0eShzZW5kZXIpO1xyXG4gICAgY29uc3QgY3R4ID0gdGhpcy4jcmVkdWNlckN0eDtcclxuICAgIFJlZHVjZXJDdHhJbXBsLnJlc2V0KFxyXG4gICAgICBjdHgsXHJcbiAgICAgIHNlbmRlcklkZW50aXR5LFxyXG4gICAgICBuZXcgVGltZXN0YW1wKHRpbWVzdGFtcCksXHJcbiAgICAgIENvbm5lY3Rpb25JZC5udWxsSWZaZXJvKG5ldyBDb25uZWN0aW9uSWQoY29ubklkKSlcclxuICAgICk7XHJcbiAgICBjYWxsVXNlckZ1bmN0aW9uKG1vZHVsZUN0eC5yZWR1Y2Vyc1tyZWR1Y2VySWRdLCBjdHgsIGFyZ3MpO1xyXG4gIH1cclxuICBfX2NhbGxfdmlld19fKGlkLCBzZW5kZXIsIGFyZ3NCdWYpIHtcclxuICAgIGNvbnN0IG1vZHVsZUN0eCA9IHRoaXMuI3NjaGVtYTtcclxuICAgIGNvbnN0IHsgZm4sIGRlc2VyaWFsaXplUGFyYW1zLCBzZXJpYWxpemVSZXR1cm4sIHJldHVyblR5cGVCYXNlU2l6ZSB9ID0gbW9kdWxlQ3R4LnZpZXdzW2lkXTtcclxuICAgIGNvbnN0IGN0eCA9IGZyZWV6ZSh7XHJcbiAgICAgIHNlbmRlcjogbmV3IElkZW50aXR5KHNlbmRlciksXHJcbiAgICAgIC8vIHRoaXMgaXMgdGhlIG5vbi1yZWFkb25seSBEYlZpZXcsIGJ1dCB0aGUgdHlwaW5nIGZvciB0aGUgdXNlciB3aWxsIGJlXHJcbiAgICAgIC8vIHRoZSByZWFkb25seSBvbmUsIGFuZCBpZiB0aGV5IGRvIGNhbGwgbXV0YXRpbmcgZnVuY3Rpb25zIGl0IHdpbGwgZmFpbFxyXG4gICAgICAvLyBhdCBydW50aW1lXHJcbiAgICAgIGRiOiB0aGlzLiNkYlZpZXcsXHJcbiAgICAgIGZyb206IG1ha2VRdWVyeUJ1aWxkZXIobW9kdWxlQ3R4LnNjaGVtYVR5cGUpXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZVBhcmFtcyhuZXcgQmluYXJ5UmVhZGVyKGFyZ3NCdWYpKTtcclxuICAgIGNvbnN0IHJldCA9IGNhbGxVc2VyRnVuY3Rpb24oZm4sIGN0eCwgYXJncyk7XHJcbiAgICBjb25zdCByZXRCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKHJldHVyblR5cGVCYXNlU2l6ZSk7XHJcbiAgICBpZiAoaXNSb3dUeXBlZFF1ZXJ5KHJldCkpIHtcclxuICAgICAgY29uc3QgcXVlcnkgPSB0b1NxbChyZXQpO1xyXG4gICAgICBWaWV3UmVzdWx0SGVhZGVyLnNlcmlhbGl6ZShyZXRCdWYsIFZpZXdSZXN1bHRIZWFkZXIuUmF3U3FsKHF1ZXJ5KSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBWaWV3UmVzdWx0SGVhZGVyLnNlcmlhbGl6ZShyZXRCdWYsIFZpZXdSZXN1bHRIZWFkZXIuUm93RGF0YSk7XHJcbiAgICAgIHNlcmlhbGl6ZVJldHVybihyZXRCdWYsIHJldCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyBkYXRhOiByZXRCdWYuZ2V0QnVmZmVyKCkgfTtcclxuICB9XHJcbiAgX19jYWxsX3ZpZXdfYW5vbl9fKGlkLCBhcmdzQnVmKSB7XHJcbiAgICBjb25zdCBtb2R1bGVDdHggPSB0aGlzLiNzY2hlbWE7XHJcbiAgICBjb25zdCB7IGZuLCBkZXNlcmlhbGl6ZVBhcmFtcywgc2VyaWFsaXplUmV0dXJuLCByZXR1cm5UeXBlQmFzZVNpemUgfSA9IG1vZHVsZUN0eC5hbm9uVmlld3NbaWRdO1xyXG4gICAgY29uc3QgY3R4ID0gZnJlZXplKHtcclxuICAgICAgLy8gdGhpcyBpcyB0aGUgbm9uLXJlYWRvbmx5IERiVmlldywgYnV0IHRoZSB0eXBpbmcgZm9yIHRoZSB1c2VyIHdpbGwgYmVcclxuICAgICAgLy8gdGhlIHJlYWRvbmx5IG9uZSwgYW5kIGlmIHRoZXkgZG8gY2FsbCBtdXRhdGluZyBmdW5jdGlvbnMgaXQgd2lsbCBmYWlsXHJcbiAgICAgIC8vIGF0IHJ1bnRpbWVcclxuICAgICAgZGI6IHRoaXMuI2RiVmlldyxcclxuICAgICAgZnJvbTogbWFrZVF1ZXJ5QnVpbGRlcihtb2R1bGVDdHguc2NoZW1hVHlwZSlcclxuICAgIH0pO1xyXG4gICAgY29uc3QgYXJncyA9IGRlc2VyaWFsaXplUGFyYW1zKG5ldyBCaW5hcnlSZWFkZXIoYXJnc0J1ZikpO1xyXG4gICAgY29uc3QgcmV0ID0gY2FsbFVzZXJGdW5jdGlvbihmbiwgY3R4LCBhcmdzKTtcclxuICAgIGNvbnN0IHJldEJ1ZiA9IG5ldyBCaW5hcnlXcml0ZXIocmV0dXJuVHlwZUJhc2VTaXplKTtcclxuICAgIGlmIChpc1Jvd1R5cGVkUXVlcnkocmV0KSkge1xyXG4gICAgICBjb25zdCBxdWVyeSA9IHRvU3FsKHJldCk7XHJcbiAgICAgIFZpZXdSZXN1bHRIZWFkZXIuc2VyaWFsaXplKHJldEJ1ZiwgVmlld1Jlc3VsdEhlYWRlci5SYXdTcWwocXVlcnkpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIFZpZXdSZXN1bHRIZWFkZXIuc2VyaWFsaXplKHJldEJ1ZiwgVmlld1Jlc3VsdEhlYWRlci5Sb3dEYXRhKTtcclxuICAgICAgc2VyaWFsaXplUmV0dXJuKHJldEJ1ZiwgcmV0KTtcclxuICAgIH1cclxuICAgIHJldHVybiB7IGRhdGE6IHJldEJ1Zi5nZXRCdWZmZXIoKSB9O1xyXG4gIH1cclxuICBfX2NhbGxfcHJvY2VkdXJlX18oaWQsIHNlbmRlciwgY29ubmVjdGlvbl9pZCwgdGltZXN0YW1wLCBhcmdzKSB7XHJcbiAgICByZXR1cm4gY2FsbFByb2NlZHVyZShcclxuICAgICAgdGhpcy4jc2NoZW1hLFxyXG4gICAgICBpZCxcclxuICAgICAgbmV3IElkZW50aXR5KHNlbmRlciksXHJcbiAgICAgIENvbm5lY3Rpb25JZC5udWxsSWZaZXJvKG5ldyBDb25uZWN0aW9uSWQoY29ubmVjdGlvbl9pZCkpLFxyXG4gICAgICBuZXcgVGltZXN0YW1wKHRpbWVzdGFtcCksXHJcbiAgICAgIGFyZ3MsXHJcbiAgICAgICgpID0+IHRoaXMuI2RiVmlld1xyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBCSU5BUllfV1JJVEVSID0gbmV3IEJpbmFyeVdyaXRlcigwKTtcclxudmFyIEJJTkFSWV9SRUFERVIgPSBuZXcgQmluYXJ5UmVhZGVyKG5ldyBVaW50OEFycmF5KCkpO1xyXG5mdW5jdGlvbiBtYWtlVGFibGVWaWV3KHR5cGVzcGFjZSwgdGFibGUyKSB7XHJcbiAgY29uc3QgdGFibGVfaWQgPSBzeXMudGFibGVfaWRfZnJvbV9uYW1lKHRhYmxlMi5zb3VyY2VOYW1lKTtcclxuICBjb25zdCByb3dUeXBlID0gdHlwZXNwYWNlLnR5cGVzW3RhYmxlMi5wcm9kdWN0VHlwZVJlZl07XHJcbiAgaWYgKHJvd1R5cGUudGFnICE9PSBcIlByb2R1Y3RcIikge1xyXG4gICAgdGhyb3cgXCJpbXBvc3NpYmxlXCI7XHJcbiAgfVxyXG4gIGNvbnN0IHNlcmlhbGl6ZVJvdyA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIocm93VHlwZSwgdHlwZXNwYWNlKTtcclxuICBjb25zdCBkZXNlcmlhbGl6ZVJvdyA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihyb3dUeXBlLCB0eXBlc3BhY2UpO1xyXG4gIGNvbnN0IHNlcXVlbmNlcyA9IHRhYmxlMi5zZXF1ZW5jZXMubWFwKChzZXEpID0+IHtcclxuICAgIGNvbnN0IGNvbCA9IHJvd1R5cGUudmFsdWUuZWxlbWVudHNbc2VxLmNvbHVtbl07XHJcbiAgICBjb25zdCBjb2xUeXBlID0gY29sLmFsZ2VicmFpY1R5cGU7XHJcbiAgICBsZXQgc2VxdWVuY2VUcmlnZ2VyO1xyXG4gICAgc3dpdGNoIChjb2xUeXBlLnRhZykge1xyXG4gICAgICBjYXNlIFwiVThcIjpcclxuICAgICAgY2FzZSBcIkk4XCI6XHJcbiAgICAgIGNhc2UgXCJVMTZcIjpcclxuICAgICAgY2FzZSBcIkkxNlwiOlxyXG4gICAgICBjYXNlIFwiVTMyXCI6XHJcbiAgICAgIGNhc2UgXCJJMzJcIjpcclxuICAgICAgICBzZXF1ZW5jZVRyaWdnZXIgPSAwO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiVTY0XCI6XHJcbiAgICAgIGNhc2UgXCJJNjRcIjpcclxuICAgICAgY2FzZSBcIlUxMjhcIjpcclxuICAgICAgY2FzZSBcIkkxMjhcIjpcclxuICAgICAgY2FzZSBcIlUyNTZcIjpcclxuICAgICAgY2FzZSBcIkkyNTZcIjpcclxuICAgICAgICBzZXF1ZW5jZVRyaWdnZXIgPSAwbjtcclxuICAgICAgICBicmVhaztcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiaW52YWxpZCBzZXF1ZW5jZSB0eXBlXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgY29sTmFtZTogY29sLm5hbWUsXHJcbiAgICAgIHNlcXVlbmNlVHJpZ2dlcixcclxuICAgICAgZGVzZXJpYWxpemU6IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihjb2xUeXBlLCB0eXBlc3BhY2UpXHJcbiAgICB9O1xyXG4gIH0pO1xyXG4gIGNvbnN0IGhhc0F1dG9JbmNyZW1lbnQgPSBzZXF1ZW5jZXMubGVuZ3RoID4gMDtcclxuICBjb25zdCBpdGVyID0gKCkgPT4gdGFibGVJdGVyYXRvcihzeXMuZGF0YXN0b3JlX3RhYmxlX3NjYW5fYnNhdG4odGFibGVfaWQpLCBkZXNlcmlhbGl6ZVJvdyk7XHJcbiAgY29uc3QgaW50ZWdyYXRlR2VuZXJhdGVkQ29sdW1ucyA9IGhhc0F1dG9JbmNyZW1lbnQgPyAocm93LCByZXRfYnVmKSA9PiB7XHJcbiAgICBCSU5BUllfUkVBREVSLnJlc2V0KHJldF9idWYpO1xyXG4gICAgZm9yIChjb25zdCB7IGNvbE5hbWUsIGRlc2VyaWFsaXplLCBzZXF1ZW5jZVRyaWdnZXIgfSBvZiBzZXF1ZW5jZXMpIHtcclxuICAgICAgaWYgKHJvd1tjb2xOYW1lXSA9PT0gc2VxdWVuY2VUcmlnZ2VyKSB7XHJcbiAgICAgICAgcm93W2NvbE5hbWVdID0gZGVzZXJpYWxpemUoQklOQVJZX1JFQURFUik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IDogbnVsbDtcclxuICBjb25zdCB0YWJsZU1ldGhvZHMgPSB7XHJcbiAgICBjb3VudDogKCkgPT4gc3lzLmRhdGFzdG9yZV90YWJsZV9yb3dfY291bnQodGFibGVfaWQpLFxyXG4gICAgaXRlcixcclxuICAgIFtTeW1ib2wuaXRlcmF0b3JdOiAoKSA9PiBpdGVyKCksXHJcbiAgICBpbnNlcnQ6IChyb3cpID0+IHtcclxuICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmKTtcclxuICAgICAgc2VyaWFsaXplUm93KEJJTkFSWV9XUklURVIsIHJvdyk7XHJcbiAgICAgIHN5cy5kYXRhc3RvcmVfaW5zZXJ0X2JzYXRuKHRhYmxlX2lkLCBidWYuYnVmZmVyLCBCSU5BUllfV1JJVEVSLm9mZnNldCk7XHJcbiAgICAgIGNvbnN0IHJldCA9IHsgLi4ucm93IH07XHJcbiAgICAgIGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnM/LihyZXQsIGJ1Zi52aWV3KTtcclxuICAgICAgcmV0dXJuIHJldDtcclxuICAgIH0sXHJcbiAgICBkZWxldGU6IChyb3cpID0+IHtcclxuICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmKTtcclxuICAgICAgQklOQVJZX1dSSVRFUi53cml0ZVUzMigxKTtcclxuICAgICAgc2VyaWFsaXplUm93KEJJTkFSWV9XUklURVIsIHJvdyk7XHJcbiAgICAgIGNvbnN0IGNvdW50ID0gc3lzLmRhdGFzdG9yZV9kZWxldGVfYWxsX2J5X2VxX2JzYXRuKFxyXG4gICAgICAgIHRhYmxlX2lkLFxyXG4gICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgQklOQVJZX1dSSVRFUi5vZmZzZXRcclxuICAgICAgKTtcclxuICAgICAgcmV0dXJuIGNvdW50ID4gMDtcclxuICAgIH1cclxuICB9O1xyXG4gIGNvbnN0IHRhYmxlVmlldyA9IE9iamVjdC5hc3NpZ24oXHJcbiAgICAvKiBAX19QVVJFX18gKi8gT2JqZWN0LmNyZWF0ZShudWxsKSxcclxuICAgIHRhYmxlTWV0aG9kc1xyXG4gICk7XHJcbiAgZm9yIChjb25zdCBpbmRleERlZiBvZiB0YWJsZTIuaW5kZXhlcykge1xyXG4gICAgY29uc3QgaW5kZXhfaWQgPSBzeXMuaW5kZXhfaWRfZnJvbV9uYW1lKGluZGV4RGVmLnNvdXJjZU5hbWUpO1xyXG4gICAgbGV0IGNvbHVtbl9pZHM7XHJcbiAgICBsZXQgaXNIYXNoSW5kZXggPSBmYWxzZTtcclxuICAgIHN3aXRjaCAoaW5kZXhEZWYuYWxnb3JpdGhtLnRhZykge1xyXG4gICAgICBjYXNlIFwiSGFzaFwiOlxyXG4gICAgICAgIGlzSGFzaEluZGV4ID0gdHJ1ZTtcclxuICAgICAgICBjb2x1bW5faWRzID0gaW5kZXhEZWYuYWxnb3JpdGhtLnZhbHVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiQlRyZWVcIjpcclxuICAgICAgICBjb2x1bW5faWRzID0gaW5kZXhEZWYuYWxnb3JpdGhtLnZhbHVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIFwiRGlyZWN0XCI6XHJcbiAgICAgICAgY29sdW1uX2lkcyA9IFtpbmRleERlZi5hbGdvcml0aG0udmFsdWVdO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbnVtQ29sdW1ucyA9IGNvbHVtbl9pZHMubGVuZ3RoO1xyXG4gICAgY29uc3QgY29sdW1uU2V0ID0gbmV3IFNldChjb2x1bW5faWRzKTtcclxuICAgIGNvbnN0IGlzVW5pcXVlID0gdGFibGUyLmNvbnN0cmFpbnRzLmZpbHRlcigoeCkgPT4geC5kYXRhLnRhZyA9PT0gXCJVbmlxdWVcIikuc29tZSgoeCkgPT4gY29sdW1uU2V0LmlzU3Vic2V0T2YobmV3IFNldCh4LmRhdGEudmFsdWUuY29sdW1ucykpKTtcclxuICAgIGNvbnN0IGlzUHJpbWFyeUtleSA9IGlzVW5pcXVlICYmIGNvbHVtbl9pZHMubGVuZ3RoID09PSB0YWJsZTIucHJpbWFyeUtleS5sZW5ndGggJiYgY29sdW1uX2lkcy5ldmVyeSgoaWQsIGkpID0+IHRhYmxlMi5wcmltYXJ5S2V5W2ldID09PSBpZCk7XHJcbiAgICBjb25zdCBpbmRleFNlcmlhbGl6ZXJzID0gY29sdW1uX2lkcy5tYXAoXHJcbiAgICAgIChpZCkgPT4gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcclxuICAgICAgICByb3dUeXBlLnZhbHVlLmVsZW1lbnRzW2lkXS5hbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICApXHJcbiAgICApO1xyXG4gICAgY29uc3Qgc2VyaWFsaXplUG9pbnQgPSAoYnVmZmVyLCBjb2xWYWwpID0+IHtcclxuICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWZmZXIpO1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bUNvbHVtbnM7IGkrKykge1xyXG4gICAgICAgIGluZGV4U2VyaWFsaXplcnNbaV0oQklOQVJZX1dSSVRFUiwgY29sVmFsW2ldKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gQklOQVJZX1dSSVRFUi5vZmZzZXQ7XHJcbiAgICB9O1xyXG4gICAgY29uc3Qgc2VyaWFsaXplU2luZ2xlRWxlbWVudCA9IG51bUNvbHVtbnMgPT09IDEgPyBpbmRleFNlcmlhbGl6ZXJzWzBdIDogbnVsbDtcclxuICAgIGNvbnN0IHNlcmlhbGl6ZVNpbmdsZVBvaW50ID0gc2VyaWFsaXplU2luZ2xlRWxlbWVudCAmJiAoKGJ1ZmZlciwgY29sVmFsKSA9PiB7XHJcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmZmVyKTtcclxuICAgICAgc2VyaWFsaXplU2luZ2xlRWxlbWVudChCSU5BUllfV1JJVEVSLCBjb2xWYWwpO1xyXG4gICAgICByZXR1cm4gQklOQVJZX1dSSVRFUi5vZmZzZXQ7XHJcbiAgICB9KTtcclxuICAgIGxldCBpbmRleDtcclxuICAgIGlmIChpc1VuaXF1ZSAmJiBzZXJpYWxpemVTaW5nbGVQb2ludCkge1xyXG4gICAgICBjb25zdCBiYXNlID0ge1xyXG4gICAgICAgIGZpbmQ6IChjb2xWYWwpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplU2luZ2xlUG9pbnQoYnVmLCBjb2xWYWwpO1xyXG4gICAgICAgICAgY29uc3QgaXRlcl9pZCA9IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcclxuICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgIHBvaW50X2xlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdGVPbmUoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVsZXRlOiAoY29sVmFsKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgY29sVmFsKTtcclxuICAgICAgICAgIGNvbnN0IG51bSA9IHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByZXR1cm4gbnVtID4gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGlmIChpc1ByaW1hcnlLZXkpIHtcclxuICAgICAgICBiYXNlLnVwZGF0ZSA9IChyb3cpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWYpO1xyXG4gICAgICAgICAgc2VyaWFsaXplUm93KEJJTkFSWV9XUklURVIsIHJvdyk7XHJcbiAgICAgICAgICBzeXMuZGF0YXN0b3JlX3VwZGF0ZV9ic2F0bihcclxuICAgICAgICAgICAgdGFibGVfaWQsXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBCSU5BUllfV1JJVEVSLm9mZnNldFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnM/Lihyb3csIGJ1Zi52aWV3KTtcclxuICAgICAgICAgIHJldHVybiByb3c7XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICBpbmRleCA9IGJhc2U7XHJcbiAgICB9IGVsc2UgaWYgKGlzVW5pcXVlKSB7XHJcbiAgICAgIGNvbnN0IGJhc2UgPSB7XHJcbiAgICAgICAgZmluZDogKGNvbFZhbCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGNvbFZhbC5sZW5ndGggIT09IG51bUNvbHVtbnMpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIndyb25nIG51bWJlciBvZiBlbGVtZW50c1wiKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCBjb2xWYWwpO1xyXG4gICAgICAgICAgY29uc3QgaXRlcl9pZCA9IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcclxuICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgIHBvaW50X2xlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdGVPbmUoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVsZXRlOiAoY29sVmFsKSA9PiB7XHJcbiAgICAgICAgICBpZiAoY29sVmFsLmxlbmd0aCAhPT0gbnVtQ29sdW1ucylcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIndyb25nIG51bWJlciBvZiBlbGVtZW50c1wiKTtcclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCBjb2xWYWwpO1xyXG4gICAgICAgICAgY29uc3QgbnVtID0gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcclxuICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgIHBvaW50X2xlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHJldHVybiBudW0gPiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgaWYgKGlzUHJpbWFyeUtleSkge1xyXG4gICAgICAgIGJhc2UudXBkYXRlID0gKHJvdykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XHJcbiAgICAgICAgICBzZXJpYWxpemVSb3coQklOQVJZX1dSSVRFUiwgcm93KTtcclxuICAgICAgICAgIHN5cy5kYXRhc3RvcmVfdXBkYXRlX2JzYXRuKFxyXG4gICAgICAgICAgICB0YWJsZV9pZCxcclxuICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgIEJJTkFSWV9XUklURVIub2Zmc2V0XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgaW50ZWdyYXRlR2VuZXJhdGVkQ29sdW1ucz8uKHJvdywgYnVmLnZpZXcpO1xyXG4gICAgICAgICAgcmV0dXJuIHJvdztcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgIGluZGV4ID0gYmFzZTtcclxuICAgIH0gZWxzZSBpZiAoc2VyaWFsaXplU2luZ2xlUG9pbnQpIHtcclxuICAgICAgY29uc3QgcmF3SW5kZXggPSB7XHJcbiAgICAgICAgZmlsdGVyOiAocmFuZ2UpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplU2luZ2xlUG9pbnQoYnVmLCByYW5nZSk7XHJcbiAgICAgICAgICBjb25zdCBpdGVyX2lkID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxyXG4gICAgICAgICAgICBpbmRleF9pZCxcclxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgcG9pbnRfbGVuXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0b3IoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVsZXRlOiAocmFuZ2UpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplU2luZ2xlUG9pbnQoYnVmLCByYW5nZSk7XHJcbiAgICAgICAgICByZXR1cm4gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcclxuICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgIHBvaW50X2xlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGlmIChpc0hhc2hJbmRleCkge1xyXG4gICAgICAgIGluZGV4ID0gcmF3SW5kZXg7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaW5kZXggPSByYXdJbmRleDtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChpc0hhc2hJbmRleCkge1xyXG4gICAgICBpbmRleCA9IHtcclxuICAgICAgICBmaWx0ZXI6IChyYW5nZSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVQb2ludChidWYsIHJhbmdlKTtcclxuICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRvcihpdGVyX2lkLCBkZXNlcmlhbGl6ZVJvdyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWxldGU6IChyYW5nZSkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVQb2ludChidWYsIHJhbmdlKTtcclxuICAgICAgICAgIHJldHVybiBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9ieV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxyXG4gICAgICAgICAgICBpbmRleF9pZCxcclxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgcG9pbnRfbGVuXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZVJhbmdlID0gKGJ1ZmZlciwgcmFuZ2UpID0+IHtcclxuICAgICAgICBpZiAocmFuZ2UubGVuZ3RoID4gbnVtQ29sdW1ucykgdGhyb3cgbmV3IFR5cGVFcnJvcihcInRvbyBtYW55IGVsZW1lbnRzXCIpO1xyXG4gICAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmZmVyKTtcclxuICAgICAgICBjb25zdCB3cml0ZXIgPSBCSU5BUllfV1JJVEVSO1xyXG4gICAgICAgIGNvbnN0IHByZWZpeF9lbGVtcyA9IHJhbmdlLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVmaXhfZWxlbXM7IGkrKykge1xyXG4gICAgICAgICAgaW5kZXhTZXJpYWxpemVyc1tpXSh3cml0ZXIsIHJhbmdlW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgcnN0YXJ0T2Zmc2V0ID0gd3JpdGVyLm9mZnNldDtcclxuICAgICAgICBjb25zdCB0ZXJtID0gcmFuZ2VbcmFuZ2UubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplVGVybSA9IGluZGV4U2VyaWFsaXplcnNbcmFuZ2UubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgaWYgKHRlcm0gaW5zdGFuY2VvZiBSYW5nZSkge1xyXG4gICAgICAgICAgY29uc3Qgd3JpdGVCb3VuZCA9IChib3VuZCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCB0YWdzID0geyBpbmNsdWRlZDogMCwgZXhjbHVkZWQ6IDEsIHVuYm91bmRlZDogMiB9O1xyXG4gICAgICAgICAgICB3cml0ZXIud3JpdGVVOCh0YWdzW2JvdW5kLnRhZ10pO1xyXG4gICAgICAgICAgICBpZiAoYm91bmQudGFnICE9PSBcInVuYm91bmRlZFwiKSBzZXJpYWxpemVUZXJtKHdyaXRlciwgYm91bmQudmFsdWUpO1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHdyaXRlQm91bmQodGVybS5mcm9tKTtcclxuICAgICAgICAgIGNvbnN0IHJzdGFydExlbiA9IHdyaXRlci5vZmZzZXQgLSByc3RhcnRPZmZzZXQ7XHJcbiAgICAgICAgICB3cml0ZUJvdW5kKHRlcm0udG8pO1xyXG4gICAgICAgICAgY29uc3QgcmVuZExlbiA9IHdyaXRlci5vZmZzZXQgLSByc3RhcnRMZW47XHJcbiAgICAgICAgICByZXR1cm4gW3JzdGFydE9mZnNldCwgcHJlZml4X2VsZW1zLCByc3RhcnRMZW4sIHJlbmRMZW5dO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB3cml0ZXIud3JpdGVVOCgwKTtcclxuICAgICAgICAgIHNlcmlhbGl6ZVRlcm0od3JpdGVyLCB0ZXJtKTtcclxuICAgICAgICAgIGNvbnN0IHJzdGFydExlbiA9IHdyaXRlci5vZmZzZXQ7XHJcbiAgICAgICAgICBjb25zdCByZW5kTGVuID0gMDtcclxuICAgICAgICAgIHJldHVybiBbcnN0YXJ0T2Zmc2V0LCBwcmVmaXhfZWxlbXMsIHJzdGFydExlbiwgcmVuZExlbl07XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBpbmRleCA9IHtcclxuICAgICAgICBmaWx0ZXI6IChyYW5nZSkgPT4ge1xyXG4gICAgICAgICAgaWYgKHJhbmdlLmxlbmd0aCA9PT0gbnVtQ29sdW1ucykge1xyXG4gICAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCByYW5nZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0b3IoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBzZXJpYWxpemVSYW5nZShidWYsIHJhbmdlKTtcclxuICAgICAgICAgICAgY29uc3QgaXRlcl9pZCA9IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9yYW5nZV9ic2F0bihcclxuICAgICAgICAgICAgICBpbmRleF9pZCxcclxuICAgICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICAgIC4uLmFyZ3NcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0b3IoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVsZXRlOiAocmFuZ2UpID0+IHtcclxuICAgICAgICAgIGlmIChyYW5nZS5sZW5ndGggPT09IG51bUNvbHVtbnMpIHtcclxuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgcmFuZ2UpO1xyXG4gICAgICAgICAgICByZXR1cm4gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcclxuICAgICAgICAgICAgICBpbmRleF9pZCxcclxuICAgICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICAgIHBvaW50X2xlblxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBzZXJpYWxpemVSYW5nZShidWYsIHJhbmdlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcmFuZ2VfYnNhdG4oXHJcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgICAuLi5hcmdzXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gICAgaWYgKE9iamVjdC5oYXNPd24odGFibGVWaWV3LCBpbmRleERlZi5hY2Nlc3Nvck5hbWUpKSB7XHJcbiAgICAgIGZyZWV6ZShPYmplY3QuYXNzaWduKHRhYmxlVmlld1tpbmRleERlZi5hY2Nlc3Nvck5hbWVdLCBpbmRleCkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGFibGVWaWV3W2luZGV4RGVmLmFjY2Vzc29yTmFtZV0gPSBmcmVlemUoaW5kZXgpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gZnJlZXplKHRhYmxlVmlldyk7XHJcbn1cclxuZnVuY3Rpb24qIHRhYmxlSXRlcmF0b3IoaWQsIGRlc2VyaWFsaXplKSB7XHJcbiAgdXNpbmcgaXRlciA9IG5ldyBJdGVyYXRvckhhbmRsZShpZCk7XHJcbiAgY29uc3QgaXRlckJ1ZiA9IHRha2VCdWYoKTtcclxuICB0cnkge1xyXG4gICAgbGV0IGFtdDtcclxuICAgIHdoaWxlIChhbXQgPSBpdGVyLmFkdmFuY2UoaXRlckJ1ZikpIHtcclxuICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEJpbmFyeVJlYWRlcihpdGVyQnVmLnZpZXcpO1xyXG4gICAgICB3aGlsZSAocmVhZGVyLm9mZnNldCA8IGFtdCkge1xyXG4gICAgICAgIHlpZWxkIGRlc2VyaWFsaXplKHJlYWRlcik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGZpbmFsbHkge1xyXG4gICAgcmV0dXJuQnVmKGl0ZXJCdWYpO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiB0YWJsZUl0ZXJhdGVPbmUoaWQsIGRlc2VyaWFsaXplKSB7XHJcbiAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgY29uc3QgcmV0ID0gYWR2YW5jZUl0ZXJSYXcoaWQsIGJ1Zik7XHJcbiAgaWYgKHJldCAhPT0gMCkge1xyXG4gICAgQklOQVJZX1JFQURFUi5yZXNldChidWYudmlldyk7XHJcbiAgICByZXR1cm4gZGVzZXJpYWxpemUoQklOQVJZX1JFQURFUik7XHJcbiAgfVxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcbmZ1bmN0aW9uIGFkdmFuY2VJdGVyUmF3KGlkLCBidWYpIHtcclxuICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIDAgfCBzeXMucm93X2l0ZXJfYnNhdG5fYWR2YW5jZShpZCwgYnVmLmJ1ZmZlcik7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGlmIChlICYmIHR5cGVvZiBlID09PSBcIm9iamVjdFwiICYmIGhhc093bihlLCBcIl9fYnVmZmVyX3Rvb19zbWFsbF9fXCIpKSB7XHJcbiAgICAgICAgYnVmLmdyb3coZS5fX2J1ZmZlcl90b29fc21hbGxfXyk7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuICAgICAgdGhyb3cgZTtcclxuICAgIH1cclxuICB9XHJcbn1cclxudmFyIERFRkFVTFRfQlVGRkVSX0NBUEFDSVRZID0gMzIgKiAxMDI0ICogMjtcclxudmFyIElURVJfQlVGUyA9IFtcclxuICBuZXcgUmVzaXphYmxlQnVmZmVyKERFRkFVTFRfQlVGRkVSX0NBUEFDSVRZKVxyXG5dO1xyXG52YXIgSVRFUl9CVUZfQ09VTlQgPSAxO1xyXG5mdW5jdGlvbiB0YWtlQnVmKCkge1xyXG4gIHJldHVybiBJVEVSX0JVRl9DT1VOVCA/IElURVJfQlVGU1stLUlURVJfQlVGX0NPVU5UXSA6IG5ldyBSZXNpemFibGVCdWZmZXIoREVGQVVMVF9CVUZGRVJfQ0FQQUNJVFkpO1xyXG59XHJcbmZ1bmN0aW9uIHJldHVybkJ1ZihidWYpIHtcclxuICBJVEVSX0JVRlNbSVRFUl9CVUZfQ09VTlQrK10gPSBidWY7XHJcbn1cclxudmFyIExFQUZfQlVGID0gbmV3IFJlc2l6YWJsZUJ1ZmZlcihERUZBVUxUX0JVRkZFUl9DQVBBQ0lUWSk7XHJcbnZhciBJdGVyYXRvckhhbmRsZSA9IGNsYXNzIF9JdGVyYXRvckhhbmRsZSB7XHJcbiAgI2lkO1xyXG4gIHN0YXRpYyAjZmluYWxpemF0aW9uUmVnaXN0cnkgPSBuZXcgRmluYWxpemF0aW9uUmVnaXN0cnkoXHJcbiAgICBzeXMucm93X2l0ZXJfYnNhdG5fY2xvc2VcclxuICApO1xyXG4gIGNvbnN0cnVjdG9yKGlkKSB7XHJcbiAgICB0aGlzLiNpZCA9IGlkO1xyXG4gICAgX0l0ZXJhdG9ySGFuZGxlLiNmaW5hbGl6YXRpb25SZWdpc3RyeS5yZWdpc3Rlcih0aGlzLCBpZCwgdGhpcyk7XHJcbiAgfVxyXG4gIC8qKiBVbnJlZ2lzdGVyIHRoaXMgb2JqZWN0IHdpdGggdGhlIGZpbmFsaXphdGlvbiByZWdpc3RyeSBhbmQgcmV0dXJuIHRoZSBpZCAqL1xyXG4gICNkZXRhY2goKSB7XHJcbiAgICBjb25zdCBpZCA9IHRoaXMuI2lkO1xyXG4gICAgdGhpcy4jaWQgPSAtMTtcclxuICAgIF9JdGVyYXRvckhhbmRsZS4jZmluYWxpemF0aW9uUmVnaXN0cnkudW5yZWdpc3Rlcih0aGlzKTtcclxuICAgIHJldHVybiBpZDtcclxuICB9XHJcbiAgLyoqIENhbGwgYHJvd19pdGVyX2JzYXRuX2FkdmFuY2VgLCByZXR1cm5pbmcgMCBpZiB0aGlzIGl0ZXJhdG9yIGhhcyBiZWVuIGV4aGF1c3RlZC4gKi9cclxuICBhZHZhbmNlKGJ1Zikge1xyXG4gICAgaWYgKHRoaXMuI2lkID09PSAtMSkgcmV0dXJuIDA7XHJcbiAgICBjb25zdCByZXQgPSBhZHZhbmNlSXRlclJhdyh0aGlzLiNpZCwgYnVmKTtcclxuICAgIGlmIChyZXQgPD0gMCkgdGhpcy4jZGV0YWNoKCk7XHJcbiAgICByZXR1cm4gcmV0IDwgMCA/IC1yZXQgOiByZXQ7XHJcbiAgfVxyXG4gIFtTeW1ib2wuZGlzcG9zZV0oKSB7XHJcbiAgICBpZiAodGhpcy4jaWQgPj0gMCkge1xyXG4gICAgICBjb25zdCBpZCA9IHRoaXMuI2RldGFjaCgpO1xyXG4gICAgICBzeXMucm93X2l0ZXJfYnNhdG5fY2xvc2UoaWQpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9zZXJ2ZXIvaHR0cF9pbnRlcm5hbC50c1xyXG52YXIgeyBmcmVlemU6IGZyZWV6ZTIgfSA9IE9iamVjdDtcclxudmFyIHRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XHJcbnZhciB0ZXh0RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcihcclxuICBcInV0Zi04XCJcclxuICAvKiB7IGZhdGFsOiB0cnVlIH0gKi9cclxuKTtcclxudmFyIG1ha2VSZXNwb25zZSA9IFN5bWJvbChcIm1ha2VSZXNwb25zZVwiKTtcclxudmFyIFN5bmNSZXNwb25zZSA9IGNsYXNzIF9TeW5jUmVzcG9uc2Uge1xyXG4gICNib2R5O1xyXG4gICNpbm5lcjtcclxuICBjb25zdHJ1Y3Rvcihib2R5LCBpbml0KSB7XHJcbiAgICBpZiAoYm9keSA9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMuI2JvZHkgPSBudWxsO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYm9keSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICB0aGlzLiNib2R5ID0gYm9keTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuI2JvZHkgPSBuZXcgVWludDhBcnJheShib2R5KS5idWZmZXI7XHJcbiAgICB9XHJcbiAgICB0aGlzLiNpbm5lciA9IHtcclxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnMoaW5pdD8uaGVhZGVycyksXHJcbiAgICAgIHN0YXR1czogaW5pdD8uc3RhdHVzID8/IDIwMCxcclxuICAgICAgc3RhdHVzVGV4dDogaW5pdD8uc3RhdHVzVGV4dCA/PyBcIlwiLFxyXG4gICAgICB0eXBlOiBcImRlZmF1bHRcIixcclxuICAgICAgdXJsOiBudWxsLFxyXG4gICAgICBhYm9ydGVkOiBmYWxzZVxyXG4gICAgfTtcclxuICB9XHJcbiAgc3RhdGljIFttYWtlUmVzcG9uc2VdKGJvZHksIGlubmVyKSB7XHJcbiAgICBjb25zdCBtZSA9IG5ldyBfU3luY1Jlc3BvbnNlKGJvZHkpO1xyXG4gICAgbWUuI2lubmVyID0gaW5uZXI7XHJcbiAgICByZXR1cm4gbWU7XHJcbiAgfVxyXG4gIGdldCBoZWFkZXJzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLmhlYWRlcnM7XHJcbiAgfVxyXG4gIGdldCBzdGF0dXMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIuc3RhdHVzO1xyXG4gIH1cclxuICBnZXQgc3RhdHVzVGV4dCgpIHtcclxuICAgIHJldHVybiB0aGlzLiNpbm5lci5zdGF0dXNUZXh0O1xyXG4gIH1cclxuICBnZXQgb2soKSB7XHJcbiAgICByZXR1cm4gMjAwIDw9IHRoaXMuI2lubmVyLnN0YXR1cyAmJiB0aGlzLiNpbm5lci5zdGF0dXMgPD0gMjk5O1xyXG4gIH1cclxuICBnZXQgdXJsKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLnVybCA/PyBcIlwiO1xyXG4gIH1cclxuICBnZXQgdHlwZSgpIHtcclxuICAgIHJldHVybiB0aGlzLiNpbm5lci50eXBlO1xyXG4gIH1cclxuICBhcnJheUJ1ZmZlcigpIHtcclxuICAgIHJldHVybiB0aGlzLmJ5dGVzKCkuYnVmZmVyO1xyXG4gIH1cclxuICBieXRlcygpIHtcclxuICAgIGlmICh0aGlzLiNib2R5ID09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KCk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGlzLiNib2R5ID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHJldHVybiB0ZXh0RW5jb2Rlci5lbmNvZGUodGhpcy4jYm9keSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkodGhpcy4jYm9keSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGpzb24oKSB7XHJcbiAgICByZXR1cm4gSlNPTi5wYXJzZSh0aGlzLnRleHQoKSk7XHJcbiAgfVxyXG4gIHRleHQoKSB7XHJcbiAgICBpZiAodGhpcy4jYm9keSA9PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiBcIlwiO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy4jYm9keSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICByZXR1cm4gdGhpcy4jYm9keTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0ZXh0RGVjb2Rlci5kZWNvZGUodGhpcy4jYm9keSk7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG52YXIgcmVxdWVzdEJhc2VTaXplID0gYnNhdG5CYXNlU2l6ZSh7IHR5cGVzOiBbXSB9LCBIdHRwUmVxdWVzdC5hbGdlYnJhaWNUeXBlKTtcclxudmFyIG1ldGhvZHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcChbXHJcbiAgW1wiR0VUXCIsIHsgdGFnOiBcIkdldFwiIH1dLFxyXG4gIFtcIkhFQURcIiwgeyB0YWc6IFwiSGVhZFwiIH1dLFxyXG4gIFtcIlBPU1RcIiwgeyB0YWc6IFwiUG9zdFwiIH1dLFxyXG4gIFtcIlBVVFwiLCB7IHRhZzogXCJQdXRcIiB9XSxcclxuICBbXCJERUxFVEVcIiwgeyB0YWc6IFwiRGVsZXRlXCIgfV0sXHJcbiAgW1wiQ09OTkVDVFwiLCB7IHRhZzogXCJDb25uZWN0XCIgfV0sXHJcbiAgW1wiT1BUSU9OU1wiLCB7IHRhZzogXCJPcHRpb25zXCIgfV0sXHJcbiAgW1wiVFJBQ0VcIiwgeyB0YWc6IFwiVHJhY2VcIiB9XSxcclxuICBbXCJQQVRDSFwiLCB7IHRhZzogXCJQYXRjaFwiIH1dXHJcbl0pO1xyXG5mdW5jdGlvbiBmZXRjaCh1cmwsIGluaXQgPSB7fSkge1xyXG4gIGNvbnN0IG1ldGhvZCA9IG1ldGhvZHMuZ2V0KGluaXQubWV0aG9kPy50b1VwcGVyQ2FzZSgpID8/IFwiR0VUXCIpID8/IHtcclxuICAgIHRhZzogXCJFeHRlbnNpb25cIixcclxuICAgIHZhbHVlOiBpbml0Lm1ldGhvZFxyXG4gIH07XHJcbiAgY29uc3QgaGVhZGVycyA9IHtcclxuICAgIC8vIGFueXMgYmVjYXVzZSB0aGUgdHlwaW5ncyBhcmUgd29ua3kgLSBzZWUgY29tbWVudCBpbiBTeW5jUmVzcG9uc2UuY29uc3RydWN0b3JcclxuICAgIGVudHJpZXM6IGhlYWRlcnNUb0xpc3QobmV3IEhlYWRlcnMoaW5pdC5oZWFkZXJzKSkuZmxhdE1hcCgoW2ssIHZdKSA9PiBBcnJheS5pc0FycmF5KHYpID8gdi5tYXAoKHYyKSA9PiBbaywgdjJdKSA6IFtbaywgdl1dKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7IG5hbWUsIHZhbHVlOiB0ZXh0RW5jb2Rlci5lbmNvZGUodmFsdWUpIH0pKVxyXG4gIH07XHJcbiAgY29uc3QgdXJpID0gXCJcIiArIHVybDtcclxuICBjb25zdCByZXF1ZXN0ID0gZnJlZXplMih7XHJcbiAgICBtZXRob2QsXHJcbiAgICBoZWFkZXJzLFxyXG4gICAgdGltZW91dDogaW5pdC50aW1lb3V0LFxyXG4gICAgdXJpLFxyXG4gICAgdmVyc2lvbjogeyB0YWc6IFwiSHR0cDExXCIgfVxyXG4gIH0pO1xyXG4gIGNvbnN0IHJlcXVlc3RCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKHJlcXVlc3RCYXNlU2l6ZSk7XHJcbiAgSHR0cFJlcXVlc3Quc2VyaWFsaXplKHJlcXVlc3RCdWYsIHJlcXVlc3QpO1xyXG4gIGNvbnN0IGJvZHkgPSBpbml0LmJvZHkgPT0gbnVsbCA/IG5ldyBVaW50OEFycmF5KCkgOiB0eXBlb2YgaW5pdC5ib2R5ID09PSBcInN0cmluZ1wiID8gaW5pdC5ib2R5IDogbmV3IFVpbnQ4QXJyYXkoaW5pdC5ib2R5KTtcclxuICBjb25zdCBbcmVzcG9uc2VCdWYsIHJlc3BvbnNlQm9keV0gPSBzeXMucHJvY2VkdXJlX2h0dHBfcmVxdWVzdChcclxuICAgIHJlcXVlc3RCdWYuZ2V0QnVmZmVyKCksXHJcbiAgICBib2R5XHJcbiAgKTtcclxuICBjb25zdCByZXNwb25zZSA9IEh0dHBSZXNwb25zZS5kZXNlcmlhbGl6ZShuZXcgQmluYXJ5UmVhZGVyKHJlc3BvbnNlQnVmKSk7XHJcbiAgcmV0dXJuIFN5bmNSZXNwb25zZVttYWtlUmVzcG9uc2VdKHJlc3BvbnNlQm9keSwge1xyXG4gICAgdHlwZTogXCJiYXNpY1wiLFxyXG4gICAgdXJsOiB1cmksXHJcbiAgICBzdGF0dXM6IHJlc3BvbnNlLmNvZGUsXHJcbiAgICBzdGF0dXNUZXh0OiAoMCwgaW1wb3J0X3N0YXR1c2VzLmRlZmF1bHQpKHJlc3BvbnNlLmNvZGUpLFxyXG4gICAgaGVhZGVyczogbmV3IEhlYWRlcnMoKSxcclxuICAgIGFib3J0ZWQ6IGZhbHNlXHJcbiAgfSk7XHJcbn1cclxuZnJlZXplMihmZXRjaCk7XHJcbnZhciBodHRwQ2xpZW50ID0gZnJlZXplMih7IGZldGNoIH0pO1xyXG5cclxuLy8gc3JjL3NlcnZlci9wcm9jZWR1cmVzLnRzXHJcbmZ1bmN0aW9uIG1ha2VQcm9jZWR1cmVFeHBvcnQoY3R4LCBvcHRzLCBwYXJhbXMsIHJldCwgZm4pIHtcclxuICBjb25zdCBuYW1lID0gb3B0cz8ubmFtZTtcclxuICBjb25zdCBwcm9jZWR1cmVFeHBvcnQgPSAoLi4uYXJncykgPT4gZm4oLi4uYXJncyk7XHJcbiAgcHJvY2VkdXJlRXhwb3J0W2V4cG9ydENvbnRleHRdID0gY3R4O1xyXG4gIHByb2NlZHVyZUV4cG9ydFtyZWdpc3RlckV4cG9ydF0gPSAoY3R4MiwgZXhwb3J0TmFtZSkgPT4ge1xyXG4gICAgcmVnaXN0ZXJQcm9jZWR1cmUoY3R4MiwgbmFtZSA/PyBleHBvcnROYW1lLCBwYXJhbXMsIHJldCwgZm4pO1xyXG4gICAgY3R4Mi5mdW5jdGlvbkV4cG9ydHMuc2V0KFxyXG4gICAgICBwcm9jZWR1cmVFeHBvcnQsXHJcbiAgICAgIG5hbWUgPz8gZXhwb3J0TmFtZVxyXG4gICAgKTtcclxuICB9O1xyXG4gIHJldHVybiBwcm9jZWR1cmVFeHBvcnQ7XHJcbn1cclxudmFyIFRyYW5zYWN0aW9uQ3R4SW1wbCA9IGNsYXNzIFRyYW5zYWN0aW9uQ3R4IGV4dGVuZHMgUmVkdWNlckN0eEltcGwge1xyXG59O1xyXG5mdW5jdGlvbiByZWdpc3RlclByb2NlZHVyZShjdHgsIGV4cG9ydE5hbWUsIHBhcmFtcywgcmV0LCBmbiwgb3B0cykge1xyXG4gIGN0eC5kZWZpbmVGdW5jdGlvbihleHBvcnROYW1lKTtcclxuICBjb25zdCBwYXJhbXNUeXBlID0ge1xyXG4gICAgZWxlbWVudHM6IE9iamVjdC5lbnRyaWVzKHBhcmFtcykubWFwKChbbiwgY10pID0+ICh7XHJcbiAgICAgIG5hbWU6IG4sXHJcbiAgICAgIGFsZ2VicmFpY1R5cGU6IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkoXHJcbiAgICAgICAgXCJ0eXBlQnVpbGRlclwiIGluIGMgPyBjLnR5cGVCdWlsZGVyIDogY1xyXG4gICAgICApLmFsZ2VicmFpY1R5cGVcclxuICAgIH0pKVxyXG4gIH07XHJcbiAgY29uc3QgcmV0dXJuVHlwZSA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocmV0KS5hbGdlYnJhaWNUeXBlO1xyXG4gIGN0eC5tb2R1bGVEZWYucHJvY2VkdXJlcy5wdXNoKHtcclxuICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXHJcbiAgICBwYXJhbXM6IHBhcmFtc1R5cGUsXHJcbiAgICByZXR1cm5UeXBlLFxyXG4gICAgdmlzaWJpbGl0eTogRnVuY3Rpb25WaXNpYmlsaXR5LkNsaWVudENhbGxhYmxlXHJcbiAgfSk7XHJcbiAgY29uc3QgeyB0eXBlc3BhY2UgfSA9IGN0eDtcclxuICBjdHgucHJvY2VkdXJlcy5wdXNoKHtcclxuICAgIGZuLFxyXG4gICAgZGVzZXJpYWxpemVBcmdzOiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHBhcmFtc1R5cGUsIHR5cGVzcGFjZSksXHJcbiAgICBzZXJpYWxpemVSZXR1cm46IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIocmV0dXJuVHlwZSwgdHlwZXNwYWNlKSxcclxuICAgIHJldHVyblR5cGVCYXNlU2l6ZTogYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHJldHVyblR5cGUpXHJcbiAgfSk7XHJcbn1cclxuZnVuY3Rpb24gY2FsbFByb2NlZHVyZShtb2R1bGVDdHgsIGlkLCBzZW5kZXIsIGNvbm5lY3Rpb25JZCwgdGltZXN0YW1wLCBhcmdzQnVmLCBkYlZpZXcpIHtcclxuICBjb25zdCB7IGZuLCBkZXNlcmlhbGl6ZUFyZ3MsIHNlcmlhbGl6ZVJldHVybiwgcmV0dXJuVHlwZUJhc2VTaXplIH0gPSBtb2R1bGVDdHgucHJvY2VkdXJlc1tpZF07XHJcbiAgY29uc3QgYXJncyA9IGRlc2VyaWFsaXplQXJncyhuZXcgQmluYXJ5UmVhZGVyKGFyZ3NCdWYpKTtcclxuICBjb25zdCBjdHggPSBuZXcgUHJvY2VkdXJlQ3R4SW1wbChcclxuICAgIHNlbmRlcixcclxuICAgIHRpbWVzdGFtcCxcclxuICAgIGNvbm5lY3Rpb25JZCxcclxuICAgIGRiVmlld1xyXG4gICk7XHJcbiAgY29uc3QgcmV0ID0gY2FsbFVzZXJGdW5jdGlvbihmbiwgY3R4LCBhcmdzKTtcclxuICBjb25zdCByZXRCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKHJldHVyblR5cGVCYXNlU2l6ZSk7XHJcbiAgc2VyaWFsaXplUmV0dXJuKHJldEJ1ZiwgcmV0KTtcclxuICByZXR1cm4gcmV0QnVmLmdldEJ1ZmZlcigpO1xyXG59XHJcbnZhciBQcm9jZWR1cmVDdHhJbXBsID0gY2xhc3MgUHJvY2VkdXJlQ3R4IHtcclxuICBjb25zdHJ1Y3RvcihzZW5kZXIsIHRpbWVzdGFtcCwgY29ubmVjdGlvbklkLCBkYlZpZXcpIHtcclxuICAgIHRoaXMuc2VuZGVyID0gc2VuZGVyO1xyXG4gICAgdGhpcy50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XHJcbiAgICB0aGlzLmNvbm5lY3Rpb25JZCA9IGNvbm5lY3Rpb25JZDtcclxuICAgIHRoaXMuI2RiVmlldyA9IGRiVmlldztcclxuICB9XHJcbiAgI2lkZW50aXR5O1xyXG4gICN1dWlkQ291bnRlcjtcclxuICAjcmFuZG9tO1xyXG4gICNkYlZpZXc7XHJcbiAgZ2V0IGlkZW50aXR5KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI2lkZW50aXR5ID8/PSBuZXcgSWRlbnRpdHkoc3lzLmlkZW50aXR5KCkpO1xyXG4gIH1cclxuICBnZXQgcmFuZG9tKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI3JhbmRvbSA/Pz0gbWFrZVJhbmRvbSh0aGlzLnRpbWVzdGFtcCk7XHJcbiAgfVxyXG4gIGdldCBodHRwKCkge1xyXG4gICAgcmV0dXJuIGh0dHBDbGllbnQ7XHJcbiAgfVxyXG4gIHdpdGhUeChib2R5KSB7XHJcbiAgICBjb25zdCBydW4gPSAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHN5cy5wcm9jZWR1cmVfc3RhcnRfbXV0X3R4KCk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgY3R4ID0gbmV3IFRyYW5zYWN0aW9uQ3R4SW1wbChcclxuICAgICAgICAgIHRoaXMuc2VuZGVyLFxyXG4gICAgICAgICAgbmV3IFRpbWVzdGFtcCh0aW1lc3RhbXApLFxyXG4gICAgICAgICAgdGhpcy5jb25uZWN0aW9uSWQsXHJcbiAgICAgICAgICB0aGlzLiNkYlZpZXcoKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmV0dXJuIGJvZHkoY3R4KTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHN5cy5wcm9jZWR1cmVfYWJvcnRfbXV0X3R4KCk7XHJcbiAgICAgICAgdGhyb3cgZTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGxldCByZXMgPSBydW4oKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIHN5cy5wcm9jZWR1cmVfY29tbWl0X211dF90eCgpO1xyXG4gICAgICByZXR1cm4gcmVzO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLndhcm4oXCJjb21taXR0aW5nIGFub255bW91cyB0cmFuc2FjdGlvbiBmYWlsZWRcIik7XHJcbiAgICByZXMgPSBydW4oKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIHN5cy5wcm9jZWR1cmVfY29tbWl0X211dF90eCgpO1xyXG4gICAgICByZXR1cm4gcmVzO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cmFuc2FjdGlvbiByZXRyeSBmYWlsZWQgYWdhaW5cIiwgeyBjYXVzZTogZSB9KTtcclxuICAgIH1cclxuICB9XHJcbiAgbmV3VXVpZFY0KCkge1xyXG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnJhbmRvbS5maWxsKG5ldyBVaW50OEFycmF5KDE2KSk7XHJcbiAgICByZXR1cm4gVXVpZC5mcm9tUmFuZG9tQnl0ZXNWNChieXRlcyk7XHJcbiAgfVxyXG4gIG5ld1V1aWRWNygpIHtcclxuICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5yYW5kb20uZmlsbChuZXcgVWludDhBcnJheSg0KSk7XHJcbiAgICBjb25zdCBjb3VudGVyID0gdGhpcy4jdXVpZENvdW50ZXIgPz89IHsgdmFsdWU6IDAgfTtcclxuICAgIHJldHVybiBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgdGhpcy50aW1lc3RhbXAsIGJ5dGVzKTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvc2VydmVyL3JlZHVjZXJzLnRzXHJcbmZ1bmN0aW9uIG1ha2VSZWR1Y2VyRXhwb3J0KGN0eCwgb3B0cywgcGFyYW1zLCBmbiwgbGlmZWN5Y2xlKSB7XHJcbiAgY29uc3QgcmVkdWNlckV4cG9ydCA9ICguLi5hcmdzKSA9PiBmbiguLi5hcmdzKTtcclxuICByZWR1Y2VyRXhwb3J0W2V4cG9ydENvbnRleHRdID0gY3R4O1xyXG4gIHJlZHVjZXJFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdID0gKGN0eDIsIGV4cG9ydE5hbWUpID0+IHtcclxuICAgIHJlZ2lzdGVyUmVkdWNlcihjdHgyLCBleHBvcnROYW1lLCBwYXJhbXMsIGZuLCBvcHRzLCBsaWZlY3ljbGUpO1xyXG4gICAgY3R4Mi5mdW5jdGlvbkV4cG9ydHMuc2V0KFxyXG4gICAgICByZWR1Y2VyRXhwb3J0LFxyXG4gICAgICBleHBvcnROYW1lXHJcbiAgICApO1xyXG4gIH07XHJcbiAgcmV0dXJuIHJlZHVjZXJFeHBvcnQ7XHJcbn1cclxuZnVuY3Rpb24gcmVnaXN0ZXJSZWR1Y2VyKGN0eCwgZXhwb3J0TmFtZSwgcGFyYW1zLCBmbiwgb3B0cywgbGlmZWN5Y2xlKSB7XHJcbiAgY3R4LmRlZmluZUZ1bmN0aW9uKGV4cG9ydE5hbWUpO1xyXG4gIGlmICghKHBhcmFtcyBpbnN0YW5jZW9mIFJvd0J1aWxkZXIpKSB7XHJcbiAgICBwYXJhbXMgPSBuZXcgUm93QnVpbGRlcihwYXJhbXMpO1xyXG4gIH1cclxuICBpZiAocGFyYW1zLnR5cGVOYW1lID09PSB2b2lkIDApIHtcclxuICAgIHBhcmFtcy50eXBlTmFtZSA9IHRvUGFzY2FsQ2FzZShleHBvcnROYW1lKTtcclxuICB9XHJcbiAgY29uc3QgcmVmID0gY3R4LnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShwYXJhbXMpO1xyXG4gIGNvbnN0IHBhcmFtc1R5cGUgPSBjdHgucmVzb2x2ZVR5cGUocmVmKS52YWx1ZTtcclxuICBjb25zdCBpc0xpZmVjeWNsZSA9IGxpZmVjeWNsZSAhPSBudWxsO1xyXG4gIGN0eC5tb2R1bGVEZWYucmVkdWNlcnMucHVzaCh7XHJcbiAgICBzb3VyY2VOYW1lOiBleHBvcnROYW1lLFxyXG4gICAgcGFyYW1zOiBwYXJhbXNUeXBlLFxyXG4gICAgLy9Nb2R1bGVEZWYgdmFsaWRhdGlvbiBjb2RlIGlzIHJlc3BvbnNpYmxlIHRvIG1hcmsgcHJpdmF0ZSByZWR1Y2Vyc1xyXG4gICAgdmlzaWJpbGl0eTogRnVuY3Rpb25WaXNpYmlsaXR5LkNsaWVudENhbGxhYmxlLFxyXG4gICAgLy9IYXJkY29kZWQgZm9yIG5vdyAtIHJlZHVjZXJzIGRvIG5vdCByZXR1cm4gdmFsdWVzIHlldFxyXG4gICAgb2tSZXR1cm5UeXBlOiBBbGdlYnJhaWNUeXBlLlByb2R1Y3QoeyBlbGVtZW50czogW10gfSksXHJcbiAgICBlcnJSZXR1cm5UeXBlOiBBbGdlYnJhaWNUeXBlLlN0cmluZ1xyXG4gIH0pO1xyXG4gIGlmIChvcHRzPy5uYW1lICE9IG51bGwpIHtcclxuICAgIGN0eC5tb2R1bGVEZWYuZXhwbGljaXROYW1lcy5lbnRyaWVzLnB1c2goe1xyXG4gICAgICB0YWc6IFwiRnVuY3Rpb25cIixcclxuICAgICAgdmFsdWU6IHtcclxuICAgICAgICBzb3VyY2VOYW1lOiBleHBvcnROYW1lLFxyXG4gICAgICAgIGNhbm9uaWNhbE5hbWU6IG9wdHMubmFtZVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcbiAgaWYgKGlzTGlmZWN5Y2xlKSB7XHJcbiAgICBjdHgubW9kdWxlRGVmLmxpZmVDeWNsZVJlZHVjZXJzLnB1c2goe1xyXG4gICAgICBsaWZlY3ljbGVTcGVjOiBsaWZlY3ljbGUsXHJcbiAgICAgIGZ1bmN0aW9uTmFtZTogZXhwb3J0TmFtZVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGlmICghZm4ubmFtZSkge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGZuLCBcIm5hbWVcIiwgeyB2YWx1ZTogZXhwb3J0TmFtZSwgd3JpdGFibGU6IGZhbHNlIH0pO1xyXG4gIH1cclxuICBjdHgucmVkdWNlcnMucHVzaChmbik7XHJcbn1cclxuXHJcbi8vIHNyYy9zZXJ2ZXIvc2NoZW1hLnRzXHJcbnZhciBTY2hlbWFJbm5lciA9IGNsYXNzIGV4dGVuZHMgTW9kdWxlQ29udGV4dCB7XHJcbiAgc2NoZW1hVHlwZTtcclxuICBleGlzdGluZ0Z1bmN0aW9ucyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XHJcbiAgcmVkdWNlcnMgPSBbXTtcclxuICBwcm9jZWR1cmVzID0gW107XHJcbiAgdmlld3MgPSBbXTtcclxuICBhbm9uVmlld3MgPSBbXTtcclxuICAvKipcclxuICAgKiBNYXBzIFJlZHVjZXJFeHBvcnQgb2JqZWN0cyB0byB0aGUgbmFtZSBvZiB0aGUgcmVkdWNlci5cclxuICAgKiBVc2VkIGZvciByZXNvbHZpbmcgdGhlIHJlZHVjZXJzIG9mIHNjaGVkdWxlZCB0YWJsZXMuXHJcbiAgICovXHJcbiAgZnVuY3Rpb25FeHBvcnRzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcclxuICBwZW5kaW5nU2NoZWR1bGVzID0gW107XHJcbiAgY29uc3RydWN0b3IoZ2V0U2NoZW1hVHlwZSkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuc2NoZW1hVHlwZSA9IGdldFNjaGVtYVR5cGUodGhpcyk7XHJcbiAgfVxyXG4gIGRlZmluZUZ1bmN0aW9uKG5hbWUpIHtcclxuICAgIGlmICh0aGlzLmV4aXN0aW5nRnVuY3Rpb25zLmhhcyhuYW1lKSkge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxyXG4gICAgICAgIGBUaGVyZSBpcyBhbHJlYWR5IGEgcmVkdWNlciBvciBwcm9jZWR1cmUgd2l0aCB0aGUgbmFtZSAnJHtuYW1lfSdgXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmV4aXN0aW5nRnVuY3Rpb25zLmFkZChuYW1lKTtcclxuICB9XHJcbiAgcmVzb2x2ZVNjaGVkdWxlcygpIHtcclxuICAgIGZvciAoY29uc3QgeyByZWR1Y2VyLCBzY2hlZHVsZUF0Q29sLCB0YWJsZU5hbWUgfSBvZiB0aGlzLnBlbmRpbmdTY2hlZHVsZXMpIHtcclxuICAgICAgY29uc3QgZnVuY3Rpb25OYW1lID0gdGhpcy5mdW5jdGlvbkV4cG9ydHMuZ2V0KHJlZHVjZXIoKSk7XHJcbiAgICAgIGlmIChmdW5jdGlvbk5hbWUgPT09IHZvaWQgMCkge1xyXG4gICAgICAgIGNvbnN0IG1zZyA9IGBUYWJsZSAke3RhYmxlTmFtZX0gZGVmaW5lcyBhIHNjaGVkdWxlLCBidXQgaXQgc2VlbXMgbGlrZSB0aGUgYXNzb2NpYXRlZCBmdW5jdGlvbiB3YXMgbm90IGV4cG9ydGVkLmA7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihtc2cpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubW9kdWxlRGVmLnNjaGVkdWxlcy5wdXNoKHtcclxuICAgICAgICBzb3VyY2VOYW1lOiB2b2lkIDAsXHJcbiAgICAgICAgdGFibGVOYW1lLFxyXG4gICAgICAgIHNjaGVkdWxlQXRDb2wsXHJcbiAgICAgICAgZnVuY3Rpb25OYW1lXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxudmFyIFNjaGVtYSA9IGNsYXNzIHtcclxuICAjY3R4O1xyXG4gIGNvbnN0cnVjdG9yKGN0eCkge1xyXG4gICAgdGhpcy4jY3R4ID0gY3R4O1xyXG4gIH1cclxuICBbbW9kdWxlSG9va3NdKGV4cG9ydHMpIHtcclxuICAgIGNvbnN0IHJlZ2lzdGVyZWRTY2hlbWEgPSB0aGlzLiNjdHg7XHJcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCBtb2R1bGVFeHBvcnRdIG9mIE9iamVjdC5lbnRyaWVzKGV4cG9ydHMpKSB7XHJcbiAgICAgIGlmIChuYW1lID09PSBcImRlZmF1bHRcIikgY29udGludWU7XHJcbiAgICAgIGlmICghaXNNb2R1bGVFeHBvcnQobW9kdWxlRXhwb3J0KSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXHJcbiAgICAgICAgICBcImV4cG9ydGluZyBzb21ldGhpbmcgdGhhdCBpcyBub3QgYSBzcGFjZXRpbWUgZXhwb3J0XCJcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIGNoZWNrRXhwb3J0Q29udGV4dChtb2R1bGVFeHBvcnQsIHJlZ2lzdGVyZWRTY2hlbWEpO1xyXG4gICAgICBtb2R1bGVFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdKHJlZ2lzdGVyZWRTY2hlbWEsIG5hbWUpO1xyXG4gICAgfVxyXG4gICAgcmVnaXN0ZXJlZFNjaGVtYS5yZXNvbHZlU2NoZWR1bGVzKCk7XHJcbiAgICByZXR1cm4gbWFrZUhvb2tzKHJlZ2lzdGVyZWRTY2hlbWEpO1xyXG4gIH1cclxuICBnZXQgc2NoZW1hVHlwZSgpIHtcclxuICAgIHJldHVybiB0aGlzLiNjdHguc2NoZW1hVHlwZTtcclxuICB9XHJcbiAgZ2V0IG1vZHVsZURlZigpIHtcclxuICAgIHJldHVybiB0aGlzLiNjdHgubW9kdWxlRGVmO1xyXG4gIH1cclxuICBnZXQgdHlwZXNwYWNlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI2N0eC50eXBlc3BhY2U7XHJcbiAgfVxyXG4gIHJlZHVjZXIoLi4uYXJncykge1xyXG4gICAgbGV0IG9wdHMsIHBhcmFtcyA9IHt9LCBmbjtcclxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIFtmbl0gPSBhcmdzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6IHtcclxuICAgICAgICBsZXQgYXJnMTtcclxuICAgICAgICBbYXJnMSwgZm5dID0gYXJncztcclxuICAgICAgICBpZiAodHlwZW9mIGFyZzEubmFtZSA9PT0gXCJzdHJpbmdcIikgb3B0cyA9IGFyZzE7XHJcbiAgICAgICAgZWxzZSBwYXJhbXMgPSBhcmcxO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgMzpcclxuICAgICAgICBbb3B0cywgcGFyYW1zLCBmbl0gPSBhcmdzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1ha2VSZWR1Y2VyRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywgcGFyYW1zLCBmbik7XHJcbiAgfVxyXG4gIGluaXQoLi4uYXJncykge1xyXG4gICAgbGV0IG9wdHMsIGZuO1xyXG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgW2ZuXSA9IGFyZ3M7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICBbb3B0cywgZm5dID0gYXJncztcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiBtYWtlUmVkdWNlckV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHt9LCBmbiwgTGlmZWN5Y2xlLkluaXQpO1xyXG4gIH1cclxuICBjbGllbnRDb25uZWN0ZWQoLi4uYXJncykge1xyXG4gICAgbGV0IG9wdHMsIGZuO1xyXG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgW2ZuXSA9IGFyZ3M7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICBbb3B0cywgZm5dID0gYXJncztcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiBtYWtlUmVkdWNlckV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHt9LCBmbiwgTGlmZWN5Y2xlLk9uQ29ubmVjdCk7XHJcbiAgfVxyXG4gIGNsaWVudERpc2Nvbm5lY3RlZCguLi5hcmdzKSB7XHJcbiAgICBsZXQgb3B0cywgZm47XHJcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICBbZm5dID0gYXJncztcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIFtvcHRzLCBmbl0gPSBhcmdzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1ha2VSZWR1Y2VyRXhwb3J0KHRoaXMuI2N0eCwgb3B0cywge30sIGZuLCBMaWZlY3ljbGUuT25EaXNjb25uZWN0KTtcclxuICB9XHJcbiAgdmlldyhvcHRzLCByZXQsIGZuKSB7XHJcbiAgICByZXR1cm4gbWFrZVZpZXdFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCB7fSwgcmV0LCBmbik7XHJcbiAgfVxyXG4gIC8vIFRPRE86IHJlLWVuYWJsZSBvbmNlIHBhcmFtZXRlcml6ZWQgdmlld3MgYXJlIHN1cHBvcnRlZCBpbiBTUUxcclxuICAvLyB2aWV3PFJldCBleHRlbmRzIFZpZXdSZXR1cm5UeXBlQnVpbGRlcj4oXHJcbiAgLy8gICBvcHRzOiBWaWV3T3B0cyxcclxuICAvLyAgIHJldDogUmV0LFxyXG4gIC8vICAgZm46IFZpZXdGbjxTLCB7fSwgUmV0PlxyXG4gIC8vICk6IHZvaWQ7XHJcbiAgLy8gdmlldzxQYXJhbXMgZXh0ZW5kcyBQYXJhbXNPYmosIFJldCBleHRlbmRzIFZpZXdSZXR1cm5UeXBlQnVpbGRlcj4oXHJcbiAgLy8gICBvcHRzOiBWaWV3T3B0cyxcclxuICAvLyAgIHBhcmFtczogUGFyYW1zLFxyXG4gIC8vICAgcmV0OiBSZXQsXHJcbiAgLy8gICBmbjogVmlld0ZuPFMsIHt9LCBSZXQ+XHJcbiAgLy8gKTogdm9pZDtcclxuICAvLyB2aWV3PFBhcmFtcyBleHRlbmRzIFBhcmFtc09iaiwgUmV0IGV4dGVuZHMgVmlld1JldHVyblR5cGVCdWlsZGVyPihcclxuICAvLyAgIG9wdHM6IFZpZXdPcHRzLFxyXG4gIC8vICAgcGFyYW1zT3JSZXQ6IFJldCB8IFBhcmFtcyxcclxuICAvLyAgIHJldE9yRm46IFZpZXdGbjxTLCB7fSwgUmV0PiB8IFJldCxcclxuICAvLyAgIG1heWJlRm4/OiBWaWV3Rm48UywgUGFyYW1zLCBSZXQ+XHJcbiAgLy8gKTogdm9pZCB7XHJcbiAgLy8gICBpZiAodHlwZW9mIHJldE9yRm4gPT09ICdmdW5jdGlvbicpIHtcclxuICAvLyAgICAgZGVmaW5lVmlldyhuYW1lLCBmYWxzZSwge30sIHBhcmFtc09yUmV0IGFzIFJldCwgcmV0T3JGbik7XHJcbiAgLy8gICB9IGVsc2Uge1xyXG4gIC8vICAgICBkZWZpbmVWaWV3KG5hbWUsIGZhbHNlLCBwYXJhbXNPclJldCBhcyBQYXJhbXMsIHJldE9yRm4sIG1heWJlRm4hKTtcclxuICAvLyAgIH1cclxuICAvLyB9XHJcbiAgYW5vbnltb3VzVmlldyhvcHRzLCByZXQsIGZuKSB7XHJcbiAgICByZXR1cm4gbWFrZUFub25WaWV3RXhwb3J0KHRoaXMuI2N0eCwgb3B0cywge30sIHJldCwgZm4pO1xyXG4gIH1cclxuICBwcm9jZWR1cmUoLi4uYXJncykge1xyXG4gICAgbGV0IG9wdHMsIHBhcmFtcyA9IHt9LCByZXQsIGZuO1xyXG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgW3JldCwgZm5dID0gYXJncztcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAzOiB7XHJcbiAgICAgICAgbGV0IGFyZzE7XHJcbiAgICAgICAgW2FyZzEsIHJldCwgZm5dID0gYXJncztcclxuICAgICAgICBpZiAodHlwZW9mIGFyZzEubmFtZSA9PT0gXCJzdHJpbmdcIikgb3B0cyA9IGFyZzE7XHJcbiAgICAgICAgZWxzZSBwYXJhbXMgPSBhcmcxO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgNDpcclxuICAgICAgICBbb3B0cywgcGFyYW1zLCByZXQsIGZuXSA9IGFyZ3M7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWFrZVByb2NlZHVyZUV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHBhcmFtcywgcmV0LCBmbik7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEJ1bmRsZSBtdWx0aXBsZSByZWR1Y2VycywgcHJvY2VkdXJlcywgZXRjIGludG8gb25lIHZhbHVlIHRvIGV4cG9ydC5cclxuICAgKiBUaGUgbmFtZSB0aGV5IHdpbGwgYmUgZXhwb3J0ZWQgd2l0aCBpcyB0aGVpciBjb3JyZXNwb25kaW5nIGtleSBpbiB0aGUgYGV4cG9ydHNgIGFyZ3VtZW50LlxyXG4gICAqL1xyXG4gIGV4cG9ydEdyb3VwKGV4cG9ydHMpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIFtleHBvcnRDb250ZXh0XTogdGhpcy4jY3R4LFxyXG4gICAgICBbcmVnaXN0ZXJFeHBvcnRdKGN0eCwgX2V4cG9ydE5hbWUpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IFtleHBvcnROYW1lLCBtb2R1bGVFeHBvcnRdIG9mIE9iamVjdC5lbnRyaWVzKGV4cG9ydHMpKSB7XHJcbiAgICAgICAgICBjaGVja0V4cG9ydENvbnRleHQobW9kdWxlRXhwb3J0LCBjdHgpO1xyXG4gICAgICAgICAgbW9kdWxlRXhwb3J0W3JlZ2lzdGVyRXhwb3J0XShjdHgsIGV4cG9ydE5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgY2xpZW50VmlzaWJpbGl0eUZpbHRlciA9IHtcclxuICAgIHNxbDogKGZpbHRlcikgPT4gKHtcclxuICAgICAgW2V4cG9ydENvbnRleHRdOiB0aGlzLiNjdHgsXHJcbiAgICAgIFtyZWdpc3RlckV4cG9ydF0oY3R4LCBfZXhwb3J0TmFtZSkge1xyXG4gICAgICAgIGN0eC5tb2R1bGVEZWYucm93TGV2ZWxTZWN1cml0eS5wdXNoKHsgc3FsOiBmaWx0ZXIgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfTtcclxufTtcclxudmFyIHJlZ2lzdGVyRXhwb3J0ID0gU3ltYm9sKFwiU3BhY2V0aW1lREIucmVnaXN0ZXJFeHBvcnRcIik7XHJcbnZhciBleHBvcnRDb250ZXh0ID0gU3ltYm9sKFwiU3BhY2V0aW1lREIuZXhwb3J0Q29udGV4dFwiKTtcclxuZnVuY3Rpb24gaXNNb2R1bGVFeHBvcnQoeCkge1xyXG4gIHJldHVybiAodHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIiB8fCB0eXBlb2YgeCA9PT0gXCJvYmplY3RcIikgJiYgeCAhPT0gbnVsbCAmJiByZWdpc3RlckV4cG9ydCBpbiB4O1xyXG59XHJcbmZ1bmN0aW9uIGNoZWNrRXhwb3J0Q29udGV4dChleHAsIHNjaGVtYTIpIHtcclxuICBpZiAoZXhwW2V4cG9ydENvbnRleHRdICE9IG51bGwgJiYgZXhwW2V4cG9ydENvbnRleHRdICE9PSBzY2hlbWEyKSB7XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwibXVsdGlwbGUgc2NoZW1hcyBhcmUgbm90IHN1cHBvcnRlZFwiKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gc2NoZW1hKHRhYmxlcywgbW9kdWxlU2V0dGluZ3MpIHtcclxuICBjb25zdCBjdHggPSBuZXcgU2NoZW1hSW5uZXIoKGN0eDIpID0+IHtcclxuICAgIGlmIChtb2R1bGVTZXR0aW5ncz8uQ0FTRV9DT05WRVJTSU9OX1BPTElDWSAhPSBudWxsKSB7XHJcbiAgICAgIGN0eDIuc2V0Q2FzZUNvbnZlcnNpb25Qb2xpY3kobW9kdWxlU2V0dGluZ3MuQ0FTRV9DT05WRVJTSU9OX1BPTElDWSk7XHJcbiAgICB9XHJcbiAgICBjb25zdCB0YWJsZVNjaGVtYXMgPSB7fTtcclxuICAgIGZvciAoY29uc3QgW2FjY05hbWUsIHRhYmxlMl0gb2YgT2JqZWN0LmVudHJpZXModGFibGVzKSkge1xyXG4gICAgICBjb25zdCB0YWJsZURlZiA9IHRhYmxlMi50YWJsZURlZihjdHgyLCBhY2NOYW1lKTtcclxuICAgICAgdGFibGVTY2hlbWFzW2FjY05hbWVdID0gdGFibGVUb1NjaGVtYShhY2NOYW1lLCB0YWJsZTIsIHRhYmxlRGVmKTtcclxuICAgICAgY3R4Mi5tb2R1bGVEZWYudGFibGVzLnB1c2godGFibGVEZWYpO1xyXG4gICAgICBpZiAodGFibGUyLnNjaGVkdWxlKSB7XHJcbiAgICAgICAgY3R4Mi5wZW5kaW5nU2NoZWR1bGVzLnB1c2goe1xyXG4gICAgICAgICAgLi4udGFibGUyLnNjaGVkdWxlLFxyXG4gICAgICAgICAgdGFibGVOYW1lOiB0YWJsZURlZi5zb3VyY2VOYW1lXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRhYmxlMi50YWJsZU5hbWUpIHtcclxuICAgICAgICBjdHgyLm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XHJcbiAgICAgICAgICB0YWc6IFwiVGFibGVcIixcclxuICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgIHNvdXJjZU5hbWU6IGFjY05hbWUsXHJcbiAgICAgICAgICAgIGNhbm9uaWNhbE5hbWU6IHRhYmxlMi50YWJsZU5hbWVcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHsgdGFibGVzOiB0YWJsZVNjaGVtYXMgfTtcclxuICB9KTtcclxuICByZXR1cm4gbmV3IFNjaGVtYShjdHgpO1xyXG59XHJcblxyXG4vLyBzcmMvc2VydmVyL2NvbnNvbGUudHNcclxudmFyIGltcG9ydF9vYmplY3RfaW5zcGVjdCA9IF9fdG9FU00ocmVxdWlyZV9vYmplY3RfaW5zcGVjdCgpKTtcclxudmFyIGZtdExvZyA9ICguLi5kYXRhKSA9PiBkYXRhLm1hcCgoeCkgPT4gdHlwZW9mIHggPT09IFwic3RyaW5nXCIgPyB4IDogKDAsIGltcG9ydF9vYmplY3RfaW5zcGVjdC5kZWZhdWx0KSh4KSkuam9pbihcIiBcIik7XHJcbnZhciBjb25zb2xlX2xldmVsX2Vycm9yID0gMDtcclxudmFyIGNvbnNvbGVfbGV2ZWxfd2FybiA9IDE7XHJcbnZhciBjb25zb2xlX2xldmVsX2luZm8gPSAyO1xyXG52YXIgY29uc29sZV9sZXZlbF9kZWJ1ZyA9IDM7XHJcbnZhciBjb25zb2xlX2xldmVsX3RyYWNlID0gNDtcclxudmFyIHRpbWVyTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcclxudmFyIGNvbnNvbGUyID0ge1xyXG4gIC8vIEB0cy1leHBlY3QtZXJyb3Igd2Ugd2FudCBhIGJsYW5rIHByb3RvdHlwZSwgYnV0IHR5cGVzY3JpcHQgY29tcGxhaW5zXHJcbiAgX19wcm90b19fOiB7fSxcclxuICBbU3ltYm9sLnRvU3RyaW5nVGFnXTogXCJjb25zb2xlXCIsXHJcbiAgYXNzZXJ0OiAoY29uZGl0aW9uID0gZmFsc2UsIC4uLmRhdGEpID0+IHtcclxuICAgIGlmICghY29uZGl0aW9uKSB7XHJcbiAgICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2Vycm9yLCBmbXRMb2coLi4uZGF0YSkpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgY2xlYXI6ICgpID0+IHtcclxuICB9LFxyXG4gIGRlYnVnOiAoLi4uZGF0YSkgPT4ge1xyXG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfZGVidWcsIGZtdExvZyguLi5kYXRhKSk7XHJcbiAgfSxcclxuICBlcnJvcjogKC4uLmRhdGEpID0+IHtcclxuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2Vycm9yLCBmbXRMb2coLi4uZGF0YSkpO1xyXG4gIH0sXHJcbiAgaW5mbzogKC4uLmRhdGEpID0+IHtcclxuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2luZm8sIGZtdExvZyguLi5kYXRhKSk7XHJcbiAgfSxcclxuICBsb2c6ICguLi5kYXRhKSA9PiB7XHJcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2coLi4uZGF0YSkpO1xyXG4gIH0sXHJcbiAgdGFibGU6ICh0YWJ1bGFyRGF0YSwgX3Byb3BlcnRpZXMpID0+IHtcclxuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2luZm8sIGZtdExvZyh0YWJ1bGFyRGF0YSkpO1xyXG4gIH0sXHJcbiAgdHJhY2U6ICguLi5kYXRhKSA9PiB7XHJcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF90cmFjZSwgZm10TG9nKC4uLmRhdGEpKTtcclxuICB9LFxyXG4gIHdhcm46ICguLi5kYXRhKSA9PiB7XHJcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF93YXJuLCBmbXRMb2coLi4uZGF0YSkpO1xyXG4gIH0sXHJcbiAgZGlyOiAoX2l0ZW0sIF9vcHRpb25zKSA9PiB7XHJcbiAgfSxcclxuICBkaXJ4bWw6ICguLi5fZGF0YSkgPT4ge1xyXG4gIH0sXHJcbiAgLy8gQ291bnRpbmdcclxuICBjb3VudDogKF9sYWJlbCA9IFwiZGVmYXVsdFwiKSA9PiB7XHJcbiAgfSxcclxuICBjb3VudFJlc2V0OiAoX2xhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcclxuICB9LFxyXG4gIC8vIEdyb3VwaW5nXHJcbiAgZ3JvdXA6ICguLi5fZGF0YSkgPT4ge1xyXG4gIH0sXHJcbiAgZ3JvdXBDb2xsYXBzZWQ6ICguLi5fZGF0YSkgPT4ge1xyXG4gIH0sXHJcbiAgZ3JvdXBFbmQ6ICgpID0+IHtcclxuICB9LFxyXG4gIC8vIFRpbWluZ1xyXG4gIHRpbWU6IChsYWJlbCA9IFwiZGVmYXVsdFwiKSA9PiB7XHJcbiAgICBpZiAodGltZXJNYXAuaGFzKGxhYmVsKSkge1xyXG4gICAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF93YXJuLCBgVGltZXIgJyR7bGFiZWx9JyBhbHJlYWR5IGV4aXN0cy5gKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGltZXJNYXAuc2V0KGxhYmVsLCBzeXMuY29uc29sZV90aW1lcl9zdGFydChsYWJlbCkpO1xyXG4gIH0sXHJcbiAgdGltZUxvZzogKGxhYmVsID0gXCJkZWZhdWx0XCIsIC4uLmRhdGEpID0+IHtcclxuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2luZm8sIGZtdExvZyhsYWJlbCwgLi4uZGF0YSkpO1xyXG4gIH0sXHJcbiAgdGltZUVuZDogKGxhYmVsID0gXCJkZWZhdWx0XCIpID0+IHtcclxuICAgIGNvbnN0IHNwYW5JZCA9IHRpbWVyTWFwLmdldChsYWJlbCk7XHJcbiAgICBpZiAoc3BhbklkID09PSB2b2lkIDApIHtcclxuICAgICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgYFRpbWVyICcke2xhYmVsfScgZG9lcyBub3QgZXhpc3QuYCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHN5cy5jb25zb2xlX3RpbWVyX2VuZChzcGFuSWQpO1xyXG4gICAgdGltZXJNYXAuZGVsZXRlKGxhYmVsKTtcclxuICB9LFxyXG4gIC8vIEFkZGl0aW9uYWwgY29uc29sZSBtZXRob2RzIHRvIHNhdGlzZnkgdGhlIENvbnNvbGUgaW50ZXJmYWNlXHJcbiAgdGltZVN0YW1wOiAoKSA9PiB7XHJcbiAgfSxcclxuICBwcm9maWxlOiAoKSA9PiB7XHJcbiAgfSxcclxuICBwcm9maWxlRW5kOiAoKSA9PiB7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL3NlcnZlci9wb2x5ZmlsbHMudHNcclxuZ2xvYmFsVGhpcy5jb25zb2xlID0gY29uc29sZTI7XHJcbi8qISBCdW5kbGVkIGxpY2Vuc2UgaW5mb3JtYXRpb246XHJcblxyXG5zdGF0dXNlcy9pbmRleC5qczpcclxuICAoKiFcclxuICAgKiBzdGF0dXNlc1xyXG4gICAqIENvcHlyaWdodChjKSAyMDE0IEpvbmF0aGFuIE9uZ1xyXG4gICAqIENvcHlyaWdodChjKSAyMDE2IERvdWdsYXMgQ2hyaXN0b3BoZXIgV2lsc29uXHJcbiAgICogTUlUIExpY2Vuc2VkXHJcbiAgICopXHJcbiovXHJcblxyXG5leHBvcnQgeyBBcnJheUJ1aWxkZXIsIEFycmF5Q29sdW1uQnVpbGRlciwgQm9vbEJ1aWxkZXIsIEJvb2xDb2x1bW5CdWlsZGVyLCBCb29sZWFuRXhwciwgQnl0ZUFycmF5QnVpbGRlciwgQnl0ZUFycmF5Q29sdW1uQnVpbGRlciwgQ2FzZUNvbnZlcnNpb25Qb2xpY3ksIENvbHVtbkJ1aWxkZXIsIENvbHVtbkV4cHJlc3Npb24sIENvbm5lY3Rpb25JZEJ1aWxkZXIsIENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIsIEYzMkJ1aWxkZXIsIEYzMkNvbHVtbkJ1aWxkZXIsIEY2NEJ1aWxkZXIsIEY2NENvbHVtbkJ1aWxkZXIsIEkxMjhCdWlsZGVyLCBJMTI4Q29sdW1uQnVpbGRlciwgSTE2QnVpbGRlciwgSTE2Q29sdW1uQnVpbGRlciwgSTI1NkJ1aWxkZXIsIEkyNTZDb2x1bW5CdWlsZGVyLCBJMzJCdWlsZGVyLCBJMzJDb2x1bW5CdWlsZGVyLCBJNjRCdWlsZGVyLCBJNjRDb2x1bW5CdWlsZGVyLCBJOEJ1aWxkZXIsIEk4Q29sdW1uQnVpbGRlciwgSWRlbnRpdHlCdWlsZGVyLCBJZGVudGl0eUNvbHVtbkJ1aWxkZXIsIE9wdGlvbkJ1aWxkZXIsIE9wdGlvbkNvbHVtbkJ1aWxkZXIsIFByb2R1Y3RCdWlsZGVyLCBQcm9kdWN0Q29sdW1uQnVpbGRlciwgUmVmQnVpbGRlciwgUmVzdWx0QnVpbGRlciwgUmVzdWx0Q29sdW1uQnVpbGRlciwgUm93QnVpbGRlciwgU2NoZWR1bGVBdEJ1aWxkZXIsIFNjaGVkdWxlQXRDb2x1bW5CdWlsZGVyLCBTZW5kZXJFcnJvciwgU2ltcGxlU3VtQnVpbGRlciwgU2ltcGxlU3VtQ29sdW1uQnVpbGRlciwgU3BhY2V0aW1lSG9zdEVycm9yLCBTdHJpbmdCdWlsZGVyLCBTdHJpbmdDb2x1bW5CdWlsZGVyLCBTdW1CdWlsZGVyLCBTdW1Db2x1bW5CdWlsZGVyLCBUaW1lRHVyYXRpb25CdWlsZGVyLCBUaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyLCBUaW1lc3RhbXBCdWlsZGVyLCBUaW1lc3RhbXBDb2x1bW5CdWlsZGVyLCBUeXBlQnVpbGRlciwgVTEyOEJ1aWxkZXIsIFUxMjhDb2x1bW5CdWlsZGVyLCBVMTZCdWlsZGVyLCBVMTZDb2x1bW5CdWlsZGVyLCBVMjU2QnVpbGRlciwgVTI1NkNvbHVtbkJ1aWxkZXIsIFUzMkJ1aWxkZXIsIFUzMkNvbHVtbkJ1aWxkZXIsIFU2NEJ1aWxkZXIsIFU2NENvbHVtbkJ1aWxkZXIsIFU4QnVpbGRlciwgVThDb2x1bW5CdWlsZGVyLCBVdWlkQnVpbGRlciwgVXVpZENvbHVtbkJ1aWxkZXIsIGFuZCwgY3JlYXRlVGFibGVSZWZGcm9tRGVmLCBlcnJvcnMsIGV2YWx1YXRlQm9vbGVhbkV4cHIsIGdldFF1ZXJ5QWNjZXNzb3JOYW1lLCBnZXRRdWVyeVRhYmxlTmFtZSwgZ2V0UXVlcnlXaGVyZUNsYXVzZSwgaXNSb3dUeXBlZFF1ZXJ5LCBpc1R5cGVkUXVlcnksIGxpdGVyYWwsIG1ha2VRdWVyeUJ1aWxkZXIsIG5vdCwgb3IsIHNjaGVtYSwgdCwgdGFibGUsIHRvQ2FtZWxDYXNlLCB0b0NvbXBhcmFibGVWYWx1ZSwgdG9TcWwgfTtcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcFxyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5tanMubWFwIiwiaW1wb3J0IHsgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcblxyXG5leHBvcnQgY29uc3QgUm9sZSA9IHQuZW51bSgnUm9sZScsIHtcclxuICAgIEFkbWluOiB0LnVuaXQoKSxcclxuICAgIFRvdXJuYW1lbnRIb3N0OiB0LnVuaXQoKSxcclxuICAgIFVzZXI6IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBQYXRoID0gdC5lbnVtKCdQYXRoJywge1xyXG4gICAgQWJ1bmRhbmNlOiB0LnVuaXQoKSxcclxuICAgIERlc3RydWN0aW9uOiB0LnVuaXQoKSxcclxuICAgIEVydWRpdGlvbjogdC51bml0KCksXHJcbiAgICBIYXJtb255OiB0LnVuaXQoKSxcclxuICAgIEh1bnQ6IHQudW5pdCgpLFxyXG4gICAgTmloaWxpdHk6IHQudW5pdCgpLFxyXG4gICAgUHJlc2VydmF0aW9uOiB0LnVuaXQoKSxcclxuICAgIFJlbWVtYnJhbmNlOiB0LnVuaXQoKSxcclxuICAgIEVsYXRpb246IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBFbGVtZW50ID0gdC5lbnVtKCdFbGVtZW50Jywge1xyXG4gICAgRmlyZTogdC51bml0KCksXHJcbiAgICBJY2U6IHQudW5pdCgpLFxyXG4gICAgSW1hZ2luYXJ5OiB0LnVuaXQoKSxcclxuICAgIExpZ2h0bmluZzogdC51bml0KCksXHJcbiAgICBQaHlzaWNhbDogdC51bml0KCksXHJcbiAgICBRdWFudHVtOiB0LnVuaXQoKSxcclxuICAgIFdpbmQ6IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBDaGFyUm9sZSA9IHQuZW51bSgnQ2hhclJvbGUnLCB7XHJcbiAgICBEcHM6IHQudW5pdCgpLFxyXG4gICAgU3VzdGFpbjogdC51bml0KCksXHJcbiAgICBTdXBwb3J0OiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgR2FtZU1vZGUgPSB0LmVudW0oJ0dhbWVNb2RlJywge1xyXG4gICAgTWVtb3J5T2ZDaGFvczogdC51bml0KCksXHJcbiAgICBBcG9jYWx5cHRpY1NoYWRvdzogdC51bml0KCksXHJcbiAgICBBbm9tYWx5QXJiaXRyYXRpb246IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBEcmFmdE1vZGUgPSB0LmVudW0oJ0RyYWZ0TW9kZScsIHtcclxuICAgIENsYXNzaWM6IHQudW5pdCgpLFxyXG4gICAgQXVjdGlvbjogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEJhbk1vZGUgPSB0LmVudW0oJ0Jhbk1vZGUnLCB7XHJcbiAgICBOb25lOiB0LnVuaXQoKSxcclxuICAgIFR3bzogdC51bml0KCksXHJcbiAgICBGb3VyOiB0LnVuaXQoKSxcclxuICAgIFNpeDogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IExvYmJ5U3RhZ2UgPSB0LmVudW0oJ0xvYmJ5U3RhZ2UnLCB7XHJcbiAgICBXYWl0aW5nOiB0LnVuaXQoKSxcclxuICAgIERyYWZ0aW5nOiB0LnVuaXQoKSxcclxuICAgIEZpbmlzaGVkOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgUGFydGljaXBhdGlvblJvbGUgPSB0LmVudW0oJ1BhcnRpY2lwYXRpb25Sb2xlJywge1xyXG4gICAgUGxheWVyOiB0LnVuaXQoKSxcclxuICAgIFNwZWN0YXRvcjogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRlYW1MYWJlbCA9IHQuZW51bSgnVGVhbUxhYmVsJywge1xyXG4gICAgU3BlY3RhdG9yOiB0LnVuaXQoKSxcclxuICAgIEJsdWU6IHQudW5pdCgpLFxyXG4gICAgUmVkOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgTWF0Y2hSZXN1bHQgPSB0LmVudW0oJ01hdGNoUmVzdWx0Jywge1xyXG4gICAgQmx1ZVdpbnM6IHQudW5pdCgpLFxyXG4gICAgUmVkV2luczogdC51bml0KCksXHJcbiAgICBEcmF3OiB0LnVuaXQoKSxcclxuICAgIEFib3J0ZWQ6IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBBY3Rpb25UeXBlID0gdC5lbnVtKCdBY3Rpb25UeXBlJywge1xyXG4gICAgUGljazogdC51bml0KCksXHJcbiAgICBCYW46IHQudW5pdCgpLFxyXG4gICAgTm9taW5hdGU6IHQudW5pdCgpLFxyXG4gICAgQmlkOiB0LnVuaXQoKSxcclxuICAgIEF1Y3Rpb25Tb2xkOiB0LnVuaXQoKSxcclxuICAgIFBhdXNlOiB0LnVuaXQoKSxcclxuICAgIFVuZG86IHQudW5pdCgpLFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IFJvbGUgfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcblxyXG5leHBvcnQgY29uc3QgVXNlciA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICd1c2VyJyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIGluZGV4ZXM6IFtcclxuICAgICAgICB7IG5hbWU6ICd1c2VyX2Rpc2NvcmRfaWQnLCBhY2Nlc3NvcjogJ3VzZXJfZGlzY29yZF9pZCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydkaXNjb3JkSWQnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBpZDogdC51MzIoKS5wcmltYXJ5S2V5KCkuYXV0b0luYygpLFxyXG4gICAgdXNlcm5hbWU6IHQuc3RyaW5nKCkudW5pcXVlKCksXHJcbiAgICBkaXNwbGF5TmFtZTogdC5zdHJpbmcoKSxcclxuICAgIGlzR3Vlc3Q6IHQuYm9vbCgpLFxyXG4gICAgbGFzdExvZ2luQXQ6IHQudGltZXN0YW1wKCksXHJcbiAgICByb2xlOiBSb2xlLFxyXG4gICAgZGlzY29yZElkOiB0LnN0cmluZygpLm9wdGlvbmFsKCksXHJcbiAgICBhdmF0YXJDaGFyYWN0ZXJOYW1lOiB0LnN0cmluZygpLCAvLyBGSyByZWZlcmVuY2UgdG8gSHNyQ2hhcmFjdGVyIG5hbWVcclxufSk7XHJcbiIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuXHJcbi8qKlxyXG4gKiBNYXBzIFNwYWNldGltZURCIGlkZW50aXRpZXMgKHBlci1kZXZpY2UpIHRvIHBlcnNpc3RlbnQgVXNlciBJRHMgKG1hbnktdG8tb25lKS5cclxuICogRWFjaCBkZXZpY2UvYnJvd3NlciBnZW5lcmF0ZXMgYSB1bmlxdWUgaWRlbnRpdHk7IHRoaXMgdGFibGUgbGlua3MgdGhlbSBhbGxcclxuICogYmFjayB0byBhIHNpbmdsZSBVc2VyIHJlY29yZC5cclxuICovXHJcbmV4cG9ydCBjb25zdCBVc2VySWRlbnRpdHkgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAndXNlcl9pZGVudGl0eScsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICBpbmRleGVzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAndXNlcl9pZGVudGl0eV91c2VyX2lkJywgYWNjZXNzb3I6ICd1c2VyX2lkZW50aXR5X3VzZXJfaWQnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsndXNlcklkJ10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgaWRlbnRpdHk6IHQuaWRlbnRpdHkoKS5wcmltYXJ5S2V5KCksXHJcbiAgICB1c2VySWQ6IHQudTMyKCksXHJcbiAgICBsYXN0U2VlbkF0OiB0LnRpbWVzdGFtcCgpLCAvLyBGb3IgZnV0dXJlIGNsZWFudXAgb2Ygc3RhbGUgaWRlbnRpdHkgbWFwcGluZ3NcclxufSk7XHJcbiIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgUGF0aCwgRWxlbWVudCwgQ2hhclJvbGUgfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcbi8vIFBlb3BsZSBmcm9tIHRoZSBmb3J1bXMgc2F5IHdlIGRvbnQgbmVlZCBcIm5hbWVcIjogWFhYWFhYWFhYIG9uIGluZGV4ZXMgYW55bW9yZVxyXG5leHBvcnQgY29uc3QgSHNyQ2hhcmFjdGVyID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ2hzcl9jaGFyYWN0ZXInLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2NoYXJhY3Rlcl9ieV9wYXRoJywgYWNjZXNzb3I6ICdjaGFyYWN0ZXJfYnlfcGF0aCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydwYXRoJ10gfSxcclxuICAgICAgICB7IG5hbWU6ICdjaGFyYWN0ZXJfYnlfZWxlbWVudCcsIGFjY2Vzc29yOiAnY2hhcmFjdGVyX2J5X2VsZW1lbnQnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsnZWxlbWVudCddIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY2hhcmFjdGVyX2J5X3JvbGUnLCBhY2Nlc3NvcjogJ2NoYXJhY3Rlcl9ieV9yb2xlJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3JvbGUnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBuYW1lOiB0LnN0cmluZygpLnByaW1hcnlLZXkoKSxcclxuICAgIGRpc3BsYXlOYW1lOiB0LnN0cmluZygpLFxyXG4gICAgYWxpYXNlczogdC5hcnJheSh0LnN0cmluZygpKSxcclxuICAgIHJhcml0eTogdC51OCgpLFxyXG4gICAgcGF0aDogUGF0aCxcclxuICAgIGVsZW1lbnQ6IEVsZW1lbnQsXHJcbiAgICByb2xlOiBDaGFyUm9sZSxcclxuICAgIGltYWdlVXJsOiB0LnN0cmluZygpLFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IFBhdGggfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcblxyXG5leHBvcnQgY29uc3QgSHNyTGlnaHRjb25lID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ2hzcl9saWdodGNvbmUnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2xpZ2h0Y29uZV9ieV9wYXRoJywgYWNjZXNzb3I6ICdsaWdodGNvbmVfYnlfcGF0aCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydwYXRoJ10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgbmFtZTogdC5zdHJpbmcoKS5wcmltYXJ5S2V5KCksXHJcbiAgICBkaXNwbGF5TmFtZTogdC5zdHJpbmcoKSxcclxuICAgIGFsaWFzZXM6IHQuYXJyYXkodC5zdHJpbmcoKSksXHJcbiAgICBwYXRoOiBQYXRoLFxyXG4gICAgcmFyaXR5OiB0LnU4KCksXHJcbiAgICBpbWFnZVVybDogdC5zdHJpbmcoKSxcclxuXHJcbiAgICAvLyBDU1MgcG9zaXRpb25pbmcgY29ycmVjdGlvbnMgZm9yIHRoZSBVSVxyXG4gICAgcG9zWDogdC5pMzIoKSxcclxuICAgIHBvc1k6IHQuaTMyKCksXHJcbiAgICB3aWR0aDogdC5pMzIoKSxcclxufSk7IiwiaW1wb3J0IHsgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7XHJcbiAgICBEcmFmdE1vZGUsXHJcbiAgICBCYW5Nb2RlLFxyXG4gICAgQWN0aW9uVHlwZSxcclxuICAgIFRlYW1MYWJlbFxyXG59IGZyb20gJy4vZW51bXMnO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0gU1RSVUNUUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZXhwb3J0IGNvbnN0IExvYmJ5Q29uZmlnID0gdC5vYmplY3QoJ0xvYmJ5Q29uZmlnJywge1xyXG4gICAgdGVhbV9zaXplOiB0LnU4KCksICAgICAgICAgICAgICAgLy8gMSwgMiwgb3IgM1xyXG4gICAgZHJhZnRfbW9kZTogRHJhZnRNb2RlLFxyXG4gICAgYmFuX21vZGU6IEJhbk1vZGUsXHJcbiAgICBzdGFuZGFyZF90dXJuX3NlY29uZHM6IHQudTMyKCksXHJcbiAgICByZXNlcnZlX2Jhbmtfc2Vjb25kczogdC51MzIoKSxcclxuICAgIGF1Y3Rpb25fYnVkZ2V0OiB0LmYzMigpLm9wdGlvbmFsKCksXHJcblxyXG4gICAgLy8gQmFsYW5jZSBNYXRoXHJcbiAgICByb3N0ZXJfZGlmZl9hZHZhbnRhZ2U6IHQuZjMyKCksXHJcbiAgICByb3N0ZXJfdGhyZXNob2xkOiB0LmYzMigpLFxyXG4gICAgdW5kZXJfdGhyZXNob2xkX2FkdmFudGFnZTogdC5mMzIoKSxcclxuICAgIGFib3ZlX3RocmVzaG9sZF9wZW5hbHR5OiB0LmYzMigpLFxyXG4gICAgZGVhdGhfcGVuYWx0eTogdC5mMzIoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgUGxheWVyU25hcHNob3QgPSB0Lm9iamVjdCgnUGxheWVyU25hcHNob3QnLCB7XHJcbiAgICB1c2VySWQ6IHQudTMyKCksXHJcbiAgICBkaXNwbGF5X25hbWU6IHQuc3RyaW5nKCksXHJcbiAgICBhdmF0YXJfdXJsOiB0LnN0cmluZygpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBUaW1lclN0YXRlID0gdC5vYmplY3QoJ1RpbWVyU3RhdGUnLCB7XHJcbiAgICB0dXJuX3N0YXJ0X2F0OiB0LnRpbWVzdGFtcCgpLFxyXG4gICAgdGVhbV9ibHVlX3Jlc2VydmVfbXM6IHQudTMyKCksXHJcbiAgICB0ZWFtX3JlZF9yZXNlcnZlX21zOiB0LnUzMigpLFxyXG4gICAgaXNfcGF1c2VkOiB0LmJvb2woKSxcclxuICAgIGFjY3VtdWxhdGVkX3BhdXNlX21zOiB0LnUzMigpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBEcmFmdFN0ZXAgPSB0Lm9iamVjdCgnRHJhZnRTdGVwJywge1xyXG4gICAgYWN0aW9uX3JlcXVpcmVkOiBBY3Rpb25UeXBlLFxyXG4gICAgdGVhbV90dXJuOiBUZWFtTGFiZWwsXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEVpZG9sb25Db3N0ID0gdC5vYmplY3QoJ0VpZG9sb25Db3N0Jywge1xyXG4gICAgZTA6IHQuZjMyKCksXHJcbiAgICBlMTogdC5mMzIoKSxcclxuICAgIGUyOiB0LmYzMigpLFxyXG4gICAgZTM6IHQuZjMyKCksXHJcbiAgICBlNDogdC5mMzIoKSxcclxuICAgIGU1OiB0LmYzMigpLFxyXG4gICAgZTY6IHQuZjMyKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFN1cGVyaW1wb3NpdGlvbkNvc3QgPSB0Lm9iamVjdCgnU3VwZXJpbXBvc2l0aW9uQ29zdCcsIHtcclxuICAgIHMxOiB0LmYzMigpLFxyXG4gICAgczI6IHQuZjMyKCksXHJcbiAgICBzMzogdC5mMzIoKSxcclxuICAgIHM0OiB0LmYzMigpLFxyXG4gICAgczU6IHQuZjMyKCksXHJcbn0pO1xyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0gQUNUSU9OIFBBWUxPQURTIC0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIEluc3RlYWQgb2YgYSByYXcgSlNPTiBzdHJpbmcsIHdlIGRlZmluZSBhIFN1bSBUeXBlIChUYWdnZWQgVW5pb24pLlxyXG4vLyBUaGlzIHJlcGxhY2VzIHRoZSBcIkpTT05cIiBjb2x1bW4gd2l0aCBhIHR5cGUtc2FmZSBzdHJ1Y3R1cmUuXHJcblxyXG5leHBvcnQgY29uc3QgUGlja1BheWxvYWQgPSB0Lm9iamVjdCgnUGlja1BheWxvYWQnLCB7XHJcbiAgICBjaGFyYWN0ZXJfbmFtZTogdC5zdHJpbmcoKSxcclxuICAgIGVpZG9sb246IHQudTgoKSxcclxuICAgIGNvc3RfcGFpZDogdC5mMzIoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgQmFuUGF5bG9hZCA9IHQub2JqZWN0KCdCYW5QYXlsb2FkJywge1xyXG4gICAgY2hhcmFjdGVyX25hbWU6IHQuc3RyaW5nKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEJpZFBheWxvYWQgPSB0Lm9iamVjdCgnQmlkUGF5bG9hZCcsIHtcclxuICAgIGFtb3VudDogdC5mMzIoKSxcclxuICAgIHRhcmdldF9jaGFyYWN0ZXI6IHQuc3RyaW5nKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEF1Y3Rpb25Tb2xkUGF5bG9hZCA9IHQub2JqZWN0KCdBdWN0aW9uU29sZFBheWxvYWQnLCB7XHJcbiAgICBjaGFyYWN0ZXJfbmFtZTogdC5zdHJpbmcoKSxcclxuICAgIHdpbm5pbmdfYW1vdW50OiB0LmYzMigpLFxyXG4gICAgd2lubmluZ190ZWFtOiBUZWFtTGFiZWwsICAgIC8vIFdobyBhY3R1YWxseSBnb3QgaXRcclxuICAgIGVpZG9sb246IHQudTgoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgTm9taW5hdGVQYXlsb2FkID0gdC5vYmplY3QoJ05vbWluYXRlUGF5bG9hZCcsIHtcclxuICAgIGNoYXJhY3Rlcl9uYW1lOiB0LnN0cmluZygpLFxyXG4gICAgZWlkb2xvbjogdC51OCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBVbmRvUGF5bG9hZCA9IHQub2JqZWN0KCdVbmRvUGF5bG9hZCcsIHtcclxuICAgIG9yaWdpbmFsX3NlcXVlbmNlX2lkOiB0LnUzMigpLCAvLyBUaGUgSUQgb2YgdGhlIHN0ZXAgd2UgYXJlIHJldmVydGluZ1xyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBQYXVzZVBheWxvYWQgPSB0Lm9iamVjdCgnUGF1c2VQYXlsb2FkJywge1xyXG4gICAgdGltZV9yZW1haW5pbmdfbXM6IHQudTMyKCksICAgICAgICAvLyBTbmFwc2hvdCBvZiB0aGUgY2xvY2sgd2hlbiBwYXVzZWRcclxuICAgIGlzX2F1dG9fcGF1c2U6IHQuYm9vbCgpLCAgICAgICAgICAgLy8gVHJ1ZSBpZiBzeXN0ZW0gcGF1c2VkIChkaXNjb25uZWN0KSwgRmFsc2UgaWYgbWFudWFsXHJcbn0pO1xyXG5cclxuLy8gVGhlIFwiUG9seW1vcnBoaWNcIiBFbnVtIGNvbnRhaW5pbmcgdGhlIHNwZWNpZmljIHBheWxvYWRzXHJcbmV4cG9ydCBjb25zdCBTdGVwUGF5bG9hZCA9IHQuZW51bSgnU3RlcFBheWxvYWQnLCB7XHJcbiAgICBQaWNrOiBQaWNrUGF5bG9hZCxcclxuICAgIEJhbjogQmFuUGF5bG9hZCxcclxuICAgIEJpZDogQmlkUGF5bG9hZCxcclxuICAgIEF1Y3Rpb25Tb2xkOiBBdWN0aW9uU29sZFBheWxvYWQsXHJcbiAgICBOb21pbmF0ZTogTm9taW5hdGVQYXlsb2FkLFxyXG4gICAgVW5kbzogVW5kb1BheWxvYWQsXHJcbiAgICBQYXVzZTogUGF1c2VQYXlsb2FkLFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IEdhbWVNb2RlIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5pbXBvcnQgeyBFaWRvbG9uQ29zdCB9IGZyb20gJy4uL3R5cGVzL3N0cnVjdHMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IEhzckNoYXJhY3RlckNvc3QgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnaHNyX2NoYXJhY3Rlcl9jb3N0JyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIHByaW1hcnlLZXk6IFsnY2hhcmFjdGVyTmFtZScsICdnYW1lTW9kZSddLFxyXG59LCB7XHJcbiAgICBjaGFyYWN0ZXJOYW1lOiB0LnN0cmluZygpLFxyXG4gICAgZ2FtZU1vZGU6IEdhbWVNb2RlLFxyXG4gICAgY2xhc3NpY0Nvc3RzOiBFaWRvbG9uQ29zdCxcclxuICAgIGF1Y3Rpb25CYXNlQmlkOiBFaWRvbG9uQ29zdCxcclxufSk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBTdXBlcmltcG9zaXRpb25Db3N0IH0gZnJvbSAnLi4vdHlwZXMvc3RydWN0cyc7XHJcblxyXG5leHBvcnQgY29uc3QgSHNyTGlnaHRjb25lQ29zdCA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdoc3JfbGlnaHRjb25lX2Nvc3QnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG59LCB7XHJcbiAgICBsaWdodGNvbmVOYW1lOiB0LnN0cmluZygpLnByaW1hcnlLZXkoKSxcclxuICAgIGNsYXNzaWNDb3N0czogU3VwZXJpbXBvc2l0aW9uQ29zdCxcclxuICAgIGF1Y3Rpb25CYXNlQmlkOiBTdXBlcmltcG9zaXRpb25Db3N0LFxyXG59KTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IEdhbWVNb2RlIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IEhzclN5bmVyZ3lDb3N0ID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ2hzcl9zeW5lcmd5X2Nvc3QnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ3N5bmVyZ3lfc291cmNlX21vZGUnLCBhY2Nlc3NvcjogJ3N5bmVyZ3lfc291cmNlX21vZGUnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsnc291cmNlTmFtZScsICdnYW1lTW9kZSddIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnc3luZXJneV90YXJnZXQnLCBhY2Nlc3NvcjogJ3N5bmVyZ3lfdGFyZ2V0JywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3RhcmdldE5hbWUnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBpZDogdC51MzIoKS5wcmltYXJ5S2V5KCkuYXV0b0luYygpLFxyXG4gICAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcclxuICAgIHRhcmdldE5hbWU6IHQuc3RyaW5nKCksXHJcbiAgICBnYW1lTW9kZTogR2FtZU1vZGUsXHJcbiAgICBjb3N0TW9kaWZpZXI6IHQuZjMyKCksXHJcbn0pOyIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgTG9iYnlTdGFnZSB9IGZyb20gJy4uL3R5cGVzL2VudW1zJztcclxuaW1wb3J0IHsgTG9iYnlDb25maWcgfSBmcm9tICcuLi90eXBlcy9zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjb25zdCBMb2JieSA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdsb2JieScsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICBpbmRleGVzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnbG9iYnlfaG9zdCcsIGFjY2Vzc29yOiAnbG9iYnlfaG9zdCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydob3N0VXNlcklkJ10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLmF1dG9JbmMoKSxcclxuICAgIGpvaW5Db2RlOiB0LnN0cmluZygpLnVuaXF1ZSgpLFxyXG4gICAgaG9zdFVzZXJJZDogdC51MzIoKSxcclxuICAgIHRlYW1CbHVlQWxpYXM6IHQuc3RyaW5nKCksXHJcbiAgICB0ZWFtUmVkQWxpYXM6IHQuc3RyaW5nKCksXHJcblxyXG4gICAgLy8gTGlmZWN5Y2xlICYgR2FyYmFnZSBDb2xsZWN0aW9uXHJcbiAgICBob3N0RGlzY29ubmVjdFRpbWU6IHQudGltZXN0YW1wKCkub3B0aW9uYWwoKSxcclxuICAgIGxhc3RBY3Rpdml0eUF0OiB0LnRpbWVzdGFtcCgpLFxyXG5cclxuICAgIHN0YWdlOiBMb2JieVN0YWdlLFxyXG4gICAgY29uZmlnOiBMb2JieUNvbmZpZyxcclxufSk7XHJcbiIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgUGFydGljaXBhdGlvblJvbGUsIFRlYW1MYWJlbCB9IGZyb20gJy4uL3R5cGVzL2VudW1zJztcclxuXHJcbmV4cG9ydCBjb25zdCBMb2JieU1lbWJlciA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdsb2JieV9tZW1iZXInLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgcHJpbWFyeUtleTogWydsb2JieUlkJywgJ3VzZXJJZCddLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2xvYmJ5X21lbWJlcl9sb2JieV9pZCcsIGFjY2Vzc29yOiAnbG9iYnlfbWVtYmVyX2xvYmJ5X2lkJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ2xvYmJ5SWQnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBsb2JieUlkOiB0LnUzMigpLFxyXG4gICAgdXNlcklkOiB0LnUzMigpLFxyXG5cclxuICAgIGlzT25saW5lOiB0LmJvb2woKSxcclxuICAgIHBhcnRpY2lwYXRpb25Sb2xlOiBQYXJ0aWNpcGF0aW9uUm9sZSwgLy8gUGxheWVyIHZzIFNwZWN0YXRvclxyXG4gICAgaXNSZWZlcmVlOiB0LmJvb2woKSwgICAgLy8gQWRtaW4gcG93ZXJzIHdpdGhpbiB0aGlzIGxvYmJ5XHJcbiAgICB0ZWFtU2xvdDogVGVhbUxhYmVsLCAgICAvLyBCbHVlLCBSZWQsIG9yIFNwZWN0YXRvclxyXG59KTtcclxuIiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5cclxuZXhwb3J0IGNvbnN0IExvYmJ5Q3Vyc29yRXZlbnQgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnbG9iYnlfY3Vyc29yX2V2ZW50JyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIGV2ZW50OiB0cnVlLCAvLyBCcm9hZGNhc3RzIG9uSW5zZXJ0LCB0aGVuIGRlbGV0ZXMgaW1tZWRpYXRlbHkuXHJcbn0sIHtcclxuICAgIGxvYmJ5SWQ6IHQudTMyKCksXHJcbiAgICBzZW5kZXJVc2VySWQ6IHQudTMyKCksIC8vIFdobyBtb3ZlZCB0aGUgbW91c2UgKHBlcnNpc3RlbnQgVXNlciBJRClcclxuICAgIHg6IHQuZjMyKCksXHJcbiAgICB5OiB0LmYzMigpLFxyXG4gICAgdGltZXN0YW1wOiB0LnRpbWVzdGFtcCgpLFxyXG59KTtcclxuIiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBEcmFmdFN0ZXAsIFRpbWVyU3RhdGUgfSBmcm9tICcuLi90eXBlcy9zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjb25zdCBNYXRjaFNlc3Npb24gPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnbWF0Y2hfc2Vzc2lvbicsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICAvLyAxLXRvLTEgcmVsYXRpb25zaGlwIHdpdGggTG9iYnk6IFRoZSBMb2JieSBJRCBpcyB0aGUgUHJpbWFyeSBLZXlcclxufSwge1xyXG4gICAgbG9iYnlJZDogdC51MzIoKS5wcmltYXJ5S2V5KCksXHJcblxyXG4gICAgLy8gVGhlIGN1cnJlbnQgaW5kZXggaW50byB0aGUgJ2RyYWZ0U2VxdWVuY2UnIGFycmF5ICgwLWJhc2VkKVxyXG4gICAgdHVybkluZGV4OiB0LnUzMigpLFxyXG5cclxuICAgIC8vIFRoZSBnZW5lcmF0ZWQgc2NyaXB0IGZvciB0aGlzIG1hdGNoIChlLmcuIFtCYW4gQmx1ZSwgQmFuIFJlZCwgUGljayBCbHVlLi4uXSlcclxuICAgIGRyYWZ0U2VxdWVuY2U6IHQuYXJyYXkoRHJhZnRTdGVwKSxcclxuXHJcbiAgICAvLyBUcmFja3MgdHVybiB0aW1lcnMsIHJlc2VydmVzLCBhbmQgcGF1c2Ugc3RhdGVcclxuICAgIHRpbWVyU3RhdGU6IFRpbWVyU3RhdGUsXHJcblxyXG4gICAgLy8gQXVjdGlvbiBNb2RlIEJ1ZGdldHMgKElnbm9yZWQgaW4gQ2xhc3NpYylcclxuICAgIHRlYW1CbHVlQnVkZ2V0OiB0LmYzMigpLFxyXG4gICAgdGVhbVJlZEJ1ZGdldDogdC5mMzIoKSxcclxufSk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBBY3Rpb25UeXBlLCBUZWFtTGFiZWwgfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcbmltcG9ydCB7IFN0ZXBQYXlsb2FkIH0gZnJvbSAnLi4vdHlwZXMvc3RydWN0cyc7XHJcblxyXG5leHBvcnQgY29uc3QgTWF0Y2hTZXNzaW9uU3RlcCA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdtYXRjaF9zZXNzaW9uX3N0ZXAnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIC8vIEZhc3QgbG9va3VwOiBcIkdldCBmdWxsIGhpc3RvcnkgZm9yIExvYmJ5IDEyM1wiXHJcbiAgICAgICAgeyBuYW1lOiAnbWF0Y2hfaGlzdG9yeV9sb2JieScsIGFjY2Vzc29yOiAnbWF0Y2hfaGlzdG9yeV9sb2JieScsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydsb2JieUlkJ10gfSxcclxuICAgIF1cclxufSwge1xyXG4gICAgaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLmF1dG9JbmMoKSxcclxuXHJcbiAgICBsb2JieUlkOiB0LnUzMigpLCAgICAgIC8vIEZLIHRvIExvYmJ5L01hdGNoU2Vzc2lvblxyXG4gICAgc2VxdWVuY2U6IHQudTMyKCksICAgICAvLyAxLCAyLCAzLi4uIChTdHJpY3Qgb3JkZXJpbmcpXHJcblxyXG4gICAgYWN0b3JVc2VySWQ6IHQudTMyKCksIC8vIFdobyBwZXJmb3JtZWQgdGhlIGFjdGlvbiAocGVyc2lzdGVudCBVc2VyIElEKVxyXG4gICAgYWN0b3JTbG90OiBUZWFtTGFiZWwsICAvLyBCbHVlL1JlZC9TcGVjdGF0b3JcclxuXHJcbiAgICBhY3Rpb246IEFjdGlvblR5cGUsICAgIC8vIFBpY2ssIEJhbiwgQmlkLi4uXHJcblxyXG4gICAgcGF5bG9hZDogU3RlcFBheWxvYWQsXHJcbiAgICB0aW1lc3RhbXA6IHQudGltZXN0YW1wKCksXHJcbn0pO1xyXG4iLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IERyYWZ0TW9kZSwgR2FtZU1vZGUsIE1hdGNoUmVzdWx0IH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5pbXBvcnQgeyBQbGF5ZXJTbmFwc2hvdCwgTG9iYnlDb25maWcgfSBmcm9tICcuLi90eXBlcy9zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjb25zdCBNYXRjaFNlc3Npb25IaXN0b3J5ID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ21hdGNoX3Nlc3Npb25faGlzdG9yeScsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICBpbmRleGVzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnaGlzdG9yeV9wbGF5ZWRfYXQnLCBhY2Nlc3NvcjogJ2hpc3RvcnlfcGxheWVkX2F0JywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3BsYXllZEF0J10gfSxcclxuICAgICAgICB7IG5hbWU6ICdoaXN0b3J5X2dhbWVfbW9kZScsIGFjY2Vzc29yOiAnaGlzdG9yeV9nYW1lX21vZGUnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsnZ2FtZU1vZGUnXSB9LFxyXG4gICAgXVxyXG59LCB7XHJcbiAgICBpZDogdC5zdHJpbmcoKS5wcmltYXJ5S2V5KCksIC8vIFVVSUQgZ2VuZXJhdGVkIGF0IGdhbWUgZW5kXHJcbiAgICBsb2JieUNvZGU6IHQuc3RyaW5nKCksICAgICAgIC8vIEtlcHQgZm9yIHJlZmVyZW5jZSAoZS5nLiBcIlg3SzlQMlwiKVxyXG4gICAgcGxheWVkQXQ6IHQudGltZXN0YW1wKCksXHJcblxyXG4gICAgZHJhZnRNb2RlOiBEcmFmdE1vZGUsXHJcbiAgICBnYW1lTW9kZTogR2FtZU1vZGUsXHJcblxyXG4gICAgdGVhbUJsdWVBbGlhczogdC5zdHJpbmcoKSxcclxuICAgIHRlYW1SZWRBbGlhczogdC5zdHJpbmcoKSxcclxuXHJcbiAgICAvLyBGdWxsIHNuYXBzaG90cyBvZiBwbGF5ZXJzIGF0IHRoZSB0aW1lIG9mIHRoZSBtYXRjaFxyXG4gICAgYmx1ZVRlYW1NZW1iZXJzOiB0LmFycmF5KFBsYXllclNuYXBzaG90KSxcclxuICAgIHJlZFRlYW1NZW1iZXJzOiB0LmFycmF5KFBsYXllclNuYXBzaG90KSxcclxuXHJcbiAgICBzbmFwc2hvdENvbmZpZzogTG9iYnlDb25maWcsIC8vIFRoZSBleGFjdCBydWxlcyB1c2VkIChTbmFwc2hvdClcclxuXHJcbiAgICByZXN1bHQ6IE1hdGNoUmVzdWx0LFxyXG5cclxuICAgIC8vIFNlcmlhbGl6ZWQgSlNPTiBibG9icyBjb250YWluaW5nIHRoZSBmaW5hbCB0ZWFtIGNvbXBzXHJcbiAgICAvLyAoQ2hhcmFjdGVyIE5hbWUsIEVpZG9sb24sIENvc3QgUGFpZCwgZXRjLilcclxuICAgIHJvc3RlckJsdWU6IHQuc3RyaW5nKCksXHJcbiAgICByb3N0ZXJSZWQ6IHQuc3RyaW5nKCksXHJcbn0pOyIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuXHJcbmV4cG9ydCBjb25zdCBNYXRjaFNlc3Npb25TdGVwSGlzdG9yeSA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdtYXRjaF9zZXNzaW9uX3N0ZXBfaGlzdG9yeScsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICAvLyBUaGUgUEsgaXMgdGhlIE1hdGNoIElEIGl0c2VsZiAoMS10by0xIHJlbGF0aW9uIHdpdGggSGlzdG9yeSB0YWJsZSlcclxufSwge1xyXG4gICAgbWF0Y2hJZDogdC5zdHJpbmcoKS5wcmltYXJ5S2V5KCksIC8vIEZLIHRvIE1hdGNoU2Vzc2lvbkhpc3RvcnkuaWRcclxuXHJcbiAgICAvLyBBIHNpbmdsZSBtYXNzaXZlIEpTT04gc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGZ1bGwgYXJyYXkgb2Ygc3RlcHMuXHJcbiAgICAvLyBDbGllbnRzIGZldGNoIHRoaXMgb25seSB3aGVuIFwiV2F0Y2ggUmVwbGF5XCIgaXMgY2xpY2tlZC5cclxuICAgIHN0ZXBzOiB0LnN0cmluZygpLFxyXG59KTsiLCJpbXBvcnQgeyBzY2hlbWEgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi90YWJsZXMvdXNlcic7XHJcbmltcG9ydCB7IFVzZXJJZGVudGl0eSB9IGZyb20gJy4vdGFibGVzL3VzZXJJZGVudGl0eSc7XHJcbmltcG9ydCB7IEhzckNoYXJhY3RlciB9IGZyb20gJy4vdGFibGVzL2hzckNoYXJhY3Rlcic7XHJcbmltcG9ydCB7IEhzckxpZ2h0Y29uZSB9IGZyb20gJy4vdGFibGVzL2hzckxpZ2h0Y29uZSc7XHJcbmltcG9ydCB7IEhzckNoYXJhY3RlckNvc3QgfSBmcm9tICcuL3RhYmxlcy9oc3JDaGFyYWN0ZXJDb3N0JztcclxuaW1wb3J0IHsgSHNyTGlnaHRjb25lQ29zdCB9IGZyb20gJy4vdGFibGVzL2hzckxpZ2h0Y29uZUNvc3QnO1xyXG5pbXBvcnQgeyBIc3JTeW5lcmd5Q29zdCB9IGZyb20gJy4vdGFibGVzL2hzclN5bmVyZ3lDb3N0JztcclxuaW1wb3J0IHsgTG9iYnkgfSBmcm9tICcuL3RhYmxlcy9sb2JieSc7XHJcbmltcG9ydCB7IExvYmJ5TWVtYmVyIH0gZnJvbSAnLi90YWJsZXMvbG9iYnlNZW1iZXInO1xyXG5pbXBvcnQgeyBMb2JieUN1cnNvckV2ZW50IH0gZnJvbSAnLi90YWJsZXMvbG9iYnlDdXJzb3JFdmVudCc7XHJcbmltcG9ydCB7IE1hdGNoU2Vzc2lvbiB9IGZyb20gJy4vdGFibGVzL21hdGNoU2Vzc2lvbic7XHJcbmltcG9ydCB7IE1hdGNoU2Vzc2lvblN0ZXAgfSBmcm9tICcuL3RhYmxlcy9tYXRjaFNlc3Npb25TdGVwJztcclxuaW1wb3J0IHsgTWF0Y2hTZXNzaW9uSGlzdG9yeSB9IGZyb20gJy4vdGFibGVzL21hdGNoU2Vzc2lvbkhpc3RvcnknO1xyXG5pbXBvcnQgeyBNYXRjaFNlc3Npb25TdGVwSGlzdG9yeSB9IGZyb20gJy4vdGFibGVzL21hdGNoU2Vzc2lvblN0ZXBIaXN0b3J5JztcclxuXHJcbmNvbnN0IHNwYWNldGltZWRiID0gc2NoZW1hKHtcclxuICAgIC8vIFVzZXIgLyBBdXRoXHJcbiAgICBVc2VyLFxyXG4gICAgVXNlcklkZW50aXR5LFxyXG5cclxuICAgIC8vIFN0YXRpYyBBc3NldHNcclxuICAgIEhzckNoYXJhY3RlcixcclxuICAgIEhzckxpZ2h0Y29uZSxcclxuXHJcbiAgICAvLyBFY29ub215XHJcbiAgICBIc3JDaGFyYWN0ZXJDb3N0LFxyXG4gICAgSHNyTGlnaHRjb25lQ29zdCxcclxuICAgIEhzclN5bmVyZ3lDb3N0LFxyXG5cclxuICAgIC8vIExvYmJ5IFN5c3RlbVxyXG4gICAgTG9iYnksXHJcbiAgICBMb2JieU1lbWJlcixcclxuICAgIExvYmJ5Q3Vyc29yRXZlbnQsXHJcblxyXG4gICAgLy8gQWN0aXZlIEdhbWVcclxuICAgIE1hdGNoU2Vzc2lvbixcclxuICAgIE1hdGNoU2Vzc2lvblN0ZXAsXHJcblxyXG4gICAgLy8gSGlzdG9yeVxyXG4gICAgTWF0Y2hTZXNzaW9uSGlzdG9yeSxcclxuICAgIE1hdGNoU2Vzc2lvblN0ZXBIaXN0b3J5LFxyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNwYWNldGltZWRiOyIsImltcG9ydCBzcGFjZXRpbWVkYiBmcm9tICcuLi9zY2hlbWEnO1xyXG5pbXBvcnQgeyB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuXHJcbmV4cG9ydCBjb25zdCBicm9hZGNhc3RfY3Vyc29yID0gc3BhY2V0aW1lZGIucmVkdWNlcih7XHJcbiAgICBsb2JieUlkOiB0LnUzMigpLFxyXG4gICAgeDogdC5mMzIoKSxcclxuICAgIHk6IHQuZjMyKCksXHJcbn0sIChjdHgsIHsgbG9iYnlJZCwgeCwgeSB9KSA9PiB7XHJcbiAgICAvLyBSZXNvbHZlIGlkZW50aXR5IOKGkiB1c2VySWRcclxuICAgIGNvbnN0IG1hcHBpbmcgPSBjdHguZGIuVXNlcklkZW50aXR5LmlkZW50aXR5LmZpbmQoY3R4LnNlbmRlcik7XHJcbiAgICBpZiAoIW1hcHBpbmcpIHJldHVybjsgLy8gTm90IHJlZ2lzdGVyZWQsIGlnbm9yZVxyXG5cclxuICAgIC8vIFZhbGlkYXRlIG1lbWJlcnNoaXAgdmlhIGNvbXBvc2l0ZSBQS1xyXG4gICAgY29uc3QgbWVtYmVyVGFibGUgPSBjdHguZGIuTG9iYnlNZW1iZXIgYXMgYW55O1xyXG4gICAgY29uc3QgbWVtYmVyc2hpcCA9IG1lbWJlclRhYmxlLnByaW1hcnlLZXkuZmluZCh7XHJcbiAgICAgICAgbG9iYnlJZCxcclxuICAgICAgICB1c2VySWQ6IG1hcHBpbmcudXNlcklkLFxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKCFtZW1iZXJzaGlwKSB7XHJcbiAgICAgICAgLy8gVXNlciBpcyBub3QgaW4gdGhpcyBsb2JieSwgaWdub3JlIHRoZSByZXF1ZXN0XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEJyb2FkY2FzdFxyXG4gICAgY3R4LmRiLkxvYmJ5Q3Vyc29yRXZlbnQuaW5zZXJ0KHtcclxuICAgICAgICBsb2JieUlkLFxyXG4gICAgICAgIHNlbmRlclVzZXJJZDogbWFwcGluZy51c2VySWQsXHJcbiAgICAgICAgeCxcclxuICAgICAgICB5LFxyXG4gICAgICAgIHRpbWVzdGFtcDogY3R4LnRpbWVzdGFtcCxcclxuICAgIH0pO1xyXG59KTtcclxuIiwiaW1wb3J0IHNwYWNldGltZWRiIGZyb20gJy4uL3NjaGVtYSc7XHJcbmltcG9ydCB7IHQsIFNlbmRlckVycm9yIH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuXHJcbi8qKlxyXG4gKiBIZWxwZXI6IHJlc29sdmUgY3R4LnNlbmRlciDihpIgVXNlcklkZW50aXR5IOKGkiBVc2VyLlxyXG4gKiBSZXR1cm5zIHsgbWFwcGluZywgdXNlciB9IG9yIG51bGwgaWYgaWRlbnRpdHkgaXMgbm90IGxpbmtlZC5cclxuICovXHJcbmZ1bmN0aW9uIHJlc29sdmVVc2VyKGN0eDogYW55KSB7XHJcbiAgICBjb25zdCBtYXBwaW5nID0gY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS5maW5kKGN0eC5zZW5kZXIpO1xyXG4gICAgaWYgKCFtYXBwaW5nKSByZXR1cm4gbnVsbDtcclxuICAgIGNvbnN0IHVzZXIgPSBjdHguZGIuVXNlci5pZC5maW5kKG1hcHBpbmcudXNlcklkKTtcclxuICAgIGlmICghdXNlcikgcmV0dXJuIG51bGw7XHJcbiAgICByZXR1cm4geyBtYXBwaW5nLCB1c2VyIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBMb2dpbiBhcyBhIGd1ZXN0IHVzZXIuXHJcbiAqIC0gSWYgaWRlbnRpdHkgYWxyZWFkeSBsaW5rZWQg4oaSIHVwZGF0ZSBsYXN0TG9naW5BdCAobm8tb3ApLlxyXG4gKiAtIE90aGVyd2lzZSDihpIgY3JlYXRlIGEgbmV3IFVzZXIgKyBVc2VySWRlbnRpdHkgbWFwcGluZy5cclxuICovXHJcbmV4cG9ydCBjb25zdCBsb2dpbl9hc19ndWVzdCA9IHNwYWNldGltZWRiLnJlZHVjZXIoKGN0eCkgPT4ge1xyXG4gICAgY29uc3QgcmVzb2x2ZWQgPSByZXNvbHZlVXNlcihjdHgpO1xyXG4gICAgaWYgKHJlc29sdmVkKSB7XHJcbiAgICAgICAgLy8gQWxyZWFkeSByZWdpc3RlcmVkIOKAlCB1cGRhdGUgbGFzdExvZ2luQXQgYW5kIGxhc3RTZWVuQXRcclxuICAgICAgICBjdHguZGIuVXNlci5pZC51cGRhdGUoe1xyXG4gICAgICAgICAgICAuLi5yZXNvbHZlZC51c2VyLFxyXG4gICAgICAgICAgICBsYXN0TG9naW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgICAgICB9KTtcclxuICAgICAgICBjdHguZGIuVXNlcklkZW50aXR5LmlkZW50aXR5LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIC4uLnJlc29sdmVkLm1hcHBpbmcsXHJcbiAgICAgICAgICAgIGxhc3RTZWVuQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEdlbmVyYXRlIGEgZ3Vlc3QgdXNlcm5hbWUgZnJvbSB0aGUgaWRlbnRpdHkgaGV4IChmaXJzdCA4IGNoYXJzKVxyXG4gICAgY29uc3Qgc2hvcnRJZCA9IGN0eC5zZW5kZXIudG9IZXhTdHJpbmcoKS5zbGljZSgwLCA4KTtcclxuICAgIGNvbnN0IGd1ZXN0VXNlcm5hbWUgPSBgR3Vlc3RfJHtzaG9ydElkfWA7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBVc2VyIHJvdyAoaWQgaXMgYXV0b0luYywgcGFzcyAwKVxyXG4gICAgY29uc3QgbmV3VXNlciA9IGN0eC5kYi5Vc2VyLmluc2VydCh7XHJcbiAgICAgICAgaWQ6IDAsXHJcbiAgICAgICAgdXNlcm5hbWU6IGd1ZXN0VXNlcm5hbWUsXHJcbiAgICAgICAgZGlzcGxheU5hbWU6IGd1ZXN0VXNlcm5hbWUsXHJcbiAgICAgICAgaXNHdWVzdDogdHJ1ZSxcclxuICAgICAgICBsYXN0TG9naW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgICAgICByb2xlOiB7IHRhZzogJ1VzZXInIH0sXHJcbiAgICAgICAgZGlzY29yZElkOiB1bmRlZmluZWQsXHJcbiAgICAgICAgYXZhdGFyQ2hhcmFjdGVyTmFtZTogJ21hcmNoN3RoJyxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIExpbmsgdGhpcyBpZGVudGl0eSB0byB0aGUgbmV3IHVzZXJcclxuICAgIGN0eC5kYi5Vc2VySWRlbnRpdHkuaW5zZXJ0KHtcclxuICAgICAgICBpZGVudGl0eTogY3R4LnNlbmRlcixcclxuICAgICAgICB1c2VySWQ6IG5ld1VzZXIuaWQsXHJcbiAgICAgICAgbGFzdFNlZW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBIZWxwZXI6IGRlbGV0ZSBhIGd1ZXN0IFVzZXIgaWYgbm8gaWRlbnRpdGllcyByZW1haW4gbGlua2VkIHRvIGl0LlxyXG4gKi9cclxuZnVuY3Rpb24gY2xlYW51cE9ycGhhbmVkR3Vlc3QoY3R4OiBhbnksIGd1ZXN0VXNlcklkOiBudW1iZXIpIHtcclxuICAgIGNvbnN0IHJlbWFpbmluZ0xpbmtzID0gWy4uLmN0eC5kYi5Vc2VySWRlbnRpdHkudXNlcl9pZGVudGl0eV91c2VyX2lkLmZpbHRlcihndWVzdFVzZXJJZCldO1xyXG4gICAgaWYgKHJlbWFpbmluZ0xpbmtzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIGN0eC5kYi5Vc2VyLmlkLmRlbGV0ZShndWVzdFVzZXJJZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZWdpc3Rlci9saW5rIGEgRGlzY29yZCBhY2NvdW50LlxyXG4gKlxyXG4gKiBDYXNlIDFhOiBJZGVudGl0eSBsaW5rZWQgdG8gYSB1c2VyIHRoYXQgYWxyZWFkeSBvd25zIHRoaXMgZGlzY29yZElkIOKGkiByZWZyZXNoIGxvZ2luLlxyXG4gKiBDYXNlIDFiOiBJZGVudGl0eSBsaW5rZWQgdG8gYSBndWVzdCwgYnV0IGFub3RoZXIgdXNlciBvd25zIHRoaXMgZGlzY29yZElkIOKGklxyXG4gKiAgICAgICAgICAgcmUtcG9pbnQgaWRlbnRpdHkgdG8gdGhlIGV4aXN0aW5nIERpc2NvcmQgdXNlciwgZGVsZXRlIG9ycGhhbmVkIGd1ZXN0LlxyXG4gKiBDYXNlIDFjOiBJZGVudGl0eSBsaW5rZWQgdG8gYSBndWVzdCwgZGlzY29yZElkIG5vdCB0YWtlbiDihpIgdXBncmFkZSBndWVzdCBpbi1wbGFjZS5cclxuICogQ2FzZSAyOiAgSWRlbnRpdHkgTk9UIGxpbmtlZCwgYnV0IGEgVXNlciB3aXRoIHRoaXMgZGlzY29yZElkIGV4aXN0cyDihpJcclxuICogICAgICAgICAgIGxpbmsgdGhpcyBpZGVudGl0eSB0byB0aGF0IGV4aXN0aW5nIHVzZXIgKGNyb3NzLWRldmljZSBsb2dpbikuXHJcbiAqIENhc2UgMzogIE5laXRoZXIg4oaSIGNyZWF0ZSBhIG5ldyB2ZXJpZmllZCB1c2VyICsgbGluayBpZGVudGl0eS5cclxuICovXHJcbmV4cG9ydCBjb25zdCByZWdpc3Rlcl9kaXNjb3JkX3VzZXIgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKHtcclxuICAgIGRpc2NvcmRJZDogdC5zdHJpbmcoKSxcclxuICAgIGRpc2NvcmRVc2VybmFtZTogdC5zdHJpbmcoKSxcclxufSwgKGN0eCwgeyBkaXNjb3JkSWQsIGRpc2NvcmRVc2VybmFtZSB9KSA9PiB7XHJcbiAgICBpZiAoIWRpc2NvcmRJZCB8fCBkaXNjb3JkSWQubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdkaXNjb3JkSWQgaXMgcmVxdWlyZWQnKTtcclxuICAgIH1cclxuICAgIGlmICghZGlzY29yZFVzZXJuYW1lIHx8IGRpc2NvcmRVc2VybmFtZS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ2Rpc2NvcmRVc2VybmFtZSBpcyByZXF1aXJlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENoZWNrIGlmIGEgVXNlciB3aXRoIHRoaXMgZGlzY29yZElkIGFscmVhZHkgZXhpc3RzXHJcbiAgICBjb25zdCBleGlzdGluZ0J5RGlzY29yZCA9IFsuLi5jdHguZGIuVXNlci51c2VyX2Rpc2NvcmRfaWQuZmlsdGVyKGRpc2NvcmRJZCldO1xyXG4gICAgY29uc3QgZGlzY29yZE93bmVyID0gZXhpc3RpbmdCeURpc2NvcmQubGVuZ3RoID4gMCA/IGV4aXN0aW5nQnlEaXNjb3JkWzBdIDogbnVsbDtcclxuXHJcbiAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVVc2VyKGN0eCk7XHJcblxyXG4gICAgaWYgKHJlc29sdmVkKSB7XHJcbiAgICAgICAgaWYgKGRpc2NvcmRPd25lciAmJiBkaXNjb3JkT3duZXIuaWQgIT09IHJlc29sdmVkLnVzZXIuaWQpIHtcclxuICAgICAgICAgICAgLy8gQ2FzZSAxYjogR3Vlc3QgaXMgbGlua2luZyBEaXNjb3JkLCBidXQgdGhhdCBEaXNjb3JkIGFjY291bnQgYmVsb25nc1xyXG4gICAgICAgICAgICAvLyB0byBhbm90aGVyIHVzZXIuIFJlLXBvaW50IHRoaXMgaWRlbnRpdHkgdG8gdGhlIGV4aXN0aW5nIERpc2NvcmQgdXNlclxyXG4gICAgICAgICAgICAvLyBhbmQgY2xlYW4gdXAgdGhlIG9ycGhhbmVkIGd1ZXN0LlxyXG4gICAgICAgICAgICBjb25zdCBvbGRHdWVzdElkID0gcmVzb2x2ZWQudXNlci5pZDtcclxuICAgICAgICAgICAgY29uc3Qgd2FzR3Vlc3QgPSByZXNvbHZlZC51c2VyLmlzR3Vlc3Q7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGlkZW50aXR5IG1hcHBpbmcgdG8gcG9pbnQgdG8gdGhlIERpc2NvcmQgb3duZXJcclxuICAgICAgICAgICAgY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgaWRlbnRpdHk6IGN0eC5zZW5kZXIsXHJcbiAgICAgICAgICAgICAgICB1c2VySWQ6IGRpc2NvcmRPd25lci5pZCxcclxuICAgICAgICAgICAgICAgIGxhc3RTZWVuQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIGxhc3RMb2dpbkF0IG9uIHRoZSBEaXNjb3JkIG93bmVyXHJcbiAgICAgICAgICAgIGN0eC5kYi5Vc2VyLmlkLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5kaXNjb3JkT3duZXIsXHJcbiAgICAgICAgICAgICAgICBsYXN0TG9naW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiB0aGUgb2xkIHVzZXIgd2FzIGEgZ3Vlc3QsIGNsZWFuIGl0IHVwIGlmIG5vIG90aGVyIGlkZW50aXRpZXMgcmVtYWluXHJcbiAgICAgICAgICAgIGlmICh3YXNHdWVzdCkge1xyXG4gICAgICAgICAgICAgICAgY2xlYW51cE9ycGhhbmVkR3Vlc3QoY3R4LCBvbGRHdWVzdElkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYXNlIDFhIC8gMWM6IEVpdGhlciBhbHJlYWR5IG93bnMgdGhpcyBkaXNjb3JkSWQsIG9yIGRpc2NvcmRJZCBpcyB1bmNsYWltZWQuXHJcbiAgICAgICAgLy8gVXBncmFkZSBndWVzdCBvciByZWZyZXNoIERpc2NvcmQgaW5mbyBvbiB0aGUgY3VycmVudCB1c2VyLlxyXG4gICAgICAgIGN0eC5kYi5Vc2VyLmlkLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgIC4uLnJlc29sdmVkLnVzZXIsXHJcbiAgICAgICAgICAgIHVzZXJuYW1lOiByZXNvbHZlZC51c2VyLmlzR3Vlc3QgPyBkaXNjb3JkVXNlcm5hbWUgOiByZXNvbHZlZC51c2VyLnVzZXJuYW1lLFxyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogcmVzb2x2ZWQudXNlci5pc0d1ZXN0ID8gZGlzY29yZFVzZXJuYW1lIDogcmVzb2x2ZWQudXNlci5kaXNwbGF5TmFtZSxcclxuICAgICAgICAgICAgaXNHdWVzdDogZmFsc2UsXHJcbiAgICAgICAgICAgIGRpc2NvcmRJZCxcclxuICAgICAgICAgICAgbGFzdExvZ2luQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS51cGRhdGUoe1xyXG4gICAgICAgICAgICAuLi5yZXNvbHZlZC5tYXBwaW5nLFxyXG4gICAgICAgICAgICBsYXN0U2VlbkF0OiBjdHgudGltZXN0YW1wLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBJZGVudGl0eSBub3QgbGlua2VkIHlldFxyXG4gICAgaWYgKGRpc2NvcmRPd25lcikge1xyXG4gICAgICAgIC8vIENhc2UgMjogQ3Jvc3MtZGV2aWNlIGxvZ2luIOKAlCBsaW5rIHRoaXMgbmV3IGlkZW50aXR5IHRvIHRoZSBleGlzdGluZyB1c2VyXHJcbiAgICAgICAgY3R4LmRiLlVzZXJJZGVudGl0eS5pbnNlcnQoe1xyXG4gICAgICAgICAgICBpZGVudGl0eTogY3R4LnNlbmRlcixcclxuICAgICAgICAgICAgdXNlcklkOiBkaXNjb3JkT3duZXIuaWQsXHJcbiAgICAgICAgICAgIGxhc3RTZWVuQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3R4LmRiLlVzZXIuaWQudXBkYXRlKHtcclxuICAgICAgICAgICAgLi4uZGlzY29yZE93bmVyLFxyXG4gICAgICAgICAgICBsYXN0TG9naW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FzZSAzOiBCcmFuZCBuZXcgdmVyaWZpZWQgdXNlclxyXG4gICAgY29uc3QgbmV3VXNlciA9IGN0eC5kYi5Vc2VyLmluc2VydCh7XHJcbiAgICAgICAgaWQ6IDAsXHJcbiAgICAgICAgdXNlcm5hbWU6IGRpc2NvcmRVc2VybmFtZSxcclxuICAgICAgICBkaXNwbGF5TmFtZTogZGlzY29yZFVzZXJuYW1lLFxyXG4gICAgICAgIGlzR3Vlc3Q6IGZhbHNlLFxyXG4gICAgICAgIGxhc3RMb2dpbkF0OiBjdHgudGltZXN0YW1wLFxyXG4gICAgICAgIHJvbGU6IHsgdGFnOiAnVXNlcicgfSxcclxuICAgICAgICBkaXNjb3JkSWQsXHJcbiAgICAgICAgYXZhdGFyQ2hhcmFjdGVyTmFtZTogJ21hcmNoN3RoJyxcclxuICAgIH0pO1xyXG5cclxuICAgIGN0eC5kYi5Vc2VySWRlbnRpdHkuaW5zZXJ0KHtcclxuICAgICAgICBpZGVudGl0eTogY3R4LnNlbmRlcixcclxuICAgICAgICB1c2VySWQ6IG5ld1VzZXIuaWQsXHJcbiAgICAgICAgbGFzdFNlZW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBEZWxldGUgYSBndWVzdCBhY2NvdW50IHBlcm1hbmVudGx5LlxyXG4gKiBPbmx5IHdvcmtzIGZvciBndWVzdCB1c2VycyAobm8gRGlzY29yZCBsaW5rZWQpLlxyXG4gKiBSZW1vdmVzIHRoZSBVc2VySWRlbnRpdHkgbWFwcGluZyBhbmQgdGhlIFVzZXIgcm93LlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGRlbGV0ZV9ndWVzdF9hY2NvdW50ID0gc3BhY2V0aW1lZGIucmVkdWNlcigoY3R4KSA9PiB7XHJcbiAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVVc2VyKGN0eCk7XHJcbiAgICBpZiAoIXJlc29sdmVkKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdObyBhY2NvdW50IGZvdW5kIGZvciB0aGlzIGlkZW50aXR5LicpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFyZXNvbHZlZC51c2VyLmlzR3Vlc3QpIHtcclxuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ09ubHkgZ3Vlc3QgYWNjb3VudHMgY2FuIGJlIGRlbGV0ZWQgdGhpcyB3YXkuIFZlcmlmaWVkIGFjY291bnRzIHBlcnNpc3QgYWNyb3NzIGRldmljZXMuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGVsZXRlIHRoZSBVc2VySWRlbnRpdHkgbWFwcGluZyBmb3IgdGhpcyBpZGVudGl0eVxyXG4gICAgY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS5kZWxldGUoY3R4LnNlbmRlcik7XHJcblxyXG4gICAgLy8gQ2hlY2sgaWYgYW55IG90aGVyIGlkZW50aXRpZXMgc3RpbGwgcG9pbnQgdG8gdGhpcyB1c2VyXHJcbiAgICBjb25zdCByZW1haW5pbmdMaW5rcyA9IFsuLi5jdHguZGIuVXNlcklkZW50aXR5LnVzZXJfaWRlbnRpdHlfdXNlcl9pZC5maWx0ZXIocmVzb2x2ZWQudXNlci5pZCldO1xyXG4gICAgaWYgKHJlbWFpbmluZ0xpbmtzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIC8vIE5vIG1vcmUgaWRlbnRpdGllcyBsaW5rZWQg4oCUIHNhZmUgdG8gZGVsZXRlIHRoZSBVc2VyIHJvd1xyXG4gICAgICAgIGN0eC5kYi5Vc2VyLmlkLmRlbGV0ZShyZXNvbHZlZC51c2VyLmlkKTtcclxuICAgIH1cclxufSk7XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBjYWxsZXIncyBkaXNwbGF5IG5hbWUuXHJcbiAqIE9ubHkgbm9uLWVtcHR5IHN0cmluZ3MgYXJlIGFjY2VwdGVkLiBNYXggMzIgY2hhcmFjdGVycy5cclxuICovXHJcbmV4cG9ydCBjb25zdCB1cGRhdGVfZGlzcGxheV9uYW1lID0gc3BhY2V0aW1lZGIucmVkdWNlcih7XHJcbiAgICBuZXdEaXNwbGF5TmFtZTogdC5zdHJpbmcoKSxcclxufSwgKGN0eCwgeyBuZXdEaXNwbGF5TmFtZSB9KSA9PiB7XHJcbiAgICBjb25zdCB0cmltbWVkID0gbmV3RGlzcGxheU5hbWUudHJpbSgpO1xyXG4gICAgaWYgKHRyaW1tZWQubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdEaXNwbGF5IG5hbWUgY2Fubm90IGJlIGVtcHR5Jyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHJpbW1lZC5sZW5ndGggPiAzMikge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignRGlzcGxheSBuYW1lIG11c3QgYmUgMzIgY2hhcmFjdGVycyBvciBmZXdlcicpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZVVzZXIoY3R4KTtcclxuICAgIGlmICghcmVzb2x2ZWQpIHtcclxuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1VzZXIgbm90IGZvdW5kIOKAlCBsb2dpbiBmaXJzdCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGN0eC5kYi5Vc2VyLmlkLnVwZGF0ZSh7XHJcbiAgICAgICAgLi4ucmVzb2x2ZWQudXNlcixcclxuICAgICAgICBkaXNwbGF5TmFtZTogdHJpbW1lZCxcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIGNhbGxlcidzIHVzZXJuYW1lLlxyXG4gKiBPbmx5IHZlcmlmaWVkIChub24tZ3Vlc3QpIHVzZXJzIHdpdGggYSBsaW5rZWQgRGlzY29yZCBjYW4gY2hhbmdlIHRoZWlyIHVzZXJuYW1lLlxyXG4gKiBVbmlxdWVuZXNzIGlzIGVuZm9yY2VkIGJ5IHRoZSBkYXRhYmFzZSBjb25zdHJhaW50LlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHVwZGF0ZV91c2VybmFtZSA9IHNwYWNldGltZWRiLnJlZHVjZXIoe1xyXG4gICAgbmV3VXNlcm5hbWU6IHQuc3RyaW5nKCksXHJcbn0sIChjdHgsIHsgbmV3VXNlcm5hbWUgfSkgPT4ge1xyXG4gICAgY29uc3QgdHJpbW1lZCA9IG5ld1VzZXJuYW1lLnRyaW0oKTtcclxuICAgIGlmICh0cmltbWVkLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignVXNlcm5hbWUgY2Fubm90IGJlIGVtcHR5Jyk7XHJcbiAgICB9XHJcbiAgICBpZiAodHJpbW1lZC5sZW5ndGggPiAzMikge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignVXNlcm5hbWUgbXVzdCBiZSAzMiBjaGFyYWN0ZXJzIG9yIGZld2VyJyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzb2x2ZWQgPSByZXNvbHZlVXNlcihjdHgpO1xyXG4gICAgaWYgKCFyZXNvbHZlZCkge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignVXNlciBub3QgZm91bmQg4oCUIGxvZ2luIGZpcnN0Jyk7XHJcbiAgICB9XHJcbiAgICBpZiAocmVzb2x2ZWQudXNlci5pc0d1ZXN0KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdHdWVzdCB1c2VycyBjYW5ub3QgY2hhbmdlIHRoZWlyIHVzZXJuYW1lLiBMaW5rIHlvdXIgRGlzY29yZCBhY2NvdW50IGZpcnN0LicpO1xyXG4gICAgfVxyXG5cclxuICAgIGN0eC5kYi5Vc2VyLmlkLnVwZGF0ZSh7XHJcbiAgICAgICAgLi4ucmVzb2x2ZWQudXNlcixcclxuICAgICAgICB1c2VybmFtZTogdHJpbW1lZCxcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIGNhbGxlcidzIGF2YXRhciBjaGFyYWN0ZXIuXHJcbiAqIFRoZSBjaGFyYWN0ZXJOYW1lIHNob3VsZCByZWZlcmVuY2UgYW4gZXhpc3RpbmcgSHNyQ2hhcmFjdGVyIG5hbWUuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgdXBkYXRlX2F2YXRhciA9IHNwYWNldGltZWRiLnJlZHVjZXIoe1xyXG4gICAgY2hhcmFjdGVyTmFtZTogdC5zdHJpbmcoKSxcclxufSwgKGN0eCwgeyBjaGFyYWN0ZXJOYW1lIH0pID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZVVzZXIoY3R4KTtcclxuICAgIGlmICghcmVzb2x2ZWQpIHtcclxuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1VzZXIgbm90IGZvdW5kIOKAlCBsb2dpbiBmaXJzdCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGN0eC5kYi5Vc2VyLmlkLnVwZGF0ZSh7XHJcbiAgICAgICAgLi4ucmVzb2x2ZWQudXNlcixcclxuICAgICAgICBhdmF0YXJDaGFyYWN0ZXJOYW1lOiBjaGFyYWN0ZXJOYW1lLFxyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCJpbXBvcnQgc3BhY2V0aW1lZGIgZnJvbSAnLi9zY2hlbWEnO1xyXG5leHBvcnQgeyBicm9hZGNhc3RfY3Vyc29yIH0gZnJvbSAnLi9yZWR1Y2Vycy9jdXJzb3InO1xyXG5leHBvcnQgeyBsb2dpbl9hc19ndWVzdCwgcmVnaXN0ZXJfZGlzY29yZF91c2VyLCBkZWxldGVfZ3Vlc3RfYWNjb3VudCwgdXBkYXRlX2Rpc3BsYXlfbmFtZSwgdXBkYXRlX3VzZXJuYW1lLCB1cGRhdGVfYXZhdGFyIH0gZnJvbSAnLi9yZWR1Y2Vycy9hdXRoJztcclxuXHJcbnNwYWNldGltZWRiLmNsaWVudENvbm5lY3RlZCgoY3R4KSA9PiB7XHJcbiAgY29uc29sZS5sb2coYENsaWVudCBjb25uZWN0ZWQ6ICR7Y3R4LnNlbmRlci50b0hleFN0cmluZygpfWApO1xyXG59KTtcclxuXHJcbnNwYWNldGltZWRiLmNsaWVudERpc2Nvbm5lY3RlZCgoY3R4KSA9PiB7XHJcbiAgY29uc29sZS5sb2coYENsaWVudCBkaXNjb25uZWN0ZWQ6ICR7Y3R4LnNlbmRlci50b0hleFN0cmluZygpfWApO1xyXG59KTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IHNwYWNldGltZWRiOyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLElBQUlBLGFBQVcsT0FBTztBQUN0QixJQUFJQyxjQUFZLE9BQU87QUFDdkIsSUFBSUMscUJBQW1CLE9BQU87QUFDOUIsSUFBSUMsc0JBQW9CLE9BQU87QUFDL0IsSUFBSUMsaUJBQWUsT0FBTztBQUMxQixJQUFJQyxpQkFBZSxPQUFPLFVBQVU7QUFDcEMsSUFBSUMsZ0JBQWMsSUFBSSxRQUFRLFNBQVMsWUFBWTtBQUNqRCxRQUFPLFFBQVEsR0FBRyxHQUFHSCxvQkFBa0IsR0FBRyxDQUFDLE1BQU0sTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsU0FBUyxJQUFJLEVBQUUsSUFBSTs7QUFFN0YsSUFBSUksaUJBQWUsSUFBSSxNQUFNLFFBQVEsU0FBUztBQUM1QyxLQUFJLFFBQVEsT0FBTyxTQUFTLFlBQVksT0FBTyxTQUFTLFlBQ3REO09BQUssSUFBSSxPQUFPSixvQkFBa0IsS0FBSyxDQUNyQyxLQUFJLENBQUNFLGVBQWEsS0FBSyxJQUFJLElBQUksSUFB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ekQsS0FBSSxTQUFTLEtBQUssUUFDZCxPQUFNLElBQUksWUFBWSw2RUFBNkU7QUFHdkcsS0FBSSxHQUFHLEtBQUssR0FBRyxPQUFPO0VBQ2xCLEdBQUcsU0FBUztFQUNaLFVBQVU7RUFDYixDQUFDO0VBQ0o7Ozs7O0FBTUYsTUFBYSxnQkFBZ0IsWUFBWSxRQUFRLEVBQzdDLGVBQWUsRUFBRSxRQUFRLEVBQzVCLEdBQUcsS0FBSyxFQUFFLG9CQUFvQjtDQUMzQixNQUFNLFdBQVcsWUFBWSxJQUFJO0FBQ2pDLEtBQUksQ0FBQyxTQUNELE9BQU0sSUFBSSxZQUFZLCtCQUErQjtBQUd6RCxLQUFJLEdBQUcsS0FBSyxHQUFHLE9BQU87RUFDbEIsR0FBRyxTQUFTO0VBQ1oscUJBQXFCO0VBQ3hCLENBQUM7RUFDSjs7OztBQzdRRixZQUFZLGlCQUFpQixRQUFRO0FBQ25DLFNBQVEsSUFBSSxxQkFBcUIsSUFBSSxPQUFPLGFBQWEsR0FBRztFQUM1RDtBQUVGLFlBQVksb0JBQW9CLFFBQVE7QUFDdEMsU0FBUSxJQUFJLHdCQUF3QixJQUFJLE9BQU8sYUFBYSxHQUFHO0VBQy9EO0FBRUYsa0JBQWUiLCJkZWJ1Z0lkIjoiOTliYTJlZDQtMzRiOC00MzJiLWI2ZWYtZTQ4ODQ0OGVmMDQwIn0=