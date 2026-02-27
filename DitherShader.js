export const DitherShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "uResolution": { value: null },
        "uTime": { value: 0.0 }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 uResolution;
        uniform float uTime;
        varying vec2 vUv;

        const mat4 ditherTable = mat4(
            0.0625, 0.5625, 0.1875, 0.6875,
            0.8125, 0.3125, 0.9375, 0.4375,
            0.2500, 0.7500, 0.1250, 0.6250,
            1.0000, 0.5000, 0.8750, 0.3750
        );

        float getDitherLimit(vec2 coord) {
            int x = int(mod(coord.x, 4.0));
            int y = int(mod(coord.y, 4.0));
            if (x == 0) {
                if (y == 0) return ditherTable[0][0];
                if (y == 1) return ditherTable[0][1];
                if (y == 2) return ditherTable[0][2];
                return ditherTable[0][3];
            }
            if (x == 1) {
                if (y == 0) return ditherTable[1][0];
                if (y == 1) return ditherTable[1][1];
                if (y == 2) return ditherTable[1][2];
                return ditherTable[1][3];
            }
            if (x == 2) {
                if (y == 0) return ditherTable[2][0];
                if (y == 1) return ditherTable[2][1];
                if (y == 2) return ditherTable[2][2];
                return ditherTable[2][3];
            }
            if (y == 0) return ditherTable[3][0];
            if (y == 1) return ditherTable[3][1];
            if (y == 2) return ditherTable[3][2];
            return ditherTable[3][3];
        }

        void main() {
            vec2 uv = vUv;
            
            float caStrength = 0.003 + sin(uTime * 1.5) * 0.001;
            vec4 color;
            color.r = texture2D(tDiffuse, uv + vec2(caStrength, 0.0)).r;
            color.g = texture2D(tDiffuse, uv).g;
            color.b = texture2D(tDiffuse, uv - vec2(caStrength, 0.0)).b;
            color.a = texture2D(tDiffuse, uv).a;

            float limit = getDitherLimit(gl_FragCoord.xy);
            
            float rD = step(limit, color.r);
            float gD = step(limit, color.g);
            float bD = step(limit, color.b);
            
            vec3 finalColor = vec3(rD, gD, bD);
            
            float noise = fract(sin(dot(uv, vec2(12.9898, 78.233) + uTime)) * 43758.5453);
            finalColor -= noise * 0.15;

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
};
