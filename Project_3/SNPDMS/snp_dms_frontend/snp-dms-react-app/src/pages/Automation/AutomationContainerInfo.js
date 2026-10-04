import React, { useCallback, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import { Box, useMediaQuery } from "@material-ui/core";
import AutomationSearch from "../../components/reusableComponents/AutomationSearch";
import AutomationTable from "../../components/reusableComponents/AutomationTable.";
import { useDispatch } from "react-redux";
import { automationInfoAction } from "../../actions/AutomationActions";
import { useSnackbar } from "notistack";
import CustomHeading from "../../components/CustomHeading";

const rowArray = [
  "container_no",
  "is_valid",
  "size",
  "type",
  "client",
  "created_at",
  "date",
  "status",
  "is_available",
  "shipping_line",
  "ref_code",
  "updated_at",
  "is_date_updated",
  "automatic_mnr_status_change",
  "excel_edi_sent",
  "text_edi_sent",
  "in_entry_count",
  "out_entry_count",
  "in_do_not_lift_queue",
  "location",
  "site"
];

const AutomationContainerInfo = () => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [process, setProcess] = useState("IN");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState("");
  const [data, setData] = useState([]);
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const handleSearchButton = useCallback(
    () =>
      dispatch(
        automationInfoAction(
          { process, container_no: searchText.split(',') },
          setLoading,
          setData,
          notify
        )
      ),
    [data, searchText, loading, notify,process]
  );
  const handleSearchChange = useCallback(
    (e) => {
      setSearchText(e.target.value);
    },
    [searchText]
  );
  const handleCloseClick = useCallback(() => setSearchText(""), [searchText]);
  const handleSetProcess = useCallback(
    (e) => setProcess(e.target.value),
    [process]
  );

  
  return (
    <LayoutContainer footer={false}>
      <CustomHeading variant="h6" customClass="pageTitle">
      Automation Container Information
      </CustomHeading>
    

      <Box marginTop={8}></Box>
      {/* <Paper style={{ padding: "24px 8px" }}> */}
        <AutomationSearch
          process={process}
          handleSetProcess={handleSetProcess}
          searchText={searchText}
          handleSearchChange={handleSearchChange}
          loading={loading}
          setLoading={setLoading}
          handleSearchButton={handleSearchButton}
          handleCloseClick={handleCloseClick}
          fullWidth={matchesIphone?true:false}

        />

        <AutomationTable rowArray={rowArray} masterArray={data} />
      {/* </Paper> */}
    </LayoutContainer>
  );
};

export default AutomationContainerInfo;
