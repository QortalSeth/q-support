import React, { useEffect, useState } from "react";
import {
  AddCoverImageButton,
  AddLogoIcon,
  CoverImagePreview,
  CrowdfundActionButton,
  CrowdfundActionButtonRow,
  CustomInputField,
  CustomSelect,
  LogoPreviewRow,
  ModalBody,
  NewCrowdfundTitle,
  StyledButton,
  TimesIcon,
} from "./Upload-styles";
import {
  Box,
  Button,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Modal,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme,
} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import ShortUniqueId from "short-unique-id";
import { useDispatch, useSelector } from "react-redux";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useDropzone } from "react-dropzone";
import AddIcon from "@mui/icons-material/Add";

import { setNotification } from "../../state/features/notificationsSlice";
import { objectToBase64, uint8ArrayToBase64 } from "../../utils/toBase64";
import { RootState } from "../../state/store";
import {
  upsertVideosBeginning,
  addToHashMap,
  upsertVideos,
} from "../../state/features/videoSlice";
import ImageUploader from "../common/ImageUploader";
import {
  QTUBE_PLAYLIST_BASE,
  QTUBE_VIDEO_BASE,
  categories,
  subCategories,
  subCategories2,
  subCategories3,
} from "../../constants";
import { MultiplePublish } from "../common/MultiplePublish/MultiplePublish";
import {
  CrowdfundSubTitle,
  CrowdfundSubTitleRow,
} from "../EditPlaylist/Upload-styles";
import { CardContentContainerComment } from "../common/Comments/Comments-styles";
import { TextEditor } from "../common/TextEditor/TextEditor";
import { extractTextFromHTML } from "../common/TextEditor/utils";

const uid = new ShortUniqueId();
const shortuid = new ShortUniqueId({ length: 5 });

interface NewCrowdfundProps {
  editId?: string;
  editContent?: null | {
    title: string;
    user: string;
    coverImage: string | null;
  };
}

interface VideoFile {
  file: File;
  title: string;
  description: string;
  coverImage?: string;
}
export const UploadVideo = ({ editId, editContent }: NewCrowdfundProps) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isOpenMultiplePublish, setIsOpenMultiplePublish] = useState(false);
  const username = useSelector((state: RootState) => state.auth?.user?.name);
  const userAddress = useSelector(
    (state: RootState) => state.auth?.user?.address
  );
  const [files, setFiles] = useState<VideoFile[]>([]);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [step, setStep] = useState<string>("videos");
  const [playlistCoverImage, setPlaylistCoverImage] = useState<null | string>(
    null
  );
  const [selectExistingPlaylist, setSelectExistingPlaylist] =
    useState<any>(null);
  const [playlistTitle, setPlaylistTitle] = useState<string>("");
  const [playlistDescription, setPlaylistDescription] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);

  const [selectedCategoryVideos, setSelectedCategoryVideos] =
    useState<any>(null);
  const [selectedSubCategoryVideos, setSelectedSubCategoryVideos] =
    useState<any>(null);
    const [selectedSubCategoryVideos2, setSelectedSubCategoryVideos2] =
    useState<any>(null);
    const [selectedSubCategoryVideos3, setSelectedSubCategoryVideos3] =
    useState<any>(null);
    
  const [playlistSetting, setPlaylistSetting] = useState<null | string>(null);
  const [publishes, setPublishes] = useState<any[]>([]);
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 10,
    maxSize: 419430400, // 400 MB in bytes
    onDrop: (acceptedFiles, rejectedFiles) => {
      const formatArray = acceptedFiles.map((item) => {
        return {
          file: item,
          title: "",
          description: "",
          coverImage: "",
        };
      });

      setFiles((prev) => [...prev, ...formatArray]);

      let errorString = null;
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            errorString = "File must be under 400mb";
          }
          console.log(`Error with file ${file.name}: ${error.message}`);
        });
      });
      if (errorString) {
        const notificationObj = {
          msg: errorString,
          alertType: "error",
        };

        dispatch(setNotification(notificationObj));
      }
    },
  });

  useEffect(() => {
    if (editContent) {
    }
  }, [editContent]);

  const onClose = () => {
    setIsOpen(false);
  };



  async function publishQDNResource() {

      try {
        if (!userAddress) throw new Error("Unable to locate user address");

        if (!title) throw new Error("Please enter a title");
        if (!description) throw new Error("Please enter a description");
        if (!selectedCategoryVideos) throw new Error("Please select a category");
        if(files.length === 0) throw new Error("Add at least one file");
      let errorMsg = "";
      let name = "";
      if (username) {
        name = username;
      }
      if (!name) {
        errorMsg =
          "Cannot publish without access to your name. Please authenticate.";
      }

      if (editId && editContent?.user !== name) {
        errorMsg = "Cannot publish another user's resource";
      }

      if (errorMsg) {
        dispatch(
          setNotification({
            msg: errorMsg,
            alertType: "error",
          })
        );
        return;
      }

      let fileReferences = []

      let listOfPublishes = [];

        const fullDescription = extractTextFromHTML(description);
        const category = selectedCategoryVideos.id;
        const subcategory = selectedSubCategoryVideos?.id || "";
        const subcategory2 = selectedSubCategoryVideos2?.id || "";
        const subcategory3 = selectedSubCategoryVideos3?.id || "";

        const sanitizeTitle = title
          .replace(/[^a-zA-Z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim()
          .toLowerCase();

      for (const publish of files) {
     
        const file = publish.file;
        const id = uid();

        const identifier = `${QTUBE_VIDEO_BASE}${sanitizeTitle.slice(0, 30)}_${id}`;

        

        let fileExtension = "";
        const fileExtensionSplit = file?.name?.split(".");
        if (fileExtensionSplit?.length > 1) {
          fileExtension = fileExtensionSplit?.pop() || "";
        }
        let firstPartName = fileExtensionSplit[0]

        let filename = firstPartName.slice(0, 15);
     
        // Step 1: Replace all white spaces with underscores

        // Replace all forms of whitespace (including non-standard ones) with underscores
        let stringWithUnderscores = filename.replace(/[\s\uFEFF\xA0]+/g, "_");

        // Remove all non-alphanumeric characters (except underscores)
        let alphanumericString = stringWithUnderscores.replace(
          /[^a-zA-Z0-9_]/g,
          ""
        );

        if(fileExtension){
          filename = `${alphanumericString.trim()}.${fileExtension}`
        } else {
          filename = alphanumericString
        }

        

        let metadescription =
        `**cat:${category};sub:${subcategory};sub2:${subcategory2};sub3:${subcategory3}**` +
          fullDescription.slice(0, 150);

     
        const requestBodyVideo: any = {
          action: "PUBLISH_QDN_RESOURCE",
          name: name,
          service: "FILE",
          file,
          title: title.slice(0, 50),
          description: metadescription,
          identifier,
          filename,
          tag1: QTUBE_VIDEO_BASE,
        };
        listOfPublishes.push(requestBodyVideo);
        fileReferences.push({
          filename: file.name,
          identifier,
          name,
          service: 'FILE',
          mimetype: file.type,
          size: file.size
        })
      }

      const idMeta = uid();
      const identifier = `${QTUBE_VIDEO_BASE}${sanitizeTitle.slice(0, 30)}_${idMeta}`;
      const fileObject: any = {
        title,
        version: 1,
        fullDescription,
        htmlDescription: description,
        commentsId: `${QTUBE_VIDEO_BASE}_cm_${idMeta}`,
        category,
        subcategory,
        subcategory2,
        subcategory3,
        files: fileReferences
      };

      let metadescription =
        `**cat:${category};sub:${subcategory};sub2:${subcategory2}**` +
        fullDescription.slice(0, 150);

      const crowdfundObjectToBase64 = await objectToBase64(fileObject);
      // Description is obtained from raw data
      const requestBodyJson: any = {
        action: "PUBLISH_QDN_RESOURCE",
        name: name,
        service: "DOCUMENT",
        data64: crowdfundObjectToBase64,
        title: title.slice(0, 50),
        description: metadescription,
        identifier: identifier + "_metadata",
        tag1: QTUBE_VIDEO_BASE,
        filename: `video_metadata.json`,
      };
      listOfPublishes.push(requestBodyJson);
      setPublishes(listOfPublishes);
      setIsOpenMultiplePublish(true);
    } catch (error: any) {
      let notificationObj: any = null;
      if (typeof error === "string") {
        notificationObj = {
          msg: error || "Failed to publish share",
          alertType: "error",
        };
      } else if (typeof error?.error === "string") {
        notificationObj = {
          msg: error?.error || "Failed to publish share",
          alertType: "error",
        };
      } else {
        notificationObj = {
          msg: error?.message || "Failed to publish share",
          alertType: "error",
        };
      }
      if (!notificationObj) return;
      dispatch(setNotification(notificationObj));
    }
  }



  const handleOptionCategoryChangeVideos = (
    event: SelectChangeEvent<string>
  ) => {
    const optionId = event.target.value;
    const selectedOption = categories.find((option) => option.id === +optionId);
    setSelectedCategoryVideos(selectedOption || null);
  };
  const handleOptionSubCategoryChangeVideos = (
    event: SelectChangeEvent<string>,
    subcategories: any[]
  ) => {
    const optionId = event.target.value;
    const selectedOption = subcategories.find(
      (option) => option.id === +optionId
    );
    setSelectedSubCategoryVideos(selectedOption || null);
  };

  const handleOptionSubCategoryChangeVideos2 = (
    event: SelectChangeEvent<string>,
    subcategories: any[]
  ) => {
    const optionId = event.target.value;
    const selectedOption = subcategories.find(
      (option) => option.id === +optionId
    );
    setSelectedSubCategoryVideos2(selectedOption || null);
  };

  const handleOptionSubCategoryChangeVideos3 = (
    event: SelectChangeEvent<string>,
    subcategories: any[]
  ) => {
    const optionId = event.target.value;
    const selectedOption = subcategories.find(
      (option) => option.id === +optionId
    );
    setSelectedSubCategoryVideos3(selectedOption || null);
  };



  return (
    <>
      {username && (
        <>
          {editId ? null : (
            <StyledButton
              color="primary"
              startIcon={<AddBoxIcon />}
              onClick={() => {
                setIsOpen(true);
              }}
            >
              share
            </StyledButton>
          )}
        </>
      )}

      <Modal
        open={isOpen}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <ModalBody>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
          
              <NewCrowdfundTitle>Share</NewCrowdfundTitle>
       
          </Box>

          {step === "videos" && (
            <>
              <Box
                {...getRootProps()}
                sx={{
                  border: "1px dashed gray",
                  padding: 2,
                  textAlign: "center",
                  marginBottom: 2,
                  cursor: "pointer",
                }}
              >
                <input {...getInputProps()} />
                <Typography>
                  Drag and drop files here or click to select files
                </Typography>
              </Box>
              {files.map((file, index) => {
                return (
                  <React.Fragment key={index}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>{file?.file?.name}</Typography>
                      <RemoveIcon
                        onClick={() => {
                          setFiles((prev) => {
                            const copyPrev = [...prev];
                            copyPrev.splice(index, 1);
                            return copyPrev;
                          });
                        }}
                        sx={{
                          cursor: "pointer",
                        }}
                      />
                    </Box>
                  </React.Fragment>
                );
              })}
              <Box
                sx={{
                  display: "flex",
                  gap: "20px",
                  alignItems: "flex-start",
                }}
              >
                {files?.length > 0 && (
                  <>
                   <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      width: '50%'
                    }}>
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                      <InputLabel id="Category">Select a Category</InputLabel>
                      <Select
                        labelId="Category"
                        input={<OutlinedInput label="Select a Category" />}
                        value={selectedCategoryVideos?.id || ""}
                        onChange={handleOptionCategoryChangeVideos}
                      >
                        {categories.map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    </Box>
                    {selectedCategoryVideos && (
                      <>
                         <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      width: '50%'
                    }}>

                   
                    {selectedCategoryVideos &&
                      subCategories[selectedCategoryVideos?.id] && (
                        <FormControl fullWidth sx={{ marginBottom: 2 }}>
                          <InputLabel id="Category">
                            Select a Sub-Category
                          </InputLabel>
                          <Select
                            labelId="Sub-Category"
                            input={
                              <OutlinedInput label="Select a Sub-Category" />
                            }
                            value={selectedSubCategoryVideos?.id || ""}
                            onChange={(e) =>
                              handleOptionSubCategoryChangeVideos(
                                e,
                                subCategories[selectedCategoryVideos?.id]
                              )
                            }
                          >
                            {subCategories[selectedCategoryVideos.id].map(
                              (option) => (
                                <MenuItem key={option.id} value={option.id}>
                                  {option.name}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                      )}
                       {selectedSubCategoryVideos &&
                      subCategories2[selectedSubCategoryVideos?.id] && (
                        <FormControl fullWidth sx={{ marginBottom: 2 }}>
                          <InputLabel id="Category">
                            Select a Sub-sub-Category
                          </InputLabel>
                          <Select
                            labelId="Sub-Category"
                            input={
                              <OutlinedInput label="Select a Sub-sub-Category" />
                            }
                            value={selectedSubCategoryVideos2?.id || ""}
                            onChange={(e) =>
                              handleOptionSubCategoryChangeVideos2(
                                e,
                                subCategories2[selectedSubCategoryVideos?.id]
                              )
                            }
                          >
                            {subCategories2[selectedSubCategoryVideos.id].map(
                              (option) => (
                                <MenuItem key={option.id} value={option.id}>
                                  {option.name}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                      )}
                      {selectedSubCategoryVideos2 &&
                      subCategories3[selectedSubCategoryVideos2?.id] && (
                        <FormControl fullWidth sx={{ marginBottom: 2 }}>
                          <InputLabel id="Category">
                            Select a Sub-3x-subCategory
                          </InputLabel>
                          <Select
                            labelId="Sub-Category"
                            input={
                              <OutlinedInput label="Select a Sub-3x-Category" />
                            }
                            value={selectedSubCategoryVideos3?.id || ""}
                            onChange={(e) =>
                              handleOptionSubCategoryChangeVideos3(
                                e,
                                subCategories3[selectedSubCategoryVideos2?.id]
                              )
                            }
                          >
                            {subCategories3[selectedSubCategoryVideos2.id].map(
                              (option) => (
                                <MenuItem key={option.id} value={option.id}>
                                  {option.name}
                                </MenuItem>
                              )
                            )}
                          </Select>
                        </FormControl>
                      )}
                      </Box>
                      </>
                    )}
                   
                  </>
                )}
              </Box>
              {files?.length > 0 && (
                <>
                  <CustomInputField
                    name="title"
                    label="Title of share"
                    variant="filled"
                    value={title}
                    onChange={(e) => {
                      const value = e.target.value;
                      const formattedValue = value.replace(
                        /[^a-zA-Z0-9\s-_!?]/g,
                        ""
                      );
                      setTitle(formattedValue);
                    }}
                    inputProps={{ maxLength: 180 }}
                    required
                  />
                  <Typography
                    sx={{
                      fontSize: "18px",
                    }}
                  >
                    Description of share
                  </Typography>
                  <TextEditor
                    inlineContent={description}
                    setInlineContent={(value) => {
                      setDescription(value);
                    }}
                  />
                </>
              )}
            
            </>
          )}
          <CrowdfundActionButtonRow>
            <CrowdfundActionButton
              onClick={() => {
                onClose();
              }}
              variant="contained"
              color="error"
            >
              Cancel
            </CrowdfundActionButton>
            <Box
              sx={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <CrowdfundActionButton
                variant="contained"
                onClick={() => {
                  publishQDNResource();
                }}
              >
                Publish
              </CrowdfundActionButton>
            </Box>
          </CrowdfundActionButtonRow>
        </ModalBody>
      </Modal>

      {isOpenMultiplePublish && (
        <MultiplePublish
          isOpen={isOpenMultiplePublish}
          onSubmit={() => {
            setIsOpenMultiplePublish(false);
            setIsOpen(false);
            setFiles([]);
            setStep("videos");
            setPlaylistCoverImage(null);
            setPlaylistTitle("");
            setPlaylistDescription("");
            setSelectedCategory(null);
            setSelectedSubCategory(null);
            setSelectedCategoryVideos(null);
            setSelectedSubCategoryVideos(null);
            setPlaylistSetting(null);
            dispatch(
              setNotification({
                msg: "Files published",
                alertType: "success",
              })
            );
          }}
          publishes={publishes}
        />
      )}
    </>
  );
};
