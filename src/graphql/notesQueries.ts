import { gql } from "@apollo/client";

// Get notes for a character
export const GET_CHARACTER_NOTES = gql`
  query GetCharacterNotes($characterId: String!) {
    notesCollection(
      filter: { character_id: { eq: $characterId } }
      orderBy: { created_at: DescNullsLast }
    ) {
      edges {
        node {
          id
          character_id
          character_name
          content
          type
          created_at
        }
      }
    }
  }
`;

// Add a note
export const ADD_NOTE = gql`
  mutation AddNote(
    $characterId: String!
    $characterName: String!
    $content: String!
    $type: String!
  ) {
    insertIntonotesCollection(
      objects: [{
        character_id: $characterId
        character_name: $characterName
        content: $content
        type: $type
      }]
    ) {
      records {
        id
        content
        created_at
      }
    }
  }
`;

// Delete a note
export const DELETE_NOTE = gql`
  mutation DeleteNote($id: UUID!) {
    deleteFromnotesCollection(filter: { id: { eq: $id } }) {
      records {
        id
      }
    }
  }
`;

// Get all notes count for a character (for badge)
export const GET_NOTES_COUNT = gql`
  query GetNotesCount($characterId: String!) {
    notesCollection(filter: { character_id: { eq: $characterId } }) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

