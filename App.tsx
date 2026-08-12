import React, { useState } from "react";
import WindowCanvas from "./WindowCanvas";
import type { ConfiguratorState, PanelType, Split } from "./types";

type Mode = "draw-vertical" | "draw-horizontal" | "select";
type ProductType = "Casement / Awning" | "Slider" | "Patio Door";
type SliderOrientation = "Horizontal" | "Vertical";

const panelTypes: PanelType[] = [
  "Picture",
  "Casement Left",
  "Casement Right",
  "Awning",
  "Slider Left",
  "Slider Right"
];

const initialState: ConfiguratorState = {
  overallWidth: 96,
  overallHeight: 60,
  verticalSplits: [],
  horizontalSplits: [],
  panelConfigs: { "0-0": { type: "Picture" } },
  gridColumns: 0,
  gridRows: 0
};

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEqualSplits(count: number, prefix: string): Split[] {
  if (count <= 1) return [];

  return Array.from({ length: count - 1 }, (_, index) => ({
    id: newId(`${prefix}-${index}`),
    position: (index + 1) / count
  }));
}

export default function App() {
  const [state, setState] = useState<ConfiguratorState>(initialState);

  const [widthInput, setWidthInput] = useState("96");
  const [heightInput, setHeightInput] = useState("60");

  const [productType, setProductType] =
    useState<ProductType>("Casement / Awning");

  const [sliderOrientation, setSliderOrientation] =
    useState<SliderOrientation>("Horizontal");

  const [wide, setWide] = useState(1);
  const [tall, setTall] = useState(1);

  const [mode, setMode] = useState<Mode>("select");

  const [selectedPanel, setSelectedPanel] =
    useState<string | null>(null);

  const [history, setHistory] =
    useState<ConfiguratorState[]>([]);

  const selectedType = selectedPanel
    ? state.panelConfigs[selectedPanel]?.type ?? "Picture"
    : null;

  function commit(next: ConfiguratorState) {
    setHistory((items) => [...items.slice(-19), state]);
    setState(next);
  }

  function buildLayout(nextWide: number, nextTall: number) {
    const verticalSplits = createEqualSplits(nextWide, "v");
    const horizontalSplits = createEqualSplits(nextTall, "h");

    const panelConfigs: ConfiguratorState["panelConfigs"] = {};

    for (let row = 0; row < nextTall; row++) {
      for (let column = 0; column < nextWide; column++) {
        panelConfigs[`${row}-${column}`] = {
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

    setSelectedPanel(null);
  }

  function changeWide(value: number) {
    const next = Math.max(1, Math.min(6, value));

    setWide(next);
    buildLayout(next, tall);
  }

  function changeTall(value: number) {
    const next = Math.max(1, Math.min(4, value));

    setTall(next);
    buildLayout(wide, next);
  }

  function addVertical(position: number) {
    if (
      state.verticalSplits.some(
        (split) => Math.abs(split.position - position) < 0.025
      )
    ) {
      return;
    }

    commit({
      ...state,
      verticalSplits: [
        ...state.verticalSplits,
        {
          id: newId("v"),
          position
        }
      ]
    });

    setSelectedPanel(null);
  }

  function addHorizontal(position: number) {
    if (
      state.horizontalSplits.some(
        (split) => Math.abs(split.position - position) < 0.025
      )
    ) {
      return;
    }

    commit({
      ...state,
      horizontalSplits: [
        ...state.horizontalSplits,
        {
          id: newId("h"),
          position
        }
      ]
    });

    setSelectedPanel(null);
  }

  function moveVertical(id: string, position: number) {
    setState((current) => ({
      ...current,
      verticalSplits: current.verticalSplits.map((split) =>
        split.id === id
          ? { ...split, position }
          : split
      )
    }));
  }

  function moveHorizontal(id: string, position: number) {
    setState((current) => ({
      ...current,
      horizontalSplits: current.horizontalSplits.map((split) =>
        split.id === id
          ? { ...split, position }
          : split
      )
    }));
  }

  function setPanelType(type: PanelType) {
    if (!selectedPanel) return;

    setState((current) => ({
      ...current,
      panelConfigs: {
        ...current.panelConfigs,
        [selectedPanel]: { type }
      }
    }));
  }

  function makeEqual() {
    buildLayout(wide, tall);
  }

  function undo() {
    const previous = history.at(-1);

    if (!previous) return;

    setState(previous);
    setWidthInput(String(previous.overallWidth));
    setHeightInput(String(previous.overallHeight));

    setHistory((items) => items.slice(0, -1));
    setSelectedPanel(null);
  }

  function clear() {
    setWide(1);
    setTall(1);

    setState(initialState);

    setWidthInput("96");
    setHeightInput("60");

    setSelectedPanel(null);
    setHistory([]);
  }

  function save() {
    localStorage.setItem(
      "pv-app-react-v03",
      JSON.stringify({
        state,
        productType,
        sliderOrientation,
        wide,
        tall
      })
    );

    const button = document.getElementById("save-button");

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
          <div className="brand">Pacific View</div>
          <div className="title">Window Configurator</div>
        </div>

        <button id="save-button" onClick={save}>
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
              {[
                "Casement / Awning",
                "Slider",
                "Patio Door"
              ].map((product) => (
                <button
                  key={product}
                  className={
                    productType === product
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setProductType(product as ProductType)
                  }
                >
                  {product}
                </button>
              ))}
            </div>
          </section>

          {productType === "Slider" && (
            <section className="config-section">
              <div className="step-title">
                2. Slider Orientation
              </div>

              <div className="option-buttons">
                <button
                  className={
                    sliderOrientation === "Horizontal"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSliderOrientation("Horizontal")
                  }
                >
                  Horizontal
                </button>

                <button
                  className={
                    sliderOrientation === "Vertical"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setSliderOrientation("Vertical")
                  }
                >
                  Vertical
                </button>
              </div>
            </section>
          )}

          <section className="config-section">
            <div className="step-title">
              {productType === "Slider"
                ? "3. Configuration"
                : "2. Configuration"}
            </div>

            <div className="number-row">
              <label>
                How many wide?
                <select
                  value={wide}
                  onChange={(event) =>
                    changeWide(Number(event.target.value))
                  }
                >
                  {[1, 2, 3, 4, 5, 6].map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                How many tall?
                <select
                  value={tall}
                  onChange={(event) =>
                    changeTall(Number(event.target.value))
                  }
                >
                  {[1, 2, 3, 4].map((number) => (
                    <option key={number} value={number}>
                      {number}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="config-section">
            <div className="step-title">
              {productType === "Slider"
                ? "4. Overall Size"
                : "3. Overall Size"}
            </div>

            <div className="number-row">
              <label>
                Width
                <input
                  type="text"
                  inputMode="decimal"
                  value={widthInput}
                  onChange={(event) => {
                    const value = event.target.value;

                    setWidthInput(value);

                    const number = Number(value);

                    if (
                      value !== "" &&
                      !Number.isNaN(number) &&
                      number > 0
                    ) {
                      setState((current) => ({
                        ...current,
                        overallWidth: number
                      }));
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
                    const value = event.target.value;

                    setHeightInput(value);

                    const number = Number(value);

                    if (
                      value !== "" &&
                      !Number.isNaN(number) &&
                      number > 0
                    ) {
                      setState((current) => ({
                        ...current,
                        overallHeight: number
                      }));
                    }
                  }}
                />
              </label>
            </div>
          </section>

          <section className="config-section">
            <div className="step-title">
              {productType === "Slider"
                ? "5. Split"
                : "4. Split"}
            </div>

            <button
              className="equal-button"
              onClick={makeEqual}
            >
              Equal Split
            </button>

            <div className="split-note">
              Mullions can be dragged on the drawing
              to fine-tune the split.
            </div>
          </section>

          <section className="config-section">
            <div className="step-title">
              {productType === "Slider"
                ? "6. Panel Operation"
                : "5. Panel Operation"}
            </div>

            <div className="selected-info">
              {selectedPanel
                ? `Selected: ${selectedPanel}`
                : "Tap a panel in the drawing"}
            </div>

            <div className="operation-buttons">
              {panelTypes.map((type) => (
                <button
                  key={type}
                  className={
                    selectedType === type
                      ? "active"
                      : ""
                  }
                  disabled={!selectedPanel}
                  onClick={() => setPanelType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

        </aside>

        <section className="drawing-area">

          <div className="drawing-header">
            <div>
              <strong>
                {state.overallWidth}" ×{" "}
                {state.overallHeight}"
              </strong>

              <span>
                {wide} wide × {tall} tall
              </span>
            </div>

            <div className="drawing-actions">
              <button onClick={undo} disabled={!history.length}>
                Undo
              </button>

              <button onClick={clear}>
                Reset
              </button>
            </div>
          </div>

          <div className="canvas-wrap">
            <WindowCanvas
              widthInches={state.overallWidth}
              heightInches={state.overallHeight}
              verticalSplits={state.verticalSplits}
              horizontalSplits={state.horizontalSplits}
              selectedPanel={selectedPanel}
              panelTypes={Object.fromEntries(
                Object.entries(state.panelConfigs).map(
                  ([key, value]) => [
                    key,
                    value.type
                  ]
                )
              )}
              gridColumns={state.gridColumns}
              gridRows={state.gridRows}
              mode={mode}
              onAddVertical={addVertical}
              onAddHorizontal={addHorizontal}
              onMoveVertical={moveVertical}
              onMoveHorizontal={moveHorizontal}
              onSelectPanel={setSelectedPanel}
            />
          </div>

          <div className="drawing-tools">
            <button
              className={mode === "select" ? "active" : ""}
              onClick={() => setMode("select")}
            >
              Select Panels
            </button>

            <button
              className={
                mode === "draw-vertical" ? "active" : ""
              }
              onClick={() => setMode("draw-vertical")}
            >
              Add Vertical
            </button>

            <button
              className={
                mode === "draw-horizontal" ? "active" : ""
              }
              onClick={() => setMode("draw-horizontal")}
            >
              Add Horizontal
            </button>
          </div>

          <p className="hint">
            Drag any mullion to adjust the layout.
          </p>

        </section>

      </main>
    </>
  );
}
