import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getStaffMasterListing,
  deleteStaffMasterListings,
} from "../../../actions/master/StaffMasterAction";
import MasterListings from "@components/reusablecomponents/MasterListings";

const StaffMasterListing = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const store = useSelector((state) => state);
  const { staffMaster, clientMaster } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(3);

  var tableRow = [
    {
      id: 1,
      name: "",
    },
    {
      id: 2,
      name: "Qualification",
    },

    {
      id: 3,
      name: "First Name",
    },
    {
      id: 4,
      name: "Last Name",
    },
    {
      id: 5,
      name: "Mobile No.",
    },
    {
      id: 6,
      name: "Email ID",
    },
    {
      id: 7,
      name: "Location",
    },
    {
      id: 8,
      name: "Site",
    },
    {
      id: 9,
      name: "Role",
    },
  ];

  useEffect(() => {
    let data = {
      role: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    };
    dispatch(getStaffMasterListing(data));
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleButtonClick = () => {
    dispatch({ type: "CLEAN_STAFF_MASTER" });
    history.push("/master/staffMaster/form");
  };

  const deleteSelected = () => {
    dispatch(deleteStaffMasterListings(clientMaster.check, notify));
  };

  //* Get Current Posts
  const indexOfLastPost = currentPage * postsPerPage;
  // eslint-disable-next-line no-unused-vars
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  // const currentPosts =
  //   staffMaster &&
  //   staffMaster?.allStaffMasterListing?.slice(indexOfFirstPost, indexOfLastPost);

  //* Change Page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <MasterListings
      rowArray={tableRow}
      masterArray={staffMaster.allStaffMasterListing}
      buttonName={"Staff Master"}
      buttonClick={handleButtonClick}
      paginationPostsPerPage={postsPerPage}
      paginationTotalPosts={staffMaster.allStaffMasterListing.length}
      paginationPaginate={paginate}
      deleteSelected={deleteSelected}
    />
  );
};

export default StaffMasterListing;
