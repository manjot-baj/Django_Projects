import React, { useState } from "react";
import { PaginationItem, Pagination } from "@mui/material";
import { Grid, useMediaQuery } from "@mui/material";

const CustomPagination = ({ postsPerPage, totalPosts, paginate, pageNumber }) => {
  const pageNumbers = [];
  const [page, setPage] = useState(1);
  const matchesIphone = useMediaQuery("(max-width:400px)");

  for (var i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (event, value) => {
    paginate(value);
    setPage(value);
  };

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
      style={{ marginTop: matchesIphone ? "20px" : "10px" }}
    >
      <Grid
        item
        // xs={3}
      >
        <Pagination
         count={pageNumbers.length}
         onChange={handlePageChange}
          renderItem={(item) => (
            <PaginationItem
         
            size={matchesIphone ? "small" : "large"}
            page={page}
            color="secondary"
              
              {...item}
            />
          )}
        />
    
      </Grid>
    </Grid>
  );
};

export default CustomPagination;
