import { SceneGraph } from './Scene.js';

class App {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.sceneGraph = new SceneGraph(this.container);
        this.bindEvents();
        this.initScrollAnimations();
    }

    bindEvents() {
        window.addEventListener('resize', this.onResize.bind(this));
    }

    onResize() {
        this.sceneGraph.resize();
    }

    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    }
}

new App();
