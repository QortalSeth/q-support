import AttachFileIcon from "@mui/icons-material/AttachFile";
import React, { CSSProperties } from "react";

interface IssueIconProps {
  iconSrc: string;
  showBackupIcon?: boolean;
  style?: CSSProperties;
}
export const IssueIcon = ({
  iconSrc,
  showBackupIcon = true,
  style,
}: IssueIconProps) => {
  const displayFileIcon = !iconSrc && showBackupIcon;

  return (
    <>
      {iconSrc && (
        <img
          src={iconSrc}
          width="50px"
          height="50px"
          style={{
            borderRadius: "5px",
            ...style,
          }}
        />
      )}
      {displayFileIcon && (
        <AttachFileIcon
          sx={{
            ...style,
            width: "40px",
            height: "40px",
          }}
        />
      )}
    </>
  );
};

interface IssueIconsProps {
  iconSources: string[];
  showBackupIcon?: boolean;
  style?: CSSProperties;
}

export const IssueIcons = ({
  iconSources,
  showBackupIcon = true,
  style,
}: IssueIconsProps) => {
  return iconSources.map((icon, index) => (
    <IssueIcon
      key={icon + index}
      iconSrc={icon}
      style={{ ...style }}
      showBackupIcon={showBackupIcon}
    />
  ));
};
