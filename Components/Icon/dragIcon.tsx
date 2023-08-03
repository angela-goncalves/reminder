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
      viewBox="0 0 182 138"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onPointerDown={onPointerDown}>
      <path
        d="M5 54H176.026"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M5 83H176.026"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path d="M91 0L121.311 33H60.6891L91 0Z" fill={color} />
      <path d="M91 0L121.311 33H60.6891L91 0Z" fill={color} />
      <path d="M91 0L121.311 33H60.6891L91 0Z" fill={color} />
      <path d="M91 138L60.6891 105H121.311L91 138Z" fill={color} />
    </svg>
  );
}
