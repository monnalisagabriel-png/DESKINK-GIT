
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const DebugSupabase = () => {
    const [status, setStatus] = useState<string>('Connecting...');
    const [details, setDetails] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);
    const [channelStatus, setChannelStatus] = useState<string>('Idle');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    setStatus('Error connecting');
                    setDetails(error.message);
                } else {
                    setStatus('Connected');
                    const userDetails = session?.user
                        ? `User: ${session.user.email}\nStudio ID: ${session.user.user_metadata?.studio_id}`
                        : 'No active session';
                    setDetails(`Supabase Reachable.\n${userDetails}`);
                }
            } catch (err: any) {
                setStatus('Exception');
                setDetails(err.message || 'Unknown error');
            }
        };

        checkConnection();
    }, []);

    useEffect(() => {
        // Debug Realtime Listener
        const channel = supabase.channel('debug-room')
            .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
                const msg = `[${new Date().toLocaleTimeString()}] Event: ${payload.eventType} on ${payload.table}`;
                setLogs(prev => [msg, ...prev].slice(0, 20));
                console.log('Debug Realtime Payload:', payload);
            })
            .subscribe((status) => {
                setChannelStatus(status);
                setLogs(prev => [`[${new Date().toLocaleTimeString()}] Status: ${status}`, ...prev]);
            });

        return () => {
            supabase.removeChannel(channel);
        }
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Supabase Debugger</h1>

            <div className="grid gap-4">
                <div style={{
                    padding: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    background: status === 'Connected' ? '#f0fdf4' : '#fef2f2',
                    color: status === 'Connected' ? '#15803d' : '#b91c1c'
                }}>
                    <h3>Auth Connection</h3>
                    <div className="font-bold">{status}</div>
                    <pre style={{ marginTop: '10px', fontSize: '12px' }}>{details}</pre>
                </div>

                <div style={{
                    padding: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    background: '#f8fafc'
                }}>
                    <h3>Realtime Status: <span style={{ color: channelStatus === 'SUBSCRIBED' ? '#15803d' : '#ca8a04' }}>{channelStatus}</span></h3>
                    <p style={{ fontSize: '12px', color: '#666' }}>Listing global postgres_changes (Public Schema)</p>

                    <div style={{
                        marginTop: '10px',
                        height: '300px',
                        overflowY: 'auto',
                        background: '#1e293b',
                        color: '#4ade80',
                        padding: '10px',
                        borderRadius: '4px',
                        fontSize: '12px'
                    }}>
                        {logs.length === 0 && <div style={{ color: '#94a3b8' }}>Waiting for events...</div>}
                        {logs.map((log, i) => (
                            <div key={i} style={{ borderBottom: '1px solid #334155', padding: '4px 0' }}>{log}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <p>Instructions: Keep this page open. Initialize an action (create appt/client) in another tab/device. Check if log appears here.</p>
            </div>
        </div>
    );
};
