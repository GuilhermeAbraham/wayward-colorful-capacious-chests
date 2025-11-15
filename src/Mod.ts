import { doodadDescriptions } from "@wayward/game/game/doodad/Doodads";
import { DoodadType, IDoodadDescription } from "@wayward/game/game/doodad/IDoodad";
import { ActionType } from "@wayward/game/game/entity/action/IAction";
import { IItemDescription, ItemType, ItemTypeGroup } from "@wayward/game/game/item/IItem";
import { itemDescriptions, RecipeComponent } from "@wayward/game/game/item/ItemDescriptions";
import Mod from "@wayward/game/mod/Mod";
import Register, { Registry } from "@wayward/game/mod/ModRegistry";
import { Tuple } from "@wayward/utilities/collection/Tuple";

enum Colors {
    Black,
    White,
    Red,
    Yellow,
    Blue,
    Green,
    Orange,
    Purple,
}

// Enum for chest types, ordered by tier
enum ChestType {
    Wooden,
    Tin,
    OrnateWooden,
    Copper,
    WroughtIron,
    Iron,
    Bronze,
}

// Helper to get enum entries without numeric keys
const getEnumEntries = <T extends Record<string, string | number>>(enumObj: T) =>
    Object.entries(enumObj).filter(([key]) => isNaN(Number(key))) as [string, T[keyof T]][];

// Cache enum entries at module level to avoid recreating filtered arrays
const colorEntries = getEnumEntries(Colors);
const chestTypeEntries = getEnumEntries(ChestType);

// Structure with ChestType key, base ItemType, base DoodadType and new weightCapacity]
const chestConfig = [
    [ChestType.Wooden, ItemType.WoodenChest, DoodadType.WoodenChest, 1000],
    [ChestType.Tin, ItemType.TinChest, DoodadType.TinChest, 1250],
    [ChestType.OrnateWooden, ItemType.OrnateWoodenChest, DoodadType.OrnateWoodenChest, 1500],
    [ChestType.Copper, ItemType.CopperChest, DoodadType.CopperChest, 1750],
    [ChestType.WroughtIron, ItemType.WroughtIronChest, DoodadType.WroughtIronChest, 2000],
    [ChestType.Iron, ItemType.IronChest, DoodadType.IronChest, 2250],
    [ChestType.Bronze, ItemType.BronzeChest, DoodadType.BronzeChest, 2500],
] as const;

const chestConfigMap = new Map(
    chestConfig.map((config) => [config[0], config])
) as ReadonlyMap< ChestType, readonly [ChestType, ItemType, DoodadType, number]>;

function getChestItemDescription(chestType: ChestType, color: Colors): IItemDescription {
    const colorName = Colors[color];
    const materialName = ChestType[chestType];
    const config = chestConfigMap.get(chestType)!;
    const [, itemType, , weightCapacity] = config;
    const doodadTypeKey = `doodad${colorName}${materialName}Chest` as keyof ColorChests;
    const doodadType = Registry<ColorChests>().get(doodadTypeKey) as unknown as DoodadType;

    const baseItemDescription = itemDescriptions[itemType]!;
    const baseItemRecipe = baseItemDescription.recipe;
    if (!baseItemRecipe) {
        throw new Error(`Base item description for ${itemType} does not have a recipe.`);
    }
    const baseItemComponents = baseItemRecipe.components;

    const pigmentComponentKey = `item${colorName}Pigments` as keyof ColorChests;
    const pigmentComponent = Registry<ColorChests>().get(pigmentComponentKey) as ItemTypeGroup;

    return {
        ...baseItemDescription,
        weightCapacity: weightCapacity,
        recipe: {
            ...baseItemRecipe,
            components: [...baseItemComponents, RecipeComponent(pigmentComponent, 1, 1)],
        },
        onUse: { [ActionType.Build]: { type: doodadType } },
        doodadContainer: doodadType,
        placeDownType: doodadType,
    };
}

function getChestDoodadDescription(chestType: ChestType, color: Colors): IDoodadDescription {
    const colorName = Colors[color];
    const materialName = ChestType[chestType];
    const config = chestConfigMap.get(chestType)!;
    const [, , doodadType, weightCapacity] = config;
    const itemTypeKey = `item${colorName}${materialName}Chest` as keyof ColorChests;
    const itemType = Registry<ColorChests>().get(itemTypeKey) as unknown as ItemType;

    const baseDoodadDescription = doodadDescriptions[doodadType];
    return {
        ...baseDoodadDescription,
        weightCapacity: weightCapacity,
        preservationChance: 0.2,
        pickUp: [itemType],
        asItem: itemType,
    };
}

export default class ColorChests extends Mod {
    @Mod.instance<ColorChests>("ColorChests")
    public static readonly INSTANCE: ColorChests;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Pigment Groups for all 8 colors
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    @Register.itemGroup("BlackPigments", {
        default: ItemType.Charcoal,
        types: [
            ItemType.Charcoal,
            ItemType.PileOfAsh,
            ItemType.CarbonPowder,
            ItemType.Coal,
            ItemType.Tannin,
            ItemType.BlackPowder,
        ],
    })
    public itemBlackPigments: ItemTypeGroup;

    @Register.itemGroup("WhitePigments", {
        default: ItemType.BoneMeal,
        types: [
            ItemType.BoneMeal,
            ItemType.TalcumPowder,
            ItemType.LimestonePowder,
            ItemType.Chives,
            ItemType.ButtonMushrooms,
            ItemType.Saltpeter,
        ],
    })
    public itemWhitePigments: ItemTypeGroup;

    @Register.itemGroup("RedPigments", {
        default: ItemType.Raspberries,
        types: [
            ItemType.Tomato,
            ItemType.Apple,
            ItemType.FlyAmanita,
            ItemType.Offal,
            ItemType.Raspberries,
            ItemType.Winterberries,
        ],
    })
    public itemRedPigments: ItemTypeGroup;

    @Register.itemGroup("YellowPigments", {
        default: ItemType.CornEar,
        types: [
            ItemType.CornEar,
            ItemType.ArcticPoppies,
            ItemType.Beggarticks,
            ItemType.Papaya,
            ItemType.Pineapple,
            ItemType.WoodenShavings,
        ],
    })
    public itemYellowPigments: ItemTypeGroup;

    @Register.itemGroup("BluePigments", {
        default: ItemType.Crowberries,
        types: [ItemType.Crowberries],
    })
    public itemBluePigments: ItemTypeGroup;

    @Register.itemGroup("GreenPigments", {
        default: ItemType.Leaves,
        types: [
            ItemType.SpruceNeedles,
            ItemType.PalmLeaf,
            ItemType.PoisonIvyLeaves,
            ItemType.Leaves,
            ItemType.AloeVeraLeaves,
            ItemType.Badderlocks,
            ItemType.BladesOfGrass,
            ItemType.UnripePapaya,
            ItemType.Lettuce,
        ],
    })
    public itemGreenPigments: ItemTypeGroup;

    @Register.itemGroup("OrangePigments", {
        default: ItemType.Carrot,
        types: [ItemType.Carrot, ItemType.Pumpkin],
    })
    public itemOrangePigments: ItemTypeGroup;

    @Register.itemGroup("PurplePigments", {
        default: ItemType.MilkThistleFlowers,
        types: [ItemType.MilkThistleFlowers],
    })
    public itemPurplePigments: ItemTypeGroup;

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Register Chests ( Wooden, Tin, OrnateWooden, Copper, WroughtIron, Iron, Bronze ) - Each with 8 colors
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    @Register.bulk(
        "item",
        ...chestTypeEntries.flatMap(([chestName, chestType]) =>
            colorEntries.map(([colorName, color]) =>
                Tuple(`${colorName}${chestName}Chest`, getChestItemDescription(chestType as ChestType, color as Colors))
            )
        )
    )
    public itemsChests: ItemType[];

    @Register.bulk(
        "doodad",
        ...chestTypeEntries.flatMap(([chestName, chestType]) =>
            colorEntries.map(([colorName, color]) =>
                Tuple(
                    `${colorName}${chestName}Chest`,
                    getChestDoodadDescription(chestType as ChestType, color as Colors)
                )
            )
        )
    )
    public doodadsChests: DoodadType[];

    // Structure to store the original item description to restore it on unload
    private vanillaItems: Map<ItemType, IItemDescription> = new Map();
    private vanillaDoodads: Map<DoodadType, IDoodadDescription> = new Map();

    public override onLoad(): void {
        // Iterate through chests defined in chestConfig
        for (const [_chestType, itemType, doodadType, newCapacity] of chestConfig) {
            // Store the original item and adjust the weight capacity
            const itemDescription = itemDescriptions[itemType];
            if (itemDescription && !this.vanillaItems.has(itemType)) {
                this.vanillaItems.set(itemType, { ...itemDescription });
                itemDescription.weightCapacity = newCapacity;
            }

            // Store the original doodad and adjust the weight capacity
            const doodadDescription = doodadDescriptions[doodadType];
            if (doodadDescription && !this.vanillaDoodads.has(doodadType)) {
                this.vanillaDoodads.set(doodadType, { ...doodadDescription });
                doodadDescription.weightCapacity = newCapacity;
            }
        }
    }

    public override onUnload(): void {
        // Restore the original item descriptions for items
        for (const [itemType, originalItem] of this.vanillaItems) {
            itemDescriptions[itemType] = originalItem;
        }

        // Restore the original item descriptions for doodads
        for (const [doodadType, originalDoodad] of this.vanillaDoodads) {
            doodadDescriptions[doodadType] = originalDoodad;
        }
    }
}
