export class PatternManager {
    constructor(numPoints = 40) {
        this.points = [];
        this.currentIndex = 0;

        this.generateInfinityPattern(numPoints);
    }

    generateInfinityPattern(numPoints) {
        let rawPoints = [];
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        // Generate raw Lemniscate points
        for (let i = 0; i < numPoints; i++) {
            let t = (i / numPoints) * Math.PI * 2;

            let divisor = 1 + Math.pow(Math.sin(t), 2);
            let x = Math.cos(t) / divisor;
            let y = (Math.sin(t) * Math.cos(t)) / divisor;

            rawPoints.push({ x, y });

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        // Normalize to range [0.1, 0.9] so it doesn't touch the screen edges
        const margin = 0.1;
        const scaleRange = 1.0 - (margin * 2);

        this.points = rawPoints.map(p => {
            return {
                nx: margin + ((p.x - minX) / (maxX - minX)) * scaleRange,
                ny: margin + ((p.y - minY) / (maxY - minY)) * scaleRange
            };
        });
    }

    reset() {
        this.currentIndex = 0;
    }

    getNextPosition(screenWidth, screenHeight) {
        const point = this.points[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.points.length;

        return {
            x: point.nx * screenWidth,
            y: point.ny * screenHeight
        };
    }
}
