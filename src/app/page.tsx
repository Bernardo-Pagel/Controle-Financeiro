'use client'

import { useState, useEffect } from 'react'
import { collection, query, onSnapshot, where } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { db, auth } from './firebase/config'
import DashboardCard from './components/DashboardCard'
import { useRouter } from 'next/navigation'

interface Movimentacao {
  type: string;
  value: number;
  status?: string;
}

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    monthSummary: {
      totalIncome: 0,
      totalExpenses: 0
    },
    fixedExpenses: {
      count: 0,
      total: 0
    },
    variableExpenses: {
      count: 0,
      total: 0
    }
  })

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const q = query(collection(db, 'movimentacoes'), where('userId', '==', user.uid))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const movimentacoes: Movimentacao[] = []
      querySnapshot.forEach((doc) => {
        movimentacoes.push(doc.data() as Movimentacao)
      })

      const newDashboardData = movimentacoes.reduce((acc, mov) => {
        if (mov.type === 'receita') {
          acc.monthSummary.totalIncome += mov.value
        } else {
          acc.monthSummary.totalExpenses += mov.value
          if (mov.type === 'despesa_fixa') {
            acc.fixedExpenses.count++
            acc.fixedExpenses.total += mov.value
          } else if (mov.type === 'despesa_variavel') {
            acc.variableExpenses.count++
            acc.variableExpenses.total += mov.value
          }
        }
        return acc
      }, {
        monthSummary: { totalIncome: 0, totalExpenses: 0 },
        fixedExpenses: { count: 0, total: 0 },
        variableExpenses: { count: 0, total: 0 }
      })

      setDashboardData(newDashboardData)
    })

    return () => unsubscribe()
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push('/login')
    return null
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

