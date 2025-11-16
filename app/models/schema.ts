import type { DocumentData, DocumentReference } from "firebase/firestore";

export type DBRecord = {
    id: string;
    hidden: boolean
}

export type Budget = {
    code: string;
    description: string;
} & DBRecord

export type Analyzable = {
    target: number;
    realization: number;
}

export type Yearly = {
    year: number
}

export type Audit = Yearly & DBRecord

export type Category = {
    subcategories?: SubCategory[]
} & Budget

export type SubCategory = {
    category_ref: DocumentReference<DocumentData, DocumentData>
    category?: Category
} & Budget

export type Program = {
    subcategory_ref: DocumentReference<DocumentData, DocumentData>
    subcategory?: SubCategory
    audit_ref: DocumentReference<DocumentData, DocumentData>
    audit?: Audit

} & Budget & Yearly

export type Activity = {
    program_ref: DocumentReference<DocumentData, DocumentData>
    program?: Program
} & Budget & Yearly

export type Expense = {
    activity_ref: DocumentReference<DocumentData, DocumentData>
    activity?: Activity
} & Budget & Yearly & Analyzable
