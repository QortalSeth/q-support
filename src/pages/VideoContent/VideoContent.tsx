import React, { useState, useMemo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setIsLoadingGlobal } from "../../state/features/globalSlice";
import { Avatar, Box, Typography, useTheme } from "@mui/material";
import { VideoPlayer } from "../../components/common/VideoPlayer";
import { RootState } from "../../state/store";
import { addToHashMap } from "../../state/features/videoSlice";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";

import mockImg from "../../test/mockimg.jpg";
import {
  AuthorTextComment,
  FileAttachmentContainer,
  FileAttachmentFont,
  Spacer,
  StyledCardColComment,
  StyledCardHeaderComment,
  VideoDescription,
  VideoPlayerContainer,
  VideoTitle,
} from "./VideoContent-styles";
import { setUserAvatarHash } from "../../state/features/globalSlice";
import {
  formatDate,
  formatDateSeconds,
  formatTimestampSeconds,
} from "../../utils/time";
import { NavbarName } from "../../components/layout/Navbar/Navbar-styles";
import { CommentSection } from "../../components/common/Comments/CommentSection";
import {
  CrowdfundSubTitle,
  CrowdfundSubTitleRow,
} from "../../components/UploadVideo/Upload-styles";
import { QTUBE_VIDEO_BASE, categories, subCategories, subCategories2, subCategories3 } from "../../constants";
import { Playlists } from "../../components/Playlists/Playlists";
import { DisplayHtml } from "../../components/common/TextEditor/DisplayHtml";
import FileElement from "../../components/common/FileElement";

export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}




export const VideoContent = () => {
  const { name, id } = useParams();
  const [isExpandedDescription, setIsExpandedDescription] =
    useState<boolean>(false);
    const [descriptionHeight, setDescriptionHeight] =
    useState<null | number>(null);
    
  const userAvatarHash = useSelector(
    (state: RootState) => state.global.userAvatarHash
  );
  const contentRef = useRef(null);
  
  

  const avatarUrl = useMemo(() => {
    let url = "";
    if (name && userAvatarHash[name]) {
      url = userAvatarHash[name];
    }

    return url;
  }, [userAvatarHash, name]);
  const navigate = useNavigate();
  const theme = useTheme();

  const [videoData, setVideoData] = useState<any>(null);
  const [playlistData, setPlaylistData] = useState<any>(null);

  const hashMapVideos = useSelector(
    (state: RootState) => state.video.hashMapVideos
  );
  const videoReference = useMemo(() => {
    if (!videoData) return null;
    const { videoReference } = videoData;
    if (
      videoReference?.identifier &&
      videoReference?.name &&
      videoReference?.service
    ) {
      return videoReference;
    } else {
      return null;
    }
  }, [videoData]);

  const videoCover = useMemo(() => {
    if (!videoData) return null;
    const { videoImage } = videoData;
    return videoImage || null;
  }, [videoData]);
  const dispatch = useDispatch();

  const getVideoData = React.useCallback(async (name: string, id: string) => {
    try {
      if (!name || !id) return;
      dispatch(setIsLoadingGlobal(true));

      const url = `/arbitrary/resources/search?mode=ALL&service=DOCUMENT&query=${QTUBE_VIDEO_BASE}&limit=1&includemetadata=true&reverse=true&excludeblocked=true&name=${name}&exactmatchnames=true&offset=0&identifier=${id}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseDataSearch = await response.json();

      if (responseDataSearch?.length > 0) {
        let resourceData = responseDataSearch[0];
        resourceData = {
          title: resourceData?.metadata?.title,
          category: resourceData?.metadata?.category,
          categoryName: resourceData?.metadata?.categoryName,
          tags: resourceData?.metadata?.tags || [],
          description: resourceData?.metadata?.description,
          created: resourceData?.created,
          updated: resourceData?.updated,
          user: resourceData.name,
          videoImage: "",
          id: resourceData.identifier,
        };

        const responseData = await qortalRequest({
          action: "FETCH_QDN_RESOURCE",
          name: name,
          service: "DOCUMENT",
          identifier: id,
        });

        if (responseData && !responseData.error) {
          const combinedData = {
            ...resourceData,
            ...responseData,
          };

          setVideoData(combinedData);
          dispatch(addToHashMap(combinedData));
          checkforPlaylist(name, id, combinedData?.code);
        }
      }
    } catch (error) {
    } finally {
      dispatch(setIsLoadingGlobal(false));
    }
  }, []);

  const checkforPlaylist = React.useCallback(async (name, id, code) => {
    try {
      if (!name || !id || !code) return;

      const url = `/arbitrary/resources/search?mode=ALL&service=PLAYLIST&description=c:${code}&limit=1&includemetadata=true&reverse=true&excludeblocked=true&name=${name}&exactmatchnames=true&offset=0`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseDataSearch = await response.json();

      if (responseDataSearch?.length > 0) {
        let resourceData = responseDataSearch[0];
        resourceData = {
          title: resourceData?.metadata?.title,
          category: resourceData?.metadata?.category,
          categoryName: resourceData?.metadata?.categoryName,
          tags: resourceData?.metadata?.tags || [],
          description: resourceData?.metadata?.description,
          created: resourceData?.created,
          updated: resourceData?.updated,
          name: resourceData.name,
          videoImage: "",
          identifier: resourceData.identifier,
          service: resourceData.service,
        };

        const responseData = await qortalRequest({
          action: "FETCH_QDN_RESOURCE",
          name: resourceData.name,
          service: resourceData.service,
          identifier: resourceData.identifier,
        });

        if (responseData && !responseData.error) {
          const combinedData = {
            ...resourceData,
            ...responseData,
          };
          const videos = [];
          if (combinedData?.videos) {
            for (const vid of combinedData.videos) {
              const url = `/arbitrary/resources/search?mode=ALL&service=DOCUMENT&identifier=${vid.identifier}&limit=1&includemetadata=true&reverse=true&name=${vid.name}&exactmatchnames=true&offset=0`;
              const response = await fetch(url, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              });
              const responseDataSearchVid = await response.json();

              if (responseDataSearchVid?.length > 0) {
                let resourceData2 = responseDataSearchVid[0];
                videos.push(resourceData2);
              }
            }
          }
          combinedData.videos = videos;
          setPlaylistData(combinedData);
        }
      }
    } catch (error) {}
  }, []);

  React.useEffect(() => {
    if (name && id) {
      const existingVideo = hashMapVideos[id];

      if (existingVideo) {
        setVideoData(existingVideo);
        checkforPlaylist(name, id, existingVideo?.code);
      } else {
        getVideoData(name, id);
      }
    }
  }, [id, name]);

  // const getAvatar = React.useCallback(async (author: string) => {
  //   try {
  //     let url = await qortalRequest({
  //       action: 'GET_QDN_RESOURCE_URL',
  //       name: author,
  //       service: 'THUMBNAIL',
  //       identifier: 'qortal_avatar'
  //     })

  //     setAvatarUrl(url)
  //     dispatch(setUserAvatarHash({
  //       name: author,
  //       url
  //     }))
  //   } catch (error) { }
  // }, [])

  // React.useEffect(() => {
  //   if (name && !avatarUrl) {
  //     const existingAvatar = userAvatarHash[name]

  //     if (existingAvatar) {
  //       setAvatarUrl(existingAvatar)
  //     } else {
  //       getAvatar(name)
  //     }

  //   }

  // }, [name, userAvatarHash])

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.offsetHeight;
      if (height > 100) { // Assuming 100px is your threshold
        setDescriptionHeight(100)
      }
    }
  }, [videoData]); 

  const categoriesDisplay = useMemo(()=> {
    const category = categories?.find((item)=> item?.id === videoData?.category)
    if(!category) return null
    const subcategory = subCategories[category?.id]?.find(item=> item?.id === videoData?.subcategory)
    if(!subcategory) return category?.name

    const subcategory2 = subCategories2[subcategory?.id]?.find(item => item.id === videoData?.subcategory2)
    if(!subcategory2) return `${category?.name} > ${subcategory?.name}`
    const subcategory3 = subCategories3[subcategory2?.id]?.find(item => item.id === videoData?.subcategory3)
    if(!subcategory3) return `${category?.name} > ${subcategory?.name} > ${subcategory2?.name}`
    return  `${category?.name} > ${subcategory?.name} > ${subcategory2?.name} > ${subcategory3?.name}`
  }, [videoData])
  

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        padding: "20px 10px",
      }}
    >
      <VideoPlayerContainer
        sx={{
          marginBottom: "30px",
        }}
      >
       
        <Spacer height="15px" />
       
        <VideoTitle
          variant="h1"
          color="textPrimary"
          sx={{
            textAlign: "center",
          }}
        >
          {videoData?.title}
        </VideoTitle>
        {videoData?.created && (
          <Typography
            variant="h6"
            sx={{
              fontSize: "12px",
            }}
            color={theme.palette.text.primary}
          >
            {formatDate(videoData.created)}
          </Typography>
        )}

        <Spacer height="15px" />
        <Box
          sx={{
            cursor: "pointer",
          }}
          onClick={() => {
            navigate(`/channel/${name}`);
          }}
        >
          <StyledCardHeaderComment
            sx={{
              "& .MuiCardHeader-content": {
                overflow: "hidden",
              },
            }}
          >
            <Box>
              <Avatar
                src={`/arbitrary/THUMBNAIL/${name}/qortal_avatar`}
                alt={`${name}'s avatar`}
              />
            </Box>
            <StyledCardColComment>
              <AuthorTextComment
                color={
                  theme.palette.mode === "light"
                    ? theme.palette.text.secondary
                    : "#d6e8ff"
                }
              >
                {name}
              </AuthorTextComment>
            </StyledCardColComment>
          </StyledCardHeaderComment>
        </Box>
        <Spacer height="15px" />
        <Box>
          <Typography sx={{
            fontWeight: 'bold',
            fontSize: '16px',
            userSelect: 'none'
          }}>{categoriesDisplay}</Typography>
        </Box>
        <Spacer height="15px" />
        <Box
          sx={{
            background: "#333333",
            borderRadius: "5px",
            padding: "5px",
            width: "100%",
            cursor: !descriptionHeight ? "default" : isExpandedDescription ? "default" : "pointer",
            position: "relative",
          }}
          className={!descriptionHeight ? "": isExpandedDescription ? "" : "hover-click"}
        >
          {descriptionHeight && !isExpandedDescription && (
            <Box
              sx={{
                position: "absolute",
                top: "0px",
                right: "0px",
                left: "0px",
                bottom: "0px",
                cursor: "pointer",
              }}
              onClick={() => {
                if (isExpandedDescription) return;
                setIsExpandedDescription(true);
              }}
            />
          )}
          <Box
          ref={contentRef}
            sx={{
              height: !descriptionHeight ? 'auto' : isExpandedDescription ? "auto" : "100px",
              overflow: "hidden",
            }}
          >
            {videoData?.htmlDescription ? (
              <DisplayHtml html={videoData?.htmlDescription} />
            ) : (
              <VideoDescription variant="body1" color="textPrimary" sx={{
                cursor: 'default'
              }}>
                {videoData?.fullDescription}
              </VideoDescription>
            )}
          </Box>
          {descriptionHeight && (
             <Typography
             onClick={() => {
               setIsExpandedDescription((prev) => !prev);
             }}
             sx={{
               fontWeight: "bold",
               fontSize: "16px",
               cursor: "pointer",
               paddingLeft: "15px",
               paddingTop: "15px",
             }}
           >
             {isExpandedDescription ? "Show less" : "...more"}
           </Typography>
          )}
         
        </Box>
        <Box sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          gap: '25px',
          marginTop: '25px'
        }}>
          {videoData?.files?.map((file)=> {
            return (
              <FileAttachmentContainer sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                  
                    <FileAttachmentFont>
                      {file.filename}
                    </FileAttachmentFont>
                    <Box sx={{
         
          display: 'flex',
          gap: '25px',
          alignItems: 'center',
        
        }}>

                    
                    <FileAttachmentFont>
                      {formatBytes(file?.size || 0)}
                    </FileAttachmentFont>
                    <FileElement
                      fileInfo={{...file,
                        filename: file?.filename,
                        mimeType: file?.mimetype
                      
                      }}
                      jsonId={id}
                      title={file?.filename}
                      customStyles={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <DownloadIcon />
                    </FileElement>
                    </Box>
                  </FileAttachmentContainer>
            )
          })}
        
                  </Box>
      </VideoPlayerContainer>
            
      <Box
        sx={{
          display: "flex",
          gap: "20px",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        <CommentSection postId={id || ""} postName={name || ""} />
      </Box>
    </Box>
  );
};
