import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Card, CardContent } from "./ui/card"
import { Link, useFetcher } from "react-router"
import { useEffect } from "react"
import { toast } from "sonner"

type UploadAuditDialogProps = {
    year?: number
}

export default function UploadAuditDialog({ year }: UploadAuditDialogProps) {
    const fetcher = useFetcher()
    const uploading = fetcher.state !== "idle"

    useEffect(() => {
        if (fetcher.data?.error) {
            toast.error(fetcher.data.error)
        }
    }, [fetcher.data]);

    return (
        <Card>
            <CardContent>
                <fetcher.Form className="space-y-4" method="POST" encType="multipart/form-data">
                    <div className="space-y-2">
                        <Label htmlFor="year">Tahun</Label>
                        <Input id="year" name="year" type="number" defaultValue={year} readOnly={!!year} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="file">File CSV</Label>
                        <Input id="file" type="file" name="csv" accept=".csv" required />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={uploading}>
                            {uploading ? "Mengunggah..." : "Unggah"}
                        </Button>
                        <Button variant={"secondary"} asChild>
                            <Link to={'/audits'}>
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </fetcher.Form>
            </CardContent>
        </Card>
    )
}
