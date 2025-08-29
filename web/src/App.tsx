import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

type Weather = {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
};

function App() {
  const [count, setCount] = useState(0);
  const [weather, setWeather] = useState<Weather[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/weatherforecast');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setWeather(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={fetchWeather} disabled={loading} style={{ marginLeft: '1em' }}>
          {loading ? 'Loading...' : 'Fetch Weather'}
        </button>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {weather.length > 0 && (
          <table style={{ marginTop: '1em', width: '100%' }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Temp (C)</th>
                <th>Temp (F)</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {weather.map((w, i) => (
                <tr key={i}>
                  <td>{w.date}</td>
                  <td>{w.temperatureC}</td>
                  <td>{w.temperatureF}</td>
                  <td>{w.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
