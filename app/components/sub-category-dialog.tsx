import { Button } from "./ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText
} from "./ui/input-group"
import { Card, CardContent } from "./ui/card"
import { Link, useFetcher } from "react-router"
import type { ICategory, ISubCategory } from "~/models/schema"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type SubCategoryDialogProps = {
    item?: ISubCategory
    categories: ICategory[]
}

export default ({ categories, item }: SubCategoryDialogProps) => {
    const [selected, setSelected] = useState(item?.category_id);
    const fetcher = useFetcher()
    const updating = fetcher.state !== "idle"

    useEffect(() => {
        if (fetcher.data?.error) {
            toast.error(fetcher.data.error)
        }
    }, [fetcher.data]);

    return (
        <Card>
            <CardContent>
                <fetcher.Form method="POST">
                    <input type="hidden" name="old_id" value={item?.id} />
                    <div className="mb-4">
                        <Label htmlFor="category" className="mb-2">Kategori</Label>
                        <Select required value={selected} onValueChange={(val) => setSelected(val)} name="category_id">
                            <SelectTrigger className="w-full" id="category">
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
                        <Label htmlFor="id" className="mb-2">Kode</Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>
                                    {selected}.
                                </InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput required defaultValue={item?.id.split('.')[1]} name="id" id="id" />
                        </InputGroup>
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="description" className="mb-2">Uraian</Label>
                        <Input required defaultValue={item?.description} name="description" id="description" />
                    </div>
                    <div className="flex gap-2">
                        <Button disabled={updating}>{!updating ? "Simpan" : item ? "Memperbarui..." : "Menambahkan..."}</Button>
                        <Button variant={"secondary"} asChild>
                            <Link to={'/subcategories'}>Kembali</Link>
                        </Button>
                    </div>
                </fetcher.Form>
            </CardContent>
        </Card>
    )
}