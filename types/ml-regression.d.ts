declare module 'ml-regression' {
    export class SimpleLinearRegression {
        constructor(x: number[] | number[][], y: number[]);
        predict(x: number | number[]): number;
        toString(precision?: number): string;
        score(x: number[], y: number[]): { r: number, r2: number, chi2: number, rmsd: number };
        json(): unknown;
        static load(model: unknown): SimpleLinearRegression;
    }

    export class PolynomialRegression {
        constructor(x: number[], y: number[], degree: number);
        predict(x: number): number;
        toString(precision?: number): string;
        score(x: number[], y: number[]): { r: number, r2: number, chi2: number, rmsd: number };
        json(): unknown;
        static load(model: unknown): PolynomialRegression;
    }

    // Add other regression classes as needed based on usage
    export class ExponentialRegression {
        constructor(x: number[], y: number[]);
        predict(x: number): number;
        toString(precision?: number): string;
        score(x: number[], y: number[]): { r: number, r2: number, chi2: number, rmsd: number };
        json(): unknown;
        static load(model: unknown): ExponentialRegression;
    }
}
