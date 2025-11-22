/**
 * 电子云可视化应用主程序
 */

class ElectronCloudVisualizer {
    constructor() {
        // 当前状态
        this.state = {
            atom: 'H',
            n: 3,
            l: 0,
            m: 0,
            Z: 1,
            particleCount: 30000,
            opacity: 0.6,
            particleSize: 2.0,
            color: '#00ffff'
        };

        // Three.js 相关
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.particles = null;

        // 2D Canvas
        this.canvas2D = null;
        this.ctx2D = null;

        // 性能监控
        this.lastTime = performance.now();
        this.frameCount = 0;

        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.setupEventListeners();
        this.setup3DScene();
        this.setup2DCanvas();
        this.updateQuantumNumbers();
        this.updateVisualization();
        this.animate();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 原子选择
        document.getElementById('atom-select').addEventListener('change', (e) => {
            this.state.atom = e.target.value;
            this.state.Z = orbitalMath.getAtomicNumber(this.state.atom);
            this.updateVisualization();
        });

        // 主量子数
        document.getElementById('n-select').addEventListener('change', (e) => {
            this.state.n = parseInt(e.target.value);
            this.updateQuantumNumbers();
            this.updateVisualization();
        });

        // 粒子数量
        const particleCount = document.getElementById('particle-count');
        const particleCountValue = document.getElementById('particle-count-value');
        particleCount.addEventListener('input', (e) => {
            this.state.particleCount = parseInt(e.target.value);
            particleCountValue.textContent = this.state.particleCount.toLocaleString();
        });
        particleCount.addEventListener('change', () => {
            this.updateVisualization();
        });

        // 透明度
        const opacity = document.getElementById('opacity');
        const opacityValue = document.getElementById('opacity-value');
        opacity.addEventListener('input', (e) => {
            this.state.opacity = parseFloat(e.target.value);
            opacityValue.textContent = this.state.opacity.toFixed(2);
            if (this.particles) {
                this.particles.material.opacity = this.state.opacity;
            }
        });

        // 粒子大小
        const particleSize = document.getElementById('particle-size');
        const particleSizeValue = document.getElementById('particle-size-value');
        particleSize.addEventListener('input', (e) => {
            this.state.particleSize = parseFloat(e.target.value);
            particleSizeValue.textContent = this.state.particleSize.toFixed(1);
            if (this.particles) {
                this.particles.material.size = this.state.particleSize;
            }
        });

        // 颜色选择
        document.getElementById('color-picker').addEventListener('change', (e) => {
            this.state.color = e.target.value;
            if (this.particles) {
                this.particles.material.color.set(this.state.color);
            }
        });

        // 重置视角
        document.getElementById('reset-view').addEventListener('click', () => {
            this.resetCamera();
        });

        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    /**
     * 更新量子数选项
     */
    updateQuantumNumbers() {
        const n = this.state.n;

        // 更新 l 选项
        const lButtons = document.getElementById('l-buttons');
        lButtons.innerHTML = '';

        const orbitalLabels = ['s', 'p', 'd', 'f', 'g', 'h'];

        for (let l = 0; l < n; l++) {
            const button = document.createElement('button');
            button.className = 'orbital-button';
            button.textContent = `${orbitalLabels[l]} (l=${l})`;
            button.onclick = () => {
                this.state.l = l;
                this.updateMButtons();
                this.updateVisualization();
                // 更新按钮状态
                document.querySelectorAll('#l-buttons .orbital-button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
            };

            if (l === this.state.l) {
                button.classList.add('active');
            }

            lButtons.appendChild(button);
        }

        // 如果当前 l 超出范围，重置为 0
        if (this.state.l >= n) {
            this.state.l = 0;
        }

        this.updateMButtons();
    }

    /**
     * 更新 m 选项
     */
    updateMButtons() {
        const l = this.state.l;
        const mButtons = document.getElementById('m-buttons');
        mButtons.innerHTML = '';

        for (let m = -l; m <= l; m++) {
            const button = document.createElement('button');
            button.className = 'orbital-button';
            button.textContent = `m = ${m >= 0 ? '+' : ''}${m}`;
            button.onclick = () => {
                this.state.m = m;
                this.updateVisualization();
                // 更新按钮状态
                document.querySelectorAll('#m-buttons .orbital-button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
            };

            if (m === this.state.m) {
                button.classList.add('active');
            }

            mButtons.appendChild(button);
        }

        // 如果当前 m 超出范围，重置为 0
        if (Math.abs(this.state.m) > l) {
            this.state.m = 0;
        }
    }

    /**
     * 设置 3D 场景
     */
    setup3DScene() {
        const container = document.getElementById('canvas-3d');

        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        // 创建相机
        const width = container.clientWidth;
        const height = container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        this.camera.position.set(30, 30, 30);
        this.camera.lookAt(0, 0, 0);

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // 添加轨道控制器
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 150;

        // 添加坐标轴辅助
        const axesHelper = new THREE.AxesHelper(20);
        axesHelper.material.transparent = true;
        axesHelper.material.opacity = 0.5;
        this.scene.add(axesHelper);

        // 添加网格辅助
        const gridHelper = new THREE.GridHelper(50, 20, 0x444444, 0x222222);
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.2;
        this.scene.add(gridHelper);

        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // 添加点光源
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(20, 20, 20);
        this.scene.add(pointLight);
    }

    /**
     * 设置 2D Canvas
     */
    setup2DCanvas() {
        this.canvas2D = document.getElementById('canvas-2d-element');
        this.ctx2D = this.canvas2D.getContext('2d');

        const container = document.getElementById('canvas-2d');
        this.canvas2D.width = container.clientWidth;
        this.canvas2D.height = container.clientHeight;
    }

    /**
     * 更新可视化
     */
    updateVisualization() {
        this.showLoading(true);

        // 使用 setTimeout 让加载提示能够显示
        setTimeout(() => {
            this.update3DVisualization();
            this.update2DVisualization();
            this.updateFormulas();
            this.updateInfo();
            this.showLoading(false);
        }, 50);
    }

    /**
     * 更新 3D 可视化
     */
    update3DVisualization() {
        // 移除旧的粒子系统
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }

        const { n, l, m, Z, particleCount } = this.state;

        // 计算最大半径
        const maxRadius = orbitalMath.getMaxRadius(n, Z);

        // 生成随机点
        const points = orbitalMath.generateRandomPoints(n, l, m, Z, particleCount, maxRadius);

        // 创建粒子几何体
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(points.length * 3);
        const colors = new Float32Array(points.length * 3);

        const color = new THREE.Color(this.state.color);

        for (let i = 0; i < points.length; i++) {
            positions[i * 3] = points[i].x;
            positions[i * 3 + 1] = points[i].y;
            positions[i * 3 + 2] = points[i].z;

            // 根据密度调整颜色强度
            const intensity = Math.min(1, points[i].density * 100);
            colors[i * 3] = color.r * intensity;
            colors[i * 3 + 1] = color.g * intensity;
            colors[i * 3 + 2] = color.b * intensity;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // 创建粒子材质
        const material = new THREE.PointsMaterial({
            size: this.state.particleSize,
            vertexColors: true,
            transparent: true,
            opacity: this.state.opacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // 创建粒子系统
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // 更新统计信息
        document.getElementById('stat-particles').textContent = points.length.toLocaleString();
    }

    /**
     * 更新 2D 可视化
     */
    update2DVisualization() {
        const { n, l, m, Z } = this.state;
        const maxRadius = orbitalMath.getMaxRadius(n, Z);

        const resolution = 150;
        const data = orbitalMath.calculate2DSlice(n, l, m, Z, resolution, maxRadius);

        // 找到最大值用于归一化
        let maxValue = 0;
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                maxValue = Math.max(maxValue, data[i][j]);
            }
        }

        // 绘制热力图
        const width = this.canvas2D.width;
        const height = this.canvas2D.height;
        const cellWidth = width / resolution;
        const cellHeight = height / resolution;

        this.ctx2D.clearRect(0, 0, width, height);

        // 绘制背景
        this.ctx2D.fillStyle = '#1a1a2e';
        this.ctx2D.fillRect(0, 0, width, height);

        // 绘制热力图
        for (let i = 0; i < resolution; i++) {
            for (let j = 0; j < resolution; j++) {
                const value = data[i][j];
                const normalized = maxValue > 0 ? value / maxValue : 0;

                // 使用颜色映射
                const color = this.valueToColor(normalized);
                this.ctx2D.fillStyle = color;
                this.ctx2D.fillRect(i * cellWidth, (resolution - 1 - j) * cellHeight, cellWidth + 1, cellHeight + 1);
            }
        }

        // 绘制坐标轴
        this.drawAxes();

        // 添加标题
        this.ctx2D.fillStyle = 'white';
        this.ctx2D.font = 'bold 14px Inter';
        this.ctx2D.fillText('XY 平面截面 (z = 0)', 10, 20);
    }

    /**
     * 将值转换为颜色（使用热力图配色）
     */
    valueToColor(value) {
        // 使用从黑色到蓝色到青色到白色的渐变
        if (value < 0.01) {
            return 'rgba(26, 26, 46, 1)';
        } else if (value < 0.25) {
            const t = value / 0.25;
            return `rgba(0, 0, ${Math.floor(100 * t)}, ${0.5 + 0.5 * t})`;
        } else if (value < 0.5) {
            const t = (value - 0.25) / 0.25;
            return `rgba(0, ${Math.floor(100 * t)}, ${100 + Math.floor(155 * t)}, ${0.7 + 0.3 * t})`;
        } else if (value < 0.75) {
            const t = (value - 0.5) / 0.25;
            return `rgba(${Math.floor(100 * t)}, ${100 + Math.floor(155 * t)}, 255, 1)`;
        } else {
            const t = (value - 0.75) / 0.25;
            return `rgba(${100 + Math.floor(155 * t)}, 255, 255, 1)`;
        }
    }

    /**
     * 绘制坐标轴
     */
    drawAxes() {
        const width = this.canvas2D.width;
        const height = this.canvas2D.height;
        const centerX = width / 2;
        const centerY = height / 2;

        this.ctx2D.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx2D.lineWidth = 2;

        // X 轴
        this.ctx2D.beginPath();
        this.ctx2D.moveTo(0, centerY);
        this.ctx2D.lineTo(width, centerY);
        this.ctx2D.stroke();

        // Y 轴
        this.ctx2D.beginPath();
        this.ctx2D.moveTo(centerX, 0);
        this.ctx2D.lineTo(centerX, height);
        this.ctx2D.stroke();

        // 标签
        this.ctx2D.fillStyle = 'white';
        this.ctx2D.font = '12px Inter';
        this.ctx2D.fillText('X', width - 20, centerY - 10);
        this.ctx2D.fillText('Y', centerX + 10, 20);
    }

    /**
     * 更新波函数公式
     */
    updateFormulas() {
        const { n, l, m } = this.state;
        const formulas = orbitalMath.getWavefunctionFormula(n, l, m);

        // 渲染 LaTeX
        this.renderLatex('wavefunction-full', formulas.full);
        this.renderLatex('wavefunction-radial', formulas.radial);
        this.renderLatex('wavefunction-angular', formulas.angular);
    }

    /**
     * 渲染 LaTeX 公式
     */
    renderLatex(elementId, latex) {
        const element = document.getElementById(elementId);
        try {
            katex.render(latex, element, {
                throwOnError: false,
                displayMode: true
            });
        } catch (e) {
            element.textContent = latex;
        }
    }

    /**
     * 更新信息面板
     */
    updateInfo() {
        const { atom, n, l, m } = this.state;

        document.getElementById('info-atom').textContent = orbitalMath.getAtomName(atom);
        document.getElementById('info-n').textContent = n;
        document.getElementById('info-l').textContent = l;
        document.getElementById('info-m').textContent = m;
        document.getElementById('info-orbital').textContent = orbitalMath.getOrbitalName(n, l);
    }

    /**
     * 显示/隐藏加载提示
     */
    showLoading(show) {
        const loading = document.getElementById('loading-3d');
        loading.style.display = show ? 'block' : 'none';
    }

    /**
     * 重置相机位置
     */
    resetCamera() {
        this.camera.position.set(30, 30, 30);
        this.camera.lookAt(0, 0, 0);
        this.controls.reset();
    }

    /**
     * 窗口大小调整
     */
    onWindowResize() {
        const container3D = document.getElementById('canvas-3d');
        const width = container3D.clientWidth;
        const height = container3D.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);

        // 调整 2D Canvas
        const container2D = document.getElementById('canvas-2d');
        this.canvas2D.width = container2D.clientWidth;
        this.canvas2D.height = container2D.clientHeight;
        this.update2DVisualization();
    }

    /**
     * 动画循环
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        this.controls.update();
        this.renderer.render(this.scene, this.camera);

        // 更新 FPS
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            document.getElementById('stat-fps').textContent = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        // 轻微旋转粒子系统（可选）
        if (this.particles) {
            // this.particles.rotation.y += 0.001;
        }
    }
}

// 当页面加载完成后初始化应用
window.addEventListener('DOMContentLoaded', () => {
    const app = new ElectronCloudVisualizer();
    window.app = app; // 用于调试
});
