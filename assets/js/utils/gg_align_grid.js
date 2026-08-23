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

class AlignGrid {
  constructor(config) {
    this.config = config;
    if (!config.scene) {
      console.log("missing scene");
      return;
    }
    if (!config.rows) config.rows = 5;
    if (!config.cols) config.cols = 5;
    if (!config.height) config.height = game.config.height;
    if (!config.width) config.width = game.config.width;

    this.scene = config.scene;
    this.cw = config.width / config.cols;
    this.ch = config.height / config.rows;
  }

  show() {
    this.graphics = this.scene.add.graphics();
    this.graphics.lineStyle(2, 0xff0000);

    for (var i = 0; i < this.config.width; i += this.cw) {
      this.graphics.moveTo(i, 0);
      this.graphics.lineTo(i, this.config.height);
    }

    for (var j = 0; j < this.config.height; j += this.ch) {
      this.graphics.moveTo(0, j);
      this.graphics.lineTo(this.config.width, j);
    }

    this.graphics.strokePath();
  }

  placeAt(xx, yy, obj) {
    obj.x = this.cw * xx + this.cw / 2;
    obj.y = this.ch * yy + this.ch / 2;
  }

  placeAtIndex(index, obj) {
    var yy = Math.floor(index / this.config.cols);
    var xx = index - yy * this.config.cols;
    this.placeAt(xx, yy, obj);
  }

  showNumbers() {
    this.show();
    var count = 0;
    for (var i = 0; i < this.config.rows; i++) {
      for (var j = 0; j < this.config.cols; j++) {
        var numText = this.scene.add.text(0, 0, count, { color: "#ff0000" });
        numText.setOrigin(0.5, 0.5);
        this.placeAtIndex(count, numText);
        count++;
      }
    }
  }
}
