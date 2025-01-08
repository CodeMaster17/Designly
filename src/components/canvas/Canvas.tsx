'use client'

import { Camera, CanvasMode, CanvasState, EllipseLayer, Layer, LayerType, Point, TextLayer } from "@/types/types";
import { colorToCss, pointerEventToCanvasPoint } from "@/utils";
import { LiveObject } from "@liveblocks/client";
import { useMutation, useSelf, useStorage } from "@liveblocks/react";
import { nanoid } from 'nanoid';
import { useCallback, useState } from "react";
import ToolsBar from "../toolsbar.tsx/ToolsBar";
import LayerComponent from "./LayerComponent";

const MAX_LAYERS = 100;



const Canvas = () => {



    // get the room color from the storage
    const roomColor = useStorage((state) => state.roomColor)
    // getting the layerIds in order
    const layerIds = useStorage((state) => state.layerIds)
    const liveLayers = useStorage((state) => state.layers);

    // for zoom in zoom out
    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });

    // for selecting the type of shape to insert
    const [canvasState, setState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });

    // for pencil tool
    const pencilDrag = useSelf((me) => me.presence.pencilDraft)

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
            } else if (layerType === LayerType.Ellipse) {
                layer = new LiveObject<EllipseLayer>({
                    type: LayerType.Ellipse,
                    x: position.x,
                    y: position.y,
                    height: 100,
                    width: 100,
                    fill: { r: 217, g: 217, b: 217 },
                    stroke: { r: 217, g: 217, b: 217 },
                    opacity: 100,
                });
            } else if (layerType === LayerType.Text) {
                layer = new LiveObject<TextLayer>({
                    type: LayerType.Text,
                    x: position.x,
                    y: position.y,
                    height: 100,
                    width: 100,
                    fontSize: 16,
                    text: "Text",
                    fontWeight: 400,
                    fontFamily: "Inter",
                    stroke: { r: 217, g: 217, b: 217 },
                    fill: { r: 217, g: 217, b: 217 },
                    opacity: 100,
                });
            }

            if (layer) {
                liveLayers.set(layerId, layer)
                liveLayerIds.push(layerId)
                setMyPresence({ selection: [layerId] }, { addToHistory: true })
            }
        },
        []
    )


    const onPointerUp = useMutation(
        ({ }, e: React.PointerEvent) => {
            if (canvasState.mode === CanvasMode.RightClick) return;

            const point = pointerEventToCanvasPoint(e, camera);

            if (
                canvasState.mode === CanvasMode.None ||
                canvasState.mode === CanvasMode.Pressing
            ) {
                // unselectLayers();
                setState({ mode: CanvasMode.None });
            } else if (canvasState.mode === CanvasMode.Inserting) {
                insertLayer(canvasState.layerType, point);
            } else if (canvasState.mode === CanvasMode.Dragging) {
                // this state is set after the mouse is stopped moving
                setState({ mode: CanvasMode.Dragging, origin: null });

            } else if (canvasState.mode === CanvasMode.Pencil) {
                // insertPath();
            } else {
                setState({ mode: CanvasMode.None });
            }
            // history.resume();
        },
        [canvasState, setState, history, insertLayer],
    );


    // on wheel
    const onWheel = useCallback((e: React.WheelEvent) => {
        setCamera((camera) => ({
            x: camera.x - e.deltaX,
            y: camera.y - e.deltaY,
            zoom: camera.zoom,
        }));
    }, []);




    const startMultiSelection = useCallback((current: Point, origin: Point) => {
        if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
            setState({ mode: CanvasMode.SelectionNet, origin, current });
        }
    }, []);

    const updateSelectionNet = useMutation(
        ({ storage, setMyPresence }, current: Point, origin: Point) => {
            if (layerIds) {
                const layers = storage.get("layers").toImmutable();
                setState({
                    mode: CanvasMode.SelectionNet,
                    origin,
                    current,
                });
                // const ids = findIntersectionLayersWithRectangle(
                //     layerIds,
                //     layers,
                //     origin,
                //     current,
                // );
                // setMyPresence({ selection: ids });
            }
        },
        [layerIds],
    );

    // for drawing, when pencil mode is active
    const startDrawing = useMutation(
        ({ setMyPresence }, point: Point, pressure: number) => {
            setMyPresence({
                pencilDraft: [[point.x, point.y, pressure]],
                penColor: { r: 217, g: 217, b: 217 },
            });
        },
        [],
    );

    // for drawing, when pencil mode is active
    const continueDrawing = useMutation(
        ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
            const { pencilDraft } = self.presence;

            if (
                canvasState.mode !== CanvasMode.Pencil ||
                e.buttons !== 1 ||
                pencilDraft === null
            ) {
                return;
            }

            setMyPresence({
                cursor: point,
                pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
            });
        },
        [canvasState.mode],
    );

    const onPointerDown = useMutation(
        ({ }, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);

            if (canvasState.mode === CanvasMode.Dragging) {
                setState({ mode: CanvasMode.Dragging, origin: point });
                return;
            }

            if (canvasState.mode === CanvasMode.Inserting) return;

            if (canvasState.mode === CanvasMode.Pencil) {
                startDrawing(point, e.pressure)
            }

            setState({ origin: point, mode: CanvasMode.Pressing });
        },
        [camera, canvasState.mode, setState],
    );

    const onPointerMove = useMutation(
        ({ setMyPresence }, e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);
            if (canvasState.mode === CanvasMode.Pressing) {
                startMultiSelection(point, canvasState.origin);
            } else if (canvasState.mode === CanvasMode.SelectionNet) {
                updateSelectionNet(point, canvasState.origin);
            } else if (
                canvasState.mode === CanvasMode.Dragging &&
                canvasState.origin !== null
            ) {
                const deltaX = e.movementX;
                const deltaY = e.movementY;

                setCamera((camera) => ({
                    x: camera.x + deltaX,
                    y: camera.y + deltaY,
                    zoom: camera.zoom,
                }));
            } else if (canvasState.mode === CanvasMode.Translating) {
                // translateSelectedLayers(point);
            } else if (canvasState.mode === CanvasMode.Pencil) {
                continueDrawing(point, e);
            } else if (canvasState.mode === CanvasMode.Resizing) {
                // resizeSelectedLayer(point);
            }
            setMyPresence({ cursor: point });
        }, []
    )

    return (
        <div className="flex h-screen w-full">
            <main className="fixed left-0 right-0 h-screen overflow-y-auto">
                <div
                    style={{
                        backgroundColor: roomColor ? colorToCss(roomColor) : "#1e1e1e",
                    }}
                    className="h-full w-full touch-none"
                >
                    <svg className="h-full w-full" onPointerUp={onPointerUp}
                        onWheel={onWheel}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                    >
                        <g
                            style={{
                                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
                            }}

                        >
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


            {/* toolbar */}
            <ToolsBar
                canvasState={canvasState}
                setCanvasState={(newState) => setState(newState)}
                zoomIn={() => {
                    setCamera((camera) => ({ ...camera, zoom: camera.zoom + 0.1 }));
                }}
                zoomOut={() => {
                    setCamera((camera) => ({ ...camera, zoom: camera.zoom - 0.1 }));
                }}
                canZoomIn={camera.zoom < 2}
                canZoomOut={camera.zoom > 0.5}
            />
        </div>
    )
}

export default Canvas