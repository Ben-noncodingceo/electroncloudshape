/**
 * 氢原子波函数计算模块
 * 包含径向波函数、球谐函数和完整波函数的计算
 */

class OrbitalMath {
    constructor() {
        // 玻尔半径 (单位: Å)
        this.a0 = 0.529177;
    }

    /**
     * 计算阶乘
     */
    factorial(n) {
        if (n <= 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    /**
     * 计算连带勒让德多项式 P_l^m(x)
     */
    associatedLegendre(l, m, x) {
        // 使用递推关系计算
        const absM = Math.abs(m);

        // P_m^m(x) = (-1)^m * (2m-1)!! * (1-x^2)^(m/2)
        let pmm = 1.0;
        if (absM > 0) {
            const somx2 = Math.sqrt((1.0 - x) * (1.0 + x));
            let fact = 1.0;
            for (let i = 1; i <= absM; i++) {
                pmm *= -fact * somx2;
                fact += 2.0;
            }
        }

        if (l === absM) {
            return m >= 0 ? pmm : pmm * (m % 2 === 0 ? 1 : -1);
        }

        // P_{m+1}^m(x) = x * (2m+1) * P_m^m(x)
        let pmmp1 = x * (2 * absM + 1) * pmm;

        if (l === absM + 1) {
            return m >= 0 ? pmmp1 : pmmp1 * (m % 2 === 0 ? 1 : -1);
        }

        // P_l^m(x) 递推: (l-m) * P_l^m = x * (2l-1) * P_{l-1}^m - (l+m-1) * P_{l-2}^m
        let pll = 0.0;
        for (let ll = absM + 2; ll <= l; ll++) {
            pll = (x * (2 * ll - 1) * pmmp1 - (ll + absM - 1) * pmm) / (ll - absM);
            pmm = pmmp1;
            pmmp1 = pll;
        }

        return m >= 0 ? pll : pll * (m % 2 === 0 ? 1 : -1);
    }

    /**
     * 计算球谐函数 Y_l^m(theta, phi)
     * 返回复数的实部（用于可视化）
     */
    sphericalHarmonic(l, m, theta, phi) {
        const absM = Math.abs(m);

        // 归一化常数
        const normalization = Math.sqrt(
            ((2 * l + 1) * this.factorial(l - absM)) /
            (4 * Math.PI * this.factorial(l + absM))
        );

        const legendre = this.associatedLegendre(l, absM, Math.cos(theta));

        // 对于实数可视化，我们使用实球谐函数
        let result;
        if (m > 0) {
            result = normalization * legendre * Math.sqrt(2) * Math.cos(m * phi);
        } else if (m < 0) {
            result = normalization * legendre * Math.sqrt(2) * Math.sin(absM * phi);
        } else {
            result = normalization * legendre;
        }

        return result;
    }

    /**
     * 计算广义拉盖尔多项式 L_n^k(x)
     */
    generalizedLaguerre(n, k, x) {
        if (n === 0) return 1.0;
        if (n === 1) return 1.0 + k - x;

        let l0 = 1.0;
        let l1 = 1.0 + k - x;
        let ln = 0.0;

        for (let i = 2; i <= n; i++) {
            ln = ((2 * i - 1 + k - x) * l1 - (i - 1 + k) * l0) / i;
            l0 = l1;
            l1 = ln;
        }

        return ln;
    }

    /**
     * 计算径向波函数 R_nl(r)
     * Z: 核电荷数
     * n: 主量子数
     * l: 角量子数
     * r: 半径 (单位: a0)
     */
    radialWavefunction(n, l, r, Z = 1) {
        const rho = (2 * Z * r) / (n * this.a0);

        // 归一化常数
        const normalization = Math.sqrt(
            Math.pow(2 * Z / (n * this.a0), 3) *
            this.factorial(n - l - 1) /
            (2 * n * this.factorial(n + l))
        );

        // R_nl = normalization * rho^l * exp(-rho/2) * L_{n-l-1}^{2l+1}(rho)
        const laguerre = this.generalizedLaguerre(n - l - 1, 2 * l + 1, rho);
        const radial = normalization * Math.pow(rho, l) * Math.exp(-rho / 2) * laguerre;

        return radial;
    }

    /**
     * 计算完整的波函数 ψ_nlm(r, theta, phi)
     * 返回概率密度 |ψ|^2
     */
    wavefunction(n, l, m, r, theta, phi, Z = 1) {
        const radial = this.radialWavefunction(n, l, r, Z);
        const angular = this.sphericalHarmonic(l, m, theta, phi);
        const psi = radial * angular;

        // 返回概率密度
        return psi * psi;
    }

    /**
     * 生成随机点，根据概率密度分布
     * 使用拒绝采样方法
     */
    generateRandomPoints(n, l, m, Z, numPoints, maxRadius) {
        const points = [];
        let attempts = 0;
        const maxAttempts = numPoints * 100;

        // 估算最大概率密度，用于拒绝采样
        let maxDensity = 0;
        for (let i = 0; i < 100; i++) {
            const r = Math.random() * maxRadius;
            const theta = Math.random() * Math.PI;
            const phi = Math.random() * 2 * Math.PI;
            const density = this.wavefunction(n, l, m, r, theta, phi, Z);
            maxDensity = Math.max(maxDensity, density);
        }

        maxDensity *= 1.2; // 增加一些余量

        while (points.length < numPoints && attempts < maxAttempts) {
            attempts++;

            // 在球坐标系中生成随机点
            const r = Math.random() * maxRadius;
            const theta = Math.acos(2 * Math.random() - 1); // 均匀分布在球面
            const phi = Math.random() * 2 * Math.PI;

            // 计算该点的概率密度
            const density = this.wavefunction(n, l, m, r, theta, phi, Z);

            // 拒绝采样
            if (Math.random() * maxDensity < density) {
                // 转换为笛卡尔坐标
                const x = r * Math.sin(theta) * Math.cos(phi);
                const y = r * Math.sin(theta) * Math.sin(phi);
                const z = r * Math.cos(theta);

                points.push({ x, y, z, density });
            }
        }

        return points;
    }

    /**
     * 计算2D截面的概率密度（XY平面，z=0）
     */
    calculate2DSlice(n, l, m, Z, resolution, maxRadius) {
        const data = [];
        const step = (2 * maxRadius) / resolution;

        for (let i = 0; i < resolution; i++) {
            const row = [];
            for (let j = 0; j < resolution; j++) {
                const x = -maxRadius + i * step;
                const y = -maxRadius + j * step;
                const z = 0;

                // 转换为球坐标
                const r = Math.sqrt(x * x + y * y + z * z);
                const theta = Math.acos(r > 0 ? z / r : 0);
                const phi = Math.atan2(y, x);

                const density = r < maxRadius ? this.wavefunction(n, l, m, r, theta, phi, Z) : 0;
                row.push(density);
            }
            data.push(row);
        }

        return data;
    }

    /**
     * 获取轨道名称
     */
    getOrbitalName(n, l) {
        const orbitalLabels = ['s', 'p', 'd', 'f', 'g', 'h'];
        return `${n}${orbitalLabels[l] || '?'}`;
    }

    /**
     * 获取波函数的 LaTeX 公式
     */
    getWavefunctionFormula(n, l, m) {
        const orbitalName = this.getOrbitalName(n, l);

        // 完整波函数
        const full = `\\psi_{${n},${l},${m}}(r, \\theta, \\phi) = R_{${n},${l}}(r) \\cdot Y_{${l}}^{${m}}(\\theta, \\phi)`;

        // 径向部分
        let radial = `R_{${n},${l}}(r) = `;
        radial += `\\sqrt{\\left(\\frac{2Z}{na_0}\\right)^3 \\frac{(n-l-1)!}{2n(n+l)!}}`;
        radial += ` \\left(\\frac{2Zr}{na_0}\\right)^l e^{-Zr/(na_0)} L_{n-l-1}^{2l+1}\\left(\\frac{2Zr}{na_0}\\right)`;

        // 角向部分（球谐函数）
        let angular = `Y_{${l}}^{${m}}(\\theta, \\phi) = `;
        angular += `\\sqrt{\\frac{2l+1}{4\\pi}\\frac{(l-|m|)!}{(l+|m|)!}} P_l^{|m|}(\\cos\\theta) e^{im\\phi}`;

        return { full, radial, angular };
    }

    /**
     * 根据量子数获取合理的最大半径
     */
    getMaxRadius(n, Z = 1) {
        // 主量子数越大，电子云越大
        return n * n * this.a0 * 15 / Z;
    }

    /**
     * 获取原子的核电荷数
     */
    getAtomicNumber(atomSymbol) {
        const atomicNumbers = {
            'H': 1,
            'He+': 2,
            'Li2+': 3
        };
        return atomicNumbers[atomSymbol] || 1;
    }

    /**
     * 获取原子名称
     */
    getAtomName(atomSymbol) {
        const atomNames = {
            'H': '氢 (H)',
            'He+': '氦离子 (He⁺)',
            'Li2+': '锂离子 (Li²⁺)'
        };
        return atomNames[atomSymbol] || atomSymbol;
    }
}

// 创建全局实例
const orbitalMath = new OrbitalMath();
