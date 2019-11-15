/** @jsx jsx */
import React from "react";
import * as CSS from "csstype";
import { jsx, keyframes } from "@emotion/core";
import { colors } from "../colors";

export type Size = "large" | "medium" | "small" | "xsmall" | "2xsmall";
export type Theme = "light" | "dark" | "grayscale";
interface Props {
  /**
   * Class name that will be applied to the svg
   */
  className?: string;

  /**
   * Theme for the spinner
   * @default "light"
   */
  theme?: Theme;

  /**
   * Size of the spinner
   * @default "medium"
   */
  size?: Size;
}

const SPIN = keyframes`
  0% { transform: rotate(0) }
  100% { transform: rotate(360deg) }
`;

const SIZE_MAP: Record<Size, number> = {
  large: 90,
  medium: 64,
  small: 48,
  xsmall: 32,
  "2xsmall": 16,
};

const THEME_MAP: Record<
  Theme,
  {
    orbitColor: CSS.ColorProperty;
    orbitOpacity: CSS.GlobalsNumber;
    asteroidColor: CSS.ColorProperty;
  }
> = {
  light: {
    orbitColor: colors.silver.light,
    orbitOpacity: 1,
    asteroidColor: colors.blue.base,
  },
  dark: {
    orbitColor: colors.white,
    orbitOpacity: 0.5,
    asteroidColor: colors.white,
  },
  grayscale: {
    orbitColor: colors.silver.darker,
    orbitOpacity: 1,
    asteroidColor: colors.grey.light,
  },
};

export const LoadingSpinner: React.FC<Props> = ({
  theme = "light",
  size = "medium",
  className,
  ...props
}) => {
  const { orbitColor, orbitOpacity, asteroidColor } = THEME_MAP[theme];

  const pixelSize = SIZE_MAP[size];

  const mountTime = React.useRef(Date.now());
  const mountDelay = -(mountTime.current % 540);

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      css={{
        width: pixelSize,
        height: pixelSize,
      }}
      {...props}
    >
      <circle
        strokeWidth="8"
        stroke={orbitColor}
        strokeOpacity={orbitOpacity}
        fill="transparent"
        r="41"
        cx="50"
        cy="50"
      />
      <g transform="translate(50 50)">
        <circle
          css={{
            animation: `${SPIN} 540ms linear infinite`,
            willChange: "transform",
            animationDelay: `${mountDelay}ms`,
          }}
          fill={asteroidColor}
          r="10"
          cx="40"
          cy="0"
        />
      </g>
    </svg>
  );
};
