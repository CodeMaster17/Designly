import { Room } from '@/app/components/liveblocks/Room';
import { auth } from '@/server/auth'

type ParamsType = Promise<{ id: string }>

export default async function DashboardId({ params }: { params: ParamsType }) {
    const { id } = await params;
    const session = await auth()
    return (
        <Room roomId={id}>
            <h1>Dashboard {id}</h1>
        </Room>
    )
}