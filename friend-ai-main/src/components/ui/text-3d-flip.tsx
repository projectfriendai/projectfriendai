"use client";

import * as React from "react";
import { motion, type Transition } from "motion/react";

type RotateDirection = "top" | "bottom" | "left" | "right";
type StaggerFrom = "first" | "last" | "center";

interface Text3DFlipProps {
  children: string;
  className?: string;
  textClassName?: string;
  flipTextClassName?: string;
  rotateDirection?: RotateDirection;
  staggerDuration?: number;
  staggerFrom?: StaggerFrom;
  transition?: Transition;
}

function getRotation(direction: RotateDirection) {
  switch (direction) {
    case "top":
      return { initial: { rotateX: 90 }, hover: { rotateX: 0 } };
    case "bottom":
      return { initial: { rotateX: -90 }, hover: { rotateX: 0 } };
    case "left":
      return { initial: { rotateY: -90 }, hover: { rotateY: 0 } };
    case "right":
      return { initial: { rotateY: 90 }, hover: { rotateY: 0 } };
  }
}

function getTransformOrigin(direction: RotateDirection) {
  switch (direction) {
    case "top":
      return "bottom center";
    case "bottom":
      return "top center";
    case "left":
      return "center right";
    case "right":
      return "center left";
  }
}

function getInitialTranslate(direction: RotateDirection) {
  switch (direction) {
    case "top":
      return { y: "-100%" };
    case "bottom":
      return { y: "100%" };
    case "left":
      return { x: "-100%" };
    case "right":
      return { x: "100%" };
  }
}

function getStaggerDelay(
  index: number,
  total: number,
  staggerFrom: StaggerFrom,
  staggerDuration: number
) {
  switch (staggerFrom) {
    case "first":
      return index * staggerDuration;
    case "last":
      return (total - 1 - index) * staggerDuration;
    case "center": {
      const center = (total - 1) / 2;
      return Math.abs(index - center) * staggerDuration;
    }
  }
}

export function Text3DFlip({
  children,
  className = "",
  textClassName = "",
  flipTextClassName = "",
  rotateDirection = "top",
  staggerDuration = 0.03,
  staggerFrom = "first",
  transition = { type: "spring", damping: 25, stiffness: 160 },
}: Text3DFlipProps) {
  const chars = children.split("");
  const rotation = getRotation(rotateDirection);
  const transformOrigin = getTransformOrigin(rotateDirection);
  const initialTranslate = getInitialTranslate(rotateDirection);

  return (
    <motion.span
      className={`inline-flex cursor-pointer ${className}`}
      initial="idle"
      whileHover="hover"
      style={{ perspective: "600px" }}
    >
      {chars.map((char, i) => (
        <span
          key={i}
          className="relative inline-block"
          style={{ lineHeight: "1em" }}
        >
          {/* Original text */}
          <motion.span
            className={`inline-block ${textClassName}`}
            variants={{
              idle: { rotateX: 0, rotateY: 0 },
              hover: {
                ...(rotateDirection === "top" ? { rotateX: -90 } : {}),
                ...(rotateDirection === "bottom" ? { rotateX: 90 } : {}),
                ...(rotateDirection === "left" ? { rotateY: 90 } : {}),
                ...(rotateDirection === "right" ? { rotateY: -90 } : {}),
              },
            }}
            transition={{
              ...transition,
              delay: getStaggerDelay(i, chars.length, staggerFrom, staggerDuration),
            }}
            style={{
              transformOrigin,
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>

          {/* Flip text */}
          <motion.span
            className={`absolute left-0 top-0 inline-block ${flipTextClassName}`}
            variants={{
              idle: {
                ...rotation.initial,
                ...initialTranslate,
              },
              hover: {
                rotateX: 0,
                rotateY: 0,
                x: 0,
                y: 0,
              },
            }}
            transition={{
              ...transition,
              delay: getStaggerDelay(i, chars.length, staggerFrom, staggerDuration),
            }}
            style={{
              transformOrigin,
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
            aria-hidden
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
