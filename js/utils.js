export const Utils = {
    // Math utils
    random: (min, max) => Math.random() * (max - min) + min,
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    clamp: (val, min, max) => Math.max(min, Math.min(max, val)),

    // Formatting
    formatTime: (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    },

    // Neon colors
    colors: [
        '#00f3ff', // Neon Blue
        '#0ff',    // Neon Cyan
        '#ff00ff', // Neon Pink
        '#bc13fe', // Neon Purple
        '#39ff14'  // Neon Green
    ],

    getRandomColor: () => Utils.colors[Utils.randomInt(0, Utils.colors.length - 1)]
};
