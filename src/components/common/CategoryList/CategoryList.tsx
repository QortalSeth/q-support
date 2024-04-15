import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
} from "@mui/material";

import React, { useEffect, useImperativeHandle, useState } from "react";
import { CategoryContainer } from "./CategoryList-styles.tsx";
import { allCategoryData } from "../../../constants/Categories/1stCategories.ts";
import { log } from "../../../constants/Misc.ts";

export interface Category {
  id: number;
  name: string;
  icon?: string;
}

export interface Categories {
  [key: number]: Category[];
}
export interface CategoryData {
  category: Category[];
  subCategories: Categories[];
}

type ListDirection = "column" | "row";

interface CategoryListProps {
  sx?: SxProps<Theme>;
  categoryData: CategoryData;
  initialCategories?: string[];
  columns?: number;
  afterChange?: (categories: string[]) => void;
  excludeCategories?: Category[];
}

export type CategoryListRef = {
  getSelectedCategories: () => string[];
  setSelectedCategories: (arr: string[]) => void;
  clearCategories: () => void;
  getCategoriesFetchString: (categories?: string[]) => string;
  categoriesToObject: (categories?: string[]) => object;
};

export const CategoryList = React.forwardRef<
  CategoryListRef,
  CategoryListProps
>(
  (
    {
      sx,
      categoryData,
      initialCategories,
      columns = 1,
      afterChange,
      excludeCategories,
    }: CategoryListProps,
    ref
  ) => {
    const categoriesLength = categoryData.subCategories.length + 1;

    let emptyCategories: string[] = [];
    for (let i = 0; i < categoriesLength; i++) emptyCategories.push("");

    const [selectedCategories, setSelectedCategories] = useState<string[]>(
      initialCategories || emptyCategories
    );
    useEffect(() => {
      if (initialCategories) setSelectedCategories(initialCategories);
    }, [initialCategories]);

    const updateCategories = (categories: string[]) => {
      setSelectedCategories(categories);
      if (afterChange) afterChange(categories);
    };
    const categoriesToObject = (categories: string[]) => {
      let categoriesObject = {};
      categories.map((category, index) => {
        if (index === 0) categoriesObject["category"] = category;
        else if (index === 1) categoriesObject["subcategory"] = category;
        else categoriesObject[`subcategory${index}`] = category;
      });
      if (log) console.log("categoriesObject is: ", categoriesObject);
      return categoriesObject;
    };

    const clearCategories = () => {
      updateCategories(emptyCategories);
    };

    useImperativeHandle(ref, () => ({
      getSelectedCategories: () => {
        return selectedCategories;
      },
      setSelectedCategories: categories => {
        if (log) console.log("setSelectedCategories: ", categories);
        updateCategories(categories);
      },
      clearCategories,
      getCategoriesFetchString: (categories?: string[]) =>
        getCategoriesFetchString(categories || selectedCategories),
      categoriesToObject: (categories?: string[]) =>
        categoriesToObject(categories || selectedCategories),
    }));

    const selectCategory = (optionId: string, index: number) => {
      const isMainCategory = index === 0;
      const subCategoryIndex = index - 1;
      let selectedOption: Category | undefined;
      if (isMainCategory)
        selectedOption = categoryData.category.find(
          option => option.id === +optionId
        );
      else {
        const subCategoryLevel = categoryData.subCategories[subCategoryIndex];
        const parentCategory = selectedCategories[subCategoryIndex];
        const subCategory = subCategoryLevel[parentCategory];

        selectedOption = subCategory.find(option => option.id === +optionId);
      }
      const newSelectedCategories: string[] = selectedCategories.map(
        (category, categoryIndex) => {
          if (index > categoryIndex) return category;
          else if (index === categoryIndex) return selectedOption.id.toString();
          else return "";
        }
      );
      updateCategories(newSelectedCategories);
    };

    const selectCategoryEvent = (event: SelectChangeEvent, index: number) => {
      const optionId = event.target.value;
      selectCategory(optionId, index);
    };

    const categorySelectSX = {
      // Target the input field
      ".MuiSelect-select": {
        fontSize: "16px", // Change font size for the selected value
        padding: "10px 5px 15px 15px;",
      },
      // Target the dropdown icon
      ".MuiSelect-icon": {
        fontSize: "20px", // Adjust if needed
      },
      // Target the dropdown menu
      "& .MuiMenu-paper": {
        ".MuiMenuItem-root": {
          fontSize: "14px", // Change font size for the menu items
        },
      },
    };

    const fillMenu = (category: Categories, index: number) => {
      const subCategoryIndex = selectedCategories[index];
      if (log) console.log("selected categories: ", selectedCategories);
      if (log) console.log("index is: ", index);
      if (log) console.log("subCategoryIndex is: ", subCategoryIndex);
      if (log) console.log("category is: ", category);
      if (log)
        console.log(
          "subCategoryIndex within category: ",
          selectedCategories[subCategoryIndex]
        );
      if (log) console.log("categoryData: ", categoryData);

      const menuToFill = category[subCategoryIndex];
      if (menuToFill)
        return menuToFill.map(option => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        ));
    };

    const hasSubCategory = (category: Categories, index: number) => {
      const subCategoryIndex = selectedCategories[index];
      const subCategory = category[subCategoryIndex];
      if (excludeCategories && subCategory === excludeCategories) return false;
      return subCategory && subCategoryIndex;
    };

    return (
      <CategoryContainer sx={{ width: "100%", ...sx }}>
        <FormControl sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(" + columns + ", 1fr)",
              width: "100%",
              gap: "20px",
              alignItems: "center",
              marginTop: "30px",
            }}
          >
            <FormControl fullWidth sx={{ marginBottom: 1 }}>
              <InputLabel
                sx={{
                  fontSize: "16px",
                }}
                id="Category-1"
              >
                Category
              </InputLabel>
              <Select
                labelId="Category 1"
                input={<OutlinedInput label="Category 1" />}
                value={selectedCategories[0] || ""}
                onChange={e => {
                  selectCategoryEvent(e, 0);
                }}
                sx={categorySelectSX}
              >
                {categoryData.category.map(option => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {categoryData.subCategories.map(
              (category, index) =>
                hasSubCategory(category, index) && (
                  <FormControl
                    fullWidth
                    sx={{
                      marginBottom: 1,
                    }}
                    key={selectedCategories[index] + index}
                  >
                    <InputLabel
                      sx={{
                        fontSize: "16px",
                      }}
                      id={`Category-${index + 2}`}
                    >
                      {`Category-${index + 2}`}
                    </InputLabel>
                    <Select
                      labelId={`Category ${index + 2}`}
                      input={<OutlinedInput label={`Category ${index + 2}`} />}
                      value={selectedCategories[index + 1] || ""}
                      onChange={e => {
                        selectCategoryEvent(e, index + 1);
                      }}
                      sx={{
                        width: "100%",
                        // Target the input field
                        ".MuiSelect-select": {
                          fontSize: "16px", // Change font size for the selected value
                          padding: "10px 5px 15px 15px;",
                        },
                        // Target the dropdown icon
                        ".MuiSelect-icon": {
                          fontSize: "20px", // Adjust if needed
                        },
                        // Target the dropdown menu
                        "& .MuiMenu-paper": {
                          ".MuiMenuItem-root": {
                            fontSize: "14px", // Change font size for the menu items
                          },
                        },
                      }}
                    >
                      {fillMenu(category, index)}
                    </Select>
                  </FormControl>
                )
            )}
          </Box>
        </FormControl>
      </CategoryContainer>
    );
  }
);

export const getCategoriesFetchString = (categories: string[]) => {
  let fetchString = "";
  categories.map((category, index) => {
    if (category) {
      if (index === 0) fetchString += `cat:${category}`;
      else if (index === 1) fetchString += `;sub:${category}`;
      else fetchString += `;sub${index}:${category}`;
    }
  });
  if (log) console.log("categoriesAsDescription: ", fetchString);
  return fetchString;
};

export const appendCategoryToList = (
  categories: string[],
  appendedCategoryID: string
) => {
  const filteredCategories = categories.filter(
    categoryString => categoryString.length > 0
  );
  filteredCategories.push(appendedCategoryID);
  return filteredCategories;
};

export const getCategoriesFromObject = (editFileProperties: any) => {
  const categoryList: string[] = [];
  const categoryCount = allCategoryData.subCategories.length + 1;

  for (let i = 0; i < categoryCount; i++) {
    if (i === 0 && editFileProperties.category)
      categoryList.push(editFileProperties.category);
    else if (i === 1 && editFileProperties.subcategory)
      categoryList.push(editFileProperties.subcategory);
    else categoryList.push(editFileProperties[`subcategory${i}`] || "");
  }
  return categoryList;
};
