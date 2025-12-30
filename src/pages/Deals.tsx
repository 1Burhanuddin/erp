import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { PageLayout, PageHeader } from "@/components/layout";
import { StatusBadge } from "@/components/shared";

interface Deal {
  id: string;
  title: string;
  value: string;
  company: string;
}

interface DealsState {
  lead: Deal[];
  negotiation: Deal[];
  closed: Deal[];
}

const Deals = () => {
  const [deals, setDeals] = useState<DealsState>({
    lead: [
      { id: "1", title: "Enterprise Deal", value: "$50,000", company: "Tech Corp" },
      { id: "2", title: "Software License", value: "$25,000", company: "StartUp Inc" },
    ],
    negotiation: [
      { id: "3", title: "Consulting Project", value: "$30,000", company: "Consulting Co" },
    ],
    closed: [
      { id: "4", title: "Training Program", value: "$15,000", company: "Education Ltd" },
    ],
  });

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (source.droppableId === destination.droppableId) {
      const column = Array.from(deals[source.droppableId as keyof DealsState]);
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);
      setDeals({ ...deals, [source.droppableId]: column });
      return;
    }

    const sourceColumn = Array.from(deals[source.droppableId as keyof DealsState]);
    const destColumn = Array.from(deals[destination.droppableId as keyof DealsState]);
    const [removed] = sourceColumn.splice(source.index, 1);
    destColumn.splice(destination.index, 0, removed);
    setDeals({
      ...deals,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });
  };

  const columns = [
    { id: "lead", title: "Lead", status: "info" as const },
    { id: "negotiation", title: "Negotiation", status: "warning" as const },
    { id: "closed", title: "Closed Won", status: "success" as const },
  ];

  return (
    <PageLayout>
      <PageHeader title="Deals Pipeline" description="Track and manage your deals" />

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {columns.map((column) => (
            <div key={column.id} className="min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-semibold text-foreground">{column.title}</h2>
                <StatusBadge
                  status={column.status}
                  label={deals[column.id as keyof DealsState].length.toString()}
                />
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] p-3 md:p-4 rounded-lg border transition-colors ${snapshot.isDraggingOver
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/30 border-border"
                      }`}
                  >
                    {deals[column.id as keyof DealsState].map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 cursor-move bg-card border-border ${snapshot.isDragging
                                ? "shadow-lg ring-2 ring-primary/20"
                                : "hover:shadow-md hover:border-primary/20"
                              } transition-all`}
                          >
                            <h3 className="font-medium text-foreground">{deal.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{deal.company}</p>
                            <p className="text-lg font-semibold text-primary mt-2">{deal.value}</p>
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