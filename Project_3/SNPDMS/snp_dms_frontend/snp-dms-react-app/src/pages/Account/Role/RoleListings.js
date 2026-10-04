import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getRoleListings,
  deleteRoleListings,
} from "../../../actions/Admin/RoleMasterActions";
import MasterListings from "../../../components/reusableComponents/MasterListings";
import { useSnackbar } from "notistack";

const RoleListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { roleMaster, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;
  var tableRow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "ID",
    },
    {
      id: 3,
      name: "Role Name",
    },
  ];

  useEffect(() => {
    dispatch(getRoleListings());
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_ROLE_MASTER" });
    history.push("/account/role-form");
  };

  const deleteSelected = () => {
    dispatch(deleteRoleListings(clientMaster.check, notify));
  };

  return (
    <MasterListings
      rowArray={tableRow}
      masterArray={roleMaster.allRoleListing}
      buttonName={"Role"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
    />
  );
};

export default RoleListing;
