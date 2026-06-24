import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

function App() {
    const [turniri, setTurniri] = useState([]);
    const [naziv, setNaziv] = useState('');
    const [lokacija, setLokacija] = useState('');
    const [editId, setEditId] = useState(null);

    // Stanja za Autentifikaciju
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('jwtToken'));
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        const interceptorId = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    localStorage.removeItem('jwtToken');
                    setIsLoggedIn(false);
                    setTurniri([]);
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptorId);
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            ucitajTurnire();
        }
    }, [isLoggedIn]);

    const ucitajTurnire = () => {
        axios.get('http://localhost:8080/api/turniri')
            .then(res => setTurniri(res.data))
            .catch(err => console.error("Greška pri učitavanju turnira:", err));
    };

    const handleLogin = () => {
        axios.post('http://localhost:8080/api/auth/login', { username, password })
            .then(res => {
                localStorage.setItem('jwtToken', res.data.token);
                setIsLoggedIn(true);
            })
            .catch(err => alert("Pogrešni podaci za prijavu!"));
    };

    const handleRegister = () => {
        axios.post('http://localhost:8080/api/auth/register', { username, password })
            .then(() => {
                alert("Uspešna registracija! Sada se uloguj.");
                setIsRegistering(false);
            })
            .catch(err => alert("Greška pri registraciji!"));
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        setIsLoggedIn(false);
        setTurniri([]);
    };

    const sacuvajTurnir = () => {
        if (!naziv.trim() || !lokacija.trim()) {
            alert("Naziv i lokacija su obavezni!");
            return;
        }

        const podaci = { naziv, lokacija };

        if (editId) {
            axios.put(`http://localhost:8080/api/turniri/${editId}`, podaci)
                .then(res => {
                    setTurniri(turniri.map(t => (t.id === editId ? res.data : t)));
                    resetujFormu();
                })
                .catch(err => console.error("Greška pri izmeni turnira:", err));
        } else {
            axios.post('http://localhost:8080/api/turniri', podaci)
                .then(res => {
                    setTurniri([...turniri, res.data]);
                    resetujFormu();
                })
                .catch(err => console.error("Greška pri dodavanju turnira:", err));
        }
    };

    const zapocniIzmenu = (t) => {
        setEditId(t.id);
        setNaziv(t.naziv);
        setLokacija(t.lokacija);
    };

    const resetujFormu = () => {
        setEditId(null);
        setNaziv('');
        setLokacija('');
    };

    const obrisiTurnir = (id) => {
        axios.delete(`http://localhost:8080/api/turniri/${id}`)
            .then(() => setTurniri(turniri.filter(t => t.id !== id)))
            .catch(err => console.error("Greška pri brisanju turnira:", err));
    };

    return (
        <div className="container">
            {!isLoggedIn ? (
                <div className="login-form">
                    <h2>{isRegistering ? 'Registracija' : 'Prijava'}</h2>
                    <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />

                    <button onClick={isRegistering ? handleRegister : handleLogin}>
                        {isRegistering ? 'Registruj se' : 'Uloguj se'}
                    </button>

                    <p
                        onClick={() => setIsRegistering(!isRegistering)}
                        style={{ cursor: 'pointer', color: 'blue', marginTop: '10px' }}
                    >
                        {isRegistering ? 'Već imaš nalog? Prijavi se' : 'Nemaš nalog? Registruj se'}
                    </p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1>Upravljanje Turnirima</h1>
                        <button onClick={handleLogout}>Odjava</button>
                    </div>

                    <div className="form-group">
                        <input placeholder="Naziv" value={naziv} onChange={e => setNaziv(e.target.value)} />
                        <input placeholder="Lokacija" value={lokacija} onChange={e => setLokacija(e.target.value)} />
                        <button onClick={sacuvajTurnir}>
                            {editId ? 'Sačuvaj izmene' : 'Dodaj'}
                        </button>
                        {editId && <button onClick={resetujFormu}>Otkaži</button>}
                    </div>

                    <ul>
                        {turniri.map(t => (
                            <li key={t.id} className="turnir-item">
                                {t.naziv} - {t.lokacija}
                                <button onClick={() => zapocniIzmenu(t)}>Izmeni</button>
                                <button className="delete-btn" onClick={() => obrisiTurnir(t.id)}>Obriši</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default App;