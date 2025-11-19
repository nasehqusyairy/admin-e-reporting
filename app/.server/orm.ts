import { pool } from "./db";

type CRUDOptions = {
    primaryKey?: string;
}

export function orm<T extends object>(
    table: string,
    options: CRUDOptions = {
        primaryKey: "id",
    }
) {
    const primaryKey = options.primaryKey ?? "id";

    // ------------------- Mini Query Builder ------------------- //
    const queryBuilder = () => {
        let whereParts: string[] = [];
        let params: any[] = [];

        let limitValue: number | null = null;
        let offsetValue: number | null = null;
        let orderByValue: string | null = null;

        const pushWhere = (
            boolOp: "AND" | "OR",
            field: string,
            operator: string,
            value: any
        ) => {

            const op = operator.toUpperCase();

            // ---------- IN / NOT IN ----------
            if (op === "IN" || op === "NOT IN") {
                if (!Array.isArray(value)) {
                    throw new Error(`${operator} membutuhkan array sebagai value`);
                }

                if (value.length === 0) {
                    // IN/NOT IN pada array kosong → hasilkan always false
                    whereParts.push(`${boolOp} 0 = 1`);
                    return;
                }

                const placeholders = value.map(() => "?").join(", ");
                whereParts.push(`${boolOp} \`${field}\` ${op} (${placeholders})`);
                params.push(...value);
                return;
            }

            // ---------- Operator biasa ----------
            whereParts.push(`${boolOp} \`${field}\` ${operator} ?`);
            params.push(value);
        };

        return {
            where(field: string | Record<string, any>, operator?: any, value?: any) {
                // Jika dalam bentuk objek: where({a:1, b:2})
                if (typeof field === "object" && field !== null) {
                    Object.entries(field).forEach(([key, val]) => {
                        pushWhere(whereParts.length === 0 ? "AND" : "AND", key, "=", val);
                    });
                    return this;
                }

                // Format: where("age", 20)
                if (value === undefined) {
                    value = operator;
                    operator = "=";
                }

                pushWhere(
                    whereParts.length === 0 ? "AND" : "AND",
                    field,
                    operator,
                    value
                );

                return this;
            },

            orWhere(field: string | Record<string, any>, operator?: any, value?: any) {
                // Bentuk objek: orWhere({a:1, b:2}) → tiap key menjadi AND
                if (typeof field === "object" && field !== null) {
                    Object.entries(field).forEach(([key, val]) => {
                        pushWhere("AND", key, "=", val);
                    });
                    return this;
                }

                // Format: orWhere("age", 20)
                if (value === undefined) {
                    value = operator;
                    operator = "=";
                }

                pushWhere("OR", field, operator, value);
                return this;
            },


            orderBy(field: string, direction: "ASC" | "DESC" = "ASC") {
                orderByValue = `ORDER BY \`${field}\` ${direction}`;
                return this;
            },

            limit(n: number) {
                limitValue = n;
                return this;
            },

            offset(n: number) {
                offsetValue = n;
                return this;
            },

            async count(): Promise<number> {
                let sql = `SELECT COUNT(*) AS total FROM \`${table}\``;

                if (whereParts.length > 0) {
                    sql +=
                        " WHERE " +
                        whereParts.map((w, i) => (i === 0 ? w.replace("AND ", "") : w)).join(" ");
                }

                const [rows] = await pool.execute(sql, params);
                return (rows as any)[0].total ?? 0;
            },

            async get(): Promise<T[]> {
                let sql = `SELECT * FROM \`${table}\``;

                if (whereParts.length > 0) {
                    // Hilangkan "AND" pertama
                    sql +=
                        " WHERE " +
                        whereParts.map((w, i) => (i === 0 ? w.replace("AND ", "") : w)).join(" ");
                }

                if (orderByValue) sql += " " + orderByValue;
                if (limitValue !== null) sql += ` LIMIT ${limitValue}`;
                if (offsetValue !== null) sql += ` OFFSET ${offsetValue}`;

                const [rows] = await pool.execute(sql, params);
                return rows as any[];
            },

            async first(): Promise<T | undefined> {
                this.limit(1);
                const rows = await this.get();
                return rows[0];
            },
        };
    };

    // ------------------- CRUD Utama ------------------- //
    return {
        query: () => queryBuilder(),

        async create(data: Partial<T>): Promise<T> {
            const fields = Object.keys(data);
            const values = Object.values(data);
            const placeholders = fields.map(() => "?").join(", ");

            const sql = `INSERT INTO \`${table}\` (${fields.join(
                ", "
            )}) VALUES (${placeholders})`;

            const [result] = await pool.execute(sql, values);
            const insertId = (result as any).insertId;

            return await this.findById(insertId) as T;
        },

        async insert(data: Partial<T> | Partial<T>[]) {
            const rows = Array.isArray(data) ? data : [data];

            if (rows.length === 0) {
                throw new Error("insert() membutuhkan minimal 1 data");
            }

            const fields = Object.keys(rows[0]);
            const placeholders = "(" + fields.map(() => "?").join(", ") + ")";
            const allPlaceholders = rows.map(() => placeholders).join(", ");

            const values: any[] = [];

            rows.forEach((row) => {
                fields.forEach((f) => {
                    const v = (row as any)[f];
                    values.push(typeof v === "boolean" ? (v ? 1 : 0) : v);
                });
            });

            const sql = `INSERT INTO \`${table}\` (${fields
                .map((f) => `\`${f}\``)
                .join(", ")}) VALUES ${allPlaceholders}`;

            return pool.execute(sql, values).then(([result]: any) => {
                if (rows.length === 1) {
                    return result.insertId;
                }

                // MySQL mengembalikan insertId awal
                const firstId = result.insertId;
                return rows.map((_, i) => firstId + i);
            });
        },

        async findById(id: any): Promise<T | undefined> {
            const qb = queryBuilder()
                .where(primaryKey, id)
                .limit(1);

            return qb.first();
        },

        async update(id: any, data: Partial<T>): Promise<boolean> {
            const fields = Object.keys(data);
            const values = Object.values(data);
            const setParts = fields.map((f) => `\`${f}\` = ?`).join(", ");

            const sql = `UPDATE \`${table}\` SET ${setParts} WHERE \`${primaryKey}\` = ?`;

            const [result] = await pool.execute(sql, [...values.map(el => typeof el === "boolean" ? (el ? 1 : 0) : el), id]);
            return (result as any).affectedRows > 0;
        },

        async delete(where: any, values?: any[]): Promise<boolean> {
            let whereClause: string;
            let whereValues: any[] = [];

            if (typeof where === "string") {
                // CASE 1: "clause string + values"
                whereClause = where;
                whereValues = values ?? [];
            }
            else if (typeof where === "object" && where !== null) {
                // CASE 2: OBJECT form { column: value, ... }
                const keys = Object.keys(where);

                // Build clause: `col1` = ? AND `col2` = ? ...
                whereClause = keys
                    .map(key => `\`${key}\` = ?`)
                    .join(" AND ");

                // Values based on object order
                whereValues = keys.map(key => where[key]);
            }
            else {
                // CASE 3: delete by primary key (legacy)
                whereClause = `\`${primaryKey}\` = ?`;
                whereValues = [where];
            }

            const [result] = await pool.execute(
                `DELETE FROM \`${table}\` WHERE ${whereClause}`,
                whereValues
            );

            return (result as any).affectedRows > 0;
        }

    };
}

