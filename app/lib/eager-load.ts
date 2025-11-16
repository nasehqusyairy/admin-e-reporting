export function eagerLoad<T1, T2 extends { id: any }>(
    array1: T1[],
    array2: T2[],
    key: string
): T1[] {
    const lookup = new Map(array2.map((item) => [item.id, item]));
    return array1.map((item) => {
        const relation = item[`${key}_ref`];
        if (relation && relation.id && lookup.has(relation.id)) {
            return { ...item, [key]: lookup.get(relation.id), };
        }
        return item;
    });
}
