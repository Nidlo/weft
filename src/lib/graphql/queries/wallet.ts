import { gql } from "@apollo/client/core";

export const MY_WALLET_ACCOUNTS = gql`
  query MyWalletAccounts {
    myWalletAccounts {
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

export const MY_WALLET_BALANCE = gql`
  query MyWalletBalance {
    myWalletBalance {
      balance
    }
  }
`;

export const MY_WALLET_TRANSACTIONS = gql`
  query MyWalletTransactions($first: Int, $page: Int) {
    myWalletTransactions(first: $first, page: $page) {
      id
      type
      amount
      confirmed
      meta
      createdAt
    }
  }
`;
