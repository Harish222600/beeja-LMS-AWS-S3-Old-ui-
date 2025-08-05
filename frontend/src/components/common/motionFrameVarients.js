
export const fadeIn = (direction, delay) => {
    return {
        hidden: {
            y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
            opacity: 0,
            x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
        },
        show: {
            y: 0,
            x: 0,
            opacity: 1,
            transition: {
                type: 'tween',
                duration: 0.4,
                delay: delay,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    }
}



export const bounce = {
    hidden: { y: -8, opacity: 0 },
    show: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            damping: 12,
            stiffness: 120,
            duration: 0.3,
        }
    }
};




export const scaleUp = {
    hidden: { scale: 0.8, opacity: 0 },
    show: {
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 300,
            duration: 0.3,
        }
    }
};
