import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, ZoomIn, ZoomOut, Loader2 } from "lucide-react";

interface ImagePreviewDialogProps {
    open: boolean;
    imageUrl: string | null;
    isProcessing: boolean;
    onConfirm: () => void;
    onRetake: () => void;
    onClose: () => void;
}

export function ImagePreviewDialog({
    open,
    imageUrl,
    isProcessing,
    onConfirm,
    onRetake,
    onClose,
}: ImagePreviewDialogProps) {
    const [zoomed, setZoomed] = useState(false);

    if (!imageUrl) return null;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && !isProcessing && onClose()}>
            <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
                {/* Image area */}
                <div className="relative bg-muted/30">
                    {isProcessing && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <p className="text-sm font-medium text-foreground">AI is reading the document…</p>
                        </div>
                    )}
                    <div className={`overflow-auto transition-all duration-200 ${zoomed ? "max-h-[70vh] cursor-zoom-out" : "max-h-[50vh] cursor-zoom-in"}`}
                        onClick={() => setZoomed(!zoomed)}
                    >
                        <img
                            src={imageUrl}
                            alt="Captured document"
                            className={`w-full object-contain transition-transform duration-200 ${zoomed ? "scale-150" : ""}`}
                        />
                    </div>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-10 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm"
                        onClick={() => setZoomed(!zoomed)}
                    >
                        {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-2 p-4 border-t">
                    <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={onRetake}
                        disabled={isProcessing}
                    >
                        <RotateCcw className="h-4 w-4" /> Retake
                    </Button>
                    <Button
                        className="flex-1 gap-2"
                        onClick={onConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                            : <><Check className="h-4 w-4" /> Use This Image</>
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
