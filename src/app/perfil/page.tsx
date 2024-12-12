'use client'

import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '../firebase/config'
import { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'

interface Movimentacao {
  type: string;
  value: number;
}

export default function Perfil() {
  const [user] = useAuthState(auth)
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])

  useEffect(() => {
    const fetchMovimentacoes = async () => {
      if (user) {
        const q = query(collection(db, 'movimentacoes'), where('userId', '==', user.uid))
        const querySnapshot = await getDocs(q)
        const movs: Movimentacao[] = []
        querySnapshot.forEach((doc) => {
          movs.push(doc.data() as Movimentacao)
        })
        setMovimentacoes(movs)
      }
    }

    fetchMovimentacoes()
  }, [user])

  const totalReceitas = movimentacoes
    .filter(mov => mov.type === 'receita')
    .reduce((sum, mov) => sum + mov.value, 0)

  const totalDespesas = movimentacoes
    .filter(mov => mov.type.startsWith('despesa'))
    .reduce((sum, mov) => sum + mov.value, 0)

  if (!user) {
    return <div>Carregando...</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Perfil do Usuário</h1>
      <div className="mb-4">
        <p><strong>Nome:</strong> {user.displayName}</p>
        <p><strong>E-mail:</strong> {user.email}</p>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2">Resumo Financeiro</h2>
        <p><strong>Total de Receitas:</strong> R$ {totalReceitas.toFixed(2)}</p>
        <p><strong>Total de Despesas:</strong> R$ {totalDespesas.toFixed(2)}</p>
        <p><strong>Saldo:</strong> R$ {(totalReceitas - totalDespesas).toFixed(2)}</p>
      </div>
    </div>
  )
}

