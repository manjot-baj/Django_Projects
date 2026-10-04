import {
  alpha,
  Avatar,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import {
  addCommentSingleUserSupportTicketAction,
  deleteCommentsSingleUserSupportTicketAction,
} from "@/actions/UserSupportAction";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";

const validationSchema = Yup.object({
  comment_text: Yup.string().required("Comment is required"),
});

const UserSupportSingleCommentSection = ({ ticket }) => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  return (
    <Paper sx={{ paddingTop: 1 }} elevation={0}>
      <Formik
        initialValues={{
          comment_text: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
         

          dispatch(
            addCommentSingleUserSupportTicketAction(ticket?.pk, values, notify)
          );
        }}
      >
        {({
          errors,
          handleSubmit,
          isSubmitting,
          touched,
          values,
          handleBlur,
          handleChange,
          resetForm,
        }) => (
          <form onSubmit={handleSubmit}>
            <TextField
              error={Boolean(touched.comment_text && errors.comment_text)}
              helperText={touched.comment_text && errors.comment_text}
              variant="outlined"
              multiline
              rows={2}
              type="text"
              size="small"
              fullWidth
              name="comment_text"
              value={values.comment_text}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <Stack
              sx={{ mt: 1 }}
              direction={"row"}
              alignItems={"center"}
              justifyContent={"flex-end"}
            >
              <Button
                color="secondary"
                variant="text"
                size="small"
                style={{
                  marginRight: "10px",
                }}
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                color="info"
                disabled={isSubmitting}
                type="submit"
                variant="contained"
                size="small"
                style={{
                  marginRight: "10px",
                }}
              >
                Add Comment
              </Button>
            </Stack>
          </form>
        )}
      </Formik>
      <Paper
        sx={(theme)=>({
          pl: 4,
          height: 200,
          overflowY: "scroll",
          pb: 22,
          mt: 1,
          "&::-webkit-scrollbar": {
            width: 0,
          },
            [theme.breakpoints.down('lg')]:{
                  pl:1
                }
        })}
        elevation={0}
      >
        <List
          sx={(theme) => ({
            width: "100%",
          })}
        >
          {ticket?.comments?.map((val, index) => (
            <ListItem
              sx={(theme) => ({
                bgcolor: alpha(theme.palette.secondary.main, 0.05),
                borderRadius: 4,
                mt:1
              })}
              secondaryAction={
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"flex-end"}
                  spacing={2}
                >
                  <IconButton
                    onClick={() =>
                      dispatch(
                        deleteCommentsSingleUserSupportTicketAction(
                          val.pk,
                          ticket?.pk,
                          notify
                        )
                      )
                    }
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              }
            >
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon fontSize="medium" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack spacing={0}>
                    <Typography sx={{ fontWeight: 500 }} lineHeight={2} variant="body2">
                      {val?.comment}
                    </Typography>
                    <Stack direction="row" spacing={4} alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" />
                        <Typography variant="caption">
                          {val?.commented_by}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="caption">
                          {val?.created_at}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Paper>
  );
};

export default UserSupportSingleCommentSection;
