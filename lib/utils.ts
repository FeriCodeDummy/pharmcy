export const currency = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);


export function truthy<T>(v: T | undefined | null): v is T { return v !== undefined && v !== null; }