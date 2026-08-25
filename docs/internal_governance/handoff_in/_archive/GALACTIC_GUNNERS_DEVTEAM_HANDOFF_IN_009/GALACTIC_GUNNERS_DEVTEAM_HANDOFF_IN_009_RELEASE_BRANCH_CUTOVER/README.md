# GALACTIC GUNNERS — HANDOFF 009

Step 6 — Release Branch Establishment and Main-to-Prod Cutover.

One bounded sprint.

Permanent branch model:

`feature/* -> dev -> stage -> prod`

`prod` replaces `main` as the repository default/release branch.

`main` is deleted only after lineage, default-branch, CI and recovery gates pass.

v1.0 gameplay does not begin in this sprint.
