import { colors, ShadedColor } from "../colors";
import * as CSS from "csstype";
import { base } from "../typography";
import { ClassNames } from "@emotion/core";
import { getOffsetInPalette } from "../colors/utils/getOffsetInPalette";
import tinycolor from "tinycolor2";
import React from "react";
import { LoadingSpinner } from "../Loaders";
import { assertUnreachable } from "../shared/assertUnreachable";
import { useFocusRing, FocusRingProps } from "@react-aria/focus";
import { mergeProps } from "@react-aria/utils";
import { ButtonIcon } from "./button/ButtonIcon";
import { useButton } from "@react-aria/button";
import { useHover, HoverProps } from "@react-aria/interactions";
import { AriaButtonProps } from "@react-types/button";
import { useRefToRefObject } from "../shared/useRefToRefObject";

type TLength = string | 0 | number;

/**
 * Save a default color so we can check if we used the default or not. The
 * default color has a few special properties.
 */
const defaultColor = colors.silver.light;

/**
 * Get the button's text color
 */
function getTextColor({
  color,
  feel,
  theme,
  mode,
}: {
  color: NonNullable<Props["color"]>;
  feel: NonNullable<Props["feel"]>;
  theme: NonNullable<Props["theme"]>;
  mode?: CSS.SimplePseudos;
}): CSS.ColorProperty | undefined {
  // Text color will always be the same for secondary buttons
  if (color === colors.white) {
    return colors.grey.darker;
  }

  switch (feel) {
    case "raised":
      // Set the base (meaning no pseudo-selectors) text color for raised
      // buttons. Otherwise return `undefined` to not change the color.
      //
      // We have some special logic for the raised color; set the text color to
      // be what is most readable between white and the default text color and
      // the _hover_ color's background. This is overrideable by the user, but
      // it shouldn't need to be.
      return !mode
        ? tinycolor
            .mostReadable(
              getHoverBackgroundColor({ color, feel, theme }),
              [colors.white, colors.grey.darker],
              {
                level: "AA",
                size: "small",
              }
            )
            .toString()
        : undefined;
    case "flat":
      if (color === defaultColor) {
        return theme === "dark" ? colors.grey.light : colors.grey.darker;
      }

      // We have a custom color and we're in dark mode, lighten the base and
      // focused colors 1 shade.
      if (theme === "dark" && (!mode || mode === ":focus")) {
        return getOffsetInPalette(1, "lighter", color);
      }

      return color;
    /* istanbul ignore next */
    default:
      throw assertUnreachable(feel);
  }
}

/**
 * Get the button's height
 */
function getHeight({
  size,
}: {
  size: NonNullable<Props["size"]>;
}): CSS.HeightProperty<TLength> {
  switch (size) {
    case "small":
      return 28;
    case "default":
      return 36;
    case "large":
      return 42;
    /* istanbul ignore next */
    default:
      throw assertUnreachable(size);
  }
}

/**
 * Get the hover background color
 */
function getHoverBackgroundColor({
  color,
  feel,
  theme,
}: {
  color: NonNullable<Props["color"]>;
  feel: NonNullable<Props["feel"]>;
  theme: NonNullable<Props["theme"]>;
}): CSS.BackgroundColorProperty {
  if (color === colors.white) {
    // Special case for secondary buttons
    return colors.silver.light;
  }

  switch (feel) {
    case "flat":
      // Hardcode if we're using the default color (special case), otherwise get
      // the next lightest color.
      if (color === defaultColor) {
        return theme === "light" ? colors.silver.light : colors.grey.dark;
      }

      return getOffsetInPalette(Infinity, "lighter", color);
    case "raised":
      // One shade darker
      return getOffsetInPalette(1, "darker", color);
    /* istanbul ignore next */
    default:
      throw assertUnreachable(feel);
  }
}

// Types that could use some improvement:
// * Don't allow `children` and `icon` to be missing
// * Don't allow `children` when `FAB`
//
// I was able to get guarantees to work, but only with very cryptic errors. I
// decided it'd be best, for the time being, to `throw` if we use things
// incorrectly.
interface Props
  extends AriaButtonProps,
    FocusRingProps,
    HoverProps,
    Partial<Pick<React.HTMLAttributes<HTMLElement>, "className" | "style">> {
  /**
   * Override the the default element used to render a button
   *
   * All props provided will be merged with props that `Button` adds, including
   * `className`s being merged.
   *
   * @default <button />
   */
  as?: React.ReactElement;

  /**
   * Base color to calculate all other colors with
   *
   * This has a special meaning for buttons with a "flat" feel; this will change
   * the text color as well as the background colors.
   *
   * Pass `colors.white` to treat this button as a secondary button
   *
   * @default colors.silver.light
   */
  color?: ShadedColor | typeof colors["white"];

  /**
   * @deprecated Use `isDisabled` to be compatible with `react-spectrum`
   *
   * If the button will appear and behave disabled.
   *
   * This prop is explicitly here and not granted by extension because it
   * doesn't exist on HTMLAttributes, but is essential to rendering correctly.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Icon to use at the end of a button
   *
   * The size of icons will be automatically determined, but can be overriden
   */
  endIcon?: React.ReactElement;

  /**
   * Which feel to display
   *
   * The options are as follows:
   *
   * - `"raised"` (default): A button with a border and a background
   * - `"flat"`: No background or border
   *
   * @default "raised"
   */
  feel?: "raised" | "flat";

  /**
   * Either an icon to show to the left of the button text, or on it's own
   */
  icon?: React.ReactElement;

  /**
   * Show a loading spinner in place of the original icon on this button
   *
   * Automatically disables the button as well
   */
  loading?: boolean;

  /**
   * @deprecated use `onPress` instead
   *
   * Provided for reverse compatability
   */
  onClick?: AriaButtonProps["onPress"];

  /**
   * Size of the button
   *
   * @default "default"
   */
  size?: "default" | "small" | "large";

  /**
   * Theme to display the button
   *
   * Different themes have different box-shadows. Right now we have these
   * options, but this may expand in the future:
   *
   * - `"light"` (default)
   * - `"dark"`
   *
   * @default "light"
   */
  theme?: "light" | "dark";

  /**
   * The type of the button
   *
   * This isn't included in HTMLAttributes but it's a very common property
   * passed to a button, so we're including it here. If you pass `type` prop
   * when using any element besides `<button>` you will get React warnings about
   * passing unrecognized props to an element.
   */
  type?: "button" | "submit" | "reset" | undefined;

  /**
   * Button variants
   *
   * The options are as follows:
   *
   * - `undefined` (default): A button with text and an optional icon
   * - `"fab"`: Floating action button
   *
   *   You must include an `icon` prop and you must _not_ include a `children`
   *   prop for a floating action button.
   *
   *   _Note: this is not type checked; it will cause a runtime error_
   */
  variant?: "fab";
}

/**
 * Style system for Space Kit buttons
 *
 * This is intended to be used as an abstraction for your project's style guide.
 *
 * @see https://zpl.io/amdN6Pr
 */
export const Button = React.forwardRef<HTMLElement, Props>(
  (
    {
      as = <button />,
      children,
      color = defaultColor,
      variant,
      endIcon,
      feel = "raised",
      icon: iconProp,
      loading,
      onClick,
      size = "default",
      theme = "light",
      ...passthroughProps
    },
    ref
  ) => {
    const {
      isFocusVisible: useFocusRingIsFocusVisible,
      focusProps,
    } = useFocusRing(passthroughProps);

    /**
     * Indicates that the component should show a focus ring
     *
     * Handles the special case of this component being rendered with
     * `data-force-focus-state`
     */
    const isFocusVisible =
      useFocusRingIsFocusVisible ||
      !!(passthroughProps as any)["data-force-focus-state"];

    const { hoverProps, isHovered: useHoverIsHovered } = useHover(
      passthroughProps
    );
    /**
     * Indicates if the component is being hovered on
     *
     * Handles the special case where we pass `data-force-hover-state`
     */
    const isHovered =
      useHoverIsHovered ||
      !!(passthroughProps as any)["data-force-hover-state"];

    // Combine `passthroughProps` and `as.props`. This includes:
    // * Replace `disabled` with `isDisabled` for reverse compatability
    // * Replace `onClick` with `onPress` for reverse compatability
    const props = mergeProps(passthroughProps, as.props);
    props.isDisabled =
      loading ||
      (Object.prototype.hasOwnProperty.call(props, "isDisabled")
        ? props.isDisabled
        : props.disabled);
    delete props.disabled;
    // Stack the three click handlers into one
    props.onPress = mergeProps(
      { onPress: as.props.onClick },
      { onPress: onClick },
      { onPress: passthroughProps.onPress }
    ).onPress;
    delete props.onClick;

    /**
     * `ref` can be a function ref or a `RefObject`; `useButton` requires a
     * `RefObject` so we must convert a ref function to a `RefObject`.
     */
    const refObject = useRefToRefObject(ref);
    const { buttonProps, isPressed: useButtonIsPressed } = useButton(
      {
        ...props,
        elementType: as.type,
      },
      refObject
    );

    /**
     * Indicates if the button is being pressed
     *
     * Handles special cases of `aria-expanded=true` and
     * `data-force-active-state`
     */
    const isPressed =
      useButtonIsPressed ||
      props["data-force-active-state"] ||
      props["aria-expanded"] === "true";

    const icon = loading ? (
      <LoadingSpinner
        size="2xsmall"
        theme={theme === "light" ? "grayscale" : "dark"}
      />
    ) : (
      iconProp
    );

    /**
     * Icon size in pixels
     *
     * This is stored so we can use the same value for `height` and `width`
     */
    const iconSize =
      size === "small"
        ? 12
        : size === "large"
        ? 24
        : size === "default"
        ? 16
        : assertUnreachable(size);

    const iconOnly = !children;

    if (variant === "fab") {
      if (!icon) {
        throw new TypeError("FAB buttons are required to have an `icon`");
      } else if (children) {
        throw new TypeError("FAB buttons cannot have children, only an `icon`");
      }
    }

    return (
      <ClassNames>
        {({ cx, css }) => {
          const propsToPass = {
            ...mergeProps(focusProps, buttonProps, hoverProps),
            style: props.style,
            ref,
            className: cx(
              css([
                {
                  // We need to also set the `:hover` on `:disabled` so it has a
                  // higher specificity than any `:hover` classes passed in. This
                  // also means that both of these need to be overriden if we want
                  // to use a custom disabled color.
                  "&[disabled], &[disabled]:hover": {
                    backgroundColor:
                      feel === "flat"
                        ? "transparent"
                        : theme === "light"
                        ? colors.silver.light
                        : colors.grey.dark,
                    boxShadow: "none",
                    color:
                      feel === "flat" && theme === "dark"
                        ? colors.grey.dark
                        : colors.grey.light,
                  },

                  backgroundColor:
                    color === colors.white
                      ? colors.white
                      : feel === "raised"
                      ? color
                      : "transparent",

                  borderRadius: variant === "fab" ? "100%" : 4,

                  borderWidth: 0,
                  ...(feel !== "flat" && {
                    boxShadow:
                      theme === "light"
                        ? "0 1px 4px 0 rgba(18, 21, 26, 0.04), inset 0 0 0 1px rgba(18, 21, 26, 0.2), inset 0 -1px 0 0 rgba(18, 21, 26, 0.05)"
                        : "0 0 0 1px rgba(18, 21, 26, 0.2), 0 1px 4px 0 rgba(18, 21, 26, 0.08), 0 1px 0 0 rgba(18, 21, 26, 0.05)",
                  }),

                  color: getTextColor({ color, feel, theme }),

                  cursor: props.isDisabled ? "default" : "pointer",

                  // Vertically center children
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",

                  height: getHeight({ size }),

                  minWidth: iconOnly
                    ? size === "small"
                      ? 28
                      : size === "default"
                      ? 36
                      : size === "large"
                      ? 42
                      : assertUnreachable(size)
                    : endIcon
                    ? 0
                    : size === "small"
                    ? 76
                    : size === "default"
                    ? 100
                    : size === "large"
                    ? 112
                    : assertUnreachable(size),

                  // We have to set the Y padding because browsers (at least Chrome) has
                  // a non-symmetrical vertical padding applied by default.
                  paddingLeft: iconOnly ? 0 : 12,
                  paddingRight: iconOnly ? 0 : endIcon ? 8 : 12,

                  ...(size === "small"
                    ? base.small
                    : size === "large"
                    ? base.large
                    : base.base),

                  fontWeight: 600,

                  // Disable the outline because we're setting a custom `:active` style
                  outline: 0,

                  textDecoration: "none",

                  whiteSpace: "nowrap",
                },

                isPressed &&
                  css({
                    ...(getTextColor({
                      color,
                      feel,
                      theme,
                      mode: ":hover",
                    }) && {
                      color: getTextColor({
                        color,
                        feel,
                        theme,
                        mode: ":active",
                      }),
                    }),

                    backgroundColor:
                      color === colors.white
                        ? colors.white
                        : feel === "raised"
                        ? color
                        : color === defaultColor
                        ? theme === "dark"
                          ? colors.grey.darker
                          : colors.silver.base
                        : getOffsetInPalette(2, "lighter", color),

                    // The `box-shadow` properties are copied directly from Zeplin
                    boxShadow:
                      feel !== "flat"
                        ? theme === "light"
                          ? "inset 0 0 0 1px rgba(18, 21, 26, 0.2), inset 0 -1px 0 0 rgba(18, 21, 26, 0.05), inset 0 2px 2px 0 rgba(18, 21, 26, 0.12)"
                          : "0 0 0 1px rgba(18, 21, 26, 0.2), 0 1px 4px 0 rgba(18, 21, 26, 0.08), 0 -1px 0 0 rgba(18, 21, 26, 0.16), inset 0 1px 2px 0 rgba(18, 21, 26, 0.42)"
                        : "none",
                    outline: "0",
                  }),

                // We use `isPressed` now to handle the `:active` style, so we
                // must not render the `:hover` style when `isPressed` is
                // `true`.
                !props.isDisabled &&
                  !isPressed &&
                  isHovered &&
                  css({
                    backgroundColor: getHoverBackgroundColor({
                      color,
                      feel,
                      theme,
                    }),
                    color: getTextColor({
                      color,
                      feel,
                      theme,
                      mode: ":hover",
                    }),
                    ...(feel !== "flat" && {
                      // The `box-shadow` property is copied directly from Zeplin
                      boxShadow:
                        theme === "light"
                          ? "0 5px 10px 0 rgba(18, 21, 26, 0.08), inset 0 0 0 1px rgba(18, 21, 26, 0.2), inset 0 -1px 0 0 rgba(18, 21, 26, 0.05)"
                          : "0 0 0 1px rgba(18, 21, 26, 0.2), 0 5px 10px 0 rgba(18, 21, 26, 0.12), 0 1px 0 0 rgba(18, 21, 26, 0.05)",
                    }),
                  }),

                isFocusVisible &&
                  css({
                    ...(feel === "flat" && {
                      backgroundColor:
                        theme === "light" ? colors.white : "#000",
                      color:
                        theme === "light"
                          ? colors.blue.base
                          : colors.blue.light,
                    }),
                    // The `box-shadow` property is copied directly from Zeplin for the
                    // light theme. For the dark theme we use a variant of the color to
                    // make the borders sharp.
                    boxShadow: `0 1px 4px 0 rgba(18, 21, 26, 0.08), 0 0 0 2px ${
                      theme === "light" ||
                      color === defaultColor ||
                      color === colors.white
                        ? "#bbdbff"
                        : getOffsetInPalette(Infinity, "lighter", color)
                    }, inset 0 0 0 1px ${
                      color === defaultColor || color === colors.white
                        ? "#2075d6"
                        : getOffsetInPalette(1, "darker", color)
                    }, inset 0 -1px 0 0 rgba(18, 21, 26, 0.05)`,
                  }),
              ]),
              passthroughProps.className,
              as.props.className
            ),

            children: (
              <>
                {icon && (
                  <ButtonIcon
                    iconSize={iconSize}
                    className={css({ margin: iconOnly ? 0 : "0 4px 0" })}
                  >
                    {icon}
                  </ButtonIcon>
                )}
                {children}
                {endIcon && !loading && (
                  <ButtonIcon
                    iconSize={iconSize}
                    className={css({ margin: iconOnly ? 0 : `0 0 0 12px` })}
                  >
                    {endIcon}
                  </ButtonIcon>
                )}
              </>
            ),
          };

          return React.cloneElement(as, propsToPass);
        }}
      </ClassNames>
    );
  }
);
