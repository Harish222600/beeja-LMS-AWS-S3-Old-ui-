import React, { useEffect, useRef } from 'react'
import '../pages/css style/backgroundeffect.css'

const BackgroundEffect = () => {
  const particlesRef = useRef(null)

  useEffect(() => {
    const createParticle = () => {
      if (!particlesRef.current) return

      const particle = document.createElement('div')
      particle.className = 'particle'
      
      // Random size between 2-6px
      const size = Math.random() * 4 + 2
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      
      // Random starting position
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      
      // Random animation duration between 15-25 seconds
      const duration = Math.random() * 10 + 15
      
      // Random colors from the gradient palette
      const colors = [
        'rgba(0, 255, 255, 0.6)',
        'rgba(255, 102, 0, 0.6)',
        'rgba(119, 0, 255, 0.6)',
        'rgba(0, 183, 255, 0.6)',
        'rgba(169, 89, 255, 0.6)',
        'rgba(98, 216, 249, 0.6)',
        'rgba(72, 0, 255, 0.6)'
      ]
      particle.style.background = colors[Math.floor(Math.random() * colors.length)]
      
      // Animation keyframes with transform3d for GPU acceleration
      const keyframes = [
        {
          transform: 'translate3d(0, 0, 0) scale3d(0, 0, 1)',
          opacity: 0
        },
        {
          transform: `translate3d(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px, 0) scale3d(1, 1, 1)`,
          opacity: 0.6,
          offset: 0.1
        },
        {
          transform: `translate3d(${(Math.random() - 0.5) * 400}px, ${(Math.random() - 0.5) * 400}px, 0) scale3d(0.5, 0.5, 1)`,
          opacity: 0.3,
          offset: 0.9
        },
        {
          transform: `translate3d(${(Math.random() - 0.5) * 500}px, ${(Math.random() - 0.5) * 500}px, 0) scale3d(0, 0, 1)`,
          opacity: 0
        }
      ]
      
      const animation = particle.animate(keyframes, {
        duration: duration * 1000,
        easing: 'ease-in-out'
      })
      
      particlesRef.current.appendChild(particle)
      
      // Remove particle after animation
      animation.onfinish = () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      }
    }

    // Create fewer initial particles
    for (let i = 0; i < 8; i++) {
      setTimeout(() => createParticle(), i * 300)
    }

    // Reduce particle creation frequency
    const interval = setInterval(createParticle, 3000)

    return () => {
      clearInterval(interval)
      if (particlesRef.current) {
        particlesRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className="gradient-background">
      {/* Gradient Spheres */}
      <div className="gradient-sphere sphere-1"></div>
      <div className="gradient-sphere sphere-2"></div>
      <div className="gradient-sphere sphere-3"></div>
      
      {/* Central Glow */}
      <div className="glow"></div>
      
      {/* Particles Container */}
      <div className="particles-container" ref={particlesRef}></div>
    </div>
  );
};

export default BackgroundEffect;
