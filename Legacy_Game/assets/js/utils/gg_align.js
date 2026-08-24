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

class Align {
  static scaleToGameW(obj, per) {
    obj.displayWidth = game.config.width * per;
    obj.scaleY = obj.scaleX;
  }

  static centerH(obj) {
    obj.x = game.config.width / 2 - obj.displayWidth / 2;
  }

  static centerV(obj) {
    obj.y = game.config.height / 2 - obj.displayHeight / 2;
  }

  static center2(obj) {
    obj.x = game.config.width / 2 - obj.displayWidth / 2;
    obj.y = game.config.height / 2 - obj.displayHeight / 2;
  }

  static center(obj) {
    obj.x = game.config.width / 2;
    obj.y = game.config.height / 2;
  }
}
