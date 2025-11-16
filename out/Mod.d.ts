import { DoodadType } from "@wayward/game/game/doodad/IDoodad";
import { ItemType, ItemTypeGroup } from "@wayward/game/game/item/IItem";
import Mod from "@wayward/game/mod/Mod";
export default class ColorfulCapaciousChests extends Mod {
    static readonly INSTANCE: ColorfulCapaciousChests;
    itemBlackPigments: ItemTypeGroup;
    itemWhitePigments: ItemTypeGroup;
    itemRedPigments: ItemTypeGroup;
    itemYellowPigments: ItemTypeGroup;
    itemBluePigments: ItemTypeGroup;
    itemGreenPigments: ItemTypeGroup;
    itemOrangePigments: ItemTypeGroup;
    itemPurplePigments: ItemTypeGroup;
    itemsChests: ItemType[];
    doodadsChests: DoodadType[];
    private vanillaItems;
    private vanillaDoodads;
    onLoad(): void;
    onUnload(): void;
}
