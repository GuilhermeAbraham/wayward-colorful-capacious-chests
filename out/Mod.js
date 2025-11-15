var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "@wayward/game/game/doodad/Doodads", "@wayward/game/game/doodad/IDoodad", "@wayward/game/game/entity/action/IAction", "@wayward/game/game/item/IItem", "@wayward/game/game/item/ItemDescriptions", "@wayward/game/mod/Mod", "@wayward/game/mod/ModRegistry", "@wayward/utilities/collection/Tuple"], function (require, exports, Doodads_1, IDoodad_1, IAction_1, IItem_1, ItemDescriptions_1, Mod_1, ModRegistry_1, Tuple_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Colors;
    (function (Colors) {
        Colors[Colors["Black"] = 0] = "Black";
        Colors[Colors["White"] = 1] = "White";
        Colors[Colors["Red"] = 2] = "Red";
        Colors[Colors["Yellow"] = 3] = "Yellow";
        Colors[Colors["Blue"] = 4] = "Blue";
        Colors[Colors["Green"] = 5] = "Green";
        Colors[Colors["Orange"] = 6] = "Orange";
        Colors[Colors["Purple"] = 7] = "Purple";
    })(Colors || (Colors = {}));
    var ChestType;
    (function (ChestType) {
        ChestType[ChestType["Wooden"] = 0] = "Wooden";
        ChestType[ChestType["Tin"] = 1] = "Tin";
        ChestType[ChestType["OrnateWooden"] = 2] = "OrnateWooden";
        ChestType[ChestType["Copper"] = 3] = "Copper";
        ChestType[ChestType["WroughtIron"] = 4] = "WroughtIron";
        ChestType[ChestType["Iron"] = 5] = "Iron";
        ChestType[ChestType["Bronze"] = 6] = "Bronze";
    })(ChestType || (ChestType = {}));
    const getEnumEntries = (enumObj) => Object.entries(enumObj).filter(([key]) => isNaN(Number(key)));
    const colorEntries = getEnumEntries(Colors);
    const chestTypeEntries = getEnumEntries(ChestType);
    const chestConfig = [
        [ChestType.Wooden, IItem_1.ItemType.WoodenChest, IDoodad_1.DoodadType.WoodenChest, 1000],
        [ChestType.Tin, IItem_1.ItemType.TinChest, IDoodad_1.DoodadType.TinChest, 1250],
        [ChestType.OrnateWooden, IItem_1.ItemType.OrnateWoodenChest, IDoodad_1.DoodadType.OrnateWoodenChest, 1500],
        [ChestType.Copper, IItem_1.ItemType.CopperChest, IDoodad_1.DoodadType.CopperChest, 1750],
        [ChestType.WroughtIron, IItem_1.ItemType.WroughtIronChest, IDoodad_1.DoodadType.WroughtIronChest, 2000],
        [ChestType.Iron, IItem_1.ItemType.IronChest, IDoodad_1.DoodadType.IronChest, 2250],
        [ChestType.Bronze, IItem_1.ItemType.BronzeChest, IDoodad_1.DoodadType.BronzeChest, 2500],
    ];
    const chestConfigMap = new Map(chestConfig.map((config) => [config[0], config]));
    function getChestItemDescription(chestType, color) {
        const colorName = Colors[color];
        const materialName = ChestType[chestType];
        const config = chestConfigMap.get(chestType);
        const [, itemType, , weightCapacity] = config;
        const doodadTypeKey = `doodad${colorName}${materialName}Chest`;
        const doodadType = (0, ModRegistry_1.Registry)().get(doodadTypeKey);
        const baseItemDescription = ItemDescriptions_1.itemDescriptions[itemType];
        const baseItemRecipe = baseItemDescription.recipe;
        if (!baseItemRecipe) {
            throw new Error(`Base item description for ${itemType} does not have a recipe.`);
        }
        const baseItemComponents = baseItemRecipe.components;
        const pigmentComponentKey = `item${colorName}Pigments`;
        const pigmentComponent = (0, ModRegistry_1.Registry)().get(pigmentComponentKey);
        return {
            ...baseItemDescription,
            weightCapacity: weightCapacity,
            recipe: {
                ...baseItemRecipe,
                components: [...baseItemComponents, (0, ItemDescriptions_1.RecipeComponent)(pigmentComponent, 1, 1)],
            },
            onUse: { [IAction_1.ActionType.Build]: { type: doodadType } },
            doodadContainer: doodadType,
            placeDownType: doodadType,
        };
    }
    function getChestDoodadDescription(chestType, color) {
        const colorName = Colors[color];
        const materialName = ChestType[chestType];
        const config = chestConfigMap.get(chestType);
        const [, , doodadType, weightCapacity] = config;
        const itemTypeKey = `item${colorName}${materialName}Chest`;
        const itemType = (0, ModRegistry_1.Registry)().get(itemTypeKey);
        const baseDoodadDescription = Doodads_1.doodadDescriptions[doodadType];
        return {
            ...baseDoodadDescription,
            weightCapacity: weightCapacity,
            preservationChance: 0.2,
            pickUp: [itemType],
            asItem: itemType,
        };
    }
    class ColorChests extends Mod_1.default {
        constructor() {
            super(...arguments);
            this.vanillaItems = new Map();
            this.vanillaDoodads = new Map();
        }
        onLoad() {
            for (const [_chestType, itemType, doodadType, newCapacity] of chestConfig) {
                const itemDescription = ItemDescriptions_1.itemDescriptions[itemType];
                if (itemDescription && !this.vanillaItems.has(itemType)) {
                    this.vanillaItems.set(itemType, { ...itemDescription });
                    itemDescription.weightCapacity = newCapacity;
                }
                const doodadDescription = Doodads_1.doodadDescriptions[doodadType];
                if (doodadDescription && !this.vanillaDoodads.has(doodadType)) {
                    this.vanillaDoodads.set(doodadType, { ...doodadDescription });
                    doodadDescription.weightCapacity = newCapacity;
                }
            }
        }
        onUnload() {
            for (const [itemType, originalItem] of this.vanillaItems) {
                ItemDescriptions_1.itemDescriptions[itemType] = originalItem;
            }
            for (const [doodadType, originalDoodad] of this.vanillaDoodads) {
                Doodads_1.doodadDescriptions[doodadType] = originalDoodad;
            }
        }
    }
    exports.default = ColorChests;
    __decorate([
        ModRegistry_1.default.itemGroup("BlackPigments", {
            default: IItem_1.ItemType.Charcoal,
            types: [
                IItem_1.ItemType.Charcoal,
                IItem_1.ItemType.PileOfAsh,
                IItem_1.ItemType.CarbonPowder,
                IItem_1.ItemType.Coal,
                IItem_1.ItemType.Tannin,
                IItem_1.ItemType.BlackPowder,
            ],
        })
    ], ColorChests.prototype, "itemBlackPigments", void 0);
    __decorate([
        ModRegistry_1.default.itemGroup("WhitePigments", {
            default: IItem_1.ItemType.BoneMeal,
            types: [
                IItem_1.ItemType.BoneMeal,
                IItem_1.ItemType.TalcumPowder,
                IItem_1.ItemType.LimestonePowder,
                IItem_1.ItemType.Chives,
                IItem_1.ItemType.ButtonMushrooms,
                IItem_1.ItemType.Saltpeter,
            ],
        })
    ], ColorChests.prototype, "itemWhitePigments", void 0);
    __decorate([
        ModRegistry_1.default.itemGroup("RedPigments", {
            default: IItem_1.ItemType.Raspberries,
            types: [
                IItem_1.ItemType.Tomato,
                IItem_1.ItemType.Apple,
                IItem_1.ItemType.FlyAmanita,
                IItem_1.ItemType.Offal,
                IItem_1.ItemType.Raspberries,
                IItem_1.ItemType.Winterberries,
            ],
        })
    ], ColorChests.prototype, "itemRedPigments", void 0);
    __decorate([
        ModRegistry_1.default.itemGroup("YellowPigments", {
            default: IItem_1.ItemType.CornEar,
            types: [
                IItem_1.ItemType.CornEar,
                IItem_1.ItemType.ArcticPoppies,
                IItem_1.ItemType.Beggarticks,
                IItem_1.ItemType.Papaya,
                IItem_1.ItemType.Pineapple,
                IItem_1.ItemType.WoodenShavings,
            ],
        })
    ], ColorChests.prototype, "itemYellowPigments", void 0);
    __decorate([
        ModRegistry_1.default.itemGroup("BluePigments", {
            default: IItem_1.ItemType.Crowberries,
            types: [IItem_1.ItemType.Crowberries],
        })
    ], ColorChests.prototype, "itemBluePigments", void 0);
    __decorate([
        ModRegistry_1.default.itemGroup("GreenPigments", {
            default: IItem_1.ItemType.Leaves,
            types: [
                IItem_1.ItemType.SpruceNeedles,
                IItem_1.ItemType.PalmLeaf,
                IItem_1.ItemType.PoisonIvyLeaves,
                IItem_1.ItemType.Leaves,
                IItem_1.ItemType.AloeVeraLeaves,
                IItem_1.ItemType.Badderlocks,
                IItem_1.ItemType.BladesOfGrass,
                IItem_1.ItemType.UnripePapaya,
                IItem_1.ItemType.Lettuce,
            ],
        })
    ], ColorChests.prototype, "itemGreenPigments", void 0);
    __decorate([
        ModRegistry_1.default.itemGroup("OrangePigments", {
            default: IItem_1.ItemType.Carrot,
            types: [IItem_1.ItemType.Carrot, IItem_1.ItemType.Pumpkin],
        })
    ], ColorChests.prototype, "itemOrangePigments", void 0);
    __decorate([
        ModRegistry_1.default.itemGroup("PurplePigments", {
            default: IItem_1.ItemType.MilkThistleFlowers,
            types: [IItem_1.ItemType.MilkThistleFlowers],
        })
    ], ColorChests.prototype, "itemPurplePigments", void 0);
    __decorate([
        ModRegistry_1.default.bulk("item", ...chestTypeEntries.flatMap(([chestName, chestType]) => colorEntries.map(([colorName, color]) => (0, Tuple_1.Tuple)(`${colorName}${chestName}Chest`, getChestItemDescription(chestType, color)))))
    ], ColorChests.prototype, "itemsChests", void 0);
    __decorate([
        ModRegistry_1.default.bulk("doodad", ...chestTypeEntries.flatMap(([chestName, chestType]) => colorEntries.map(([colorName, color]) => (0, Tuple_1.Tuple)(`${colorName}${chestName}Chest`, getChestDoodadDescription(chestType, color)))))
    ], ColorChests.prototype, "doodadsChests", void 0);
    __decorate([
        Mod_1.default.instance("ColorChests")
    ], ColorChests, "INSTANCE", void 0);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL01vZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFTQSxJQUFLLE1BU0o7SUFURCxXQUFLLE1BQU07UUFDUCxxQ0FBSyxDQUFBO1FBQ0wscUNBQUssQ0FBQTtRQUNMLGlDQUFHLENBQUE7UUFDSCx1Q0FBTSxDQUFBO1FBQ04sbUNBQUksQ0FBQTtRQUNKLHFDQUFLLENBQUE7UUFDTCx1Q0FBTSxDQUFBO1FBQ04sdUNBQU0sQ0FBQTtJQUNWLENBQUMsRUFUSSxNQUFNLEtBQU4sTUFBTSxRQVNWO0lBR0QsSUFBSyxTQVFKO0lBUkQsV0FBSyxTQUFTO1FBQ1YsNkNBQU0sQ0FBQTtRQUNOLHVDQUFHLENBQUE7UUFDSCx5REFBWSxDQUFBO1FBQ1osNkNBQU0sQ0FBQTtRQUNOLHVEQUFXLENBQUE7UUFDWCx5Q0FBSSxDQUFBO1FBQ0osNkNBQU0sQ0FBQTtJQUNWLENBQUMsRUFSSSxTQUFTLEtBQVQsU0FBUyxRQVFiO0lBR0QsTUFBTSxjQUFjLEdBQUcsQ0FBNEMsT0FBVSxFQUFFLEVBQUUsQ0FDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQTJCLENBQUM7SUFHNUYsTUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLE1BQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBR25ELE1BQU0sV0FBVyxHQUFHO1FBQ2hCLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxnQkFBUSxDQUFDLFdBQVcsRUFBRSxvQkFBVSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUM7UUFDdEUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLGdCQUFRLENBQUMsUUFBUSxFQUFFLG9C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