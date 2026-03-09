import { Camera, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ImageSourceSelectorProps {
    onCameraSelect: () => void;
    onGallerySelect: () => void;
    disabled?: boolean;
    isScanning?: boolean;
    children: React.ReactNode;
}

/**
 * A popover component that lets users choose between camera or gallery
 * when scanning/uploading images for AI processing.
 */
export function ImageSourceSelector({
    onCameraSelect,
    onGallerySelect,
    disabled = false,
    isScanning = false,
    children
}: ImageSourceSelectorProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
                <div className="space-y-2">
                    <div className="space-y-1">
                        <h4 className="font-medium text-sm">Select Image Source</h4>
                        <p className="text-xs text-muted-foreground">
                            Choose how you want to capture the document
                        </p>
                    </div>
                    <div className="grid gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={onCameraSelect}
                            disabled={disabled || isScanning}
                        >
                            <Camera className="h-4 w-4" />
                            <span>Take Photo</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={onGallerySelect}
                            disabled={disabled || isScanning}
                        >
                            <Image className="h-4 w-4" />
                            <span>Choose from Gallery</span>
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
