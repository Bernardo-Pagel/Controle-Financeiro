interface DashboardCardProps {
    title: string;
    children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children }) => {
    return (
        <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            {children}
        </div>
    )
}

export default DashboardCard

