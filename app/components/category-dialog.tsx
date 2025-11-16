import { type FormEvent } from "react"
import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import type { Category } from "~/models/schema"

type CategoryDialogProps = {
    idToEdit?: string
    onClose: () => void
    onsubmit: (code: string, description: string, idToEdit?: string) => void
    updating: boolean
    categories: Category[]
}

export default ({ idToEdit, onClose, onsubmit, updating, categories }: CategoryDialogProps) => {

    const submit = (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault()
        const form = evt.currentTarget
        onsubmit(form.code.value, form.description.value, idToEdit)
    }

    const currentItem = idToEdit ? categories.find(el => el.id === idToEdit) : undefined

    return (
        <Dialog open={idToEdit !== undefined} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {idToEdit ? "Ubah" : ""} Kategori {!idToEdit ? "Baru" : ""}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <Label htmlFor="code" className="mb-2">Kode</Label>
                        <Input required defaultValue={currentItem?.code} name="code" id="code" type="number" />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="description" className="mb-2">Uraian</Label>
                        <Input required defaultValue={currentItem?.description} name="description" id="description" />
                    </div>
                    <DialogFooter>
                        <Button disabled={updating}>{updating ? "Memperbarui..." : "Simpan"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}