import { Block } from "@/lib/gameLogic";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";

interface DraggableBlockProps {
  block?: Block;
  index?: number;
  disabled?: boolean;
  // Props for Puzzle Mode (manual drag)
  shape?: number[][];
  color?: string;
}

export default function DraggableBlock({ block, index, disabled, shape, color }: DraggableBlockProps) {
  // Use dnd-kit only if block and index are provided (Classic Mode)
  const isDndEnabled = block !== undefined && index !== undefined;
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: isDndEnabled ? `block-${index}` : 'puzzle-block',
    data: isDndEnabled ? { block, index } : {},
    disabled: !isDndEnabled || disabled
  });

  // Fallback for Puzzle Mode
  const displayShape = block?.shape || shape || [];
  const displayColor = block?.color || color || "bg-blue-500";
  const gridCols = displayShape[0]?.length || 0;

  const handlePointerDown = (e: React.PointerEvent) => {
    // If it's a quick tap without drag, we might want to rotate
    // But dnd-kit handles drag start. We can use onClick for rotation if not dragging.
    // However, dnd-kit captures pointer events.
    // A better approach is to use a separate rotate button or detect tap vs drag.
    // For simplicity in this "click to rotate" request, we can add an onClick handler
    // that only fires if drag didn't happen/move much.
    // But dnd-kit's listeners might swallow click.
    
    // Let's try adding onClick to the div.
    listeners?.onPointerDown(e);
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100,
    cursor: 'grabbing',
    willChange: 'transform', // GPU acceleration hint
  } : {
    willChange: 'auto'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}

      className={cn(
        "touch-none cursor-grab active:cursor-grabbing",
        isDragging && "opacity-0"
      )}
    >
      <div className="grid gap-1" style={{ 
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` 
      }}>
        {displayShape.map((row, r) => (
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={cn(
                "w-6 h-6 sm:w-8 sm:h-8 rounded-sm",
                cell === 1 
                  ? cn(displayColor, "border border-white/20") 
                  : "bg-transparent"
              )}
            >
              {/* Solid color */}
            </div>
          ))
        ))}
      </div>
    </div>
  );
}
