import type { LoaderFunction } from "react-router";
import { Activity, Category, Expense, Program, SubCategory } from "~/.server/model";
import type { IActivity, IExpense, IProgram, ISubCategory } from "~/models/schema";
export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const year = Number(url.searchParams.get("year"));

    if (!year) {
        throw new Response("Param year diperlukan", { status: 400 });
    }

    // 1. Ambil seluruh data memakai ORM
    const [categories, subcategories, programs, activities, expenses] =
        await Promise.all([
            Category.query().where({ hidden: false }).get(),
            SubCategory.query().where({ hidden: false }).get(),
            Program.query().where({ year }).orderBy('code').get(),
            Activity.query().where({ year }).orderBy('code').get(),
            Expense.query().where({ year }).orderBy('code').get(),
        ]);

    // 2. Kelompokkan data berdasarkan relasinya
    const subcategoriesByCat: Record<string, ISubCategory[]> = {};
    const programsBySub: Record<string, IProgram[]> = {};
    const activitiesByProg: Record<string, IActivity[]> = {};
    const expensesByAct: Record<string, IExpense[]> = {};

    for (const sc of subcategories) {
        const catId = sc.category_id;
        if (!catId) continue;
        (subcategoriesByCat[catId] ||= []).push(sc);
    }

    for (const p of programs) {
        const subId = p.subcategory_id;
        if (!subId) continue;
        (programsBySub[subId] ||= []).push(p);
    }

    for (const a of activities) {
        const progId = a.program_id;
        if (!progId) continue;
        (activitiesByProg[progId] ||= []).push(a);
    }

    for (const e of expenses) {
        const actId = e.activity_id;
        if (!actId) continue;
        (expensesByAct[actId] ||= []).push(e);
    }

    // 3. Build CSV rows
    const rows: string[] = [];
    rows.push("Kode;Uraian;Target;Realisasi");

    for (const cat of categories) {
        rows.push(`${cat.id};${cat.description};;`);

        const subs = subcategoriesByCat[cat.id] || [];
        for (const sub of subs) {
            rows.push(`${sub.id};${sub.description};;`);

            const progs = programsBySub[sub.id] || [];
            for (const prog of progs) {
                rows.push(`${prog.code};${prog.description};;`);

                const acts = activitiesByProg[prog.id] || [];
                for (const act of acts) {
                    rows.push(`${act.code};${act.description};;`);

                    const exps = expensesByAct[act.id] || [];
                    for (const exp of exps) {
                        rows.push(
                            `${exp.code};${exp.description};${exp.target ?? ""};${exp.realization ?? ""}`
                        );
                    }
                }
            }
        }
    }

    const csv = rows.join("\n");

    // 4. Return CSV sebagai file download
    return new Response(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="Laporan Belanja ${year}.csv"`
        }
    });
};
