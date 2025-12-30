import { useParams, useNavigate } from "react-router-dom";
import { PageLayout, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useStockAdjustment, useDeleteStockAdjustment } from "@/api/inventory";
import { format } from "date-fns";
import { Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const EditStockAdjustment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: adjustment, isLoading } = useStockAdjustment(id!);
    const deleteAdjustment = useDeleteStockAdjustment();

    const handleDelete = async () => {
        try {
            await deleteAdjustment.mutateAsync(id!);
            toast.success("Adjustment deleted and stock reversed successfully");
            navigate("/stock/adjustment");
        } catch (error) {
            toast.error("Failed to delete adjustment");
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!adjustment) return <div className="p-8">Adjustment not found</div>;

    return (
        <PageLayout>
            <PageHeader
                title={`Adjustment ${adjustment.reference_no}`}
                description="View and manage stock adjustment"
                actions={
                    <div className="flex gap-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete this adjustment record and <strong>REVERSE</strong> the stock changes made by it.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                }
            />
            <Button variant="ghost" onClick={() => navigate("/stock/adjustment")} className="mb-4 -mt-2">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
            </Button>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Date</Label>
                            <div className="font-medium">{format(new Date(adjustment.adjustment_date), "dd MMM yyyy")}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Reason</Label>
                            <div className="font-medium">{adjustment.reason}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Notes</Label>
                            <div className="font-medium">{adjustment.notes || "-"}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Adjusted Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {adjustment.items?.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.product?.name}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.type === 'Increase' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {item.quantity}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default EditStockAdjustment;
