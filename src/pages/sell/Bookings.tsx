import { useState } from "react";
import { PageLayout, PageHeader } from "@/components/layout";
import { DataViewToggle, DataCard } from "@/components/shared";
import { useBookings, useUpdateBooking, useDeleteBooking, Booking } from "@/api/bookings";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Clock, MapPin, Phone, Mail } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Bookings = () => {
    const { data: bookings, isLoading } = useBookings();
    const updateBooking = useUpdateBooking();
    const deleteBooking = useDeleteBooking();
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateBooking.mutateAsync({ id, status });
            toast.success(`Booking status updated to ${status}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this booking?")) {
            try {
                await deleteBooking.mutateAsync(id);
                toast.success("Booking deleted");
            } catch (error) {
                toast.error("Failed to delete booking");
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <PageLayout>
            <PageHeader
                title="Web Bookings"
                description="Manage service requests from website"
                actions={
                    <div className="hidden sm:block">
                        <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                    </div>
                }
            />

            <div className="sm:hidden mb-4">
                <DataViewToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>

            <div className="p-4">
                {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-48 w-full rounded-xl" />
                            ))
                        ) : bookings?.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-muted-foreground">No bookings found.</div>
                        ) : (
                            bookings?.map((booking) => (
                                <DataCard key={booking.id}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-foreground">{booking.customer_name}</h3>
                                            <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                <Phone className="h-3 w-3 mr-1" /> {booking.customer_phone}
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className={getStatusColor(booking.status || 'pending')}>
                                            {booking.status}
                                        </Badge>
                                    </div>
                                    {booking.store_id && (
                                        <div className="flex items-center gap-1 mb-2">
                                            <Badge variant="outline" className="text-[10px] h-5">
                                                Store: {booking.store_id.slice(0, 8)}...
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="space-y-2 text-sm mt-4">
                                        <div className="flex items-center gap-2">
                                            <WrenchIcon className="h-4 w-4 text-muted-foreground" />
                                            <span>{booking.service_type}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{booking.preferred_date ? format(new Date(booking.preferred_date), "dd MMM yyyy") : "No date"}</span>
                                            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                                            <span>{booking.preferred_time || "Any time"}</span>
                                        </div>
                                        {booking.address && (
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                <span className="line-clamp-2">{booking.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-3 border-t flex justify-end gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm">Update Status</Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'confirmed')}>Confirm</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'completed')}>Complete</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'cancelled')}>Cancel</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(booking.id)} className="text-red-600">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </DataCard>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-10 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : bookings?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No bookings found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bookings?.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>
                                                <div className="font-medium">{booking.customer_name}</div>
                                                <div className="text-xs text-muted-foreground">{booking.customer_phone}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{booking.service_type}</Badge>
                                                {booking.store_id && (
                                                    <Badge variant="secondary" className="ml-2 text-[10px]">Store: {booking.store_id.slice(0, 6)}</Badge>
                                                )}
                                                {booking.notes && <div className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{booking.notes}</div>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {booking.preferred_date ? format(new Date(booking.preferred_date), "dd MMM yyyy") : "-"}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{booking.preferred_time}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={getStatusColor(booking.status || 'pending')}>
                                                    {booking.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">Actions</Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'confirmed')}>Mark Confirmed</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'completed')}>Mark Completed</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'cancelled')}>Mark Cancelled</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(booking.id)} className="text-red-600">Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

function WrenchIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    )
}

export default Bookings;
