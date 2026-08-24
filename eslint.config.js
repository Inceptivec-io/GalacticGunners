const js = require("@eslint/js");

module.exports = [
  {
    ignores: ["assets/js/phaser.js", "assets/js/utils/*.js"]
  },
  js.configs.recommended,
  {
    files: ["assets/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: {
        Phaser: "readonly",
        Align: "readonly",
        AlignGrid: "readonly",
        window: "readonly",
        document: "readonly",
        console: "readonly",
        Entity: "readonly",
        Background: "readonly",
        Player: "readonly",
        PlayerLaser: "readonly",
        Nuke: "readonly",
        Explosion: "readonly",
        NukeExplosion: "readonly",
        AlienMothership: "readonly",
        AlienScout: "readonly",
        Enemy: "readonly",
        EnemyCruiser: "readonly",
        EnemyLaser: "readonly",
        EnemyMotherShipLaser: "readonly",
        Asteroid: "readonly",
        Comet: "readonly",
        ShieldTile: "readonly"
      }
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-redeclare": "off",
      "no-case-declarations": "off"
    }
  },
  {
    files: ["tools/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        URL: "readonly",
        setTimeout: "readonly",
        __dirname: "readonly",
        WebSocket: "readonly"
      }
    },
    rules: {
      "no-undef": "off"
    }
  }
];
