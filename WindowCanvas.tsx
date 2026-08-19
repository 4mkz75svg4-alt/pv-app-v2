import React, {
  PointerEvent,
  useMemo,
  useRef,
  useState
} from "react";

import type {
  PanelType,
  Split,
  WindowUnitConfig
} from "./types";

type Mode =
  | "draw-vertical"
  | "draw-horizontal"
  | "select";

type LiteOperation =
  | "Picture"
  | "Awning"
  | "Casement Left"
  | "Casement Right";

type PictureStyle =
  | "Balanced Sash"
  | "Direct Set";

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

type SingleVentHanding =
  | "Left Vent"
  | "Right Vent";

type GridStyle =
  | "None"
  | "Colonial"
  | "Top Colonial"
  | "Prairie";

type ViewMode =
  | "Exterior"
  | "Interior";

type Props = {
  widthInches: number;
  heightInches: number;

  verticalSplits: Split[];
  horizontalSplits: Split[];

  selectedPanel: string | null;

  panelTypes: Record<string, PanelType>;

  windowUnits?: Record<
    string,
    WindowUnitConfig
  >;

  pictureStyles?: Record<
    string,
    PictureStyle
  >;

  productType?: string;

  sliderOrientation?: SliderOrientation;

  horizontalSliderType?: HorizontalSliderType;

  verticalSliderType?: VerticalSliderType;

  singleVentHanding?: SingleVentHanding;

  viewMode?: ViewMode;

  windowType?: string;
  exteriorColour?: string;
  interiorColour?: string;
  woodSpecies?: string;
  woodFinish?: string;
  woodStain?: string;

  flangeType?: string;
  glassAppearance?: string;
  glassPane?: string;
  glassLowEPackage?: string;
  glassSafety?: string;

  gridStyle?: GridStyle;

  gridColumns: number;
  gridRows: number;

  mode: Mode;

  onAddVertical: (
    position: number
  ) => void;

  onAddHorizontal: (
    position: number
  ) => void;

  onMoveVertical: (
    id: string,
    position: number
  ) => void;

  onMoveHorizontal: (
    id: string,
    position: number
  ) => void;

  onSelectPanel: (
    id: string
  ) => void;

  onOverallWidthChange?: (
    width: number
  ) => void;

  onOverallHeightChange?: (
    height: number
  ) => void;

  onMoveUnitHorizontalSplit?: (
    unitId: string,
    splitId: string,
    position: number
  ) => void;

  onMoveUnitVerticalSplit?: (
    unitId: string,
    splitId: string,
    position: number
  ) => void;

  onSetLiteOperation?: (
    unitId: string,
    liteId: string,
    operation: LiteOperation,
    pictureStyle?: PictureStyle
  ) => void;
};

type FrameEdge =
  | "left"
  | "right"
  | "top"
  | "bottom";

type FrameDrag = {
  edge: FrameEdge;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  pixelsPerInchX: number;
  pixelsPerInchY: number;
};

type OuterSplitDrag = {
  axis: "x" | "y";
  id: string;
};

type UnitHorizontalSplitDrag = {
  unitId: string;
  splitId: string;
  unitY: number;
  unitHeight: number;
};

type UnitVerticalSplitDrag = {
  unitId: string;
  splitId: string;
  unitX: number;
  unitWidth: number;
};

type LitePopup = {
  unitId: string;
  liteId: string;
  x: number;
  y: number;
  stage:
    | "operation"
    | "picture";
};

const MAX_FRAME_WIDTH = 960;
const MAX_FRAME_HEIGHT = 585;

const STANDARD_COLOUR_MAP: Record<
  string,
  string
> = {
  White: "#f4f2ec",
  Linen: "#d9d0be",
  "Colonial White": "#eee9df",
  Sandstone: "#b6a68e",
  Beige: "#c7b79e",
  Tan: "#9e866d",
  "Gull Gray": "#9b9d99",
  "French Linen": "#aaa394",
  "Morning Dove Gray": "#a9aaa7",
  Seawolf: "#6f7778",
  "Fashion Gray": "#777875",
  "Aqua Mist": "#8fa8a4",
  "Light Blue": "#7797ac",
  "Slate Blue": "#526b7c",
  "Black Sable": "#252422",
  Indigo: "#354554",
  Green: "#3f5a45",
  "Hartford Green": "#244739",
  "Forest Green": "#2e4937",
  "Patina Green": "#667b69",
  "Hemlock Green": "#465b49",
  "Greek Olive": "#6f7357",
  Clay: "#756c5e",
  "Harvest Cranberry": "#7e3335",
  "Colonial Red": "#6e2c2b",
  "Bahama Brown": "#58443a",
  Brown: "#5b4233",
  "TW Brown": "#4c3b32",
  "Antique Bronze": "#514a3f",
  Bronze: "#625849",
  "Battleship Gray": "#5f6261",
  "Modern Onyx": "#343536",
  "Dark Bronze": "#3e3932",
  Black: "#1f2020",
  "Custom Colour": "#68717a"
};

const WOOD_SPECIES_COLOUR_MAP: Record<
  string,
  string
> = {
  Pine: "#d7b27a",
  Maple: "#d8bf91",
  Alder: "#c79062",
  Mahogany: "#855039",
  Cherry: "#a86345",
  "Douglas Fir": "#b77d4f",
  "Black Walnut": "#644735",
  "White Oak": "#b79c70"
};

const ULTRA_STAIN_COLOUR_MAP: Record<
  string,
  string
> = {
  "Bearstone Brown": "#72533e",
  Briarwood: "#8c674a",
  Burlap: "#a98867",
  "Classic Gray": "#857f77",
  "Clear Coat": "",
  Frosted: "#c8b89e",
  "Tux Black": "#2f2c29",
  "Warm Sun": "#b37d49",
  "Woven Basket": "#927054"
};

const ULTRA_COAT_COLOUR_MAP: Record<
  string,
  string
> = {
  White: "#f1efe9",
  Black: "#202120",
  "Dried Thyme": "#6e725f",
  Creamy: "#e8dfca",
  "Requisite Gray": "#9c9690",
  "Accessible Beige": "#b9ac98",
  "Urbane Bronze": "#5d574d",
  "Iron Ore": "#464746",
  "Deep Forest Brown": "#4c453c",
  "Anchors Aweigh": "#344553"
};

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

function getFrame(
  widthInches: number,
  heightInches: number
) {
  const safeWidth =
    Math.max(
      widthInches,
      1
    );

  const safeHeight =
    Math.max(
      heightInches,
      1
    );

  const scale =
    Math.min(
      MAX_FRAME_WIDTH /
        safeWidth,
      MAX_FRAME_HEIGHT /
        safeHeight
    );

  const width =
    safeWidth * scale;

  const height =
    safeHeight * scale;

  return {
    x:
      20 +
      (
        MAX_FRAME_WIDTH -
        width
      ) /
        2,

    y:
      20 +
      (
        MAX_FRAME_HEIGHT -
        height
      ) /
        2,

    width,
    height
  };
}

export default function WindowCanvas(
  props: Props
) {
  const svgRef =
    useRef<SVGSVGElement | null>(
      null
    );

  const FRAME =
    useMemo(
      () =>
        getFrame(
          props.widthInches,
          props.heightInches
        ),
      [
        props.widthInches,
        props.heightInches
      ]
    );

  function colourForWood() {
    if (
      props.woodFinish === "Painted"
    ) {
      return (
        STANDARD_COLOUR_MAP[
          props.interiorColour ?? "White"
        ] ?? "#f4f2ec"
      );
    }

    if (
      props.woodFinish === "Primed White"
    ) {
      return "#f4f2ec";
    }

    if (
      props.woodFinish === "Stained"
    ) {
      return (
        ULTRA_STAIN_COLOUR_MAP[
          props.woodStain ?? "Bearstone Brown"
        ] ??
        WOOD_SPECIES_COLOUR_MAP[
          props.woodSpecies ?? "Douglas Fir"
        ] ??
        "#d7b27a"
      );
    }

    return (
      WOOD_SPECIES_COLOUR_MAP[
        props.woodSpecies ?? "Douglas Fir"
      ] ?? "#d7b27a"
    );
  }

  const interiorView =
    props.viewMode === "Interior";

  const frameColour =
    interiorView &&
    props.windowType ===
      "Aluminum / Wood"
      ? colourForWood()
      : STANDARD_COLOUR_MAP[
          interiorView
            ? props.interiorColour ?? "White"
            : props.exteriorColour ?? "White"
        ] ?? "#f4f2ec";

  const hasLowE =
    !!props.glassLowEPackage &&
    props.glassLowEPackage !==
      "No Low-E";

  function displayUnit(
    unit: {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }
  ) {
    if (!interiorView) {
      return unit;
    }

    return {
      ...unit,
      x:
        FRAME.x +
        FRAME.width -
        (unit.x - FRAME.x) -
        unit.w
    };
  }

  const [
    dragging,
    setDragging
  ] =
    useState<OuterSplitDrag | null>(
      null
    );

  const [
    unitHorizontalSplitDragging,
    setUnitHorizontalSplitDragging
  ] =
    useState<UnitHorizontalSplitDrag | null>(
      null
    );

  const [
    unitVerticalSplitDragging,
    setUnitVerticalSplitDragging
  ] =
    useState<UnitVerticalSplitDrag | null>(
      null
    );

  const [
    frameDragging,
    setFrameDragging
  ] =
    useState<FrameDrag | null>(
      null
    );

  const [
    litePopup,
    setLitePopup
  ] =
    useState<LitePopup | null>(
      null
    );

  const sortedVertical =
    useMemo(
      () =>
        [
          ...props.verticalSplits
        ].sort(
          (a, b) =>
            a.position -
            b.position
        ),
      [props.verticalSplits]
    );

  const sortedHorizontal =
    useMemo(
      () =>
        [
          ...props.horizontalSplits
        ].sort(
          (a, b) =>
            a.position -
            b.position
        ),
      [props.horizontalSplits]
    );

  const units =
    useMemo(() => {
      const xs = [
        0,
        ...sortedVertical.map(
          (split) =>
            split.position
        ),
        1
      ];

      const ys = [
        0,
        ...sortedHorizontal.map(
          (split) =>
            split.position
        ),
        1
      ];

      const list: Array<{
        id: string;
        x: number;
        y: number;
        w: number;
        h: number;
      }> = [];

      for (
        let row = 0;
        row <
        ys.length - 1;
        row++
      ) {
        for (
          let column = 0;
          column <
          xs.length - 1;
          column++
        ) {
          list.push({
            id:
              `${row}-${column}`,

            x:
              FRAME.x +
              xs[column] *
                FRAME.width,

            y:
              FRAME.y +
              ys[row] *
                FRAME.height,

            w:
              (
                xs[column + 1] -
                xs[column]
              ) *
              FRAME.width,

            h:
              (
                ys[row + 1] -
                ys[row]
              ) *
              FRAME.height
          });
        }
      }

      return list;
    }, [
      sortedVertical,
      sortedHorizontal,
      FRAME
    ]);

  function pointFromEvent(
    event: PointerEvent<
      | SVGSVGElement
      | SVGLineElement
      | SVGRectElement
    >
  ) {
    const svg =
      svgRef.current;

    if (!svg) {
      return {
        x: 0,
        y: 0
      };
    }

    const point =
      svg.createSVGPoint();

    point.x =
      event.clientX;

    point.y =
      event.clientY;

    const matrix =
      svg
        .getScreenCTM()
        ?.inverse();

    if (!matrix) {
      return {
        x: 0,
        y: 0
      };
    }

    return point.matrixTransform(
      matrix
    );
  }

  function startFrameDrag(
    edge: FrameEdge,
    event: PointerEvent<SVGLineElement>
  ) {
    event.stopPropagation();

    setLitePopup(null);

    const point =
      pointFromEvent(event);

    setFrameDragging({
      edge,

      startX: point.x,
      startY: point.y,

      startWidth:
        props.widthInches,

      startHeight:
        props.heightInches,

      pixelsPerInchX:
        FRAME.width /
        Math.max(
          props.widthInches,
          1
        ),

      pixelsPerInchY:
        FRAME.height /
        Math.max(
          props.heightInches,
          1
        )
    });

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );
  }

  function startUnitHorizontalSplitDrag(
    unitId: string,
    splitId: string,
    unitY: number,
    unitHeight: number,
    event: PointerEvent<SVGLineElement>
  ) {
    event.stopPropagation();

    setLitePopup(null);

    setUnitHorizontalSplitDragging({
      unitId,
      splitId,
      unitY,
      unitHeight
    });

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );
  }

  function startUnitVerticalSplitDrag(
    unitId: string,
    splitId: string,
    unitX: number,
    unitWidth: number,
    event: PointerEvent<SVGLineElement>
  ) {
    event.stopPropagation();

    setLitePopup(null);

    setUnitVerticalSplitDragging({
      unitId,
      splitId,
      unitX,
      unitWidth
    });

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );
  }

  function pointerMove(
    event: PointerEvent<SVGSVGElement>
  ) {
    const point =
      pointFromEvent(event);

    if (
      unitVerticalSplitDragging
    ) {
      const position =
        clamp(
          (
            point.x -
            unitVerticalSplitDragging.unitX
          ) /
            unitVerticalSplitDragging.unitWidth,

          0.05,
          0.95
        );

      props.onMoveUnitVerticalSplit?.(
        unitVerticalSplitDragging.unitId,
        unitVerticalSplitDragging.splitId,
        interiorView
          ? 1 - position
          : position
      );

      return;
    }

    if (
      unitHorizontalSplitDragging
    ) {
      const position =
        clamp(
          (
            point.y -
            unitHorizontalSplitDragging.unitY
          ) /
            unitHorizontalSplitDragging.unitHeight,

          0.05,
          0.95
        );

      props.onMoveUnitHorizontalSplit?.(
        unitHorizontalSplitDragging.unitId,
        unitHorizontalSplitDragging.splitId,
        position
      );

      return;
    }

    if (frameDragging) {
      const deltaX =
        point.x -
        frameDragging.startX;

      const deltaY =
        point.y -
        frameDragging.startY;

      if (
        frameDragging.edge ===
          "right" &&
        props.onOverallWidthChange
      ) {
        const nextWidth =
          frameDragging.startWidth +
          deltaX /
            frameDragging.pixelsPerInchX;

        props.onOverallWidthChange(
          Math.max(
            12,
            Number(
              nextWidth.toFixed(2)
            )
          )
        );

        return;
      }

      if (
        frameDragging.edge ===
          "left" &&
        props.onOverallWidthChange
      ) {
        const nextWidth =
          frameDragging.startWidth -
          deltaX /
            frameDragging.pixelsPerInchX;

        props.onOverallWidthChange(
          Math.max(
            12,
            Number(
              nextWidth.toFixed(2)
            )
          )
        );

        return;
      }

      if (
        frameDragging.edge ===
          "bottom" &&
        props.onOverallHeightChange
      ) {
        const nextHeight =
          frameDragging.startHeight +
          deltaY /
            frameDragging.pixelsPerInchY;

        props.onOverallHeightChange(
          Math.max(
            12,
            Number(
              nextHeight.toFixed(2)
            )
          )
        );

        return;
      }

      if (
        frameDragging.edge ===
          "top" &&
        props.onOverallHeightChange
      ) {
        const nextHeight =
          frameDragging.startHeight -
          deltaY /
            frameDragging.pixelsPerInchY;

        props.onOverallHeightChange(
          Math.max(
            12,
            Number(
              nextHeight.toFixed(2)
            )
          )
        );

        return;
      }
    }

    if (
      dragging?.axis === "x"
    ) {
      const displayPosition =
        clamp(
          (
            point.x -
            FRAME.x
          ) /
            FRAME.width,
          0.05,
          0.95
        );

      props.onMoveVertical(
        dragging.id,
        interiorView
          ? 1 -
            displayPosition
          : displayPosition
      );

      return;
    }

    if (
      dragging?.axis === "y"
    ) {
      props.onMoveHorizontal(
        dragging.id,

        clamp(
          (
            point.y -
            FRAME.y
          ) /
            FRAME.height,

          0.05,
          0.95
        )
      );
    }
  }

  function pointerUp() {
    setUnitVerticalSplitDragging(
      null
    );

    setUnitHorizontalSplitDragging(
      null
    );

    setFrameDragging(
      null
    );

    setDragging(
      null
    );
  }

  function renderFlange() {
    const type = props.flangeType ?? "Nail Fin";
    const offset =
      type === "Brick Mould" ? 18 :
      type === "Reno Flange" ? 8 : 10;
    const strokeWidth =
      type === "Brick Mould" ? 10 :
      type === "Reno Flange" ? 5 : 2;

    return (
      <rect
        x={FRAME.x - offset}
        y={FRAME.y - offset}
        width={FRAME.width + offset * 2}
        height={FRAME.height + offset * 2}
        rx="4"
        fill="none"
        stroke={frameColour}
        strokeWidth={strokeWidth}
        opacity={type === "Nail Fin" ? 0.5 : 0.8}
        strokeDasharray={type === "Nail Fin" ? "5 4" : undefined}
        pointerEvents="none"
      />
    );
  }

  function renderSash(
    x: number,
    y: number,
    w: number,
    h: number,
    slider = false
  ) {
    const inset =
      slider ? 17 : 18;

    const sashX =
      x + inset;
    const sashY =
      y + inset;
    const sashW =
      Math.max(
        0,
        w - inset * 2
      );
    const sashH =
      Math.max(
        0,
        h - inset * 2
      );

    return (
      <g
        className={
          slider
            ? "slider-sash-profile"
            : "sash-profile"
        }
        pointerEvents="none"
      >
        <rect
          x={sashX}
          y={sashY}
          width={sashW}
          height={sashH}
          rx="3"
          fill="none"
          stroke={frameColour}
          strokeWidth="9"
        />

        <rect
          x={sashX + 5}
          y={sashY + 5}
          width={Math.max(
            0,
            sashW - 10
          )}
          height={Math.max(
            0,
            sashH - 10
          )}
          rx="2"
          fill="none"
          stroke="rgba(65,85,92,0.32)"
          strokeWidth="1"
        />
      </g>
    );
  }

  function renderGrid(
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    if (
      !props.gridStyle ||
      props.gridStyle === "None"
    ) {
      return null;
    }

    const inset = 22;
    const left = x + inset;
    const right = x + w - inset;
    const top = y + inset;
    const bottom = y + h - inset;

    const innerW = Math.max(0, right - left);
    const innerH = Math.max(0, bottom - top);

    if (innerW <= 0 || innerH <= 0) {
      return null;
    }

    if (props.gridStyle === "Colonial") {
      return (
        <g
          className="grid-pattern"
          stroke={frameColour}
          strokeWidth={2}
          opacity={0.7}
          pointerEvents="none"
        >
          <line className="grid-pattern-line" x1={left + innerW / 3} y1={top} x2={left + innerW / 3} y2={bottom} />
          <line className="grid-pattern-line" x1={left + (innerW * 2) / 3} y1={top} x2={left + (innerW * 2) / 3} y2={bottom} />
          <line className="grid-pattern-line" x1={left} y1={top + innerH / 3} x2={right} y2={top + innerH / 3} />
          <line className="grid-pattern-line" x1={left} y1={top + (innerH * 2) / 3} x2={right} y2={top + (innerH * 2) / 3} />
        </g>
      );
    }

    if (props.gridStyle === "Top Colonial") {
      const gridBottom = top + innerH * 0.4;

      return (
        <g
          className="grid-pattern"
          stroke={frameColour}
          strokeWidth={2}
          opacity={0.7}
          pointerEvents="none"
        >
          <line className="grid-pattern-line" x1={left} y1={gridBottom} x2={right} y2={gridBottom} />
          <line className="grid-pattern-line" x1={left + innerW / 3} y1={top} x2={left + innerW / 3} y2={gridBottom} />
          <line className="grid-pattern-line" x1={left + (innerW * 2) / 3} y1={top} x2={left + (innerW * 2) / 3} y2={gridBottom} />
        </g>
      );
    }

    if (props.gridStyle === "Prairie") {
      const sideOffset = innerW * 0.22;
      const topOffset = innerH * 0.22;

      return (
        <g
          className="grid-pattern"
          stroke={frameColour}
          strokeWidth={2}
          opacity={0.7}
          pointerEvents="none"
        >
          <line className="grid-pattern-line" x1={left + sideOffset} y1={top} x2={left + sideOffset} y2={bottom} />
          <line className="grid-pattern-line" x1={right - sideOffset} y1={top} x2={right - sideOffset} y2={bottom} />
          <line className="grid-pattern-line" x1={left} y1={top + topOffset} x2={right} y2={top + topOffset} />
          <line className="grid-pattern-line" x1={left} y1={bottom - topOffset} x2={right} y2={bottom - topOffset} />
        </g>
      );
    }

    return null;
  }

  function renderHorizontalArrow(
    x: number,
    y: number,
    w: number,
    h: number,
    direction:
      | "left"
      | "right"
  ) {
    const middleY =
      y +
      h / 2;

    const pad =
      clamp(
        w * 0.22,
        12,
        30
      );

    const startX =
      direction === "right"
        ? x + pad
        : x + w - pad;

    const endX =
      direction === "right"
        ? x + w - pad
        : x + pad;

    const arrowOffset =
      direction === "right"
        ? -12
        : 12;

    return (
      <g className="slider-arrow">

        <line
          x1={startX}
          y1={middleY}
          x2={endX}
          y2={middleY}
        />

        <line
          x1={endX}
          y1={middleY}
          x2={
            endX +
            arrowOffset
          }
          y2={
            middleY - 9
          }
        />

        <line
          x1={endX}
          y1={middleY}
          x2={
            endX +
            arrowOffset
          }
          y2={
            middleY + 9
          }
        />

      </g>
    );
  }

  function renderVerticalArrow(
    x: number,
    y: number,
    w: number,
    h: number,
    direction:
      | "up"
      | "down"
  ) {
    const middleX =
      x +
      w / 2;

    const pad =
      clamp(
        h * 0.22,
        12,
        30
      );

    const startY =
      direction === "up"
        ? y + h - pad
        : y + pad;

    const endY =
      direction === "up"
        ? y + pad
        : y + h - pad;

    const arrowOffset =
      direction === "up"
        ? 12
        : -12;

    return (
      <g className="slider-arrow">

        <line
          x1={middleX}
          y1={startY}
          x2={middleX}
          y2={endY}
        />

        <line
          x1={middleX}
          y1={endY}
          x2={
            middleX - 9
          }
          y2={
            endY +
            arrowOffset
          }
        />

        <line
          x1={middleX}
          y1={endY}
          x2={
            middleX + 9
          }
          y2={
            endY +
            arrowOffset
          }
        />

      </g>
    );
  }

  function renderOpeningSymbol(
    operation: PanelType,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    const visualOperation =
      interiorView
        ? operation === "Casement Left"
          ? "Casement Right"
          : operation === "Casement Right"
          ? "Casement Left"
          : operation
        : operation;

    const pad =
      clamp(
        Math.min(
          w,
          h
        ) * 0.18,
        12,
        28
      );

    const left =
      x + pad;

    const right =
      x +
      w -
      pad;

    const top =
      y + pad;

    const bottom =
      y +
      h -
      pad;

    const middleX =
      x +
      w / 2;

    const middleY =
      y +
      h / 2;

    if (
      visualOperation ===
      "Picture"
    ) {
      return null;
    }

    if (
      visualOperation ===
      "Awning"
    ) {
      return (
        <g className="opening-symbol">

          <line
            x1={left}
            y1={bottom}
            x2={middleX}
            y2={top}
          />

          <line
            x1={right}
            y1={bottom}
            x2={middleX}
            y2={top}
          />

        </g>
      );
    }

    if (
      visualOperation ===
      "Casement Left"
    ) {
      return (
        <g className="opening-symbol">

          <line
            x1={right}
            y1={top}
            x2={left}
            y2={middleY}
          />

          <line
            x1={right}
            y1={bottom}
            x2={left}
            y2={middleY}
          />

        </g>
      );
    }

    if (
      visualOperation ===
      "Casement Right"
    ) {
      return (
        <g className="opening-symbol">

          <line
            x1={left}
            y1={top}
            x2={right}
            y2={middleY}
          />

          <line
            x1={left}
            y1={bottom}
            x2={right}
            y2={middleY}
          />

        </g>
      );
    }

    return null;
  }

  function openLitePopup(
    unitId: string,
    liteId: string,
    x: number,
    y: number,
    w: number,
    h: number,
    event: PointerEvent<SVGRectElement>
  ) {
    event.stopPropagation();

    props.onSelectPanel(
      unitId
    );

    if (
      props.productType ===
      "Slider"
    ) {
      setLitePopup(
        null
      );

      return;
    }

    const popupWidth =
      180;

    const popupHeight =
      190;

    let popupX =
      x +
      w / 2 -
      popupWidth / 2;

    let popupY =
      y +
      h / 2 -
      popupHeight / 2;

    popupX =
      clamp(
        popupX,
        10,
        1000 -
          popupWidth -
          10
      );

    popupY =
      clamp(
        popupY,
        10,
        625 -
          popupHeight -
          10
      );

    setLitePopup({
      unitId,
      liteId,
      x: popupX,
      y: popupY,
      stage:
        "operation"
    });
  }

  function chooseOperation(
    operation: LiteOperation
  ) {
    if (
      !litePopup
    ) {
      return;
    }

    if (
      operation ===
      "Picture"
    ) {
      setLitePopup({
        ...litePopup,
        stage:
          "picture"
      });

      return;
    }

    props.onSetLiteOperation?.(
      litePopup.unitId,
      litePopup.liteId,
      operation
    );

    setLitePopup(
      null
    );
  }

  function choosePictureStyle(
    style: PictureStyle
  ) {
    if (
      !litePopup
    ) {
      return;
    }

    props.onSetLiteOperation?.(
      litePopup.unitId,
      litePopup.liteId,
      "Picture",
      style
    );

    setLitePopup(
      null
    );
  }

  function renderHorizontalSlider(
    unit: {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
    },
    config: WindowUnitConfig
  ) {
    const splits =
      [
        ...config.verticalSplits
      ].sort(
        (a, b) =>
          a.position -
          b.position
      );

    const positions = [
      0,
      ...splits.map(
        (split) =>
          split.position
      ),
      1
    ];

    const lastIndex =
      positions.length -
      2;

    const effectiveHanding =
      props.singleVentHanding;

    return (
      <>
        {positions
          .slice(0, -1)
          .map(
            (
              start,
              index
            ) => {
              const end =
                positions[
                  index + 1
                ];

              const sectionX =
                interiorView
                  ? unit.x +
                    (1 - end) *
                      unit.w
                  : unit.x +
                    start *
                      unit.w;

              const sectionWidth =
                (
                  end -
                  start
                ) *
                unit.w;

              let operating =
                false;

              let direction:
                | "left"
                | "right"
                | null =
                null;

              if (
                props.horizontalSliderType ===
                "Single Vent"
              ) {
                if (
                  effectiveHanding ===
                  "Right Vent"
                ) {
                  operating =
                    index ===
                    lastIndex;

                  if (
                    operating
                  ) {
                    direction =
                      "left";
                  }
                } else {
                  operating =
                    index === 0;

                  if (
                    operating
                  ) {
                    direction =
                      "right";
                  }
                }
              }

              if (
                props.horizontalSliderType ===
                "Double Slider"
              ) {
                operating =
                  true;

                direction =
                  index === 0
                    ? "right"
                    : "left";
              }

              if (
                props.horizontalSliderType ===
                "Double Vent + Centre Picture"
              ) {
                operating =
                  index === 0 ||
                  index ===
                    lastIndex;

                if (
                  index === 0
                ) {
                  direction =
                    "right";
                }

                if (
                  index ===
                  lastIndex
                ) {
                  direction =
                    "left";
                }
              }

              return (
                <g
                  key={
                    `${unit.id}-horizontal-slider-${index}`
                  }
                >

                  {renderGrid(
                    sectionX,
                    unit.y,
                    sectionWidth,
                    unit.h
                  )}

                  {operating &&
                    renderSash(
                      sectionX,
                      unit.y,
                      sectionWidth,
                      unit.h,
                      true
                    )}

                  {operating &&
                    direction &&
                    renderHorizontalArrow(
                      sectionX,
                      unit.y,
                      sectionWidth,
                      unit.h,
                      direction
                    )}

                  <rect
                    className="lite-hit"

                    x={
                      sectionX
                    }

                    y={
                      unit.y
                    }

                    width={
                      sectionWidth
                    }

                    height={
                      unit.h
                    }

                    onPointerDown={(
                      event
                    ) => {
                      event.stopPropagation();

                      props.onSelectPanel(
                        unit.id
                      );

                      setLitePopup(
                        null
                      );
                    }}
                  />

                </g>
              );
            }
          )}

        {splits.map(
          (split) => {
            const displayPosition =
              interiorView
                ? 1 - split.position
                : split.position;

            const x =
              unit.x +
              displayPosition *
                unit.w;

            return (
              <g
                key={
                  split.id
                }
              >

                <line
                  className="lite-split-line"
                  style={{
                    stroke: frameColour,
                    strokeWidth: 6
                  }}

                  x1={x}
                  y1={
                    unit.y
                  }

                  x2={x}
                  y2={
                    unit.y +
                    unit.h
                  }
                />

                <line
                  className="slider-vertical-split-hit"

                  x1={x}
                  y1={
                    unit.y
                  }

                  x2={x}
                  y2={
                    unit.y +
                    unit.h
                  }

                  onPointerDown={(
                    event
                  ) =>
                    startUnitVerticalSplitDrag(
                      unit.id,
                      split.id,
                      unit.x,
                      unit.w,
                      event
                    )
                  }
                />

              </g>
            );
          }
        )}

      </>
    );
  }

  function renderVerticalSlider(
    unit: {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
    },
    config: WindowUnitConfig
  ) {
    const splits =
      [
        ...config.horizontalSplits
      ].sort(
        (a, b) =>
          a.position -
          b.position
      );

    const positions = [
      0,
      ...splits.map(
        (split) =>
          split.position
      ),
      1
    ];

    return (
      <>
        {positions
          .slice(0, -1)
          .map(
            (
              start,
              index
            ) => {
              const end =
                positions[
                  index + 1
                ];

              const sectionY =
                unit.y +
                start *
                  unit.h;

              const sectionHeight =
                (
                  end -
                  start
                ) *
                unit.h;

              const top =
                index === 0;

              const bottom =
                index ===
                positions.length -
                  2;

              let operating =
                false;

              let direction:
                | "up"
                | "down"
                | null =
                null;

              if (
                props.verticalSliderType ===
                "Single Hung"
              ) {
                operating =
                  bottom;

                if (
                  bottom
                ) {
                  direction =
                    "up";
                }
              }

              if (
                props.verticalSliderType ===
                "Double Hung"
              ) {
                operating =
                  top ||
                  bottom;

                if (
                  top
                ) {
                  direction =
                    "down";
                }

                if (
                  bottom
                ) {
                  direction =
                    "up";
                }
              }

              return (
                <g
                  key={
                    `${unit.id}-vertical-slider-${index}`
                  }
                >

                  {renderGrid(
                    unit.x,
                    sectionY,
                    unit.w,
                    sectionHeight
                  )}

                  {operating &&
                    renderSash(
                      unit.x,
                      sectionY,
                      unit.w,
                      sectionHeight,
                      true
                    )}

                  {operating &&
                    direction &&
                    renderVerticalArrow(
                      unit.x,
                      sectionY,
                      unit.w,
                      sectionHeight,
                      direction
                    )}

                  <rect
                    className="lite-hit"

                    x={
                      unit.x
                    }

                    y={
                      sectionY
                    }

                    width={
                      unit.w
                    }

                    height={
                      sectionHeight
                    }

                    onPointerDown={(
                      event
                    ) => {
                      event.stopPropagation();

                      props.onSelectPanel(
                        unit.id
                      );

                      setLitePopup(
                        null
                      );
                    }}
                  />

                </g>
              );
            }
          )}

        {splits.map(
          (split) => {
            const y =
              unit.y +
              split.position *
                unit.h;

            return (
              <g
                key={
                  split.id
                }
              >

                <line
                  className="lite-split-line"
                  style={{
                    stroke: frameColour,
                    strokeWidth: 6
                  }}

                  x1={
                    unit.x
                  }

                  y1={y}

                  x2={
                    unit.x +
                    unit.w
                  }

                  y2={y}
                />

                <line
                  className="lite-split-hit"

                  x1={
                    unit.x
                  }

                  y1={y}

                  x2={
                    unit.x +
                    unit.w
                  }

                  y2={y}

                  onPointerDown={(
                    event
                  ) =>
                    startUnitHorizontalSplitDrag(
                      unit.id,
                      split.id,
                      unit.y,
                      unit.h,
                      event
                    )
                  }
                />

              </g>
            );
          }
        )}

      </>
    );
  }

  function renderCasementUnit(
    unit: {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
    },
    config: WindowUnitConfig
  ) {
    const horizontal =
      [
        ...config.horizontalSplits
      ].sort(
        (a, b) =>
          a.position -
          b.position
      );

    const positions = [
      0,
      ...horizontal.map(
        (split) =>
          split.position
      ),
      1
    ];

    return (
      <>
        {positions
          .slice(0, -1)
          .map(
            (
              start,
              index
            ) => {
              const end =
                positions[
                  index + 1
                ];

              const liteY =
                unit.y +
                start *
                  unit.h;

              const liteHeight =
                (
                  end -
                  start
                ) *
                unit.h;

              const liteId =
                `${index}-0`;

              const operation =
                config
                  .liteConfigs[
                    liteId
                  ]?.type ??
                "Picture";

              const pictureStyle =
                props.pictureStyles?.[
                  `${unit.id}:${liteId}`
                ];

              const hasSash =
                operation !==
                  "Picture" ||
                pictureStyle ===
                  "Balanced Sash";

              return (
                <g
                  key={
                    `${unit.id}-${liteId}`
                  }
                >

                  {renderGrid(
                    unit.x,
                    liteY,
                    unit.w,
                    liteHeight
                  )}

                  {hasSash &&
                    renderSash(
                      unit.x,
                      liteY,
                      unit.w,
                      liteHeight
                    )}

                  {renderOpeningSymbol(
                    operation,
                    unit.x,
                    liteY,
                    unit.w,
                    liteHeight
                  )}

                  <rect
                    className="lite-hit"

                    x={
                      unit.x
                    }

                    y={
                      liteY
                    }

                    width={
                      unit.w
                    }

                    height={
                      liteHeight
                    }

                    onPointerDown={(
                      event
                    ) =>
                      openLitePopup(
                        unit.id,
                        liteId,
                        unit.x,
                        liteY,
                        unit.w,
                        liteHeight,
                        event
                      )
                    }
                  />

                </g>
              );
            }
          )}

        {horizontal.map(
          (split) => {
            const y =
              unit.y +
              split.position *
                unit.h;

            return (
              <g
                key={
                  split.id
                }
              >

                <line
                  className="lite-split-line"
                  style={{
                    stroke: frameColour,
                    strokeWidth: 6
                  }}

                  x1={
                    unit.x
                  }

                  y1={y}

                  x2={
                    unit.x +
                    unit.w
                  }

                  y2={y}
                />

                <line
                  className="lite-split-hit"

                  x1={
                    unit.x
                  }

                  y1={y}

                  x2={
                    unit.x +
                    unit.w
                  }

                  y2={y}

                  onPointerDown={(
                    event
                  ) =>
                    startUnitHorizontalSplitDrag(
                      unit.id,
                      split.id,
                      unit.y,
                      unit.h,
                      event
                    )
                  }
                />

              </g>
            );
          }
        )}

      </>
    );
  }

  function renderUnit(
    unit: {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }
  ) {
    const config =
      props.windowUnits?.[
        unit.id
      ];

    if (!config) {
      return null;
    }

    if (
      props.productType ===
      "Slider"
    ) {
      if (
        props.sliderOrientation ===
        "Vertical"
      ) {
        return renderVerticalSlider(
          unit,
          config
        );
      }

      return renderHorizontalSlider(
        unit,
        config
      );
    }

    return renderCasementUnit(
      unit,
      config
    );
  }

  return (
    <svg
      ref={svgRef}

      className="window-svg"

      style={{
        color: frameColour
      }}

      viewBox="0 0 1000 625"

      onPointerMove={
        pointerMove
      }

      onPointerUp={
        pointerUp
      }

      onPointerCancel={() => {
        setDragging(null);

        setFrameDragging(null);

        setUnitHorizontalSplitDragging(
          null
        );

        setUnitVerticalSplitDragging(
          null
        );
      }}
    >

      <defs>
        <linearGradient id="pv-glass-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={hasLowE ? "#dceff4" : "#eef8fc"} stopOpacity="0.92" />
          <stop offset="45%" stopColor={hasLowE ? "#b9d7dd" : "#cfe7f0"} stopOpacity="0.74" />
          <stop offset="100%" stopColor={hasLowE ? "#9fc4cc" : "#b7d6e1"} stopOpacity="0.82" />
        </linearGradient>
        <linearGradient id="pv-glass-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="38%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <pattern
          id="pv-obscure-pattern"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3" cy="3" r="1.6" fill="#ffffff" opacity="0.28" />
          <circle cx="9" cy="8" r="1.2" fill="#6f8f98" opacity="0.16" />
        </pattern>
      </defs>

      <rect
        className="glass-background"
        x={FRAME.x}
        y={FRAME.y}
        width={FRAME.width}
        height={FRAME.height}
        rx="5"
        fill="url(#pv-glass-gradient)"
      />

      <rect
        x={FRAME.x + 8}
        y={FRAME.y + 8}
        width={Math.max(0, FRAME.width - 16)}
        height={Math.max(0, FRAME.height - 16)}
        rx="4"
        fill="url(#pv-glass-sheen)"
        pointerEvents="none"
      />

      {props.glassAppearance === "Yes" && (
        <rect
          x={FRAME.x + 9}
          y={FRAME.y + 9}
          width={Math.max(0, FRAME.width - 18)}
          height={Math.max(0, FRAME.height - 18)}
          rx="4"
          fill="url(#pv-obscure-pattern)"
          opacity="0.85"
          pointerEvents="none"
        />
      )}

      {props.glassPane === "Triple" && (
        <rect
          x={FRAME.x + 5}
          y={FRAME.y + 5}
          width={Math.max(0, FRAME.width - 10)}
          height={Math.max(0, FRAME.height - 10)}
          rx="4"
          fill="none"
          stroke="rgba(70,105,115,0.28)"
          strokeWidth="2"
          pointerEvents="none"
        />
      )}


      {units.map(
        (unit) => {
          const selected =
            unit.id ===
            props.selectedPanel;

          const shownUnit =
            displayUnit(unit);

          return (
            <g
              key={
                unit.id
              }
            >

              <rect
                className={
                  `panel-outline ${
                    selected
                      ? "selected"
                      : ""
                  }`
                }

                x={
                  shownUnit.x + 3
                }

                y={
                  shownUnit.y + 3
                }

                width={
                  Math.max(
                    0,
                    shownUnit.w - 6
                  )
                }

                height={
                  Math.max(
                    0,
                    shownUnit.h - 6
                  )
                }
              />

              {renderUnit(
                shownUnit
              )}

              <text
                className="panel-dimension"

                x={
                  shownUnit.x +
                  shownUnit.w / 2
                }

                y={
                  shownUnit.y +
                  shownUnit.h -
                  18
                }

                textAnchor="middle"
              >
                {(
                  (
                    shownUnit.w /
                    FRAME.width
                  ) *
                  props.widthInches
                ).toFixed(1)}
                " ×{" "}
                {(
                  (
                    shownUnit.h /
                    FRAME.height
                  ) *
                  props.heightInches
                ).toFixed(1)}
                "
              </text>

            </g>
          );
        }
      )}

      {sortedVertical.map(
        (split) => {
          const displayPosition =
            interiorView
              ? 1 - split.position
              : split.position;

          const x =
            FRAME.x +
            displayPosition *
              FRAME.width;

          return (
            <g
              key={
                split.id
              }
            >

              <line
                className="split-line"
                style={{
                  stroke: frameColour,
                  strokeWidth: 8
                }}

                x1={x}
                y1={
                  FRAME.y
                }

                x2={x}

                y2={
                  FRAME.y +
                  FRAME.height
                }
              />

              <line
                className="split-hit"

                x1={x}
                y1={
                  FRAME.y
                }

                x2={x}

                y2={
                  FRAME.y +
                  FRAME.height
                }

                onPointerDown={(
                  event
                ) => {
                  event.stopPropagation();

                  setLitePopup(
                    null
                  );

                  setDragging({
                    axis:
                      "x",
                    id:
                      split.id
                  });

                  event.currentTarget
                    .setPointerCapture(
                      event.pointerId
                    );
                }}
              />

            </g>
          );
        }
      )}

      {sortedHorizontal.map(
        (split) => {
          const y =
            FRAME.y +
            split.position *
              FRAME.height;

          return (
            <g
              key={
                split.id
              }
            >

              <line
                className="split-line"
                style={{
                  stroke: frameColour,
                  strokeWidth: 8
                }}

                x1={
                  FRAME.x
                }

                y1={y}

                x2={
                  FRAME.x +
                  FRAME.width
                }

                y2={y}
              />

              <line
                className="split-hit"

                x1={
                  FRAME.x
                }

                y1={y}

                x2={
                  FRAME.x +
                  FRAME.width
                }

                y2={y}

                onPointerDown={(
                  event
                ) => {
                  event.stopPropagation();

                  setLitePopup(
                    null
                  );

                  setDragging({
                    axis:
                      "y",
                    id:
                      split.id
                  });

                  event.currentTarget
                    .setPointerCapture(
                      event.pointerId
                    );
                }}
              />

            </g>
          );
        }
      )}

      <g className="outer-frame-profile" pointerEvents="none">
        <rect
          x={FRAME.x}
          y={FRAME.y}
          width={FRAME.width}
          height={FRAME.height}
          rx="5"
          fill="none"
          stroke={frameColour}
          strokeWidth="12"
        />
        <rect
          x={FRAME.x + 7}
          y={FRAME.y + 7}
          width={Math.max(0, FRAME.width - 14)}
          height={Math.max(0, FRAME.height - 14)}
          rx="4"
          fill="none"
          stroke={frameColour}
          strokeWidth="2"
          opacity="0.62"
        />
        <rect
          x={FRAME.x + 13}
          y={FRAME.y + 13}
          width={Math.max(0, FRAME.width - 26)}
          height={Math.max(0, FRAME.height - 26)}
          rx="3"
          fill="none"
          stroke={frameColour}
          strokeWidth="1"
        />
      </g>

      {props.glassSafety &&
        props.glassSafety !==
          "None" && (
        <g pointerEvents="none">
          <rect
            x={
              FRAME.x +
              FRAME.width -
              55
            }
            y={
              FRAME.y +
              FRAME.height -
              38
            }
            width="38"
            height="22"
            rx="4"
            fill="rgba(255,255,255,0.82)"
            stroke="rgba(55,70,78,0.45)"
          />
          <text
            x={
              FRAME.x +
              FRAME.width -
              36
            }
            y={
              FRAME.y +
              FRAME.height -
              22
            }
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#39474d"
          >
            {props.glassSafety ===
            "Tempered"
              ? "T"
              : "LAM"}
          </text>
        </g>
      )}

      <line
        className="frame-resize-hit"

        x1={
          FRAME.x
        }

        y1={
          FRAME.y
        }

        x2={
          FRAME.x
        }

        y2={
          FRAME.y +
          FRAME.height
        }

        onPointerDown={(
          event
        ) =>
          startFrameDrag(
            "left",
            event
          )
        }
      />

      <line
        className="frame-resize-hit"

        x1={
          FRAME.x +
          FRAME.width
        }

        y1={
          FRAME.y
        }

        x2={
          FRAME.x +
          FRAME.width
        }

        y2={
          FRAME.y +
          FRAME.height
        }

        onPointerDown={(
          event
        ) =>
          startFrameDrag(
            "right",
            event
          )
        }
      />

      <line
        className="frame-resize-hit-horizontal"

        x1={
          FRAME.x
        }

        y1={
          FRAME.y
        }

        x2={
          FRAME.x +
          FRAME.width
        }

        y2={
          FRAME.y
        }

        onPointerDown={(
          event
        ) =>
          startFrameDrag(
            "top",
            event
          )
        }
      />

      <line
        className="frame-resize-hit-horizontal"

        x1={
          FRAME.x
        }

        y1={
          FRAME.y +
          FRAME.height
        }

        x2={
          FRAME.x +
          FRAME.width
        }

        y2={
          FRAME.y +
          FRAME.height
        }

        onPointerDown={(
          event
        ) =>
          startFrameDrag(
            "bottom",
            event
          )
        }
      />

      {litePopup && (
        <foreignObject
          x={
            litePopup.x
          }

          y={
            litePopup.y
          }

          width="180"
          height="200"
        >

          <div
            className="lite-popup"

            onPointerDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="lite-popup-title">
              {litePopup.stage ===
              "operation"
                ? "Lite Type"
                : "Picture Type"}
            </div>

            {litePopup.stage ===
              "operation" ? (
              <>
                <button
                  onClick={() =>
                    chooseOperation(
                      "Picture"
                    )
                  }
                >
                  Picture
                </button>

                <button
                  onClick={() =>
                    chooseOperation(
                      "Awning"
                    )
                  }
                >
                  Awning
                </button>

                <button
                  onClick={() =>
                    chooseOperation(
                      "Casement Left"
                    )
                  }
                >
                  Casement Left
                </button>

                <button
                  onClick={() =>
                    chooseOperation(
                      "Casement Right"
                    )
                  }
                >
                  Casement Right
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() =>
                    choosePictureStyle(
                      "Balanced Sash"
                    )
                  }
                >
                  <strong>
                    Balanced Sash
                  </strong>

                  <span>
                    Matches operating sash
                  </span>
                </button>

                <button
                  onClick={() =>
                    choosePictureStyle(
                      "Direct Set"
                    )
                  }
                >
                  <strong>
                    Direct Set
                  </strong>

                  <span>
                    Glass set directly in frame
                  </span>
                </button>

                <button
                  className="popup-back"

                  onClick={() =>
                    setLitePopup({
                      ...litePopup,
                      stage:
                        "operation"
                    })
                  }
                >
                  Back
                </button>
              </>
            )}

            <button
              className="popup-close"

              onClick={() =>
                setLitePopup(
                  null
                )
              }
            >
              ×
            </button>

          </div>

        </foreignObject>
      )}

    </svg>
  );
}
