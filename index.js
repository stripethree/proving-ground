const core = require("@actions/core");
const { graphql } = require("@octokit/graphql");
const { CREATE_TAG, GET_BRANCH_REFS } = require("./src/queries");

const zeroPad = (num, places) => String(num).padStart(places, "0");
const CLIENT_ID = `stripethree/proving-ground`;

async function createNewTag(token, tagName, commitOid, repositoryId) {
  return graphql(CREATE_TAG, {
    clientId: CLIENT_ID,
    refName: `refs/tags/${tagName}`,
    commitOid,
    repositoryId,
    headers: {
      authorization: `token ${token}`,
    },
  });
}

async function getBranchRefs(token, owner, repoName, queryStr) {
  return graphql(GET_BRANCH_REFS, {
    owner,
    repoName,
    queryStr,
    headers: {
      authorization: `token ${token}`,
    },
  });
}

function getBaseTagNode(branchName) {
  return {
    name: `tags/${branchName}-000`,
    target: { oid: null },
  };
}

if (!process.env.GITHUB_REF) {
  console.error("Missing GITHUB_REPOSITORY");
  return;
}

if (!process.env.GITHUB_REPOSITORY) {
  console.error("Missing GITHUB_REPOSITORY");
  return;
}

if (!process.env.GITHUB_TOKEN) {
  console.error("Missing GITHUB_TOKEN");
  return;
}

const branchName = process.env.GITHUB_REF.split("/").pop();
const [owner, repoName] = process.env.GITHUB_REPOSITORY.split("/");
const token = process.env.GITHUB_TOKEN;

if (!owner || !repoName) {
  console.error("Invalid GITHUB_REPOSITORY value");
  return;
}

getBranchRefs(token, owner, repoName, branchName)
  .then((data) => {
    const repositoryId = data.repository.id;
    const tagNodes = data.repository.refs.nodes.filter((node) =>
      node.name.startsWith("tags")
    );
    const lastTagNode = tagNodes.pop() || getBaseTagNode(branchName);

    const branchNodes = data.repository.refs.nodes.filter(
      (node) => node.name === `heads/${branchName}`
    );
    const branchNode = branchNodes.pop();
    if (!branchNode) {
      throw new Error("No matching branch name found in graphql response.");
    }

    const lastTag = lastTagNode.name.split("/").pop();
    const lastPatch = parseInt(lastTag.split("-").pop());
    const newTag = branchName.concat("-").concat(zeroPad(lastPatch + 1, 3));

    const branchOid = branchNode.target.oid;
    const lastTagOid = lastTagNode.target.oid;

    if (lastTagOid !== null && branchOid === lastTagOid) {
      throw new Error(
        "No new branch commits. Cowardly refusing to create a new tag."
      );
    }
    return createNewTag(token, newTag, branchOid, repositoryId);
  })
  .then((data) => {
    console.log(JSON.stringify(data, null, "  "));
  })
  .catch((err) => {
    console.log(err);
    return 1;
  });
