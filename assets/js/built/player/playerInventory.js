"use strict";

Zon.PlayerInventory = class {
    constructor() {
        this.aether = Variable.BigNumberVar.ZERO(`Aether`);
        this.totalAetherEarned = Variable.BigNumberVar.ZERO(`TotalAetherEarned`);
        this.aetherNodes = new Zon.Item(Zon.ItemType.AetherNode, Struct.BigNumber.ZERO);
        Zon.Setup.preLoadSetupActions.add(this.preLoadSetup);
    }

    preLoadSetup = () => {
        Zon.Setup.preSetLoadedValuesSetupActions.add(this.preSetLoadedValuesSetup);
        for (let itemType = Zon.ItemID.AssemblersStart; itemType <= Zon.ItemID.AssemblersEnd; itemType++) {
            if (!this.assemblersInventory.has(itemType)) {
                this.assemblersInventory.set(itemType, new Zon.Item(itemType, Struct.BigNumber.ZERO));
            }
        }

        Zon.IOManager.registerSaveLoadInfo(Zon.SaveFileTypeID.GAME, this.saveLoadInfo());
    }

    preSetLoadedValuesSetup = () => {
        this.constructAetherNodeProductionRate();
        this.constructAetherNodeVariables();
    }

    //#region Save/Load

    saveLoadInfo = () => {
        const info = new Zon.PlayerInventory.PlayerInventorySaveLoadInfo();
        info.add(Zon.SaveLoadHelper_T.fromVariable(this.aether));
        info.add(Zon.SaveLoadHelper_T.fromVariable(this.totalAetherEarned));
        info.add(this.aetherNodes.saveLoadHelper());
        info.add(this.assemblersInventory.getSaveLoadHelper((item) => item.saveLoadHelper(), Zon.IOManager.commonDataHelper.itemIDBits));
        return info;
    }

    static PlayerInventorySaveLoadInfo = class PlayerInventorySaveLoadInfo extends Zon.SaveLoadInfo {
        constructor() {
            super(Zon.SaveLoadID.INVENTORY);
        }

        write = (writer) => {
            writer.writeUInt32AutoLength(this.elementsInventory.length);
            for (const item of this.elementsInventory) {
                item.write(writer);
            }

            super.write(writer);
        }
        read = (reader) => {
            const length = reader.readUInt32AutoLength();
            this.elementsInventory = [];
            for (let i = 0; i < length; i++) {
                const item = Zon.Item.read(reader);
                this.elementsInventory.push(item);
            }

            super.read(reader);
        }
        get = () => {
            this.elementsInventory = [...Zon.playerInventory.elementsInventory.values()].map((item) => item.toSaveData());
            super.get();
        }
        set = () => {
            for (const item of this.elementsInventory) {
                Zon.playerInventory.elementsInventory.set(item.itemType, item.toItem());
            }

            this.elementsInventory = null;

            super.set();
        }
    }

    //#endregion Save/Load

    //#region Elements

    elementsInventory = new Map();
    get elementsInventoryItems() {
        return this.elementsInventory.values();
    }

    // #endregion Elements

    //#region Aether

    hasEnoughAether = (qty) => {
        return this.aether.greaterThanOrEqual(qty);
    }
    trySpendAether = (qty) => {
        if (this.hasEnoughAether(qty)) {
            this.aether.value = this.aether.value.subtract(qty);
            return true;
        }

        return false;
    }
    receiveAether = (qty) => {
        this.aether.value = this.aether.value.add(qty);
        this.totalAetherEarned.value = this.totalAetherEarned.value.add(qty);
        this.onGainAether.call(qty);
        //console.log(`Received Aether: ${qty}, Total Aether: ${this.aether.value}`);
    }
    onGainAether = new Actions.Action();
    spendAsMuchAetherAsPossible = (aetherToConsume) => {
        if (this.aether.value.lessThanOrEqual(Struct.BigNumber.ZERO))
            return Struct.BigNumber.ZERO;
        
        if (aetherToConsume.lessThanOrEqual(Struct.BigNumber.ZERO))
            return Struct.BigNumber.ZERO;

        if (aetherToConsume.greaterThanOrEqual(this.aether.value)) {
            const spent = this.aether.value;
            this.aether.value = Struct.BigNumber.ZERO;
            return spent;
        }

        this.aether.value = this.aether.value.subtract(aetherToConsume);
        return aetherToConsume;
    }
    trySpendAetherLevelTracker = (levels, costLevelTracker) => {
        const { levelsCanAfford, cost } = costLevelTracker.tryLevelUp(levels, this.aether.value);
        if (levelsCanAfford < 1)
            return 0;

        if (!this.trySpendAether(cost))
            throw new Error(`Failed to Upgrade Enhancement.  TrySpendAether(${levels}, ${costLevelTracker}) returned a cost and levels, but TrySpendAether(${levels}) returned false.`);

        return levelsCanAfford;
    }

    //#endregion Aether

    //#region Update

    update = () => {
        this.updateAetherNodes();
    }

    //#endregion Update

    //#region Aether Nodes

    updateAetherNodes = () => {//TODO: make sure this is working as intented.  Maybe only call this once ever 60 updates when running at fastest speed?
        if (!this.aetherNodes.quantity.value.isPositive) {
            this.aetherNodeTimer.reset();
            return;
        }

        this.aetherNodeTimer.value += Zon.timeController.deltaTimeMilliseconds;
        while (this.aetherNodeTimer.value >= this.aetherNodeInterval.value) {
            this.aetherNodeTimer.value -= this.aetherNodeInterval.value;
            this.receiveAether(this.aetherNodeProductionRate.value);
        }
    }

    constructAetherNodeVariables = () => {
        this.aetherNodeTimer = new Variable.Value(0, `AetherNodeTimer`);
        this.aetherNodeInterval = new Variable.Value(6000, `AetherNodeInterval`);
        this.aetherNodeProductionPercent = new Variable.Dependent(() => this.aetherNodeTimer.value / this.aetherNodeInterval.value, `AetherNodeProductionPercent`, this);
    }

    constructAetherNodeProductionRate = () => {
        this.aetherNodeProductionRate = new Variable.Dependent(() => 
            this.aetherNodes.quantity.value * 
            Zon.AetherBonusManager.aetherBonus.value * 
            Zon.AetherNodePower.totalMultiplier.value *
            Zon.CreationPower.totalMultiplier.value
        , `AetherNodeProductionRate`, this);
    }

    //#endregion Aether Nodes

    //#region Assemblers

    assemblersInventory = new Map();
    getAssembler = (assemblerID) => {
        return this.assemblersInventory.get(assemblerID);
    }

    //#endregion Assemblers

    //#region Items Generic

    receiveItem = (itemType, quantity) => {
        let newItem = true;
        let item = null;
        if (itemType < Zon.ItemID.elementsEnd) {
            newItem = this.reiceveItemToInventory(itemType, quantity, this.elementsInventory, item);
        }
        else if (itemType == Zon.ItemType.AetherNode) {
            item = this.aetherNodes;
            this.aetherNodes.increaseQuantity(quantity);
        }
        else if (itemType >= Zon.ItemID.AssemblersStart && itemType <= Zon.ItemID.AssemblersEnd) {
            newItem = this.reiceveItemToInventory(itemType, quantity, this.assemblersInventory, item);
        }
        else {
            throw new Error(`Unknown item type: ${itemType}`);
        }

        if (item !== null)
            this.onReceiveItem.call(item, newItem, quantity);

        return item;
    }
    onReceiveItem = new Actions.Action();
    reiceveItemToInventory = (itemType, qty, dict, item) => {
        item = dict.get(itemType);
        if (item !== undefined && item !== null) {
            item.increaseQuantity(qty);
            return false;
        }
        else {
            item = new Zon.Item(itemType, qty);
            dict.set(itemType, item);
            return true;
        }
    }
    onCraftItem = new Actions.Action();
    craftItem = (itemType, quantity) => {
        const item = this.receiveItem(itemType, quantity);
        this.onCraftItem.call(item, quantity);
    }
    tryGetItem = (itemType) => {
        if (itemType === Zon.ItemID.NONE) {
            return null;
        }

        if (itemType <= Zon.ItemID.elementsEnd) {
            return this.elementsInventory.get(itemType);
        }
        else if (itemType === Zon.ItemType.AetherNode) {
            return this.aetherNodes;
        }
        else if (itemType >= Zon.ItemID.AssemblersStart && itemType <= Zon.ItemID.AssemblersEnd) {
            return this.assemblersInventory.get(itemType);
        }
        else {
            throw new Error(`Unknown item type: ${itemType}`);
        }
    }

    //#endregion Items Generic

    //#region External

    onReincarnationReset = () => {
        this.elementsInventory.clear();
        for (const assembler of this.assemblersInventory.values()) {
            assembler.quantity.reset();
        }

        this.aetherNodes.quantity.reset();
        this.aether.reset();
        this.totalAetherEarned.reset();
    }

    //#endregion External
}

Zon.playerInventory = new Zon.PlayerInventory();