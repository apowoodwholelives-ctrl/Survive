import { _decorator, Component, Node } from 'cc';
const { ccclass } = _decorator;

@ccclass('Inventory')
export class Inventory extends Component {
    items: Record<string, number> = {};

    addItemById(id: string, count = 1) {
        this.items[id] = (this.items[id] || 0) + count;
        console.log("背包：", this.items);
    }

    getItemCount(id: string): number {
        return this.items[id] || 0;
    }

    consumeItem(id: string, count: number): boolean {
        if (this.getItemCount(id) < count) return false;
        this.items[id] -= count;
        return true;
    }
}