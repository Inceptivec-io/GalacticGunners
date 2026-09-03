import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const admittedRoot = join(
  projectRoot,
  "docs/internal_governance/handoff_in/_archive/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/11_ASSURANCE_RECOVERY_REPLACEMENT_TRANSPORT_MEMBERS/unpacked",
);
const receiptPath = join(
  projectRoot,
  "docs/internal_governance/evidence/GALACTIC_GUNNERS_DEVTEAM_HANDOFF_IN_015/assurance_recovery_intake/REPLACEMENT_RECEIVING_RECORD.md",
);

const transportHashes = {
  "GALACTIC_GUNNERS_H015_AUDIT_FINDINGS_PACK_v1.0.zip":
    "8fad65f31d07c4741864af68db19be4ca4e0a85c9c62c311d03bb269f31ada21",
  "GALACTIC_GUNNERS_H015_ASSURANCE_SPECIFICATION_PACK_v1.0.zip":
    "67d40308c89ec850177ecc247c0f0c9cb32a54c77c84bf5f58fdd183ddfa8c20",
  "GALACTIC_GUNNERS_H015_EXECUTION_AUTHORITY_PACK_v1.0.zip":
    "2dc5ed306832df622bd4ca020afde09e1eaabc45adca7d3bd235cf39793a568a",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0.zip":
    "f7b294ee5e867a594a4c4bbb037cf8abc3c6c2b527848c74781143347c658f97",
};

const sourceMembers = {
  "GALACTIC_GUNNERS_H015_AUDIT_FINDINGS_PACK_v1.0/AUDIT_FINDINGS.md":
    "0cfe65a00298532ca9993cb813bc2adf901155f28d97d27753d3920904fb6053",
  "GALACTIC_GUNNERS_H015_AUDIT_FINDINGS_PACK_v1.0/DELIVERY_REGISTER.md":
    "a1d73eaa99a380db18738eb050986ea41206b268a7e05b9c787441a363444259",
  "GALACTIC_GUNNERS_H015_AUDIT_FINDINGS_PACK_v1.0/README.md":
    "02f025234c0e45f2911e8c91fd5a2aea68fb0c5155b5940838160723c94b8c45",
  "GALACTIC_GUNNERS_H015_AUDIT_FINDINGS_PACK_v1.0/REQUIREMENT_CATALOGUE.csv":
    "a1ede341df623c99f601afdb8e792de763844ae070b1af316e58fa48c5bf1e08",
  "GALACTIC_GUNNERS_H015_ASSURANCE_SPECIFICATION_PACK_v1.0/ASSURANCE_STANDARD.md":
    "ccf8ca3fcf0bde7e38cacfb1465997bb8e7201a11a960cf32344fed5f42b3faa",
  "GALACTIC_GUNNERS_H015_ASSURANCE_SPECIFICATION_PACK_v1.0/BROWSER_JOURNEYS.md":
    "0d99001063f6fad6fb64ecb9c16334810c03470d14b3926b926578254aa00a72",
  "GALACTIC_GUNNERS_H015_ASSURANCE_SPECIFICATION_PACK_v1.0/CODING_AND_REVIEW_STANDARD.md":
    "f165ca1f06f84479f4e3471ba683d6038c468acecd0b4a003b87a496ef2cd926",
  "GALACTIC_GUNNERS_H015_ASSURANCE_SPECIFICATION_PACK_v1.0/README.md":
    "271a94643ef8e793913491b6fbd8f77974c47ed9e2717bf1e36a088921305c6d",
  "GALACTIC_GUNNERS_H015_ASSURANCE_SPECIFICATION_PACK_v1.0/REQUIREMENT_CATALOGUE.csv":
    "a1ede341df623c99f601afdb8e792de763844ae070b1af316e58fa48c5bf1e08",
  "GALACTIC_GUNNERS_H015_ASSURANCE_SPECIFICATION_PACK_v1.0/TRACEABILITY_TEMPLATE.yaml":
    "95d05f6b62cc85d5d889cdd22853fb39b8831d566d39d20710a4ec7bc4f03c37",
  "GALACTIC_GUNNERS_H015_EXECUTION_AUTHORITY_PACK_v1.0/BLOCKER_PROTOCOL.md":
    "aefcdbe5f4ab6eed636f6c39a556f0885ee1122afb743e1d256575d8ae5db844",
  "GALACTIC_GUNNERS_H015_EXECUTION_AUTHORITY_PACK_v1.0/CLOSEOUT_CONTRACT.md":
    "d608f5a97f0c304fcfe355ec42d5eb70a09fdeb9082f62075eeb0f4427677b85",
  "GALACTIC_GUNNERS_H015_EXECUTION_AUTHORITY_PACK_v1.0/EXECUTION_AUTHORITY.md":
    "1774ef353df5d81d8f38ee05b6b1ea3d3f2b07f8af0d22a21133882dd94c084d",
  "GALACTIC_GUNNERS_H015_EXECUTION_AUTHORITY_PACK_v1.0/README.md":
    "81558ec53d4632efdad4b8d1e27e34ba70cd29ad653c71d1d2abf7c0c4aa240b",
  "GALACTIC_GUNNERS_H015_EXECUTION_AUTHORITY_PACK_v1.0/REQUIREMENT_CATALOGUE.csv":
    "a1ede341df623c99f601afdb8e792de763844ae070b1af316e58fa48c5bf1e08",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0/ASSURANCE_STANDARD.md":
    "ccf8ca3fcf0bde7e38cacfb1465997bb8e7201a11a960cf32344fed5f42b3faa",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0/AUDIT_FINDINGS.md":
    "0cfe65a00298532ca9993cb813bc2adf901155f28d97d27753d3920904fb6053",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0/BLOCKER_PROTOCOL.md":
    "aefcdbe5f4ab6eed636f6c39a556f0885ee1122afb743e1d256575d8ae5db844",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0/BROWSER_JOURNEYS.md":
    "0d99001063f6fad6fb64ecb9c16334810c03470d14b3926b926578254aa00a72",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0/CLOSEOUT_CONTRACT.md":
    "d608f5a97f0c304fcfe355ec42d5eb70a09fdeb9082f62075eeb0f4427677b85",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0/CODING_AND_REVIEW_STANDARD.md":
    "f165ca1f06f84479f4e3471ba683d6038c468acecd0b4a003b87a496ef2cd926",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0/DELIVERY_REGISTER.md":
    "a1d73eaa99a380db18738eb050986ea41206b268a7e05b9c787441a363444259",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0/EXECUTION_AUTHORITY.md":
    "1774ef353df5d81d8f38ee05b6b1ea3d3f2b07f8af0d22a21133882dd94c084d",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0/README.md":
    "a39376e2fb2c6d0b3773a5f8e9415005f9a9095c24b46e0658a48628af90d786",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0/REQUIREMENT_CATALOGUE.csv":
    "a1ede341df623c99f601afdb8e792de763844ae070b1af316e58fa48c5bf1e08",
  "GALACTIC_GUNNERS_H015_COMPLETE_RECOVERY_PACK_v1.0/TRACEABILITY_TEMPLATE.yaml":
    "95d05f6b62cc85d5d889cdd22853fb39b8831d566d39d20710a4ec7bc4f03c37",
};

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

export function validateAssuranceRecoveryIntake({
  root = admittedRoot,
  receipt = receiptPath,
  expectedTransportHashes = {},
} = {}) {
  const failures = [];
  const expectedHashes = { ...transportHashes, ...expectedTransportHashes };

  if (!existsSync(receipt)) {
    failures.push(`missing intake receipt: ${receipt}`);
  } else {
    const content = readFileSync(receipt, "utf8");
    for (const [name, hash] of Object.entries(expectedHashes)) {
      if (!content.includes(name) || !content.includes(hash)) {
        failures.push(`transport hash is absent or incorrect for ${name}`);
      }
    }
  }

  for (const [relativePath, expectedHash] of Object.entries(sourceMembers)) {
    const source = join(root, ...relativePath.split("/"));
    if (!existsSync(source)) {
      failures.push(`missing admitted source member: ${relativePath}`);
      continue;
    }
    if (sha256(source) !== expectedHash) {
      failures.push(`admitted source member hash mismatch: ${relativePath}`);
    }
  }

  return failures;
}

if (import.meta.url === `file:///${process.argv[1].replaceAll("\\", "/")}`) {
  const failures = validateAssuranceRecoveryIntake();
  const report = {
    requirement_id: "GG-ASSURANCE-EVIDENCE-001",
    result: failures.length === 0 ? "PASS" : "FAIL",
    source_members_verified: Object.keys(sourceMembers).length,
    failures,
  };
  console.log(JSON.stringify(report, null, 2));
  if (failures.length > 0) process.exitCode = 1;
}
