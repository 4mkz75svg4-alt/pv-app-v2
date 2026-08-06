import { useMemo, useState } from "react";
import WindowCanvas from "./WindowCanvas";
import type { ConfiguratorState, PanelType } from "./types";

type Mode = "draw-vertical" | "draw-horizontal" | "select";

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

export default function App() {
  const [state, setState] = useState<ConfiguratorState>(() => {
    try {
      const saved = localStorage.getItem("pv-app-react-v02");
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  const [mode, setMode] = useState<Mode>("draw-vertical");
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [history, setHistory] = useState<ConfiguratorState[]>([]);

  const selectedType = selectedPanel
    ? state.panelConfigs[selectedPanel]?.type ?? "Picture"
    : null;

  const output = useMemo(
    () => ({
      overallWidth: state.overallWidth,
      overallHeight: state.overallHeight,
      verticalSplits: state.verticalSplits.map((split) =>
        +(split.position * state.overallWidth).toFixed(2)
      ),
      horizontalSplits: state.horizontalSplits.map((split) =>
        +(split.position * state.overallHeight).toFixed(2)
      ),
      panelTypes: state.panelConfigs,
      grids: {
        columns: state.gridColumns,
        rows: state.gridRows
      }
    }),
    [state]
  );

  function commit(next: ConfiguratorState) {
    setHistory((items) => [...items.slice(-19), state]);
    setState(next);
  }

  function addVertical(position: number) {
    if (state.verticalSplits.some((split) => Math.abs(split.position - position) < 0.025)) return;
    commit({
      ...state,
      verticalSplits: [...state.verticalSplits, { id: newId("v"), position }]
    });
    setSelectedPanel(null);
  }

  function addHorizontal(position: number) {
    if (state.horizontalSplits.some((split) => Math.abs(split.position - position) < 0.025)) return;
    commit({
      ...state,
      horizontalSplits: [...state.horizontalSplits, { id: newId("h"), position }]
    });
    setSelectedPanel(null);
  }

  function moveVertical(id: string, position: number) {
    setState((current) => ({
      ...current,
      verticalSplits: current.verticalSplits.map((split) =>
        split.id === id ? { ...split, position } : split
      )
    }));
  }

  function moveHorizontal(id: string, position: number) {
    setState((current) => ({
      ...current,
      horizontalSplits: current.horizontalSplits.map((split) =>
        split.id === id ? { ...split, position } : split
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

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setState(previous);
    setHistory((items) => items.slice(0, -1));
    setSelectedPanel(null);
  }

  function clear() {
    commit(initialState);
    setSelectedPanel(null);
  }

  function save() {
    localStorage.setItem("pv-app-react-v02", JSON.stringify(state));
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
          <div className="eyebrow">Pacific View</div>
          <h1>Window Configurator</h1>
        </div>
        <button id="save-button" className="primary" onClick={save}>Save</button>
      </header>

      <main className="app-shell">
        <section className="workspace">
          <div className="toolbar">
            <button
              className={mode === "draw-vertical" ? "active" : ""}
              onClick={() => setMode("draw-vertical")}
            >
              Draw Vertical
            </button>
            <button
              className={mode === "draw-horizontal" ? "active" : ""}
              onClick={() => setMode("draw-horizontal")}
            >
              Draw Horizontal
            </button>
            <button
              className={mode === "select" ? "active" : ""}
              onClick={() => setMode("select")}
            >
              Select
            </button>
            <button onClick={undo} disabled={!history.length}>Undo</button>
            <button onClick={clear}>Clear</button>
          </div>

          <div className="size-row">
            <label>
              Width
              <input
                type="number"
                min="12"
                max="300"
                step="0.25"
                value={state.overallWidth}
                onChange={(event) =>
                  setState({ ...state, overallWidth: Math.max(12, Number(event.target.value) || 12) })
                }
              />
            </label>
            <label>
              Height
              <input
                type="number"
                min="12"
                max="180"
                step="0.25"
                value={state.overallHeight}
                onChange={(event) =>
                  setState({ ...state, overallHeight: Math.max(12, Number(event.target.value) || 12) })
                }
              />
            </label>
          </div>

          <div className="canvas-wrap">
            <WindowCanvas
              widthInches={state.overallWidth}
              heightInches={state.overallHeight}
              verticalSplits={state.verticalSplits}
              horizontalSplits={state.horizontalSplits}
              selectedPanel={selectedPanel}
              panelTypes={Object.fromEntries(
                Object.entries(state.panelConfigs).map(([key, value]) => [key, value.type])
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

          <p className="hint">
            Draw a line across the frame with your finger. Switch to Select to tap panels or drag mullions.
          </p>
        </section>

        <aside className="properties">
          <section className="panel-card">
            <h2>Selected panel</h2>
            <div className="selected-info">
              {selectedPanel ? `${selectedPanel}: ${selectedType}` : "No panel selected"}
            </div>

            <div className="type-grid">
              {panelTypes.map((type) => (
                <button
                  key={type}
                  className={selectedType === type ? "active" : ""}
                  onClick={() => setPanelType(type)}
                  disabled={!selectedPanel}
                >
                  {type}
                </button>
              ))}
            </div>

            <h3>Grids</h3>
            <div className="grid-controls">
              <label>
                Columns
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={state.gridColumns}
                  onChange={(event) =>
                    setState({ ...state, gridColumns: Math.max(0, Number(event.target.value) || 0) })
                  }
                />
              </label>
              <label>
                Rows
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={state.gridRows}
                  onChange={(event) =>
                    setState({ ...state, gridRows: Math.max(0, Number(event.target.value) || 0) })
                  }
                />
              </label>
            </div>
          </section>

          <section className="panel-card">
            <h2>Opening data</h2>
            <pre>{JSON.stringify(output, null, 2)}</pre>
          </section>
        </aside>
      </main>
    </>
  );
}
