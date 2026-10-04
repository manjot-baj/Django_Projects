import React, { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  withStyles,
  Box
} from "@material-ui/core";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const StyledTableCell = withStyles(() => ({
  head: {
    fontWeight: 600,
    color: "white",
    fontSize: "12px",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    backgroundColor: "#172b4d",
  },
  root: {
    borderBottom: "none",
    borderColor: "transparent",
  },
}))(TableCell);

const StyledTableRow = withStyles(() => ({
  root: {
    backgroundColor: "white",
    borderRadius: 20,
    "&:hover": {
      boxShadow: "0px 3px 6px #9199A14D",
      // cursor: "pointer",
    },
  },
}))(TableRow);

const StyledTableDataCell = withStyles(() => ({
  root: {
    fontWeight: 600,
    color: "#172b4d",
    fontSize: 12.5,
    paddingLeft: "20px",
    borderBottom: "none",
    borderColor: "transparent",
    textTransform: "uppercase",
  },
}))(TableCell);

const useStyles = makeStyles((theme) => ({
  header: {
    background: theme.palette.success.main,
  },
  cell: {
    width: 100,
  },
  rootClass: {
    flexGrow: 1,
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: "0px 10px",
    borderColor: "transparent",
    backgroundColor: "transparent",
    [theme.breakpoints.down("sm")]: {
      minWidth: "auto",
      overflow: "hidden",
    },
  },
}));

const MaterialUIAccordianTable = () => {
  const style = useStyles();
  const [expandedRow, setExpandedRow] = useState(null);

  const handleAccordionChange = (rowId) => {
    setExpandedRow(expandedRow === rowId ? null : rowId);
  };

  const data = [
    { id: 1, name: "John Doe", age: 28, location: "New York" },
    { id: 2, name: "Jane Smith", age: 32, location: "Los Angeles" },
    { id: 3, name: "Michael Johnson", age: 45, location: "Chicago" },
  ];
  return (
    <Table     className={style.table}
    aria-label="simple table">
      <TableHead className={style.header}>
        <TableRow>
          {data.map((col) => (
            <StyledTableCell className={style.cell}>{col.name}</StyledTableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row) => (
          <React.Fragment key={row.id}>
            <StyledTableRow onClick={()=> handleAccordionChange(row.id)}>
              <StyledTableDataCell>{row.name}</StyledTableDataCell>
              <StyledTableDataCell>{row.age}</StyledTableDataCell>
              <StyledTableDataCell>{row.location}</StyledTableDataCell>
            </StyledTableRow>
         
           { expandedRow ===row.id &&   <StyledTableDataCell colSpan={3} >
                <Accordion
                  expanded={expandedRow === row.id}
                  onChange={() => handleAccordionChange(row.id)}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${row.id}-content`}
                    id={`panel-${row.id}-header`}
                  >
                    <Typography>More Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2">
                        Additional information for {row.name}. {row.location}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </StyledTableDataCell>}
           
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default MaterialUIAccordianTable;
