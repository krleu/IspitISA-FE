import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [turniri, setTurniri] = useState([]);
    const [naziv, setNaziv] = useState('');
    const [lokacija, setLokacija] = useState('');

    // Učitavanje turnira pri pokretanju
    useEffect(() => {
        axios.get('http://localhost:8080/api/turniri')
            .then(res => setTurniri(res.data))
            .catch(err => console.error("Greška pri učitavanju:", err));
    }, []);

    // Dodavanje novog turnira
    const dodajTurnir = () => {
        axios.post('http://localhost:8080/api/turniri', { naziv, lokacija })
            .then(res => {
                setTurniri([...turniri, res.data]);
                setNaziv('');
                setLokacija('');
            });
    };

    // Brisanje turnira
    const obrisiTurnir = (id) => {
        axios.delete(`http://localhost:8080/api/turniri/${id}`)
            .then(() => {
                setTurniri(turniri.filter(t => t.id !== id));
            });
    };

    return (
        <div className="container">
            <h1>Upravljanje Turnirima</h1>

            <div className="form-group">
                <input placeholder="Naziv" value={naziv} onChange={e => setNaziv(e.target.value)} />
                <input placeholder="Lokacija" value={lokacija} onChange={e => setLokacija(e.target.value)} />
                <button onClick={dodajTurnir}>Dodaj</button>
            </div>

            <ul>
                {turniri.map(t => (
                    <li key={t.id} className="turnir-item">
                        {t.naziv} - {t.lokacija}
                        <button className="delete-btn" onClick={() => obrisiTurnir(t.id)}>Obriši</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;