import { Card, CardContent } from "./ui/card";
import { Spinner } from "./ui/spinner";

export default () => (
    <div className='flex justify-center items-center p-4 w-screen h-screen'>
        <Card className='w-full lg:w-auto'>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Spinner className='text-primary' /> Memuat...
                </div>
            </CardContent>
        </Card>
    </div>
)