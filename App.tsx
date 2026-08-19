import React, { useState } from "react";
import WindowCanvas from "./WindowCanvas";

import type {
  ConfiguratorState,
  Split,
  WindowUnitConfig,
  PanelType
} from "./types";

type Mode =
  | "draw-vertical"
  | "draw-horizontal"
  | "select";

type ProductType =
  | "Casement / Awning"
  | "Slider"
  | "Patio Door";

type SliderOrientation =
  | "Horizontal"
  | "Vertical";

type HorizontalSliderType =
  | "Single Vent"
  | "Double Slider"
  | "Double Vent + Centre Picture";

type VerticalSliderType =
  | "Single Hung"
  | "Double Hung";

type SliderPattern =
  | "XO"
  | "OX"
  | "XX"
  | "XOX";

type SliderSplitMode =
  | "equal"
  | "one-third"
  | "two-thirds"
  | "center-feature"
  | "custom";


type PatioPanelCount =
  | 2
  | 3
  | 4;

type PatioHanding =
  | "Active Left"
  | "Active Right";

type PatioSizePreset =
  | "5068"
  | "6068"
  | "8068"
  | "1068"
  | "12068"
  | "16068"
  | "Custom";

type SizingMode =
  | "equal"
  | "center-feature"
  | "custom";

type UnitSplitMode =
  | "equal"
  | "top-third"
  | "bottom-third"
  | "center-feature"
  | "top-half"
  | "bottom-half"
  | "custom";

type LiteOperation =
  | "Picture"
  | "Awning"
  | "Casement Left"
  | "Casement Right";

type PictureStyle =
  | "Balanced Sash"
  | "Direct Set";
type FlangeType =
  | "Nail Fin"
  | "Brick Mould"
  | "Reno Flange";

type WindowType =
  | "Vinyl"
  | "Aluminum"
  | "Aluminum / Wood"
  | "Fiberglass";


type Brand =
  | "Vinyltek"
  | "Sierra Pacific"
  | "ThermoProof"
  | "Kohltech"
  | "All Weather"
  | "Durabuilt"
  | "Duxton"
  | "Cortizo";

const PRODUCT_LINES: Record<Brand, string[]> = {
  Vinyltek: ["Boréal", "Boréal+", "Primaria"],
  "Sierra Pacific": ["H3 Fusion Tech", "Westchester", "SP", "Transcend", "Vinyl Collection"],
  ThermoProof: ["Pacific 6000", "Pacific 7000", "Pacific 8000", "Folding Sliding"],
  Kohltech: ["Supreme", "Tilt & Turn", "Select"],
  "All Weather": ["Apex Alloy 9950", "Ascent 6100", "Summit 9700", "Terra 2700", "Terra 2750", "Terrano 2100", "Atmosphere Folding Window"],
  Durabuilt: ["Omega", "Alpha", "Delta Fiberglass"],
  Duxton: ["FiberWall 328", "FiberWall 458", "FiberWall 458 Plus", "FiberWall 658"],
  Cortizo: ["COR Vision", "COR Vision Plus", "Millennium"]
};

type WoodFinishType =
  | "Clear Coat"
  | "Stained"
  | "Painted"
  | "Primed White";

type GlassAppearance = "Clear" | "Obscure";
type GlassPane = "Double" | "Triple";
type GlassSafety = "None" | "Tempered" | "Laminated";

type WoodSpecies =
  | "Pine"
  | "Maple"
  | "Alder"
  | "Mahogany"
  | "Cherry"
  | "Douglas Fir"
  | "Black Walnut"
  | "White Oak";

type ViewMode =
  | "Exterior"
  | "Interior";

type GridStyle =
  | "None"
  | "Colonial"
  | "Top Colonial"
  | "Prairie";

const STANDARD_COLOURS = [
  ["White", "001"],
  ["Black", "023"],
  ["Linen", "032"],
  ["Colonial White", "313"],
  ["Sandstone", "003"],
  ["Beige", "335"],
  ["Tan", "043"],
  ["Gull Gray", "007"],
  ["French Linen", "112"],
  ["Morning Dove Gray", "113"],
  ["Seawolf", "044"],
  ["Fashion Gray", "111"],
  ["Aqua Mist", "115"],
  ["Light Blue", "046"],
  ["Slate Blue", "008"],
  ["Black Sable", "060"],
  ["Indigo", "402"],
  ["Green", "004"],
  ["Hartford Green", "050"],
  ["Forest Green", "049"],
  ["Patina Green", "051"],
  ["Hemlock Green", "048"],
  ["Greek Olive", "081"],
  ["Clay", "026"],
  ["Harvest Cranberry", "010"],
  ["Colonial Red", "054"],
  ["Bahama Brown", "309"],
  ["Brown", "002"],
  ["TW Brown", "058"],
  ["Antique Bronze", "057"],
  ["Bronze", "024"],
  ["Battleship Gray", "321"],
  ["Modern Onyx", "118"],
  ["Dark Bronze", "401"],
  ["Custom Colour", "CUSTOM"]
] as const;

const WOOD_SPECIES: WoodSpecies[] = [
  "Pine",
  "Maple",
  "Alder",
  "Mahogany",
  "Cherry",
  "Douglas Fir",
  "Black Walnut",
  "White Oak"
];

const WOOD_STAINS = [
  "Bearstone Brown",
  "Briarwood",
  "Burlap",
  "Classic Gray",
  "Frosted",
  "Tux Black",
  "Warm Sun",
  "Woven Basket"
] as const;

const DOUBLE_LOW_E_OPTIONS = [
  "No Low-E",
  "LoE-180",
  "LoE2-270",
  "LoE2-272",
  "LoE3-366"
] as const;

const TRIPLE_LOW_E_OPTIONS = [
  "No Low-E",
  "180 / Clear / 180",
  "270 / Clear / 180",
  "272 / Clear / 180",
  "366 / Clear / 180",
  "366 / Clear / 366"
] as const;


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

function createLiteConfigs(
  wide: number,
  tall: number
) {
  const configs: WindowUnitConfig["liteConfigs"] = {};

  for (let row = 0; row < tall; row++) {
    for (let column = 0; column < wide; column++) {
      configs[`${row}-${column}`] = {
        type: "Picture"
      };
    }
  }

  return configs;
}

function createWindowUnit(
  id: string,
  litesWide = 1,
  litesTall = 1
): WindowUnitConfig {
  return {
    id,
    litesWide,
    litesTall,

    verticalSplits:
      createEqualSplits(
        litesWide,
        `lite-v-${id}`
      ),

    horizontalSplits:
      createEqualSplits(
        litesTall,
        `lite-h-${id}`
      ),

    liteConfigs:
      createLiteConfigs(
        litesWide,
        litesTall
      )
  };
}

function createWindowUnits(
  wide: number,
  tall: number
) {
  const units: Record<
    string,
    WindowUnitConfig
  > = {};

  for (let row = 0; row < tall; row++) {
    for (let column = 0; column < wide; column++) {
      const id = `${row}-${column}`;
      units[id] = createWindowUnit(id);
    }
  }

  return units;
}

function createPanelConfigs(
  wide: number,
  tall: number
) {
  const configs:
    ConfiguratorState["panelConfigs"] = {};

  for (let row = 0; row < tall; row++) {
    for (let column = 0; column < wide; column++) {
      configs[`${row}-${column}`] = {
        type: "Picture"
      };
    }
  }

  return configs;
}

function sizesFromSplits(
  splits: Split[],
  total: number
) {
  const sorted = [...splits].sort(
    (a, b) => a.position - b.position
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

const initialState: ConfiguratorState = {
  overallWidth: 96,
  overallHeight: 60,

  verticalSplits: [],
  horizontalSplits: [],

  panelConfigs: {
    "0-0": {
      type: "Picture"
    }
  },

  windowUnits: {
    "0-0":
      createWindowUnit("0-0")
  },

  gridColumns: 0,
  gridRows: 0
};

export default function App() {
  const [state, setState] =
    useState<ConfiguratorState>(
      initialState
    );

  const [widthInput, setWidthInput] =
    useState("96");

  const [heightInput, setHeightInput] =
    useState("60");

  const [
    productType,
    setProductType
  ] =
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

  const [
    horizontalSliderType,
    setHorizontalSliderType
  ] =
    useState<HorizontalSliderType>(
      "Single Vent"
    );

  const [
    verticalSliderType,
    setVerticalSliderType
  ] =
    useState<VerticalSliderType>(
      "Single Hung"
    );

  const [
    sliderPattern,
    setSliderPattern
  ] =
    useState<SliderPattern>(
      "XO"
    );

  const [
    sliderSplitMode,
    setSliderSplitMode
  ] =
    useState<SliderSplitMode>(
      "equal"
    );

  const [
    sliderCustomSizes,
    setSliderCustomSizes
  ] =
    useState<string[]>([]);


  const [
    patioSizePreset,
    setPatioSizePreset
  ] =
    useState<PatioSizePreset>(
      "6068"
    );

  const [
    patioPanelCount,
    setPatioPanelCount
  ] =
    useState<PatioPanelCount>(
      2
    );

  const [
    patioHanding,
    setPatioHanding
  ] =
    useState<PatioHanding>(
      "Active Left"
    );

  const [unitsWide, setUnitsWide] =
    useState(1);

  const [unitsTall, setUnitsTall] =
    useState(1);

  const [
    horizontalSizingMode,
    setHorizontalSizingMode
  ] =
    useState<SizingMode>(
      "equal"
    );

  const [
    verticalSizingMode,
    setVerticalSizingMode
  ] =
    useState<SizingMode>(
      "equal"
    );

  const [
    customWidths,
    setCustomWidths
  ] =
    useState<string[]>([]);

  const [
    customHeights,
    setCustomHeights
  ] =
    useState<string[]>([]);

  const [
    widthAutoIndex,
    setWidthAutoIndex
  ] =
    useState(0);

  const [
    heightAutoIndex,
    setHeightAutoIndex
  ] =
    useState(0);

  const [
    selectedUnit,
    setSelectedUnit
  ] =
    useState<string | null>(
      null
    );

  const [
    unitSplitModes,
    setUnitSplitModes
  ] =
    useState<Record<
      string,
      UnitSplitMode
    >>({});

  const [
    unitCustomHeights,
    setUnitCustomHeights
  ] =
    useState<Record<
      string,
      string[]
    >>({});

  const [
    pictureStyles,
    setPictureStyles
  ] =
    useState<Record<
      string,
      PictureStyle
    >>({});
const [
  flangeType,
  setFlangeType
] =
  useState<FlangeType>(
    "Nail Fin"
  );

const [
  brand,
  setBrand
] =
  useState<Brand>(
    "Vinyltek"
  );

const [
  productLine,
  setProductLine
] =
  useState<string>(
    "Boréal"
  );

const [
  windowType,
  setWindowType
] =
  useState<WindowType>(
    "Vinyl"
  );

const [
  exteriorColour,
  setExteriorColour
] =
  useState<string>(
    "White"
  );

const [
  interiorColour,
  setInteriorColour
] =
  useState<string>(
    "White"
  );

const [
  woodSpecies,
  setWoodSpecies
] =
  useState<WoodSpecies>(
    "Douglas Fir"
  );

const [
  woodFinish,
  setWoodFinish
] =
  useState<WoodFinishType>(
    "Clear Coat"
  );

const [
  woodStain,
  setWoodStain
] =
  useState<string>(
    "Bearstone Brown"
  );

const [
  viewMode,
  setViewMode
] =
  useState<ViewMode>(
    "Exterior"
  );

const [
  glassAppearance,
  setGlassAppearance
] =
  useState<GlassAppearance>(
    "No"
  );

const [
  glassPane,
  setGlassPane
] =
  useState<GlassPane>(
    "Double"
  );

const [
  lowEPackage,
  setLowEPackage
] =
  useState<string>(
    "LoE2-270"
  );

const [
  glassSafety,
  setGlassSafety
] =
  useState<GlassSafety>(
    "None"
  );

  const [
  gridStyle,
  setGridStyle
] =
  useState<GridStyle>(
    "None"
  );
  const mode: Mode =
    "select";

  const selectedUnitConfig =
    selectedUnit
      ? state.windowUnits?.[
          selectedUnit
        ] ?? null
      : null;

  function getUnitHeight(
    unitId: string
  ) {
    const [rowText] =
      unitId.split("-");

    const row =
      Number(rowText);

    const sorted =
      [...state.horizontalSplits].sort(
        (a, b) =>
          a.position -
          b.position
      );

    const positions = [
      0,
      ...sorted.map(
        (split) =>
          split.position
      ),
      1
    ];

    const start =
      positions[row] ?? 0;

    const end =
      positions[row + 1] ?? 1;

    return (
      (end - start) *
      state.overallHeight
    );
  }

  function getUnitWidth(
    unitId: string
  ) {
    const [, columnText] =
      unitId.split("-");

    const column =
      Number(columnText);

    const sorted =
      [...state.verticalSplits].sort(
        (a, b) =>
          a.position -
          b.position
      );

    const positions = [
      0,
      ...sorted.map(
        (split) =>
          split.position
      ),
      1
    ];

    const start =
      positions[column] ?? 0;

    const end =
      positions[column + 1] ?? 1;

    return (
      (end - start) *
      state.overallWidth
    );
  }

  function getSelectedUnitHeight() {
    if (!selectedUnit) {
      return 0;
    }

    return getUnitHeight(
      selectedUnit
    );
  }

  function buildUnitLayout(
    wide: number,
    tall: number
  ) {
    setState((current) => ({
      ...current,

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
        ),

      windowUnits:
        createWindowUnits(
          wide,
          tall
        )
    }));

    setHorizontalSizingMode(
      "equal"
    );

    setVerticalSizingMode(
      "equal"
    );

    setCustomWidths([]);
    setCustomHeights([]);

    setUnitSplitModes({});
    setUnitCustomHeights({});
    setPictureStyles({});

    setSelectedUnit(null);

    setFlangeType(
      "Nail Fin"
    );

    setExteriorColour(
      "White"
    );

    setWoodSpecies(
      "Pine"
    );

    setInteriorFinishType(
      "Ultra Stain"
    );

    setInteriorFinish(
      "Clear Coat"
    );

    setViewMode(
      "Exterior"
    );
    setGlassAppearance("Clear");
    setGlassPane("Double");
    setGlassLowE(true);
    setGlassSafety("None");

    setGridStyle(
      "None"
    );
  }

  function changeUnitsWide(
    value: number
  ) {
    const next = Math.max(
      1,
      Math.min(
        6,
        value
      )
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
      Math.min(
        4,
        value
      )
    );

    setUnitsTall(next);

    buildUnitLayout(
      unitsWide,
      next
    );
  }

  function applyEqualWidths() {
    setHorizontalSizingMode(
      "equal"
    );

    setCustomWidths([]);

    setState((current) => ({
      ...current,

      verticalSplits:
        createEqualSplits(
          unitsWide,
          "unit-v"
        )
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
          id: newId(
            "unit-v-1"
          ),
          position: 0.25
        },
        {
          id: newId(
            "unit-v-2"
          ),
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

      setState((current) => ({
        ...current,

        overallWidth:
          number,

        verticalSplits:
          splitsFromSizes(
            next.map(Number),
            number,
            "unit-v"
          )
      }));

      return;
    }

    setState((current) => ({
      ...current,
      overallWidth:
        number
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

      setState((current) => ({
        ...current,

        overallHeight:
          number,

        horizontalSplits:
          splitsFromSizes(
            next.map(Number),
            number,
            "unit-h"
          )
      }));

      return;
    }

    setState((current) => ({
      ...current,
      overallHeight:
        number
    }));
  }

  function handleFrameWidthChange(
    width: number
  ) {
    updateOverallWidth(
      width.toFixed(2)
    );
  }

  function handleFrameHeightChange(
    height: number
  ) {
    updateOverallHeight(
      height.toFixed(2)
    );
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

      setHorizontalSizingMode(
        "custom"
      );

      setCustomWidths(
        sizesFromSplits(
          splits,
          current.overallWidth
        )
      );

      return {
        ...current,
        verticalSplits:
          splits
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

      setVerticalSizingMode(
        "custom"
      );

      setCustomHeights(
        sizesFromSplits(
          splits,
          current.overallHeight
        )
      );

      return {
        ...current,
        horizontalSplits:
          splits
      };
    });
  }

  function changeSelectedNumberHigh(
    value: number
  ) {
    if (!selectedUnit) {
      return;
    }

    const tall =
      Math.max(
        1,
        Math.min(
          4,
          value
        )
      );

    setState((current) => {
      const existing =
        current.windowUnits?.[
          selectedUnit
        ] ??
        createWindowUnit(
          selectedUnit
        );

      return {
        ...current,

        windowUnits: {
          ...(current.windowUnits ??
            {}),

          [selectedUnit]: {
            ...existing,

            litesWide: 1,
            litesTall: tall,

            verticalSplits: [],

            horizontalSplits:
              createEqualSplits(
                tall,
                `lite-h-${selectedUnit}`
              ),

            liteConfigs:
              createLiteConfigs(
                1,
                tall
              )
          }
        }
      };
    });

    setUnitSplitModes(
      (current) => ({
        ...current,
        [selectedUnit]:
          "equal"
      })
    );

    setUnitCustomHeights(
      (current) => ({
        ...current,
        [selectedUnit]:
          []
      })
    );
  }

  function applyUnitSplit(
    splitMode: UnitSplitMode
  ) {
    if (
      !selectedUnit ||
      !selectedUnitConfig
    ) {
      return;
    }

    const count =
      selectedUnitConfig.litesTall;

    let positions:
      number[] = [];

    if (count === 2) {
      if (
        splitMode ===
        "equal"
      ) {
        positions = [0.5];
      }

      if (
        splitMode ===
        "top-third"
      ) {
        positions = [
          1 / 3
        ];
      }

      if (
        splitMode ===
        "bottom-third"
      ) {
        positions = [
          2 / 3
        ];
      }
    }

    if (count === 3) {
      if (
        splitMode ===
        "equal"
      ) {
        positions = [
          1 / 3,
          2 / 3
        ];
      }

      if (
        splitMode ===
        "center-feature"
      ) {
        positions = [
          0.25,
          0.75
        ];
      }

      if (
        splitMode ===
        "top-half"
      ) {
        positions = [
          0.5,
          0.75
        ];
      }

      if (
        splitMode ===
        "bottom-half"
      ) {
        positions = [
          0.25,
          0.5
        ];
      }
    }

    if (
      count === 4 &&
      splitMode ===
        "equal"
    ) {
      positions = [
        0.25,
        0.5,
        0.75
      ];
    }

    if (
      splitMode ===
      "custom"
    ) {
      const unitHeight =
        getSelectedUnitHeight();

      const currentSizes =
        sizesFromSplits(
          selectedUnitConfig.horizontalSplits,
          unitHeight
        );

      setUnitCustomHeights(
        (current) => ({
          ...current,
          [selectedUnit]:
            currentSizes
        })
      );

      setUnitSplitModes(
        (current) => ({
          ...current,
          [selectedUnit]:
            "custom"
        })
      );

      return;
    }

    const splits =
      positions.map(
        (
          position,
          index
        ) => ({
          id: newId(
            `lite-h-${selectedUnit}-${index}`
          ),
          position
        })
      );

    setState((current) => ({
      ...current,

      windowUnits: {
        ...(current.windowUnits ??
          {}),

        [selectedUnit]: {
          ...selectedUnitConfig,
          horizontalSplits:
            splits
        }
      }
    }));

    setUnitSplitModes(
      (current) => ({
        ...current,
        [selectedUnit]:
          splitMode
      })
    );

    setUnitCustomHeights(
      (current) => ({
        ...current,
        [selectedUnit]:
          []
      })
    );
  }

  function updateUnitCustomHeight(
    index: number,
    value: string
  ) {
    if (
      !selectedUnit ||
      !selectedUnitConfig
    ) {
      return;
    }

    const unitHeight =
      getSelectedUnitHeight();

    const current =
      unitCustomHeights[
        selectedUnit
      ] ??
      sizesFromSplits(
        selectedUnitConfig.horizontalSplits,
        unitHeight
      );

    let next = [...current];

    next[index] = value;

    const number =
      Number(value);

    if (
      !Number.isFinite(number) ||
      number <= 0
    ) {
      setUnitCustomHeights(
        (all) => ({
          ...all,
          [selectedUnit]:
            next
        })
      );

      return;
    }

    let autoIndex =
      next.length - 1;

    if (
      index ===
      next.length - 1
    ) {
      autoIndex =
        Math.max(
          0,
          next.length - 2
        );
    }

    next = rebalanceSizes(
      next,
      unitHeight,
      autoIndex
    );

    setUnitCustomHeights(
      (all) => ({
        ...all,
        [selectedUnit]:
          next
      })
    );

    const numbers =
      next.map(Number);

    if (
      numbers.every(
        (item) =>
          Number.isFinite(item) &&
          item > 0
      )
    ) {
      setState((currentState) => ({
        ...currentState,

        windowUnits: {
          ...(currentState.windowUnits ??
            {}),

          [selectedUnit]: {
            ...selectedUnitConfig,

            horizontalSplits:
              splitsFromSizes(
                numbers,
                unitHeight,
                `lite-h-${selectedUnit}`
              )
          }
        }
      }));
    }
  }

  function moveUnitHorizontalSplit(
    unitId: string,
    splitId: string,
    position: number
  ) {
    const unitHeight =
      getUnitHeight(
        unitId
      );

    setState((current) => {
      const unit =
        current.windowUnits?.[
          unitId
        ];

      if (!unit) {
        return current;
      }

      const nextSplits =
        unit.horizontalSplits
          .map(
            (split) =>
              split.id ===
              splitId
                ? {
                    ...split,
                    position
                  }
                : split
          )
          .sort(
            (a, b) =>
              a.position -
              b.position
          );

      const updatedSizes =
        sizesFromSplits(
          nextSplits,
          unitHeight
        );

      if (
        productType ===
        "Slider"
      ) {
        setSliderSplitMode(
          "custom"
        );

        setSliderCustomSizes(
          updatedSizes
        );
      } else {
        setUnitSplitModes(
          (modes) => ({
            ...modes,
            [unitId]:
              "custom"
          })
        );

        setUnitCustomHeights(
          (heights) => ({
            ...heights,
            [unitId]:
              updatedSizes
          })
        );
      }

      return {
        ...current,

        windowUnits: {
          ...(current.windowUnits ??
            {}),

          [unitId]: {
            ...unit,
            horizontalSplits:
              nextSplits
          }
        }
      };
    });
  }

  function moveUnitVerticalSplit(
    unitId: string,
    splitId: string,
    position: number
  ) {
    const unitWidth =
      getUnitWidth(
        unitId
      );

    setState((current) => {
      const unit =
        current.windowUnits?.[
          unitId
        ];

      if (!unit) {
        return current;
      }

      const nextSplits =
        unit.verticalSplits
          .map(
            (split) =>
              split.id ===
              splitId
                ? {
                    ...split,
                    position
                  }
                : split
          )
          .sort(
            (a, b) =>
              a.position -
              b.position
          );

      const updatedSizes =
        sizesFromSplits(
          nextSplits,
          unitWidth
        );

      setSliderSplitMode(
        "custom"
      );

      setSliderCustomSizes(
        updatedSizes
      );

      return {
        ...current,

        windowUnits: {
          ...(current.windowUnits ??
            {}),

          [unitId]: {
            ...unit,

            verticalSplits:
              nextSplits
          }
        }
      };
    });
  }

  function setLiteOperation(
    unitId: string,
    liteId: string,
    operation: LiteOperation,
    pictureStyle?: PictureStyle
  ) {
    setState((current) => {
      const unit =
        current.windowUnits?.[
          unitId
        ];

      if (!unit) {
        return current;
      }

      return {
        ...current,

        windowUnits: {
          ...(current.windowUnits ??
            {}),

          [unitId]: {
            ...unit,

            liteConfigs: {
              ...unit.liteConfigs,

              [liteId]: {
                type:
                  operation as PanelType
              }
            }
          }
        }
      };
    });

    const key =
      `${unitId}:${liteId}`;

    if (
      operation === "Picture" &&
      pictureStyle
    ) {
      setPictureStyles(
        (current) => ({
          ...current,
          [key]:
            pictureStyle
        })
      );
    } else {
      setPictureStyles(
        (current) => {
          const next = {
            ...current
          };

          delete next[key];

          return next;
        }
      );
    }
  }

  function horizontalPositions(
    type: HorizontalSliderType,
    splitMode: SliderSplitMode
  ) {
    if (
      type ===
      "Double Vent + Centre Picture"
    ) {
      if (
        splitMode ===
        "center-feature"
      ) {
        return [
          0.25,
          0.75
        ];
      }

      return [
        1 / 3,
        2 / 3
      ];
    }

    if (
      splitMode ===
      "one-third"
    ) {
      return [
        1 / 3
      ];
    }

    if (
      splitMode ===
      "two-thirds"
    ) {
      return [
        2 / 3
      ];
    }

    return [
      0.5
    ];
  }

  function applyHorizontalSliderToUnit(
    unitId: string,
    type: HorizontalSliderType,
    splitMode: SliderSplitMode
  ) {
    const unitWidth =
      getUnitWidth(
        unitId
      );

    if (
      splitMode ===
      "custom"
    ) {
      const unit =
        state.windowUnits?.[
          unitId
        ];

      if (!unit) {
        return;
      }

      setSliderCustomSizes(
        sizesFromSplits(
          unit.verticalSplits,
          unitWidth
        )
      );

      return;
    }

    const positions =
      horizontalPositions(
        type,
        splitMode
      );

    const litesWide =
      type ===
      "Double Vent + Centre Picture"
        ? 3
        : 2;

    const splits =
      positions.map(
        (
          position,
          index
        ) => ({
          id: newId(
            `slider-v-${unitId}-${index}`
          ),
          position
        })
      );

    setState((current) => {
      const existing =
        current.windowUnits?.[
          unitId
        ] ??
        createWindowUnit(
          unitId
        );

      return {
        ...current,

        windowUnits: {
          ...(current.windowUnits ??
            {}),

          [unitId]: {
            ...existing,

            litesWide,
            litesTall: 1,

            verticalSplits:
              splits,

            horizontalSplits:
              [],

            liteConfigs:
              createLiteConfigs(
                litesWide,
                1
              )
          }
        }
      };
    });

    setSliderCustomSizes(
      []
    );

    setPatioSizePreset(
      "6068"
    );
    setPatioPanelCount(
      2
    );
    setPatioHanding(
      "Active Left"
    );
  }

  function applyVerticalSliderToUnit(
    unitId: string,
    splitMode: SliderSplitMode
  ) {
    const unitHeight =
      getUnitHeight(
        unitId
      );

    if (
      splitMode ===
      "custom"
    ) {
      const unit =
        state.windowUnits?.[
          unitId
        ];

      if (!unit) {
        return;
      }

      setSliderCustomSizes(
        sizesFromSplits(
          unit.horizontalSplits,
          unitHeight
        )
      );

      return;
    }

    let position =
      0.5;

    if (
      splitMode ===
      "one-third"
    ) {
      position =
        1 / 3;
    }

    if (
      splitMode ===
      "two-thirds"
    ) {
      position =
        2 / 3;
    }

    setState((current) => {
      const existing =
        current.windowUnits?.[
          unitId
        ] ??
        createWindowUnit(
          unitId
        );

      return {
        ...current,

        windowUnits: {
          ...(current.windowUnits ??
            {}),

          [unitId]: {
            ...existing,

            litesWide: 1,
            litesTall: 2,

            verticalSplits:
              [],

            horizontalSplits: [
              {
                id: newId(
                  `slider-h-${unitId}`
                ),
                position
              }
            ],

            liteConfigs:
              createLiteConfigs(
                1,
                2
              )
          }
        }
      };
    });

    setSliderCustomSizes(
      []
    );
  }

  function handleSelectUnit(
    unitId: string
  ) {
    setSelectedUnit(
      unitId
    );

    if (
      productType !==
      "Slider"
    ) {
      return;
    }

    if (
      sliderOrientation ===
      "Horizontal"
    ) {
      applyHorizontalSliderToUnit(
        unitId,
        horizontalSliderType,
        sliderSplitMode
      );
    } else {
      applyVerticalSliderToUnit(
        unitId,
        sliderSplitMode
      );
    }
  }

  function updateSliderCustomSize(
    index: number,
    value: string
  ) {
    if (!selectedUnit) {
      return;
    }

    const unit =
      state.windowUnits?.[
        selectedUnit
      ];

    if (!unit) {
      return;
    }

    const horizontal =
      sliderOrientation ===
      "Horizontal";

    const total =
      horizontal
        ? getUnitWidth(
            selectedUnit
          )
        : getUnitHeight(
            selectedUnit
          );

    let next =
      sliderCustomSizes.length
        ? [
            ...sliderCustomSizes
          ]
        : horizontal
        ? sizesFromSplits(
            unit.verticalSplits,
            total
          )
        : sizesFromSplits(
            unit.horizontalSplits,
            total
          );

    next[index] =
      value;

    const number =
      Number(value);

    if (
      !Number.isFinite(number) ||
      number <= 0
    ) {
      setSliderCustomSizes(
        next
      );

      return;
    }

    let autoIndex =
      next.length - 1;

    if (
      index ===
      next.length - 1
    ) {
      autoIndex =
        Math.max(
          0,
          next.length - 2
        );
    }

    next = rebalanceSizes(
      next,
      total,
      autoIndex
    );

    setSliderCustomSizes(
      next
    );

    const numbers =
      next.map(Number);

    if (
      !numbers.every(
        (item) =>
          Number.isFinite(item) &&
          item > 0
      )
    ) {
      return;
    }

    setState((current) => {
      const currentUnit =
        current.windowUnits?.[
          selectedUnit
        ];

      if (!currentUnit) {
        return current;
      }

      return {
        ...current,

        windowUnits: {
          ...(current.windowUnits ??
            {}),

          [selectedUnit]: {
            ...currentUnit,

            verticalSplits:
              horizontal
                ? splitsFromSizes(
                    numbers,
                    total,
                    `slider-v-${selectedUnit}`
                  )
                : [],

            horizontalSplits:
              horizontal
                ? []
                : splitsFromSizes(
                    numbers,
                    total,
                    `slider-h-${selectedUnit}`
                  )
          }
        }
      };
    });
  }

  function applyBrandDefaults(
    nextBrand: Brand,
    nextLine: string
  ) {
    if (
      nextBrand === "Duxton" ||
      (nextBrand === "Durabuilt" && nextLine === "Delta Fiberglass")
    ) {
      setWindowType("Fiberglass");
      return;
    }

    if (nextBrand === "Sierra Pacific") {
      setWindowType("Aluminum / Wood");
      return;
    }

    if (
      nextBrand === "Cortizo" ||
      (nextBrand === "All Weather" && nextLine === "Apex Alloy 9950")
    ) {
      setWindowType("Aluminum");
      return;
    }

    setWindowType("Vinyl");
  }

  function setPatioOverallSize(
    width: number,
    height: number
  ) {
    setWidthInput(
      String(width)
    );
    setHeightInput(
      String(height)
    );

    setState(
      (current) => ({
        ...current,
        overallWidth: width,
        overallHeight: height,
        verticalSplits: [],
        horizontalSplits: [],
        panelConfigs: {
          "0-0": {
            type: "Picture"
          }
        },
        windowUnits: {
          "0-0":
            createWindowUnit(
              "0-0"
            )
        }
      })
    );

    setUnitsWide(1);
    setUnitsTall(1);
    setSelectedUnit(
      "0-0"
    );
  }

  function applyPatioPreset(
    preset: PatioSizePreset
  ) {
    setPatioSizePreset(
      preset
    );

    if (
      preset === "Custom"
    ) {
      return;
    }

    const sizes: Record<
      Exclude<
        PatioSizePreset,
        "Custom"
      >,
      {
        width: number;
        height: number;
        panels: PatioPanelCount;
      }
    > = {
      "5068": {
        width: 60,
        height: 80,
        panels: 2
      },
      "6068": {
        width: 72,
        height: 80,
        panels: 2
      },
      "8068": {
        width: 96,
        height: 80,
        panels: 2
      },
      "1068": {
        width: 120,
        height: 80,
        panels: 3
      },
      "12068": {
        width: 144,
        height: 80,
        panels: 4
      },
      "16068": {
        width: 192,
        height: 80,
        panels: 4
      }
    };

    const next =
      sizes[preset];

    setPatioPanelCount(
      next.panels
    );

    setPatioOverallSize(
      next.width,
      next.height
    );
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

    setHorizontalSliderType(
      "Single Vent"
    );

    setVerticalSliderType(
      "Single Hung"
    );

    setSliderPattern(
      "XO"
    );

    setSliderSplitMode(
      "equal"
    );

    setSliderCustomSizes(
      []
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

    setUnitSplitModes({});
    setUnitCustomHeights({});
    setPictureStyles({});

    setSelectedUnit(null);

    setBrand("Vinyltek");
    setProductLine("Boréal");
    setWindowType(
      "Vinyl"
    );
    setExteriorColour(
      "White"
    );
    setInteriorColour(
      "White"
    );
    setWoodSpecies(
      "Douglas Fir"
    );
    setWoodFinish(
      "Clear Coat"
    );
    setWoodStain(
      "Bearstone Brown"
    );
    setViewMode(
      "Exterior"
    );
    setGlassAppearance(
      "No"
    );
    setGlassPane(
      "Double"
    );
    setLowEPackage(
      "LoE2-270"
    );
    setGlassSafety(
      "None"
    );
  }

  function save() {
    localStorage.setItem(
      "pv-app-react-v17",

      JSON.stringify({
        state,
        gridStyle,
        flangeType,
        brand,
        productLine,
        windowType,
        exteriorColour,
        interiorColour,
        woodSpecies,
        woodFinish,
        woodStain,
        viewMode,
        glassAppearance,
        glassPane,
        lowEPackage,
        glassSafety,
        productType,
        sliderOrientation,
        horizontalSliderType,
        verticalSliderType,
        sliderPattern,
        sliderSplitMode,
        patioSizePreset,
        patioPanelCount,
        patioHanding,
        unitsWide,
        unitsTall,
        pictureStyles
      })
    );

    const button =
      document.getElementById(
        "save-button"
      );

    if (button) {
      button.textContent =
        "Saved";

      setTimeout(
        () => {
          button.textContent =
            "Save";
        },
        900
      );
    }
  }

  const selectedSplitMode =
    selectedUnit
      ? unitSplitModes[
          selectedUnit
        ] ?? "equal"
      : "equal";

  const selectedCustomHeights =
    selectedUnit
      ? unitCustomHeights[
          selectedUnit
        ] ?? []
      : [];

  const singleVentHanding =
    sliderPattern === "OX"
      ? "Right Vent"
      : "Left Vent";

  const interiorFinishDescription =
    windowType === "Aluminum / Wood"
      ? woodFinish === "Clear Coat"
        ? `${woodSpecies} / Clear Coat`
        : woodFinish === "Stained"
        ? `${woodSpecies} / ${woodStain} stain`
        : woodFinish === "Primed White"
        ? `${woodSpecies} / Primed White`
        : `${woodSpecies} / Painted ${interiorColour}`
      : interiorColour;

  const operationDescription =
    productType === "Slider"
      ? sliderOrientation === "Horizontal"
        ? `${horizontalSliderType} ${sliderPattern}`
        : verticalSliderType
      : productType ===
        "Patio Door"
      ? `${patioPanelCount} Panel Patio Door`
      : productType;

  const configurationParts = [
    `${brand} / ${productLine}`,
    operationDescription,
    productType === "Patio Door"
      ? `${patioSizePreset === "Custom" ? "Custom" : patioSizePreset} / ${state.overallWidth}" x ${state.overallHeight}"`
      : null,
    windowType,
    `Exterior: ${exteriorColour}`,
    `Interior: ${interiorFinishDescription}`,
    flangeType,
    `${glassPane} Pane`,
    lowEPackage,
    glassAppearance === "Yes"
      ? "Obscure"
      : null,
    glassSafety !== "None"
      ? glassSafety
      : null,
    gridStyle !== "None"
      ? `Grids: ${gridStyle}`
      : null
  ].filter(Boolean);

  const configurationSummary =
    configurationParts.join(" • ");

  return (
    <>
      <style>{`
        .pv-responsive-layout {
          display: grid !important;
          grid-template-columns: minmax(430px, 500px) minmax(0, 1fr) !important;
          gap: 14px;
          height: calc(100vh - 76px);
          overflow: hidden;
        }

        .pv-options-panel {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          align-content: start;
          height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          padding-bottom: 40px;
        }

        .pv-options-panel > .config-section {
          margin: 0 !important;
          min-width: 0;
        }

        .pv-options-panel > .pv-wide-section {
          grid-column: 1 / -1;
        }

        .pv-options-panel .number-row {
          gap: 8px;
        }

        .pv-drawing-panel {
          height: 100%;
          overflow: hidden;
          align-self: start;
          min-width: 0;
        }

        .pv-canvas-wrap {
          position: sticky;
          top: 0;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
        }

        .pv-canvas-wrap svg {
          display: block;
          width: 100% !important;
          height: auto !important;
          max-width: 100% !important;
        }

        @media (max-width: 760px) {
          .pv-responsive-layout {
            display: flex !important;
            flex-direction: column !important;
            height: auto !important;
            min-height: calc(100vh - 76px);
            overflow: visible !important;
          }

          .pv-drawing-panel {
            order: 1;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            padding: 8px 10px 4px !important;
            box-sizing: border-box;
          }

          .pv-options-panel {
            order: 2;
            display: grid !important;
            grid-template-columns: 1fr !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            padding: 10px 12px 40px !important;
            box-sizing: border-box;
          }

          .pv-options-panel > .config-section,
          .pv-options-panel > .pv-wide-section {
            grid-column: 1 !important;
          }

          .pv-canvas-wrap {
            position: static !important;
          }

          .pv-options-panel .number-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

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

      <main className="configurator-layout pv-responsive-layout">

        <aside className="config-panel pv-options-panel">

          <section className="config-section pv-wide-section">
            <div className="step-title">
              Brand & Product Line
            </div>

            <div className="number-row">
              <label>
                Brand
                <select
                  value={brand}
                  onChange={(event) => {
                    const nextBrand = event.target.value as Brand;
                    const nextLine = PRODUCT_LINES[nextBrand][0];
                    setBrand(nextBrand);
                    setProductLine(nextLine);
                    applyBrandDefaults(nextBrand, nextLine);
                  }}
                >
                  {(Object.keys(PRODUCT_LINES) as Brand[]).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Product Line
                <select
                  value={productLine}
                  onChange={(event) => {
                    const nextLine = event.target.value;
                    setProductLine(nextLine);
                    applyBrandDefaults(brand, nextLine);
                  }}
                >
                  {PRODUCT_LINES[brand].map((line) => (
                    <option key={line} value={line}>
                      {line}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="config-section pv-wide-section">

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

               onClick={() => {
  const unitId =
    selectedUnit ?? "0-0";

  setProductType(
    "Slider"
  );

  setSliderOrientation(
    "Horizontal"
  );

  setHorizontalSliderType(
    "Single Vent"
  );

  setSliderPattern(
    "XO"
  );

  setSliderSplitMode(
    "equal"
  );

  setSliderCustomSizes(
    []
  );

  setSelectedUnit(
    unitId
  );

  applyHorizontalSliderToUnit(
    unitId,
    "Single Vent",
    "equal"
  );
}}
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

                onClick={() => {
                  setProductType(
                    "Patio Door"
                  );

                  applyPatioPreset(
                    patioSizePreset
                  );
                }}
              >
                Patio Door
              </button>

            </div>

          </section>

          {productType ===
            "Patio Door" && (

            <section className="config-section pv-wide-section">

              <div className="step-title">
                2. Patio Door Configuration
              </div>

              <div className="number-row">

                <label>
                  Standard Size

                  <select
                    value={
                      patioSizePreset
                    }
                    onChange={(event) =>
                      applyPatioPreset(
                        event.target.value as PatioSizePreset
                      )
                    }
                  >
                    <option value="5068">
                      5068
                    </option>
                    <option value="6068">
                      6068
                    </option>
                    <option value="8068">
                      8068
                    </option>
                    <option value="1068">
                      1068
                    </option>
                    <option value="12068">
                      12068 (12')
                    </option>
                    <option value="16068">
                      16068 (16')
                    </option>
                    <option value="Custom">
                      Custom
                    </option>
                  </select>
                </label>

                <label>
                  Panels

                  <select
                    value={
                      patioPanelCount
                    }
                    onChange={(event) =>
                      setPatioPanelCount(
                        Number(
                          event.target.value
                        ) as PatioPanelCount
                      )
                    }
                  >
                    <option value={2}>
                      2 Panel
                    </option>
                    <option value={3}>
                      3 Panel
                    </option>
                    <option value={4}>
                      4 Panel
                    </option>
                  </select>
                </label>

              </div>

              {patioPanelCount ===
                2 && (

                <div
                  className="number-row"
                  style={{
                    marginTop: 10
                  }}
                >
                  <label>
                    Moving Panel

                    <select
                      value={
                        patioHanding
                      }
                      onChange={(event) =>
                        setPatioHanding(
                          event.target.value as PatioHanding
                        )
                      }
                    >
                      <option value="Active Left">
                        Left Panel
                      </option>
                      <option value="Active Right">
                        Right Panel
                      </option>
                    </select>
                  </label>
                </div>

              )}

              <div
                className="split-note"
                style={{
                  marginTop: 10
                }}
              >
                3 panel: centre panel operates. 4 panel: two centre panels operate.
              </div>

            </section>

          )}

          {productType ===
            "Slider" && (

            <section className="config-section pv-wide-section">

              <div className="step-title">
                2. Slider Configuration
              </div>

              <div className="number-row">

                <label>
                  Orientation

                  <select
                    value={
                      sliderOrientation
                    }

                    onChange={(event) => {
                      const next =
                        event.target.value as SliderOrientation;

                      setSliderOrientation(
                        next
                      );

                      setSliderCustomSizes(
                        []
                      );

                      setSliderSplitMode(
                        "equal"
                      );

                      if (
                        next ===
                        "Horizontal"
                      ) {
                        setHorizontalSliderType(
                          "Single Vent"
                        );

                        setSliderPattern(
                          "XO"
                        );

                        if (
                          selectedUnit
                        ) {
                          applyHorizontalSliderToUnit(
                            selectedUnit,
                            "Single Vent",
                            "equal"
                          );
                        }
                      } else {
                        setVerticalSliderType(
                          "Single Hung"
                        );

                        if (
                          selectedUnit
                        ) {
                          applyVerticalSliderToUnit(
                            selectedUnit,
                            "equal"
                          );
                        }
                      }
                    }}
                  >
                    <option value="Horizontal">
                      Horizontal
                    </option>

                    <option value="Vertical">
                      Vertical
                    </option>
                  </select>
                </label>

                {sliderOrientation ===
                "Horizontal" ? (

                  <label>
                    Slider Type

                    <select
                      value={
                        horizontalSliderType
                      }

                      onChange={(event) => {
                        const next =
                          event.target.value as HorizontalSliderType;

                        setHorizontalSliderType(
                          next
                        );

                        let pattern:
                          SliderPattern =
                          "XO";

                        let split:
                          SliderSplitMode =
                          "equal";

                        if (
                          next ===
                          "Double Slider"
                        ) {
                          pattern =
                            "XX";
                        }

                        if (
                          next ===
                          "Double Vent + Centre Picture"
                        ) {
                          pattern =
                            "XOX";

                          split =
                            "center-feature";
                        }

                        setSliderPattern(
                          pattern
                        );

                        setSliderSplitMode(
                          split
                        );

                        setSliderCustomSizes(
                          []
                        );

                        if (
                          selectedUnit
                        ) {
                          applyHorizontalSliderToUnit(
                            selectedUnit,
                            next,
                            split
                          );
                        }
                      }}
                    >
                      <option value="Single Vent">
                        Single Vent
                      </option>

                      <option value="Double Slider">
                        Double Slider
                      </option>

                      <option value="Double Vent + Centre Picture">
                        Double Vent + Centre Picture
                      </option>
                    </select>
                  </label>

                ) : (

                  <label>
                    Hung Type

                    <select
                      value={
                        verticalSliderType
                      }

                      onChange={(event) => {
                        const next =
                          event.target.value as VerticalSliderType;

                        setVerticalSliderType(
                          next
                        );

                        setSliderSplitMode(
                          "equal"
                        );

                        setSliderCustomSizes(
                          []
                        );

                        if (
                          selectedUnit
                        ) {
                          applyVerticalSliderToUnit(
                            selectedUnit,
                            "equal"
                          );
                        }
                      }}
                    >
                      <option value="Single Hung">
                        Single Hung
                      </option>

                      <option value="Double Hung">
                        Double Hung
                      </option>
                    </select>
                  </label>

                )}

              </div>

              {sliderOrientation ===
                "Horizontal" &&
                horizontalSliderType ===
                  "Single Vent" && (

                <div
                  style={{
                    marginTop: 10
                  }}
                >

                  <label>
                    Configuration

                    <select
                      value={
                        sliderPattern
                      }

                      onChange={(event) =>
                        setSliderPattern(
                          event.target.value as SliderPattern
                        )
                      }
                    >
                      <option value="XO">
                        XO — Vent Left
                      </option>

                      <option value="OX">
                        OX — Vent Right
                      </option>
                    </select>

                  </label>

                </div>

              )}

              {sliderOrientation ===
                "Horizontal" &&
                horizontalSliderType ===
                  "Double Slider" && (

                <div
                  className="split-note"
                  style={{
                    marginTop: 10
                  }}
                >
                  Configuration: <strong>XX</strong> — both sashes operate
                </div>

              )}

              {sliderOrientation ===
                "Horizontal" &&
                horizontalSliderType ===
                  "Double Vent + Centre Picture" && (

                <div
                  className="split-note"
                  style={{
                    marginTop: 10
                  }}
                >
                  Configuration: <strong>XOX</strong> — outside vents operate, centre fixed
                </div>

              )}

              {selectedUnit && (

                <div
                  style={{
                    marginTop: 10
                  }}
                >

                  <label>
                    Split

                    <select
                      value={
                        sliderSplitMode
                      }

                      onChange={(event) => {
                        const next =
                          event.target.value as SliderSplitMode;

                        setSliderSplitMode(
                          next
                        );

                        if (
                          sliderOrientation ===
                          "Horizontal"
                        ) {
                          applyHorizontalSliderToUnit(
                            selectedUnit,
                            horizontalSliderType,
                            next
                          );
                        } else {
                          applyVerticalSliderToUnit(
                            selectedUnit,
                            next
                          );
                        }
                      }}
                    >

                      {sliderOrientation ===
                        "Horizontal" &&
                        horizontalSliderType !==
                          "Double Vent + Centre Picture" && (
                          <>
                            <option value="equal">
                              1/2 - 1/2
                            </option>

                            <option value="one-third">
                              1/3 - 2/3
                            </option>

                            <option value="two-thirds">
                              2/3 - 1/3
                            </option>

                            <option value="custom">
                              Custom
                            </option>
                          </>
                        )}

                      {sliderOrientation ===
                        "Horizontal" &&
                        horizontalSliderType ===
                          "Double Vent + Centre Picture" && (
                          <>
                            <option value="center-feature">
                              1/4 - 1/2 - 1/4
                            </option>

                            <option value="equal">
                              1/3 - 1/3 - 1/3
                            </option>

                            <option value="custom">
                              Custom
                            </option>
                          </>
                        )}

                      {sliderOrientation ===
                        "Vertical" && (
                          <>
                            <option value="equal">
                              1/2 - 1/2
                            </option>

                            <option value="one-third">
                              1/3 - 2/3
                            </option>

                            <option value="two-thirds">
                              2/3 - 1/3
                            </option>

                            <option value="custom">
                              Custom
                            </option>
                          </>
                        )}

                    </select>
                  </label>

                  {sliderSplitMode ===
                    "custom" && (

                    <div
                      className="number-row"
                      style={{
                        marginTop: 10
                      }}
                    >

                      {sliderCustomSizes.map(
                        (
                          value,
                          index
                        ) => (

                          <label
                            key={index}
                          >
                            Section{" "}
                            {index + 1}

                            <input
                              type="text"
                              inputMode="decimal"
                              value={value}

                              onChange={(
                                event
                              ) =>
                                updateSliderCustomSize(
                                  index,
                                  event.target.value
                                )
                              }
                            />

                          </label>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}

              {!selectedUnit && (

                <div className="split-note">
                  Tap a unit in the drawing to configure its slider.
                </div>

              )}

            </section>

          )}

          <section className="config-section">

            <div className="step-title">
              Overall Window Size
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
          <section className="config-section">

            <div className="step-title">
              Number of Units
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

          {unitsWide > 1 && (

            <section className="config-section pv-wide-section">

              <div className="step-title">
                Unit Widths
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
                          Unit{" "}
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

                </div>

              )}

            </section>

          )}

          {unitsTall > 1 && (

            <section className="config-section pv-wide-section">

              <div className="step-title">
                Unit Heights
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
                          Unit Row{" "}
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


          {productType ===
            "Casement / Awning" && (

            <section className="config-section pv-wide-section">

              <div className="step-title">
                Configure Unit
              </div>

              <div className="selected-info">
                {selectedUnit
                  ? `Unit ${selectedUnit} selected`
                  : "Tap a unit in the drawing"}
              </div>

              {selectedUnitConfig && (

                <>
                  <div className="number-row">

                    <label>
                      Number High

                      <select
                        value={
                          selectedUnitConfig.litesTall
                        }

                        onChange={(event) =>
                          changeSelectedNumberHigh(
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

                    {selectedUnitConfig.litesTall >
                      1 && (

                      <label>
                        Split

                        <select
                          value={
                            selectedSplitMode
                          }

                          onChange={(event) =>
                            applyUnitSplit(
                              event.target.value as UnitSplitMode
                            )
                          }
                        >
                          <option value="equal">
                            {selectedUnitConfig.litesTall ===
                            2
                              ? "1/2 - 1/2"
                              : selectedUnitConfig.litesTall ===
                                3
                              ? "1/3 - 1/3 - 1/3"
                              : "Equal"}
                          </option>

                          {selectedUnitConfig.litesTall ===
                            2 && (
                            <>
                              <option value="top-third">
                                1/3 - 2/3
                              </option>

                              <option value="bottom-third">
                                2/3 - 1/3
                              </option>
                            </>
                          )}

                          {selectedUnitConfig.litesTall ===
                            3 && (
                            <>
                              <option value="center-feature">
                                1/4 - 1/2 - 1/4
                              </option>

                              <option value="top-half">
                                1/2 - 1/4 - 1/4
                              </option>

                              <option value="bottom-half">
                                1/4 - 1/4 - 1/2
                              </option>
                            </>
                          )}

                          <option value="custom">
                            Custom
                          </option>
                        </select>
                      </label>

                    )}

                  </div>

                  {selectedSplitMode ===
                    "custom" &&
                    selectedUnitConfig.litesTall >
                      1 && (

                    <div
                      style={{
                        marginTop: 10
                      }}
                    >

                      <div className="number-row">

                        {selectedCustomHeights.map(
                          (
                            value,
                            index
                          ) => (

                            <label
                              key={index}
                            >
                              Lite{" "}
                              {index + 1}

                              <input
                                type="text"
                                inputMode="decimal"
                                value={value}

                                onChange={(
                                  event
                                ) =>
                                  updateUnitCustomHeight(
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

                </>

              )}

            </section>

          )}
<section className="config-section">

  <div className="step-title">
    Flange Type
  </div>

  <label>
    Flange

    <select
      value={flangeType}
      onChange={(event) =>
        setFlangeType(
          event.target.value as FlangeType
        )
      }
    >
      <option value="Nail Fin">
        Nail Fin
      </option>

      <option value="Brick Mould">
        Brick Mould
      </option>

      <option value="Reno Flange">
        Reno Flange
      </option>
    </select>
  </label>

</section>

<section className="config-section pv-wide-section">

  <div className="step-title">
    Window Type & Colour
  </div>

  <label>
    Window Type

    <select
      value={windowType}
      onChange={(event) =>
        setWindowType(
          event.target.value as WindowType
        )
      }
    >
      <option value="Vinyl">
        Vinyl
      </option>
      <option value="Aluminum">
        Aluminum
      </option>
      <option value="Aluminum / Wood">
        Aluminum / Wood
      </option>
      <option value="Fiberglass">
        Fiberglass
      </option>
    </select>
  </label>

  <div
    className="number-row"
    style={{
      marginTop: 10
    }}
  >
    <label>
      Exterior Colour

      <select
        value={exteriorColour}
        onChange={(event) =>
          setExteriorColour(
            event.target.value
          )
        }
      >
        {STANDARD_COLOURS.map(
          ([name, code]) => (
            <option
              key={code}
              value={name}
            >
              {name}
              {code !== "CUSTOM"
                ? ` (${code})`
                : ""}
            </option>
          )
        )}
      </select>
    </label>

    <label>
      Interior Colour

      <select
        value={interiorColour}
        onChange={(event) =>
          setInteriorColour(
            event.target.value
          )
        }
      >
        {STANDARD_COLOURS.map(
          ([name, code]) => (
            <option
              key={code}
              value={name}
            >
              {name}
              {code !== "CUSTOM"
                ? ` (${code})`
                : ""}
            </option>
          )
        )}
      </select>
    </label>
  </div>

  {windowType ===
    "Aluminum / Wood" && (
    <>
      <div
        className="number-row"
        style={{
          marginTop: 10
        }}
      >
        <label>
          Wood Species

          <select
            value={woodSpecies}
            onChange={(event) =>
              setWoodSpecies(
                event.target.value as WoodSpecies
              )
            }
          >
            {WOOD_SPECIES.map(
              (species) => (
                <option
                  key={species}
                  value={species}
                >
                  {species}
                </option>
              )
            )}
          </select>
        </label>

        <label>
          Wood Finish

          <select
            value={woodFinish}
            onChange={(event) =>
              setWoodFinish(
                event.target.value as WoodFinishType
              )
            }
          >
            <option value="Clear Coat">
              Clear Coat
            </option>
            <option value="Stained">
              Stained
            </option>
            <option value="Painted">
              Painted
            </option>
            <option value="Primed White">
              Primed White
            </option>
          </select>
        </label>
      </div>

      {woodFinish ===
        "Stained" && (
        <div
          style={{
            marginTop: 10
          }}
        >
          <label>
            Stain

            <select
              value={woodStain}
              onChange={(event) =>
                setWoodStain(
                  event.target.value
                )
              }
            >
              {WOOD_STAINS.map(
                (finish) => (
                  <option
                    key={finish}
                    value={finish}
                  >
                    {finish}
                  </option>
                )
              )}
            </select>
          </label>
        </div>
      )}

      <div
        className="split-note"
        style={{
          marginTop: 10
        }}
      >
        Interior colour applies when the wood interior is painted. Clear Coat shows the selected wood species.
      </div>
    </>
  )}

</section>

<section className="config-section pv-wide-section">

  <div className="step-title">
    Glass
  </div>

  <div className="number-row">
    <label>
      Obscure Glass?

      <select
        value={glassAppearance}
        onChange={(event) =>
          setGlassAppearance(
            event.target.value as GlassAppearance
          )
        }
      >
        <option value="No">
          No
        </option>
        <option value="Yes">
          Yes
        </option>
      </select>
    </label>

    <label>
      Panes

      <select
        value={glassPane}
        onChange={(event) => {
          const next =
            event.target.value as GlassPane;

          setGlassPane(next);

          setLowEPackage(
            next === "Triple"
              ? "272 / Clear / 180"
              : "LoE2-270"
          );
        }}
      >
        <option value="Double">
          Double
        </option>
        <option value="Triple">
          Triple
        </option>
      </select>
    </label>
  </div>

  <div
    className="number-row"
    style={{
      marginTop: 10
    }}
  >
    <label>
      Low-E Package

      <select
        value={lowEPackage}
        onChange={(event) =>
          setLowEPackage(
            event.target.value
          )
        }
      >
        {(glassPane === "Double"
          ? DOUBLE_LOW_E_OPTIONS
          : TRIPLE_LOW_E_OPTIONS
        ).map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </label>

    <label>
      Safety Glass

      <select
        value={glassSafety}
        onChange={(event) =>
          setGlassSafety(
            event.target.value as GlassSafety
          )
        }
      >
        <option value="None">
          None
        </option>
        <option value="Tempered">
          Tempered
        </option>
        <option value="Laminated">
          Laminated
        </option>
      </select>
    </label>
  </div>

</section>

<section className="config-section">

  <div className="step-title">
    Grids
  </div>

  <label>
    Grid Style

    <select
      value={gridStyle}
      onChange={(event) =>
        setGridStyle(
          event.target.value as GridStyle
        )
      }
    >
      <option value="None">
        None
      </option>

      <option value="Colonial">
        Colonial
      </option>

      <option value="Top Colonial">
        Top Colonial
      </option>

      <option value="Prairie">
        Prairie
      </option>
    </select>
  </label>

</section>
        </aside>

        <section className="drawing-area pv-drawing-panel">

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
                {unitsWide} unit
                {unitsWide !== 1
                  ? "s"
                  : ""}{" "}
                wide ×{" "}
                {unitsTall} unit
                {unitsTall !== 1
                  ? "s"
                  : ""}{" "}
                tall
              </span>
            </div>

            <div className="drawing-actions">

              <button
                className={
                  viewMode ===
                  "Exterior"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setViewMode(
                    "Exterior"
                  )
                }
              >
                Exterior
              </button>

              <button
                className={
                  viewMode ===
                  "Interior"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setViewMode(
                    "Interior"
                  )
                }
              >
                Interior
              </button>

              <button
                onClick={reset}
              >
                Reset
              </button>

            </div>

          </div>

          <div className="canvas-wrap pv-canvas-wrap">

            <WindowCanvas
              key={`${productType}-${patioPanelCount}-${patioHanding}-${viewMode}`}
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

              windowUnits={
                state.windowUnits
              }

              pictureStyles={
                pictureStyles
              }

              productType={
                productType
              }

              sliderOrientation={
                sliderOrientation
              }

              horizontalSliderType={
                horizontalSliderType
              }

              verticalSliderType={
                verticalSliderType
              }

              singleVentHanding={
                singleVentHanding
              }

              patioPanelCount={
                patioPanelCount
              }

              patioHanding={
                patioHanding
              }

              viewMode={
                viewMode
              }

              windowType={
                windowType
              }

              exteriorColour={
                exteriorColour
              }

              interiorColour={
                interiorColour
              }

              woodSpecies={
                woodSpecies
              }

              woodFinish={
                woodFinish
              }

              woodStain={
                woodStain
              }

              flangeType={flangeType}
              glassAppearance={glassAppearance}
              glassPane={glassPane}
              glassLowEPackage={lowEPackage}
              glassSafety={glassSafety}

              gridStyle={
                gridStyle
              }

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
                handleSelectUnit
              }

              onOverallWidthChange={
                handleFrameWidthChange
              }

              onOverallHeightChange={
                handleFrameHeightChange
              }

              onMoveUnitHorizontalSplit={
                moveUnitHorizontalSplit
              }

              onMoveUnitVerticalSplit={
                moveUnitVerticalSplit
              }

              onSetLiteOperation={
                setLiteOperation
              }
            />

          </div>

          <p className="hint">
            Tap a unit to configure it.
          </p>
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              lineHeight: 1.45,
              color: "#5f6670",
              textAlign: "center",
              maxWidth: 920
            }}
          >
            <strong>
              {viewMode} View
            </strong>
            {" • "}
            {configurationSummary}
          </div>

        </section>

      </main>
    </>
  );
}
