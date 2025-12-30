"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";

interface FunnelPerformanceProps {
    data: { name: string; visits: number }[];
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

const FunnelPerformance: React.FC<FunnelPerformanceProps> = ({ data }) => {
    const totalVisits = data.reduce((acc, curr) => acc + curr.visits, 0);

    return (
        <Card className="col-span-1 lg:col-span-2 relative">
            <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                    Funnel Performance
                    <Lock className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="w-full md:w-1/2 flex flex-col items-center">
                    <div className="h-[200px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="visits"
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-sm text-muted-foreground">
                            {/* Center text if needed */}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                        Total page visits across all funnels. Hover to get more details.
                    </p>
                </div>

                <div className="w-full md:w-1/2 flex flex-col gap-4">
                    {data.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {entry.name}
                                </span>
                            </div>
                            <span className="font-bold text-sm">{entry.visits}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default FunnelPerformance;
