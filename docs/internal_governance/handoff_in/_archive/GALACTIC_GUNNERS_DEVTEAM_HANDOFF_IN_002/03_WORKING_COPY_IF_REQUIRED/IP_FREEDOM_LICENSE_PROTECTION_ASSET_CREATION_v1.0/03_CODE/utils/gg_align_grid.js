// Galactic Gunners — owned utility replacement
// Purpose: deterministic grid coordinate calculation without external helpers.
(function (global) {
  "use strict";
  function point(index, columns, rows, width, height, offsetX, offsetY) {
    if (columns < 1 || rows < 1) throw new Error("columns and rows must be >= 1");
    const col = index % columns;
    const row = Math.floor(index / columns);
    const cellW = width / columns;
    const cellH = height / rows;
    return {
      x: (offsetX || 0) + col * cellW + cellW / 2,
      y: (offsetY || 0) + row * cellH + cellH / 2
    };
  }
  global.GGAlignGrid = Object.freeze({ point });
})(window);
