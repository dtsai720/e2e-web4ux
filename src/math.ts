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

export { RadiasToDegree, EuclideanDistance };
