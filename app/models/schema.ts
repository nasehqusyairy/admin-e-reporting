export type IDBRecord = {
    id: string;
    hidden: boolean
}

export type IUser = {
    email: string;
    password: string;
} & IDBRecord

export type IBudget = {
    code: string
    description: string;
} & IDBRecord

export type IAnalyzable = {
    target: number;
    realization: number;
}

export type IYearly = {
    year: number
}

export type IAudit = IYearly & { hidden: boolean }

export type ICategory = {
    subcategories?: ISubCategory[]
} & IBudget

export type ISubCategory = {
    category_id: string
    category?: ICategory
} & IBudget

export type IProgram = {
    subcategory_id: string
    subcategory?: ISubCategory
    audit?: IAudit

} & IBudget & IYearly

export type IActivity = {
    program_id: string
    program?: IProgram
} & IBudget & IYearly

export type IExpense = {
    activity_id: string
    activity?: IActivity
} & IBudget & IYearly & IAnalyzable
