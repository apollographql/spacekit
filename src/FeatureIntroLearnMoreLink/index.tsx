/** @jsx jsx */
import * as React from "react";
import * as typography from "../typography";
import { jsx } from "@emotion/core";
import { colors } from "../colors";
import { useFeatureIntroControlInternalContext } from "../shared/FeatureIntroControlContext";

/**
 * Component to render Feature Intro learn more button.
 *
 * If this component is rendered in the children of `FeatureIntroControl`, then
 * `FeatureIntroControl` will render this element in it's layout. Otherwise, it's
 * rendered as-is.
 */
export const FeatureIntroLearnMoreLink: React.FC<React.HTMLProps<
  HTMLAnchorElement
>> = () => {
  const featureIntroContext = useFeatureIntroControlInternalContext();
  const [featureIntroId, setLearnMoreLink] = [
    featureIntroContext?.id,
    featureIntroContext?.setLearnMoreLink,
  ];

  const element = React.useMemo(
    () => (
      <div id={featureIntroId && `${featureIntroId}-learn-more-link`}>
        <div
          css={{
            color: colors.grey.base,
            ...typography.base.small,
            fontWeight: 600,
          }}
        >
          Learn more
        </div>
      </div>
    ),
    [featureIntroId],
  );

  React.useLayoutEffect(() => {
    setLearnMoreLink?.(element);
  }, [element, setLearnMoreLink]);

  return featureIntroContext ? null : element;
};
