import React, { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getContainerTypeSizeCodeListings,
  deleteContainerTypeSizeCodeListings,
} from "../../../actions/Master/ContainerTypeSizeMasterActions";
import MasterListings from "../../../components/reusableComponents/MasterListings";

const ContainerTypeSizeCodeListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { containerTypeSizeCodeMaster, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;
  var tableRow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "Container ISO Code",
    },
    {
      id: 3,
      name: "Container Type",
    },
    {
      id: 4,
      name: "Container Size",
    },
  ];

  useEffect(() => {
    dispatch(getContainerTypeSizeCodeListings(notify));
    
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_CONTAINER_TYPE_SIZE_CODE_MASTER" });
    history.push("/master/container-type-size-code-form");
  };

  const deleteSelected = () => {
    dispatch(deleteContainerTypeSizeCodeListings(clientMaster.check, notify));
  };

  return (
    <MasterListings
      rowArray={tableRow}
      masterArray={containerTypeSizeCodeMaster.allContainerTypeSizeCodeListing}
      buttonName={"Container ISO Code"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
    />
  );
};

export default ContainerTypeSizeCodeListing;
