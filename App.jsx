import { useState, useEffect } from 'react'
import FilterBar from './components/FilterBar'
import Charts from './components/Charts'
import { fetchOptions, fetchStats, fetchMovies } from './api'

export default function App() {
    const [options, setOptions] = useState({ genres: [], countries: [] })
    const [stats, setStats] = useState(null)
    const [movies, setMovies] = useState([])
    const [filters, setFilters] = useState({
        genre: '', country: '', year_min: '', year_max: ''
    })

    useEffect(() => {
        fetchOptions().then(setOptions)
    }, [])

    useEffect(() => {
        let cancelled = false

        const params = {}
        if (filters.genre)    params.genre    = filters.genre
        if (filters.country)  params.country  = filters.country
        if (filters.year_min) params.year_min = filters.year_min
        if (filters.year_max) params.year_max = filters.year_max

        fetchStats(params).then(data => {
            if (!cancelled) setStats(data)
        })
        fetchMovies(params).then(data => {
            if (!cancelled) setMovies(data)
        })

        return () => {
            cancelled = true
        }
    }, [filters.genre, filters.country, filters.year_min, filters.year_max])

    return (
        <div style={{
            width: '100%',
           // maxWidth: 1400,
            minWidth: 900,
            margin: '0 auto',
            padding: '0 40px',
            fontFamily: 'sans-serif',
            boxSizing: 'border-box'
        }}>
            <h1>豆瓣 Top 100 数据分析</h1>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <FilterBar options={options} filters={filters} onChange={setFilters} />
            </div>

            <p style={{ color: '#666', textAlign: 'center' }}>共 {movies.length} 部电影符合条件</p>

            <Charts stats={stats} />

            <h2 style={{ marginTop: 40 }}>电影列表</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                        {['排名','片名','年份','国家','类型','评分'].map(h => (
                            <th key={h} style={{
                                padding: '8px 12px',
                                textAlign: 'center',
                                borderBottom: '1px solid #ddd'
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                {movies.map((m, index) => (
                    <tr key={m.rank} style={{ 
                        borderBottom: '1px solid #eee',
                        background: index % 2 === 0 ? '#ffffff' : '#f9f9f9'  // ← 加这一行
                    }}>
                        <td style={{ padding: '8px 12px', verticalAlign: 'middle', textAlign: 'center' }}>{m.rank}</td>
                        <td style={{ padding: '8px 12px', verticalAlign: 'middle', textAlign: 'center' }}>{m.title}</td>
                        <td style={{ padding: '8px 12px', verticalAlign: 'middle', textAlign: 'center' }}>{m.year}</td>
                        <td style={{ padding: '8px 12px', verticalAlign: 'middle', textAlign: 'center' }}>{m.country}</td>
                        <td style={{ padding: '8px 12px', verticalAlign: 'middle', textAlign: 'center' }}>{m.genre}</td>
                        <td style={{ padding: '8px 12px', verticalAlign: 'middle', textAlign: 'center' }}>{m.rating}</td>
                    </tr>
                ))}
            </tbody>
            </table>
        </div>
    )
}