/**
 * Serializes non-plain JavaScript objects (non-POJOs) by creating a deep clone using `structuredClone`.
 * This is useful for ensuring that objects passed between server and client are safely cloned,
 * avoiding issues with references or unserializable properties.
 *
 * @template T - The type of the object to serialize.
 * @param value - The object or null to serialize.
 * @returns A deep-cloned copy of the input value.
 */
export function serializeNonPOJOs<T extends object | null>(value: T): T {
	return structuredClone(value);
}
