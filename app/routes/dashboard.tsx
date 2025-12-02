import { Book, BookOpen, Table } from "lucide-react";
import { Link, type LoaderFunction } from "react-router";
import { Audit, Category, SubCategory } from "~/.server/model";
import { Card, CardContent } from "~/components/ui/card";
import { navLinks } from "~/lib/nav-links";

export const handle = {
  title: navLinks.find(el => el.url === '/')!.name
}

export const loader: LoaderFunction = async () => {
  return {
    totals: {
      audits: await Audit.query().count(),
      categories: await Category.query().count(),
      subcategories: await SubCategory.query().count()
    }
  }
}

export default ({ loaderData: { totals } }: { loaderData: { totals: any } }) => {
  return (
    <div className="mx-auto container">
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
    </div>
  )
}
