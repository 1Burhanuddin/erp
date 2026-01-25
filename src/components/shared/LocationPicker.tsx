import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Crosshair, Loader2, Search } from 'lucide-react';

// Fix for default marker icon in Leaflet with React
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    value?: { lat: number; lng: number };
    onChange: (location: { lat: number; lng: number }) => void;
}

// ---- Sub-components defined outside to prevent re-mounting ----

function MapEvents({ onBoundsChange }: { onBoundsChange: (bounds: string) => void }) {
    const map = useMapEvents({
        moveend: () => {
            const b = map.getBounds();
            // Nominatim viewbox: min_lon, max_lat, max_lon, min_lat (left, top, right, bottom)
            // Leaflet getWest (minLon), getNorth (maxLat), getEast (maxLon), getSouth (minLat)
            const viewbox = `${b.getWest()},${b.getNorth()},${b.getEast()},${b.getSouth()}`;
            onBoundsChange(viewbox);
        }
    });
    return null;
}

function LocationMarker({ position, onChange, onReverseGeocode }: {
    position: { lat: number, lng: number } | null,
    onChange: (pos: { lat: number, lng: number }) => void,
    onReverseGeocode: (lat: number, lng: number) => void
}) {
    const map = useMapEvents({
        click(e) {
            onChange(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
            onReverseGeocode(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position} />
    );
}

// ---- Main Component ----

export function LocationPicker({ value, onChange }: LocationPickerProps) {
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(value || null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [mapBounds, setMapBounds] = useState<string>("");

    useEffect(() => {
        if (value) setPosition(value);
    }, [value]);

    const handleReverseGeocode = async (lat: number, lng: number) => {
        try {
            // zoom=18 forces building/shop level precision
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();
            if (data && data.display_name) {
                // Try to get a short recognizable name first
                const shortName = data.address?.amenity || data.address?.shop || data.address?.building || data.address?.road || data.display_name.split(',')[0];
                setSearchQuery(data.display_name); // Fill input with full address
                // toast.success(`Selected: ${shortName}`);
            }
        } catch (error) {
            console.error("Reverse geocode error", error);
        }
    };

    // Debounced Autocomplete Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length < 3) {
                setSuggestions([]);
                return;
            }

            setIsSearching(true);
            try {
                // Construct URL with viewbox bias
                let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&addressdetails=1`;

                if (mapBounds) {
                    url += `&viewbox=${mapBounds}&bounded=1`; // Enforce bounds
                }

                const response = await fetch(url);
                const data = await response.json();
                setSuggestions(data || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Autocomplete error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [searchQuery, mapBounds]);

    const handleSelectLocation = (result: any) => {
        const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        setPosition(newPos);
        onChange(newPos);

        // Use the name from the result
        setSearchQuery(result.display_name);
        setShowSuggestions(false);
        toast.success("Location pinned");
    };

    const handleGetCurrentLocation = async () => {
        setLoadingLocation(true);

        if (!("geolocation" in navigator)) {
            toast.error("Geolocation is not supported by your browser.");
            setLoadingLocation(false);
            return;
        }

        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            if (permission.state === 'denied') {
                toast.error("Location access is blocked.", {
                    description: "Please enable Location in your browser settings URL bar.",
                    duration: 5000,
                });
                setLoadingLocation(false);
                return;
            }
        } catch (e) { }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;

                if (accuracy > 1000) {
                    toast.warning("Low Accuracy", {
                        description: `Location is approximate (${Math.round(accuracy)}m). Verify manually.`,
                    });
                }

                const newPos = { lat: latitude, lng: longitude };
                setPosition(newPos);
                onChange(newPos);

                // Get address for this location
                handleReverseGeocode(latitude, longitude);

                setLoadingLocation(false);
                toast.success("Location updated");
            },
            (error) => {
                setLoadingLocation(false);
                if (error.code === error.PERMISSION_DENIED) {
                    toast.error("Permission denied");
                } else {
                    toast.error("Could not get location");
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleManualLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && position) {
            const newPos = { ...position, lat: val };
            setPosition(newPos);
            onChange(newPos);
        } else if (!isNaN(val) && !position) {
            const newPos = { lat: val, lng: 0 }; // Default lng if null
            setPosition(newPos);
            onChange(newPos);
        }
    };

    const handleManualLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && position) {
            const newPos = { ...position, lng: val };
            setPosition(newPos);
            onChange(newPos);
        } else if (!isNaN(val) && !position) {
            const newPos = { lat: 0, lng: val };
            setPosition(newPos);
            onChange(newPos);
        }
    };

    return (
        <div className="space-y-3 relative group">
            {/* Search and Map sections remain unchanged ... */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between relative z-50">
                <div className="flex w-full items-start space-x-2 relative">
                    <div className="relative w-full">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Search (e.g., 'Walmart', 'Main St')..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (!showSuggestions) setShowSuggestions(true);
                                }}
                                className="h-9 w-full pr-8"
                            />
                            {isSearching && (
                                <div className="absolute right-2.5 top-2.5">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        {/* Dropdown Results */}
                        {showSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-popover text-popover-foreground border rounded-md shadow-lg z-[1001] max-h-[250px] overflow-y-auto">
                                {suggestions.length > 0 ? (
                                    suggestions.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-2.5 text-sm hover:bg-muted cursor-pointer flex items-start gap-2.5 border-b last:border-0 transition-colors"
                                            onClick={() => handleSelectLocation(item)}
                                        >
                                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-medium line-clamp-1 text-foreground">
                                                    {item.name || item.display_name.split(',')[0]}
                                                </span>
                                                <span className="text-xs text-muted-foreground line-clamp-2">
                                                    {item.display_name}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        {searchQuery.length < 3 ? "Type more to search..." : "No results found."}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    disabled={loadingLocation}
                    className="h-9 shrink-0 w-full sm:w-auto mt-2 sm:mt-0"
                >
                    {loadingLocation ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Crosshair className="mr-2 h-3 w-3" />}
                    Use My Location
                </Button>
            </div>

            <div className="h-[300px] w-full rounded-lg overflow-hidden border z-0 relative">
                <MapContainer center={position || { lat: 20.5937, lng: 78.9629 }} zoom={position ? 15 : 5} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={position}
                        onChange={(pos) => { setPosition(pos); onChange(pos); }}
                        onReverseGeocode={handleReverseGeocode}
                    />
                    <MapEvents onBoundsChange={setMapBounds} />
                </MapContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Latitude</label>
                    <Input
                        type="number"
                        step="any"
                        value={position?.lat || ''}
                        onChange={handleManualLatChange}
                        placeholder="20.59..."
                        className="h-9 font-mono text-xs"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Longitude</label>
                    <Input
                        type="number"
                        step="any"
                        value={position?.lng || ''}
                        onChange={handleManualLngChange}
                        placeholder="78.96..."
                        className="h-9 font-mono text-xs"
                    />
                </div>
            </div>

            {showSuggestions && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowSuggestions(false)} />
            )}
        </div>
    );
}
