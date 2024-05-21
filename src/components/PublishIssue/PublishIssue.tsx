import React, { useEffect, useRef, useState } from "react";
import {
  ActionButton,
  ActionButtonRow,
  CustomInputField,
  ModalBody,
  NewCrowdfundTitle,
  StyledButton,
} from "./PublishIssue-styles.tsx";
import { Box, Modal, Typography, useTheme } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import ShortUniqueId from "short-unique-id";
import { useDispatch, useSelector } from "react-redux";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useDropzone } from "react-dropzone";

import { setNotification } from "../../state/features/notificationsSlice";
import { objectToBase64 } from "../../utils/toBase64";
import { RootState } from "../../state/store";
import { QSUPPORT_FILE_BASE } from "../../constants/Identifiers.ts";
import { MultiplePublish } from "../common/MultiplePublish/MultiplePublishAll";
import { TextEditor } from "../common/TextEditor/TextEditor";
import { extractTextFromHTML } from "../common/TextEditor/utils";
import { allCategoryData } from "../../constants/Categories/Categories.ts";
import {
  fontSizeLarge,
  fontSizeSmall,
  log,
  titleFormatter,
} from "../../constants/Misc.ts";
import {
  CategoryList,
  CategoryListRef,
} from "../common/CategoryList/CategoryList.tsx";
import {
  ImagePublisher,
  ImagePublisherRef,
} from "../common/ImagePublisher/ImagePublisher.tsx";
import { ThemeButtonBright } from "../../pages/Home/Home-styles.tsx";
import {
  AutocompleteQappNames,
  QappNamesRef,
} from "../common/AutocompleteQappNames.tsx";
import {
  feeAmountBase,
  feeDisclaimer,
} from "../../constants/PublishFees/FeeData.tsx";
import {
  payPublishFeeQORT,
  PublishFeeData,
} from "../../constants/PublishFees/SendFeeFunctions.ts";

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

export const PublishIssue = ({ editId, editContent }: NewCrowdfundProps) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isOpenMultiplePublish, setIsOpenMultiplePublish] = useState(false);
  const [QappName, setQappName] = useState<string>("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const username = useSelector((state: RootState) => state.auth?.user?.name);
  const userAddress = useSelector(
    (state: RootState) => state.auth?.user?.address
  );
  const QappNames = useSelector(
    (state: RootState) => state.file.publishedQappNames
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

  const [playlistSetting, setPlaylistSetting] = useState<null | string>(null);
  const [publishes, setPublishes] = useState<any>(null);

  const categoryListRef = useRef<CategoryListRef>(null);
  const imagePublisherRef = useRef<ImagePublisherRef>(null);
  const autocompleteRef = useRef<QappNamesRef>(null);

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 10,
    maxSize: 419430400, // 400 MB in bytes
    onDrop: (acceptedFiles, rejectedFiles) => {
      const formatArray = acceptedFiles.map(item => {
        return {
          file: item,
          title: "",
          description: "",
          coverImage: "",
        };
      });

      setFiles(prev => [...prev, ...formatArray]);

      let errorString = null;
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
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
      if (!categoryListRef.current) throw new Error("No CategoryListRef found");
      if (!userAddress) throw new Error("Unable to locate user address");
      if (!description) throw new Error("Please enter a description");

      const allCategoriesSelected =
        selectedCategories && selectedCategories[0] && selectedCategories[1];
      if (!allCategoriesSelected)
        throw new Error("All Categories must be selected");

      const QappsCategoryID = "3";
      if (
        selectedCategories[0] === QappsCategoryID &&
        !autocompleteRef?.current?.getSelectedValue()
      )
        throw new Error("Select a published Q-App");
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

      const sanitizeTitle = title
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .toLowerCase();
      if (!sanitizeTitle) throw new Error("Please enter a title");

      let fileReferences = [];

      let listOfPublishes = [];

      const fullDescription = extractTextFromHTML(description);

      for (const publish of files) {
        const file = publish.file;
        const id = uid();

        const identifier = `${QSUPPORT_FILE_BASE}${sanitizeTitle.slice(0, 30)}_${id}`;

        let fileExtension = "";
        const fileExtensionSplit = file?.name?.split(".");
        if (fileExtensionSplit?.length > 1) {
          fileExtension = fileExtensionSplit?.pop() || "";
        }
        let firstPartName = fileExtensionSplit[0];

        let filename = firstPartName.slice(0, 15);

        // Step 1: Replace all white spaces with underscores

        // Replace all forms of whitespace (including non-standard ones) with underscores
        let stringWithUnderscores = filename.replace(/[\s\uFEFF\xA0]+/g, "_");

        // Remove all non-alphanumeric characters (except underscores)
        let alphanumericString = stringWithUnderscores.replace(
          /[^a-zA-Z0-9_]/g,
          ""
        );

        if (fileExtension) {
          filename = `${alphanumericString.trim()}.${fileExtension}`;
        } else {
          filename = alphanumericString;
        }

        const categoryString = `**${categoryListRef.current?.getSelectedCategories()}**`;
        let metadescription = categoryString + fullDescription.slice(0, 150);

        const requestBodyFile: any = {
          action: "PUBLISH_QDN_RESOURCE",
          name: name,
          service: "FILE",
          file,
          title: title.slice(0, 50),
          description: metadescription,
          identifier,
          filename,
          tag1: QSUPPORT_FILE_BASE,
        };
        listOfPublishes.push(requestBodyFile);
        fileReferences.push({
          filename: file.name,
          identifier,
          name,
          service: "FILE",
          mimetype: file.type,
          size: file.size,
        });
      }

      const idMeta = uid();
      const identifier = `${QSUPPORT_FILE_BASE}${sanitizeTitle.slice(0, 30)}_${idMeta}`;

      const categoryList = categoryListRef.current?.getSelectedCategories();

      const selectedQappName = autocompleteRef?.current?.getSelectedValue();

      const publishFeeResponse = await payPublishFeeQORT(feeAmountBase);
      if (log) console.log("feeResponse: ", publishFeeResponse);

      const feeData: PublishFeeData = {
        signature: publishFeeResponse,
        senderName: "",
      };

      const issueObject: any = {
        title,
        version: 1,
        fullDescription,
        htmlDescription: description,
        commentsId: `${QSUPPORT_FILE_BASE}_cm_${idMeta}`,
        ...categoryListRef.current?.categoriesToObject(categoryList),
        files: fileReferences,
        images: imagePublisherRef?.current?.getImageArray(),
        QappName: selectedQappName,
        feeData,
      };

      const QappNameString = autocompleteRef?.current?.getQappNameFetchString();
      const categoryString =
        categoryListRef.current?.getCategoriesFetchString(categoryList);
      const metaDataString = `**${categoryString + QappNameString}**`;

      let metadescription = metaDataString + fullDescription.slice(0, 150);

      if (log) console.log("description is: ", metadescription);
      if (log) console.log("description length is: ", metadescription.length);
      if (log) console.log("characters left:", 240 - metadescription.length);
      if (log)
        console.log("% of characters used:", metadescription.length / 240);

      const fileObjectToBase64 = await objectToBase64(issueObject);
      // Description is obtained from raw data
      const requestBodyJson: any = {
        action: "PUBLISH_QDN_RESOURCE",
        name: name,
        service: "DOCUMENT",
        data64: fileObjectToBase64,
        title: title.slice(0, 50),
        description: metadescription,
        identifier: identifier + "_metadata",
        tag1: QSUPPORT_FILE_BASE,
        filename: `video_metadata.json`,
      };
      listOfPublishes.push(requestBodyJson);

      const multiplePublish = {
        action: "PUBLISH_MULTIPLE_QDN_RESOURCES",
        resources: [...listOfPublishes],
      };
      setPublishes(multiplePublish);
      setIsOpenMultiplePublish(true);
    } catch (error: any) {
      let notificationObj: any = null;
      if (typeof error === "string") {
        notificationObj = {
          msg: error || "Failed to publish issue",
          alertType: "error",
        };
      } else if (typeof error?.error === "string") {
        notificationObj = {
          msg: error?.error || "Failed to publish issue",
          alertType: "error",
        };
      } else {
        notificationObj = {
          msg: error?.message || "Failed to publish issue",
          alertType: "error",
        };
      }
      if (!notificationObj) return;
      dispatch(setNotification(notificationObj));
    }
  }

  const isShowQappNameTextField = () => {
    const QappID = "3";
    return selectedCategories[0] === QappID;
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
              Open an Issue
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
            <NewCrowdfundTitle>Issue</NewCrowdfundTitle>
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
                  Publish files related to issue (Optional)
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
                          setFiles(prev => {
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

              <>
                <Box
                  sx={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                  }}
                >
                  <CategoryList
                    initialCategories={
                      selectedCategories.length > 0
                        ? selectedCategories
                        : undefined
                    }
                    categoryData={allCategoryData}
                    ref={categoryListRef}
                    columns={3}
                    afterChange={newSelectedCategories => {
                      if (
                        newSelectedCategories[0] &&
                        newSelectedCategories[1] &&
                        !newSelectedCategories[2]
                      ) {
                        newSelectedCategories[2] = "101";
                      }
                      setSelectedCategories(newSelectedCategories);
                    }}
                    showEmptyItem={false}
                  />
                </Box>
                {isShowQappNameTextField() && (
                  <AutocompleteQappNames
                    ref={autocompleteRef}
                    namesList={QappNames}
                  />
                )}
                <ImagePublisher ref={imagePublisherRef} />
                <CustomInputField
                  name="title"
                  label="Title"
                  variant="filled"
                  value={title}
                  onChange={e => {
                    const value = e.target.value;
                    const formattedValue = value.replace(titleFormatter, "");
                    setTitle(formattedValue);
                  }}
                  inputProps={{ maxLength: 60 }}
                  required
                />
                <Typography
                  sx={{
                    fontSize: fontSizeLarge,
                  }}
                >
                  Description
                </Typography>
                <TextEditor
                  inlineContent={description}
                  setInlineContent={value => {
                    setDescription(value);
                  }}
                />
              </>
            </>
          )}
          <ActionButtonRow>
            <ActionButton
              onClick={() => {
                onClose();
              }}
              variant="contained"
              color="error"
              sx={{
                color: theme.palette.text.primary,
                fontSize: fontSizeSmall,
              }}
            >
              Cancel
            </ActionButton>
            <Box
              sx={{
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <ThemeButtonBright
                variant="contained"
                onClick={publishQDNResource}
                sx={{
                  fontFamily: "Montserrat",
                  fontWeight: "400",
                  letterSpacing: "0.2px",
                }}
              >
                Publish
              </ThemeButtonBright>
            </Box>
          </ActionButtonRow>
          {feeDisclaimer}
        </ModalBody>
      </Modal>

      {isOpenMultiplePublish && (
        <MultiplePublish
          isOpen={isOpenMultiplePublish}
          onError={messageNotification => {
            setIsOpenMultiplePublish(false);
            setPublishes(null);
            if (messageNotification) {
              dispatch(
                setNotification({
                  msg: messageNotification,
                  alertType: "error",
                })
              );
            }
          }}
          onSubmit={() => {
            setIsOpenMultiplePublish(false);
            setIsOpen(false);
            setFiles([]);
            setStep("videos");
            setPlaylistCoverImage(null);
            setTitle("");
            setPlaylistTitle("");
            setPlaylistDescription("");
            setDescription("");
            setPlaylistSetting(null);
            categoryListRef.current?.clearCategories();
            imagePublisherRef.current?.setImageArray([]);
            dispatch(
              setNotification({
                msg: "Issue published",
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
