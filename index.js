const core = require("@actions/core");
const { graphql } = require("@octokit/graphql");
const { GET_LAST_TAG } = require("./src/queries");

const zeroPad = (num, places) => String(num).padStart(places, "0");

async function getLastTag(token, owner, repoName, queryStr) {
  return graphql(GET_LAST_TAG, {
    owner,
    repoName,
    queryStr,
    headers: {
      authorization: `token ${token}`,
    },
  });
}

if (!process.env.GITHUB_TOKEN) {
  console.error("Missing GITHUB_TOKEN");
  return;
}
const token = process.env.GITHUB_TOKEN;

if (!process.env.GITHUB_REPOSITORY) {
  console.error("Missing GITHUB_REPOSITORY");
  return;
}

if (!process.env.BRANCH_NAME) {
  console.error("Missing BRANCH_NAME");
  return;
}

const [owner, repoName] = process.env.GITHUB_REPOSITORY.split("/");
if (!owner || !repoName) {
  console.error("Invalid GITHUB_REPOSITORY value");
  return;
}

const branchName = process.env.BRANCH_NAME;
if (!branchName) {
  console.error("Invalid BRANCH_NAME value");
  return;
}

getLastTag(token, owner, repoName, branchName)
  .then((data) => {
    const lastTag = data.repository.refs.nodes[0].name;
    const lastPatch = parseInt(lastTag.split("-").pop());
    const nextPatch = lastPatch + 1;
    const nextTag = branchName.concat("-").concat(zeroPad(nextPatch, 3));
    console.log(`::set-output name=last_tag::${lastTag}`);
    console.log(`::set-output name=next_tag::${nextTag}`);
  })
  .catch((err) => console.log(err));
