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
  FormControl,
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

import { setNotification } from "../../state/features/notificationsSlice";
import { objectToBase64, uint8ArrayToBase64 } from "../../utils/toBase64";
import { RootState } from "../../state/store";
import {
  upsertVideosBeginning,
  addToHashMap,
  upsertVideos,
  setEditVideo,
  updateVideo,
  updateInHashMap,
} from "../../state/features/videoSlice";
import ImageUploader from "../common/ImageUploader";
import { QTUBE_VIDEO_BASE, categories, subCategories,   subCategories2,
  subCategories3, } from "../../constants";
import { MultiplePublish } from "../common/MultiplePublish/MultiplePublish";
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
  identifier?:string;
  filename?:string
}
export const EditVideo = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const username = useSelector((state: RootState) => state.auth?.user?.name);
  const userAddress = useSelector(
    (state: RootState) => state.auth?.user?.address
  );
  const editVideoProperties = useSelector(
    (state: RootState) => state.video.editVideoProperties
  );
  const [publishes, setPublishes] = useState<any[]>([]);
  const [isOpenMultiplePublish, setIsOpenMultiplePublish] = useState(false);
  const [videoPropertiesToSetToRedux, setVideoPropertiesToSetToRedux] =
    useState(null);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState<VideoFile[]>([]);

  const [selectedCategoryVideos, setSelectedCategoryVideos] =
    useState<any>(null);
  const [selectedSubCategoryVideos, setSelectedSubCategoryVideos] =
    useState<any>(null);
    const [selectedSubCategoryVideos2, setSelectedSubCategoryVideos2] =
    useState<any>(null);
    const [selectedSubCategoryVideos3, setSelectedSubCategoryVideos3] =
    useState<any>(null);

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

  // useEffect(() => {
  //   if (editVideoProperties) {
  //     const descriptionString = editVideoProperties?.description || "";
  //     // Splitting the string at the asterisks
  //     const parts = descriptionString.split("**");

  //     // The part within the asterisks
  //     const extractedString = parts[1];

  //     // The part after the last asterisks
  //     const description = parts[2] || ""; // Using '|| '' to handle cases where there is no text after the last **
  //     setTitle(editVideoProperties?.title || "");
  //     setDescription(editVideoProperties?.fullDescription || "");
  //     setCoverImage(editVideoProperties?.videoImage || "");

  //     // Split the extracted string into key-value pairs
  //     const keyValuePairs = extractedString.split(";");

  //     // Initialize variables to hold the category and subcategory values
  //     let category, subcategory;

  //     // Loop through each key-value pair
  //     keyValuePairs.forEach((pair) => {
  //       const [key, value] = pair.split(":");

  //       // Check the key and assign the value to the appropriate variable
  //       if (key === "category") {
  //         category = value;
  //       } else if (key === "subcategory") {
  //         subcategory = value;
  //       }
  //     });

  //     if(category){
  //       const selectedOption = categories.find((option) => option.id === +category);
  //   setSelectedCategoryVideos(selectedOption || null);
  //     }

  //     if(subcategory){
  //       const selectedOption = categories.find((option) => option.id === +subcategory);
  //   setSelectedCategoryVideos(selectedOption || null);
  //     }

  //   }
  // }, [editVideoProperties]);

  useEffect(() => {
    if (editVideoProperties) {
      setTitle(editVideoProperties?.title || "");
      setFiles(editVideoProperties?.files || [])
      if(editVideoProperties?.htmlDescription){
        setDescription(editVideoProperties?.htmlDescription);

      } else if(editVideoProperties?.fullDescription) {
        const paragraph = `<p>${editVideoProperties?.fullDescription}</p>`
        setDescription(paragraph);

      }

      if (editVideoProperties?.category) {
        const selectedOption = categories.find(
          (option) => option.id === +editVideoProperties.category
        );
        setSelectedCategoryVideos(selectedOption || null);
      }
      if (
        editVideoProperties?.category &&
        editVideoProperties?.subcategory &&
        subCategories[+editVideoProperties?.category]
      ) {
        const selectedOption = subCategories[
          +editVideoProperties?.category
        ]?.find((option) => option.id === +editVideoProperties.subcategory);
        setSelectedSubCategoryVideos(selectedOption || null);
      }
      if (
        editVideoProperties?.category &&
        editVideoProperties?.subcategory2 &&
        subCategories2[+editVideoProperties?.subcategory]
      ) {
        const selectedOption = subCategories2[
          +editVideoProperties?.subcategory
        ]?.find((option) => option.id === +editVideoProperties.subcategory2);
        setSelectedSubCategoryVideos2(selectedOption || null);
      }
      if (
        editVideoProperties?.category &&
        editVideoProperties?.subcategory3 &&
        subCategories3[+editVideoProperties?.subcategory2]
      ) {

        const selectedOption = subCategories3[
          +editVideoProperties?.subcategory2
        ]?.find((option) => option.id === +editVideoProperties.subcategory3);
        setSelectedSubCategoryVideos3(selectedOption || null);
      }

      
    }
  }, [editVideoProperties]);

  const onClose = () => {
    dispatch(setEditVideo(null));
    setVideoPropertiesToSetToRedux(null);
    setFile(null);
    setTitle("");
    setDescription("");
    setCoverImage("");
  };

  async function publishQDNResource() {
    try {
      if (!title) throw new Error("Please enter a title");
      if (!description) throw new Error("Please enter a description");
      if (!selectedCategoryVideos) throw new Error("Please select a category");
      if (!editVideoProperties) return;
      if (!userAddress) throw new Error("Unable to locate user address");
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

      if (editVideoProperties?.user !== username) {
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
        if(publish?.identifier){
          fileReferences.push(publish)
          continue
        }
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

      const fileObject: any = {
        title,
        version: editVideoProperties.version,
        fullDescription,
        htmlDescription: description,
        commentsId: editVideoProperties.commentsId,
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
        identifier: editVideoProperties.id,
        tag1: QTUBE_VIDEO_BASE,
        filename: `video_metadata.json`,
      };
      listOfPublishes.push(requestBodyJson);

      setPublishes(listOfPublishes);
      setIsOpenMultiplePublish(true);
      setVideoPropertiesToSetToRedux({
        ...editVideoProperties,
        ...fileObject,
      });
    } catch (error: any) {
      let notificationObj: any = null;
      if (typeof error === "string") {
        notificationObj = {
          msg: error || "Failed to publish update",
          alertType: "error",
        };
      } else if (typeof error?.error === "string") {
        notificationObj = {
          msg: error?.error || "Failed to publish update",
          alertType: "error",
        };
      } else {
        notificationObj = {
          msg: error?.message || "Failed to publish update",
          alertType: "error",
        };
      }
      if (!notificationObj) return;
      dispatch(setNotification(notificationObj));

      throw new Error("Failed to publish update");
    }
  }

  const handleOnchange = (index: number, type: string, value: string) => {
    // setFiles((prev) => {
    //   let formattedValue = value
    //   console.log({type})
    //   if(type === 'title'){
    //     formattedValue = value.replace(/[^a-zA-Z0-9\s]/g, "")
    //   }
    //   const copyFiles = [...prev];
    //   copyFiles[index] = {
    //     ...copyFiles[index],
    //     [type]: formattedValue,
    //   };
    //   return copyFiles;
    // });
  };

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
      <Modal
        open={!!editVideoProperties}
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
            <NewCrowdfundTitle>Update share</NewCrowdfundTitle>
          </Box>
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
              <Typography>Click to add more files</Typography>
            </Box>
            {files.map((file, index) => {
              const isExistingFile = !!file?.identifier
                return (
                  <React.Fragment key={index}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography>{isExistingFile? file.filename : file?.file?.name}</Typography>
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
            const clonedCopy = structuredClone(videoPropertiesToSetToRedux);
            dispatch(updateVideo(clonedCopy));
            dispatch(updateInHashMap(clonedCopy));
            dispatch(
              setNotification({
                msg: "File updated",
                alertType: "success",
              })
            );
            onClose();
          }}
          publishes={publishes}
        />
      )}
    </>
  );
};
