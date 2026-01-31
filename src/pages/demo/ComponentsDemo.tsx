import { PageLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import InputAdornment from "@mui/material/InputAdornment";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, Search, Plus, Trash2, Edit, Save } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// MUI Imports
import MuiButton from "@mui/material/Button";
import MuiTable from "@mui/material/Table";
import MuiTableBody from "@mui/material/TableBody";
import MuiTableCell from "@mui/material/TableCell";
import MuiTableContainer from "@mui/material/TableContainer";
import MuiTableHead from "@mui/material/TableHead";
import MuiTableRow from "@mui/material/TableRow";
import MuiPaper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import Sidebar, { SidebarMobileContent } from "@/components/layout/Sidebar";

const ComponentsDemo = () => {
    const [loading, setLoading] = useState(false);
    const [switchState, setSwitchState] = useState(false);
    const [demoSidebarCollapsed, setDemoSidebarCollapsed] = useState(false);

    const toggleLoading = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <PageLayout>
            <div className="space-y-8 p-4 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Components Style Guide</h1>
                    <p className="text-muted-foreground">Reference for global UI elements and their styling.</p>
                </div>

                {/* Buttons Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Buttons</CardTitle>
                        <CardDescription>Various button variants and sizes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button>Default (Primary)</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="link">Link</Button>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button size="sm">Small</Button>
                            <Button size="default">Default Size</Button>
                            <Button size="lg">Large</Button>
                            <Button size="icon"><Plus className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button disabled>Disabled</Button>
                            <Button onClick={toggleLoading} disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Click for Loading"}
                                {loading ? "Please wait" : "Loading State"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Inputs Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Input Fields (MUI)</CardTitle>
                        <CardDescription>TextFields, Selects, and Switches using Material UI.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <TextField label="Standard Input" fullWidth placeholder="Placeholder text" />
                            <TextField label="Outlined Input" fullWidth variant="outlined" />
                            <TextField label="Filled Input" fullWidth variant="filled" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <TextField label="Error State" fullWidth error helperText="Invalid input" />
                            <TextField label="Disabled State" fullWidth disabled defaultValue="Cannot edit this" />
                            <TextField
                                label="With Icon"
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Search size={20} /></InputAdornment>,
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField select label="Select Option" fullWidth defaultValue="">
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem value="1">Option 1</MenuItem>
                                <MenuItem value="2">Option 2</MenuItem>
                                <MenuItem value="3">Option 3</MenuItem>
                            </TextField>
                            <TextField select label="Select Option (Filled)" variant="filled" fullWidth defaultValue="">
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem value="1">Option 1</MenuItem>
                                <MenuItem value="2">Option 2</MenuItem>
                            </TextField>
                        </div>
                        <div className="flex flex-wrap gap-8 items-center">
                            <FormControlLabel
                                control={<Switch checked={switchState} onChange={(e) => setSwitchState(e.target.checked)} />}
                                label="Switch Toggle"
                            />
                            <FormControlLabel control={<Checkbox defaultChecked />} label="Checkbox" />
                            <RadioGroup row defaultValue="a" name="radio-buttons-group">
                                <FormControlLabel value="a" control={<Radio />} label="Radio A" />
                                <FormControlLabel value="b" control={<Radio />} label="Radio B" />
                            </RadioGroup>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tables</CardTitle>
                        <CardDescription>Standard data table layout.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">INV001</TableCell>
                                        <TableCell>Paid</TableCell>
                                        <TableCell>Credit Card</TableCell>
                                        <TableCell className="text-right">$250.00</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">INV002</TableCell>
                                        <TableCell>Pending</TableCell>
                                        <TableCell>PayPal</TableCell>
                                        <TableCell className="text-right">$150.00</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
                                                <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Feedback Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Feedback & Alerts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="default" className="border-primary/50 bg-primary/10">
                            <AlertTitle>Info Box</AlertTitle>
                            <AlertDescription>This is an informational alert.</AlertDescription>
                        </Alert>
                        <Alert variant="destructive">
                            <AlertTitle>Error Box</AlertTitle>
                            <AlertDescription>Something went wrong! Please try again.</AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* MUI Components Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>MUI Components Comparison</CardTitle>
                        <CardDescription>Native Material UI components to verify theme application.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* MUI Buttons */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">MUI Buttons</h3>
                            <div className="flex flex-wrap gap-4 items-center">
                                <MuiButton variant="contained">Contained (Primary)</MuiButton>
                                <MuiButton variant="contained" color="secondary">Contained (Secondary)</MuiButton>
                                <MuiButton variant="outlined">Outlined</MuiButton>
                                <MuiButton variant="text">Text</MuiButton>
                                <MuiButton variant="contained" disabled>Disabled</MuiButton>
                                <MuiButton variant="contained" color="error">Error</MuiButton>
                                <IconButton aria-label="add" color="primary">
                                    <AddIcon />
                                </IconButton>
                                <IconButton aria-label="delete" color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        </div>

                        <Divider />

                        {/* MUI Badge & Chips */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">MUI Feedbacks</h3>
                            <div className="flex flex-wrap gap-6 items-center">
                                <Badge badgeContent={4} color="primary">
                                    <MuiButton variant="outlined">Badge</MuiButton>
                                </Badge>
                                <Chip label="Chip Primary" color="primary" />
                                <Chip label="Chip Secondary" color="secondary" />
                                <Chip label="Chip Outlined" variant="outlined" />
                                <CircularProgress size={24} />
                                <CircularProgress color="secondary" size={24} />
                            </div>
                        </div>

                        <Divider />

                        {/* MUI Table */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">MUI Table</h3>
                            <MuiTableContainer component={MuiPaper} sx={{ borderRadius: '12px', border: '1px solid var(--border)' }} elevation={0}>
                                <MuiTable aria-label="simple table">
                                    <MuiTableHead>
                                        <MuiTableRow>
                                            <MuiTableCell>Dessert (100g serving)</MuiTableCell>
                                            <MuiTableCell align="right">Calories</MuiTableCell>
                                            <MuiTableCell align="right">Fat&nbsp;(g)</MuiTableCell>
                                            <MuiTableCell align="right">Carbs&nbsp;(g)</MuiTableCell>
                                            <MuiTableCell align="right">Protein&nbsp;(g)</MuiTableCell>
                                        </MuiTableRow>
                                    </MuiTableHead>
                                    <MuiTableBody>
                                        {[
                                            { name: 'Frozen yoghurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0 },
                                            { name: 'Ice cream sandwich', calories: 237, fat: 9.0, carbs: 37, protein: 4.3 },
                                        ].map((row) => (
                                            <MuiTableRow
                                                key={row.name}
                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <MuiTableCell component="th" scope="row">
                                                    {row.name}
                                                </MuiTableCell>
                                                <MuiTableCell align="right">{row.calories}</MuiTableCell>
                                                <MuiTableCell align="right">{row.fat}</MuiTableCell>
                                                <MuiTableCell align="right">{row.carbs}</MuiTableCell>
                                                <MuiTableCell align="right">{row.protein}</MuiTableCell>
                                            </MuiTableRow>
                                        ))}
                                    </MuiTableBody>
                                </MuiTable>
                            </MuiTableContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Overlays Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Navigation & Overlays</CardTitle>
                        <CardDescription>Sheet (used for mobile Sidebar) and Drawer components.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-6">
                        {/* Sheet Demo */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline">Open Right Sidebar (Sheet)</Button>
                            </SheetTrigger>
                            <SheetContent className="flex flex-col gap-0 p-0">
                                <SheetHeader className="p-4 border-b">
                                    <SheetTitle>Navigation</SheetTitle>
                                    <SheetDescription>
                                        Mobile navigation menu.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="flex-1 overflow-auto">
                                    <SidebarMobileContent />
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Drawer Demo */}
                        <Drawer>
                            <DrawerTrigger asChild>
                                <Button variant="outline">Open Bottom Drawer</Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <div className="mx-auto w-full max-w-sm">
                                    <DrawerHeader>
                                        <DrawerTitle>Move Goal</DrawerTitle>
                                        <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                                    </DrawerHeader>
                                    <div className="p-4 pb-0">
                                        <div className="flex items-center justify-center space-x-2">
                                            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full">
                                                <div className="h-4 w-4" />
                                                <span className="sr-only">Decrease</span>
                                            </Button>
                                            <div className="flex-1 text-center">
                                                <div className="text-7xl font-bold tracking-tighter">350</div>
                                                <div className="text-[0.70rem] uppercase text-muted-foreground">Calories/day</div>
                                            </div>
                                            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full">
                                                <div className="h-4 w-4" />
                                                <span className="sr-only">Increase</span>
                                            </Button>
                                        </div>
                                    </div>
                                    <DrawerFooter>
                                        <Button>Submit</Button>
                                        <DrawerClose asChild>
                                            <Button variant="outline">Cancel</Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </CardContent>
                </Card>

                {/* Actual Sidebar Component Demo */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sidebar Component</CardTitle>
                        <CardDescription>The actual application Sidebar rendered in isolation.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[600px] border rounded-lg overflow-hidden relative flex">
                        <div className="relative h-full">
                            <Sidebar isCollapsed={demoSidebarCollapsed} setIsCollapsed={setDemoSidebarCollapsed} />
                        </div>
                        <div className="flex-1 bg-muted/20 p-8">
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg h-full flex items-center justify-center text-muted-foreground">
                                Main Content Area
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default ComponentsDemo;
