import React, { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getExportCargoTypeListings,
  deleteExportCargoTypeListings,
} from "../../../actions/master/ExportCargoTypeMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";

const ExportCargoTypeListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { exportCargoTypeMaster, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;
  var tableRow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "Sr No",
    },
    {
      id: 3,
      name: "Export Cargo Name",
    },
  ];

  useEffect(() => {
    dispatch(getExportCargoTypeListings(notify));
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_EXPORT_CARGO_TYPE_MASTER" });
    history.push("/master/exportCargoType/form");
  };

  const deleteSelected = () => {
    dispatch(deleteExportCargoTypeListings(clientMaster.check, notify));
  };

  return (
    <MasterListings
      rowArray={tableRow}
      masterArray={exportCargoTypeMaster.allExportCargoTypeListing}
      buttonName={"Export Cargo Type"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
    />
  );
};

export default ExportCargoTypeListing;
