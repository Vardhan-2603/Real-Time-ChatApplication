import "./../styles/Dashboard.css";

import {
  Users,
  MessageCircle,
  Brain,
  Calendar,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  useEffect,
  useState,
} from "react";

import api from "../services/api";

export default function DashboardPage() {

  const [data, setData] = useState({
    stats: {
      users: 0,
      totalMessages: 0,
      todayMessages: 0,
    },

    summary: {
      missedMessages: 0,
      summaryText: "No summary available",
    },

    activity: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    load();

  }, []);

  const load = async () => {

    try {

      const res =
        await api.get(
          "/dashboard-api/analytics"
        );

      setData(res.data);

    }
    catch (err) {

      console.log(err);

    }
    finally {

      setLoading(false);

    }

  };


  if (loading) {

    return (

      <div className="dashboard-container">

        Loading...

      </div>

    )

  }



  return (

    <div className="dashboard-container">

      <h1 className="dashboard-title">

        AI Dashboard

      </h1>

      <p className="dashboard-subtitle">

        Smart Conversation Insights

      </p>



      <div className="stats-grid">

        <Card
          icon={<Users />}
          title="Users"
          value={data?.stats?.users || 0}
        />

        <Card
          icon={<MessageCircle />}
          title="Messages"
          value={data?.stats?.totalMessages || 0}
        />

        <Card
          icon={<Calendar />}
          title="Today"
          value={data?.stats?.todayMessages || 0}
        />

      </div>




      <div className="summary-card">

        <div className="summary-header">

          <Brain />

          AI Summary

        </div>


        <p>

          You missed
          {" "}
          <b>

            {data?.summary?.missedMessages || 0}

          </b>

          messages

        </p>


        <div className="summary-output">

          {data?.summary?.summaryText || "No summary available"}

        </div>

      </div>




      <div className="graph-card">

        <h2>

          App Usage Analytics

        </h2>

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <LineChart
            data={data?.activity || []}
          >

            <XAxis
              dataKey="day"
            />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="count"
              stroke="#4fc3f7"
              strokeWidth={4}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>

  )

}



function Card({

  icon,
  title,
  value

}) {

  return (

    <div className="stat-card">

      <div>

        {icon}

      </div>

      <div>

        <h3>

          {title}

        </h3>

        <h1>

          {value}

        </h1>

      </div>

    </div>

  )

}