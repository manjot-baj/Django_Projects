import React, {useEffect} from 'react'
import { useDispatch, useSelector} from 'react-redux';
import { useHistory } from "react-router-dom";
import {
    getRefCodeListings,
    deleteRefCodeListings,
  } from "../../../actions/Master/RefCodeAction";
  import MasterListings from "../../../components/reusableComponents/MasterListings";
import { useSnackbar } from "notistack";
const RefCodeListing = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const notify = useSnackbar().enqueueSnackbar;
    const store = useSelector((state) => state);
    const { refCode, clientMaster } = store;
    var tableRow = [
        {
            id:1,
            name:""
        },
        {
            id:2,
            name:"ID"
        },
        {
            id:3,
            name:"Ref Code"
        }
    ];

    useEffect(() => {
        dispatch(getRefCodeListings(notify));
// eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
    
      const handleButtonClick = () => {
        dispatch({ type: "CLEAN_REF_CODE" });
        history.push("/master/refcode-form");
      };
    
      const deleteSelected = () => {
        dispatch(deleteRefCodeListings(clientMaster.check, notify));
      };


    return (
    <MasterListings
      rowArray={tableRow}
      masterArray={refCode.allRefCodeListing}
      buttonName={"Ref Code"}
      buttonClick={handleButtonClick}
      deleteSelected={deleteSelected}
    />
  );
}

export default RefCodeListing