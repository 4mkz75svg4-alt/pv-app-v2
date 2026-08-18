<button
  className={
    productType === "Slider"
      ? "active"
      : ""
  }
  onClick={() => {
    const unitId =
      selectedUnit ?? "0-0";

    setProductType("Slider");
    setSliderOrientation("Horizontal");
    setHorizontalSliderType("Single Vent");
    setSliderPattern("XO");
    setSliderSplitMode("equal");
    setSliderCustomSizes([]);

    setSelectedUnit(unitId);

    applyHorizontalSliderToUnit(
      unitId,
      "Single Vent",
      "equal"
    );
  }}
>
  Slider
</button>
