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

type UnitSplitDrag = {
  unitId: string;
  splitId: string;
  unitY: number;
  unitHeight: number;
};

const MAX_FRAME_WIDTH = 960;
const MAX_FRAME_HEIGHT = 585;

function getFrame(
  widthInches: number,
  heightInches: number
) {
  const safeWidth =
    Math.max(widthInches, 1);

  const safeHeight =
    Math.max(heightInches, 1);

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
      (MAX_FRAME_WIDTH -
        width) /
        2,

    y:
      20 +
      (MAX_FRAME_HEIGHT -
        height) /
        2,

    width,
    height
  };
}

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, value)
  );
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
    preview,
    setPreview
  ] = useState<{
    axis: "x" | "y";
    value: number;
  } | null>(null);

  const [
    dragging,
    setDragging
  ] =
    useState<OuterSplitDrag | null>(
      null
    );

  const [
    unitSplitDragging,
    setUnitSplitDragging
  ] =
    useState<UnitSplitDrag | null>(
      null
    );

  const [
    frameDragging,
    setFrameDragging
  ] =
    useState<FrameDrag | null>(
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

  function pointerDownOnCanvas(
    event: PointerEvent<SVGSVGElement>
  ) {
    if (
      props.mode === "select"
    ) {
      return;
    }

    const point =
      pointFromEvent(event);

    const within =
      point.x >= FRAME.x &&
      point.x <=
        FRAME.x +
          FRAME.width &&
      point.y >= FRAME.y &&
      point.y <=
        FRAME.y +
          FRAME.height;

    if (!within) {
      return;
    }

    event.currentTarget
      .setPointerCapture(
        event.pointerId
      );

    if (
      props.mode ===
      "draw-vertical"
    ) {
      setPreview({
        axis: "x",

        value: clamp(
          (
            point.x -
            FRAME.x
          ) /
            FRAME.width,

          0.05,
          0.95
        )
      });
    } else {
      setPreview({
        axis: "y",

        value: clamp(
          (
            point.y -
            FRAME.y
          ) /
            FRAME.height,

          0.05,
          0.95
        )
      });
    }
  }

  function startFrameDrag(
    edge: FrameEdge,
    event: PointerEvent<SVGLineElement>
  ) {
    event.stopPropagation();

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

  function startUnitSplitDrag(
    unitId: string,
    splitId: string,
    unitY: number,
    unitHeight: number,
    event: PointerEvent<SVGLineElement>
  ) {
    event.stopPropagation();

    setUnitSplitDragging({
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

  function pointerMove(
    event: PointerEvent<SVGSVGElement>
  ) {
    const point =
      pointFromEvent(event);

    if (unitSplitDragging) {
      const position =
        clamp(
          (
            point.y -
            unitSplitDragging.unitY
          ) /
            unitSplitDragging.unitHeight,

          0.05,
          0.95
        );

      props.onMoveUnitHorizontalSplit?.(
        unitSplitDragging.unitId,
        unitSplitDragging.splitId,
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

      return;
    }

    if (!preview) {
      return;
    }

    if (
      preview.axis === "x"
    ) {
      setPreview({
        axis: "x",

        value: clamp(
          (
            point.x -
            FRAME.x
          ) /
            FRAME.width,

          0.05,
          0.95
        )
      });
    } else {
      setPreview({
        axis: "y",

        value: clamp(
          (
            point.y -
            FRAME.y
          ) /
            FRAME.height,

          0.05,
          0.95
        )
      });
    }
  }

  function pointerUp() {
    if (unitSplitDragging) {
      setUnitSplitDragging(
        null
      );
      return;
    }

    if (frameDragging) {
      setFrameDragging(
        null
      );
      return;
    }

    if (dragging) {
      setDragging(null);
      return;
    }

    if (!preview) {
      return;
    }

    if (
      preview.axis === "x"
    ) {
      props.onAddVertical(
        preview.value
      );
    } else {
      props.onAddHorizontal(
        preview.value
      );
    }

    setPreview(null);
  }

  function renderLiteGrid(
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

    const horizontal =
      [
        ...config.horizontalSplits
      ].sort(
        (a, b) =>
          a.position -
          b.position
      );

    return (
      <>
        {horizontal.map(
          (split) => {
            const y =
              unit.y +
              split.position *
                unit.h;

            return (
              <g key={split.id}>

                <line
                  className="lite-split-line"

                  x1={unit.x}
                  y1={y}

                  x2={
                    unit.x +
                    unit.w
                  }

                  y2={y}
                />

                <line
                  className="lite-split-hit"

                  x1={unit.x}
                  y1={y}

                  x2={
                    unit.x +
                    unit.w
                  }

                  y2={y}

                  onPointerDown={(
                    event
                  ) =>
                    startUnitSplitDrag(
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

  return (
    <svg
      ref={svgRef}

      className="window-svg"

      viewBox="0 0 1000 625"

      onPointerDown={
        pointerDownOnCanvas
      }

      onPointerMove={
        pointerMove
      }

      onPointerUp={
        pointerUp
      }

      onPointerCancel={() => {
        setPreview(null);
        setDragging(null);
        setFrameDragging(null);
        setUnitSplitDragging(
          null
        );
      }}
    >

      <rect
        className="glass-background"

        x={FRAME.x}
        y={FRAME.y}

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
            <g key={unit.id}>

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

              {/* Unit click/tap area is deliberately BELOW the lite drag handles */}

              <rect
                className="panel-hit"

                x={unit.x}
                y={unit.y}

                width={unit.w}
                height={unit.h}

                onPointerDown={(
                  event
                ) => {
                  if (
                    props.mode !==
                    "select"
                  ) {
                    return;
                  }

                  event.stopPropagation();

                  props.onSelectPanel(
                    unit.id
                  );
                }}
              />

              {/* Internal mullions are rendered AFTER panel-hit so they sit on top */}

              {renderLiteGrid(
                unit
              )}

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
            <g key={split.id}>

              <line
                className="split-line"

                x1={x}
                y1={FRAME.y}

                x2={x}

                y2={
                  FRAME.y +
                  FRAME.height
                }
              />

              <line
                className="split-hit"

                x1={x}
                y1={FRAME.y}

                x2={x}

                y2={
                  FRAME.y +
                  FRAME.height
                }

                onPointerDown={(
                  event
                ) => {
                  event.stopPropagation();

                  setDragging({
                    axis: "x",
                    id: split.id
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
            <g key={split.id}>

              <line
                className="split-line"

                x1={FRAME.x}
                y1={y}

                x2={
                  FRAME.x +
                  FRAME.width
                }

                y2={y}
              />

              <line
                className="split-hit"

                x1={FRAME.x}
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

                  setDragging({
                    axis: "y",
                    id: split.id
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

        x={FRAME.x}
        y={FRAME.y}

        width={
          FRAME.width
        }

        height={
          FRAME.height
        }

        rx="4"
      />

      <line
        className="frame-resize-hit"

        x1={FRAME.x}
        y1={FRAME.y}

        x2={FRAME.x}
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

        y1={FRAME.y}

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

        x1={FRAME.x}
        y1={FRAME.y}

        x2={
          FRAME.x +
          FRAME.width
        }

        y2={FRAME.y}

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

        x1={FRAME.x}

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

    </svg>
  );
}
