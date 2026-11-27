import Core from '../../System/Core.js';
import { GlobalsType } from '../../Types/System.js';
import { S3Client } from '@aws-sdk/client-s3';
export type S3Object = {
    key: string;
    size: number;
};
export type S3ObjectHead = {
    size: number;
    contentType: string;
};
export type S3PresignedPost = {
    url: string;
    fields: Record<string, string>;
};
/**
 * @module express-api/Base/Model/S3
 * @class S3
 * @extends Core
 * @description Bucket-agnostic S3 (or MinIO) access. A bucket model sets the bucket and credentials in init.
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export default class S3<T extends GlobalsType> extends Core<T> {
    bucket: string;
    region: string;
    endpoint: string;
    forcePathStyle: boolean;
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    /**
     * @public @method constructor
     * @description Store globals and let the bucket model fill the account.
     * @param {GlobalsType} globals Application globals
     */
    constructor(globals: T);
    /**
     * @public @method init
     * @description Set the bucket and credentials. A bucket model overrides this.
     * @return {void}
     */
    init(): void;
    /**
     * @public @method list
     * @description List one page of object keys in this bucket.
     * @param {String} [prefix] Optional key prefix
     * @param {Number} [maxKeys=1000] Page size
     * @return {Promise<S3Object[]>} Keys and sizes for this page
     */
    list(prefix?: string, maxKeys?: number): Promise<S3Object[]>;
    /**
     * @public @method exists
     * @description Whether an object key is present in this bucket.
     * @param {String} key Object key
     * @return {Promise<Boolean>} True when the object exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * @public @method head
     * @description Read an object's size and content type without downloading it.
     * @param {String} key Object key
     * @return {Promise<S3ObjectHead>} Size in bytes and the stored content type
     */
    head(key: string): Promise<S3ObjectHead>;
    /**
     * @public @method read
     * @description Download an object's bytes.
     * @param {String} key Object key
     * @return {Promise<Buffer>} Object body
     */
    read(key: string): Promise<Buffer>;
    /**
     * @public @method write
     * @description Upload bytes to an object key.
     * @param {String} key Object key
     * @param {Buffer} body Object bytes
     * @param {String} [contentType] Optional content type
     * @return {Promise<void>}
     */
    write(key: string, body: Buffer, contentType?: string): Promise<void>;
    /**
     * @public @method copyFrom
     * @description Copy an object from another bucket into this bucket. S3 has no cross-bucket move.
     * @param {String} key Key to write in this bucket
     * @param {String} sourceBucket Bucket the object is copied from
     * @param {String} sourceKey Key of the source object
     * @return {Promise<void>}
     */
    copyFrom(key: string, sourceBucket: string, sourceKey: string): Promise<void>;
    /**
     * @public @method delete
     * @description Delete one object. A missing key still succeeds.
     * @param {String} key Object key
     * @return {Promise<void>}
     */
    delete(key: string): Promise<void>;
    /**
     * @public @method presignPost
     * @description Mint a presigned POST so a caller can upload straight to this key.
     * @param {String} key Object key the upload must use
     * @param {Object} [options] Optional content type, expiry in seconds, and maximum size in bytes
     * @return {Promise<S3PresignedPost>} Form URL and fields for the POST
     */
    presignPost(key: string, options?: {
        contentType?: string;
        expiresIn?: number;
        maxBytes?: number;
    }): Promise<S3PresignedPost>;
    /**
     * @protected @method client
     * @description Build a client from the bucket model's account. Keys when set, otherwise the default AWS chain.
     * @return {S3Client} S3 client
     */
    protected client(): S3Client;
    /**
     * @protected @method requireBucket
     * @description The bucket set by the account model.
     * @return {String} Bucket name
     */
    protected requireBucket(): string;
    /**
     * @private @method copySource
     * @description URL-encoded CopySource value for a bucket and key.
     * @param {String} bucket Source bucket
     * @param {String} key Source key
     * @return {String} Encoded copy source
     */
    private copySource;
    /**
     * @private @method isMissing
     * @description Whether an S3 error means the key is not there.
     * @param {unknown} error Thrown client error
     * @return {Boolean} True for a missing object
     */
    private isMissing;
}
//# sourceMappingURL=S3.d.ts.map