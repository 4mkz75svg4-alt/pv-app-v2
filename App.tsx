import React, { useState } from "react";
import WindowCanvas from "./WindowCanvas";
import type { ConfiguratorState, Split } from "./types";

type Mode = "draw-vertical" | "draw-horizontal" | "select";

type ProductType =
  | "Casement / Awning"
  | "Slider"
  | "Patio Door";

type SliderOrientation =
  | "Horizontal"
  | "Vertical";

type SizingMode =
  | "equal"
  | "center-feature"
  | "custom";

const initialState: ConfiguratorState = {
  overallWidth: 96,
  overallHeight: 60,
  verticalSplits: [],
  horizontalSplits: [],
  panelConfigs: {
    "0-0": { type: "Picture" }
  },
  gridColumns: 0,
  gridRows: 0
};

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function createEqualSplits(
  count: number,
  prefix: string
): Split[] {
  if (count <= 1) return [];

  return Array.from(
    { length: count - 1 },
    (_, index) => ({
      id: newId(`${prefix}-${index}`),
      position: (index + 1) / count
    })
  );
}

function createPanelConfigs(
  wide: number,
  tall: number
) {
  const panelConfigs:
    ConfiguratorState["panelConfigs"] = {};

  for (let row = 0; row < tall; row++) {
    for (
      let column = 0;
      column < wide;
      column++
    ) {
      panelConfigs[
        `${row}-${column}`
      ] = {
        type: "Picture"
      };
    }
  }

  return panelConfigs;
}

function sizesFromSplits(
  splits: Split[],
  total: number
) {
  const sorted = [...splits].sort(
    (a, b) =>
      a.position - b.position
  );

  const positions = [
    0,
    ...sorted.map(
      (split) => split.position
    ),
    1
  ];

  return positions
    .slice(0, -1)
    .map(
      (position, index) =>
        (
          (
            positions[index + 1] -
            position
          ) *
          total
        ).toFixed(2)
    );
}

function splitsFromSizes(
  sizes: number[],
  total: number,
  prefix: string
): Split[] {
  let running = 0;

  const splits: Split[] = [];

  for (
    let index = 0;
    index < sizes.length - 1;
    index++
  ) {
    running += sizes[index];

    splits.push({
      id: newId(
        `${prefix}-${index}`
      ),
      position:
        running / total
    });
  }

  return splits;
}

function rebalanceSizes(
  values: string[],
  total: number,
  autoIndex: number
) {
  if (
    values.length < 2 ||
    autoIndex < 0 ||
    autoIndex >= values.length
  ) {
    return values;
  }

  const next = [...values];

  let fixedTotal = 0;

  for (
    let index = 0;
    index < next.length;
    index++
  ) {
    if (index === autoIndex) {
      continue;
    }

    const number =
      Number(next[index]);

    if (
      !Number.isFinite(number) ||
      number <= 0
    ) {
      return next;
    }

    fixedTotal += number;
  }

  const remainder =
    total - fixedTotal;

  if (remainder <= 0) {
    return next;
  }

  next[autoIndex] =
    remainder.toFixed(2);

  return next;
}

export default function App() {
  const [state, setState] =
    useState<ConfiguratorState>(
      initialState
    );

  const [widthInput, setWidthInput] =
    useState("96");

  const [heightInput, setHeightInput] =
    useState("60");

  const [productType, setProductType] =
    useState<ProductType>(
      "Casement / Awning"
    );

  const [
    sliderOrientation,
    setSliderOrientation
  ] =
    useState<SliderOrientation>(
      "Horizontal"
    );

  const [unitsWide, setUnitsWide] =
    useState(1);

  const [unitsTall, setUnitsTall] =
    useState(1);

  const [
    horizontalSizingMode,
    setHorizontalSizingMode
  ] =
    useState<SizingMode>("equal");

  const [
    verticalSizingMode,
    setVerticalSizingMode
  ] =
    useState<SizingMode>("equal");

  const [
    customWidths,
    setCustomWidths
  ] = useState<string[]>([]);

  const [
    customHeights,
    setCustomHeights
  ] = useState<string[]>([]);

  const [
    widthAutoIndex,
    setWidthAutoIndex
  ] = useState(0);

  const [
    heightAutoIndex,
    setHeightAutoIndex
  ] = useState(0);

  const [
    selectedUnit,
    setSelectedUnit
  ] =
    useState<string | null>(null);

  const [history, setHistory] =
    useState<ConfiguratorState[]>([]);

  const mode: Mode = "select";

  function commit(
    next: ConfiguratorState
  ) {
    setHistory((items) => [
      ...items.slice(-19),
      state
    ]);

    setState(next);
  }

  function buildUnitLayout(
    wide: number,
    tall: number
  ) {
    commit({
      ...state,

      verticalSplits:
        createEqualSplits(
          wide,
          "unit-v"
        ),

      horizontalSplits:
        createEqualSplits(
          tall,
          "unit-h"
        ),

      panelConfigs:
        createPanelConfigs(
          wide,
          tall
        )
    });

    setHorizontalSizingMode(
      "equal"
    );

    setVerticalSizingMode(
      "equal"
    );

    setCustomWidths([]);
    setCustomHeights([]);

    setSelectedUnit(null);
  }

  function changeUnitsWide(
    value: number
  ) {
    const next = Math.max(
      1,
      Math.min(6, value)
    );

    setUnitsWide(next);

    buildUnitLayout(
      next,
      unitsTall
    );
  }

  function changeUnitsTall(
    value: number
  ) {
    const next = Math.max(
      1,
      Math.min(4, value)
    );

    setUnitsTall(next);

    buildUnitLayout(
      unitsWide,
      next
    );
  }

  function applyEqualWidths() {
    const splits =
      createEqualSplits(
        unitsWide,
        "unit-v"
      );

    setHorizontalSizingMode(
      "equal"
    );

    setCustomWidths([]);

    setState((current) => ({
      ...current,
      verticalSplits: splits
    }));
  }

  function applyCenterFeature() {
    if (unitsWide !== 3) {
      return;
    }

    setHorizontalSizingMode(
      "center-feature"
    );

    setCustomWidths([]);

    setState((current) => ({
      ...current,

      verticalSplits: [
        {
          id: newId("unit-v-1"),
          position: 0.25
        },
        {
          id: newId("unit-v-2"),
          position: 0.75
        }
      ]
    }));
  }

  function startCustomWidths() {
    const sizes =
      sizesFromSplits(
        state.verticalSplits,
        state.overallWidth
      );

    setHorizontalSizingMode(
      "custom"
    );

    setCustomWidths(sizes);

    setWidthAutoIndex(
      Math.max(
        0,
        sizes.length - 1
      )
    );
  }

  function updateCustomWidth(
    index: number,
    value: string
  ) {
    let next =
      customWidths.length ===
      unitsWide
        ? [...customWidths]
        : sizesFromSplits(
            state.verticalSplits,
            state.overallWidth
          );

    next[index] = value;

    const number =
      Number(value);

    if (
      !Number.isFinite(number) ||
      number <= 0
    ) {
      setCustomWidths(next);
      return;
    }

    let autoIndex =
      unitsWide - 1;

    if (
      index ===
      unitsWide - 1
    ) {
      autoIndex =
        Math.max(
          0,
          unitsWide - 2
        );
    }

    setWidthAutoIndex(
      autoIndex
    );

    next = rebalanceSizes(
      next,
      state.overallWidth,
      autoIndex
    );

    setCustomWidths(next);

    const numbers =
      next.map(Number);

    if (
      numbers.every(
        (item) =>
          Number.isFinite(item) &&
          item > 0
      )
    ) {
      setState((current) => ({
        ...current,

        verticalSplits:
          splitsFromSizes(
            numbers,
            current.overallWidth,
            "unit-v"
          )
      }));
    }
  }

  function applyEqualHeights() {
    setVerticalSizingMode(
      "equal"
    );

    setCustomHeights([]);

    setState((current) => ({
      ...current,

      horizontalSplits:
        createEqualSplits(
          unitsTall,
          "unit-h"
        )
    }));
  }

  function startCustomHeights() {
    const sizes =
      sizesFromSplits(
        state.horizontalSplits,
        state.overallHeight
      );

    setVerticalSizingMode(
      "custom"
    );

    setCustomHeights(sizes);

    setHeightAutoIndex(
      Math.max(
        0,
        sizes.length - 1
      )
    );
  }

  function updateCustomHeight(
    index: number,
    value: string
  ) {
    let next =
      customHeights.length ===
      unitsTall
        ? [...customHeights]
        : sizesFromSplits(
            state.horizontalSplits,
            state.overallHeight
          );

    next[index] = value;

    const number =
      Number(value);

    if (
      !Number.isFinite(number) ||
      number <= 0
    ) {
      setCustomHeights(next);
      return;
    }

    let autoIndex =
      unitsTall - 1;

    if (
      index ===
      unitsTall - 1
    ) {
      autoIndex =
        Math.max(
          0,
          unitsTall - 2
        );
    }

    setHeightAutoIndex(
      autoIndex
    );

    next = rebalanceSizes(
      next,
      state.overallHeight,
      autoIndex
    );

    setCustomHeights(next);

    const numbers =
      next.map(Number);

    if (
      numbers.every(
        (item) =>
          Number.isFinite(item) &&
          item > 0
      )
    ) {
      setState((current) => ({
        ...current,

        horizontalSplits:
          splitsFromSizes(
            numbers,
            current.overallHeight,
            "unit-h"
          )
      }));
    }
  }

  function updateOverallWidth(
    value: string
  ) {
    setWidthInput(value);

    const number =
      Number(value);

    if (
      value === "" ||
      !Number.isFinite(number) ||
      number <= 0
    ) {
      return;
    }

    if (
      horizontalSizingMode ===
        "custom" &&
      customWidths.length ===
        unitsWide
    ) {
      const next =
        rebalanceSizes(
          customWidths,
          number,
          widthAutoIndex
        );

      setCustomWidths(next);

      const numbers =
        next.map(Number);

      setState((current) => ({
        ...current,

        overallWidth:
          number,

        verticalSplits:
          splitsFromSizes(
            numbers,
            number,
            "unit-v"
          )
      }));

      return;
    }

    setState((current) => ({
      ...current,
      overallWidth: number
    }));
  }

  function updateOverallHeight(
    value: string
  ) {
    setHeightInput(value);

    const number =
      Number(value);

    if (
      value === "" ||
      !Number.isFinite(number) ||
      number <= 0
    ) {
      return;
    }

    if (
      verticalSizingMode ===
        "custom" &&
      customHeights.length ===
        unitsTall
    ) {
      const next =
        rebalanceSizes(
          customHeights,
          number,
          heightAutoIndex
        );

      setCustomHeights(next);

      const numbers =
        next.map(Number);

      setState((current) => ({
        ...current,

        overallHeight:
          number,

        horizontalSplits:
          splitsFromSizes(
            numbers,
            number,
            "unit-h"
          )
      }));

      return;
    }

    setState((current) => ({
      ...current,
      overallHeight: number
    }));
  }

  function handleFrameWidthChange(
    width: number
  ) {
    setWidthInput(
      width.toFixed(2)
    );

    if (
      horizontalSizingMode ===
        "custom" &&
      customWidths.length ===
        unitsWide
    ) {
      const next =
        rebalanceSizes(
          customWidths,
          width,
          widthAutoIndex
        );

      setCustomWidths(next);

      const numbers =
        next.map(Number);

      setState((current) => ({
        ...current,

        overallWidth:
          width,

        verticalSplits:
          splitsFromSizes(
            numbers,
            width,
            "unit-v"
          )
      }));

      return;
    }

    setState((current) => ({
      ...current,
      overallWidth: width
    }));
  }

  function handleFrameHeightChange(
    height: number
  ) {
    setHeightInput(
      height.toFixed(2)
    );

    if (
      verticalSizingMode ===
        "custom" &&
      customHeights.length ===
        unitsTall
    ) {
      const next =
        rebalanceSizes(
          customHeights,
          height,
          heightAutoIndex
        );

      setCustomHeights(next);

      const numbers =
        next.map(Number);

      setState((current) => ({
        ...current,

        overallHeight:
          height,

        horizontalSplits:
          splitsFromSizes(
            numbers,
            height,
            "unit-h"
          )
      }));

      return;
    }

    setState((current) => ({
      ...current,
      overallHeight: height
    }));
  }

  function moveVertical(
    id: string,
    position: number
  ) {
    setState((current) => {
      const splits =
        current.verticalSplits.map(
          (split) =>
            split.id === id
              ? {
                  ...split,
                  position
                }
              : split
        );

      const sizes =
        sizesFromSplits(
          splits,
          current.overallWidth
        );

      setHorizontalSizingMode(
        "custom"
      );

      setCustomWidths(sizes);

      return {
        ...current,
        verticalSplits: splits
      };
    });
  }

  function moveHorizontal(
    id: string,
    position: number
  ) {
    setState((current) => {
      const splits =
        current.horizontalSplits.map(
          (split) =>
            split.id === id
              ? {
                  ...split,
                  position
                }
              : split
        );

      const sizes =
        sizesFromSplits(
          splits,
          current.overallHeight
        );

      setVerticalSizingMode(
        "custom"
      );

      setCustomHeights(sizes);

      return {
        ...current,
        horizontalSplits: splits
      };
    });
  }

  function reset() {
    setState(initialState);

    setWidthInput("96");
    setHeightInput("60");

    setProductType(
      "Casement / Awning"
    );

    setSliderOrientation(
      "Horizontal"
    );

    setUnitsWide(1);
    setUnitsTall(1);

    setHorizontalSizingMode(
      "equal"
    );

    setVerticalSizingMode(
      "equal"
    );

    setCustomWidths([]);
    setCustomHeights([]);

    setSelectedUnit(null);
    setHistory([]);
  }

  function save() {
    localStorage.setItem(
      "pv-app-react-v08",
      JSON.stringify({
        state,
        productType,
        sliderOrientation,
        unitsWide,
        unitsTall
      })
    );

    const button =
      document.getElementById(
        "save-button"
      );

    if (button) {
      button.textContent =
        "Saved";

      setTimeout(() => {
        button.textContent =
          "Save";
      }, 900);
    }
  }

  return (
    <>
      <header className="topbar">
        <div>
          <div className="brand">
            Pacific View
          </div>

          <div className="title">
            Window Configurator
          </div>
        </div>

        <button
          id="save-button"
          onClick={save}
        >
          Save
        </button>
      </header>

      <main className="configurator-layout">

        <aside className="config-panel">

          <section className="config-section">

            <div className="step-title">
              1. Product
            </div>

            <div className="option-buttons">

              <button
                className={
                  productType ===
                  "Casement / Awning"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setProductType(
                    "Casement / Awning"
                  )
                }
              >
                Casement / Awning
              </button>

              <button
                className={
                  productType ===
                  "Slider"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setProductType(
                    "Slider"
                  )
                }
              >
                Slider
              </button>

              <button
                className={
                  productType ===
                  "Patio Door"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setProductType(
                    "Patio Door"
                  )
                }
              >
                Patio Door
              </button>

            </div>

          </section>

          {productType ===
            "Slider" && (

            <section className="config-section">

              <div className="step-title">
                2. Slider Type
              </div>

              <div className="option-buttons">

                <button
                  className={
                    sliderOrientation ===
                    "Horizontal"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSliderOrientation(
                      "Horizontal"
                    )
                  }
                >
                  Horizontal Slider
                </button>

                <button
                  className={
                    sliderOrientation ===
                    "Vertical"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSliderOrientation(
                      "Vertical"
                    )
                  }
                >
                  Vertical Slider
                </button>

              </div>

            </section>

          )}

          <section className="config-section">

            <div className="step-title">
              Window Units
            </div>

            <div className="number-row">

              <label>
                How many wide?

                <select
                  value={unitsWide}
                  onChange={(event) =>
                    changeUnitsWide(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >
                  {[1, 2, 3, 4, 5, 6].map(
                    (number) => (
                      <option
                        key={number}
                        value={number}
                      >
                        {number}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                How many tall?

                <select
                  value={unitsTall}
                  onChange={(event) =>
                    changeUnitsTall(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >
                  {[1, 2, 3, 4].map(
                    (number) => (
                      <option
                        key={number}
                        value={number}
                      >
                        {number}
                      </option>
                    )
                  )}
                </select>
              </label>

            </div>

          </section>

          <section className="config-section">

            <div className="step-title">
              Overall Opening Size
            </div>

            <div className="number-row">

              <label>
                Width

                <input
                  type="text"
                  inputMode="decimal"
                  value={widthInput}
                  onChange={(event) =>
                    updateOverallWidth(
                      event.target.value
                    )
                  }
                />
              </label>

              <label>
                Height

                <input
                  type="text"
                  inputMode="decimal"
                  value={heightInput}
                  onChange={(event) =>
                    updateOverallHeight(
                      event.target.value
                    )
                  }
                />
              </label>

            </div>

          </section>

          {unitsWide > 1 && (

            <section className="config-section">

              <div className="step-title">
                Window Widths
              </div>

              <div className="option-buttons">

                <button
                  className={
                    horizontalSizingMode ===
                    "equal"
                      ? "active"
                      : ""
                  }
                  onClick={
                    applyEqualWidths
                  }
                >
                  {unitsWide === 2
                    ? "1/2 + 1/2"
                    : unitsWide === 3
                    ? "1/3 + 1/3 + 1/3"
                    : "Equal Widths"}
                </button>

                {unitsWide === 3 && (
                  <button
                    className={
                      horizontalSizingMode ===
                      "center-feature"
                        ? "active"
                        : ""
                    }
                    onClick={
                      applyCenterFeature
                    }
                  >
                    1/4 + 1/2 + 1/4
                  </button>
                )}

                <button
                  className={
                    horizontalSizingMode ===
                    "custom"
                      ? "active"
                      : ""
                  }
                  onClick={
                    startCustomWidths
                  }
                >
                  Custom Sizes
                </button>

              </div>

              {horizontalSizingMode ===
                "custom" && (

                <div
                  style={{
                    marginTop: 12
                  }}
                >

                  <div className="number-row">

                    {customWidths.map(
                      (
                        value,
                        index
                      ) => (

                        <label
                          key={index}
                        >
                          Window{" "}
                          {index + 1}
                          {index ===
                            widthAutoIndex
                            ? " (auto)"
                            : ""}

                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(
                              event
                            ) =>
                              updateCustomWidth(
                                index,
                                event.target.value
                              )
                            }
                          />

                        </label>

                      )
                    )}

                  </div>

                  <div className="split-note">
                    Change any window size. Another window adjusts automatically so the overall width stays the same.
                  </div>

                </div>

              )}

            </section>

          )}

          {unitsTall > 1 && (

            <section className="config-section">

              <div className="step-title">
                Window Heights
              </div>

              <div className="option-buttons">

                <button
                  className={
                    verticalSizingMode ===
                    "equal"
                      ? "active"
                      : ""
                  }
                  onClick={
                    applyEqualHeights
                  }
                >
                  Equal Heights
                </button>

                <button
                  className={
                    verticalSizingMode ===
                    "custom"
                      ? "active"
                      : ""
                  }
                  onClick={
                    startCustomHeights
                  }
                >
                  Custom Heights
                </button>

              </div>

              {verticalSizingMode ===
                "custom" && (

                <div
                  style={{
                    marginTop: 12
                  }}
                >

                  <div className="number-row">

                    {customHeights.map(
                      (
                        value,
                        index
                      ) => (

                        <label
                          key={index}
                        >
                          Row{" "}
                          {index + 1}
                          {index ===
                            heightAutoIndex
                            ? " (auto)"
                            : ""}

                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(
                              event
                            ) =>
                              updateCustomHeight(
                                index,
                                event.target.value
                              )
                            }
                          />

                        </label>

                      )
                    )}

                  </div>

                </div>

              )}

            </section>

          )}

          <section className="config-section">

            <div className="step-title">
              Configure Window
            </div>

            <div className="selected-info">
              {selectedUnit
                ? `Window ${selectedUnit} selected`
                : "Tap a window in the drawing"}
            </div>

            {selectedUnit && (
              <div className="split-note">
                Internal window configuration comes next.
              </div>
            )}

          </section>

        </aside>

        <section className="drawing-area">

          <div className="drawing-header">

            <div>
              <strong>
                {state.overallWidth.toFixed(
                  2
                )}
                " ×{" "}
                {state.overallHeight.toFixed(
                  2
                )}
                "
              </strong>

              <span>
                {unitsWide} window
                {unitsWide !== 1
                  ? "s"
                  : ""}{" "}
                wide ×{" "}
                {unitsTall} window
                {unitsTall !== 1
                  ? "s"
                  : ""}{" "}
                tall
              </span>
            </div>

            <div className="drawing-actions">

              <button
                onClick={reset}
              >
                Reset
              </button>

            </div>

          </div>

          <div className="canvas-wrap">

            <WindowCanvas
              widthInches={
                state.overallWidth
              }
              heightInches={
                state.overallHeight
              }
              verticalSplits={
                state.verticalSplits
              }
              horizontalSplits={
                state.horizontalSplits
              }
              selectedPanel={
                selectedUnit
              }
              panelTypes={Object.fromEntries(
                Object.entries(
                  state.panelConfigs
                ).map(
                  ([key, value]) => [
                    key,
                    value.type
                  ]
                )
              )}
              gridColumns={0}
              gridRows={0}
              mode={mode}
              onAddVertical={() => {}}
              onAddHorizontal={() => {}}
              onMoveVertical={
                moveVertical
              }
              onMoveHorizontal={
                moveHorizontal
              }
              onSelectPanel={
                setSelectedUnit
              }
              onOverallWidthChange={
                handleFrameWidthChange
              }
              onOverallHeightChange={
                handleFrameHeightChange
              }
            />

          </div>

          <p className="hint">
            Drag the outside frame to change the overall opening. Drag the mullions to adjust individual window sizes.
          </p>

        </section>

      </main>
    </>
  );
}
