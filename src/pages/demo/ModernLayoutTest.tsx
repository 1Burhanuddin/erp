// MUI Imports
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

// Icons
import { Columns, Filter } from 'lucide-react'; // Fallback if remix icons aren't available as components

const ModernLayoutTest = () => {
    return (
        <Grid container spacing={6}>
            {/* Page Header */}
            <Grid item xs={12} className="flex justify-between items-center">
                <Typography variant="h4" className="font-semibold text-gray-800">
                    Storage Request List
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<span className="text-xl">+</span>}
                    className="bg-gray-800 hover:bg-gray-700 text-white capitalize px-6 py-2 rounded-lg"
                >
                    Add New Request
                </Button>
            </Grid>

            {/* Main Content Card */}
            <Grid item xs={12}>
                <Card className="shadow-sm border-0">
                    <CardContent className="p-0">
                        {/* Toolbar */}
                        <div className="p-4 flex gap-2 border-b border-gray-100">
                            <IconButton size="small">
                                <Columns className="w-5 h-5 text-gray-500" />
                            </IconButton>
                            <IconButton size="small">
                                <Filter className="w-5 h-5 text-gray-500" />
                            </IconButton>
                        </div>

                        {/* Table */}
                        <Table>
                            <TableHead className="bg-gray-50/50">
                                <TableRow>
                                    <TableCell className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Order No</TableCell>
                                    <TableCell className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Customer</TableCell>
                                    <TableCell className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Date</TableCell>
                                    <TableCell className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {/* Row 1 */}
                                <TableRow hover>
                                    <TableCell className="font-medium text-gray-900">1231250028</TableCell>
                                    <TableCell className="text-gray-600">Manoj Translift</TableCell>
                                    <TableCell className="text-gray-600">2026-01-30</TableCell>
                                    <TableCell>
                                        <Chip
                                            label="PENDING"
                                            size="small"
                                            className="bg-orange-100 text-orange-700 font-semibold rounded-md text-xs px-1"
                                        />
                                    </TableCell>
                                </TableRow>

                                {/* Row 2 */}
                                <TableRow hover>
                                    <TableCell className="font-medium text-gray-900">1231250027</TableCell>
                                    <TableCell className="text-gray-600">Proclaim Insurance Surveyors & Loss Pvt</TableCell>
                                    <TableCell className="text-gray-600">2026-01-29</TableCell>
                                    <TableCell>
                                        <Chip
                                            label="APPROVE"
                                            size="small"
                                            className="bg-green-100 text-green-700 font-semibold rounded-md text-xs px-1"
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </Grid>

            {/* Dummy Scroll Content */}
            <Grid item xs={12}>
                <Card className="p-8">
                    <Typography variant="h6" className="mb-4">Scroll Test Section</Typography>
                    {Array.from({ length: 20 }).map((_, i) => (
                        <p key={i} className="mb-4 text-gray-500">
                            This is line {i + 1} of the scroll test to verify the sticky header behavior.
                            The header should remain at the top of the screen while you scroll past this content.
                        </p>
                    ))}
                </Card>
            </Grid>

            {/* Migration Status: MUI Components Comparison */}
            <Grid item xs={12}>
                <Card className="p-6 border border-dashed border-gray-300">
                    <Typography variant="h5" className="mb-6 font-bold text-gray-800">
                        Component Migration Status
                    </Typography>

                    <div className="space-y-8">
                        {/* Buttons Section */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <Typography variant="h6" className="mb-4 text-sm uppercase tracking-wide text-gray-500 font-bold">
                                1. Buttons (MUI vs Old)
                            </Typography>
                            <div className="flex flex-wrap gap-4 items-center">
                                {/* New MUI Button */}
                                <Button variant="contained" color="primary">
                                    MUI Contained
                                </Button>
                                <Button variant="outlined" color="secondary">
                                    MUI Outlined
                                </Button>
                                <Button variant="text" color="error">
                                    MUI Text
                                </Button>
                                <Divider orientation="vertical" flexItem className="mx-2" />
                                {/* Old Button style simulation (Shadcn usually uses className) */}
                                <button className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 text-sm font-medium transition-colors">
                                    Shadcn/Old Button
                                </button>
                            </div>
                        </div>

                        {/* Inputs Section */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <Typography variant="h6" className="mb-4 text-sm uppercase tracking-wide text-gray-500 font-bold">
                                2. Input Fields
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Typography variant="subtitle2">MUI TextField</Typography>
                                    <div className="space-y-4">
                                        <TextField label="Standard" variant="standard" fullWidth />
                                        <TextField label="Outlined" variant="outlined" size="small" fullWidth />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Typography variant="subtitle2">Old Input (HTML/Tailwind)</Typography>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Standard HTML Input"
                                            className="w-full border-b border-gray-300 p-2 focus:outline-none focus:border-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Tailwind Outlined Input"
                                            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Section */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <Typography variant="h6" className="mb-4 text-sm uppercase tracking-wide text-gray-500 font-bold">
                                3. Feedbacks
                            </Typography>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Alert severity="success">MUI Success Alert</Alert>
                                    <Alert severity="warning">MUI Warning Alert</Alert>
                                </div>
                                <div className="space-y-2">
                                    <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm font-medium">
                                        Old Tailwind Success Alert
                                    </div>
                                    <div className="p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md text-sm font-medium">
                                        Old Tailwind Warning Alert
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </Grid>
        </Grid>
    );
};

export default ModernLayoutTest;
