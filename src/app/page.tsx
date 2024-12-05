import DashboardCard from './components/DashboardCard'

export default function Home() {
  // This data would typically come from an API or database
  const dashboardData = {
    monthSummary: {
      totalIncome: 5000,
      totalExpenses: 3500
    },
    fixedExpenses: {
      count: 5,
      total: 2000
    },
    variableExpenses: {
      count: 10,
      total: 1500
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Resumo do Mês">
          <p>Receitas: R$ {dashboardData.monthSummary.totalIncome.toFixed(2)}</p>
          <p>Despesas: R$ {dashboardData.monthSummary.totalExpenses.toFixed(2)}</p>
          <p>Saldo: R$ {(dashboardData.monthSummary.totalIncome - dashboardData.monthSummary.totalExpenses).toFixed(2)}</p>
        </DashboardCard>
        <DashboardCard title="Despesas Fixas">
          <p>Quantidade: {dashboardData.fixedExpenses.count}</p>
          <p>Total: R$ {dashboardData.fixedExpenses.total.toFixed(2)}</p>
        </DashboardCard>
        <DashboardCard title="Despesas Variáveis">
          <p>Quantidade: {dashboardData.variableExpenses.count}</p>
          <p>Total: R$ {dashboardData.variableExpenses.total.toFixed(2)}</p>
        </DashboardCard>
      </div>
    </div>
  )
}

