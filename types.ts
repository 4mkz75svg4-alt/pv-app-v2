export type PanelType =
  | "Picture"
  | "Casement Left"
  | "Casement Right"
  | "Awning"
  | "Slider Left"
  | "Slider Right";

export type Split = {
  id: string;
  position: number;
};

export type LiteConfig = {
  type: PanelType;
};

export type WindowUnitConfig = {
  id: string;

  litesWide: number;
  litesTall: number;

  verticalSplits: Split[];
  horizontalSplits: Split[];

  liteConfigs: Record<
    string,
    LiteConfig
  >;
};

export type ConfiguratorState = {
  overallWidth: number;
  overallHeight: number;

  verticalSplits: Split[];
  horizontalSplits: Split[];

  panelConfigs: Record<
    string,
    {
      type: PanelType;
    }
  >;

  windowUnits?: Record<
    string,
    WindowUnitConfig
  >;

  gridColumns: number;
  gridRows: number;
};
