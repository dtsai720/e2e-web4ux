const RadiasToDegree = (rad: number): number => {
    return (rad * 180) / Math.PI;
};

const EuclideanDistance = (x1: number, x2: number, y1: number, y2: number) => {
    return Math.pow(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 0.5);
};

export { RadiasToDegree, EuclideanDistance };
