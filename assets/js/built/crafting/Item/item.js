"use strict";

Zon.Item = class Item {
    constructor(itemType, quantity) {
        this.itemType = itemType;
        this.quantity = new Variable.BigNumberVar(quantity);
        this.name = Zon.ItemID.getName(itemType);
    }

    static nullOrNone(item) {
        return item === null || item === undefined || item.itemType === Zon.ItemID.NONE || !item.quantity.isPositive;
    }

    get description() {
        return Zon.AllItemsInfo.getDescription(this.itemType);
    }
    get craftingAttunementProgress() {
        return Zon.AllItemsInfo.getCraftingAttunementProgress(this.itemType);
    }
    get icon() {
        return Zon.AllItemsInfo.getItemIcon(this.itemType);
    }
    get color() {
        return Zon.AllItemsInfo.getItemColor(this.itemType);
    }
    saveLoadHelper() {
        return Zon.Item.ItemSaveLoadHelper.fromItem(this);
    }
    static saveLoadHelperFromGetter(itemGetter) {
        return new Zon.Item.ItemSaveLoadHelper(itemGetter);
    }

    static ItemSaveLoadHelper = class ItemSaveLoadHelper {
        constructor(itemGetter) {
			//if itemGetter is not a function, throw an error
			if (typeof itemGetter !== 'function')
				throw new TypeError("itemGetter must be a function that returns an item");
			
            this.itemGetter = itemGetter;
        }

        static fromItem(item) {
            return new Zon.Item.ItemSaveLoadHelper(() => item);
        }
        
        write = (writer) => {
            this.itemData.write(writer);
        }
        read = (reader) => {
            this.itemData = Zon.Item.ItemSaveData.read(reader);
        }
        get = () => {
            this.itemData = Zon.Item.ItemSaveData.fromItem(this.itemGetter());
        }
        set = () => {
            this.itemData.setItemData(this.itemGetter());
        }
    }

    toSaveData() {
        return Zon.Item.ItemSaveData.fromItem(this);
    }
    static ItemSaveData = class ItemSaveData {
        constructor(itemType, quantity) {
            this.itemType = itemType;
            this.quantity = quantity.clone;
        }

        static fromItem(item) {
            return new Zon.Item.ItemSaveData(item.itemType, item.quantity.value);
        }

        static read(reader) {
            const bits = Zon.IOManager.commonDataHelper.itemIDBits.value;
            const itemType = reader.readUInt32(bits);
            const quantity = Struct.BigNumber.read(reader);
            return new Zon.Item.ItemSaveData(itemType, quantity);
        }

        write(writer) {
            const bits = Zon.IOManager.commonDataHelper.itemIDBits.value;
            writer.writeUInt32(this.itemType, bits);
            this.quantity.write(writer);
        }

        toItem() {
            return new Zon.Item(this.itemType, this.quantity);
        }

        setItemData(item) {
            if (item.itemType !== this.itemType)
                throw new Error(`ItemSaveData.setItemData(${item}) Item type mismatch; item.itemType: ${item.itemType}, this.itemType: ${this.itemType}`);

            item.setQuantity(this.quantity);
        }

        toString() {
            return `${Zon.ItemID.getName(this.itemType)} (${this.itemType}): ${this.quantity.toString()}`;
        }
    }

    toString() {
        return `${this.name} (${this.itemType}): ${this.quantity.toString()}`;
    }

    increaseQuantity(qty) {
        this.quantity.value = this.quantity.value.add(qty);
    }
    setQuantity(qty) {
        this.quantity.value = qty;
    }
}

Zon.AllItemInfo = class AllItemsInfo {
    static itemInfos = [
        Struct.Color.fromUInt(0xFFFFFFFF),//White
        Struct.Color.fromUInt(0xD9D9F2FF),//Pale lavender
        Struct.Color.fromUInt(0xCC8080FF),//Dark red
        Struct.Color.fromUInt(0xC2E0C9FF),//Pale green
        Struct.Color.fromUInt(0xFFB2B2FF),//Light pink
        Struct.Color.fromUInt(0x191919FF),//Dark gray
        Struct.Color.fromUInt(0x1919FFFF),//Blue
        Struct.Color.fromUInt(0xFF0000FF),//Red
        Struct.Color.fromUInt(0xB2FFB2FF),//Light green
        Struct.Color.fromUInt(0xB2E6FFFF),//Pale blue
        Struct.Color.fromUInt(0xAB5C17FF),//Golden yellow
        Struct.Color.fromUInt(0xC0C0C0FF),//Silver
        Struct.Color.fromUInt(0xD1D1D1FF),//Light gray
        Struct.Color.fromUInt(0x88D1F6FF),//Light blue
        Struct.Color.fromUInt(0xFF7F00FF),//Orange
        Struct.Color.fromUInt(0xFFFF2D2D),//Yellow
        Struct.Color.fromUInt(0x1FEE1FFF),//Green
        Struct.Color.fromUInt(0x7FB2E2FF),//Light cyan
        Struct.Color.fromUInt(0x8F40D2FF),//Violet
        Struct.Color.fromUInt(0x3E3E59FF),//Dark blue
        Struct.Color.fromUInt(0xE6E6E6FF),//Light gray
        Struct.Color.fromUInt(0xC0C0C0FF),//Silvery gray
        Struct.Color.fromUInt(0xA6A6A6FF),//Light gray

    ];

    static getItemColor(itemType) {
        if (itemType >= 0 && itemType < this.itemInfos.length)
            return this.itemInfos[itemType];
            
        return Struct.Color.fromUInt(0xFFFFFFFF);
    }

    static getCraftingAttunementProgress(itemType) {
        switch (itemType) {
            default:
                return Struct.BigNumber.ONE;
        }
    }

    static getItemDescription(itemType) {
        switch (itemType) {
            default:
                return "";
        }
    }
}