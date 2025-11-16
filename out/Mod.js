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
    class ColorfulCapaciousChests extends Mod_1.default {
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
    exports.default = ColorfulCapaciousChests;
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
    ], ColorfulCapaciousChests.prototype, "itemBlackPigments", void 0);
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
    ], ColorfulCapaciousChests.prototype, "itemWhitePigments", void 0);
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
    ], ColorfulCapaciousChests.prototype, "itemRedPigments", void 0);
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
    ], ColorfulCapaciousChests.prototype, "itemYellowPigments", void 0);
    __decorate([
        ModRegistry_1.default.itemGroup("BluePigments", {
            default: IItem_1.ItemType.Crowberries,
            types: [IItem_1.ItemType.Crowberries],
        })
    ], ColorfulCapaciousChests.prototype, "itemBluePigments", void 0);
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
    ], ColorfulCapaciousChests.prototype, "itemGreenPigments", void 0);
    __decorate([
        ModRegistry_1.default.itemGroup("OrangePigments", {
            default: IItem_1.ItemType.Carrot,
            types: [IItem_1.ItemType.Carrot, IItem_1.ItemType.Pumpkin],
        })
    ], ColorfulCapaciousChests.prototype, "itemOrangePigments", void 0);
    __decorate([
        ModRegistry_1.default.itemGroup("PurplePigments", {
            default: IItem_1.ItemType.MilkThistleFlowers,
            types: [IItem_1.ItemType.MilkThistleFlowers],
        })
    ], ColorfulCapaciousChests.prototype, "itemPurplePigments", void 0);
    __decorate([
        ModRegistry_1.default.bulk("item", ...chestTypeEntries.flatMap(([chestName, chestType]) => colorEntries.map(([colorName, color]) => (0, Tuple_1.Tuple)(`${colorName}${chestName}Chest`, getChestItemDescription(chestType, color)))))
    ], ColorfulCapaciousChests.prototype, "itemsChests", void 0);
    __decorate([
        ModRegistry_1.default.bulk("doodad", ...chestTypeEntries.flatMap(([chestName, chestType]) => colorEntries.map(([colorName, color]) => (0, Tuple_1.Tuple)(`${colorName}${chestName}Chest`, getChestDoodadDescription(chestType, color)))))
    ], ColorfulCapaciousChests.prototype, "doodadsChests", void 0);
    __decorate([
        Mod_1.default.instance("ColorfulCapaciousChests")
    ], ColorfulCapaciousChests, "INSTANCE", void 0);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL01vZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7SUFTQSxJQUFLLE1BU0o7SUFURCxXQUFLLE1BQU07UUFDUCxxQ0FBSyxDQUFBO1FBQ0wscUNBQUssQ0FBQTtRQUNMLGlDQUFHLENBQUE7UUFDSCx1Q0FBTSxDQUFBO1FBQ04sbUNBQUksQ0FBQTtRQUNKLHFDQUFLLENBQUE7UUFDTCx1Q0FBTSxDQUFBO1FBQ04sdUNBQU0sQ0FBQTtJQUNWLENBQUMsRUFUSSxNQUFNLEtBQU4sTUFBTSxRQVNWO0lBR0QsSUFBSyxTQVFKO0lBUkQsV0FBSyxTQUFTO1FBQ1YsNkNBQU0sQ0FBQTtRQUNOLHVDQUFHLENBQUE7UUFDSCx5REFBWSxDQUFBO1FBQ1osNkNBQU0sQ0FBQTtRQUNOLHVEQUFXLENBQUE7UUFDWCx5Q0FBSSxDQUFBO1FBQ0osNkNBQU0sQ0FBQTtJQUNWLENBQUMsRUFSSSxTQUFTLEtBQVQsU0FBUyxRQVFiO0lBR0QsTUFBTSxjQUFjLEdBQUcsQ0FBNEMsT0FBVSxFQUFFLEVBQUUsQ0FDN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQTJCLENBQUM7SUFHNUYsTUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVDLE1BQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBR25ELE1BQU0sV0FBVyxHQUFHO1FBQ2hCLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxnQkFBUSxDQUFDLFdBQVcsRUFBRSxvQkFBVSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUM7UUFDdEUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLGdCQUFRLENBQUMsUUFBUSxFQUFFLG9C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