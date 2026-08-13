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

type HorizontalSizingMode =
  | "equal"
  | "center-feature"
  | "custom";

type VerticalSizingMode =
  | "equal"
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

function equalSizes(
  total: number,
  count: number
) {
  if (count <= 0) return [];

  const each = total / count;

  return Array.from(
    { length: count },
    () => each.toFixed(2)
  );
}

export default function App() {
  const [state, setState] =
    useState<ConfiguratorState>(initialState);

  const [widthInput, setWidthInput] =
    useState("96");

  const [heightInput, setHeightInput] =
    useState("60");

  const [productType, setProductType] =
    useState<ProductType>("Casement / Awning");

  const [
    sliderOrientation,
    setSliderOrientation
  ] = useState<SliderOrientation>("Horizontal");

  const [unitsWide, setUnitsWide] =
    useState(1);

  const [unitsTall, setUnitsTall] =
    useState(1);

  const [
    horizontalSizingMode,
    setHorizontalSizingMode
  ] =
    useState<HorizontalSizingMode>("equal");

  const [
    verticalSizingMode,
    setVerticalSizingMode
  ] =
    useState<VerticalSizingMode>("equal");

  const [
    customWidths,
    setCustomWidths
  ] = useState<string[]>(["96"]);

  const [
    customHeights,
    setCustomHeights
  ] = useState<string[]>(["60"]);

  const [selectedUnit, setSelectedUnit] =
    useState<string | null>(null);

  const [history, setHistory] =
    useState<ConfiguratorState[]>([]);

  const mode: Mode = "select";

  function commit(next: ConfiguratorState) {
    setHistory((items) => [
      ...items.slice(-19),
      state
    ]);

    setState(next);
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

    setHorizontalSizingMode("equal");
    setVerticalSizingMode("equal");

    setCustomWidths(
      equalSizes(
        state.overallWidth,
        wide
      )
    );

    setCustomHeights(
      equalSizes(
        state.overallHeight,
        tall
      )
    );

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
    setHorizontalSizingMode("equal");

    setState((current) => ({
      ...current,
      verticalSplits:
        createEqualSplits(
          unitsWide,
          "unit-v"
        )
    }));

    setCustomWidths(
      equalSizes(
        state.overallWidth,
        unitsWide
      )
    );
  }

  function applyCenterFeature() {
    if (unitsWide !== 3) return;

    setHorizontalSizingMode(
      "center-feature"
    );

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

    setCustomWidths([
      (
        state.overallWidth * 0.25
      ).toFixed(2),
      (
        state.overallWidth * 0.5
      ).toFixed(2),
      (
        state.overallWidth * 0.25
      ).toFixed(2)
    ]);
  }

  function startCustomWidths() {
    setHorizontalSizingMode(
      "custom"
    );

    const sorted =
      [...state.verticalSplits].sort(
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

    const sizes = positions
      .slice(0, -1)
      .map(
        (position, index) =>
          (
            (
              positions[index + 1] -
              position
            ) *
            state.overallWidth
          ).toFixed(2)
      );

    setCustomWidths(sizes);
  }

  function applyCustomWidths(
    values: string[]
  ) {
    const numbers =
      values.map(Number);

    const valid =
      numbers.length === unitsWide &&
      numbers.every(
        (number) =>
          Number.isFinite(number) &&
          number > 0
      );

    if (!valid) return;

    const total =
      numbers.reduce(
        (sum, number) =>
          sum + number,
        0
      );

    if (
      Math.abs(
        total -
          state.overallWidth
      ) > 0.05
    ) {
      return;
    }

    let running = 0;

    const splits: Split[] = [];

    for (
      let index = 0;
      index < numbers.length - 1;
      index++
    ) {
      running += numbers[index];

      splits.push({
        id: newId(
          `unit-v-${index}`
        ),
        position:
          running /
          state.overallWidth
      });
    }

    setState((current) => ({
      ...current,
      verticalSplits: splits
    }));
  }

  function updateCustomWidth(
    index: number,
    value: string
  ) {
    const next = [
      ...customWidths
    ];

    next[index] = value;

    setCustomWidths(next);

    applyCustomWidths(next);
  }

  function applyEqualHeights() {
    setVerticalSizingMode("equal");

    setState((current) => ({
      ...current,
      horizontalSplits:
        createEqualSplits(
          unitsTall,
          "unit-h"
        )
    }));

    setCustomHeights(
      equalSizes(
        state.overallHeight,
        unitsTall
      )
    );
  }

  function startCustomHeights() {
    setVerticalSizingMode(
      "custom"
    );

    const sorted =
      [...state.horizontalSplits].sort(
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

    const sizes = positions
      .slice(0, -1)
      .map(
        (position, index) =>
          (
            (
              positions[index + 1] -
              position
            ) *
            state.overallHeight
          ).toFixed(2)
      );

    setCustomHeights(sizes);
  }

  function applyCustomHeights(
    values: string[]
  ) {
    const numbers =
      values.map(Number);

    const valid =
      numbers.length === unitsTall &&
      numbers.every(
        (number) =>
          Number.isFinite(number) &&
          number > 0
      );

    if (!valid) return;

    const total =
      numbers.reduce(
        (sum, number) =>
          sum + number,
        0
      );

    if (
      Math.abs(
        total -
          state.overallHeight
      ) > 0.05
    ) {
      return;
    }

    let running = 0;

    const splits: Split[] = [];

    for (
      let index = 0;
      index < numbers.length - 1;
      index++
    ) {
      running += numbers[index];

      splits.push({
        id: newId(
          `unit-h-${index}`
        ),
        position:
          running /
          state.overallHeight
      });
    }

    setState((current) => ({
      ...current,
      horizontalSplits:
        splits
    }));
  }

  function updateCustomHeight(
    index: number,
    value: string
  ) {
    const next = [
      ...customHeights
    ];

    next[index] = value;

    setCustomHeights(next);

    applyCustomHeights(next);
  }

  function moveVertical(
    id: string,
    position: number
  ) {
    setState((current) => ({
      ...current,
      verticalSplits:
        current.verticalSplits.map(
          (split) =>
            split.id === id
              ? {
                  ...split,
                  position
                }
              : split
        )
    }));

    setHorizontalSizingMode(
      "custom"
    );
  }

  function moveHorizontal(
    id: string,
    position: number
  ) {
    setState((current) => ({
      ...current,
      horizontalSplits:
        current.horizontalSplits.map(
          (split) =>
            split.id === id
              ? {
                  ...split,
                  position
                }
              : split
        )
    }));

    setVerticalSizingMode(
      "custom"
    );
  }

  function undo() {
    const previous =
      history.at(-1);

    if (!previous) return;

    setState(previous);

    setWidthInput(
      String(
        previous.overallWidth
      )
    );

    setHeightInput(
      String(
        previous.overallHeight
      )
    );

    setHistory((items) =>
      items.slice(0, -1)
    );

    setSelectedUnit(null);
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

    setCustomWidths(["96"]);
    setCustomHeights(["60"]);

    setSelectedUnit(null);
    setHistory([]);
  }

  function save() {
    localStorage.setItem(
      "pv-app-react-v05",
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

  const customWidthTotal =
    customWidths.reduce(
      (sum, value) =>
        sum +
        (Number(value) || 0),
      0
    );

  const customHeightTotal =
    customHeights.reduce(
      (sum, value) =>
        sum +
        (Number(value) || 0),
      0
    );

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
              {productType === "Slider"
                ? "3. Window Units"
                : "2. Window Units"}
            </div>

            <div className="number-row">

              <label>
                How many wide?

                <select
                  value={unitsWide}
                  onChange={(event) =>
                    changeUnitsWide(
                      Number(
                        event.target
                          .value
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
                        event.target
                          .value
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

            <div className="split-note">
              These are separate window units.
            </div>

          </section>

          <section className="config-section">

            <div className="step-title">
              {productType === "Slider"
                ? "4. Overall Opening Size"
                : "3. Overall Opening Size"}
            </div>

            <div className="number-row">

              <label>
                Width

                <input
                  type="text"
                  inputMode="decimal"
                  value={widthInput}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setWidthInput(
                      value
                    );

                    const number =
                      Number(value);

                    if (
                      value !== "" &&
                      !Number.isNaN(
                        number
                      ) &&
                      number > 0
                    ) {
                      setState(
                        (current) => ({
                          ...current,
                          overallWidth:
                            number
                        })
                      );
                    }
                  }}
                />
              </label>

              <label>
                Height

                <input
                  type="text"
                  inputMode="decimal"
                  value={heightInput}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setHeightInput(
                      value
                    );

                    const number =
                      Number(value);

                    if (
                      value !== "" &&
                      !Number.isNaN(
                        number
                      ) &&
                      number > 0
                    ) {
                      setState(
                        (current) => ({
                          ...current,
                          overallHeight:
                            number
                        })
                      );
                    }
                  }}
                />
              </label>

            </div>

          </section>

          {unitsWide > 1 && (
            <section className="config-section">

              <div className="step-title">
                {productType === "Slider"
                  ? "5. Window Widths"
                  : "4. Window Widths"}
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

                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(
                              event
                            ) =>
                              updateCustomWidth(
                                index,
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </label>
                      )
                    )}

                  </div>

                  <div className="split-note">
                    Total:{" "}
                    {customWidthTotal.toFixed(
                      2
                    )}
                    " /{" "}
                    {state.overallWidth}
                    "
                  </div>

                  {Math.abs(
                    customWidthTotal -
                      state.overallWidth
                  ) > 0.05 && (
                    <div className="split-note">
                      Custom widths must
                      add up to the
                      overall opening
                      width.
                    </div>
                  )}

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

                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(
                              event
                            ) =>
                              updateCustomHeight(
                                index,
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </label>
                      )
                    )}

                  </div>

                  <div className="split-note">
                    Total:{" "}
                    {customHeightTotal.toFixed(
                      2
                    )}
                    " /{" "}
                    {state.overallHeight}
                    "
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
                {state.overallWidth}"
                {" × "}
                {state.overallHeight}"
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
                onClick={undo}
                disabled={
                  !history.length
                }
              >
                Undo
              </button>

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
            />

          </div>

          <p className="hint">
            Tap a window to select it. Drag the mullions between windows to fine-tune the sizes.
          </p>

        </section>

      </main>
    </>
  );
}
