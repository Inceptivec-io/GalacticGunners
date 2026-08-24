const { spawnSync } = require("child_process");
const path = require("path");
const npmCli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");

const commands = [
  [process.execPath, [npmCli, "run", "qa:syntax"]],
  [process.execPath, [npmCli, "run", "qa:lint"]],
  [process.execPath, [npmCli, "run", "qa:images"]],
  [process.execPath, [npmCli, "run", "qa:sprites"]],
  [process.execPath, [npmCli, "run", "qa:collision"]],
  [process.execPath, [npmCli, "run", "qa:browser"]],
  [process.execPath, [npmCli, "run", "qa:visual"]],
  [process.execPath, [npmCli, "run", "qa:rev3"]]
];

for (const [cmd, args] of commands) {
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log("qa:all PASS");
