import { Box } from "@mui/material";
import React from "react";
import { useTestIdentifiers } from "../Identifiers.ts";

export const appName = "Q-Support";
export const feeDestinationName = "Q-Support";

export const feeAmountBase = useTestIdentifiers ? 0.000001 : 0.25;
export const FEE_BASE = useTestIdentifiers
  ? "MYTEST_support_fees"
  : "q_support_fees";

export const supportedCoins = [
  "QORT",
  "BTC",
  "LTC",
  "DOGE",
  "DGB",
  "RVN",
  "ARRR",
].sort((a, b) => {
  return a.localeCompare(b);
});
export const maxFeePublishTimeDiff = 10; // time in minutes before/after publish when fee is considered valid
export type FeeType = "default" | "comment" | "like" | "dislike" | "superlike";

export const feeDisclaimerString = `When Publishing (but not editing) Issues ${feeAmountBase} \n 
QORT is requested to fund continued development of Q-Support.`;

export const feeDisclaimer = (
  <Box
    sx={{
      fontSize: "28px",
      color: "#f44336",
      fontWeight: 600,
    }}
  >
    {feeDisclaimerString}
  </Box>
);
