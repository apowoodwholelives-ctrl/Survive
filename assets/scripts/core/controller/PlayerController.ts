import { _decorator, Component, Node, Input, input, KeyCode, Vec2, Vec3, find, Sprite, SpriteFrame, Texture2D, resources, Rect, ImageAsset, Camera, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerController')
export class PlayerController extends Component {
    @property moveSpeed = 200;
    @property animSpeed = 0.2; // 动画切换速度（秒）
    
    @property frameWidth = 512; // 每帧宽度（2048/4列）
    @property frameHeight = 512; // 每帧高度（2048/4行）
    
    // 四个方向的精灵帧（每个方向2帧：站立、行走）
    frontFrames: SpriteFrame[] = []; // 正向：站立、行走
    leftFrames: SpriteFrame[] = []; // 左向：站立、行走
    rightFrames: SpriteFrame[] = []; // 右向：站立、行走
    backFrames: SpriteFrame[] = []; // 背向：站立、行走
    
    moveDir: Vec2 = new Vec2();
    sprite: Sprite = null;
    animTimer: number = 0;
    currentFrame: number = 0;
    currentDirection: string = 'front'; // 当前朝向
    cameraNode: Node = null; // 缓存摄像机节点

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.sprite = this.node.getComponent(Sprite);
        
        // 查找摄像机节点
        this.cameraNode = find("Main Camera");
        if (!this.cameraNode) {
            // 尝试查找 Camera
            this.cameraNode = find("Camera");
        }
        if (!this.cameraNode) {
            // 如果找不到"Main Camera"，尝试查找Canvas下的Camera
            this.cameraNode = find("Canvas/Camera");
        }
        if (!this.cameraNode) {
            // 尝试查找任意摄像机组件
            const cameras = Object.values(Camera.cameras);
            if (cameras.length > 0) {
                this.cameraNode = cameras[0].node;
            }
        }
        if (!this.cameraNode) {
            console.warn('未找到摄像机节点，摄像机跟随功能将禁用');
        } else {
            console.log('找到摄像机节点:', this.cameraNode.name);
        }
        
        // 加载并切割图集
        this.loadPlayerSprites();
    }

    // 加载玩家精灵图集并切割
    loadPlayerSprites() {
        console.log('开始加载玩家图集...');
        
        // 先尝试加载SpriteFrame
        resources.load('sprites/player/spriteFrame', SpriteFrame, (err, spriteFrame) => {
            if (!err && spriteFrame && spriteFrame.texture) {
                console.log('通过SpriteFrame加载成功');
                this.createFramesFromTexture(spriteFrame.texture);
                return;
            }
            
            console.log('SpriteFrame加载失败，尝试直接加载图片...');
            
            // 如果SpriteFrame加载失败，尝试加载ImageAsset
            resources.load('sprites/player', ImageAsset, (err2, imageAsset) => {
                if (err2) {
                    console.error('加载图片失败:', err2);
                    console.log('请确认图片在 assets/resources/sprites/player.png');
                    return;
                }
                
                console.log('ImageAsset加载成功，创建纹理...');
                const texture = new Texture2D();
                texture.image = imageAsset;
                this.createFramesFromTexture(texture);
            });
        });
    }
    
    // 从纹理创建精灵帧
    createFramesFromTexture(texture: Texture2D) {
        if (!texture) {
            console.error('纹理为空');
            return;
        }
        
        // 获取图片总尺寸
        const textureWidth = texture.width;
        const textureHeight = texture.height;
        console.log(`图片尺寸: ${textureWidth} x ${textureHeight}`);
        
        // 计算每帧的实际尺寸（4行4列）
        const frameW = textureWidth / 4; // 4列
        const frameH = textureHeight / 4; // 4行
        console.log(`每帧尺寸: ${frameW} x ${frameH}`);
        
        // 创建所有SpriteFrame（4行4列）
        const allFrames: SpriteFrame[][] = [[], [], [], []];
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const frame = new SpriteFrame();
                frame.texture = texture;
                
                // 设置切割区域（注意：Cocos的纹理坐标原点在左下角）
                const rect = new Rect(
                    col * frameW,
                    (3 - row) * frameH, // 从下往上数
                    frameW,
                    frameH
                );
                frame.rect = rect;
                
                allFrames[row].push(frame);
            }
        }
        
        // 分配到对应方向数组（每个方向使用前2帧作为站立和行走）
        this.frontFrames = [allFrames[0][0], allFrames[0][1]]; // 正向：第1行前2帧
        this.leftFrames = [allFrames[1][0], allFrames[1][1]];  // 左向：第2行前2帧
        this.rightFrames = [allFrames[2][0], allFrames[2][1]]; // 右向：第3行前2帧
        this.backFrames = [allFrames[3][0], allFrames[3][1]];  // 背向：第4行前2帧
        
        console.log('精灵帧创建完成');
        
        // 设置初始显示帧
        if (this.sprite && this.frontFrames.length > 0) {
            this.sprite.spriteFrame = this.frontFrames[0];
            console.log('已设置初始精灵帧');
        } else {
            console.error('Sprite组件未找到或帧数组为空');
        }
        
        console.log('玩家图集加载完成');
    }

    onKeyDown(event: any) {
        switch (event.keyCode) {
            case KeyCode.KEY_W: this.moveDir.y = 1; break; // 向上（Y坐标增加）
            case KeyCode.KEY_S: this.moveDir.y = -1; break; // 向下（Y坐标减少）
            case KeyCode.KEY_A: this.moveDir.x = -1; break; // 向左
            case KeyCode.KEY_D: this.moveDir.x = 1; break; // 向右
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
        // 移动逻辑
        if (this.moveDir.length() > 0) {
            this.moveDir.normalize();
            const v3 = new Vec3(this.moveDir.x * this.moveSpeed * dt, this.moveDir.y * this.moveSpeed * dt);
            this.node.setPosition(this.node.position.add(v3));
            
            // 更新方向
            this.updateDirection();
            
            // 播放行走动画
            this.playWalkAnimation(dt);
        } else {
            // 停止时显示站立帧
            this.showIdleFrame();
        }

        // 摄像机跟随
        if (this.cameraNode) {
            this.cameraNode.setPosition(this.node.position.x, this.node.position.y, 1000);
        }
    }

    // 根据移动方向更新角色朝向
    updateDirection() {
        if (Math.abs(this.moveDir.x) > Math.abs(this.moveDir.y)) {
            // 左右移动优先
            if (this.moveDir.x < 0) {
                this.currentDirection = 'left';
            } else {
                this.currentDirection = 'right';
            }
        } else {
            // 上下移动
            if (this.moveDir.y < 0) {
                this.currentDirection = 'back'; // Y坐标减小，往上走，显示背面
            } else {
                this.currentDirection = 'front'; // Y坐标增加，往下走，显示正面
            }
        }
    }

    // 播放行走动画
    playWalkAnimation(dt: number) {
        this.animTimer += dt;
        if (this.animTimer >= this.animSpeed) {
            this.animTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % 2; // 在0和1之间切换
            
            const frames = this.getCurrentFrames();
            if (frames && frames.length >= 2 && this.sprite) {
                this.sprite.spriteFrame = frames[this.currentFrame];
            }
        }
    }

    // 显示站立帧
    showIdleFrame() {
        const frames = this.getCurrentFrames();
        if (frames && frames.length > 0 && this.sprite) {
            this.sprite.spriteFrame = frames[0]; // 第一帧是站立帧
        }
        this.currentFrame = 0;
        this.animTimer = 0;
    }

    // 获取当前方向的帧数组
    getCurrentFrames(): SpriteFrame[] {
        switch (this.currentDirection) {
            case 'front': return this.frontFrames;
            case 'left': return this.leftFrames;
            case 'right': return this.rightFrames;
            case 'back': return this.backFrames;
            default: return this.frontFrames;
        }
    }
}