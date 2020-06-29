exports.GET_LAST_TAG = `
  query($owner: String!, $repoName: String!, $queryStr: String!) {
    repository(name: $repoName owner: $owner) {
      refs(refPrefix: "refs/tags/" first: 1 query: $queryStr ) {
      nodes {
        name
      }
    }
  }
}
`;
