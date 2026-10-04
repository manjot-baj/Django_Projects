import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import {
  getTariffListing,
  deleteTariff,
  downloadTariff,
} from "../../../actions/master/TariffTypeMasterAction";
import MasterListings from "@components/reusablecomponents/MasterListings";
import { useSnackbar } from "notistack";

const TariffTypeListing = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { tariff, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;

  const history = useHistory();

  var tablerow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "Client Ref Code",
    },
    {
      id: 3,
      name: "Location",
    },
    {
      id: 4,
      name: "Site",
    },
    {
      id: 5,
      name: "Labour Rate",
    },
  ];
  useEffect(() => {
    let data;
    data = {
      client: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(getTariffListing(data));
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_TARIFF_MASTER" });
    history.push("/master/tariffDocument/form");
  };

  const deleteSelected = () => {
    dispatch(deleteTariff(clientMaster.check, notify));
  };

  const handleDownloadTariff = () => {
    dispatch(downloadTariff(clientMaster.check, notify));
  };

  return (
    <MasterListings
      rowArray={tablerow}
      masterArray={tariff.allTariffListing}
      buttonName={"Tariff Type"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
      downloadSelected={handleDownloadTariff}
    />
  );
};

export default TariffTypeListing;
