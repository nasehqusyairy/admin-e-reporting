export function localeToNumber(stringAngka: string): number {
    return Math.trunc(parseFloat(stringAngka.replace(/\./g, '').replace(',', '.')));
}