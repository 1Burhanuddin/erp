import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DebugAuth() {
    const { user, session, isAdmin } = useAuth();
    const [employeeData, setEmployeeData] = useState<any>(null);
    const [employeeError, setEmployeeError] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [rawJwt, setRawJwt] = useState<any>(null);

    const checkEmployee = async () => {
        setLoading(true);
        try {
            if (!user) return;

            // Check Profile Visibility
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('user_id', user.id)
                .single();

            setEmployeeData(data);
            setEmployeeError(error);

            // Decode JWT (unsafe decode for debugging view only)
            if (session?.access_token) {
                const base64Url = session.access_token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                setRawJwt(JSON.parse(jsonPayload));
            }

        } catch (e) {
            setEmployeeError(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkEmployee();
    }, [user]);

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-red-600">Authentication Debugger</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader><CardTitle>Auth Context</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Is Admin (Context):</strong> {isAdmin ? 'YES' : 'NO'}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Employee Table Query (RLS Check)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Button onClick={checkEmployee} disabled={loading} size="sm">Review Query</Button>
                        {employeeError && (
                            <div className="p-2 bg-red-100 text-red-800 rounded text-sm mt-2">
                                <strong>Error:</strong> {JSON.stringify(employeeError)}
                            </div>
                        )}
                        {employeeData ? (
                            <pre className="p-2 bg-green-100 text-green-800 rounded text-xs mt-2 overflow-auto">
                                {JSON.stringify(employeeData, null, 2)}
                            </pre>
                        ) : (
                            <p className="text-muted-foreground mt-2">No data found (or RLS blocked)</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>JWT Metadata (Store ID Check)</CardTitle></CardHeader>
                <CardContent>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded overflow-auto text-xs">
                        {JSON.stringify(rawJwt, null, 2) || "No JWT decoded"}
                    </pre>
                    <div className="mt-4">
                        <p className="font-semibold">Expected in app_metadata:</p>
                        <code className="bg-muted p-1">"store_id": "..."</code>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
