import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
  Box,
  Modal,
  useMediaQuery,
} from "@material-ui/core";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { Autocomplete } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  editTools,
  editToolsButton,
  toolGetAllCategory,
} from "../../actions/Procurement/procurementAction";
import { useSnackbar } from "notistack";

const FormModel = ({ modalOpen, setModalClose, handleAdd, editMode }) => {
  const dispatch = useDispatch();
  const { role } = useSelector((state) => state.user);
  const proState = useSelector((state) => state.Procurement);
  const matchesIphone = useMediaQuery("(max-width:400px)");
  const [tool, setTool] = useState({
    category: "",
    sku_code: "",
    rate: "",
    name: "",
    unit: "",
    in_stock: 0,
  });
  const notify = useSnackbar().enqueueSnackbar;
  const [formError, setFormError] = useState(false);

  const style = {
    position: "absolute",
    top: matchesIphone ? "50%" : "55%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    width: matchesIphone ? "90%" : "80%",
    borderRadius: "10px",
    zIndex: "999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const handleChange = (e) => {
    const { value, name } = e.target;
    if (name === "in_stock" && role !== "Admin") {
      return;
    }
    setTool((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    dispatch(toolGetAllCategory());
    setTool((prev) => ({ ...prev, ...proState.toolEdit }));
    return () => dispatch(editTools({},notify));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proState.toolEdit.pk]);

  return (
    <Grid>
      <Modal
        open={modalOpen}
        onClose={() => {
          setTool({
            category: "",
            sku_code: "",
            rate: "",
            name: "",
            unit: "",
            in_stock: 0,
          });
          setModalClose();
        }}
      >
        <Box sx={style}>
          <Grid
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
            container
            spacing={12}
          >
            <Typography variant="h5" component="h5">
              Add Tool
            </Typography>
            <Paper
              elevation={4}
              style={{
                padding: matchesIphone ? "5px 10px" : "10px 20px",
                width: "100%",
                marginTop: "20px",
              }}
            >
              <form style={{ width: "100%" }}>
                <Grid
                  container
                  spacing={5}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <Grid item xs={6} md={4}>
                    <Autocomplete
                      value={tool.category}
                      onChange={(event, newValue) => {
                        setTool((prev) => ({
                          ...prev,
                          category: newValue.name,
                        }));
                      }}
                      options={
                        proState.getAllToolsCategory.category_list?.map(
                          (val) => ({ label: val.name, ...val })
                        ) || []
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label="Category"
                          InputLabelProps={{
                            style: { color: "black", fontSize: "12px" },
                          }}
                          error={formError && tool.category.length === 0}
                          name="category"
                          onBlur={(e) => {
                            const { value } = e.target;
                            setTool((prev) => ({
                              ...prev,
                              category: value,
                            }));
                          }}
                          required
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <Autocomplete
                      value={tool.name}
                      onChange={(event, newValue) => {
                        setTool((prev) => ({
                          ...prev,
                          name: newValue.name,
                        }));
                      }}
                      options={proState.getAllToolsCategory.tools_list?.map((val)=>({label:val.name,...val})) || []}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label="Item"
                          name="name"
                          error={formError && tool.name.length === 0}
                          InputLabelProps={{
                            style: { color: "black", fontSize: "12px" },
                          }}
                          onBlur={(e) => {
                            setTool((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }));
                          }}
                          required
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <TextField
                      id="standard-basic"
                      label="SKU Code"
                      variant="standard"
                      value={tool.sku_code}
                      error={formError && tool.sku_code.length === 0}
                      InputLabelProps={{
                        style: { color: "black", fontSize: "12px" },
                      }}
                      name="sku_code"
                      type="text"
                      onChange={handleChange}
                      required={true}
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <TextField
                      id="standard-basic"
                      label="Unit"
                      variant="standard"
                      value={tool.unit}
                      error={formError && tool.unit.length === 0}
                      InputLabelProps={{
                        style: { color: "black", fontSize: "12px" },
                      }}
                      name="unit"
                      onChange={handleChange}
                      required={true}
                    />
                  </Grid>

                  <Grid item xs={6} md={4}>
                    <TextField
                      id="standard-basic"
                      label="Rate"
                      variant="standard"
                      value={tool.rate}
                      error={formError && tool.rate.length === 0}
                      InputLabelProps={{
                        style: { color: "black", fontSize: "12px" },
                      }}
                      name="rate"
                      type="number"
                      onChange={handleChange}
                      required={true}
                    />
                  </Grid>
                  <Grid item xs={6} md={4}>
                    <TextField
                      id="standard-basic"
                      label="Stock"
                      variant="standard"
                      InputLabelProps={{
                        style: { color: "black", fontSize: "12px" },
                      }}
                      type="number"
                      step="any"
                      value={tool.in_stock
                      }
                      name="in_stock"
                      disabled
                    />
                  </Grid>
                </Grid>
                <Grid>
                  {proState.toolEdit === null ||
                  proState.toolEdit.category === undefined ? (
                    ""
                  ) : (
                    <Button
                      variant="contained"
                      endIcon={<EditIcon />}
                      color="secondary"
                      type="submit"
                      style={{
                        margin: " 20px 5px ",
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        if (
                          tool.category.length === 0 ||
                          tool.name.length === 0 ||
                          tool.rate.length === 0 ||
                          tool.sku_code.length === 0 ||
                          tool.sku_code === "" ||
                          tool.unit.length === 0 ||
                          tool.unit === ""
                        ) {
                          notify("Please fill all the required fields ", {
                            variant: "warning",
                          });
                          setFormError(true);
                          return;
                        }
                        setFormError(false);
                        dispatch({
                          type: "EDIT_TOOLS",
                          payload: {
                            category: "",
                            hsn_code: "",
                            rate: "",
                            name: "",
                          },
                        });
                        dispatch(
                          editToolsButton(proState.toolEdit.pk, tool, notify)
                        );
                        setTool({
                          category: "",
                          sku_code: "",
                          rate: "",
                          name: "",
                          unit: "",
                          in_stock: 0,
                        });
                        return setModalClose();
                      }}
                    >
                      Update Tool
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    endIcon={<AddIcon />}
                    color="secondary"
                    type="submit"
                    style={{
                      margin: " 20px 5px ",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      if (
                        tool.category.length === 0 ||
                        tool.name.length === 0 ||
                        tool.rate.length === 0 ||
                        tool.sku_code === 0 ||
                        tool.sku_code === "" ||
                        tool.unit.length === 0 ||
                        tool.unit === ""
                      ) {
                        notify("Please fill all the required fields ", {
                          variant: "warning",
                        });
                        setFormError(true);
                        return;
                      }

                      setFormError(false);

                      handleAdd(tool);
                      setTool({
                        category: "",
                        sku_code: "",
                        rate: "",
                        name: "",
                        unit: "",
                        in_stock: 0,
                      });
                    }}
                  >
                    Add Tool
                  </Button>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Box>
      </Modal>
    </Grid>
  );
};

export default FormModel;
