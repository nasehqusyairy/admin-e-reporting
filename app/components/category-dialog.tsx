import { useEffect } from "react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Card, CardContent } from "./ui/card"
import type { ICategory } from "~/models/schema"
import { Link, useFetcher } from "react-router"
import { toast } from "sonner"

type CategoryDialogProps = {
    item?: ICategory
}

export default ({ item }: CategoryDialogProps) => {
    const fetcher = useFetcher()
    const updating = fetcher.state !== "idle"

    useEffect(() => {
        if (fetcher.data?.error) {
            toast.error(fetcher.data.error)
        }
    }, [fetcher.data?.error]);

    return (
        <Card>
            <CardContent>
                <fetcher.Form method="POST">
                    <input type="hidden" name="old_id" value={item?.id} />
                    <div className="mb-4">
                        <Label htmlFor="id" className="mb-2">Kode</Label>
                        <Input required defaultValue={fetcher.data?.id || item?.id} name="id" id="id" type="number" />
                    </div>
                    <div className="mb-4">
                        <Label htmlFor="description" className="mb-2">Uraian</Label>
                        <Input required defaultValue={fetcher.data?.description || item?.description} name="description" id="description" />
                    </div>
                    <div className="flex gap-2">
                        <Button disabled={updating}>{!updating ? "Simpan" : item ? "Memperbarui..." : "Menambahkan..."}</Button>
                        <Button variant={"secondary"} asChild>
                            <Link to={'/categories'}>Kembali</Link>
                        </Button>
                    </div>
                </fetcher.Form>
            </CardContent>
        </Card>
    )
}