import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [turniri, setTurniri] = useState([]);
    const [naziv, setNaziv] = useState('');
    const [lokacija, setLokacija] = useState('');
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:8080/api/turniri')
            .then(res => setTurniri(res.data))
            .catch(err => console.error("Greška pri učitavanju:", err));
    }, []);

    const sacuvajTurnir = () => {
        const podaci = { naziv, lokacija };

        if (editId) {
            // UPDATE operacija
            axios.put(`http://localhost:8080/api/turniri/${editId}`, podaci)
                .then(res => {
                    setTurniri(turniri.map(t => t.id === editId ? res.data : t));
                    resetujFormu();
                });
        } else {
            // CREATE operacija
            axios.post('http://localhost:8080/api/turniri', podaci)
                .then(res => {
                    setTurniri([...turniri, res.data]);
                    resetujFormu();
                });
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
        </div>
    );
}

export default App;