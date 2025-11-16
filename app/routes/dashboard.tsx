import { Book, BookOpen, Table } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { useFirebase } from "~/components/providers/firebase";
import { Card, CardContent } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { getTotals, type Totals } from "~/lib/get-totals";
import { navLinks } from "~/models/nav-links";

export const handle = {
  title: navLinks.find(el => el.url === '/')!.name
}

export default () => {
  const firebase = useFirebase()
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState<Totals>({
    audits: 0,
    categories: 0,
    subcategories: 0
  });

  useEffect(() => {
    getTotals(firebase.db).then((res) => {
      setTotals({ ...res })
      setIsLoading(false)
    }).catch(() => {
      toast.error("Terjadi kesalahan")
    })
  }, []);

  return (
    <div className="mx-auto container">
      {isLoading ? (
        <div className="lg:flex justify-center">
          <Card className="lg:w-4/12">
            <CardContent>
              <div className="flex items-center gap-4">
                <Spinner className="text-primary" /> Menghitung...
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="lg:flex gap-4">
          <Card className="mb-4 lg:w-4/12">
            <CardContent>
              <div className="flex justify-between gap-4">
                <div>
                  <h1 className="font-bold text-primary">{totals.audits}</h1>
                  <Link to={'/audits'}>Dokumen Audit</Link>
                </div>
                <div className="bg-primary/10 py-3 rounded-xl size-12">
                  <Table className="mx-auto text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-4 lg:w-4/12">
            <CardContent>
              <div className="flex justify-between gap-4">
                <div>
                  <h1 className="font-bold text-primary">{totals.categories}</h1>
                  <Link to={'/categories'}>Kategori</Link>
                </div>
                <div className="bg-primary/10 py-3 rounded-xl size-12">
                  <Book className="mx-auto text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mb-4 lg:w-4/12">
            <CardContent>
              <div className="flex justify-between gap-4">
                <div>
                  <h1 className="font-bold text-primary">{totals.subcategories}</h1>
                  <Link to={'subcategories'}>Sub Kategori</Link>
                </div>
                <div className="bg-primary/10 py-3 rounded-xl size-12">
                  <BookOpen className="mx-auto text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
