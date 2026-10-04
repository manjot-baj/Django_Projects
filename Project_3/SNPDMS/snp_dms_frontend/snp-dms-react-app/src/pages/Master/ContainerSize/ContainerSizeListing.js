import React, { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getContainerSizeListings,
  deleteContainerSizeListings,
} from "../../../actions/Master/ContainerSizeMasterActions";
import MasterListings from "../../../components/reusableComponents/MasterListings";

const ContainerSizeListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { containerSizeMaster, clientMaster } = store;
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
      name: "Container Size",
    },
  ];

  useEffect(() => {
    dispatch(getContainerSizeListings(notify));
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_CONTAINER_SIZE_MASTER" });
    history.push("/master/container-size-form");
  };

  const deleteSelected = () => {
    dispatch(deleteContainerSizeListings(clientMaster.check, notify));
  };

  return (
    <MasterListings
      rowArray={tableRow}
      masterArray={containerSizeMaster.allContainerSizeListing}
      buttonName={"Container Size"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
    />
  );
};

export default ContainerSizeListing;
