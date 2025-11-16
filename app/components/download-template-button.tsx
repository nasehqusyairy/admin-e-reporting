import { Download } from "lucide-react"
import { Button } from "./ui/button"
import { generateTemplateCSV } from "~/lib/generate-template-csv"
import { type Firestore } from "firebase/firestore"
import { getAll } from "~/lib/get-all"
import { useState } from "react"
import { toast } from "sonner"

export default ({ db }: { db: Firestore }) => {
    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        setIsLoading(true)
        try {
            generateTemplateCSV(await getAll(db, 'categories'), await getAll(db, 'subcategories'))
        } catch (error) {
            console.log(error);
            toast.error("Terjadi kesalahan")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button variant="outline" disabled={isLoading} onClick={onClick}>
            <Download />
            {isLoading ? "Mengunduh" : "Template"}
        </Button>
    )
}