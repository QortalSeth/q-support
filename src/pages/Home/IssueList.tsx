import { Avatar, Box, Skeleton } from "@mui/material";
import {
  BlockIconContainer,
  IconsBox,
  IssueCard,
  IssueContainer,
  NameAndDateContainer,
  VideoCardName,
  VideoCardTitle,
  VideoUploadDate,
} from "./IssueList-styles.tsx";
import EditIcon from "@mui/icons-material/Edit";
import {
  blockUser,
  Issue,
  setEditFile,
} from "../../state/features/fileSlice.ts";
import BlockIcon from "@mui/icons-material/Block";
import { formatBytes } from "../IssueContent/IssueContent.tsx";
import { formatDate } from "../../utils/time.ts";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store.ts";
import { useNavigate } from "react-router-dom";
import { getIconsFromObject } from "../../constants/Categories/CategoryFunctions.ts";

import { IssueIcon, IssueIcons } from "../../components/common/IssueIcon.tsx";
import QORTicon from "../../assets/icons/qort.png";
import { fontSizeMedium } from "../../constants/Misc.ts";

interface FileListProps {
  issues: Issue[];
}
export const IssueList = ({ issues }: FileListProps) => {
  const hashMapIssues = useSelector(
    (state: RootState) => state.file.hashMapFiles
  );

  const [showIcons, setShowIcons] = useState(null);
  const username = useSelector((state: RootState) => state.auth?.user?.name);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const blockUserFunc = async (user: string) => {
    if (user === "Q-Support") return;

    try {
      const response = await qortalRequest({
        action: "ADD_LIST_ITEMS",
        list_name: "blockedNames",
        items: [user],
      });

      if (response === true) {
        dispatch(blockUser(user));
      }
    } catch (error) {}
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue: any) => hashMapIssues[issue.id]?.isValid);
  }, [issues, hashMapIssues]);

  return (
    <IssueContainer>
      {filteredIssues.map((issue: any, index: number) => {
        const existingFile = hashMapIssues[issue?.id];
        let hasHash = false;
        let issueObj = issue;
        if (existingFile) {
          issueObj = existingFile;
          hasHash = true;
        }

        const issueIcons = getIconsFromObject(issueObj);
        const fileBytes = issueObj?.files.reduce(
          (acc, cur) => acc + (cur?.size || 0),
          0
        );
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              height: "75px",
              position: "relative",
            }}
            key={issueObj.id}
            onMouseEnter={() => setShowIcons(issueObj.id)}
            onMouseLeave={() => setShowIcons(null)}
          >
            {hasHash ? (
              <>
                <IconsBox
                  sx={{
                    opacity: showIcons === issueObj.id ? 1 : 0,
                    zIndex: 2,
                  }}
                >
                  {issueObj?.user === username && (
                    <BlockIconContainer
                      onClick={() => {
                        dispatch(setEditFile(issueObj));
                      }}
                    >
                      <EditIcon />
                      Edit Issue
                    </BlockIconContainer>
                  )}

                  {issueObj?.user !== username && (
                    <BlockIconContainer
                      onClick={() => {
                        blockUserFunc(issueObj?.user);
                      }}
                    >
                      <BlockIcon />
                      Block User
                    </BlockIconContainer>
                  )}
                </IconsBox>
                <IssueCard
                  onClick={() => {
                    navigate(`/issue/${issueObj?.user}/${issueObj?.id}`);
                  }}
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "200px",
                      }}
                    >
                      <IssueIcons
                        iconSources={issueIcons}
                        style={{ marginRight: "20px" }}
                        showBackupIcon={true}
                      />
                    </div>
                    <VideoCardTitle
                      sx={{
                        width: "150px",
                        fontSize: fontSizeMedium,
                      }}
                    >
                      {fileBytes > 0 && formatBytes(fileBytes)}
                    </VideoCardTitle>
                    <VideoCardTitle sx={{ fontWeight: "bold", width: "500px" }}>
                      {issueObj.title}
                    </VideoCardTitle>
                  </Box>

                  {issue?.feeData?.isPaid && (
                    <IssueIcon
                      iconSrc={QORTicon}
                      style={{ marginRight: "20px" }}
                    />
                  )}

                  <NameAndDateContainer
                    sx={{ width: "200px", height: "100%" }}
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/channel/${issueObj?.user}`);
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        width: "200px",
                      }}
                    >
                      <Avatar
                        sx={{ height: 24, width: 24, marginRight: "10px" }}
                        src={`/arbitrary/THUMBNAIL/${issueObj?.user}/qortal_avatar`}
                        alt={`${issueObj?.user}'s avatar`}
                      />
                      <VideoCardName
                        sx={{
                          ":hover": {
                            textDecoration: "underline",
                          },
                        }}
                      >
                        {issueObj?.user}
                      </VideoCardName>
                    </div>

                    {issueObj?.created && (
                      <VideoUploadDate>
                        {formatDate(issueObj.created)}
                      </VideoUploadDate>
                    )}
                  </NameAndDateContainer>
                </IssueCard>
              </>
            ) : (
              <Skeleton
                variant="rectangular"
                style={{
                  width: "100%",
                  height: "100%",
                  paddingBottom: "10px",
                  objectFit: "contain",
                  visibility: "visible",
                  borderRadius: "8px",
                }}
              />
            )}
          </Box>
        );
      })}
    </IssueContainer>
  );
};
