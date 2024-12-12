'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase/config'
import { signOut } from 'firebase/auth'

const Header = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [user] = useAuthState(auth)

    const handleLogout = () => {
        signOut(auth)
    }

    return (
        <header className="bg-blue-600 text-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-4">
                    <div className="text-xl font-bold">Financial Management</div>
                    <button
                        className="md:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                            ) : (
                                <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                            )}
                        </svg>
                    </button>
                </div>
                <nav className={`${isOpen ? 'block' : 'hidden'} md:block pb-4 md:pb-0`}>
                    <ul className="md:flex">
                        <li><Link href="/" className="block py-2 md:px-4 hover:bg-blue-700">Início</Link></li>
                        <li><Link href="/cadastro" className="block py-2 md:px-4 hover:bg-blue-700">Cadastro de Movimentação</Link></li>
                        <li><Link href="/movimentacoes" className="block py-2 md:px-4 hover:bg-blue-700">Ver Movimentação</Link></li>
                        <li><Link href="/relatorios" className="block py-2 md:px-4 hover:bg-blue-700">Relatórios</Link></li>
                        {user ? (
                            <>
                                <li><Link href="/perfil" className="block py-2 md:px-4 hover:bg-blue-700">Perfil</Link></li>
                                <li><button onClick={handleLogout} className="block w-full text-left py-2 md:px-4 hover:bg-blue-700">Sair</button></li>
                            </>
                        ) : (
                            <>
                                <li><Link href="/login" className="block py-2 md:px-4 hover:bg-blue-700">Entrar</Link></li>
                                <li><Link href="/registro" className="block py-2 md:px-4 hover:bg-blue-700">Registrar</Link></li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    )
}

export default Header

