"use strict";

Zon.StageID = {
    MONSTERS_WILD_CREATURES: 0,
    BUGS: 1,
    MONSTERS_ASSORTED_LV2: 2,
    MONSTERS_UNDEAD: 3,
    ARMOR: 4,
    MONSTERS_ASSORTED_LV3: 5,
    MONSTERS_ASSORTED_LV4: 6,
    MONSTERS_MAGES: 7,
    HELMETS: 8,
    MONSTERS_DEMONS: 9,
};
Zon.StageIDNames = [];
Enum.createEnum(Zon.StageID, Zon.StageIDNames);

Zon.LevelData = class LevelData {
    static maxStage = Zon.StageID.COUNT - 1;
    static maxStageNum = 10;
    static startingStage = Zon.StageID.MONSTERS_WILD_CREATURES;
    static startingStageNum = 1;
    static startingStageDisplayedNum = 1;
    static stageCompletionAetherBonusStageMultiplier = 2;
    static baseStageCompletionAetherBonus = Struct.BigNumber.ONE;
    static baseBlockHealth = Struct.BigNumber.ONE;
    static {
        this.getStageIndex = function(stageID, stageNum) {
            return (stageID - this.startingStage) * this.maxStageNum + stageNum - this.startingStageNum;
        };

        this.maxStageDisplayedNum = this.getDisplayedStageNum(this.maxStage, this.maxStageNum);
        this.stageCompletionAetherBonusPerPrestige = this.maxStageDisplayedNum;
        this.maxStageIndex = this.getStageIndex(this.maxStage, this.maxStageNum);
        this.stageCount = this.maxStageIndex + 1;
        Zon.Setup.preLoadSetupActions.add(this.preLoadSetup.bind(this));
    }
    
    constructor(stageID, stageNum, textureName, blockHP, blockMaxHealth, stageDuration) {
        this.stageID = stageID;
        this.stageNum = stageNum;
        this.blockHP = blockHP;
        this.stageDuration = stageDuration;
        this.textureName = textureName;
        this.setup();
        this.blockMaxHealth = blockMaxHealth ?? Zon.LevelData.getBlockMaxHealth(this.displayedStageNum);
        if (Zon.LevelData.allLevelTextures) {
            this._setTexture();
        }
        else {
            Zon.LevelData._postLoadTexturesActions.add(this._setTexture);
        }
    }

    static createNew(stageID, stageNum) {
        const blockHP = null;
        const stageDuration = 0;
        const textureName = this.getRandomPngFile(stageID);
        const blockMaxHealth = null;
        return new Zon.LevelData(stageID, stageNum, textureName, blockHP, blockMaxHealth, stageDuration);
    }

    static preLoadSetup() {
        const stageNum = `stageNum`;
        const maxStageNum = `maxStageNum`;
        const constants = [
            [maxStageNum, `${this.maxStageDisplayedNum}`]
        ];
        const args = [
            new Zon.Type_N(stageNum),
        ];
        const effStageNum = `effStageNum`;
        this.effStageNumEquation = Zon.Equation_N.create(effStageNum, `${stageNum} + ${Zon.GlobalVarNames.PRESTIGE_COUNT} * ${maxStageNum}`, [], args, constants);
        const healthPow = `healthPow`;
        this.blockHealthPowEquation = Zon.Equation_N.create(healthPow, `3 * (2^(${effStageNum} / 10) - 1)`, [], args, constants, [this.effStageNumEquation]);
        this.blockMaxHealthEquation = Zon.Equation_BN.create(`baseBlockHealth`, `10^${healthPow}`, [], args, constants, [this.effStageNumEquation, this.blockHealthPowEquation]);
        this.getBlockMaxHealth = this.blockMaxHealthEquation.getValue;

        const aetherBonusPow = `stageCompletionAetherBonusPow`;
        this.stageCompletionAetherBonusPowEquation = Zon.Equation_N.create(aetherBonusPow, `3 * (2^(${effStageNum} / 10) - 1) + ${effStageNum} / 10`, [], args, constants, [this.effStageNumEquation]);

        this.stageCompletionAetherBonusEquation = Zon.Equation_BN.create(`stageCompletionAetherBonus`, `10^${aetherBonusPow}`, [], args, constants, [this.effStageNumEquation, this.stageCompletionAetherBonusPowEquation]);
        this.getStageCompletionBaseAetherReward = this.stageCompletionAetherBonusEquation.getValue
    }

    // static getBlockMaxHealth(displayedStageNum, prestigeCount) {
    //     //return Zon.LevelData.baseBlockHealth.multiplyByPow10(displayedStageNum + this.maxStageDisplayedNum * prestigeCount);//.tryBumpDown();
    //     return Zon.LevelData.baseBlockHealth.multiplyByPow10(3 * (2 ** ((displayedStageNum + this.maxStageDisplayedNum * prestigeCount) / 10) - 1));//.tryBumpDown();
    // }

    // static getStageCompletionBaseAetherReward(displayedStageNum, prestigeCount) {
    //     //return Zon.LevelData.baseStageCompletionAetherBonus.multiplyByPow10((displayedStageNum + this.maxStageDisplayedNum * prestigeCount) / 2);
    //     const stageCount = displayedStageNum + this.maxStageDisplayedNum * prestigeCount;
    //     return Zon.LevelData.baseStageCompletionAetherBonus.multiplyByPow10(3 * (2 ** (stageCount / 10) - 1) + stageCount / 10);
    // }

    setup = () => {
        this.displayedStageNum = Zon.LevelData.getDisplayedStageNum(this.stageID, this.stageNum);
        this.stageIndex = Zon.LevelData.getStageIndex(this.stageID, this.stageNum);
    }

    update = () => {
        this.stageDuration += Time.TimeController.deltaTime;
    }

    get isMaxStage() {
        return this.stageID == Zon.LevelData.maxStage && this.stageNum == Zon.LevelData.maxStageNum;
    }

    get isStartingStage() {
        return this.stageID == Zon.LevelData.startingStage && this.stageNum == Zon.LevelData.startingStageNum;
    }

    static getStageToReturnToStage1Index() {
        return Zon.LevelData.displayedStageNumToStageIndex(Zon.Settings.stageToReturnToStage1.value);
    }

    get levelName() {
        return this.imgName();
    }

    static getRandomPngFile = (stageID) => {
        const textures = Zon.LevelData.allLevelTextures[Zon.StageIDNames[stageID]];
        const keys = Object.keys(textures);
        const randomIndex = Math.floor(Math.random() * keys.length);
        return keys[randomIndex];
    }

    _setTexture = () => {
        const textures = Zon.LevelData.allLevelTextures[Zon.StageIDNames[this.stageID]];
        this.imageWrapper = textures[this.textureName];
        this.forwardMethodsFrom(this.imageWrapper, !!this.imgName);//Ignore duplicates error if this.imgName is already defined.  !! is to cast to boolean.
    }

    toString = () => {
        return `LevelData; ID: ${this.stageID}, Width: ${this.width()}, Height: ${this.height()}, LevelName: ${this.levelName}`;
    }

    giveLevelRewards = () => {
        this.giveResourceRewards();
        this.givePostResourceRewards();
    }

    static getStageCompletionAetherReward(displayedStageIndex, prestigeCount) {
        const stageCompletionAetherBonus = Zon.LevelData.getStageCompletionBaseAetherReward(displayedStageIndex, prestigeCount);
        const finalStageCompletionAetherBonus = stageCompletionAetherBonus.multiply(Zon.AetherBonusManager.aetherBonus.value);
        if (finalStageCompletionAetherBonus.isNegative) {
            throw new Error(`finalStageCompletionAetherBonus is negative: ${finalStageCompletionAetherBonus}`);
        }

        return finalStageCompletionAetherBonus;
    }

    get aetherStageCompletionReward() {
        return Zon.LevelData.getStageCompletionAetherReward(this.displayedStageNum, Zon.game.prestigeCount);
    }

    giveResourceRewards = () => {
        Zon.playerInventory.receiveAether(this.aetherStageCompletionReward);
    }

    givePostResourceRewards = () => {
        Zon.StageBonusManager.onCompleteStage(this);
    }

    static getStageName(stageID, stageNum) {
        return `${this.getDisplayedStageNum(stageID, stageNum)}`;
    }

    static getDisplayedStageNum(stageID, stageNum) {
        return this.getStageIndex(stageID, stageNum) + this.startingStageDisplayedNum;
    }

    static toStageIDAndNum(displayedStageIndex) {
        const stageID = Math.floor(displayedStageIndex / this.maxStageNum) + this.startingStage;
        const stageNum = displayedStageIndex % this.maxStageNum + this.startingStageNum;
        return { stageID, stageNum };
    }

    static displayedStageNumToStageIndex(displayedStageNum) {
        return displayedStageNum - this.startingStageDisplayedNum;
    }

    static allLevelTextures;
    static _postLoadTexturesActions = new Actions.Action();
    static postLoadTextures() {
        Zon.LevelData.allLevelTextures = Zon.allTextures[Zon.TextureFolders.levels];
        this._postLoadTexturesActions.callAndClear();
    }

    saveLoadHelper() {
        return new Zon.LevelDataSaveLoadHelper(this);
    }

    static AllLevelDataSaveLoadHelper = class AllLevelDataSaveLoadHelper {
        constructor() {
            this.levelDataCount = Number.MAX_SAFE_INTEGER;
            this.levelDataSaveLoadHelpers = [];
            for (let i = 0; i < Zon.LevelData.stageCount; i++) {
                this.levelDataSaveLoadHelpers.push(new Zon.LevelData.LevelDataSaveLoadHelper(i));
            }
        }
        get = () => {
            if (this.levelDataCount !== Number.MAX_SAFE_INTEGER)
                throw new Error(`AllLevelDataSaveLoadHelper.Get(); Failed because levelDataCount != uint.MaxValue; end: ${this.levelDataCount}`);

            for (let i = 0; i < Zon.LevelData.stageCount; i++) {
                this.levelDataSaveLoadHelpers[i].get();
            }
        }
        set = () => {
            if (this.levelDataCount === Number.MAX_SAFE_INTEGER) {
                console.warn(`AllLevelDataSaveLoadHelper.Set(); Failed because levelDataCount == uint.MaxValue; end: ${this.levelDataCount}.  This should only happen when upgrading from an old save version that didn't include level data.`);
                return;
            }

            for (let i = 0; i < Zon.LevelData.stageCount; i++) {
                this.levelDataSaveLoadHelpers[i].set();
            }

            this.levelDataCount = Number.MAX_SAFE_INTEGER;
        }
        write = (writer) => {
            if (this.levelDataCount !== Number.MAX_SAFE_INTEGER)
                throw new Error(`AllLevelDataSaveLoadHelper.Write(); Failed because levelDataCount != uint.MaxValue; end: ${this.levelDataCount}`);

            this.levelDataCount = this.levelDataSaveLoadHelpers.filter(helper => helper.hasData).length;
            const stageIndexBits = Zon.IOManager.commonDataHelper.stageIndexBits.value;
            writer.writeUInt32(this.levelDataCount, stageIndexBits);
            let writtenCount = 0;
            for (let i = 0; i < Zon.LevelData.stageCount; i++) {
                const helper = this.levelDataSaveLoadHelpers[i];
                if (!helper.hasData)
                    continue;

                writer.writeUInt32(i, stageIndexBits);
                helper.write(writer);
                writtenCount++;
            }

            if (writtenCount !== this.levelDataCount)
                throw new Error(`AllLevelDataSaveLoadHelper.Write(); Failed because writtenCount != levelDataCount; writtenCount: ${writtenCount}, levelDataCount: ${this.levelDataCount}`);

            this.levelDataCount = Number.MAX_SAFE_INTEGER;
        }
        read = (reader) => {
            if (this.levelDataCount !== Number.MAX_SAFE_INTEGER)
                throw new Error(`AllLevelDataSaveLoadHelper.Read(); Failed because levelDataCount != uint.MaxValue; end: ${this.levelDataCount}`);

            const stageIndexBits = Zon.IOManager.commonDataHelper.stageIndexBits.value;
            this.levelDataCount = reader.readUInt32(stageIndexBits);
            for (let i = 0; i < this.levelDataCount; i++) {
                const index = reader.readUInt32(stageIndexBits);
                this.levelDataSaveLoadHelpers[index].read(reader);
            }
        }
    }

    static LevelDataSaveLoadHelper = class LevelDataSaveLoadHelper {
        constructor(index) {
            this.index = index;
            this.levelData = null;
            this.hasData = false;
        }
        
        _setLevelData = () => {
            this.levelData = Zon.game.levelDatas[this.index];
        }
        _clearLevelData = () => {
            this.levelData = null;
        }
        get = () => {
            this._setLevelData();
            if (this.levelData == null)
                return;

            this.stageID = this.levelData.stageID;
            this.stageNum = this.levelData.stageNum;
            this.textureName = this.levelData.textureName;
            this.stageDuration = this.levelData.stageDuration;
            this.blockMaxHealth = this.levelData.blockMaxHealth.clone;
            this.width = this.levelData.width();
            this.height = this.levelData.height();
            this.blockHP = Array.from(this.levelData.blockHP);
            this.hasData = true;

            this._clearLevelData();
        }
        set = () => {
            if (!this.hasData)
                return;

            Zon.game.levelDatas[this.index] = new Zon.LevelData(this.stageID, this.stageNum, this.textureName, this.blockHP, this.blockMaxHealth, this.stageDuration);
            this._reset();
        }
        write = (writer) => {
            writer.writeUInt32(this.stageID, Zon.IOManager.commonDataHelper.stageBits.value);
            writer.writeUInt32(this.stageNum, Zon.IOManager.commonDataHelper.stageNumBits.value);
            writer.writeString(this.textureName);
            this.blockMaxHealth.write(writer);
            writer.writeUInt32(this.width - 1, Zon.IOManager.commonDataHelper.levelDataImageWidthBits.value);
            writer.writeUInt32(this.height - 1, Zon.IOManager.commonDataHelper.levelDataImageHeightBits.value);
            const blockIndexBits = (this.width * this.height - 1).bitLength32();
            writer.writeUInt32AutoLength(blockIndexBits);
            const blocksToWrite = [];
            const zeroBlocks = [];
            for (let i = 0; i < this.blockHP.length; i++) {
                const blockHP = this.blockHP[i];
                if (blockHP !== null) {
                    if (blockHP.isZero) {
                        zeroBlocks.push(i);
                    }
                    else {
                        blocksToWrite.push(i);
                    }
                }
            }

            writer.writeUInt32(blocksToWrite.length, blockIndexBits);
            for (const blockIndex of blocksToWrite) {
                if (zonDebug) {
                    if (this.blockHP[blockIndex].equals(this.blockMaxHealth))
                        throw new Error(`Writing a blocks hp when it's max; blockIndex: ${blockIndex}. This should not happen.`);
                }

                writer.writeUInt32(blockIndex, blockIndexBits);
                this.blockHP[blockIndex].write(writer);
            }

            writer.writeUInt32(zeroBlocks.length, blockIndexBits);
            for (const blockIndex of zeroBlocks) {
                writer.writeUInt32(blockIndex, blockIndexBits);
            }

            this._reset();
        }
        read = (reader) => {
            this.stageID = reader.readUInt32(Zon.IOManager.commonDataHelper.stageBits.value);
            this.stageNum = reader.readUInt32(Zon.IOManager.commonDataHelper.stageNumBits.value);
            this.textureName = reader.readString();
            this.blockMaxHealth = Struct.BigNumber.read(reader);
            this.width = reader.readUInt32(Zon.IOManager.commonDataHelper.levelDataImageWidthBits.value) + 1;
            this.height = reader.readUInt32(Zon.IOManager.commonDataHelper.levelDataImageHeightBits.value) + 1;
            const blockIndexBits = reader.readUInt32AutoLength();
            const pixelsCount = this.width * this.height;
            this.blockHP = new Array(pixelsCount).fill(null);

            const blockCount = reader.readUInt32(blockIndexBits);
            for (let i = 0; i < blockCount; i++) {
                const blockIndex = reader.readUInt32(blockIndexBits);
                const blockHP = Struct.BigNumber.read(reader);
                this.blockHP[blockIndex] = blockHP;
            }

            const zeroBlockCount = reader.readUInt32(blockIndexBits);
            for (let i = 0; i < zeroBlockCount; i++) {
                const blockIndex = reader.readUInt32(blockIndexBits);
                this.blockHP[blockIndex] = Struct.BigNumber.ZERO;
            }

            this.hasData = true;
        }
        _reset = () => {
            this.stageID = null;
            this.stageNum = null;
            this.stageDuration = null;
            this.textureName = null;
            this.blockHP = null;
            this.blockMaxHealth = null;
            this.hasData = false;
        }
    }
}