import { gql } from "@apollo/client";

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    listTransactions {
      id
      title
      amount
      type
      date
      category {
        name
      }
    }
    listCategories {
      id
      name
      transactions {
        amount
        type
      }
    }
  }
`;