import React from "react";
interface IDragIcon {
  width: string;
  height: string;
  darkMode: boolean;
  onPointerDown?: (e: any) => void;
}

export default function DragIcon({
  width,
  height,
  darkMode,
  onPointerDown,
}: IDragIcon) {
  const color = darkMode ? "black" : "white";
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 168 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onPointerDown={onPointerDown}>
      <path
        d="M5 5L163 5"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M5 54L163 55"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
