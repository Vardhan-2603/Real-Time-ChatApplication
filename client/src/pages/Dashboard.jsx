import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { getAnalyticsSummary, getAnalyticsStats } from '../services/api';

export default function Dashboard(){
  const user = useAuthStore(s=>s.user);
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const load = async ()=>{
      if(!user || !user._id) return;
      setLoading(true);
      try{
        const [sRes, tRes] = await Promise.all([
          getAnalyticsSummary(user._id),
          getAnalyticsStats()
        ]);
        setSummary(sRes.data);
        setStats(tRes.data);
      }catch(err){
        console.error(err);
      }finally{setLoading(false);}
    }
    load();
  },[user]);

  if(!user) return <div className="p-6">Please login to view dashboard.</div>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Team Dashboard</h2>
      {loading && <div>Loading analytics...</div>}

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded shadow">
            <h3 className="text-lg font-medium">Missed Messages</h3>
            <p className="text-3xl font-bold">You missed {summary.missed} messages</p>
            <p className="text-sm text-gray-500">Direct: {summary.directMissed} · Channels: {summary.channelMissed}</p>
          </div>

          <div className="p-4 bg-white rounded shadow md:col-span-2">
            <h3 className="text-lg font-medium">Key Discussion Points</h3>
            <ul className="list-disc pl-5 mt-2">
              {summary.keyPoints.map((kp,i)=>(<li key={i} className="text-sm">{kp}</li>))}
            </ul>
            <h4 className="mt-3 font-medium">Action Items</h4>
            <ul className="list-disc pl-5 mt-2 text-sm">
              {summary.actionItems.length? summary.actionItems.map((a,i)=>(<li key={i}>{a}</li>)) : <li>No action items detected</li>}
            </ul>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <h4 className="text-sm text-gray-500">Active Users Online</h4>
            <div className="text-2xl font-bold">{stats.activeUsersOnline}</div>
            <h4 className="mt-3 text-sm text-gray-500">Messages Sent Today</h4>
            <div className="text-xl">{stats.messagesSentToday}</div>
          </div>

          <div className="p-4 bg-white rounded shadow md:col-span-2">
            <h4 className="text-sm text-gray-500">Most Active Channels</h4>
            <ul className="mt-2">
              {stats.mostActiveChannels.map((c)=> (
                <li key={c.channelId} className="flex justify-between py-1 border-b border-slate-100">
                  <span>{c.name || 'Unnamed'}</span>
                  <span className="text-sm text-gray-500">{c.count}</span>
                </li>
              ))}
            </ul>
            <h4 className="mt-4 text-sm text-gray-500">Team Activity (last 7 days)</h4>
            <div className="mt-2 flex items-end gap-2 h-28">
              {stats.teamActivity.map((d) => (
                <div key={d.date} className="flex-1 bg-slate-200 rounded flex flex-col justify-end">
                  <div className="bg-blue-500 rounded-t text-xs text-center text-white" style={{height: `${Math.min(100, d.count*6)}%`}}>{d.count}</div>
                  <div className="text-xs text-center mt-1">{d.date.slice(5)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
