// Galactic Gunners — owned utility replacement
// Purpose: minimal object alignment helper used by the commercial product.
(function (global) {
  "use strict";
  function alignCenter(gameObject, width, height) {
    gameObject.x = width / 2;
    gameObject.y = height / 2;
    return gameObject;
  }
  function alignTo(gameObject, x, y) {
    gameObject.x = x;
    gameObject.y = y;
    return gameObject;
  }
  global.GGAlign = Object.freeze({ alignCenter, alignTo });
})(window);
