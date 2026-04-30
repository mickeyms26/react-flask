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

    // 用具体的4个值作为依赖，而不是整个 filters 对象
    useEffect(() => {
        const params = {}
        if (filters.genre)    params.genre    = filters.genre
        if (filters.country)  params.country  = filters.country
        if (filters.year_min) params.year_min = filters.year_min
        if (filters.year_max) params.year_max = filters.year_max

        fetchStats(params).then(setStats)
        fetchMovies(params).then(setMovies)
    }, [filters.genre, filters.country, filters.year_min, filters.year_max])

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
            <h1>豆瓣 Top 100 数据分析</h1>

            <FilterBar options={options} filters={filters} onChange={setFilters} />

            <p style={{ color: '#666' }}>共 {movies.length} 部电影符合条件</p>

            <Charts stats={stats} />

            <h2 style={{ marginTop: 40 }}>电影列表</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                        {['排名','片名','年份','国家','类型','评分'].map(h => (
                            <th key={h} style={{
                                padding: '8px 12px',
                                textAlign: 'left',
                                borderBottom: '1px solid #ddd'
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {movies.map(m => (
                        <tr key={m.rank} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>{m.rank}</td>
                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>{m.title}</td>
                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>{m.year}</td>
                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>{m.country}</td>
                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>{m.genre}</td>
                            <td style={{ padding: '8px 12px', verticalAlign: 'middle' }}>{m.rating}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}