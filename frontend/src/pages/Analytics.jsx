import React from 'react';
import Layout from '../components/layout/Layout';
import AnalyticsCharts from '../components/features/analytics/AnalyticsCharts';
import Button from '../components/common/Button';
import { Download, Calendar } from 'lucide-react';

const Analytics = () => {
    return (
        <Layout>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-slide-up">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h2>
                    <p className="text-slate-500 mt-1">Insights into your team's performance and AI efficiency.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="md"><Calendar className="w-4 h-4 mr-2" /> Last 7 Days</Button>
                    <Button variant="secondary"><Download className="w-4 h-4 mr-2" /> Export</Button>
                </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <AnalyticsCharts />
            </div>
        </Layout>
    );
};

export default Analytics;
