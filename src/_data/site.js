import { execSync } from "child_process";

const [gitHash, gitDate] = execSync('git log -1 --format="%h %cI"').toString().trim().split(" ");

export default {
  title: "salm.dev",
  description: "Website of Nico Salm. My technical interests are in high-performance computing, algorithms, and full-stack development.",
  url: "https://salm.dev",
  author: { name: "Nico Salm", email: "nico@salm.dev" },
  git: {
    hash: gitHash,
    date: gitDate,
    url: `https://github.com/nicosalm/salm.dev/commit/${gitHash}`,
  },
};
