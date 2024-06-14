import { DataTable } from "./DataTable.tsx";
import { FeePrice, fetchFees } from "./FeePricePublish.ts";
import React, { useEffect, useState } from "react";

export interface FeeHistoryProps {
  showFeeType?: boolean;
  showCoinType?: boolean;
  filterData?: () => string[][];
}
export const FeeHistoryTable = ({
  showFeeType = true,
  showCoinType = true,
  filterData,
}: FeeHistoryProps) => {
  const [feeData, setFeeData] = useState<FeePrice[]>([]);

  const fetchFeesOnStartup = () => {
    fetchFees().then(feeResponse => {
      setFeeData(filterData ? feeData.filter(filterData) : feeResponse);
    });
  };

  useEffect(fetchFeesOnStartup, []);

  const columnNames = ["ID", "Date", "Fee Amount"];
  if (showFeeType) columnNames.push("Fee Type");
  if (showCoinType) columnNames.push("Coin Type");

  const data: string[][] = [];

  const getRowData = (row: FeePrice, index: number) => {
    const rowData: string[] = [];
    rowData.push(
      index.toString(),
      new Date(row.time).toDateString(),
      row.feeAmount.toString()
    );

    if (showFeeType) rowData.push(row.feeType);
    if (showCoinType) rowData.push(row.coinType);

    return rowData;
  };

  feeData.map((row, index) => {
    data.push(getRowData(row, index + 1));
  });
  return <DataTable columnNames={columnNames} data={data} />;
};
