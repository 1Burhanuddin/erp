import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check, ZoomIn, ZoomOut, Loader2, ChevronLeft, ChevronRight, Plus, ImagePlus, Trash2 } from "lucide-react";

interface ImagePreviewDialogProps {
    open: boolean;
    imageUrl: string | null;
    isProcessing: boolean;
    onConfirm: () => void;
    onRetake: () => void;
    onClose: () => void;
    // Batch props
    totalImages?: number;
    currentIndex?: number;
    onPrev?: () => void;
    onNext?: () => void;
    onAddMore?: () => void;
}

export function ImagePreviewDialog({
    open,
    imageUrl,
    isProcessing,
    onConfirm,
    onRetake,
    onClose,
    totalImages = 1,
    currentIndex = 0,
    onPrev,
    onNext,
    onAddMore,
}: ImagePreviewDialogProps) {
    const [zoomed, setZoomed] = useState(false);

    if (!imageUrl) return null;

    const isBatch = totalImages > 1;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && !isProcessing && onClose()}>
            <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
                {/* Batch indicator */}
                {totalImages > 0 && (
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                                Document {currentIndex + 1} of {totalImages}
                            </span>
                        </div>
                        {isBatch && (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={currentIndex === 0 || isProcessing}
                                    onClick={onPrev}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={currentIndex === totalImages - 1 || isProcessing}
                                    onClick={onNext}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Image area */}
                <div className="relative bg-muted/30">
                    {isProcessing && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <p className="text-sm font-medium text-foreground">
                                {isBatch
                                    ? `Processing ${totalImages} document(s)…`
                                    : "AI is reading the document…"
                                }
                            </p>
                        </div>
                    )}
                    <div
                        className={`overflow-auto transition-all duration-200 ${zoomed ? "max-h-[70vh] cursor-zoom-out" : "max-h-[50vh] cursor-zoom-in"}`}
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
                <div className="flex flex-col gap-2 p-4 border-t">
                    {/* Add more button */}
                    {onAddMore && (
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-dashed"
                            onClick={onAddMore}
                            disabled={isProcessing}
                        >
                            <ImagePlus className="h-4 w-4" /> Add Another Document
                        </Button>
                    )}

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={onRetake}
                            disabled={isProcessing}
                        >
                            <Trash2 className="h-4 w-4" /> {isBatch ? "Remove" : "Retake"}
                        </Button>
                        <Button
                            className="flex-1 gap-2"
                            onClick={onConfirm}
                            disabled={isProcessing}
                        >
                            {isProcessing
                                ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                                : <><Check className="h-4 w-4" /> {isBatch ? `Process All (${totalImages})` : "Use This Image"}</>
                            }
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
