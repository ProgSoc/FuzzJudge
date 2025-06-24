export class RefillingTokenBucket<_Key> {
	public max: number;
	public refillIntervalSeconds: number;

	constructor(max: number, refillIntervalSeconds: number) {
		this.max = max;
		this.refillIntervalSeconds = refillIntervalSeconds;
	}

	private storage = new Map<_Key, RefillBucket>();

	public check(key: _Key, cost: number): boolean {
		const bucket = this.storage.get(key) ?? null;
		if (bucket === null) {
			return true;
		}
		const now = Date.now();
		const refill = Math.floor(
			(now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000),
		);
		if (refill > 0) {
			return Math.min(bucket.count + refill, this.max) >= cost;
		}
		return bucket.count >= cost;
	}

	public consume(key: _Key, cost: number): boolean {
		let bucket = this.storage.get(key) ?? null;
		const now = Date.now();
		if (bucket === null) {
			bucket = {
				count: this.max - cost,
				refilledAt: now,
			};
			this.storage.set(key, bucket);
			return true;
		}
		const refill = Math.floor(
			(now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000),
		);
		bucket.count = Math.min(bucket.count + refill, this.max);
		bucket.refilledAt = now;
		if (bucket.count < cost) {
			return false;
		}
		bucket.count -= cost;
		this.storage.set(key, bucket);
		return true;
	}
}

export class Throttler<_Key> {
	public timeoutSeconds: number[];

	private storage = new Map<_Key, ThrottlingCounter>();

	constructor(timeoutSeconds: number[]) {
		this.timeoutSeconds = timeoutSeconds;
	}

	public consume(key: _Key): boolean {
		let counter = this.storage.get(key) ?? null;
		const now = Date.now();
		if (counter === null) {
			counter = {
				timeout: 0,
				updatedAt: now,
			};
			this.storage.set(key, counter);
			return true;
		}

		const allowed =
			// biome-ignore lint/style/noNonNullAssertion: We are sure that timeoutSeconds[counter.timeout] exists
			now - counter.updatedAt >= this.timeoutSeconds[counter.timeout]! * 1000;
		if (!allowed) {
			return false;
		}
		counter.updatedAt = now;
		counter.timeout = Math.min(
			counter.timeout + 1,
			this.timeoutSeconds.length - 1,
		);
		this.storage.set(key, counter);
		return true;
	}

	public reset(key: _Key): void {
		this.storage.delete(key);
	}
}

/**
 * A token bucket that expires after a certain time.
 * It is useful for rate limiting actions that should not be allowed
 * to be performed more than a certain number of times in a given time frame.
 */
export class ExpiringTokenBucket<_Key> {
	public max: number;
	public expiresInSeconds: number;

	private storage = new Map<_Key, ExpiringBucket>();

	/**
	 * Creates a new ExpiringTokenBucket.
	 * @param max maximum number of tokens in the bucket
	 * @param expiresInSeconds time in seconds after which the bucket expires and is reset
	 */
	constructor(max: number, expiresInSeconds: number) {
		this.max = max;
		this.expiresInSeconds = expiresInSeconds;
	}

	/**
	 * Checks if the bucket has enough tokens to consume a certain cost.
	 * If the bucket does not exist, it is considered valid.
	 * If the bucket has expired, it is also considered valid.
	 * @param key unique identifier for the bucket
	 * @param cost number of tokens to check
	 * @returns true if the bucket has enough tokens, false otherwise
	 */
	public check(key: _Key, cost: number): boolean {
		const bucket = this.storage.get(key) ?? null;
		const now = Date.now();
		if (bucket === null) {
			return true;
		}
		if (now - bucket.createdAt >= this.expiresInSeconds * 1000) {
			return true;
		}
		return bucket.count >= cost;
	}

	/**
	 * Consumes a certain number of tokens from the bucket.
	 * If the bucket does not exist, it is created with the maximum number of tokens minus the cost.
	 * If the bucket has expired, it is reset to the maximum number of tokens.
	 * @param key unique identifier for the bucket
	 * @param cost number of tokens to consume
	 * @returns true if the tokens were successfully consumed, false otherwise
	 */
	public consume(key: _Key, cost: number): boolean {
		let bucket = this.storage.get(key) ?? null;
		const now = Date.now();
		if (bucket === null) {
			bucket = {
				count: this.max - cost,
				createdAt: now,
			};
			this.storage.set(key, bucket);
			return true;
		}
		if (now - bucket.createdAt >= this.expiresInSeconds * 1000) {
			bucket.count = this.max;
		}
		if (bucket.count < cost) {
			return false;
		}
		bucket.count -= cost;
		this.storage.set(key, bucket);
		return true;
	}

	/**
	 * Resets the bucket, removing it from storage.
	 * @param key unique identifier for the bucket
	 */
	public reset(key: _Key): void {
		this.storage.delete(key);
	}
}

interface RefillBucket {
	count: number;
	refilledAt: number;
}

interface ExpiringBucket {
	count: number;
	createdAt: number;
}

interface ThrottlingCounter {
	timeout: number;
	updatedAt: number;
}
