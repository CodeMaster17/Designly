import { useStorage } from "@liveblocks/react";
import { memo } from "react";
import { LayerType } from "@/types/types";
import { colorToCss } from "@/utils";
import Path from "./Path";
import Rectangle from "./Rectangle";


const LayerComponent = memo(
    ({
        id,
        // onLayerPointerDown,
    }: {
        id: string;
        // onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
    }) => {
        const layer = useStorage((root) => root.layers.get(id));
        if (!layer) {
            return null;
        }

        switch (layer.type) {
            case LayerType.Path:
                return (
                    <Path
                        // onPointerDown={(e) => onLayerPointerDown(e, id)}
                        points={layer.points}
                        x={layer.x}
                        y={layer.y}
                        fill={layer.fill ? colorToCss(layer.fill) : "#CCC"}
                        stroke={layer.stroke ? colorToCss(layer.stroke) : "#CCC"}
                        opacity={layer.opacity}
                    />
                );
            case LayerType.Rectangle:
                return (
                    <Rectangle
                    //  onPointerDown={onLayerPointerDown} 
                     id={id} layer={layer} />
                     
                );
            // case LayerType.Ellipse:
            //     return (
            //         <Ellipse onPointerDown={onLayerPointerDown} id={id} layer={layer} />
            //     );
            // case LayerType.Text:
            //     return (
            //         <Text onPointerDown={onLayerPointerDown} id={id} layer={layer} />
            //     );
            default:
                return null;
        }
    },
);

LayerComponent.displayName = "LayerComponent";

export default LayerComponent;