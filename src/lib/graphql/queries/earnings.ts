import { gql } from "@apollo/client/core";

// Payout-account registry — the MoMo numbers the designer has registered
// to receive instant payouts. Internal field names still say "wallet"
// (server-side table name); the UI surfaces them as "payout accounts".
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

// Replaces MY_WALLET_BALANCE + MY_WALLET_TRANSACTIONS. Returns a
// derived report off the payouts table — Nidlo never holds a balance.
export const MY_EARNINGS_SUMMARY = gql`
  query MyEarningsSummary($from: DateTime, $to: DateTime) {
    myEarningsSummary(from: $from, to: $to) {
      ordersCount
      grossPesewas
      feePesewas
      netPesewas
      paidOutPesewas
      awaitingPayoutSetupPesewas
      breakdown {
        payoutId
        orderId
        grossPesewas
        feePesewas
        netPesewas
        status
        transferredAt
        createdAt
      }
    }
  }
`;
