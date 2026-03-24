import { _decorator, Component, Node, Sprite, Color, SpriteFrame, Texture2D, UITransform, ImageAsset } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 简单的2.5D俯视草地地图
 * 使用Sprite而不是Graphics，避免渲染层级问题
 */
@ccclass('GrassMapSprite')
export class GrassMapSprite extends Component {
    @property mapWidth = 5000; // 地图宽度
    @property mapHeight = 5000; // 地图高度
    @property grassColor = new Color(85, 170, 85, 255); // 草地颜色

    private sprite: Sprite = null;

    onLoad() {
        this.createGrassMap();
    }

    createGrassMap() {
        // 获取或添加Sprite组件
        this.sprite = this.node.getComponent(Sprite);
        if (!this.sprite) {
            this.sprite = this.node.addComponent(Sprite);
        }

        // 获取或添加UITransform
        let transform = this.node.getComponent(UITransform);
        if (!transform) {
            transform = this.node.addComponent(UITransform);
        }

        // 设置地图大小
        transform.setContentSize(this.mapWidth, this.mapHeight);

        // 使用平铺模式
        this.sprite.type = Sprite.Type.TILED;
        this.sprite.sizeMode = Sprite.SizeMode.CUSTOM;

        // 创建草地纹理
        this.createGrassTexture();

        console.log(`草地地图创建完成，尺寸: ${this.mapWidth} x ${this.mapHeight}`);
    }

    createGrassTexture() {
        const textureSize = 256;
        const canvas = document.createElement('canvas');
        canvas.width = textureSize;
        canvas.height = textureSize;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        // 绘制基础草地颜色
        ctx.fillStyle = `rgb(${this.grassColor.r}, ${this.grassColor.g}, ${this.grassColor.b})`;
        ctx.fillRect(0, 0, textureSize, textureSize);

        // 添加深色草地纹理
        for (let i = 0; i < 400; i++) {
            const x = Math.random() * textureSize;
            const y = Math.random() * textureSize;
            const size = Math.random() * 3 + 1;
            const darkness = Math.random() * 30 + 10;
            
            ctx.fillStyle = `rgba(${this.grassColor.r - darkness}, ${this.grassColor.g - darkness}, ${this.grassColor.b - darkness}, 0.5)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // 添加浅色草地纹理
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * textureSize;
            const y = Math.random() * textureSize;
            const size = Math.random() * 2 + 0.5;
            const brightness = Math.random() * 20 + 10;
            
            ctx.fillStyle = `rgba(${this.grassColor.r + brightness}, ${this.grassColor.g + brightness}, ${this.grassColor.b + brightness}, 0.3)`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // 转换为图片并创建纹理
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error('创建草地纹理失败');
                return;
            }
            
            const img = new Image();
            img.onload = () => {
                const texture = new Texture2D();
                const imageAsset = new ImageAsset(img);
                texture.image = imageAsset;
                
                // 创建SpriteFrame
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;
                
                // 设置到Sprite
                this.sprite.spriteFrame = spriteFrame;
                
                console.log('草地纹理创建完成');
            };
            img.src = URL.createObjectURL(blob);
        });
    }
}
