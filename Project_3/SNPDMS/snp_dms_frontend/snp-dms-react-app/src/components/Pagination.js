import React, { useState } from "react";
import PaginationItem from "@material-ui/lab/Pagination";
import { Grid, useMediaQuery } from "@material-ui/core";

const Pagination = ({ postsPerPage, totalPosts, paginate, pageNumber }) => {
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
      style={{marginTop:matchesIphone?"20px":"10px"}}
    >
      <Grid
        item
        // xs={3}
      >
        <PaginationItem
          count={pageNumbers.length}
          color="secondary"
          page={page}
          onChange={handlePageChange}
          size={matchesIphone?"small":"large"}
        />
      </Grid>
    </Grid>
  );
};

export default Pagination;
