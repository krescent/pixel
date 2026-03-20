import { PERLER_COLORS } from "./perlerColors";
import type { PerlerColor } from "./perlerColors";

const WEIGHT_R = 0.3;
const WEIGHT_G = 0.59;
const WEIGHT_B = 0.11;

const TRANSPARENT_THRESHOLD = 10;

export function findClosestPerlerColor(r: number, g: number, b: number, a: number = 255): PerlerColor | null {
  if (a < TRANSPARENT_THRESHOLD) {
    return null;
  }
  
  let closestColor = PERLER_COLORS[0];
  let minDistance = Infinity;

  for (const color of PERLER_COLORS) {
    const distance = Math.sqrt(
      WEIGHT_R * Math.pow(color.rgb[0] - r, 2) +
      WEIGHT_G * Math.pow(color.rgb[1] - g, 2) +
      WEIGHT_B * Math.pow(color.rgb[2] - b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return closestColor;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}
