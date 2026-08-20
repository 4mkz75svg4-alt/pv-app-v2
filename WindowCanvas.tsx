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

  presentationMode?: boolean;

  previewZoom?: number;
  previewPanX?: number;
  previewPanY?: number;
  detailMode?: boolean;
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


  const [
    sliderWindowOpen,
    setSliderWindowOpen
  ] =
    useState<boolean>(
      false
    );

  const [
    openCasementLites,
    setOpenCasementLites
  ] =
    useState<Record<string, boolean>>(
      {}
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
        position
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
      props.onMoveVertical(
        dragging.id,

        clamp(
          (
            point.x -
            FRAME.x
          ) /
            FRAME.width,

          0.05,
          0.95
        )
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

  function renderSash(
    x: number,
    y: number,
    w: number,
    h: number,
    slider = false
  ) {
   const inset = 14;

    return (
      <>
        <rect
          className={
            slider
              ? "slider-sash-outline"
              : "sash-outline"
          }

          x={
            x + inset
          }

          y={
            y + inset
          }

          width={
            Math.max(
              0,
              w -
                inset * 2
            )
          }

          height={
            Math.max(
              0,
              h -
                inset * 2
            )
          }

          rx="2"
        />

        {props.detailMode && (
          <>
            <rect
              x={
                x +
                inset +
                6
              }
              y={
                y +
                inset +
                6
              }
              width={
                Math.max(
                  0,
                  w -
                    inset *
                      2 -
                    12
                )
              }
              height={
                Math.max(
                  0,
                  h -
                    inset *
                      2 -
                    12
                )
              }
              rx="2"
              fill="none"
              stroke="rgba(52,65,71,0.36)"
              strokeWidth="2"
              pointerEvents="none"
            />

            <rect
              x={
                x +
                inset +
                11
              }
              y={
                y +
                inset +
                11
              }
              width={
                Math.max(
                  0,
                  w -
                    inset *
                      2 -
                    22
                )
              }
              height={
                Math.max(
                  0,
                  h -
                    inset *
                      2 -
                    22
                )
              }
              rx="1"
              fill="none"
              stroke="rgba(52,65,71,0.20)"
              strokeWidth="1.5"
              pointerEvents="none"
            />
          </>
        )}
      </>
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
          stroke="currentColor"
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
          stroke="currentColor"
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
          stroke="currentColor"
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
      operation ===
      "Picture"
    ) {
      return null;
    }

    if (
      operation ===
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
      operation ===
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
      operation ===
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

    setOpenCasementLites(
      (current) => ({
        ...current,
        [`${litePopup.unitId}:${litePopup.liteId}`]:
          false
      })
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
                unit.x +
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
                  props.singleVentHanding ===
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

                  {operating && (
                    <g
                      transform={
                        sliderWindowOpen &&
                        direction
                          ? `translate(${direction === "right" ? sectionWidth * 0.38 : -sectionWidth * 0.38} 0)`
                          : undefined
                      }
                      style={{
                        transition:
                          "transform 280ms ease"
                      }}
                    >
                      {renderSash(
                        sectionX,
                        unit.y,
                        sectionWidth,
                        unit.h,
                        true
                      )}

                      {direction &&
                        renderHorizontalArrow(
                          sectionX,
                          unit.y,
                          sectionWidth,
                          unit.h,
                          direction
                        )}
                    </g>
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

                      if (
                        operating
                      ) {
                        setSliderWindowOpen(
                          (current) =>
                            !current
                        );

                        setLitePopup(
                          null
                        );

                        return;
                      }

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
            const x =
              unit.x +
              split.position *
                unit.w;

            return (
              <g
                key={
                  split.id
                }
              >

                <line
                  className="lite-split-line"

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

                  {(() => {
                    const casementKey =
                      `${unit.id}:${liteId}`;

                    const isOperating =
                      operation ===
                        "Casement Left" ||
                      operation ===
                        "Casement Right" ||
                      operation ===
                        "Awning";

                    const isOpen =
                      !!openCasementLites[
                        casementKey
                      ];

                    const openTransform =
                      !isOperating ||
                      !isOpen
                        ? undefined
                        : operation ===
                          "Casement Left"
                        ? `
                          translate(${unit.x} ${liteY + liteHeight / 2})
                          skewY(-8)
                          scale(0.68 1)
                          translate(${-unit.x} ${-(liteY + liteHeight / 2)})
                        `
                        : operation ===
                          "Casement Right"
                        ? `
                          translate(${unit.x + unit.w} ${liteY + liteHeight / 2})
                          skewY(8)
                          scale(0.68 1)
                          translate(${-(unit.x + unit.w)} ${-(liteY + liteHeight / 2)})
                        `
                        : `
                          translate(${unit.x + unit.w / 2} ${liteY})
                          skewX(-7)
                          scale(1 0.70)
                          translate(${-(unit.x + unit.w / 2)} ${-liteY})
                        `;

                    return (
                      <>
                        <g
                          transform={
                            openTransform
                          }
                          style={{
                            transition:
                              "transform 280ms ease"
                          }}
                        >
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
                        </g>

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
                          ) => {
                            event.stopPropagation();

                            props.onSelectPanel(
                              unit.id
                            );

                            if (
                              isOperating
                            ) {
                              setLitePopup(
                                null
                              );

                              setOpenCasementLites(
                                (current) => ({
                                  ...current,
                                  [casementKey]:
                                    !current[
                                      casementKey
                                    ]
                                })
                              );

                              return;
                            }

                            openLitePopup(
                              unit.id,
                              liteId,
                              unit.x,
                              liteY,
                              unit.w,
                              liteHeight,
                              event
                            );
                          }}
                        />

                        {props.selectedPanel ===
                          unit.id &&
                          isOperating && (
                          <g
                            style={{
                              cursor:
                                "pointer"
                            }}
                            onPointerDown={(
                              event
                            ) => {
                              event.stopPropagation();

                              openLitePopup(
                                unit.id,
                                liteId,
                                unit.x,
                                liteY,
                                unit.w,
                                liteHeight,
                                event
                              );
                            }}
                          >
                            <rect
                              x={
                                unit.x +
                                unit.w -
                                126
                              }
                              y={
                                liteY + 10
                              }
                              width="116"
                              height="28"
                              rx="7"
                              fill="rgba(255,255,255,0.92)"
                              stroke="rgba(55,70,78,0.28)"
                              strokeWidth="1"
                            />

                            <text
                              x={
                                unit.x +
                                unit.w -
                                68
                              }
                              y={
                                liteY + 29
                              }
                              textAnchor="middle"
                              fontSize="12"
                              fontWeight="600"
                              fill="#39474d"
                              pointerEvents="none"
                            >
                              Change Opening
                            </text>
                          </g>
                        )}
                      </>
                    );
                  })()}

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

      viewBox={
        props.presentationMode
          ? `${FRAME.x - 16} ${FRAME.y - 16} ${FRAME.width + 32} ${FRAME.height + 32}`
          : (props.previewZoom ?? 1) > 1
          ? (() => {
              const zoom =
                Math.max(
                  1,
                  Math.min(
                    3,
                    props.previewZoom ?? 1
                  )
                );

              const viewWidth =
                1000 / zoom;

              const viewHeight =
                625 / zoom;

              const centerX =
                500 +
                (props.previewPanX ??
                  0);

              const centerY =
                312.5 +
                (props.previewPanY ??
                  0);

              return `${centerX - viewWidth / 2} ${centerY - viewHeight / 2} ${viewWidth} ${viewHeight}`;
            })()
          : "0 0 1000 625"
      }

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

      <rect
        className="glass-background"

        fill="rgba(226, 242, 246, 0.34)"
        stroke="rgba(112, 145, 154, 0.18)"
        strokeWidth="1"

        x={
          FRAME.x
        }

        y={
          FRAME.y
        }

        width={
          FRAME.width
        }

        height={
          FRAME.height
        }

        rx="4"
      />

      {units.map(
        (unit) => {
          const selected =
            unit.id ===
            props.selectedPanel;

          return (
            <g
              key={
                unit.id
              }
            >

              {!props.presentationMode && (
              <rect
                className={
                  `panel-outline ${
                    selected
                      ? "selected"
                      : ""
                  }`
                }

                x={
                  unit.x + 3
                }

                y={
                  unit.y + 3
                }

                width={
                  Math.max(
                    0,
                    unit.w - 6
                  )
                }

                height={
                  Math.max(
                    0,
                    unit.h - 6
                  )
                }
              />

              )}

              {renderUnit(
                unit
              )}

              {!props.presentationMode && (
              <text
                className="panel-dimension"

                x={
                  unit.x +
                  unit.w / 2
                }

                y={
                  unit.y +
                  unit.h -
                  18
                }

                textAnchor="middle"
              >
                {(
                  (
                    unit.w /
                    FRAME.width
                  ) *
                  props.widthInches
                ).toFixed(1)}
                " ×{" "}
                {(
                  (
                    unit.h /
                    FRAME.height
                  ) *
                  props.heightInches
                ).toFixed(1)}
                "
              </text>
              )}

            </g>
          );
        }
      )}

      {sortedVertical.map(
        (split) => {
          const x =
            FRAME.x +
            split.position *
              FRAME.width;

          return (
            <g
              key={
                split.id
              }
            >

              <line
                className="split-line"

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

      <rect
        className="outer-frame"

        x={
          FRAME.x
        }

        y={
          FRAME.y
        }

        width={
          FRAME.width
        }

        height={
          FRAME.height
        }

        rx="4"
      />

      {props.detailMode && (
        <g
          pointerEvents="none"
        >
          <rect
            x={
              FRAME.x + 8
            }
            y={
              FRAME.y + 8
            }
            width={
              FRAME.width - 16
            }
            height={
              FRAME.height - 16
            }
            rx="3"
            fill="none"
            stroke="rgba(52,65,71,0.42)"
            strokeWidth="2"
          />

          <rect
            x={
              FRAME.x + 19
            }
            y={
              FRAME.y + 19
            }
            width={
              FRAME.width - 38
            }
            height={
              FRAME.height - 38
            }
            rx="2"
            fill="none"
            stroke="rgba(52,65,71,0.22)"
            strokeWidth="2"
          />
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

      {!props.presentationMode &&
        litePopup && (
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
