import type { IActivity, IAudit, ICategory, IExpense, IProgram, ISubCategory, IUser } from "~/models/schema";
import { orm } from "./orm";

export const User = orm<IUser>('users')
export const Category = orm<ICategory>('categories')
export const SubCategory = orm<ISubCategory>('subcategories')
export const Audit = orm<IAudit>('audits', {
    primaryKey: 'year'
})
export const Program = orm<IProgram>('programs')
export const Activity = orm<IActivity>('activities')
export const Expense = orm<IExpense>('expenses')