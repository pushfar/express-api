/**
 * @namespace API/Library
 * @class FileTools
 * @description Set of tools for playing with data
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 * @license Unlicensed
 */
export default class FileTools {
    /**
     * @public @static @async streamToText
     * @description Take in a stream and return text string output in UTF8
     * @param stream the readable tream to get th edata from
     * @returns The text string from the stream
     */
    static async streamToText(stream) {
        const chunks = [];
        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
            stream.on('error', (err) => reject(err));
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        });
    }
}
//# sourceMappingURL=FileTools.js.map