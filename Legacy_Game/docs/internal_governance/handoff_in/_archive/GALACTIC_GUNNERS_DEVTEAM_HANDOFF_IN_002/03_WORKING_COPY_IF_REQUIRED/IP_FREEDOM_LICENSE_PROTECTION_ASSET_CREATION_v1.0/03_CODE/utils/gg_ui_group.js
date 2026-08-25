// Galactic Gunners — owned utility replacement
// Purpose: minimal grouping of Phaser display objects for shared state changes.
(function (global) {
  "use strict";
  class GGUiGroup {
    constructor() { this.children = []; }
    add(child) { if (child) this.children.push(child); return child; }
    setVisible(value) {
      this.children.forEach((child) => { child.visible = value; });
      return this;
    }
    setAlpha(value) {
      this.children.forEach((child) => { child.alpha = value; });
      return this;
    }
    setScrollFactor(value) {
      this.children.forEach((child) => {
        if (typeof child.setScrollFactor === "function") child.setScrollFactor(value);
      });
      return this;
    }
    destroy() {
      this.children.forEach((child) => {
        if (child && typeof child.destroy === "function") child.destroy();
      });
      this.children = [];
    }
  }
  global.GGUiGroup = GGUiGroup;
})(window);
