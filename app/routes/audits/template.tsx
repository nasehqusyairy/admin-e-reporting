import type { LoaderFunction } from "react-router";
import { Category, SubCategory } from "~/.server/model";
import type { ISubCategory } from "~/models/schema";

export const loader: LoaderFunction = async () => {
    // 1. Ambil data kategori dan subkategori
    const [categories, subcategories] = await Promise.all([
        Category.query().where({ hidden: false }).get(),
        SubCategory.query().where({ hidden: false }).get(),
    ]);

    // 2. Kelompokkan subkategori berdasarkan kategori
    const subsByCat: Record<string, ISubCategory[]> = {};

    subcategories.forEach(sub => {
        const catId = sub.category_id;
        if (!catId) return;
        (subsByCat[catId] ||= []).push(sub);
    });

    // 3. Build CSV
    const rows: string[] = [];
    rows.push("Kode;Uraian;Target;Realisasi"); // header

    for (const cat of categories) {
        // Level 1: Kategori
        rows.push(`${cat.id};${cat.description};;`);

        const subs = subsByCat[cat.id] || [];
        for (const sub of subs) {
            // Level 2: Subkategori
            rows.push(`${sub.id};${sub.description};;`);
        }
    }

    const csv = rows.join("\n");

    // 4. Return sebagai file download
    return new Response(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="Template Kategori-Subkategori.csv"`
        }
    });
};
