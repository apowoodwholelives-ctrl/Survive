import { _decorator, Component, Graphics, Color, Sprite, SpriteFrame, resources, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GrassMap')
export class GrassMap extends Component {
    @property mapWidth = 20000;
    @property mapHeight = 20000;
    @property grassColor = new Color(120, 120, 120, 255);
    @property tileTexturePath = "";
    @property useTexture = false;

    private graphics: Graphics = null;
    private sprite: Sprite = null;

    onLoad() {
        this.scheduleOnce(() => {
            this.createGrassMap();
        }, 0);
    }

    createGrassMap() {
        if (this.useTexture && this.tileTexturePath) {
            this.loadTileTexture();
        } else {
            this.drawGrass();
        }
        console.log(`草地地图创建完成，尺寸: ${this.mapWidth} x ${this.mapHeight}`);
    }

    loadTileTexture() {
        resources.load(this.tileTexturePath + '/spriteFrame', SpriteFrame, (err, spriteFrame) => {
            if (err || !spriteFrame) {
                console.error('加载贴图失败:', err);
                this.drawGrass();
                return;
            }

            this.sprite = this.node.getComponent(Sprite);
            if (!this.sprite) {
                this.sprite = this.node.addComponent(Sprite);
            }
            this.sprite.spriteFrame = spriteFrame;
            this.sprite.type = Sprite.Type.TILED;

            const transform = this.node.getComponent(UITransform);
            if (transform) {
                transform.setContentSize(this.mapWidth, this.mapHeight);
            }

            console.log('贴图地图创建成功');
        });
    }

    drawGrass() {
        this.graphics = this.node.getComponent(Graphics);
        if (!this.graphics) {
            this.graphics = this.node.addComponent(Graphics);
        }
        this.graphics.clear();
        this.graphics.fillColor = this.grassColor;
        this.graphics.rect(-this.mapWidth / 2, -this.mapHeight / 2, this.mapWidth, this.mapHeight);
        this.graphics.fill();

        const darkColor = new Color(
            Math.max(0, this.grassColor.r - 30),
            Math.max(0, this.grassColor.g - 30),
            Math.max(0, this.grassColor.b - 30),
            255
        );

        this.graphics.fillColor = darkColor;
        for (let i = 0; i < 500; i++) {
            const x = (Math.random() - 0.5) * this.mapWidth;
            const y = (Math.random() - 0.5) * this.mapHeight;
            const size = Math.random() * 30 + 10;
            this.graphics.circle(x, y, size);
            this.graphics.fill();
        }

        const lightColor = new Color(
            Math.min(255, this.grassColor.r + 20),
            Math.min(255, this.grassColor.g + 20),
            Math.min(255, this.grassColor.b + 20),
            255
        );

        this.graphics.fillColor = lightColor;
        for (let i = 0; i < 300; i++) {
            const x = (Math.random() - 0.5) * this.mapWidth;
            const y = (Math.random() - 0.5) * this.mapHeight;
            const size = Math.random() * 20 + 5;
            this.graphics.circle(x, y, size);
            this.graphics.fill();
        }

        this.graphics.lineWidth = 5;
        this.graphics.strokeColor = new Color(50, 100, 50, 255);
        this.graphics.rect(-this.mapWidth / 2, -this.mapHeight / 2, this.mapWidth, this.mapHeight);
        this.graphics.stroke();
    }
}
