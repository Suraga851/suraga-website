"use strict";
/**
 * Three.js Background with Smooth Scroll Parallax
 * Optimized for high performance (converted to TypeScript)
 */
class Background3D {
    constructor() {
        // Scroll state
        this.scrollY = 0;
        this.targetScrollY = 0;
        this.scrollVelocity = 0;
        this.container = document.getElementById('canvas-container');
        this.init();
    }
    init() {
        if (!this.container)
            return;
        // 1. Scene Setup
        this.scene = new THREE.Scene();
        // 2. Camera Setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        // 3. Renderer Setup - High Performance
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false, // Performance optimization
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio
        this.container.appendChild(this.renderer.domElement);
        // 4. Load Texture & Create Geometry
        this.createObjects();
        // 5. Event Listeners
        window.addEventListener('resize', this.onResize.bind(this));
        // 6. Start Animation Loop
        this.animate();
    }
    createObjects() {
        const loader = new THREE.TextureLoader();
        loader.load('assets/images/bg-texture.jpg', (texture) => {
            this.texture = texture;
            // Calculate aspect ratio to cover screen
            const geometry = new THREE.PlaneGeometry(16, 9);
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 0.15
            });
            this.mesh = new THREE.Mesh(geometry, material);
            this.scene.add(this.mesh);
            this.resizeObject();
        });
    }
    resizeObject() {
        if (!this.mesh || !this.camera)
            return;
        const dist = this.camera.position.z;
        const height = 2 * Math.tan((this.camera.fov * Math.PI) / 360) * dist;
        const width = height * this.camera.aspect;
        this.mesh.scale.set(width / 16 * 1.5, height / 9 * 1.5, 1);
    }
    onResize() {
        if (!this.camera || !this.renderer)
            return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.resizeObject();
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.targetScrollY = window.scrollY;
        this.scrollY += (this.targetScrollY - this.scrollY) * 0.05;
        if (this.mesh) {
            this.mesh.position.y = this.scrollY * 0.0015;
            this.mesh.rotation.z = Math.sin(this.scrollY * 0.0005) * 0.02;
        }
        this.renderer.render(this.scene, this.camera);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        new Background3D();
    }
    else {
        console.error('Three.js library not found');
    }
});
