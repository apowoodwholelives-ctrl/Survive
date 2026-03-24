import { _decorator, Component, Node, Sprite, Color, SpriteFrame, Texture2D, instantiate, Prefab, UITransform, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SimpleMapManager')
export class SimpleMapManager extends Component {
    @property mapWidth = 5000; // 地图宽度
    @property mapHeight = 5000; // 地图高度

    onLoad() {
        this.createSimpleGrass();
    }

    // 创建简单的草地背景
    createSimpleGrass() {
        // 给当前节点添加Sprite组件
        let sprite = this.node.getComponent(Sprite);
        if (!sprite) {
            sprite = this.node.addComponent(Sprite);
        }

        // 获取或添加UITransform组件
        let transform = this.node.getComponent(UITransform);
        if (!transform) {
            transform = this.node.addComponent(UITransform);
        }

        // 设置地图大小
        transform.setContentSize(this.mapWidth, this.mapHeight);

        // 创建草地纹理
        this.createGrassTexture(sprite);
        
        // 设置节点位置（让地图中心在0,0）
        this.node.setPosition(0, 0, 0);

        console.log('简单草地地图创建完成，尺寸:', this.mapWidth, 'x', this.mapHeight);
    }

    // 创建草地纹理
    createGrassTexture(sprite: Sprite) {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        // 基础草地颜色（深绿色）
        const baseColor = { r: 85, g: 170, b: 85 };
        
        // 绘制基础颜色
        ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
        ctx.fillRect(0, 0, size, size);

        // 添加纹理细节 - 深色草点
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const dotSize = Math.random() * 2 + 1;
            const darkness = Math.random() * 30 + 10;
            
            ctx.fillStyle = `rgb(${baseColor.r - darkness}, ${baseColor.g - darkness}, ${baseColor.b - darkness})`;
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // 添加浅色草点
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const dotSize = Math.random() * 2 + 1;
            const brightness = Math.random() * 20 + 10;
            
            ctx.fillStyle = `rgb(${baseColor.r + brightness}, ${baseColor.g + brightness}, ${baseColor.b + brightness})`;
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // 转换为Cocos纹理
        canvas.toBlob((blob) => {
            if (!blob) return;
            
            const img = new Image();
            img.onload = () => {
                const texture = new Texture2D();
                texture.image = img as any;
                
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;
                sprite.spriteFrame = spriteFrame;
                sprite.type = Sprite.Type.TILED; // 使用平铺模式
                
                console.log('草地纹理加载完成');
            };
            img.src = URL.createObjectURL(blob);
        });
    }
}
