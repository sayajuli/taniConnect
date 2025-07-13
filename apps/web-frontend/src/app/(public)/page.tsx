'use client'; 

import { useState, useEffect } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
} 

export default function Index() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError('Gagal mengambil data dari backend. Pastikan server backend berjalan di port 5000.');
        setIsLoading(false);
      });
  }, []);

  return (
    < >
      <h1 className="mb-4 text-3xl font-bold text-green-600">TaniConnect Frontend</h1>

      <div className="p-4 border rounded-lg shadow-md">
        <h2 className="mb-2 text-xl font-semibold">Data Pengguna dari Database:</h2>

        {isLoading && <p>Loading data...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {!isLoading && !error && (
          <ul className="list-disc list-inside">
            {users.length > 0 ? (
              users.map((user) => (
                <li key={user._id}>
                  <strong>{user.name}</strong> ({user.email}) - Role: {user.role}
                </li>
              ))
            ) : (
              <p>Tidak ada data user di database.</p>
            )}
          </ul>
        )}
      </div>
    </>
  );
}