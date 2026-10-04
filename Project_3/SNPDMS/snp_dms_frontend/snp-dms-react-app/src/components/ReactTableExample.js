import React, { useState, Component } from "react";
import { useTable } from "react-table";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";

// class ReactTableExample extends Component {
const ReactTableExample = () => {
  const [expandedState, setExpandedState] = useState({});
  // state = {
  //   expandedState: {},
  // };
  const dummyData = [
    {
      firstName: "alice",
      lastName: "adams",
      age: 11,
      comments: [],
      status: "Available",
      is_alloted: "True",
      booking_no: "abcd",
      // allotment from backenfd
    },
    {
      firstName: "bob",
      lastName: "brady",
      age: 18,
      comments: ["hello", "i like things that start with b"],
      status: "Available",
      is_alloted: "False",
      booking_no: "",
    },
    {
      firstName: "Another",
      lastName: "User",
      age: 15,
      comments: [],
      status: "Available",
      is_alloted: "True",
      booking_no: "abcde",
    },
    {
      firstName: "catherine",
      lastName: "collins",
      age: 22,
      comments: [
        "just chiming in with things that start with c",
        "Mary Poppins does drugs",
        "Who is Donald anyway?",
      ],
      status: "Survey pending",
      is_alloted: "False",
      booking_no: "",
    },
    {
      firstName: "david",
      lastName: "davidson",
      age: 34,
      comments: ["just chiming in with things that start with c"],
      status: "Available",
      is_alloted: "False",
      booking_no: "",
    },
  ];
  const Columns = [
    {
      Header: "First Name",
      accessor: "firstName",
    },
    {
      Header: "Last Name",
      accessor: "lastName",
    },
    {
      Header: "Age",
      accessor: "age",
      width: 50,
    },
    {
      expander: true,
      Header: () => <strong>Comments</strong>,
      width: 100,
      Expander: ({ isExpanded, ...rest }) => {
        // test your condition for Sub-Component here
        // I am using the presence of no comments
        if (rest.original.status === "Available") {
          // {
          //   return null;
          // } else
          return (
            <div>
              {isExpanded ? (
                <input type="checkbox" value={true} />
              ) : (
                <input type="checkbox" value={false} />
              )}
            </div>
          );
        }
      },
      getProps: (state, rowInfo, column) => {
        if (rowInfo) {
          // same test as above
          if (rowInfo.original.is_alloted === "True") {
            // hijack the onClick so it doesn't open
            return {
              onClick: () => {},
            };
          }
        }
        // return {
        //   className: "show-pointer",
        // };
      },
      style: {
        fontSize: 25,
        padding: "0",
        textAlign: "center",
        userSelect: "none",
      },
    },
  ];

  // render() {
  return (
    <ReactTable
      data={dummyData}
      defaultPageSize={5}
      columns={[...Columns]}
      onExpandedChange={(expanded, index, event) => {
        // don't for get to save the 'expanded'
        // so it can be fed back in as a prop
        // this.setState({ expandedState: expanded });
        setExpandedState(expanded);
      }}
      // expanded={this.state.expandedState}
      expanded={expandedState}
      SubComponent={(row) => {
        // this is the broken part

        // NOTE: you need to return your component if there a {}
        // and the correct semantics for the LI wrapper is UL (not DIV)
        return (
          <ul>
            {row.original.comments.map((item, i) => {
              return (
                <li key={i} row={row}>
                  {item}
                </li>
              );
            })}
          </ul>
        );
      }}
    />
  );
  // }
};

export default ReactTableExample;
