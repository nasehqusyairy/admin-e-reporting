import type { DBRecord } from "~/models/schema";

export const separateHidden = <T extends DBRecord>(arr: T[]) => {
    const hidden: T[] = []
    const available: T[] = []
    for (const item of arr) {
        item.hidden ? hidden.push(item) : available.push(item)
    }
    return { available, hidden }
}