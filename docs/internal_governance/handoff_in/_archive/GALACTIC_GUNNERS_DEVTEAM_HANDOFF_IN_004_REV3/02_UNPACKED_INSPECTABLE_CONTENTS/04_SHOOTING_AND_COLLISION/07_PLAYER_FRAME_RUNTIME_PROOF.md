# PLAYER FRAME RUNTIME PROOF

REV2 stabilised body contracts but the Founder must not see sprite jumping.

Preferred correction:
derive normalised transparent `496×703` runtime frames from the owned four-frame player source, with the same physical hull anchor in every frame.

Do not stretch artwork.

If another implementation is used, it must prove the same world-space result.

Required proof for:
- idle;
- thrust-up;
- full thrust;
- return.

Capture:
- hull reference point;
- displayed envelope;
- collision body.

Target:
- visual hull-anchor delta = 0 or negligible subpixel tolerance;
- collision body delta = 0;
- no visible jump.
