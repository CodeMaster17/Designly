'use client'

import { colorToCss, pointerEventToCanvasPoint } from "@/utils"
import { useMutation, useStorage } from "@liveblocks/react"
import LayerComponent from "./LayerComponent";
import { Camera, CanvasMode, CanvasState, Layer, LayerType, Point } from "@/types/types";
import { nanoid } from 'nanoid'
import { LiveObject } from "@liveblocks/client";
import { useEffect, useState } from "react";

const MAX_LAYERS = 100;



const Canvas = () => {



    // get the room color from the storage
    const roomColor = useStorage((state) => state.roomColor)
    // getting the layerIds in order
    const layerIds = useStorage((state) => state.layerIds)
    const liveLayers = useStorage((state) => state.layers);

    const [canvasState, setState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });
    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });

    // to handle the insertion of a rectangle layer on click of mouse



    const insertLayer = useMutation(
        (
            { storage, setMyPresence },
            layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text,
            position: Point,
        ) => {
            if (!storage) {
                console.error("Storage is not loaded yet!");
                return;
            }
            const liveLayers = storage.get("layers")
            const liveLayerIds = storage.get("layerIds");

            if (liveLayers.size >= MAX_LAYERS) {
                return;
            }
            const layerId = nanoid();
            let layer: LiveObject<Layer> | null = null;

            if (layerType === LayerType.Rectangle) {
                layer = new LiveObject<Layer>({
                    type: LayerType.Rectangle,
                    x: position.x,
                    y: position.y,
                    width: 100,
                    height: 100,
                    fill: { r: 255, g: 255, b: 255 },
                    stroke: { r: 0, g: 0, b: 0 },
                    opacity: 100,
                    cornerRadius: 0,
                })
            }

            if (layer) {
                liveLayers.set(layerId, layer)
                liveLayerIds.push(layerId)
                setMyPresence({ selection: [layerId] }, { addToHistory: true })
            }
        },
        []
    )
    // useEffect(() => {
    //     if (!layerIds) {
    //         console.warn("Storage is not ready yet!");
    //         return;
    //     }
    //     insertLayer(LayerType.Rectangle, { x: 100, y: 100 })
    // }, []);



    const onPointerUp = useMutation(
        ({ }, e: React.PointerEvent) => {
            if (canvasState.mode === CanvasMode.RightClick) return;

            const point = pointerEventToCanvasPoint(e, camera);

            // if (
            //     canvasState.mode === CanvasMode.None ||
            //     canvasState.mode === CanvasMode.Pressing
            // ) {
            //     unselectLayers();
            //     setState({ mode: CanvasMode.None });
            // } else if (canvasState.mode === CanvasMode.Inserting) {
            //     insertLayer(canvasState.layerType, point);
            // } else if (canvasState.mode === CanvasMode.Dragging) {
            //     setState({ mode: CanvasMode.Dragging, origin: null });
            // } else if (canvasState.mode === CanvasMode.Pencil) {
            //     insertPath();
            // } else {
            //     setState({ mode: CanvasMode.None });
            // }
            // history.resume();
            insertLayer(LayerType.Rectangle, { x: 220, y: 600 })
        },
        [canvasState, setState, history, insertLayer],
    );



    return (
        <div className="flex h-screen w-full">
            <main className="fixed left-0 right-0 h-screen overflow-y-auto">
                <div
                    style={{
                        backgroundColor: roomColor ? colorToCss(roomColor) : "#1e1e1e",
                    }}
                    className="h-full w-full touch-none"
                >
                    <svg className="h-full w-full" onPointerUp={onPointerUp}>
                        <g>
                            {layerIds?.map((layerId) => (
                                <LayerComponent
                                    key={layerId}
                                    id={layerId}
                                // onLayerPointerDown={}
                                />
                            ))}
                        </g>
                    </svg>
                </div>
            </main>
        </div>
    )
}

export default Canvas