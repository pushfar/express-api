/**
 * @namespace API/Library
 * @class Eval
 * @description Eval class for transforming js template string code into data using template literal
 * @author Paul Smith (pushfar) <paul.smith@pushfar.com>
 * @copyright 2025 Pushfar (pushfar.com) all rights reserved
 * @license None
 */
export default class Eval {
	/**
	 * @public @static @method dataType
	 * @description Parse through CSV data passed in as a buffer, returning a normalizaed array of object key value pairs
	 * @param {Mixed} data The data sent in to execute as code, could be template literal string or a something more conrete like a number
	 * @param {Object} props The data to bind to the template literal execution so it can be accessed from the templat eliteral string as this.a and this.b from { a: 'aaa', b: 'bbb' }
	 * @param {Mixed} empty The value to return in the event of data being empty
	 * @return {Mixed} The result of the execution or the input data returned if not executable
	 */
	static execute(data: any, props: any, empty?: any) {
		// TODO: need to ensure regex clean this before running as function!

		try {
			// full match (dont force to string, return type)
			const evalFullMatch = data.toString().match(/^\$\{(([^.{}]+\.){2,}[^{}]+)\}$/s);
			if (evalFullMatch) return Function(`return ${evalFullMatch[1]};`).bind(props)() || (empty !== undefined ? empty : null);

			// partial match (force to string)
			const evalPartMatch = /\$\{(.+)\}/s.test(data.toString());
			if (evalPartMatch) return Function(`return \`${data.toString()}\`;`).bind(props)() || (empty !== undefined ? empty : null);
		} catch (error: any) {
			throw new Error(error.message + ' when evaluating the following >>> ' + data.toString());
		}

		return data || (empty !== undefined ? empty : null);
	}

	/**
	 * @public @static @method dataType
	 * @description Parse through CSV data passed in as a buffer, returning a normalizaed array of object key value pairs
	 * @param {Mixed} data The data sent in to execute as object or array or string code, could be template literal string or a something more conrete like a number
	 * @param {Object} props The data to bind to the template literal execution so it can be accessed from the templat eliteral string as this.a and this.b from { a: 'aaa', b: 'bbb' }
	 * @param {Mixed} empty The value to return in the event of data being empty
	 * @return {Mixed} The result of the execution or the input data returned if not executable
	 */
	static deepExecute<T>(data: any, props: any, empty?: any): T {
		if (typeof data !== 'object') return Eval.execute(data, props, empty);

		for (const key in data) data[key] = Eval.deepExecute(data[key], props, empty);

		return data;
	}
}
