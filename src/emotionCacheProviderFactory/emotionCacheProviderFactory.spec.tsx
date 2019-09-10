/** @jsx jsx */
import "@testing-library/jest-dom/extend-expect";
import { emotionCacheProviderFactory } from "./index";
import { jsx } from "@emotion/core";
import { cleanup, render } from "@testing-library/react";

afterEach(cleanup);

test("when given no element, emotion should render classes into head", () => {
  const CacheProvider = emotionCacheProviderFactory();

  render(
    <CacheProvider>
      <div css={{ display: "block" }}>text</div>
    </CacheProvider>
  );

  expect(
    document.querySelector('head *[data-emotion="space-kit"]')
  ).toBeInTheDocument();
});

test("when given an element, emotion should add classes into that element", () => {
  const style = document.createElement("style");
  expect(style.hasChildNodes()).toBeFalsy();

  const CacheProvider = emotionCacheProviderFactory(style);
  render(
    <CacheProvider>
      <div css={{ display: "block" }}>text</div>
    </CacheProvider>
  );

  expect(style.hasChildNodes()).toBeTruthy();
});