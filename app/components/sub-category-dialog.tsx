import { useEffect, useState, type FormEvent } from "react"
import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import type { Category, SubCategory } from "~/models/schema"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "./ui/input-group"

type SubCategoryDialogProps = {
    idToEdit?: string
    subCategories: SubCategory[]
    categories: Category[]
    onClose: () => void
    onsubmit: (code: string, description: string, categoryId: string, idToEdit?: string) => void
    updating: boolean
}

export default ({ idToEdit, onClose, categories, onsubmit, updating, subCategories }: SubCategoryDialogProps) => {

    const currentItem = idToEdit ? subCategories.find(el => el.id === idToEdit) : undefined

    const [selected, setSelected] = useState<string>();

    const submit = (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault()
        const form = evt.currentTarget
        onsubmit(form.code.value, form.description.value, selected!, idToEdit)
    }

    const catCode = categories.find(el => el.id === selected)?.code

    useEffect(() => {
        setSelected(currentItem?.category?.id)
    }, [currentItem]);

    return (
        <Dialog open={idToEdit !== undefined} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {idToEdit ? "Ubah" : ""} Sub Kategori {!idToEdit ? "Baru" : ""}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={submit}>
                    <div className="mb-4">
                        <Label htmlFor="category" className="mb-2">Kategori</Label>
                        <Select required value={selected} onValueChange={(val) => setSelected(val)}>
                            <SelectTrigger className="w-full" name="category" id="category">
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.description}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="code" className="mb-2">Kode</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    {catCode}.
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput required defaultValue={currentItem?.code} name="code" id="code" />
                        </InputGroup>
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