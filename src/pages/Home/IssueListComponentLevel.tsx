import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../state/store";

import { Avatar, Box, Skeleton, useTheme } from "@mui/material";
import { useFetchIssues } from "../../hooks/useFetchIssues.tsx";
import LazyLoad from "../../components/common/LazyLoad";
import {
  BottomParent,
  IssueCard,
  IssueContainer,
  NameAndDateContainer,
  VideoCardName,
  VideoCardTitle,
  VideoUploadDate,
} from "./IssueList-styles.tsx";
import { formatDate } from "../../utils/time";
import { Issue } from "../../state/features/fileSlice.ts";
import { queue } from "../../wrappers/GlobalWrapper";
import { QSUPPORT_FILE_BASE } from "../../constants/Identifiers.ts";
import { formatBytes } from "../IssueContent/IssueContent.tsx";
import { getIconsFromObject } from "../../constants/Categories/CategoryFunctions.ts";
import { IssueIcon, IssueIcons } from "../../components/common/IssueIcon.tsx";
import QORTicon from "../../assets/icons/qort.png";
import { verifyAllPayments } from "../../constants/PublishFees/VerifyPayment.ts";

interface VideoListProps {
  mode?: string;
}
export const IssueListComponentLevel = ({ mode }: VideoListProps) => {
  const { name: paramName } = useParams();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const firstFetch = useRef(false);
  const afterFetch = useRef(false);
  const hashMapVideos = useSelector(
    (state: RootState) => state.file.hashMapFiles
  );

  const [issues, setIssues] = React.useState<Issue[]>([]);

  const navigate = useNavigate();
  const { getIssue, getNewIssues, checkNewIssues, checkAndUpdateIssue } =
    useFetchIssues();

  const getIssues = React.useCallback(async () => {
    try {
      const offset = issues.length;
      //                 `/arbitrary/resources/search?mode=ALL&includemetadata=false&reverse=true&excludeblocked=true&exactmatchnames=true&offset=${offset}&limit=${videoLimit}`;
      const url = `/arbitrary/resources/search?mode=ALL&includemetadata=false&reverse=true&excludeblocked=true&exactmatchnames=true&offset=${offset}&limit=50&service=DOCUMENT&query=${QSUPPORT_FILE_BASE}_&name=${paramName}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseData = await response.json();

      const structureData = responseData.map((issue: any): Issue => {
        return {
          title: issue?.metadata?.title,
          category: issue?.metadata?.category,
          categoryName: issue?.metadata?.categoryName,
          tags: issue?.metadata?.tags || [],
          description: issue?.metadata?.description,
          created: issue?.created,
          updated: issue?.updated,
          user: issue.name,
          videoImage: "",
          id: issue.identifier,
        };
      });

      const copiedIssues: Issue[] = [...issues];
      structureData.forEach((issue: Issue) => {
        const index = issues.findIndex(p => p.id === issue.id);
        if (index !== -1) {
          copiedIssues[index] = issue;
        } else {
          copiedIssues.push(issue);
        }
      });

      const verifiedIssuePromises: Promise<Issue>[] = [];

      for (const content of copiedIssues) {
        if (content.user && content.id) {
          const res = checkAndUpdateIssue(content);
          const getIssueData = getIssue(content.user, content.id, content);
          if (res) queue.push(() => getIssueData);

          verifiedIssuePromises.push(getIssueData);
        }
      }

      const issueData = await Promise.all(verifiedIssuePromises);
      const verifiedIssues = await verifyAllPayments(issueData);
      setIssues(verifiedIssues);
    } catch (error) {
    } finally {
    }
  }, [issues, hashMapVideos]);

  const getIssuesHandler = React.useCallback(async () => {
    if (!firstFetch.current || !afterFetch.current) return;
    await getIssues();
  }, [getIssues]);

  const getIssuesHandlerMount = React.useCallback(async () => {
    if (firstFetch.current) return;
    firstFetch.current = true;
    await getIssues();
    afterFetch.current = true;
    setIsLoading(false);
  }, [getIssues]);

  useEffect(() => {
    if (!firstFetch.current) {
      getIssuesHandlerMount();
    }
  }, [getIssuesHandlerMount]);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <IssueContainer>
        {issues.map((issue: any, index: number) => {
          const existingFile = hashMapVideos[issue?.id];
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
            >
              {hasHash ? (
                <>
                  <IssueCard
                    onClick={() => {
                      navigate(`/issue/${issueObj?.user}/${issueObj?.id}`);
                    }}
                    sx={{
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      gap: "25px",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: "25px",
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
                          width: "100px",
                        }}
                      >
                        {fileBytes > 0 && formatBytes(fileBytes)}
                      </VideoCardTitle>
                      <VideoCardTitle
                        sx={{ fontWeight: "bold", width: "500px" }}
                      >
                        {issueObj.title}
                      </VideoCardTitle>
                    </Box>
                    {issue?.feeData?.isPaid && (
                      <IssueIcon
                        iconSrc={QORTicon}
                        style={{ marginRight: "20px" }}
                      />
                    )}
                    <BottomParent>
                      <NameAndDateContainer
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/channel/${issueObj?.user}`);
                        }}
                      >
                        <Avatar
                          sx={{ height: 24, width: 24 }}
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
                      </NameAndDateContainer>

                      {issueObj?.created && (
                        <VideoUploadDate>
                          {formatDate(issueObj.created)}
                        </VideoUploadDate>
                      )}
                    </BottomParent>
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
      <LazyLoad onLoadMore={getIssuesHandler} isLoading={isLoading}></LazyLoad>
    </Box>
  );
};
