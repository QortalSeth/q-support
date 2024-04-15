import audioIcon from "../../assets/icons/audio.webp";
import bookIcon from "../../assets/icons/book.webp";
import documentIcon from "../../assets/icons/document.webp";
import gamingIcon from "../../assets/icons/gaming.webp";
import imageIcon from "../../assets/icons/image.webp";
import softwareIcon from "../../assets/icons/software.webp";
import unknownIcon from "../../assets/icons/unknown.webp";
import videoIcon from "../../assets/icons/video.webp";

import {
  Categories,
  Category,
  CategoryData,
} from "../../components/common/CategoryList/CategoryList.tsx";
import {
  getAllCategoriesWithIcons,
  sortCategory,
} from "./CategoryFunctions.ts";
import { QappCategories, SupportState } from "./2ndCategories.ts";

export const firstCategories: Category[] = [
  { id: 1, name: "Core" },
  { id: 2, name: "UI" },
  { id: 3, name: "Q-Apps" },
  { id: 4, name: "Website" },
  { id: 5, name: "Marketing" },
  { id: 99, name: "Other" },
];
export const secondCategories: Categories = {
  1: SupportState,
  2: SupportState,
  3: QappCategories,
  4: SupportState,
  5: SupportState,
  99: SupportState,
};

export let thirdCategories: Categories = {};
QappCategories.map(
  supportStateCategory =>
    (thirdCategories[supportStateCategory.id] = SupportState)
);
export const allCategoryData: CategoryData = {
  category: firstCategories,
  subCategories: [secondCategories, thirdCategories],
};

export const iconCategories = getAllCategoriesWithIcons();
