import {
  Categories,
  Category,
  CategoryData,
} from "../../components/common/CategoryList/CategoryList.tsx";
import { getAllCategoriesWithIcons } from "./CategoryFunctions.ts";
import CoreIcon from "../../assets/icons/Qortal-Core-Icon.webp";
import UIicon from "../../assets/icons/Qortal-UI-Icon.webp";
import QappIcon from "../../assets/icons/Q-App-Icon.webp";
import UnknownIcon from "../../assets/icons/unknown.webp";

import BugReportIcon from "../../assets/icons/Bug-Report-Icon.webp";
import FeatureRequestIcon from "../../assets/icons/Feature-Request-Icon.webp";
import TechSupportIcon from "../../assets/icons/Tech-Support-Icon.webp";

import OpenIcon from "../../assets/icons/Open-Icon.webp";
import ClosedIcon from "../../assets/icons/Closed-Icon.webp";
import InProgressIcon from "../../assets/icons/In-Progress-Icon.webp";
import CompleteIcon from "../../assets/icons/Complete-Icon.webp";

const issueLocationLabel = "Issue Location";
export const issueLocation: Category[] = [
  { id: 1, name: "Core", icon: CoreIcon, label: issueLocationLabel },
  { id: 2, name: "UI", icon: UIicon, label: issueLocationLabel },
  { id: 3, name: "Q-Apps/Websites", icon: QappIcon, label: issueLocationLabel },
  { id: 99, name: "Other", icon: UnknownIcon, label: issueLocationLabel },
];

const issueTypeLabel = "Issue Type";
export const issueType = [
  { id: 11, name: "Bug Report", icon: BugReportIcon, label: issueTypeLabel },
  {
    id: 12,
    name: "Feature Request",
    icon: FeatureRequestIcon,
    label: issueTypeLabel,
  },
  {
    id: 13,
    name: "Tech Support",
    icon: TechSupportIcon,
    label: issueTypeLabel,
  },
  { id: 19, name: "Other", icon: UnknownIcon, label: issueTypeLabel },
];

export const secondCategories: Categories = {};
issueLocation.map(c => (secondCategories[c.id] = issueType));

const issueLabel = "Issue State";
export const IssueState = [
  { id: 101, name: "Open", icon: OpenIcon, label: issueLabel },
  { id: 102, name: "Closed", icon: ClosedIcon, label: issueLabel },
  { id: 103, name: "In Progress", icon: InProgressIcon, label: issueLabel },
  { id: 104, name: "Complete", icon: CompleteIcon, label: issueLabel },
];

export const thirdCategories: Categories = {};

issueType.map(issueType => (thirdCategories[issueType.id] = IssueState));

export const allCategoryData: CategoryData = {
  category: issueLocation,
  subCategories: [secondCategories, thirdCategories],
};

export const iconCategories = getAllCategoriesWithIcons();
