import { setFeeData } from "../../../state/features/globalSlice.ts";
import { store } from "../../../state/store.js";
import {
  objectToBase64,
  objectToFile,
} from "../../../utils/PublishFormatter.ts";
import { useTestIdentifiers } from "../../Identifiers.ts";
import { appName, FEE_BASE, feeAmountBase, FeeType } from "../FeeData.tsx";

export type CoinType = "QORT" | "BTC" | "LTC" | "DOGE" | "DGB" | "RVN" | "ARRR";

export interface FeePrice {
  time: number;
  feeAmount: number;
  feeType: FeeType; // used to differentiate different types of fees such as comments, likes, data, etc.
  coinType: CoinType;
}

const feesPublishService = "DOCUMENT";

export const fetchFees = async () => {
  const feeData = store.getState().global.feeData;
  if (feeData.length > 0) {
    return feeData;
  }

  try {
    const response = await qortalRequest({
      action: "FETCH_QDN_RESOURCE",
      identifier: FEE_BASE,
      name: "Q-Support",
      service: feesPublishService,
    });

    return (await response) as FeePrice[];
  } catch (e) {
    console.log("fetch current fees error: ", e);
    return [] as FeePrice[];
  }
};

export const fetchFeesRedux = () => {
  const feeData = store.getState().global.feeData;
  if (feeData.length > 0) {
    return feeData;
  }

  fetchFees().then(feeData => store.dispatch(setFeeData(feeData)));
};

export const addFeePrice = async (
  feeAmount = feeAmountBase,
  feeType: FeeType = "default",
  coinType: CoinType = "QORT"
) => {
  const fees = await fetchFees();

  fees.push({
    time: Date.now(),
    feeAmount,
    feeType,
    coinType,
  });

  console.log("fees are: ", fees);
  await qortalRequest({
    action: "PUBLISH_QDN_RESOURCE",
    name: appName,
    identifier: FEE_BASE,
    service: feesPublishService,
    file: objectToFile(fees),
  });
};

const feeFilter = (fee: FeePrice, feeToVerify: FeePrice) => {
  const nameCheck = fee.feeType === feeToVerify.feeType;
  const coinTypeCheck = fee.coinType === feeToVerify.coinType;
  const timeCheck = feeToVerify.time <= feeToVerify.time;

  return nameCheck && coinTypeCheck && timeCheck;
};

export const verifyFeeAmount = async (feeToVerify: FeePrice) => {
  if (useTestIdentifiers) return true;

  const fees = await fetchFees();
  const filteredFees = fees.filter(fee => feeFilter(fee, feeToVerify));
  if (filteredFees.length === 0) return false;

  const feeToCheck = filteredFees[filteredFees.length - 1]; // gets fee that applies at the time of feeToVerify
  return feeToVerify.feeAmount >= feeToCheck.feeAmount;
};
