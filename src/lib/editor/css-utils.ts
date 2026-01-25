import type React from "react";

const UNIT_LESS: Record<string, true> = {
  opacity: true,
  zIndex: true,
  fontWeight: true,
  lineHeight: true,
  flex: true,
  order: true,
};

const toKebab = (value: string) =>
  value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

const toCamel = (value: string) =>
  value.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());

export const styleToCssText = (
  styles: React.CSSProperties | undefined
): string => {
  if (!styles) return "";

  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const cssKey = toKebab(key);
      if (typeof value === "number") {
        const cssValue = UNIT_LESS[key] ? String(value) : `${value}px`;
        return `${cssKey}: ${cssValue};`;
      }
      return `${cssKey}: ${value};`;
    })
    .join("\n");
};

export const cssTextToStyle = (cssText: string): React.CSSProperties => {
  const styles: React.CSSProperties = {};
  const lines = cssText
    .split(";")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const property = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    if (!property || rawValue === "") continue;

    const key = toCamel(property);
    styles[key as keyof React.CSSProperties] = rawValue;
  }

  return styles;
};
