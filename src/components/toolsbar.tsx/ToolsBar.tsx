import { CanvasMode, CanvasState, LayerType } from "@/types/types";
import SelectionButton from "./SelectionButton";
import ShapeSelectionButton from "./ShapeSelectionButton";

interface ToolsBarProps {
    canvasState: CanvasState;
    setCanvasState: (newState: CanvasState) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    canZoomIn: boolean;
    canZoomOut: boolean;
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
}

const ToolsBar = ({ canvasState,
    setCanvasState,
    // zoomIn,
    // zoomOut,
    // canZoomIn,
    // canZoomOut,
    // canUndo,
    // canRedo,
    // undo,
    // redo 
}: ToolsBarProps) => {
    return (
        <div className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center rounded-lg bg-white p-1 shadow-[0_0_3px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-center gap-3">
                <SelectionButton
                    isActive={
                        canvasState.mode === CanvasMode.None ||
                        canvasState.mode === CanvasMode.Translating ||
                        canvasState.mode === CanvasMode.SelectionNet ||
                        canvasState.mode === CanvasMode.Pressing ||
                        canvasState.mode === CanvasMode.Resizing ||
                        canvasState.mode === CanvasMode.Dragging
                    }
                    canvasMode={canvasState.mode}
                    onClick={(canvasMode) =>
                        setCanvasState(
                            canvasMode === CanvasMode.Dragging
                                ? { mode: canvasMode, origin: null }
                                : { mode: canvasMode },
                        )
                    }
                />
                <ShapeSelectionButton
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        [LayerType.Rectangle, LayerType.Ellipse].includes(
                            canvasState.layerType,
                        )
                    }
                    canvasState={canvasState}
                    onClick={(layerType) =>
                        setCanvasState({ mode: CanvasMode.Inserting, layerType })
                    }
                />
            </div>
        </div>
    )
}

export default ToolsBar