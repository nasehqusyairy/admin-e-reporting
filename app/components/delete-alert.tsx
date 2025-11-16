import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "~/components/ui/alert-dialog";
import { Button } from "./ui/button";

type DeleteAlertProps = {
    open: boolean
    isDeleting: boolean
    onDelete: () => void
    onClose: () => void
}

export default ({ open, isDeleting, onClose, onDelete }: DeleteAlertProps) => {
    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Item akan dihapus, tapi anda masih bisa memulihkannya melalui tab 'Dihapus'
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    {isDeleting ? <Button disabled>Menghapus...</Button> : (
                        <>
                            <Button variant={"outline"} onClick={onDelete}>
                                Ya
                            </Button>
                            <Button onClick={onClose}>
                                Batal
                            </Button>
                        </>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}