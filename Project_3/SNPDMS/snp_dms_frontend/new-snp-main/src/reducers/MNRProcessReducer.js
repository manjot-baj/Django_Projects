const initialState = {
  mnrProcessData: [],
  totalSurvey: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "MNR_PROCESS_BY_EDIT":
      return { ...state, mnrProcessData: action.payload };
      case "MNR_PROCESS_UNLOCK":
        return { ...state, mnrProcessData: action.payload };
    case "MNR_COMPONENT"://main comp
      var componentDemoArray = [...state.totalSurvey];
      var componentArray = [];
      if (componentDemoArray) {
        if (componentDemoArray[action.payload.index])
          if (componentDemoArray[action.payload.index]["componentCodes"])
            componentDemoArray.splice(action.payload.index, 1);
        if (componentDemoArray[action.payload.index]) {
          if (componentDemoArray[action.payload.index]["locationCodes"])
            delete componentDemoArray[action.payload.index]["locationCodes"];
          if (componentDemoArray[action.payload.index]["specificLocationCodes"])
            delete componentDemoArray[action.payload.index][
              "specificLocationCodes"
            ];
          if (componentDemoArray[action.payload.index]["damageCodes"])
            delete componentDemoArray[action.payload.index]["damageCodes"];
          if (componentDemoArray[action.payload.index]["materialCodes"])
            delete componentDemoArray[action.payload.index]["materialCodes"];
          if (componentDemoArray[action.payload.index]["repairCodes"])
            delete componentDemoArray[action.payload.index]["repairCodes"];
          if (componentDemoArray[action.payload.index]["measurementCodes"])
            delete componentDemoArray[action.payload.index]["measurementCodes"];
          if (componentDemoArray[action.payload.index]["unitCodes"])
            delete componentDemoArray[action.payload.index]["unitCodes"];
          if (componentDemoArray[action.payload.index]["lengthWidthCodes"])
            delete componentDemoArray[action.payload.index]["lengthWidthCodes"];
        }
        componentArray = [...componentDemoArray];
        var componentObj = {
          componentCodes: action.payload.data,
        };
        componentArray.push(componentObj);
      }

      return { ...state, totalSurvey: componentArray };
    case "MNR_LOCATION":
      var locationArray = [...state.totalSurvey];
      if (locationArray[action.payload.index]) {
        if (locationArray[action.payload.index]["specificLocationCodes"])
          locationArray[action.payload.index]["specificLocationCodes"] = [];
        if (locationArray[action.payload.index]["damageCodes"])
          locationArray[action.payload.index]["damageCodes"] = [];
        if (locationArray[action.payload.index]["materialCodes"])
          locationArray[action.payload.index]["materialCodes"] = [];
        if (locationArray[action.payload.index]["repairCodes"])
          locationArray[action.payload.index]["repairCodes"] = [];
        if (locationArray[action.payload.index]["measurementCodes"])
          locationArray[action.payload.index]["measurementCodes"] = [];
        if (locationArray[action.payload.index]["unitCodes"])
          locationArray[action.payload.index]["unitCodes"] = [];
        if (locationArray[action.payload.index]["lengthWidthCodes"])
          locationArray[action.payload.index]["lengthWidthCodes"] = [];
      }
      locationArray[action.payload.index]["locationCodes"] =
        action.payload.data;
      return { ...state, totalSurvey: locationArray };
    case "MNR_SPECIFIC_LOCATION":
      var specificLocationArray = [...state.totalSurvey];
      if (specificLocationArray[action.payload.index]) {
        if (specificLocationArray[action.payload.index]["damageCodes"])
          specificLocationArray[action.payload.index]["damageCodes"] = [];
        if (specificLocationArray[action.payload.index]["materialCodes"])
          specificLocationArray[action.payload.index]["materialCodes"] = [];
        if (specificLocationArray[action.payload.index]["repairCodes"])
          specificLocationArray[action.payload.index]["repairCodes"] = [];
        if (specificLocationArray[action.payload.index]["measurementCodes"])
          specificLocationArray[action.payload.index]["measurementCodes"] = [];
        if (specificLocationArray[action.payload.index]["unitCodes"])
          specificLocationArray[action.payload.index]["unitCodes"] = [];
        if (specificLocationArray[action.payload.index]["lengthWidthCodes"])
          specificLocationArray[action.payload.index]["lengthWidthCodes"] = [];
      }
      specificLocationArray[action.payload.index]["specificLocationCodes"] =
        action.payload.data;
      return { ...state, totalSurvey: specificLocationArray };
    case "MNR_DAMAGE":
      var damageArray = [...state.totalSurvey];
      if (damageArray[action.payload.index]) {
        if (damageArray[action.payload.index]["materialCodes"])
          damageArray[action.payload.index]["materialCodes"] = [];
        if (damageArray[action.payload.index]["repairCodes"])
          damageArray[action.payload.index]["repairCodes"] = [];
        if (damageArray[action.payload.index]["measurementCodes"])
          damageArray[action.payload.index]["measurementCodes"] = [];
        if (damageArray[action.payload.index]["unitCodes"])
          damageArray[action.payload.index]["unitCodes"] = [];
        if (damageArray[action.payload.index]["lengthWidthCodes"])
          damageArray[action.payload.index]["lengthWidthCodes"] = [];
      }
      damageArray[action.payload.index]["damageCodes"] = action.payload.data;
      return { ...state, totalSurvey: damageArray };
    case "MNR_MATERIAL":
      var materialArray = [...state.totalSurvey];
      if (materialArray[action.payload.index]) {
        if (materialArray[action.payload.index]["repairCodes"])
          materialArray[action.payload.index]["repairCodes"] = [];
        if (materialArray[action.payload.index]["measurementCodes"])
          materialArray[action.payload.index]["measurementCodes"] = [];
        if (materialArray[action.payload.index]["unitCodes"])
          materialArray[action.payload.index]["unitCodes"] = [];
        if (materialArray[action.payload.index]["lengthWidthCodes"])
          materialArray[action.payload.index]["lengthWidthCodes"] = [];
      }
      materialArray[action.payload.index]["materialCodes"] =
        action.payload.data;
      return { ...state, totalSurvey: materialArray };
    case "MNR_REPAIR":
      var repairArray = [...state.totalSurvey];
      repairArray[action.payload.index]["repairCodes"] = action.payload.data;
      if (repairArray[action.payload.index]) {
        if (repairArray[action.payload.index]["measurementCodes"])
          repairArray[action.payload.index]["measurementCodes"] = [];
        if (repairArray[action.payload.index]["unitCodes"])
          repairArray[action.payload.index]["unitCodes"] = [];
        if (repairArray[action.payload.index]["lengthWidthCodes"])
          repairArray[action.payload.index]["lengthWidthCodes"] = [];
      }
      return { ...state, totalSurvey: repairArray };
    case "MNR_MEASUREMENT":
      var unitArray = [...state.totalSurvey];
      unitArray[action.payload.index]["measurementCodes"] = action.payload.data;
      if (unitArray[action.payload.index]) {
        if (unitArray[action.payload.index]["unitCodes"])
          unitArray[action.payload.index]["unitCodes"] = [];
        if (unitArray[action.payload.index]["lengthWidthCodes"])
          unitArray[action.payload.index]["lengthWidthCodes"] = [];
      }
      return { ...state, totalSurvey: unitArray };
    // case "MNR_UNIT":
    //   var measurementArray = [...state.totalSurvey];
    //   measurementArray[action.payload.index]["unitCodes"] = action.payload.data;
    //   if (measurementArray[action.payload.index]) {
    //     if (measurementArray[action.payload.index]["lengthWidthCodes"])
    //       measurementArray[action.payload.index]["lengthWidthCodes"] = [];
    //   }
    //   return { ...state, totalSurvey: measurementArray };
    case "MNR_LENGTH_WIDTH":
      var lengthWidthArray = [...state.totalSurvey];
      lengthWidthArray[action.payload.index]["lengthWidthCodes"] =
        action.payload.data;
      return { ...state, totalSurvey: lengthWidthArray };
    case "HANDLE_SURVEY_LINE_INDEX":
      var deleteIndexArray = [...state.totalSurvey];
      deleteIndexArray.splice(action.payload, 1);
      return { ...state, totalSurvey: deleteIndexArray };
    case "RESET_MNR_PROCESS_DATA":
      return { ...state, totalSurvey: [] };
    default:
      return { ...state };
  }

};
