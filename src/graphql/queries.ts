import { gql } from "@apollo/client";

export const GET_LOCATIONS = gql`
  query {
    locations(page: 1) {
      results {
        id
        name
        type
        dimension
        residents {
          id
          name
          status
          species
          image
        }
      }
    }
  }
`;
