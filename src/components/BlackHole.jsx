"use client";

import React, { useRef, useEffect, useState } from "react";

const createParticle = (canvas, x, y) => {
  const angle = Math.random() * Math.PI * 2;
  const radius = (Math.random() * canvas.width) / 2 + canvas.width / 4;
  return {
    x: x ?? canvas.width / 2 + Math.cos(angle) * radius,
    y: y ?? canvas.height / 2 + Math.sin(angle) * radius,
    radius: Math.random() * 2 + 1,
    opacity: 1,
    velocity: {
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
    },
    trail: [],
    angle: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
  };
};

export default function CoolMonochromeBlackHole() {
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const blackHoleRadius = 50;
    const accretionDiskRadius = 150;
    const absorptionRadius = blackHoleRadius + 30;

    // Create initial particles (reduced count)
    const initialParticles = Array.from({ length: 300 }, () =>
      createParticle(canvas)
    );
    setParticles(initialParticles);

    let animationFrameId;
    let rotation = 0;

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw swirling accretion disk
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      for (let i = 0; i < 360; i += 5) {
        const angle = (i * Math.PI) / 180;
        const innerRadius = blackHoleRadius + 10;
        const outerRadius = accretionDiskRadius;
        const gradient = ctx.createLinearGradient(
          Math.cos(angle) * innerRadius,
          Math.sin(angle) * innerRadius,
          Math.cos(angle) * outerRadius,
          Math.sin(angle) * outerRadius
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.beginPath();
        ctx.moveTo(
          Math.cos(angle) * innerRadius,
          Math.sin(angle) * innerRadius
        );
        ctx.lineTo(
          Math.cos(angle) * outerRadius,
          Math.sin(angle) * outerRadius
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      // Draw event horizon
      const eventHorizonGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        blackHoleRadius
      );
      eventHorizonGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
      eventHorizonGradient.addColorStop(0.7, "rgba(0, 0, 0, 0.8)");
      eventHorizonGradient.addColorStop(1, "rgba(255, 255, 255, 0.1)");

      ctx.fillStyle = eventHorizonGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, blackHoleRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw gravitational lensing effect
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 360; i += 10) {
        const angle = (i * Math.PI) / 180;
        const x1 = centerX + Math.cos(angle) * (blackHoleRadius - 10);
        const y1 = centerY + Math.sin(angle) * (blackHoleRadius - 10);
        const x2 = centerX + Math.cos(angle) * (canvas.width / 2);
        const y2 = centerY + Math.sin(angle) * (canvas.width / 2);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      setParticles((prevParticles) =>
        prevParticles.map((particle) => {
          const dx = centerX - particle.x;
          const dy = centerY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < absorptionRadius) {
            particle.opacity -= 0.02;
            if (particle.opacity <= 0) {
              return createParticle(canvas);
            }
          } else {
            const angle = Math.atan2(dy, dx);
            const speed = 2 / (distance * 0.1);
            particle.velocity.x = Math.cos(angle) * speed;
            particle.velocity.y = Math.sin(angle) * speed;
          }

          particle.x += particle.velocity.x;
          particle.y += particle.velocity.y;
          particle.angle += particle.rotationSpeed;

          // Update trail
          particle.trail.unshift({
            x: particle.x,
            y: particle.y,
            opacity: particle.opacity,
          });
          if (particle.trail.length > 20) {
            particle.trail.pop();
          }

          // Draw particle trail
          ctx.beginPath();
          particle.trail.forEach((point, index) => {
            ctx.lineTo(point.x, point.y);
            const trailOpacity =
              point.opacity * (1 - index / particle.trail.length);
            ctx.strokeStyle = `rgba(255, 255, 255, ${trailOpacity * 0.5})`;
            ctx.lineWidth = particle.radius * point.opacity;
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
          });

          // Draw particle
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate(particle.angle);
          ctx.beginPath();
          ctx.moveTo(-particle.radius, -particle.radius);
          ctx.lineTo(particle.radius, -particle.radius);
          ctx.lineTo(0, particle.radius * 2);
          ctx.closePath();
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          ctx.fill();
          ctx.restore();

          return particle;
        })
      );

      rotation += 0.002;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleClick = (event) => {
      const newParticles = Array.from({ length: 10 }, () =>
        createParticle(canvas, event.clientX, event.clientY)
      );
      setParticles((prevParticles) => [...prevParticles, ...newParticles]);
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("click", handleClick);
    };
  }, []);
}
