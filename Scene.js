import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/ShaderPass.js';
import gsap from 'https://esm.sh/gsap@3.12.5';
import { DitherShader } from './DitherShader.js';

export class SceneGraph {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020202);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 6;

        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = false;

        this.composer = new EffectComposer(this.renderer);
        this.renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(this.renderPass);

        this.ditherPass = new ShaderPass(DitherShader);
        this.ditherPass.uniforms['uResolution'].value = new THREE.Vector2(window.innerWidth, window.innerHeight);
        this.composer.addPass(this.ditherPass);

        this.objects = [];
        this.createObjects();
        this.bindMouseEvents();

        this.clock = new THREE.Clock();
        this.animate();
    }

    createObjects() {
        const geometry = new THREE.IcosahedronGeometry(2, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });

        this.mainMesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mainMesh);
        this.objects.push(this.mainMesh);

        const innerGeometry = new THREE.IcosahedronGeometry(1.5, 0);
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            wireframe: true
        });

        this.innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
        this.scene.add(this.innerMesh);

        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 4000;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 20;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: 0xffaa00
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);

        gsap.to(this.mainMesh.rotation, {
            y: Math.PI * 2,
            x: Math.PI * 2,
            duration: 30,
            repeat: -1,
            ease: "none"
        });

        gsap.to(this.innerMesh.rotation, {
            y: -Math.PI * 2,
            z: Math.PI * 2,
            duration: 20,
            repeat: -1,
            ease: "none"
        });
    }

    bindMouseEvents() {
        this.mouse = new THREE.Vector2();
        this.targetRotation = new THREE.Vector2();
        this.scrollY = 0;

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

            gsap.to(this.targetRotation, {
                x: this.mouse.y * 0.5,
                y: this.mouse.x * 0.5,
                duration: 2,
                ease: "power2.out"
            });
        });

        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
            gsap.to(this.camera.position, {
                z: 6 + this.scrollY * 0.005,
                y: -(this.scrollY * 0.002),
                duration: 1,
                ease: "power2.out"
            });
            gsap.to(this.scene.rotation, {
                z: this.scrollY * 0.001,
                duration: 1,
                ease: "power2.out"
            });
        });
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
        if (this.ditherPass.uniforms['uResolution']) {
            this.ditherPass.uniforms['uResolution'].value.set(window.innerWidth, window.innerHeight);
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const elapsedTime = this.clock.getElapsedTime();
        this.ditherPass.uniforms['uTime'].value = elapsedTime;

        if (this.mainMesh && this.targetRotation) {
            this.scene.rotation.x += (this.targetRotation.x - this.scene.rotation.x) * 0.05;
            this.scene.rotation.y += (this.targetRotation.y - this.scene.rotation.y) * 0.05;
        }

        this.particles.position.y = Math.sin(elapsedTime * 0.2) * 0.5;

        this.controls.update();
        this.composer.render();
    }
}
