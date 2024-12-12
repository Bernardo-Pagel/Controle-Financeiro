'use client'

import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { db, auth } from '../firebase/config'
import { useRouter } from 'next/navigation'

export default function CadastroMovimentacao() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [formData, setFormData] = useState({
        type: 'receita',
        description: '',
        value: '',
        date: '',
        months: 1,
        status: 'pago'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'type' && value !== 'despesa_fixa' ? { months: 1 } : {})
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            alert('You must be logged in to add a transaction.')
            router.push('/login')
            return
        }
        try {
            await addDoc(collection(db, 'movimentacoes'), {
                ...formData,
                value: parseFloat(formData.value),
                createdAt: new Date(),
                userId: user.uid  // Add the user's ID to the document
            })
            alert('Movimentação registrada com sucesso!')
            setFormData({
                type: 'receita',
                description: '',
                value: '',
                date: '',
                months: 1,
                status: 'pago'
            })
        } catch (error) {
            console.error('Error adding document: ', error)
            alert('Erro ao registrar movimentação.')
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
            <h1 className="text-3xl font-bold mb-6">Cadastro de Movimentação</h1>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="mb-4">
                    <label className="block mb-2">Tipo de movimentação:</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="receita">Receita</option>
                        <option value="despesa_fixa">Despesa Fixa</option>
                        <option value="despesa_variavel">Despesa Variável</option>
                    </select>
                </div>
                {formData.type === 'despesa_fixa' && (
                    <div className="mb-4">
                        <label className="block mb-2">Número de meses:</label>
                        <input
                            type="number"
                            name="months"
                            value={formData.months}
                            onChange={handleChange}
                            min="1"
                            className="w-full p-2 border rounded"
                        />
                    </div>
                )}
                <div className="mb-4">
                    <label className="block mb-2">Descrição:</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Valor:</label>
                    <input
                        type="number"
                        name="value"
                        value={formData.value}
                        onChange={handleChange}
                        required
                        step="0.01"
                        className="w-full p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-2">Data:</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>
                {formData.type.startsWith('despesa') && (
                    <div className="mb-4">
                        <label className="block mb-2">Situação:</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="pago">Pago</option>
                            <option value="pendente">Pendente</option>
                        </select>
                    </div>
                )}
                <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                    Cadastrar
                </button>
            </form>
        </div>
    )
}

