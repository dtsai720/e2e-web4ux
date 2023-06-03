const RadiasToDegree = (rad: number) => {
    return (rad * 180) / Math.PI;
};

interface position {
    X: number;
    Y: number;
}

const EuclideanDistance = (a: position, b: position) => {
    return Math.pow(Math.pow(a.X - b.X, 2) + Math.pow(a.Y - b.Y, 2), 0.5);
};

const TargetPosition = (start: position, radius: number, degree: number): position => {
    // x = x0 + rcos, y = y0 - rsin for this project ...
    return {
        X: start.X + radius * Math.cos((degree * Math.PI) / 180),
        Y: start.Y - radius * Math.sin((degree * Math.PI) / 180),
    };
};

export { RadiasToDegree, EuclideanDistance, TargetPosition };
