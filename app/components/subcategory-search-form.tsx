import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { updateSearchParamsFromForm } from "~/lib/search-form"
import type { URLSearchParamsInit } from "react-router"
import { useEffect, useState, type FormEvent } from "react"
import type { Category } from "~/models/schema"
import { Search } from "lucide-react"

type SubCategorySearchFormProps = {
    searchParams: URLSearchParams
    setSearchParams: (nextInit: URLSearchParamsInit) => void
    q: string
    cat: string
    categories: Category[]
}

export default ({ searchParams, setSearchParams, q, cat, categories }: SubCategorySearchFormProps) => {
    const [term, setTerm] = useState(q);
    const [selectedCat, setSelectedCat] = useState(cat);
    const [clicked, setClicked] = useState(true);

    useEffect(() => {
        setTerm(q)
        setSelectedCat(cat ?? "all")
    }, [q, cat]);

    useEffect(() => {
        setClicked(false)
    }, [selectedCat, term]);

    const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
        updateSearchParamsFromForm(evt, searchParams, setSearchParams)
        setClicked(true)
    }

    return (
        <form className="lg:flex gap-2" onSubmit={onSubmit}>
            <Input className="mb-4" name="q" value={term} onChange={(evt) => setTerm(evt.target.value)} placeholder="Cari berdasarkan uraian..." />
            <Select name="cat" value={selectedCat} defaultValue={cat} onValueChange={(val) => setSelectedCat(val)}>
                <SelectTrigger className="mb-4 w-full" name="category" id="category">
                    <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={"all"}>Semua Kategori</SelectItem>
                    {categories?.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.description}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button disabled={clicked}>
                <Search />
            </Button>
        </form>
    )
}