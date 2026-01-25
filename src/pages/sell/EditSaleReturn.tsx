import { useParams, useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSaleReturn, useDeleteSaleReturn } from "@/api/returns";
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

const EditSaleReturn = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: returnData, isLoading } = useSaleReturn(id!);
    const deleteReturn = useDeleteSaleReturn();

    const handleDelete = async () => {
        try {
            await deleteReturn.mutateAsync(id!);
            toast.success("Return deleted and stock reversed successfully");
            navigate("/sell/return");
        } catch (error) {
            toast.error("Failed to delete return");
            console.error(error);
        }
    };

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!returnData) return <div className="p-8">Return not found</div>;

    return (
        <PageLayout>
            <div className="p-2 md:p-6 space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-7">
                        <div className="space-y-1.5">
                            <CardTitle>Return #{returnData.sale?.order_no} (Refund)</CardTitle>
                            <CardDescription>View return details</CardDescription>
                        </div>
                        <div className="flex gap-2 items-center">
                            <Button variant="ghost" onClick={() => navigate("/sell/return")}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="rounded-full w-10 h-10 p-0 hover:w-48 transition-all duration-500 ease-in-out flex items-center justify-center overflow-hidden group">
                                        <Trash2 className="w-4 h-4 shrink-0" />
                                        <span className="w-0 opacity-0 group-hover:w-auto group-hover:opacity-100 group-hover:ml-2 transition-all duration-500 whitespace-nowrap">
                                            Delete Return
                                        </span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will delete the return record and <strong>DECREASE</strong> the stock back (reverse the return).
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
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Return Date</Label>
                            <div className="font-medium">{format(new Date(returnData.return_date), "dd MMM yyyy")}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Order Ref</Label>
                            <div className="font-medium">{returnData.sale?.order_no}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Reason</Label>
                            <div className="font-medium">{returnData.reason}</div>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Total Refund</Label>
                            <div className="font-medium text-red-600">₹{returnData.total_refund_amount?.toFixed(2)}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Returned Items (Restocked)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Return Qty</TableHead>
                                    <TableHead className="text-right">Refund Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {returnData.items?.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.product?.name}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ₹{item.refund_amount?.toFixed(2)}
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

export default EditSaleReturn;
