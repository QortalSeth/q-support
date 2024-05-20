import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";
import { SxProps } from "@mui/material/styles";

export interface DataTableProps {
  columnNames: string[];
  data: string[][];
  sx?: SxProps;
}
export const DataTable = ({ columnNames, data, sx }: DataTableProps) => {
  return (
    <TableContainer sx={{ ...sx }}>
      <Table align="center" stickyHeader>
        <TableHead>
          <TableRow>
            {columnNames.map((columnName, index) => (
              <TableCell
                sx={{
                  fontSize: "30px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
                key={columnName + index}
              >
                {columnName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((tableRow, index) => {
            return (
              <TableRow key={tableRow.toString() + index}>
                {tableRow.map((tableCell, index) => (
                  <TableCell
                    sx={{
                      fontSize: index === 0 ? "30px" : "25px",
                      fontWeight: index === 0 ? "bold" : "normal",
                      textAlign: "center",
                    }}
                    key={tableCell + index}
                  >
                    {tableCell}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
