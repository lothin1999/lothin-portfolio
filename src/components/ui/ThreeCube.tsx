"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeCubeProps {
  images?: string[];
}

export function ThreeCube({ images = [] }: ThreeCubeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 192;
    const height = container.clientHeight || 192;

    // Create scene
    const scene = new THREE.Scene();

    // Helper for responsive camera Z position
    const getResponsiveZ = (w: number) => {
      if (w < 200) return 3.0;
      if (w < 300) return 2.7;
      return 2.4; // Zoomed in closer to fill container nicely on large screens
    };

    // Create camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = getResponsiveZ(width);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    // Create helper for placeholder face textures
    const createPlaceholderTexture = (faceName: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Techy premium background gradient
        const grad = ctx.createLinearGradient(0, 0, 256, 256);
        grad.addColorStop(0, "#121214");
        grad.addColorStop(1, "#1c1c22");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);

        // Grid lines
        ctx.strokeStyle = "rgba(201, 163, 92, 0.25)"; // Accent color overlay
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 236, 236);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 32; i < 256; i += 32) {
          ctx.moveTo(i, 10); ctx.lineTo(i, 246);
          ctx.moveTo(10, i); ctx.lineTo(246, i);
        }
        ctx.stroke();

        // Technical details text
        ctx.fillStyle = "rgba(201, 163, 92, 0.8)";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.fillText("SYS.CUBE.FACE", 128, 70);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px monospace";
        ctx.fillText(faceName.toUpperCase(), 128, 130);

        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "10px monospace";
        ctx.fillText("[ UPLOAD IMAGE ]", 128, 185);
      }
      return new THREE.CanvasTexture(canvas);
    };

    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const faceNames = ["Right", "Left", "Top", "Bottom", "Front", "Back"];
    
    const materials = faceNames.map((name, index) => {
      const url = images[index];
      if (url) {
        const texture = textureLoader.load(url);
        texture.minFilter = THREE.LinearFilter;
        return new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      } else {
        return new THREE.MeshBasicMaterial({ map: createPlaceholderTexture(name), side: THREE.DoubleSide });
      }
    });

    // Create cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // Initial subtle tilt (almost front-facing to show the face clearly)
    cube.rotation.x = 0.05;
    cube.rotation.y = 0.05;

    // Interactive Drag handlers
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // We keep track of manual rotation speeds that decay over time for momentum feel
    let velocityX = 0;
    let velocityY = 0;

    // Zoom state
    let touchStartDist = 0;
    let baseCameraZ = camera.position.z;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      velocityX = 0;
      velocityY = 0;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      // Update velocities
      velocityY = deltaX * 0.007;
      velocityX = deltaY * 0.007;

      cube.rotation.y += velocityY;
      cube.rotation.x += velocityX;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Zoom with scroll wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.003;
      // Clamp between 1.6 and 6.0 to prevent zooming too far
      camera.position.z = Math.max(1.6, Math.min(6.0, camera.position.z));
    };

    // Touch handlers for mobile (Drag & Pinch zoom)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        velocityX = 0;
        velocityY = 0;
      } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDist = Math.sqrt(dx * dx + dy * dy);
        baseCameraZ = camera.position.z;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        velocityY = deltaX * 0.007;
        velocityX = deltaY * 0.007;

        cube.rotation.y += velocityY;
        cube.rotation.x += velocityX;

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (touchStartDist > 0) {
          const factor = touchStartDist / dist;
          camera.position.z = Math.max(1.6, Math.min(6.0, baseCameraZ * factor));
        }
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      touchStartDist = 0;
    };

    // Attach events
    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isDragging) {
        // Apply decay to drag momentum velocity
        if (Math.abs(velocityX) > 0.0001) {
          cube.rotation.x += velocityX;
          velocityX *= 0.95;
        }
        if (Math.abs(velocityY) > 0.0001) {
          cube.rotation.y += velocityY;
          velocityY *= 0.95;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (!containerRef.current) continue;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        if (w === 0 || h === 0) continue;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);

        // Update responsive camera zoom Z
        camera.position.z = getResponsiveZ(w);
      }
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);

      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      // Dispose resources
      geometry.dispose();
      materials.forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [images]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-grab active:cursor-grabbing select-none outline-none relative overflow-hidden"
      style={{ touchAction: "none" }}
    />
  );
}
