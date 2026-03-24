import { _decorator, Component, Node, Sprite, Color, SpriteFrame, Texture2D, UITransform, ImageAsset } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 简单纯色草地地图
 * 使用单色Sprite，渲染层级正常
 */
@ccclass('SimpleGrassMap')
export class SimpleGrassMap extends Component {
    @property mapWidth = 10000; // 地图宽度（调大了）
    @property mapHeight = 10000; // 地图高度（调大了）
    @property grassColor = new Color(85, 170, 85, 255);

    onLoad() {
        this.createSimpleGrass();
    }

    createSimpleGrass() {
        // 获取或添加Sprite组件
        let sprite = this.node.getComponent(Sprite);
        if (!sprite) {
            sprite = this.node.addComponent(Sprite);
        }

        // 获取或添加UITransform
        let transform = this.node.getComponent(UITransform);
        if (!transform) {
            transform = this.node.addComponent(UITransform);
        }

        // 先设置大小
        transform.setContentSize(this.mapWidth, this.mapHeight);

        // 使用Canvas创建纹理
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            console.error('无法创建canvas context');
            return;
        }

        // 绘制纯色
        ctx.fillStyle = `rgb(${this.grassColor.r}, ${this.grassColor.g}, ${this.grassColor.b})`;
        ctx.fillRect(0, 0, 32, 32);

        // 添加一些简单的草地纹理点
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 32;
            const y = Math.random() * 32;
            const darkness = Math.random() * 20 + 10;
            ctx.fillStyle = `rgb(${this.grassColor.r - darkness}, ${this.grassColor.g - darkness}, ${this.grassColor.b - darkness})`;
            ctx.fillRect(x, y, 2, 2);
        }

        // 转换为Image并创建纹理
        const img = new Image();
        img.onload = () => {
            const texture = new Texture2D();
            const imageAsset = new ImageAsset(img);
            texture.image = imageAsset;
            
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            
            sprite.spriteFrame = spriteFrame;
            sprite.type = Sprite.Type.TILED;
            sprite.sizeMode = Sprite.SizeMode.CUSTOM;
            
            console.log(`草地纹理已应用，地图大小: ${this.mapWidth} x ${this.mapHeight}`);
        };
        img.onerror = () => {
            console.error('图片加载失败');
        };
        img.src = canvas.toDataURL();

        console.log('开始创建草地地图...');
    }
}
