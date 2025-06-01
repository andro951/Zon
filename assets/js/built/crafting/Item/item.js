"use strict";

Zon.Item = class Item {
    constructor(itemType, quantity) {
        this.itemType = itemType;
        this.quantity = new Variable.TripleVar(quantity);
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
            const quantity = Numbers.Triple.read(reader);
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

/*
public static class AllItemInfo {
	public static Dictionary<ItemType, Color> ItemInfos = new() {
		{ ItemType.Hydrogen, new Color(1f, 1f, 1f, 1f) }, // White
		{ ItemType.Helium, new Color(0.85f, 0.85f, 0.95f, 1f) }, // Pale lavender
		{ ItemType.Lithium, new Color(0.8f, 0.5f, 0.5f, 1f) }, // Dark red
		{ ItemType.Beryllium, new Color(0.76f, 0.87f, 0.78f, 1f) }, // Pale green
		{ ItemType.Boron, new Color(1f, 0.7f, 0.7f, 1f) }, // Light pink
		{ ItemType.Carbon, new Color(0.1f, 0.1f, 0.1f, 1f) }, // Dark gray
		{ ItemType.Nitrogen, new Color(0.1f, 0.1f, 1f, 1f) }, // Blue
		{ ItemType.Oxygen, new Color(1f, 0f, 0f, 1f) }, // Red
		{ ItemType.Fluorine, new Color(0.7f, 1f, 0.7f, 1f) }, // Light green
		{ ItemType.Neon, new Color(0.7f, 0.9f, 1f, 1f) }, // Pale blue
		{ ItemType.Sodium, new Color(0.67f, 0.36f, 0.09f, 1f) }, // Golden yellow
		{ ItemType.Magnesium, new Color(0.75f, 0.75f, 0.75f, 1f) }, // Silver
		{ ItemType.Aluminum, new Color(0.82f, 0.82f, 0.82f, 1f) }, // Light gray
		{ ItemType.Silicon, new Color(0.53f, 0.82f, 0.96f, 1f) }, // Light blue
		{ ItemType.Phosphorus, new Color(1f, 0.5f, 0f, 1f) }, // Orange
		{ ItemType.Sulfur, new Color(1f, 1f, 0.18f, 1f) }, // Yellow
		{ ItemType.Chlorine, new Color(0.12f, 0.94f, 0.12f, 1f) }, // Green
		{ ItemType.Argon, new Color(0.5f, 0.82f, 0.89f, 1f) }, // Light cyan
		{ ItemType.Potassium, new Color(0.56f, 0.25f, 0.83f, 1f) }, // Violet
		{ ItemType.Calcium, new Color(0.24f, 0.24f, 0.35f, 1f) }, // Dark blue
		{ ItemType.Scandium, new Color(0.9f, 0.9f, 0.9f, 1f) }, // Light gray
		{ ItemType.Titanium, new Color(0.75f, 0.76f, 0.77f, 1f) }, // Silvery gray
		{ ItemType.Vanadium, new Color(0.65f, 0.65f, 0.67f, 1f) }, // Light gray
		{ ItemType.Chromium, new Color(0.54f, 0.6f, 0.6f, 1f) }, // Steel gray
		{ ItemType.Manganese, new Color(0.61f, 0.48f, 0.78f, 1f) }, // Light purple
		{ ItemType.Iron, new Color(0.36f, 0.36f, 0.36f, 1f) }, // Dark gray
		{ ItemType.Cobalt, new Color(0.0f, 0.28f, 0.67f, 1f) }, // Blue
		{ ItemType.Nickel, new Color(0.45f, 0.45f, 0.45f, 1f) }, // Dark gray
		{ ItemType.Copper, new Color(0.72f, 0.45f, 0.2f, 1f) }, // Copper
		{ ItemType.Zinc, new Color(0.49f, 0.5f, 0.69f, 1f) }, // Bluish gray
		{ ItemType.Gallium, new Color(0.76f, 0.55f, 0.55f, 1f) }, // Pale red
		{ ItemType.Germanium, new Color(0.43f, 0.55f, 0.55f, 1f) }, // Dark gray
		{ ItemType.Arsenic, new Color(0.74f, 0.5f, 0.89f, 1f) }, // Pale purple
		{ ItemType.Selenium, new Color(0.4f, 0.4f, 0.4f, 1f) }, // Gray
		{ ItemType.Bromine, new Color(0.65f, 0.16f, 0.16f, 1f) }, // Brownish red
		{ ItemType.Krypton, new Color(0.36f, 0.72f, 0.82f, 1f) }, // Light blue
		{ ItemType.Rubidium, new Color(0.67f, 0.36f, 0.09f, 1f) }, // Golden yellow
		{ ItemType.Strontium, new Color(0.0f, 1f, 0.0f, 1f) }, // Bright green
		{ ItemType.Yttrium, new Color(0.58f, 1f, 1f, 1f) }, // Pale cyan
		{ ItemType.Zirconium, new Color(0.58f, 0.88f, 0.88f, 1f) }, // Light cyan
		{ ItemType.Niobium, new Color(0.45f, 0.76f, 0.79f, 1f) }, // Light blue
		{ ItemType.Molybdenum, new Color(0.33f, 0.71f, 0.71f, 1f) }, // Blue-green
		{ ItemType.Technetium, new Color(0.23f, 0.61f, 0.61f, 1f) }, // Dark green
		{ ItemType.Ruthenium, new Color(0.14f, 0.64f, 0.64f, 1f) }, // Cyan
		{ ItemType.Rhodium, new Color(0.04f, 0.46f, 0.46f, 1f) }, // Dark teal
		{ ItemType.Palladium, new Color(0.86f, 0.72f, 0.72f, 1f) }, // Pale pink
		{ ItemType.Silver, new Color(0.75f, 0.75f, 0.75f, 1f) }, // Silver
		{ ItemType.Cadmium, new Color(1f, 0.85f, 0.56f, 1f) }, // Light yellow
		{ ItemType.Indium, new Color(0.65f, 0.45f, 0.45f, 1f) }, // Pale red
		{ ItemType.Tin, new Color(0.58f, 0.58f, 0.58f, 1f) }, // Gray
		{ ItemType.Antimony, new Color(0.45f, 0.55f, 0.55f, 1f) }, // Light gray
		{ ItemType.Tellurium, new Color(0.63f, 0.79f, 0.79f, 1f) }, // Light cyan
		{ ItemType.Iodine, new Color(0.58f, 0.0f, 0.58f, 1f) }, // Violet
		{ ItemType.Xenon, new Color(0.26f, 0.62f, 0.86f, 1f) }, // Light blue
		{ ItemType.Cesium, new Color(0.34f, 0.09f, 0.56f, 1f) }, // Dark purple
		{ ItemType.Barium, new Color(0.0f, 1f, 0f, 1f) }, // Bright green
		{ ItemType.Lanthanum, new Color(0.44f, 0.83f, 1f, 1f) }, // Light blue
		{ ItemType.Cerium, new Color(0.63f, 0.8f, 0.8f, 1f) }, // Light cyan
		{ ItemType.Praseodymium, new Color(0.85f, 1f, 0.78f, 1f) }, // Light green
		{ ItemType.Neodymium, new Color(0.78f, 1f, 0.78f, 1f) }, // Light green
		{ ItemType.Promethium, new Color(0.64f, 0.76f, 0.78f, 1f) }, // Light cyan
		{ ItemType.Samarium, new Color(0.78f, 0.6f, 0.6f, 1f) }, // Pale red
		{ ItemType.Europium, new Color(0.38f, 0.75f, 0.75f, 1f) }, // Light cyan
		{ ItemType.Gadolinium, new Color(0.8f, 0.8f, 0.88f, 1f) }, // Light purple
		{ ItemType.Terbium, new Color(0.19f, 0.83f, 0.78f, 1f) }, // Teal
		{ ItemType.Dysprosium, new Color(0.31f, 0.83f, 0.8f, 1f) }, // Light teal
		{ ItemType.Holmium, new Color(0.64f, 0.83f, 0.78f, 1f) }, // Light green
		{ ItemType.Erbium, new Color(0.7f, 0.56f, 0.83f, 1f) }, // Light purple
		{ ItemType.Thulium, new Color(0.45f, 0.76f, 0.78f, 1f) }, // Light blue
		{ ItemType.Ytterbium, new Color(0.38f, 0.75f, 0.75f, 1f) }, // Light cyan
		{ ItemType.Lutetium, new Color(0.54f, 0.65f, 0.65f, 1f) }, // Light gray
		{ ItemType.Hafnium, new Color(0.3f, 0.76f, 0.76f, 1f) }, // Light teal
		{ ItemType.Tantalum, new Color(0.2f, 0.65f, 0.76f, 1f) }, // Dark teal
		{ ItemType.Tungsten, new Color(0.45f, 0.43f, 0.43f, 1f) }, // Gray
		{ ItemType.Rhenium, new Color(0.28f, 0.63f, 0.63f, 1f) }, // Dark cyan
		{ ItemType.Osmium, new Color(0.35f, 0.35f, 0.43f, 1f) }, // Dark gray
		{ ItemType.Iridium, new Color(0.39f, 0.5f, 0.5f, 1f) }, // Gray
		{ ItemType.Platinum, new Color(0.8f, 0.8f, 0.9f, 1f) }, // Light gray
		{ ItemType.Gold, new Color(1f, 0.84f, 0f, 1f) }, // Gold
		{ ItemType.Mercury, new Color(0.73f, 0.73f, 0.73f, 1f) }, // Silver
		{ ItemType.Thallium, new Color(0.65f, 0.67f, 0.76f, 1f) }, // Light blue
		{ ItemType.Lead, new Color(0.34f, 0.34f, 0.38f, 1f) }, // Dark gray
		{ ItemType.Bismuth, new Color(0.62f, 0.34f, 0.71f, 1f) }, // Pale purple
		{ ItemType.Polonium, new Color(0.67f, 0.67f, 0.67f, 1f) }, // Light gray
		{ ItemType.Astatine, new Color(0.46f, 0.31f, 0.27f, 1f) }, // Dark brown
		{ ItemType.Radon, new Color(0.26f, 0.62f, 0.86f, 1f) }, // Light blue
		{ ItemType.Francium, new Color(0.86f, 0.43f, 0.86f, 1f) }, // Light purple
		{ ItemType.Radium, new Color(0.0f, 1f, 0f, 1f) }, // Bright green
		{ ItemType.Actinium, new Color(0.44f, 0.83f, 1f, 1f) }, // Light blue
		{ ItemType.Thorium, new Color(0.0f, 0.82f, 0.82f, 1f) }, // Teal
		{ ItemType.Protactinium, new Color(0.0f, 0.5f, 0.5f, 1f) }, // Dark teal
		{ ItemType.Uranium, new Color(0.0f, 0.68f, 0.33f, 1f) }, // Dark green
		{ ItemType.Neptunium, new Color(0.58f, 0.65f, 0.65f, 1f) }, // Gray
		{ ItemType.Plutonium, new Color(0.58f, 0.55f, 0.55f, 1f) }, // Gray
		{ ItemType.Americium, new Color(0.46f, 0.43f, 0.67f, 1f) }, // Pale purple
		{ ItemType.Curium, new Color(0.54f, 0.62f, 0.78f, 1f) }, // Light blue
		{ ItemType.Berkelium, new Color(0.33f, 0.76f, 0.76f, 1f) }, // Light teal
		{ ItemType.Californium, new Color(0.31f, 0.74f, 0.76f, 1f) }, // Light teal
		{ ItemType.Einsteinium, new Color(0.33f, 0.76f, 0.76f, 1f) }, // Light teal
		{ ItemType.Fermium, new Color(0.31f, 0.76f, 0.74f, 1f) }, // Light teal
		{ ItemType.Mendelevium, new Color(0.45f, 0.54f, 0.54f, 1f) }, // Light gray
		{ ItemType.Nobelium, new Color(0.45f, 0.54f, 0.54f, 1f) }, // Light gray
		{ ItemType.Lawrencium, new Color(0.45f, 0.54f, 0.54f, 1f) }, // Light gray
		{ ItemType.Rutherfordium, new Color(0.26f, 0.66f, 0.68f, 1f) }, // Dark teal
		{ ItemType.Dubnium, new Color(0.24f, 0.64f, 0.68f, 1f) }, // Dark teal
		{ ItemType.Seaborgium, new Color(0.22f, 0.62f, 0.68f, 1f) }, // Dark teal
		{ ItemType.Bohrium, new Color(0.2f, 0.6f, 0.68f, 1f) }, // Dark teal
		{ ItemType.Hassium, new Color(0.18f, 0.58f, 0.68f, 1f) }, // Dark teal
		{ ItemType.Meitnerium, new Color(0.16f, 0.56f, 0.68f, 1f) }, // Dark teal
		{ ItemType.Darmstadtium, new Color(0.14f, 0.54f, 0.68f, 1f) }, // Dark teal
		{ ItemType.Roentgenium, new Color(0.12f, 0.52f, 0.68f, 1f) }, // Dark teal
		{ ItemType.Copernicium, new Color(0.1f, 0.5f, 0.68f, 1f) }, // Dark teal
		{ ItemType.Nihonium, new Color(0.9f, 0.44f, 0.76f, 1f) }, // Light purple
		{ ItemType.Flerovium, new Color(0.8f, 0.35f, 0.74f, 1f) }, // Purple
		{ ItemType.Moscovium, new Color(0.7f, 0.3f, 0.72f, 1f) }, // Dark purple
		{ ItemType.Livermorium, new Color(0.6f, 0.26f, 0.7f, 1f) }, // Dark purple
		{ ItemType.Tennessine, new Color(0.5f, 0.2f, 0.68f, 1f) }, // Dark purple
		{ ItemType.Oganesson, new Color(0.4f, 0.18f, 0.66f, 1f) }, // Dark purple
		{ ItemType.AetherNode, CoreOfCreation.CoreOfCreationColor }

	};
	private static Dictionary<ItemType, ItemType> SharedSprites {
		get {
			if (sharedSprites == null) {
				sharedSprites = new() {

				};

				for (ItemType type = ItemType.Hydrogen + 1; type <= ItemID.ElementsEnd; type++) {
					sharedSprites.Add(type, ItemType.Hydrogen);
				}
			}

			return sharedSprites;
		}
	}
	private static Dictionary<ItemType, ItemType> sharedSprites = null;

	private static Dictionary<ItemType, (Sprite, Color)> ItemIcons = new();
	public static (Sprite, Color) GetItemIcon(Item item) => GetItemIcon(item.ItemType);
	public static (Sprite, Color) GetItemIcon(ItemType itemType) {
		if (SharedSprites.TryGetValue(itemType, out ItemType sharedItemType)) {
			itemType = sharedItemType;
		}

		if (!ItemIcons.TryGetValue(itemType, out (Sprite, Color) result)) {
			switch (itemType) {
				case ItemType when itemType <= ItemType.None:
					return (null, Color.white);
			}

			Sprite sprite = IOManager.LoadItemSprite(itemType.ToString());
			if (sprite == null)
				return GetDefaultItemIcon();

			result = (sprite, GetItemColor(itemType));
			ItemIcons.Add(itemType, result);
		}

		return result;
	}
	private static (Sprite, Color) GetDefaultItemIcon() {
		if (!ItemIcons.TryGetValue(ItemType.Default, out (Sprite, Color) defaultIcon)) {
			defaultIcon = (IOManager.LoadItemSprite("DefaultIcon"), Color.white);
			ItemIcons.Add(ItemType.Default, defaultIcon);
		}

		return defaultIcon;
	}

	public static Triple GetCraftingAttunementProgress(ItemType itemType) {
		return itemType switch {

			_ => Triple.One
		};
	}
	internal static Color GetItemColor(ItemType itemType) {
		if (ItemInfos.TryGetValue(itemType, out Color color))
			return color;

		return Color.white;
	}
	internal static string GetDescription(ItemType itemType) => itemType switch {//TODO: populate descriptions
		_ => ""
	};
}
*/

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
                return Struct.Triple.ONE;
        }
    }

    static getItemDescription(itemType) {
        switch (itemType) {
            default:
                return "";
        }
    }
}