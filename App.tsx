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

  function buildUnitLayout(
    wide: number,
    tall: number
  ) {
    const verticalSplits =
      createEqualSplits(wide, "unit-v");

    const horizontalSplits =
      createEqualSplits(tall, "unit-h");

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

    commit({
      ...state,
      verticalSplits,
      horizontalSplits,
      panelConfigs
    });

    setSelectedUnit(null);
  }

  function changeUnitsWide(value: number) {
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

  function changeUnitsTall(value: number) {
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

  function makeUnitsEqual() {
    buildUnitLayout(
      unitsWide,
      unitsTall
    );
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
  }

  function undo() {
    const previous =
      history.at(-1);

    if (!previous) return;

    setState(previous);

    setWidthInput(
      String(previous.overallWidth)
    );

    setHeightInput(
      String(previous.overallHeight)
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

    setSelectedUnit(null);
    setHistory([]);
  }

  function save() {
    localStorage.setItem(
      "pv-app-react-v04",
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
      button.textContent = "Saved";

      setTimeout(() => {
        button.textContent = "Save";
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

          {/* PRODUCT */}

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

          {/* SLIDER ORIENTATION */}

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

          {/* WINDOW UNITS */}

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
              These are separate window
              units, not individual lites
              within a window.
            </div>
          </section>

          {/* OPENING SIZE */}

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

                    setWidthInput(value);

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

          {/* UNIT SIZING */}

          <section className="config-section">
            <div className="step-title">
              {productType === "Slider"
                ? "5. Window Sizes"
                : "4. Window Sizes"}
            </div>

            <button
              className="equal-button"
              onClick={makeUnitsEqual}
            >
              Make Window Units Equal
            </button>

            <div className="split-note">
              Or drag the dividing
              mullions in the drawing
              to create custom window
              widths and heights.
            </div>
          </section>

          {/* SELECTED WINDOW */}

          <section className="config-section">
            <div className="step-title">
              {productType === "Slider"
                ? "6. Configure Window"
                : "5. Configure Window"}
            </div>

            <div className="selected-info">
              {selectedUnit
                ? `Window ${selectedUnit} selected`
                : "Tap a window in the drawing"}
            </div>

            {selectedUnit && (
              <div className="split-note">
                Next we will add the
                internal configuration
                for this window:
                single lite, two lite,
                three lite, custom
                splits and operations.
              </div>
            )}
          </section>

        </aside>

        {/* DRAWING */}

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

              <button onClick={reset}>
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
            Tap a window to select it.
            Drag the mullions between
            windows to adjust the unit
            sizes.
          </p>

        </section>

      </main>
    </>
  );
}
