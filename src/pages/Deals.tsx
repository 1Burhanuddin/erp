import { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { PageLayout, PageHeader } from "@/components/layout";
import { StatusBadge } from "@/components/shared";
import { useDeals, useUpdateDeal, useCreateDeal, Deal } from "@/api/deals";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { ExpandableSearch } from "@/components/ui/expandable-search";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContacts } from "@/api/contacts";

// Define columns/statuses mapping
const COLUMNS = [
  { id: "New", title: "New Lead", status: "info" as const },
  { id: "Contacted", title: "Contacted", status: "warning" as const },
  { id: "Negotiation", title: "Negotiation", status: "primary" as const }, // Merged Qualified & Proposal
  { id: "Won", title: "Closed Won", status: "success" as const },
  { id: "Lost", title: "Closed Lost", status: "error" as const },
];

const Deals = () => {
  const { data: dealsData, isLoading } = useDeals();
  const deals = useMemo(() => dealsData || [], [dealsData]);
  const updateDealMutation = useUpdateDeal();
  const createDealMutation = useCreateDeal();
  const { data: contactsData } = useContacts();
  const contacts = useMemo(() => contactsData || [], [contactsData]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newDeal, setNewDeal] = useState({
    title: "",
    value: "",
    contact_id: "",
    status: "New"
  });

  // Group deals by status
  const [columns, setColumns] = useState<Record<string, Deal[]>>({});

  useEffect(() => {
    if (deals) {
      const grouped: Record<string, Deal[]> = {};
      COLUMNS.forEach(col => grouped[col.id] = []);
      deals.forEach(deal => {
        // Filter by search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matches =
            deal.title.toLowerCase().includes(query) ||
            deal.contacts?.name?.toLowerCase().includes(query) ||
            deal.contacts?.company?.toLowerCase().includes(query);

          if (!matches) return;
        }

        // Map legacy/granular statuses to "Negotiation"
        let status = deal.status;
        if (status === 'Qualified' || status === 'Proposal') status = 'Negotiation';

        if (grouped[status]) {
          grouped[status].push(deal);
        }
      });
      setColumns(grouped);
    }
  }, [deals, searchQuery]);


  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI Update
    const sourceColumn = [...columns[source.droppableId]];
    const destColumn = source.droppableId === destination.droppableId
      ? sourceColumn
      : [...columns[destination.droppableId]];

    const [movedDeal] = sourceColumn.splice(source.index, 1);
    const updatedDeal = { ...movedDeal, status: destination.droppableId };
    destColumn.splice(destination.index, 0, updatedDeal);

    if (source.droppableId === destination.droppableId) {
      setColumns({ ...columns, [source.droppableId]: sourceColumn });
    } else {
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn
      });
    }

    const newStatus = destination.droppableId;
    updateDealMutation.mutate({ id: draggableId, status: newStatus });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeal.title || !newDeal.contact_id) return;

    createDealMutation.mutate({
      title: newDeal.title,
      value: Number(newDeal.value) || 0,
      contact_id: newDeal.contact_id,
      status: newDeal.status
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setNewDeal({ title: "", value: "", contact_id: "", status: "New" });
      }
    });
  };

  const handleMoveDeal = (deal: Deal, newStatus: string) => {
    // Optimistic update for click-to-move
    const sourceStatus = (deal.status === 'Qualified' || deal.status === 'Proposal') ? 'Negotiation' : deal.status;
    if (sourceStatus === newStatus) return;

    const sourceColumn = [...columns[sourceStatus]];
    const destColumn = [...columns[newStatus]];

    // Remove from source (find index by ID as it might not be the dragged item logic)
    const index = sourceColumn.findIndex(d => d.id === deal.id);
    if (index === -1) return;

    const [movedDeal] = sourceColumn.splice(index, 1);
    const updatedDeal = { ...movedDeal, status: newStatus };
    destColumn.push(updatedDeal); // Add to end of list

    setColumns({
      ...columns,
      [sourceStatus]: sourceColumn,
      [newStatus]: destColumn
    });

    updateDealMutation.mutate({ id: deal.id, status: newStatus });
  };

  if (isLoading) {
    return <PageLayout><PageHeader title="Deals Pipeline" description="Loading deals..." /></PageLayout>;
  }

  return (
    <PageLayout>
      <ExpandableSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search deals..."
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 z-50 rounded-full h-14 px-6 shadow-xl"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            <span className="font-medium text-base">New Deal</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Deal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Deal Title</Label>
              <Input
                id="title"
                placeholder="e.g. Website Redesign"
                value={newDeal.title}
                onChange={e => setNewDeal({ ...newDeal, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                placeholder="0.00"
                value={newDeal.value}
                onChange={e => setNewDeal({ ...newDeal, value: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact / Company</Label>
              <Select
                value={newDeal.contact_id}
                onValueChange={val => setNewDeal({ ...newDeal, contact_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createDealMutation.isPending}>
                {createDealMutation.isPending ? "Creating..." : "Create Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pb-4">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col bg-muted/20 rounded-lg p-2 h-[calc(100vh-250px)] min-h-[500px]">
              <div className="flex items-center justify-between mb-3 px-2 pt-2">
                <h2 className="font-semibold text-foreground text-sm uppercase tracking-wider">{column.title}</h2>
                <StatusBadge
                  status={column.status}
                  label={(columns[column.id]?.length || 0).toString()}
                />
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-3 p-2 rounded-md transition-colors overflow-y-auto ${snapshot.isDraggingOver
                      ? "bg-primary/5"
                      : ""
                      }`}
                  >
                    {columns[column.id]?.map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 cursor-move bg-card border-border shadow-sm hover:shadow-md transition-all group ${snapshot.isDragging
                              ? "shadow-lg ring-2 ring-primary/20 rotate-2"
                              : ""
                              }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-foreground truncate">{deal.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {deal.contacts?.company || deal.contacts?.name || "Unknown"}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Move to...</DropdownMenuLabel>
                                  {COLUMNS.filter(c => c.id !== column.id).map(c => (
                                    <DropdownMenuItem
                                      key={c.id}
                                      onClick={() => handleMoveDeal(deal, c.id)}
                                    >
                                      {c.title}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-sm font-bold text-primary mt-2">
                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(deal.value)}
                            </p>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </PageLayout>
  );
};


export default Deals;