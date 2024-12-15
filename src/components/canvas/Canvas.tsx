'use client'

import { colorToCss } from "@/utils"
import { useStorage } from "@liveblocks/react"

const Canvas = () => {
    // get the room color from the storage
    const roomColor = useStorage((state) => state.roomColor)
    return (
        <div className="flex h-screen w-full">
            <main className="fixed left-0 right-0 h-screen overflow-y-auto">
                <div
                    style={{
                        backgroundColor: roomColor ? colorToCss(roomColor) : "#1e1e1e",
                    }}
                    className="h-full w-full touch-none"
                >
                </div>
            </main>
        </div>
    )
}

export default Canvas