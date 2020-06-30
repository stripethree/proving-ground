exports.CREATE_TAG = `
  mutation($clientId: String!, refName: String!, commitOid: String!, repositoryId: String! ) {
    createRef(
      input:{
        clientMutationId: $clientId,
        name: $refName,
        oid: $commitOid,
        repositoryId: $repositoryId
      }
    ) {
      success
    }
  }
`;

exports.GET_BRANCH_REFS = `
  query($owner: String!, $repoName: String!, $queryStr: String!) {
    repository(name: $repoName owner: $owner) {
      id
      refs(refPrefix: "refs/" first: 100 query: $queryStr orderBy: { field: TAG_COMMIT_DATE, direction: ASC } ) {
        nodes {
          name
          target {
            oid
          }
        }
      }
    }
  }
`;
