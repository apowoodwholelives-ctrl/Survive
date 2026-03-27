import { _decorator, Component, Node, BoxCollider2D, Contact2DType, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

export enum CollectType {
    WOOD = "wood",
    STONE = "stone",
    COCONUT = "coconut"
}

@ccclass('Collectible')
export class Collectible extends Component {
    @property type = CollectType.WOOD;
    @property harvestCount = 1;

    onLoad() {
        const collider = this.getComponent(BoxCollider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onPick, this);
        }
    }

    onPick(self: IPhysics2DContact, other: IPhysics2DContact) {
        const player = other.node.getComponent("PlayerController");
        if (!player) return;

        const inv = player.node.getComponent("Inventory");
        if (inv) {
            inv.addItemById(this.type, this.harvestCount);
        }

        if (this.type === CollectType.COCONUT) {
            const survival = player.node.getComponent("SurvivalStatus");
            if (survival) {
                survival.eat(15);
                survival.drink(10);
            }
        }

        this.node.destroy();
    }
}