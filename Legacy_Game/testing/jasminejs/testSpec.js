describe("Global Variables", function () {

    it("should return 0", function () {
        expect(LevelRestart).toBe(0);
    });

    it("should return 100", function () {
        expect(nukeScore).toBe(100);
    });

    it("should return false", function () {
        expect(isMuted).toBe(false);
    });

    it("should return maxlives 3", function () {
        expect(maxLives).toBe(3);
    });

    it("should return lives 3", function () {
        expect(currentLives).toBe(0);
    });

    it("should return nukes 2", function () {
        expect(currentNukes).toBe(2);
    });

    it("should return undefined", function () {
        expect(particles).toBe(undefined);
    });

});
describe("Config", function () {

    it("should return black", function () {
        expect(config.backgroundColor).toBe('black');
    });

    it("should return arcade", function () {
        expect(config.physics.default).toBe('arcade');
    });

    it("should return debug is false", function () {
        expect(config.physics.arcade.debug).toBe(false);
    });

    it("should return window width", function () {
        expect(config.width).toBe(window.innerWidth * window.devicePixelRatio);
    });

    it("should return window height", function () {
        expect(config.height).toBe(window.innerHeight * window.devicePixelRatio);
    });

    it("should return gravity x to be 0", function () {
        expect(config.physics.arcade.gravity.x).toBe(0);
    });

    it("should return gravity y to be 0", function () {
        expect(config.physics.arcade.gravity.y).toBe(0);
    });

    it("should return Preloader", function () {
        expect(config.scene[0].name).toBe("Preloader");
    });

    it("should return MainMenu", function () {
        expect(config.scene[1].name).toBe("MainMenu");
    });

    it("should return Info", function () {
        expect(config.scene[2].name).toBe("Info");
    });

    it("should return Level1", function () {
        expect(config.scene[3].name).toBe("Level1");
    });

    it("should return Level2", function () {
        expect(config.scene[4].name).toBe("Level2");
    });

    it("should return BossLevel", function () {
        expect(config.scene[5].name).toBe("BossLevel");
    });

    it("should return Victory", function () {
        expect(config.scene[6].name).toBe("Victory");
    });

    it("should return Titles", function () {
        expect(config.scene[7].name).toBe("Titles");
    });

    it("should return Paused", function () {
        expect(config.scene[8].name).toBe("Paused");
    });

});

describe("basic functions", function () {

 beforeEach(() => {
        currentLives = maxLives;
    });

    it("should return 10", function () {
        expect(config.scene[3].prototype.addScore(enemyValue)).toBe(score = 10);
    });

    it("should return 2", function () {
        expect(config.scene[3].prototype.loseLives(enemyHitStrength)).toBe(currentLives = 2);
    });

});
