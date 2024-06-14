import { NameData } from "../constants/PublishFees/SendFeeFunctions.ts";
import { getUserAccountNames } from "../constants/PublishFees/VerifyPayment-Functions.ts";

export const getNameData = async (name: string) => {
  return (await qortalRequest({
    action: "GET_NAME_DATA",
    name: name,
  })) as NameData;
};

export const sendQchatDM = async (
  recipientName: string,
  message: string,
  allowSelfAsRecipient = false
) => {
  if (!allowSelfAsRecipient) {
    const userAccountNames = await getUserAccountNames();
    const userNames = userAccountNames.map(name => name.name);
    if (userNames.includes(recipientName)) return;
  }

  const address = await getNameData(recipientName);
  try {
    return await qortalRequest({
      action: "SEND_CHAT_MESSAGE",
      destinationAddress: address.owner,
      message,
    });
  } catch (e) {
    console.log(e);
    return false;
  }
};
