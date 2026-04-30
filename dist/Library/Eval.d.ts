/**
 * @namespace API/Library
 * @class Eval
 * @description Set of tools for playing with data
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
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
    static execute(data: any, props: any, empty?: any): any;
    /**
     * @public @static @method dataType
     * @description Parse through CSV data passed in as a buffer, returning a normalizaed array of object key value pairs
     * @param {Mixed} data The data sent in to execute as object or array or string code, could be template literal string or a something more conrete like a number
     * @param {Object} props The data to bind to the template literal execution so it can be accessed from the templat eliteral string as this.a and this.b from { a: 'aaa', b: 'bbb' }
     * @param {Mixed} empty The value to return in the event of data being empty
     * @return {Mixed} The result of the execution or the input data returned if not executable
     */
    static deepExecute<T>(data: any, props: any, empty?: any): T;
}
//# sourceMappingURL=Eval.d.ts.map