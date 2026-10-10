import { execSync } from "child_process";

const [gitHash, gitDate] = execSync('git log -1 --format="%h %cI"').toString().trim().split(" ");

const email = "nico@salm.dev";
const topics = "computing, history, and life";

export default {
  title: "salm.dev",
  description: `The personal website of Nico Salm. I write about ${topics}.`,
  topics,
  url: "https://salm.dev",
  author: { name: "Nico Salm", email, emailReversed: [...email].reverse().join("") },
  git: {
    hash: gitHash,
    date: gitDate,
    url: `https://github.com/nicosalm/salm.dev/commit/${gitHash}`,
  },
};
