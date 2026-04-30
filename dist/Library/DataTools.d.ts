/**
 * @module express-api/Library/DataTools
 * @class DataTools
 * @description Set of tools for playing with data
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export default class DataTools {
    /**
     * Parse a JSON string into a JavaScript object.
     * @method parseJson
     * @param raw The JSON string to parse
     * @return The parsed JavaScript object, or null if the string is not valid JSON
     */
    static parseJson<T = unknown>(raw: unknown): T | undefined;
    /**
     * Convert a Date object or string to a MySQL-compatible datetime string (YYYY-MM-DD HH:MM:SS UTC).
     * @method toDateTimeString
     * @param val The value to convert
     * @return The formatted string, or undefined if the value is null/undefined
     */
    static toDateTimeString(val: string | Date | null | undefined): string | undefined;
    /**
     * @public @static @name checkType
     * @description Check properties match in two objects, to ensure they have the same properties in both
     * @param data The data to check
     * @param {String} type The type to check against
     * @return {Boolean} True if data is of correct type
     */
    static checkType(data: any, type: string): boolean;
    /**
     * @public @static @name snakeToCamel
     * @description Turn a snake case string using underscores to camel case
     * @param {String} s The string for camelification
     * @return {String} The camelified string
     */
    static normalizeHeader(s: string): string;
    /**
     * @public @static @name snakeToCamel
     * @description Turn a snake case string using underscores to camel case
     * @param {String} s The string for camelification
     * @return {String} The camelified string
     */
    static snakeToCamel(s: string): string;
    /**
     * @public @static @name snakeToCamel
     * @description Turn a snake case string using underscores to camel case
     * @param {String} s The string for camelification
     * @return {String} The camelified string
     */
    static snakeToCapital(s: string): string;
    /**
     * @public @static @name camelToSnake
     * @description Turn a camel case string to snake case using underscores
     * @param {String} s The string for camelification
     * @return {String} The camelified string
     */
    static camelToSnake(s: string): string;
    /**
     * @public @static @name html
     * @description Create html template string and bind in any properties into the string
     * @param {...Mixed} properties The properties sent into to the method as an array
     * @return {String} The html string with properties spliced in using js template literals
     */
    static html(...properties: any[]): string;
    /**
     * @public @static @name text
     * @description Create text template string and bind in any properties into the string
     * @param {...Mixed} properties The properties sent into to the method as an array
     * @return {String} The text string with properties spliced in using js template literals
     */
    static text(...properties: any[]): string;
    /**
     * @public @static @name dataConditions
     * @description Get data conditions from headers, sort through headers to find any Data- prefixed headers for adjusting data out. if order? then convert name to column name
     * @param headers The headers as an object
     * @return {object} The dataConditions as an object
     */
    static dataConditions(headers: any): object;
}
//# sourceMappingURL=DataTools.d.ts.map