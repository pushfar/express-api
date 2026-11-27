import Core from '../../System/Core';
import RestError from '../../Error/Rest';
import { GlobalsType } from '../../Types/System';
// @ts-ignore - Optional peer dependency
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
// @ts-ignore - Optional peer dependency
import {
	CopyObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
// @ts-ignore - Optional peer dependency
import { createPresignedPost, type Conditions } from '@aws-sdk/s3-presigned-post';

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
	bucket = '';
	region = 'eu-west-1';
	endpoint = '';
	forcePathStyle = false;
	accessKeyId = '';
	secretAccessKey = '';
	sessionToken = '';

	/**
	 * @public @method constructor
	 * @description Store globals and let the bucket model fill the account.
	 * @param {GlobalsType} globals Application globals
	 */
	constructor(globals: T) {
		super(globals);
		this.init();
	}

	/**
	 * @public @method init
	 * @description Set the bucket and credentials. A bucket model overrides this.
	 * @return {void}
	 */
	init(): void {
		this.bucket = '';
		this.region = 'eu-west-1';
		this.endpoint = '';
		this.forcePathStyle = false;
		this.accessKeyId = '';
		this.secretAccessKey = '';
		this.sessionToken = '';
	}

	/**
	 * @public @method list
	 * @description List one page of object keys in this bucket.
	 * @param {String} [prefix] Optional key prefix
	 * @param {Number} [maxKeys=1000] Page size
	 * @return {Promise<S3Object[]>} Keys and sizes for this page
	 */
	async list(prefix?: string, maxKeys = 1000): Promise<S3Object[]> {
		const bucket = this.requireBucket();
		const res = await this.client().send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, MaxKeys: maxKeys }));

		return (res.Contents ?? []).flatMap((item) => {

			if (!item.Key) return [];

			return [{ key: item.Key, size: item.Size ?? 0 }];
		});
	}

	/**
	 * @public @method exists
	 * @description Whether an object key is present in this bucket.
	 * @param {String} key Object key
	 * @return {Promise<Boolean>} True when the object exists
	 */
	async exists(key: string): Promise<boolean> {
		const bucket = this.requireBucket();

		try {
			await this.client().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));

			return true;
		} catch (error: unknown) {

			if (this.isMissing(error)) return false;

			throw error;
		}
	}

	/**
	 * @public @method head
	 * @description Read an object's size and content type without downloading it.
	 * @param {String} key Object key
	 * @return {Promise<S3ObjectHead>} Size in bytes and the stored content type
	 */
	async head(key: string): Promise<S3ObjectHead> {
		const bucket = this.requireBucket();

		try {
			const res = await this.client().send(new HeadObjectCommand({ Bucket: bucket, Key: key }));

			return { size: res.ContentLength ?? 0, contentType: res.ContentType ?? '' };
		} catch (error: unknown) {

			if (this.isMissing(error)) throw new RestError('Object not found', 404);

			throw error;
		}
	}

	/**
	 * @public @method read
	 * @description Download an object's bytes.
	 * @param {String} key Object key
	 * @return {Promise<Buffer>} Object body
	 */
	async read(key: string): Promise<Buffer> {
		const bucket = this.requireBucket();

		try {
			const res = await this.client().send(new GetObjectCommand({ Bucket: bucket, Key: key }));

			if (!res.Body) throw new RestError('Object is empty', 404);

			const bytes = await res.Body.transformToByteArray();

			return Buffer.from(bytes);
		} catch (error: unknown) {

			if (error instanceof RestError) throw error;

			if (this.isMissing(error)) throw new RestError('Object not found', 404);

			throw error;
		}
	}

	/**
	 * @public @method write
	 * @description Upload bytes to an object key.
	 * @param {String} key Object key
	 * @param {Buffer} body Object bytes
	 * @param {String} [contentType] Optional content type
	 * @return {Promise<void>}
	 */
	async write(key: string, body: Buffer, contentType?: string): Promise<void> {
		const bucket = this.requireBucket();

		await this.client().send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: key,
				Body: body,
				ContentType: contentType,
			}),
		);
	}

	/**
	 * @public @method copyFrom
	 * @description Copy an object from another bucket into this bucket. S3 has no cross-bucket move.
	 * @param {String} key Key to write in this bucket
	 * @param {String} sourceBucket Bucket the object is copied from
	 * @param {String} sourceKey Key of the source object
	 * @return {Promise<void>}
	 */
	async copyFrom(key: string, sourceBucket: string, sourceKey: string): Promise<void> {
		const bucket = this.requireBucket();

		await this.client().send(
			new CopyObjectCommand({
				Bucket: bucket,
				Key: key,
				CopySource: this.copySource(sourceBucket, sourceKey),
			}),
		);
	}

	/**
	 * @public @method delete
	 * @description Delete one object. A missing key still succeeds.
	 * @param {String} key Object key
	 * @return {Promise<void>}
	 */
	async delete(key: string): Promise<void> {
		const bucket = this.requireBucket();

		await this.client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
	}

	/**
	 * @public @method presignPost
	 * @description Mint a presigned POST so a caller can upload straight to this key.
	 * @param {String} key Object key the upload must use
	 * @param {Object} [options] Optional content type, expiry in seconds, and maximum size in bytes
	 * @return {Promise<S3PresignedPost>} Form URL and fields for the POST
	 */
	async presignPost(key: string, options?: { contentType?: string; expiresIn?: number; maxBytes?: number }): Promise<S3PresignedPost> {
		const bucket = this.requireBucket();
		const fields: Record<string, string> = {};
		const conditions: Conditions[] = [];

		if (options?.contentType) {
			fields['Content-Type'] = options.contentType;
			conditions.push(['eq', '$Content-Type', options.contentType]);
		}

		if (options?.maxBytes != null) conditions.push(['content-length-range', 0, options.maxBytes]);

		const signed = await createPresignedPost(this.client(), {
			Bucket: bucket,
			Key: key,
			Expires: options?.expiresIn ?? 900,
			Fields: fields,
			Conditions: conditions.length ? conditions : undefined,
		});

		return { url: signed.url, fields: signed.fields };
	}

	/**
	 * @protected @method client
	 * @description Build a client from the bucket model's account. Keys when set, otherwise the default AWS chain.
	 * @return {S3Client} S3 client
	 */
	protected client(): S3Client {
		const endpoint = this.endpoint.trim();
		const accessKeyId = this.accessKeyId;
		const secretAccessKey = this.secretAccessKey;

		return new S3Client({
			region: this.region || 'eu-west-1',
			...(endpoint ? { endpoint } : {}),
			forcePathStyle: this.forcePathStyle || Boolean(endpoint),
			credentials:
				accessKeyId && secretAccessKey
					? { accessKeyId, secretAccessKey, ...(this.sessionToken ? { sessionToken: this.sessionToken } : {}) }
					: fromNodeProviderChain(),
		});
	}

	/**
	 * @protected @method requireBucket
	 * @description The bucket set by the account model.
	 * @return {String} Bucket name
	 */
	protected requireBucket(): string {

		if (!this.bucket) throw new RestError('S3 bucket is not configured', 500);

		return this.bucket;
	}

	/**
	 * @private @method copySource
	 * @description URL-encoded CopySource value for a bucket and key.
	 * @param {String} bucket Source bucket
	 * @param {String} key Source key
	 * @return {String} Encoded copy source
	 */
	private copySource(bucket: string, key: string): string {
		const encodedKey = key.split('/').map((part) => encodeURIComponent(part)).join('/');

		return `${encodeURIComponent(bucket)}/${encodedKey}`;
	}

	/**
	 * @private @method isMissing
	 * @description Whether an S3 error means the key is not there.
	 * @param {unknown} error Thrown client error
	 * @return {Boolean} True for a missing object
	 */
	private isMissing(error: unknown): boolean {

		if (!error || typeof error !== 'object') return false;

		const named = error as { name?: string; $metadata?: { httpStatusCode?: number } };

		return named.name === 'NotFound' || named.name === 'NoSuchKey' || named.$metadata?.httpStatusCode === 404;
	}
}
