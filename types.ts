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

export type PanelConfig = {
  type: PanelType;
};

export type ConfiguratorState = {
  overallWidth: number;
  overallHeight: number;
  verticalSplits: Split[];
  horizontalSplits: Split[];
  panelConfigs: Record<string, PanelConfig>;
  gridColumns: number;
  gridRows: number;
};
