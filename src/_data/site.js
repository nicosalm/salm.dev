import { execSync } from "child_process";

const [gitHash, gitDate] = execSync('git log -1 --format="%h %cI"').toString().trim().split(" ");

export default {
  title: "salm.dev",
  description: "The personal website of Nico Salm. I write about computing, history, and philosophy.",
  url: "https://salm.dev",
  author: { name: "Nico Salm", email: "nico@salm.dev" },
  git: {
    hash: gitHash,
    date: gitDate,
    url: `https://github.com/nicosalm/salm.dev/commit/${gitHash}`,
  },
};
