import {
  curvePointDistance,
  distanceToLineSegment,
  pointRotateRads,
} from "@excalidraw/math";

import { ellipse, ellipseDistanceFromPoint } from "@excalidraw/math/ellipse";

import type { GlobalPoint, Radians } from "@excalidraw/math";

import {
  deconstructDiamondElement,
  deconstructLinearOrFreeDrawElement,
  deconstructRectanguloidElement,
} from "./utils";

import { elementCenterPoint } from "./bounds";

import type {
  ElementsMap,
  ExcalidrawDiamondElement,
  ExcalidrawElement,
  ExcalidrawEllipseElement,
  ExcalidrawFreeDrawElement,
  ExcalidrawLinearElement,
  ExcalidrawRectanguloidElement,
} from "./types";

/**
 * Returns the minimum distance from a global point to the nearest
 * edge of the given element, dispatching to shape-specific handlers.
 */
export const distanceToElement = (
  element: ExcalidrawElement,
  elementsMap: ElementsMap,
  p: GlobalPoint,
): number => {
  switch (element.type) {
    case "selection":
    case "rectangle":
    case "image":
    case "text":
    case "iframe":
    case "embeddable":
    case "frame":
    case "magicframe":
      return distanceToRectanguloidElement(element, elementsMap, p);
    case "diamond":
      return distanceToDiamondElement(element, elementsMap, p);
    case "ellipse":
      return distanceToEllipseElement(element, elementsMap, p);
    case "line":
    case "arrow":
    case "freedraw":
      return distanceToLinearOrFreeDraElement(element, p);
  }
};

/**
 * Computes the minimum distance from a point to the outline of a
 * rectangular-shaped element, accounting for rounded corners and rotation.
 *
 * @param element The rectanguloid element to measure against
 * @param elementsMap Map of all elements for resolving center points
 * @param p The reference point in global coordinates
 * @returns The minimum euclidean distance to the element outline
 */
const distanceToRectanguloidElement = (
  element: ExcalidrawRectanguloidElement,
  elementsMap: ElementsMap,
  p: GlobalPoint,
) => {
  const center = elementCenterPoint(element, elementsMap);
  // Rotate the point by the inverse angle to work in axis-aligned space
  const rotatedPoint = pointRotateRads(p, center, -element.angle as Radians);

  // Decompose into line segments (sides) and curves (rounded corners)
  const [sides, corners] = deconstructRectanguloidElement(element);

  return Math.min(
    ...sides.map((s) => distanceToLineSegment(rotatedPoint, s)),
    ...corners
      .map((a) => curvePointDistance(a, rotatedPoint))
      .filter((d): d is number => d !== null),
  );
};

/**
 * Computes the minimum distance from a point to the outline of a
 * diamond element, accounting for rounded corners and rotation.
 *
 * @param element The diamond element to measure against
 * @param elementsMap Map of all elements for resolving center points
 * @param p The reference point in global coordinates
 * @returns The minimum euclidean distance to the diamond outline
 */
const distanceToDiamondElement = (
  element: ExcalidrawDiamondElement,
  elementsMap: ElementsMap,
  p: GlobalPoint,
): number => {
  const center = elementCenterPoint(element, elementsMap);

  // Rotate the point to axis-aligned space for simpler distance calculation
  const rotatedPoint = pointRotateRads(p, center, -element.angle as Radians);

  const [sides, curves] = deconstructDiamondElement(element);

  return Math.min(
    ...sides.map((s) => distanceToLineSegment(rotatedPoint, s)),
    ...curves
      .map((a) => curvePointDistance(a, rotatedPoint))
      .filter((d): d is number => d !== null),
  );
};

/**
 * Computes the minimum distance from a point to the outline of an
 * ellipse element, accounting for rotation.
 *
 * @param element The ellipse element to measure against
 * @param elementsMap Map of all elements for resolving center points
 * @param p The reference point in global coordinates
 * @returns The minimum euclidean distance to the ellipse outline
 */
const distanceToEllipseElement = (
  element: ExcalidrawEllipseElement,
  elementsMap: ElementsMap,
  p: GlobalPoint,
): number => {
  const center = elementCenterPoint(element, elementsMap);
  return ellipseDistanceFromPoint(
    // Rotate the point to axis-aligned space instead of rotating the ellipse
    pointRotateRads(p, center, -element.angle as Radians),
    ellipse(center, element.width / 2, element.height / 2),
  );
};

const distanceToLinearOrFreeDraElement = (
  element: ExcalidrawLinearElement | ExcalidrawFreeDrawElement,
  p: GlobalPoint,
) => {
  const [lines, curves] = deconstructLinearOrFreeDrawElement(element);
  return Math.min(
    ...lines.map((s) => distanceToLineSegment(p, s)),
    ...curves.map((a) => curvePointDistance(a, p)),
  );
};
