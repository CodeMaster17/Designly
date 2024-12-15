import { RectangleLayer } from '@/types/types';
import { colorToCss } from '@/utils';
import React from 'react'

const Rectangle = ({ id, layer, }: {
    id: string;
    layer: RectangleLayer;
}) => {

    const { x, y, width, height, fill, stroke, opacity, cornerRadius } = layer;


    return (
        <g className="group">
            <rect
                style={{ transform: `translate(${x}px, ${y}px)` }}
                width={width}
                height={height}
                fill="none"
                stroke="#0b99ff"
                strokeWidth="4"
                className="pointer-events-none opacity-0 group-hover:opacity-100"
            />
            <rect
                // onPointerDown={(e) => onPointerDown(e, id)}
                style={{ transform: `translate(${x}px, ${y}px)` }}
                width={width}
                height={height}
                fill={fill ? colorToCss(fill) : "#CCC"}
                strokeWidth={1}
                stroke={stroke ? colorToCss(stroke) : "#CCC"}
                opacity={`${opacity ?? 100}%`}
                rx={cornerRadius ?? 0}
                ry={cornerRadius ?? 0}
            />

        </g>
    )
}

export default Rectangle