import React, { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getContainerTypeListings,
  deleteContainerTypeListings,
} from "../../../actions/master/ContainerTypeMasterActions";
import MasterListings from "@components/reusablecomponents/MasterListings";

const ContainerTypeListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { containerTypeMaster, clientMaster } = store;
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
      name: "Container Type",
    },
  ];

  useEffect(() => {
    dispatch(getContainerTypeListings(notify));
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_CONTAINER_TYPE_MASTER" });
    history.push("/master/containerType/form");
  };

  const deleteSelected = () => {
    dispatch(deleteContainerTypeListings(clientMaster.check, notify));
  };

  return (
    <MasterListings
      rowArray={tableRow}
      masterArray={containerTypeMaster.allContainerTypeListing}
      buttonName={"Container Type"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
    />
  );
};

export default ContainerTypeListing;
