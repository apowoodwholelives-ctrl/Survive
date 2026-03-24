import { _decorator, Component, Node } from 'cc';
const { ccclass } = _decorator;
import { Inventory } from './Inventory';

export const recipes = [
    {
        name: "木斧",
        cost: { wood: 3 },
        give: "axe_wood"
    },
    {
        name: "火把",
        cost: { wood: 2, stone: 1 },
        give: "torch"
    },
    {
        name: "绳子",
        cost: { grass: 2 },
        give: "rope"
    }
];

@ccclass('CraftSystem')
export class CraftSystem extends Component {
    craft(recipeIdx: number, inv: Inventory): boolean {
        const r = recipes[recipeIdx];
        for (const id in r.cost) {
            const need = r.cost[id];
            if (inv.getItemCount(id) < need) return false;
        }
        for (const id in r.cost) inv.consumeItem(id, r.cost[id]);
        inv.addItemById(r.give, 1);
        return true;
    }
}