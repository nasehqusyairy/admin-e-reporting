import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { updateSearchParamsFromForm } from "~/lib/search-form"
import { useSearchParams } from "react-router"
import { useEffect, useState, type FormEvent } from "react"
import { Search } from "lucide-react"

export default () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const q = searchParams.get('q') ?? ""
    const [term, setTerm] = useState(q);
    const [clicked, setClicked] = useState(true);

    useEffect(() => {
        setTerm(q)
    }, [q]);

    useEffect(() => {
        setClicked(false)
    }, [term]);

    const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
        updateSearchParamsFromForm(evt, searchParams, setSearchParams)
        setClicked(true)
    }

    return (
        <form className="flex gap-2" onSubmit={onSubmit}>
            <Input type="number" className="mb-4" name="q" value={term} onChange={(evt) => setTerm(evt.target.value)} placeholder="Cari berdasarkan tahun..." />
            <Button disabled={clicked}><Search /></Button>
        </form>
    )
}