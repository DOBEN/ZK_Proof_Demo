import { AtomicStatementV2 } from "@concordium/web-sdk";
import { SignClientTypes } from "@walletconnect/types";

// The string "CONCORDIUM_COMPLIANT_REWARD_DISTRIBUTION_DAPP" is used
// as context for signing messages and generating ZK proofs. The same account
// can be used in different Concordium services without the risk of re-playing
// signatures/zk-proofs across the different services due to this context string.
export const CONTEXT_STRING = "CONCORDIUM_COMPLIANT_REWARD_DISTRIBUTION_DAPP";

export const WALLET_CONNECT_PROJECT_ID = "76324905a70fe5c388bab46d3e0564dc";
export const WALLET_CONNECT_SESSION_NAMESPACE = "ccd";
export const CHAIN_ID = `${WALLET_CONNECT_SESSION_NAMESPACE}:${CONFIG.network === "testnet" ? `testnet` : `mainnet`}`;
export const METHOD_GENERATE_ZK_PROOF = "request_verifiable_presentation";
export const METHOD_SIGN = "sign_message";

export const walletConnectOpts: SignClientTypes.Options = {
  projectId: WALLET_CONNECT_PROJECT_ID,
  metadata: {
    name: "Compliance Reward Distribution",
    description: "Application for distributing CCD rewards",
    url: "#",
    icons: ["https://walletconnect.com/walletconnect-logo.png"],
  },
};

/// 1. Proof: Reveal attribute proof ("nationalIdNo" attribute).
/// 2. Proof: Reveal attribute proof ("nationality" attribute).
/// 3. Proof: Range proof ("dob=dateOfBirth" attribute). User is older than 18 years.
/// 4. Proof: Not set membership proof ("countryOfResidence" attribute). User is not from the USA,
/// North Korea, or Russia. Countries are represented by 2 letters (ISO 3166-1 alpha-2).
export const ZK_STATEMENTS = [
  {
    type: "RevealAttribute",
    attributeTag: "nationalIdNo",
  },
  {
    type: "RevealAttribute",
    attributeTag: "nationality",
  },
  {
    type: "AttributeInRange",
    attributeTag: "dob",
    lower: "18000101",
    upper: "20060802",
  },
  {
    type: "AttributeNotInSet",
    attributeTag: "countryOfResidence",
    set: ["US", "KP", "RU"],
  },
] as AtomicStatementV2[];

// To create the schemas:
//
// 1. Step: Use the expected Rust type from the backend as an input parameter to a smart contract function e.g.:
//
// #[derive(SchemaType)]
// pub struct TweetParam {
//     context_string: String,
//     message: TweetMessage,
//     block_hash: String,
// }
// #[derive(SchemaType)]
// pub struct TweetMessage {
//     limit: u32,
//     offset: u32,
// }
//
// #[receive(
//     contract = "dummyContract",
//     name = "Tweet",
//     parameter = "TweetParam",
//     mutable,
//     error = "ContractError"
// )]
// fn tweet(_ctx: &ReceiveContext, _host: &mut Host<State>) -> ContractResult<()> {
//     Ok(())
// }
//
// 2. Step: Get the type parameter schema for the above function with the command:
// cargo concordium build --schema-json-out ./
export const SCHEMA_TWEET_MESSAGE =
  "FAADAAAADgAAAGNvbnRleHRfc3RyaW5nFgIHAAAAbWVzc2FnZRYCCgAAAGJsb2NrX2hhc2gWAg==";
export const SCHEMA_GET_ACCOUNT_DATA_MESSAGE =
  "FAADAAAADgAAAGNvbnRleHRfc3RyaW5nFgIHAAAAbWVzc2FnZQsKAAAAYmxvY2tfaGFzaBYC";
export const SCHEMA_GET_PENDING_APPROVALS_MESSAGE =
  "FAADAAAADgAAAGNvbnRleHRfc3RyaW5nFgIHAAAAbWVzc2FnZRQAAgAAAAUAAABsaW1pdAQGAAAAb2Zmc2V0BAoAAABibG9ja19oYXNoFgI=";
export const SCHEMA_SET_CLAIMED_MESSAGE =
  "FAADAAAADgAAAGNvbnRleHRfc3RyaW5nFgIHAAAAbWVzc2FnZRACCwoAAABibG9ja19oYXNoFgI=";

// The number of blocks after the `best block` (top of chain), where the `recent block` is located.
// The `recent block hash` is included in signatures and ZK proofs to ensure they expire.
export const RECENT_BLOCK_DURATION = 10n;
