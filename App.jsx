import 'antd/dist/reset.css'
import { useState, useEffect } from 'react'
import { Table, Typography } from 'antd'
import FilterBar from './components/FilterBar'
import Charts from './components/Charts'
import { fetchOptions, fetchStats, fetchMovies } from './api'

const { Title } = Typography

const columns = [
    { title: '排名', dataIndex: 'rank',    align: 'center', width: 80 },
    { title: '片名', dataIndex: 'title',   align: 'center' },
    { title: '年份', dataIndex: 'year',    align: 'center', width: 100 },
    { title: '国家', dataIndex: 'country', align: 'center' },
    { title: '类型', dataIndex: 'genre',   align: 'center', width: 100 },
    { title: '评分', dataIndex: 'rating',  align: 'center', width: 100,
      sorter: (a, b) => a.rating - b.rating },  // 点列头可以排序
]

export default function App() {
    const [options, setOptions] = useState({ genres: [], countries: [] })
    const [stats,   setStats]   = useState(null)
    const [movies,  setMovies]  = useState([])
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

        fetchStats(params).then(data  => { if (!cancelled) setStats(data) })
        fetchMovies(params).then(data => { if (!cancelled) setMovies(data) })
        return () => { cancelled = true }
    }, [filters.genre, filters.country, filters.year_min, filters.year_max])

    return (
        <div style={{ padding: '0 40px', minWidth: 900, boxSizing: 'border-box' }}>
            <Title style={{ textAlign: 'center' }}>豆瓣 Top 100 数据分析</Title>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <FilterBar options={options} filters={filters} onChange={setFilters} />
            </div>

            <p style={{ color: '#666', textAlign: 'center' }}>
                共 {movies.length} 部电影符合条件
            </p>

            <Charts stats={stats} />

            <Title level={2} style={{ marginTop: 40 }}>电影列表</Title>
            <Table
                columns={columns}
                dataSource={movies}
                rowKey="rank"
                pagination={{ pageSize: 20, showSizeChanger: true }}
                rowClassName={(_, index) => index % 2 !== 0 ? 'ant-table-row-alt' : ''}
                size="middle"
            />
        </div>
    )
}