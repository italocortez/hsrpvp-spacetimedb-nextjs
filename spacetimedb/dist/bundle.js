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
const userColumns = {
	id: t.u32().primaryKey().autoInc(),
	username: t.string().unique(),
	displayName: t.string(),
	isGuest: t.bool(),
	lastLoginAt: t.timestamp(),
	role: Role,
	discordId: t.string().optional(),
	avatarCharacterName: t.string()
};
const User = table({
	name: "user",
	public: true,
	indexes: [{
		name: "user_discord_id",
		accessor: "user_discord_id",
		algorithm: "btree",
		columns: ["discordId"]
	}]
}, userColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/userIdentity.ts
/**
* Maps SpacetimeDB identities (per-device) to persistent User IDs (many-to-one).
* Each device/browser generates a unique identity; this table links them all
* back to a single User record.
*/
const userIdentityColumns = {
	identity: t.identity().primaryKey(),
	userId: t.u32(),
	lastSeenAt: t.timestamp()
};
const UserIdentity = table({
	name: "user_identity",
	public: true,
	indexes: [{
		name: "user_identity_user_id",
		accessor: "user_identity_user_id",
		algorithm: "btree",
		columns: ["userId"]
	}]
}, userIdentityColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/serverIdentity.ts
/**
* Stores the trusted server identity (Next.js API server).
* Only one row should ever exist. The server identity is the only caller
* allowed to invoke server_link_discord (which links Discord accounts to users).
*
* Bootstrap: call register_server when the table is empty.
*/
const serverIdentityColumns = {
	identity: t.identity().primaryKey(),
	registeredAt: t.timestamp()
};
const ServerIdentity = table({
	name: "server_identity",
	public: false
}, serverIdentityColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrCharacter.ts
const hsrCharacterColumns = {
	name: t.string().primaryKey(),
	displayName: t.string(),
	aliases: t.array(t.string()),
	rarity: t.u8(),
	path: Path,
	element: Element,
	role: CharRole,
	imageUrl: t.string()
};
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
}, hsrCharacterColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrLightcone.ts
const hsrLightconeColumns = {
	name: t.string().primaryKey(),
	displayName: t.string(),
	aliases: t.array(t.string()),
	path: Path,
	rarity: t.u8(),
	imageUrl: t.string(),
	posX: t.i32(),
	posY: t.i32(),
	width: t.i32()
};
const HsrLightcone = table({
	name: "hsr_lightcone",
	public: true,
	indexes: [{
		name: "lightcone_by_path",
		accessor: "lightcone_by_path",
		algorithm: "btree",
		columns: ["path"]
	}]
}, hsrLightconeColumns);

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
const hsrCharacterCostColumns = {
	characterName: t.string(),
	gameMode: GameMode,
	classicCosts: EidolonCost,
	auctionBaseBid: EidolonCost
};
const HsrCharacterCost = table({
	name: "hsr_character_cost",
	public: true,
	primaryKey: ["characterName", "gameMode"]
}, hsrCharacterCostColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrLightconeCost.ts
const hsrLightconeCostColumns = {
	lightconeName: t.string().primaryKey(),
	classicCosts: SuperimpositionCost,
	auctionBaseBid: SuperimpositionCost
};
const HsrLightconeCost = table({
	name: "hsr_lightcone_cost",
	public: true
}, hsrLightconeCostColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/hsrSynergyCost.ts
const hsrSynergyCostColumns = {
	id: t.u32().primaryKey().autoInc(),
	sourceName: t.string(),
	targetName: t.string(),
	gameMode: GameMode,
	costModifier: t.f32()
};
const hsrSynergyCostUpsertKeys = Object.keys(hsrSynergyCostColumns).filter((k) => k !== "id");
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
}, hsrSynergyCostColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/lobby.ts
const lobbyColumns = {
	id: t.u32().primaryKey().autoInc(),
	joinCode: t.string().unique(),
	hostUserId: t.u32(),
	teamBlueAlias: t.string(),
	teamRedAlias: t.string(),
	hostDisconnectTime: t.timestamp().optional(),
	lastActivityAt: t.timestamp(),
	stage: LobbyStage,
	config: LobbyConfig
};
const Lobby = table({
	name: "lobby",
	public: true,
	indexes: [{
		name: "lobby_host",
		accessor: "lobby_host",
		algorithm: "btree",
		columns: ["hostUserId"]
	}]
}, lobbyColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/lobbyMember.ts
const lobbyMemberColumns = {
	lobbyId: t.u32(),
	userId: t.u32(),
	isOnline: t.bool(),
	participationRole: ParticipationRole,
	isReferee: t.bool(),
	teamSlot: TeamLabel
};
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
}, lobbyMemberColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/lobbyCursorEvent.ts
const lobbyCursorEventColumns = {
	lobbyId: t.u32(),
	senderUserId: t.u32(),
	x: t.f32(),
	y: t.f32(),
	timestamp: t.timestamp()
};
const LobbyCursorEvent = table({
	name: "lobby_cursor_event",
	public: true,
	event: true
}, lobbyCursorEventColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSession.ts
const matchSessionColumns = {
	lobbyId: t.u32().primaryKey(),
	turnIndex: t.u32(),
	draftSequence: t.array(DraftStep),
	timerState: TimerState,
	teamBlueBudget: t.f32(),
	teamRedBudget: t.f32()
};
const MatchSession = table({
	name: "match_session",
	public: true
}, matchSessionColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSessionStep.ts
const matchSessionStepColumns = {
	id: t.u32().primaryKey().autoInc(),
	lobbyId: t.u32(),
	sequence: t.u32(),
	actorUserId: t.u32(),
	actorSlot: TeamLabel,
	action: ActionType,
	payload: StepPayload,
	timestamp: t.timestamp()
};
const MatchSessionStep = table({
	name: "match_session_step",
	public: true,
	indexes: [{
		name: "match_history_lobby",
		accessor: "match_history_lobby",
		algorithm: "btree",
		columns: ["lobbyId"]
	}]
}, matchSessionStepColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSessionHistory.ts
const matchSessionHistoryColumns = {
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
};
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
}, matchSessionHistoryColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/tables/matchSessionStepHistory.ts
const matchSessionStepHistoryColumns = {
	matchId: t.string().primaryKey(),
	steps: t.string()
};
const MatchSessionStepHistory = table({
	name: "match_session_step_history",
	public: true
}, matchSessionStepHistoryColumns);

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/schema.ts
const spacetimedb = schema({
	User,
	UserIdentity,
	ServerIdentity,
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
* Login as a guest user.
* - If identity already linked → update lastLoginAt (no-op).
* - Otherwise → create a new User + UserIdentity mapping.
*/
const login_as_guest = spacetimedb.reducer((ctx) => {
	const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
	if (mapping) {
		const user = ctx.db.User.id.find(mapping.userId);
		if (user) {
			ctx.db.User.id.update({
				...user,
				lastLoginAt: ctx.timestamp
			});
			ctx.db.UserIdentity.identity.update({
				...mapping,
				lastSeenAt: ctx.timestamp
			});
			return;
		}
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

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/reducers/profile.ts
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
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/reducers/server.ts
/**
* Helper: verify the caller is the registered server identity.
*/
function requireServer(ctx) {
	const server = ctx.db.ServerIdentity.identity.find(ctx.sender);
	if (!server) throw new SenderError("Forbidden: caller is not the registered server identity.");
	return server;
}
/**
* Bootstrap reducer: register the calling identity as the trusted server.
* Only works when no server identity exists yet (first-come-first-served).
* To re-register, clear-publish the database first.
*
* Run via: npx tsx scripts/register-server.ts
*/
const register_server = spacetimedb.reducer((ctx) => {
	if ([...ctx.db.ServerIdentity.iter()].length > 0) throw new SenderError("Server identity already registered. To re-register, clear the database first.");
	ctx.db.ServerIdentity.insert({
		identity: ctx.sender,
		registeredAt: ctx.timestamp
	});
});
/**
* Server-only reducer: link a Discord account to a user identity.
* Called by the Next.js API route after verifying the Discord OAuth session.
*
* The callerIdentityHex is the SpacetimeDB identity hex of the end-user's
* browser client. The server passes it along so we know which UserIdentity
* to update.
*/
const server_link_discord = spacetimedb.reducer({
	callerIdentityHex: t.string(),
	discordId: t.string(),
	discordUsername: t.string()
}, (ctx, { callerIdentityHex, discordId, discordUsername }) => {
	requireServer(ctx);
	if (!discordId || discordId.length === 0) throw new SenderError("discordId is required");
	if (!discordUsername || discordUsername.length === 0) throw new SenderError("discordUsername is required");
	if (!callerIdentityHex || callerIdentityHex.length === 0) throw new SenderError("callerIdentityHex is required");
	let userMapping = null;
	for (const row of ctx.db.UserIdentity.iter()) if (row.identity.toHexString() === callerIdentityHex) {
		userMapping = row;
		break;
	}
	let currentUser = null;
	if (userMapping) currentUser = ctx.db.User.id.find(userMapping.userId);
	const existingByDiscord = [...ctx.db.User.user_discord_id.filter(discordId)];
	const discordOwner = existingByDiscord.length > 0 ? existingByDiscord[0] : null;
	if (currentUser) {
		if (discordOwner && discordOwner.id !== currentUser.id) {
			const oldGuestId = currentUser.id;
			const wasGuest = currentUser.isGuest;
			ctx.db.UserIdentity.identity.update({
				...userMapping,
				userId: discordOwner.id,
				lastSeenAt: ctx.timestamp
			});
			ctx.db.User.id.update({
				...discordOwner,
				lastLoginAt: ctx.timestamp
			});
			if (wasGuest) {
				if ([...ctx.db.UserIdentity.user_identity_user_id.filter(oldGuestId)].length === 0) ctx.db.User.id.delete(oldGuestId);
			}
			return;
		}
		ctx.db.User.id.update({
			...currentUser,
			username: currentUser.isGuest ? discordUsername : currentUser.username,
			displayName: currentUser.isGuest ? discordUsername : currentUser.displayName,
			isGuest: false,
			discordId,
			lastLoginAt: ctx.timestamp
		});
		ctx.db.UserIdentity.identity.update({
			...userMapping,
			lastSeenAt: ctx.timestamp
		});
		return;
	}
	if (discordOwner) throw new SenderError("Identity not registered. Call login_as_guest first.");
	throw new SenderError("Identity not registered. Call login_as_guest first.");
});
/**
* Server-only reducer: promote a user to Admin role.
* Called via: npx tsx scripts/promote-admin.ts <username>
*/
const server_promote_admin = spacetimedb.reducer({ username: t.string() }, (ctx, { username }) => {
	requireServer(ctx);
	if (!username || username.length === 0) throw new SenderError("username is required");
	let targetUser = null;
	for (const row of ctx.db.User.iter()) if (row.username === username) {
		targetUser = row;
		break;
	}
	if (!targetUser) throw new SenderError(`User "${username}" not found`);
	ctx.db.User.id.update({
		...targetUser,
		role: { tag: "Admin" }
	});
});

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/helpers/ensurePermissions.ts
/**
* Resolves ctx.sender (identity) → UserIdentity → User.
* Returns both the mapping row and the User row.
* Throws if the identity is not linked to any user.
*/
function getAuthenticatedUser(ctx) {
	const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
	if (!mapping) throw new SenderError("Unauthorized: No user linked to this identity.");
	const user = ctx.db.User.id.find(mapping.userId);
	if (!user) throw new SenderError("Unauthorized: User record not found.");
	return user;
}
/**
* Ensures the sender is an Admin.
*/
function ensureAdmin(ctx) {
	const user = getAuthenticatedUser(ctx);
	if (user.role.tag !== "Admin") throw new SenderError("Forbidden: Requires Admin privileges.");
	return user;
}

//#endregion
//#region D:/GitsWork/hsrpvp-spacetimedb-nextjs/spacetimedb/src/reducers/admin.ts
const ENUM_VARIANTS = {
	path: Object.keys(Path.variants),
	element: Object.keys(Element.variants),
	role: Object.keys(CharRole.variants),
	gameMode: Object.keys(GameMode.variants),
	userRole: Object.keys(Role.variants)
};
function validateEnum(field, value, ctx, tableName) {
	const variants = ENUM_VARIANTS[field];
	if (!variants) return;
	if (!variants.includes(value)) {
		const errorMsg = `Invalid ${field}: "${value}". Must be exactly one of: ${variants.join(", ")}`;
		console.error(`[ADMIN] Bulk upsert REJECTED for table "${tableName}" by ${ctx.sender.toHexString()}: ${errorMsg}`);
		throw new SenderError(errorMsg);
	}
}
const EXPECTED_KEYS = {
	HsrCharacter: Object.keys(hsrCharacterColumns),
	HsrLightcone: Object.keys(hsrLightconeColumns),
	HsrCharacterCost: Object.keys(hsrCharacterCostColumns),
	HsrLightconeCost: Object.keys(hsrLightconeCostColumns),
	HsrSynergyCost: hsrSynergyCostUpsertKeys
};
function validateKeys(rows, tableName, ctx) {
	const expected = EXPECTED_KEYS[tableName];
	if (!expected) return;
	const expectedSet = new Set(expected);
	const expectedSorted = [...expected].sort().join(",");
	for (let i = 0; i < rows.length; i++) {
		const actualKeys = Object.keys(rows[i]).sort();
		if (actualKeys.join(",") !== expectedSorted) {
			const actualSet = new Set(actualKeys);
			const missing = expected.filter((k) => !actualSet.has(k));
			const extra = actualKeys.filter((k) => !expectedSet.has(k));
			const parts = [];
			if (missing.length) parts.push(`missing: [${missing.join(", ")}]`);
			if (extra.length) parts.push(`unexpected: [${extra.join(", ")}]`);
			const errorMsg = `Row ${i} key mismatch: ${parts.join(", ")}. Expected exactly: [${expected.join(", ")}]`;
			console.error(`[ADMIN] Bulk upsert REJECTED for table "${tableName}" by ${ctx.sender.toHexString()}: ${errorMsg}`);
			throw new SenderError(errorMsg);
		}
	}
}
const admin_delete_row = spacetimedb.reducer({
	tableName: t.string(),
	primaryKeyJson: t.string()
}, (ctx, { tableName, primaryKeyJson }) => {
	ensureAdmin(ctx);
	switch (tableName) {
		case "User": {
			const id = Number(primaryKeyJson);
			if (!ctx.db.User.id.find(id)) throw new SenderError("Row not found");
			for (const lobby of ctx.db.Lobby.iter()) if (lobby.hostUserId === id) throw new SenderError(`Cannot delete user #${id}: they are hosting lobby "${lobby.joinCode}". Remove the lobby first.`);
			for (const member of ctx.db.LobbyMember.iter()) if (member.userId === id) throw new SenderError(`Cannot delete user #${id}: they are in active lobby #${member.lobbyId}. Remove them from the lobby first.`);
			for (const step of ctx.db.MatchSessionStep.iter()) if (step.actorUserId === id) throw new SenderError(`Cannot delete user #${id}: they have actions in active match (lobby #${step.lobbyId}). End the match first.`);
			const identitiesToDelete = [];
			for (const ui of ctx.db.UserIdentity.iter()) if (ui.userId === id) identitiesToDelete.push(ui.identity);
			for (const identity of identitiesToDelete) ctx.db.UserIdentity.identity.delete(identity);
			ctx.db.User.id.delete(id);
			break;
		}
		case "UserIdentity": {
			let found = false;
			for (const row of ctx.db.UserIdentity.iter()) if (row.identity.toHexString() === primaryKeyJson) {
				ctx.db.UserIdentity.identity.delete(row.identity);
				found = true;
				break;
			}
			if (!found) throw new SenderError("Row not found");
			break;
		}
		case "HsrCharacter":
			if (!ctx.db.HsrCharacter.name.find(primaryKeyJson)) throw new SenderError("Row not found");
			ctx.db.HsrCharacter.name.delete(primaryKeyJson);
			break;
		case "HsrLightcone":
			if (!ctx.db.HsrLightcone.name.find(primaryKeyJson)) throw new SenderError("Row not found");
			ctx.db.HsrLightcone.name.delete(primaryKeyJson);
			break;
		case "HsrCharacterCost": {
			const key = JSON.parse(primaryKeyJson);
			let found = false;
			for (const row of ctx.db.HsrCharacterCost.iter()) if (row.characterName === key.characterName && row.gameMode.tag === key.gameModeTag) {
				ctx.db.HsrCharacterCost.delete(row);
				found = true;
				break;
			}
			if (!found) throw new SenderError("Row not found");
			break;
		}
		case "HsrLightconeCost":
			if (!ctx.db.HsrLightconeCost.lightconeName.find(primaryKeyJson)) throw new SenderError("Row not found");
			ctx.db.HsrLightconeCost.lightconeName.delete(primaryKeyJson);
			break;
		case "HsrSynergyCost": {
			const id = Number(primaryKeyJson);
			if (!ctx.db.HsrSynergyCost.id.find(id)) throw new SenderError("Row not found");
			ctx.db.HsrSynergyCost.id.delete(id);
			break;
		}
		case "Lobby": {
			const id = Number(primaryKeyJson);
			if (!ctx.db.Lobby.id.find(id)) throw new SenderError("Row not found");
			ctx.db.Lobby.id.delete(id);
			break;
		}
		case "LobbyMember": {
			const key = JSON.parse(primaryKeyJson);
			let found = false;
			for (const row of ctx.db.LobbyMember.iter()) if (row.lobbyId === key.lobbyId && row.userId === key.userId) {
				ctx.db.LobbyMember.delete(row);
				found = true;
				break;
			}
			if (!found) throw new SenderError("Row not found");
			break;
		}
		case "MatchSession": {
			const id = Number(primaryKeyJson);
			if (!ctx.db.MatchSession.lobbyId.find(id)) throw new SenderError("Row not found");
			ctx.db.MatchSession.lobbyId.delete(id);
			break;
		}
		case "MatchSessionStep": {
			const id = Number(primaryKeyJson);
			if (!ctx.db.MatchSessionStep.id.find(id)) throw new SenderError("Row not found");
			ctx.db.MatchSessionStep.id.delete(id);
			break;
		}
		case "MatchSessionHistory":
			if (!ctx.db.MatchSessionHistory.id.find(primaryKeyJson)) throw new SenderError("Row not found");
			ctx.db.MatchSessionHistory.id.delete(primaryKeyJson);
			break;
		case "MatchSessionStepHistory":
			if (!ctx.db.MatchSessionStepHistory.matchId.find(primaryKeyJson)) throw new SenderError("Row not found");
			ctx.db.MatchSessionStepHistory.matchId.delete(primaryKeyJson);
			break;
		default: throw new SenderError(`Unknown table: ${tableName}`);
	}
});
const admin_bulk_upsert = spacetimedb.reducer({
	tableName: t.string(),
	jsonData: t.string()
}, (ctx, { tableName, jsonData }) => {
	ensureAdmin(ctx);
	const rows = JSON.parse(jsonData);
	if (!Array.isArray(rows)) throw new SenderError("jsonData must be a JSON array");
	validateKeys(rows, tableName, ctx);
	switch (tableName) {
		case "HsrCharacter":
			for (const r of rows) {
				validateEnum("path", r.path, ctx, tableName);
				validateEnum("element", r.element, ctx, tableName);
				validateEnum("role", r.role, ctx, tableName);
				const existing = ctx.db.HsrCharacter.name.find(r.name);
				const row = {
					name: r.name,
					displayName: r.displayName,
					aliases: r.aliases || [],
					rarity: r.rarity,
					path: {
						tag: r.path,
						value: {}
					},
					element: {
						tag: r.element,
						value: {}
					},
					role: {
						tag: r.role,
						value: {}
					},
					imageUrl: r.imageUrl || ""
				};
				if (existing) ctx.db.HsrCharacter.name.update({
					...existing,
					...row
				});
				else ctx.db.HsrCharacter.insert(row);
			}
			break;
		case "HsrLightcone":
			for (const r of rows) {
				validateEnum("path", r.path, ctx, tableName);
				const existing = ctx.db.HsrLightcone.name.find(r.name);
				const row = {
					name: r.name,
					displayName: r.displayName,
					aliases: r.aliases || [],
					path: {
						tag: r.path,
						value: {}
					},
					rarity: r.rarity,
					imageUrl: r.imageUrl || "",
					posX: r.posX || 0,
					posY: r.posY || 0,
					width: r.width || 0
				};
				if (existing) ctx.db.HsrLightcone.name.update({
					...existing,
					...row
				});
				else ctx.db.HsrLightcone.insert(row);
			}
			break;
		case "HsrCharacterCost":
			for (const r of rows) {
				validateEnum("gameMode", r.gameMode, ctx, tableName);
				const gameMode = {
					tag: r.gameMode,
					value: {}
				};
				const row = {
					characterName: r.characterName,
					gameMode,
					classicCosts: r.classicCosts,
					auctionBaseBid: r.auctionBaseBid
				};
				let existing = null;
				for (const e of ctx.db.HsrCharacterCost.iter()) if (e.characterName === r.characterName && e.gameMode.tag === r.gameMode) {
					existing = e;
					break;
				}
				if (existing) ctx.db.HsrCharacterCost.delete(existing);
				ctx.db.HsrCharacterCost.insert(row);
			}
			break;
		case "HsrLightconeCost":
			for (const r of rows) {
				const existing = ctx.db.HsrLightconeCost.lightconeName.find(r.lightconeName);
				const row = {
					lightconeName: r.lightconeName,
					classicCosts: r.classicCosts,
					auctionBaseBid: r.auctionBaseBid
				};
				if (existing) ctx.db.HsrLightconeCost.lightconeName.update({
					...existing,
					...row
				});
				else ctx.db.HsrLightconeCost.insert(row);
			}
			break;
		case "HsrSynergyCost":
			for (const r of rows) {
				validateEnum("gameMode", r.gameMode, ctx, tableName);
				const gameMode = {
					tag: r.gameMode,
					value: {}
				};
				const row = {
					id: 0,
					sourceName: r.sourceName,
					targetName: r.targetName,
					gameMode,
					costModifier: r.costModifier
				};
				let existing = null;
				for (const e of ctx.db.HsrSynergyCost.iter()) if (e.sourceName === r.sourceName && e.targetName === r.targetName && e.gameMode.tag === r.gameMode) {
					existing = e;
					break;
				}
				if (existing) ctx.db.HsrSynergyCost.id.update({
					...existing,
					costModifier: r.costModifier
				});
				else ctx.db.HsrSynergyCost.insert(row);
			}
			break;
		default: throw new SenderError(`Bulk upsert not supported for table: ${tableName}`);
	}
});
const admin_update_user = spacetimedb.reducer({
	userId: t.u32(),
	displayName: t.string(),
	username: t.string(),
	roleTag: t.string()
}, (ctx, { userId, displayName, username, roleTag }) => {
	ensureAdmin(ctx);
	const user = ctx.db.User.id.find(userId);
	if (!user) throw new SenderError("User not found");
	validateEnum("userRole", roleTag, ctx, "User");
	if (username !== user.username) {
		if (ctx.db.User.username.find(username)) throw new SenderError(`Username "${username}" is already taken`);
	}
	ctx.db.User.id.update({
		...user,
		displayName,
		username,
		role: {
			tag: roleTag,
			value: {}
		}
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
export { admin_bulk_upsert, admin_delete_row, admin_update_user, broadcast_cursor, src_default as default, delete_guest_account, login_as_guest, register_server, server_link_discord, server_promote_admin, update_avatar, update_display_name, update_username };
//# debugId=f455a532-5f70-4fe9-a4d8-116274fd4255
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwibmFtZXMiOlsiX19jcmVhdGUiLCJfX2RlZlByb3AiLCJfX2dldE93blByb3BEZXNjIiwiX19nZXRPd25Qcm9wTmFtZXMiLCJfX2dldFByb3RvT2YiLCJfX2hhc093blByb3AiLCJfX2NvbW1vbkpTIiwiX19jb3B5UHJvcHMiLCJfX3RvRVNNIiwiI2Vuc3VyZSIsIiNtb2R1bGVEZWYiLCIjcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSIsIiNjb21wb3VuZFR5cGVzIiwiI2Zyb20iLCIjdG8iLCIjdXVpZENvdW50ZXIiLCIjc2VuZGVyQXV0aCIsIiNpZGVudGl0eSIsIiNyYW5kb20iLCIjc2NoZW1hIiwiI3JlZHVjZXJBcmdzRGVzZXJpYWxpemVycyIsIiNkYlZpZXciLCIjZGJWaWV3XyIsIiNyZWR1Y2VyQ3R4IiwiI3JlZHVjZXJDdHhfIiwiI2ZpbmFsaXphdGlvblJlZ2lzdHJ5IiwiI2lkIiwiI2RldGFjaCIsIiNib2R5IiwiI2lubmVyIiwiI2N0eCJdLCJzb3VyY2VzIjpbIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvbm9kZV9tb2R1bGVzL2hlYWRlcnMtcG9seWZpbGwvbGliL2luZGV4Lm1qcyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvbm9kZV9tb2R1bGVzL3NwYWNldGltZWRiL2Rpc3Qvc2VydmVyL2luZGV4Lm1qcyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3R5cGVzL2VudW1zLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL3VzZXIudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90YWJsZXMvdXNlcklkZW50aXR5LnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL3NlcnZlcklkZW50aXR5LnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL2hzckNoYXJhY3Rlci50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9oc3JMaWdodGNvbmUudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90eXBlcy9zdHJ1Y3RzLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL2hzckNoYXJhY3RlckNvc3QudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90YWJsZXMvaHNyTGlnaHRjb25lQ29zdC50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9oc3JTeW5lcmd5Q29zdC50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieS50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieU1lbWJlci50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9sb2JieUN1cnNvckV2ZW50LnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL21hdGNoU2Vzc2lvbi50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3RhYmxlcy9tYXRjaFNlc3Npb25TdGVwLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvdGFibGVzL21hdGNoU2Vzc2lvbkhpc3RvcnkudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy90YWJsZXMvbWF0Y2hTZXNzaW9uU3RlcEhpc3RvcnkudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9zY2hlbWEudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9yZWR1Y2Vycy9jdXJzb3IudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9yZWR1Y2Vycy9hdXRoLnRzIiwiRDovR2l0c1dvcmsvaHNycHZwLXNwYWNldGltZWRiLW5leHRqcy9zcGFjZXRpbWVkYi9zcmMvcmVkdWNlcnMvcHJvZmlsZS50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL3JlZHVjZXJzL3NlcnZlci50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL2hlbHBlcnMvZW5zdXJlUGVybWlzc2lvbnMudHMiLCJEOi9HaXRzV29yay9oc3JwdnAtc3BhY2V0aW1lZGItbmV4dGpzL3NwYWNldGltZWRiL3NyYy9yZWR1Y2Vycy9hZG1pbi50cyIsIkQ6L0dpdHNXb3JrL2hzcnB2cC1zcGFjZXRpbWVkYi1uZXh0anMvc3BhY2V0aW1lZGIvc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBfX2NyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XHJcbnZhciBfX2RlZlByb3AgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XHJcbnZhciBfX2dldE93blByb3BEZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcclxudmFyIF9fZ2V0T3duUHJvcE5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XHJcbnZhciBfX2dldFByb3RvT2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XHJcbnZhciBfX2hhc093blByb3AgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xyXG52YXIgX19jb21tb25KUyA9IChjYiwgbW9kKSA9PiBmdW5jdGlvbiBfX3JlcXVpcmUoKSB7XHJcbiAgcmV0dXJuIG1vZCB8fCAoMCwgY2JbX19nZXRPd25Qcm9wTmFtZXMoY2IpWzBdXSkoKG1vZCA9IHsgZXhwb3J0czoge30gfSkuZXhwb3J0cywgbW9kKSwgbW9kLmV4cG9ydHM7XHJcbn07XHJcbnZhciBfX2NvcHlQcm9wcyA9ICh0bywgZnJvbSwgZXhjZXB0LCBkZXNjKSA9PiB7XHJcbiAgaWYgKGZyb20gJiYgdHlwZW9mIGZyb20gPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGZyb20gPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgZm9yIChsZXQga2V5IG9mIF9fZ2V0T3duUHJvcE5hbWVzKGZyb20pKVxyXG4gICAgICBpZiAoIV9faGFzT3duUHJvcC5jYWxsKHRvLCBrZXkpICYmIGtleSAhPT0gZXhjZXB0KVxyXG4gICAgICAgIF9fZGVmUHJvcCh0bywga2V5LCB7IGdldDogKCkgPT4gZnJvbVtrZXldLCBlbnVtZXJhYmxlOiAhKGRlc2MgPSBfX2dldE93blByb3BEZXNjKGZyb20sIGtleSkpIHx8IGRlc2MuZW51bWVyYWJsZSB9KTtcclxuICB9XHJcbiAgcmV0dXJuIHRvO1xyXG59O1xyXG52YXIgX190b0VTTSA9IChtb2QsIGlzTm9kZU1vZGUsIHRhcmdldCkgPT4gKHRhcmdldCA9IG1vZCAhPSBudWxsID8gX19jcmVhdGUoX19nZXRQcm90b09mKG1vZCkpIDoge30sIF9fY29weVByb3BzKFxyXG4gIC8vIElmIHRoZSBpbXBvcnRlciBpcyBpbiBub2RlIGNvbXBhdGliaWxpdHkgbW9kZSBvciB0aGlzIGlzIG5vdCBhbiBFU01cclxuICAvLyBmaWxlIHRoYXQgaGFzIGJlZW4gY29udmVydGVkIHRvIGEgQ29tbW9uSlMgZmlsZSB1c2luZyBhIEJhYmVsLVxyXG4gIC8vIGNvbXBhdGlibGUgdHJhbnNmb3JtIChpLmUuIFwiX19lc01vZHVsZVwiIGhhcyBub3QgYmVlbiBzZXQpLCB0aGVuIHNldFxyXG4gIC8vIFwiZGVmYXVsdFwiIHRvIHRoZSBDb21tb25KUyBcIm1vZHVsZS5leHBvcnRzXCIgZm9yIG5vZGUgY29tcGF0aWJpbGl0eS5cclxuICBpc05vZGVNb2RlIHx8ICFtb2QgfHwgIW1vZC5fX2VzTW9kdWxlID8gX19kZWZQcm9wKHRhcmdldCwgXCJkZWZhdWx0XCIsIHsgdmFsdWU6IG1vZCwgZW51bWVyYWJsZTogdHJ1ZSB9KSA6IHRhcmdldCxcclxuICBtb2RcclxuKSk7XHJcblxyXG4vLyBub2RlX21vZHVsZXMvc2V0LWNvb2tpZS1wYXJzZXIvbGliL3NldC1jb29raWUuanNcclxudmFyIHJlcXVpcmVfc2V0X2Nvb2tpZSA9IF9fY29tbW9uSlMoe1xyXG4gIFwibm9kZV9tb2R1bGVzL3NldC1jb29raWUtcGFyc2VyL2xpYi9zZXQtY29va2llLmpzXCIoZXhwb3J0cywgbW9kdWxlKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgIHZhciBkZWZhdWx0UGFyc2VPcHRpb25zID0ge1xyXG4gICAgICBkZWNvZGVWYWx1ZXM6IHRydWUsXHJcbiAgICAgIG1hcDogZmFsc2UsXHJcbiAgICAgIHNpbGVudDogZmFsc2VcclxuICAgIH07XHJcbiAgICBmdW5jdGlvbiBpc05vbkVtcHR5U3RyaW5nKHN0cikge1xyXG4gICAgICByZXR1cm4gdHlwZW9mIHN0ciA9PT0gXCJzdHJpbmdcIiAmJiAhIXN0ci50cmltKCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBwYXJzZVN0cmluZyhzZXRDb29raWVWYWx1ZSwgb3B0aW9ucykge1xyXG4gICAgICB2YXIgcGFydHMgPSBzZXRDb29raWVWYWx1ZS5zcGxpdChcIjtcIikuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpO1xyXG4gICAgICB2YXIgbmFtZVZhbHVlUGFpclN0ciA9IHBhcnRzLnNoaWZ0KCk7XHJcbiAgICAgIHZhciBwYXJzZWQgPSBwYXJzZU5hbWVWYWx1ZVBhaXIobmFtZVZhbHVlUGFpclN0cik7XHJcbiAgICAgIHZhciBuYW1lID0gcGFyc2VkLm5hbWU7XHJcbiAgICAgIHZhciB2YWx1ZSA9IHBhcnNlZC52YWx1ZTtcclxuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgPyBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UGFyc2VPcHRpb25zLCBvcHRpb25zKSA6IGRlZmF1bHRQYXJzZU9wdGlvbnM7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdmFsdWUgPSBvcHRpb25zLmRlY29kZVZhbHVlcyA/IGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkgOiB2YWx1ZTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXHJcbiAgICAgICAgICBcInNldC1jb29raWUtcGFyc2VyIGVuY291bnRlcmVkIGFuIGVycm9yIHdoaWxlIGRlY29kaW5nIGEgY29va2llIHdpdGggdmFsdWUgJ1wiICsgdmFsdWUgKyBcIicuIFNldCBvcHRpb25zLmRlY29kZVZhbHVlcyB0byBmYWxzZSB0byBkaXNhYmxlIHRoaXMgZmVhdHVyZS5cIixcclxuICAgICAgICAgIGVcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBjb29raWUgPSB7XHJcbiAgICAgICAgbmFtZSxcclxuICAgICAgICB2YWx1ZVxyXG4gICAgICB9O1xyXG4gICAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnQpIHtcclxuICAgICAgICB2YXIgc2lkZXMgPSBwYXJ0LnNwbGl0KFwiPVwiKTtcclxuICAgICAgICB2YXIga2V5ID0gc2lkZXMuc2hpZnQoKS50cmltTGVmdCgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgdmFyIHZhbHVlMiA9IHNpZGVzLmpvaW4oXCI9XCIpO1xyXG4gICAgICAgIGlmIChrZXkgPT09IFwiZXhwaXJlc1wiKSB7XHJcbiAgICAgICAgICBjb29raWUuZXhwaXJlcyA9IG5ldyBEYXRlKHZhbHVlMik7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwibWF4LWFnZVwiKSB7XHJcbiAgICAgICAgICBjb29raWUubWF4QWdlID0gcGFyc2VJbnQodmFsdWUyLCAxMCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwic2VjdXJlXCIpIHtcclxuICAgICAgICAgIGNvb2tpZS5zZWN1cmUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSBcImh0dHBvbmx5XCIpIHtcclxuICAgICAgICAgIGNvb2tpZS5odHRwT25seSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09IFwic2FtZXNpdGVcIikge1xyXG4gICAgICAgICAgY29va2llLnNhbWVTaXRlID0gdmFsdWUyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb29raWVba2V5XSA9IHZhbHVlMjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gY29va2llO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcGFyc2VOYW1lVmFsdWVQYWlyKG5hbWVWYWx1ZVBhaXJTdHIpIHtcclxuICAgICAgdmFyIG5hbWUgPSBcIlwiO1xyXG4gICAgICB2YXIgdmFsdWUgPSBcIlwiO1xyXG4gICAgICB2YXIgbmFtZVZhbHVlQXJyID0gbmFtZVZhbHVlUGFpclN0ci5zcGxpdChcIj1cIik7XHJcbiAgICAgIGlmIChuYW1lVmFsdWVBcnIubGVuZ3RoID4gMSkge1xyXG4gICAgICAgIG5hbWUgPSBuYW1lVmFsdWVBcnIuc2hpZnQoKTtcclxuICAgICAgICB2YWx1ZSA9IG5hbWVWYWx1ZUFyci5qb2luKFwiPVwiKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB2YWx1ZSA9IG5hbWVWYWx1ZVBhaXJTdHI7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHsgbmFtZSwgdmFsdWUgfTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHBhcnNlKGlucHV0LCBvcHRpb25zKSB7XHJcbiAgICAgIG9wdGlvbnMgPSBvcHRpb25zID8gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdFBhcnNlT3B0aW9ucywgb3B0aW9ucykgOiBkZWZhdWx0UGFyc2VPcHRpb25zO1xyXG4gICAgICBpZiAoIWlucHV0KSB7XHJcbiAgICAgICAgaWYgKCFvcHRpb25zLm1hcCkge1xyXG4gICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4ge307XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpbnB1dC5oZWFkZXJzKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpbnB1dC5oZWFkZXJzLmdldFNldENvb2tpZSA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICBpbnB1dCA9IGlucHV0LmhlYWRlcnMuZ2V0U2V0Q29va2llKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5oZWFkZXJzW1wic2V0LWNvb2tpZVwiXSkge1xyXG4gICAgICAgICAgaW5wdXQgPSBpbnB1dC5oZWFkZXJzW1wic2V0LWNvb2tpZVwiXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdmFyIHNjaCA9IGlucHV0LmhlYWRlcnNbT2JqZWN0LmtleXMoaW5wdXQuaGVhZGVycykuZmluZChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGtleS50b0xvd2VyQ2FzZSgpID09PSBcInNldC1jb29raWVcIjtcclxuICAgICAgICAgIH0pXTtcclxuICAgICAgICAgIGlmICghc2NoICYmIGlucHV0LmhlYWRlcnMuY29va2llICYmICFvcHRpb25zLnNpbGVudCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAgICAgXCJXYXJuaW5nOiBzZXQtY29va2llLXBhcnNlciBhcHBlYXJzIHRvIGhhdmUgYmVlbiBjYWxsZWQgb24gYSByZXF1ZXN0IG9iamVjdC4gSXQgaXMgZGVzaWduZWQgdG8gcGFyc2UgU2V0LUNvb2tpZSBoZWFkZXJzIGZyb20gcmVzcG9uc2VzLCBub3QgQ29va2llIGhlYWRlcnMgZnJvbSByZXF1ZXN0cy4gU2V0IHRoZSBvcHRpb24ge3NpbGVudDogdHJ1ZX0gdG8gc3VwcHJlc3MgdGhpcyB3YXJuaW5nLlwiXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpbnB1dCA9IHNjaDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGlucHV0KSkge1xyXG4gICAgICAgIGlucHV0ID0gW2lucHV0XTtcclxuICAgICAgfVxyXG4gICAgICBvcHRpb25zID0gb3B0aW9ucyA/IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQYXJzZU9wdGlvbnMsIG9wdGlvbnMpIDogZGVmYXVsdFBhcnNlT3B0aW9ucztcclxuICAgICAgaWYgKCFvcHRpb25zLm1hcCkge1xyXG4gICAgICAgIHJldHVybiBpbnB1dC5maWx0ZXIoaXNOb25FbXB0eVN0cmluZykubWFwKGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgICAgcmV0dXJuIHBhcnNlU3RyaW5nKHN0ciwgb3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdmFyIGNvb2tpZXMgPSB7fTtcclxuICAgICAgICByZXR1cm4gaW5wdXQuZmlsdGVyKGlzTm9uRW1wdHlTdHJpbmcpLnJlZHVjZShmdW5jdGlvbihjb29raWVzMiwgc3RyKSB7XHJcbiAgICAgICAgICB2YXIgY29va2llID0gcGFyc2VTdHJpbmcoc3RyLCBvcHRpb25zKTtcclxuICAgICAgICAgIGNvb2tpZXMyW2Nvb2tpZS5uYW1lXSA9IGNvb2tpZTtcclxuICAgICAgICAgIHJldHVybiBjb29raWVzMjtcclxuICAgICAgICB9LCBjb29raWVzKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc3BsaXRDb29raWVzU3RyaW5nMihjb29raWVzU3RyaW5nKSB7XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvb2tpZXNTdHJpbmcpKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvb2tpZXNTdHJpbmc7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBjb29raWVzU3RyaW5nICE9PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBjb29raWVzU3RyaW5ncyA9IFtdO1xyXG4gICAgICB2YXIgcG9zID0gMDtcclxuICAgICAgdmFyIHN0YXJ0O1xyXG4gICAgICB2YXIgY2g7XHJcbiAgICAgIHZhciBsYXN0Q29tbWE7XHJcbiAgICAgIHZhciBuZXh0U3RhcnQ7XHJcbiAgICAgIHZhciBjb29raWVzU2VwYXJhdG9yRm91bmQ7XHJcbiAgICAgIGZ1bmN0aW9uIHNraXBXaGl0ZXNwYWNlKCkge1xyXG4gICAgICAgIHdoaWxlIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCAmJiAvXFxzLy50ZXN0KGNvb2tpZXNTdHJpbmcuY2hhckF0KHBvcykpKSB7XHJcbiAgICAgICAgICBwb3MgKz0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoO1xyXG4gICAgICB9XHJcbiAgICAgIGZ1bmN0aW9uIG5vdFNwZWNpYWxDaGFyKCkge1xyXG4gICAgICAgIGNoID0gY29va2llc1N0cmluZy5jaGFyQXQocG9zKTtcclxuICAgICAgICByZXR1cm4gY2ggIT09IFwiPVwiICYmIGNoICE9PSBcIjtcIiAmJiBjaCAhPT0gXCIsXCI7XHJcbiAgICAgIH1cclxuICAgICAgd2hpbGUgKHBvcyA8IGNvb2tpZXNTdHJpbmcubGVuZ3RoKSB7XHJcbiAgICAgICAgc3RhcnQgPSBwb3M7XHJcbiAgICAgICAgY29va2llc1NlcGFyYXRvckZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgd2hpbGUgKHNraXBXaGl0ZXNwYWNlKCkpIHtcclxuICAgICAgICAgIGNoID0gY29va2llc1N0cmluZy5jaGFyQXQocG9zKTtcclxuICAgICAgICAgIGlmIChjaCA9PT0gXCIsXCIpIHtcclxuICAgICAgICAgICAgbGFzdENvbW1hID0gcG9zO1xyXG4gICAgICAgICAgICBwb3MgKz0gMTtcclxuICAgICAgICAgICAgc2tpcFdoaXRlc3BhY2UoKTtcclxuICAgICAgICAgICAgbmV4dFN0YXJ0ID0gcG9zO1xyXG4gICAgICAgICAgICB3aGlsZSAocG9zIDwgY29va2llc1N0cmluZy5sZW5ndGggJiYgbm90U3BlY2lhbENoYXIoKSkge1xyXG4gICAgICAgICAgICAgIHBvcyArPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwb3MgPCBjb29raWVzU3RyaW5nLmxlbmd0aCAmJiBjb29raWVzU3RyaW5nLmNoYXJBdChwb3MpID09PSBcIj1cIikge1xyXG4gICAgICAgICAgICAgIGNvb2tpZXNTZXBhcmF0b3JGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgcG9zID0gbmV4dFN0YXJ0O1xyXG4gICAgICAgICAgICAgIGNvb2tpZXNTdHJpbmdzLnB1c2goY29va2llc1N0cmluZy5zdWJzdHJpbmcoc3RhcnQsIGxhc3RDb21tYSkpO1xyXG4gICAgICAgICAgICAgIHN0YXJ0ID0gcG9zO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHBvcyA9IGxhc3RDb21tYSArIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBvcyArPSAxO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWNvb2tpZXNTZXBhcmF0b3JGb3VuZCB8fCBwb3MgPj0gY29va2llc1N0cmluZy5sZW5ndGgpIHtcclxuICAgICAgICAgIGNvb2tpZXNTdHJpbmdzLnB1c2goY29va2llc1N0cmluZy5zdWJzdHJpbmcoc3RhcnQsIGNvb2tpZXNTdHJpbmcubGVuZ3RoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBjb29raWVzU3RyaW5ncztcclxuICAgIH1cclxuICAgIG1vZHVsZS5leHBvcnRzID0gcGFyc2U7XHJcbiAgICBtb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xyXG4gICAgbW9kdWxlLmV4cG9ydHMucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcclxuICAgIG1vZHVsZS5leHBvcnRzLnNwbGl0Q29va2llc1N0cmluZyA9IHNwbGl0Q29va2llc1N0cmluZzI7XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIHNyYy9IZWFkZXJzLnRzXHJcbnZhciBpbXBvcnRfc2V0X2Nvb2tpZV9wYXJzZXIgPSBfX3RvRVNNKHJlcXVpcmVfc2V0X2Nvb2tpZSgpKTtcclxuXHJcbi8vIHNyYy91dGlscy9ub3JtYWxpemVIZWFkZXJOYW1lLnRzXHJcbnZhciBIRUFERVJTX0lOVkFMSURfQ0hBUkFDVEVSUyA9IC9bXmEtejAtOVxcLSMkJSYnKisuXl9gfH5dL2k7XHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSkge1xyXG4gIGlmIChIRUFERVJTX0lOVkFMSURfQ0hBUkFDVEVSUy50ZXN0KG5hbWUpIHx8IG5hbWUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWVcIik7XHJcbiAgfVxyXG4gIHJldHVybiBuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG59XHJcblxyXG4vLyBzcmMvdXRpbHMvbm9ybWFsaXplSGVhZGVyVmFsdWUudHNcclxudmFyIGNoYXJDb2Rlc1RvUmVtb3ZlID0gW1xyXG4gIFN0cmluZy5mcm9tQ2hhckNvZGUoMTApLFxyXG4gIFN0cmluZy5mcm9tQ2hhckNvZGUoMTMpLFxyXG4gIFN0cmluZy5mcm9tQ2hhckNvZGUoOSksXHJcbiAgU3RyaW5nLmZyb21DaGFyQ29kZSgzMilcclxuXTtcclxudmFyIEhFQURFUl9WQUxVRV9SRU1PVkVfUkVHRVhQID0gbmV3IFJlZ0V4cChcclxuICBgKF5bJHtjaGFyQ29kZXNUb1JlbW92ZS5qb2luKFwiXCIpfV18JFske2NoYXJDb2Rlc1RvUmVtb3ZlLmpvaW4oXCJcIil9XSlgLFxyXG4gIFwiZ1wiXHJcbik7XHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZUhlYWRlclZhbHVlKHZhbHVlKSB7XHJcbiAgY29uc3QgbmV4dFZhbHVlID0gdmFsdWUucmVwbGFjZShIRUFERVJfVkFMVUVfUkVNT1ZFX1JFR0VYUCwgXCJcIik7XHJcbiAgcmV0dXJuIG5leHRWYWx1ZTtcclxufVxyXG5cclxuLy8gc3JjL3V0aWxzL2lzVmFsaWRIZWFkZXJOYW1lLnRzXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZWFkZXJOYW1lKHZhbHVlKSB7XHJcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IGNoYXJhY3RlciA9IHZhbHVlLmNoYXJDb2RlQXQoaSk7XHJcbiAgICBpZiAoY2hhcmFjdGVyID4gMTI3IHx8ICFpc1Rva2VuKGNoYXJhY3RlcikpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5mdW5jdGlvbiBpc1Rva2VuKHZhbHVlKSB7XHJcbiAgcmV0dXJuICFbXHJcbiAgICAxMjcsXHJcbiAgICAzMixcclxuICAgIFwiKFwiLFxyXG4gICAgXCIpXCIsXHJcbiAgICBcIjxcIixcclxuICAgIFwiPlwiLFxyXG4gICAgXCJAXCIsXHJcbiAgICBcIixcIixcclxuICAgIFwiO1wiLFxyXG4gICAgXCI6XCIsXHJcbiAgICBcIlxcXFxcIixcclxuICAgICdcIicsXHJcbiAgICBcIi9cIixcclxuICAgIFwiW1wiLFxyXG4gICAgXCJdXCIsXHJcbiAgICBcIj9cIixcclxuICAgIFwiPVwiLFxyXG4gICAgXCJ7XCIsXHJcbiAgICBcIn1cIlxyXG4gIF0uaW5jbHVkZXModmFsdWUpO1xyXG59XHJcblxyXG4vLyBzcmMvdXRpbHMvaXNWYWxpZEhlYWRlclZhbHVlLnRzXHJcbmZ1bmN0aW9uIGlzVmFsaWRIZWFkZXJWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwic3RyaW5nXCIpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgaWYgKHZhbHVlLnRyaW0oKSAhPT0gdmFsdWUpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgY2hhcmFjdGVyID0gdmFsdWUuY2hhckNvZGVBdChpKTtcclxuICAgIGlmIChcclxuICAgICAgLy8gTlVMLlxyXG4gICAgICBjaGFyYWN0ZXIgPT09IDAgfHwgLy8gSFRUUCBuZXdsaW5lIGJ5dGVzLlxyXG4gICAgICBjaGFyYWN0ZXIgPT09IDEwIHx8IGNoYXJhY3RlciA9PT0gMTNcclxuICAgICkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG4vLyBzcmMvSGVhZGVycy50c1xyXG52YXIgTk9STUFMSVpFRF9IRUFERVJTID0gU3ltYm9sKFwibm9ybWFsaXplZEhlYWRlcnNcIik7XHJcbnZhciBSQVdfSEVBREVSX05BTUVTID0gU3ltYm9sKFwicmF3SGVhZGVyTmFtZXNcIik7XHJcbnZhciBIRUFERVJfVkFMVUVfREVMSU1JVEVSID0gXCIsIFwiO1xyXG52YXIgX2EsIF9iLCBfYztcclxudmFyIEhlYWRlcnMgPSBjbGFzcyBfSGVhZGVycyB7XHJcbiAgY29uc3RydWN0b3IoaW5pdCkge1xyXG4gICAgLy8gTm9ybWFsaXplZCBoZWFkZXIge1wibmFtZVwiOlwiYSwgYlwifSBzdG9yYWdlLlxyXG4gICAgdGhpc1tfYV0gPSB7fTtcclxuICAgIC8vIEtlZXBzIHRoZSBtYXBwaW5nIGJldHdlZW4gdGhlIHJhdyBoZWFkZXIgbmFtZVxyXG4gICAgLy8gYW5kIHRoZSBub3JtYWxpemVkIGhlYWRlciBuYW1lIHRvIGVhc2UgdGhlIGxvb2t1cC5cclxuICAgIHRoaXNbX2JdID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcclxuICAgIHRoaXNbX2NdID0gXCJIZWFkZXJzXCI7XHJcbiAgICBpZiAoW1wiSGVhZGVyc1wiLCBcIkhlYWRlcnNQb2x5ZmlsbFwiXS5pbmNsdWRlcyhpbml0Py5jb25zdHJ1Y3Rvci5uYW1lKSB8fCBpbml0IGluc3RhbmNlb2YgX0hlYWRlcnMgfHwgdHlwZW9mIGdsb2JhbFRoaXMuSGVhZGVycyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBpbml0IGluc3RhbmNlb2YgZ2xvYmFsVGhpcy5IZWFkZXJzKSB7XHJcbiAgICAgIGNvbnN0IGluaXRpYWxIZWFkZXJzID0gaW5pdDtcclxuICAgICAgaW5pdGlhbEhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIG5hbWUpID0+IHtcclxuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSk7XHJcbiAgICAgIH0sIHRoaXMpO1xyXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGluaXQpKSB7XHJcbiAgICAgIGluaXQuZm9yRWFjaCgoW25hbWUsIHZhbHVlXSkgPT4ge1xyXG4gICAgICAgIHRoaXMuYXBwZW5kKFxyXG4gICAgICAgICAgbmFtZSxcclxuICAgICAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpID8gdmFsdWUuam9pbihIRUFERVJfVkFMVUVfREVMSU1JVEVSKSA6IHZhbHVlXHJcbiAgICAgICAgKTtcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2UgaWYgKGluaXQpIHtcclxuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaW5pdCkuZm9yRWFjaCgobmFtZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbHVlID0gaW5pdFtuYW1lXTtcclxuICAgICAgICB0aGlzLmFwcGVuZChcclxuICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICBBcnJheS5pc0FycmF5KHZhbHVlKSA/IHZhbHVlLmpvaW4oSEVBREVSX1ZBTFVFX0RFTElNSVRFUikgOiB2YWx1ZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuICBbKF9hID0gTk9STUFMSVpFRF9IRUFERVJTLCBfYiA9IFJBV19IRUFERVJfTkFNRVMsIF9jID0gU3ltYm9sLnRvU3RyaW5nVGFnLCBTeW1ib2wuaXRlcmF0b3IpXSgpIHtcclxuICAgIHJldHVybiB0aGlzLmVudHJpZXMoKTtcclxuICB9XHJcbiAgKmtleXMoKSB7XHJcbiAgICBmb3IgKGNvbnN0IFtuYW1lXSBvZiB0aGlzLmVudHJpZXMoKSkge1xyXG4gICAgICB5aWVsZCBuYW1lO1xyXG4gICAgfVxyXG4gIH1cclxuICAqdmFsdWVzKCkge1xyXG4gICAgZm9yIChjb25zdCBbLCB2YWx1ZV0gb2YgdGhpcy5lbnRyaWVzKCkpIHtcclxuICAgICAgeWllbGQgdmFsdWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gICplbnRyaWVzKCkge1xyXG4gICAgbGV0IHNvcnRlZEtleXMgPSBPYmplY3Qua2V5cyh0aGlzW05PUk1BTElaRURfSEVBREVSU10pLnNvcnQoXHJcbiAgICAgIChhLCBiKSA9PiBhLmxvY2FsZUNvbXBhcmUoYilcclxuICAgICk7XHJcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygc29ydGVkS2V5cykge1xyXG4gICAgICBpZiAobmFtZSA9PT0gXCJzZXQtY29va2llXCIpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHRoaXMuZ2V0U2V0Q29va2llKCkpIHtcclxuICAgICAgICAgIHlpZWxkIFtuYW1lLCB2YWx1ZV07XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHlpZWxkIFtuYW1lLCB0aGlzLmdldChuYW1lKV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhIGJvb2xlYW4gc3RhdGluZyB3aGV0aGVyIGEgYEhlYWRlcnNgIG9iamVjdCBjb250YWlucyBhIGNlcnRhaW4gaGVhZGVyLlxyXG4gICAqL1xyXG4gIGhhcyhuYW1lKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZWFkZXJOYW1lKG5hbWUpKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgaGVhZGVyIG5hbWUgXCIke25hbWV9XCJgKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzW05PUk1BTElaRURfSEVBREVSU10uaGFzT3duUHJvcGVydHkobm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYSBgQnl0ZVN0cmluZ2Agc2VxdWVuY2Ugb2YgYWxsIHRoZSB2YWx1ZXMgb2YgYSBoZWFkZXIgd2l0aCBhIGdpdmVuIG5hbWUuXHJcbiAgICovXHJcbiAgZ2V0KG5hbWUpIHtcclxuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkpIHtcclxuICAgICAgdGhyb3cgVHlwZUVycm9yKGBJbnZhbGlkIGhlYWRlciBuYW1lIFwiJHtuYW1lfVwiYCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdW25vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSldID8/IG51bGw7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFNldHMgYSBuZXcgdmFsdWUgZm9yIGFuIGV4aXN0aW5nIGhlYWRlciBpbnNpZGUgYSBgSGVhZGVyc2Agb2JqZWN0LCBvciBhZGRzIHRoZSBoZWFkZXIgaWYgaXQgZG9lcyBub3QgYWxyZWFkeSBleGlzdC5cclxuICAgKi9cclxuICBzZXQobmFtZSwgdmFsdWUpIHtcclxuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkgfHwgIWlzVmFsaWRIZWFkZXJWYWx1ZSh2YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgbm9ybWFsaXplZE5hbWUgPSBub3JtYWxpemVIZWFkZXJOYW1lKG5hbWUpO1xyXG4gICAgY29uc3Qgbm9ybWFsaXplZFZhbHVlID0gbm9ybWFsaXplSGVhZGVyVmFsdWUodmFsdWUpO1xyXG4gICAgdGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdW25vcm1hbGl6ZWROYW1lXSA9IG5vcm1hbGl6ZUhlYWRlclZhbHVlKG5vcm1hbGl6ZWRWYWx1ZSk7XHJcbiAgICB0aGlzW1JBV19IRUFERVJfTkFNRVNdLnNldChub3JtYWxpemVkTmFtZSwgbmFtZSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEFwcGVuZHMgYSBuZXcgdmFsdWUgb250byBhbiBleGlzdGluZyBoZWFkZXIgaW5zaWRlIGEgYEhlYWRlcnNgIG9iamVjdCwgb3IgYWRkcyB0aGUgaGVhZGVyIGlmIGl0IGRvZXMgbm90IGFscmVhZHkgZXhpc3QuXHJcbiAgICovXHJcbiAgYXBwZW5kKG5hbWUsIHZhbHVlKSB7XHJcbiAgICBpZiAoIWlzVmFsaWRIZWFkZXJOYW1lKG5hbWUpIHx8ICFpc1ZhbGlkSGVhZGVyVmFsdWUodmFsdWUpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IG5vcm1hbGl6ZWROYW1lID0gbm9ybWFsaXplSGVhZGVyTmFtZShuYW1lKTtcclxuICAgIGNvbnN0IG5vcm1hbGl6ZWRWYWx1ZSA9IG5vcm1hbGl6ZUhlYWRlclZhbHVlKHZhbHVlKTtcclxuICAgIGxldCByZXNvbHZlZFZhbHVlID0gdGhpcy5oYXMobm9ybWFsaXplZE5hbWUpID8gYCR7dGhpcy5nZXQobm9ybWFsaXplZE5hbWUpfSwgJHtub3JtYWxpemVkVmFsdWV9YCA6IG5vcm1hbGl6ZWRWYWx1ZTtcclxuICAgIHRoaXMuc2V0KG5hbWUsIHJlc29sdmVkVmFsdWUpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBEZWxldGVzIGEgaGVhZGVyIGZyb20gdGhlIGBIZWFkZXJzYCBvYmplY3QuXHJcbiAgICovXHJcbiAgZGVsZXRlKG5hbWUpIHtcclxuICAgIGlmICghaXNWYWxpZEhlYWRlck5hbWUobmFtZSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKCF0aGlzLmhhcyhuYW1lKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBjb25zdCBub3JtYWxpemVkTmFtZSA9IG5vcm1hbGl6ZUhlYWRlck5hbWUobmFtZSk7XHJcbiAgICBkZWxldGUgdGhpc1tOT1JNQUxJWkVEX0hFQURFUlNdW25vcm1hbGl6ZWROYW1lXTtcclxuICAgIHRoaXNbUkFXX0hFQURFUl9OQU1FU10uZGVsZXRlKG5vcm1hbGl6ZWROYW1lKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogVHJhdmVyc2VzIHRoZSBgSGVhZGVyc2Agb2JqZWN0LFxyXG4gICAqIGNhbGxpbmcgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBlYWNoIGhlYWRlci5cclxuICAgKi9cclxuICBmb3JFYWNoKGNhbGxiYWNrLCB0aGlzQXJnKSB7XHJcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgdGhpcy5lbnRyaWVzKCkpIHtcclxuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcyk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0aGUgdmFsdWVzXHJcbiAgICogb2YgYWxsIFNldC1Db29raWUgaGVhZGVycyBhc3NvY2lhdGVkXHJcbiAgICogd2l0aCBhIHJlc3BvbnNlXHJcbiAgICovXHJcbiAgZ2V0U2V0Q29va2llKCkge1xyXG4gICAgY29uc3Qgc2V0Q29va2llSGVhZGVyID0gdGhpcy5nZXQoXCJzZXQtY29va2llXCIpO1xyXG4gICAgaWYgKHNldENvb2tpZUhlYWRlciA9PT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICBpZiAoc2V0Q29va2llSGVhZGVyID09PSBcIlwiKSB7XHJcbiAgICAgIHJldHVybiBbXCJcIl07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKDAsIGltcG9ydF9zZXRfY29va2llX3BhcnNlci5zcGxpdENvb2tpZXNTdHJpbmcpKHNldENvb2tpZUhlYWRlcik7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2dldFJhd0hlYWRlcnMudHNcclxuZnVuY3Rpb24gZ2V0UmF3SGVhZGVycyhoZWFkZXJzKSB7XHJcbiAgY29uc3QgcmF3SGVhZGVycyA9IHt9O1xyXG4gIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBoZWFkZXJzLmVudHJpZXMoKSkge1xyXG4gICAgcmF3SGVhZGVyc1toZWFkZXJzW1JBV19IRUFERVJfTkFNRVNdLmdldChuYW1lKV0gPSB2YWx1ZTtcclxuICB9XHJcbiAgcmV0dXJuIHJhd0hlYWRlcnM7XHJcbn1cclxuXHJcbi8vIHNyYy90cmFuc2Zvcm1lcnMvaGVhZGVyc1RvTGlzdC50c1xyXG5mdW5jdGlvbiBoZWFkZXJzVG9MaXN0KGhlYWRlcnMpIHtcclxuICBjb25zdCBoZWFkZXJzTGlzdCA9IFtdO1xyXG4gIGhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIG5hbWUpID0+IHtcclxuICAgIGNvbnN0IHJlc29sdmVkVmFsdWUgPSB2YWx1ZS5pbmNsdWRlcyhcIixcIikgPyB2YWx1ZS5zcGxpdChcIixcIikubWFwKCh2YWx1ZTIpID0+IHZhbHVlMi50cmltKCkpIDogdmFsdWU7XHJcbiAgICBoZWFkZXJzTGlzdC5wdXNoKFtuYW1lLCByZXNvbHZlZFZhbHVlXSk7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIGhlYWRlcnNMaXN0O1xyXG59XHJcblxyXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2hlYWRlcnNUb1N0cmluZy50c1xyXG5mdW5jdGlvbiBoZWFkZXJzVG9TdHJpbmcoaGVhZGVycykge1xyXG4gIGNvbnN0IGxpc3QgPSBoZWFkZXJzVG9MaXN0KGhlYWRlcnMpO1xyXG4gIGNvbnN0IGxpbmVzID0gbGlzdC5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+IHtcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtdLmNvbmNhdCh2YWx1ZSk7XHJcbiAgICByZXR1cm4gYCR7bmFtZX06ICR7dmFsdWVzLmpvaW4oXCIsIFwiKX1gO1xyXG4gIH0pO1xyXG4gIHJldHVybiBsaW5lcy5qb2luKFwiXFxyXFxuXCIpO1xyXG59XHJcblxyXG4vLyBzcmMvdHJhbnNmb3JtZXJzL2hlYWRlcnNUb09iamVjdC50c1xyXG52YXIgc2luZ2xlVmFsdWVIZWFkZXJzID0gW1widXNlci1hZ2VudFwiXTtcclxuZnVuY3Rpb24gaGVhZGVyc1RvT2JqZWN0KGhlYWRlcnMpIHtcclxuICBjb25zdCBoZWFkZXJzT2JqZWN0ID0ge307XHJcbiAgaGVhZGVycy5mb3JFYWNoKCh2YWx1ZSwgbmFtZSkgPT4ge1xyXG4gICAgY29uc3QgaXNNdWx0aVZhbHVlID0gIXNpbmdsZVZhbHVlSGVhZGVycy5pbmNsdWRlcyhuYW1lLnRvTG93ZXJDYXNlKCkpICYmIHZhbHVlLmluY2x1ZGVzKFwiLFwiKTtcclxuICAgIGhlYWRlcnNPYmplY3RbbmFtZV0gPSBpc011bHRpVmFsdWUgPyB2YWx1ZS5zcGxpdChcIixcIikubWFwKChzKSA9PiBzLnRyaW0oKSkgOiB2YWx1ZTtcclxuICB9KTtcclxuICByZXR1cm4gaGVhZGVyc09iamVjdDtcclxufVxyXG5cclxuLy8gc3JjL3RyYW5zZm9ybWVycy9zdHJpbmdUb0hlYWRlcnMudHNcclxuZnVuY3Rpb24gc3RyaW5nVG9IZWFkZXJzKHN0cikge1xyXG4gIGNvbnN0IGxpbmVzID0gc3RyLnRyaW0oKS5zcGxpdCgvW1xcclxcbl0rLyk7XHJcbiAgcmV0dXJuIGxpbmVzLnJlZHVjZSgoaGVhZGVycywgbGluZSkgPT4ge1xyXG4gICAgaWYgKGxpbmUudHJpbSgpID09PSBcIlwiKSB7XHJcbiAgICAgIHJldHVybiBoZWFkZXJzO1xyXG4gICAgfVxyXG4gICAgY29uc3QgcGFydHMgPSBsaW5lLnNwbGl0KFwiOiBcIik7XHJcbiAgICBjb25zdCBuYW1lID0gcGFydHMuc2hpZnQoKTtcclxuICAgIGNvbnN0IHZhbHVlID0gcGFydHMuam9pbihcIjogXCIpO1xyXG4gICAgaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUpO1xyXG4gICAgcmV0dXJuIGhlYWRlcnM7XHJcbiAgfSwgbmV3IEhlYWRlcnMoKSk7XHJcbn1cclxuXHJcbi8vIHNyYy90cmFuc2Zvcm1lcnMvbGlzdFRvSGVhZGVycy50c1xyXG5mdW5jdGlvbiBsaXN0VG9IZWFkZXJzKGxpc3QpIHtcclxuICBjb25zdCBoZWFkZXJzID0gbmV3IEhlYWRlcnMoKTtcclxuICBsaXN0LmZvckVhY2goKFtuYW1lLCB2YWx1ZV0pID0+IHtcclxuICAgIGNvbnN0IHZhbHVlcyA9IFtdLmNvbmNhdCh2YWx1ZSk7XHJcbiAgICB2YWx1ZXMuZm9yRWFjaCgodmFsdWUyKSA9PiB7XHJcbiAgICAgIGhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlMik7XHJcbiAgICB9KTtcclxuICB9KTtcclxuICByZXR1cm4gaGVhZGVycztcclxufVxyXG5cclxuLy8gc3JjL3RyYW5zZm9ybWVycy9yZWR1Y2VIZWFkZXJzT2JqZWN0LnRzXHJcbmZ1bmN0aW9uIHJlZHVjZUhlYWRlcnNPYmplY3QoaGVhZGVycywgcmVkdWNlciwgaW5pdGlhbFN0YXRlKSB7XHJcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGhlYWRlcnMpLnJlZHVjZSgobmV4dEhlYWRlcnMsIG5hbWUpID0+IHtcclxuICAgIHJldHVybiByZWR1Y2VyKG5leHRIZWFkZXJzLCBuYW1lLCBoZWFkZXJzW25hbWVdKTtcclxuICB9LCBpbml0aWFsU3RhdGUpO1xyXG59XHJcblxyXG4vLyBzcmMvdHJhbnNmb3JtZXJzL29iamVjdFRvSGVhZGVycy50c1xyXG5mdW5jdGlvbiBvYmplY3RUb0hlYWRlcnMoaGVhZGVyc09iamVjdCkge1xyXG4gIHJldHVybiByZWR1Y2VIZWFkZXJzT2JqZWN0KFxyXG4gICAgaGVhZGVyc09iamVjdCxcclxuICAgIChoZWFkZXJzLCBuYW1lLCB2YWx1ZSkgPT4ge1xyXG4gICAgICBjb25zdCB2YWx1ZXMgPSBbXS5jb25jYXQodmFsdWUpLmZpbHRlcihCb29sZWFuKTtcclxuICAgICAgdmFsdWVzLmZvckVhY2goKHZhbHVlMikgPT4ge1xyXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKG5hbWUsIHZhbHVlMik7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gaGVhZGVycztcclxuICAgIH0sXHJcbiAgICBuZXcgSGVhZGVycygpXHJcbiAgKTtcclxufVxyXG5cclxuLy8gc3JjL3RyYW5zZm9ybWVycy9mbGF0dGVuSGVhZGVyc0xpc3QudHNcclxuZnVuY3Rpb24gZmxhdHRlbkhlYWRlcnNMaXN0KGxpc3QpIHtcclxuICByZXR1cm4gbGlzdC5tYXAoKFtuYW1lLCB2YWx1ZXNdKSA9PiB7XHJcbiAgICByZXR1cm4gW25hbWUsIFtdLmNvbmNhdCh2YWx1ZXMpLmpvaW4oXCIsIFwiKV07XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vIHNyYy90cmFuc2Zvcm1lcnMvZmxhdHRlbkhlYWRlcnNPYmplY3QudHNcclxuZnVuY3Rpb24gZmxhdHRlbkhlYWRlcnNPYmplY3QoaGVhZGVyc09iamVjdCkge1xyXG4gIHJldHVybiByZWR1Y2VIZWFkZXJzT2JqZWN0KFxyXG4gICAgaGVhZGVyc09iamVjdCxcclxuICAgIChoZWFkZXJzLCBuYW1lLCB2YWx1ZSkgPT4ge1xyXG4gICAgICBoZWFkZXJzW25hbWVdID0gW10uY29uY2F0KHZhbHVlKS5qb2luKFwiLCBcIik7XHJcbiAgICAgIHJldHVybiBoZWFkZXJzO1xyXG4gICAgfSxcclxuICAgIHt9XHJcbiAgKTtcclxufVxyXG5leHBvcnQge1xyXG4gIEhlYWRlcnMsXHJcbiAgZmxhdHRlbkhlYWRlcnNMaXN0LFxyXG4gIGZsYXR0ZW5IZWFkZXJzT2JqZWN0LFxyXG4gIGdldFJhd0hlYWRlcnMsXHJcbiAgaGVhZGVyc1RvTGlzdCxcclxuICBoZWFkZXJzVG9PYmplY3QsXHJcbiAgaGVhZGVyc1RvU3RyaW5nLFxyXG4gIGxpc3RUb0hlYWRlcnMsXHJcbiAgb2JqZWN0VG9IZWFkZXJzLFxyXG4gIHJlZHVjZUhlYWRlcnNPYmplY3QsXHJcbiAgc3RyaW5nVG9IZWFkZXJzXHJcbn07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXAiLCJpbXBvcnQgKiBhcyBfc3lzY2FsbHMyXzAgZnJvbSAnc3BhY2V0aW1lOnN5c0AyLjAnO1xyXG5pbXBvcnQgeyBtb2R1bGVIb29rcyB9IGZyb20gJ3NwYWNldGltZTpzeXNAMi4wJztcclxuaW1wb3J0IHsgaGVhZGVyc1RvTGlzdCwgSGVhZGVycyB9IGZyb20gJ2hlYWRlcnMtcG9seWZpbGwnO1xyXG5cclxudHlwZW9mIGdsb2JhbFRoaXMhPT1cInVuZGVmaW5lZFwiJiYoKGdsb2JhbFRoaXMuZ2xvYmFsPWdsb2JhbFRoaXMuZ2xvYmFsfHxnbG9iYWxUaGlzKSwoZ2xvYmFsVGhpcy53aW5kb3c9Z2xvYmFsVGhpcy53aW5kb3d8fGdsb2JhbFRoaXMpKTtcclxudmFyIF9fY3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcclxudmFyIF9fZGVmUHJvcCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcclxudmFyIF9fZ2V0T3duUHJvcERlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xyXG52YXIgX19nZXRPd25Qcm9wTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcztcclxudmFyIF9fZ2V0UHJvdG9PZiA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcclxudmFyIF9faGFzT3duUHJvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XHJcbnZhciBfX2VzbSA9IChmbiwgcmVzKSA9PiBmdW5jdGlvbiBfX2luaXQoKSB7XHJcbiAgcmV0dXJuIGZuICYmIChyZXMgPSAoMCwgZm5bX19nZXRPd25Qcm9wTmFtZXMoZm4pWzBdXSkoZm4gPSAwKSksIHJlcztcclxufTtcclxudmFyIF9fY29tbW9uSlMgPSAoY2IsIG1vZCkgPT4gZnVuY3Rpb24gX19yZXF1aXJlKCkge1xyXG4gIHJldHVybiBtb2QgfHwgKDAsIGNiW19fZ2V0T3duUHJvcE5hbWVzKGNiKVswXV0pKChtb2QgPSB7IGV4cG9ydHM6IHt9IH0pLmV4cG9ydHMsIG1vZCksIG1vZC5leHBvcnRzO1xyXG59O1xyXG52YXIgX19leHBvcnQgPSAodGFyZ2V0LCBhbGwpID0+IHtcclxuICBmb3IgKHZhciBuYW1lIGluIGFsbClcclxuICAgIF9fZGVmUHJvcCh0YXJnZXQsIG5hbWUsIHsgZ2V0OiBhbGxbbmFtZV0sIGVudW1lcmFibGU6IHRydWUgfSk7XHJcbn07XHJcbnZhciBfX2NvcHlQcm9wcyA9ICh0bywgZnJvbSwgZXhjZXB0LCBkZXNjKSA9PiB7XHJcbiAgaWYgKGZyb20gJiYgdHlwZW9mIGZyb20gPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGZyb20gPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgZm9yIChsZXQga2V5IG9mIF9fZ2V0T3duUHJvcE5hbWVzKGZyb20pKVxyXG4gICAgICBpZiAoIV9faGFzT3duUHJvcC5jYWxsKHRvLCBrZXkpICYmIGtleSAhPT0gZXhjZXB0KVxyXG4gICAgICAgIF9fZGVmUHJvcCh0bywga2V5LCB7IGdldDogKCkgPT4gZnJvbVtrZXldLCBlbnVtZXJhYmxlOiAhKGRlc2MgPSBfX2dldE93blByb3BEZXNjKGZyb20sIGtleSkpIHx8IGRlc2MuZW51bWVyYWJsZSB9KTtcclxuICB9XHJcbiAgcmV0dXJuIHRvO1xyXG59O1xyXG52YXIgX190b0VTTSA9IChtb2QsIGlzTm9kZU1vZGUsIHRhcmdldCkgPT4gKHRhcmdldCA9IG1vZCAhPSBudWxsID8gX19jcmVhdGUoX19nZXRQcm90b09mKG1vZCkpIDoge30sIF9fY29weVByb3BzKFxyXG4gIC8vIElmIHRoZSBpbXBvcnRlciBpcyBpbiBub2RlIGNvbXBhdGliaWxpdHkgbW9kZSBvciB0aGlzIGlzIG5vdCBhbiBFU01cclxuICAvLyBmaWxlIHRoYXQgaGFzIGJlZW4gY29udmVydGVkIHRvIGEgQ29tbW9uSlMgZmlsZSB1c2luZyBhIEJhYmVsLVxyXG4gIC8vIGNvbXBhdGlibGUgdHJhbnNmb3JtIChpLmUuIFwiX19lc01vZHVsZVwiIGhhcyBub3QgYmVlbiBzZXQpLCB0aGVuIHNldFxyXG4gIC8vIFwiZGVmYXVsdFwiIHRvIHRoZSBDb21tb25KUyBcIm1vZHVsZS5leHBvcnRzXCIgZm9yIG5vZGUgY29tcGF0aWJpbGl0eS5cclxuICBfX2RlZlByb3AodGFyZ2V0LCBcImRlZmF1bHRcIiwgeyB2YWx1ZTogbW9kLCBlbnVtZXJhYmxlOiB0cnVlIH0pICxcclxuICBtb2RcclxuKSk7XHJcbnZhciBfX3RvQ29tbW9uSlMgPSAobW9kKSA9PiBfX2NvcHlQcm9wcyhfX2RlZlByb3Aoe30sIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pLCBtb2QpO1xyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2Jhc2U2NC1qc0AxLjUuMS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzXHJcbnZhciByZXF1aXJlX2Jhc2U2NF9qcyA9IF9fY29tbW9uSlMoe1xyXG4gIFwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2Jhc2U2NC1qc0AxLjUuMS9ub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzXCIoZXhwb3J0cykge1xyXG4gICAgZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aDtcclxuICAgIGV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheTtcclxuICAgIGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXkyO1xyXG4gICAgdmFyIGxvb2t1cCA9IFtdO1xyXG4gICAgdmFyIHJldkxvb2t1cCA9IFtdO1xyXG4gICAgdmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSBcInVuZGVmaW5lZFwiID8gVWludDhBcnJheSA6IEFycmF5O1xyXG4gICAgdmFyIGNvZGUgPSBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky9cIjtcclxuICAgIGZvciAoaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuICAgICAgbG9va3VwW2ldID0gY29kZVtpXTtcclxuICAgICAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpO1xyXG4gICAgfVxyXG4gICAgdmFyIGk7XHJcbiAgICB2YXIgbGVuO1xyXG4gICAgcmV2TG9va3VwW1wiLVwiLmNoYXJDb2RlQXQoMCldID0gNjI7XHJcbiAgICByZXZMb29rdXBbXCJfXCIuY2hhckNvZGVBdCgwKV0gPSA2MztcclxuICAgIGZ1bmN0aW9uIGdldExlbnMoYjY0KSB7XHJcbiAgICAgIHZhciBsZW4yID0gYjY0Lmxlbmd0aDtcclxuICAgICAgaWYgKGxlbjIgJSA0ID4gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDRcIik7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHZhbGlkTGVuID0gYjY0LmluZGV4T2YoXCI9XCIpO1xyXG4gICAgICBpZiAodmFsaWRMZW4gPT09IC0xKSB2YWxpZExlbiA9IGxlbjI7XHJcbiAgICAgIHZhciBwbGFjZUhvbGRlcnNMZW4gPSB2YWxpZExlbiA9PT0gbGVuMiA/IDAgOiA0IC0gdmFsaWRMZW4gJSA0O1xyXG4gICAgICByZXR1cm4gW3ZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW5dO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gYnl0ZUxlbmd0aChiNjQpIHtcclxuICAgICAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NCk7XHJcbiAgICAgIHZhciB2YWxpZExlbiA9IGxlbnNbMF07XHJcbiAgICAgIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdO1xyXG4gICAgICByZXR1cm4gKHZhbGlkTGVuICsgcGxhY2VIb2xkZXJzTGVuKSAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzTGVuO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX2J5dGVMZW5ndGgoYjY0LCB2YWxpZExlbiwgcGxhY2VIb2xkZXJzTGVuKSB7XHJcbiAgICAgIHJldHVybiAodmFsaWRMZW4gKyBwbGFjZUhvbGRlcnNMZW4pICogMyAvIDQgLSBwbGFjZUhvbGRlcnNMZW47XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0b0J5dGVBcnJheShiNjQpIHtcclxuICAgICAgdmFyIHRtcDtcclxuICAgICAgdmFyIGxlbnMgPSBnZXRMZW5zKGI2NCk7XHJcbiAgICAgIHZhciB2YWxpZExlbiA9IGxlbnNbMF07XHJcbiAgICAgIHZhciBwbGFjZUhvbGRlcnNMZW4gPSBsZW5zWzFdO1xyXG4gICAgICB2YXIgYXJyID0gbmV3IEFycihfYnl0ZUxlbmd0aChiNjQsIHZhbGlkTGVuLCBwbGFjZUhvbGRlcnNMZW4pKTtcclxuICAgICAgdmFyIGN1ckJ5dGUgPSAwO1xyXG4gICAgICB2YXIgbGVuMiA9IHBsYWNlSG9sZGVyc0xlbiA+IDAgPyB2YWxpZExlbiAtIDQgOiB2YWxpZExlbjtcclxuICAgICAgdmFyIGkyO1xyXG4gICAgICBmb3IgKGkyID0gMDsgaTIgPCBsZW4yOyBpMiArPSA0KSB7XHJcbiAgICAgICAgdG1wID0gcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyKV0gPDwgMTggfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAxKV0gPDwgMTIgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAyKV0gPDwgNiB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMiArIDMpXTtcclxuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCA+PiAxNiAmIDI1NTtcclxuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCA+PiA4ICYgMjU1O1xyXG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMjU1O1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChwbGFjZUhvbGRlcnNMZW4gPT09IDIpIHtcclxuICAgICAgICB0bXAgPSByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIpXSA8PCAyIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMSldID4+IDQ7XHJcbiAgICAgICAgYXJyW2N1ckJ5dGUrK10gPSB0bXAgJiAyNTU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHBsYWNlSG9sZGVyc0xlbiA9PT0gMSkge1xyXG4gICAgICAgIHRtcCA9IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpMildIDw8IDEwIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkyICsgMSldIDw8IDQgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaTIgKyAyKV0gPj4gMjtcclxuICAgICAgICBhcnJbY3VyQnl0ZSsrXSA9IHRtcCA+PiA4ICYgMjU1O1xyXG4gICAgICAgIGFycltjdXJCeXRlKytdID0gdG1wICYgMjU1O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBhcnI7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQobnVtKSB7XHJcbiAgICAgIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgNjNdICsgbG9va3VwW251bSA+PiAxMiAmIDYzXSArIGxvb2t1cFtudW0gPj4gNiAmIDYzXSArIGxvb2t1cFtudW0gJiA2M107XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBlbmNvZGVDaHVuayh1aW50OCwgc3RhcnQsIGVuZCkge1xyXG4gICAgICB2YXIgdG1wO1xyXG4gICAgICB2YXIgb3V0cHV0ID0gW107XHJcbiAgICAgIGZvciAodmFyIGkyID0gc3RhcnQ7IGkyIDwgZW5kOyBpMiArPSAzKSB7XHJcbiAgICAgICAgdG1wID0gKHVpbnQ4W2kyXSA8PCAxNiAmIDE2NzExNjgwKSArICh1aW50OFtpMiArIDFdIDw8IDggJiA2NTI4MCkgKyAodWludDhbaTIgKyAyXSAmIDI1NSk7XHJcbiAgICAgICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBvdXRwdXQuam9pbihcIlwiKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGZyb21CeXRlQXJyYXkyKHVpbnQ4KSB7XHJcbiAgICAgIHZhciB0bXA7XHJcbiAgICAgIHZhciBsZW4yID0gdWludDgubGVuZ3RoO1xyXG4gICAgICB2YXIgZXh0cmFCeXRlcyA9IGxlbjIgJSAzO1xyXG4gICAgICB2YXIgcGFydHMgPSBbXTtcclxuICAgICAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODM7XHJcbiAgICAgIGZvciAodmFyIGkyID0gMCwgbGVuMjIgPSBsZW4yIC0gZXh0cmFCeXRlczsgaTIgPCBsZW4yMjsgaTIgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcclxuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpMiwgaTIgKyBtYXhDaHVua0xlbmd0aCA+IGxlbjIyID8gbGVuMjIgOiBpMiArIG1heENodW5rTGVuZ3RoKSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcclxuICAgICAgICB0bXAgPSB1aW50OFtsZW4yIC0gMV07XHJcbiAgICAgICAgcGFydHMucHVzaChcclxuICAgICAgICAgIGxvb2t1cFt0bXAgPj4gMl0gKyBsb29rdXBbdG1wIDw8IDQgJiA2M10gKyBcIj09XCJcclxuICAgICAgICApO1xyXG4gICAgICB9IGVsc2UgaWYgKGV4dHJhQnl0ZXMgPT09IDIpIHtcclxuICAgICAgICB0bXAgPSAodWludDhbbGVuMiAtIDJdIDw8IDgpICsgdWludDhbbGVuMiAtIDFdO1xyXG4gICAgICAgIHBhcnRzLnB1c2goXHJcbiAgICAgICAgICBsb29rdXBbdG1wID4+IDEwXSArIGxvb2t1cFt0bXAgPj4gNCAmIDYzXSArIGxvb2t1cFt0bXAgPDwgMiAmIDYzXSArIFwiPVwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcGFydHMuam9pbihcIlwiKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0YXR1c2VzQDIuMC4yL25vZGVfbW9kdWxlcy9zdGF0dXNlcy9jb2Rlcy5qc29uXHJcbnZhciByZXF1aXJlX2NvZGVzID0gX19jb21tb25KUyh7XHJcbiAgXCIuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc3RhdHVzZXNAMi4wLjIvbm9kZV9tb2R1bGVzL3N0YXR1c2VzL2NvZGVzLmpzb25cIihleHBvcnRzLCBtb2R1bGUpIHtcclxuICAgIG1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgICBcIjEwMFwiOiBcIkNvbnRpbnVlXCIsXHJcbiAgICAgIFwiMTAxXCI6IFwiU3dpdGNoaW5nIFByb3RvY29sc1wiLFxyXG4gICAgICBcIjEwMlwiOiBcIlByb2Nlc3NpbmdcIixcclxuICAgICAgXCIxMDNcIjogXCJFYXJseSBIaW50c1wiLFxyXG4gICAgICBcIjIwMFwiOiBcIk9LXCIsXHJcbiAgICAgIFwiMjAxXCI6IFwiQ3JlYXRlZFwiLFxyXG4gICAgICBcIjIwMlwiOiBcIkFjY2VwdGVkXCIsXHJcbiAgICAgIFwiMjAzXCI6IFwiTm9uLUF1dGhvcml0YXRpdmUgSW5mb3JtYXRpb25cIixcclxuICAgICAgXCIyMDRcIjogXCJObyBDb250ZW50XCIsXHJcbiAgICAgIFwiMjA1XCI6IFwiUmVzZXQgQ29udGVudFwiLFxyXG4gICAgICBcIjIwNlwiOiBcIlBhcnRpYWwgQ29udGVudFwiLFxyXG4gICAgICBcIjIwN1wiOiBcIk11bHRpLVN0YXR1c1wiLFxyXG4gICAgICBcIjIwOFwiOiBcIkFscmVhZHkgUmVwb3J0ZWRcIixcclxuICAgICAgXCIyMjZcIjogXCJJTSBVc2VkXCIsXHJcbiAgICAgIFwiMzAwXCI6IFwiTXVsdGlwbGUgQ2hvaWNlc1wiLFxyXG4gICAgICBcIjMwMVwiOiBcIk1vdmVkIFBlcm1hbmVudGx5XCIsXHJcbiAgICAgIFwiMzAyXCI6IFwiRm91bmRcIixcclxuICAgICAgXCIzMDNcIjogXCJTZWUgT3RoZXJcIixcclxuICAgICAgXCIzMDRcIjogXCJOb3QgTW9kaWZpZWRcIixcclxuICAgICAgXCIzMDVcIjogXCJVc2UgUHJveHlcIixcclxuICAgICAgXCIzMDdcIjogXCJUZW1wb3JhcnkgUmVkaXJlY3RcIixcclxuICAgICAgXCIzMDhcIjogXCJQZXJtYW5lbnQgUmVkaXJlY3RcIixcclxuICAgICAgXCI0MDBcIjogXCJCYWQgUmVxdWVzdFwiLFxyXG4gICAgICBcIjQwMVwiOiBcIlVuYXV0aG9yaXplZFwiLFxyXG4gICAgICBcIjQwMlwiOiBcIlBheW1lbnQgUmVxdWlyZWRcIixcclxuICAgICAgXCI0MDNcIjogXCJGb3JiaWRkZW5cIixcclxuICAgICAgXCI0MDRcIjogXCJOb3QgRm91bmRcIixcclxuICAgICAgXCI0MDVcIjogXCJNZXRob2QgTm90IEFsbG93ZWRcIixcclxuICAgICAgXCI0MDZcIjogXCJOb3QgQWNjZXB0YWJsZVwiLFxyXG4gICAgICBcIjQwN1wiOiBcIlByb3h5IEF1dGhlbnRpY2F0aW9uIFJlcXVpcmVkXCIsXHJcbiAgICAgIFwiNDA4XCI6IFwiUmVxdWVzdCBUaW1lb3V0XCIsXHJcbiAgICAgIFwiNDA5XCI6IFwiQ29uZmxpY3RcIixcclxuICAgICAgXCI0MTBcIjogXCJHb25lXCIsXHJcbiAgICAgIFwiNDExXCI6IFwiTGVuZ3RoIFJlcXVpcmVkXCIsXHJcbiAgICAgIFwiNDEyXCI6IFwiUHJlY29uZGl0aW9uIEZhaWxlZFwiLFxyXG4gICAgICBcIjQxM1wiOiBcIlBheWxvYWQgVG9vIExhcmdlXCIsXHJcbiAgICAgIFwiNDE0XCI6IFwiVVJJIFRvbyBMb25nXCIsXHJcbiAgICAgIFwiNDE1XCI6IFwiVW5zdXBwb3J0ZWQgTWVkaWEgVHlwZVwiLFxyXG4gICAgICBcIjQxNlwiOiBcIlJhbmdlIE5vdCBTYXRpc2ZpYWJsZVwiLFxyXG4gICAgICBcIjQxN1wiOiBcIkV4cGVjdGF0aW9uIEZhaWxlZFwiLFxyXG4gICAgICBcIjQxOFwiOiBcIkknbSBhIFRlYXBvdFwiLFxyXG4gICAgICBcIjQyMVwiOiBcIk1pc2RpcmVjdGVkIFJlcXVlc3RcIixcclxuICAgICAgXCI0MjJcIjogXCJVbnByb2Nlc3NhYmxlIEVudGl0eVwiLFxyXG4gICAgICBcIjQyM1wiOiBcIkxvY2tlZFwiLFxyXG4gICAgICBcIjQyNFwiOiBcIkZhaWxlZCBEZXBlbmRlbmN5XCIsXHJcbiAgICAgIFwiNDI1XCI6IFwiVG9vIEVhcmx5XCIsXHJcbiAgICAgIFwiNDI2XCI6IFwiVXBncmFkZSBSZXF1aXJlZFwiLFxyXG4gICAgICBcIjQyOFwiOiBcIlByZWNvbmRpdGlvbiBSZXF1aXJlZFwiLFxyXG4gICAgICBcIjQyOVwiOiBcIlRvbyBNYW55IFJlcXVlc3RzXCIsXHJcbiAgICAgIFwiNDMxXCI6IFwiUmVxdWVzdCBIZWFkZXIgRmllbGRzIFRvbyBMYXJnZVwiLFxyXG4gICAgICBcIjQ1MVwiOiBcIlVuYXZhaWxhYmxlIEZvciBMZWdhbCBSZWFzb25zXCIsXHJcbiAgICAgIFwiNTAwXCI6IFwiSW50ZXJuYWwgU2VydmVyIEVycm9yXCIsXHJcbiAgICAgIFwiNTAxXCI6IFwiTm90IEltcGxlbWVudGVkXCIsXHJcbiAgICAgIFwiNTAyXCI6IFwiQmFkIEdhdGV3YXlcIixcclxuICAgICAgXCI1MDNcIjogXCJTZXJ2aWNlIFVuYXZhaWxhYmxlXCIsXHJcbiAgICAgIFwiNTA0XCI6IFwiR2F0ZXdheSBUaW1lb3V0XCIsXHJcbiAgICAgIFwiNTA1XCI6IFwiSFRUUCBWZXJzaW9uIE5vdCBTdXBwb3J0ZWRcIixcclxuICAgICAgXCI1MDZcIjogXCJWYXJpYW50IEFsc28gTmVnb3RpYXRlc1wiLFxyXG4gICAgICBcIjUwN1wiOiBcIkluc3VmZmljaWVudCBTdG9yYWdlXCIsXHJcbiAgICAgIFwiNTA4XCI6IFwiTG9vcCBEZXRlY3RlZFwiLFxyXG4gICAgICBcIjUwOVwiOiBcIkJhbmR3aWR0aCBMaW1pdCBFeGNlZWRlZFwiLFxyXG4gICAgICBcIjUxMFwiOiBcIk5vdCBFeHRlbmRlZFwiLFxyXG4gICAgICBcIjUxMVwiOiBcIk5ldHdvcmsgQXV0aGVudGljYXRpb24gUmVxdWlyZWRcIlxyXG4gICAgfTtcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0YXR1c2VzQDIuMC4yL25vZGVfbW9kdWxlcy9zdGF0dXNlcy9pbmRleC5qc1xyXG52YXIgcmVxdWlyZV9zdGF0dXNlcyA9IF9fY29tbW9uSlMoe1xyXG4gIFwiLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0YXR1c2VzQDIuMC4yL25vZGVfbW9kdWxlcy9zdGF0dXNlcy9pbmRleC5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xyXG4gICAgdmFyIGNvZGVzID0gcmVxdWlyZV9jb2RlcygpO1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzdGF0dXMyO1xyXG4gICAgc3RhdHVzMi5tZXNzYWdlID0gY29kZXM7XHJcbiAgICBzdGF0dXMyLmNvZGUgPSBjcmVhdGVNZXNzYWdlVG9TdGF0dXNDb2RlTWFwKGNvZGVzKTtcclxuICAgIHN0YXR1czIuY29kZXMgPSBjcmVhdGVTdGF0dXNDb2RlTGlzdChjb2Rlcyk7XHJcbiAgICBzdGF0dXMyLnJlZGlyZWN0ID0ge1xyXG4gICAgICAzMDA6IHRydWUsXHJcbiAgICAgIDMwMTogdHJ1ZSxcclxuICAgICAgMzAyOiB0cnVlLFxyXG4gICAgICAzMDM6IHRydWUsXHJcbiAgICAgIDMwNTogdHJ1ZSxcclxuICAgICAgMzA3OiB0cnVlLFxyXG4gICAgICAzMDg6IHRydWVcclxuICAgIH07XHJcbiAgICBzdGF0dXMyLmVtcHR5ID0ge1xyXG4gICAgICAyMDQ6IHRydWUsXHJcbiAgICAgIDIwNTogdHJ1ZSxcclxuICAgICAgMzA0OiB0cnVlXHJcbiAgICB9O1xyXG4gICAgc3RhdHVzMi5yZXRyeSA9IHtcclxuICAgICAgNTAyOiB0cnVlLFxyXG4gICAgICA1MDM6IHRydWUsXHJcbiAgICAgIDUwNDogdHJ1ZVxyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VUb1N0YXR1c0NvZGVNYXAoY29kZXMyKSB7XHJcbiAgICAgIHZhciBtYXAgPSB7fTtcclxuICAgICAgT2JqZWN0LmtleXMoY29kZXMyKS5mb3JFYWNoKGZ1bmN0aW9uIGZvckVhY2hDb2RlKGNvZGUpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9IGNvZGVzMltjb2RlXTtcclxuICAgICAgICB2YXIgc3RhdHVzMyA9IE51bWJlcihjb2RlKTtcclxuICAgICAgICBtYXBbbWVzc2FnZS50b0xvd2VyQ2FzZSgpXSA9IHN0YXR1czM7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gbWFwO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gY3JlYXRlU3RhdHVzQ29kZUxpc3QoY29kZXMyKSB7XHJcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyhjb2RlczIpLm1hcChmdW5jdGlvbiBtYXBDb2RlKGNvZGUpIHtcclxuICAgICAgICByZXR1cm4gTnVtYmVyKGNvZGUpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGdldFN0YXR1c0NvZGUobWVzc2FnZSkge1xyXG4gICAgICB2YXIgbXNnID0gbWVzc2FnZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzdGF0dXMyLmNvZGUsIG1zZykpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgc3RhdHVzIG1lc3NhZ2U6IFwiJyArIG1lc3NhZ2UgKyAnXCInKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3RhdHVzMi5jb2RlW21zZ107XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBnZXRTdGF0dXNNZXNzYWdlKGNvZGUpIHtcclxuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc3RhdHVzMi5tZXNzYWdlLCBjb2RlKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgc3RhdHVzIGNvZGU6IFwiICsgY29kZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0YXR1czIubWVzc2FnZVtjb2RlXTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHN0YXR1czIoY29kZSkge1xyXG4gICAgICBpZiAodHlwZW9mIGNvZGUgPT09IFwibnVtYmVyXCIpIHtcclxuICAgICAgICByZXR1cm4gZ2V0U3RhdHVzTWVzc2FnZShjb2RlKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIGNvZGUgIT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY29kZSBtdXN0IGJlIGEgbnVtYmVyIG9yIHN0cmluZ1wiKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgbiA9IHBhcnNlSW50KGNvZGUsIDEwKTtcclxuICAgICAgaWYgKCFpc05hTihuKSkge1xyXG4gICAgICAgIHJldHVybiBnZXRTdGF0dXNNZXNzYWdlKG4pO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBnZXRTdGF0dXNDb2RlKGNvZGUpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG4vLyBzcmMvdXRpbC1zdHViLnRzXHJcbnZhciB1dGlsX3N0dWJfZXhwb3J0cyA9IHt9O1xyXG5fX2V4cG9ydCh1dGlsX3N0dWJfZXhwb3J0cywge1xyXG4gIGluc3BlY3Q6ICgpID0+IGluc3BlY3RcclxufSk7XHJcbnZhciBpbnNwZWN0O1xyXG52YXIgaW5pdF91dGlsX3N0dWIgPSBfX2VzbSh7XHJcbiAgXCJzcmMvdXRpbC1zdHViLnRzXCIoKSB7XHJcbiAgICBpbnNwZWN0ID0ge307XHJcbiAgfVxyXG59KTtcclxuXHJcbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtaW5zcGVjdEAxLjEzLjQvbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L3V0aWwuaW5zcGVjdC5qc1xyXG52YXIgcmVxdWlyZV91dGlsX2luc3BlY3QgPSBfX2NvbW1vbkpTKHtcclxuICBcIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtaW5zcGVjdEAxLjEzLjQvbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L3V0aWwuaW5zcGVjdC5qc1wiKGV4cG9ydHMsIG1vZHVsZSkge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSAoaW5pdF91dGlsX3N0dWIoKSwgX190b0NvbW1vbkpTKHV0aWxfc3R1Yl9leHBvcnRzKSkuaW5zcGVjdDtcclxuICB9XHJcbn0pO1xyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL29iamVjdC1pbnNwZWN0QDEuMTMuNC9ub2RlX21vZHVsZXMvb2JqZWN0LWluc3BlY3QvaW5kZXguanNcclxudmFyIHJlcXVpcmVfb2JqZWN0X2luc3BlY3QgPSBfX2NvbW1vbkpTKHtcclxuICBcIi4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vYmplY3QtaW5zcGVjdEAxLjEzLjQvbm9kZV9tb2R1bGVzL29iamVjdC1pbnNwZWN0L2luZGV4LmpzXCIoZXhwb3J0cywgbW9kdWxlKSB7XHJcbiAgICB2YXIgaGFzTWFwID0gdHlwZW9mIE1hcCA9PT0gXCJmdW5jdGlvblwiICYmIE1hcC5wcm90b3R5cGU7XHJcbiAgICB2YXIgbWFwU2l6ZURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIGhhc01hcCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTWFwLnByb3RvdHlwZSwgXCJzaXplXCIpIDogbnVsbDtcclxuICAgIHZhciBtYXBTaXplID0gaGFzTWFwICYmIG1hcFNpemVEZXNjcmlwdG9yICYmIHR5cGVvZiBtYXBTaXplRGVzY3JpcHRvci5nZXQgPT09IFwiZnVuY3Rpb25cIiA/IG1hcFNpemVEZXNjcmlwdG9yLmdldCA6IG51bGw7XHJcbiAgICB2YXIgbWFwRm9yRWFjaCA9IGhhc01hcCAmJiBNYXAucHJvdG90eXBlLmZvckVhY2g7XHJcbiAgICB2YXIgaGFzU2V0ID0gdHlwZW9mIFNldCA9PT0gXCJmdW5jdGlvblwiICYmIFNldC5wcm90b3R5cGU7XHJcbiAgICB2YXIgc2V0U2l6ZURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yICYmIGhhc1NldCA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoU2V0LnByb3RvdHlwZSwgXCJzaXplXCIpIDogbnVsbDtcclxuICAgIHZhciBzZXRTaXplID0gaGFzU2V0ICYmIHNldFNpemVEZXNjcmlwdG9yICYmIHR5cGVvZiBzZXRTaXplRGVzY3JpcHRvci5nZXQgPT09IFwiZnVuY3Rpb25cIiA/IHNldFNpemVEZXNjcmlwdG9yLmdldCA6IG51bGw7XHJcbiAgICB2YXIgc2V0Rm9yRWFjaCA9IGhhc1NldCAmJiBTZXQucHJvdG90eXBlLmZvckVhY2g7XHJcbiAgICB2YXIgaGFzV2Vha01hcCA9IHR5cGVvZiBXZWFrTWFwID09PSBcImZ1bmN0aW9uXCIgJiYgV2Vha01hcC5wcm90b3R5cGU7XHJcbiAgICB2YXIgd2Vha01hcEhhcyA9IGhhc1dlYWtNYXAgPyBXZWFrTWFwLnByb3RvdHlwZS5oYXMgOiBudWxsO1xyXG4gICAgdmFyIGhhc1dlYWtTZXQgPSB0eXBlb2YgV2Vha1NldCA9PT0gXCJmdW5jdGlvblwiICYmIFdlYWtTZXQucHJvdG90eXBlO1xyXG4gICAgdmFyIHdlYWtTZXRIYXMgPSBoYXNXZWFrU2V0ID8gV2Vha1NldC5wcm90b3R5cGUuaGFzIDogbnVsbDtcclxuICAgIHZhciBoYXNXZWFrUmVmID0gdHlwZW9mIFdlYWtSZWYgPT09IFwiZnVuY3Rpb25cIiAmJiBXZWFrUmVmLnByb3RvdHlwZTtcclxuICAgIHZhciB3ZWFrUmVmRGVyZWYgPSBoYXNXZWFrUmVmID8gV2Vha1JlZi5wcm90b3R5cGUuZGVyZWYgOiBudWxsO1xyXG4gICAgdmFyIGJvb2xlYW5WYWx1ZU9mID0gQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZjtcclxuICAgIHZhciBvYmplY3RUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XHJcbiAgICB2YXIgZnVuY3Rpb25Ub1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcclxuICAgIHZhciAkbWF0Y2ggPSBTdHJpbmcucHJvdG90eXBlLm1hdGNoO1xyXG4gICAgdmFyICRzbGljZSA9IFN0cmluZy5wcm90b3R5cGUuc2xpY2U7XHJcbiAgICB2YXIgJHJlcGxhY2UgPSBTdHJpbmcucHJvdG90eXBlLnJlcGxhY2U7XHJcbiAgICB2YXIgJHRvVXBwZXJDYXNlID0gU3RyaW5nLnByb3RvdHlwZS50b1VwcGVyQ2FzZTtcclxuICAgIHZhciAkdG9Mb3dlckNhc2UgPSBTdHJpbmcucHJvdG90eXBlLnRvTG93ZXJDYXNlO1xyXG4gICAgdmFyICR0ZXN0ID0gUmVnRXhwLnByb3RvdHlwZS50ZXN0O1xyXG4gICAgdmFyICRjb25jYXQgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0O1xyXG4gICAgdmFyICRqb2luID0gQXJyYXkucHJvdG90eXBlLmpvaW47XHJcbiAgICB2YXIgJGFyclNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xyXG4gICAgdmFyICRmbG9vciA9IE1hdGguZmxvb3I7XHJcbiAgICB2YXIgYmlnSW50VmFsdWVPZiA9IHR5cGVvZiBCaWdJbnQgPT09IFwiZnVuY3Rpb25cIiA/IEJpZ0ludC5wcm90b3R5cGUudmFsdWVPZiA6IG51bGw7XHJcbiAgICB2YXIgZ09QUyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XHJcbiAgICB2YXIgc3ltVG9TdHJpbmcgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IFN5bWJvbC5wcm90b3R5cGUudG9TdHJpbmcgOiBudWxsO1xyXG4gICAgdmFyIGhhc1NoYW1tZWRTeW1ib2xzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwib2JqZWN0XCI7XHJcbiAgICB2YXIgdG9TdHJpbmdUYWcgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLnRvU3RyaW5nVGFnICYmICh0eXBlb2YgU3ltYm9sLnRvU3RyaW5nVGFnID09PSBoYXNTaGFtbWVkU3ltYm9scyA/IFwib2JqZWN0XCIgOiBcInN5bWJvbFwiKSA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IG51bGw7XHJcbiAgICB2YXIgaXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcclxuICAgIHZhciBnUE8gPSAodHlwZW9mIFJlZmxlY3QgPT09IFwiZnVuY3Rpb25cIiA/IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YgOiBPYmplY3QuZ2V0UHJvdG90eXBlT2YpIHx8IChbXS5fX3Byb3RvX18gPT09IEFycmF5LnByb3RvdHlwZSA/IGZ1bmN0aW9uKE8pIHtcclxuICAgICAgcmV0dXJuIE8uX19wcm90b19fO1xyXG4gICAgfSA6IG51bGwpO1xyXG4gICAgZnVuY3Rpb24gYWRkTnVtZXJpY1NlcGFyYXRvcihudW0sIHN0cikge1xyXG4gICAgICBpZiAobnVtID09PSBJbmZpbml0eSB8fCBudW0gPT09IC1JbmZpbml0eSB8fCBudW0gIT09IG51bSB8fCBudW0gJiYgbnVtID4gLTFlMyAmJiBudW0gPCAxZTMgfHwgJHRlc3QuY2FsbCgvZS8sIHN0cikpIHtcclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBzZXBSZWdleCA9IC9bMC05XSg/PSg/OlswLTldezN9KSsoPyFbMC05XSkpL2c7XHJcbiAgICAgIGlmICh0eXBlb2YgbnVtID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgICAgdmFyIGludCA9IG51bSA8IDAgPyAtJGZsb29yKC1udW0pIDogJGZsb29yKG51bSk7XHJcbiAgICAgICAgaWYgKGludCAhPT0gbnVtKSB7XHJcbiAgICAgICAgICB2YXIgaW50U3RyID0gU3RyaW5nKGludCk7XHJcbiAgICAgICAgICB2YXIgZGVjID0gJHNsaWNlLmNhbGwoc3RyLCBpbnRTdHIubGVuZ3RoICsgMSk7XHJcbiAgICAgICAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChpbnRTdHIsIHNlcFJlZ2V4LCBcIiQmX1wiKSArIFwiLlwiICsgJHJlcGxhY2UuY2FsbCgkcmVwbGFjZS5jYWxsKGRlYywgLyhbMC05XXszfSkvZywgXCIkJl9cIiksIC9fJC8sIFwiXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gJHJlcGxhY2UuY2FsbChzdHIsIHNlcFJlZ2V4LCBcIiQmX1wiKTtcclxuICAgIH1cclxuICAgIHZhciB1dGlsSW5zcGVjdCA9IHJlcXVpcmVfdXRpbF9pbnNwZWN0KCk7XHJcbiAgICB2YXIgaW5zcGVjdEN1c3RvbSA9IHV0aWxJbnNwZWN0LmN1c3RvbTtcclxuICAgIHZhciBpbnNwZWN0U3ltYm9sID0gaXNTeW1ib2woaW5zcGVjdEN1c3RvbSkgPyBpbnNwZWN0Q3VzdG9tIDogbnVsbDtcclxuICAgIHZhciBxdW90ZXMgPSB7XHJcbiAgICAgIF9fcHJvdG9fXzogbnVsbCxcclxuICAgICAgXCJkb3VibGVcIjogJ1wiJyxcclxuICAgICAgc2luZ2xlOiBcIidcIlxyXG4gICAgfTtcclxuICAgIHZhciBxdW90ZVJFcyA9IHtcclxuICAgICAgX19wcm90b19fOiBudWxsLFxyXG4gICAgICBcImRvdWJsZVwiOiAvKFtcIlxcXFxdKS9nLFxyXG4gICAgICBzaW5nbGU6IC8oWydcXFxcXSkvZ1xyXG4gICAgfTtcclxuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5zcGVjdF8ob2JqLCBvcHRpb25zLCBkZXB0aCwgc2Vlbikge1xyXG4gICAgICB2YXIgb3B0cyA9IG9wdGlvbnMgfHwge307XHJcbiAgICAgIGlmIChoYXMob3B0cywgXCJxdW90ZVN0eWxlXCIpICYmICFoYXMocXVvdGVzLCBvcHRzLnF1b3RlU3R5bGUpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwicXVvdGVTdHlsZVwiIG11c3QgYmUgXCJzaW5nbGVcIiBvciBcImRvdWJsZVwiJyk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGhhcyhvcHRzLCBcIm1heFN0cmluZ0xlbmd0aFwiKSAmJiAodHlwZW9mIG9wdHMubWF4U3RyaW5nTGVuZ3RoID09PSBcIm51bWJlclwiID8gb3B0cy5tYXhTdHJpbmdMZW5ndGggPCAwICYmIG9wdHMubWF4U3RyaW5nTGVuZ3RoICE9PSBJbmZpbml0eSA6IG9wdHMubWF4U3RyaW5nTGVuZ3RoICE9PSBudWxsKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbiBcIm1heFN0cmluZ0xlbmd0aFwiLCBpZiBwcm92aWRlZCwgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXIsIEluZmluaXR5LCBvciBgbnVsbGAnKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgY3VzdG9tSW5zcGVjdCA9IGhhcyhvcHRzLCBcImN1c3RvbUluc3BlY3RcIikgPyBvcHRzLmN1c3RvbUluc3BlY3QgOiB0cnVlO1xyXG4gICAgICBpZiAodHlwZW9mIGN1c3RvbUluc3BlY3QgIT09IFwiYm9vbGVhblwiICYmIGN1c3RvbUluc3BlY3QgIT09IFwic3ltYm9sXCIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwib3B0aW9uIFxcXCJjdXN0b21JbnNwZWN0XFxcIiwgaWYgcHJvdmlkZWQsIG11c3QgYmUgYHRydWVgLCBgZmFsc2VgLCBvciBgJ3N5bWJvbCdgXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChoYXMob3B0cywgXCJpbmRlbnRcIikgJiYgb3B0cy5pbmRlbnQgIT09IG51bGwgJiYgb3B0cy5pbmRlbnQgIT09IFwiXHRcIiAmJiAhKHBhcnNlSW50KG9wdHMuaW5kZW50LCAxMCkgPT09IG9wdHMuaW5kZW50ICYmIG9wdHMuaW5kZW50ID4gMCkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb24gXCJpbmRlbnRcIiBtdXN0IGJlIFwiXFxcXHRcIiwgYW4gaW50ZWdlciA+IDAsIG9yIGBudWxsYCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChoYXMob3B0cywgXCJudW1lcmljU2VwYXJhdG9yXCIpICYmIHR5cGVvZiBvcHRzLm51bWVyaWNTZXBhcmF0b3IgIT09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9uIFwibnVtZXJpY1NlcGFyYXRvclwiLCBpZiBwcm92aWRlZCwgbXVzdCBiZSBgdHJ1ZWAgb3IgYGZhbHNlYCcpO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBudW1lcmljU2VwYXJhdG9yID0gb3B0cy5udW1lcmljU2VwYXJhdG9yO1xyXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHJldHVybiBcInVuZGVmaW5lZFwiO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChvYmogPT09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gXCJudWxsXCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgcmV0dXJuIG9iaiA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2Ygb2JqID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgcmV0dXJuIGluc3BlY3RTdHJpbmcob2JqLCBvcHRzKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJudW1iZXJcIikge1xyXG4gICAgICAgIGlmIChvYmogPT09IDApIHtcclxuICAgICAgICAgIHJldHVybiBJbmZpbml0eSAvIG9iaiA+IDAgPyBcIjBcIiA6IFwiLTBcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0ciA9IFN0cmluZyhvYmopO1xyXG4gICAgICAgIHJldHVybiBudW1lcmljU2VwYXJhdG9yID8gYWRkTnVtZXJpY1NlcGFyYXRvcihvYmosIHN0cikgOiBzdHI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwiYmlnaW50XCIpIHtcclxuICAgICAgICB2YXIgYmlnSW50U3RyID0gU3RyaW5nKG9iaikgKyBcIm5cIjtcclxuICAgICAgICByZXR1cm4gbnVtZXJpY1NlcGFyYXRvciA/IGFkZE51bWVyaWNTZXBhcmF0b3Iob2JqLCBiaWdJbnRTdHIpIDogYmlnSW50U3RyO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBtYXhEZXB0aCA9IHR5cGVvZiBvcHRzLmRlcHRoID09PSBcInVuZGVmaW5lZFwiID8gNSA6IG9wdHMuZGVwdGg7XHJcbiAgICAgIGlmICh0eXBlb2YgZGVwdGggPT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICBkZXB0aCA9IDA7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRlcHRoID49IG1heERlcHRoICYmIG1heERlcHRoID4gMCAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGlzQXJyYXkob2JqKSA/IFwiW0FycmF5XVwiIDogXCJbT2JqZWN0XVwiO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBpbmRlbnQgPSBnZXRJbmRlbnQob3B0cywgZGVwdGgpO1xyXG4gICAgICBpZiAodHlwZW9mIHNlZW4gPT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICBzZWVuID0gW107XHJcbiAgICAgIH0gZWxzZSBpZiAoaW5kZXhPZihzZWVuLCBvYmopID49IDApIHtcclxuICAgICAgICByZXR1cm4gXCJbQ2lyY3VsYXJdXCI7XHJcbiAgICAgIH1cclxuICAgICAgZnVuY3Rpb24gaW5zcGVjdDModmFsdWUsIGZyb20sIG5vSW5kZW50KSB7XHJcbiAgICAgICAgaWYgKGZyb20pIHtcclxuICAgICAgICAgIHNlZW4gPSAkYXJyU2xpY2UuY2FsbChzZWVuKTtcclxuICAgICAgICAgIHNlZW4ucHVzaChmcm9tKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5vSW5kZW50KSB7XHJcbiAgICAgICAgICB2YXIgbmV3T3B0cyA9IHtcclxuICAgICAgICAgICAgZGVwdGg6IG9wdHMuZGVwdGhcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICBpZiAoaGFzKG9wdHMsIFwicXVvdGVTdHlsZVwiKSkge1xyXG4gICAgICAgICAgICBuZXdPcHRzLnF1b3RlU3R5bGUgPSBvcHRzLnF1b3RlU3R5bGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gaW5zcGVjdF8odmFsdWUsIG5ld09wdHMsIGRlcHRoICsgMSwgc2Vlbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpbnNwZWN0Xyh2YWx1ZSwgb3B0cywgZGVwdGggKyAxLCBzZWVuKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIG9iaiA9PT0gXCJmdW5jdGlvblwiICYmICFpc1JlZ0V4cChvYmopKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSBuYW1lT2Yob2JqKTtcclxuICAgICAgICB2YXIga2V5cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0Myk7XHJcbiAgICAgICAgcmV0dXJuIFwiW0Z1bmN0aW9uXCIgKyAobmFtZSA/IFwiOiBcIiArIG5hbWUgOiBcIiAoYW5vbnltb3VzKVwiKSArIFwiXVwiICsgKGtleXMubGVuZ3RoID4gMCA/IFwiIHsgXCIgKyAkam9pbi5jYWxsKGtleXMsIFwiLCBcIikgKyBcIiB9XCIgOiBcIlwiKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNTeW1ib2wob2JqKSkge1xyXG4gICAgICAgIHZhciBzeW1TdHJpbmcgPSBoYXNTaGFtbWVkU3ltYm9scyA/ICRyZXBsYWNlLmNhbGwoU3RyaW5nKG9iaiksIC9eKFN5bWJvbFxcKC4qXFwpKV9bXildKiQvLCBcIiQxXCIpIDogc3ltVG9TdHJpbmcuY2FsbChvYmopO1xyXG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiICYmICFoYXNTaGFtbWVkU3ltYm9scyA/IG1hcmtCb3hlZChzeW1TdHJpbmcpIDogc3ltU3RyaW5nO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc0VsZW1lbnQob2JqKSkge1xyXG4gICAgICAgIHZhciBzID0gXCI8XCIgKyAkdG9Mb3dlckNhc2UuY2FsbChTdHJpbmcob2JqLm5vZGVOYW1lKSk7XHJcbiAgICAgICAgdmFyIGF0dHJzID0gb2JqLmF0dHJpYnV0ZXMgfHwgW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhdHRycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgcyArPSBcIiBcIiArIGF0dHJzW2ldLm5hbWUgKyBcIj1cIiArIHdyYXBRdW90ZXMocXVvdGUoYXR0cnNbaV0udmFsdWUpLCBcImRvdWJsZVwiLCBvcHRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcyArPSBcIj5cIjtcclxuICAgICAgICBpZiAob2JqLmNoaWxkTm9kZXMgJiYgb2JqLmNoaWxkTm9kZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICBzICs9IFwiLi4uXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHMgKz0gXCI8L1wiICsgJHRvTG93ZXJDYXNlLmNhbGwoU3RyaW5nKG9iai5ub2RlTmFtZSkpICsgXCI+XCI7XHJcbiAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzQXJyYXkob2JqKSkge1xyXG4gICAgICAgIGlmIChvYmoubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gXCJbXVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgeHMgPSBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpO1xyXG4gICAgICAgIGlmIChpbmRlbnQgJiYgIXNpbmdsZUxpbmVWYWx1ZXMoeHMpKSB7XHJcbiAgICAgICAgICByZXR1cm4gXCJbXCIgKyBpbmRlbnRlZEpvaW4oeHMsIGluZGVudCkgKyBcIl1cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFwiWyBcIiArICRqb2luLmNhbGwoeHMsIFwiLCBcIikgKyBcIiBdXCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzRXJyb3Iob2JqKSkge1xyXG4gICAgICAgIHZhciBwYXJ0cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0Myk7XHJcbiAgICAgICAgaWYgKCEoXCJjYXVzZVwiIGluIEVycm9yLnByb3RvdHlwZSkgJiYgXCJjYXVzZVwiIGluIG9iaiAmJiAhaXNFbnVtZXJhYmxlLmNhbGwob2JqLCBcImNhdXNlXCIpKSB7XHJcbiAgICAgICAgICByZXR1cm4gXCJ7IFtcIiArIFN0cmluZyhvYmopICsgXCJdIFwiICsgJGpvaW4uY2FsbCgkY29uY2F0LmNhbGwoXCJbY2F1c2VdOiBcIiArIGluc3BlY3QzKG9iai5jYXVzZSksIHBhcnRzKSwgXCIsIFwiKSArIFwiIH1cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIFwiW1wiICsgU3RyaW5nKG9iaikgKyBcIl1cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFwieyBbXCIgKyBTdHJpbmcob2JqKSArIFwiXSBcIiArICRqb2luLmNhbGwocGFydHMsIFwiLCBcIikgKyBcIiB9XCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwib2JqZWN0XCIgJiYgY3VzdG9tSW5zcGVjdCkge1xyXG4gICAgICAgIGlmIChpbnNwZWN0U3ltYm9sICYmIHR5cGVvZiBvYmpbaW5zcGVjdFN5bWJvbF0gPT09IFwiZnVuY3Rpb25cIiAmJiB1dGlsSW5zcGVjdCkge1xyXG4gICAgICAgICAgcmV0dXJuIHV0aWxJbnNwZWN0KG9iaiwgeyBkZXB0aDogbWF4RGVwdGggLSBkZXB0aCB9KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGN1c3RvbUluc3BlY3QgIT09IFwic3ltYm9sXCIgJiYgdHlwZW9mIG9iai5pbnNwZWN0ID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgIHJldHVybiBvYmouaW5zcGVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNNYXAob2JqKSkge1xyXG4gICAgICAgIHZhciBtYXBQYXJ0cyA9IFtdO1xyXG4gICAgICAgIGlmIChtYXBGb3JFYWNoKSB7XHJcbiAgICAgICAgICBtYXBGb3JFYWNoLmNhbGwob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XHJcbiAgICAgICAgICAgIG1hcFBhcnRzLnB1c2goaW5zcGVjdDMoa2V5LCBvYmosIHRydWUpICsgXCIgPT4gXCIgKyBpbnNwZWN0Myh2YWx1ZSwgb2JqKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25PZihcIk1hcFwiLCBtYXBTaXplLmNhbGwob2JqKSwgbWFwUGFydHMsIGluZGVudCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzU2V0KG9iaikpIHtcclxuICAgICAgICB2YXIgc2V0UGFydHMgPSBbXTtcclxuICAgICAgICBpZiAoc2V0Rm9yRWFjaCkge1xyXG4gICAgICAgICAgc2V0Rm9yRWFjaC5jYWxsKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgc2V0UGFydHMucHVzaChpbnNwZWN0Myh2YWx1ZSwgb2JqKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25PZihcIlNldFwiLCBzZXRTaXplLmNhbGwob2JqKSwgc2V0UGFydHMsIGluZGVudCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzV2Vha01hcChvYmopKSB7XHJcbiAgICAgICAgcmV0dXJuIHdlYWtDb2xsZWN0aW9uT2YoXCJXZWFrTWFwXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1dlYWtTZXQob2JqKSkge1xyXG4gICAgICAgIHJldHVybiB3ZWFrQ29sbGVjdGlvbk9mKFwiV2Vha1NldFwiKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNXZWFrUmVmKG9iaikpIHtcclxuICAgICAgICByZXR1cm4gd2Vha0NvbGxlY3Rpb25PZihcIldlYWtSZWZcIik7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzTnVtYmVyKG9iaikpIHtcclxuICAgICAgICByZXR1cm4gbWFya0JveGVkKGluc3BlY3QzKE51bWJlcihvYmopKSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzQmlnSW50KG9iaikpIHtcclxuICAgICAgICByZXR1cm4gbWFya0JveGVkKGluc3BlY3QzKGJpZ0ludFZhbHVlT2YuY2FsbChvYmopKSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlzQm9vbGVhbihvYmopKSB7XHJcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChib29sZWFuVmFsdWVPZi5jYWxsKG9iaikpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1N0cmluZyhvYmopKSB7XHJcbiAgICAgICAgcmV0dXJuIG1hcmtCb3hlZChpbnNwZWN0MyhTdHJpbmcob2JqKSkpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIG9iaiA9PT0gd2luZG93KSB7XHJcbiAgICAgICAgcmV0dXJuIFwieyBbb2JqZWN0IFdpbmRvd10gfVwiO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvYmogPT09IGdsb2JhbFRoaXMgfHwgdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvYmogPT09IGdsb2JhbCkge1xyXG4gICAgICAgIHJldHVybiBcInsgW29iamVjdCBnbG9iYWxUaGlzXSB9XCI7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCFpc0RhdGUob2JqKSAmJiAhaXNSZWdFeHAob2JqKSkge1xyXG4gICAgICAgIHZhciB5cyA9IGFyck9iaktleXMob2JqLCBpbnNwZWN0Myk7XHJcbiAgICAgICAgdmFyIGlzUGxhaW5PYmplY3QgPSBnUE8gPyBnUE8ob2JqKSA9PT0gT2JqZWN0LnByb3RvdHlwZSA6IG9iaiBpbnN0YW5jZW9mIE9iamVjdCB8fCBvYmouY29uc3RydWN0b3IgPT09IE9iamVjdDtcclxuICAgICAgICB2YXIgcHJvdG9UYWcgPSBvYmogaW5zdGFuY2VvZiBPYmplY3QgPyBcIlwiIDogXCJudWxsIHByb3RvdHlwZVwiO1xyXG4gICAgICAgIHZhciBzdHJpbmdUYWcgPSAhaXNQbGFpbk9iamVjdCAmJiB0b1N0cmluZ1RhZyAmJiBPYmplY3Qob2JqKSA9PT0gb2JqICYmIHRvU3RyaW5nVGFnIGluIG9iaiA/ICRzbGljZS5jYWxsKHRvU3RyKG9iaiksIDgsIC0xKSA6IHByb3RvVGFnID8gXCJPYmplY3RcIiA6IFwiXCI7XHJcbiAgICAgICAgdmFyIGNvbnN0cnVjdG9yVGFnID0gaXNQbGFpbk9iamVjdCB8fCB0eXBlb2Ygb2JqLmNvbnN0cnVjdG9yICE9PSBcImZ1bmN0aW9uXCIgPyBcIlwiIDogb2JqLmNvbnN0cnVjdG9yLm5hbWUgPyBvYmouY29uc3RydWN0b3IubmFtZSArIFwiIFwiIDogXCJcIjtcclxuICAgICAgICB2YXIgdGFnID0gY29uc3RydWN0b3JUYWcgKyAoc3RyaW5nVGFnIHx8IHByb3RvVGFnID8gXCJbXCIgKyAkam9pbi5jYWxsKCRjb25jYXQuY2FsbChbXSwgc3RyaW5nVGFnIHx8IFtdLCBwcm90b1RhZyB8fCBbXSksIFwiOiBcIikgKyBcIl0gXCIgOiBcIlwiKTtcclxuICAgICAgICBpZiAoeXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGFnICsgXCJ7fVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaW5kZW50KSB7XHJcbiAgICAgICAgICByZXR1cm4gdGFnICsgXCJ7XCIgKyBpbmRlbnRlZEpvaW4oeXMsIGluZGVudCkgKyBcIn1cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRhZyArIFwieyBcIiArICRqb2luLmNhbGwoeXMsIFwiLCBcIikgKyBcIiB9XCI7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFN0cmluZyhvYmopO1xyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIHdyYXBRdW90ZXMocywgZGVmYXVsdFN0eWxlLCBvcHRzKSB7XHJcbiAgICAgIHZhciBzdHlsZSA9IG9wdHMucXVvdGVTdHlsZSB8fCBkZWZhdWx0U3R5bGU7XHJcbiAgICAgIHZhciBxdW90ZUNoYXIgPSBxdW90ZXNbc3R5bGVdO1xyXG4gICAgICByZXR1cm4gcXVvdGVDaGFyICsgcyArIHF1b3RlQ2hhcjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHF1b3RlKHMpIHtcclxuICAgICAgcmV0dXJuICRyZXBsYWNlLmNhbGwoU3RyaW5nKHMpLCAvXCIvZywgXCImcXVvdDtcIik7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBjYW5UcnVzdFRvU3RyaW5nKG9iaikge1xyXG4gICAgICByZXR1cm4gIXRvU3RyaW5nVGFnIHx8ICEodHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiAodG9TdHJpbmdUYWcgaW4gb2JqIHx8IHR5cGVvZiBvYmpbdG9TdHJpbmdUYWddICE9PSBcInVuZGVmaW5lZFwiKSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc0FycmF5KG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzRGF0ZShvYmopIHtcclxuICAgICAgcmV0dXJuIHRvU3RyKG9iaikgPT09IFwiW29iamVjdCBEYXRlXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzUmVnRXhwKG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IFJlZ0V4cF1cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc0Vycm9yKG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IEVycm9yXVwiICYmIGNhblRydXN0VG9TdHJpbmcob2JqKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzU3RyaW5nKG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIiAmJiBjYW5UcnVzdFRvU3RyaW5nKG9iaik7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc051bWJlcihvYmopIHtcclxuICAgICAgcmV0dXJuIHRvU3RyKG9iaikgPT09IFwiW29iamVjdCBOdW1iZXJdXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNCb29sZWFuKG9iaikge1xyXG4gICAgICByZXR1cm4gdG9TdHIob2JqKSA9PT0gXCJbb2JqZWN0IEJvb2xlYW5dXCIgJiYgY2FuVHJ1c3RUb1N0cmluZyhvYmopO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNTeW1ib2wob2JqKSB7XHJcbiAgICAgIGlmIChoYXNTaGFtbWVkU3ltYm9scykge1xyXG4gICAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogaW5zdGFuY2VvZiBTeW1ib2w7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHR5cGVvZiBvYmogPT09IFwic3ltYm9sXCIpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiIHx8ICFzeW1Ub1N0cmluZykge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHN5bVRvU3RyaW5nLmNhbGwob2JqKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzQmlnSW50KG9iaikge1xyXG4gICAgICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiIHx8ICFiaWdJbnRWYWx1ZU9mKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgYmlnSW50VmFsdWVPZi5jYWxsKG9iaik7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB2YXIgaGFzT3duMiA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkgfHwgZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgIHJldHVybiBrZXkgaW4gdGhpcztcclxuICAgIH07XHJcbiAgICBmdW5jdGlvbiBoYXMob2JqLCBrZXkpIHtcclxuICAgICAgcmV0dXJuIGhhc093bjIuY2FsbChvYmosIGtleSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiB0b1N0cihvYmopIHtcclxuICAgICAgcmV0dXJuIG9iamVjdFRvU3RyaW5nLmNhbGwob2JqKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIG5hbWVPZihmKSB7XHJcbiAgICAgIGlmIChmLm5hbWUpIHtcclxuICAgICAgICByZXR1cm4gZi5uYW1lO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBtID0gJG1hdGNoLmNhbGwoZnVuY3Rpb25Ub1N0cmluZy5jYWxsKGYpLCAvXmZ1bmN0aW9uXFxzKihbXFx3JF0rKS8pO1xyXG4gICAgICBpZiAobSkge1xyXG4gICAgICAgIHJldHVybiBtWzFdO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaW5kZXhPZih4cywgeCkge1xyXG4gICAgICBpZiAoeHMuaW5kZXhPZikge1xyXG4gICAgICAgIHJldHVybiB4cy5pbmRleE9mKHgpO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0geHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHhzW2ldID09PSB4KSB7XHJcbiAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNNYXAoeCkge1xyXG4gICAgICBpZiAoIW1hcFNpemUgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBtYXBTaXplLmNhbGwoeCk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHNldFNpemUuY2FsbCh4KTtcclxuICAgICAgICB9IGNhdGNoIChzKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBNYXA7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpc1dlYWtNYXAoeCkge1xyXG4gICAgICBpZiAoIXdlYWtNYXBIYXMgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgdHJ5IHtcclxuICAgICAgICB3ZWFrTWFwSGFzLmNhbGwoeCwgd2Vha01hcEhhcyk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIHdlYWtTZXRIYXMuY2FsbCh4LCB3ZWFrU2V0SGFzKTtcclxuICAgICAgICB9IGNhdGNoIChzKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHggaW5zdGFuY2VvZiBXZWFrTWFwO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNXZWFrUmVmKHgpIHtcclxuICAgICAgaWYgKCF3ZWFrUmVmRGVyZWYgfHwgIXggfHwgdHlwZW9mIHggIT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgdHJ5IHtcclxuICAgICAgICB3ZWFrUmVmRGVyZWYuY2FsbCh4KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzU2V0KHgpIHtcclxuICAgICAgaWYgKCFzZXRTaXplIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2V0U2l6ZS5jYWxsKHgpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBtYXBTaXplLmNhbGwoeCk7XHJcbiAgICAgICAgfSBjYXRjaCAobSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgU2V0O1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaXNXZWFrU2V0KHgpIHtcclxuICAgICAgaWYgKCF3ZWFrU2V0SGFzIHx8ICF4IHx8IHR5cGVvZiB4ICE9PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgd2Vha1NldEhhcy5jYWxsKHgsIHdlYWtTZXRIYXMpO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICB3ZWFrTWFwSGFzLmNhbGwoeCwgd2Vha01hcEhhcyk7XHJcbiAgICAgICAgfSBjYXRjaCAocykge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB4IGluc3RhbmNlb2YgV2Vha1NldDtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudCh4KSB7XHJcbiAgICAgIGlmICgheCB8fCB0eXBlb2YgeCAhPT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAodHlwZW9mIEhUTUxFbGVtZW50ICE9PSBcInVuZGVmaW5lZFwiICYmIHggaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0eXBlb2YgeC5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgeC5nZXRBdHRyaWJ1dGUgPT09IFwiZnVuY3Rpb25cIjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGluc3BlY3RTdHJpbmcoc3RyLCBvcHRzKSB7XHJcbiAgICAgIGlmIChzdHIubGVuZ3RoID4gb3B0cy5tYXhTdHJpbmdMZW5ndGgpIHtcclxuICAgICAgICB2YXIgcmVtYWluaW5nID0gc3RyLmxlbmd0aCAtIG9wdHMubWF4U3RyaW5nTGVuZ3RoO1xyXG4gICAgICAgIHZhciB0cmFpbGVyID0gXCIuLi4gXCIgKyByZW1haW5pbmcgKyBcIiBtb3JlIGNoYXJhY3RlclwiICsgKHJlbWFpbmluZyA+IDEgPyBcInNcIiA6IFwiXCIpO1xyXG4gICAgICAgIHJldHVybiBpbnNwZWN0U3RyaW5nKCRzbGljZS5jYWxsKHN0ciwgMCwgb3B0cy5tYXhTdHJpbmdMZW5ndGgpLCBvcHRzKSArIHRyYWlsZXI7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIHF1b3RlUkUgPSBxdW90ZVJFc1tvcHRzLnF1b3RlU3R5bGUgfHwgXCJzaW5nbGVcIl07XHJcbiAgICAgIHF1b3RlUkUubGFzdEluZGV4ID0gMDtcclxuICAgICAgdmFyIHMgPSAkcmVwbGFjZS5jYWxsKCRyZXBsYWNlLmNhbGwoc3RyLCBxdW90ZVJFLCBcIlxcXFwkMVwiKSwgL1tcXHgwMC1cXHgxZl0vZywgbG93Ynl0ZSk7XHJcbiAgICAgIHJldHVybiB3cmFwUXVvdGVzKHMsIFwic2luZ2xlXCIsIG9wdHMpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbG93Ynl0ZShjKSB7XHJcbiAgICAgIHZhciBuID0gYy5jaGFyQ29kZUF0KDApO1xyXG4gICAgICB2YXIgeCA9IHtcclxuICAgICAgICA4OiBcImJcIixcclxuICAgICAgICA5OiBcInRcIixcclxuICAgICAgICAxMDogXCJuXCIsXHJcbiAgICAgICAgMTI6IFwiZlwiLFxyXG4gICAgICAgIDEzOiBcInJcIlxyXG4gICAgICB9W25dO1xyXG4gICAgICBpZiAoeCkge1xyXG4gICAgICAgIHJldHVybiBcIlxcXFxcIiArIHg7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFwiXFxcXHhcIiArIChuIDwgMTYgPyBcIjBcIiA6IFwiXCIpICsgJHRvVXBwZXJDYXNlLmNhbGwobi50b1N0cmluZygxNikpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gbWFya0JveGVkKHN0cikge1xyXG4gICAgICByZXR1cm4gXCJPYmplY3QoXCIgKyBzdHIgKyBcIilcIjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHdlYWtDb2xsZWN0aW9uT2YodHlwZSkge1xyXG4gICAgICByZXR1cm4gdHlwZSArIFwiIHsgPyB9XCI7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBjb2xsZWN0aW9uT2YodHlwZSwgc2l6ZSwgZW50cmllcywgaW5kZW50KSB7XHJcbiAgICAgIHZhciBqb2luZWRFbnRyaWVzID0gaW5kZW50ID8gaW5kZW50ZWRKb2luKGVudHJpZXMsIGluZGVudCkgOiAkam9pbi5jYWxsKGVudHJpZXMsIFwiLCBcIik7XHJcbiAgICAgIHJldHVybiB0eXBlICsgXCIgKFwiICsgc2l6ZSArIFwiKSB7XCIgKyBqb2luZWRFbnRyaWVzICsgXCJ9XCI7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBzaW5nbGVMaW5lVmFsdWVzKHhzKSB7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAoaW5kZXhPZih4c1tpXSwgXCJcXG5cIikgPj0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGdldEluZGVudChvcHRzLCBkZXB0aCkge1xyXG4gICAgICB2YXIgYmFzZUluZGVudDtcclxuICAgICAgaWYgKG9wdHMuaW5kZW50ID09PSBcIlx0XCIpIHtcclxuICAgICAgICBiYXNlSW5kZW50ID0gXCJcdFwiO1xyXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRzLmluZGVudCA9PT0gXCJudW1iZXJcIiAmJiBvcHRzLmluZGVudCA+IDApIHtcclxuICAgICAgICBiYXNlSW5kZW50ID0gJGpvaW4uY2FsbChBcnJheShvcHRzLmluZGVudCArIDEpLCBcIiBcIik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBiYXNlOiBiYXNlSW5kZW50LFxyXG4gICAgICAgIHByZXY6ICRqb2luLmNhbGwoQXJyYXkoZGVwdGggKyAxKSwgYmFzZUluZGVudClcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGluZGVudGVkSm9pbih4cywgaW5kZW50KSB7XHJcbiAgICAgIGlmICh4cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gXCJcIjtcclxuICAgICAgfVxyXG4gICAgICB2YXIgbGluZUpvaW5lciA9IFwiXFxuXCIgKyBpbmRlbnQucHJldiArIGluZGVudC5iYXNlO1xyXG4gICAgICByZXR1cm4gbGluZUpvaW5lciArICRqb2luLmNhbGwoeHMsIFwiLFwiICsgbGluZUpvaW5lcikgKyBcIlxcblwiICsgaW5kZW50LnByZXY7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBhcnJPYmpLZXlzKG9iaiwgaW5zcGVjdDMpIHtcclxuICAgICAgdmFyIGlzQXJyID0gaXNBcnJheShvYmopO1xyXG4gICAgICB2YXIgeHMgPSBbXTtcclxuICAgICAgaWYgKGlzQXJyKSB7XHJcbiAgICAgICAgeHMubGVuZ3RoID0gb2JqLmxlbmd0aDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iai5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgeHNbaV0gPSBoYXMob2JqLCBpKSA/IGluc3BlY3QzKG9ialtpXSwgb2JqKSA6IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHZhciBzeW1zID0gdHlwZW9mIGdPUFMgPT09IFwiZnVuY3Rpb25cIiA/IGdPUFMob2JqKSA6IFtdO1xyXG4gICAgICB2YXIgc3ltTWFwO1xyXG4gICAgICBpZiAoaGFzU2hhbW1lZFN5bWJvbHMpIHtcclxuICAgICAgICBzeW1NYXAgPSB7fTtcclxuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IHN5bXMubGVuZ3RoOyBrKyspIHtcclxuICAgICAgICAgIHN5bU1hcFtcIiRcIiArIHN5bXNba11dID0gc3ltc1trXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xyXG4gICAgICAgIGlmICghaGFzKG9iaiwga2V5KSkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc0FyciAmJiBTdHJpbmcoTnVtYmVyKGtleSkpID09PSBrZXkgJiYga2V5IDwgb2JqLmxlbmd0aCkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoYXNTaGFtbWVkU3ltYm9scyAmJiBzeW1NYXBbXCIkXCIgKyBrZXldIGluc3RhbmNlb2YgU3ltYm9sKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKCR0ZXN0LmNhbGwoL1teXFx3JF0vLCBrZXkpKSB7XHJcbiAgICAgICAgICB4cy5wdXNoKGluc3BlY3QzKGtleSwgb2JqKSArIFwiOiBcIiArIGluc3BlY3QzKG9ialtrZXldLCBvYmopKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgeHMucHVzaChrZXkgKyBcIjogXCIgKyBpbnNwZWN0MyhvYmpba2V5XSwgb2JqKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICh0eXBlb2YgZ09QUyA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzeW1zLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICBpZiAoaXNFbnVtZXJhYmxlLmNhbGwob2JqLCBzeW1zW2pdKSkge1xyXG4gICAgICAgICAgICB4cy5wdXNoKFwiW1wiICsgaW5zcGVjdDMoc3ltc1tqXSkgKyBcIl06IFwiICsgaW5zcGVjdDMob2JqW3N5bXNbal1dLCBvYmopKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHhzO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcblxyXG4vLyBzcmMvbGliL3RpbWVfZHVyYXRpb24udHNcclxudmFyIFRpbWVEdXJhdGlvbiA9IGNsYXNzIF9UaW1lRHVyYXRpb24ge1xyXG4gIF9fdGltZV9kdXJhdGlvbl9taWNyb3NfXztcclxuICBzdGF0aWMgTUlDUk9TX1BFUl9NSUxMSVMgPSAxMDAwbjtcclxuICAvKipcclxuICAgKiBHZXQgdGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB7QGxpbmsgVGltZUR1cmF0aW9ufSB0eXBlLlxyXG4gICAqIEByZXR1cm5zIFRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHlwZS5cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xyXG4gICAgICBlbGVtZW50czogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIG5hbWU6IFwiX190aW1lX2R1cmF0aW9uX21pY3Jvc19fXCIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLkk2NFxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHN0YXRpYyBpc1RpbWVEdXJhdGlvbihhbGdlYnJhaWNUeXBlKSB7XHJcbiAgICBpZiAoYWxnZWJyYWljVHlwZS50YWcgIT09IFwiUHJvZHVjdFwiKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IGVsZW1lbnRzID0gYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cztcclxuICAgIGlmIChlbGVtZW50cy5sZW5ndGggIT09IDEpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbWljcm9zRWxlbWVudCA9IGVsZW1lbnRzWzBdO1xyXG4gICAgcmV0dXJuIG1pY3Jvc0VsZW1lbnQubmFtZSA9PT0gXCJfX3RpbWVfZHVyYXRpb25fbWljcm9zX19cIiAmJiBtaWNyb3NFbGVtZW50LmFsZ2VicmFpY1R5cGUudGFnID09PSBcIkk2NFwiO1xyXG4gIH1cclxuICBnZXQgbWljcm9zKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX190aW1lX2R1cmF0aW9uX21pY3Jvc19fO1xyXG4gIH1cclxuICBnZXQgbWlsbGlzKCkge1xyXG4gICAgcmV0dXJuIE51bWJlcih0aGlzLm1pY3JvcyAvIF9UaW1lRHVyYXRpb24uTUlDUk9TX1BFUl9NSUxMSVMpO1xyXG4gIH1cclxuICBjb25zdHJ1Y3RvcihtaWNyb3MpIHtcclxuICAgIHRoaXMuX190aW1lX2R1cmF0aW9uX21pY3Jvc19fID0gbWljcm9zO1xyXG4gIH1cclxuICBzdGF0aWMgZnJvbU1pbGxpcyhtaWxsaXMpIHtcclxuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbihCaWdJbnQobWlsbGlzKSAqIF9UaW1lRHVyYXRpb24uTUlDUk9TX1BFUl9NSUxMSVMpO1xyXG4gIH1cclxuICAvKiogVGhpcyBvdXRwdXRzIHRoZSBzYW1lIHN0cmluZyBmb3JtYXQgdGhhdCB3ZSB1c2UgaW4gdGhlIGhvc3QgYW5kIGluIFJ1c3QgbW9kdWxlcyAqL1xyXG4gIHRvU3RyaW5nKCkge1xyXG4gICAgY29uc3QgbWljcm9zID0gdGhpcy5taWNyb3M7XHJcbiAgICBjb25zdCBzaWduID0gbWljcm9zIDwgMCA/IFwiLVwiIDogXCIrXCI7XHJcbiAgICBjb25zdCBwb3MgPSBtaWNyb3MgPCAwID8gLW1pY3JvcyA6IG1pY3JvcztcclxuICAgIGNvbnN0IHNlY3MgPSBwb3MgLyAxMDAwMDAwbjtcclxuICAgIGNvbnN0IG1pY3Jvc19yZW1haW5pbmcgPSBwb3MgJSAxMDAwMDAwbjtcclxuICAgIHJldHVybiBgJHtzaWdufSR7c2Vjc30uJHtTdHJpbmcobWljcm9zX3JlbWFpbmluZykucGFkU3RhcnQoNiwgXCIwXCIpfWA7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2xpYi90aW1lc3RhbXAudHNcclxudmFyIFRpbWVzdGFtcCA9IGNsYXNzIF9UaW1lc3RhbXAge1xyXG4gIF9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX187XHJcbiAgc3RhdGljIE1JQ1JPU19QRVJfTUlMTElTID0gMTAwMG47XHJcbiAgZ2V0IG1pY3Jvc1NpbmNlVW5peEVwb2NoKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcclxuICB9XHJcbiAgY29uc3RydWN0b3IobWljcm9zKSB7XHJcbiAgICB0aGlzLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX18gPSBtaWNyb3M7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHtAbGluayBUaW1lc3RhbXB9IHR5cGUuXHJcbiAgICogQHJldHVybnMgVGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBnZXRBbGdlYnJhaWNUeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7XHJcbiAgICAgIGVsZW1lbnRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXCIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLkk2NFxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHN0YXRpYyBpc1RpbWVzdGFtcChhbGdlYnJhaWNUeXBlKSB7XHJcbiAgICBpZiAoYWxnZWJyYWljVHlwZS50YWcgIT09IFwiUHJvZHVjdFwiKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IGVsZW1lbnRzID0gYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cztcclxuICAgIGlmIChlbGVtZW50cy5sZW5ndGggIT09IDEpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbWljcm9zRWxlbWVudCA9IGVsZW1lbnRzWzBdO1xyXG4gICAgcmV0dXJuIG1pY3Jvc0VsZW1lbnQubmFtZSA9PT0gXCJfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXCIgJiYgbWljcm9zRWxlbWVudC5hbGdlYnJhaWNUeXBlLnRhZyA9PT0gXCJJNjRcIjtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogVGhlIFVuaXggZXBvY2gsIHRoZSBtaWRuaWdodCBhdCB0aGUgYmVnaW5uaW5nIG9mIEphbnVhcnkgMSwgMTk3MCwgVVRDLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBVTklYX0VQT0NIID0gbmV3IF9UaW1lc3RhbXAoMG4pO1xyXG4gIC8qKlxyXG4gICAqIEdldCBhIGBUaW1lc3RhbXBgIHJlcHJlc2VudGluZyB0aGUgZXhlY3V0aW9uIGVudmlyb25tZW50J3MgYmVsaWVmIG9mIHRoZSBjdXJyZW50IG1vbWVudCBpbiB0aW1lLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBub3coKSB7XHJcbiAgICByZXR1cm4gX1RpbWVzdGFtcC5mcm9tRGF0ZSgvKiBAX19QVVJFX18gKi8gbmV3IERhdGUoKSk7XHJcbiAgfVxyXG4gIC8qKiBDb252ZXJ0IHRvIG1pbGxpc2Vjb25kcyBzaW5jZSBVbml4IGVwb2NoLiAqL1xyXG4gIHRvTWlsbGlzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubWljcm9zU2luY2VVbml4RXBvY2ggLyAxMDAwbjtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogR2V0IGEgYFRpbWVzdGFtcGAgcmVwcmVzZW50aW5nIHRoZSBzYW1lIHBvaW50IGluIHRpbWUgYXMgYGRhdGVgLlxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tRGF0ZShkYXRlKSB7XHJcbiAgICBjb25zdCBtaWxsaXMgPSBkYXRlLmdldFRpbWUoKTtcclxuICAgIGNvbnN0IG1pY3JvcyA9IEJpZ0ludChtaWxsaXMpICogX1RpbWVzdGFtcC5NSUNST1NfUEVSX01JTExJUztcclxuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcChtaWNyb3MpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBHZXQgYSBgRGF0ZWAgcmVwcmVzZW50aW5nIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgcG9pbnQgaW4gdGltZSBhcyBgdGhpc2AuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCB0cnVuY2F0ZXMgdG8gbWlsbGlzZWNvbmQgcHJlY2lzaW9uLFxyXG4gICAqIGFuZCB0aHJvd3MgYFJhbmdlRXJyb3JgIGlmIHRoZSBgVGltZXN0YW1wYCBpcyBvdXRzaWRlIHRoZSByYW5nZSByZXByZXNlbnRhYmxlIGFzIGEgYERhdGVgLlxyXG4gICAqL1xyXG4gIHRvRGF0ZSgpIHtcclxuICAgIGNvbnN0IG1pY3JvcyA9IHRoaXMuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXztcclxuICAgIGNvbnN0IG1pbGxpcyA9IG1pY3JvcyAvIF9UaW1lc3RhbXAuTUlDUk9TX1BFUl9NSUxMSVM7XHJcbiAgICBpZiAobWlsbGlzID4gQmlnSW50KE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSB8fCBtaWxsaXMgPCBCaWdJbnQoTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIpKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxyXG4gICAgICAgIFwiVGltZXN0YW1wIGlzIG91dHNpZGUgb2YgdGhlIHJlcHJlc2VudGFibGUgcmFuZ2Ugb2YgSlMncyBEYXRlXCJcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgRGF0ZShOdW1iZXIobWlsbGlzKSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEdldCBhbiBJU08gODYwMSAvIFJGQyAzMzM5IGZvcm1hdHRlZCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyB0aW1lc3RhbXAgd2l0aCBtaWNyb3NlY29uZCBwcmVjaXNpb24uXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBwcmVzZXJ2ZXMgdGhlIGZ1bGwgbWljcm9zZWNvbmQgcHJlY2lzaW9uIG9mIHRoZSB0aW1lc3RhbXAsXHJcbiAgICogYW5kIHRocm93cyBgUmFuZ2VFcnJvcmAgaWYgdGhlIGBUaW1lc3RhbXBgIGlzIG91dHNpZGUgdGhlIHJhbmdlIHJlcHJlc2VudGFibGUgaW4gSVNPIGZvcm1hdC5cclxuICAgKlxyXG4gICAqIEByZXR1cm5zIElTTyA4NjAxIGZvcm1hdHRlZCBzdHJpbmcgd2l0aCBtaWNyb3NlY29uZCBwcmVjaXNpb24gKGUuZy4sICcyMDI1LTAyLTE3VDEwOjMwOjQ1LjEyMzQ1NlonKVxyXG4gICAqL1xyXG4gIHRvSVNPU3RyaW5nKCkge1xyXG4gICAgY29uc3QgbWljcm9zID0gdGhpcy5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xyXG4gICAgY29uc3QgbWlsbGlzID0gbWljcm9zIC8gX1RpbWVzdGFtcC5NSUNST1NfUEVSX01JTExJUztcclxuICAgIGlmIChtaWxsaXMgPiBCaWdJbnQoTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIHx8IG1pbGxpcyA8IEJpZ0ludChOdW1iZXIuTUlOX1NBRkVfSU5URUdFUikpIHtcclxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXHJcbiAgICAgICAgXCJUaW1lc3RhbXAgaXMgb3V0c2lkZSBvZiB0aGUgcmVwcmVzZW50YWJsZSByYW5nZSBmb3IgSVNPIHN0cmluZyBmb3JtYXR0aW5nXCJcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShOdW1iZXIobWlsbGlzKSk7XHJcbiAgICBjb25zdCBpc29CYXNlID0gZGF0ZS50b0lTT1N0cmluZygpO1xyXG4gICAgY29uc3QgbWljcm9zUmVtYWluZGVyID0gTWF0aC5hYnMoTnVtYmVyKG1pY3JvcyAlIDEwMDAwMDBuKSk7XHJcbiAgICBjb25zdCBmcmFjdGlvbmFsUGFydCA9IFN0cmluZyhtaWNyb3NSZW1haW5kZXIpLnBhZFN0YXJ0KDYsIFwiMFwiKTtcclxuICAgIHJldHVybiBpc29CYXNlLnJlcGxhY2UoL1xcLlxcZHszfVokLywgYC4ke2ZyYWN0aW9uYWxQYXJ0fVpgKTtcclxuICB9XHJcbiAgc2luY2Uob3RoZXIpIHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uKFxyXG4gICAgICB0aGlzLl9fdGltZXN0YW1wX21pY3Jvc19zaW5jZV91bml4X2Vwb2NoX18gLSBvdGhlci5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvdXVpZC50c1xyXG52YXIgVXVpZCA9IGNsYXNzIF9VdWlkIHtcclxuICBfX3V1aWRfXztcclxuICAvKipcclxuICAgKiBUaGUgbmlsIFVVSUQgKGFsbCB6ZXJvcykuXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIGBgYHRzXHJcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuTklMO1xyXG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxyXG4gICAqICAgdXVpZC50b1N0cmluZygpID09PSBcIjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMFwiXHJcbiAgICogKTtcclxuICAgKiBgYGBcclxuICAgKi9cclxuICBzdGF0aWMgTklMID0gbmV3IF9VdWlkKDBuKTtcclxuICBzdGF0aWMgTUFYX1VVSURfQklHSU5UID0gMHhmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZm47XHJcbiAgLyoqXHJcbiAgICogVGhlIG1heCBVVUlEIChhbGwgb25lcykuXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIGBgYHRzXHJcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuTUFYO1xyXG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxyXG4gICAqICAgdXVpZC50b1N0cmluZygpID09PSBcImZmZmZmZmZmLWZmZmYtZmZmZi1mZmZmLWZmZmZmZmZmZmZmZlwiXHJcbiAgICogKTtcclxuICAgKiBgYGBcclxuICAgKi9cclxuICBzdGF0aWMgTUFYID0gbmV3IF9VdWlkKF9VdWlkLk1BWF9VVUlEX0JJR0lOVCk7XHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlIGEgVVVJRCBmcm9tIGEgcmF3IDEyOC1iaXQgdmFsdWUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdSAtIFVuc2lnbmVkIDEyOC1iaXQgaW50ZWdlclxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiB0aGUgdmFsdWUgaXMgb3V0c2lkZSB0aGUgdmFsaWQgVVVJRCByYW5nZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKHUpIHtcclxuICAgIGlmICh1IDwgMG4gfHwgdSA+IF9VdWlkLk1BWF9VVUlEX0JJR0lOVCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIFVVSUQ6IG11c3QgYmUgYmV0d2VlbiAwIGFuZCBgTUFYX1VVSURfQklHSU5UYFwiKTtcclxuICAgIH1cclxuICAgIHRoaXMuX191dWlkX18gPSB1O1xyXG4gIH1cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBVVUlEIGB2NGAgZnJvbSBleHBsaWNpdCByYW5kb20gYnl0ZXMuXHJcbiAgICpcclxuICAgKiBUaGlzIG1ldGhvZCBhc3N1bWVzIHRoZSBieXRlcyBhcmUgYWxyZWFkeSBzdWZmaWNpZW50bHkgcmFuZG9tLlxyXG4gICAqIEl0IG9ubHkgc2V0cyB0aGUgYXBwcm9wcmlhdGUgYml0cyBmb3IgdGhlIFVVSUQgdmVyc2lvbiBhbmQgdmFyaWFudC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBieXRlcyAtIEV4YWN0bHkgMTYgcmFuZG9tIGJ5dGVzXHJcbiAgICogQHJldHVybnMgQSBVVUlEIGB2NGBcclxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgYGJ5dGVzLmxlbmd0aCAhPT0gMTZgXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIGBgYHRzXHJcbiAgICogY29uc3QgcmFuZG9tQnl0ZXMgPSBuZXcgVWludDhBcnJheSgxNik7XHJcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuZnJvbVJhbmRvbUJ5dGVzVjQocmFuZG9tQnl0ZXMpO1xyXG4gICAqXHJcbiAgICogY29uc29sZS5hc3NlcnQoXHJcbiAgICogICB1dWlkLnRvU3RyaW5nKCkgPT09IFwiMDAwMDAwMDAtMDAwMC00MDAwLTgwMDAtMDAwMDAwMDAwMDAwXCJcclxuICAgKiApO1xyXG4gICAqIGBgYFxyXG4gICAqL1xyXG4gIHN0YXRpYyBmcm9tUmFuZG9tQnl0ZXNWNChieXRlcykge1xyXG4gICAgaWYgKGJ5dGVzLmxlbmd0aCAhPT0gMTYpIHRocm93IG5ldyBFcnJvcihcIlVVSUQgdjQgcmVxdWlyZXMgMTYgYnl0ZXNcIik7XHJcbiAgICBjb25zdCBhcnIgPSBuZXcgVWludDhBcnJheShieXRlcyk7XHJcbiAgICBhcnJbNl0gPSBhcnJbNl0gJiAxNSB8IDY0O1xyXG4gICAgYXJyWzhdID0gYXJyWzhdICYgNjMgfCAxMjg7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkKF9VdWlkLmJ5dGVzVG9CaWdJbnQoYXJyKSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEdlbmVyYXRlIGEgVVVJRCBgdjdgIHVzaW5nIGEgbW9ub3RvbmljIGNvdW50ZXIgZnJvbSBgMGAgdG8gYDJeMzEgLSAxYCxcclxuICAgKiBhIHRpbWVzdGFtcCwgYW5kIDQgcmFuZG9tIGJ5dGVzLlxyXG4gICAqXHJcbiAgICogVGhlIGNvdW50ZXIgd3JhcHMgYXJvdW5kIG9uIG92ZXJmbG93LlxyXG4gICAqXHJcbiAgICogVGhlIFVVSUQgYHY3YCBpcyBzdHJ1Y3R1cmVkIGFzIGZvbGxvd3M6XHJcbiAgICpcclxuICAgKiBgYGBhc2NpaVxyXG4gICAqIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxyXG4gICAqIHwgQjAgIHwgQjEgIHwgQjIgIHwgQjMgIHwgQjQgIHwgQjUgICAgICAgICAgICAgIHwgICAgICAgICBCNiAgICAgICAgfFxyXG4gICAqIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpFxyXG4gICAqIHwgICAgICAgICAgICAgICAgIHVuaXhfdHNfbXMgICAgICAgICAgICAgICAgICAgIHwgICAgICB2ZXJzaW9uIDcgICAgfFxyXG4gICAqIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxyXG4gICAqIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUrOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkFxyXG4gICAqIHwgQjcgICAgICAgICAgIHwgQjggICAgICB8IEI5ICB8IEIxMCB8IEIxMSAgfCBCMTIgfCBCMTMgfCBCMTQgfCBCMTUgfFxyXG4gICAqIOKUnOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUvOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUpFxyXG4gICAqIHwgY291bnRlcl9oaWdoIHwgdmFyaWFudCB8ICAgIGNvdW50ZXJfbG93ICAgfCAgICAgICAgcmFuZG9tICAgICAgICAgfFxyXG4gICAqIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUtOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmFxyXG4gICAqIGBgYFxyXG4gICAqXHJcbiAgICogQHBhcmFtIGNvdW50ZXIgLSBNdXRhYmxlIG1vbm90b25pYyBjb3VudGVyICgzMS1iaXQpXHJcbiAgICogQHBhcmFtIG5vdyAtIFRpbWVzdGFtcCBzaW5jZSB0aGUgVW5peCBlcG9jaFxyXG4gICAqIEBwYXJhbSByYW5kb21CeXRlcyAtIEV4YWN0bHkgNCByYW5kb20gYnl0ZXNcclxuICAgKiBAcmV0dXJucyBBIFVVSUQgYHY3YFxyXG4gICAqXHJcbiAgICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBgY291bnRlcmAgaXMgbmVnYXRpdmVcclxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIGB0aW1lc3RhbXBgIGlzIGJlZm9yZSB0aGUgVW5peCBlcG9jaFxyXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiBgcmFuZG9tQnl0ZXMubGVuZ3RoICE9PSA0YFxyXG4gICAqXHJcbiAgICogQGV4YW1wbGVcclxuICAgKiBgYGB0c1xyXG4gICAqIGNvbnN0IG5vdyA9IFRpbWVzdGFtcC5mcm9tTWlsbGlzKDFfNjg2XzAwMF8wMDBfMDAwbik7XHJcbiAgICogY29uc3QgY291bnRlciA9IHsgdmFsdWU6IDEgfTtcclxuICAgKiBjb25zdCByYW5kb21CeXRlcyA9IG5ldyBVaW50OEFycmF5KDQpO1xyXG4gICAqXHJcbiAgICogY29uc3QgdXVpZCA9IFV1aWQuZnJvbUNvdW50ZXJWNyhjb3VudGVyLCBub3csIHJhbmRvbUJ5dGVzKTtcclxuICAgKlxyXG4gICAqIGNvbnNvbGUuYXNzZXJ0KFxyXG4gICAqICAgdXVpZC50b1N0cmluZygpID09PSBcIjAwMDA2NDdlLTUxODAtNzAwMC04MDAwLTAwMDIwMDAwMDAwMFwiXHJcbiAgICogKTtcclxuICAgKiBgYGBcclxuICAgKi9cclxuICBzdGF0aWMgZnJvbUNvdW50ZXJWNyhjb3VudGVyLCBub3csIHJhbmRvbUJ5dGVzKSB7XHJcbiAgICBpZiAocmFuZG9tQnl0ZXMubGVuZ3RoICE9PSA0KSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImBmcm9tQ291bnRlclY3YCByZXF1aXJlcyBgcmFuZG9tQnl0ZXMubGVuZ3RoID09IDRgXCIpO1xyXG4gICAgfVxyXG4gICAgaWYgKGNvdW50ZXIudmFsdWUgPCAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImBmcm9tQ291bnRlclY3YCB1dWlkIGBjb3VudGVyYCBtdXN0IGJlIG5vbi1uZWdhdGl2ZVwiKTtcclxuICAgIH1cclxuICAgIGlmIChub3cuX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfXyA8IDApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYGZyb21Db3VudGVyVjdgIGB0aW1lc3RhbXBgIGJlZm9yZSB1bml4IGVwb2NoXCIpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgY291bnRlclZhbCA9IGNvdW50ZXIudmFsdWU7XHJcbiAgICBjb3VudGVyLnZhbHVlID0gY291bnRlclZhbCArIDEgJiAyMTQ3NDgzNjQ3O1xyXG4gICAgY29uc3QgdHNNcyA9IG5vdy50b01pbGxpcygpICYgMHhmZmZmZmZmZmZmZmZuO1xyXG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgxNik7XHJcbiAgICBieXRlc1swXSA9IE51bWJlcih0c01zID4+IDQwbiAmIDB4ZmZuKTtcclxuICAgIGJ5dGVzWzFdID0gTnVtYmVyKHRzTXMgPj4gMzJuICYgMHhmZm4pO1xyXG4gICAgYnl0ZXNbMl0gPSBOdW1iZXIodHNNcyA+PiAyNG4gJiAweGZmbik7XHJcbiAgICBieXRlc1szXSA9IE51bWJlcih0c01zID4+IDE2biAmIDB4ZmZuKTtcclxuICAgIGJ5dGVzWzRdID0gTnVtYmVyKHRzTXMgPj4gOG4gJiAweGZmbik7XHJcbiAgICBieXRlc1s1XSA9IE51bWJlcih0c01zICYgMHhmZm4pO1xyXG4gICAgYnl0ZXNbN10gPSBjb3VudGVyVmFsID4+PiAyMyAmIDI1NTtcclxuICAgIGJ5dGVzWzldID0gY291bnRlclZhbCA+Pj4gMTUgJiAyNTU7XHJcbiAgICBieXRlc1sxMF0gPSBjb3VudGVyVmFsID4+PiA3ICYgMjU1O1xyXG4gICAgYnl0ZXNbMTFdID0gKGNvdW50ZXJWYWwgJiAxMjcpIDw8IDEgJiAyNTU7XHJcbiAgICBieXRlc1sxMl0gfD0gcmFuZG9tQnl0ZXNbMF0gJiAxMjc7XHJcbiAgICBieXRlc1sxM10gPSByYW5kb21CeXRlc1sxXTtcclxuICAgIGJ5dGVzWzE0XSA9IHJhbmRvbUJ5dGVzWzJdO1xyXG4gICAgYnl0ZXNbMTVdID0gcmFuZG9tQnl0ZXNbM107XHJcbiAgICBieXRlc1s2XSA9IGJ5dGVzWzZdICYgMTUgfCAxMTI7XHJcbiAgICBieXRlc1s4XSA9IGJ5dGVzWzhdICYgNjMgfCAxMjg7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkKF9VdWlkLmJ5dGVzVG9CaWdJbnQoYnl0ZXMpKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUGFyc2UgYSBVVUlEIGZyb20gYSBzdHJpbmcgcmVwcmVzZW50YXRpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcyAtIFVVSUQgc3RyaW5nXHJcbiAgICogQHJldHVybnMgUGFyc2VkIFVVSURcclxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHN0cmluZyBpcyBub3QgYSB2YWxpZCBVVUlEXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIGBgYHRzXHJcbiAgICogY29uc3QgcyA9IFwiMDE4ODhkNmUtNWMwMC03MDAwLTgwMDAtMDAwMDAwMDAwMDAwXCI7XHJcbiAgICogY29uc3QgdXVpZCA9IFV1aWQucGFyc2Uocyk7XHJcbiAgICpcclxuICAgKiBjb25zb2xlLmFzc2VydCh1dWlkLnRvU3RyaW5nKCkgPT09IHMpO1xyXG4gICAqIGBgYFxyXG4gICAqL1xyXG4gIHN0YXRpYyBwYXJzZShzKSB7XHJcbiAgICBjb25zdCBoZXggPSBzLnJlcGxhY2UoLy0vZywgXCJcIik7XHJcbiAgICBpZiAoaGV4Lmxlbmd0aCAhPT0gMzIpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaGV4IFVVSURcIik7XHJcbiAgICBsZXQgdiA9IDBuO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAzMjsgaSArPSAyKSB7XHJcbiAgICAgIHYgPSB2IDw8IDhuIHwgQmlnSW50KHBhcnNlSW50KGhleC5zbGljZShpLCBpICsgMiksIDE2KSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkKHYpO1xyXG4gIH1cclxuICAvKiogQ29udmVydCB0byBzdHJpbmcgKGh5cGhlbmF0ZWQgZm9ybSkuICovXHJcbiAgdG9TdHJpbmcoKSB7XHJcbiAgICBjb25zdCBieXRlcyA9IF9VdWlkLmJpZ0ludFRvQnl0ZXModGhpcy5fX3V1aWRfXyk7XHJcbiAgICBjb25zdCBoZXggPSBbLi4uYnl0ZXNdLm1hcCgoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpKS5qb2luKFwiXCIpO1xyXG4gICAgcmV0dXJuIGhleC5zbGljZSgwLCA4KSArIFwiLVwiICsgaGV4LnNsaWNlKDgsIDEyKSArIFwiLVwiICsgaGV4LnNsaWNlKDEyLCAxNikgKyBcIi1cIiArIGhleC5zbGljZSgxNiwgMjApICsgXCItXCIgKyBoZXguc2xpY2UoMjApO1xyXG4gIH1cclxuICAvKiogQ29udmVydCB0byBiaWdpbnQgKHUxMjgpLiAqL1xyXG4gIGFzQmlnSW50KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX191dWlkX187XHJcbiAgfVxyXG4gIC8qKiBSZXR1cm4gYSBgVWludDhBcnJheWAgb2YgMTYgYnl0ZXMuICovXHJcbiAgdG9CeXRlcygpIHtcclxuICAgIHJldHVybiBfVXVpZC5iaWdJbnRUb0J5dGVzKHRoaXMuX191dWlkX18pO1xyXG4gIH1cclxuICBzdGF0aWMgYnl0ZXNUb0JpZ0ludChieXRlcykge1xyXG4gICAgbGV0IHJlc3VsdCA9IDBuO1xyXG4gICAgZm9yIChjb25zdCBiIG9mIGJ5dGVzKSByZXN1bHQgPSByZXN1bHQgPDwgOG4gfCBCaWdJbnQoYik7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxuICBzdGF0aWMgYmlnSW50VG9CeXRlcyh2YWx1ZSkge1xyXG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheSgxNik7XHJcbiAgICBmb3IgKGxldCBpID0gMTU7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGJ5dGVzW2ldID0gTnVtYmVyKHZhbHVlICYgMHhmZm4pO1xyXG4gICAgICB2YWx1ZSA+Pj0gOG47XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYnl0ZXM7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHZlcnNpb24gb2YgdGhpcyBVVUlELlxyXG4gICAqXHJcbiAgICogVGhpcyByZXByZXNlbnRzIHRoZSBhbGdvcml0aG0gdXNlZCB0byBnZW5lcmF0ZSB0aGUgdmFsdWUuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyBBIGBVdWlkVmVyc2lvbmBcclxuICAgKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIHZlcnNpb24gZmllbGQgaXMgbm90IHJlY29nbml6ZWRcclxuICAgKi9cclxuICBnZXRWZXJzaW9uKCkge1xyXG4gICAgY29uc3QgdmVyc2lvbiA9IHRoaXMudG9CeXRlcygpWzZdID4+IDQgJiAxNTtcclxuICAgIHN3aXRjaCAodmVyc2lvbikge1xyXG4gICAgICBjYXNlIDQ6XHJcbiAgICAgICAgcmV0dXJuIFwiVjRcIjtcclxuICAgICAgY2FzZSA3OlxyXG4gICAgICAgIHJldHVybiBcIlY3XCI7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgaWYgKHRoaXMgPT0gX1V1aWQuTklMKSB7XHJcbiAgICAgICAgICByZXR1cm4gXCJOaWxcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMgPT0gX1V1aWQuTUFYKSB7XHJcbiAgICAgICAgICByZXR1cm4gXCJNYXhcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBVVUlEIHZlcnNpb246ICR7dmVyc2lvbn1gKTtcclxuICAgIH1cclxuICB9XHJcbiAgLyoqXHJcbiAgICogRXh0cmFjdCB0aGUgbW9ub3RvbmljIGNvdW50ZXIgZnJvbSBhIFVVSUR2Ny5cclxuICAgKlxyXG4gICAqIEludGVuZGVkIGZvciB0ZXN0aW5nIGFuZCBkaWFnbm9zdGljcy5cclxuICAgKiBCZWhhdmlvciBpcyB1bmRlZmluZWQgaWYgY2FsbGVkIG9uIGEgbm9uLVY3IFVVSUQuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyAzMS1iaXQgY291bnRlciB2YWx1ZVxyXG4gICAqL1xyXG4gIGdldENvdW50ZXIoKSB7XHJcbiAgICBjb25zdCBieXRlcyA9IHRoaXMudG9CeXRlcygpO1xyXG4gICAgY29uc3QgaGlnaCA9IGJ5dGVzWzddO1xyXG4gICAgY29uc3QgbWlkMSA9IGJ5dGVzWzldO1xyXG4gICAgY29uc3QgbWlkMiA9IGJ5dGVzWzEwXTtcclxuICAgIGNvbnN0IGxvdyA9IGJ5dGVzWzExXSA+Pj4gMTtcclxuICAgIHJldHVybiBoaWdoIDw8IDIzIHwgbWlkMSA8PCAxNSB8IG1pZDIgPDwgNyB8IGxvdyB8IDA7XHJcbiAgfVxyXG4gIGNvbXBhcmVUbyhvdGhlcikge1xyXG4gICAgaWYgKHRoaXMuX191dWlkX18gPCBvdGhlci5fX3V1aWRfXykgcmV0dXJuIC0xO1xyXG4gICAgaWYgKHRoaXMuX191dWlkX18gPiBvdGhlci5fX3V1aWRfXykgcmV0dXJuIDE7XHJcbiAgICByZXR1cm4gMDtcclxuICB9XHJcbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcclxuICAgICAgZWxlbWVudHM6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBuYW1lOiBcIl9fdXVpZF9fXCIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLlUxMjhcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvYmluYXJ5X3JlYWRlci50c1xyXG52YXIgQmluYXJ5UmVhZGVyID0gY2xhc3Mge1xyXG4gIC8qKlxyXG4gICAqIFRoZSBEYXRhVmlldyB1c2VkIHRvIHJlYWQgdmFsdWVzIGZyb20gdGhlIGJpbmFyeSBkYXRhLlxyXG4gICAqXHJcbiAgICogTm90ZTogVGhlIERhdGFWaWV3J3MgYGJ5dGVPZmZzZXRgIGlzIHJlbGF0aXZlIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlXHJcbiAgICogdW5kZXJseWluZyBBcnJheUJ1ZmZlciwgbm90IHRoZSBzdGFydCBvZiB0aGUgcHJvdmlkZWQgVWludDhBcnJheSBpbnB1dC5cclxuICAgKiBUaGlzIGBCaW5hcnlSZWFkZXJgJ3MgYCNvZmZzZXRgIGZpZWxkIGlzIHVzZWQgdG8gdHJhY2sgdGhlIGN1cnJlbnQgcmVhZCBwb3NpdGlvblxyXG4gICAqIHJlbGF0aXZlIHRvIHRoZSBzdGFydCBvZiB0aGUgcHJvdmlkZWQgVWludDhBcnJheSBpbnB1dC5cclxuICAgKi9cclxuICB2aWV3O1xyXG4gIC8qKlxyXG4gICAqIFJlcHJlc2VudHMgdGhlIG9mZnNldCAoaW4gYnl0ZXMpIHJlbGF0aXZlIHRvIHRoZSBzdGFydCBvZiB0aGUgRGF0YVZpZXdcclxuICAgKiBhbmQgcHJvdmlkZWQgVWludDhBcnJheSBpbnB1dC5cclxuICAgKlxyXG4gICAqIE5vdGU6IFRoaXMgaXMgKm5vdCogdGhlIGFic29sdXRlIGJ5dGUgb2Zmc2V0IHdpdGhpbiB0aGUgdW5kZXJseWluZyBBcnJheUJ1ZmZlci5cclxuICAgKi9cclxuICBvZmZzZXQgPSAwO1xyXG4gIGNvbnN0cnVjdG9yKGlucHV0KSB7XHJcbiAgICB0aGlzLnZpZXcgPSBpbnB1dCBpbnN0YW5jZW9mIERhdGFWaWV3ID8gaW5wdXQgOiBuZXcgRGF0YVZpZXcoaW5wdXQuYnVmZmVyLCBpbnB1dC5ieXRlT2Zmc2V0LCBpbnB1dC5ieXRlTGVuZ3RoKTtcclxuICAgIHRoaXMub2Zmc2V0ID0gMDtcclxuICB9XHJcbiAgcmVzZXQodmlldykge1xyXG4gICAgdGhpcy52aWV3ID0gdmlldztcclxuICAgIHRoaXMub2Zmc2V0ID0gMDtcclxuICB9XHJcbiAgZ2V0IHJlbWFpbmluZygpIHtcclxuICAgIHJldHVybiB0aGlzLnZpZXcuYnl0ZUxlbmd0aCAtIHRoaXMub2Zmc2V0O1xyXG4gIH1cclxuICAvKiogRW5zdXJlIHdlIGhhdmUgYXQgbGVhc3QgYG5gIGJ5dGVzIGxlZnQgdG8gcmVhZCAqL1xyXG4gICNlbnN1cmUobikge1xyXG4gICAgaWYgKHRoaXMub2Zmc2V0ICsgbiA+IHRoaXMudmlldy5ieXRlTGVuZ3RoKSB7XHJcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxyXG4gICAgICAgIGBUcmllZCB0byByZWFkICR7bn0gYnl0ZShzKSBhdCByZWxhdGl2ZSBvZmZzZXQgJHt0aGlzLm9mZnNldH0sIGJ1dCBvbmx5ICR7dGhpcy5yZW1haW5pbmd9IGJ5dGUocykgcmVtYWluYFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gIH1cclxuICByZWFkVUludDhBcnJheSgpIHtcclxuICAgIGNvbnN0IGxlbmd0aCA9IHRoaXMucmVhZFUzMigpO1xyXG4gICAgdGhpcy4jZW5zdXJlKGxlbmd0aCk7XHJcbiAgICByZXR1cm4gdGhpcy5yZWFkQnl0ZXMobGVuZ3RoKTtcclxuICB9XHJcbiAgcmVhZEJvb2woKSB7XHJcbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMudmlldy5nZXRVaW50OCh0aGlzLm9mZnNldCk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxO1xyXG4gICAgcmV0dXJuIHZhbHVlICE9PSAwO1xyXG4gIH1cclxuICByZWFkQnl0ZSgpIHtcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQ4KHRoaXMub2Zmc2V0KTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDE7XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbiAgfVxyXG4gIHJlYWRCeXRlcyhsZW5ndGgpIHtcclxuICAgIGNvbnN0IGFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoXHJcbiAgICAgIHRoaXMudmlldy5idWZmZXIsXHJcbiAgICAgIHRoaXMudmlldy5ieXRlT2Zmc2V0ICsgdGhpcy5vZmZzZXQsXHJcbiAgICAgIGxlbmd0aFxyXG4gICAgKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IGxlbmd0aDtcclxuICAgIHJldHVybiBhcnJheTtcclxuICB9XHJcbiAgcmVhZEk4KCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0SW50OCh0aGlzLm9mZnNldCk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkVTgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWFkQnl0ZSgpO1xyXG4gIH1cclxuICByZWFkSTE2KCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0SW50MTYodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMjtcclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcbiAgcmVhZFUxNigpIHtcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQxNih0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAyO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkSTMyKCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0SW50MzIodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gNDtcclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcbiAgcmVhZFUzMigpIHtcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldFVpbnQzMih0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA0O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkSTY0KCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0QmlnSW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gODtcclxuICAgIHJldHVybiB2YWx1ZTtcclxuICB9XHJcbiAgcmVhZFU2NCgpIHtcclxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA4O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkVTEyOCgpIHtcclxuICAgIGNvbnN0IGxvd2VyUGFydCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgY29uc3QgdXBwZXJQYXJ0ID0gdGhpcy52aWV3LmdldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDgsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMTY7XHJcbiAgICByZXR1cm4gKHVwcGVyUGFydCA8PCBCaWdJbnQoNjQpKSArIGxvd2VyUGFydDtcclxuICB9XHJcbiAgcmVhZEkxMjgoKSB7XHJcbiAgICBjb25zdCBsb3dlclBhcnQgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCB0cnVlKTtcclxuICAgIGNvbnN0IHVwcGVyUGFydCA9IHRoaXMudmlldy5nZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCArIDgsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMTY7XHJcbiAgICByZXR1cm4gKHVwcGVyUGFydCA8PCBCaWdJbnQoNjQpKSArIGxvd2VyUGFydDtcclxuICB9XHJcbiAgcmVhZFUyNTYoKSB7XHJcbiAgICBjb25zdCBwMCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgY29uc3QgcDEgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdHJ1ZSk7XHJcbiAgICBjb25zdCBwMiA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyAxNiwgdHJ1ZSk7XHJcbiAgICBjb25zdCBwMyA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyAyNCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAzMjtcclxuICAgIHJldHVybiAocDMgPDwgQmlnSW50KDMgKiA2NCkpICsgKHAyIDw8IEJpZ0ludCgyICogNjQpKSArIChwMSA8PCBCaWdJbnQoMSAqIDY0KSkgKyBwMDtcclxuICB9XHJcbiAgcmVhZEkyNTYoKSB7XHJcbiAgICBjb25zdCBwMCA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQsIHRydWUpO1xyXG4gICAgY29uc3QgcDEgPSB0aGlzLnZpZXcuZ2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCwgdHJ1ZSk7XHJcbiAgICBjb25zdCBwMiA9IHRoaXMudmlldy5nZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyAxNiwgdHJ1ZSk7XHJcbiAgICBjb25zdCBwMyA9IHRoaXMudmlldy5nZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCArIDI0LCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDMyO1xyXG4gICAgcmV0dXJuIChwMyA8PCBCaWdJbnQoMyAqIDY0KSkgKyAocDIgPDwgQmlnSW50KDIgKiA2NCkpICsgKHAxIDw8IEJpZ0ludCgxICogNjQpKSArIHAwO1xyXG4gIH1cclxuICByZWFkRjMyKCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0RmxvYXQzMih0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA0O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkRjY0KCkge1xyXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnZpZXcuZ2V0RmxvYXQ2NCh0aGlzLm9mZnNldCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA4O1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH1cclxuICByZWFkU3RyaW5nKCkge1xyXG4gICAgY29uc3QgdWludDhBcnJheSA9IHRoaXMucmVhZFVJbnQ4QXJyYXkoKTtcclxuICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoXCJ1dGYtOFwiKS5kZWNvZGUodWludDhBcnJheSk7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2xpYi9iaW5hcnlfd3JpdGVyLnRzXHJcbnZhciBpbXBvcnRfYmFzZTY0X2pzID0gX190b0VTTShyZXF1aXJlX2Jhc2U2NF9qcygpKTtcclxudmFyIEFycmF5QnVmZmVyUHJvdG90eXBlVHJhbnNmZXIgPSBBcnJheUJ1ZmZlci5wcm90b3R5cGUudHJhbnNmZXIgPz8gZnVuY3Rpb24obmV3Qnl0ZUxlbmd0aCkge1xyXG4gIGlmIChuZXdCeXRlTGVuZ3RoID09PSB2b2lkIDApIHtcclxuICAgIHJldHVybiB0aGlzLnNsaWNlKCk7XHJcbiAgfSBlbHNlIGlmIChuZXdCeXRlTGVuZ3RoIDw9IHRoaXMuYnl0ZUxlbmd0aCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2xpY2UoMCwgbmV3Qnl0ZUxlbmd0aCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGNvbnN0IGNvcHkgPSBuZXcgVWludDhBcnJheShuZXdCeXRlTGVuZ3RoKTtcclxuICAgIGNvcHkuc2V0KG5ldyBVaW50OEFycmF5KHRoaXMpKTtcclxuICAgIHJldHVybiBjb3B5LmJ1ZmZlcjtcclxuICB9XHJcbn07XHJcbnZhciBSZXNpemFibGVCdWZmZXIgPSBjbGFzcyB7XHJcbiAgYnVmZmVyO1xyXG4gIHZpZXc7XHJcbiAgY29uc3RydWN0b3IoaW5pdCkge1xyXG4gICAgdGhpcy5idWZmZXIgPSB0eXBlb2YgaW5pdCA9PT0gXCJudW1iZXJcIiA/IG5ldyBBcnJheUJ1ZmZlcihpbml0KSA6IGluaXQ7XHJcbiAgICB0aGlzLnZpZXcgPSBuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIpO1xyXG4gIH1cclxuICBnZXQgY2FwYWNpdHkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5idWZmZXIuYnl0ZUxlbmd0aDtcclxuICB9XHJcbiAgZ3JvdyhuZXdTaXplKSB7XHJcbiAgICBpZiAobmV3U2l6ZSA8PSB0aGlzLmJ1ZmZlci5ieXRlTGVuZ3RoKSByZXR1cm47XHJcbiAgICB0aGlzLmJ1ZmZlciA9IEFycmF5QnVmZmVyUHJvdG90eXBlVHJhbnNmZXIuY2FsbCh0aGlzLmJ1ZmZlciwgbmV3U2l6ZSk7XHJcbiAgICB0aGlzLnZpZXcgPSBuZXcgRGF0YVZpZXcodGhpcy5idWZmZXIpO1xyXG4gIH1cclxufTtcclxudmFyIEJpbmFyeVdyaXRlciA9IGNsYXNzIHtcclxuICBidWZmZXI7XHJcbiAgb2Zmc2V0ID0gMDtcclxuICBjb25zdHJ1Y3Rvcihpbml0KSB7XHJcbiAgICB0aGlzLmJ1ZmZlciA9IHR5cGVvZiBpbml0ID09PSBcIm51bWJlclwiID8gbmV3IFJlc2l6YWJsZUJ1ZmZlcihpbml0KSA6IGluaXQ7XHJcbiAgfVxyXG4gIHJlc2V0KGJ1ZmZlcikge1xyXG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XHJcbiAgICB0aGlzLm9mZnNldCA9IDA7XHJcbiAgfVxyXG4gIGV4cGFuZEJ1ZmZlcihhZGRpdGlvbmFsQ2FwYWNpdHkpIHtcclxuICAgIGNvbnN0IG1pbkNhcGFjaXR5ID0gdGhpcy5vZmZzZXQgKyBhZGRpdGlvbmFsQ2FwYWNpdHkgKyAxO1xyXG4gICAgaWYgKG1pbkNhcGFjaXR5IDw9IHRoaXMuYnVmZmVyLmNhcGFjaXR5KSByZXR1cm47XHJcbiAgICBsZXQgbmV3Q2FwYWNpdHkgPSB0aGlzLmJ1ZmZlci5jYXBhY2l0eSAqIDI7XHJcbiAgICBpZiAobmV3Q2FwYWNpdHkgPCBtaW5DYXBhY2l0eSkgbmV3Q2FwYWNpdHkgPSBtaW5DYXBhY2l0eTtcclxuICAgIHRoaXMuYnVmZmVyLmdyb3cobmV3Q2FwYWNpdHkpO1xyXG4gIH1cclxuICB0b0Jhc2U2NCgpIHtcclxuICAgIHJldHVybiAoMCwgaW1wb3J0X2Jhc2U2NF9qcy5mcm9tQnl0ZUFycmF5KSh0aGlzLmdldEJ1ZmZlcigpKTtcclxuICB9XHJcbiAgZ2V0QnVmZmVyKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHRoaXMuYnVmZmVyLmJ1ZmZlciwgMCwgdGhpcy5vZmZzZXQpO1xyXG4gIH1cclxuICBnZXQgdmlldygpIHtcclxuICAgIHJldHVybiB0aGlzLmJ1ZmZlci52aWV3O1xyXG4gIH1cclxuICB3cml0ZVVJbnQ4QXJyYXkodmFsdWUpIHtcclxuICAgIGNvbnN0IGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDQgKyBsZW5ndGgpO1xyXG4gICAgdGhpcy53cml0ZVUzMihsZW5ndGgpO1xyXG4gICAgbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIuYnVmZmVyLCB0aGlzLm9mZnNldCkuc2V0KHZhbHVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IGxlbmd0aDtcclxuICB9XHJcbiAgd3JpdGVCb29sKHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxKTtcclxuICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLm9mZnNldCwgdmFsdWUgPyAxIDogMCk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxO1xyXG4gIH1cclxuICB3cml0ZUJ5dGUodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDEpO1xyXG4gICAgdGhpcy52aWV3LnNldFVpbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxO1xyXG4gIH1cclxuICB3cml0ZUk4KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxKTtcclxuICAgIHRoaXMudmlldy5zZXRJbnQ4KHRoaXMub2Zmc2V0LCB2YWx1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxO1xyXG4gIH1cclxuICB3cml0ZVU4KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxKTtcclxuICAgIHRoaXMudmlldy5zZXRVaW50OCh0aGlzLm9mZnNldCwgdmFsdWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMTtcclxuICB9XHJcbiAgd3JpdGVJMTYodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDIpO1xyXG4gICAgdGhpcy52aWV3LnNldEludDE2KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAyO1xyXG4gIH1cclxuICB3cml0ZVUxNih2YWx1ZSkge1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMik7XHJcbiAgICB0aGlzLnZpZXcuc2V0VWludDE2KHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAyO1xyXG4gIH1cclxuICB3cml0ZUkzMih2YWx1ZSkge1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoNCk7XHJcbiAgICB0aGlzLnZpZXcuc2V0SW50MzIodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XHJcbiAgfVxyXG4gIHdyaXRlVTMyKHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig0KTtcclxuICAgIHRoaXMudmlldy5zZXRVaW50MzIodGhpcy5vZmZzZXQsIHZhbHVlLCB0cnVlKTtcclxuICAgIHRoaXMub2Zmc2V0ICs9IDQ7XHJcbiAgfVxyXG4gIHdyaXRlSTY0KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig4KTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdJbnQ2NCh0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gODtcclxuICB9XHJcbiAgd3JpdGVVNjQodmFsdWUpIHtcclxuICAgIHRoaXMuZXhwYW5kQnVmZmVyKDgpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gODtcclxuICB9XHJcbiAgd3JpdGVVMTI4KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxNik7XHJcbiAgICBjb25zdCBsb3dlclBhcnQgPSB2YWx1ZSAmIEJpZ0ludChcIjB4RkZGRkZGRkZGRkZGRkZGRlwiKTtcclxuICAgIGNvbnN0IHVwcGVyUGFydCA9IHZhbHVlID4+IEJpZ0ludCg2NCk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0LCBsb3dlclBhcnQsIHRydWUpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDgsIHVwcGVyUGFydCwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAxNjtcclxuICB9XHJcbiAgd3JpdGVJMTI4KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigxNik7XHJcbiAgICBjb25zdCBsb3dlclBhcnQgPSB2YWx1ZSAmIEJpZ0ludChcIjB4RkZGRkZGRkZGRkZGRkZGRlwiKTtcclxuICAgIGNvbnN0IHVwcGVyUGFydCA9IHZhbHVlID4+IEJpZ0ludCg2NCk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQsIGxvd2VyUGFydCwgdHJ1ZSk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQgKyA4LCB1cHBlclBhcnQsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMTY7XHJcbiAgfVxyXG4gIHdyaXRlVTI1Nih2YWx1ZSkge1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoMzIpO1xyXG4gICAgY29uc3QgbG93XzY0X21hc2sgPSBCaWdJbnQoXCIweEZGRkZGRkZGRkZGRkZGRkZcIik7XHJcbiAgICBjb25zdCBwMCA9IHZhbHVlICYgbG93XzY0X21hc2s7XHJcbiAgICBjb25zdCBwMSA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDEpICYgbG93XzY0X21hc2s7XHJcbiAgICBjb25zdCBwMiA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDIpICYgbG93XzY0X21hc2s7XHJcbiAgICBjb25zdCBwMyA9IHZhbHVlID4+IEJpZ0ludCg2NCAqIDMpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAwLCBwMCwgdHJ1ZSk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDEsIHAxLCB0cnVlKTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMiwgcDIsIHRydWUpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAzLCBwMywgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSAzMjtcclxuICB9XHJcbiAgd3JpdGVJMjU2KHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcigzMik7XHJcbiAgICBjb25zdCBsb3dfNjRfbWFzayA9IEJpZ0ludChcIjB4RkZGRkZGRkZGRkZGRkZGRlwiKTtcclxuICAgIGNvbnN0IHAwID0gdmFsdWUgJiBsb3dfNjRfbWFzaztcclxuICAgIGNvbnN0IHAxID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMSkgJiBsb3dfNjRfbWFzaztcclxuICAgIGNvbnN0IHAyID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMikgJiBsb3dfNjRfbWFzaztcclxuICAgIGNvbnN0IHAzID0gdmFsdWUgPj4gQmlnSW50KDY0ICogMyk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnVWludDY0KHRoaXMub2Zmc2V0ICsgOCAqIDAsIHAwLCB0cnVlKTtcclxuICAgIHRoaXMudmlldy5zZXRCaWdVaW50NjQodGhpcy5vZmZzZXQgKyA4ICogMSwgcDEsIHRydWUpO1xyXG4gICAgdGhpcy52aWV3LnNldEJpZ1VpbnQ2NCh0aGlzLm9mZnNldCArIDggKiAyLCBwMiwgdHJ1ZSk7XHJcbiAgICB0aGlzLnZpZXcuc2V0QmlnSW50NjQodGhpcy5vZmZzZXQgKyA4ICogMywgcDMsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gMzI7XHJcbiAgfVxyXG4gIHdyaXRlRjMyKHZhbHVlKSB7XHJcbiAgICB0aGlzLmV4cGFuZEJ1ZmZlcig0KTtcclxuICAgIHRoaXMudmlldy5zZXRGbG9hdDMyKHRoaXMub2Zmc2V0LCB2YWx1ZSwgdHJ1ZSk7XHJcbiAgICB0aGlzLm9mZnNldCArPSA0O1xyXG4gIH1cclxuICB3cml0ZUY2NCh2YWx1ZSkge1xyXG4gICAgdGhpcy5leHBhbmRCdWZmZXIoOCk7XHJcbiAgICB0aGlzLnZpZXcuc2V0RmxvYXQ2NCh0aGlzLm9mZnNldCwgdmFsdWUsIHRydWUpO1xyXG4gICAgdGhpcy5vZmZzZXQgKz0gODtcclxuICB9XHJcbiAgd3JpdGVTdHJpbmcodmFsdWUpIHtcclxuICAgIGNvbnN0IGVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcclxuICAgIGNvbnN0IGVuY29kZWRTdHJpbmcgPSBlbmNvZGVyLmVuY29kZSh2YWx1ZSk7XHJcbiAgICB0aGlzLndyaXRlVUludDhBcnJheShlbmNvZGVkU3RyaW5nKTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL3V0aWwudHNcclxuZnVuY3Rpb24gdWludDhBcnJheVRvSGV4U3RyaW5nKGFycmF5KSB7XHJcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChhcnJheS5yZXZlcnNlKCksICh4KSA9PiAoXCIwMFwiICsgeC50b1N0cmluZygxNikpLnNsaWNlKC0yKSkuam9pbihcIlwiKTtcclxufVxyXG5mdW5jdGlvbiB1aW50OEFycmF5VG9VMTI4KGFycmF5KSB7XHJcbiAgaWYgKGFycmF5Lmxlbmd0aCAhPSAxNikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBVaW50OEFycmF5IGlzIG5vdCAxNiBieXRlcyBsb25nOiAke2FycmF5fWApO1xyXG4gIH1cclxuICByZXR1cm4gbmV3IEJpbmFyeVJlYWRlcihhcnJheSkucmVhZFUxMjgoKTtcclxufVxyXG5mdW5jdGlvbiB1aW50OEFycmF5VG9VMjU2KGFycmF5KSB7XHJcbiAgaWYgKGFycmF5Lmxlbmd0aCAhPSAzMikge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBVaW50OEFycmF5IGlzIG5vdCAzMiBieXRlcyBsb25nOiBbJHthcnJheX1dYCk7XHJcbiAgfVxyXG4gIHJldHVybiBuZXcgQmluYXJ5UmVhZGVyKGFycmF5KS5yZWFkVTI1NigpO1xyXG59XHJcbmZ1bmN0aW9uIGhleFN0cmluZ1RvVWludDhBcnJheShzdHIpIHtcclxuICBpZiAoc3RyLnN0YXJ0c1dpdGgoXCIweFwiKSkge1xyXG4gICAgc3RyID0gc3RyLnNsaWNlKDIpO1xyXG4gIH1cclxuICBjb25zdCBtYXRjaGVzID0gc3RyLm1hdGNoKC8uezEsMn0vZykgfHwgW107XHJcbiAgY29uc3QgZGF0YSA9IFVpbnQ4QXJyYXkuZnJvbShcclxuICAgIG1hdGNoZXMubWFwKChieXRlKSA9PiBwYXJzZUludChieXRlLCAxNikpXHJcbiAgKTtcclxuICByZXR1cm4gZGF0YS5yZXZlcnNlKCk7XHJcbn1cclxuZnVuY3Rpb24gaGV4U3RyaW5nVG9VMTI4KHN0cikge1xyXG4gIHJldHVybiB1aW50OEFycmF5VG9VMTI4KGhleFN0cmluZ1RvVWludDhBcnJheShzdHIpKTtcclxufVxyXG5mdW5jdGlvbiBoZXhTdHJpbmdUb1UyNTYoc3RyKSB7XHJcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb1UyNTYoaGV4U3RyaW5nVG9VaW50OEFycmF5KHN0cikpO1xyXG59XHJcbmZ1bmN0aW9uIHUxMjhUb1VpbnQ4QXJyYXkoZGF0YSkge1xyXG4gIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTYpO1xyXG4gIHdyaXRlci53cml0ZVUxMjgoZGF0YSk7XHJcbiAgcmV0dXJuIHdyaXRlci5nZXRCdWZmZXIoKTtcclxufVxyXG5mdW5jdGlvbiB1MTI4VG9IZXhTdHJpbmcoZGF0YSkge1xyXG4gIHJldHVybiB1aW50OEFycmF5VG9IZXhTdHJpbmcodTEyOFRvVWludDhBcnJheShkYXRhKSk7XHJcbn1cclxuZnVuY3Rpb24gdTI1NlRvVWludDhBcnJheShkYXRhKSB7XHJcbiAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigzMik7XHJcbiAgd3JpdGVyLndyaXRlVTI1NihkYXRhKTtcclxuICByZXR1cm4gd3JpdGVyLmdldEJ1ZmZlcigpO1xyXG59XHJcbmZ1bmN0aW9uIHUyNTZUb0hleFN0cmluZyhkYXRhKSB7XHJcbiAgcmV0dXJuIHVpbnQ4QXJyYXlUb0hleFN0cmluZyh1MjU2VG9VaW50OEFycmF5KGRhdGEpKTtcclxufVxyXG5mdW5jdGlvbiB0b1Bhc2NhbENhc2Uocykge1xyXG4gIGNvbnN0IHN0ciA9IHRvQ2FtZWxDYXNlKHMpO1xyXG4gIHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XHJcbn1cclxuZnVuY3Rpb24gdG9DYW1lbENhc2Uocykge1xyXG4gIGNvbnN0IHN0ciA9IHMucmVwbGFjZSgvWy1fXSsvZywgXCJfXCIpLnJlcGxhY2UoL18oW2EtekEtWjAtOV0pL2csIChfLCBjKSA9PiBjLnRvVXBwZXJDYXNlKCkpO1xyXG4gIHJldHVybiBzdHIuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7XHJcbn1cclxuZnVuY3Rpb24gYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIHR5KSB7XHJcbiAgY29uc3QgYXNzdW1lZEFycmF5TGVuZ3RoID0gNDtcclxuICB3aGlsZSAodHkudGFnID09PSBcIlJlZlwiKSB0eSA9IHR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XHJcbiAgaWYgKHR5LnRhZyA9PT0gXCJQcm9kdWN0XCIpIHtcclxuICAgIGxldCBzdW0gPSAwO1xyXG4gICAgZm9yIChjb25zdCB7IGFsZ2VicmFpY1R5cGU6IGVsZW0gfSBvZiB0eS52YWx1ZS5lbGVtZW50cykge1xyXG4gICAgICBzdW0gKz0gYnNhdG5CYXNlU2l6ZSh0eXBlc3BhY2UsIGVsZW0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN1bTtcclxuICB9IGVsc2UgaWYgKHR5LnRhZyA9PT0gXCJTdW1cIikge1xyXG4gICAgbGV0IG1pbiA9IEluZmluaXR5O1xyXG4gICAgZm9yIChjb25zdCB7IGFsZ2VicmFpY1R5cGU6IHZhcmkgfSBvZiB0eS52YWx1ZS52YXJpYW50cykge1xyXG4gICAgICBjb25zdCB2U2l6ZSA9IGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCB2YXJpKTtcclxuICAgICAgaWYgKHZTaXplIDwgbWluKSBtaW4gPSB2U2l6ZTtcclxuICAgIH1cclxuICAgIGlmIChtaW4gPT09IEluZmluaXR5KSBtaW4gPSAwO1xyXG4gICAgcmV0dXJuIDQgKyBtaW47XHJcbiAgfSBlbHNlIGlmICh0eS50YWcgPT0gXCJBcnJheVwiKSB7XHJcbiAgICByZXR1cm4gNCArIGFzc3VtZWRBcnJheUxlbmd0aCAqIGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCB0eS52YWx1ZSk7XHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBTdHJpbmc6IDQgKyBhc3N1bWVkQXJyYXlMZW5ndGgsXHJcbiAgICBTdW06IDEsXHJcbiAgICBCb29sOiAxLFxyXG4gICAgSTg6IDEsXHJcbiAgICBVODogMSxcclxuICAgIEkxNjogMixcclxuICAgIFUxNjogMixcclxuICAgIEkzMjogNCxcclxuICAgIFUzMjogNCxcclxuICAgIEYzMjogNCxcclxuICAgIEk2NDogOCxcclxuICAgIFU2NDogOCxcclxuICAgIEY2NDogOCxcclxuICAgIEkxMjg6IDE2LFxyXG4gICAgVTEyODogMTYsXHJcbiAgICBJMjU2OiAzMixcclxuICAgIFUyNTY6IDMyXHJcbiAgfVt0eS50YWddO1xyXG59XHJcbnZhciBoYXNPd24gPSBPYmplY3QuaGFzT3duO1xyXG5cclxuLy8gc3JjL2xpYi9jb25uZWN0aW9uX2lkLnRzXHJcbnZhciBDb25uZWN0aW9uSWQgPSBjbGFzcyBfQ29ubmVjdGlvbklkIHtcclxuICBfX2Nvbm5lY3Rpb25faWRfXztcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBDb25uZWN0aW9uSWRgLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKGRhdGEpIHtcclxuICAgIHRoaXMuX19jb25uZWN0aW9uX2lkX18gPSBkYXRhO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBHZXQgdGhlIGFsZ2VicmFpYyB0eXBlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB7QGxpbmsgQ29ubmVjdGlvbklkfSB0eXBlLlxyXG4gICAqIEByZXR1cm5zIFRoZSBhbGdlYnJhaWMgdHlwZSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHlwZS5cclxuICAgKi9cclxuICBzdGF0aWMgZ2V0QWxnZWJyYWljVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xyXG4gICAgICBlbGVtZW50czogW1xyXG4gICAgICAgIHsgbmFtZTogXCJfX2Nvbm5lY3Rpb25faWRfX1wiLCBhbGdlYnJhaWNUeXBlOiBBbGdlYnJhaWNUeXBlLlUxMjggfVxyXG4gICAgICBdXHJcbiAgICB9KTtcclxuICB9XHJcbiAgaXNaZXJvKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX19jb25uZWN0aW9uX2lkX18gPT09IEJpZ0ludCgwKTtcclxuICB9XHJcbiAgc3RhdGljIG51bGxJZlplcm8oYWRkcikge1xyXG4gICAgaWYgKGFkZHIuaXNaZXJvKCkpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gYWRkcjtcclxuICAgIH1cclxuICB9XHJcbiAgc3RhdGljIHJhbmRvbSgpIHtcclxuICAgIGZ1bmN0aW9uIHJhbmRvbVU4KCkge1xyXG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjU1KTtcclxuICAgIH1cclxuICAgIGxldCByZXN1bHQgPSBCaWdJbnQoMCk7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2OyBpKyspIHtcclxuICAgICAgcmVzdWx0ID0gcmVzdWx0IDw8IEJpZ0ludCg4KSB8IEJpZ0ludChyYW5kb21VOCgpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZChyZXN1bHQpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBDb21wYXJlIHR3byBjb25uZWN0aW9uIElEcyBmb3IgZXF1YWxpdHkuXHJcbiAgICovXHJcbiAgaXNFcXVhbChvdGhlcikge1xyXG4gICAgcmV0dXJuIHRoaXMuX19jb25uZWN0aW9uX2lkX18gPT0gb3RoZXIuX19jb25uZWN0aW9uX2lkX187XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENoZWNrIGlmIHR3byBjb25uZWN0aW9uIElEcyBhcmUgZXF1YWwuXHJcbiAgICovXHJcbiAgZXF1YWxzKG90aGVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0VxdWFsKG90aGVyKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUHJpbnQgdGhlIGNvbm5lY3Rpb24gSUQgYXMgYSBoZXhhZGVjaW1hbCBzdHJpbmcuXHJcbiAgICovXHJcbiAgdG9IZXhTdHJpbmcoKSB7XHJcbiAgICByZXR1cm4gdTEyOFRvSGV4U3RyaW5nKHRoaXMuX19jb25uZWN0aW9uX2lkX18pO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBDb252ZXJ0IHRoZSBjb25uZWN0aW9uIElEIHRvIGEgVWludDhBcnJheS5cclxuICAgKi9cclxuICB0b1VpbnQ4QXJyYXkoKSB7XHJcbiAgICByZXR1cm4gdTEyOFRvVWludDhBcnJheSh0aGlzLl9fY29ubmVjdGlvbl9pZF9fKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUGFyc2UgYSBjb25uZWN0aW9uIElEIGZyb20gYSBoZXhhZGVjaW1hbCBzdHJpbmcuXHJcbiAgICovXHJcbiAgc3RhdGljIGZyb21TdHJpbmcoc3RyKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWQoaGV4U3RyaW5nVG9VMTI4KHN0cikpO1xyXG4gIH1cclxuICBzdGF0aWMgZnJvbVN0cmluZ09yTnVsbChzdHIpIHtcclxuICAgIGNvbnN0IGFkZHIgPSBfQ29ubmVjdGlvbklkLmZyb21TdHJpbmcoc3RyKTtcclxuICAgIGlmIChhZGRyLmlzWmVybygpKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGFkZHI7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL2xpYi9pZGVudGl0eS50c1xyXG52YXIgSWRlbnRpdHkgPSBjbGFzcyBfSWRlbnRpdHkge1xyXG4gIF9faWRlbnRpdHlfXztcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBJZGVudGl0eWAuXHJcbiAgICpcclxuICAgKiBgZGF0YWAgY2FuIGJlIGEgaGV4YWRlY2ltYWwgc3RyaW5nIG9yIGEgYGJpZ2ludGAuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgdGhpcy5fX2lkZW50aXR5X18gPSB0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIiA/IGhleFN0cmluZ1RvVTI1NihkYXRhKSA6IGRhdGE7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHtAbGluayBJZGVudGl0eX0gdHlwZS5cclxuICAgKiBAcmV0dXJucyBUaGUgYWxnZWJyYWljIHR5cGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIHR5cGUuXHJcbiAgICovXHJcbiAgc3RhdGljIGdldEFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHtcclxuICAgICAgZWxlbWVudHM6IFt7IG5hbWU6IFwiX19pZGVudGl0eV9fXCIsIGFsZ2VicmFpY1R5cGU6IEFsZ2VicmFpY1R5cGUuVTI1NiB9XVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENoZWNrIGlmIHR3byBpZGVudGl0aWVzIGFyZSBlcXVhbC5cclxuICAgKi9cclxuICBpc0VxdWFsKG90aGVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b0hleFN0cmluZygpID09PSBvdGhlci50b0hleFN0cmluZygpO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBDaGVjayBpZiB0d28gaWRlbnRpdGllcyBhcmUgZXF1YWwuXHJcbiAgICovXHJcbiAgZXF1YWxzKG90aGVyKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0VxdWFsKG90aGVyKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUHJpbnQgdGhlIGlkZW50aXR5IGFzIGEgaGV4YWRlY2ltYWwgc3RyaW5nLlxyXG4gICAqL1xyXG4gIHRvSGV4U3RyaW5nKCkge1xyXG4gICAgcmV0dXJuIHUyNTZUb0hleFN0cmluZyh0aGlzLl9faWRlbnRpdHlfXyk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgdGhlIGFkZHJlc3MgdG8gYSBVaW50OEFycmF5LlxyXG4gICAqL1xyXG4gIHRvVWludDhBcnJheSgpIHtcclxuICAgIHJldHVybiB1MjU2VG9VaW50OEFycmF5KHRoaXMuX19pZGVudGl0eV9fKTtcclxuICB9XHJcbiAgLyoqXHJcbiAgICogUGFyc2UgYW4gSWRlbnRpdHkgZnJvbSBhIGhleGFkZWNpbWFsIHN0cmluZy5cclxuICAgKi9cclxuICBzdGF0aWMgZnJvbVN0cmluZyhzdHIpIHtcclxuICAgIHJldHVybiBuZXcgX0lkZW50aXR5KHN0cik7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFplcm8gaWRlbnRpdHkgKDB4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMClcclxuICAgKi9cclxuICBzdGF0aWMgemVybygpIHtcclxuICAgIHJldHVybiBuZXcgX0lkZW50aXR5KDBuKTtcclxuICB9XHJcbiAgdG9TdHJpbmcoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b0hleFN0cmluZygpO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvYWxnZWJyYWljX3R5cGUudHNcclxudmFyIFNFUklBTElaRVJTID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcclxudmFyIERFU0VSSUFMSVpFUlMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xyXG52YXIgQWxnZWJyYWljVHlwZSA9IHtcclxuICBSZWY6ICh2YWx1ZSkgPT4gKHsgdGFnOiBcIlJlZlwiLCB2YWx1ZSB9KSxcclxuICBTdW06ICh2YWx1ZSkgPT4gKHtcclxuICAgIHRhZzogXCJTdW1cIixcclxuICAgIHZhbHVlXHJcbiAgfSksXHJcbiAgUHJvZHVjdDogKHZhbHVlKSA9PiAoe1xyXG4gICAgdGFnOiBcIlByb2R1Y3RcIixcclxuICAgIHZhbHVlXHJcbiAgfSksXHJcbiAgQXJyYXk6ICh2YWx1ZSkgPT4gKHtcclxuICAgIHRhZzogXCJBcnJheVwiLFxyXG4gICAgdmFsdWVcclxuICB9KSxcclxuICBTdHJpbmc6IHsgdGFnOiBcIlN0cmluZ1wiIH0sXHJcbiAgQm9vbDogeyB0YWc6IFwiQm9vbFwiIH0sXHJcbiAgSTg6IHsgdGFnOiBcIkk4XCIgfSxcclxuICBVODogeyB0YWc6IFwiVThcIiB9LFxyXG4gIEkxNjogeyB0YWc6IFwiSTE2XCIgfSxcclxuICBVMTY6IHsgdGFnOiBcIlUxNlwiIH0sXHJcbiAgSTMyOiB7IHRhZzogXCJJMzJcIiB9LFxyXG4gIFUzMjogeyB0YWc6IFwiVTMyXCIgfSxcclxuICBJNjQ6IHsgdGFnOiBcIkk2NFwiIH0sXHJcbiAgVTY0OiB7IHRhZzogXCJVNjRcIiB9LFxyXG4gIEkxMjg6IHsgdGFnOiBcIkkxMjhcIiB9LFxyXG4gIFUxMjg6IHsgdGFnOiBcIlUxMjhcIiB9LFxyXG4gIEkyNTY6IHsgdGFnOiBcIkkyNTZcIiB9LFxyXG4gIFUyNTY6IHsgdGFnOiBcIlUyNTZcIiB9LFxyXG4gIEYzMjogeyB0YWc6IFwiRjMyXCIgfSxcclxuICBGNjQ6IHsgdGFnOiBcIkY2NFwiIH0sXHJcbiAgbWFrZVNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xyXG4gICAgaWYgKHR5LnRhZyA9PT0gXCJSZWZcIikge1xyXG4gICAgICBpZiAoIXR5cGVzcGFjZSlcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3Qgc2VyaWFsaXplIHJlZnMgd2l0aG91dCBhIHR5cGVzcGFjZVwiKTtcclxuICAgICAgd2hpbGUgKHR5LnRhZyA9PT0gXCJSZWZcIikgdHkgPSB0eXBlc3BhY2UudHlwZXNbdHkudmFsdWVdO1xyXG4gICAgfVxyXG4gICAgc3dpdGNoICh0eS50YWcpIHtcclxuICAgICAgY2FzZSBcIlByb2R1Y3RcIjpcclxuICAgICAgICByZXR1cm4gUHJvZHVjdFR5cGUubWFrZVNlcmlhbGl6ZXIodHkudmFsdWUsIHR5cGVzcGFjZSk7XHJcbiAgICAgIGNhc2UgXCJTdW1cIjpcclxuICAgICAgICByZXR1cm4gU3VtVHlwZS5tYWtlU2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcclxuICAgICAgY2FzZSBcIkFycmF5XCI6XHJcbiAgICAgICAgaWYgKHR5LnZhbHVlLnRhZyA9PT0gXCJVOFwiKSB7XHJcbiAgICAgICAgICByZXR1cm4gc2VyaWFsaXplVWludDhBcnJheTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY29uc3Qgc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcclxuICAgICAgICAgIHJldHVybiAod3JpdGVyLCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgICB3cml0ZXIud3JpdGVVMzIodmFsdWUubGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBlbGVtIG9mIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgc2VyaWFsaXplKHdyaXRlciwgZWxlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHJldHVybiBwcmltaXRpdmVTZXJpYWxpemVyc1t0eS50YWddO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZVNlcmlhbGl6ZXJgIGluc3RlYWQuICovXHJcbiAgc2VyaWFsaXplVmFsdWUod3JpdGVyLCB0eSwgdmFsdWUsIHR5cGVzcGFjZSkge1xyXG4gICAgQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSh3cml0ZXIsIHZhbHVlKTtcclxuICB9LFxyXG4gIG1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkge1xyXG4gICAgaWYgKHR5LnRhZyA9PT0gXCJSZWZcIikge1xyXG4gICAgICBpZiAoIXR5cGVzcGFjZSlcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3QgZGVzZXJpYWxpemUgcmVmcyB3aXRob3V0IGEgdHlwZXNwYWNlXCIpO1xyXG4gICAgICB3aGlsZSAodHkudGFnID09PSBcIlJlZlwiKSB0eSA9IHR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XHJcbiAgICB9XHJcbiAgICBzd2l0Y2ggKHR5LnRhZykge1xyXG4gICAgICBjYXNlIFwiUHJvZHVjdFwiOlxyXG4gICAgICAgIHJldHVybiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LnZhbHVlLCB0eXBlc3BhY2UpO1xyXG4gICAgICBjYXNlIFwiU3VtXCI6XHJcbiAgICAgICAgcmV0dXJuIFN1bVR5cGUubWFrZURlc2VyaWFsaXplcih0eS52YWx1ZSwgdHlwZXNwYWNlKTtcclxuICAgICAgY2FzZSBcIkFycmF5XCI6XHJcbiAgICAgICAgaWYgKHR5LnZhbHVlLnRhZyA9PT0gXCJVOFwiKSB7XHJcbiAgICAgICAgICByZXR1cm4gZGVzZXJpYWxpemVVaW50OEFycmF5O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zdCBkZXNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcclxuICAgICAgICAgICAgdHkudmFsdWUsXHJcbiAgICAgICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHJldHVybiAocmVhZGVyKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IHJlYWRlci5yZWFkVTMyKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICByZXN1bHRbaV0gPSBkZXNlcmlhbGl6ZShyZWFkZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICByZXR1cm4gcHJpbWl0aXZlRGVzZXJpYWxpemVyc1t0eS50YWddO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLyoqIEBkZXByZWNhdGVkIFVzZSBgbWFrZURlc2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cclxuICBkZXNlcmlhbGl6ZVZhbHVlKHJlYWRlciwgdHksIHR5cGVzcGFjZSkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKShyZWFkZXIpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBhIHZhbHVlIG9mIHRoZSBhbGdlYnJhaWMgdHlwZSBpbnRvIHNvbWV0aGluZyB0aGF0IGNhbiBiZSB1c2VkIGFzIGEga2V5IGluIGEgbWFwLlxyXG4gICAqIFRoZXJlIGFyZSBubyBndWFyYW50ZWVzIGFib3V0IGJlaW5nIGFibGUgdG8gb3JkZXIgaXQuXHJcbiAgICogVGhpcyBpcyBvbmx5IGd1YXJhbnRlZWQgdG8gYmUgY29tcGFyYWJsZSB0byBvdGhlciB2YWx1ZXMgb2YgdGhlIHNhbWUgdHlwZS5cclxuICAgKiBAcGFyYW0gdmFsdWUgQSB2YWx1ZSBvZiB0aGUgYWxnZWJyYWljIHR5cGVcclxuICAgKiBAcmV0dXJucyBTb21ldGhpbmcgdGhhdCBjYW4gYmUgdXNlZCBhcyBhIGtleSBpbiBhIG1hcC5cclxuICAgKi9cclxuICBpbnRvTWFwS2V5OiBmdW5jdGlvbih0eSwgdmFsdWUpIHtcclxuICAgIHN3aXRjaCAodHkudGFnKSB7XHJcbiAgICAgIGNhc2UgXCJVOFwiOlxyXG4gICAgICBjYXNlIFwiVTE2XCI6XHJcbiAgICAgIGNhc2UgXCJVMzJcIjpcclxuICAgICAgY2FzZSBcIlU2NFwiOlxyXG4gICAgICBjYXNlIFwiVTEyOFwiOlxyXG4gICAgICBjYXNlIFwiVTI1NlwiOlxyXG4gICAgICBjYXNlIFwiSThcIjpcclxuICAgICAgY2FzZSBcIkkxNlwiOlxyXG4gICAgICBjYXNlIFwiSTMyXCI6XHJcbiAgICAgIGNhc2UgXCJJNjRcIjpcclxuICAgICAgY2FzZSBcIkkxMjhcIjpcclxuICAgICAgY2FzZSBcIkkyNTZcIjpcclxuICAgICAgY2FzZSBcIkYzMlwiOlxyXG4gICAgICBjYXNlIFwiRjY0XCI6XHJcbiAgICAgIGNhc2UgXCJTdHJpbmdcIjpcclxuICAgICAgY2FzZSBcIkJvb2xcIjpcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgIGNhc2UgXCJQcm9kdWN0XCI6XHJcbiAgICAgICAgcmV0dXJuIFByb2R1Y3RUeXBlLmludG9NYXBLZXkodHkudmFsdWUsIHZhbHVlKTtcclxuICAgICAgZGVmYXVsdDoge1xyXG4gICAgICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTApO1xyXG4gICAgICAgIEFsZ2VicmFpY1R5cGUuc2VyaWFsaXplVmFsdWUod3JpdGVyLCB0eSwgdmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB3cml0ZXIudG9CYXNlNjQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufTtcclxuZnVuY3Rpb24gYmluZENhbGwoZikge1xyXG4gIHJldHVybiBGdW5jdGlvbi5wcm90b3R5cGUuY2FsbC5iaW5kKGYpO1xyXG59XHJcbnZhciBwcmltaXRpdmVTZXJpYWxpemVycyA9IHtcclxuICBCb29sOiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlQm9vbCksXHJcbiAgSTg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJOCksXHJcbiAgVTg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVOCksXHJcbiAgSTE2OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTE2KSxcclxuICBVMTY6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMTYpLFxyXG4gIEkzMjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUkzMiksXHJcbiAgVTMyOiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlVTMyKSxcclxuICBJNjQ6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVJNjQpLFxyXG4gIFU2NDogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVU2NCksXHJcbiAgSTEyODogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUkxMjgpLFxyXG4gIFUxMjg6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVMTI4KSxcclxuICBJMjU2OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlSTI1NiksXHJcbiAgVTI1NjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZVUyNTYpLFxyXG4gIEYzMjogYmluZENhbGwoQmluYXJ5V3JpdGVyLnByb3RvdHlwZS53cml0ZUYzMiksXHJcbiAgRjY0OiBiaW5kQ2FsbChCaW5hcnlXcml0ZXIucHJvdG90eXBlLndyaXRlRjY0KSxcclxuICBTdHJpbmc6IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVTdHJpbmcpXHJcbn07XHJcbk9iamVjdC5mcmVlemUocHJpbWl0aXZlU2VyaWFsaXplcnMpO1xyXG52YXIgc2VyaWFsaXplVWludDhBcnJheSA9IGJpbmRDYWxsKEJpbmFyeVdyaXRlci5wcm90b3R5cGUud3JpdGVVSW50OEFycmF5KTtcclxudmFyIHByaW1pdGl2ZURlc2VyaWFsaXplcnMgPSB7XHJcbiAgQm9vbDogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkQm9vbCksXHJcbiAgSTg6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEk4KSxcclxuICBVODogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTgpLFxyXG4gIEkxNjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkSTE2KSxcclxuICBVMTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFUxNiksXHJcbiAgSTMyOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRJMzIpLFxyXG4gIFUzMjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkVTMyKSxcclxuICBJNjQ6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEk2NCksXHJcbiAgVTY0OiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVNjQpLFxyXG4gIEkxMjg6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEkxMjgpLFxyXG4gIFUxMjg6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFUxMjgpLFxyXG4gIEkyNTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEkyNTYpLFxyXG4gIFUyNTY6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZFUyNTYpLFxyXG4gIEYzMjogYmluZENhbGwoQmluYXJ5UmVhZGVyLnByb3RvdHlwZS5yZWFkRjMyKSxcclxuICBGNjQ6IGJpbmRDYWxsKEJpbmFyeVJlYWRlci5wcm90b3R5cGUucmVhZEY2NCksXHJcbiAgU3RyaW5nOiBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRTdHJpbmcpXHJcbn07XHJcbk9iamVjdC5mcmVlemUocHJpbWl0aXZlRGVzZXJpYWxpemVycyk7XHJcbnZhciBkZXNlcmlhbGl6ZVVpbnQ4QXJyYXkgPSBiaW5kQ2FsbChCaW5hcnlSZWFkZXIucHJvdG90eXBlLnJlYWRVSW50OEFycmF5KTtcclxudmFyIHByaW1pdGl2ZVNpemVzID0ge1xyXG4gIEJvb2w6IDEsXHJcbiAgSTg6IDEsXHJcbiAgVTg6IDEsXHJcbiAgSTE2OiAyLFxyXG4gIFUxNjogMixcclxuICBJMzI6IDQsXHJcbiAgVTMyOiA0LFxyXG4gIEk2NDogOCxcclxuICBVNjQ6IDgsXHJcbiAgSTEyODogMTYsXHJcbiAgVTEyODogMTYsXHJcbiAgSTI1NjogMzIsXHJcbiAgVTI1NjogMzIsXHJcbiAgRjMyOiA0LFxyXG4gIEY2NDogOFxyXG59O1xyXG52YXIgZml4ZWRTaXplUHJpbWl0aXZlcyA9IG5ldyBTZXQoT2JqZWN0LmtleXMocHJpbWl0aXZlU2l6ZXMpKTtcclxudmFyIGlzRml4ZWRTaXplUHJvZHVjdCA9ICh0eSkgPT4gdHkuZWxlbWVudHMuZXZlcnkoXHJcbiAgKHsgYWxnZWJyYWljVHlwZSB9KSA9PiBmaXhlZFNpemVQcmltaXRpdmVzLmhhcyhhbGdlYnJhaWNUeXBlLnRhZylcclxuKTtcclxudmFyIHByb2R1Y3RTaXplID0gKHR5KSA9PiB0eS5lbGVtZW50cy5yZWR1Y2UoXHJcbiAgKGFjYywgeyBhbGdlYnJhaWNUeXBlIH0pID0+IGFjYyArIHByaW1pdGl2ZVNpemVzW2FsZ2VicmFpY1R5cGUudGFnXSxcclxuICAwXHJcbik7XHJcbnZhciBwcmltaXRpdmVKU05hbWUgPSB7XHJcbiAgQm9vbDogXCJVaW50OFwiLFxyXG4gIEk4OiBcIkludDhcIixcclxuICBVODogXCJVaW50OFwiLFxyXG4gIEkxNjogXCJJbnQxNlwiLFxyXG4gIFUxNjogXCJVaW50MTZcIixcclxuICBJMzI6IFwiSW50MzJcIixcclxuICBVMzI6IFwiVWludDMyXCIsXHJcbiAgSTY0OiBcIkJpZ0ludDY0XCIsXHJcbiAgVTY0OiBcIkJpZ1VpbnQ2NFwiLFxyXG4gIEYzMjogXCJGbG9hdDMyXCIsXHJcbiAgRjY0OiBcIkZsb2F0NjRcIlxyXG59O1xyXG52YXIgc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzID0ge1xyXG4gIF9fdGltZV9kdXJhdGlvbl9taWNyb3NfXzogKHJlYWRlcikgPT4gbmV3IFRpbWVEdXJhdGlvbihyZWFkZXIucmVhZEk2NCgpKSxcclxuICBfX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fOiAocmVhZGVyKSA9PiBuZXcgVGltZXN0YW1wKHJlYWRlci5yZWFkSTY0KCkpLFxyXG4gIF9faWRlbnRpdHlfXzogKHJlYWRlcikgPT4gbmV3IElkZW50aXR5KHJlYWRlci5yZWFkVTI1NigpKSxcclxuICBfX2Nvbm5lY3Rpb25faWRfXzogKHJlYWRlcikgPT4gbmV3IENvbm5lY3Rpb25JZChyZWFkZXIucmVhZFUxMjgoKSksXHJcbiAgX191dWlkX186IChyZWFkZXIpID0+IG5ldyBVdWlkKHJlYWRlci5yZWFkVTEyOCgpKVxyXG59O1xyXG5PYmplY3QuZnJlZXplKHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVycyk7XHJcbnZhciB1bml0RGVzZXJpYWxpemVyID0gKCkgPT4gKHt9KTtcclxudmFyIGdldEVsZW1lbnRJbml0aWFsaXplciA9IChlbGVtZW50KSA9PiB7XHJcbiAgbGV0IGluaXQ7XHJcbiAgc3dpdGNoIChlbGVtZW50LmFsZ2VicmFpY1R5cGUudGFnKSB7XHJcbiAgICBjYXNlIFwiU3RyaW5nXCI6XHJcbiAgICAgIGluaXQgPSBcIicnXCI7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBcIkJvb2xcIjpcclxuICAgICAgaW5pdCA9IFwiZmFsc2VcIjtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIFwiSThcIjpcclxuICAgIGNhc2UgXCJVOFwiOlxyXG4gICAgY2FzZSBcIkkxNlwiOlxyXG4gICAgY2FzZSBcIlUxNlwiOlxyXG4gICAgY2FzZSBcIkkzMlwiOlxyXG4gICAgY2FzZSBcIlUzMlwiOlxyXG4gICAgICBpbml0ID0gXCIwXCI7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSBcIkk2NFwiOlxyXG4gICAgY2FzZSBcIlU2NFwiOlxyXG4gICAgY2FzZSBcIkkxMjhcIjpcclxuICAgIGNhc2UgXCJVMTI4XCI6XHJcbiAgICBjYXNlIFwiSTI1NlwiOlxyXG4gICAgY2FzZSBcIlUyNTZcIjpcclxuICAgICAgaW5pdCA9IFwiMG5cIjtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIFwiRjMyXCI6XHJcbiAgICBjYXNlIFwiRjY0XCI6XHJcbiAgICAgIGluaXQgPSBcIjAuMFwiO1xyXG4gICAgICBicmVhaztcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGluaXQgPSBcInVuZGVmaW5lZFwiO1xyXG4gIH1cclxuICByZXR1cm4gYCR7ZWxlbWVudC5uYW1lfTogJHtpbml0fWA7XHJcbn07XHJcbnZhciBQcm9kdWN0VHlwZSA9IHtcclxuICBtYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XHJcbiAgICBsZXQgc2VyaWFsaXplciA9IFNFUklBTElaRVJTLmdldCh0eSk7XHJcbiAgICBpZiAoc2VyaWFsaXplciAhPSBudWxsKSByZXR1cm4gc2VyaWFsaXplcjtcclxuICAgIGlmIChpc0ZpeGVkU2l6ZVByb2R1Y3QodHkpKSB7XHJcbiAgICAgIGNvbnN0IHNpemUgPSBwcm9kdWN0U2l6ZSh0eSk7XHJcbiAgICAgIGNvbnN0IGJvZHkyID0gYFwidXNlIHN0cmljdFwiO1xyXG53cml0ZXIuZXhwYW5kQnVmZmVyKCR7c2l6ZX0pO1xyXG5jb25zdCB2aWV3ID0gd3JpdGVyLnZpZXc7XHJcbiR7dHkuZWxlbWVudHMubWFwKFxyXG4gICAgICAgICh7IG5hbWUsIGFsZ2VicmFpY1R5cGU6IHsgdGFnIH0gfSkgPT4gdGFnIGluIHByaW1pdGl2ZUpTTmFtZSA/IGB2aWV3LnNldCR7cHJpbWl0aXZlSlNOYW1lW3RhZ119KHdyaXRlci5vZmZzZXQsIHZhbHVlLiR7bmFtZX0sICR7cHJpbWl0aXZlU2l6ZXNbdGFnXSA+IDEgPyBcInRydWVcIiA6IFwiXCJ9KTtcclxud3JpdGVyLm9mZnNldCArPSAke3ByaW1pdGl2ZVNpemVzW3RhZ119O2AgOiBgd3JpdGVyLndyaXRlJHt0YWd9KHZhbHVlLiR7bmFtZX0pO2BcclxuICAgICAgKS5qb2luKFwiXFxuXCIpfWA7XHJcbiAgICAgIHNlcmlhbGl6ZXIgPSBGdW5jdGlvbihcIndyaXRlclwiLCBcInZhbHVlXCIsIGJvZHkyKTtcclxuICAgICAgU0VSSUFMSVpFUlMuc2V0KHR5LCBzZXJpYWxpemVyKTtcclxuICAgICAgcmV0dXJuIHNlcmlhbGl6ZXI7XHJcbiAgICB9XHJcbiAgICBjb25zdCBzZXJpYWxpemVycyA9IHt9O1xyXG4gICAgY29uc3QgYm9keSA9ICdcInVzZSBzdHJpY3RcIjtcXG4nICsgdHkuZWxlbWVudHMubWFwKFxyXG4gICAgICAoZWxlbWVudCkgPT4gYHRoaXMuJHtlbGVtZW50Lm5hbWV9KHdyaXRlciwgdmFsdWUuJHtlbGVtZW50Lm5hbWV9KTtgXHJcbiAgICApLmpvaW4oXCJcXG5cIik7XHJcbiAgICBzZXJpYWxpemVyID0gRnVuY3Rpb24oXCJ3cml0ZXJcIiwgXCJ2YWx1ZVwiLCBib2R5KS5iaW5kKFxyXG4gICAgICBzZXJpYWxpemVyc1xyXG4gICAgKTtcclxuICAgIFNFUklBTElaRVJTLnNldCh0eSwgc2VyaWFsaXplcik7XHJcbiAgICBmb3IgKGNvbnN0IHsgbmFtZSwgYWxnZWJyYWljVHlwZSB9IG9mIHR5LmVsZW1lbnRzKSB7XHJcbiAgICAgIHNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcclxuICAgICAgICBhbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgT2JqZWN0LmZyZWV6ZShzZXJpYWxpemVycyk7XHJcbiAgICByZXR1cm4gc2VyaWFsaXplcjtcclxuICB9LFxyXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VTZXJpYWxpemVyYCBpbnN0ZWFkLiAqL1xyXG4gIHNlcmlhbGl6ZVZhbHVlKHdyaXRlciwgdHksIHZhbHVlLCB0eXBlc3BhY2UpIHtcclxuICAgIFByb2R1Y3RUeXBlLm1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHdyaXRlciwgdmFsdWUpO1xyXG4gIH0sXHJcbiAgbWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XHJcbiAgICBzd2l0Y2ggKHR5LmVsZW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICBjYXNlIDA6XHJcbiAgICAgICAgcmV0dXJuIHVuaXREZXNlcmlhbGl6ZXI7XHJcbiAgICAgIGNhc2UgMToge1xyXG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IHR5LmVsZW1lbnRzWzBdLm5hbWU7XHJcbiAgICAgICAgaWYgKGhhc093bihzcGVjaWFsUHJvZHVjdERlc2VyaWFsaXplcnMsIGZpZWxkTmFtZSkpXHJcbiAgICAgICAgICByZXR1cm4gc3BlY2lhbFByb2R1Y3REZXNlcmlhbGl6ZXJzW2ZpZWxkTmFtZV07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGxldCBkZXNlcmlhbGl6ZXIgPSBERVNFUklBTElaRVJTLmdldCh0eSk7XHJcbiAgICBpZiAoZGVzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBkZXNlcmlhbGl6ZXI7XHJcbiAgICBpZiAoaXNGaXhlZFNpemVQcm9kdWN0KHR5KSkge1xyXG4gICAgICBjb25zdCBib2R5ID0gYFwidXNlIHN0cmljdFwiO1xyXG5jb25zdCByZXN1bHQgPSB7ICR7dHkuZWxlbWVudHMubWFwKGdldEVsZW1lbnRJbml0aWFsaXplcikuam9pbihcIiwgXCIpfSB9O1xyXG5jb25zdCB2aWV3ID0gcmVhZGVyLnZpZXc7XHJcbiR7dHkuZWxlbWVudHMubWFwKFxyXG4gICAgICAgICh7IG5hbWUsIGFsZ2VicmFpY1R5cGU6IHsgdGFnIH0gfSkgPT4gdGFnIGluIHByaW1pdGl2ZUpTTmFtZSA/IGByZXN1bHQuJHtuYW1lfSA9IHZpZXcuZ2V0JHtwcmltaXRpdmVKU05hbWVbdGFnXX0ocmVhZGVyLm9mZnNldCwgJHtwcmltaXRpdmVTaXplc1t0YWddID4gMSA/IFwidHJ1ZVwiIDogXCJcIn0pO1xyXG5yZWFkZXIub2Zmc2V0ICs9ICR7cHJpbWl0aXZlU2l6ZXNbdGFnXX07YCA6IGByZXN1bHQuJHtuYW1lfSA9IHJlYWRlci5yZWFkJHt0YWd9KCk7YFxyXG4gICAgICApLmpvaW4oXCJcXG5cIil9XHJcbnJldHVybiByZXN1bHQ7YDtcclxuICAgICAgZGVzZXJpYWxpemVyID0gRnVuY3Rpb24oXCJyZWFkZXJcIiwgYm9keSk7XHJcbiAgICAgIERFU0VSSUFMSVpFUlMuc2V0KHR5LCBkZXNlcmlhbGl6ZXIpO1xyXG4gICAgICByZXR1cm4gZGVzZXJpYWxpemVyO1xyXG4gICAgfVxyXG4gICAgY29uc3QgZGVzZXJpYWxpemVycyA9IHt9O1xyXG4gICAgZGVzZXJpYWxpemVyID0gRnVuY3Rpb24oXHJcbiAgICAgIFwicmVhZGVyXCIsXHJcbiAgICAgIGBcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgcmVzdWx0ID0geyAke3R5LmVsZW1lbnRzLm1hcChnZXRFbGVtZW50SW5pdGlhbGl6ZXIpLmpvaW4oXCIsIFwiKX0gfTtcclxuJHt0eS5lbGVtZW50cy5tYXAoKHsgbmFtZSB9KSA9PiBgcmVzdWx0LiR7bmFtZX0gPSB0aGlzLiR7bmFtZX0ocmVhZGVyKTtgKS5qb2luKFwiXFxuXCIpfVxyXG5yZXR1cm4gcmVzdWx0O2BcclxuICAgICkuYmluZChkZXNlcmlhbGl6ZXJzKTtcclxuICAgIERFU0VSSUFMSVpFUlMuc2V0KHR5LCBkZXNlcmlhbGl6ZXIpO1xyXG4gICAgZm9yIChjb25zdCB7IG5hbWUsIGFsZ2VicmFpY1R5cGUgfSBvZiB0eS5lbGVtZW50cykge1xyXG4gICAgICBkZXNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxyXG4gICAgICAgIGFsZ2VicmFpY1R5cGUsXHJcbiAgICAgICAgdHlwZXNwYWNlXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZnJlZXplKGRlc2VyaWFsaXplcnMpO1xyXG4gICAgcmV0dXJuIGRlc2VyaWFsaXplcjtcclxuICB9LFxyXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VEZXNlcmlhbGl6ZXJgIGluc3RlYWQuICovXHJcbiAgZGVzZXJpYWxpemVWYWx1ZShyZWFkZXIsIHR5LCB0eXBlc3BhY2UpIHtcclxuICAgIHJldHVybiBQcm9kdWN0VHlwZS5tYWtlRGVzZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHJlYWRlcik7XHJcbiAgfSxcclxuICBpbnRvTWFwS2V5KHR5LCB2YWx1ZSkge1xyXG4gICAgaWYgKHR5LmVsZW1lbnRzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICBjb25zdCBmaWVsZE5hbWUgPSB0eS5lbGVtZW50c1swXS5uYW1lO1xyXG4gICAgICBpZiAoaGFzT3duKHNwZWNpYWxQcm9kdWN0RGVzZXJpYWxpemVycywgZmllbGROYW1lKSkge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZVtmaWVsZE5hbWVdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdCB3cml0ZXIgPSBuZXcgQmluYXJ5V3JpdGVyKDEwKTtcclxuICAgIEFsZ2VicmFpY1R5cGUuc2VyaWFsaXplVmFsdWUod3JpdGVyLCBBbGdlYnJhaWNUeXBlLlByb2R1Y3QodHkpLCB2YWx1ZSk7XHJcbiAgICByZXR1cm4gd3JpdGVyLnRvQmFzZTY0KCk7XHJcbiAgfVxyXG59O1xyXG52YXIgU3VtVHlwZSA9IHtcclxuICBtYWtlU2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XHJcbiAgICBpZiAodHkudmFyaWFudHMubGVuZ3RoID09IDIgJiYgdHkudmFyaWFudHNbMF0ubmFtZSA9PT0gXCJzb21lXCIgJiYgdHkudmFyaWFudHNbMV0ubmFtZSA9PT0gXCJub25lXCIpIHtcclxuICAgICAgY29uc3Qgc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcclxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICApO1xyXG4gICAgICByZXR1cm4gKHdyaXRlciwgdmFsdWUpID0+IHtcclxuICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09IHZvaWQgMCkge1xyXG4gICAgICAgICAgd3JpdGVyLndyaXRlQnl0ZSgwKTtcclxuICAgICAgICAgIHNlcmlhbGl6ZSh3cml0ZXIsIHZhbHVlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgd3JpdGVyLndyaXRlQnl0ZSgxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2UgaWYgKHR5LnZhcmlhbnRzLmxlbmd0aCA9PSAyICYmIHR5LnZhcmlhbnRzWzBdLm5hbWUgPT09IFwib2tcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcImVyclwiKSB7XHJcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZU9rID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcclxuICAgICAgICB0eS52YXJpYW50c1swXS5hbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBzZXJpYWxpemVFcnIgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKFxyXG4gICAgICAgIHR5LnZhcmlhbnRzWzBdLmFsZ2VicmFpY1R5cGUsXHJcbiAgICAgICAgdHlwZXNwYWNlXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiAod3JpdGVyLCB2YWx1ZSkgPT4ge1xyXG4gICAgICAgIGlmIChcIm9rXCIgaW4gdmFsdWUpIHtcclxuICAgICAgICAgIHdyaXRlci53cml0ZVU4KDApO1xyXG4gICAgICAgICAgc2VyaWFsaXplT2sod3JpdGVyLCB2YWx1ZS5vayk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChcImVyclwiIGluIHZhbHVlKSB7XHJcbiAgICAgICAgICB3cml0ZXIud3JpdGVVOCgxKTtcclxuICAgICAgICAgIHNlcmlhbGl6ZUVycih3cml0ZXIsIHZhbHVlLmVycik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXHJcbiAgICAgICAgICAgIFwiY291bGQgbm90IHNlcmlhbGl6ZSByZXN1bHQ6IG9iamVjdCBoYWQgbmVpdGhlciBhIGBva2Agbm9yIGFuIGBlcnJgIGZpZWxkXCJcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IHNlcmlhbGl6ZXIgPSBTRVJJQUxJWkVSUy5nZXQodHkpO1xyXG4gICAgICBpZiAoc2VyaWFsaXplciAhPSBudWxsKSByZXR1cm4gc2VyaWFsaXplcjtcclxuICAgICAgY29uc3Qgc2VyaWFsaXplcnMgPSB7fTtcclxuICAgICAgY29uc3QgYm9keSA9IGBzd2l0Y2ggKHZhbHVlLnRhZykge1xyXG4ke3R5LnZhcmlhbnRzLm1hcChcclxuICAgICAgICAoeyBuYW1lIH0sIGkpID0+IGAgIGNhc2UgJHtKU09OLnN0cmluZ2lmeShuYW1lKX06XHJcbiAgICB3cml0ZXIud3JpdGVCeXRlKCR7aX0pO1xyXG4gICAgcmV0dXJuIHRoaXMuJHtuYW1lfSh3cml0ZXIsIHZhbHVlLnZhbHVlKTtgXHJcbiAgICAgICkuam9pbihcIlxcblwiKX1cclxuICBkZWZhdWx0OlxyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcclxuICAgICAgXFxgQ291bGQgbm90IHNlcmlhbGl6ZSBzdW0gdHlwZTsgdW5rbm93biB0YWcgXFwke3ZhbHVlLnRhZ31cXGBcclxuICAgIClcclxufVxyXG5gO1xyXG4gICAgICBzZXJpYWxpemVyID0gRnVuY3Rpb24oXCJ3cml0ZXJcIiwgXCJ2YWx1ZVwiLCBib2R5KS5iaW5kKFxyXG4gICAgICAgIHNlcmlhbGl6ZXJzXHJcbiAgICAgICk7XHJcbiAgICAgIFNFUklBTElaRVJTLnNldCh0eSwgc2VyaWFsaXplcik7XHJcbiAgICAgIGZvciAoY29uc3QgeyBuYW1lLCBhbGdlYnJhaWNUeXBlIH0gb2YgdHkudmFyaWFudHMpIHtcclxuICAgICAgICBzZXJpYWxpemVyc1tuYW1lXSA9IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlLFxyXG4gICAgICAgICAgdHlwZXNwYWNlXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBPYmplY3QuZnJlZXplKHNlcmlhbGl6ZXJzKTtcclxuICAgICAgcmV0dXJuIHNlcmlhbGl6ZXI7XHJcbiAgICB9XHJcbiAgfSxcclxuICAvKiogQGRlcHJlY2F0ZWQgVXNlIGBtYWtlU2VyaWFsaXplcmAgaW5zdGVhZC4gKi9cclxuICBzZXJpYWxpemVWYWx1ZSh3cml0ZXIsIHR5LCB2YWx1ZSwgdHlwZXNwYWNlKSB7XHJcbiAgICBTdW1UeXBlLm1ha2VTZXJpYWxpemVyKHR5LCB0eXBlc3BhY2UpKHdyaXRlciwgdmFsdWUpO1xyXG4gIH0sXHJcbiAgbWFrZURlc2VyaWFsaXplcih0eSwgdHlwZXNwYWNlKSB7XHJcbiAgICBpZiAodHkudmFyaWFudHMubGVuZ3RoID09IDIgJiYgdHkudmFyaWFudHNbMF0ubmFtZSA9PT0gXCJzb21lXCIgJiYgdHkudmFyaWFudHNbMV0ubmFtZSA9PT0gXCJub25lXCIpIHtcclxuICAgICAgY29uc3QgZGVzZXJpYWxpemUgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXHJcbiAgICAgICAgdHkudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZSxcclxuICAgICAgICB0eXBlc3BhY2VcclxuICAgICAgKTtcclxuICAgICAgcmV0dXJuIChyZWFkZXIpID0+IHtcclxuICAgICAgICBjb25zdCB0YWcgPSByZWFkZXIucmVhZFU4KCk7XHJcbiAgICAgICAgaWYgKHRhZyA9PT0gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIGRlc2VyaWFsaXplKHJlYWRlcik7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09IDEpIHtcclxuICAgICAgICAgIHJldHVybiB2b2lkIDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRocm93IGBDYW4ndCBkZXNlcmlhbGl6ZSBhbiBvcHRpb24gdHlwZSwgY291bGRuJ3QgZmluZCAke3RhZ30gdGFnYDtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2UgaWYgKHR5LnZhcmlhbnRzLmxlbmd0aCA9PSAyICYmIHR5LnZhcmlhbnRzWzBdLm5hbWUgPT09IFwib2tcIiAmJiB0eS52YXJpYW50c1sxXS5uYW1lID09PSBcImVyclwiKSB7XHJcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplT2sgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXHJcbiAgICAgICAgdHkudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZSxcclxuICAgICAgICB0eXBlc3BhY2VcclxuICAgICAgKTtcclxuICAgICAgY29uc3QgZGVzZXJpYWxpemVFcnIgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoXHJcbiAgICAgICAgdHkudmFyaWFudHNbMV0uYWxnZWJyYWljVHlwZSxcclxuICAgICAgICB0eXBlc3BhY2VcclxuICAgICAgKTtcclxuICAgICAgcmV0dXJuIChyZWFkZXIpID0+IHtcclxuICAgICAgICBjb25zdCB0YWcgPSByZWFkZXIucmVhZEJ5dGUoKTtcclxuICAgICAgICBpZiAodGFnID09PSAwKSB7XHJcbiAgICAgICAgICByZXR1cm4geyBvazogZGVzZXJpYWxpemVPayhyZWFkZXIpIH07XHJcbiAgICAgICAgfSBlbHNlIGlmICh0YWcgPT09IDEpIHtcclxuICAgICAgICAgIHJldHVybiB7IGVycjogZGVzZXJpYWxpemVFcnIocmVhZGVyKSB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aHJvdyBgQ2FuJ3QgZGVzZXJpYWxpemUgYSByZXN1bHQgdHlwZSwgY291bGRuJ3QgZmluZCAke3RhZ30gdGFnYDtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgZGVzZXJpYWxpemVyID0gREVTRVJJQUxJWkVSUy5nZXQodHkpO1xyXG4gICAgICBpZiAoZGVzZXJpYWxpemVyICE9IG51bGwpIHJldHVybiBkZXNlcmlhbGl6ZXI7XHJcbiAgICAgIGNvbnN0IGRlc2VyaWFsaXplcnMgPSB7fTtcclxuICAgICAgZGVzZXJpYWxpemVyID0gRnVuY3Rpb24oXHJcbiAgICAgICAgXCJyZWFkZXJcIixcclxuICAgICAgICBgc3dpdGNoIChyZWFkZXIucmVhZFU4KCkpIHtcclxuJHt0eS52YXJpYW50cy5tYXAoXHJcbiAgICAgICAgICAoeyBuYW1lIH0sIGkpID0+IGBjYXNlICR7aX06IHJldHVybiB7IHRhZzogJHtKU09OLnN0cmluZ2lmeShuYW1lKX0sIHZhbHVlOiB0aGlzLiR7bmFtZX0ocmVhZGVyKSB9O2BcclxuICAgICAgICApLmpvaW4oXCJcXG5cIil9IH1gXHJcbiAgICAgICkuYmluZChkZXNlcmlhbGl6ZXJzKTtcclxuICAgICAgREVTRVJJQUxJWkVSUy5zZXQodHksIGRlc2VyaWFsaXplcik7XHJcbiAgICAgIGZvciAoY29uc3QgeyBuYW1lLCBhbGdlYnJhaWNUeXBlIH0gb2YgdHkudmFyaWFudHMpIHtcclxuICAgICAgICBkZXNlcmlhbGl6ZXJzW25hbWVdID0gQWxnZWJyYWljVHlwZS5tYWtlRGVzZXJpYWxpemVyKFxyXG4gICAgICAgICAgYWxnZWJyYWljVHlwZSxcclxuICAgICAgICAgIHR5cGVzcGFjZVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgICAgT2JqZWN0LmZyZWV6ZShkZXNlcmlhbGl6ZXJzKTtcclxuICAgICAgcmV0dXJuIGRlc2VyaWFsaXplcjtcclxuICAgIH1cclxuICB9LFxyXG4gIC8qKiBAZGVwcmVjYXRlZCBVc2UgYG1ha2VEZXNlcmlhbGl6ZXJgIGluc3RlYWQuICovXHJcbiAgZGVzZXJpYWxpemVWYWx1ZShyZWFkZXIsIHR5LCB0eXBlc3BhY2UpIHtcclxuICAgIHJldHVybiBTdW1UeXBlLm1ha2VEZXNlcmlhbGl6ZXIodHksIHR5cGVzcGFjZSkocmVhZGVyKTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL29wdGlvbi50c1xyXG52YXIgT3B0aW9uID0ge1xyXG4gIGdldEFsZ2VicmFpY1R5cGUoaW5uZXJUeXBlKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5TdW0oe1xyXG4gICAgICB2YXJpYW50czogW1xyXG4gICAgICAgIHsgbmFtZTogXCJzb21lXCIsIGFsZ2VicmFpY1R5cGU6IGlubmVyVHlwZSB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIG5hbWU6IFwibm9uZVwiLFxyXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHsgZWxlbWVudHM6IFtdIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9KTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL3Jlc3VsdC50c1xyXG52YXIgUmVzdWx0ID0ge1xyXG4gIGdldEFsZ2VicmFpY1R5cGUob2tUeXBlLCBlcnJUeXBlKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZS5TdW0oe1xyXG4gICAgICB2YXJpYW50czogW1xyXG4gICAgICAgIHsgbmFtZTogXCJva1wiLCBhbGdlYnJhaWNUeXBlOiBva1R5cGUgfSxcclxuICAgICAgICB7IG5hbWU6IFwiZXJyXCIsIGFsZ2VicmFpY1R5cGU6IGVyclR5cGUgfVxyXG4gICAgICBdXHJcbiAgICB9KTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL3NjaGVkdWxlX2F0LnRzXHJcbnZhciBTY2hlZHVsZUF0ID0ge1xyXG4gIGludGVydmFsKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gSW50ZXJ2YWwodmFsdWUpO1xyXG4gIH0sXHJcbiAgdGltZSh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIFRpbWUodmFsdWUpO1xyXG4gIH0sXHJcbiAgZ2V0QWxnZWJyYWljVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlLlN1bSh7XHJcbiAgICAgIHZhcmlhbnRzOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgbmFtZTogXCJJbnRlcnZhbFwiLFxyXG4gICAgICAgICAgYWxnZWJyYWljVHlwZTogVGltZUR1cmF0aW9uLmdldEFsZ2VicmFpY1R5cGUoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgeyBuYW1lOiBcIlRpbWVcIiwgYWxnZWJyYWljVHlwZTogVGltZXN0YW1wLmdldEFsZ2VicmFpY1R5cGUoKSB9XHJcbiAgICAgIF1cclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgaXNTY2hlZHVsZUF0KGFsZ2VicmFpY1R5cGUpIHtcclxuICAgIGlmIChhbGdlYnJhaWNUeXBlLnRhZyAhPT0gXCJTdW1cIikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBjb25zdCB2YXJpYW50cyA9IGFsZ2VicmFpY1R5cGUudmFsdWUudmFyaWFudHM7XHJcbiAgICBpZiAodmFyaWFudHMubGVuZ3RoICE9PSAyKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGNvbnN0IGludGVydmFsVmFyaWFudCA9IHZhcmlhbnRzLmZpbmQoKHYpID0+IHYubmFtZSA9PT0gXCJJbnRlcnZhbFwiKTtcclxuICAgIGNvbnN0IHRpbWVWYXJpYW50ID0gdmFyaWFudHMuZmluZCgodikgPT4gdi5uYW1lID09PSBcIlRpbWVcIik7XHJcbiAgICBpZiAoIWludGVydmFsVmFyaWFudCB8fCAhdGltZVZhcmlhbnQpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFRpbWVEdXJhdGlvbi5pc1RpbWVEdXJhdGlvbihpbnRlcnZhbFZhcmlhbnQuYWxnZWJyYWljVHlwZSkgJiYgVGltZXN0YW1wLmlzVGltZXN0YW1wKHRpbWVWYXJpYW50LmFsZ2VicmFpY1R5cGUpO1xyXG4gIH1cclxufTtcclxudmFyIEludGVydmFsID0gKG1pY3JvcykgPT4gKHtcclxuICB0YWc6IFwiSW50ZXJ2YWxcIixcclxuICB2YWx1ZTogbmV3IFRpbWVEdXJhdGlvbihtaWNyb3MpXHJcbn0pO1xyXG52YXIgVGltZSA9IChtaWNyb3NTaW5jZVVuaXhFcG9jaCkgPT4gKHtcclxuICB0YWc6IFwiVGltZVwiLFxyXG4gIHZhbHVlOiBuZXcgVGltZXN0YW1wKG1pY3Jvc1NpbmNlVW5peEVwb2NoKVxyXG59KTtcclxudmFyIHNjaGVkdWxlX2F0X2RlZmF1bHQgPSBTY2hlZHVsZUF0O1xyXG5cclxuLy8gc3JjL2xpYi90eXBlX3V0aWwudHNcclxuZnVuY3Rpb24gc2V0KHgsIHQyKSB7XHJcbiAgcmV0dXJuIHsgLi4ueCwgLi4udDIgfTtcclxufVxyXG5cclxuLy8gc3JjL2xpYi90eXBlX2J1aWxkZXJzLnRzXHJcbnZhciBUeXBlQnVpbGRlciA9IGNsYXNzIHtcclxuICAvKipcclxuICAgKiBUaGUgVHlwZVNjcmlwdCBwaGFudG9tIHR5cGUuIFRoaXMgaXMgbm90IHN0b3JlZCBhdCBydW50aW1lLFxyXG4gICAqIGJ1dCBpcyB2aXNpYmxlIHRvIHRoZSBjb21waWxlclxyXG4gICAqL1xyXG4gIHR5cGU7XHJcbiAgLyoqXHJcbiAgICogVGhlIFNwYWNldGltZURCIGFsZ2VicmFpYyB0eXBlIChydW7igJF0aW1lIHZhbHVlKS4gSW4gYWRkaXRpb24gdG8gc3RvcmluZ1xyXG4gICAqIHRoZSBydW50aW1lIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBgQWxnZWJyYWljVHlwZWAsIGl0IGFsc28gY2FwdHVyZXNcclxuICAgKiB0aGUgVHlwZVNjcmlwdCB0eXBlIGluZm9ybWF0aW9uIG9mIHRoZSBgQWxnZWJyYWljVHlwZWAuIFRoYXQgaXMgdG8gc2F5XHJcbiAgICogdGhlIHZhbHVlIGlzIG5vdCBtZXJlbHkgYW4gYEFsZ2VicmFpY1R5cGVgLCBidXQgaXMgY29uc3RydWN0ZWQgdG8gYmVcclxuICAgKiB0aGUgY29ycmVzcG9uZGluZyBjb25jcmV0ZSBgQWxnZWJyYWljVHlwZWAgZm9yIHRoZSBUeXBlU2NyaXB0IHR5cGUgYFR5cGVgLlxyXG4gICAqXHJcbiAgICogZS5nLiBgc3RyaW5nYCBjb3JyZXNwb25kcyB0byBgQWxnZWJyYWljVHlwZS5TdHJpbmdgXHJcbiAgICovXHJcbiAgYWxnZWJyYWljVHlwZTtcclxuICBjb25zdHJ1Y3RvcihhbGdlYnJhaWNUeXBlKSB7XHJcbiAgICB0aGlzLmFsZ2VicmFpY1R5cGUgPSBhbGdlYnJhaWNUeXBlO1xyXG4gIH1cclxuICBvcHRpb25hbCgpIHtcclxuICAgIHJldHVybiBuZXcgT3B0aW9uQnVpbGRlcih0aGlzKTtcclxuICB9XHJcbiAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpIHtcclxuICAgIGNvbnN0IHNlcmlhbGl6ZSA9IHRoaXMuc2VyaWFsaXplID0gQWxnZWJyYWljVHlwZS5tYWtlU2VyaWFsaXplcihcclxuICAgICAgdGhpcy5hbGdlYnJhaWNUeXBlXHJcbiAgICApO1xyXG4gICAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpO1xyXG4gIH1cclxuICBkZXNlcmlhbGl6ZShyZWFkZXIpIHtcclxuICAgIGNvbnN0IGRlc2VyaWFsaXplID0gdGhpcy5kZXNlcmlhbGl6ZSA9IEFsZ2VicmFpY1R5cGUubWFrZURlc2VyaWFsaXplcihcclxuICAgICAgdGhpcy5hbGdlYnJhaWNUeXBlXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIGRlc2VyaWFsaXplKHJlYWRlcik7XHJcbiAgfVxyXG59O1xyXG52YXIgVThCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlU4KTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFU4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBVMTZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLlUxNik7XHJcbiAgfVxyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMTZDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgVTMyQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VMzIpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBVMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgVTMyQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFU2NEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuVTY0KTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFU2NENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBVMTI4QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VMTI4KTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgVTEyOENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBVMjU2QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5VMjU2KTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFUyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgVTI1NkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBJOEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTgpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEk4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEkxNkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuSTE2KTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxNkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBJMzJCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkkzMik7XHJcbiAgfVxyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KSk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IEkzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgSTY0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5JNjQpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSkpO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBJNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgSTY0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEkxMjhCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkkxMjgpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgSTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEkxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJMTI4Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEkyNTZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkkyNTYpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgSTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEkyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJMjU2Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEYzMkJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuRjMyKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBGMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBGMzJDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgRjY0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5GNjQpO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEY2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEY2NENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBCb29sQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5Cb29sKTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgQm9vbENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgU3RyaW5nQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoQWxnZWJyYWljVHlwZS5TdHJpbmcpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgU3RyaW5nQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBTdHJpbmdDb2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgQXJyYXlCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgZWxlbWVudDtcclxuICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XHJcbiAgICBzdXBlcihBbGdlYnJhaWNUeXBlLkFycmF5KGVsZW1lbnQuYWxnZWJyYWljVHlwZSkpO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBBcnJheUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEFycmF5Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIEJ5dGVBcnJheUJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuQXJyYXkoQWxnZWJyYWljVHlwZS5VOCkpO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIoc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBPcHRpb25CdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgdmFsdWU7XHJcbiAgY29uc3RydWN0b3IodmFsdWUpIHtcclxuICAgIHN1cGVyKE9wdGlvbi5nZXRBbGdlYnJhaWNUeXBlKHZhbHVlLmFsZ2VicmFpY1R5cGUpKTtcclxuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBPcHRpb25Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBPcHRpb25Db2x1bW5CdWlsZGVyKHRoaXMsIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgUHJvZHVjdEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICB0eXBlTmFtZTtcclxuICBlbGVtZW50cztcclxuICBjb25zdHJ1Y3RvcihlbGVtZW50cywgbmFtZSkge1xyXG4gICAgZnVuY3Rpb24gZWxlbWVudHNBcnJheUZyb21FbGVtZW50c09iaihvYmopIHtcclxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubWFwKChrZXkpID0+ICh7XHJcbiAgICAgICAgbmFtZToga2V5LFxyXG4gICAgICAgIC8vIExhemlseSByZXNvbHZlIHRoZSB1bmRlcmx5aW5nIG9iamVjdCdzIGFsZ2VicmFpY1R5cGUuXHJcbiAgICAgICAgLy8gVGhpcyB3aWxsIGNhbGwgb2JqW2tleV0uYWxnZWJyYWljVHlwZSBvbmx5IHdoZW4gc29tZW9uZVxyXG4gICAgICAgIC8vIGFjdHVhbGx5IHJlYWRzIHRoaXMgcHJvcGVydHkuXHJcbiAgICAgICAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICAgICAgICByZXR1cm4gb2JqW2tleV0uYWxnZWJyYWljVHlwZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIHN1cGVyKFxyXG4gICAgICBBbGdlYnJhaWNUeXBlLlByb2R1Y3Qoe1xyXG4gICAgICAgIGVsZW1lbnRzOiBlbGVtZW50c0FycmF5RnJvbUVsZW1lbnRzT2JqKGVsZW1lbnRzKVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICAgIHRoaXMudHlwZU5hbWUgPSBuYW1lO1xyXG4gICAgdGhpcy5lbGVtZW50cyA9IGVsZW1lbnRzO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFByb2R1Y3RDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9kdWN0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIFJlc3VsdEJ1aWxkZXIgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICBvaztcclxuICBlcnI7XHJcbiAgY29uc3RydWN0b3Iob2ssIGVycikge1xyXG4gICAgc3VwZXIoUmVzdWx0LmdldEFsZ2VicmFpY1R5cGUob2suYWxnZWJyYWljVHlwZSwgZXJyLmFsZ2VicmFpY1R5cGUpKTtcclxuICAgIHRoaXMub2sgPSBvaztcclxuICAgIHRoaXMuZXJyID0gZXJyO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlc3VsdENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBVbml0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoeyB0YWc6IFwiUHJvZHVjdFwiLCB2YWx1ZTogeyBlbGVtZW50czogW10gfSB9KTtcclxuICB9XHJcbn07XHJcbnZhciBSb3dCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgcm93O1xyXG4gIHR5cGVOYW1lO1xyXG4gIGNvbnN0cnVjdG9yKHJvdywgbmFtZSkge1xyXG4gICAgY29uc3QgbWFwcGVkUm93ID0gT2JqZWN0LmZyb21FbnRyaWVzKFxyXG4gICAgICBPYmplY3QuZW50cmllcyhyb3cpLm1hcCgoW2NvbE5hbWUsIGJ1aWxkZXJdKSA9PiBbXHJcbiAgICAgICAgY29sTmFtZSxcclxuICAgICAgICBidWlsZGVyIGluc3RhbmNlb2YgQ29sdW1uQnVpbGRlciA/IGJ1aWxkZXIgOiBuZXcgQ29sdW1uQnVpbGRlcihidWlsZGVyLCB7fSlcclxuICAgICAgXSlcclxuICAgICk7XHJcbiAgICBjb25zdCBlbGVtZW50cyA9IE9iamVjdC5rZXlzKG1hcHBlZFJvdykubWFwKChuYW1lMikgPT4gKHtcclxuICAgICAgbmFtZTogbmFtZTIsXHJcbiAgICAgIGdldCBhbGdlYnJhaWNUeXBlKCkge1xyXG4gICAgICAgIHJldHVybiBtYXBwZWRSb3dbbmFtZTJdLnR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGU7XHJcbiAgICAgIH1cclxuICAgIH0pKTtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuUHJvZHVjdCh7IGVsZW1lbnRzIH0pKTtcclxuICAgIHRoaXMucm93ID0gbWFwcGVkUm93O1xyXG4gICAgdGhpcy50eXBlTmFtZSA9IG5hbWU7XHJcbiAgfVxyXG59O1xyXG52YXIgU3VtQnVpbGRlckltcGwgPSBjbGFzcyBleHRlbmRzIFR5cGVCdWlsZGVyIHtcclxuICB2YXJpYW50cztcclxuICB0eXBlTmFtZTtcclxuICBjb25zdHJ1Y3Rvcih2YXJpYW50cywgbmFtZSkge1xyXG4gICAgZnVuY3Rpb24gdmFyaWFudHNBcnJheUZyb21WYXJpYW50c09iaih2YXJpYW50czIpIHtcclxuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHZhcmlhbnRzMikubWFwKChrZXkpID0+ICh7XHJcbiAgICAgICAgbmFtZToga2V5LFxyXG4gICAgICAgIC8vIExhemlseSByZXNvbHZlIHRoZSB1bmRlcmx5aW5nIG9iamVjdCdzIGFsZ2VicmFpY1R5cGUuXHJcbiAgICAgICAgLy8gVGhpcyB3aWxsIGNhbGwgb2JqW2tleV0uYWxnZWJyYWljVHlwZSBvbmx5IHdoZW4gc29tZW9uZVxyXG4gICAgICAgIC8vIGFjdHVhbGx5IHJlYWRzIHRoaXMgcHJvcGVydHkuXHJcbiAgICAgICAgZ2V0IGFsZ2VicmFpY1R5cGUoKSB7XHJcbiAgICAgICAgICByZXR1cm4gdmFyaWFudHMyW2tleV0uYWxnZWJyYWljVHlwZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pKTtcclxuICAgIH1cclxuICAgIHN1cGVyKFxyXG4gICAgICBBbGdlYnJhaWNUeXBlLlN1bSh7XHJcbiAgICAgICAgdmFyaWFudHM6IHZhcmlhbnRzQXJyYXlGcm9tVmFyaWFudHNPYmoodmFyaWFudHMpXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gICAgdGhpcy52YXJpYW50cyA9IHZhcmlhbnRzO1xyXG4gICAgdGhpcy50eXBlTmFtZSA9IG5hbWU7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyh2YXJpYW50cykpIHtcclxuICAgICAgY29uc3QgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFyaWFudHMsIGtleSk7XHJcbiAgICAgIGNvbnN0IGlzQWNjZXNzb3IgPSAhIWRlc2MgJiYgKHR5cGVvZiBkZXNjLmdldCA9PT0gXCJmdW5jdGlvblwiIHx8IHR5cGVvZiBkZXNjLnNldCA9PT0gXCJmdW5jdGlvblwiKTtcclxuICAgICAgbGV0IGlzVW5pdDIgPSBmYWxzZTtcclxuICAgICAgaWYgKCFpc0FjY2Vzc29yKSB7XHJcbiAgICAgICAgY29uc3QgdmFyaWFudCA9IHZhcmlhbnRzW2tleV07XHJcbiAgICAgICAgaXNVbml0MiA9IHZhcmlhbnQgaW5zdGFuY2VvZiBVbml0QnVpbGRlcjtcclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNVbml0Mikge1xyXG4gICAgICAgIGNvbnN0IGNvbnN0YW50ID0gdGhpcy5jcmVhdGUoa2V5KTtcclxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywga2V5LCB7XHJcbiAgICAgICAgICB2YWx1ZTogY29uc3RhbnQsXHJcbiAgICAgICAgICB3cml0YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgY29uZmlndXJhYmxlOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGZuID0gKCh2YWx1ZSkgPT4gdGhpcy5jcmVhdGUoa2V5LCB2YWx1ZSkpO1xyXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIHtcclxuICAgICAgICAgIHZhbHVlOiBmbixcclxuICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcclxuICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgY3JlYXRlKHRhZywgdmFsdWUpIHtcclxuICAgIHJldHVybiB2YWx1ZSA9PT0gdm9pZCAwID8geyB0YWcgfSA6IHsgdGFnLCB2YWx1ZSB9O1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFN1bUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFN1bUNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBTdW1CdWlsZGVyID0gU3VtQnVpbGRlckltcGw7XHJcbnZhciBTaW1wbGVTdW1CdWlsZGVySW1wbCA9IGNsYXNzIGV4dGVuZHMgU3VtQnVpbGRlckltcGwge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBTaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBTaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBTaW1wbGVTdW1CdWlsZGVyID0gU2ltcGxlU3VtQnVpbGRlckltcGw7XHJcbnZhciBTY2hlZHVsZUF0QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoc2NoZWR1bGVfYXRfZGVmYXVsdC5nZXRBbGdlYnJhaWNUeXBlKCkpO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFNjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIElkZW50aXR5QnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoSWRlbnRpdHkuZ2V0QWxnZWJyYWljVHlwZSgpKTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IElkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBJZGVudGl0eUNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBDb25uZWN0aW9uSWRCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihDb25uZWN0aW9uSWQuZ2V0QWxnZWJyYWljVHlwZSgpKTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBUaW1lc3RhbXBCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihUaW1lc3RhbXAuZ2V0QWxnZWJyYWljVHlwZSgpKTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBUaW1lRHVyYXRpb25CdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IoKSB7XHJcbiAgICBzdXBlcihUaW1lRHVyYXRpb24uZ2V0QWxnZWJyYWljVHlwZSgpKTtcclxuICB9XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcyxcclxuICAgICAgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIodGhpcywgc2V0KGRlZmF1bHRNZXRhZGF0YSwgeyBuYW1lIH0pKTtcclxuICB9XHJcbn07XHJcbnZhciBVdWlkQnVpbGRlciA9IGNsYXNzIGV4dGVuZHMgVHlwZUJ1aWxkZXIge1xyXG4gIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgc3VwZXIoVXVpZC5nZXRBbGdlYnJhaWNUeXBlKCkpO1xyXG4gIH1cclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IFV1aWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgVXVpZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMsXHJcbiAgICAgIHNldChkZWZhdWx0TWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IFV1aWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLFxyXG4gICAgICBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBVdWlkQ29sdW1uQnVpbGRlcih0aGlzLCBzZXQoZGVmYXVsdE1ldGFkYXRhLCB7IG5hbWUgfSkpO1xyXG4gIH1cclxufTtcclxudmFyIGRlZmF1bHRNZXRhZGF0YSA9IHt9O1xyXG52YXIgQ29sdW1uQnVpbGRlciA9IGNsYXNzIHtcclxuICB0eXBlQnVpbGRlcjtcclxuICBjb2x1bW5NZXRhZGF0YTtcclxuICBjb25zdHJ1Y3Rvcih0eXBlQnVpbGRlciwgbWV0YWRhdGEpIHtcclxuICAgIHRoaXMudHlwZUJ1aWxkZXIgPSB0eXBlQnVpbGRlcjtcclxuICAgIHRoaXMuY29sdW1uTWV0YWRhdGEgPSBtZXRhZGF0YTtcclxuICB9XHJcbiAgc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpIHtcclxuICAgIHRoaXMudHlwZUJ1aWxkZXIuc2VyaWFsaXplKHdyaXRlciwgdmFsdWUpO1xyXG4gIH1cclxuICBkZXNlcmlhbGl6ZShyZWFkZXIpIHtcclxuICAgIHJldHVybiB0aGlzLnR5cGVCdWlsZGVyLmRlc2VyaWFsaXplKHJlYWRlcik7XHJcbiAgfVxyXG59O1xyXG52YXIgVThDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1U4Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1U4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBVMTZDb2x1bW5CdWlsZGVyID0gY2xhc3MgX1UxNkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1UxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgVTMyQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9VMzJDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1UzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFU2NENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVTY0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX1U2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBVMTI4Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VMTI4Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTEyOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBVMjU2Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9VMjU2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVTI1NkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBJOENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSThDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JOENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSThDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEkxNkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfSTE2Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kxNkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBhdXRvSW5jKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTE2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBJMzJDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0kzMkNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgYXV0b0luYygpIHtcclxuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzQXV0b0luY3JlbWVudDogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTMyQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0kzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgSTY0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JNjRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfSTY0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc0F1dG9JbmNyZW1lbnQ6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0k2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEkxMjhDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0kxMjhDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMTI4Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0kxMjhDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEkyNTZDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0kyNTZDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGF1dG9JbmMoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNBdXRvSW5jcmVtZW50OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JMjU2Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0kyNTZDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEYzMkNvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfRjMyQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0YzMkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9GMzJDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEY2NENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfRjY0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0Y2NENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9GNjRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEJvb2xDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0Jvb2xDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Cb29sQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX0Jvb2xDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfQm9vbENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgU3RyaW5nQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9TdHJpbmdDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfU3RyaW5nQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1N0cmluZ0NvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9TdHJpbmdDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIEFycmF5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9BcnJheUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9BcnJheUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7XHJcbiAgICAgICAgZGVmYXVsdFZhbHVlOiB2YWx1ZVxyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9BcnJheUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgQnl0ZUFycmF5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9CeXRlQXJyYXlDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IobWV0YWRhdGEpIHtcclxuICAgIHN1cGVyKG5ldyBUeXBlQnVpbGRlcihBbGdlYnJhaWNUeXBlLkFycmF5KEFsZ2VicmFpY1R5cGUuVTgpKSwgbWV0YWRhdGEpO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9CeXRlQXJyYXlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0J5dGVBcnJheUNvbHVtbkJ1aWxkZXIoc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KSk7XHJcbiAgfVxyXG59O1xyXG52YXIgT3B0aW9uQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9PcHRpb25Db2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfT3B0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHtcclxuICAgICAgICBkZWZhdWx0VmFsdWU6IHZhbHVlXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX09wdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgUmVzdWx0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9SZXN1bHRDb2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IodHlwZUJ1aWxkZXIsIG1ldGFkYXRhKSB7XHJcbiAgICBzdXBlcih0eXBlQnVpbGRlciwgbWV0YWRhdGEpO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9SZXN1bHRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwge1xyXG4gICAgICAgIGRlZmF1bHRWYWx1ZTogdmFsdWVcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgUHJvZHVjdENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfUHJvZHVjdENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Qcm9kdWN0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Qcm9kdWN0Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBTdW1Db2x1bW5CdWlsZGVyID0gY2xhc3MgX1N1bUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9TdW1Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1N1bUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgU2ltcGxlU3VtQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9TaW1wbGVTdW1Db2x1bW5CdWlsZGVyIGV4dGVuZHMgU3VtQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9TaW1wbGVTdW1Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX1NpbXBsZVN1bUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9TY2hlZHVsZUF0Q29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1NjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1NjaGVkdWxlQXRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIElkZW50aXR5Q29sdW1uQnVpbGRlciA9IGNsYXNzIF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX0lkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX0lkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9JZGVudGl0eUNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfSWRlbnRpdHlDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX0lkZW50aXR5Q29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyID0gY2xhc3MgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIgZXh0ZW5kcyBDb2x1bW5CdWlsZGVyIHtcclxuICBpbmRleChhbGdvcml0aG0gPSBcImJ0cmVlXCIpIHtcclxuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1VuaXF1ZTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgcHJpbWFyeUtleSgpIHtcclxuICAgIHJldHVybiBuZXcgX0Nvbm5lY3Rpb25JZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzUHJpbWFyeUtleTogdHJ1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgZGVmYXVsdCh2YWx1ZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfQ29ubmVjdGlvbklkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Db25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBuYW1lIH0pXHJcbiAgICApO1xyXG4gIH1cclxufTtcclxudmFyIFRpbWVzdGFtcENvbHVtbkJ1aWxkZXIgPSBjbGFzcyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaW5kZXhUeXBlOiBhbGdvcml0aG0gfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGlzVW5pcXVlOiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBwcmltYXJ5S2V5KCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZXN0YW1wQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9UaW1lc3RhbXBDb2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBkZWZhdWx0VmFsdWU6IHZhbHVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBuYW1lKG5hbWUpIHtcclxuICAgIHJldHVybiBuZXcgX1RpbWVzdGFtcENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IG5hbWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyIGV4dGVuZHMgQ29sdW1uQnVpbGRlciB7XHJcbiAgaW5kZXgoYWxnb3JpdGhtID0gXCJidHJlZVwiKSB7XHJcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpbmRleFR5cGU6IGFsZ29yaXRobSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgdW5pcXVlKCkge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9UaW1lRHVyYXRpb25Db2x1bW5CdWlsZGVyKFxyXG4gICAgICB0aGlzLnR5cGVCdWlsZGVyLFxyXG4gICAgICBzZXQodGhpcy5jb2x1bW5NZXRhZGF0YSwgeyBpc1ByaW1hcnlLZXk6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIGRlZmF1bHQodmFsdWUpIHtcclxuICAgIHJldHVybiBuZXcgX1RpbWVEdXJhdGlvbkNvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGRlZmF1bHRWYWx1ZTogdmFsdWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIG5hbWUobmFtZSkge1xyXG4gICAgcmV0dXJuIG5ldyBfVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBVdWlkQ29sdW1uQnVpbGRlciA9IGNsYXNzIF9VdWlkQ29sdW1uQnVpbGRlciBleHRlbmRzIENvbHVtbkJ1aWxkZXIge1xyXG4gIGluZGV4KGFsZ29yaXRobSA9IFwiYnRyZWVcIikge1xyXG4gICAgcmV0dXJuIG5ldyBfVXVpZENvbHVtbkJ1aWxkZXIoXHJcbiAgICAgIHRoaXMudHlwZUJ1aWxkZXIsXHJcbiAgICAgIHNldCh0aGlzLmNvbHVtbk1ldGFkYXRhLCB7IGluZGV4VHlwZTogYWxnb3JpdGhtIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICB1bmlxdWUoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNVbmlxdWU6IHRydWUgfSlcclxuICAgICk7XHJcbiAgfVxyXG4gIHByaW1hcnlLZXkoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgaXNQcmltYXJ5S2V5OiB0cnVlIH0pXHJcbiAgICApO1xyXG4gIH1cclxuICBkZWZhdWx0KHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgZGVmYXVsdFZhbHVlOiB2YWx1ZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbiAgbmFtZShuYW1lKSB7XHJcbiAgICByZXR1cm4gbmV3IF9VdWlkQ29sdW1uQnVpbGRlcihcclxuICAgICAgdGhpcy50eXBlQnVpbGRlcixcclxuICAgICAgc2V0KHRoaXMuY29sdW1uTWV0YWRhdGEsIHsgbmFtZSB9KVxyXG4gICAgKTtcclxuICB9XHJcbn07XHJcbnZhciBSZWZCdWlsZGVyID0gY2xhc3MgZXh0ZW5kcyBUeXBlQnVpbGRlciB7XHJcbiAgcmVmO1xyXG4gIC8qKiBUaGUgcGhhbnRvbSB0eXBlIG9mIHRoZSBwb2ludGVlIG9mIHRoaXMgcmVmLiAqL1xyXG4gIF9fc3BhY2V0aW1lVHlwZTtcclxuICBjb25zdHJ1Y3RvcihyZWYpIHtcclxuICAgIHN1cGVyKEFsZ2VicmFpY1R5cGUuUmVmKHJlZikpO1xyXG4gICAgdGhpcy5yZWYgPSByZWY7XHJcbiAgfVxyXG59O1xyXG52YXIgZW51bUltcGwgPSAoKG5hbWVPck9iaiwgbWF5YmVPYmopID0+IHtcclxuICBsZXQgb2JqID0gbmFtZU9yT2JqO1xyXG4gIGxldCBuYW1lID0gdm9pZCAwO1xyXG4gIGlmICh0eXBlb2YgbmFtZU9yT2JqID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICBpZiAoIW1heWJlT2JqKSB7XHJcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXHJcbiAgICAgICAgXCJXaGVuIHByb3ZpZGluZyBhIG5hbWUsIHlvdSBtdXN0IGFsc28gcHJvdmlkZSB0aGUgdmFyaWFudHMgb2JqZWN0IG9yIGFycmF5LlwiXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBvYmogPSBtYXliZU9iajtcclxuICAgIG5hbWUgPSBuYW1lT3JPYmo7XHJcbiAgfVxyXG4gIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcclxuICAgIGNvbnN0IHNpbXBsZVZhcmlhbnRzT2JqID0ge307XHJcbiAgICBmb3IgKGNvbnN0IHZhcmlhbnQgb2Ygb2JqKSB7XHJcbiAgICAgIHNpbXBsZVZhcmlhbnRzT2JqW3ZhcmlhbnRdID0gbmV3IFVuaXRCdWlsZGVyKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFNpbXBsZVN1bUJ1aWxkZXJJbXBsKHNpbXBsZVZhcmlhbnRzT2JqLCBuYW1lKTtcclxuICB9XHJcbiAgcmV0dXJuIG5ldyBTdW1CdWlsZGVyKG9iaiwgbmFtZSk7XHJcbn0pO1xyXG52YXIgdCA9IHtcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBCb29sYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBib29sZWFuYCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBCb29sQnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBib29sOiAoKSA9PiBuZXcgQm9vbEJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBTdHJpbmdgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYHN0cmluZ2AgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgU3RyaW5nQnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBzdHJpbmc6ICgpID0+IG5ldyBTdHJpbmdCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEY2NEJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgbnVtYmVyOiAoKSA9PiBuZXcgRjY0QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYEk4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEk4QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBpODogKCkgPT4gbmV3IEk4QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYFU4YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFU4QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICB1ODogKCkgPT4gbmV3IFU4QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkxNmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBJMTZCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGkxNjogKCkgPT4gbmV3IEkxNkJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBVMTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYG51bWJlcmAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVTE2QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICB1MTY6ICgpID0+IG5ldyBVMTZCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgSTMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEkzMkJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgaTMyOiAoKSA9PiBuZXcgSTMyQnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUzMmAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMzJCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHUzMjogKCkgPT4gbmV3IFUzMkJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBJNjRgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTY0QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICBpNjQ6ICgpID0+IG5ldyBJNjRCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTY0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFU2NEJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgdTY0OiAoKSA9PiBuZXcgVTY0QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYEkxMjhgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgSTEyOEJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgaTEyODogKCkgPT4gbmV3IEkxMjhCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgVTEyOGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgYmlnaW50YCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBVMTI4QnVpbGRlcn0gaW5zdGFuY2VcclxuICAgKi9cclxuICB1MTI4OiAoKSA9PiBuZXcgVTEyOEJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBJMjU2YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBiaWdpbnRgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEkyNTZCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGkyNTY6ICgpID0+IG5ldyBJMjU2QnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYFUyNTZgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zXHJcbiAgICogUmVwcmVzZW50ZWQgYXMgYGJpZ2ludGAgaW4gVHlwZVNjcmlwdC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVTI1NkJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgdTI1NjogKCkgPT4gbmV3IFUyNTZCdWlsZGVyKCksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgRjMyYCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9uc1xyXG4gICAqIFJlcHJlc2VudGVkIGFzIGBudW1iZXJgIGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEYzMkJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgZjMyOiAoKSA9PiBuZXcgRjMyQnVpbGRlcigpLFxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgYEY2NGAge0BsaW5rIEFsZ2VicmFpY1R5cGV9IHRvIGJlIHVzZWQgaW4gdGFibGUgZGVmaW5pdGlvbnNcclxuICAgKiBSZXByZXNlbnRlZCBhcyBgbnVtYmVyYCBpbiBUeXBlU2NyaXB0LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBGNjRCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIGY2NDogKCkgPT4gbmV3IEY2NEJ1aWxkZXIoKSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBQcm9kdWN0YCB7QGxpbmsgQWxnZWJyYWljVHlwZX0gdG8gYmUgdXNlZCBpbiB0YWJsZSBkZWZpbml0aW9ucy4gUHJvZHVjdCB0eXBlcyBpbiBTcGFjZXRpbWVEQlxyXG4gICAqIGFyZSBlc3NlbnRpYWxseSB0aGUgc2FtZSBhcyBvYmplY3RzIGluIEphdmFTY3JpcHQvVHlwZVNjcmlwdC5cclxuICAgKiBQcm9wZXJ0aWVzIG9mIHRoZSBvYmplY3QgbXVzdCBhbHNvIGJlIHtAbGluayBUeXBlQnVpbGRlcn1zLlxyXG4gICAqIFJlcHJlc2VudGVkIGFzIGFuIG9iamVjdCB3aXRoIHNwZWNpZmljIHByb3BlcnRpZXMgaW4gVHlwZVNjcmlwdC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBuYW1lIChvcHRpb25hbCkgQSBkaXNwbGF5IG5hbWUgZm9yIHRoZSBwcm9kdWN0IHR5cGUuIElmIG9taXR0ZWQsIGFuIGFub255bW91cyBwcm9kdWN0IHR5cGUgaXMgY3JlYXRlZC5cclxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgZGVmaW5pbmcgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHR5cGUsIHdob3NlIHByb3BlcnR5XHJcbiAgICogdmFsdWVzIG11c3QgYmUge0BsaW5rIFR5cGVCdWlsZGVyfXMuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFByb2R1Y3RCdWlsZGVyfSBpbnN0YW5jZS5cclxuICAgKi9cclxuICBvYmplY3Q6ICgobmFtZU9yT2JqLCBtYXliZU9iaikgPT4ge1xyXG4gICAgaWYgKHR5cGVvZiBuYW1lT3JPYmogPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgaWYgKCFtYXliZU9iaikge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXHJcbiAgICAgICAgICBcIldoZW4gcHJvdmlkaW5nIGEgbmFtZSwgeW91IG11c3QgYWxzbyBwcm92aWRlIHRoZSBvYmplY3QuXCJcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBuZXcgUHJvZHVjdEJ1aWxkZXIobWF5YmVPYmosIG5hbWVPck9iaik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmV3IFByb2R1Y3RCdWlsZGVyKG5hbWVPck9iaiwgdm9pZCAwKTtcclxuICB9KSxcclxuICAvKipcclxuICAgKiBDcmVhdGVzIGEgbmV3IGBSb3dgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zLiBSb3cgdHlwZXMgaW4gU3BhY2V0aW1lREJcclxuICAgKiBhcmUgc2ltaWxhciB0byBgUHJvZHVjdGAgdHlwZXMsIGJ1dCBhcmUgc3BlY2lmaWNhbGx5IHVzZWQgdG8gZGVmaW5lIHRoZSBzY2hlbWEgb2YgYSB0YWJsZSByb3cuXHJcbiAgICogUHJvcGVydGllcyBvZiB0aGUgb2JqZWN0IG11c3QgYWxzbyBiZSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IG9yIHtAbGluayBDb2x1bW5CdWlsZGVyfXMuXHJcbiAgICpcclxuICAgKiBZb3UgY2FuIHJlcHJlc2VudCBhIGBSb3dgIGFzIGVpdGhlciBhIHtAbGluayBSb3dPYmp9IG9yIGFuIHtAbGluayBSb3dCdWlsZGVyfSB0eXBlIHdoZW5cclxuICAgKiBkZWZpbmluZyBhIHRhYmxlIHNjaGVtYS5cclxuICAgKlxyXG4gICAqIFRoZSB7QGxpbmsgUm93QnVpbGRlcn0gdHlwZSBpcyB1c2VmdWwgd2hlbiB5b3Ugd2FudCB0byBjcmVhdGUgYSB0eXBlIHdoaWNoIGNhbiBiZSB1c2VkIGFueXdoZXJlXHJcbiAgICogYSB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGlzIGFjY2VwdGVkLCBzdWNoIGFzIGluIG5lc3RlZCBvYmplY3RzIG9yIGFycmF5cywgb3IgYXMgdGhlIGFyZ3VtZW50XHJcbiAgICogdG8gYSBzY2hlZHVsZWQgZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcGFyYW0gb2JqIFRoZSBvYmplY3QgZGVmaW5pbmcgdGhlIHByb3BlcnRpZXMgb2YgdGhlIHJvdywgd2hvc2UgcHJvcGVydHlcclxuICAgKiB2YWx1ZXMgbXVzdCBiZSB7QGxpbmsgVHlwZUJ1aWxkZXJ9cyBvciB7QGxpbmsgQ29sdW1uQnVpbGRlcn1zLlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBSb3dCdWlsZGVyfSBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHJvdzogKChuYW1lT3JPYmosIG1heWJlT2JqKSA9PiB7XHJcbiAgICBjb25zdCBbb2JqLCBuYW1lXSA9IHR5cGVvZiBuYW1lT3JPYmogPT09IFwic3RyaW5nXCIgPyBbbWF5YmVPYmosIG5hbWVPck9ial0gOiBbbmFtZU9yT2JqLCB2b2lkIDBdO1xyXG4gICAgcmV0dXJuIG5ldyBSb3dCdWlsZGVyKG9iaiwgbmFtZSk7XHJcbiAgfSksXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlgIHtAbGluayBBbGdlYnJhaWNUeXBlfSB0byBiZSB1c2VkIGluIHRhYmxlIGRlZmluaXRpb25zLlxyXG4gICAqIFJlcHJlc2VudGVkIGFzIGFuIGFycmF5IGluIFR5cGVTY3JpcHQuXHJcbiAgICogQHBhcmFtIGVsZW1lbnQgVGhlIGVsZW1lbnQgdHlwZSBvZiB0aGUgYXJyYXksIHdoaWNoIG11c3QgYmUgYSBgVHlwZUJ1aWxkZXJgLlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBBcnJheUJ1aWxkZXJ9IGluc3RhbmNlXHJcbiAgICovXHJcbiAgYXJyYXkoZSkge1xyXG4gICAgcmV0dXJuIG5ldyBBcnJheUJ1aWxkZXIoZSk7XHJcbiAgfSxcclxuICBlbnVtOiBlbnVtSW1wbCxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgc3BlY2lhbCBoZWxwZXIgZnVuY3Rpb24gZm9yIGNvbnZlbmllbnRseSBjcmVhdGluZyBgUHJvZHVjdGAgdHlwZSBjb2x1bW5zIHdpdGggbm8gZmllbGRzLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFByb2R1Y3RCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIG5vIGZpZWxkcy5cclxuICAgKi9cclxuICB1bml0KCkge1xyXG4gICAgcmV0dXJuIG5ldyBVbml0QnVpbGRlcigpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIGxhemlseS1ldmFsdWF0ZWQge0BsaW5rIFR5cGVCdWlsZGVyfS4gVGhpcyBpcyB1c2VmdWwgZm9yIGNyZWF0aW5nXHJcbiAgICogcmVjdXJzaXZlIHR5cGVzLCBzdWNoIGFzIGEgdHJlZSBvciBsaW5rZWQgbGlzdC5cclxuICAgKiBAcGFyYW0gdGh1bmsgQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSB7QGxpbmsgVHlwZUJ1aWxkZXJ9LlxyXG4gICAqIEByZXR1cm5zIEEgcHJveHkge0BsaW5rIFR5cGVCdWlsZGVyfSB0aGF0IGV2YWx1YXRlcyB0aGUgdGh1bmsgb24gZmlyc3QgYWNjZXNzLlxyXG4gICAqL1xyXG4gIGxhenkodGh1bmspIHtcclxuICAgIGxldCBjYWNoZWQgPSBudWxsO1xyXG4gICAgY29uc3QgZ2V0ID0gKCkgPT4gY2FjaGVkID8/PSB0aHVuaygpO1xyXG4gICAgY29uc3QgcHJveHkgPSBuZXcgUHJveHkoe30sIHtcclxuICAgICAgZ2V0KF90LCBwcm9wLCByZWN2KSB7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZ2V0KCk7XHJcbiAgICAgICAgY29uc3QgdmFsID0gUmVmbGVjdC5nZXQodGFyZ2V0LCBwcm9wLCByZWN2KTtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIHZhbCA9PT0gXCJmdW5jdGlvblwiID8gdmFsLmJpbmQodGFyZ2V0KSA6IHZhbDtcclxuICAgICAgfSxcclxuICAgICAgc2V0KF90LCBwcm9wLCB2YWx1ZSwgcmVjdikge1xyXG4gICAgICAgIHJldHVybiBSZWZsZWN0LnNldChnZXQoKSwgcHJvcCwgdmFsdWUsIHJlY3YpO1xyXG4gICAgICB9LFxyXG4gICAgICBoYXMoX3QsIHByb3ApIHtcclxuICAgICAgICByZXR1cm4gcHJvcCBpbiBnZXQoKTtcclxuICAgICAgfSxcclxuICAgICAgb3duS2V5cygpIHtcclxuICAgICAgICByZXR1cm4gUmVmbGVjdC5vd25LZXlzKGdldCgpKTtcclxuICAgICAgfSxcclxuICAgICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKF90LCBwcm9wKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZ2V0KCksIHByb3ApO1xyXG4gICAgICB9LFxyXG4gICAgICBnZXRQcm90b3R5cGVPZigpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKGdldCgpKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcHJveHk7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgc3BlY2lhbCBoZWxwZXIgZnVuY3Rpb24gZm9yIGNvbnZlbmllbnRseSBjcmVhdGluZyB7QGxpbmsgU2NoZWR1bGVBdH0gdHlwZSBjb2x1bW5zLlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IENvbHVtbkJ1aWxkZXIgaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIFNjaGVkdWxlQXR9IHR5cGUuXHJcbiAgICovXHJcbiAgc2NoZWR1bGVBdDogKCkgPT4ge1xyXG4gICAgcmV0dXJuIG5ldyBTY2hlZHVsZUF0QnVpbGRlcigpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIE9wdGlvbn0gdHlwZS5cclxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBlbnVtIHdpdGggYSBgc29tZWAgYW5kIGBub25lYCB2YXJpYW50LlxyXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdHlwZSBvZiB0aGUgdmFsdWUgY29udGFpbmVkIGluIHRoZSBgc29tZWAgdmFyaWFudCBvZiB0aGUgYE9wdGlvbmAuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIE9wdGlvbkJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBPcHRpb259IHR5cGUuXHJcbiAgICovXHJcbiAgb3B0aW9uKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gbmV3IE9wdGlvbkJ1aWxkZXIodmFsdWUpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFJlc3VsdH0gdHlwZS5cclxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBlbnVtIHdpdGggYW4gYG9rYCBhbmQgYGVycmAgdmFyaWFudC5cclxuICAgKiBAcGFyYW0gb2sgVGhlIHR5cGUgb2YgdGhlIHZhbHVlIGNvbnRhaW5lZCBpbiB0aGUgYG9rYCB2YXJpYW50IG9mIHRoZSBgUmVzdWx0YC5cclxuICAgKiBAcGFyYW0gZXJyIFRoZSB0eXBlIG9mIHRoZSB2YWx1ZSBjb250YWluZWQgaW4gdGhlIGBlcnJgIHZhcmlhbnQgb2YgdGhlIGBSZXN1bHRgLlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBSZXN1bHRCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgUmVzdWx0fSB0eXBlLlxyXG4gICAqL1xyXG4gIHJlc3VsdChvaywgZXJyKSB7XHJcbiAgICByZXR1cm4gbmV3IFJlc3VsdEJ1aWxkZXIob2ssIGVycik7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSB7QGxpbmsgSWRlbnRpdHl9IHR5cGUuXHJcbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX19pZGVudGl0eV9fYCBlbGVtZW50LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIElkZW50aXR5fSB0eXBlLlxyXG4gICAqL1xyXG4gIGlkZW50aXR5OiAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IElkZW50aXR5QnVpbGRlcigpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIENvbm5lY3Rpb25JZH0gdHlwZS5cclxuICAgKiBZb3UgY2FuIGNyZWF0ZSBhIGNvbHVtbiBvZiB0aGUgc2FtZSB0eXBlIGJ5IGNvbnN0cnVjdGluZyBhbiBgb2JqZWN0YCB3aXRoIGEgc2luZ2xlIGBfX2Nvbm5lY3Rpb25faWRfX2AgZWxlbWVudC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBDb25uZWN0aW9uSWR9IHR5cGUuXHJcbiAgICovXHJcbiAgY29ubmVjdGlvbklkOiAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IENvbm5lY3Rpb25JZEJ1aWxkZXIoKTtcclxuICB9LFxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBUaW1lc3RhbXB9IHR5cGUuXHJcbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfX2AgZWxlbWVudC5cclxuICAgKiBAcmV0dXJucyBBIG5ldyB7QGxpbmsgVHlwZUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIHtAbGluayBUaW1lc3RhbXB9IHR5cGUuXHJcbiAgICovXHJcbiAgdGltZXN0YW1wOiAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IFRpbWVzdGFtcEJ1aWxkZXIoKTtcclxuICB9LFxyXG4gIC8qKlxyXG4gICAqIFRoaXMgaXMgYSBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgY29sdW1uIHdpdGggdGhlIHtAbGluayBUaW1lRHVyYXRpb259IHR5cGUuXHJcbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX190aW1lX2R1cmF0aW9uX21pY3Jvc19fYCBlbGVtZW50LlxyXG4gICAqIEByZXR1cm5zIEEgbmV3IHtAbGluayBUeXBlQnVpbGRlcn0gaW5zdGFuY2Ugd2l0aCB0aGUge0BsaW5rIFRpbWVEdXJhdGlvbn0gdHlwZS5cclxuICAgKi9cclxuICB0aW1lRHVyYXRpb246ICgpID0+IHtcclxuICAgIHJldHVybiBuZXcgVGltZUR1cmF0aW9uQnVpbGRlcigpO1xyXG4gIH0sXHJcbiAgLyoqXHJcbiAgICogVGhpcyBpcyBhIGNvbnZlbmllbmNlIG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBjb2x1bW4gd2l0aCB0aGUge0BsaW5rIFV1aWR9IHR5cGUuXHJcbiAgICogWW91IGNhbiBjcmVhdGUgYSBjb2x1bW4gb2YgdGhlIHNhbWUgdHlwZSBieSBjb25zdHJ1Y3RpbmcgYW4gYG9iamVjdGAgd2l0aCBhIHNpbmdsZSBgX191dWlkX19gIGVsZW1lbnQuXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIFR5cGVCdWlsZGVyfSBpbnN0YW5jZSB3aXRoIHRoZSB7QGxpbmsgVXVpZH0gdHlwZS5cclxuICAgKi9cclxuICB1dWlkOiAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IFV1aWRCdWlsZGVyKCk7XHJcbiAgfSxcclxuICAvKipcclxuICAgKiBUaGlzIGlzIGEgY29udmVuaWVuY2UgbWV0aG9kIGZvciBjcmVhdGluZyBhIGNvbHVtbiB3aXRoIHRoZSBgQnl0ZUFycmF5YCB0eXBlLlxyXG4gICAqIFlvdSBjYW4gY3JlYXRlIGEgY29sdW1uIG9mIHRoZSBzYW1lIHR5cGUgYnkgY29uc3RydWN0aW5nIGFuIGBhcnJheWAgb2YgYHU4YC5cclxuICAgKiBUaGUgVHlwZVNjcmlwdCByZXByZXNlbnRhdGlvbiBpcyB7QGxpbmsgVWludDhBcnJheX0uXHJcbiAgICogQHJldHVybnMgQSBuZXcge0BsaW5rIEJ5dGVBcnJheUJ1aWxkZXJ9IGluc3RhbmNlIHdpdGggdGhlIGBCeXRlQXJyYXlgIHR5cGUuXHJcbiAgICovXHJcbiAgYnl0ZUFycmF5OiAoKSA9PiB7XHJcbiAgICByZXR1cm4gbmV3IEJ5dGVBcnJheUJ1aWxkZXIoKTtcclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvbGliL2F1dG9nZW4vdHlwZXMudHNcclxudmFyIEFsZ2VicmFpY1R5cGUyID0gdC5lbnVtKFwiQWxnZWJyYWljVHlwZVwiLCB7XHJcbiAgUmVmOiB0LnUzMigpLFxyXG4gIGdldCBTdW0oKSB7XHJcbiAgICByZXR1cm4gU3VtVHlwZTI7XHJcbiAgfSxcclxuICBnZXQgUHJvZHVjdCgpIHtcclxuICAgIHJldHVybiBQcm9kdWN0VHlwZTI7XHJcbiAgfSxcclxuICBnZXQgQXJyYXkoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfSxcclxuICBTdHJpbmc6IHQudW5pdCgpLFxyXG4gIEJvb2w6IHQudW5pdCgpLFxyXG4gIEk4OiB0LnVuaXQoKSxcclxuICBVODogdC51bml0KCksXHJcbiAgSTE2OiB0LnVuaXQoKSxcclxuICBVMTY6IHQudW5pdCgpLFxyXG4gIEkzMjogdC51bml0KCksXHJcbiAgVTMyOiB0LnVuaXQoKSxcclxuICBJNjQ6IHQudW5pdCgpLFxyXG4gIFU2NDogdC51bml0KCksXHJcbiAgSTEyODogdC51bml0KCksXHJcbiAgVTEyODogdC51bml0KCksXHJcbiAgSTI1NjogdC51bml0KCksXHJcbiAgVTI1NjogdC51bml0KCksXHJcbiAgRjMyOiB0LnVuaXQoKSxcclxuICBGNjQ6IHQudW5pdCgpXHJcbn0pO1xyXG52YXIgQ2FzZUNvbnZlcnNpb25Qb2xpY3kgPSB0LmVudW0oXCJDYXNlQ29udmVyc2lvblBvbGljeVwiLCB7XHJcbiAgTm9uZTogdC51bml0KCksXHJcbiAgU25ha2VDYXNlOiB0LnVuaXQoKVxyXG59KTtcclxudmFyIEV4cGxpY2l0TmFtZUVudHJ5ID0gdC5lbnVtKFwiRXhwbGljaXROYW1lRW50cnlcIiwge1xyXG4gIGdldCBUYWJsZSgpIHtcclxuICAgIHJldHVybiBOYW1lTWFwcGluZztcclxuICB9LFxyXG4gIGdldCBGdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBOYW1lTWFwcGluZztcclxuICB9LFxyXG4gIGdldCBJbmRleCgpIHtcclxuICAgIHJldHVybiBOYW1lTWFwcGluZztcclxuICB9XHJcbn0pO1xyXG52YXIgRXhwbGljaXROYW1lcyA9IHQub2JqZWN0KFwiRXhwbGljaXROYW1lc1wiLCB7XHJcbiAgZ2V0IGVudHJpZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShFeHBsaWNpdE5hbWVFbnRyeSk7XHJcbiAgfVxyXG59KTtcclxudmFyIEZ1bmN0aW9uVmlzaWJpbGl0eSA9IHQuZW51bShcIkZ1bmN0aW9uVmlzaWJpbGl0eVwiLCB7XHJcbiAgUHJpdmF0ZTogdC51bml0KCksXHJcbiAgQ2xpZW50Q2FsbGFibGU6IHQudW5pdCgpXHJcbn0pO1xyXG52YXIgSHR0cEhlYWRlclBhaXIgPSB0Lm9iamVjdChcIkh0dHBIZWFkZXJQYWlyXCIsIHtcclxuICBuYW1lOiB0LnN0cmluZygpLFxyXG4gIHZhbHVlOiB0LmJ5dGVBcnJheSgpXHJcbn0pO1xyXG52YXIgSHR0cEhlYWRlcnMgPSB0Lm9iamVjdChcIkh0dHBIZWFkZXJzXCIsIHtcclxuICBnZXQgZW50cmllcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KEh0dHBIZWFkZXJQYWlyKTtcclxuICB9XHJcbn0pO1xyXG52YXIgSHR0cE1ldGhvZCA9IHQuZW51bShcIkh0dHBNZXRob2RcIiwge1xyXG4gIEdldDogdC51bml0KCksXHJcbiAgSGVhZDogdC51bml0KCksXHJcbiAgUG9zdDogdC51bml0KCksXHJcbiAgUHV0OiB0LnVuaXQoKSxcclxuICBEZWxldGU6IHQudW5pdCgpLFxyXG4gIENvbm5lY3Q6IHQudW5pdCgpLFxyXG4gIE9wdGlvbnM6IHQudW5pdCgpLFxyXG4gIFRyYWNlOiB0LnVuaXQoKSxcclxuICBQYXRjaDogdC51bml0KCksXHJcbiAgRXh0ZW5zaW9uOiB0LnN0cmluZygpXHJcbn0pO1xyXG52YXIgSHR0cFJlcXVlc3QgPSB0Lm9iamVjdChcIkh0dHBSZXF1ZXN0XCIsIHtcclxuICBnZXQgbWV0aG9kKCkge1xyXG4gICAgcmV0dXJuIEh0dHBNZXRob2Q7XHJcbiAgfSxcclxuICBnZXQgaGVhZGVycygpIHtcclxuICAgIHJldHVybiBIdHRwSGVhZGVycztcclxuICB9LFxyXG4gIHRpbWVvdXQ6IHQub3B0aW9uKHQudGltZUR1cmF0aW9uKCkpLFxyXG4gIHVyaTogdC5zdHJpbmcoKSxcclxuICBnZXQgdmVyc2lvbigpIHtcclxuICAgIHJldHVybiBIdHRwVmVyc2lvbjtcclxuICB9XHJcbn0pO1xyXG52YXIgSHR0cFJlc3BvbnNlID0gdC5vYmplY3QoXCJIdHRwUmVzcG9uc2VcIiwge1xyXG4gIGdldCBoZWFkZXJzKCkge1xyXG4gICAgcmV0dXJuIEh0dHBIZWFkZXJzO1xyXG4gIH0sXHJcbiAgZ2V0IHZlcnNpb24oKSB7XHJcbiAgICByZXR1cm4gSHR0cFZlcnNpb247XHJcbiAgfSxcclxuICBjb2RlOiB0LnUxNigpXHJcbn0pO1xyXG52YXIgSHR0cFZlcnNpb24gPSB0LmVudW0oXCJIdHRwVmVyc2lvblwiLCB7XHJcbiAgSHR0cDA5OiB0LnVuaXQoKSxcclxuICBIdHRwMTA6IHQudW5pdCgpLFxyXG4gIEh0dHAxMTogdC51bml0KCksXHJcbiAgSHR0cDI6IHQudW5pdCgpLFxyXG4gIEh0dHAzOiB0LnVuaXQoKVxyXG59KTtcclxudmFyIEluZGV4VHlwZSA9IHQuZW51bShcIkluZGV4VHlwZVwiLCB7XHJcbiAgQlRyZWU6IHQudW5pdCgpLFxyXG4gIEhhc2g6IHQudW5pdCgpXHJcbn0pO1xyXG52YXIgTGlmZWN5Y2xlID0gdC5lbnVtKFwiTGlmZWN5Y2xlXCIsIHtcclxuICBJbml0OiB0LnVuaXQoKSxcclxuICBPbkNvbm5lY3Q6IHQudW5pdCgpLFxyXG4gIE9uRGlzY29ubmVjdDogdC51bml0KClcclxufSk7XHJcbnZhciBNaXNjTW9kdWxlRXhwb3J0ID0gdC5lbnVtKFwiTWlzY01vZHVsZUV4cG9ydFwiLCB7XHJcbiAgZ2V0IFR5cGVBbGlhcygpIHtcclxuICAgIHJldHVybiBUeXBlQWxpYXM7XHJcbiAgfVxyXG59KTtcclxudmFyIE5hbWVNYXBwaW5nID0gdC5vYmplY3QoXCJOYW1lTWFwcGluZ1wiLCB7XHJcbiAgc291cmNlTmFtZTogdC5zdHJpbmcoKSxcclxuICBjYW5vbmljYWxOYW1lOiB0LnN0cmluZygpXHJcbn0pO1xyXG52YXIgUHJvZHVjdFR5cGUyID0gdC5vYmplY3QoXCJQcm9kdWN0VHlwZVwiLCB7XHJcbiAgZ2V0IGVsZW1lbnRzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUHJvZHVjdFR5cGVFbGVtZW50KTtcclxuICB9XHJcbn0pO1xyXG52YXIgUHJvZHVjdFR5cGVFbGVtZW50ID0gdC5vYmplY3QoXCJQcm9kdWN0VHlwZUVsZW1lbnRcIiwge1xyXG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGdldCBhbGdlYnJhaWNUeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdDb2x1bW5EZWZWOCA9IHQub2JqZWN0KFwiUmF3Q29sdW1uRGVmVjhcIiwge1xyXG4gIGNvbE5hbWU6IHQuc3RyaW5nKCksXHJcbiAgZ2V0IGNvbFR5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVYxMCA9IHQub2JqZWN0KFwiUmF3Q29sdW1uRGVmYXVsdFZhbHVlVjEwXCIsIHtcclxuICBjb2xJZDogdC51MTYoKSxcclxuICB2YWx1ZTogdC5ieXRlQXJyYXkoKVxyXG59KTtcclxudmFyIFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVY5ID0gdC5vYmplY3QoXCJSYXdDb2x1bW5EZWZhdWx0VmFsdWVWOVwiLCB7XHJcbiAgdGFibGU6IHQuc3RyaW5nKCksXHJcbiAgY29sSWQ6IHQudTE2KCksXHJcbiAgdmFsdWU6IHQuYnl0ZUFycmF5KClcclxufSk7XHJcbnZhciBSYXdDb25zdHJhaW50RGF0YVY5ID0gdC5lbnVtKFwiUmF3Q29uc3RyYWludERhdGFWOVwiLCB7XHJcbiAgZ2V0IFVuaXF1ZSgpIHtcclxuICAgIHJldHVybiBSYXdVbmlxdWVDb25zdHJhaW50RGF0YVY5O1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdDb25zdHJhaW50RGVmVjEwID0gdC5vYmplY3QoXCJSYXdDb25zdHJhaW50RGVmVjEwXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICBnZXQgZGF0YSgpIHtcclxuICAgIHJldHVybiBSYXdDb25zdHJhaW50RGF0YVY5O1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdDb25zdHJhaW50RGVmVjggPSB0Lm9iamVjdChcIlJhd0NvbnN0cmFpbnREZWZWOFwiLCB7XHJcbiAgY29uc3RyYWludE5hbWU6IHQuc3RyaW5nKCksXHJcbiAgY29uc3RyYWludHM6IHQudTgoKSxcclxuICBjb2x1bW5zOiB0LmFycmF5KHQudTE2KCkpXHJcbn0pO1xyXG52YXIgUmF3Q29uc3RyYWludERlZlY5ID0gdC5vYmplY3QoXCJSYXdDb25zdHJhaW50RGVmVjlcIiwge1xyXG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGdldCBkYXRhKCkge1xyXG4gICAgcmV0dXJuIFJhd0NvbnN0cmFpbnREYXRhVjk7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd0luZGV4QWxnb3JpdGhtID0gdC5lbnVtKFwiUmF3SW5kZXhBbGdvcml0aG1cIiwge1xyXG4gIEJUcmVlOiB0LmFycmF5KHQudTE2KCkpLFxyXG4gIEhhc2g6IHQuYXJyYXkodC51MTYoKSksXHJcbiAgRGlyZWN0OiB0LnUxNigpXHJcbn0pO1xyXG52YXIgUmF3SW5kZXhEZWZWMTAgPSB0Lm9iamVjdChcIlJhd0luZGV4RGVmVjEwXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICBhY2Nlc3Nvck5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGdldCBhbGdvcml0aG0oKSB7XHJcbiAgICByZXR1cm4gUmF3SW5kZXhBbGdvcml0aG07XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd0luZGV4RGVmVjggPSB0Lm9iamVjdChcIlJhd0luZGV4RGVmVjhcIiwge1xyXG4gIGluZGV4TmFtZTogdC5zdHJpbmcoKSxcclxuICBpc1VuaXF1ZTogdC5ib29sKCksXHJcbiAgZ2V0IGluZGV4VHlwZSgpIHtcclxuICAgIHJldHVybiBJbmRleFR5cGU7XHJcbiAgfSxcclxuICBjb2x1bW5zOiB0LmFycmF5KHQudTE2KCkpXHJcbn0pO1xyXG52YXIgUmF3SW5kZXhEZWZWOSA9IHQub2JqZWN0KFwiUmF3SW5kZXhEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgYWNjZXNzb3JOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICBnZXQgYWxnb3JpdGhtKCkge1xyXG4gICAgcmV0dXJuIFJhd0luZGV4QWxnb3JpdGhtO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdMaWZlQ3ljbGVSZWR1Y2VyRGVmVjEwID0gdC5vYmplY3QoXHJcbiAgXCJSYXdMaWZlQ3ljbGVSZWR1Y2VyRGVmVjEwXCIsXHJcbiAge1xyXG4gICAgZ2V0IGxpZmVjeWNsZVNwZWMoKSB7XHJcbiAgICAgIHJldHVybiBMaWZlY3ljbGU7XHJcbiAgICB9LFxyXG4gICAgZnVuY3Rpb25OYW1lOiB0LnN0cmluZygpXHJcbiAgfVxyXG4pO1xyXG52YXIgUmF3TWlzY01vZHVsZUV4cG9ydFY5ID0gdC5lbnVtKFwiUmF3TWlzY01vZHVsZUV4cG9ydFY5XCIsIHtcclxuICBnZXQgQ29sdW1uRGVmYXVsdFZhbHVlKCkge1xyXG4gICAgcmV0dXJuIFJhd0NvbHVtbkRlZmF1bHRWYWx1ZVY5O1xyXG4gIH0sXHJcbiAgZ2V0IFByb2NlZHVyZSgpIHtcclxuICAgIHJldHVybiBSYXdQcm9jZWR1cmVEZWZWOTtcclxuICB9LFxyXG4gIGdldCBWaWV3KCkge1xyXG4gICAgcmV0dXJuIFJhd1ZpZXdEZWZWOTtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3TW9kdWxlRGVmID0gdC5lbnVtKFwiUmF3TW9kdWxlRGVmXCIsIHtcclxuICBnZXQgVjhCYWNrQ29tcGF0KCkge1xyXG4gICAgcmV0dXJuIFJhd01vZHVsZURlZlY4O1xyXG4gIH0sXHJcbiAgZ2V0IFY5KCkge1xyXG4gICAgcmV0dXJuIFJhd01vZHVsZURlZlY5O1xyXG4gIH0sXHJcbiAgZ2V0IFYxMCgpIHtcclxuICAgIHJldHVybiBSYXdNb2R1bGVEZWZWMTA7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd01vZHVsZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3TW9kdWxlRGVmVjEwXCIsIHtcclxuICBnZXQgc2VjdGlvbnMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdNb2R1bGVEZWZWMTBTZWN0aW9uKTtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3TW9kdWxlRGVmVjEwU2VjdGlvbiA9IHQuZW51bShcIlJhd01vZHVsZURlZlYxMFNlY3Rpb25cIiwge1xyXG4gIGdldCBUeXBlc3BhY2UoKSB7XHJcbiAgICByZXR1cm4gVHlwZXNwYWNlO1xyXG4gIH0sXHJcbiAgZ2V0IFR5cGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VHlwZURlZlYxMCk7XHJcbiAgfSxcclxuICBnZXQgVGFibGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VGFibGVEZWZWMTApO1xyXG4gIH0sXHJcbiAgZ2V0IFJlZHVjZXJzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3UmVkdWNlckRlZlYxMCk7XHJcbiAgfSxcclxuICBnZXQgUHJvY2VkdXJlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1Byb2NlZHVyZURlZlYxMCk7XHJcbiAgfSxcclxuICBnZXQgVmlld3MoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdWaWV3RGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCBTY2hlZHVsZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdTY2hlZHVsZURlZlYxMCk7XHJcbiAgfSxcclxuICBnZXQgTGlmZUN5Y2xlUmVkdWNlcnMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdMaWZlQ3ljbGVSZWR1Y2VyRGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCBSb3dMZXZlbFNlY3VyaXR5KCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Um93TGV2ZWxTZWN1cml0eURlZlY5KTtcclxuICB9LFxyXG4gIGdldCBDYXNlQ29udmVyc2lvblBvbGljeSgpIHtcclxuICAgIHJldHVybiBDYXNlQ29udmVyc2lvblBvbGljeTtcclxuICB9LFxyXG4gIGdldCBFeHBsaWNpdE5hbWVzKCkge1xyXG4gICAgcmV0dXJuIEV4cGxpY2l0TmFtZXM7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd01vZHVsZURlZlY4ID0gdC5vYmplY3QoXCJSYXdNb2R1bGVEZWZWOFwiLCB7XHJcbiAgZ2V0IHR5cGVzcGFjZSgpIHtcclxuICAgIHJldHVybiBUeXBlc3BhY2U7XHJcbiAgfSxcclxuICBnZXQgdGFibGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoVGFibGVEZXNjKTtcclxuICB9LFxyXG4gIGdldCByZWR1Y2VycygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJlZHVjZXJEZWYpO1xyXG4gIH0sXHJcbiAgZ2V0IG1pc2NFeHBvcnRzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoTWlzY01vZHVsZUV4cG9ydCk7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd01vZHVsZURlZlY5ID0gdC5vYmplY3QoXCJSYXdNb2R1bGVEZWZWOVwiLCB7XHJcbiAgZ2V0IHR5cGVzcGFjZSgpIHtcclxuICAgIHJldHVybiBUeXBlc3BhY2U7XHJcbiAgfSxcclxuICBnZXQgdGFibGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VGFibGVEZWZWOSk7XHJcbiAgfSxcclxuICBnZXQgcmVkdWNlcnMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdSZWR1Y2VyRGVmVjkpO1xyXG4gIH0sXHJcbiAgZ2V0IHR5cGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3VHlwZURlZlY5KTtcclxuICB9LFxyXG4gIGdldCBtaXNjRXhwb3J0cygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd01pc2NNb2R1bGVFeHBvcnRWOSk7XHJcbiAgfSxcclxuICBnZXQgcm93TGV2ZWxTZWN1cml0eSgpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1Jvd0xldmVsU2VjdXJpdHlEZWZWOSk7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd1Byb2NlZHVyZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3UHJvY2VkdXJlRGVmVjEwXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxyXG4gIGdldCBwYXJhbXMoKSB7XHJcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xyXG4gIH0sXHJcbiAgZ2V0IHJldHVyblR5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfSxcclxuICBnZXQgdmlzaWJpbGl0eSgpIHtcclxuICAgIHJldHVybiBGdW5jdGlvblZpc2liaWxpdHk7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd1Byb2NlZHVyZURlZlY5ID0gdC5vYmplY3QoXCJSYXdQcm9jZWR1cmVEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5zdHJpbmcoKSxcclxuICBnZXQgcGFyYW1zKCkge1xyXG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcclxuICB9LFxyXG4gIGdldCByZXR1cm5UeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdSZWR1Y2VyRGVmVjEwID0gdC5vYmplY3QoXCJSYXdSZWR1Y2VyRGVmVjEwXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0LnN0cmluZygpLFxyXG4gIGdldCBwYXJhbXMoKSB7XHJcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xyXG4gIH0sXHJcbiAgZ2V0IHZpc2liaWxpdHkoKSB7XHJcbiAgICByZXR1cm4gRnVuY3Rpb25WaXNpYmlsaXR5O1xyXG4gIH0sXHJcbiAgZ2V0IG9rUmV0dXJuVHlwZSgpIHtcclxuICAgIHJldHVybiBBbGdlYnJhaWNUeXBlMjtcclxuICB9LFxyXG4gIGdldCBlcnJSZXR1cm5UeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdSZWR1Y2VyRGVmVjkgPSB0Lm9iamVjdChcIlJhd1JlZHVjZXJEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5zdHJpbmcoKSxcclxuICBnZXQgcGFyYW1zKCkge1xyXG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcclxuICB9LFxyXG4gIGdldCBsaWZlY3ljbGUoKSB7XHJcbiAgICByZXR1cm4gdC5vcHRpb24oTGlmZWN5Y2xlKTtcclxuICB9XHJcbn0pO1xyXG52YXIgUmF3Um93TGV2ZWxTZWN1cml0eURlZlY5ID0gdC5vYmplY3QoXCJSYXdSb3dMZXZlbFNlY3VyaXR5RGVmVjlcIiwge1xyXG4gIHNxbDogdC5zdHJpbmcoKVxyXG59KTtcclxudmFyIFJhd1NjaGVkdWxlRGVmVjEwID0gdC5vYmplY3QoXCJSYXdTY2hlZHVsZURlZlYxMFwiLCB7XHJcbiAgc291cmNlTmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgdGFibGVOYW1lOiB0LnN0cmluZygpLFxyXG4gIHNjaGVkdWxlQXRDb2w6IHQudTE2KCksXHJcbiAgZnVuY3Rpb25OYW1lOiB0LnN0cmluZygpXHJcbn0pO1xyXG52YXIgUmF3U2NoZWR1bGVEZWZWOSA9IHQub2JqZWN0KFwiUmF3U2NoZWR1bGVEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgcmVkdWNlck5hbWU6IHQuc3RyaW5nKCksXHJcbiAgc2NoZWR1bGVkQXRDb2x1bW46IHQudTE2KClcclxufSk7XHJcbnZhciBSYXdTY29wZWRUeXBlTmFtZVYxMCA9IHQub2JqZWN0KFwiUmF3U2NvcGVkVHlwZU5hbWVWMTBcIiwge1xyXG4gIHNjb3BlOiB0LmFycmF5KHQuc3RyaW5nKCkpLFxyXG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKClcclxufSk7XHJcbnZhciBSYXdTY29wZWRUeXBlTmFtZVY5ID0gdC5vYmplY3QoXCJSYXdTY29wZWRUeXBlTmFtZVY5XCIsIHtcclxuICBzY29wZTogdC5hcnJheSh0LnN0cmluZygpKSxcclxuICBuYW1lOiB0LnN0cmluZygpXHJcbn0pO1xyXG52YXIgUmF3U2VxdWVuY2VEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1NlcXVlbmNlRGVmVjEwXCIsIHtcclxuICBzb3VyY2VOYW1lOiB0Lm9wdGlvbih0LnN0cmluZygpKSxcclxuICBjb2x1bW46IHQudTE2KCksXHJcbiAgc3RhcnQ6IHQub3B0aW9uKHQuaTEyOCgpKSxcclxuICBtaW5WYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxyXG4gIG1heFZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXHJcbiAgaW5jcmVtZW50OiB0LmkxMjgoKVxyXG59KTtcclxudmFyIFJhd1NlcXVlbmNlRGVmVjggPSB0Lm9iamVjdChcIlJhd1NlcXVlbmNlRGVmVjhcIiwge1xyXG4gIHNlcXVlbmNlTmFtZTogdC5zdHJpbmcoKSxcclxuICBjb2xQb3M6IHQudTE2KCksXHJcbiAgaW5jcmVtZW50OiB0LmkxMjgoKSxcclxuICBzdGFydDogdC5vcHRpb24odC5pMTI4KCkpLFxyXG4gIG1pblZhbHVlOiB0Lm9wdGlvbih0LmkxMjgoKSksXHJcbiAgbWF4VmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcclxuICBhbGxvY2F0ZWQ6IHQuaTEyOCgpXHJcbn0pO1xyXG52YXIgUmF3U2VxdWVuY2VEZWZWOSA9IHQub2JqZWN0KFwiUmF3U2VxdWVuY2VEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5vcHRpb24odC5zdHJpbmcoKSksXHJcbiAgY29sdW1uOiB0LnUxNigpLFxyXG4gIHN0YXJ0OiB0Lm9wdGlvbih0LmkxMjgoKSksXHJcbiAgbWluVmFsdWU6IHQub3B0aW9uKHQuaTEyOCgpKSxcclxuICBtYXhWYWx1ZTogdC5vcHRpb24odC5pMTI4KCkpLFxyXG4gIGluY3JlbWVudDogdC5pMTI4KClcclxufSk7XHJcbnZhciBSYXdUYWJsZURlZlYxMCA9IHQub2JqZWN0KFwiUmF3VGFibGVEZWZWMTBcIiwge1xyXG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgcHJvZHVjdFR5cGVSZWY6IHQudTMyKCksXHJcbiAgcHJpbWFyeUtleTogdC5hcnJheSh0LnUxNigpKSxcclxuICBnZXQgaW5kZXhlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd0luZGV4RGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCBjb25zdHJhaW50cygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd0NvbnN0cmFpbnREZWZWMTApO1xyXG4gIH0sXHJcbiAgZ2V0IHNlcXVlbmNlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1NlcXVlbmNlRGVmVjEwKTtcclxuICB9LFxyXG4gIGdldCB0YWJsZVR5cGUoKSB7XHJcbiAgICByZXR1cm4gVGFibGVUeXBlO1xyXG4gIH0sXHJcbiAgZ2V0IHRhYmxlQWNjZXNzKCkge1xyXG4gICAgcmV0dXJuIFRhYmxlQWNjZXNzO1xyXG4gIH0sXHJcbiAgZ2V0IGRlZmF1bHRWYWx1ZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb2x1bW5EZWZhdWx0VmFsdWVWMTApO1xyXG4gIH0sXHJcbiAgaXNFdmVudDogdC5ib29sKClcclxufSk7XHJcbnZhciBSYXdUYWJsZURlZlY4ID0gdC5vYmplY3QoXCJSYXdUYWJsZURlZlY4XCIsIHtcclxuICB0YWJsZU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgZ2V0IGNvbHVtbnMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb2x1bW5EZWZWOCk7XHJcbiAgfSxcclxuICBnZXQgaW5kZXhlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd0luZGV4RGVmVjgpO1xyXG4gIH0sXHJcbiAgZ2V0IGNvbnN0cmFpbnRzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3Q29uc3RyYWludERlZlY4KTtcclxuICB9LFxyXG4gIGdldCBzZXF1ZW5jZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdTZXF1ZW5jZURlZlY4KTtcclxuICB9LFxyXG4gIHRhYmxlVHlwZTogdC5zdHJpbmcoKSxcclxuICB0YWJsZUFjY2VzczogdC5zdHJpbmcoKSxcclxuICBzY2hlZHVsZWQ6IHQub3B0aW9uKHQuc3RyaW5nKCkpXHJcbn0pO1xyXG52YXIgUmF3VGFibGVEZWZWOSA9IHQub2JqZWN0KFwiUmF3VGFibGVEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5zdHJpbmcoKSxcclxuICBwcm9kdWN0VHlwZVJlZjogdC51MzIoKSxcclxuICBwcmltYXJ5S2V5OiB0LmFycmF5KHQudTE2KCkpLFxyXG4gIGdldCBpbmRleGVzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoUmF3SW5kZXhEZWZWOSk7XHJcbiAgfSxcclxuICBnZXQgY29uc3RyYWludHMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShSYXdDb25zdHJhaW50RGVmVjkpO1xyXG4gIH0sXHJcbiAgZ2V0IHNlcXVlbmNlcygpIHtcclxuICAgIHJldHVybiB0LmFycmF5KFJhd1NlcXVlbmNlRGVmVjkpO1xyXG4gIH0sXHJcbiAgZ2V0IHNjaGVkdWxlKCkge1xyXG4gICAgcmV0dXJuIHQub3B0aW9uKFJhd1NjaGVkdWxlRGVmVjkpO1xyXG4gIH0sXHJcbiAgZ2V0IHRhYmxlVHlwZSgpIHtcclxuICAgIHJldHVybiBUYWJsZVR5cGU7XHJcbiAgfSxcclxuICBnZXQgdGFibGVBY2Nlc3MoKSB7XHJcbiAgICByZXR1cm4gVGFibGVBY2Nlc3M7XHJcbiAgfVxyXG59KTtcclxudmFyIFJhd1R5cGVEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1R5cGVEZWZWMTBcIiwge1xyXG4gIGdldCBzb3VyY2VOYW1lKCkge1xyXG4gICAgcmV0dXJuIFJhd1Njb3BlZFR5cGVOYW1lVjEwO1xyXG4gIH0sXHJcbiAgdHk6IHQudTMyKCksXHJcbiAgY3VzdG9tT3JkZXJpbmc6IHQuYm9vbCgpXHJcbn0pO1xyXG52YXIgUmF3VHlwZURlZlY5ID0gdC5vYmplY3QoXCJSYXdUeXBlRGVmVjlcIiwge1xyXG4gIGdldCBuYW1lKCkge1xyXG4gICAgcmV0dXJuIFJhd1Njb3BlZFR5cGVOYW1lVjk7XHJcbiAgfSxcclxuICB0eTogdC51MzIoKSxcclxuICBjdXN0b21PcmRlcmluZzogdC5ib29sKClcclxufSk7XHJcbnZhciBSYXdVbmlxdWVDb25zdHJhaW50RGF0YVY5ID0gdC5vYmplY3QoXHJcbiAgXCJSYXdVbmlxdWVDb25zdHJhaW50RGF0YVY5XCIsXHJcbiAge1xyXG4gICAgY29sdW1uczogdC5hcnJheSh0LnUxNigpKVxyXG4gIH1cclxuKTtcclxudmFyIFJhd1ZpZXdEZWZWMTAgPSB0Lm9iamVjdChcIlJhd1ZpZXdEZWZWMTBcIiwge1xyXG4gIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgaW5kZXg6IHQudTMyKCksXHJcbiAgaXNQdWJsaWM6IHQuYm9vbCgpLFxyXG4gIGlzQW5vbnltb3VzOiB0LmJvb2woKSxcclxuICBnZXQgcGFyYW1zKCkge1xyXG4gICAgcmV0dXJuIFByb2R1Y3RUeXBlMjtcclxuICB9LFxyXG4gIGdldCByZXR1cm5UeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xyXG4gIH1cclxufSk7XHJcbnZhciBSYXdWaWV3RGVmVjkgPSB0Lm9iamVjdChcIlJhd1ZpZXdEZWZWOVwiLCB7XHJcbiAgbmFtZTogdC5zdHJpbmcoKSxcclxuICBpbmRleDogdC51MzIoKSxcclxuICBpc1B1YmxpYzogdC5ib29sKCksXHJcbiAgaXNBbm9ueW1vdXM6IHQuYm9vbCgpLFxyXG4gIGdldCBwYXJhbXMoKSB7XHJcbiAgICByZXR1cm4gUHJvZHVjdFR5cGUyO1xyXG4gIH0sXHJcbiAgZ2V0IHJldHVyblR5cGUoKSB7XHJcbiAgICByZXR1cm4gQWxnZWJyYWljVHlwZTI7XHJcbiAgfVxyXG59KTtcclxudmFyIFJlZHVjZXJEZWYgPSB0Lm9iamVjdChcIlJlZHVjZXJEZWZcIiwge1xyXG4gIG5hbWU6IHQuc3RyaW5nKCksXHJcbiAgZ2V0IGFyZ3MoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShQcm9kdWN0VHlwZUVsZW1lbnQpO1xyXG4gIH1cclxufSk7XHJcbnZhciBTdW1UeXBlMiA9IHQub2JqZWN0KFwiU3VtVHlwZVwiLCB7XHJcbiAgZ2V0IHZhcmlhbnRzKCkge1xyXG4gICAgcmV0dXJuIHQuYXJyYXkoU3VtVHlwZVZhcmlhbnQpO1xyXG4gIH1cclxufSk7XHJcbnZhciBTdW1UeXBlVmFyaWFudCA9IHQub2JqZWN0KFwiU3VtVHlwZVZhcmlhbnRcIiwge1xyXG4gIG5hbWU6IHQub3B0aW9uKHQuc3RyaW5nKCkpLFxyXG4gIGdldCBhbGdlYnJhaWNUeXBlKCkge1xyXG4gICAgcmV0dXJuIEFsZ2VicmFpY1R5cGUyO1xyXG4gIH1cclxufSk7XHJcbnZhciBUYWJsZUFjY2VzcyA9IHQuZW51bShcIlRhYmxlQWNjZXNzXCIsIHtcclxuICBQdWJsaWM6IHQudW5pdCgpLFxyXG4gIFByaXZhdGU6IHQudW5pdCgpXHJcbn0pO1xyXG52YXIgVGFibGVEZXNjID0gdC5vYmplY3QoXCJUYWJsZURlc2NcIiwge1xyXG4gIGdldCBzY2hlbWEoKSB7XHJcbiAgICByZXR1cm4gUmF3VGFibGVEZWZWODtcclxuICB9LFxyXG4gIGRhdGE6IHQudTMyKClcclxufSk7XHJcbnZhciBUYWJsZVR5cGUgPSB0LmVudW0oXCJUYWJsZVR5cGVcIiwge1xyXG4gIFN5c3RlbTogdC51bml0KCksXHJcbiAgVXNlcjogdC51bml0KClcclxufSk7XHJcbnZhciBUeXBlQWxpYXMgPSB0Lm9iamVjdChcIlR5cGVBbGlhc1wiLCB7XHJcbiAgbmFtZTogdC5zdHJpbmcoKSxcclxuICB0eTogdC51MzIoKVxyXG59KTtcclxudmFyIFR5cGVzcGFjZSA9IHQub2JqZWN0KFwiVHlwZXNwYWNlXCIsIHtcclxuICBnZXQgdHlwZXMoKSB7XHJcbiAgICByZXR1cm4gdC5hcnJheShBbGdlYnJhaWNUeXBlMik7XHJcbiAgfVxyXG59KTtcclxudmFyIFZpZXdSZXN1bHRIZWFkZXIgPSB0LmVudW0oXCJWaWV3UmVzdWx0SGVhZGVyXCIsIHtcclxuICBSb3dEYXRhOiB0LnVuaXQoKSxcclxuICBSYXdTcWw6IHQuc3RyaW5nKClcclxufSk7XHJcblxyXG4vLyBzcmMvbGliL3NjaGVtYS50c1xyXG5mdW5jdGlvbiB0YWJsZVRvU2NoZW1hKGFjY05hbWUsIHNjaGVtYTIsIHRhYmxlRGVmKSB7XHJcbiAgY29uc3QgZ2V0Q29sTmFtZSA9IChpKSA9PiBzY2hlbWEyLnJvd1R5cGUuYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50c1tpXS5uYW1lO1xyXG4gIHJldHVybiB7XHJcbiAgICAvLyBGb3IgY2xpZW50LGBzY2hhbWEudGFibGVOYW1lYCB3aWxsIGFsd2F5cyBiZSB0aGVyZSBhcyBjYW5vbmljYWwgbmFtZS5cclxuICAgIC8vIEZvciBtb2R1bGUsIGlmIGV4cGxpY2l0IG5hbWUgaXMgbm90IHByb3ZpZGVkIHZpYSBgbmFtZWAsIGFjY2Vzc29yIG5hbWUgd2lsbFxyXG4gICAgLy8gYmUgdXNlZCwgaXQgaXMgc3RvcmVkIGFzIGFsaWFzIGluIGRhdGFiYXNlLCBoZW5jZSB3b3JrcyBpbiBxdWVyeSBidWlsZGVyLlxyXG4gICAgc291cmNlTmFtZTogc2NoZW1hMi50YWJsZU5hbWUgfHwgYWNjTmFtZSxcclxuICAgIGFjY2Vzc29yTmFtZTogYWNjTmFtZSxcclxuICAgIGNvbHVtbnM6IHNjaGVtYTIucm93VHlwZS5yb3csXHJcbiAgICAvLyB0eXBlZCBhcyBUW2ldWydyb3dUeXBlJ11bJ3JvdyddIHVuZGVyIFRhYmxlc1RvU2NoZW1hPFQ+XHJcbiAgICByb3dUeXBlOiBzY2hlbWEyLnJvd1NwYWNldGltZVR5cGUsXHJcbiAgICBjb25zdHJhaW50czogdGFibGVEZWYuY29uc3RyYWludHMubWFwKChjKSA9PiAoe1xyXG4gICAgICBuYW1lOiBjLnNvdXJjZU5hbWUsXHJcbiAgICAgIGNvbnN0cmFpbnQ6IFwidW5pcXVlXCIsXHJcbiAgICAgIGNvbHVtbnM6IGMuZGF0YS52YWx1ZS5jb2x1bW5zLm1hcChnZXRDb2xOYW1lKVxyXG4gICAgfSkpLFxyXG4gICAgLy8gVE9ETzogaG9ycmlibGUgaG9ycmlibGUgaG9ycmlibGUuIHdlIHNtdWdnbGUgdGhpcyBgQXJyYXk8VW50eXBlZEluZGV4PmBcclxuICAgIC8vIGJ5IGNhc3RpbmcgaXQgdG8gYW4gYEFycmF5PEluZGV4T3B0cz5gIGFzIGBUYWJsZVRvU2NoZW1hYCBleHBlY3RzLlxyXG4gICAgLy8gVGhpcyBpcyB0aGVuIHVzZWQgaW4gYFRhYmxlQ2FjaGVJbXBsLmNvbnN0cnVjdG9yYCBhbmQgd2hvIGtub3dzIHdoZXJlIGVsc2UuXHJcbiAgICAvLyBXZSBzaG91bGQgc3RvcCBseWluZyBhYm91dCBvdXIgdHlwZXMuXHJcbiAgICBpbmRleGVzOiB0YWJsZURlZi5pbmRleGVzLm1hcCgoaWR4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGNvbHVtbklkcyA9IGlkeC5hbGdvcml0aG0udGFnID09PSBcIkRpcmVjdFwiID8gW2lkeC5hbGdvcml0aG0udmFsdWVdIDogaWR4LmFsZ29yaXRobS52YWx1ZTtcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBuYW1lOiBpZHguYWNjZXNzb3JOYW1lLFxyXG4gICAgICAgIHVuaXF1ZTogdGFibGVEZWYuY29uc3RyYWludHMuc29tZShcclxuICAgICAgICAgIChjKSA9PiBjLmRhdGEudmFsdWUuY29sdW1ucy5ldmVyeSgoY29sKSA9PiBjb2x1bW5JZHMuaW5jbHVkZXMoY29sKSlcclxuICAgICAgICApLFxyXG4gICAgICAgIGFsZ29yaXRobTogaWR4LmFsZ29yaXRobS50YWcudG9Mb3dlckNhc2UoKSxcclxuICAgICAgICBjb2x1bW5zOiBjb2x1bW5JZHMubWFwKGdldENvbE5hbWUpXHJcbiAgICAgIH07XHJcbiAgICB9KSxcclxuICAgIHRhYmxlRGVmLFxyXG4gICAgLi4udGFibGVEZWYuaXNFdmVudCA/IHsgaXNFdmVudDogdHJ1ZSB9IDoge31cclxuICB9O1xyXG59XHJcbnZhciBNb2R1bGVDb250ZXh0ID0gY2xhc3Mge1xyXG4gICNjb21wb3VuZFR5cGVzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcclxuICAvKipcclxuICAgKiBUaGUgZ2xvYmFsIG1vZHVsZSBkZWZpbml0aW9uIHRoYXQgZ2V0cyBwb3B1bGF0ZWQgYnkgY2FsbHMgdG8gYHJlZHVjZXIoKWAgYW5kIGxpZmVjeWNsZSBob29rcy5cclxuICAgKi9cclxuICAjbW9kdWxlRGVmID0ge1xyXG4gICAgdHlwZXNwYWNlOiB7IHR5cGVzOiBbXSB9LFxyXG4gICAgdGFibGVzOiBbXSxcclxuICAgIHJlZHVjZXJzOiBbXSxcclxuICAgIHR5cGVzOiBbXSxcclxuICAgIHJvd0xldmVsU2VjdXJpdHk6IFtdLFxyXG4gICAgc2NoZWR1bGVzOiBbXSxcclxuICAgIHByb2NlZHVyZXM6IFtdLFxyXG4gICAgdmlld3M6IFtdLFxyXG4gICAgbGlmZUN5Y2xlUmVkdWNlcnM6IFtdLFxyXG4gICAgY2FzZUNvbnZlcnNpb25Qb2xpY3k6IHsgdGFnOiBcIlNuYWtlQ2FzZVwiIH0sXHJcbiAgICBleHBsaWNpdE5hbWVzOiB7XHJcbiAgICAgIGVudHJpZXM6IFtdXHJcbiAgICB9XHJcbiAgfTtcclxuICBnZXQgbW9kdWxlRGVmKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI21vZHVsZURlZjtcclxuICB9XHJcbiAgcmF3TW9kdWxlRGVmVjEwKCkge1xyXG4gICAgY29uc3Qgc2VjdGlvbnMgPSBbXTtcclxuICAgIGNvbnN0IHB1c2ggPSAocykgPT4ge1xyXG4gICAgICBpZiAocykgc2VjdGlvbnMucHVzaChzKTtcclxuICAgIH07XHJcbiAgICBjb25zdCBtb2R1bGUgPSB0aGlzLiNtb2R1bGVEZWY7XHJcbiAgICBwdXNoKG1vZHVsZS50eXBlc3BhY2UgJiYgeyB0YWc6IFwiVHlwZXNwYWNlXCIsIHZhbHVlOiBtb2R1bGUudHlwZXNwYWNlIH0pO1xyXG4gICAgcHVzaChtb2R1bGUudHlwZXMgJiYgeyB0YWc6IFwiVHlwZXNcIiwgdmFsdWU6IG1vZHVsZS50eXBlcyB9KTtcclxuICAgIHB1c2gobW9kdWxlLnRhYmxlcyAmJiB7IHRhZzogXCJUYWJsZXNcIiwgdmFsdWU6IG1vZHVsZS50YWJsZXMgfSk7XHJcbiAgICBwdXNoKG1vZHVsZS5yZWR1Y2VycyAmJiB7IHRhZzogXCJSZWR1Y2Vyc1wiLCB2YWx1ZTogbW9kdWxlLnJlZHVjZXJzIH0pO1xyXG4gICAgcHVzaChtb2R1bGUucHJvY2VkdXJlcyAmJiB7IHRhZzogXCJQcm9jZWR1cmVzXCIsIHZhbHVlOiBtb2R1bGUucHJvY2VkdXJlcyB9KTtcclxuICAgIHB1c2gobW9kdWxlLnZpZXdzICYmIHsgdGFnOiBcIlZpZXdzXCIsIHZhbHVlOiBtb2R1bGUudmlld3MgfSk7XHJcbiAgICBwdXNoKG1vZHVsZS5zY2hlZHVsZXMgJiYgeyB0YWc6IFwiU2NoZWR1bGVzXCIsIHZhbHVlOiBtb2R1bGUuc2NoZWR1bGVzIH0pO1xyXG4gICAgcHVzaChcclxuICAgICAgbW9kdWxlLmxpZmVDeWNsZVJlZHVjZXJzICYmIHtcclxuICAgICAgICB0YWc6IFwiTGlmZUN5Y2xlUmVkdWNlcnNcIixcclxuICAgICAgICB2YWx1ZTogbW9kdWxlLmxpZmVDeWNsZVJlZHVjZXJzXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICBwdXNoKFxyXG4gICAgICBtb2R1bGUucm93TGV2ZWxTZWN1cml0eSAmJiB7XHJcbiAgICAgICAgdGFnOiBcIlJvd0xldmVsU2VjdXJpdHlcIixcclxuICAgICAgICB2YWx1ZTogbW9kdWxlLnJvd0xldmVsU2VjdXJpdHlcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHB1c2goXHJcbiAgICAgIG1vZHVsZS5leHBsaWNpdE5hbWVzICYmIHtcclxuICAgICAgICB0YWc6IFwiRXhwbGljaXROYW1lc1wiLFxyXG4gICAgICAgIHZhbHVlOiBtb2R1bGUuZXhwbGljaXROYW1lc1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgcHVzaChcclxuICAgICAgbW9kdWxlLmNhc2VDb252ZXJzaW9uUG9saWN5ICYmIHtcclxuICAgICAgICB0YWc6IFwiQ2FzZUNvbnZlcnNpb25Qb2xpY3lcIixcclxuICAgICAgICB2YWx1ZTogbW9kdWxlLmNhc2VDb252ZXJzaW9uUG9saWN5XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICByZXR1cm4geyBzZWN0aW9ucyB9O1xyXG4gIH1cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGNhc2UgY29udmVyc2lvbiBwb2xpY3kgZm9yIHRoaXMgbW9kdWxlLlxyXG4gICAqIENhbGxlZCBieSB0aGUgc2V0dGluZ3MgbWVjaGFuaXNtLlxyXG4gICAqL1xyXG4gIHNldENhc2VDb252ZXJzaW9uUG9saWN5KHBvbGljeSkge1xyXG4gICAgdGhpcy4jbW9kdWxlRGVmLmNhc2VDb252ZXJzaW9uUG9saWN5ID0gcG9saWN5O1xyXG4gIH1cclxuICBnZXQgdHlwZXNwYWNlKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI21vZHVsZURlZi50eXBlc3BhY2U7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIFJlc29sdmVzIHRoZSBhY3R1YWwgdHlwZSBvZiBhIFR5cGVCdWlsZGVyIGJ5IGZvbGxvd2luZyBpdHMgcmVmZXJlbmNlcyB1bnRpbCBpdCByZWFjaGVzIGEgbm9uLXJlZiB0eXBlLlxyXG4gICAqIEBwYXJhbSB0eXBlc3BhY2UgVGhlIHR5cGVzcGFjZSB0byByZXNvbHZlIHR5cGVzIGFnYWluc3QuXHJcbiAgICogQHBhcmFtIHR5cGVCdWlsZGVyIFRoZSBUeXBlQnVpbGRlciB0byByZXNvbHZlLlxyXG4gICAqIEByZXR1cm5zIFRoZSByZXNvbHZlZCBhbGdlYnJhaWMgdHlwZS5cclxuICAgKi9cclxuICByZXNvbHZlVHlwZSh0eXBlQnVpbGRlcikge1xyXG4gICAgbGV0IHR5ID0gdHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZTtcclxuICAgIHdoaWxlICh0eS50YWcgPT09IFwiUmVmXCIpIHtcclxuICAgICAgdHkgPSB0aGlzLnR5cGVzcGFjZS50eXBlc1t0eS52YWx1ZV07XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSB0eXBlIHRvIHRoZSBtb2R1bGUgZGVmaW5pdGlvbidzIHR5cGVzcGFjZSBhcyBhIGBSZWZgIGlmIGl0IGlzIGEgbmFtZWQgY29tcG91bmQgdHlwZSAoUHJvZHVjdCBvciBTdW0pLlxyXG4gICAqIE90aGVyd2lzZSwgcmV0dXJucyB0aGUgdHlwZSBhcyBpcy5cclxuICAgKiBAcGFyYW0gbmFtZVxyXG4gICAqIEBwYXJhbSB0eVxyXG4gICAqIEByZXR1cm5zXHJcbiAgICovXHJcbiAgcmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyKSB7XHJcbiAgICBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBQcm9kdWN0QnVpbGRlciAmJiAhaXNVbml0KHR5cGVCdWlsZGVyKSB8fCB0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFN1bUJ1aWxkZXIgfHwgdHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLiNyZWdpc3RlckNvbXBvdW5kVHlwZVJlY3Vyc2l2ZWx5KHR5cGVCdWlsZGVyKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBPcHRpb25CdWlsZGVyKSB7XHJcbiAgICAgIHJldHVybiBuZXcgT3B0aW9uQnVpbGRlcihcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlci52YWx1ZSlcclxuICAgICAgKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBSZXN1bHRCdWlsZGVyKSB7XHJcbiAgICAgIHJldHVybiBuZXcgUmVzdWx0QnVpbGRlcihcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlci5vayksXHJcbiAgICAgICAgdGhpcy5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkodHlwZUJ1aWxkZXIuZXJyKVxyXG4gICAgICApO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIEFycmF5QnVpbGRlcikge1xyXG4gICAgICByZXR1cm4gbmV3IEFycmF5QnVpbGRlcihcclxuICAgICAgICB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh0eXBlQnVpbGRlci5lbGVtZW50KVxyXG4gICAgICApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHR5cGVCdWlsZGVyO1xyXG4gICAgfVxyXG4gIH1cclxuICAjcmVnaXN0ZXJDb21wb3VuZFR5cGVSZWN1cnNpdmVseSh0eXBlQnVpbGRlcikge1xyXG4gICAgY29uc3QgdHkgPSB0eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlO1xyXG4gICAgY29uc3QgbmFtZSA9IHR5cGVCdWlsZGVyLnR5cGVOYW1lO1xyXG4gICAgaWYgKG5hbWUgPT09IHZvaWQgMCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgYE1pc3NpbmcgdHlwZSBuYW1lIGZvciAke3R5cGVCdWlsZGVyLmNvbnN0cnVjdG9yLm5hbWUgPz8gXCJUeXBlQnVpbGRlclwifSAke0pTT04uc3RyaW5naWZ5KHR5cGVCdWlsZGVyKX1gXHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICBsZXQgciA9IHRoaXMuI2NvbXBvdW5kVHlwZXMuZ2V0KHR5KTtcclxuICAgIGlmIChyICE9IG51bGwpIHtcclxuICAgICAgcmV0dXJuIHI7XHJcbiAgICB9XHJcbiAgICBjb25zdCBuZXdUeSA9IHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUm93QnVpbGRlciB8fCB0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFByb2R1Y3RCdWlsZGVyID8ge1xyXG4gICAgICB0YWc6IFwiUHJvZHVjdFwiLFxyXG4gICAgICB2YWx1ZTogeyBlbGVtZW50czogW10gfVxyXG4gICAgfSA6IHtcclxuICAgICAgdGFnOiBcIlN1bVwiLFxyXG4gICAgICB2YWx1ZTogeyB2YXJpYW50czogW10gfVxyXG4gICAgfTtcclxuICAgIHIgPSBuZXcgUmVmQnVpbGRlcih0aGlzLiNtb2R1bGVEZWYudHlwZXNwYWNlLnR5cGVzLmxlbmd0aCk7XHJcbiAgICB0aGlzLiNtb2R1bGVEZWYudHlwZXNwYWNlLnR5cGVzLnB1c2gobmV3VHkpO1xyXG4gICAgdGhpcy4jY29tcG91bmRUeXBlcy5zZXQodHksIHIpO1xyXG4gICAgaWYgKHR5cGVCdWlsZGVyIGluc3RhbmNlb2YgUm93QnVpbGRlcikge1xyXG4gICAgICBmb3IgKGNvbnN0IFtuYW1lMiwgZWxlbV0gb2YgT2JqZWN0LmVudHJpZXModHlwZUJ1aWxkZXIucm93KSkge1xyXG4gICAgICAgIG5ld1R5LnZhbHVlLmVsZW1lbnRzLnB1c2goe1xyXG4gICAgICAgICAgbmFtZTogbmFtZTIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShlbGVtLnR5cGVCdWlsZGVyKS5hbGdlYnJhaWNUeXBlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAodHlwZUJ1aWxkZXIgaW5zdGFuY2VvZiBQcm9kdWN0QnVpbGRlcikge1xyXG4gICAgICBmb3IgKGNvbnN0IFtuYW1lMiwgZWxlbV0gb2YgT2JqZWN0LmVudHJpZXModHlwZUJ1aWxkZXIuZWxlbWVudHMpKSB7XHJcbiAgICAgICAgbmV3VHkudmFsdWUuZWxlbWVudHMucHVzaCh7XHJcbiAgICAgICAgICBuYW1lOiBuYW1lMixcclxuICAgICAgICAgIGFsZ2VicmFpY1R5cGU6IHRoaXMucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KGVsZW0pLmFsZ2VicmFpY1R5cGVcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh0eXBlQnVpbGRlciBpbnN0YW5jZW9mIFN1bUJ1aWxkZXIpIHtcclxuICAgICAgZm9yIChjb25zdCBbbmFtZTIsIHZhcmlhbnRdIG9mIE9iamVjdC5lbnRyaWVzKHR5cGVCdWlsZGVyLnZhcmlhbnRzKSkge1xyXG4gICAgICAgIG5ld1R5LnZhbHVlLnZhcmlhbnRzLnB1c2goe1xyXG4gICAgICAgICAgbmFtZTogbmFtZTIsXHJcbiAgICAgICAgICBhbGdlYnJhaWNUeXBlOiB0aGlzLnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseSh2YXJpYW50KS5hbGdlYnJhaWNUeXBlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuI21vZHVsZURlZi50eXBlcy5wdXNoKHtcclxuICAgICAgc291cmNlTmFtZTogc3BsaXROYW1lKG5hbWUpLFxyXG4gICAgICB0eTogci5yZWYsXHJcbiAgICAgIGN1c3RvbU9yZGVyaW5nOiB0cnVlXHJcbiAgICB9KTtcclxuICAgIHJldHVybiByO1xyXG4gIH1cclxufTtcclxuZnVuY3Rpb24gaXNVbml0KHR5cGVCdWlsZGVyKSB7XHJcbiAgcmV0dXJuIHR5cGVCdWlsZGVyLnR5cGVOYW1lID09IG51bGwgJiYgdHlwZUJ1aWxkZXIuYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cy5sZW5ndGggPT09IDA7XHJcbn1cclxuZnVuY3Rpb24gc3BsaXROYW1lKG5hbWUpIHtcclxuICBjb25zdCBzY29wZSA9IG5hbWUuc3BsaXQoXCIuXCIpO1xyXG4gIHJldHVybiB7IHNvdXJjZU5hbWU6IHNjb3BlLnBvcCgpLCBzY29wZSB9O1xyXG59XHJcblxyXG4vLyBzcmMvc2VydmVyL2h0dHBfaW50ZXJuYWwudHNcclxudmFyIGltcG9ydF9zdGF0dXNlcyA9IF9fdG9FU00ocmVxdWlyZV9zdGF0dXNlcygpKTtcclxuXHJcbi8vIHNyYy9zZXJ2ZXIvcmFuZ2UudHNcclxudmFyIFJhbmdlID0gY2xhc3Mge1xyXG4gICNmcm9tO1xyXG4gICN0bztcclxuICBjb25zdHJ1Y3Rvcihmcm9tLCB0bykge1xyXG4gICAgdGhpcy4jZnJvbSA9IGZyb20gPz8geyB0YWc6IFwidW5ib3VuZGVkXCIgfTtcclxuICAgIHRoaXMuI3RvID0gdG8gPz8geyB0YWc6IFwidW5ib3VuZGVkXCIgfTtcclxuICB9XHJcbiAgZ2V0IGZyb20oKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jZnJvbTtcclxuICB9XHJcbiAgZ2V0IHRvKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI3RvO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9saWIvdGFibGUudHNcclxuZnVuY3Rpb24gdGFibGUob3B0cywgcm93LCAuLi5fKSB7XHJcbiAgY29uc3Qge1xyXG4gICAgbmFtZSxcclxuICAgIHB1YmxpYzogaXNQdWJsaWMgPSBmYWxzZSxcclxuICAgIGluZGV4ZXM6IHVzZXJJbmRleGVzID0gW10sXHJcbiAgICBzY2hlZHVsZWQsXHJcbiAgICBldmVudDogaXNFdmVudCA9IGZhbHNlXHJcbiAgfSA9IG9wdHM7XHJcbiAgY29uc3QgY29sSWRzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcclxuICBjb25zdCBjb2xOYW1lTGlzdCA9IFtdO1xyXG4gIGlmICghKHJvdyBpbnN0YW5jZW9mIFJvd0J1aWxkZXIpKSB7XHJcbiAgICByb3cgPSBuZXcgUm93QnVpbGRlcihyb3cpO1xyXG4gIH1cclxuICByb3cuYWxnZWJyYWljVHlwZS52YWx1ZS5lbGVtZW50cy5mb3JFYWNoKChlbGVtLCBpKSA9PiB7XHJcbiAgICBjb2xJZHMuc2V0KGVsZW0ubmFtZSwgaSk7XHJcbiAgICBjb2xOYW1lTGlzdC5wdXNoKGVsZW0ubmFtZSk7XHJcbiAgfSk7XHJcbiAgY29uc3QgcGsgPSBbXTtcclxuICBjb25zdCBpbmRleGVzID0gW107XHJcbiAgY29uc3QgY29uc3RyYWludHMgPSBbXTtcclxuICBjb25zdCBzZXF1ZW5jZXMgPSBbXTtcclxuICBsZXQgc2NoZWR1bGVBdENvbDtcclxuICBjb25zdCBkZWZhdWx0VmFsdWVzID0gW107XHJcbiAgZm9yIChjb25zdCBbbmFtZTIsIGJ1aWxkZXJdIG9mIE9iamVjdC5lbnRyaWVzKHJvdy5yb3cpKSB7XHJcbiAgICBjb25zdCBtZXRhID0gYnVpbGRlci5jb2x1bW5NZXRhZGF0YTtcclxuICAgIGlmIChtZXRhLmlzUHJpbWFyeUtleSkge1xyXG4gICAgICBway5wdXNoKGNvbElkcy5nZXQobmFtZTIpKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGlzVW5pcXVlID0gbWV0YS5pc1VuaXF1ZSB8fCBtZXRhLmlzUHJpbWFyeUtleTtcclxuICAgIGlmIChtZXRhLmluZGV4VHlwZSB8fCBpc1VuaXF1ZSkge1xyXG4gICAgICBjb25zdCBhbGdvID0gbWV0YS5pbmRleFR5cGUgPz8gXCJidHJlZVwiO1xyXG4gICAgICBjb25zdCBpZCA9IGNvbElkcy5nZXQobmFtZTIpO1xyXG4gICAgICBsZXQgYWxnb3JpdGhtO1xyXG4gICAgICBzd2l0Y2ggKGFsZ28pIHtcclxuICAgICAgICBjYXNlIFwiYnRyZWVcIjpcclxuICAgICAgICAgIGFsZ29yaXRobSA9IFJhd0luZGV4QWxnb3JpdGhtLkJUcmVlKFtpZF0pO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcImhhc2hcIjpcclxuICAgICAgICAgIGFsZ29yaXRobSA9IFJhd0luZGV4QWxnb3JpdGhtLkhhc2goW2lkXSk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiZGlyZWN0XCI6XHJcbiAgICAgICAgICBhbGdvcml0aG0gPSBSYXdJbmRleEFsZ29yaXRobS5EaXJlY3QoaWQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgaW5kZXhlcy5wdXNoKHtcclxuICAgICAgICBzb3VyY2VOYW1lOiB2b2lkIDAsXHJcbiAgICAgICAgLy8gVW5uYW1lZCBpbmRleGVzIHdpbGwgYmUgYXNzaWduZWQgYSBnbG9iYWxseSB1bmlxdWUgbmFtZVxyXG4gICAgICAgIGFjY2Vzc29yTmFtZTogbmFtZTIsXHJcbiAgICAgICAgYWxnb3JpdGhtXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzVW5pcXVlKSB7XHJcbiAgICAgIGNvbnN0cmFpbnRzLnB1c2goe1xyXG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcclxuICAgICAgICBkYXRhOiB7IHRhZzogXCJVbmlxdWVcIiwgdmFsdWU6IHsgY29sdW1uczogW2NvbElkcy5nZXQobmFtZTIpXSB9IH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAobWV0YS5pc0F1dG9JbmNyZW1lbnQpIHtcclxuICAgICAgc2VxdWVuY2VzLnB1c2goe1xyXG4gICAgICAgIHNvdXJjZU5hbWU6IHZvaWQgMCxcclxuICAgICAgICBzdGFydDogdm9pZCAwLFxyXG4gICAgICAgIG1pblZhbHVlOiB2b2lkIDAsXHJcbiAgICAgICAgbWF4VmFsdWU6IHZvaWQgMCxcclxuICAgICAgICBjb2x1bW46IGNvbElkcy5nZXQobmFtZTIpLFxyXG4gICAgICAgIGluY3JlbWVudDogMW5cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAobWV0YS5kZWZhdWx0VmFsdWUpIHtcclxuICAgICAgY29uc3Qgd3JpdGVyID0gbmV3IEJpbmFyeVdyaXRlcigxNik7XHJcbiAgICAgIGJ1aWxkZXIuc2VyaWFsaXplKHdyaXRlciwgbWV0YS5kZWZhdWx0VmFsdWUpO1xyXG4gICAgICBkZWZhdWx0VmFsdWVzLnB1c2goe1xyXG4gICAgICAgIGNvbElkOiBjb2xJZHMuZ2V0KG5hbWUyKSxcclxuICAgICAgICB2YWx1ZTogd3JpdGVyLmdldEJ1ZmZlcigpXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKHNjaGVkdWxlZCkge1xyXG4gICAgICBjb25zdCBhbGdlYnJhaWNUeXBlID0gYnVpbGRlci50eXBlQnVpbGRlci5hbGdlYnJhaWNUeXBlO1xyXG4gICAgICBpZiAoc2NoZWR1bGVfYXRfZGVmYXVsdC5pc1NjaGVkdWxlQXQoYWxnZWJyYWljVHlwZSkpIHtcclxuICAgICAgICBzY2hlZHVsZUF0Q29sID0gY29sSWRzLmdldChuYW1lMik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgZm9yIChjb25zdCBpbmRleE9wdHMgb2YgdXNlckluZGV4ZXMgPz8gW10pIHtcclxuICAgIGxldCBhbGdvcml0aG07XHJcbiAgICBzd2l0Y2ggKGluZGV4T3B0cy5hbGdvcml0aG0pIHtcclxuICAgICAgY2FzZSBcImJ0cmVlXCI6XHJcbiAgICAgICAgYWxnb3JpdGhtID0ge1xyXG4gICAgICAgICAgdGFnOiBcIkJUcmVlXCIsXHJcbiAgICAgICAgICB2YWx1ZTogaW5kZXhPcHRzLmNvbHVtbnMubWFwKChjKSA9PiBjb2xJZHMuZ2V0KGMpKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgXCJoYXNoXCI6XHJcbiAgICAgICAgYWxnb3JpdGhtID0ge1xyXG4gICAgICAgICAgdGFnOiBcIkhhc2hcIixcclxuICAgICAgICAgIHZhbHVlOiBpbmRleE9wdHMuY29sdW1ucy5tYXAoKGMpID0+IGNvbElkcy5nZXQoYykpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcImRpcmVjdFwiOlxyXG4gICAgICAgIGFsZ29yaXRobSA9IHsgdGFnOiBcIkRpcmVjdFwiLCB2YWx1ZTogY29sSWRzLmdldChpbmRleE9wdHMuY29sdW1uKSB9O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgaW5kZXhlcy5wdXNoKHtcclxuICAgICAgc291cmNlTmFtZTogdm9pZCAwLFxyXG4gICAgICBhY2Nlc3Nvck5hbWU6IGluZGV4T3B0cy5hY2Nlc3NvcixcclxuICAgICAgYWxnb3JpdGhtLFxyXG4gICAgICBjYW5vbmljYWxOYW1lOiBpbmRleE9wdHMubmFtZVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGZvciAoY29uc3QgY29uc3RyYWludE9wdHMgb2Ygb3B0cy5jb25zdHJhaW50cyA/PyBbXSkge1xyXG4gICAgaWYgKGNvbnN0cmFpbnRPcHRzLmNvbnN0cmFpbnQgPT09IFwidW5pcXVlXCIpIHtcclxuICAgICAgY29uc3QgZGF0YSA9IHtcclxuICAgICAgICB0YWc6IFwiVW5pcXVlXCIsXHJcbiAgICAgICAgdmFsdWU6IHsgY29sdW1uczogY29uc3RyYWludE9wdHMuY29sdW1ucy5tYXAoKGMpID0+IGNvbElkcy5nZXQoYykpIH1cclxuICAgICAgfTtcclxuICAgICAgY29uc3RyYWludHMucHVzaCh7IHNvdXJjZU5hbWU6IGNvbnN0cmFpbnRPcHRzLm5hbWUsIGRhdGEgfSk7XHJcbiAgICAgIGNvbnRpbnVlO1xyXG4gICAgfVxyXG4gIH1cclxuICBjb25zdCBwcm9kdWN0VHlwZSA9IHJvdy5hbGdlYnJhaWNUeXBlLnZhbHVlO1xyXG4gIGNvbnN0IHNjaGVkdWxlID0gc2NoZWR1bGVkICYmIHNjaGVkdWxlQXRDb2wgIT09IHZvaWQgMCA/IHsgc2NoZWR1bGVBdENvbCwgcmVkdWNlcjogc2NoZWR1bGVkIH0gOiB2b2lkIDA7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJvd1R5cGU6IHJvdyxcclxuICAgIHRhYmxlTmFtZTogbmFtZSxcclxuICAgIHJvd1NwYWNldGltZVR5cGU6IHByb2R1Y3RUeXBlLFxyXG4gICAgdGFibGVEZWY6IChjdHgsIGFjY05hbWUpID0+IHtcclxuICAgICAgY29uc3QgdGFibGVOYW1lID0gbmFtZSA/PyBhY2NOYW1lO1xyXG4gICAgICBpZiAocm93LnR5cGVOYW1lID09PSB2b2lkIDApIHtcclxuICAgICAgICByb3cudHlwZU5hbWUgPSB0b1Bhc2NhbENhc2UodGFibGVOYW1lKTtcclxuICAgICAgfVxyXG4gICAgICBmb3IgKGNvbnN0IGluZGV4IG9mIGluZGV4ZXMpIHtcclxuICAgICAgICBjb25zdCBjb2xzID0gaW5kZXguYWxnb3JpdGhtLnRhZyA9PT0gXCJEaXJlY3RcIiA/IFtpbmRleC5hbGdvcml0aG0udmFsdWVdIDogaW5kZXguYWxnb3JpdGhtLnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGNvbFMgPSBjb2xzLm1hcCgoaSkgPT4gY29sTmFtZUxpc3RbaV0pLmpvaW4oXCJfXCIpO1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZU5hbWUgPSBpbmRleC5zb3VyY2VOYW1lID0gYCR7YWNjTmFtZX1fJHtjb2xTfV9pZHhfJHtpbmRleC5hbGdvcml0aG0udGFnLnRvTG93ZXJDYXNlKCl9YDtcclxuICAgICAgICBjb25zdCB7IGNhbm9uaWNhbE5hbWUgfSA9IGluZGV4O1xyXG4gICAgICAgIGlmIChjYW5vbmljYWxOYW1lICE9PSB2b2lkIDApIHtcclxuICAgICAgICAgIGN0eC5tb2R1bGVEZWYuZXhwbGljaXROYW1lcy5lbnRyaWVzLnB1c2goXHJcbiAgICAgICAgICAgIEV4cGxpY2l0TmFtZUVudHJ5LkluZGV4KHsgc291cmNlTmFtZSwgY2Fub25pY2FsTmFtZSB9KVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzb3VyY2VOYW1lOiBhY2NOYW1lLFxyXG4gICAgICAgIHByb2R1Y3RUeXBlUmVmOiBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHJvdykucmVmLFxyXG4gICAgICAgIHByaW1hcnlLZXk6IHBrLFxyXG4gICAgICAgIGluZGV4ZXMsXHJcbiAgICAgICAgY29uc3RyYWludHMsXHJcbiAgICAgICAgc2VxdWVuY2VzLFxyXG4gICAgICAgIHRhYmxlVHlwZTogeyB0YWc6IFwiVXNlclwiIH0sXHJcbiAgICAgICAgdGFibGVBY2Nlc3M6IHsgdGFnOiBpc1B1YmxpYyA/IFwiUHVibGljXCIgOiBcIlByaXZhdGVcIiB9LFxyXG4gICAgICAgIGRlZmF1bHRWYWx1ZXMsXHJcbiAgICAgICAgaXNFdmVudFxyXG4gICAgICB9O1xyXG4gICAgfSxcclxuICAgIGlkeHM6IHt9LFxyXG4gICAgY29uc3RyYWludHMsXHJcbiAgICBzY2hlZHVsZVxyXG4gIH07XHJcbn1cclxuXHJcbi8vIHNyYy9saWIvcXVlcnkudHNcclxudmFyIFF1ZXJ5QnJhbmQgPSBTeW1ib2woXCJRdWVyeUJyYW5kXCIpO1xyXG52YXIgaXNSb3dUeXBlZFF1ZXJ5ID0gKHZhbCkgPT4gISF2YWwgJiYgdHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIiAmJiBRdWVyeUJyYW5kIGluIHZhbDtcclxudmFyIGlzVHlwZWRRdWVyeSA9ICh2YWwpID0+ICEhdmFsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgUXVlcnlCcmFuZCBpbiB2YWw7XHJcbmZ1bmN0aW9uIHRvU3FsKHEpIHtcclxuICByZXR1cm4gcS50b1NxbCgpO1xyXG59XHJcbnZhciBTZW1pam9pbkltcGwgPSBjbGFzcyBfU2VtaWpvaW5JbXBsIHtcclxuICBjb25zdHJ1Y3Rvcihzb3VyY2VRdWVyeSwgZmlsdGVyUXVlcnksIGpvaW5Db25kaXRpb24pIHtcclxuICAgIHRoaXMuc291cmNlUXVlcnkgPSBzb3VyY2VRdWVyeTtcclxuICAgIHRoaXMuZmlsdGVyUXVlcnkgPSBmaWx0ZXJRdWVyeTtcclxuICAgIHRoaXMuam9pbkNvbmRpdGlvbiA9IGpvaW5Db25kaXRpb247XHJcbiAgICBpZiAoc291cmNlUXVlcnkudGFibGUuc291cmNlTmFtZSA9PT0gZmlsdGVyUXVlcnkudGFibGUuc291cmNlTmFtZSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3Qgc2VtaWpvaW4gYSB0YWJsZSB0byBpdHNlbGZcIik7XHJcbiAgICB9XHJcbiAgfVxyXG4gIFtRdWVyeUJyYW5kXSA9IHRydWU7XHJcbiAgdHlwZSA9IFwic2VtaWpvaW5cIjtcclxuICBidWlsZCgpIHtcclxuICAgIHJldHVybiB0aGlzO1xyXG4gIH1cclxuICB3aGVyZShwcmVkaWNhdGUpIHtcclxuICAgIGNvbnN0IG5leHRTb3VyY2VRdWVyeSA9IHRoaXMuc291cmNlUXVlcnkud2hlcmUocHJlZGljYXRlKTtcclxuICAgIHJldHVybiBuZXcgX1NlbWlqb2luSW1wbChcclxuICAgICAgbmV4dFNvdXJjZVF1ZXJ5LFxyXG4gICAgICB0aGlzLmZpbHRlclF1ZXJ5LFxyXG4gICAgICB0aGlzLmpvaW5Db25kaXRpb25cclxuICAgICk7XHJcbiAgfVxyXG4gIHRvU3FsKCkge1xyXG4gICAgY29uc3QgbGVmdCA9IHRoaXMuZmlsdGVyUXVlcnk7XHJcbiAgICBjb25zdCByaWdodCA9IHRoaXMuc291cmNlUXVlcnk7XHJcbiAgICBjb25zdCBsZWZ0VGFibGUgPSBxdW90ZUlkZW50aWZpZXIobGVmdC50YWJsZS5zb3VyY2VOYW1lKTtcclxuICAgIGNvbnN0IHJpZ2h0VGFibGUgPSBxdW90ZUlkZW50aWZpZXIocmlnaHQudGFibGUuc291cmNlTmFtZSk7XHJcbiAgICBsZXQgc3FsID0gYFNFTEVDVCAke3JpZ2h0VGFibGV9LiogRlJPTSAke2xlZnRUYWJsZX0gSk9JTiAke3JpZ2h0VGFibGV9IE9OICR7Ym9vbGVhbkV4cHJUb1NxbCh0aGlzLmpvaW5Db25kaXRpb24pfWA7XHJcbiAgICBjb25zdCBjbGF1c2VzID0gW107XHJcbiAgICBpZiAobGVmdC53aGVyZUNsYXVzZSkge1xyXG4gICAgICBjbGF1c2VzLnB1c2goYm9vbGVhbkV4cHJUb1NxbChsZWZ0LndoZXJlQ2xhdXNlKSk7XHJcbiAgICB9XHJcbiAgICBpZiAocmlnaHQud2hlcmVDbGF1c2UpIHtcclxuICAgICAgY2xhdXNlcy5wdXNoKGJvb2xlYW5FeHByVG9TcWwocmlnaHQud2hlcmVDbGF1c2UpKTtcclxuICAgIH1cclxuICAgIGlmIChjbGF1c2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgY29uc3Qgd2hlcmVTcWwgPSBjbGF1c2VzLmxlbmd0aCA9PT0gMSA/IGNsYXVzZXNbMF0gOiBjbGF1c2VzLm1hcCh3cmFwSW5QYXJlbnMpLmpvaW4oXCIgQU5EIFwiKTtcclxuICAgICAgc3FsICs9IGAgV0hFUkUgJHt3aGVyZVNxbH1gO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNxbDtcclxuICB9XHJcbn07XHJcbnZhciBGcm9tQnVpbGRlciA9IGNsYXNzIF9Gcm9tQnVpbGRlciB7XHJcbiAgY29uc3RydWN0b3IodGFibGUyLCB3aGVyZUNsYXVzZSkge1xyXG4gICAgdGhpcy50YWJsZSA9IHRhYmxlMjtcclxuICAgIHRoaXMud2hlcmVDbGF1c2UgPSB3aGVyZUNsYXVzZTtcclxuICB9XHJcbiAgW1F1ZXJ5QnJhbmRdID0gdHJ1ZTtcclxuICB3aGVyZShwcmVkaWNhdGUpIHtcclxuICAgIGNvbnN0IG5ld0NvbmRpdGlvbiA9IHByZWRpY2F0ZSh0aGlzLnRhYmxlLmNvbHMpO1xyXG4gICAgY29uc3QgbmV4dFdoZXJlID0gdGhpcy53aGVyZUNsYXVzZSA/IHRoaXMud2hlcmVDbGF1c2UuYW5kKG5ld0NvbmRpdGlvbikgOiBuZXdDb25kaXRpb247XHJcbiAgICByZXR1cm4gbmV3IF9Gcm9tQnVpbGRlcih0aGlzLnRhYmxlLCBuZXh0V2hlcmUpO1xyXG4gIH1cclxuICByaWdodFNlbWlqb2luKHJpZ2h0LCBvbikge1xyXG4gICAgY29uc3Qgc291cmNlUXVlcnkgPSBuZXcgX0Zyb21CdWlsZGVyKHJpZ2h0KTtcclxuICAgIGNvbnN0IGpvaW5Db25kaXRpb24gPSBvbihcclxuICAgICAgdGhpcy50YWJsZS5pbmRleGVkQ29scyxcclxuICAgICAgcmlnaHQuaW5kZXhlZENvbHNcclxuICAgICk7XHJcbiAgICByZXR1cm4gbmV3IFNlbWlqb2luSW1wbChzb3VyY2VRdWVyeSwgdGhpcywgam9pbkNvbmRpdGlvbik7XHJcbiAgfVxyXG4gIGxlZnRTZW1pam9pbihyaWdodCwgb24pIHtcclxuICAgIGNvbnN0IGZpbHRlclF1ZXJ5ID0gbmV3IF9Gcm9tQnVpbGRlcihyaWdodCk7XHJcbiAgICBjb25zdCBqb2luQ29uZGl0aW9uID0gb24oXHJcbiAgICAgIHRoaXMudGFibGUuaW5kZXhlZENvbHMsXHJcbiAgICAgIHJpZ2h0LmluZGV4ZWRDb2xzXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIG5ldyBTZW1pam9pbkltcGwodGhpcywgZmlsdGVyUXVlcnksIGpvaW5Db25kaXRpb24pO1xyXG4gIH1cclxuICB0b1NxbCgpIHtcclxuICAgIHJldHVybiByZW5kZXJTZWxlY3RTcWxXaXRoSm9pbnModGhpcy50YWJsZSwgdGhpcy53aGVyZUNsYXVzZSk7XHJcbiAgfVxyXG4gIGJ1aWxkKCkge1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG59O1xyXG52YXIgVGFibGVSZWZJbXBsID0gY2xhc3Mge1xyXG4gIFtRdWVyeUJyYW5kXSA9IHRydWU7XHJcbiAgdHlwZSA9IFwidGFibGVcIjtcclxuICBzb3VyY2VOYW1lO1xyXG4gIGFjY2Vzc29yTmFtZTtcclxuICBjb2xzO1xyXG4gIGluZGV4ZWRDb2xzO1xyXG4gIHRhYmxlRGVmO1xyXG4gIC8vIERlbGVnYXRlIFVudHlwZWRUYWJsZURlZiBwcm9wZXJ0aWVzIGZyb20gdGFibGVEZWYgc28gdGhpcyBjYW4gYmUgdXNlZCBhcyBhIHRhYmxlIGRlZi5cclxuICBnZXQgY29sdW1ucygpIHtcclxuICAgIHJldHVybiB0aGlzLnRhYmxlRGVmLmNvbHVtbnM7XHJcbiAgfVxyXG4gIGdldCBpbmRleGVzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudGFibGVEZWYuaW5kZXhlcztcclxuICB9XHJcbiAgZ2V0IHJvd1R5cGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50YWJsZURlZi5yb3dUeXBlO1xyXG4gIH1cclxuICBnZXQgY29uc3RyYWludHMoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50YWJsZURlZi5jb25zdHJhaW50cztcclxuICB9XHJcbiAgY29uc3RydWN0b3IodGFibGVEZWYpIHtcclxuICAgIHRoaXMuc291cmNlTmFtZSA9IHRhYmxlRGVmLnNvdXJjZU5hbWU7XHJcbiAgICB0aGlzLmFjY2Vzc29yTmFtZSA9IHRhYmxlRGVmLmFjY2Vzc29yTmFtZTtcclxuICAgIHRoaXMuY29scyA9IGNyZWF0ZVJvd0V4cHIodGFibGVEZWYpO1xyXG4gICAgdGhpcy5pbmRleGVkQ29scyA9IHRoaXMuY29scztcclxuICAgIHRoaXMudGFibGVEZWYgPSB0YWJsZURlZjtcclxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XHJcbiAgfVxyXG4gIGFzRnJvbSgpIHtcclxuICAgIHJldHVybiBuZXcgRnJvbUJ1aWxkZXIodGhpcyk7XHJcbiAgfVxyXG4gIHJpZ2h0U2VtaWpvaW4ob3RoZXIsIG9uKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hc0Zyb20oKS5yaWdodFNlbWlqb2luKG90aGVyLCBvbik7XHJcbiAgfVxyXG4gIGxlZnRTZW1pam9pbihvdGhlciwgb24pIHtcclxuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLmxlZnRTZW1pam9pbihvdGhlciwgb24pO1xyXG4gIH1cclxuICBidWlsZCgpIHtcclxuICAgIHJldHVybiB0aGlzLmFzRnJvbSgpLmJ1aWxkKCk7XHJcbiAgfVxyXG4gIHRvU3FsKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXNGcm9tKCkudG9TcWwoKTtcclxuICB9XHJcbiAgd2hlcmUocHJlZGljYXRlKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hc0Zyb20oKS53aGVyZShwcmVkaWNhdGUpO1xyXG4gIH1cclxufTtcclxuZnVuY3Rpb24gY3JlYXRlVGFibGVSZWZGcm9tRGVmKHRhYmxlRGVmKSB7XHJcbiAgcmV0dXJuIG5ldyBUYWJsZVJlZkltcGwodGFibGVEZWYpO1xyXG59XHJcbmZ1bmN0aW9uIG1ha2VRdWVyeUJ1aWxkZXIoc2NoZW1hMikge1xyXG4gIGNvbnN0IHFiID0gLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgZm9yIChjb25zdCB0YWJsZTIgb2YgT2JqZWN0LnZhbHVlcyhzY2hlbWEyLnRhYmxlcykpIHtcclxuICAgIGNvbnN0IHJlZiA9IGNyZWF0ZVRhYmxlUmVmRnJvbURlZihcclxuICAgICAgdGFibGUyXHJcbiAgICApO1xyXG4gICAgcWJbdGFibGUyLmFjY2Vzc29yTmFtZV0gPSByZWY7XHJcbiAgfVxyXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHFiKTtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGVSb3dFeHByKHRhYmxlRGVmKSB7XHJcbiAgY29uc3Qgcm93ID0ge307XHJcbiAgZm9yIChjb25zdCBjb2x1bW5OYW1lIG9mIE9iamVjdC5rZXlzKHRhYmxlRGVmLmNvbHVtbnMpKSB7XHJcbiAgICBjb25zdCBjb2x1bW5CdWlsZGVyID0gdGFibGVEZWYuY29sdW1uc1tjb2x1bW5OYW1lXTtcclxuICAgIGNvbnN0IGNvbHVtbiA9IG5ldyBDb2x1bW5FeHByZXNzaW9uKFxyXG4gICAgICB0YWJsZURlZi5zb3VyY2VOYW1lLFxyXG4gICAgICBjb2x1bW5OYW1lLFxyXG4gICAgICBjb2x1bW5CdWlsZGVyLnR5cGVCdWlsZGVyLmFsZ2VicmFpY1R5cGVcclxuICAgICk7XHJcbiAgICByb3dbY29sdW1uTmFtZV0gPSBPYmplY3QuZnJlZXplKGNvbHVtbik7XHJcbiAgfVxyXG4gIHJldHVybiBPYmplY3QuZnJlZXplKHJvdyk7XHJcbn1cclxuZnVuY3Rpb24gcmVuZGVyU2VsZWN0U3FsV2l0aEpvaW5zKHRhYmxlMiwgd2hlcmUsIGV4dHJhQ2xhdXNlcyA9IFtdKSB7XHJcbiAgY29uc3QgcXVvdGVkVGFibGUgPSBxdW90ZUlkZW50aWZpZXIodGFibGUyLnNvdXJjZU5hbWUpO1xyXG4gIGNvbnN0IHNxbCA9IGBTRUxFQ1QgKiBGUk9NICR7cXVvdGVkVGFibGV9YDtcclxuICBjb25zdCBjbGF1c2VzID0gW107XHJcbiAgaWYgKHdoZXJlKSBjbGF1c2VzLnB1c2goYm9vbGVhbkV4cHJUb1NxbCh3aGVyZSkpO1xyXG4gIGNsYXVzZXMucHVzaCguLi5leHRyYUNsYXVzZXMpO1xyXG4gIGlmIChjbGF1c2VzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHNxbDtcclxuICBjb25zdCB3aGVyZVNxbCA9IGNsYXVzZXMubGVuZ3RoID09PSAxID8gY2xhdXNlc1swXSA6IGNsYXVzZXMubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBBTkQgXCIpO1xyXG4gIHJldHVybiBgJHtzcWx9IFdIRVJFICR7d2hlcmVTcWx9YDtcclxufVxyXG52YXIgQ29sdW1uRXhwcmVzc2lvbiA9IGNsYXNzIHtcclxuICB0eXBlID0gXCJjb2x1bW5cIjtcclxuICBjb2x1bW47XHJcbiAgdGFibGU7XHJcbiAgLy8gcGhhbnRvbTogYWN0dWFsIHJ1bnRpbWUgdmFsdWUgaXMgdW5kZWZpbmVkXHJcbiAgdHNWYWx1ZVR5cGU7XHJcbiAgc3BhY2V0aW1lVHlwZTtcclxuICBjb25zdHJ1Y3Rvcih0YWJsZTIsIGNvbHVtbiwgc3BhY2V0aW1lVHlwZSkge1xyXG4gICAgdGhpcy50YWJsZSA9IHRhYmxlMjtcclxuICAgIHRoaXMuY29sdW1uID0gY29sdW1uO1xyXG4gICAgdGhpcy5zcGFjZXRpbWVUeXBlID0gc3BhY2V0aW1lVHlwZTtcclxuICB9XHJcbiAgZXEoeCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICAgIHR5cGU6IFwiZXFcIixcclxuICAgICAgbGVmdDogdGhpcyxcclxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXHJcbiAgICB9KTtcclxuICB9XHJcbiAgbmUoeCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICAgIHR5cGU6IFwibmVcIixcclxuICAgICAgbGVmdDogdGhpcyxcclxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXHJcbiAgICB9KTtcclxuICB9XHJcbiAgbHQoeCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICAgIHR5cGU6IFwibHRcIixcclxuICAgICAgbGVmdDogdGhpcyxcclxuICAgICAgcmlnaHQ6IG5vcm1hbGl6ZVZhbHVlKHgpXHJcbiAgICB9KTtcclxuICB9XHJcbiAgbHRlKHgpIHtcclxuICAgIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoe1xyXG4gICAgICB0eXBlOiBcImx0ZVwiLFxyXG4gICAgICBsZWZ0OiB0aGlzLFxyXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcclxuICAgIH0pO1xyXG4gIH1cclxuICBndCh4KSB7XHJcbiAgICByZXR1cm4gbmV3IEJvb2xlYW5FeHByKHtcclxuICAgICAgdHlwZTogXCJndFwiLFxyXG4gICAgICBsZWZ0OiB0aGlzLFxyXG4gICAgICByaWdodDogbm9ybWFsaXplVmFsdWUoeClcclxuICAgIH0pO1xyXG4gIH1cclxuICBndGUoeCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICAgIHR5cGU6IFwiZ3RlXCIsXHJcbiAgICAgIGxlZnQ6IHRoaXMsXHJcbiAgICAgIHJpZ2h0OiBub3JtYWxpemVWYWx1ZSh4KVxyXG4gICAgfSk7XHJcbiAgfVxyXG59O1xyXG5mdW5jdGlvbiBsaXRlcmFsKHZhbHVlKSB7XHJcbiAgcmV0dXJuIHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlIH07XHJcbn1cclxuZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsKSB7XHJcbiAgaWYgKHZhbC50eXBlID09PSBcImxpdGVyYWxcIilcclxuICAgIHJldHVybiB2YWw7XHJcbiAgaWYgKHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCIgJiYgdmFsICE9IG51bGwgJiYgXCJ0eXBlXCIgaW4gdmFsICYmIHZhbC50eXBlID09PSBcImNvbHVtblwiKSB7XHJcbiAgICByZXR1cm4gdmFsO1xyXG4gIH1cclxuICByZXR1cm4gbGl0ZXJhbCh2YWwpO1xyXG59XHJcbnZhciBCb29sZWFuRXhwciA9IGNsYXNzIF9Cb29sZWFuRXhwciB7XHJcbiAgY29uc3RydWN0b3IoZGF0YSkge1xyXG4gICAgdGhpcy5kYXRhID0gZGF0YTtcclxuICB9XHJcbiAgYW5kKG90aGVyKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Cb29sZWFuRXhwcih7IHR5cGU6IFwiYW5kXCIsIGNsYXVzZXM6IFt0aGlzLmRhdGEsIG90aGVyLmRhdGFdIH0pO1xyXG4gIH1cclxuICBvcihvdGhlcikge1xyXG4gICAgcmV0dXJuIG5ldyBfQm9vbGVhbkV4cHIoeyB0eXBlOiBcIm9yXCIsIGNsYXVzZXM6IFt0aGlzLmRhdGEsIG90aGVyLmRhdGFdIH0pO1xyXG4gIH1cclxuICBub3QoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9Cb29sZWFuRXhwcih7IHR5cGU6IFwibm90XCIsIGNsYXVzZTogdGhpcy5kYXRhIH0pO1xyXG4gIH1cclxufTtcclxuZnVuY3Rpb24gbm90KGNsYXVzZSkge1xyXG4gIHJldHVybiBuZXcgQm9vbGVhbkV4cHIoeyB0eXBlOiBcIm5vdFwiLCBjbGF1c2U6IGNsYXVzZS5kYXRhIH0pO1xyXG59XHJcbmZ1bmN0aW9uIGFuZCguLi5jbGF1c2VzKSB7XHJcbiAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICB0eXBlOiBcImFuZFwiLFxyXG4gICAgY2xhdXNlczogY2xhdXNlcy5tYXAoKGMpID0+IGMuZGF0YSlcclxuICB9KTtcclxufVxyXG5mdW5jdGlvbiBvciguLi5jbGF1c2VzKSB7XHJcbiAgcmV0dXJuIG5ldyBCb29sZWFuRXhwcih7XHJcbiAgICB0eXBlOiBcIm9yXCIsXHJcbiAgICBjbGF1c2VzOiBjbGF1c2VzLm1hcCgoYykgPT4gYy5kYXRhKVxyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIGJvb2xlYW5FeHByVG9TcWwoZXhwciwgdGFibGVBbGlhcykge1xyXG4gIGNvbnN0IGRhdGEgPSBleHByIGluc3RhbmNlb2YgQm9vbGVhbkV4cHIgPyBleHByLmRhdGEgOiBleHByO1xyXG4gIHN3aXRjaCAoZGF0YS50eXBlKSB7XHJcbiAgICBjYXNlIFwiZXFcIjpcclxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9ID0gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xyXG4gICAgY2FzZSBcIm5lXCI6XHJcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA8PiAke3ZhbHVlRXhwclRvU3FsKGRhdGEucmlnaHQpfWA7XHJcbiAgICBjYXNlIFwiZ3RcIjpcclxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9ID4gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xyXG4gICAgY2FzZSBcImd0ZVwiOlxyXG4gICAgICByZXR1cm4gYCR7dmFsdWVFeHByVG9TcWwoZGF0YS5sZWZ0KX0gPj0gJHt2YWx1ZUV4cHJUb1NxbChkYXRhLnJpZ2h0KX1gO1xyXG4gICAgY2FzZSBcImx0XCI6XHJcbiAgICAgIHJldHVybiBgJHt2YWx1ZUV4cHJUb1NxbChkYXRhLmxlZnQpfSA8ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcclxuICAgIGNhc2UgXCJsdGVcIjpcclxuICAgICAgcmV0dXJuIGAke3ZhbHVlRXhwclRvU3FsKGRhdGEubGVmdCl9IDw9ICR7dmFsdWVFeHByVG9TcWwoZGF0YS5yaWdodCl9YDtcclxuICAgIGNhc2UgXCJhbmRcIjpcclxuICAgICAgcmV0dXJuIGRhdGEuY2xhdXNlcy5tYXAoKGMpID0+IGJvb2xlYW5FeHByVG9TcWwoYykpLm1hcCh3cmFwSW5QYXJlbnMpLmpvaW4oXCIgQU5EIFwiKTtcclxuICAgIGNhc2UgXCJvclwiOlxyXG4gICAgICByZXR1cm4gZGF0YS5jbGF1c2VzLm1hcCgoYykgPT4gYm9vbGVhbkV4cHJUb1NxbChjKSkubWFwKHdyYXBJblBhcmVucykuam9pbihcIiBPUiBcIik7XHJcbiAgICBjYXNlIFwibm90XCI6XHJcbiAgICAgIHJldHVybiBgTk9UICR7d3JhcEluUGFyZW5zKGJvb2xlYW5FeHByVG9TcWwoZGF0YS5jbGF1c2UpKX1gO1xyXG4gIH1cclxufVxyXG5mdW5jdGlvbiB3cmFwSW5QYXJlbnMoc3FsKSB7XHJcbiAgcmV0dXJuIGAoJHtzcWx9KWA7XHJcbn1cclxuZnVuY3Rpb24gdmFsdWVFeHByVG9TcWwoZXhwciwgdGFibGVBbGlhcykge1xyXG4gIGlmIChpc0xpdGVyYWxFeHByKGV4cHIpKSB7XHJcbiAgICByZXR1cm4gbGl0ZXJhbFZhbHVlVG9TcWwoZXhwci52YWx1ZSk7XHJcbiAgfVxyXG4gIGNvbnN0IHRhYmxlMiA9IGV4cHIudGFibGU7XHJcbiAgcmV0dXJuIGAke3F1b3RlSWRlbnRpZmllcih0YWJsZTIpfS4ke3F1b3RlSWRlbnRpZmllcihleHByLmNvbHVtbil9YDtcclxufVxyXG5mdW5jdGlvbiBsaXRlcmFsVmFsdWVUb1NxbCh2YWx1ZSkge1xyXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdm9pZCAwKSB7XHJcbiAgICByZXR1cm4gXCJOVUxMXCI7XHJcbiAgfVxyXG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIElkZW50aXR5IHx8IHZhbHVlIGluc3RhbmNlb2YgQ29ubmVjdGlvbklkKSB7XHJcbiAgICByZXR1cm4gYDB4JHt2YWx1ZS50b0hleFN0cmluZygpfWA7XHJcbiAgfVxyXG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFRpbWVzdGFtcCkge1xyXG4gICAgcmV0dXJuIGAnJHt2YWx1ZS50b0lTT1N0cmluZygpfSdgO1xyXG4gIH1cclxuICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xyXG4gICAgY2FzZSBcIm51bWJlclwiOlxyXG4gICAgY2FzZSBcImJpZ2ludFwiOlxyXG4gICAgICByZXR1cm4gU3RyaW5nKHZhbHVlKTtcclxuICAgIGNhc2UgXCJib29sZWFuXCI6XHJcbiAgICAgIHJldHVybiB2YWx1ZSA/IFwiVFJVRVwiIDogXCJGQUxTRVwiO1xyXG4gICAgY2FzZSBcInN0cmluZ1wiOlxyXG4gICAgICByZXR1cm4gYCcke3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYDtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHJldHVybiBgJyR7SlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYDtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gcXVvdGVJZGVudGlmaWVyKG5hbWUpIHtcclxuICByZXR1cm4gYFwiJHtuYW1lLnJlcGxhY2UoL1wiL2csICdcIlwiJyl9XCJgO1xyXG59XHJcbmZ1bmN0aW9uIGlzTGl0ZXJhbEV4cHIoZXhwcikge1xyXG4gIHJldHVybiBleHByLnR5cGUgPT09IFwibGl0ZXJhbFwiO1xyXG59XHJcbmZ1bmN0aW9uIGV2YWx1YXRlQm9vbGVhbkV4cHIoZXhwciwgcm93KSB7XHJcbiAgcmV0dXJuIGV2YWx1YXRlRGF0YShleHByLmRhdGEsIHJvdyk7XHJcbn1cclxuZnVuY3Rpb24gZXZhbHVhdGVEYXRhKGRhdGEsIHJvdykge1xyXG4gIHN3aXRjaCAoZGF0YS50eXBlKSB7XHJcbiAgICBjYXNlIFwiZXFcIjpcclxuICAgICAgcmV0dXJuIHJlc29sdmVWYWx1ZShkYXRhLmxlZnQsIHJvdykgPT09IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xyXG4gICAgY2FzZSBcIm5lXCI6XHJcbiAgICAgIHJldHVybiByZXNvbHZlVmFsdWUoZGF0YS5sZWZ0LCByb3cpICE9PSByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcclxuICAgIGNhc2UgXCJndFwiOlxyXG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA+IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xyXG4gICAgY2FzZSBcImd0ZVwiOlxyXG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA+PSByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcclxuICAgIGNhc2UgXCJsdFwiOlxyXG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA8IHJlc29sdmVWYWx1ZShkYXRhLnJpZ2h0LCByb3cpO1xyXG4gICAgY2FzZSBcImx0ZVwiOlxyXG4gICAgICByZXR1cm4gcmVzb2x2ZVZhbHVlKGRhdGEubGVmdCwgcm93KSA8PSByZXNvbHZlVmFsdWUoZGF0YS5yaWdodCwgcm93KTtcclxuICAgIGNhc2UgXCJhbmRcIjpcclxuICAgICAgcmV0dXJuIGRhdGEuY2xhdXNlcy5ldmVyeSgoYykgPT4gZXZhbHVhdGVEYXRhKGMsIHJvdykpO1xyXG4gICAgY2FzZSBcIm9yXCI6XHJcbiAgICAgIHJldHVybiBkYXRhLmNsYXVzZXMuc29tZSgoYykgPT4gZXZhbHVhdGVEYXRhKGMsIHJvdykpO1xyXG4gICAgY2FzZSBcIm5vdFwiOlxyXG4gICAgICByZXR1cm4gIWV2YWx1YXRlRGF0YShkYXRhLmNsYXVzZSwgcm93KTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gcmVzb2x2ZVZhbHVlKGV4cHIsIHJvdykge1xyXG4gIGlmIChpc0xpdGVyYWxFeHByKGV4cHIpKSB7XHJcbiAgICByZXR1cm4gdG9Db21wYXJhYmxlVmFsdWUoZXhwci52YWx1ZSk7XHJcbiAgfVxyXG4gIHJldHVybiB0b0NvbXBhcmFibGVWYWx1ZShyb3dbZXhwci5jb2x1bW5dKTtcclxufVxyXG5mdW5jdGlvbiBpc0hleFNlcmlhbGl6YWJsZUxpa2UodmFsdWUpIHtcclxuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlLnRvSGV4U3RyaW5nID09PSBcImZ1bmN0aW9uXCI7XHJcbn1cclxuZnVuY3Rpb24gaXNUaW1lc3RhbXBMaWtlKHZhbHVlKSB7XHJcbiAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIpIHJldHVybiBmYWxzZTtcclxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBUaW1lc3RhbXApIHJldHVybiB0cnVlO1xyXG4gIGNvbnN0IG1pY3JvcyA9IHZhbHVlW1wiX190aW1lc3RhbXBfbWljcm9zX3NpbmNlX3VuaXhfZXBvY2hfX1wiXTtcclxuICByZXR1cm4gdHlwZW9mIG1pY3JvcyA9PT0gXCJiaWdpbnRcIjtcclxufVxyXG5mdW5jdGlvbiB0b0NvbXBhcmFibGVWYWx1ZSh2YWx1ZSkge1xyXG4gIGlmIChpc0hleFNlcmlhbGl6YWJsZUxpa2UodmFsdWUpKSB7XHJcbiAgICByZXR1cm4gdmFsdWUudG9IZXhTdHJpbmcoKTtcclxuICB9XHJcbiAgaWYgKGlzVGltZXN0YW1wTGlrZSh2YWx1ZSkpIHtcclxuICAgIHJldHVybiB2YWx1ZS5fX3RpbWVzdGFtcF9taWNyb3Nfc2luY2VfdW5peF9lcG9jaF9fO1xyXG4gIH1cclxuICByZXR1cm4gdmFsdWU7XHJcbn1cclxuZnVuY3Rpb24gZ2V0UXVlcnlUYWJsZU5hbWUocXVlcnkpIHtcclxuICBpZiAocXVlcnkudGFibGUpIHJldHVybiBxdWVyeS50YWJsZS5uYW1lO1xyXG4gIGlmIChxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkubmFtZTtcclxuICBpZiAocXVlcnkuc291cmNlUXVlcnkpIHJldHVybiBxdWVyeS5zb3VyY2VRdWVyeS50YWJsZS5uYW1lO1xyXG4gIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBleHRyYWN0IHRhYmxlIG5hbWUgZnJvbSBxdWVyeVwiKTtcclxufVxyXG5mdW5jdGlvbiBnZXRRdWVyeUFjY2Vzc29yTmFtZShxdWVyeSkge1xyXG4gIGlmIChxdWVyeS50YWJsZSkgcmV0dXJuIHF1ZXJ5LnRhYmxlLmFjY2Vzc29yTmFtZTtcclxuICBpZiAocXVlcnkuYWNjZXNzb3JOYW1lKSByZXR1cm4gcXVlcnkuYWNjZXNzb3JOYW1lO1xyXG4gIGlmIChxdWVyeS5zb3VyY2VRdWVyeSkgcmV0dXJuIHF1ZXJ5LnNvdXJjZVF1ZXJ5LnRhYmxlLmFjY2Vzc29yTmFtZTtcclxuICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZXh0cmFjdCBhY2Nlc3NvciBuYW1lIGZyb20gcXVlcnlcIik7XHJcbn1cclxuZnVuY3Rpb24gZ2V0UXVlcnlXaGVyZUNsYXVzZShxdWVyeSkge1xyXG4gIGlmIChxdWVyeS53aGVyZUNsYXVzZSkgcmV0dXJuIHF1ZXJ5LndoZXJlQ2xhdXNlO1xyXG4gIHJldHVybiB2b2lkIDA7XHJcbn1cclxuXHJcbi8vIHNyYy9zZXJ2ZXIvdmlld3MudHNcclxuZnVuY3Rpb24gbWFrZVZpZXdFeHBvcnQoY3R4LCBvcHRzLCBwYXJhbXMsIHJldCwgZm4pIHtcclxuICBjb25zdCB2aWV3RXhwb3J0ID0gKFxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlc2NyaXB0IGluY29ycmVjdGx5IHNheXMgRnVuY3Rpb24jYmluZCByZXF1aXJlcyBhbiBhcmd1bWVudC5cclxuICAgIGZuLmJpbmQoKVxyXG4gICk7XHJcbiAgdmlld0V4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcclxuICB2aWV3RXhwb3J0W3JlZ2lzdGVyRXhwb3J0XSA9IChjdHgyLCBleHBvcnROYW1lKSA9PiB7XHJcbiAgICByZWdpc3RlclZpZXcoY3R4Miwgb3B0cywgZXhwb3J0TmFtZSwgZmFsc2UsIHBhcmFtcywgcmV0LCBmbik7XHJcbiAgfTtcclxuICByZXR1cm4gdmlld0V4cG9ydDtcclxufVxyXG5mdW5jdGlvbiBtYWtlQW5vblZpZXdFeHBvcnQoY3R4LCBvcHRzLCBwYXJhbXMsIHJldCwgZm4pIHtcclxuICBjb25zdCB2aWV3RXhwb3J0ID0gKFxyXG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0eXBlc2NyaXB0IGluY29ycmVjdGx5IHNheXMgRnVuY3Rpb24jYmluZCByZXF1aXJlcyBhbiBhcmd1bWVudC5cclxuICAgIGZuLmJpbmQoKVxyXG4gICk7XHJcbiAgdmlld0V4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcclxuICB2aWV3RXhwb3J0W3JlZ2lzdGVyRXhwb3J0XSA9IChjdHgyLCBleHBvcnROYW1lKSA9PiB7XHJcbiAgICByZWdpc3RlclZpZXcoY3R4Miwgb3B0cywgZXhwb3J0TmFtZSwgdHJ1ZSwgcGFyYW1zLCByZXQsIGZuKTtcclxuICB9O1xyXG4gIHJldHVybiB2aWV3RXhwb3J0O1xyXG59XHJcbmZ1bmN0aW9uIHJlZ2lzdGVyVmlldyhjdHgsIG9wdHMsIGV4cG9ydE5hbWUsIGFub24sIHBhcmFtcywgcmV0LCBmbikge1xyXG4gIGNvbnN0IHBhcmFtc0J1aWxkZXIgPSBuZXcgUm93QnVpbGRlcihwYXJhbXMsIHRvUGFzY2FsQ2FzZShleHBvcnROYW1lKSk7XHJcbiAgbGV0IHJldHVyblR5cGUgPSBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHJldCkuYWxnZWJyYWljVHlwZTtcclxuICBjb25zdCB7IHR5cGVzcGFjZSB9ID0gY3R4O1xyXG4gIGNvbnN0IHsgdmFsdWU6IHBhcmFtVHlwZSB9ID0gY3R4LnJlc29sdmVUeXBlKFxyXG4gICAgY3R4LnJlZ2lzdGVyVHlwZXNSZWN1cnNpdmVseShwYXJhbXNCdWlsZGVyKVxyXG4gICk7XHJcbiAgY3R4Lm1vZHVsZURlZi52aWV3cy5wdXNoKHtcclxuICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXHJcbiAgICBpbmRleDogKGFub24gPyBjdHguYW5vblZpZXdzIDogY3R4LnZpZXdzKS5sZW5ndGgsXHJcbiAgICBpc1B1YmxpYzogb3B0cy5wdWJsaWMsXHJcbiAgICBpc0Fub255bW91czogYW5vbixcclxuICAgIHBhcmFtczogcGFyYW1UeXBlLFxyXG4gICAgcmV0dXJuVHlwZVxyXG4gIH0pO1xyXG4gIGlmIChvcHRzLm5hbWUgIT0gbnVsbCkge1xyXG4gICAgY3R4Lm1vZHVsZURlZi5leHBsaWNpdE5hbWVzLmVudHJpZXMucHVzaCh7XHJcbiAgICAgIHRhZzogXCJGdW5jdGlvblwiLFxyXG4gICAgICB2YWx1ZToge1xyXG4gICAgICAgIHNvdXJjZU5hbWU6IGV4cG9ydE5hbWUsXHJcbiAgICAgICAgY2Fub25pY2FsTmFtZTogb3B0cy5uYW1lXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICBpZiAocmV0dXJuVHlwZS50YWcgPT0gXCJTdW1cIikge1xyXG4gICAgY29uc3Qgb3JpZ2luYWxGbiA9IGZuO1xyXG4gICAgZm4gPSAoKGN0eDIsIGFyZ3MpID0+IHtcclxuICAgICAgY29uc3QgcmV0MiA9IG9yaWdpbmFsRm4oY3R4MiwgYXJncyk7XHJcbiAgICAgIHJldHVybiByZXQyID09IG51bGwgPyBbXSA6IFtyZXQyXTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuVHlwZSA9IEFsZ2VicmFpY1R5cGUuQXJyYXkoXHJcbiAgICAgIHJldHVyblR5cGUudmFsdWUudmFyaWFudHNbMF0uYWxnZWJyYWljVHlwZVxyXG4gICAgKTtcclxuICB9XHJcbiAgKGFub24gPyBjdHguYW5vblZpZXdzIDogY3R4LnZpZXdzKS5wdXNoKHtcclxuICAgIGZuLFxyXG4gICAgZGVzZXJpYWxpemVQYXJhbXM6IFByb2R1Y3RUeXBlLm1ha2VEZXNlcmlhbGl6ZXIocGFyYW1UeXBlLCB0eXBlc3BhY2UpLFxyXG4gICAgc2VyaWFsaXplUmV0dXJuOiBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHJldHVyblR5cGUsIHR5cGVzcGFjZSksXHJcbiAgICByZXR1cm5UeXBlQmFzZVNpemU6IGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCByZXR1cm5UeXBlKVxyXG4gIH0pO1xyXG59XHJcblxyXG4vLyBzcmMvbGliL2Vycm9ycy50c1xyXG52YXIgU2VuZGVyRXJyb3IgPSBjbGFzcyBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XHJcbiAgICBzdXBlcihtZXNzYWdlKTtcclxuICB9XHJcbiAgZ2V0IG5hbWUoKSB7XHJcbiAgICByZXR1cm4gXCJTZW5kZXJFcnJvclwiO1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9zZXJ2ZXIvZXJyb3JzLnRzXHJcbnZhciBTcGFjZXRpbWVIb3N0RXJyb3IgPSBjbGFzcyBleHRlbmRzIEVycm9yIHtcclxuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XHJcbiAgICBzdXBlcihtZXNzYWdlKTtcclxuICB9XHJcbiAgZ2V0IG5hbWUoKSB7XHJcbiAgICByZXR1cm4gXCJTcGFjZXRpbWVIb3N0RXJyb3JcIjtcclxuICB9XHJcbn07XHJcbnZhciBlcnJvckRhdGEgPSB7XHJcbiAgLyoqXHJcbiAgICogQSBnZW5lcmljIGVycm9yIGNsYXNzIGZvciB1bmtub3duIGVycm9yIGNvZGVzLlxyXG4gICAqL1xyXG4gIEhvc3RDYWxsRmFpbHVyZTogMSxcclxuICAvKipcclxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYW4gQUJJIGNhbGwgd2FzIG1hZGUgb3V0c2lkZSBvZiBhIHRyYW5zYWN0aW9uLlxyXG4gICAqL1xyXG4gIE5vdEluVHJhbnNhY3Rpb246IDIsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IEJTQVROIGRlY29kaW5nIGZhaWxlZC5cclxuICAgKiBUaGlzIHR5cGljYWxseSBtZWFucyB0aGF0IHRoZSBkYXRhIGNvdWxkIG5vdCBiZSBkZWNvZGVkIHRvIHRoZSBleHBlY3RlZCB0eXBlLlxyXG4gICAqL1xyXG4gIEJzYXRuRGVjb2RlRXJyb3I6IDMsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgc3BlY2lmaWVkIHRhYmxlIGRvZXMgbm90IGV4aXN0LlxyXG4gICAqL1xyXG4gIE5vU3VjaFRhYmxlOiA0LFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCBpbmRleCBkb2VzIG5vdCBleGlzdC5cclxuICAgKi9cclxuICBOb1N1Y2hJbmRleDogNSxcclxuICAvKipcclxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSBzcGVjaWZpZWQgcm93IGl0ZXJhdG9yIGlzIG5vdCB2YWxpZC5cclxuICAgKi9cclxuICBOb1N1Y2hJdGVyOiA2LFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHNwZWNpZmllZCBjb25zb2xlIHRpbWVyIGRvZXMgbm90IGV4aXN0LlxyXG4gICAqL1xyXG4gIE5vU3VjaENvbnNvbGVUaW1lcjogNyxcclxuICAvKipcclxuICAgKiBFcnJvciBpbmRpY2F0aW5nIHRoYXQgYSBzcGVjaWZpZWQgYnl0ZXMgc291cmNlIG9yIHNpbmsgaXMgbm90IHZhbGlkLlxyXG4gICAqL1xyXG4gIE5vU3VjaEJ5dGVzOiA4LFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhIHByb3ZpZGVkIHNpbmsgaGFzIG5vIG1vcmUgc3BhY2UgbGVmdC5cclxuICAgKi9cclxuICBOb1NwYWNlOiA5LFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCB0aGVyZSBpcyBubyBtb3JlIHNwYWNlIGluIHRoZSBkYXRhYmFzZS5cclxuICAgKi9cclxuICBCdWZmZXJUb29TbWFsbDogMTEsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGEgdmFsdWUgd2l0aCBhIGdpdmVuIHVuaXF1ZSBpZGVudGlmaWVyIGFscmVhZHkgZXhpc3RzLlxyXG4gICAqL1xyXG4gIFVuaXF1ZUFscmVhZHlFeGlzdHM6IDEyLFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCB0aGUgc3BlY2lmaWVkIGRlbGF5IGluIHNjaGVkdWxpbmcgYSByb3cgd2FzIHRvbyBsb25nLlxyXG4gICAqL1xyXG4gIFNjaGVkdWxlQXREZWxheVRvb0xvbmc6IDEzLFxyXG4gIC8qKlxyXG4gICAqIEVycm9yIGluZGljYXRpbmcgdGhhdCBhbiBpbmRleCB3YXMgbm90IHVuaXF1ZSB3aGVuIGl0IHdhcyBleHBlY3RlZCB0byBiZS5cclxuICAgKi9cclxuICBJbmRleE5vdFVuaXF1ZTogMTQsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGFuIGluZGV4IHdhcyBub3QgdW5pcXVlIHdoZW4gaXQgd2FzIGV4cGVjdGVkIHRvIGJlLlxyXG4gICAqL1xyXG4gIE5vU3VjaFJvdzogMTUsXHJcbiAgLyoqXHJcbiAgICogRXJyb3IgaW5kaWNhdGluZyB0aGF0IGFuIGF1dG8taW5jcmVtZW50IHNlcXVlbmNlIGhhcyBvdmVyZmxvd2VkLlxyXG4gICAqL1xyXG4gIEF1dG9JbmNPdmVyZmxvdzogMTYsXHJcbiAgV291bGRCbG9ja1RyYW5zYWN0aW9uOiAxNyxcclxuICBUcmFuc2FjdGlvbk5vdEFub255bW91czogMTgsXHJcbiAgVHJhbnNhY3Rpb25Jc1JlYWRPbmx5OiAxOSxcclxuICBUcmFuc2FjdGlvbklzTXV0OiAyMCxcclxuICBIdHRwRXJyb3I6IDIxXHJcbn07XHJcbmZ1bmN0aW9uIG1hcEVudHJpZXMoeCwgZikge1xyXG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXHJcbiAgICBPYmplY3QuZW50cmllcyh4KS5tYXAoKFtrLCB2XSkgPT4gW2ssIGYoaywgdildKVxyXG4gICk7XHJcbn1cclxudmFyIGVycm5vVG9DbGFzcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XHJcbnZhciBlcnJvcnMgPSBPYmplY3QuZnJlZXplKFxyXG4gIG1hcEVudHJpZXMoZXJyb3JEYXRhLCAobmFtZSwgY29kZSkgPT4ge1xyXG4gICAgY29uc3QgY2xzID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KFxyXG4gICAgICBjbGFzcyBleHRlbmRzIFNwYWNldGltZUhvc3RFcnJvciB7XHJcbiAgICAgICAgZ2V0IG5hbWUoKSB7XHJcbiAgICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIFwibmFtZVwiLFxyXG4gICAgICB7IHZhbHVlOiBuYW1lLCB3cml0YWJsZTogZmFsc2UgfVxyXG4gICAgKTtcclxuICAgIGVycm5vVG9DbGFzcy5zZXQoY29kZSwgY2xzKTtcclxuICAgIHJldHVybiBjbHM7XHJcbiAgfSlcclxuKTtcclxuZnVuY3Rpb24gZ2V0RXJyb3JDb25zdHJ1Y3Rvcihjb2RlKSB7XHJcbiAgcmV0dXJuIGVycm5vVG9DbGFzcy5nZXQoY29kZSkgPz8gU3BhY2V0aW1lSG9zdEVycm9yO1xyXG59XHJcblxyXG4vLyAuLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHVyZS1yYW5kQDcuMC4xL25vZGVfbW9kdWxlcy9wdXJlLXJhbmQvbGliL2VzbS9kaXN0cmlidXRpb24vVW5zYWZlVW5pZm9ybUJpZ0ludERpc3RyaWJ1dGlvbi5qc1xyXG52YXIgU0JpZ0ludCA9IHR5cGVvZiBCaWdJbnQgIT09IFwidW5kZWZpbmVkXCIgPyBCaWdJbnQgOiB2b2lkIDA7XHJcbnZhciBPbmUgPSB0eXBlb2YgQmlnSW50ICE9PSBcInVuZGVmaW5lZFwiID8gQmlnSW50KDEpIDogdm9pZCAwO1xyXG52YXIgVGhpcnR5VHdvID0gdHlwZW9mIEJpZ0ludCAhPT0gXCJ1bmRlZmluZWRcIiA/IEJpZ0ludCgzMikgOiB2b2lkIDA7XHJcbnZhciBOdW1WYWx1ZXMgPSB0eXBlb2YgQmlnSW50ICE9PSBcInVuZGVmaW5lZFwiID8gQmlnSW50KDQyOTQ5NjcyOTYpIDogdm9pZCAwO1xyXG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtQmlnSW50RGlzdHJpYnV0aW9uKGZyb20sIHRvLCBybmcpIHtcclxuICB2YXIgZGlmZiA9IHRvIC0gZnJvbSArIE9uZTtcclxuICB2YXIgRmluYWxOdW1WYWx1ZXMgPSBOdW1WYWx1ZXM7XHJcbiAgdmFyIE51bUl0ZXJhdGlvbnMgPSAxO1xyXG4gIHdoaWxlIChGaW5hbE51bVZhbHVlcyA8IGRpZmYpIHtcclxuICAgIEZpbmFsTnVtVmFsdWVzIDw8PSBUaGlydHlUd287XHJcbiAgICArK051bUl0ZXJhdGlvbnM7XHJcbiAgfVxyXG4gIHZhciB2YWx1ZSA9IGdlbmVyYXRlTmV4dChOdW1JdGVyYXRpb25zLCBybmcpO1xyXG4gIGlmICh2YWx1ZSA8IGRpZmYpIHtcclxuICAgIHJldHVybiB2YWx1ZSArIGZyb207XHJcbiAgfVxyXG4gIGlmICh2YWx1ZSArIGRpZmYgPCBGaW5hbE51bVZhbHVlcykge1xyXG4gICAgcmV0dXJuIHZhbHVlICUgZGlmZiArIGZyb207XHJcbiAgfVxyXG4gIHZhciBNYXhBY2NlcHRlZFJhbmRvbSA9IEZpbmFsTnVtVmFsdWVzIC0gRmluYWxOdW1WYWx1ZXMgJSBkaWZmO1xyXG4gIHdoaWxlICh2YWx1ZSA+PSBNYXhBY2NlcHRlZFJhbmRvbSkge1xyXG4gICAgdmFsdWUgPSBnZW5lcmF0ZU5leHQoTnVtSXRlcmF0aW9ucywgcm5nKTtcclxuICB9XHJcbiAgcmV0dXJuIHZhbHVlICUgZGlmZiArIGZyb207XHJcbn1cclxuZnVuY3Rpb24gZ2VuZXJhdGVOZXh0KE51bUl0ZXJhdGlvbnMsIHJuZykge1xyXG4gIHZhciB2YWx1ZSA9IFNCaWdJbnQocm5nLnVuc2FmZU5leHQoKSArIDIxNDc0ODM2NDgpO1xyXG4gIGZvciAodmFyIG51bSA9IDE7IG51bSA8IE51bUl0ZXJhdGlvbnM7ICsrbnVtKSB7XHJcbiAgICB2YXIgb3V0ID0gcm5nLnVuc2FmZU5leHQoKTtcclxuICAgIHZhbHVlID0gKHZhbHVlIDw8IFRoaXJ0eVR3bykgKyBTQmlnSW50KG91dCArIDIxNDc0ODM2NDgpO1xyXG4gIH1cclxuICByZXR1cm4gdmFsdWU7XHJcbn1cclxuXHJcbi8vIC4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wdXJlLXJhbmRANy4wLjEvbm9kZV9tb2R1bGVzL3B1cmUtcmFuZC9saWIvZXNtL2Rpc3RyaWJ1dGlvbi9pbnRlcm5hbHMvVW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbkludGVybmFsLmpzXHJcbmZ1bmN0aW9uIHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb25JbnRlcm5hbChyYW5nZVNpemUsIHJuZykge1xyXG4gIHZhciBNYXhBbGxvd2VkID0gcmFuZ2VTaXplID4gMiA/IH5+KDQyOTQ5NjcyOTYgLyByYW5nZVNpemUpICogcmFuZ2VTaXplIDogNDI5NDk2NzI5NjtcclxuICB2YXIgZGVsdGFWID0gcm5nLnVuc2FmZU5leHQoKSArIDIxNDc0ODM2NDg7XHJcbiAgd2hpbGUgKGRlbHRhViA+PSBNYXhBbGxvd2VkKSB7XHJcbiAgICBkZWx0YVYgPSBybmcudW5zYWZlTmV4dCgpICsgMjE0NzQ4MzY0ODtcclxuICB9XHJcbiAgcmV0dXJuIGRlbHRhViAlIHJhbmdlU2l6ZTtcclxufVxyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL2ludGVybmFscy9BcnJheUludDY0LmpzXHJcbmZ1bmN0aW9uIGZyb21OdW1iZXJUb0FycmF5SW50NjQob3V0LCBuKSB7XHJcbiAgaWYgKG4gPCAwKSB7XHJcbiAgICB2YXIgcG9zTiA9IC1uO1xyXG4gICAgb3V0LnNpZ24gPSAtMTtcclxuICAgIG91dC5kYXRhWzBdID0gfn4ocG9zTiAvIDQyOTQ5NjcyOTYpO1xyXG4gICAgb3V0LmRhdGFbMV0gPSBwb3NOID4+PiAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBvdXQuc2lnbiA9IDE7XHJcbiAgICBvdXQuZGF0YVswXSA9IH5+KG4gLyA0Mjk0OTY3Mjk2KTtcclxuICAgIG91dC5kYXRhWzFdID0gbiA+Pj4gMDtcclxuICB9XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5mdW5jdGlvbiBzdWJzdHJhY3RBcnJheUludDY0KG91dCwgYXJyYXlJbnRBLCBhcnJheUludEIpIHtcclxuICB2YXIgbG93QSA9IGFycmF5SW50QS5kYXRhWzFdO1xyXG4gIHZhciBoaWdoQSA9IGFycmF5SW50QS5kYXRhWzBdO1xyXG4gIHZhciBzaWduQSA9IGFycmF5SW50QS5zaWduO1xyXG4gIHZhciBsb3dCID0gYXJyYXlJbnRCLmRhdGFbMV07XHJcbiAgdmFyIGhpZ2hCID0gYXJyYXlJbnRCLmRhdGFbMF07XHJcbiAgdmFyIHNpZ25CID0gYXJyYXlJbnRCLnNpZ247XHJcbiAgb3V0LnNpZ24gPSAxO1xyXG4gIGlmIChzaWduQSA9PT0gMSAmJiBzaWduQiA9PT0gLTEpIHtcclxuICAgIHZhciBsb3dfMSA9IGxvd0EgKyBsb3dCO1xyXG4gICAgdmFyIGhpZ2ggPSBoaWdoQSArIGhpZ2hCICsgKGxvd18xID4gNDI5NDk2NzI5NSA/IDEgOiAwKTtcclxuICAgIG91dC5kYXRhWzBdID0gaGlnaCA+Pj4gMDtcclxuICAgIG91dC5kYXRhWzFdID0gbG93XzEgPj4+IDA7XHJcbiAgICByZXR1cm4gb3V0O1xyXG4gIH1cclxuICB2YXIgbG93Rmlyc3QgPSBsb3dBO1xyXG4gIHZhciBoaWdoRmlyc3QgPSBoaWdoQTtcclxuICB2YXIgbG93U2Vjb25kID0gbG93QjtcclxuICB2YXIgaGlnaFNlY29uZCA9IGhpZ2hCO1xyXG4gIGlmIChzaWduQSA9PT0gLTEpIHtcclxuICAgIGxvd0ZpcnN0ID0gbG93QjtcclxuICAgIGhpZ2hGaXJzdCA9IGhpZ2hCO1xyXG4gICAgbG93U2Vjb25kID0gbG93QTtcclxuICAgIGhpZ2hTZWNvbmQgPSBoaWdoQTtcclxuICB9XHJcbiAgdmFyIHJlbWluZGVyTG93ID0gMDtcclxuICB2YXIgbG93ID0gbG93Rmlyc3QgLSBsb3dTZWNvbmQ7XHJcbiAgaWYgKGxvdyA8IDApIHtcclxuICAgIHJlbWluZGVyTG93ID0gMTtcclxuICAgIGxvdyA9IGxvdyA+Pj4gMDtcclxuICB9XHJcbiAgb3V0LmRhdGFbMF0gPSBoaWdoRmlyc3QgLSBoaWdoU2Vjb25kIC0gcmVtaW5kZXJMb3c7XHJcbiAgb3V0LmRhdGFbMV0gPSBsb3c7XHJcbiAgcmV0dXJuIG91dDtcclxufVxyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL2ludGVybmFscy9VbnNhZmVVbmlmb3JtQXJyYXlJbnREaXN0cmlidXRpb25JbnRlcm5hbC5qc1xyXG5mdW5jdGlvbiB1bnNhZmVVbmlmb3JtQXJyYXlJbnREaXN0cmlidXRpb25JbnRlcm5hbChvdXQsIHJhbmdlU2l6ZSwgcm5nKSB7XHJcbiAgdmFyIHJhbmdlTGVuZ3RoID0gcmFuZ2VTaXplLmxlbmd0aDtcclxuICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCAhPT0gcmFuZ2VMZW5ndGg7ICsraW5kZXgpIHtcclxuICAgICAgdmFyIGluZGV4UmFuZ2VTaXplID0gaW5kZXggPT09IDAgPyByYW5nZVNpemVbMF0gKyAxIDogNDI5NDk2NzI5NjtcclxuICAgICAgdmFyIGcgPSB1bnNhZmVVbmlmb3JtSW50RGlzdHJpYnV0aW9uSW50ZXJuYWwoaW5kZXhSYW5nZVNpemUsIHJuZyk7XHJcbiAgICAgIG91dFtpbmRleF0gPSBnO1xyXG4gICAgfVxyXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCAhPT0gcmFuZ2VMZW5ndGg7ICsraW5kZXgpIHtcclxuICAgICAgdmFyIGN1cnJlbnQgPSBvdXRbaW5kZXhdO1xyXG4gICAgICB2YXIgY3VycmVudEluUmFuZ2UgPSByYW5nZVNpemVbaW5kZXhdO1xyXG4gICAgICBpZiAoY3VycmVudCA8IGN1cnJlbnRJblJhbmdlKSB7XHJcbiAgICAgICAgcmV0dXJuIG91dDtcclxuICAgICAgfSBlbHNlIGlmIChjdXJyZW50ID4gY3VycmVudEluUmFuZ2UpIHtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZGlzdHJpYnV0aW9uL1Vuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24uanNcclxudmFyIHNhZmVOdW1iZXJNYXhTYWZlSW50ZWdlciA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSO1xyXG52YXIgc2hhcmVkQSA9IHsgc2lnbjogMSwgZGF0YTogWzAsIDBdIH07XHJcbnZhciBzaGFyZWRCID0geyBzaWduOiAxLCBkYXRhOiBbMCwgMF0gfTtcclxudmFyIHNoYXJlZEMgPSB7IHNpZ246IDEsIGRhdGE6IFswLCAwXSB9O1xyXG52YXIgc2hhcmVkRGF0YSA9IFswLCAwXTtcclxuZnVuY3Rpb24gdW5pZm9ybUxhcmdlSW50SW50ZXJuYWwoZnJvbSwgdG8sIHJhbmdlU2l6ZSwgcm5nKSB7XHJcbiAgdmFyIHJhbmdlU2l6ZUFycmF5SW50VmFsdWUgPSByYW5nZVNpemUgPD0gc2FmZU51bWJlck1heFNhZmVJbnRlZ2VyID8gZnJvbU51bWJlclRvQXJyYXlJbnQ2NChzaGFyZWRDLCByYW5nZVNpemUpIDogc3Vic3RyYWN0QXJyYXlJbnQ2NChzaGFyZWRDLCBmcm9tTnVtYmVyVG9BcnJheUludDY0KHNoYXJlZEEsIHRvKSwgZnJvbU51bWJlclRvQXJyYXlJbnQ2NChzaGFyZWRCLCBmcm9tKSk7XHJcbiAgaWYgKHJhbmdlU2l6ZUFycmF5SW50VmFsdWUuZGF0YVsxXSA9PT0gNDI5NDk2NzI5NSkge1xyXG4gICAgcmFuZ2VTaXplQXJyYXlJbnRWYWx1ZS5kYXRhWzBdICs9IDE7XHJcbiAgICByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMV0gPSAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByYW5nZVNpemVBcnJheUludFZhbHVlLmRhdGFbMV0gKz0gMTtcclxuICB9XHJcbiAgdW5zYWZlVW5pZm9ybUFycmF5SW50RGlzdHJpYnV0aW9uSW50ZXJuYWwoc2hhcmVkRGF0YSwgcmFuZ2VTaXplQXJyYXlJbnRWYWx1ZS5kYXRhLCBybmcpO1xyXG4gIHJldHVybiBzaGFyZWREYXRhWzBdICogNDI5NDk2NzI5NiArIHNoYXJlZERhdGFbMV0gKyBmcm9tO1xyXG59XHJcbmZ1bmN0aW9uIHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oZnJvbSwgdG8sIHJuZykge1xyXG4gIHZhciByYW5nZVNpemUgPSB0byAtIGZyb207XHJcbiAgaWYgKHJhbmdlU2l6ZSA8PSA0Mjk0OTY3Mjk1KSB7XHJcbiAgICB2YXIgZyA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb25JbnRlcm5hbChyYW5nZVNpemUgKyAxLCBybmcpO1xyXG4gICAgcmV0dXJuIGcgKyBmcm9tO1xyXG4gIH1cclxuICByZXR1cm4gdW5pZm9ybUxhcmdlSW50SW50ZXJuYWwoZnJvbSwgdG8sIHJhbmdlU2l6ZSwgcm5nKTtcclxufVxyXG5cclxuLy8gLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3B1cmUtcmFuZEA3LjAuMS9ub2RlX21vZHVsZXMvcHVyZS1yYW5kL2xpYi9lc20vZ2VuZXJhdG9yL1hvcm9TaGlyby5qc1xyXG52YXIgWG9yb1NoaXJvMTI4UGx1cyA9IChmdW5jdGlvbigpIHtcclxuICBmdW5jdGlvbiBYb3JvU2hpcm8xMjhQbHVzMihzMDEsIHMwMCwgczExLCBzMTApIHtcclxuICAgIHRoaXMuczAxID0gczAxO1xyXG4gICAgdGhpcy5zMDAgPSBzMDA7XHJcbiAgICB0aGlzLnMxMSA9IHMxMTtcclxuICAgIHRoaXMuczEwID0gczEwO1xyXG4gIH1cclxuICBYb3JvU2hpcm8xMjhQbHVzMi5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiBuZXcgWG9yb1NoaXJvMTI4UGx1czIodGhpcy5zMDEsIHRoaXMuczAwLCB0aGlzLnMxMSwgdGhpcy5zMTApO1xyXG4gIH07XHJcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBuZXh0Um5nID0gbmV3IFhvcm9TaGlybzEyOFBsdXMyKHRoaXMuczAxLCB0aGlzLnMwMCwgdGhpcy5zMTEsIHRoaXMuczEwKTtcclxuICAgIHZhciBvdXQgPSBuZXh0Um5nLnVuc2FmZU5leHQoKTtcclxuICAgIHJldHVybiBbb3V0LCBuZXh0Um5nXTtcclxuICB9O1xyXG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS51bnNhZmVOZXh0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgb3V0ID0gdGhpcy5zMDAgKyB0aGlzLnMxMCB8IDA7XHJcbiAgICB2YXIgYTAgPSB0aGlzLnMxMCBeIHRoaXMuczAwO1xyXG4gICAgdmFyIGExID0gdGhpcy5zMTEgXiB0aGlzLnMwMTtcclxuICAgIHZhciBzMDAgPSB0aGlzLnMwMDtcclxuICAgIHZhciBzMDEgPSB0aGlzLnMwMTtcclxuICAgIHRoaXMuczAwID0gczAwIDw8IDI0IF4gczAxID4+PiA4IF4gYTAgXiBhMCA8PCAxNjtcclxuICAgIHRoaXMuczAxID0gczAxIDw8IDI0IF4gczAwID4+PiA4IF4gYTEgXiAoYTEgPDwgMTYgfCBhMCA+Pj4gMTYpO1xyXG4gICAgdGhpcy5zMTAgPSBhMSA8PCA1IF4gYTAgPj4+IDI3O1xyXG4gICAgdGhpcy5zMTEgPSBhMCA8PCA1IF4gYTEgPj4+IDI3O1xyXG4gICAgcmV0dXJuIG91dDtcclxuICB9O1xyXG4gIFhvcm9TaGlybzEyOFBsdXMyLnByb3RvdHlwZS5qdW1wID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbmV4dFJuZyA9IG5ldyBYb3JvU2hpcm8xMjhQbHVzMih0aGlzLnMwMSwgdGhpcy5zMDAsIHRoaXMuczExLCB0aGlzLnMxMCk7XHJcbiAgICBuZXh0Um5nLnVuc2FmZUp1bXAoKTtcclxuICAgIHJldHVybiBuZXh0Um5nO1xyXG4gIH07XHJcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLnVuc2FmZUp1bXAgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBuczAxID0gMDtcclxuICAgIHZhciBuczAwID0gMDtcclxuICAgIHZhciBuczExID0gMDtcclxuICAgIHZhciBuczEwID0gMDtcclxuICAgIHZhciBqdW1wID0gWzM2Mzk5NTY2NDUsIDM3NTA3NTcwMTIsIDEyNjE1Njg1MDgsIDM4NjQyNjMzNV07XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSAhPT0gNDsgKytpKSB7XHJcbiAgICAgIGZvciAodmFyIG1hc2sgPSAxOyBtYXNrOyBtYXNrIDw8PSAxKSB7XHJcbiAgICAgICAgaWYgKGp1bXBbaV0gJiBtYXNrKSB7XHJcbiAgICAgICAgICBuczAxIF49IHRoaXMuczAxO1xyXG4gICAgICAgICAgbnMwMCBePSB0aGlzLnMwMDtcclxuICAgICAgICAgIG5zMTEgXj0gdGhpcy5zMTE7XHJcbiAgICAgICAgICBuczEwIF49IHRoaXMuczEwO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVuc2FmZU5leHQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5zMDEgPSBuczAxO1xyXG4gICAgdGhpcy5zMDAgPSBuczAwO1xyXG4gICAgdGhpcy5zMTEgPSBuczExO1xyXG4gICAgdGhpcy5zMTAgPSBuczEwO1xyXG4gIH07XHJcbiAgWG9yb1NoaXJvMTI4UGx1czIucHJvdG90eXBlLmdldFN0YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gW3RoaXMuczAxLCB0aGlzLnMwMCwgdGhpcy5zMTEsIHRoaXMuczEwXTtcclxuICB9O1xyXG4gIHJldHVybiBYb3JvU2hpcm8xMjhQbHVzMjtcclxufSkoKTtcclxuZnVuY3Rpb24gZnJvbVN0YXRlKHN0YXRlKSB7XHJcbiAgdmFyIHZhbGlkID0gc3RhdGUubGVuZ3RoID09PSA0O1xyXG4gIGlmICghdmFsaWQpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBzdGF0ZSBtdXN0IGhhdmUgYmVlbiBwcm9kdWNlZCBieSBhIHhvcm9zaGlybzEyOHBsdXMgUmFuZG9tR2VuZXJhdG9yXCIpO1xyXG4gIH1cclxuICByZXR1cm4gbmV3IFhvcm9TaGlybzEyOFBsdXMoc3RhdGVbMF0sIHN0YXRlWzFdLCBzdGF0ZVsyXSwgc3RhdGVbM10pO1xyXG59XHJcbnZhciB4b3Jvc2hpcm8xMjhwbHVzID0gT2JqZWN0LmFzc2lnbihmdW5jdGlvbihzZWVkKSB7XHJcbiAgcmV0dXJuIG5ldyBYb3JvU2hpcm8xMjhQbHVzKC0xLCB+c2VlZCwgc2VlZCB8IDAsIDApO1xyXG59LCB7IGZyb21TdGF0ZSB9KTtcclxuXHJcbi8vIHNyYy9zZXJ2ZXIvcm5nLnRzXHJcbnZhciB7IGFzVWludE4gfSA9IEJpZ0ludDtcclxuZnVuY3Rpb24gcGNnMzIoc3RhdGUpIHtcclxuICBjb25zdCBNVUwgPSA2MzY0MTM2MjIzODQ2NzkzMDA1bjtcclxuICBjb25zdCBJTkMgPSAxMTYzNDU4MDAyNzQ2MjI2MDcyM247XHJcbiAgc3RhdGUgPSBhc1VpbnROKDY0LCBzdGF0ZSAqIE1VTCArIElOQyk7XHJcbiAgY29uc3QgeG9yc2hpZnRlZCA9IE51bWJlcihhc1VpbnROKDMyLCAoc3RhdGUgPj4gMThuIF4gc3RhdGUpID4+IDI3bikpO1xyXG4gIGNvbnN0IHJvdCA9IE51bWJlcihhc1VpbnROKDMyLCBzdGF0ZSA+PiA1OW4pKTtcclxuICByZXR1cm4geG9yc2hpZnRlZCA+PiByb3QgfCB4b3JzaGlmdGVkIDw8IDMyIC0gcm90O1xyXG59XHJcbmZ1bmN0aW9uIGdlbmVyYXRlRmxvYXQ2NChybmcpIHtcclxuICBjb25zdCBnMSA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgKDEgPDwgMjYpIC0gMSwgcm5nKTtcclxuICBjb25zdCBnMiA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgKDEgPDwgMjcpIC0gMSwgcm5nKTtcclxuICBjb25zdCB2YWx1ZSA9IChnMSAqIE1hdGgucG93KDIsIDI3KSArIGcyKSAqIE1hdGgucG93KDIsIC01Myk7XHJcbiAgcmV0dXJuIHZhbHVlO1xyXG59XHJcbmZ1bmN0aW9uIG1ha2VSYW5kb20oc2VlZCkge1xyXG4gIGNvbnN0IHJuZyA9IHhvcm9zaGlybzEyOHBsdXMocGNnMzIoc2VlZC5taWNyb3NTaW5jZVVuaXhFcG9jaCkpO1xyXG4gIGNvbnN0IHJhbmRvbSA9ICgpID0+IGdlbmVyYXRlRmxvYXQ2NChybmcpO1xyXG4gIHJhbmRvbS5maWxsID0gKGFycmF5KSA9PiB7XHJcbiAgICBjb25zdCBlbGVtID0gYXJyYXkuYXQoMCk7XHJcbiAgICBpZiAodHlwZW9mIGVsZW0gPT09IFwiYmlnaW50XCIpIHtcclxuICAgICAgY29uc3QgdXBwZXIgPSAoMW4gPDwgQmlnSW50KGFycmF5LkJZVEVTX1BFUl9FTEVNRU5UICogOCkpIC0gMW47XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhcnJheVtpXSA9IHVuc2FmZVVuaWZvcm1CaWdJbnREaXN0cmlidXRpb24oMG4sIHVwcGVyLCBybmcpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbGVtID09PSBcIm51bWJlclwiKSB7XHJcbiAgICAgIGNvbnN0IHVwcGVyID0gKDEgPDwgYXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiA4KSAtIDE7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBhcnJheVtpXSA9IHVuc2FmZVVuaWZvcm1JbnREaXN0cmlidXRpb24oMCwgdXBwZXIsIHJuZyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcnJheTtcclxuICB9O1xyXG4gIHJhbmRvbS51aW50MzIgPSAoKSA9PiBybmcudW5zYWZlTmV4dCgpO1xyXG4gIHJhbmRvbS5pbnRlZ2VySW5SYW5nZSA9IChtaW4sIG1heCkgPT4gdW5zYWZlVW5pZm9ybUludERpc3RyaWJ1dGlvbihtaW4sIG1heCwgcm5nKTtcclxuICByYW5kb20uYmlnaW50SW5SYW5nZSA9IChtaW4sIG1heCkgPT4gdW5zYWZlVW5pZm9ybUJpZ0ludERpc3RyaWJ1dGlvbihtaW4sIG1heCwgcm5nKTtcclxuICByZXR1cm4gcmFuZG9tO1xyXG59XHJcblxyXG4vLyBzcmMvc2VydmVyL3J1bnRpbWUudHNcclxudmFyIHsgZnJlZXplIH0gPSBPYmplY3Q7XHJcbnZhciBzeXMgPSBfc3lzY2FsbHMyXzA7XHJcbmZ1bmN0aW9uIHBhcnNlSnNvbk9iamVjdChqc29uKSB7XHJcbiAgbGV0IHZhbHVlO1xyXG4gIHRyeSB7XHJcbiAgICB2YWx1ZSA9IEpTT04ucGFyc2UoanNvbik7XHJcbiAgfSBjYXRjaCB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIEpTT046IGZhaWxlZCB0byBwYXJzZSBzdHJpbmdcIik7XHJcbiAgfVxyXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIgfHwgQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihcIkV4cGVjdGVkIGEgSlNPTiBvYmplY3QgYXQgdGhlIHRvcCBsZXZlbFwiKTtcclxuICB9XHJcbiAgcmV0dXJuIHZhbHVlO1xyXG59XHJcbnZhciBKd3RDbGFpbXNJbXBsID0gY2xhc3Mge1xyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgSnd0Q2xhaW1zIGluc3RhbmNlLlxyXG4gICAqIEBwYXJhbSByYXdQYXlsb2FkIFRoZSBKV1QgcGF5bG9hZCBhcyBhIHJhdyBKU09OIHN0cmluZy5cclxuICAgKiBAcGFyYW0gaWRlbnRpdHkgVGhlIGlkZW50aXR5IGZvciB0aGlzIEpXVC4gV2UgYXJlIG9ubHkgdGFraW5nIHRoaXMgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIGEgYmxha2UzIGltcGxlbWVudGF0aW9uICh3aGljaCB3ZSBuZWVkIHRvIGNvbXB1dGUgaXQpLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKHJhd1BheWxvYWQsIGlkZW50aXR5KSB7XHJcbiAgICB0aGlzLnJhd1BheWxvYWQgPSByYXdQYXlsb2FkO1xyXG4gICAgdGhpcy5mdWxsUGF5bG9hZCA9IHBhcnNlSnNvbk9iamVjdChyYXdQYXlsb2FkKTtcclxuICAgIHRoaXMuX2lkZW50aXR5ID0gaWRlbnRpdHk7XHJcbiAgfVxyXG4gIGZ1bGxQYXlsb2FkO1xyXG4gIF9pZGVudGl0eTtcclxuICBnZXQgaWRlbnRpdHkoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5faWRlbnRpdHk7XHJcbiAgfVxyXG4gIGdldCBzdWJqZWN0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuZnVsbFBheWxvYWRbXCJzdWJcIl07XHJcbiAgfVxyXG4gIGdldCBpc3N1ZXIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5mdWxsUGF5bG9hZFtcImlzc1wiXTtcclxuICB9XHJcbiAgZ2V0IGF1ZGllbmNlKCkge1xyXG4gICAgY29uc3QgYXVkID0gdGhpcy5mdWxsUGF5bG9hZFtcImF1ZFwiXTtcclxuICAgIGlmIChhdWQgPT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gW107XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHlwZW9mIGF1ZCA9PT0gXCJzdHJpbmdcIiA/IFthdWRdIDogYXVkO1xyXG4gIH1cclxufTtcclxudmFyIEF1dGhDdHhJbXBsID0gY2xhc3MgX0F1dGhDdHhJbXBsIHtcclxuICBpc0ludGVybmFsO1xyXG4gIC8vIFNvdXJjZSBvZiB0aGUgSldUIHBheWxvYWQgc3RyaW5nLCBpZiB0aGVyZSBpcyBvbmUuXHJcbiAgX2p3dFNvdXJjZTtcclxuICAvLyBXaGV0aGVyIHdlIGhhdmUgaW5pdGlhbGl6ZWQgdGhlIEpXVCBjbGFpbXMuXHJcbiAgX2luaXRpYWxpemVkSldUID0gZmFsc2U7XHJcbiAgX2p3dENsYWltcztcclxuICBfc2VuZGVySWRlbnRpdHk7XHJcbiAgY29uc3RydWN0b3Iob3B0cykge1xyXG4gICAgdGhpcy5pc0ludGVybmFsID0gb3B0cy5pc0ludGVybmFsO1xyXG4gICAgdGhpcy5fand0U291cmNlID0gb3B0cy5qd3RTb3VyY2U7XHJcbiAgICB0aGlzLl9zZW5kZXJJZGVudGl0eSA9IG9wdHMuc2VuZGVySWRlbnRpdHk7XHJcbiAgfVxyXG4gIF9pbml0aWFsaXplSldUKCkge1xyXG4gICAgaWYgKHRoaXMuX2luaXRpYWxpemVkSldUKSByZXR1cm47XHJcbiAgICB0aGlzLl9pbml0aWFsaXplZEpXVCA9IHRydWU7XHJcbiAgICBjb25zdCB0b2tlbiA9IHRoaXMuX2p3dFNvdXJjZSgpO1xyXG4gICAgaWYgKCF0b2tlbikge1xyXG4gICAgICB0aGlzLl9qd3RDbGFpbXMgPSBudWxsO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5fand0Q2xhaW1zID0gbmV3IEp3dENsYWltc0ltcGwodG9rZW4sIHRoaXMuX3NlbmRlcklkZW50aXR5KTtcclxuICAgIH1cclxuICAgIE9iamVjdC5mcmVlemUodGhpcyk7XHJcbiAgfVxyXG4gIC8qKiBMYXppbHkgY29tcHV0ZSB3aGV0aGVyIGEgSldUIGV4aXN0cyBhbmQgaXMgcGFyc2VhYmxlLiAqL1xyXG4gIGdldCBoYXNKV1QoKSB7XHJcbiAgICB0aGlzLl9pbml0aWFsaXplSldUKCk7XHJcbiAgICByZXR1cm4gdGhpcy5fand0Q2xhaW1zICE9PSBudWxsO1xyXG4gIH1cclxuICAvKiogTGF6aWx5IHBhcnNlIHRoZSBKd3RDbGFpbXMgb25seSB3aGVuIGFjY2Vzc2VkLiAqL1xyXG4gIGdldCBqd3QoKSB7XHJcbiAgICB0aGlzLl9pbml0aWFsaXplSldUKCk7XHJcbiAgICByZXR1cm4gdGhpcy5fand0Q2xhaW1zO1xyXG4gIH1cclxuICAvKiogQ3JlYXRlIGEgY29udGV4dCByZXByZXNlbnRpbmcgaW50ZXJuYWwgKG5vbi11c2VyKSByZXF1ZXN0cy4gKi9cclxuICBzdGF0aWMgaW50ZXJuYWwoKSB7XHJcbiAgICByZXR1cm4gbmV3IF9BdXRoQ3R4SW1wbCh7XHJcbiAgICAgIGlzSW50ZXJuYWw6IHRydWUsXHJcbiAgICAgIGp3dFNvdXJjZTogKCkgPT4gbnVsbCxcclxuICAgICAgc2VuZGVySWRlbnRpdHk6IElkZW50aXR5Lnplcm8oKVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIC8qKiBJZiB0aGVyZSBpcyBhIGNvbm5lY3Rpb24gaWQsIGxvb2sgdXAgdGhlIEpXVCBwYXlsb2FkIGZyb20gdGhlIHN5c3RlbSB0YWJsZXMuICovXHJcbiAgc3RhdGljIGZyb21TeXN0ZW1UYWJsZXMoY29ubmVjdGlvbklkLCBzZW5kZXIpIHtcclxuICAgIGlmIChjb25uZWN0aW9uSWQgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIG5ldyBfQXV0aEN0eEltcGwoe1xyXG4gICAgICAgIGlzSW50ZXJuYWw6IGZhbHNlLFxyXG4gICAgICAgIGp3dFNvdXJjZTogKCkgPT4gbnVsbCxcclxuICAgICAgICBzZW5kZXJJZGVudGl0eTogc2VuZGVyXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5ldyBfQXV0aEN0eEltcGwoe1xyXG4gICAgICBpc0ludGVybmFsOiBmYWxzZSxcclxuICAgICAgand0U291cmNlOiAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcGF5bG9hZEJ1ZiA9IHN5cy5nZXRfand0X3BheWxvYWQoY29ubmVjdGlvbklkLl9fY29ubmVjdGlvbl9pZF9fKTtcclxuICAgICAgICBpZiAocGF5bG9hZEJ1Zi5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xyXG4gICAgICAgIGNvbnN0IHBheWxvYWRTdHIgPSBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocGF5bG9hZEJ1Zik7XHJcbiAgICAgICAgcmV0dXJuIHBheWxvYWRTdHI7XHJcbiAgICAgIH0sXHJcbiAgICAgIHNlbmRlcklkZW50aXR5OiBzZW5kZXJcclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxudmFyIFJlZHVjZXJDdHhJbXBsID0gY2xhc3MgUmVkdWNlckN0eCB7XHJcbiAgI2lkZW50aXR5O1xyXG4gICNzZW5kZXJBdXRoO1xyXG4gICN1dWlkQ291bnRlcjtcclxuICAjcmFuZG9tO1xyXG4gIHNlbmRlcjtcclxuICB0aW1lc3RhbXA7XHJcbiAgY29ubmVjdGlvbklkO1xyXG4gIGRiO1xyXG4gIGNvbnN0cnVjdG9yKHNlbmRlciwgdGltZXN0YW1wLCBjb25uZWN0aW9uSWQsIGRiVmlldykge1xyXG4gICAgT2JqZWN0LnNlYWwodGhpcyk7XHJcbiAgICB0aGlzLnNlbmRlciA9IHNlbmRlcjtcclxuICAgIHRoaXMudGltZXN0YW1wID0gdGltZXN0YW1wO1xyXG4gICAgdGhpcy5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XHJcbiAgICB0aGlzLmRiID0gZGJWaWV3O1xyXG4gIH1cclxuICAvKiogUmVzZXQgdGhlIGBSZWR1Y2VyQ3R4YCB0byBiZSB1c2VkIGZvciBhIG5ldyB0cmFuc2FjdGlvbiAqL1xyXG4gIHN0YXRpYyByZXNldChtZSwgc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCkge1xyXG4gICAgbWUuc2VuZGVyID0gc2VuZGVyO1xyXG4gICAgbWUudGltZXN0YW1wID0gdGltZXN0YW1wO1xyXG4gICAgbWUuY29ubmVjdGlvbklkID0gY29ubmVjdGlvbklkO1xyXG4gICAgbWUuI3V1aWRDb3VudGVyID0gdm9pZCAwO1xyXG4gICAgbWUuI3NlbmRlckF1dGggPSB2b2lkIDA7XHJcbiAgfVxyXG4gIGdldCBpZGVudGl0eSgpIHtcclxuICAgIHJldHVybiB0aGlzLiNpZGVudGl0eSA/Pz0gbmV3IElkZW50aXR5KHN5cy5pZGVudGl0eSgpKTtcclxuICB9XHJcbiAgZ2V0IHNlbmRlckF1dGgoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jc2VuZGVyQXV0aCA/Pz0gQXV0aEN0eEltcGwuZnJvbVN5c3RlbVRhYmxlcyhcclxuICAgICAgdGhpcy5jb25uZWN0aW9uSWQsXHJcbiAgICAgIHRoaXMuc2VuZGVyXHJcbiAgICApO1xyXG4gIH1cclxuICBnZXQgcmFuZG9tKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI3JhbmRvbSA/Pz0gbWFrZVJhbmRvbSh0aGlzLnRpbWVzdGFtcCk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG5ldyByYW5kb20ge0BsaW5rIFV1aWR9IGB2NGAgdXNpbmcgdGhpcyBgUmVkdWNlckN0eGAncyBSTkcuXHJcbiAgICovXHJcbiAgbmV3VXVpZFY0KCkge1xyXG4gICAgY29uc3QgYnl0ZXMgPSB0aGlzLnJhbmRvbS5maWxsKG5ldyBVaW50OEFycmF5KDE2KSk7XHJcbiAgICByZXR1cm4gVXVpZC5mcm9tUmFuZG9tQnl0ZXNWNChieXRlcyk7XHJcbiAgfVxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG5ldyBzb3J0YWJsZSB7QGxpbmsgVXVpZH0gYHY3YCB1c2luZyB0aGlzIGBSZWR1Y2VyQ3R4YCdzIFJORywgY291bnRlcixcclxuICAgKiBhbmQgdGltZXN0YW1wLlxyXG4gICAqL1xyXG4gIG5ld1V1aWRWNygpIHtcclxuICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5yYW5kb20uZmlsbChuZXcgVWludDhBcnJheSg0KSk7XHJcbiAgICBjb25zdCBjb3VudGVyID0gdGhpcy4jdXVpZENvdW50ZXIgPz89IHsgdmFsdWU6IDAgfTtcclxuICAgIHJldHVybiBVdWlkLmZyb21Db3VudGVyVjcoY291bnRlciwgdGhpcy50aW1lc3RhbXAsIGJ5dGVzKTtcclxuICB9XHJcbn07XHJcbnZhciBjYWxsVXNlckZ1bmN0aW9uID0gZnVuY3Rpb24gX19zcGFjZXRpbWVkYl9lbmRfc2hvcnRfYmFja3RyYWNlKGZuLCAuLi5hcmdzKSB7XHJcbiAgcmV0dXJuIGZuKC4uLmFyZ3MpO1xyXG59O1xyXG52YXIgbWFrZUhvb2tzID0gKHNjaGVtYTIpID0+IG5ldyBNb2R1bGVIb29rc0ltcGwoc2NoZW1hMik7XHJcbnZhciBNb2R1bGVIb29rc0ltcGwgPSBjbGFzcyB7XHJcbiAgI3NjaGVtYTtcclxuICAjZGJWaWV3XztcclxuICAjcmVkdWNlckFyZ3NEZXNlcmlhbGl6ZXJzO1xyXG4gIC8qKiBDYWNoZSB0aGUgYFJlZHVjZXJDdHhgIG9iamVjdCB0byBhdm9pZCBhbGxvY2F0aW5nIGFuZXcgZm9yIGV2ZXIgcmVkdWNlciBjYWxsLiAqL1xyXG4gICNyZWR1Y2VyQ3R4XztcclxuICBjb25zdHJ1Y3RvcihzY2hlbWEyKSB7XHJcbiAgICB0aGlzLiNzY2hlbWEgPSBzY2hlbWEyO1xyXG4gICAgdGhpcy4jcmVkdWNlckFyZ3NEZXNlcmlhbGl6ZXJzID0gc2NoZW1hMi5tb2R1bGVEZWYucmVkdWNlcnMubWFwKFxyXG4gICAgICAoeyBwYXJhbXMgfSkgPT4gUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcihwYXJhbXMsIHNjaGVtYTIudHlwZXNwYWNlKVxyXG4gICAgKTtcclxuICB9XHJcbiAgZ2V0ICNkYlZpZXcoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jZGJWaWV3XyA/Pz0gZnJlZXplKFxyXG4gICAgICBPYmplY3QuZnJvbUVudHJpZXMoXHJcbiAgICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLiNzY2hlbWEuc2NoZW1hVHlwZS50YWJsZXMpLm1hcCgodGFibGUyKSA9PiBbXHJcbiAgICAgICAgICB0YWJsZTIuYWNjZXNzb3JOYW1lLFxyXG4gICAgICAgICAgbWFrZVRhYmxlVmlldyh0aGlzLiNzY2hlbWEudHlwZXNwYWNlLCB0YWJsZTIudGFibGVEZWYpXHJcbiAgICAgICAgXSlcclxuICAgICAgKVxyXG4gICAgKTtcclxuICB9XHJcbiAgZ2V0ICNyZWR1Y2VyQ3R4KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI3JlZHVjZXJDdHhfID8/PSBuZXcgUmVkdWNlckN0eEltcGwoXHJcbiAgICAgIElkZW50aXR5Lnplcm8oKSxcclxuICAgICAgVGltZXN0YW1wLlVOSVhfRVBPQ0gsXHJcbiAgICAgIG51bGwsXHJcbiAgICAgIHRoaXMuI2RiVmlld1xyXG4gICAgKTtcclxuICB9XHJcbiAgX19kZXNjcmliZV9tb2R1bGVfXygpIHtcclxuICAgIGNvbnN0IHdyaXRlciA9IG5ldyBCaW5hcnlXcml0ZXIoMTI4KTtcclxuICAgIFJhd01vZHVsZURlZi5zZXJpYWxpemUoXHJcbiAgICAgIHdyaXRlcixcclxuICAgICAgUmF3TW9kdWxlRGVmLlYxMCh0aGlzLiNzY2hlbWEucmF3TW9kdWxlRGVmVjEwKCkpXHJcbiAgICApO1xyXG4gICAgcmV0dXJuIHdyaXRlci5nZXRCdWZmZXIoKTtcclxuICB9XHJcbiAgX19nZXRfZXJyb3JfY29uc3RydWN0b3JfXyhjb2RlKSB7XHJcbiAgICByZXR1cm4gZ2V0RXJyb3JDb25zdHJ1Y3Rvcihjb2RlKTtcclxuICB9XHJcbiAgZ2V0IF9fc2VuZGVyX2Vycm9yX2NsYXNzX18oKSB7XHJcbiAgICByZXR1cm4gU2VuZGVyRXJyb3I7XHJcbiAgfVxyXG4gIF9fY2FsbF9yZWR1Y2VyX18ocmVkdWNlcklkLCBzZW5kZXIsIGNvbm5JZCwgdGltZXN0YW1wLCBhcmdzQnVmKSB7XHJcbiAgICBjb25zdCBtb2R1bGVDdHggPSB0aGlzLiNzY2hlbWE7XHJcbiAgICBjb25zdCBkZXNlcmlhbGl6ZUFyZ3MgPSB0aGlzLiNyZWR1Y2VyQXJnc0Rlc2VyaWFsaXplcnNbcmVkdWNlcklkXTtcclxuICAgIEJJTkFSWV9SRUFERVIucmVzZXQoYXJnc0J1Zik7XHJcbiAgICBjb25zdCBhcmdzID0gZGVzZXJpYWxpemVBcmdzKEJJTkFSWV9SRUFERVIpO1xyXG4gICAgY29uc3Qgc2VuZGVySWRlbnRpdHkgPSBuZXcgSWRlbnRpdHkoc2VuZGVyKTtcclxuICAgIGNvbnN0IGN0eCA9IHRoaXMuI3JlZHVjZXJDdHg7XHJcbiAgICBSZWR1Y2VyQ3R4SW1wbC5yZXNldChcclxuICAgICAgY3R4LFxyXG4gICAgICBzZW5kZXJJZGVudGl0eSxcclxuICAgICAgbmV3IFRpbWVzdGFtcCh0aW1lc3RhbXApLFxyXG4gICAgICBDb25uZWN0aW9uSWQubnVsbElmWmVybyhuZXcgQ29ubmVjdGlvbklkKGNvbm5JZCkpXHJcbiAgICApO1xyXG4gICAgY2FsbFVzZXJGdW5jdGlvbihtb2R1bGVDdHgucmVkdWNlcnNbcmVkdWNlcklkXSwgY3R4LCBhcmdzKTtcclxuICB9XHJcbiAgX19jYWxsX3ZpZXdfXyhpZCwgc2VuZGVyLCBhcmdzQnVmKSB7XHJcbiAgICBjb25zdCBtb2R1bGVDdHggPSB0aGlzLiNzY2hlbWE7XHJcbiAgICBjb25zdCB7IGZuLCBkZXNlcmlhbGl6ZVBhcmFtcywgc2VyaWFsaXplUmV0dXJuLCByZXR1cm5UeXBlQmFzZVNpemUgfSA9IG1vZHVsZUN0eC52aWV3c1tpZF07XHJcbiAgICBjb25zdCBjdHggPSBmcmVlemUoe1xyXG4gICAgICBzZW5kZXI6IG5ldyBJZGVudGl0eShzZW5kZXIpLFxyXG4gICAgICAvLyB0aGlzIGlzIHRoZSBub24tcmVhZG9ubHkgRGJWaWV3LCBidXQgdGhlIHR5cGluZyBmb3IgdGhlIHVzZXIgd2lsbCBiZVxyXG4gICAgICAvLyB0aGUgcmVhZG9ubHkgb25lLCBhbmQgaWYgdGhleSBkbyBjYWxsIG11dGF0aW5nIGZ1bmN0aW9ucyBpdCB3aWxsIGZhaWxcclxuICAgICAgLy8gYXQgcnVudGltZVxyXG4gICAgICBkYjogdGhpcy4jZGJWaWV3LFxyXG4gICAgICBmcm9tOiBtYWtlUXVlcnlCdWlsZGVyKG1vZHVsZUN0eC5zY2hlbWFUeXBlKVxyXG4gICAgfSk7XHJcbiAgICBjb25zdCBhcmdzID0gZGVzZXJpYWxpemVQYXJhbXMobmV3IEJpbmFyeVJlYWRlcihhcmdzQnVmKSk7XHJcbiAgICBjb25zdCByZXQgPSBjYWxsVXNlckZ1bmN0aW9uKGZuLCBjdHgsIGFyZ3MpO1xyXG4gICAgY29uc3QgcmV0QnVmID0gbmV3IEJpbmFyeVdyaXRlcihyZXR1cm5UeXBlQmFzZVNpemUpO1xyXG4gICAgaWYgKGlzUm93VHlwZWRRdWVyeShyZXQpKSB7XHJcbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdG9TcWwocmV0KTtcclxuICAgICAgVmlld1Jlc3VsdEhlYWRlci5zZXJpYWxpemUocmV0QnVmLCBWaWV3UmVzdWx0SGVhZGVyLlJhd1NxbChxdWVyeSkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgVmlld1Jlc3VsdEhlYWRlci5zZXJpYWxpemUocmV0QnVmLCBWaWV3UmVzdWx0SGVhZGVyLlJvd0RhdGEpO1xyXG4gICAgICBzZXJpYWxpemVSZXR1cm4ocmV0QnVmLCByZXQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHsgZGF0YTogcmV0QnVmLmdldEJ1ZmZlcigpIH07XHJcbiAgfVxyXG4gIF9fY2FsbF92aWV3X2Fub25fXyhpZCwgYXJnc0J1Zikge1xyXG4gICAgY29uc3QgbW9kdWxlQ3R4ID0gdGhpcy4jc2NoZW1hO1xyXG4gICAgY29uc3QgeyBmbiwgZGVzZXJpYWxpemVQYXJhbXMsIHNlcmlhbGl6ZVJldHVybiwgcmV0dXJuVHlwZUJhc2VTaXplIH0gPSBtb2R1bGVDdHguYW5vblZpZXdzW2lkXTtcclxuICAgIGNvbnN0IGN0eCA9IGZyZWV6ZSh7XHJcbiAgICAgIC8vIHRoaXMgaXMgdGhlIG5vbi1yZWFkb25seSBEYlZpZXcsIGJ1dCB0aGUgdHlwaW5nIGZvciB0aGUgdXNlciB3aWxsIGJlXHJcbiAgICAgIC8vIHRoZSByZWFkb25seSBvbmUsIGFuZCBpZiB0aGV5IGRvIGNhbGwgbXV0YXRpbmcgZnVuY3Rpb25zIGl0IHdpbGwgZmFpbFxyXG4gICAgICAvLyBhdCBydW50aW1lXHJcbiAgICAgIGRiOiB0aGlzLiNkYlZpZXcsXHJcbiAgICAgIGZyb206IG1ha2VRdWVyeUJ1aWxkZXIobW9kdWxlQ3R4LnNjaGVtYVR5cGUpXHJcbiAgICB9KTtcclxuICAgIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZVBhcmFtcyhuZXcgQmluYXJ5UmVhZGVyKGFyZ3NCdWYpKTtcclxuICAgIGNvbnN0IHJldCA9IGNhbGxVc2VyRnVuY3Rpb24oZm4sIGN0eCwgYXJncyk7XHJcbiAgICBjb25zdCByZXRCdWYgPSBuZXcgQmluYXJ5V3JpdGVyKHJldHVyblR5cGVCYXNlU2l6ZSk7XHJcbiAgICBpZiAoaXNSb3dUeXBlZFF1ZXJ5KHJldCkpIHtcclxuICAgICAgY29uc3QgcXVlcnkgPSB0b1NxbChyZXQpO1xyXG4gICAgICBWaWV3UmVzdWx0SGVhZGVyLnNlcmlhbGl6ZShyZXRCdWYsIFZpZXdSZXN1bHRIZWFkZXIuUmF3U3FsKHF1ZXJ5KSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBWaWV3UmVzdWx0SGVhZGVyLnNlcmlhbGl6ZShyZXRCdWYsIFZpZXdSZXN1bHRIZWFkZXIuUm93RGF0YSk7XHJcbiAgICAgIHNlcmlhbGl6ZVJldHVybihyZXRCdWYsIHJldCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyBkYXRhOiByZXRCdWYuZ2V0QnVmZmVyKCkgfTtcclxuICB9XHJcbiAgX19jYWxsX3Byb2NlZHVyZV9fKGlkLCBzZW5kZXIsIGNvbm5lY3Rpb25faWQsIHRpbWVzdGFtcCwgYXJncykge1xyXG4gICAgcmV0dXJuIGNhbGxQcm9jZWR1cmUoXHJcbiAgICAgIHRoaXMuI3NjaGVtYSxcclxuICAgICAgaWQsXHJcbiAgICAgIG5ldyBJZGVudGl0eShzZW5kZXIpLFxyXG4gICAgICBDb25uZWN0aW9uSWQubnVsbElmWmVybyhuZXcgQ29ubmVjdGlvbklkKGNvbm5lY3Rpb25faWQpKSxcclxuICAgICAgbmV3IFRpbWVzdGFtcCh0aW1lc3RhbXApLFxyXG4gICAgICBhcmdzLFxyXG4gICAgICAoKSA9PiB0aGlzLiNkYlZpZXdcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG52YXIgQklOQVJZX1dSSVRFUiA9IG5ldyBCaW5hcnlXcml0ZXIoMCk7XHJcbnZhciBCSU5BUllfUkVBREVSID0gbmV3IEJpbmFyeVJlYWRlcihuZXcgVWludDhBcnJheSgpKTtcclxuZnVuY3Rpb24gbWFrZVRhYmxlVmlldyh0eXBlc3BhY2UsIHRhYmxlMikge1xyXG4gIGNvbnN0IHRhYmxlX2lkID0gc3lzLnRhYmxlX2lkX2Zyb21fbmFtZSh0YWJsZTIuc291cmNlTmFtZSk7XHJcbiAgY29uc3Qgcm93VHlwZSA9IHR5cGVzcGFjZS50eXBlc1t0YWJsZTIucHJvZHVjdFR5cGVSZWZdO1xyXG4gIGlmIChyb3dUeXBlLnRhZyAhPT0gXCJQcm9kdWN0XCIpIHtcclxuICAgIHRocm93IFwiaW1wb3NzaWJsZVwiO1xyXG4gIH1cclxuICBjb25zdCBzZXJpYWxpemVSb3cgPSBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHJvd1R5cGUsIHR5cGVzcGFjZSk7XHJcbiAgY29uc3QgZGVzZXJpYWxpemVSb3cgPSBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIocm93VHlwZSwgdHlwZXNwYWNlKTtcclxuICBjb25zdCBzZXF1ZW5jZXMgPSB0YWJsZTIuc2VxdWVuY2VzLm1hcCgoc2VxKSA9PiB7XHJcbiAgICBjb25zdCBjb2wgPSByb3dUeXBlLnZhbHVlLmVsZW1lbnRzW3NlcS5jb2x1bW5dO1xyXG4gICAgY29uc3QgY29sVHlwZSA9IGNvbC5hbGdlYnJhaWNUeXBlO1xyXG4gICAgbGV0IHNlcXVlbmNlVHJpZ2dlcjtcclxuICAgIHN3aXRjaCAoY29sVHlwZS50YWcpIHtcclxuICAgICAgY2FzZSBcIlU4XCI6XHJcbiAgICAgIGNhc2UgXCJJOFwiOlxyXG4gICAgICBjYXNlIFwiVTE2XCI6XHJcbiAgICAgIGNhc2UgXCJJMTZcIjpcclxuICAgICAgY2FzZSBcIlUzMlwiOlxyXG4gICAgICBjYXNlIFwiSTMyXCI6XHJcbiAgICAgICAgc2VxdWVuY2VUcmlnZ2VyID0gMDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIlU2NFwiOlxyXG4gICAgICBjYXNlIFwiSTY0XCI6XHJcbiAgICAgIGNhc2UgXCJVMTI4XCI6XHJcbiAgICAgIGNhc2UgXCJJMTI4XCI6XHJcbiAgICAgIGNhc2UgXCJVMjU2XCI6XHJcbiAgICAgIGNhc2UgXCJJMjU2XCI6XHJcbiAgICAgICAgc2VxdWVuY2VUcmlnZ2VyID0gMG47XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImludmFsaWQgc2VxdWVuY2UgdHlwZVwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGNvbE5hbWU6IGNvbC5uYW1lLFxyXG4gICAgICBzZXF1ZW5jZVRyaWdnZXIsXHJcbiAgICAgIGRlc2VyaWFsaXplOiBBbGdlYnJhaWNUeXBlLm1ha2VEZXNlcmlhbGl6ZXIoY29sVHlwZSwgdHlwZXNwYWNlKVxyXG4gICAgfTtcclxuICB9KTtcclxuICBjb25zdCBoYXNBdXRvSW5jcmVtZW50ID0gc2VxdWVuY2VzLmxlbmd0aCA+IDA7XHJcbiAgY29uc3QgaXRlciA9ICgpID0+IHRhYmxlSXRlcmF0b3Ioc3lzLmRhdGFzdG9yZV90YWJsZV9zY2FuX2JzYXRuKHRhYmxlX2lkKSwgZGVzZXJpYWxpemVSb3cpO1xyXG4gIGNvbnN0IGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnMgPSBoYXNBdXRvSW5jcmVtZW50ID8gKHJvdywgcmV0X2J1ZikgPT4ge1xyXG4gICAgQklOQVJZX1JFQURFUi5yZXNldChyZXRfYnVmKTtcclxuICAgIGZvciAoY29uc3QgeyBjb2xOYW1lLCBkZXNlcmlhbGl6ZSwgc2VxdWVuY2VUcmlnZ2VyIH0gb2Ygc2VxdWVuY2VzKSB7XHJcbiAgICAgIGlmIChyb3dbY29sTmFtZV0gPT09IHNlcXVlbmNlVHJpZ2dlcikge1xyXG4gICAgICAgIHJvd1tjb2xOYW1lXSA9IGRlc2VyaWFsaXplKEJJTkFSWV9SRUFERVIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSA6IG51bGw7XHJcbiAgY29uc3QgdGFibGVNZXRob2RzID0ge1xyXG4gICAgY291bnQ6ICgpID0+IHN5cy5kYXRhc3RvcmVfdGFibGVfcm93X2NvdW50KHRhYmxlX2lkKSxcclxuICAgIGl0ZXIsXHJcbiAgICBbU3ltYm9sLml0ZXJhdG9yXTogKCkgPT4gaXRlcigpLFxyXG4gICAgaW5zZXJ0OiAocm93KSA9PiB7XHJcbiAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XHJcbiAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xyXG4gICAgICBzeXMuZGF0YXN0b3JlX2luc2VydF9ic2F0bih0YWJsZV9pZCwgYnVmLmJ1ZmZlciwgQklOQVJZX1dSSVRFUi5vZmZzZXQpO1xyXG4gICAgICBjb25zdCByZXQgPSB7IC4uLnJvdyB9O1xyXG4gICAgICBpbnRlZ3JhdGVHZW5lcmF0ZWRDb2x1bW5zPy4ocmV0LCBidWYudmlldyk7XHJcbiAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9LFxyXG4gICAgZGVsZXRlOiAocm93KSA9PiB7XHJcbiAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1Zik7XHJcbiAgICAgIEJJTkFSWV9XUklURVIud3JpdGVVMzIoMSk7XHJcbiAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xyXG4gICAgICBjb25zdCBjb3VudCA9IHN5cy5kYXRhc3RvcmVfZGVsZXRlX2FsbF9ieV9lcV9ic2F0bihcclxuICAgICAgICB0YWJsZV9pZCxcclxuICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgIEJJTkFSWV9XUklURVIub2Zmc2V0XHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiBjb3VudCA+IDA7XHJcbiAgICB9XHJcbiAgfTtcclxuICBjb25zdCB0YWJsZVZpZXcgPSBPYmplY3QuYXNzaWduKFxyXG4gICAgLyogQF9fUFVSRV9fICovIE9iamVjdC5jcmVhdGUobnVsbCksXHJcbiAgICB0YWJsZU1ldGhvZHNcclxuICApO1xyXG4gIGZvciAoY29uc3QgaW5kZXhEZWYgb2YgdGFibGUyLmluZGV4ZXMpIHtcclxuICAgIGNvbnN0IGluZGV4X2lkID0gc3lzLmluZGV4X2lkX2Zyb21fbmFtZShpbmRleERlZi5zb3VyY2VOYW1lKTtcclxuICAgIGxldCBjb2x1bW5faWRzO1xyXG4gICAgbGV0IGlzSGFzaEluZGV4ID0gZmFsc2U7XHJcbiAgICBzd2l0Y2ggKGluZGV4RGVmLmFsZ29yaXRobS50YWcpIHtcclxuICAgICAgY2FzZSBcIkhhc2hcIjpcclxuICAgICAgICBpc0hhc2hJbmRleCA9IHRydWU7XHJcbiAgICAgICAgY29sdW1uX2lkcyA9IGluZGV4RGVmLmFsZ29yaXRobS52YWx1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIkJUcmVlXCI6XHJcbiAgICAgICAgY29sdW1uX2lkcyA9IGluZGV4RGVmLmFsZ29yaXRobS52YWx1ZTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSBcIkRpcmVjdFwiOlxyXG4gICAgICAgIGNvbHVtbl9pZHMgPSBbaW5kZXhEZWYuYWxnb3JpdGhtLnZhbHVlXTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIGNvbnN0IG51bUNvbHVtbnMgPSBjb2x1bW5faWRzLmxlbmd0aDtcclxuICAgIGNvbnN0IGNvbHVtblNldCA9IG5ldyBTZXQoY29sdW1uX2lkcyk7XHJcbiAgICBjb25zdCBpc1VuaXF1ZSA9IHRhYmxlMi5jb25zdHJhaW50cy5maWx0ZXIoKHgpID0+IHguZGF0YS50YWcgPT09IFwiVW5pcXVlXCIpLnNvbWUoKHgpID0+IGNvbHVtblNldC5pc1N1YnNldE9mKG5ldyBTZXQoeC5kYXRhLnZhbHVlLmNvbHVtbnMpKSk7XHJcbiAgICBjb25zdCBpc1ByaW1hcnlLZXkgPSBpc1VuaXF1ZSAmJiBjb2x1bW5faWRzLmxlbmd0aCA9PT0gdGFibGUyLnByaW1hcnlLZXkubGVuZ3RoICYmIGNvbHVtbl9pZHMuZXZlcnkoKGlkLCBpKSA9PiB0YWJsZTIucHJpbWFyeUtleVtpXSA9PT0gaWQpO1xyXG4gICAgY29uc3QgaW5kZXhTZXJpYWxpemVycyA9IGNvbHVtbl9pZHMubWFwKFxyXG4gICAgICAoaWQpID0+IEFsZ2VicmFpY1R5cGUubWFrZVNlcmlhbGl6ZXIoXHJcbiAgICAgICAgcm93VHlwZS52YWx1ZS5lbGVtZW50c1tpZF0uYWxnZWJyYWljVHlwZSxcclxuICAgICAgICB0eXBlc3BhY2VcclxuICAgICAgKVxyXG4gICAgKTtcclxuICAgIGNvbnN0IHNlcmlhbGl6ZVBvaW50ID0gKGJ1ZmZlciwgY29sVmFsKSA9PiB7XHJcbiAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmZmVyKTtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Db2x1bW5zOyBpKyspIHtcclxuICAgICAgICBpbmRleFNlcmlhbGl6ZXJzW2ldKEJJTkFSWV9XUklURVIsIGNvbFZhbFtpXSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIEJJTkFSWV9XUklURVIub2Zmc2V0O1xyXG4gICAgfTtcclxuICAgIGNvbnN0IHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQgPSBudW1Db2x1bW5zID09PSAxID8gaW5kZXhTZXJpYWxpemVyc1swXSA6IG51bGw7XHJcbiAgICBjb25zdCBzZXJpYWxpemVTaW5nbGVQb2ludCA9IHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQgJiYgKChidWZmZXIsIGNvbFZhbCkgPT4ge1xyXG4gICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1ZmZlcik7XHJcbiAgICAgIHNlcmlhbGl6ZVNpbmdsZUVsZW1lbnQoQklOQVJZX1dSSVRFUiwgY29sVmFsKTtcclxuICAgICAgcmV0dXJuIEJJTkFSWV9XUklURVIub2Zmc2V0O1xyXG4gICAgfSk7XHJcbiAgICBsZXQgaW5kZXg7XHJcbiAgICBpZiAoaXNVbmlxdWUgJiYgc2VyaWFsaXplU2luZ2xlUG9pbnQpIHtcclxuICAgICAgY29uc3QgYmFzZSA9IHtcclxuICAgICAgICBmaW5kOiAoY29sVmFsKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgY29sVmFsKTtcclxuICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRlT25lKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlbGV0ZTogKGNvbFZhbCkgPT4ge1xyXG4gICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVTaW5nbGVQb2ludChidWYsIGNvbFZhbCk7XHJcbiAgICAgICAgICBjb25zdCBudW0gPSBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9ieV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxyXG4gICAgICAgICAgICBpbmRleF9pZCxcclxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgcG9pbnRfbGVuXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgcmV0dXJuIG51bSA+IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBpZiAoaXNQcmltYXJ5S2V5KSB7XHJcbiAgICAgICAgYmFzZS51cGRhdGUgPSAocm93KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIEJJTkFSWV9XUklURVIucmVzZXQoYnVmKTtcclxuICAgICAgICAgIHNlcmlhbGl6ZVJvdyhCSU5BUllfV1JJVEVSLCByb3cpO1xyXG4gICAgICAgICAgc3lzLmRhdGFzdG9yZV91cGRhdGVfYnNhdG4oXHJcbiAgICAgICAgICAgIHRhYmxlX2lkLFxyXG4gICAgICAgICAgICBpbmRleF9pZCxcclxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgQklOQVJZX1dSSVRFUi5vZmZzZXRcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICBpbnRlZ3JhdGVHZW5lcmF0ZWRDb2x1bW5zPy4ocm93LCBidWYudmlldyk7XHJcbiAgICAgICAgICByZXR1cm4gcm93O1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgaW5kZXggPSBiYXNlO1xyXG4gICAgfSBlbHNlIGlmIChpc1VuaXF1ZSkge1xyXG4gICAgICBjb25zdCBiYXNlID0ge1xyXG4gICAgICAgIGZpbmQ6IChjb2xWYWwpID0+IHtcclxuICAgICAgICAgIGlmIChjb2xWYWwubGVuZ3RoICE9PSBudW1Db2x1bW5zKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ3cm9uZyBudW1iZXIgb2YgZWxlbWVudHNcIik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgY29sVmFsKTtcclxuICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByZXR1cm4gdGFibGVJdGVyYXRlT25lKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlbGV0ZTogKGNvbFZhbCkgPT4ge1xyXG4gICAgICAgICAgaWYgKGNvbFZhbC5sZW5ndGggIT09IG51bUNvbHVtbnMpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ3cm9uZyBudW1iZXIgb2YgZWxlbWVudHNcIik7XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgY29sVmFsKTtcclxuICAgICAgICAgIGNvbnN0IG51bSA9IHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgICByZXR1cm4gbnVtID4gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgIGlmIChpc1ByaW1hcnlLZXkpIHtcclxuICAgICAgICBiYXNlLnVwZGF0ZSA9IChyb3cpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgQklOQVJZX1dSSVRFUi5yZXNldChidWYpO1xyXG4gICAgICAgICAgc2VyaWFsaXplUm93KEJJTkFSWV9XUklURVIsIHJvdyk7XHJcbiAgICAgICAgICBzeXMuZGF0YXN0b3JlX3VwZGF0ZV9ic2F0bihcclxuICAgICAgICAgICAgdGFibGVfaWQsXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBCSU5BUllfV1JJVEVSLm9mZnNldFxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGludGVncmF0ZUdlbmVyYXRlZENvbHVtbnM/Lihyb3csIGJ1Zi52aWV3KTtcclxuICAgICAgICAgIHJldHVybiByb3c7XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgICBpbmRleCA9IGJhc2U7XHJcbiAgICB9IGVsc2UgaWYgKHNlcmlhbGl6ZVNpbmdsZVBvaW50KSB7XHJcbiAgICAgIGNvbnN0IHJhd0luZGV4ID0ge1xyXG4gICAgICAgIGZpbHRlcjogKHJhbmdlKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgcmFuZ2UpO1xyXG4gICAgICAgICAgY29uc3QgaXRlcl9pZCA9IHN5cy5kYXRhc3RvcmVfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcclxuICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgIHBvaW50X2xlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlbGV0ZTogKHJhbmdlKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBidWYgPSBMRUFGX0JVRjtcclxuICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVNpbmdsZVBvaW50KGJ1ZiwgcmFuZ2UpO1xyXG4gICAgICAgICAgcmV0dXJuIHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICBidWYuYnVmZmVyLFxyXG4gICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICBpZiAoaXNIYXNoSW5kZXgpIHtcclxuICAgICAgICBpbmRleCA9IHJhd0luZGV4O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGluZGV4ID0gcmF3SW5kZXg7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoaXNIYXNoSW5kZXgpIHtcclxuICAgICAgaW5kZXggPSB7XHJcbiAgICAgICAgZmlsdGVyOiAocmFuZ2UpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCByYW5nZSk7XHJcbiAgICAgICAgICBjb25zdCBpdGVyX2lkID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxyXG4gICAgICAgICAgICBpbmRleF9pZCxcclxuICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgcG9pbnRfbGVuXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgcmV0dXJuIHRhYmxlSXRlcmF0b3IoaXRlcl9pZCwgZGVzZXJpYWxpemVSb3cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVsZXRlOiAocmFuZ2UpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgY29uc3QgcG9pbnRfbGVuID0gc2VyaWFsaXplUG9pbnQoYnVmLCByYW5nZSk7XHJcbiAgICAgICAgICByZXR1cm4gc3lzLmRhdGFzdG9yZV9kZWxldGVfYnlfaW5kZXhfc2Nhbl9wb2ludF9ic2F0bihcclxuICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgIHBvaW50X2xlblxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBzZXJpYWxpemVSYW5nZSA9IChidWZmZXIsIHJhbmdlKSA9PiB7XHJcbiAgICAgICAgaWYgKHJhbmdlLmxlbmd0aCA+IG51bUNvbHVtbnMpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJ0b28gbWFueSBlbGVtZW50c1wiKTtcclxuICAgICAgICBCSU5BUllfV1JJVEVSLnJlc2V0KGJ1ZmZlcik7XHJcbiAgICAgICAgY29uc3Qgd3JpdGVyID0gQklOQVJZX1dSSVRFUjtcclxuICAgICAgICBjb25zdCBwcmVmaXhfZWxlbXMgPSByYW5nZS5sZW5ndGggLSAxO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlZml4X2VsZW1zOyBpKyspIHtcclxuICAgICAgICAgIGluZGV4U2VyaWFsaXplcnNbaV0od3JpdGVyLCByYW5nZVtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHJzdGFydE9mZnNldCA9IHdyaXRlci5vZmZzZXQ7XHJcbiAgICAgICAgY29uc3QgdGVybSA9IHJhbmdlW3JhbmdlLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIGNvbnN0IHNlcmlhbGl6ZVRlcm0gPSBpbmRleFNlcmlhbGl6ZXJzW3JhbmdlLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIGlmICh0ZXJtIGluc3RhbmNlb2YgUmFuZ2UpIHtcclxuICAgICAgICAgIGNvbnN0IHdyaXRlQm91bmQgPSAoYm91bmQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdGFncyA9IHsgaW5jbHVkZWQ6IDAsIGV4Y2x1ZGVkOiAxLCB1bmJvdW5kZWQ6IDIgfTtcclxuICAgICAgICAgICAgd3JpdGVyLndyaXRlVTgodGFnc1tib3VuZC50YWddKTtcclxuICAgICAgICAgICAgaWYgKGJvdW5kLnRhZyAhPT0gXCJ1bmJvdW5kZWRcIikgc2VyaWFsaXplVGVybSh3cml0ZXIsIGJvdW5kLnZhbHVlKTtcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICB3cml0ZUJvdW5kKHRlcm0uZnJvbSk7XHJcbiAgICAgICAgICBjb25zdCByc3RhcnRMZW4gPSB3cml0ZXIub2Zmc2V0IC0gcnN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgd3JpdGVCb3VuZCh0ZXJtLnRvKTtcclxuICAgICAgICAgIGNvbnN0IHJlbmRMZW4gPSB3cml0ZXIub2Zmc2V0IC0gcnN0YXJ0TGVuO1xyXG4gICAgICAgICAgcmV0dXJuIFtyc3RhcnRPZmZzZXQsIHByZWZpeF9lbGVtcywgcnN0YXJ0TGVuLCByZW5kTGVuXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgd3JpdGVyLndyaXRlVTgoMCk7XHJcbiAgICAgICAgICBzZXJpYWxpemVUZXJtKHdyaXRlciwgdGVybSk7XHJcbiAgICAgICAgICBjb25zdCByc3RhcnRMZW4gPSB3cml0ZXIub2Zmc2V0O1xyXG4gICAgICAgICAgY29uc3QgcmVuZExlbiA9IDA7XHJcbiAgICAgICAgICByZXR1cm4gW3JzdGFydE9mZnNldCwgcHJlZml4X2VsZW1zLCByc3RhcnRMZW4sIHJlbmRMZW5dO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgaW5kZXggPSB7XHJcbiAgICAgICAgZmlsdGVyOiAocmFuZ2UpID0+IHtcclxuICAgICAgICAgIGlmIChyYW5nZS5sZW5ndGggPT09IG51bUNvbHVtbnMpIHtcclxuICAgICAgICAgICAgY29uc3QgYnVmID0gTEVBRl9CVUY7XHJcbiAgICAgICAgICAgIGNvbnN0IHBvaW50X2xlbiA9IHNlcmlhbGl6ZVBvaW50KGJ1ZiwgcmFuZ2UpO1xyXG4gICAgICAgICAgICBjb25zdCBpdGVyX2lkID0gc3lzLmRhdGFzdG9yZV9pbmRleF9zY2FuX3BvaW50X2JzYXRuKFxyXG4gICAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgICAgcG9pbnRfbGVuXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgICBjb25zdCBhcmdzID0gc2VyaWFsaXplUmFuZ2UoYnVmLCByYW5nZSk7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZXJfaWQgPSBzeXMuZGF0YXN0b3JlX2luZGV4X3NjYW5fcmFuZ2VfYnNhdG4oXHJcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgICAuLi5hcmdzXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiB0YWJsZUl0ZXJhdG9yKGl0ZXJfaWQsIGRlc2VyaWFsaXplUm93KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlbGV0ZTogKHJhbmdlKSA9PiB7XHJcbiAgICAgICAgICBpZiAocmFuZ2UubGVuZ3RoID09PSBudW1Db2x1bW5zKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgICBjb25zdCBwb2ludF9sZW4gPSBzZXJpYWxpemVQb2ludChidWYsIHJhbmdlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHN5cy5kYXRhc3RvcmVfZGVsZXRlX2J5X2luZGV4X3NjYW5fcG9pbnRfYnNhdG4oXHJcbiAgICAgICAgICAgICAgaW5kZXhfaWQsXHJcbiAgICAgICAgICAgICAgYnVmLmJ1ZmZlcixcclxuICAgICAgICAgICAgICBwb2ludF9sZW5cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gICAgICAgICAgICBjb25zdCBhcmdzID0gc2VyaWFsaXplUmFuZ2UoYnVmLCByYW5nZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzeXMuZGF0YXN0b3JlX2RlbGV0ZV9ieV9pbmRleF9zY2FuX3JhbmdlX2JzYXRuKFxyXG4gICAgICAgICAgICAgIGluZGV4X2lkLFxyXG4gICAgICAgICAgICAgIGJ1Zi5idWZmZXIsXHJcbiAgICAgICAgICAgICAgLi4uYXJnc1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuICAgIGlmIChPYmplY3QuaGFzT3duKHRhYmxlVmlldywgaW5kZXhEZWYuYWNjZXNzb3JOYW1lKSkge1xyXG4gICAgICBmcmVlemUoT2JqZWN0LmFzc2lnbih0YWJsZVZpZXdbaW5kZXhEZWYuYWNjZXNzb3JOYW1lXSwgaW5kZXgpKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRhYmxlVmlld1tpbmRleERlZi5hY2Nlc3Nvck5hbWVdID0gZnJlZXplKGluZGV4KTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGZyZWV6ZSh0YWJsZVZpZXcpO1xyXG59XHJcbmZ1bmN0aW9uKiB0YWJsZUl0ZXJhdG9yKGlkLCBkZXNlcmlhbGl6ZSkge1xyXG4gIHVzaW5nIGl0ZXIgPSBuZXcgSXRlcmF0b3JIYW5kbGUoaWQpO1xyXG4gIGNvbnN0IGl0ZXJCdWYgPSB0YWtlQnVmKCk7XHJcbiAgdHJ5IHtcclxuICAgIGxldCBhbXQ7XHJcbiAgICB3aGlsZSAoYW10ID0gaXRlci5hZHZhbmNlKGl0ZXJCdWYpKSB7XHJcbiAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBCaW5hcnlSZWFkZXIoaXRlckJ1Zi52aWV3KTtcclxuICAgICAgd2hpbGUgKHJlYWRlci5vZmZzZXQgPCBhbXQpIHtcclxuICAgICAgICB5aWVsZCBkZXNlcmlhbGl6ZShyZWFkZXIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHJldHVybkJ1ZihpdGVyQnVmKTtcclxuICB9XHJcbn1cclxuZnVuY3Rpb24gdGFibGVJdGVyYXRlT25lKGlkLCBkZXNlcmlhbGl6ZSkge1xyXG4gIGNvbnN0IGJ1ZiA9IExFQUZfQlVGO1xyXG4gIGNvbnN0IHJldCA9IGFkdmFuY2VJdGVyUmF3KGlkLCBidWYpO1xyXG4gIGlmIChyZXQgIT09IDApIHtcclxuICAgIEJJTkFSWV9SRUFERVIucmVzZXQoYnVmLnZpZXcpO1xyXG4gICAgcmV0dXJuIGRlc2VyaWFsaXplKEJJTkFSWV9SRUFERVIpO1xyXG4gIH1cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5mdW5jdGlvbiBhZHZhbmNlSXRlclJhdyhpZCwgYnVmKSB7XHJcbiAgd2hpbGUgKHRydWUpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJldHVybiAwIHwgc3lzLnJvd19pdGVyX2JzYXRuX2FkdmFuY2UoaWQsIGJ1Zi5idWZmZXIpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBpZiAoZSAmJiB0eXBlb2YgZSA9PT0gXCJvYmplY3RcIiAmJiBoYXNPd24oZSwgXCJfX2J1ZmZlcl90b29fc21hbGxfX1wiKSkge1xyXG4gICAgICAgIGJ1Zi5ncm93KGUuX19idWZmZXJfdG9vX3NtYWxsX18pO1xyXG4gICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHRocm93IGU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbnZhciBERUZBVUxUX0JVRkZFUl9DQVBBQ0lUWSA9IDMyICogMTAyNCAqIDI7XHJcbnZhciBJVEVSX0JVRlMgPSBbXHJcbiAgbmV3IFJlc2l6YWJsZUJ1ZmZlcihERUZBVUxUX0JVRkZFUl9DQVBBQ0lUWSlcclxuXTtcclxudmFyIElURVJfQlVGX0NPVU5UID0gMTtcclxuZnVuY3Rpb24gdGFrZUJ1ZigpIHtcclxuICByZXR1cm4gSVRFUl9CVUZfQ09VTlQgPyBJVEVSX0JVRlNbLS1JVEVSX0JVRl9DT1VOVF0gOiBuZXcgUmVzaXphYmxlQnVmZmVyKERFRkFVTFRfQlVGRkVSX0NBUEFDSVRZKTtcclxufVxyXG5mdW5jdGlvbiByZXR1cm5CdWYoYnVmKSB7XHJcbiAgSVRFUl9CVUZTW0lURVJfQlVGX0NPVU5UKytdID0gYnVmO1xyXG59XHJcbnZhciBMRUFGX0JVRiA9IG5ldyBSZXNpemFibGVCdWZmZXIoREVGQVVMVF9CVUZGRVJfQ0FQQUNJVFkpO1xyXG52YXIgSXRlcmF0b3JIYW5kbGUgPSBjbGFzcyBfSXRlcmF0b3JIYW5kbGUge1xyXG4gICNpZDtcclxuICBzdGF0aWMgI2ZpbmFsaXphdGlvblJlZ2lzdHJ5ID0gbmV3IEZpbmFsaXphdGlvblJlZ2lzdHJ5KFxyXG4gICAgc3lzLnJvd19pdGVyX2JzYXRuX2Nsb3NlXHJcbiAgKTtcclxuICBjb25zdHJ1Y3RvcihpZCkge1xyXG4gICAgdGhpcy4jaWQgPSBpZDtcclxuICAgIF9JdGVyYXRvckhhbmRsZS4jZmluYWxpemF0aW9uUmVnaXN0cnkucmVnaXN0ZXIodGhpcywgaWQsIHRoaXMpO1xyXG4gIH1cclxuICAvKiogVW5yZWdpc3RlciB0aGlzIG9iamVjdCB3aXRoIHRoZSBmaW5hbGl6YXRpb24gcmVnaXN0cnkgYW5kIHJldHVybiB0aGUgaWQgKi9cclxuICAjZGV0YWNoKCkge1xyXG4gICAgY29uc3QgaWQgPSB0aGlzLiNpZDtcclxuICAgIHRoaXMuI2lkID0gLTE7XHJcbiAgICBfSXRlcmF0b3JIYW5kbGUuI2ZpbmFsaXphdGlvblJlZ2lzdHJ5LnVucmVnaXN0ZXIodGhpcyk7XHJcbiAgICByZXR1cm4gaWQ7XHJcbiAgfVxyXG4gIC8qKiBDYWxsIGByb3dfaXRlcl9ic2F0bl9hZHZhbmNlYCwgcmV0dXJuaW5nIDAgaWYgdGhpcyBpdGVyYXRvciBoYXMgYmVlbiBleGhhdXN0ZWQuICovXHJcbiAgYWR2YW5jZShidWYpIHtcclxuICAgIGlmICh0aGlzLiNpZCA9PT0gLTEpIHJldHVybiAwO1xyXG4gICAgY29uc3QgcmV0ID0gYWR2YW5jZUl0ZXJSYXcodGhpcy4jaWQsIGJ1Zik7XHJcbiAgICBpZiAocmV0IDw9IDApIHRoaXMuI2RldGFjaCgpO1xyXG4gICAgcmV0dXJuIHJldCA8IDAgPyAtcmV0IDogcmV0O1xyXG4gIH1cclxuICBbU3ltYm9sLmRpc3Bvc2VdKCkge1xyXG4gICAgaWYgKHRoaXMuI2lkID49IDApIHtcclxuICAgICAgY29uc3QgaWQgPSB0aGlzLiNkZXRhY2goKTtcclxuICAgICAgc3lzLnJvd19pdGVyX2JzYXRuX2Nsb3NlKGlkKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG4vLyBzcmMvc2VydmVyL2h0dHBfaW50ZXJuYWwudHNcclxudmFyIHsgZnJlZXplOiBmcmVlemUyIH0gPSBPYmplY3Q7XHJcbnZhciB0ZXh0RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xyXG52YXIgdGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoXHJcbiAgXCJ1dGYtOFwiXHJcbiAgLyogeyBmYXRhbDogdHJ1ZSB9ICovXHJcbik7XHJcbnZhciBtYWtlUmVzcG9uc2UgPSBTeW1ib2woXCJtYWtlUmVzcG9uc2VcIik7XHJcbnZhciBTeW5jUmVzcG9uc2UgPSBjbGFzcyBfU3luY1Jlc3BvbnNlIHtcclxuICAjYm9keTtcclxuICAjaW5uZXI7XHJcbiAgY29uc3RydWN0b3IoYm9keSwgaW5pdCkge1xyXG4gICAgaWYgKGJvZHkgPT0gbnVsbCkge1xyXG4gICAgICB0aGlzLiNib2R5ID0gbnVsbDtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGJvZHkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgdGhpcy4jYm9keSA9IGJvZHk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLiNib2R5ID0gbmV3IFVpbnQ4QXJyYXkoYm9keSkuYnVmZmVyO1xyXG4gICAgfVxyXG4gICAgdGhpcy4jaW5uZXIgPSB7XHJcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKGluaXQ/LmhlYWRlcnMpLFxyXG4gICAgICBzdGF0dXM6IGluaXQ/LnN0YXR1cyA/PyAyMDAsXHJcbiAgICAgIHN0YXR1c1RleHQ6IGluaXQ/LnN0YXR1c1RleHQgPz8gXCJcIixcclxuICAgICAgdHlwZTogXCJkZWZhdWx0XCIsXHJcbiAgICAgIHVybDogbnVsbCxcclxuICAgICAgYWJvcnRlZDogZmFsc2VcclxuICAgIH07XHJcbiAgfVxyXG4gIHN0YXRpYyBbbWFrZVJlc3BvbnNlXShib2R5LCBpbm5lcikge1xyXG4gICAgY29uc3QgbWUgPSBuZXcgX1N5bmNSZXNwb25zZShib2R5KTtcclxuICAgIG1lLiNpbm5lciA9IGlubmVyO1xyXG4gICAgcmV0dXJuIG1lO1xyXG4gIH1cclxuICBnZXQgaGVhZGVycygpIHtcclxuICAgIHJldHVybiB0aGlzLiNpbm5lci5oZWFkZXJzO1xyXG4gIH1cclxuICBnZXQgc3RhdHVzKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuI2lubmVyLnN0YXR1cztcclxuICB9XHJcbiAgZ2V0IHN0YXR1c1RleHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIuc3RhdHVzVGV4dDtcclxuICB9XHJcbiAgZ2V0IG9rKCkge1xyXG4gICAgcmV0dXJuIDIwMCA8PSB0aGlzLiNpbm5lci5zdGF0dXMgJiYgdGhpcy4jaW5uZXIuc3RhdHVzIDw9IDI5OTtcclxuICB9XHJcbiAgZ2V0IHVybCgpIHtcclxuICAgIHJldHVybiB0aGlzLiNpbm5lci51cmwgPz8gXCJcIjtcclxuICB9XHJcbiAgZ2V0IHR5cGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jaW5uZXIudHlwZTtcclxuICB9XHJcbiAgYXJyYXlCdWZmZXIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ieXRlcygpLmJ1ZmZlcjtcclxuICB9XHJcbiAgYnl0ZXMoKSB7XHJcbiAgICBpZiAodGhpcy4jYm9keSA9PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiBuZXcgVWludDhBcnJheSgpO1xyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy4jYm9keSA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICByZXR1cm4gdGV4dEVuY29kZXIuZW5jb2RlKHRoaXMuI2JvZHkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHRoaXMuI2JvZHkpO1xyXG4gICAgfVxyXG4gIH1cclxuICBqc29uKCkge1xyXG4gICAgcmV0dXJuIEpTT04ucGFyc2UodGhpcy50ZXh0KCkpO1xyXG4gIH1cclxuICB0ZXh0KCkge1xyXG4gICAgaWYgKHRoaXMuI2JvZHkgPT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gXCJcIjtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMuI2JvZHkgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuI2JvZHk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGV4dERlY29kZXIuZGVjb2RlKHRoaXMuI2JvZHkpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxudmFyIHJlcXVlc3RCYXNlU2l6ZSA9IGJzYXRuQmFzZVNpemUoeyB0eXBlczogW10gfSwgSHR0cFJlcXVlc3QuYWxnZWJyYWljVHlwZSk7XHJcbnZhciBtZXRob2RzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoW1xyXG4gIFtcIkdFVFwiLCB7IHRhZzogXCJHZXRcIiB9XSxcclxuICBbXCJIRUFEXCIsIHsgdGFnOiBcIkhlYWRcIiB9XSxcclxuICBbXCJQT1NUXCIsIHsgdGFnOiBcIlBvc3RcIiB9XSxcclxuICBbXCJQVVRcIiwgeyB0YWc6IFwiUHV0XCIgfV0sXHJcbiAgW1wiREVMRVRFXCIsIHsgdGFnOiBcIkRlbGV0ZVwiIH1dLFxyXG4gIFtcIkNPTk5FQ1RcIiwgeyB0YWc6IFwiQ29ubmVjdFwiIH1dLFxyXG4gIFtcIk9QVElPTlNcIiwgeyB0YWc6IFwiT3B0aW9uc1wiIH1dLFxyXG4gIFtcIlRSQUNFXCIsIHsgdGFnOiBcIlRyYWNlXCIgfV0sXHJcbiAgW1wiUEFUQ0hcIiwgeyB0YWc6IFwiUGF0Y2hcIiB9XVxyXG5dKTtcclxuZnVuY3Rpb24gZmV0Y2godXJsLCBpbml0ID0ge30pIHtcclxuICBjb25zdCBtZXRob2QgPSBtZXRob2RzLmdldChpbml0Lm1ldGhvZD8udG9VcHBlckNhc2UoKSA/PyBcIkdFVFwiKSA/PyB7XHJcbiAgICB0YWc6IFwiRXh0ZW5zaW9uXCIsXHJcbiAgICB2YWx1ZTogaW5pdC5tZXRob2RcclxuICB9O1xyXG4gIGNvbnN0IGhlYWRlcnMgPSB7XHJcbiAgICAvLyBhbnlzIGJlY2F1c2UgdGhlIHR5cGluZ3MgYXJlIHdvbmt5IC0gc2VlIGNvbW1lbnQgaW4gU3luY1Jlc3BvbnNlLmNvbnN0cnVjdG9yXHJcbiAgICBlbnRyaWVzOiBoZWFkZXJzVG9MaXN0KG5ldyBIZWFkZXJzKGluaXQuaGVhZGVycykpLmZsYXRNYXAoKFtrLCB2XSkgPT4gQXJyYXkuaXNBcnJheSh2KSA/IHYubWFwKCh2MikgPT4gW2ssIHYyXSkgOiBbW2ssIHZdXSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoeyBuYW1lLCB2YWx1ZTogdGV4dEVuY29kZXIuZW5jb2RlKHZhbHVlKSB9KSlcclxuICB9O1xyXG4gIGNvbnN0IHVyaSA9IFwiXCIgKyB1cmw7XHJcbiAgY29uc3QgcmVxdWVzdCA9IGZyZWV6ZTIoe1xyXG4gICAgbWV0aG9kLFxyXG4gICAgaGVhZGVycyxcclxuICAgIHRpbWVvdXQ6IGluaXQudGltZW91dCxcclxuICAgIHVyaSxcclxuICAgIHZlcnNpb246IHsgdGFnOiBcIkh0dHAxMVwiIH1cclxuICB9KTtcclxuICBjb25zdCByZXF1ZXN0QnVmID0gbmV3IEJpbmFyeVdyaXRlcihyZXF1ZXN0QmFzZVNpemUpO1xyXG4gIEh0dHBSZXF1ZXN0LnNlcmlhbGl6ZShyZXF1ZXN0QnVmLCByZXF1ZXN0KTtcclxuICBjb25zdCBib2R5ID0gaW5pdC5ib2R5ID09IG51bGwgPyBuZXcgVWludDhBcnJheSgpIDogdHlwZW9mIGluaXQuYm9keSA9PT0gXCJzdHJpbmdcIiA/IGluaXQuYm9keSA6IG5ldyBVaW50OEFycmF5KGluaXQuYm9keSk7XHJcbiAgY29uc3QgW3Jlc3BvbnNlQnVmLCByZXNwb25zZUJvZHldID0gc3lzLnByb2NlZHVyZV9odHRwX3JlcXVlc3QoXHJcbiAgICByZXF1ZXN0QnVmLmdldEJ1ZmZlcigpLFxyXG4gICAgYm9keVxyXG4gICk7XHJcbiAgY29uc3QgcmVzcG9uc2UgPSBIdHRwUmVzcG9uc2UuZGVzZXJpYWxpemUobmV3IEJpbmFyeVJlYWRlcihyZXNwb25zZUJ1ZikpO1xyXG4gIHJldHVybiBTeW5jUmVzcG9uc2VbbWFrZVJlc3BvbnNlXShyZXNwb25zZUJvZHksIHtcclxuICAgIHR5cGU6IFwiYmFzaWNcIixcclxuICAgIHVybDogdXJpLFxyXG4gICAgc3RhdHVzOiByZXNwb25zZS5jb2RlLFxyXG4gICAgc3RhdHVzVGV4dDogKDAsIGltcG9ydF9zdGF0dXNlcy5kZWZhdWx0KShyZXNwb25zZS5jb2RlKSxcclxuICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKCksXHJcbiAgICBhYm9ydGVkOiBmYWxzZVxyXG4gIH0pO1xyXG59XHJcbmZyZWV6ZTIoZmV0Y2gpO1xyXG52YXIgaHR0cENsaWVudCA9IGZyZWV6ZTIoeyBmZXRjaCB9KTtcclxuXHJcbi8vIHNyYy9zZXJ2ZXIvcHJvY2VkdXJlcy50c1xyXG5mdW5jdGlvbiBtYWtlUHJvY2VkdXJlRXhwb3J0KGN0eCwgb3B0cywgcGFyYW1zLCByZXQsIGZuKSB7XHJcbiAgY29uc3QgbmFtZSA9IG9wdHM/Lm5hbWU7XHJcbiAgY29uc3QgcHJvY2VkdXJlRXhwb3J0ID0gKC4uLmFyZ3MpID0+IGZuKC4uLmFyZ3MpO1xyXG4gIHByb2NlZHVyZUV4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcclxuICBwcm9jZWR1cmVFeHBvcnRbcmVnaXN0ZXJFeHBvcnRdID0gKGN0eDIsIGV4cG9ydE5hbWUpID0+IHtcclxuICAgIHJlZ2lzdGVyUHJvY2VkdXJlKGN0eDIsIG5hbWUgPz8gZXhwb3J0TmFtZSwgcGFyYW1zLCByZXQsIGZuKTtcclxuICAgIGN0eDIuZnVuY3Rpb25FeHBvcnRzLnNldChcclxuICAgICAgcHJvY2VkdXJlRXhwb3J0LFxyXG4gICAgICBuYW1lID8/IGV4cG9ydE5hbWVcclxuICAgICk7XHJcbiAgfTtcclxuICByZXR1cm4gcHJvY2VkdXJlRXhwb3J0O1xyXG59XHJcbnZhciBUcmFuc2FjdGlvbkN0eEltcGwgPSBjbGFzcyBUcmFuc2FjdGlvbkN0eCBleHRlbmRzIFJlZHVjZXJDdHhJbXBsIHtcclxufTtcclxuZnVuY3Rpb24gcmVnaXN0ZXJQcm9jZWR1cmUoY3R4LCBleHBvcnROYW1lLCBwYXJhbXMsIHJldCwgZm4sIG9wdHMpIHtcclxuICBjdHguZGVmaW5lRnVuY3Rpb24oZXhwb3J0TmFtZSk7XHJcbiAgY29uc3QgcGFyYW1zVHlwZSA9IHtcclxuICAgIGVsZW1lbnRzOiBPYmplY3QuZW50cmllcyhwYXJhbXMpLm1hcCgoW24sIGNdKSA9PiAoe1xyXG4gICAgICBuYW1lOiBuLFxyXG4gICAgICBhbGdlYnJhaWNUeXBlOiBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KFxyXG4gICAgICAgIFwidHlwZUJ1aWxkZXJcIiBpbiBjID8gYy50eXBlQnVpbGRlciA6IGNcclxuICAgICAgKS5hbGdlYnJhaWNUeXBlXHJcbiAgICB9KSlcclxuICB9O1xyXG4gIGNvbnN0IHJldHVyblR5cGUgPSBjdHgucmVnaXN0ZXJUeXBlc1JlY3Vyc2l2ZWx5KHJldCkuYWxnZWJyYWljVHlwZTtcclxuICBjdHgubW9kdWxlRGVmLnByb2NlZHVyZXMucHVzaCh7XHJcbiAgICBzb3VyY2VOYW1lOiBleHBvcnROYW1lLFxyXG4gICAgcGFyYW1zOiBwYXJhbXNUeXBlLFxyXG4gICAgcmV0dXJuVHlwZSxcclxuICAgIHZpc2liaWxpdHk6IEZ1bmN0aW9uVmlzaWJpbGl0eS5DbGllbnRDYWxsYWJsZVxyXG4gIH0pO1xyXG4gIGNvbnN0IHsgdHlwZXNwYWNlIH0gPSBjdHg7XHJcbiAgY3R4LnByb2NlZHVyZXMucHVzaCh7XHJcbiAgICBmbixcclxuICAgIGRlc2VyaWFsaXplQXJnczogUHJvZHVjdFR5cGUubWFrZURlc2VyaWFsaXplcihwYXJhbXNUeXBlLCB0eXBlc3BhY2UpLFxyXG4gICAgc2VyaWFsaXplUmV0dXJuOiBBbGdlYnJhaWNUeXBlLm1ha2VTZXJpYWxpemVyKHJldHVyblR5cGUsIHR5cGVzcGFjZSksXHJcbiAgICByZXR1cm5UeXBlQmFzZVNpemU6IGJzYXRuQmFzZVNpemUodHlwZXNwYWNlLCByZXR1cm5UeXBlKVxyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIGNhbGxQcm9jZWR1cmUobW9kdWxlQ3R4LCBpZCwgc2VuZGVyLCBjb25uZWN0aW9uSWQsIHRpbWVzdGFtcCwgYXJnc0J1ZiwgZGJWaWV3KSB7XHJcbiAgY29uc3QgeyBmbiwgZGVzZXJpYWxpemVBcmdzLCBzZXJpYWxpemVSZXR1cm4sIHJldHVyblR5cGVCYXNlU2l6ZSB9ID0gbW9kdWxlQ3R4LnByb2NlZHVyZXNbaWRdO1xyXG4gIGNvbnN0IGFyZ3MgPSBkZXNlcmlhbGl6ZUFyZ3MobmV3IEJpbmFyeVJlYWRlcihhcmdzQnVmKSk7XHJcbiAgY29uc3QgY3R4ID0gbmV3IFByb2NlZHVyZUN0eEltcGwoXHJcbiAgICBzZW5kZXIsXHJcbiAgICB0aW1lc3RhbXAsXHJcbiAgICBjb25uZWN0aW9uSWQsXHJcbiAgICBkYlZpZXdcclxuICApO1xyXG4gIGNvbnN0IHJldCA9IGNhbGxVc2VyRnVuY3Rpb24oZm4sIGN0eCwgYXJncyk7XHJcbiAgY29uc3QgcmV0QnVmID0gbmV3IEJpbmFyeVdyaXRlcihyZXR1cm5UeXBlQmFzZVNpemUpO1xyXG4gIHNlcmlhbGl6ZVJldHVybihyZXRCdWYsIHJldCk7XHJcbiAgcmV0dXJuIHJldEJ1Zi5nZXRCdWZmZXIoKTtcclxufVxyXG52YXIgUHJvY2VkdXJlQ3R4SW1wbCA9IGNsYXNzIFByb2NlZHVyZUN0eCB7XHJcbiAgY29uc3RydWN0b3Ioc2VuZGVyLCB0aW1lc3RhbXAsIGNvbm5lY3Rpb25JZCwgZGJWaWV3KSB7XHJcbiAgICB0aGlzLnNlbmRlciA9IHNlbmRlcjtcclxuICAgIHRoaXMudGltZXN0YW1wID0gdGltZXN0YW1wO1xyXG4gICAgdGhpcy5jb25uZWN0aW9uSWQgPSBjb25uZWN0aW9uSWQ7XHJcbiAgICB0aGlzLiNkYlZpZXcgPSBkYlZpZXc7XHJcbiAgfVxyXG4gICNpZGVudGl0eTtcclxuICAjdXVpZENvdW50ZXI7XHJcbiAgI3JhbmRvbTtcclxuICAjZGJWaWV3O1xyXG4gIGdldCBpZGVudGl0eSgpIHtcclxuICAgIHJldHVybiB0aGlzLiNpZGVudGl0eSA/Pz0gbmV3IElkZW50aXR5KHN5cy5pZGVudGl0eSgpKTtcclxuICB9XHJcbiAgZ2V0IHJhbmRvbSgpIHtcclxuICAgIHJldHVybiB0aGlzLiNyYW5kb20gPz89IG1ha2VSYW5kb20odGhpcy50aW1lc3RhbXApO1xyXG4gIH1cclxuICBnZXQgaHR0cCgpIHtcclxuICAgIHJldHVybiBodHRwQ2xpZW50O1xyXG4gIH1cclxuICB3aXRoVHgoYm9keSkge1xyXG4gICAgY29uc3QgcnVuID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCB0aW1lc3RhbXAgPSBzeXMucHJvY2VkdXJlX3N0YXJ0X211dF90eCgpO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGN0eCA9IG5ldyBUcmFuc2FjdGlvbkN0eEltcGwoXHJcbiAgICAgICAgICB0aGlzLnNlbmRlcixcclxuICAgICAgICAgIG5ldyBUaW1lc3RhbXAodGltZXN0YW1wKSxcclxuICAgICAgICAgIHRoaXMuY29ubmVjdGlvbklkLFxyXG4gICAgICAgICAgdGhpcy4jZGJWaWV3KClcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybiBib2R5KGN0eCk7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBzeXMucHJvY2VkdXJlX2Fib3J0X211dF90eCgpO1xyXG4gICAgICAgIHRocm93IGU7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBsZXQgcmVzID0gcnVuKCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBzeXMucHJvY2VkdXJlX2NvbW1pdF9tdXRfdHgoKTtcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgfVxyXG4gICAgY29uc29sZS53YXJuKFwiY29tbWl0dGluZyBhbm9ueW1vdXMgdHJhbnNhY3Rpb24gZmFpbGVkXCIpO1xyXG4gICAgcmVzID0gcnVuKCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBzeXMucHJvY2VkdXJlX2NvbW1pdF9tdXRfdHgoKTtcclxuICAgICAgcmV0dXJuIHJlcztcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJhbnNhY3Rpb24gcmV0cnkgZmFpbGVkIGFnYWluXCIsIHsgY2F1c2U6IGUgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIG5ld1V1aWRWNCgpIHtcclxuICAgIGNvbnN0IGJ5dGVzID0gdGhpcy5yYW5kb20uZmlsbChuZXcgVWludDhBcnJheSgxNikpO1xyXG4gICAgcmV0dXJuIFV1aWQuZnJvbVJhbmRvbUJ5dGVzVjQoYnl0ZXMpO1xyXG4gIH1cclxuICBuZXdVdWlkVjcoKSB7XHJcbiAgICBjb25zdCBieXRlcyA9IHRoaXMucmFuZG9tLmZpbGwobmV3IFVpbnQ4QXJyYXkoNCkpO1xyXG4gICAgY29uc3QgY291bnRlciA9IHRoaXMuI3V1aWRDb3VudGVyID8/PSB7IHZhbHVlOiAwIH07XHJcbiAgICByZXR1cm4gVXVpZC5mcm9tQ291bnRlclY3KGNvdW50ZXIsIHRoaXMudGltZXN0YW1wLCBieXRlcyk7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gc3JjL3NlcnZlci9yZWR1Y2Vycy50c1xyXG5mdW5jdGlvbiBtYWtlUmVkdWNlckV4cG9ydChjdHgsIG9wdHMsIHBhcmFtcywgZm4sIGxpZmVjeWNsZSkge1xyXG4gIGNvbnN0IHJlZHVjZXJFeHBvcnQgPSAoLi4uYXJncykgPT4gZm4oLi4uYXJncyk7XHJcbiAgcmVkdWNlckV4cG9ydFtleHBvcnRDb250ZXh0XSA9IGN0eDtcclxuICByZWR1Y2VyRXhwb3J0W3JlZ2lzdGVyRXhwb3J0XSA9IChjdHgyLCBleHBvcnROYW1lKSA9PiB7XHJcbiAgICByZWdpc3RlclJlZHVjZXIoY3R4MiwgZXhwb3J0TmFtZSwgcGFyYW1zLCBmbiwgb3B0cywgbGlmZWN5Y2xlKTtcclxuICAgIGN0eDIuZnVuY3Rpb25FeHBvcnRzLnNldChcclxuICAgICAgcmVkdWNlckV4cG9ydCxcclxuICAgICAgZXhwb3J0TmFtZVxyXG4gICAgKTtcclxuICB9O1xyXG4gIHJldHVybiByZWR1Y2VyRXhwb3J0O1xyXG59XHJcbmZ1bmN0aW9uIHJlZ2lzdGVyUmVkdWNlcihjdHgsIGV4cG9ydE5hbWUsIHBhcmFtcywgZm4sIG9wdHMsIGxpZmVjeWNsZSkge1xyXG4gIGN0eC5kZWZpbmVGdW5jdGlvbihleHBvcnROYW1lKTtcclxuICBpZiAoIShwYXJhbXMgaW5zdGFuY2VvZiBSb3dCdWlsZGVyKSkge1xyXG4gICAgcGFyYW1zID0gbmV3IFJvd0J1aWxkZXIocGFyYW1zKTtcclxuICB9XHJcbiAgaWYgKHBhcmFtcy50eXBlTmFtZSA9PT0gdm9pZCAwKSB7XHJcbiAgICBwYXJhbXMudHlwZU5hbWUgPSB0b1Bhc2NhbENhc2UoZXhwb3J0TmFtZSk7XHJcbiAgfVxyXG4gIGNvbnN0IHJlZiA9IGN0eC5yZWdpc3RlclR5cGVzUmVjdXJzaXZlbHkocGFyYW1zKTtcclxuICBjb25zdCBwYXJhbXNUeXBlID0gY3R4LnJlc29sdmVUeXBlKHJlZikudmFsdWU7XHJcbiAgY29uc3QgaXNMaWZlY3ljbGUgPSBsaWZlY3ljbGUgIT0gbnVsbDtcclxuICBjdHgubW9kdWxlRGVmLnJlZHVjZXJzLnB1c2goe1xyXG4gICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcclxuICAgIHBhcmFtczogcGFyYW1zVHlwZSxcclxuICAgIC8vTW9kdWxlRGVmIHZhbGlkYXRpb24gY29kZSBpcyByZXNwb25zaWJsZSB0byBtYXJrIHByaXZhdGUgcmVkdWNlcnNcclxuICAgIHZpc2liaWxpdHk6IEZ1bmN0aW9uVmlzaWJpbGl0eS5DbGllbnRDYWxsYWJsZSxcclxuICAgIC8vSGFyZGNvZGVkIGZvciBub3cgLSByZWR1Y2VycyBkbyBub3QgcmV0dXJuIHZhbHVlcyB5ZXRcclxuICAgIG9rUmV0dXJuVHlwZTogQWxnZWJyYWljVHlwZS5Qcm9kdWN0KHsgZWxlbWVudHM6IFtdIH0pLFxyXG4gICAgZXJyUmV0dXJuVHlwZTogQWxnZWJyYWljVHlwZS5TdHJpbmdcclxuICB9KTtcclxuICBpZiAob3B0cz8ubmFtZSAhPSBudWxsKSB7XHJcbiAgICBjdHgubW9kdWxlRGVmLmV4cGxpY2l0TmFtZXMuZW50cmllcy5wdXNoKHtcclxuICAgICAgdGFnOiBcIkZ1bmN0aW9uXCIsXHJcbiAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgc291cmNlTmFtZTogZXhwb3J0TmFtZSxcclxuICAgICAgICBjYW5vbmljYWxOYW1lOiBvcHRzLm5hbWVcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIGlmIChpc0xpZmVjeWNsZSkge1xyXG4gICAgY3R4Lm1vZHVsZURlZi5saWZlQ3ljbGVSZWR1Y2Vycy5wdXNoKHtcclxuICAgICAgbGlmZWN5Y2xlU3BlYzogbGlmZWN5Y2xlLFxyXG4gICAgICBmdW5jdGlvbk5hbWU6IGV4cG9ydE5hbWVcclxuICAgIH0pO1xyXG4gIH1cclxuICBpZiAoIWZuLm5hbWUpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShmbiwgXCJuYW1lXCIsIHsgdmFsdWU6IGV4cG9ydE5hbWUsIHdyaXRhYmxlOiBmYWxzZSB9KTtcclxuICB9XHJcbiAgY3R4LnJlZHVjZXJzLnB1c2goZm4pO1xyXG59XHJcblxyXG4vLyBzcmMvc2VydmVyL3NjaGVtYS50c1xyXG52YXIgU2NoZW1hSW5uZXIgPSBjbGFzcyBleHRlbmRzIE1vZHVsZUNvbnRleHQge1xyXG4gIHNjaGVtYVR5cGU7XHJcbiAgZXhpc3RpbmdGdW5jdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldCgpO1xyXG4gIHJlZHVjZXJzID0gW107XHJcbiAgcHJvY2VkdXJlcyA9IFtdO1xyXG4gIHZpZXdzID0gW107XHJcbiAgYW5vblZpZXdzID0gW107XHJcbiAgLyoqXHJcbiAgICogTWFwcyBSZWR1Y2VyRXhwb3J0IG9iamVjdHMgdG8gdGhlIG5hbWUgb2YgdGhlIHJlZHVjZXIuXHJcbiAgICogVXNlZCBmb3IgcmVzb2x2aW5nIHRoZSByZWR1Y2VycyBvZiBzY2hlZHVsZWQgdGFibGVzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uRXhwb3J0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XHJcbiAgcGVuZGluZ1NjaGVkdWxlcyA9IFtdO1xyXG4gIGNvbnN0cnVjdG9yKGdldFNjaGVtYVR5cGUpIHtcclxuICAgIHN1cGVyKCk7XHJcbiAgICB0aGlzLnNjaGVtYVR5cGUgPSBnZXRTY2hlbWFUeXBlKHRoaXMpO1xyXG4gIH1cclxuICBkZWZpbmVGdW5jdGlvbihuYW1lKSB7XHJcbiAgICBpZiAodGhpcy5leGlzdGluZ0Z1bmN0aW9ucy5oYXMobmFtZSkpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcclxuICAgICAgICBgVGhlcmUgaXMgYWxyZWFkeSBhIHJlZHVjZXIgb3IgcHJvY2VkdXJlIHdpdGggdGhlIG5hbWUgJyR7bmFtZX0nYFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5leGlzdGluZ0Z1bmN0aW9ucy5hZGQobmFtZSk7XHJcbiAgfVxyXG4gIHJlc29sdmVTY2hlZHVsZXMoKSB7XHJcbiAgICBmb3IgKGNvbnN0IHsgcmVkdWNlciwgc2NoZWR1bGVBdENvbCwgdGFibGVOYW1lIH0gb2YgdGhpcy5wZW5kaW5nU2NoZWR1bGVzKSB7XHJcbiAgICAgIGNvbnN0IGZ1bmN0aW9uTmFtZSA9IHRoaXMuZnVuY3Rpb25FeHBvcnRzLmdldChyZWR1Y2VyKCkpO1xyXG4gICAgICBpZiAoZnVuY3Rpb25OYW1lID09PSB2b2lkIDApIHtcclxuICAgICAgICBjb25zdCBtc2cgPSBgVGFibGUgJHt0YWJsZU5hbWV9IGRlZmluZXMgYSBzY2hlZHVsZSwgYnV0IGl0IHNlZW1zIGxpa2UgdGhlIGFzc29jaWF0ZWQgZnVuY3Rpb24gd2FzIG5vdCBleHBvcnRlZC5gO1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IobXNnKTtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm1vZHVsZURlZi5zY2hlZHVsZXMucHVzaCh7XHJcbiAgICAgICAgc291cmNlTmFtZTogdm9pZCAwLFxyXG4gICAgICAgIHRhYmxlTmFtZSxcclxuICAgICAgICBzY2hlZHVsZUF0Q29sLFxyXG4gICAgICAgIGZ1bmN0aW9uTmFtZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcbnZhciBTY2hlbWEgPSBjbGFzcyB7XHJcbiAgI2N0eDtcclxuICBjb25zdHJ1Y3RvcihjdHgpIHtcclxuICAgIHRoaXMuI2N0eCA9IGN0eDtcclxuICB9XHJcbiAgW21vZHVsZUhvb2tzXShleHBvcnRzKSB7XHJcbiAgICBjb25zdCByZWdpc3RlcmVkU2NoZW1hID0gdGhpcy4jY3R4O1xyXG4gICAgZm9yIChjb25zdCBbbmFtZSwgbW9kdWxlRXhwb3J0XSBvZiBPYmplY3QuZW50cmllcyhleHBvcnRzKSkge1xyXG4gICAgICBpZiAobmFtZSA9PT0gXCJkZWZhdWx0XCIpIGNvbnRpbnVlO1xyXG4gICAgICBpZiAoIWlzTW9kdWxlRXhwb3J0KG1vZHVsZUV4cG9ydCkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxyXG4gICAgICAgICAgXCJleHBvcnRpbmcgc29tZXRoaW5nIHRoYXQgaXMgbm90IGEgc3BhY2V0aW1lIGV4cG9ydFwiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICBjaGVja0V4cG9ydENvbnRleHQobW9kdWxlRXhwb3J0LCByZWdpc3RlcmVkU2NoZW1hKTtcclxuICAgICAgbW9kdWxlRXhwb3J0W3JlZ2lzdGVyRXhwb3J0XShyZWdpc3RlcmVkU2NoZW1hLCBuYW1lKTtcclxuICAgIH1cclxuICAgIHJlZ2lzdGVyZWRTY2hlbWEucmVzb2x2ZVNjaGVkdWxlcygpO1xyXG4gICAgcmV0dXJuIG1ha2VIb29rcyhyZWdpc3RlcmVkU2NoZW1hKTtcclxuICB9XHJcbiAgZ2V0IHNjaGVtYVR5cGUoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jY3R4LnNjaGVtYVR5cGU7XHJcbiAgfVxyXG4gIGdldCBtb2R1bGVEZWYoKSB7XHJcbiAgICByZXR1cm4gdGhpcy4jY3R4Lm1vZHVsZURlZjtcclxuICB9XHJcbiAgZ2V0IHR5cGVzcGFjZSgpIHtcclxuICAgIHJldHVybiB0aGlzLiNjdHgudHlwZXNwYWNlO1xyXG4gIH1cclxuICByZWR1Y2VyKC4uLmFyZ3MpIHtcclxuICAgIGxldCBvcHRzLCBwYXJhbXMgPSB7fSwgZm47XHJcbiAgICBzd2l0Y2ggKGFyZ3MubGVuZ3RoKSB7XHJcbiAgICAgIGNhc2UgMTpcclxuICAgICAgICBbZm5dID0gYXJncztcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAyOiB7XHJcbiAgICAgICAgbGV0IGFyZzE7XHJcbiAgICAgICAgW2FyZzEsIGZuXSA9IGFyZ3M7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcxLm5hbWUgPT09IFwic3RyaW5nXCIpIG9wdHMgPSBhcmcxO1xyXG4gICAgICAgIGVsc2UgcGFyYW1zID0gYXJnMTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDM6XHJcbiAgICAgICAgW29wdHMsIHBhcmFtcywgZm5dID0gYXJncztcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiBtYWtlUmVkdWNlckV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHBhcmFtcywgZm4pO1xyXG4gIH1cclxuICBpbml0KC4uLmFyZ3MpIHtcclxuICAgIGxldCBvcHRzLCBmbjtcclxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIFtmbl0gPSBhcmdzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgW29wdHMsIGZuXSA9IGFyZ3M7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWFrZVJlZHVjZXJFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCB7fSwgZm4sIExpZmVjeWNsZS5Jbml0KTtcclxuICB9XHJcbiAgY2xpZW50Q29ubmVjdGVkKC4uLmFyZ3MpIHtcclxuICAgIGxldCBvcHRzLCBmbjtcclxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcclxuICAgICAgY2FzZSAxOlxyXG4gICAgICAgIFtmbl0gPSBhcmdzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDI6XHJcbiAgICAgICAgW29wdHMsIGZuXSA9IGFyZ3M7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWFrZVJlZHVjZXJFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCB7fSwgZm4sIExpZmVjeWNsZS5PbkNvbm5lY3QpO1xyXG4gIH1cclxuICBjbGllbnREaXNjb25uZWN0ZWQoLi4uYXJncykge1xyXG4gICAgbGV0IG9wdHMsIGZuO1xyXG4gICAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xyXG4gICAgICBjYXNlIDE6XHJcbiAgICAgICAgW2ZuXSA9IGFyZ3M7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMjpcclxuICAgICAgICBbb3B0cywgZm5dID0gYXJncztcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiBtYWtlUmVkdWNlckV4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHt9LCBmbiwgTGlmZWN5Y2xlLk9uRGlzY29ubmVjdCk7XHJcbiAgfVxyXG4gIHZpZXcob3B0cywgcmV0LCBmbikge1xyXG4gICAgcmV0dXJuIG1ha2VWaWV3RXhwb3J0KHRoaXMuI2N0eCwgb3B0cywge30sIHJldCwgZm4pO1xyXG4gIH1cclxuICAvLyBUT0RPOiByZS1lbmFibGUgb25jZSBwYXJhbWV0ZXJpemVkIHZpZXdzIGFyZSBzdXBwb3J0ZWQgaW4gU1FMXHJcbiAgLy8gdmlldzxSZXQgZXh0ZW5kcyBWaWV3UmV0dXJuVHlwZUJ1aWxkZXI+KFxyXG4gIC8vICAgb3B0czogVmlld09wdHMsXHJcbiAgLy8gICByZXQ6IFJldCxcclxuICAvLyAgIGZuOiBWaWV3Rm48Uywge30sIFJldD5cclxuICAvLyApOiB2b2lkO1xyXG4gIC8vIHZpZXc8UGFyYW1zIGV4dGVuZHMgUGFyYW1zT2JqLCBSZXQgZXh0ZW5kcyBWaWV3UmV0dXJuVHlwZUJ1aWxkZXI+KFxyXG4gIC8vICAgb3B0czogVmlld09wdHMsXHJcbiAgLy8gICBwYXJhbXM6IFBhcmFtcyxcclxuICAvLyAgIHJldDogUmV0LFxyXG4gIC8vICAgZm46IFZpZXdGbjxTLCB7fSwgUmV0PlxyXG4gIC8vICk6IHZvaWQ7XHJcbiAgLy8gdmlldzxQYXJhbXMgZXh0ZW5kcyBQYXJhbXNPYmosIFJldCBleHRlbmRzIFZpZXdSZXR1cm5UeXBlQnVpbGRlcj4oXHJcbiAgLy8gICBvcHRzOiBWaWV3T3B0cyxcclxuICAvLyAgIHBhcmFtc09yUmV0OiBSZXQgfCBQYXJhbXMsXHJcbiAgLy8gICByZXRPckZuOiBWaWV3Rm48Uywge30sIFJldD4gfCBSZXQsXHJcbiAgLy8gICBtYXliZUZuPzogVmlld0ZuPFMsIFBhcmFtcywgUmV0PlxyXG4gIC8vICk6IHZvaWQge1xyXG4gIC8vICAgaWYgKHR5cGVvZiByZXRPckZuID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgLy8gICAgIGRlZmluZVZpZXcobmFtZSwgZmFsc2UsIHt9LCBwYXJhbXNPclJldCBhcyBSZXQsIHJldE9yRm4pO1xyXG4gIC8vICAgfSBlbHNlIHtcclxuICAvLyAgICAgZGVmaW5lVmlldyhuYW1lLCBmYWxzZSwgcGFyYW1zT3JSZXQgYXMgUGFyYW1zLCByZXRPckZuLCBtYXliZUZuISk7XHJcbiAgLy8gICB9XHJcbiAgLy8gfVxyXG4gIGFub255bW91c1ZpZXcob3B0cywgcmV0LCBmbikge1xyXG4gICAgcmV0dXJuIG1ha2VBbm9uVmlld0V4cG9ydCh0aGlzLiNjdHgsIG9wdHMsIHt9LCByZXQsIGZuKTtcclxuICB9XHJcbiAgcHJvY2VkdXJlKC4uLmFyZ3MpIHtcclxuICAgIGxldCBvcHRzLCBwYXJhbXMgPSB7fSwgcmV0LCBmbjtcclxuICAgIHN3aXRjaCAoYXJncy5sZW5ndGgpIHtcclxuICAgICAgY2FzZSAyOlxyXG4gICAgICAgIFtyZXQsIGZuXSA9IGFyZ3M7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzoge1xyXG4gICAgICAgIGxldCBhcmcxO1xyXG4gICAgICAgIFthcmcxLCByZXQsIGZuXSA9IGFyZ3M7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcxLm5hbWUgPT09IFwic3RyaW5nXCIpIG9wdHMgPSBhcmcxO1xyXG4gICAgICAgIGVsc2UgcGFyYW1zID0gYXJnMTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIDQ6XHJcbiAgICAgICAgW29wdHMsIHBhcmFtcywgcmV0LCBmbl0gPSBhcmdzO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1ha2VQcm9jZWR1cmVFeHBvcnQodGhpcy4jY3R4LCBvcHRzLCBwYXJhbXMsIHJldCwgZm4pO1xyXG4gIH1cclxuICAvKipcclxuICAgKiBCdW5kbGUgbXVsdGlwbGUgcmVkdWNlcnMsIHByb2NlZHVyZXMsIGV0YyBpbnRvIG9uZSB2YWx1ZSB0byBleHBvcnQuXHJcbiAgICogVGhlIG5hbWUgdGhleSB3aWxsIGJlIGV4cG9ydGVkIHdpdGggaXMgdGhlaXIgY29ycmVzcG9uZGluZyBrZXkgaW4gdGhlIGBleHBvcnRzYCBhcmd1bWVudC5cclxuICAgKi9cclxuICBleHBvcnRHcm91cChleHBvcnRzKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBbZXhwb3J0Q29udGV4dF06IHRoaXMuI2N0eCxcclxuICAgICAgW3JlZ2lzdGVyRXhwb3J0XShjdHgsIF9leHBvcnROYW1lKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBbZXhwb3J0TmFtZSwgbW9kdWxlRXhwb3J0XSBvZiBPYmplY3QuZW50cmllcyhleHBvcnRzKSkge1xyXG4gICAgICAgICAgY2hlY2tFeHBvcnRDb250ZXh0KG1vZHVsZUV4cG9ydCwgY3R4KTtcclxuICAgICAgICAgIG1vZHVsZUV4cG9ydFtyZWdpc3RlckV4cG9ydF0oY3R4LCBleHBvcnROYW1lKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG4gIGNsaWVudFZpc2liaWxpdHlGaWx0ZXIgPSB7XHJcbiAgICBzcWw6IChmaWx0ZXIpID0+ICh7XHJcbiAgICAgIFtleHBvcnRDb250ZXh0XTogdGhpcy4jY3R4LFxyXG4gICAgICBbcmVnaXN0ZXJFeHBvcnRdKGN0eCwgX2V4cG9ydE5hbWUpIHtcclxuICAgICAgICBjdHgubW9kdWxlRGVmLnJvd0xldmVsU2VjdXJpdHkucHVzaCh7IHNxbDogZmlsdGVyIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH07XHJcbn07XHJcbnZhciByZWdpc3RlckV4cG9ydCA9IFN5bWJvbChcIlNwYWNldGltZURCLnJlZ2lzdGVyRXhwb3J0XCIpO1xyXG52YXIgZXhwb3J0Q29udGV4dCA9IFN5bWJvbChcIlNwYWNldGltZURCLmV4cG9ydENvbnRleHRcIik7XHJcbmZ1bmN0aW9uIGlzTW9kdWxlRXhwb3J0KHgpIHtcclxuICByZXR1cm4gKHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgfHwgdHlwZW9mIHggPT09IFwib2JqZWN0XCIpICYmIHggIT09IG51bGwgJiYgcmVnaXN0ZXJFeHBvcnQgaW4geDtcclxufVxyXG5mdW5jdGlvbiBjaGVja0V4cG9ydENvbnRleHQoZXhwLCBzY2hlbWEyKSB7XHJcbiAgaWYgKGV4cFtleHBvcnRDb250ZXh0XSAhPSBudWxsICYmIGV4cFtleHBvcnRDb250ZXh0XSAhPT0gc2NoZW1hMikge1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm11bHRpcGxlIHNjaGVtYXMgYXJlIG5vdCBzdXBwb3J0ZWRcIik7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIHNjaGVtYSh0YWJsZXMsIG1vZHVsZVNldHRpbmdzKSB7XHJcbiAgY29uc3QgY3R4ID0gbmV3IFNjaGVtYUlubmVyKChjdHgyKSA9PiB7XHJcbiAgICBpZiAobW9kdWxlU2V0dGluZ3M/LkNBU0VfQ09OVkVSU0lPTl9QT0xJQ1kgIT0gbnVsbCkge1xyXG4gICAgICBjdHgyLnNldENhc2VDb252ZXJzaW9uUG9saWN5KG1vZHVsZVNldHRpbmdzLkNBU0VfQ09OVkVSU0lPTl9QT0xJQ1kpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdGFibGVTY2hlbWFzID0ge307XHJcbiAgICBmb3IgKGNvbnN0IFthY2NOYW1lLCB0YWJsZTJdIG9mIE9iamVjdC5lbnRyaWVzKHRhYmxlcykpIHtcclxuICAgICAgY29uc3QgdGFibGVEZWYgPSB0YWJsZTIudGFibGVEZWYoY3R4MiwgYWNjTmFtZSk7XHJcbiAgICAgIHRhYmxlU2NoZW1hc1thY2NOYW1lXSA9IHRhYmxlVG9TY2hlbWEoYWNjTmFtZSwgdGFibGUyLCB0YWJsZURlZik7XHJcbiAgICAgIGN0eDIubW9kdWxlRGVmLnRhYmxlcy5wdXNoKHRhYmxlRGVmKTtcclxuICAgICAgaWYgKHRhYmxlMi5zY2hlZHVsZSkge1xyXG4gICAgICAgIGN0eDIucGVuZGluZ1NjaGVkdWxlcy5wdXNoKHtcclxuICAgICAgICAgIC4uLnRhYmxlMi5zY2hlZHVsZSxcclxuICAgICAgICAgIHRhYmxlTmFtZTogdGFibGVEZWYuc291cmNlTmFtZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0YWJsZTIudGFibGVOYW1lKSB7XHJcbiAgICAgICAgY3R4Mi5tb2R1bGVEZWYuZXhwbGljaXROYW1lcy5lbnRyaWVzLnB1c2goe1xyXG4gICAgICAgICAgdGFnOiBcIlRhYmxlXCIsXHJcbiAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICBzb3VyY2VOYW1lOiBhY2NOYW1lLFxyXG4gICAgICAgICAgICBjYW5vbmljYWxOYW1lOiB0YWJsZTIudGFibGVOYW1lXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB7IHRhYmxlczogdGFibGVTY2hlbWFzIH07XHJcbiAgfSk7XHJcbiAgcmV0dXJuIG5ldyBTY2hlbWEoY3R4KTtcclxufVxyXG5cclxuLy8gc3JjL3NlcnZlci9jb25zb2xlLnRzXHJcbnZhciBpbXBvcnRfb2JqZWN0X2luc3BlY3QgPSBfX3RvRVNNKHJlcXVpcmVfb2JqZWN0X2luc3BlY3QoKSk7XHJcbnZhciBmbXRMb2cgPSAoLi4uZGF0YSkgPT4gZGF0YS5tYXAoKHgpID0+IHR5cGVvZiB4ID09PSBcInN0cmluZ1wiID8geCA6ICgwLCBpbXBvcnRfb2JqZWN0X2luc3BlY3QuZGVmYXVsdCkoeCkpLmpvaW4oXCIgXCIpO1xyXG52YXIgY29uc29sZV9sZXZlbF9lcnJvciA9IDA7XHJcbnZhciBjb25zb2xlX2xldmVsX3dhcm4gPSAxO1xyXG52YXIgY29uc29sZV9sZXZlbF9pbmZvID0gMjtcclxudmFyIGNvbnNvbGVfbGV2ZWxfZGVidWcgPSAzO1xyXG52YXIgY29uc29sZV9sZXZlbF90cmFjZSA9IDQ7XHJcbnZhciB0aW1lck1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XHJcbnZhciBjb25zb2xlMiA9IHtcclxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHdlIHdhbnQgYSBibGFuayBwcm90b3R5cGUsIGJ1dCB0eXBlc2NyaXB0IGNvbXBsYWluc1xyXG4gIF9fcHJvdG9fXzoge30sXHJcbiAgW1N5bWJvbC50b1N0cmluZ1RhZ106IFwiY29uc29sZVwiLFxyXG4gIGFzc2VydDogKGNvbmRpdGlvbiA9IGZhbHNlLCAuLi5kYXRhKSA9PiB7XHJcbiAgICBpZiAoIWNvbmRpdGlvbikge1xyXG4gICAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9lcnJvciwgZm10TG9nKC4uLmRhdGEpKTtcclxuICAgIH1cclxuICB9LFxyXG4gIGNsZWFyOiAoKSA9PiB7XHJcbiAgfSxcclxuICBkZWJ1ZzogKC4uLmRhdGEpID0+IHtcclxuICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX2RlYnVnLCBmbXRMb2coLi4uZGF0YSkpO1xyXG4gIH0sXHJcbiAgZXJyb3I6ICguLi5kYXRhKSA9PiB7XHJcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9lcnJvciwgZm10TG9nKC4uLmRhdGEpKTtcclxuICB9LFxyXG4gIGluZm86ICguLi5kYXRhKSA9PiB7XHJcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2coLi4uZGF0YSkpO1xyXG4gIH0sXHJcbiAgbG9nOiAoLi4uZGF0YSkgPT4ge1xyXG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfaW5mbywgZm10TG9nKC4uLmRhdGEpKTtcclxuICB9LFxyXG4gIHRhYmxlOiAodGFidWxhckRhdGEsIF9wcm9wZXJ0aWVzKSA9PiB7XHJcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2codGFidWxhckRhdGEpKTtcclxuICB9LFxyXG4gIHRyYWNlOiAoLi4uZGF0YSkgPT4ge1xyXG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfdHJhY2UsIGZtdExvZyguLi5kYXRhKSk7XHJcbiAgfSxcclxuICB3YXJuOiAoLi4uZGF0YSkgPT4ge1xyXG4gICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgZm10TG9nKC4uLmRhdGEpKTtcclxuICB9LFxyXG4gIGRpcjogKF9pdGVtLCBfb3B0aW9ucykgPT4ge1xyXG4gIH0sXHJcbiAgZGlyeG1sOiAoLi4uX2RhdGEpID0+IHtcclxuICB9LFxyXG4gIC8vIENvdW50aW5nXHJcbiAgY291bnQ6IChfbGFiZWwgPSBcImRlZmF1bHRcIikgPT4ge1xyXG4gIH0sXHJcbiAgY291bnRSZXNldDogKF9sYWJlbCA9IFwiZGVmYXVsdFwiKSA9PiB7XHJcbiAgfSxcclxuICAvLyBHcm91cGluZ1xyXG4gIGdyb3VwOiAoLi4uX2RhdGEpID0+IHtcclxuICB9LFxyXG4gIGdyb3VwQ29sbGFwc2VkOiAoLi4uX2RhdGEpID0+IHtcclxuICB9LFxyXG4gIGdyb3VwRW5kOiAoKSA9PiB7XHJcbiAgfSxcclxuICAvLyBUaW1pbmdcclxuICB0aW1lOiAobGFiZWwgPSBcImRlZmF1bHRcIikgPT4ge1xyXG4gICAgaWYgKHRpbWVyTWFwLmhhcyhsYWJlbCkpIHtcclxuICAgICAgc3lzLmNvbnNvbGVfbG9nKGNvbnNvbGVfbGV2ZWxfd2FybiwgYFRpbWVyICcke2xhYmVsfScgYWxyZWFkeSBleGlzdHMuYCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRpbWVyTWFwLnNldChsYWJlbCwgc3lzLmNvbnNvbGVfdGltZXJfc3RhcnQobGFiZWwpKTtcclxuICB9LFxyXG4gIHRpbWVMb2c6IChsYWJlbCA9IFwiZGVmYXVsdFwiLCAuLi5kYXRhKSA9PiB7XHJcbiAgICBzeXMuY29uc29sZV9sb2coY29uc29sZV9sZXZlbF9pbmZvLCBmbXRMb2cobGFiZWwsIC4uLmRhdGEpKTtcclxuICB9LFxyXG4gIHRpbWVFbmQ6IChsYWJlbCA9IFwiZGVmYXVsdFwiKSA9PiB7XHJcbiAgICBjb25zdCBzcGFuSWQgPSB0aW1lck1hcC5nZXQobGFiZWwpO1xyXG4gICAgaWYgKHNwYW5JZCA9PT0gdm9pZCAwKSB7XHJcbiAgICAgIHN5cy5jb25zb2xlX2xvZyhjb25zb2xlX2xldmVsX3dhcm4sIGBUaW1lciAnJHtsYWJlbH0nIGRvZXMgbm90IGV4aXN0LmApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBzeXMuY29uc29sZV90aW1lcl9lbmQoc3BhbklkKTtcclxuICAgIHRpbWVyTWFwLmRlbGV0ZShsYWJlbCk7XHJcbiAgfSxcclxuICAvLyBBZGRpdGlvbmFsIGNvbnNvbGUgbWV0aG9kcyB0byBzYXRpc2Z5IHRoZSBDb25zb2xlIGludGVyZmFjZVxyXG4gIHRpbWVTdGFtcDogKCkgPT4ge1xyXG4gIH0sXHJcbiAgcHJvZmlsZTogKCkgPT4ge1xyXG4gIH0sXHJcbiAgcHJvZmlsZUVuZDogKCkgPT4ge1xyXG4gIH1cclxufTtcclxuXHJcbi8vIHNyYy9zZXJ2ZXIvcG9seWZpbGxzLnRzXHJcbmdsb2JhbFRoaXMuY29uc29sZSA9IGNvbnNvbGUyO1xyXG4vKiEgQnVuZGxlZCBsaWNlbnNlIGluZm9ybWF0aW9uOlxyXG5cclxuc3RhdHVzZXMvaW5kZXguanM6XHJcbiAgKCohXHJcbiAgICogc3RhdHVzZXNcclxuICAgKiBDb3B5cmlnaHQoYykgMjAxNCBKb25hdGhhbiBPbmdcclxuICAgKiBDb3B5cmlnaHQoYykgMjAxNiBEb3VnbGFzIENocmlzdG9waGVyIFdpbHNvblxyXG4gICAqIE1JVCBMaWNlbnNlZFxyXG4gICAqKVxyXG4qL1xyXG5cclxuZXhwb3J0IHsgQXJyYXlCdWlsZGVyLCBBcnJheUNvbHVtbkJ1aWxkZXIsIEJvb2xCdWlsZGVyLCBCb29sQ29sdW1uQnVpbGRlciwgQm9vbGVhbkV4cHIsIEJ5dGVBcnJheUJ1aWxkZXIsIEJ5dGVBcnJheUNvbHVtbkJ1aWxkZXIsIENhc2VDb252ZXJzaW9uUG9saWN5LCBDb2x1bW5CdWlsZGVyLCBDb2x1bW5FeHByZXNzaW9uLCBDb25uZWN0aW9uSWRCdWlsZGVyLCBDb25uZWN0aW9uSWRDb2x1bW5CdWlsZGVyLCBGMzJCdWlsZGVyLCBGMzJDb2x1bW5CdWlsZGVyLCBGNjRCdWlsZGVyLCBGNjRDb2x1bW5CdWlsZGVyLCBJMTI4QnVpbGRlciwgSTEyOENvbHVtbkJ1aWxkZXIsIEkxNkJ1aWxkZXIsIEkxNkNvbHVtbkJ1aWxkZXIsIEkyNTZCdWlsZGVyLCBJMjU2Q29sdW1uQnVpbGRlciwgSTMyQnVpbGRlciwgSTMyQ29sdW1uQnVpbGRlciwgSTY0QnVpbGRlciwgSTY0Q29sdW1uQnVpbGRlciwgSThCdWlsZGVyLCBJOENvbHVtbkJ1aWxkZXIsIElkZW50aXR5QnVpbGRlciwgSWRlbnRpdHlDb2x1bW5CdWlsZGVyLCBPcHRpb25CdWlsZGVyLCBPcHRpb25Db2x1bW5CdWlsZGVyLCBQcm9kdWN0QnVpbGRlciwgUHJvZHVjdENvbHVtbkJ1aWxkZXIsIFJlZkJ1aWxkZXIsIFJlc3VsdEJ1aWxkZXIsIFJlc3VsdENvbHVtbkJ1aWxkZXIsIFJvd0J1aWxkZXIsIFNjaGVkdWxlQXRCdWlsZGVyLCBTY2hlZHVsZUF0Q29sdW1uQnVpbGRlciwgU2VuZGVyRXJyb3IsIFNpbXBsZVN1bUJ1aWxkZXIsIFNpbXBsZVN1bUNvbHVtbkJ1aWxkZXIsIFNwYWNldGltZUhvc3RFcnJvciwgU3RyaW5nQnVpbGRlciwgU3RyaW5nQ29sdW1uQnVpbGRlciwgU3VtQnVpbGRlciwgU3VtQ29sdW1uQnVpbGRlciwgVGltZUR1cmF0aW9uQnVpbGRlciwgVGltZUR1cmF0aW9uQ29sdW1uQnVpbGRlciwgVGltZXN0YW1wQnVpbGRlciwgVGltZXN0YW1wQ29sdW1uQnVpbGRlciwgVHlwZUJ1aWxkZXIsIFUxMjhCdWlsZGVyLCBVMTI4Q29sdW1uQnVpbGRlciwgVTE2QnVpbGRlciwgVTE2Q29sdW1uQnVpbGRlciwgVTI1NkJ1aWxkZXIsIFUyNTZDb2x1bW5CdWlsZGVyLCBVMzJCdWlsZGVyLCBVMzJDb2x1bW5CdWlsZGVyLCBVNjRCdWlsZGVyLCBVNjRDb2x1bW5CdWlsZGVyLCBVOEJ1aWxkZXIsIFU4Q29sdW1uQnVpbGRlciwgVXVpZEJ1aWxkZXIsIFV1aWRDb2x1bW5CdWlsZGVyLCBhbmQsIGNyZWF0ZVRhYmxlUmVmRnJvbURlZiwgZXJyb3JzLCBldmFsdWF0ZUJvb2xlYW5FeHByLCBnZXRRdWVyeUFjY2Vzc29yTmFtZSwgZ2V0UXVlcnlUYWJsZU5hbWUsIGdldFF1ZXJ5V2hlcmVDbGF1c2UsIGlzUm93VHlwZWRRdWVyeSwgaXNUeXBlZFF1ZXJ5LCBsaXRlcmFsLCBtYWtlUXVlcnlCdWlsZGVyLCBub3QsIG9yLCBzY2hlbWEsIHQsIHRhYmxlLCB0b0NhbWVsQ2FzZSwgdG9Db21wYXJhYmxlVmFsdWUsIHRvU3FsIH07XHJcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4Lm1qcy5tYXBcclxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXgubWpzLm1hcCIsImltcG9ydCB7IHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5cclxuZXhwb3J0IGNvbnN0IFJvbGUgPSB0LmVudW0oJ1JvbGUnLCB7XHJcbiAgICBBZG1pbjogdC51bml0KCksXHJcbiAgICBUb3VybmFtZW50SG9zdDogdC51bml0KCksXHJcbiAgICBVc2VyOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgUGF0aCA9IHQuZW51bSgnUGF0aCcsIHtcclxuICAgIEFidW5kYW5jZTogdC51bml0KCksXHJcbiAgICBEZXN0cnVjdGlvbjogdC51bml0KCksXHJcbiAgICBFcnVkaXRpb246IHQudW5pdCgpLFxyXG4gICAgSGFybW9ueTogdC51bml0KCksXHJcbiAgICBIdW50OiB0LnVuaXQoKSxcclxuICAgIE5paGlsaXR5OiB0LnVuaXQoKSxcclxuICAgIFByZXNlcnZhdGlvbjogdC51bml0KCksXHJcbiAgICBSZW1lbWJyYW5jZTogdC51bml0KCksXHJcbiAgICBFbGF0aW9uOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgRWxlbWVudCA9IHQuZW51bSgnRWxlbWVudCcsIHtcclxuICAgIEZpcmU6IHQudW5pdCgpLFxyXG4gICAgSWNlOiB0LnVuaXQoKSxcclxuICAgIEltYWdpbmFyeTogdC51bml0KCksXHJcbiAgICBMaWdodG5pbmc6IHQudW5pdCgpLFxyXG4gICAgUGh5c2ljYWw6IHQudW5pdCgpLFxyXG4gICAgUXVhbnR1bTogdC51bml0KCksXHJcbiAgICBXaW5kOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgQ2hhclJvbGUgPSB0LmVudW0oJ0NoYXJSb2xlJywge1xyXG4gICAgRHBzOiB0LnVuaXQoKSxcclxuICAgIFN1c3RhaW46IHQudW5pdCgpLFxyXG4gICAgU3VwcG9ydDogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEdhbWVNb2RlID0gdC5lbnVtKCdHYW1lTW9kZScsIHtcclxuICAgIE1lbW9yeU9mQ2hhb3M6IHQudW5pdCgpLFxyXG4gICAgQXBvY2FseXB0aWNTaGFkb3c6IHQudW5pdCgpLFxyXG4gICAgQW5vbWFseUFyYml0cmF0aW9uOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgRHJhZnRNb2RlID0gdC5lbnVtKCdEcmFmdE1vZGUnLCB7XHJcbiAgICBDbGFzc2ljOiB0LnVuaXQoKSxcclxuICAgIEF1Y3Rpb246IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBCYW5Nb2RlID0gdC5lbnVtKCdCYW5Nb2RlJywge1xyXG4gICAgTm9uZTogdC51bml0KCksXHJcbiAgICBUd286IHQudW5pdCgpLFxyXG4gICAgRm91cjogdC51bml0KCksXHJcbiAgICBTaXg6IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBMb2JieVN0YWdlID0gdC5lbnVtKCdMb2JieVN0YWdlJywge1xyXG4gICAgV2FpdGluZzogdC51bml0KCksXHJcbiAgICBEcmFmdGluZzogdC51bml0KCksXHJcbiAgICBGaW5pc2hlZDogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBhcnRpY2lwYXRpb25Sb2xlID0gdC5lbnVtKCdQYXJ0aWNpcGF0aW9uUm9sZScsIHtcclxuICAgIFBsYXllcjogdC51bml0KCksXHJcbiAgICBTcGVjdGF0b3I6IHQudW5pdCgpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBUZWFtTGFiZWwgPSB0LmVudW0oJ1RlYW1MYWJlbCcsIHtcclxuICAgIFNwZWN0YXRvcjogdC51bml0KCksXHJcbiAgICBCbHVlOiB0LnVuaXQoKSxcclxuICAgIFJlZDogdC51bml0KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IE1hdGNoUmVzdWx0ID0gdC5lbnVtKCdNYXRjaFJlc3VsdCcsIHtcclxuICAgIEJsdWVXaW5zOiB0LnVuaXQoKSxcclxuICAgIFJlZFdpbnM6IHQudW5pdCgpLFxyXG4gICAgRHJhdzogdC51bml0KCksXHJcbiAgICBBYm9ydGVkOiB0LnVuaXQoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgQWN0aW9uVHlwZSA9IHQuZW51bSgnQWN0aW9uVHlwZScsIHtcclxuICAgIFBpY2s6IHQudW5pdCgpLFxyXG4gICAgQmFuOiB0LnVuaXQoKSxcclxuICAgIE5vbWluYXRlOiB0LnVuaXQoKSxcclxuICAgIEJpZDogdC51bml0KCksXHJcbiAgICBBdWN0aW9uU29sZDogdC51bml0KCksXHJcbiAgICBQYXVzZTogdC51bml0KCksXHJcbiAgICBVbmRvOiB0LnVuaXQoKSxcclxufSk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBSb2xlIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IHVzZXJDb2x1bW5zID0ge1xyXG4gICAgaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLmF1dG9JbmMoKSxcclxuICAgIHVzZXJuYW1lOiB0LnN0cmluZygpLnVuaXF1ZSgpLFxyXG4gICAgZGlzcGxheU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgICBpc0d1ZXN0OiB0LmJvb2woKSxcclxuICAgIGxhc3RMb2dpbkF0OiB0LnRpbWVzdGFtcCgpLFxyXG4gICAgcm9sZTogUm9sZSxcclxuICAgIGRpc2NvcmRJZDogdC5zdHJpbmcoKS5vcHRpb25hbCgpLFxyXG4gICAgYXZhdGFyQ2hhcmFjdGVyTmFtZTogdC5zdHJpbmcoKSwgLy8gRksgcmVmZXJlbmNlIHRvIEhzckNoYXJhY3RlciBuYW1lXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgVXNlciA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICd1c2VyJyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIGluZGV4ZXM6IFtcclxuICAgICAgICB7IG5hbWU6ICd1c2VyX2Rpc2NvcmRfaWQnLCBhY2Nlc3NvcjogJ3VzZXJfZGlzY29yZF9pZCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydkaXNjb3JkSWQnXSB9LFxyXG4gICAgXVxyXG59LCB1c2VyQ29sdW1ucyk7XHJcbiIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuXHJcbi8qKlxyXG4gKiBNYXBzIFNwYWNldGltZURCIGlkZW50aXRpZXMgKHBlci1kZXZpY2UpIHRvIHBlcnNpc3RlbnQgVXNlciBJRHMgKG1hbnktdG8tb25lKS5cclxuICogRWFjaCBkZXZpY2UvYnJvd3NlciBnZW5lcmF0ZXMgYSB1bmlxdWUgaWRlbnRpdHk7IHRoaXMgdGFibGUgbGlua3MgdGhlbSBhbGxcclxuICogYmFjayB0byBhIHNpbmdsZSBVc2VyIHJlY29yZC5cclxuICovXHJcbmV4cG9ydCBjb25zdCB1c2VySWRlbnRpdHlDb2x1bW5zID0ge1xyXG4gICAgaWRlbnRpdHk6IHQuaWRlbnRpdHkoKS5wcmltYXJ5S2V5KCksXHJcbiAgICB1c2VySWQ6IHQudTMyKCksXHJcbiAgICBsYXN0U2VlbkF0OiB0LnRpbWVzdGFtcCgpLCAvLyBGb3IgZnV0dXJlIGNsZWFudXAgb2Ygc3RhbGUgaWRlbnRpdHkgbWFwcGluZ3NcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBVc2VySWRlbnRpdHkgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAndXNlcl9pZGVudGl0eScsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICBpbmRleGVzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAndXNlcl9pZGVudGl0eV91c2VyX2lkJywgYWNjZXNzb3I6ICd1c2VyX2lkZW50aXR5X3VzZXJfaWQnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsndXNlcklkJ10gfSxcclxuICAgIF1cclxufSwgdXNlcklkZW50aXR5Q29sdW1ucyk7XHJcbiIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuXHJcbi8qKlxyXG4gKiBTdG9yZXMgdGhlIHRydXN0ZWQgc2VydmVyIGlkZW50aXR5IChOZXh0LmpzIEFQSSBzZXJ2ZXIpLlxyXG4gKiBPbmx5IG9uZSByb3cgc2hvdWxkIGV2ZXIgZXhpc3QuIFRoZSBzZXJ2ZXIgaWRlbnRpdHkgaXMgdGhlIG9ubHkgY2FsbGVyXHJcbiAqIGFsbG93ZWQgdG8gaW52b2tlIHNlcnZlcl9saW5rX2Rpc2NvcmQgKHdoaWNoIGxpbmtzIERpc2NvcmQgYWNjb3VudHMgdG8gdXNlcnMpLlxyXG4gKlxyXG4gKiBCb290c3RyYXA6IGNhbGwgcmVnaXN0ZXJfc2VydmVyIHdoZW4gdGhlIHRhYmxlIGlzIGVtcHR5LlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHNlcnZlcklkZW50aXR5Q29sdW1ucyA9IHtcclxuICAgIGlkZW50aXR5OiB0LmlkZW50aXR5KCkucHJpbWFyeUtleSgpLFxyXG4gICAgcmVnaXN0ZXJlZEF0OiB0LnRpbWVzdGFtcCgpLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IFNlcnZlcklkZW50aXR5ID0gdGFibGUoe1xyXG4gICAgbmFtZTogJ3NlcnZlcl9pZGVudGl0eScsXHJcbiAgICBwdWJsaWM6IGZhbHNlLCAvLyBObyBjbGllbnQgbmVlZHMgdG8gcmVhZCB0aGlzXHJcbn0sIHNlcnZlcklkZW50aXR5Q29sdW1ucyk7XHJcbiIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgUGF0aCwgRWxlbWVudCwgQ2hhclJvbGUgfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcblxyXG5leHBvcnQgY29uc3QgaHNyQ2hhcmFjdGVyQ29sdW1ucyA9IHtcclxuICAgIG5hbWU6IHQuc3RyaW5nKCkucHJpbWFyeUtleSgpLFxyXG4gICAgZGlzcGxheU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgICBhbGlhc2VzOiB0LmFycmF5KHQuc3RyaW5nKCkpLFxyXG4gICAgcmFyaXR5OiB0LnU4KCksXHJcbiAgICBwYXRoOiBQYXRoLFxyXG4gICAgZWxlbWVudDogRWxlbWVudCxcclxuICAgIHJvbGU6IENoYXJSb2xlLFxyXG4gICAgaW1hZ2VVcmw6IHQuc3RyaW5nKCksXHJcbn07XHJcblxyXG4vLyBQZW9wbGUgZnJvbSB0aGUgZm9ydW1zIHNheSB3ZSBkb250IG5lZWQgXCJuYW1lXCI6IFhYWFhYWFhYWCBvbiBpbmRleGVzIGFueW1vcmVcclxuZXhwb3J0IGNvbnN0IEhzckNoYXJhY3RlciA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdoc3JfY2hhcmFjdGVyJyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIGluZGV4ZXM6IFtcclxuICAgICAgICB7IG5hbWU6ICdjaGFyYWN0ZXJfYnlfcGF0aCcsIGFjY2Vzc29yOiAnY2hhcmFjdGVyX2J5X3BhdGgnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsncGF0aCddIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY2hhcmFjdGVyX2J5X2VsZW1lbnQnLCBhY2Nlc3NvcjogJ2NoYXJhY3Rlcl9ieV9lbGVtZW50JywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ2VsZW1lbnQnXSB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2NoYXJhY3Rlcl9ieV9yb2xlJywgYWNjZXNzb3I6ICdjaGFyYWN0ZXJfYnlfcm9sZScsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydyb2xlJ10gfSxcclxuICAgIF1cclxufSwgaHNyQ2hhcmFjdGVyQ29sdW1ucyk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBQYXRoIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGhzckxpZ2h0Y29uZUNvbHVtbnMgPSB7XHJcbiAgICBuYW1lOiB0LnN0cmluZygpLnByaW1hcnlLZXkoKSxcclxuICAgIGRpc3BsYXlOYW1lOiB0LnN0cmluZygpLFxyXG4gICAgYWxpYXNlczogdC5hcnJheSh0LnN0cmluZygpKSxcclxuICAgIHBhdGg6IFBhdGgsXHJcbiAgICByYXJpdHk6IHQudTgoKSxcclxuICAgIGltYWdlVXJsOiB0LnN0cmluZygpLFxyXG5cclxuICAgIC8vIENTUyBwb3NpdGlvbmluZyBjb3JyZWN0aW9ucyBmb3IgdGhlIFVJXHJcbiAgICBwb3NYOiB0LmkzMigpLFxyXG4gICAgcG9zWTogdC5pMzIoKSxcclxuICAgIHdpZHRoOiB0LmkzMigpLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IEhzckxpZ2h0Y29uZSA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdoc3JfbGlnaHRjb25lJyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIGluZGV4ZXM6IFtcclxuICAgICAgICB7IG5hbWU6ICdsaWdodGNvbmVfYnlfcGF0aCcsIGFjY2Vzc29yOiAnbGlnaHRjb25lX2J5X3BhdGgnLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsncGF0aCddIH0sXHJcbiAgICBdXHJcbn0sIGhzckxpZ2h0Y29uZUNvbHVtbnMpOyIsImltcG9ydCB7IHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQge1xyXG4gICAgRHJhZnRNb2RlLFxyXG4gICAgQmFuTW9kZSxcclxuICAgIEFjdGlvblR5cGUsXHJcbiAgICBUZWFtTGFiZWxcclxufSBmcm9tICcuL2VudW1zJztcclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tIFNUUlVDVFMgLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmV4cG9ydCBjb25zdCBMb2JieUNvbmZpZyA9IHQub2JqZWN0KCdMb2JieUNvbmZpZycsIHtcclxuICAgIHRlYW1fc2l6ZTogdC51OCgpLCAgICAgICAgICAgICAgIC8vIDEsIDIsIG9yIDNcclxuICAgIGRyYWZ0X21vZGU6IERyYWZ0TW9kZSxcclxuICAgIGJhbl9tb2RlOiBCYW5Nb2RlLFxyXG4gICAgc3RhbmRhcmRfdHVybl9zZWNvbmRzOiB0LnUzMigpLFxyXG4gICAgcmVzZXJ2ZV9iYW5rX3NlY29uZHM6IHQudTMyKCksXHJcbiAgICBhdWN0aW9uX2J1ZGdldDogdC5mMzIoKS5vcHRpb25hbCgpLFxyXG5cclxuICAgIC8vIEJhbGFuY2UgTWF0aFxyXG4gICAgcm9zdGVyX2RpZmZfYWR2YW50YWdlOiB0LmYzMigpLFxyXG4gICAgcm9zdGVyX3RocmVzaG9sZDogdC5mMzIoKSxcclxuICAgIHVuZGVyX3RocmVzaG9sZF9hZHZhbnRhZ2U6IHQuZjMyKCksXHJcbiAgICBhYm92ZV90aHJlc2hvbGRfcGVuYWx0eTogdC5mMzIoKSxcclxuICAgIGRlYXRoX3BlbmFsdHk6IHQuZjMyKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFBsYXllclNuYXBzaG90ID0gdC5vYmplY3QoJ1BsYXllclNuYXBzaG90Jywge1xyXG4gICAgdXNlcklkOiB0LnUzMigpLFxyXG4gICAgZGlzcGxheV9uYW1lOiB0LnN0cmluZygpLFxyXG4gICAgYXZhdGFyX3VybDogdC5zdHJpbmcoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgVGltZXJTdGF0ZSA9IHQub2JqZWN0KCdUaW1lclN0YXRlJywge1xyXG4gICAgdHVybl9zdGFydF9hdDogdC50aW1lc3RhbXAoKSxcclxuICAgIHRlYW1fYmx1ZV9yZXNlcnZlX21zOiB0LnUzMigpLFxyXG4gICAgdGVhbV9yZWRfcmVzZXJ2ZV9tczogdC51MzIoKSxcclxuICAgIGlzX3BhdXNlZDogdC5ib29sKCksXHJcbiAgICBhY2N1bXVsYXRlZF9wYXVzZV9tczogdC51MzIoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgRHJhZnRTdGVwID0gdC5vYmplY3QoJ0RyYWZ0U3RlcCcsIHtcclxuICAgIGFjdGlvbl9yZXF1aXJlZDogQWN0aW9uVHlwZSxcclxuICAgIHRlYW1fdHVybjogVGVhbUxhYmVsLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBFaWRvbG9uQ29zdCA9IHQub2JqZWN0KCdFaWRvbG9uQ29zdCcsIHtcclxuICAgIGUwOiB0LmYzMigpLFxyXG4gICAgZTE6IHQuZjMyKCksXHJcbiAgICBlMjogdC5mMzIoKSxcclxuICAgIGUzOiB0LmYzMigpLFxyXG4gICAgZTQ6IHQuZjMyKCksXHJcbiAgICBlNTogdC5mMzIoKSxcclxuICAgIGU2OiB0LmYzMigpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBTdXBlcmltcG9zaXRpb25Db3N0ID0gdC5vYmplY3QoJ1N1cGVyaW1wb3NpdGlvbkNvc3QnLCB7XHJcbiAgICBzMTogdC5mMzIoKSxcclxuICAgIHMyOiB0LmYzMigpLFxyXG4gICAgczM6IHQuZjMyKCksXHJcbiAgICBzNDogdC5mMzIoKSxcclxuICAgIHM1OiB0LmYzMigpLFxyXG59KTtcclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tIEFDVElPTiBQQVlMT0FEUyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyBJbnN0ZWFkIG9mIGEgcmF3IEpTT04gc3RyaW5nLCB3ZSBkZWZpbmUgYSBTdW0gVHlwZSAoVGFnZ2VkIFVuaW9uKS5cclxuLy8gVGhpcyByZXBsYWNlcyB0aGUgXCJKU09OXCIgY29sdW1uIHdpdGggYSB0eXBlLXNhZmUgc3RydWN0dXJlLlxyXG5cclxuZXhwb3J0IGNvbnN0IFBpY2tQYXlsb2FkID0gdC5vYmplY3QoJ1BpY2tQYXlsb2FkJywge1xyXG4gICAgY2hhcmFjdGVyX25hbWU6IHQuc3RyaW5nKCksXHJcbiAgICBlaWRvbG9uOiB0LnU4KCksXHJcbiAgICBjb3N0X3BhaWQ6IHQuZjMyKCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IEJhblBheWxvYWQgPSB0Lm9iamVjdCgnQmFuUGF5bG9hZCcsIHtcclxuICAgIGNoYXJhY3Rlcl9uYW1lOiB0LnN0cmluZygpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBCaWRQYXlsb2FkID0gdC5vYmplY3QoJ0JpZFBheWxvYWQnLCB7XHJcbiAgICBhbW91bnQ6IHQuZjMyKCksXHJcbiAgICB0YXJnZXRfY2hhcmFjdGVyOiB0LnN0cmluZygpLFxyXG59KTtcclxuXHJcbmV4cG9ydCBjb25zdCBBdWN0aW9uU29sZFBheWxvYWQgPSB0Lm9iamVjdCgnQXVjdGlvblNvbGRQYXlsb2FkJywge1xyXG4gICAgY2hhcmFjdGVyX25hbWU6IHQuc3RyaW5nKCksXHJcbiAgICB3aW5uaW5nX2Ftb3VudDogdC5mMzIoKSxcclxuICAgIHdpbm5pbmdfdGVhbTogVGVhbUxhYmVsLCAgICAvLyBXaG8gYWN0dWFsbHkgZ290IGl0XHJcbiAgICBlaWRvbG9uOiB0LnU4KCksXHJcbn0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IE5vbWluYXRlUGF5bG9hZCA9IHQub2JqZWN0KCdOb21pbmF0ZVBheWxvYWQnLCB7XHJcbiAgICBjaGFyYWN0ZXJfbmFtZTogdC5zdHJpbmcoKSxcclxuICAgIGVpZG9sb246IHQudTgoKSxcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgVW5kb1BheWxvYWQgPSB0Lm9iamVjdCgnVW5kb1BheWxvYWQnLCB7XHJcbiAgICBvcmlnaW5hbF9zZXF1ZW5jZV9pZDogdC51MzIoKSwgLy8gVGhlIElEIG9mIHRoZSBzdGVwIHdlIGFyZSByZXZlcnRpbmdcclxufSk7XHJcblxyXG5leHBvcnQgY29uc3QgUGF1c2VQYXlsb2FkID0gdC5vYmplY3QoJ1BhdXNlUGF5bG9hZCcsIHtcclxuICAgIHRpbWVfcmVtYWluaW5nX21zOiB0LnUzMigpLCAgICAgICAgLy8gU25hcHNob3Qgb2YgdGhlIGNsb2NrIHdoZW4gcGF1c2VkXHJcbiAgICBpc19hdXRvX3BhdXNlOiB0LmJvb2woKSwgICAgICAgICAgIC8vIFRydWUgaWYgc3lzdGVtIHBhdXNlZCAoZGlzY29ubmVjdCksIEZhbHNlIGlmIG1hbnVhbFxyXG59KTtcclxuXHJcbi8vIFRoZSBcIlBvbHltb3JwaGljXCIgRW51bSBjb250YWluaW5nIHRoZSBzcGVjaWZpYyBwYXlsb2Fkc1xyXG5leHBvcnQgY29uc3QgU3RlcFBheWxvYWQgPSB0LmVudW0oJ1N0ZXBQYXlsb2FkJywge1xyXG4gICAgUGljazogUGlja1BheWxvYWQsXHJcbiAgICBCYW46IEJhblBheWxvYWQsXHJcbiAgICBCaWQ6IEJpZFBheWxvYWQsXHJcbiAgICBBdWN0aW9uU29sZDogQXVjdGlvblNvbGRQYXlsb2FkLFxyXG4gICAgTm9taW5hdGU6IE5vbWluYXRlUGF5bG9hZCxcclxuICAgIFVuZG86IFVuZG9QYXlsb2FkLFxyXG4gICAgUGF1c2U6IFBhdXNlUGF5bG9hZCxcclxufSk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBHYW1lTW9kZSB9IGZyb20gJy4uL3R5cGVzL2VudW1zJztcclxuaW1wb3J0IHsgRWlkb2xvbkNvc3QgfSBmcm9tICcuLi90eXBlcy9zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjb25zdCBoc3JDaGFyYWN0ZXJDb3N0Q29sdW1ucyA9IHtcclxuICAgIGNoYXJhY3Rlck5hbWU6IHQuc3RyaW5nKCksXHJcbiAgICBnYW1lTW9kZTogR2FtZU1vZGUsXHJcbiAgICBjbGFzc2ljQ29zdHM6IEVpZG9sb25Db3N0LFxyXG4gICAgYXVjdGlvbkJhc2VCaWQ6IEVpZG9sb25Db3N0LFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IEhzckNoYXJhY3RlckNvc3QgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnaHNyX2NoYXJhY3Rlcl9jb3N0JyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIHByaW1hcnlLZXk6IFsnY2hhcmFjdGVyTmFtZScsICdnYW1lTW9kZSddLFxyXG59LCBoc3JDaGFyYWN0ZXJDb3N0Q29sdW1ucyk7IiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBTdXBlcmltcG9zaXRpb25Db3N0IH0gZnJvbSAnLi4vdHlwZXMvc3RydWN0cyc7XHJcblxyXG5leHBvcnQgY29uc3QgaHNyTGlnaHRjb25lQ29zdENvbHVtbnMgPSB7XHJcbiAgICBsaWdodGNvbmVOYW1lOiB0LnN0cmluZygpLnByaW1hcnlLZXkoKSxcclxuICAgIGNsYXNzaWNDb3N0czogU3VwZXJpbXBvc2l0aW9uQ29zdCxcclxuICAgIGF1Y3Rpb25CYXNlQmlkOiBTdXBlcmltcG9zaXRpb25Db3N0LFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IEhzckxpZ2h0Y29uZUNvc3QgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnaHNyX2xpZ2h0Y29uZV9jb3N0JyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxufSwgaHNyTGlnaHRjb25lQ29zdENvbHVtbnMpOyIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgR2FtZU1vZGUgfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcblxyXG5leHBvcnQgY29uc3QgaHNyU3luZXJneUNvc3RDb2x1bW5zID0ge1xyXG4gICAgaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLmF1dG9JbmMoKSxcclxuICAgIHNvdXJjZU5hbWU6IHQuc3RyaW5nKCksXHJcbiAgICB0YXJnZXROYW1lOiB0LnN0cmluZygpLFxyXG4gICAgZ2FtZU1vZGU6IEdhbWVNb2RlLFxyXG4gICAgY29zdE1vZGlmaWVyOiB0LmYzMigpLFxyXG59O1xyXG5cclxuLy8gQ29sdW1ucyBleHBlY3RlZCBpbiB1cHNlcnQgcGF5bG9hZHMgKGV4Y2x1ZGVzIGF1dG8taW5jIGlkKVxyXG5leHBvcnQgY29uc3QgaHNyU3luZXJneUNvc3RVcHNlcnRLZXlzID0gT2JqZWN0LmtleXMoaHNyU3luZXJneUNvc3RDb2x1bW5zKS5maWx0ZXIoayA9PiBrICE9PSAnaWQnKTtcclxuXHJcbmV4cG9ydCBjb25zdCBIc3JTeW5lcmd5Q29zdCA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdoc3Jfc3luZXJneV9jb3N0JyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIGluZGV4ZXM6IFtcclxuICAgICAgICB7IG5hbWU6ICdzeW5lcmd5X3NvdXJjZV9tb2RlJywgYWNjZXNzb3I6ICdzeW5lcmd5X3NvdXJjZV9tb2RlJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ3NvdXJjZU5hbWUnLCAnZ2FtZU1vZGUnXSB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3N5bmVyZ3lfdGFyZ2V0JywgYWNjZXNzb3I6ICdzeW5lcmd5X3RhcmdldCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWyd0YXJnZXROYW1lJ10gfSxcclxuICAgIF1cclxufSwgaHNyU3luZXJneUNvc3RDb2x1bW5zKTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IExvYmJ5U3RhZ2UgfSBmcm9tICcuLi90eXBlcy9lbnVtcyc7XHJcbmltcG9ydCB7IExvYmJ5Q29uZmlnIH0gZnJvbSAnLi4vdHlwZXMvc3RydWN0cyc7XHJcblxyXG5leHBvcnQgY29uc3QgbG9iYnlDb2x1bW5zID0ge1xyXG4gICAgaWQ6IHQudTMyKCkucHJpbWFyeUtleSgpLmF1dG9JbmMoKSxcclxuICAgIGpvaW5Db2RlOiB0LnN0cmluZygpLnVuaXF1ZSgpLFxyXG4gICAgaG9zdFVzZXJJZDogdC51MzIoKSxcclxuICAgIHRlYW1CbHVlQWxpYXM6IHQuc3RyaW5nKCksXHJcbiAgICB0ZWFtUmVkQWxpYXM6IHQuc3RyaW5nKCksXHJcblxyXG4gICAgLy8gTGlmZWN5Y2xlICYgR2FyYmFnZSBDb2xsZWN0aW9uXHJcbiAgICBob3N0RGlzY29ubmVjdFRpbWU6IHQudGltZXN0YW1wKCkub3B0aW9uYWwoKSxcclxuICAgIGxhc3RBY3Rpdml0eUF0OiB0LnRpbWVzdGFtcCgpLFxyXG5cclxuICAgIHN0YWdlOiBMb2JieVN0YWdlLFxyXG4gICAgY29uZmlnOiBMb2JieUNvbmZpZyxcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBMb2JieSA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdsb2JieScsXHJcbiAgICBwdWJsaWM6IHRydWUsXHJcbiAgICBpbmRleGVzOiBbXHJcbiAgICAgICAgeyBuYW1lOiAnbG9iYnlfaG9zdCcsIGFjY2Vzc29yOiAnbG9iYnlfaG9zdCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydob3N0VXNlcklkJ10gfSxcclxuICAgIF1cclxufSwgbG9iYnlDb2x1bW5zKTtcclxuIiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBQYXJ0aWNpcGF0aW9uUm9sZSwgVGVhbUxhYmVsIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxvYmJ5TWVtYmVyQ29sdW1ucyA9IHtcclxuICAgIGxvYmJ5SWQ6IHQudTMyKCksXHJcbiAgICB1c2VySWQ6IHQudTMyKCksXHJcblxyXG4gICAgaXNPbmxpbmU6IHQuYm9vbCgpLFxyXG4gICAgcGFydGljaXBhdGlvblJvbGU6IFBhcnRpY2lwYXRpb25Sb2xlLCAvLyBQbGF5ZXIgdnMgU3BlY3RhdG9yXHJcbiAgICBpc1JlZmVyZWU6IHQuYm9vbCgpLCAgICAvLyBBZG1pbiBwb3dlcnMgd2l0aGluIHRoaXMgbG9iYnlcclxuICAgIHRlYW1TbG90OiBUZWFtTGFiZWwsICAgIC8vIEJsdWUsIFJlZCwgb3IgU3BlY3RhdG9yXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgTG9iYnlNZW1iZXIgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnbG9iYnlfbWVtYmVyJyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIHByaW1hcnlLZXk6IFsnbG9iYnlJZCcsICd1c2VySWQnXSxcclxuICAgIGluZGV4ZXM6IFtcclxuICAgICAgICB7IG5hbWU6ICdsb2JieV9tZW1iZXJfbG9iYnlfaWQnLCBhY2Nlc3NvcjogJ2xvYmJ5X21lbWJlcl9sb2JieV9pZCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydsb2JieUlkJ10gfSxcclxuICAgIF1cclxufSwgbG9iYnlNZW1iZXJDb2x1bW5zKTtcclxuIiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5cclxuZXhwb3J0IGNvbnN0IGxvYmJ5Q3Vyc29yRXZlbnRDb2x1bW5zID0ge1xyXG4gICAgbG9iYnlJZDogdC51MzIoKSxcclxuICAgIHNlbmRlclVzZXJJZDogdC51MzIoKSwgLy8gV2hvIG1vdmVkIHRoZSBtb3VzZSAocGVyc2lzdGVudCBVc2VyIElEKVxyXG4gICAgeDogdC5mMzIoKSxcclxuICAgIHk6IHQuZjMyKCksXHJcbiAgICB0aW1lc3RhbXA6IHQudGltZXN0YW1wKCksXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgTG9iYnlDdXJzb3JFdmVudCA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdsb2JieV9jdXJzb3JfZXZlbnQnLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgZXZlbnQ6IHRydWUsIC8vIEJyb2FkY2FzdHMgb25JbnNlcnQsIHRoZW4gZGVsZXRlcyBpbW1lZGlhdGVseS5cclxufSwgbG9iYnlDdXJzb3JFdmVudENvbHVtbnMpO1xyXG4iLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IERyYWZ0U3RlcCwgVGltZXJTdGF0ZSB9IGZyb20gJy4uL3R5cGVzL3N0cnVjdHMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IG1hdGNoU2Vzc2lvbkNvbHVtbnMgPSB7XHJcbiAgICBsb2JieUlkOiB0LnUzMigpLnByaW1hcnlLZXkoKSxcclxuXHJcbiAgICAvLyBUaGUgY3VycmVudCBpbmRleCBpbnRvIHRoZSAnZHJhZnRTZXF1ZW5jZScgYXJyYXkgKDAtYmFzZWQpXHJcbiAgICB0dXJuSW5kZXg6IHQudTMyKCksXHJcblxyXG4gICAgLy8gVGhlIGdlbmVyYXRlZCBzY3JpcHQgZm9yIHRoaXMgbWF0Y2ggKGUuZy4gW0JhbiBCbHVlLCBCYW4gUmVkLCBQaWNrIEJsdWUuLi5dKVxyXG4gICAgZHJhZnRTZXF1ZW5jZTogdC5hcnJheShEcmFmdFN0ZXApLFxyXG5cclxuICAgIC8vIFRyYWNrcyB0dXJuIHRpbWVycywgcmVzZXJ2ZXMsIGFuZCBwYXVzZSBzdGF0ZVxyXG4gICAgdGltZXJTdGF0ZTogVGltZXJTdGF0ZSxcclxuXHJcbiAgICAvLyBBdWN0aW9uIE1vZGUgQnVkZ2V0cyAoSWdub3JlZCBpbiBDbGFzc2ljKVxyXG4gICAgdGVhbUJsdWVCdWRnZXQ6IHQuZjMyKCksXHJcbiAgICB0ZWFtUmVkQnVkZ2V0OiB0LmYzMigpLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IE1hdGNoU2Vzc2lvbiA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdtYXRjaF9zZXNzaW9uJyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIC8vIDEtdG8tMSByZWxhdGlvbnNoaXAgd2l0aCBMb2JieTogVGhlIExvYmJ5IElEIGlzIHRoZSBQcmltYXJ5IEtleVxyXG59LCBtYXRjaFNlc3Npb25Db2x1bW5zKTsiLCJpbXBvcnQgeyB0YWJsZSwgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcbmltcG9ydCB7IEFjdGlvblR5cGUsIFRlYW1MYWJlbCB9IGZyb20gJy4uL3R5cGVzL2VudW1zJztcclxuaW1wb3J0IHsgU3RlcFBheWxvYWQgfSBmcm9tICcuLi90eXBlcy9zdHJ1Y3RzJztcclxuXHJcbmV4cG9ydCBjb25zdCBtYXRjaFNlc3Npb25TdGVwQ29sdW1ucyA9IHtcclxuICAgIGlkOiB0LnUzMigpLnByaW1hcnlLZXkoKS5hdXRvSW5jKCksXHJcblxyXG4gICAgbG9iYnlJZDogdC51MzIoKSwgICAgICAvLyBGSyB0byBMb2JieS9NYXRjaFNlc3Npb25cclxuICAgIHNlcXVlbmNlOiB0LnUzMigpLCAgICAgLy8gMSwgMiwgMy4uLiAoU3RyaWN0IG9yZGVyaW5nKVxyXG5cclxuICAgIGFjdG9yVXNlcklkOiB0LnUzMigpLCAvLyBXaG8gcGVyZm9ybWVkIHRoZSBhY3Rpb24gKHBlcnNpc3RlbnQgVXNlciBJRClcclxuICAgIGFjdG9yU2xvdDogVGVhbUxhYmVsLCAgLy8gQmx1ZS9SZWQvU3BlY3RhdG9yXHJcblxyXG4gICAgYWN0aW9uOiBBY3Rpb25UeXBlLCAgICAvLyBQaWNrLCBCYW4sIEJpZC4uLlxyXG5cclxuICAgIHBheWxvYWQ6IFN0ZXBQYXlsb2FkLFxyXG4gICAgdGltZXN0YW1wOiB0LnRpbWVzdGFtcCgpLFxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IE1hdGNoU2Vzc2lvblN0ZXAgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnbWF0Y2hfc2Vzc2lvbl9zdGVwJyxcclxuICAgIHB1YmxpYzogdHJ1ZSxcclxuICAgIGluZGV4ZXM6IFtcclxuICAgICAgICAvLyBGYXN0IGxvb2t1cDogXCJHZXQgZnVsbCBoaXN0b3J5IGZvciBMb2JieSAxMjNcIlxyXG4gICAgICAgIHsgbmFtZTogJ21hdGNoX2hpc3RvcnlfbG9iYnknLCBhY2Nlc3NvcjogJ21hdGNoX2hpc3RvcnlfbG9iYnknLCBhbGdvcml0aG06ICdidHJlZScsIGNvbHVtbnM6IFsnbG9iYnlJZCddIH0sXHJcbiAgICBdXHJcbn0sIG1hdGNoU2Vzc2lvblN0ZXBDb2x1bW5zKTtcclxuIiwiaW1wb3J0IHsgdGFibGUsIHQgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBEcmFmdE1vZGUsIEdhbWVNb2RlLCBNYXRjaFJlc3VsdCB9IGZyb20gJy4uL3R5cGVzL2VudW1zJztcclxuaW1wb3J0IHsgUGxheWVyU25hcHNob3QsIExvYmJ5Q29uZmlnIH0gZnJvbSAnLi4vdHlwZXMvc3RydWN0cyc7XHJcblxyXG5leHBvcnQgY29uc3QgbWF0Y2hTZXNzaW9uSGlzdG9yeUNvbHVtbnMgPSB7XHJcbiAgICBpZDogdC5zdHJpbmcoKS5wcmltYXJ5S2V5KCksIC8vIFVVSUQgZ2VuZXJhdGVkIGF0IGdhbWUgZW5kXHJcbiAgICBsb2JieUNvZGU6IHQuc3RyaW5nKCksICAgICAgIC8vIEtlcHQgZm9yIHJlZmVyZW5jZSAoZS5nLiBcIlg3SzlQMlwiKVxyXG4gICAgcGxheWVkQXQ6IHQudGltZXN0YW1wKCksXHJcblxyXG4gICAgZHJhZnRNb2RlOiBEcmFmdE1vZGUsXHJcbiAgICBnYW1lTW9kZTogR2FtZU1vZGUsXHJcblxyXG4gICAgdGVhbUJsdWVBbGlhczogdC5zdHJpbmcoKSxcclxuICAgIHRlYW1SZWRBbGlhczogdC5zdHJpbmcoKSxcclxuXHJcbiAgICAvLyBGdWxsIHNuYXBzaG90cyBvZiBwbGF5ZXJzIGF0IHRoZSB0aW1lIG9mIHRoZSBtYXRjaFxyXG4gICAgYmx1ZVRlYW1NZW1iZXJzOiB0LmFycmF5KFBsYXllclNuYXBzaG90KSxcclxuICAgIHJlZFRlYW1NZW1iZXJzOiB0LmFycmF5KFBsYXllclNuYXBzaG90KSxcclxuXHJcbiAgICBzbmFwc2hvdENvbmZpZzogTG9iYnlDb25maWcsIC8vIFRoZSBleGFjdCBydWxlcyB1c2VkIChTbmFwc2hvdClcclxuXHJcbiAgICByZXN1bHQ6IE1hdGNoUmVzdWx0LFxyXG5cclxuICAgIC8vIFNlcmlhbGl6ZWQgSlNPTiBibG9icyBjb250YWluaW5nIHRoZSBmaW5hbCB0ZWFtIGNvbXBzXHJcbiAgICAvLyAoQ2hhcmFjdGVyIE5hbWUsIEVpZG9sb24sIENvc3QgUGFpZCwgZXRjLilcclxuICAgIHJvc3RlckJsdWU6IHQuc3RyaW5nKCksXHJcbiAgICByb3N0ZXJSZWQ6IHQuc3RyaW5nKCksXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgTWF0Y2hTZXNzaW9uSGlzdG9yeSA9IHRhYmxlKHtcclxuICAgIG5hbWU6ICdtYXRjaF9zZXNzaW9uX2hpc3RvcnknLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgaW5kZXhlczogW1xyXG4gICAgICAgIHsgbmFtZTogJ2hpc3RvcnlfcGxheWVkX2F0JywgYWNjZXNzb3I6ICdoaXN0b3J5X3BsYXllZF9hdCcsIGFsZ29yaXRobTogJ2J0cmVlJywgY29sdW1uczogWydwbGF5ZWRBdCddIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnaGlzdG9yeV9nYW1lX21vZGUnLCBhY2Nlc3NvcjogJ2hpc3RvcnlfZ2FtZV9tb2RlJywgYWxnb3JpdGhtOiAnYnRyZWUnLCBjb2x1bW5zOiBbJ2dhbWVNb2RlJ10gfSxcclxuICAgIF1cclxufSwgbWF0Y2hTZXNzaW9uSGlzdG9yeUNvbHVtbnMpOyIsImltcG9ydCB7IHRhYmxlLCB0IH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuXHJcbmV4cG9ydCBjb25zdCBtYXRjaFNlc3Npb25TdGVwSGlzdG9yeUNvbHVtbnMgPSB7XHJcbiAgICBtYXRjaElkOiB0LnN0cmluZygpLnByaW1hcnlLZXkoKSwgLy8gRksgdG8gTWF0Y2hTZXNzaW9uSGlzdG9yeS5pZFxyXG5cclxuICAgIC8vIEEgc2luZ2xlIG1hc3NpdmUgSlNPTiBzdHJpbmcgY29udGFpbmluZyB0aGUgZnVsbCBhcnJheSBvZiBzdGVwcy5cclxuICAgIC8vIENsaWVudHMgZmV0Y2ggdGhpcyBvbmx5IHdoZW4gXCJXYXRjaCBSZXBsYXlcIiBpcyBjbGlja2VkLlxyXG4gICAgc3RlcHM6IHQuc3RyaW5nKCksXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgTWF0Y2hTZXNzaW9uU3RlcEhpc3RvcnkgPSB0YWJsZSh7XHJcbiAgICBuYW1lOiAnbWF0Y2hfc2Vzc2lvbl9zdGVwX2hpc3RvcnknLFxyXG4gICAgcHVibGljOiB0cnVlLFxyXG4gICAgLy8gVGhlIFBLIGlzIHRoZSBNYXRjaCBJRCBpdHNlbGYgKDEtdG8tMSByZWxhdGlvbiB3aXRoIEhpc3RvcnkgdGFibGUpXHJcbn0sIG1hdGNoU2Vzc2lvblN0ZXBIaXN0b3J5Q29sdW1ucyk7IiwiaW1wb3J0IHsgc2NoZW1hIH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vdGFibGVzL3VzZXInO1xyXG5pbXBvcnQgeyBVc2VySWRlbnRpdHkgfSBmcm9tICcuL3RhYmxlcy91c2VySWRlbnRpdHknO1xyXG5pbXBvcnQgeyBTZXJ2ZXJJZGVudGl0eSB9IGZyb20gJy4vdGFibGVzL3NlcnZlcklkZW50aXR5JztcclxuaW1wb3J0IHsgSHNyQ2hhcmFjdGVyIH0gZnJvbSAnLi90YWJsZXMvaHNyQ2hhcmFjdGVyJztcclxuaW1wb3J0IHsgSHNyTGlnaHRjb25lIH0gZnJvbSAnLi90YWJsZXMvaHNyTGlnaHRjb25lJztcclxuaW1wb3J0IHsgSHNyQ2hhcmFjdGVyQ29zdCB9IGZyb20gJy4vdGFibGVzL2hzckNoYXJhY3RlckNvc3QnO1xyXG5pbXBvcnQgeyBIc3JMaWdodGNvbmVDb3N0IH0gZnJvbSAnLi90YWJsZXMvaHNyTGlnaHRjb25lQ29zdCc7XHJcbmltcG9ydCB7IEhzclN5bmVyZ3lDb3N0IH0gZnJvbSAnLi90YWJsZXMvaHNyU3luZXJneUNvc3QnO1xyXG5pbXBvcnQgeyBMb2JieSB9IGZyb20gJy4vdGFibGVzL2xvYmJ5JztcclxuaW1wb3J0IHsgTG9iYnlNZW1iZXIgfSBmcm9tICcuL3RhYmxlcy9sb2JieU1lbWJlcic7XHJcbmltcG9ydCB7IExvYmJ5Q3Vyc29yRXZlbnQgfSBmcm9tICcuL3RhYmxlcy9sb2JieUN1cnNvckV2ZW50JztcclxuaW1wb3J0IHsgTWF0Y2hTZXNzaW9uIH0gZnJvbSAnLi90YWJsZXMvbWF0Y2hTZXNzaW9uJztcclxuaW1wb3J0IHsgTWF0Y2hTZXNzaW9uU3RlcCB9IGZyb20gJy4vdGFibGVzL21hdGNoU2Vzc2lvblN0ZXAnO1xyXG5pbXBvcnQgeyBNYXRjaFNlc3Npb25IaXN0b3J5IH0gZnJvbSAnLi90YWJsZXMvbWF0Y2hTZXNzaW9uSGlzdG9yeSc7XHJcbmltcG9ydCB7IE1hdGNoU2Vzc2lvblN0ZXBIaXN0b3J5IH0gZnJvbSAnLi90YWJsZXMvbWF0Y2hTZXNzaW9uU3RlcEhpc3RvcnknO1xyXG5cclxuY29uc3Qgc3BhY2V0aW1lZGIgPSBzY2hlbWEoe1xyXG4gICAgLy8gVXNlciAvIEF1dGhcclxuICAgIFVzZXIsXHJcbiAgICBVc2VySWRlbnRpdHksXHJcbiAgICBTZXJ2ZXJJZGVudGl0eSxcclxuXHJcbiAgICAvLyBTdGF0aWMgQXNzZXRzXHJcbiAgICBIc3JDaGFyYWN0ZXIsXHJcbiAgICBIc3JMaWdodGNvbmUsXHJcblxyXG4gICAgLy8gRWNvbm9teVxyXG4gICAgSHNyQ2hhcmFjdGVyQ29zdCxcclxuICAgIEhzckxpZ2h0Y29uZUNvc3QsXHJcbiAgICBIc3JTeW5lcmd5Q29zdCxcclxuXHJcbiAgICAvLyBMb2JieSBTeXN0ZW1cclxuICAgIExvYmJ5LFxyXG4gICAgTG9iYnlNZW1iZXIsXHJcbiAgICBMb2JieUN1cnNvckV2ZW50LFxyXG5cclxuICAgIC8vIEFjdGl2ZSBHYW1lXHJcbiAgICBNYXRjaFNlc3Npb24sXHJcbiAgICBNYXRjaFNlc3Npb25TdGVwLFxyXG5cclxuICAgIC8vIEhpc3RvcnlcclxuICAgIE1hdGNoU2Vzc2lvbkhpc3RvcnksXHJcbiAgICBNYXRjaFNlc3Npb25TdGVwSGlzdG9yeSxcclxufSk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzcGFjZXRpbWVkYjsiLCJpbXBvcnQgc3BhY2V0aW1lZGIgZnJvbSAnLi4vc2NoZW1hJztcclxuaW1wb3J0IHsgdCB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcblxyXG5leHBvcnQgY29uc3QgYnJvYWRjYXN0X2N1cnNvciA9IHNwYWNldGltZWRiLnJlZHVjZXIoe1xyXG4gICAgbG9iYnlJZDogdC51MzIoKSxcclxuICAgIHg6IHQuZjMyKCksXHJcbiAgICB5OiB0LmYzMigpLFxyXG59LCAoY3R4LCB7IGxvYmJ5SWQsIHgsIHkgfSkgPT4ge1xyXG4gICAgLy8gUmVzb2x2ZSBpZGVudGl0eSDihpIgdXNlcklkXHJcbiAgICBjb25zdCBtYXBwaW5nID0gY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS5maW5kKGN0eC5zZW5kZXIpO1xyXG4gICAgaWYgKCFtYXBwaW5nKSByZXR1cm47IC8vIE5vdCByZWdpc3RlcmVkLCBpZ25vcmVcclxuXHJcbiAgICAvLyBWYWxpZGF0ZSBtZW1iZXJzaGlwIHZpYSBjb21wb3NpdGUgUEtcclxuICAgIGNvbnN0IG1lbWJlclRhYmxlID0gY3R4LmRiLkxvYmJ5TWVtYmVyIGFzIGFueTtcclxuICAgIGNvbnN0IG1lbWJlcnNoaXAgPSBtZW1iZXJUYWJsZS5wcmltYXJ5S2V5LmZpbmQoe1xyXG4gICAgICAgIGxvYmJ5SWQsXHJcbiAgICAgICAgdXNlcklkOiBtYXBwaW5nLnVzZXJJZCxcclxuICAgIH0pO1xyXG5cclxuICAgIGlmICghbWVtYmVyc2hpcCkge1xyXG4gICAgICAgIC8vIFVzZXIgaXMgbm90IGluIHRoaXMgbG9iYnksIGlnbm9yZSB0aGUgcmVxdWVzdFxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBCcm9hZGNhc3RcclxuICAgIGN0eC5kYi5Mb2JieUN1cnNvckV2ZW50Lmluc2VydCh7XHJcbiAgICAgICAgbG9iYnlJZCxcclxuICAgICAgICBzZW5kZXJVc2VySWQ6IG1hcHBpbmcudXNlcklkLFxyXG4gICAgICAgIHgsXHJcbiAgICAgICAgeSxcclxuICAgICAgICB0aW1lc3RhbXA6IGN0eC50aW1lc3RhbXAsXHJcbiAgICB9KTtcclxufSk7XHJcbiIsImltcG9ydCBzcGFjZXRpbWVkYiBmcm9tICcuLi9zY2hlbWEnO1xyXG5cclxuLyoqXHJcbiAqIExvZ2luIGFzIGEgZ3Vlc3QgdXNlci5cclxuICogLSBJZiBpZGVudGl0eSBhbHJlYWR5IGxpbmtlZCDihpIgdXBkYXRlIGxhc3RMb2dpbkF0IChuby1vcCkuXHJcbiAqIC0gT3RoZXJ3aXNlIOKGkiBjcmVhdGUgYSBuZXcgVXNlciArIFVzZXJJZGVudGl0eSBtYXBwaW5nLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGxvZ2luX2FzX2d1ZXN0ID0gc3BhY2V0aW1lZGIucmVkdWNlcigoY3R4KSA9PiB7XHJcbiAgICBjb25zdCBtYXBwaW5nID0gY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS5maW5kKGN0eC5zZW5kZXIpO1xyXG4gICAgaWYgKG1hcHBpbmcpIHtcclxuICAgICAgICBjb25zdCB1c2VyID0gY3R4LmRiLlVzZXIuaWQuZmluZChtYXBwaW5nLnVzZXJJZCk7XHJcbiAgICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICAgICAgLy8gQWxyZWFkeSByZWdpc3RlcmVkIOKAlCB1cGRhdGUgbGFzdExvZ2luQXQgYW5kIGxhc3RTZWVuQXRcclxuICAgICAgICAgICAgY3R4LmRiLlVzZXIuaWQudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnVzZXIsXHJcbiAgICAgICAgICAgICAgICBsYXN0TG9naW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGN0eC5kYi5Vc2VySWRlbnRpdHkuaWRlbnRpdHkudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLm1hcHBpbmcsXHJcbiAgICAgICAgICAgICAgICBsYXN0U2VlbkF0OiBjdHgudGltZXN0YW1wLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBHZW5lcmF0ZSBhIGd1ZXN0IHVzZXJuYW1lIGZyb20gdGhlIGlkZW50aXR5IGhleCAoZmlyc3QgOCBjaGFycylcclxuICAgIGNvbnN0IHNob3J0SWQgPSBjdHguc2VuZGVyLnRvSGV4U3RyaW5nKCkuc2xpY2UoMCwgOCk7XHJcbiAgICBjb25zdCBndWVzdFVzZXJuYW1lID0gYEd1ZXN0XyR7c2hvcnRJZH1gO1xyXG5cclxuICAgIC8vIENyZWF0ZSB0aGUgVXNlciByb3cgKGlkIGlzIGF1dG9JbmMsIHBhc3MgMClcclxuICAgIGNvbnN0IG5ld1VzZXIgPSBjdHguZGIuVXNlci5pbnNlcnQoe1xyXG4gICAgICAgIGlkOiAwLFxyXG4gICAgICAgIHVzZXJuYW1lOiBndWVzdFVzZXJuYW1lLFxyXG4gICAgICAgIGRpc3BsYXlOYW1lOiBndWVzdFVzZXJuYW1lLFxyXG4gICAgICAgIGlzR3Vlc3Q6IHRydWUsXHJcbiAgICAgICAgbGFzdExvZ2luQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICAgICAgcm9sZTogeyB0YWc6ICdVc2VyJyB9LFxyXG4gICAgICAgIGRpc2NvcmRJZDogdW5kZWZpbmVkLFxyXG4gICAgICAgIGF2YXRhckNoYXJhY3Rlck5hbWU6ICdtYXJjaDd0aCcsXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBMaW5rIHRoaXMgaWRlbnRpdHkgdG8gdGhlIG5ldyB1c2VyXHJcbiAgICBjdHguZGIuVXNlcklkZW50aXR5Lmluc2VydCh7XHJcbiAgICAgICAgaWRlbnRpdHk6IGN0eC5zZW5kZXIsXHJcbiAgICAgICAgdXNlcklkOiBuZXdVc2VyLmlkLFxyXG4gICAgICAgIGxhc3RTZWVuQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICB9KTtcclxufSk7XHJcbiIsImltcG9ydCBzcGFjZXRpbWVkYiBmcm9tICcuLi9zY2hlbWEnO1xuaW1wb3J0IHsgdCwgU2VuZGVyRXJyb3IgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xuXG4vKipcbiAqIEhlbHBlcjogcmVzb2x2ZSBjdHguc2VuZGVyIOKGkiBVc2VySWRlbnRpdHkg4oaSIFVzZXIuXG4gKiBSZXR1cm5zIHsgbWFwcGluZywgdXNlciB9IG9yIG51bGwgaWYgaWRlbnRpdHkgaXMgbm90IGxpbmtlZC5cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZVVzZXIoY3R4OiBhbnkpIHtcbiAgICBjb25zdCBtYXBwaW5nID0gY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS5maW5kKGN0eC5zZW5kZXIpO1xuICAgIGlmICghbWFwcGluZykgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgdXNlciA9IGN0eC5kYi5Vc2VyLmlkLmZpbmQobWFwcGluZy51c2VySWQpO1xuICAgIGlmICghdXNlcikgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHsgbWFwcGluZywgdXNlciB9O1xufVxuXG4vKipcbiAqIERlbGV0ZSBhIGd1ZXN0IGFjY291bnQgcGVybWFuZW50bHkuXG4gKiBPbmx5IHdvcmtzIGZvciBndWVzdCB1c2VycyAobm8gRGlzY29yZCBsaW5rZWQpLlxuICogUmVtb3ZlcyB0aGUgVXNlcklkZW50aXR5IG1hcHBpbmcgYW5kIHRoZSBVc2VyIHJvdy5cbiAqL1xuZXhwb3J0IGNvbnN0IGRlbGV0ZV9ndWVzdF9hY2NvdW50ID0gc3BhY2V0aW1lZGIucmVkdWNlcigoY3R4KSA9PiB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSByZXNvbHZlVXNlcihjdHgpO1xuICAgIGlmICghcmVzb2x2ZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdObyBhY2NvdW50IGZvdW5kIGZvciB0aGlzIGlkZW50aXR5LicpO1xuICAgIH1cbiAgICBpZiAoIXJlc29sdmVkLnVzZXIuaXNHdWVzdCkge1xuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ09ubHkgZ3Vlc3QgYWNjb3VudHMgY2FuIGJlIGRlbGV0ZWQgdGhpcyB3YXkuIFZlcmlmaWVkIGFjY291bnRzIHBlcnNpc3QgYWNyb3NzIGRldmljZXMuJyk7XG4gICAgfVxuXG4gICAgLy8gRGVsZXRlIHRoZSBVc2VySWRlbnRpdHkgbWFwcGluZyBmb3IgdGhpcyBpZGVudGl0eVxuICAgIGN0eC5kYi5Vc2VySWRlbnRpdHkuaWRlbnRpdHkuZGVsZXRlKGN0eC5zZW5kZXIpO1xuXG4gICAgLy8gQ2hlY2sgaWYgYW55IG90aGVyIGlkZW50aXRpZXMgc3RpbGwgcG9pbnQgdG8gdGhpcyB1c2VyXG4gICAgY29uc3QgcmVtYWluaW5nTGlua3MgPSBbLi4uY3R4LmRiLlVzZXJJZGVudGl0eS51c2VyX2lkZW50aXR5X3VzZXJfaWQuZmlsdGVyKHJlc29sdmVkLnVzZXIuaWQpXTtcbiAgICBpZiAocmVtYWluaW5nTGlua3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIE5vIG1vcmUgaWRlbnRpdGllcyBsaW5rZWQg4oCUIHNhZmUgdG8gZGVsZXRlIHRoZSBVc2VyIHJvd1xuICAgICAgICBjdHguZGIuVXNlci5pZC5kZWxldGUocmVzb2x2ZWQudXNlci5pZCk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogVXBkYXRlIHRoZSBjYWxsZXIncyBkaXNwbGF5IG5hbWUuXG4gKiBPbmx5IG5vbi1lbXB0eSBzdHJpbmdzIGFyZSBhY2NlcHRlZC4gTWF4IDMyIGNoYXJhY3RlcnMuXG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVfZGlzcGxheV9uYW1lID0gc3BhY2V0aW1lZGIucmVkdWNlcih7XG4gICAgbmV3RGlzcGxheU5hbWU6IHQuc3RyaW5nKCksXG59LCAoY3R4LCB7IG5ld0Rpc3BsYXlOYW1lIH0pID0+IHtcbiAgICBjb25zdCB0cmltbWVkID0gbmV3RGlzcGxheU5hbWUudHJpbSgpO1xuICAgIGlmICh0cmltbWVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ0Rpc3BsYXkgbmFtZSBjYW5ub3QgYmUgZW1wdHknKTtcbiAgICB9XG4gICAgaWYgKHRyaW1tZWQubGVuZ3RoID4gMzIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdEaXNwbGF5IG5hbWUgbXVzdCBiZSAzMiBjaGFyYWN0ZXJzIG9yIGZld2VyJyk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzb2x2ZWQgPSByZXNvbHZlVXNlcihjdHgpO1xuICAgIGlmICghcmVzb2x2ZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdVc2VyIG5vdCBmb3VuZCDigJQgbG9naW4gZmlyc3QnKTtcbiAgICB9XG5cbiAgICBjdHguZGIuVXNlci5pZC51cGRhdGUoe1xuICAgICAgICAuLi5yZXNvbHZlZC51c2VyLFxuICAgICAgICBkaXNwbGF5TmFtZTogdHJpbW1lZCxcbiAgICB9KTtcbn0pO1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgY2FsbGVyJ3MgdXNlcm5hbWUuXG4gKiBPbmx5IHZlcmlmaWVkIChub24tZ3Vlc3QpIHVzZXJzIHdpdGggYSBsaW5rZWQgRGlzY29yZCBjYW4gY2hhbmdlIHRoZWlyIHVzZXJuYW1lLlxuICogVW5pcXVlbmVzcyBpcyBlbmZvcmNlZCBieSB0aGUgZGF0YWJhc2UgY29uc3RyYWludC5cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZV91c2VybmFtZSA9IHNwYWNldGltZWRiLnJlZHVjZXIoe1xuICAgIG5ld1VzZXJuYW1lOiB0LnN0cmluZygpLFxufSwgKGN0eCwgeyBuZXdVc2VybmFtZSB9KSA9PiB7XG4gICAgY29uc3QgdHJpbW1lZCA9IG5ld1VzZXJuYW1lLnRyaW0oKTtcbiAgICBpZiAodHJpbW1lZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdVc2VybmFtZSBjYW5ub3QgYmUgZW1wdHknKTtcbiAgICB9XG4gICAgaWYgKHRyaW1tZWQubGVuZ3RoID4gMzIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdVc2VybmFtZSBtdXN0IGJlIDMyIGNoYXJhY3RlcnMgb3IgZmV3ZXInKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVVc2VyKGN0eCk7XG4gICAgaWYgKCFyZXNvbHZlZCkge1xuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1VzZXIgbm90IGZvdW5kIOKAlCBsb2dpbiBmaXJzdCcpO1xuICAgIH1cbiAgICBpZiAocmVzb2x2ZWQudXNlci5pc0d1ZXN0KSB7XG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignR3Vlc3QgdXNlcnMgY2Fubm90IGNoYW5nZSB0aGVpciB1c2VybmFtZS4gTGluayB5b3VyIERpc2NvcmQgYWNjb3VudCBmaXJzdC4nKTtcbiAgICB9XG5cbiAgICBjdHguZGIuVXNlci5pZC51cGRhdGUoe1xuICAgICAgICAuLi5yZXNvbHZlZC51c2VyLFxuICAgICAgICB1c2VybmFtZTogdHJpbW1lZCxcbiAgICB9KTtcbn0pO1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgY2FsbGVyJ3MgYXZhdGFyIGNoYXJhY3Rlci5cbiAqIFRoZSBjaGFyYWN0ZXJOYW1lIHNob3VsZCByZWZlcmVuY2UgYW4gZXhpc3RpbmcgSHNyQ2hhcmFjdGVyIG5hbWUuXG4gKi9cbmV4cG9ydCBjb25zdCB1cGRhdGVfYXZhdGFyID0gc3BhY2V0aW1lZGIucmVkdWNlcih7XG4gICAgY2hhcmFjdGVyTmFtZTogdC5zdHJpbmcoKSxcbn0sIChjdHgsIHsgY2hhcmFjdGVyTmFtZSB9KSA9PiB7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSByZXNvbHZlVXNlcihjdHgpO1xuICAgIGlmICghcmVzb2x2ZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdVc2VyIG5vdCBmb3VuZCDigJQgbG9naW4gZmlyc3QnKTtcbiAgICB9XG5cbiAgICBjdHguZGIuVXNlci5pZC51cGRhdGUoe1xuICAgICAgICAuLi5yZXNvbHZlZC51c2VyLFxuICAgICAgICBhdmF0YXJDaGFyYWN0ZXJOYW1lOiBjaGFyYWN0ZXJOYW1lLFxuICAgIH0pO1xufSk7XG4iLCJpbXBvcnQgc3BhY2V0aW1lZGIgZnJvbSAnLi4vc2NoZW1hJztcclxuaW1wb3J0IHsgdCwgU2VuZGVyRXJyb3IgfSBmcm9tICdzcGFjZXRpbWVkYi9zZXJ2ZXInO1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlcjogdmVyaWZ5IHRoZSBjYWxsZXIgaXMgdGhlIHJlZ2lzdGVyZWQgc2VydmVyIGlkZW50aXR5LlxyXG4gKi9cclxuZnVuY3Rpb24gcmVxdWlyZVNlcnZlcihjdHg6IGFueSkge1xyXG4gICAgY29uc3Qgc2VydmVyID0gY3R4LmRiLlNlcnZlcklkZW50aXR5LmlkZW50aXR5LmZpbmQoY3R4LnNlbmRlcik7XHJcbiAgICBpZiAoIXNlcnZlcikge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignRm9yYmlkZGVuOiBjYWxsZXIgaXMgbm90IHRoZSByZWdpc3RlcmVkIHNlcnZlciBpZGVudGl0eS4nKTtcclxuICAgIH1cclxuICAgIHJldHVybiBzZXJ2ZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBCb290c3RyYXAgcmVkdWNlcjogcmVnaXN0ZXIgdGhlIGNhbGxpbmcgaWRlbnRpdHkgYXMgdGhlIHRydXN0ZWQgc2VydmVyLlxyXG4gKiBPbmx5IHdvcmtzIHdoZW4gbm8gc2VydmVyIGlkZW50aXR5IGV4aXN0cyB5ZXQgKGZpcnN0LWNvbWUtZmlyc3Qtc2VydmVkKS5cclxuICogVG8gcmUtcmVnaXN0ZXIsIGNsZWFyLXB1Ymxpc2ggdGhlIGRhdGFiYXNlIGZpcnN0LlxyXG4gKlxyXG4gKiBSdW4gdmlhOiBucHggdHN4IHNjcmlwdHMvcmVnaXN0ZXItc2VydmVyLnRzXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgcmVnaXN0ZXJfc2VydmVyID0gc3BhY2V0aW1lZGIucmVkdWNlcigoY3R4KSA9PiB7XHJcbiAgICBjb25zdCBleGlzdGluZyA9IFsuLi5jdHguZGIuU2VydmVySWRlbnRpdHkuaXRlcigpXTtcclxuICAgIGlmIChleGlzdGluZy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdTZXJ2ZXIgaWRlbnRpdHkgYWxyZWFkeSByZWdpc3RlcmVkLiBUbyByZS1yZWdpc3RlciwgY2xlYXIgdGhlIGRhdGFiYXNlIGZpcnN0LicpO1xyXG4gICAgfVxyXG5cclxuICAgIGN0eC5kYi5TZXJ2ZXJJZGVudGl0eS5pbnNlcnQoe1xyXG4gICAgICAgIGlkZW50aXR5OiBjdHguc2VuZGVyLFxyXG4gICAgICAgIHJlZ2lzdGVyZWRBdDogY3R4LnRpbWVzdGFtcCxcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBTZXJ2ZXItb25seSByZWR1Y2VyOiBsaW5rIGEgRGlzY29yZCBhY2NvdW50IHRvIGEgdXNlciBpZGVudGl0eS5cclxuICogQ2FsbGVkIGJ5IHRoZSBOZXh0LmpzIEFQSSByb3V0ZSBhZnRlciB2ZXJpZnlpbmcgdGhlIERpc2NvcmQgT0F1dGggc2Vzc2lvbi5cclxuICpcclxuICogVGhlIGNhbGxlcklkZW50aXR5SGV4IGlzIHRoZSBTcGFjZXRpbWVEQiBpZGVudGl0eSBoZXggb2YgdGhlIGVuZC11c2VyJ3NcclxuICogYnJvd3NlciBjbGllbnQuIFRoZSBzZXJ2ZXIgcGFzc2VzIGl0IGFsb25nIHNvIHdlIGtub3cgd2hpY2ggVXNlcklkZW50aXR5XHJcbiAqIHRvIHVwZGF0ZS5cclxuICovXHJcbmV4cG9ydCBjb25zdCBzZXJ2ZXJfbGlua19kaXNjb3JkID0gc3BhY2V0aW1lZGIucmVkdWNlcih7XHJcbiAgICBjYWxsZXJJZGVudGl0eUhleDogdC5zdHJpbmcoKSxcclxuICAgIGRpc2NvcmRJZDogdC5zdHJpbmcoKSxcclxuICAgIGRpc2NvcmRVc2VybmFtZTogdC5zdHJpbmcoKSxcclxufSwgKGN0eCwgeyBjYWxsZXJJZGVudGl0eUhleCwgZGlzY29yZElkLCBkaXNjb3JkVXNlcm5hbWUgfSkgPT4ge1xyXG4gICAgLy8gMS4gVmVyaWZ5IGNhbGxlciBpcyB0aGUgdHJ1c3RlZCBzZXJ2ZXJcclxuICAgIHJlcXVpcmVTZXJ2ZXIoY3R4KTtcclxuXHJcbiAgICAvLyAyLiBWYWxpZGF0ZSBpbnB1dHNcclxuICAgIGlmICghZGlzY29yZElkIHx8IGRpc2NvcmRJZC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ2Rpc2NvcmRJZCBpcyByZXF1aXJlZCcpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFkaXNjb3JkVXNlcm5hbWUgfHwgZGlzY29yZFVzZXJuYW1lLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignZGlzY29yZFVzZXJuYW1lIGlzIHJlcXVpcmVkJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWNhbGxlcklkZW50aXR5SGV4IHx8IGNhbGxlcklkZW50aXR5SGV4Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcignY2FsbGVySWRlbnRpdHlIZXggaXMgcmVxdWlyZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyAzLiBSZXNvbHZlIHRoZSBlbmQtdXNlcidzIGlkZW50aXR5IOKGkiBVc2VySWRlbnRpdHkg4oaSIFVzZXJcclxuICAgIC8vICAgIFdlIG5lZWQgdG8gZmluZCB0aGUgVXNlcklkZW50aXR5IHJvdyBieSBpdGVyYXRpbmcgKGlkZW50aXR5IGlzIGFuIG9iamVjdCxcclxuICAgIC8vICAgIGFuZCB3ZSBvbmx5IGhhdmUgdGhlIGhleCBzdHJpbmcgZnJvbSB0aGUgQVBJIHJvdXRlKS5cclxuICAgIGxldCB1c2VyTWFwcGluZzogYW55ID0gbnVsbDtcclxuICAgIGZvciAoY29uc3Qgcm93IG9mIGN0eC5kYi5Vc2VySWRlbnRpdHkuaXRlcigpKSB7XHJcbiAgICAgICAgaWYgKHJvdy5pZGVudGl0eS50b0hleFN0cmluZygpID09PSBjYWxsZXJJZGVudGl0eUhleCkge1xyXG4gICAgICAgICAgICB1c2VyTWFwcGluZyA9IHJvdztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBjdXJyZW50VXNlcjogYW55ID0gbnVsbDtcclxuICAgIGlmICh1c2VyTWFwcGluZykge1xyXG4gICAgICAgIGN1cnJlbnRVc2VyID0gY3R4LmRiLlVzZXIuaWQuZmluZCh1c2VyTWFwcGluZy51c2VySWQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDQuIENoZWNrIGlmIGEgVXNlciB3aXRoIHRoaXMgZGlzY29yZElkIGFscmVhZHkgZXhpc3RzXHJcbiAgICBjb25zdCBleGlzdGluZ0J5RGlzY29yZCA9IFsuLi5jdHguZGIuVXNlci51c2VyX2Rpc2NvcmRfaWQuZmlsdGVyKGRpc2NvcmRJZCldO1xyXG4gICAgY29uc3QgZGlzY29yZE93bmVyID0gZXhpc3RpbmdCeURpc2NvcmQubGVuZ3RoID4gMCA/IGV4aXN0aW5nQnlEaXNjb3JkWzBdIDogbnVsbDtcclxuXHJcbiAgICBpZiAoY3VycmVudFVzZXIpIHtcclxuICAgICAgICBpZiAoZGlzY29yZE93bmVyICYmIGRpc2NvcmRPd25lci5pZCAhPT0gY3VycmVudFVzZXIuaWQpIHtcclxuICAgICAgICAgICAgLy8gQ2FzZSAxYjogVXNlcidzIGlkZW50aXR5IGN1cnJlbnRseSBwb2ludHMgdG8gYSBkaWZmZXJlbnQgdXNlciAoZ3Vlc3QpLFxyXG4gICAgICAgICAgICAvLyBidXQgdGhlIERpc2NvcmQgYWNjb3VudCBiZWxvbmdzIHRvIGFuIGV4aXN0aW5nIHZlcmlmaWVkIHVzZXIuXHJcbiAgICAgICAgICAgIC8vIFJlLXBvaW50IGlkZW50aXR5IHRvIHRoZSBEaXNjb3JkIG93bmVyLCBjbGVhbiB1cCBvcnBoYW5lZCBndWVzdC5cclxuICAgICAgICAgICAgY29uc3Qgb2xkR3Vlc3RJZCA9IGN1cnJlbnRVc2VyLmlkO1xyXG4gICAgICAgICAgICBjb25zdCB3YXNHdWVzdCA9IGN1cnJlbnRVc2VyLmlzR3Vlc3Q7XHJcblxyXG4gICAgICAgICAgICBjdHguZGIuVXNlcklkZW50aXR5LmlkZW50aXR5LnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi51c2VyTWFwcGluZyxcclxuICAgICAgICAgICAgICAgIHVzZXJJZDogZGlzY29yZE93bmVyLmlkLFxyXG4gICAgICAgICAgICAgICAgbGFzdFNlZW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBjdHguZGIuVXNlci5pZC51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4uZGlzY29yZE93bmVyLFxyXG4gICAgICAgICAgICAgICAgbGFzdExvZ2luQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKHdhc0d1ZXN0KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZW1haW5pbmdMaW5rcyA9IFsuLi5jdHguZGIuVXNlcklkZW50aXR5LnVzZXJfaWRlbnRpdHlfdXNlcl9pZC5maWx0ZXIob2xkR3Vlc3RJZCldO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ0xpbmtzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGN0eC5kYi5Vc2VyLmlkLmRlbGV0ZShvbGRHdWVzdElkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDYXNlIDFhIC8gMWM6IFVwZ3JhZGUgZ3Vlc3Qgb3IgcmVmcmVzaCBEaXNjb3JkIGluZm9cclxuICAgICAgICBjdHguZGIuVXNlci5pZC51cGRhdGUoe1xyXG4gICAgICAgICAgICAuLi5jdXJyZW50VXNlcixcclxuICAgICAgICAgICAgdXNlcm5hbWU6IGN1cnJlbnRVc2VyLmlzR3Vlc3QgPyBkaXNjb3JkVXNlcm5hbWUgOiBjdXJyZW50VXNlci51c2VybmFtZSxcclxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IGN1cnJlbnRVc2VyLmlzR3Vlc3QgPyBkaXNjb3JkVXNlcm5hbWUgOiBjdXJyZW50VXNlci5kaXNwbGF5TmFtZSxcclxuICAgICAgICAgICAgaXNHdWVzdDogZmFsc2UsXHJcbiAgICAgICAgICAgIGRpc2NvcmRJZCxcclxuICAgICAgICAgICAgbGFzdExvZ2luQXQ6IGN0eC50aW1lc3RhbXAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS51cGRhdGUoe1xyXG4gICAgICAgICAgICAuLi51c2VyTWFwcGluZyxcclxuICAgICAgICAgICAgbGFzdFNlZW5BdDogY3R4LnRpbWVzdGFtcCxcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTm8gVXNlcklkZW50aXR5IG1hcHBpbmcgZXhpc3RzIGZvciB0aGlzIGlkZW50aXR5IHlldFxyXG4gICAgaWYgKGRpc2NvcmRPd25lcikge1xyXG4gICAgICAgIC8vIENhc2UgMjogQ3Jvc3MtZGV2aWNlIGxvZ2luIOKAlCB3ZSBuZWVkIHRvIGNyZWF0ZSBhIFVzZXJJZGVudGl0eSBmb3IgdGhpcyBoZXguXHJcbiAgICAgICAgLy8gQnV0IHdlIG9ubHkgaGF2ZSB0aGUgaGV4IHN0cmluZywgbm90IHRoZSBJZGVudGl0eSBvYmplY3QuIFdlIGNhbid0IGluc2VydFxyXG4gICAgICAgIC8vIGEgVXNlcklkZW50aXR5IHdpdGhvdXQgdGhlIElkZW50aXR5IHR5cGUuIFNvIGluc3RlYWQsIHdlJ2xsIHN0b3JlIHRoZVxyXG4gICAgICAgIC8vIGRpc2NvcmRJZCBvbiBhIHBlbmRpbmcgYmFzaXMgYW5kIGxldCB0aGUgY2xpZW50IGNhbGwgbG9naW5fYXNfZ3Vlc3QgZmlyc3QsXHJcbiAgICAgICAgLy8gd2hpY2ggY3JlYXRlcyB0aGUgVXNlcklkZW50aXR5LiBUaGVuIHRoaXMgcmVkdWNlciB1cGdyYWRlcyBpdC5cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIEZvciB0aGlzIHRvIHdvcmssIHRoZSBjbGllbnQgZmxvdyBtdXN0IGJlOlxyXG4gICAgICAgIC8vICAgMS4gQ2xpZW50IGNvbm5lY3RzIOKGkiBsb2dpbl9hc19ndWVzdCAoY3JlYXRlcyBVc2VySWRlbnRpdHkgKyBndWVzdCBVc2VyKVxyXG4gICAgICAgIC8vICAgMi4gQ2xpZW50IGF1dGhlbnRpY2F0ZXMgRGlzY29yZCDihpIgQVBJIHJvdXRlIGNhbGxzIHNlcnZlcl9saW5rX2Rpc2NvcmRcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIFNpbmNlIGxvZ2luX2FzX2d1ZXN0IGFsd2F5cyBydW5zIGZpcnN0IChBdXRoR2F0ZSksIHRoZSBtYXBwaW5nIHdpbGwgZXhpc3QuXHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdJZGVudGl0eSBub3QgcmVnaXN0ZXJlZC4gQ2FsbCBsb2dpbl9hc19ndWVzdCBmaXJzdC4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYXNlIDM6IFNhbWUgcHJvYmxlbSDigJQgY2FuJ3QgY3JlYXRlIFVzZXJJZGVudGl0eSB3aXRob3V0IHRoZSBJZGVudGl0eSBvYmplY3QuXHJcbiAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ0lkZW50aXR5IG5vdCByZWdpc3RlcmVkLiBDYWxsIGxvZ2luX2FzX2d1ZXN0IGZpcnN0LicpO1xyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBTZXJ2ZXItb25seSByZWR1Y2VyOiBwcm9tb3RlIGEgdXNlciB0byBBZG1pbiByb2xlLlxyXG4gKiBDYWxsZWQgdmlhOiBucHggdHN4IHNjcmlwdHMvcHJvbW90ZS1hZG1pbi50cyA8dXNlcm5hbWU+XHJcbiAqL1xyXG5leHBvcnQgY29uc3Qgc2VydmVyX3Byb21vdGVfYWRtaW4gPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKHtcclxuICAgIHVzZXJuYW1lOiB0LnN0cmluZygpLFxyXG59LCAoY3R4LCB7IHVzZXJuYW1lIH0pID0+IHtcclxuICAgIHJlcXVpcmVTZXJ2ZXIoY3R4KTtcclxuXHJcbiAgICBpZiAoIXVzZXJuYW1lIHx8IHVzZXJuYW1lLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcigndXNlcm5hbWUgaXMgcmVxdWlyZWQnKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBGaW5kIHVzZXIgYnkgaXRlcmF0aW5nICh1c2VybmFtZSBpcyB1bmlxdWUgYnV0IG5vdCBpbmRleGVkIGZvciBmaWx0ZXIpXHJcbiAgICBsZXQgdGFyZ2V0VXNlcjogYW55ID0gbnVsbDtcclxuICAgIGZvciAoY29uc3Qgcm93IG9mIGN0eC5kYi5Vc2VyLml0ZXIoKSkge1xyXG4gICAgICAgIGlmIChyb3cudXNlcm5hbWUgPT09IHVzZXJuYW1lKSB7XHJcbiAgICAgICAgICAgIHRhcmdldFVzZXIgPSByb3c7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRhcmdldFVzZXIpIHtcclxuICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoYFVzZXIgXCIke3VzZXJuYW1lfVwiIG5vdCBmb3VuZGApO1xyXG4gICAgfVxyXG5cclxuICAgIGN0eC5kYi5Vc2VyLmlkLnVwZGF0ZSh7XHJcbiAgICAgICAgLi4udGFyZ2V0VXNlcixcclxuICAgICAgICByb2xlOiB7IHRhZzogJ0FkbWluJyB9LFxyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCJpbXBvcnQgeyBTZW5kZXJFcnJvciB9IGZyb20gJ3NwYWNldGltZWRiL3NlcnZlcic7XHJcblxyXG4vKipcclxuICogUmVzb2x2ZXMgY3R4LnNlbmRlciAoaWRlbnRpdHkpIOKGkiBVc2VySWRlbnRpdHkg4oaSIFVzZXIuXHJcbiAqIFJldHVybnMgYm90aCB0aGUgbWFwcGluZyByb3cgYW5kIHRoZSBVc2VyIHJvdy5cclxuICogVGhyb3dzIGlmIHRoZSBpZGVudGl0eSBpcyBub3QgbGlua2VkIHRvIGFueSB1c2VyLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEF1dGhlbnRpY2F0ZWRVc2VyKGN0eDogYW55KSB7XHJcbiAgICBjb25zdCBtYXBwaW5nID0gY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS5maW5kKGN0eC5zZW5kZXIpO1xyXG4gICAgaWYgKCFtYXBwaW5nKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKFwiVW5hdXRob3JpemVkOiBObyB1c2VyIGxpbmtlZCB0byB0aGlzIGlkZW50aXR5LlwiKTtcclxuICAgIH1cclxuICAgIGNvbnN0IHVzZXIgPSBjdHguZGIuVXNlci5pZC5maW5kKG1hcHBpbmcudXNlcklkKTtcclxuICAgIGlmICghdXNlcikge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcihcIlVuYXV0aG9yaXplZDogVXNlciByZWNvcmQgbm90IGZvdW5kLlwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiB1c2VyO1xyXG59XHJcblxyXG4vKipcclxuICogRW5zdXJlcyB0aGUgc2VuZGVyIGlzIGFuIEFkbWluLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUFkbWluKGN0eDogYW55KSB7XHJcbiAgICBjb25zdCB1c2VyID0gZ2V0QXV0aGVudGljYXRlZFVzZXIoY3R4KTtcclxuICAgIGlmICh1c2VyLnJvbGUudGFnICE9PSAnQWRtaW4nKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKFwiRm9yYmlkZGVuOiBSZXF1aXJlcyBBZG1pbiBwcml2aWxlZ2VzLlwiKTtcclxuICAgIH1cclxuICAgIHJldHVybiB1c2VyO1xyXG59XHJcblxyXG4vKipcclxuICogRW5zdXJlcyB0aGUgc2VuZGVyIGlzIGEgVG91cm5hbWVudEhvc3QgT1IgYW4gQWRtaW4uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlVG91cm5hbWVudEhvc3QoY3R4OiBhbnkpIHtcclxuICAgIGNvbnN0IHVzZXIgPSBnZXRBdXRoZW50aWNhdGVkVXNlcihjdHgpO1xyXG4gICAgaWYgKHVzZXIucm9sZS50YWcgIT09ICdUb3VybmFtZW50SG9zdCcgJiYgdXNlci5yb2xlLnRhZyAhPT0gJ0FkbWluJykge1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcihcIkZvcmJpZGRlbjogUmVxdWlyZXMgVG91cm5hbWVudCBIb3N0IG9yIEFkbWluIHByaXZpbGVnZXMuXCIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVzZXI7XHJcbn1cclxuIiwiaW1wb3J0IHNwYWNldGltZWRiIGZyb20gJy4uL3NjaGVtYSc7XHJcbmltcG9ydCB7IHQsIFNlbmRlckVycm9yIH0gZnJvbSAnc3BhY2V0aW1lZGIvc2VydmVyJztcclxuaW1wb3J0IHsgZW5zdXJlQWRtaW4gfSBmcm9tICcuLi9oZWxwZXJzL2Vuc3VyZVBlcm1pc3Npb25zJztcclxuaW1wb3J0IHsgUGF0aCwgRWxlbWVudCwgQ2hhclJvbGUsIEdhbWVNb2RlLCBSb2xlIH0gZnJvbSAnLi4vdHlwZXMvZW51bXMnO1xyXG5pbXBvcnQgeyBoc3JDaGFyYWN0ZXJDb2x1bW5zIH0gZnJvbSAnLi4vdGFibGVzL2hzckNoYXJhY3Rlcic7XHJcbmltcG9ydCB7IGhzckxpZ2h0Y29uZUNvbHVtbnMgfSBmcm9tICcuLi90YWJsZXMvaHNyTGlnaHRjb25lJztcclxuaW1wb3J0IHsgaHNyQ2hhcmFjdGVyQ29zdENvbHVtbnMgfSBmcm9tICcuLi90YWJsZXMvaHNyQ2hhcmFjdGVyQ29zdCc7XHJcbmltcG9ydCB7IGhzckxpZ2h0Y29uZUNvc3RDb2x1bW5zIH0gZnJvbSAnLi4vdGFibGVzL2hzckxpZ2h0Y29uZUNvc3QnO1xyXG5pbXBvcnQgeyBoc3JTeW5lcmd5Q29zdFVwc2VydEtleXMgfSBmcm9tICcuLi90YWJsZXMvaHNyU3luZXJneUNvc3QnO1xyXG5cclxuLy8g4pSA4pSA4pSAIFN0cmljdCBlbnVtIHZhbGlkYXRvciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuLy8gRW51bSB2YWx1ZXMgbXVzdCBtYXRjaCBleGFjdGx5IChjYXNlLXNlbnNpdGl2ZSkuIE5vIGNvZXJjaW9uLlxyXG5cclxuY29uc3QgRU5VTV9WQVJJQU5UUzogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge1xyXG4gICAgcGF0aDogT2JqZWN0LmtleXMoUGF0aC52YXJpYW50cyksXHJcbiAgICBlbGVtZW50OiBPYmplY3Qua2V5cyhFbGVtZW50LnZhcmlhbnRzKSxcclxuICAgIHJvbGU6IE9iamVjdC5rZXlzKENoYXJSb2xlLnZhcmlhbnRzKSxcclxuICAgIGdhbWVNb2RlOiBPYmplY3Qua2V5cyhHYW1lTW9kZS52YXJpYW50cyksXHJcbiAgICB1c2VyUm9sZTogT2JqZWN0LmtleXMoUm9sZS52YXJpYW50cyksXHJcbn07XHJcblxyXG5mdW5jdGlvbiB2YWxpZGF0ZUVudW0oZmllbGQ6IHN0cmluZywgdmFsdWU6IHN0cmluZywgY3R4OiBhbnksIHRhYmxlTmFtZTogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCB2YXJpYW50cyA9IEVOVU1fVkFSSUFOVFNbZmllbGRdO1xyXG4gICAgaWYgKCF2YXJpYW50cykgcmV0dXJuO1xyXG4gICAgaWYgKCF2YXJpYW50cy5pbmNsdWRlcyh2YWx1ZSkpIHtcclxuICAgICAgICBjb25zdCBlcnJvck1zZyA9IGBJbnZhbGlkICR7ZmllbGR9OiBcIiR7dmFsdWV9XCIuIE11c3QgYmUgZXhhY3RseSBvbmUgb2Y6ICR7dmFyaWFudHMuam9pbignLCAnKX1gO1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYFtBRE1JTl0gQnVsayB1cHNlcnQgUkVKRUNURUQgZm9yIHRhYmxlIFwiJHt0YWJsZU5hbWV9XCIgYnkgJHtjdHguc2VuZGVyLnRvSGV4U3RyaW5nKCl9OiAke2Vycm9yTXNnfWApO1xyXG4gICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcihlcnJvck1zZyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIOKUgOKUgOKUgCBTdHJpY3Qga2V5IHZhbGlkYXRvciDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuLy8gRXZlcnkgcm93IG11c3QgaGF2ZSBleGFjdGx5IHRoZSBleHBlY3RlZCBrZXlzIOKAlCBubyBtb3JlLCBubyBsZXNzLlxyXG5cclxuY29uc3QgRVhQRUNURURfS0VZUzogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge1xyXG4gICAgSHNyQ2hhcmFjdGVyOiBPYmplY3Qua2V5cyhoc3JDaGFyYWN0ZXJDb2x1bW5zKSxcclxuICAgIEhzckxpZ2h0Y29uZTogT2JqZWN0LmtleXMoaHNyTGlnaHRjb25lQ29sdW1ucyksXHJcbiAgICBIc3JDaGFyYWN0ZXJDb3N0OiBPYmplY3Qua2V5cyhoc3JDaGFyYWN0ZXJDb3N0Q29sdW1ucyksXHJcbiAgICBIc3JMaWdodGNvbmVDb3N0OiBPYmplY3Qua2V5cyhoc3JMaWdodGNvbmVDb3N0Q29sdW1ucyksXHJcbiAgICBIc3JTeW5lcmd5Q29zdDogaHNyU3luZXJneUNvc3RVcHNlcnRLZXlzLFxyXG59O1xyXG5cclxuZnVuY3Rpb24gdmFsaWRhdGVLZXlzKHJvd3M6IGFueVtdLCB0YWJsZU5hbWU6IHN0cmluZywgY3R4OiBhbnkpOiB2b2lkIHtcclxuICAgIGNvbnN0IGV4cGVjdGVkID0gRVhQRUNURURfS0VZU1t0YWJsZU5hbWVdO1xyXG4gICAgaWYgKCFleHBlY3RlZCkgcmV0dXJuO1xyXG4gICAgY29uc3QgZXhwZWN0ZWRTZXQgPSBuZXcgU2V0KGV4cGVjdGVkKTtcclxuICAgIGNvbnN0IGV4cGVjdGVkU29ydGVkID0gWy4uLmV4cGVjdGVkXS5zb3J0KCkuam9pbignLCcpO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcm93cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGFjdHVhbEtleXMgPSBPYmplY3Qua2V5cyhyb3dzW2ldKS5zb3J0KCk7XHJcbiAgICAgICAgaWYgKGFjdHVhbEtleXMuam9pbignLCcpICE9PSBleHBlY3RlZFNvcnRlZCkge1xyXG4gICAgICAgICAgICBjb25zdCBhY3R1YWxTZXQgPSBuZXcgU2V0KGFjdHVhbEtleXMpO1xyXG4gICAgICAgICAgICBjb25zdCBtaXNzaW5nID0gZXhwZWN0ZWQuZmlsdGVyKGsgPT4gIWFjdHVhbFNldC5oYXMoaykpO1xyXG4gICAgICAgICAgICBjb25zdCBleHRyYSA9IGFjdHVhbEtleXMuZmlsdGVyKGsgPT4gIWV4cGVjdGVkU2V0LmhhcyhrKSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICBpZiAobWlzc2luZy5sZW5ndGgpIHBhcnRzLnB1c2goYG1pc3Npbmc6IFske21pc3Npbmcuam9pbignLCAnKX1dYCk7XHJcbiAgICAgICAgICAgIGlmIChleHRyYS5sZW5ndGgpIHBhcnRzLnB1c2goYHVuZXhwZWN0ZWQ6IFske2V4dHJhLmpvaW4oJywgJyl9XWApO1xyXG4gICAgICAgICAgICBjb25zdCBlcnJvck1zZyA9IGBSb3cgJHtpfSBrZXkgbWlzbWF0Y2g6ICR7cGFydHMuam9pbignLCAnKX0uIEV4cGVjdGVkIGV4YWN0bHk6IFske2V4cGVjdGVkLmpvaW4oJywgJyl9XWA7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtBRE1JTl0gQnVsayB1cHNlcnQgUkVKRUNURUQgZm9yIHRhYmxlIFwiJHt0YWJsZU5hbWV9XCIgYnkgJHtjdHguc2VuZGVyLnRvSGV4U3RyaW5nKCl9OiAke2Vycm9yTXNnfWApO1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoZXJyb3JNc2cpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8g4pSA4pSA4pSAIEdlbmVyaWMgcm93IGRlbGV0ZSAod29ya3MgZm9yIGFueSBwdWJsaWMgdGFibGUpIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxyXG5cclxuZXhwb3J0IGNvbnN0IGFkbWluX2RlbGV0ZV9yb3cgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxyXG4gICAgeyB0YWJsZU5hbWU6IHQuc3RyaW5nKCksIHByaW1hcnlLZXlKc29uOiB0LnN0cmluZygpIH0sXHJcbiAgICAoY3R4LCB7IHRhYmxlTmFtZSwgcHJpbWFyeUtleUpzb24gfSkgPT4ge1xyXG4gICAgICAgIGVuc3VyZUFkbWluKGN0eCk7XHJcblxyXG4gICAgICAgIHN3aXRjaCAodGFibGVOYW1lKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ1VzZXInOiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IE51bWJlcihwcmltYXJ5S2V5SnNvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWN0eC5kYi5Vc2VyLmlkLmZpbmQoaWQpKSB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1JvdyBub3QgZm91bmQnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBCbG9jayBkZWxldGlvbiBpZiB1c2VyIGlzIGhvc3RpbmcgYW4gYWN0aXZlIGxvYmJ5XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGxvYmJ5IG9mIGN0eC5kYi5Mb2JieS5pdGVyKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobG9iYnkuaG9zdFVzZXJJZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYENhbm5vdCBkZWxldGUgdXNlciAjJHtpZH06IHRoZXkgYXJlIGhvc3RpbmcgbG9iYnkgXCIke2xvYmJ5LmpvaW5Db2RlfVwiLiBSZW1vdmUgdGhlIGxvYmJ5IGZpcnN0LmBcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQmxvY2sgZGVsZXRpb24gaWYgdXNlciBpcyBhIG1lbWJlciBvZiBhbiBhY3RpdmUgbG9iYnlcclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIGN0eC5kYi5Mb2JieU1lbWJlci5pdGVyKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWVtYmVyLnVzZXJJZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFNlbmRlckVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYENhbm5vdCBkZWxldGUgdXNlciAjJHtpZH06IHRoZXkgYXJlIGluIGFjdGl2ZSBsb2JieSAjJHttZW1iZXIubG9iYnlJZH0uIFJlbW92ZSB0aGVtIGZyb20gdGhlIGxvYmJ5IGZpcnN0LmBcclxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQmxvY2sgZGVsZXRpb24gaWYgdXNlciBpcyBpbiBhbiBhY3RpdmUgbWF0Y2ggc3RlcFxyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdGVwIG9mIGN0eC5kYi5NYXRjaFNlc3Npb25TdGVwLml0ZXIoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGVwLmFjdG9yVXNlcklkID09PSBpZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgQ2Fubm90IGRlbGV0ZSB1c2VyICMke2lkfTogdGhleSBoYXZlIGFjdGlvbnMgaW4gYWN0aXZlIG1hdGNoIChsb2JieSAjJHtzdGVwLmxvYmJ5SWR9KS4gRW5kIHRoZSBtYXRjaCBmaXJzdC5gXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIENhc2NhZGU6IGRlbGV0ZSBhbGwgVXNlcklkZW50aXR5IHJvd3MgZm9yIHRoaXMgdXNlclxyXG4gICAgICAgICAgICAgICAgY29uc3QgaWRlbnRpdGllc1RvRGVsZXRlID0gW107XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHVpIG9mIGN0eC5kYi5Vc2VySWRlbnRpdHkuaXRlcigpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVpLnVzZXJJZCA9PT0gaWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWRlbnRpdGllc1RvRGVsZXRlLnB1c2godWkuaWRlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaWRlbnRpdHkgb2YgaWRlbnRpdGllc1RvRGVsZXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY3R4LmRiLlVzZXJJZGVudGl0eS5pZGVudGl0eS5kZWxldGUoaWRlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNhZmUgdG8gZGVsZXRlIHRoZSB1c2VyIChoaXN0b3J5IHRhYmxlcyBhcmUgcHJlc2VydmVkKVxyXG4gICAgICAgICAgICAgICAgY3R4LmRiLlVzZXIuaWQuZGVsZXRlKGlkKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ1VzZXJJZGVudGl0eSc6IHtcclxuICAgICAgICAgICAgICAgIC8vIElkZW50aXR5IFBLcyBhcmUgaGV4IHN0cmluZ3Mg4oCUIGZpbmQgdmlhIGl0ZXJcclxuICAgICAgICAgICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCByb3cgb2YgY3R4LmRiLlVzZXJJZGVudGl0eS5pdGVyKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocm93LmlkZW50aXR5LnRvSGV4U3RyaW5nKCkgPT09IHByaW1hcnlLZXlKc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5kYi5Vc2VySWRlbnRpdHkuaWRlbnRpdHkuZGVsZXRlKHJvdy5pZGVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCFmb3VuZCkgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdSb3cgbm90IGZvdW5kJyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdIc3JDaGFyYWN0ZXInOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWN0eC5kYi5Ic3JDaGFyYWN0ZXIubmFtZS5maW5kKHByaW1hcnlLZXlKc29uKSkgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdSb3cgbm90IGZvdW5kJyk7XHJcbiAgICAgICAgICAgICAgICBjdHguZGIuSHNyQ2hhcmFjdGVyLm5hbWUuZGVsZXRlKHByaW1hcnlLZXlKc29uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ0hzckxpZ2h0Y29uZSc6IHtcclxuICAgICAgICAgICAgICAgIGlmICghY3R4LmRiLkhzckxpZ2h0Y29uZS5uYW1lLmZpbmQocHJpbWFyeUtleUpzb24pKSB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1JvdyBub3QgZm91bmQnKTtcclxuICAgICAgICAgICAgICAgIGN0eC5kYi5Ic3JMaWdodGNvbmUubmFtZS5kZWxldGUocHJpbWFyeUtleUpzb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnSHNyQ2hhcmFjdGVyQ29zdCc6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IEpTT04ucGFyc2UocHJpbWFyeUtleUpzb24pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiBjdHguZGIuSHNyQ2hhcmFjdGVyQ29zdC5pdGVyKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocm93LmNoYXJhY3Rlck5hbWUgPT09IGtleS5jaGFyYWN0ZXJOYW1lICYmIHJvdy5nYW1lTW9kZS50YWcgPT09IGtleS5nYW1lTW9kZVRhZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZGIuSHNyQ2hhcmFjdGVyQ29zdC5kZWxldGUocm93KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZvdW5kKSB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1JvdyBub3QgZm91bmQnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ0hzckxpZ2h0Y29uZUNvc3QnOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWN0eC5kYi5Ic3JMaWdodGNvbmVDb3N0LmxpZ2h0Y29uZU5hbWUuZmluZChwcmltYXJ5S2V5SnNvbikpIHRocm93IG5ldyBTZW5kZXJFcnJvcignUm93IG5vdCBmb3VuZCcpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmRiLkhzckxpZ2h0Y29uZUNvc3QubGlnaHRjb25lTmFtZS5kZWxldGUocHJpbWFyeUtleUpzb24pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnSHNyU3luZXJneUNvc3QnOiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IE51bWJlcihwcmltYXJ5S2V5SnNvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWN0eC5kYi5Ic3JTeW5lcmd5Q29zdC5pZC5maW5kKGlkKSkgdGhyb3cgbmV3IFNlbmRlckVycm9yKCdSb3cgbm90IGZvdW5kJyk7XHJcbiAgICAgICAgICAgICAgICBjdHguZGIuSHNyU3luZXJneUNvc3QuaWQuZGVsZXRlKGlkKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ0xvYmJ5Jzoge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBOdW1iZXIocHJpbWFyeUtleUpzb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjdHguZGIuTG9iYnkuaWQuZmluZChpZCkpIHRocm93IG5ldyBTZW5kZXJFcnJvcignUm93IG5vdCBmb3VuZCcpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmRiLkxvYmJ5LmlkLmRlbGV0ZShpZCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdMb2JieU1lbWJlcic6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IEpTT04ucGFyc2UocHJpbWFyeUtleUpzb24pO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiBjdHguZGIuTG9iYnlNZW1iZXIuaXRlcigpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdy5sb2JieUlkID09PSBrZXkubG9iYnlJZCAmJiByb3cudXNlcklkID09PSBrZXkudXNlcklkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5kYi5Mb2JieU1lbWJlci5kZWxldGUocm93KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZvdW5kKSB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1JvdyBub3QgZm91bmQnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ01hdGNoU2Vzc2lvbic6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gTnVtYmVyKHByaW1hcnlLZXlKc29uKTtcclxuICAgICAgICAgICAgICAgIGlmICghY3R4LmRiLk1hdGNoU2Vzc2lvbi5sb2JieUlkLmZpbmQoaWQpKSB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1JvdyBub3QgZm91bmQnKTtcclxuICAgICAgICAgICAgICAgIGN0eC5kYi5NYXRjaFNlc3Npb24ubG9iYnlJZC5kZWxldGUoaWQpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2FzZSAnTWF0Y2hTZXNzaW9uU3RlcCc6IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gTnVtYmVyKHByaW1hcnlLZXlKc29uKTtcclxuICAgICAgICAgICAgICAgIGlmICghY3R4LmRiLk1hdGNoU2Vzc2lvblN0ZXAuaWQuZmluZChpZCkpIHRocm93IG5ldyBTZW5kZXJFcnJvcignUm93IG5vdCBmb3VuZCcpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmRiLk1hdGNoU2Vzc2lvblN0ZXAuaWQuZGVsZXRlKGlkKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ01hdGNoU2Vzc2lvbkhpc3RvcnknOiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWN0eC5kYi5NYXRjaFNlc3Npb25IaXN0b3J5LmlkLmZpbmQocHJpbWFyeUtleUpzb24pKSB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoJ1JvdyBub3QgZm91bmQnKTtcclxuICAgICAgICAgICAgICAgIGN0eC5kYi5NYXRjaFNlc3Npb25IaXN0b3J5LmlkLmRlbGV0ZShwcmltYXJ5S2V5SnNvbik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdNYXRjaFNlc3Npb25TdGVwSGlzdG9yeSc6IHtcclxuICAgICAgICAgICAgICAgIGlmICghY3R4LmRiLk1hdGNoU2Vzc2lvblN0ZXBIaXN0b3J5Lm1hdGNoSWQuZmluZChwcmltYXJ5S2V5SnNvbikpIHRocm93IG5ldyBTZW5kZXJFcnJvcignUm93IG5vdCBmb3VuZCcpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmRiLk1hdGNoU2Vzc2lvblN0ZXBIaXN0b3J5Lm1hdGNoSWQuZGVsZXRlKHByaW1hcnlLZXlKc29uKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoYFVua25vd24gdGFibGU6ICR7dGFibGVOYW1lfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuKTtcclxuXHJcbi8vIOKUgOKUgOKUgCBCdWxrIHVwc2VydCBmb3IgZ2FtZSBkYXRhIHRhYmxlcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcclxuXHJcbmV4cG9ydCBjb25zdCBhZG1pbl9idWxrX3Vwc2VydCA9IHNwYWNldGltZWRiLnJlZHVjZXIoXHJcbiAgICB7IHRhYmxlTmFtZTogdC5zdHJpbmcoKSwganNvbkRhdGE6IHQuc3RyaW5nKCkgfSxcclxuICAgIChjdHgsIHsgdGFibGVOYW1lLCBqc29uRGF0YSB9KSA9PiB7XHJcbiAgICAgICAgZW5zdXJlQWRtaW4oY3R4KTtcclxuXHJcbiAgICAgICAgY29uc3Qgcm93czogYW55W10gPSBKU09OLnBhcnNlKGpzb25EYXRhKTtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkocm93cykpIHRocm93IG5ldyBTZW5kZXJFcnJvcignanNvbkRhdGEgbXVzdCBiZSBhIEpTT04gYXJyYXknKTtcclxuXHJcbiAgICAgICAgdmFsaWRhdGVLZXlzKHJvd3MsIHRhYmxlTmFtZSwgY3R4KTtcclxuXHJcbiAgICAgICAgc3dpdGNoICh0YWJsZU5hbWUpIHtcclxuICAgICAgICAgICAgY2FzZSAnSHNyQ2hhcmFjdGVyJzoge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCByIG9mIHJvd3MpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZUVudW0oJ3BhdGgnLCByLnBhdGgsIGN0eCwgdGFibGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZUVudW0oJ2VsZW1lbnQnLCByLmVsZW1lbnQsIGN0eCwgdGFibGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZUVudW0oJ3JvbGUnLCByLnJvbGUsIGN0eCwgdGFibGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGN0eC5kYi5Ic3JDaGFyYWN0ZXIubmFtZS5maW5kKHIubmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiByLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiByLmRpc3BsYXlOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlhc2VzOiByLmFsaWFzZXMgfHwgW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhcml0eTogci5yYXJpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGg6IHsgdGFnOiByLnBhdGgsIHZhbHVlOiB7fSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiB7IHRhZzogci5lbGVtZW50LCB2YWx1ZToge30gfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogeyB0YWc6IHIucm9sZSwgdmFsdWU6IHt9IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJsOiByLmltYWdlVXJsIHx8ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV4aXN0aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5kYi5Ic3JDaGFyYWN0ZXIubmFtZS51cGRhdGUoeyAuLi5leGlzdGluZywgLi4ucm93IH0gYXMgYW55KTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZGIuSHNyQ2hhcmFjdGVyLmluc2VydChyb3cgYXMgYW55KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdIc3JMaWdodGNvbmUnOiB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHIgb2Ygcm93cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbGlkYXRlRW51bSgncGF0aCcsIHIucGF0aCwgY3R4LCB0YWJsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nID0gY3R4LmRiLkhzckxpZ2h0Y29uZS5uYW1lLmZpbmQoci5uYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByb3cgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IHIubmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IHIuZGlzcGxheU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWFzZXM6IHIuYWxpYXNlcyB8fCBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aDogeyB0YWc6IHIucGF0aCwgdmFsdWU6IHt9IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhcml0eTogci5yYXJpdHksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJsOiByLmltYWdlVXJsIHx8ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NYOiByLnBvc1ggfHwgMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zWTogci5wb3NZIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiByLndpZHRoIHx8IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmRiLkhzckxpZ2h0Y29uZS5uYW1lLnVwZGF0ZSh7IC4uLmV4aXN0aW5nLCAuLi5yb3cgfSBhcyBhbnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5kYi5Ic3JMaWdodGNvbmUuaW5zZXJ0KHJvdyBhcyBhbnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ0hzckNoYXJhY3RlckNvc3QnOiB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHIgb2Ygcm93cykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbGlkYXRlRW51bSgnZ2FtZU1vZGUnLCByLmdhbWVNb2RlLCBjdHgsIHRhYmxlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ2FtZU1vZGUgPSB7IHRhZzogci5nYW1lTW9kZSwgdmFsdWU6IHt9IH07XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm93ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGFyYWN0ZXJOYW1lOiByLmNoYXJhY3Rlck5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhbWVNb2RlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2ljQ29zdHM6IHIuY2xhc3NpY0Nvc3RzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdWN0aW9uQmFzZUJpZDogci5hdWN0aW9uQmFzZUJpZCxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBleGlzdGluZyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBlIG9mIGN0eC5kYi5Ic3JDaGFyYWN0ZXJDb3N0Lml0ZXIoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS5jaGFyYWN0ZXJOYW1lID09PSByLmNoYXJhY3Rlck5hbWUgJiYgZS5nYW1lTW9kZS50YWcgPT09IHIuZ2FtZU1vZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nID0gZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZGIuSHNyQ2hhcmFjdGVyQ29zdC5kZWxldGUoZXhpc3RpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjdHguZGIuSHNyQ2hhcmFjdGVyQ29zdC5pbnNlcnQocm93IGFzIGFueSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXNlICdIc3JMaWdodGNvbmVDb3N0Jzoge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCByIG9mIHJvd3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGN0eC5kYi5Ic3JMaWdodGNvbmVDb3N0LmxpZ2h0Y29uZU5hbWUuZmluZChyLmxpZ2h0Y29uZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlnaHRjb25lTmFtZTogci5saWdodGNvbmVOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2ljQ29zdHM6IHIuY2xhc3NpY0Nvc3RzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdWN0aW9uQmFzZUJpZDogci5hdWN0aW9uQmFzZUJpZCxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChleGlzdGluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguZGIuSHNyTGlnaHRjb25lQ29zdC5saWdodGNvbmVOYW1lLnVwZGF0ZSh7IC4uLmV4aXN0aW5nLCAuLi5yb3cgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmRiLkhzckxpZ2h0Y29uZUNvc3QuaW5zZXJ0KHJvdyBhcyBhbnkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhc2UgJ0hzclN5bmVyZ3lDb3N0Jzoge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCByIG9mIHJvd3MpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZUVudW0oJ2dhbWVNb2RlJywgci5nYW1lTW9kZSwgY3R4LCB0YWJsZU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdhbWVNb2RlID0geyB0YWc6IHIuZ2FtZU1vZGUsIHZhbHVlOiB7fSB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvdyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvdXJjZU5hbWU6IHIuc291cmNlTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0TmFtZTogci50YXJnZXROYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBnYW1lTW9kZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29zdE1vZGlmaWVyOiByLmNvc3RNb2RpZmllcixcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBleGlzdGluZyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBlIG9mIGN0eC5kYi5Ic3JTeW5lcmd5Q29zdC5pdGVyKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGUuc291cmNlTmFtZSA9PT0gci5zb3VyY2VOYW1lICYmIGUudGFyZ2V0TmFtZSA9PT0gci50YXJnZXROYW1lICYmIGUuZ2FtZU1vZGUudGFnID09PSByLmdhbWVNb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZyA9IGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXhpc3RpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LmRiLkhzclN5bmVyZ3lDb3N0LmlkLnVwZGF0ZSh7IC4uLmV4aXN0aW5nLCBjb3N0TW9kaWZpZXI6IHIuY29zdE1vZGlmaWVyIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5kYi5Ic3JTeW5lcmd5Q29zdC5pbnNlcnQocm93IGFzIGFueSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBTZW5kZXJFcnJvcihgQnVsayB1cHNlcnQgbm90IHN1cHBvcnRlZCBmb3IgdGFibGU6ICR7dGFibGVOYW1lfWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuKTtcclxuXHJcbi8vIOKUgOKUgOKUgCBVcGRhdGUgdXNlciAoaW5saW5lIGVkaXQgZnJvbSBhZG1pbiBwYW5lbCkg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXHJcblxyXG5leHBvcnQgY29uc3QgYWRtaW5fdXBkYXRlX3VzZXIgPSBzcGFjZXRpbWVkYi5yZWR1Y2VyKFxyXG4gICAgeyB1c2VySWQ6IHQudTMyKCksIGRpc3BsYXlOYW1lOiB0LnN0cmluZygpLCB1c2VybmFtZTogdC5zdHJpbmcoKSwgcm9sZVRhZzogdC5zdHJpbmcoKSB9LFxyXG4gICAgKGN0eCwgeyB1c2VySWQsIGRpc3BsYXlOYW1lLCB1c2VybmFtZSwgcm9sZVRhZyB9KSA9PiB7XHJcbiAgICAgICAgZW5zdXJlQWRtaW4oY3R4KTtcclxuXHJcbiAgICAgICAgY29uc3QgdXNlciA9IGN0eC5kYi5Vc2VyLmlkLmZpbmQodXNlcklkKTtcclxuICAgICAgICBpZiAoIXVzZXIpIHRocm93IG5ldyBTZW5kZXJFcnJvcignVXNlciBub3QgZm91bmQnKTtcclxuXHJcbiAgICAgICAgLy8gVmFsaWRhdGUgcm9sZSB0YWdcclxuICAgICAgICB2YWxpZGF0ZUVudW0oJ3VzZXJSb2xlJywgcm9sZVRhZywgY3R4LCAnVXNlcicpO1xyXG5cclxuICAgICAgICAvLyBDaGVjayB1c2VybmFtZSB1bmlxdWVuZXNzIGlmIGNoYW5nZWRcclxuICAgICAgICBpZiAodXNlcm5hbWUgIT09IHVzZXIudXNlcm5hbWUpIHtcclxuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBjdHguZGIuVXNlci51c2VybmFtZS5maW5kKHVzZXJuYW1lKTtcclxuICAgICAgICAgICAgaWYgKGV4aXN0aW5nKSB0aHJvdyBuZXcgU2VuZGVyRXJyb3IoYFVzZXJuYW1lIFwiJHt1c2VybmFtZX1cIiBpcyBhbHJlYWR5IHRha2VuYCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjdHguZGIuVXNlci5pZC51cGRhdGUoe1xyXG4gICAgICAgICAgICAuLi51c2VyLFxyXG4gICAgICAgICAgICBkaXNwbGF5TmFtZSxcclxuICAgICAgICAgICAgdXNlcm5hbWUsXHJcbiAgICAgICAgICAgIHJvbGU6IHsgdGFnOiByb2xlVGFnLCB2YWx1ZToge30gfSBhcyBhbnksXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbik7XHJcbiIsImltcG9ydCBzcGFjZXRpbWVkYiBmcm9tICcuL3NjaGVtYSc7XHJcbmV4cG9ydCB7IGJyb2FkY2FzdF9jdXJzb3IgfSBmcm9tICcuL3JlZHVjZXJzL2N1cnNvcic7XHJcbmV4cG9ydCB7IGxvZ2luX2FzX2d1ZXN0IH0gZnJvbSAnLi9yZWR1Y2Vycy9hdXRoJztcclxuZXhwb3J0IHsgZGVsZXRlX2d1ZXN0X2FjY291bnQsIHVwZGF0ZV9kaXNwbGF5X25hbWUsIHVwZGF0ZV91c2VybmFtZSwgdXBkYXRlX2F2YXRhciB9IGZyb20gJy4vcmVkdWNlcnMvcHJvZmlsZSc7XHJcbmV4cG9ydCB7IHJlZ2lzdGVyX3NlcnZlciwgc2VydmVyX2xpbmtfZGlzY29yZCwgc2VydmVyX3Byb21vdGVfYWRtaW4gfSBmcm9tICcuL3JlZHVjZXJzL3NlcnZlcic7XHJcbmV4cG9ydCB7IGFkbWluX2RlbGV0ZV9yb3csIGFkbWluX2J1bGtfdXBzZXJ0LCBhZG1pbl91cGRhdGVfdXNlciB9IGZyb20gJy4vcmVkdWNlcnMvYWRtaW4nO1xyXG5cclxuc3BhY2V0aW1lZGIuY2xpZW50Q29ubmVjdGVkKChjdHgpID0+IHtcclxuICBjb25zb2xlLmxvZyhgQ2xpZW50IGNvbm5lY3RlZDogJHtjdHguc2VuZGVyLnRvSGV4U3RyaW5nKCl9YCk7XHJcbn0pO1xyXG5cclxuc3BhY2V0aW1lZGIuY2xpZW50RGlzY29ubmVjdGVkKChjdHgpID0+IHtcclxuICBjb25zb2xlLmxvZyhgQ2xpZW50IGRpc2Nvbm5lY3RlZDogJHtjdHguc2VuZGVyLnRvSGV4U3RyaW5nKCl9YCk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgc3BhY2V0aW1lZGI7Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUEsSUFBSUEsYUFBVyxPQUFPO0FBQ3RCLElB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QUFFLEdBQ3RGLEtBQUssRUFBRSxRQUFRLGFBQWEsVUFBVSxjQUFjO0FBQ2pELGFBQVksSUFBSTtDQUVoQixNQUFNLE9BQU8sSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLE9BQU87QUFDeEMsS0FBSSxDQUFDLEtBQU0sT0FBTSxJQUFJLFlBQVksaUJBQWlCO0FBR2xELGNBQWEsWUFBWSxTQUFTLEtBQUssT0FBTztBQUc5QyxLQUFJLGFBQWEsS0FBSyxVQUVsQjtNQURpQixJQUFJLEdBQUcsS0FBSyxTQUFTLEtBQUssU0FBUyxDQUN0QyxPQUFNLElBQUksWUFBWSxhQUFhLFNBQVMsb0JBQW9COztBQUdsRixLQUFJLEdBQUcsS0FBSyxHQUFHLE9BQU87RUFDbEIsR0FBRztFQUNIO0VBQ0E7RUFDQSxNQUFNO0dBQUUsS0FBSztHQUFTLE9BQU8sRUFBRTtHQUFFO0VBQ3BDLENBQUM7RUFFVDs7OztBQzNXRCxZQUFZLGlCQUFpQixRQUFRO0FBQ25DLFNBQVEsSUFBSSxxQkFBcUIsSUFBSSxPQUFPLGFBQWEsR0FBRztFQUM1RDtBQUVGLFlBQVksb0JBQW9CLFFBQVE7QUFDdEMsU0FBUSxJQUFJLHdCQUF3QixJQUFJLE9BQU8sYUFBYSxHQUFHO0VBQy9EO0FBRUYsa0JBQWUiLCJkZWJ1Z0lkIjoiZjQ1NWE1MzItNWY3MC00ZmU5LWE0ZDgtMTE2Mjc0ZmQ0MjU1In0=