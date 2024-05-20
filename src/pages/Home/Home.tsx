import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../state/store";
import { IssueList } from "./IssueList.tsx";
import { Box, Grid, Input, useTheme } from "@mui/material";
import { useFetchIssues } from "../../hooks/useFetchIssues.tsx";
import LazyLoad from "../../components/common/LazyLoad";
import { FiltersCol, FiltersContainer } from "./IssueList-styles.tsx";
import { SubtitleContainer, ThemeButton } from "./Home-styles";
import {
  changefilterName,
  changefilterSearch,
  changeFilterType,
  setQappNames,
} from "../../state/features/fileSlice.ts";
import {
  allCategoryData,
  IssueState,
} from "../../constants/Categories/Categories.ts";
import {
  CategoryList,
  CategoryListRef,
  getCategoriesFetchString,
} from "../../components/common/CategoryList/CategoryList.tsx";
import { StatsData } from "../../components/StatsData.tsx";
import {
  CategorySelect,
  CategorySelectRef,
} from "../../components/common/CategoryList/CategorySelect.tsx";
import {
  AutocompleteQappNames,
  getPublishedQappNames,
  QappNamesRef,
} from "../../components/common/AutocompleteQappNames.tsx";

interface HomeProps {
  mode?: string;
}
export const Home = ({ mode }: HomeProps) => {
  const theme = useTheme();
  const isFiltering = useSelector((state: RootState) => state.file.isFiltering);
  const filterValue = useSelector((state: RootState) => state.file.filterValue);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const filterType = useSelector((state: RootState) => state.file.filterType);

  const setFilterType = payload => {
    dispatch(changeFilterType(payload));
  };
  const filterSearch = useSelector(
    (state: RootState) => state.file.filterSearch
  );
  const QappNames = useSelector(
    (state: RootState) => state.file.publishedQappNames
  );
  const autocompleteRef = useRef<QappNamesRef>(null);

  const setFilterSearch = payload => {
    dispatch(changefilterSearch(payload));
  };
  const filterName = useSelector((state: RootState) => state.file.filterName);

  const setFilterName = payload => {
    dispatch(changefilterName(payload));
  };

  const isFilterMode = useRef(false);
  const firstFetch = useRef(false);
  const afterFetch = useRef(false);
  const isFetching = useRef(false);
  const prevVal = useRef("");
  const categoryListRef = useRef<CategoryListRef>(null);
  const categorySelectRef = useRef<CategorySelectRef>(null);

  const [showCategoryList, setShowCategoryList] = useState<boolean>(true);
  const [showCategorySelect, setShowCategorySelect] = useState<boolean>(true);
  const { files: globalVideos } = useSelector((state: RootState) => state.file);

  const dispatch = useDispatch();
  const filteredFiles = useSelector(
    (state: RootState) => state.file.filteredFiles
  );

  const [QappNamesParam, setQappNamesParam] = useState<string[]>([]);

  useEffect(() => {
    getPublishedQappNames().then(QappNamesResult => {
      dispatch(setQappNames(QappNamesResult));
      setQappNamesParam(QappNamesResult);
    });
  }, []);

  const {
    getIssues,
    checkAndUpdateIssue,
    getIssue,
    hashMapFiles,
    getNewIssues,
    checkNewIssues,
    getIssuesFiltered,
    getIssuesCount,
  } = useFetchIssues();

  const getIssuesHandler = React.useCallback(
    async (reset?: boolean, resetFilters?: boolean) => {
      if (!firstFetch.current || !afterFetch.current) return;
      if (isFetching.current) return;
      isFetching.current = true;
      const selectedCategories =
        categoryListRef.current?.getSelectedCategories() || [];
      const issueType = categorySelectRef?.current?.getSelectedCategory();
      if (issueType) selectedCategories[2] = issueType;
      await getIssues(
        {
          name: filterName,
          categories: getCategoriesFetchString(selectedCategories),
          QappName: autocompleteRef?.current?.getQappNameFetchString(),
          keywords: filterSearch,
          type: filterType,
        },
        reset,
        resetFilters
      );
      isFetching.current = false;
    },
    [
      getIssues,
      filterValue,
      getIssuesFiltered,
      isFiltering,
      filterName,
      filterSearch,
      filterType,
    ]
  );

  const searchOnEnter = e => {
    if (e.keyCode == 13) {
      getIssuesHandler(true);
    }
  };

  useEffect(() => {
    if (isFiltering && filterValue !== prevVal?.current) {
      prevVal.current = filterValue;
      getIssuesHandler();
    }
  }, [filterValue, isFiltering, filteredFiles, getIssuesCount]);

  const getFilesHandlerMount = React.useCallback(async () => {
    if (firstFetch.current) return;
    firstFetch.current = true;
    setIsLoading(true);

    await getIssues();
    afterFetch.current = true;
    isFetching.current = false;

    setIsLoading(false);
  }, [getIssues]);

  let issues = globalVideos;

  if (isFiltering) {
    issues = filteredFiles;
    isFilterMode.current = true;
  } else {
    isFilterMode.current = false;
  }

  // const interval = useRef<any>(null);

  // const checkNewVideosFunc = useCallback(() => {
  //   let isCalling = false;
  //   interval.current = setInterval(async () => {
  //     if (isCalling || !firstFetch.current) return;
  //     isCalling = true;
  //     await checkNewVideos();
  //     isCalling = false;
  //   }, 30000); // 1 second interval
  // }, [checkNewVideos]);

  // useEffect(() => {
  //   if (isFiltering && interval.current) {
  //     clearInterval(interval.current);
  //     return;
  //   }
  //   checkNewVideosFunc();

  //   return () => {
  //     if (interval?.current) {
  //       clearInterval(interval.current);
  //     }
  //   };
  // }, [mode, checkNewVideosFunc, isFiltering]);

  useEffect(() => {
    if (
      !firstFetch.current &&
      !isFilterMode.current &&
      globalVideos.length === 0
    ) {
      isFetching.current = true;
      getFilesHandlerMount();
    } else {
      firstFetch.current = true;
      afterFetch.current = true;
    }
  }, [getFilesHandlerMount, globalVideos]);

  const filtersToDefault = async () => {
    setFilterType("videos");
    setFilterSearch("");
    setFilterName("");
    categoryListRef.current?.clearCategories();
    categorySelectRef.current?.clearCategory();
    autocompleteRef.current?.setSelectedValue(null);
    ReactDOM.flushSync(() => {
      getIssuesHandler(true, true);
    });
  };

  return (
    <Grid container sx={{ width: "100%" }}>
      <FiltersCol item xs={12} md={2} sm={3}>
        <FiltersContainer>
          <StatsData />
          <Input
            id="standard-adornment-name"
            onChange={e => {
              setFilterSearch(e.target.value);
            }}
            onKeyDown={searchOnEnter}
            value={filterSearch}
            placeholder="Search"
            sx={{
              color: theme.palette.text.primary,
              borderBottom: `1px solid ${theme.palette.text.primary}`,
              "&&:before": {
                borderBottom: "none",
              },
              "&&:after": {
                borderBottom: "none",
              },
              "&&:hover:before": {
                borderBottom: "none",
              },
              "&&.Mui-focused:before": {
                borderBottom: "none",
              },
              "&&.Mui-focused": {
                outline: "none",
              },
              fontSize: "20px",
            }}
          />
          <Input
            id="standard-adornment-name"
            onChange={e => {
              setFilterName(e.target.value);
            }}
            onKeyDown={searchOnEnter}
            value={filterName}
            placeholder="User's Name (Exact)"
            sx={{
              marginTop: "20px",
              borderBottom: `1px solid ${theme.palette.text.primary}`,
              "&&:before": {
                borderBottom: "none",
              },
              "&&:after": {
                borderBottom: "none",
              },
              "&&:hover:before": {
                borderBottom: "none",
              },
              "&&.Mui-focused:before": {
                borderBottom: "none",
              },
              "&&.Mui-focused": {
                outline: "none",
              },
              fontSize: "20px",
            }}
          />
          {showCategoryList && (
            <CategoryList
              categoryData={allCategoryData}
              ref={categoryListRef}
              afterChange={value => {
                setShowCategorySelect(!value[0]);
              }}
            />
          )}
          {showCategorySelect && (
            <CategorySelect
              categoryData={IssueState}
              ref={categorySelectRef}
              sx={{ marginTop: "20px" }}
              afterChange={value => {
                setShowCategoryList(!value);
              }}
            />
          )}

          {QappNamesParam.length > 0 && (
            <AutocompleteQappNames
              ref={autocompleteRef}
              namesList={QappNamesParam}
              sx={{ marginTop: "20px" }}
              required={false}
              afterChange={() => {
                const currentSelectedCategories =
                  categoryListRef?.current?.getSelectedCategories();
                categoryListRef?.current?.setSelectedCategories([
                  "3",
                  currentSelectedCategories[1],
                  currentSelectedCategories[2],
                ]);
              }}
            />
          )}

          <ThemeButton
            onClick={() => {
              filtersToDefault();
            }}
            sx={{
              marginTop: "20px",
              fontWeight: 1000,
            }}
            variant="contained"
          >
            reset
          </ThemeButton>
          <ThemeButton
            onClick={() => {
              getIssuesHandler(true);
            }}
            sx={{
              marginTop: "20px",
              fontWeight: 1000,
            }}
            variant="contained"
          >
            Search
          </ThemeButton>
        </FiltersContainer>
      </FiltersCol>
      <Grid item xs={12} md={10} sm={9}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <SubtitleContainer
            sx={{
              justifyContent: "flex-start",
              paddingLeft: "15px",
              width: "100%",
              maxWidth: "1400px",
            }}
          ></SubtitleContainer>
          <IssueList issues={issues} />
          <LazyLoad
            onLoadMore={getIssuesHandler}
            isLoading={isLoading}
          ></LazyLoad>
        </Box>
      </Grid>
    </Grid>
  );
};
