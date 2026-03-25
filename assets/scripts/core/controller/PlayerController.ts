import { _decorator, Component, Node, Input, input, KeyCode, Vec2, Vec3, find, Sprite, SpriteFrame, Texture2D, resources, Rect, ImageAsset, Camera } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 玩家控制器
 * 精灵图：3行3列，每帧50x50
 * 第1行：正向3帧
 * 第2行：左向3帧
 * 第3行：右向3帧
 * 向上移动时保留上一个水平/正面朝向
 */
@ccclass('PlayerController')
export class PlayerController extends Component {
    @property moveSpeed = 200;
    @property animSpeed = 0.15; // 动画切换速度（秒）

    // 三个方向各3帧
    frontFrames: SpriteFrame[] = [];
    leftFrames: SpriteFrame[] = [];
    rightFrames: SpriteFrame[] = [];

    moveDir: Vec2 = new Vec2();
    sprite: Sprite = null;
    animTimer: number = 0;
    currentFrame: number = 0;
    currentDirection: string = 'front'; // 当前显示的朝向
    lastMoveDir: Vec2 = new Vec2(); // 上一帧的移动方向
    cameraNode: Node = null;

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.sprite = this.node.getComponent(Sprite);

        // 查找摄像机节点
        this.cameraNode = find("Camera");
        if (!this.cameraNode) {
            this.cameraNode = find("Main Camera");
        }
        if (!this.cameraNode) {
            this.cameraNode = find("Canvas/Camera");
        }
        if (!this.cameraNode) {
            const cameras = Object.values(Camera.cameras);
            if (cameras.length > 0) {
                this.cameraNode = cameras[0].node;
            }
        }
        if (!this.cameraNode) {
            console.warn('未找到摄像机节点');
        } else {
            console.log('找到摄像机节点:', this.cameraNode.name);
        }

        this.loadPlayerSprites();
    }

    // 加载玩家精灵图集
    loadPlayerSprites() {
        console.log('开始加载玩家图集...');

        resources.load('sprites/player/spriteFrame', SpriteFrame, (err, spriteFrame) => {
            if (!err && spriteFrame && spriteFrame.texture) {
                console.log('SpriteFrame加载成功');
                this.createFramesFromTexture(spriteFrame.texture);
                return;
            }

            resources.load('sprites/player', ImageAsset, (err2, imageAsset) => {
                if (err2) {
                    console.error('加载图片失败:', err2);
                    return;
                }
                const texture = new Texture2D();
                texture.image = imageAsset;
                this.createFramesFromTexture(texture);
            });
        });
    }

    // 从纹理切割精灵帧（3行3列，每帧50x50）
    createFramesFromTexture(texture: Texture2D) {
        if (!texture) {
            console.error('纹理为空');
            return;
        }

        const cols = 3;
        const rows = 3;
        const frameW = texture.width / cols;   // 747 / 3 = 249
        const frameH = texture.height / rows;  // 891 / 3 = 297
        console.log(`图片尺寸: ${texture.width} x ${texture.height}，每帧: ${frameW} x ${frameH}`);

        // 创建所有帧（3行3列）
        const allFrames: SpriteFrame[][] = [[], [], []];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const frame = new SpriteFrame();
                frame.texture = texture;
                // Cocos纹理坐标原点在左下角，所以Y要翻转
                frame.rect = new Rect(
                    col * frameW,
                    (rows - 1 - row) * frameH,
                    frameW,
                    frameH
                );
                allFrames[row].push(frame);
            }
        }

        // 图片从上到下：第1行正向，第2行左向，第3行右向
        // 由于纹理Y轴翻转，实际读取顺序相反
        this.frontFrames = allFrames[2];
        this.leftFrames = allFrames[1];
        this.rightFrames = allFrames[0];

        console.log('精灵帧创建完成');

        // 设置初始帧
        if (this.sprite && this.frontFrames.length > 0) {
            this.sprite.spriteFrame = this.frontFrames[0];
            console.log('已设置初始精灵帧');
        } else {
            console.error('Sprite组件未找到或帧数组为空');
        }
    }

    onKeyDown(event: any) {
        switch (event.keyCode) {
            case KeyCode.KEY_W: this.moveDir.y = 1; break;
            case KeyCode.KEY_S: this.moveDir.y = -1; break;
            case KeyCode.KEY_A: this.moveDir.x = -1; break;
            case KeyCode.KEY_D: this.moveDir.x = 1; break;
        }
    }

    onKeyUp(event: any) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.KEY_S:
                this.moveDir.y = 0;
                break;
            case KeyCode.KEY_A:
            case KeyCode.KEY_D:
                this.moveDir.x = 0;
                break;
        }
    }

    update(dt: number) {
        if (this.moveDir.length() > 0) {
            this.moveDir.normalize();
            const v3 = new Vec3(
                this.moveDir.x * this.moveSpeed * dt,
                this.moveDir.y * this.moveSpeed * dt
            );
            this.node.setPosition(this.node.position.add(v3));

            // 更新朝向（只在左右或下方向时更新，向上保留上一次朝向）
            this.updateDirection();

            // 播放行走动画
            this.playWalkAnimation(dt);
        } else {
            // 停止时显示站立帧（第0帧）
            this.showIdleFrame();
        }

        // 摄像机跟随
        if (this.cameraNode) {
            this.cameraNode.setPosition(this.node.position.x, this.node.position.y, 1000);
        }
    }

    // 更新朝向：左右移动时切换，向下切换为正向，向上时保持上一个朝向
    updateDirection() {
        if (Math.abs(this.moveDir.x) >= Math.abs(this.moveDir.y)) {
            // 左右优先
            if (this.moveDir.x < 0) {
                this.currentDirection = 'left';
            } else if (this.moveDir.x > 0) {
                this.currentDirection = 'right';
            }
        } else {
            // 纯上下移动
            if (this.moveDir.y < 0) {
                // 向下：显示正向
                this.currentDirection = 'front';
            } else if (this.moveDir.y > 0) {
                // 向上：只在刚开始向上移动时随机一次左或右
                const justStartedUp = this.lastMoveDir.y <= 0;
                if (justStartedUp) {
                    this.currentDirection = Math.random() < 0.5 ? 'left' : 'right';
                }
            }
        }
        // 记录本帧方向
        this.lastMoveDir.set(this.moveDir);
    }

    // 播放行走动画（循环3帧）
    playWalkAnimation(dt: number) {
        this.animTimer += dt;
        if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % 3; // 3帧循环

            const frames = this.getCurrentFrames();
            if (frames && frames.length >= 3 && this.sprite) {
                this.sprite.spriteFrame = frames[this.currentFrame];
            }
        }
    }

    // 显示站立帧（第0帧）
    showIdleFrame() {
        const frames = this.getCurrentFrames();
        if (frames && frames.length > 0 && this.sprite) {
            this.sprite.spriteFrame = frames[0];
        }
        this.currentFrame = 0;
        this.animTimer = 0;
    }

    // 获取当前方向的帧数组
    getCurrentFrames(): SpriteFrame[] {
        switch (this.currentDirection) {
            case 'left': return this.leftFrames;
            case 'right': return this.rightFrames;
            case 'front':
            default: return this.frontFrames;
        }
    }
}
