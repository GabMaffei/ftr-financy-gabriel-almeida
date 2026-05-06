import { gql } from "@apollo/client";

export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    listTransactions {
      id
      title
      amount
      type
      date
      category {
        id
        name
      }
    }
  }
`;