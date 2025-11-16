import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { Link, useOutlet } from "react-router"

export default ({ path }: { path: string }) => {

    const outlet = useOutlet()
    return (
        <Tabs value={outlet ? 'removed' : 'available'}>
            <TabsList className="mb-4">
                <TabsTrigger value="available" asChild>
                    <Link to={`${path}`}>Tersedia</Link>
                </TabsTrigger>
                <TabsTrigger value="removed" asChild>
                    <Link to={`${path}/removed`}>Dihapus</Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}