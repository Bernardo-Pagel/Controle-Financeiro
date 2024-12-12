'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../firebase/config';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRouter } from 'next/navigation';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Movimentacao {
    type: string;
    value: number;
    date: string;
    status?: string;
}

export default function Relatorios() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [filteredMovimentacoes, setFilteredMovimentacoes] = useState<Movimentacao[]>([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        type: 'all',
        status: 'all',
    });

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchMovimentacoes = async () => {
            const q = query(collection(db, 'movimentacoes'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const movs: Movimentacao[] = [];
            querySnapshot.forEach((doc) => {
                movs.push(doc.data() as Movimentacao);
            });
            setMovimentacoes(movs);
            setFilteredMovimentacoes(movs);
        };

        fetchMovimentacoes();
    }, [user, loading, router]);

    useEffect(() => {
        const filtered = movimentacoes.filter((mov) => {
            const dateInRange =
                (!filters.startDate || mov.date >= filters.startDate) &&
                (!filters.endDate || mov.date <= filters.endDate);
            const typeMatch = filters.type === 'all' || mov.type === filters.type;
            const statusMatch = filters.status === 'all' || mov.status === filters.status;
            return dateInRange && typeMatch && statusMatch;
        });
        setFilteredMovimentacoes(filtered);
    }, [filters, movimentacoes]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.text('Relatório de Movimentações', 20, 10);

        const tableData = filteredMovimentacoes.map((mov) => [
            mov.type,
            `R$ ${mov.value.toFixed(2)}`,
            mov.date,
            mov.status || 'N/A',
        ]);

        autoTable(doc, {
            head: [['Tipo', 'Valor', 'Data', 'Status']],
            body: tableData,
        });

        doc.save('relatorio.pdf');
    };

    const chartData = {
        labels: ['Receitas', 'Despesas Fixas', 'Despesas Variáveis'],
        datasets: [
            {
                label: 'Valor Total',
                data: [
                    filteredMovimentacoes
                        .filter((mov) => mov.type === 'receita')
                        .reduce((sum, mov) => sum + mov.value, 0),
                    filteredMovimentacoes
                        .filter((mov) => mov.type === 'despesa_fixa')
                        .reduce((sum, mov) => sum + mov.value, 0),
                    filteredMovimentacoes
                        .filter((mov) => mov.type === 'despesa_variavel')
                        .reduce((sum, mov) => sum + mov.value, 0),
                ],
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
            },
        ],
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6">Relatórios</h1>
            <div className="mb-4 flex flex-wrap gap-4">
                <input
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                />
                <input
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                />
                <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                >
                    <option value="all">Todos os tipos</option>
                    <option value="receita">Receita</option>
                    <option value="despesa_fixa">Despesa Fixa</option>
                    <option value="despesa_variavel">Despesa Variável</option>
                </select>
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                >
                    <option value="all">Todos os status</option>
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                </select>
                <button onClick={generatePDF} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Exportar para PDF
                </button>
            </div>
            <div className="mb-8">
                <Bar data={chartData} />
            </div>
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">Tipo</th>
                        <th className="border p-2">Valor</th>
                        <th className="border p-2">Data</th>
                        <th className="border p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMovimentacoes.map((mov, index) => (
                        <tr key={index}>
                            <td className="border p-2">{mov.type}</td>
                            <td className="border p-2">R$ {mov.value.toFixed(2)}</td>
                            <td className="border p-2">{mov.date}</td>
                            <td className="border p-2">{mov.status || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
