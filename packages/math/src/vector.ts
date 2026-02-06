import type { GlobalPoint, LocalPoint, Vector } from "./types";

/**
 * Create a vector from the x and y coordinate components.
 *
 * @param x The X component of the vector
 * @param y The Y component of the vector
 * @param originX The X component of the origin (default 0)
 * @param originY The Y component of the origin (default 0)
 * @returns The constructed vector relative to the origin
 */
export function vector(
  x: number,
  y: number,
  originX: number = 0,
  originY: number = 0,
): Vector {
  return [x - originX, y - originY] as Vector;
}

/**
 * Create a vector from a point relative to an origin.
 *
 * @param p The point to convert into a vector
 * @param origin The origin point in the coordinate system
 * @param threshold Minimum magnitude squared below which the vector is considered zero
 * @param defaultValue The fallback vector if magnitude is below threshold
 * @returns The created vector from the point and origin, or the default value
 */
export function vectorFromPoint<Point extends GlobalPoint | LocalPoint>(
  p: Point,
  origin: Point = [0, 0] as Point,
  threshold?: number,
  defaultValue: Vector = [0, 1] as Vector,
): Vector {
  const vec = vector(p[0] - origin[0], p[1] - origin[1]);

  if (threshold && vectorMagnitudeSq(vec) < threshold * threshold) {
    return defaultValue;
  }

  return vec;
}

/**
 * Cross product of two 2D vectors (also known as the wedge product).
 * Returns the signed area of the parallelogram formed by the vectors.
 *
 * @param a The first vector operand
 * @param b The second vector operand
 * @returns The signed scalar cross product value
 */
export function vectorCross(a: Vector, b: Vector): number {
  return a[0] * b[1] - b[0] * a[1];
}

/**
 * Dot product of two vectors, computed as the sum of the
 * component-wise products.
 *
 * @param a The first vector operand
 * @param b The second vector operand
 * @returns The scalar dot product of the two vectors
 */
export function vectorDot(a: Vector, b: Vector) {
  return a[0] * b[0] + a[1] * b[1];
}

/**
 * Type guard to check if a value is a valid Vector.
 *
 * @param v The value to test
 * @returns TRUE if the value is a two-element numeric array
 */
export function isVector(v: unknown): v is Vector {
  return (
    Array.isArray(v) &&
    v.length === 2 &&
    typeof v[0] === "number" &&
    !isNaN(v[0]) &&
    typeof v[1] === "number" &&
    !isNaN(v[1])
  );
}

/**
 * Add two vectors by adding their coordinates.
 *
 * @param a One of the vectors to add
 * @param b The other vector to add
 * @returns The sum vector of the two provided vectors
 */
export function vectorAdd(a: Readonly<Vector>, b: Readonly<Vector>): Vector {
  return [a[0] + b[0], a[1] + b[1]] as Vector;
}

/**
 * Subtract one vector from another component-wise.
 *
 * @param start The vector to subtract from
 * @param end The vector to subtract
 * @returns The sum vector of the two provided vectors
 */
export function vectorSubtract(
  start: Readonly<Vector>,
  end: Readonly<Vector>,
): Vector {
  return [start[0] - end[0], start[1] - end[1]] as Vector;
}

/**
 * Scale vector by a scalar.
 *
 * @param v The vector to scale
 * @param scalar The scalar to multiply the vector components with
 * @returns The new scaled vector
 */
export function vectorScale(v: Vector, scalar: number): Vector {
  return vector(v[0] * scalar, v[1] * scalar);
}

/**
 * Calculates the sqare magnitude of a vector. Use this if you compare
 * magnitudes as it saves you an SQRT.
 *
 * @param v The vector to measure
 * @returns The scalar squared magnitude of the vector
 */
export function vectorMagnitudeSq(v: Vector) {
  return v[0] * v[0] + v[1] * v[1];
}

/**
 * Calculates the magnitude of a vector.
 *
 * @param v The vector to measure
 * @returns The scalar magnitude of the vector
 */
export function vectorMagnitude(v: Vector) {
  return Math.sqrt(vectorMagnitudeSq(v));
}

/**
 * Normalize the vector (i.e. make the vector magnitue equal 1).
 *
 * @param v The vector to normalize
 * @returns The new normalized vector
 */
export const vectorNormalize = (v: Vector): Vector => {
  const m = vectorMagnitude(v);

  if (m === 0) {
    return vector(0, 0);
  }

  return vector(v[0] / m, v[1] / m);
};

/**
 * Calculate the right-hand normal of the vector.
 */
export const vectorNormal = (v: Vector): Vector => vector(v[1], -v[0]);
