import { _decorator, Component, Node } from 'cc';
const { ccclass } = _decorator;

@ccclass('SurvivalStatus')
export class SurvivalStatus extends Component {
    hp = 100;
    hunger = 100;
    thirst = 100;

    private _timer = 0;

    update(dt: number) {
        this._timer += dt;
        if (this._timer >= 1) {
            this._timer = 0;
            this.hunger = Math.max(0, this.hunger - 0.4);
            this.thirst = Math.max(0, this.thirst - 0.6);

            if (this.hunger <= 0) this.hp = Math.max(0, this.hp - 1);
            if (this.thirst <= 0) this.hp = Math.max(0, this.hp - 1.5);
        }
    }

    eat(val: number) {
        this.hunger = Math.min(100, this.hunger + val);
    }

    drink(val: number) {
        this.thirst = Math.min(100, this.thirst + val);
    }
}