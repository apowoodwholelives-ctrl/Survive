import { _decorator, Component, Node, Sprite, Color, SpriteFrame, Texture2D, Size } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MapManager')
export class MapManager extends Component {
    @property mapWidth = 3000; // 地图宽度
    @property mapHeight = 3000; // 地图高度
    @property grassColor = new Color(60, 150, 80); // 草地颜色

    onLoad() {
        this.createGrassMap();
    }

    // 创建草地地图
    createGrassMap() {
        const sprite = this.node.getComponent(Sprite);
        if (!sprite) {
            console.error('MapManager节点需要Sprite组件');
            return;
        }

        // 创建一个纯色的草地纹理
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        // 绘制草地基础颜色
        ctx.fillStyle = `rgb(${this.grassColor.r}, ${this.grassColor.g}, ${this.grassColor.b})`;
        ctx.fillRect(0, 0, 512, 512);

        // 添加一些简单的草地纹理（随机深浅点）
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 3 + 1;
            const darkness = Math.random() * 20;
            
            ctx.fillStyle = `rgb(${this.grassColor.r - darkness}, ${this.grassColor.g - darkness}, ${this.grassColor.b - darkness})`;
            ctx.fillRect(x, y, size, size);
        }

        // 创建纹理
        const texture = new Texture2D();
        const img = new Image();
        img.onload = () => {
            texture.reset({
                width: 512,
                height: 512,
                format: Texture2D.PixelFormat.RGBA8888
            });
            texture.uploadData(canvas);
            
            // 创建SpriteFrame
            const spriteFrame = new SpriteFrame();
            spriteFrame.texture = texture;
            sprite.spriteFrame = spriteFrame;
            
            // 设置地图大小
            this.node.setScale(this.mapWidth / 512, this.mapHeight / 512, 1);
            
            console.log('草地地图创建完成');
        };
        img.src = canvas.toDataURL();
    }
}
