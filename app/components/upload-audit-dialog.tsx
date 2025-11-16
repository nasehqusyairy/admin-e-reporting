import { Button } from "~/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import type {
    Audit,
    Program,
    Activity,
    Expense,
    Category,
    SubCategory
} from "~/models/schema"
import { useCollection } from "~/hooks/use-collection"
import {
    doc,
    Firestore,
    QueryFieldFilterConstraint,
    where
} from "firebase/firestore"
import { parseAuditCSV } from "~/lib/parse-audit-csv"
import { toast } from "sonner"

type UploadAuditDialogProps = {
    year?: number
    open: boolean
    onClose: () => void
    db: Firestore
}

export default function UploadAuditDialog({ year, open, onClose, db }: UploadAuditDialogProps) {
    const queryConstraints = year ? { filters: [where('year', '==', year)] } : undefined
    const { data: categories } = useCollection<Category>(db, 'categories')
    const { data: subcategories } = useCollection<SubCategory>(db, 'subcategories')

    const auditsCollection = useCollection<Audit>(db, 'audits', queryConstraints)
    const programsCollection = useCollection<Program>(db, 'programs', queryConstraints)
    const activitiesCollection = useCollection<Activity>(db, 'activities', queryConstraints)
    const expensesCollection = useCollection<Expense>(db, 'expenses', queryConstraints)

    const getDocument = (collection: string, id: string) => doc(db, collection, id)

    const collections: {
        updating: boolean,
        multiRemove: (field: QueryFieldFilterConstraint[]) => Promise<void>
    }[] = [
            auditsCollection,
            programsCollection,
            activitiesCollection,
            expensesCollection
        ]

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const year = Number((form.year as HTMLInputElement).value)
        const file = (form.querySelector("#file") as HTMLInputElement)?.files?.[0]
        if (!file) return

        try {
            const text = await file.text()

            const { audit, programs, activities, expenses } = parseAuditCSV(
                text,
                year,
                categories,
                subcategories,
                getDocument
            )

            if (auditsCollection.data.find((el) => el.year === year)) {
                for (const el of collections) {
                    await el.multiRemove([where("year", "==", year)])
                }
            }

            const { id: auditId, ...auditData } = audit

            await auditsCollection.add(auditData, auditId)
            await programsCollection.multiAdd(programs, true)
            await activitiesCollection.multiAdd(activities, true)
            await expensesCollection.multiAdd(expenses, true)

            onClose()

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan")
        }
    }

    const isProccessing = collections.find(el => el.updating === true) !== undefined

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Unggah Dokumen Audit</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="year">Tahun</Label>
                        <Input id="year" type="number" defaultValue={year} readOnly={!!year} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="file">File CSV</Label>
                        <Input id="file" type="file" accept=".csv" required />
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full" disabled={isProccessing}>
                            {isProccessing ? "Mengunggah..." : "Unggah"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
