import { _decorator, Component, Node, Sprite, SpriteFrame, Texture2D, resources, ImageAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BerrySpawner')
export class BerrySpawner extends Component {
    @property mapWidth = 20000;
    @property mapHeight = 20000;
    @property berryCount = 200;
    @property berryScale = 0.8;
    @property minDistanceFromCenter = 200;

    private berryTexture: Texture2D = null;
    private berrySpriteFrame: SpriteFrame = null;

    start() {
        this.scheduleOnce(() => {
            this.loadBerryTexture();
        }, 0.5);
    }

    loadBerryTexture() {
        console.log('BerrySpawner: 开始加载浆果图片');
        
        resources.load('berry/berry_bush/spriteFrame', SpriteFrame, (err, spriteFrame) => {
            if (!err && spriteFrame) {
                console.log('BerrySpawner: 直接加载 spriteFrame 成功');
                this.berrySpriteFrame = spriteFrame;
                this.spawnBerries();
                return;
            }

            console.log('BerrySpawner: 尝试用 ImageAsset 加载');
            resources.load('berry/berry_bush', ImageAsset, (err2, imageAsset) => {
                if (err2 || !imageAsset) {
                    console.error('BerrySpawner: 加载失败:', err2);
                    return;
                }
                
                const texture = new Texture2D();
                texture.image = imageAsset;
                this.berryTexture = texture;
                
                const sf = new SpriteFrame();
                sf.texture = texture;
                this.berrySpriteFrame = sf;
                
                console.log('BerrySpawner: ImageAsset 加载成功');
                this.spawnBerries();
            });
        });
    }

    spawnBerries() {
        if (!this.berrySpriteFrame) {
            console.error('BerrySpawner: 没有可用的浆果图片');
            return;
        }
        
        console.log('BerrySpawner: 开始生成浆果');
        const canvas = this.node.parent;
        
        for (let i = 0; i < this.berryCount; i++) {
            this.createBerryNode(canvas, i);
        }

        console.log(`BerrySpawner: 生成了 ${this.berryCount} 棵浆果树`);
    }

    private createBerryNode(parent: Node, index: number) {
        const node = new Node(`Berry_${index}`);
        node.parent = parent;

        const halfWidth = this.mapWidth / 2 - 500;
        const halfHeight = this.mapHeight / 2 - 500;

        let x, y;
        do {
            x = (Math.random() - 0.5) * 2 * halfWidth;
            y = (Math.random() - 0.5) * 2 * halfHeight;
        } while (Math.sqrt(x * x + y * y) < this.minDistanceFromCenter);

        node.setPosition(x, y, 0);
        node.setScale(this.berryScale, this.berryScale, 1);

        const sprite = node.addComponent(Sprite);
        sprite.spriteFrame = this.berrySpriteFrame;
    }
}
