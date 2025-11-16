export const toRupiah = (value: number) => {
    if (typeof value === "string") value = parseFloat(value);
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(value);
};
