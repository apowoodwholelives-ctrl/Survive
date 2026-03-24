import { _decorator, Component, Node, Graphics, Color, UITransform } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 简单的2.5D俯视地图管理器
 * 直接使用Graphics绘制草地
 */
@ccclass('GrassMap')
export class GrassMap extends Component {
    @property mapWidth = 20000; // 地图宽度
    @property mapHeight = 20000; // 地图高度
    @property grassColor = new Color(85, 170, 85, 255); // 草地颜色（深绿色）

    private graphics: Graphics = null;

    onLoad() {
        // 延迟一帧创建，确保在其他组件之后
        this.scheduleOnce(() => {
            this.createGrassMap();
        }, 0);
    }

    createGrassMap() {
        // 获取或添加Graphics组件
        this.graphics = this.node.getComponent(Graphics);
        if (!this.graphics) {
            this.graphics = this.node.addComponent(Graphics);
        }

        // 绘制草地
        this.drawGrass();

        console.log(`2.5D草地地图创建完成，尺寸: ${this.mapWidth} x ${this.mapHeight}`);
    }

    drawGrass() {
        this.graphics.clear();

        // 绘制主草地背景
        this.graphics.fillColor = this.grassColor;
        this.graphics.rect(
            -this.mapWidth / 2, 
            -this.mapHeight / 2, 
            this.mapWidth, 
            this.mapHeight
        );
        this.graphics.fill();

        // 添加一些草地纹理细节（深色斑点）
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

        // 添加浅色斑点
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

        // 绘制地图边界（可选）
        this.graphics.lineWidth = 5;
        this.graphics.strokeColor = new Color(50, 100, 50, 255);
        this.graphics.rect(
            -this.mapWidth / 2, 
            -this.mapHeight / 2, 
            this.mapWidth, 
            this.mapHeight
        );
        this.graphics.stroke();
    }
}
