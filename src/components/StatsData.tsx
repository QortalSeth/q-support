import React, { useEffect } from "react";
import { styled } from "@mui/system";
import { Grid } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../state/store.ts";
import { useFetchFiles } from "../hooks/useFetchFiles.tsx";

export const StatsData = () => {
  const StatsCol = styled(Grid)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    width: "100%",
    padding: "20px 0px",
    backgroundColor: theme.palette.background.default,
  }));

  const {
    getFiles,
    checkAndUpdateFile,
    getFile,
    hashMapFiles,
    getNewFiles,
    checkNewFiles,
    getFilesFiltered,
    getFilesCount,
  } = useFetchFiles();

  const totalIssuesPublished = useSelector(
    (state: RootState) => state.global.totalFilesPublished
  );
  const totalNamesPublished = useSelector(
    (state: RootState) => state.global.totalNamesPublished
  );
  const issuesPerNamePublished = useSelector(
    (state: RootState) => state.global.filesPerNamePublished
  );

  useEffect(() => {
    getFilesCount();
  }, [getFilesCount]);

  return (
    totalIssuesPublished > 0 && (
      <StatsCol>
        <div>
          Issues Published:{" "}
          <span style={{ fontWeight: "bold" }}>
            {totalIssuesPublished || ""}
          </span>
        </div>
        <div>
          Publishers:{" "}
          <span style={{ fontWeight: "bold" }}>
            {totalNamesPublished || ""}
          </span>
        </div>
        <div>
          Average:{" "}
          <span style={{ fontWeight: "bold" }}>
            {issuesPerNamePublished > 0 &&
              Number(issuesPerNamePublished).toFixed(0)}
          </span>
        </div>
      </StatsCol>
    )
  );
};