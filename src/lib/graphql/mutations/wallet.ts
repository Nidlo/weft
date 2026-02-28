import { gql } from "@apollo/client/core";

export const RESOLVE_MOMO_ACCOUNT = gql`
  mutation ResolveMomoAccount($input: ResolveMomoAccountInput!) {
    resolveMomoAccount(input: $input) {
      accountName
      accountNumber
    }
  }
`;

export const ADD_WALLET_ACCOUNT = gql`
  mutation AddWalletAccount($input: AddWalletAccountInput!) {
    addWalletAccount(input: $input) {
      id
      userId
      type
      accountNumber
      accountName
      bankCode
      network
      networkLabel
      isPrimary
      isVerified
      verifiedAt
      createdAt
    }
  }
`;

export const SET_WALLET_PRIMARY = gql`
  mutation SetWalletPrimary($walletAccountId: ID!) {
    setWalletPrimary(walletAccountId: $walletAccountId) {
      id
      isPrimary
    }
  }
`;

export const REMOVE_WALLET_ACCOUNT = gql`
  mutation RemoveWalletAccount($walletAccountId: ID!) {
    removeWalletAccount(walletAccountId: $walletAccountId)
  }
`;
