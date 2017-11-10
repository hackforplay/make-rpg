class Range extends Array {
	constructor(...args) {
		super(...args);
	}
	get min() { return this[0]; }
	get max() { return this[this.length - 1]; }
	get range() { return [this.min, this.max] };
}

export function step(n) {
	return new Range(...Array.from({ length: n }).map((_, i) => i));
}

export function range(start, count) {
	return step(count).map((value) => start + value);
}

export function between(value, min, max) {
	return value >= min && value <= max;
}

export function clamp(value, min, max) {
	return Math.max(min, Math.min(max, value));
};
