'use client'

import { useState, useEffect } from 'react'
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, where } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { db, auth } from '../firebase/config'
import { useRouter } from 'next/navigation'

interface Movimentacao {
    id: string;
    type: string;
    description: string;
    value: number;
    date: string;
    months?: number;
    status?: string;
}

export default function VerMovimentacoes() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const q = query(collection(db, 'movimentacoes'), where('userId', '==', user.uid))
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const movimentacoesArray: Movimentacao[] = []
            querySnapshot.forEach((doc) => {
                movimentacoesArray.push({ id: doc.id, ...doc.data() } as Movimentacao)
            })
            setMovimentacoes(movimentacoesArray)
        })

        return () => unsubscribe()
    }, [user, loading, router])

    const handleEdit = (id: string) => {
        setEditingId(id)
    }

    const handleSave = async (id: string, updatedData: Partial<Movimentacao>) => {
        if (!user) return;
        try {
            await updateDoc(doc(db, 'movimentacoes', id), updatedData)
            setEditingId(null)
        } catch (error) {
            console.error('Error updating document: ', error)
            alert('Erro ao atualizar movimentação.')
        }
    }

    const handleDelete = async (id: string) => {
        if (!user) return;
        if (window.confirm('Tem certeza que deseja excluir esta movimentação?')) {
            try {
                await deleteDoc(doc(db, 'movimentacoes', id))
            } catch (error) {
                console.error('Error deleting document: ', error)
                alert('Erro ao excluir movimentação.')
            }
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    if (!user) {
        router.push('/login')
        return null
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Ver Movimentações</h1>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">Tipo</th>
                        <th className="border p-2">Descrição</th>
                        <th className="border p-2">Valor</th>
                        <th className="border p-2">Data</th>
                        <th className="border p-2">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {movimentacoes.map((mov) => (
                        <tr key={mov.id}>
                            <td className="border p-2">
                                {editingId === mov.id ? (
                                    <select
                                        value={mov.type}
                                        onChange={(e) => handleSave(mov.id, { type: e.target.value })}
                                        className="w-full p-1 border rounded"
                                    >
                                        <option value="receita">Receita</option>
                                        <option value="despesa_fixa">Despesa Fixa</option>
                                        <option value="despesa_variavel">Despesa Variável</option>
                                    </select>
                                ) : (
                                    mov.type
                                )}
                            </td>
                            <td className="border p-2">
                                {editingId === mov.id ? (
                                    <input
                                        type="text"
                                        value={mov.description}
                                        onChange={(e) => handleSave(mov.id, { description: e.target.value })}
                                        className="w-full p-1 border rounded"
                                    />
                                ) : (
                                    mov.description
                                )}
                            </td>
                            <td className="border p-2">
                                {editingId === mov.id ? (
                                    <input
                                        type="number"
                                        value={mov.value}
                                        onChange={(e) => handleSave(mov.id, { value: parseFloat(e.target.value) })}
                                        className="w-full p-1 border rounded"
                                    />
                                ) : (
                                    `R$ ${mov.value.toFixed(2)}`
                                )}
                            </td>
                            <td className="border p-2">
                                {editingId === mov.id ? (
                                    <input
                                        type="date"
                                        value={mov.date}
                                        onChange={(e) => handleSave(mov.id, { date: e.target.value })}
                                        className="w-full p-1 border rounded"
                                    />
                                ) : (
                                    mov.date
                                )}
                            </td>
                            <td className="border p-2">
                                {editingId === mov.id ? (
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                                    >
                                        Salvar
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEdit(mov.id)}
                                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                                    >
                                        Editar
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(mov.id)}
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                >
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

