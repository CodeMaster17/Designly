import Canvas from '@/components/canvas/Canvas';
import { Room } from '@/components/liveblocks/Room';
import { auth } from '@/server/auth'

type ParamsType = Promise<{ id: string }>

export default async function DashboardId({ params }: { params: ParamsType }) {
    const { id } = await params;
    const session = await auth()
    return (
        <Room roomId={id}>
            <Canvas />
        </Room>
    )
}