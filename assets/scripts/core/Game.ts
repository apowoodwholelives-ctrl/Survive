import { _decorator, Component, Node } from 'cc';
const { ccclass, executionOrder } = _decorator;

@ccclass('Game')
@executionOrder(-100)
export class Game extends Component {
    static inst: Game;

    onLoad() {
        if (Game.inst) { this.destroy(); return; }
        Game.inst = this;
    }
}