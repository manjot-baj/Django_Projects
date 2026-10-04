import { axiosInstance } from "../Axios";
import { REPAIR_REDUCER } from "../reducers/RepairTabReducer";

export const saveRepairAction =
  (placement, complete, damage_category, grade, remarks, man_power,estimate_id, notify) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { container_no, pk } = await getState().RepairTabReducer
      .mnrProcessData;

    if(placement === "True" && damage_category.length === 0){
      notify("Please fill Damage Category",{variant:"warning"})
      return 
    }

    if(placement === "True" && man_power.length === 0){
      notify("Please fill Man Power",{variant:"warning"})
      return
    }

   

      if(complete === "True" && grade.length === 0){
        notify("Please fill Grade",{variant:"warning"})
        return
        
      }

    axiosInstance
      .post(`mnr/repair/`, {
        pk,
        container_no,
        location,
        placement: placement,
        complete: complete,
        damage_category: damage_category,
        grade: grade,
        remarks: remarks,
        estimate_id,
        man_power: man_power,
        site,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          notify(res.data.successMsg, { variant: "success" });
          dispatch(searchContainerAction(container_no, notify,container_no));
        }
      })
      .catch((err) => {
        notify("Container not found, Please add the container", {
          variant: "error",
        });
        console.error(err);
      });
  };

export const uploadRepairImageAction =
  (body, pk, notify, setIsImageUploading) => async (dispatch, getState) => {
    const { container_no } = await getState().RepairTabReducer.mnrProcessData;
    axiosInstance  
      .post(`mnr/repair/${pk}/upload_image/`, body)
      .then((res) => {
        if (res.data.errorMsg) {
          setIsImageUploading(false);
          notify(res.data.errorMsg, { variant: "error" });
        } else if (res.data.successMsg) {
          setIsImageUploading(false);
          notify(res.data.successMsg, { variant: "success" });
          dispatch(searchContainerAction(container_no, notify, container_no));
        }
      })
      .catch((err) => {
        setIsImageUploading(false);
        console.error(err);
      });
  };

export const searchContainerAction =
  (container_no, notify, container) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;

    axiosInstance
      .post(`mnr/repair_data/`, {
        container_no,
        location,
        site,
      })
      .then((res) => {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        } else {
          dispatch({ type: REPAIR_REDUCER.INITIAL_DATA });
          dispatch({ type: REPAIR_REDUCER.DATA_CHANGE, payload: res.data });
          if (res.data.container_no !== container) {
            notify(`Please Upload Images for ${res.data.container_no} .`, {
              variant: "error",
            });
          }
        }
      })
      .catch((err) => {
        notify("Container not found, Please add the container", {
          variant: "error",
        });
        console.error(err);
      });
  };

export const getContainerListAction = () => async (dispatch, getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;

  axiosInstance
    .post(`mnr/get_containers_list/`, {
      location,
      site,
    })
    .then((res) => {
      dispatch({ type: REPAIR_REDUCER.CONTAINERS_ADD, payload: res.data });
    })
    .catch((err) => {
      console.error(err);
    });
};
