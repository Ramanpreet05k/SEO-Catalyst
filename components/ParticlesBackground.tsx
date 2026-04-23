"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export function ParticlesBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="auth-particles"
      className="absolute inset-0 z-0" // Added z-0 to keep it behind content
      options={{
        fullScreen: { enable: false }, // <-- THIS KEEPS IT ON THE LEFT SIDE
        background: {
          color: {
            value: "#ffffff", 
          },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab", 
            },
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.5,
              },
            },
          },
        },
        particles: {
          color: {
            value: "#000000", 
          },
          links: {
            color: "#000000", 
            distance: 150,
            enable: true,
            opacity: 0.15,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 1, 
            straight: false,
          },
          number: {
            density: {
              enable: true,
              width: 800,
              height: 800,
            },
            value: 80,
          },
          opacity: {
            value: 0.4,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        detectRetina: true,
      }}
    />
  );
}