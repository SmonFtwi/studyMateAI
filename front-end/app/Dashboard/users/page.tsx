'use client';
import { Card } from '@/components/ui/card';
// pages/admin.tsx

import React, { useEffect, useState } from 'react';

interface User {
    user_id: number;
    email: string;
    status: string;
    user_role: string;
    created_at: string;
    username: string;
}

const AdminPage: React.FC = () => {
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const fetchPendingUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_backend_url}/auth/getpendingUsers`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setPendingUsers(data.users);
        } catch (err) {
            console.log(err)
            setError('Failed to fetch pending users');
        } finally {
            setLoading(false);
        }
    };

    const updateUserStatus = async (email: string, status: 'approved' | 'rejected') => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_backend_url}/auth/updateAccount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ email, account_status: status }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                fetchPendingUsers();
            } else {
                setError(data.error);
            }
        } catch (err) {
            console.log(err)
            setError('Failed to update user status', );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchPendingUsers();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {pendingUsers.length > 0 ? (
            <ul>
                {pendingUsers.map((user) => (
                    <li key={user.user_id} className="mb-4 p-4 border rounded shadow">
                        <p>Email: {user.email}</p>
                        <p>Name: {user.username}</p>
                        <p>Registration Time: {new Date(user.created_at).toLocaleString()}</p>
                        <div className="mt-2">
                            <button
                                className="mr-2 px-4 py-2 bg-green-500 text-white rounded"
                                onClick={() => updateUserStatus(user.email, 'approved')}
                            >
                                Approve
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded"
                                onClick={() => updateUserStatus(user.email, 'rejected')}
                            >
                                Reject
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            ): (
                <Card className="py-8 px-4 text-center text-gray-500">
                
                <p className="text-xs sm:text-sm mt-2 text-gray-400">
                  No pending users found.
                </p>
              </Card>
            )}
        </div>
    );
};

export default AdminPage;
