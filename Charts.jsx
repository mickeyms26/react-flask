import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts'

const COLORS = ['#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f',
                '#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ac',
                '#d37295','#fabfd2','#8cd17d','#b6992d','#499894']

export default function Charts({ stats }) {
    if (!stats) return <p>加载中...</p>

    const ratingBuckets = {}
    stats.ratings.forEach(r => {
        const bucket = (Math.floor(r * 10) / 10).toFixed(1)
        ratingBuckets[bucket] = (ratingBuckets[bucket] || 0) + 1
    })
    const ratingData = Object.entries(ratingBuckets)
        .sort((a, b) => a[0] - b[0])
        .map(([score, count]) => ({ score, count }))

    const decadeMap = {}
    stats.years.forEach(y => {
        const d = Math.floor(y / 10) * 10
        decadeMap[d] = (decadeMap[d] || 0) + 1
    })
    const decadeData = Object.entries(decadeMap)
        .sort((a, b) => a[0] - b[0])
        .map(([decade, count]) => ({ decade: `${decade}s`, count }))

    // 强制将 count 转为数字，然后降序排序
    const countriesWithNum = (stats.countries || []).map(c => ({
        name: c.name,
        count: Number(c.count)   // 关键：确保是数字
    }))
    const sorted = countriesWithNum.sort((a, b) => b.count - a.count)
    const mainCountries = sorted.filter(c => c.count >= 3)
    const otherCount = sorted.filter(c => c.count < 3).reduce((s, c) => s + c.count, 0)

    let topCountries = [...mainCountries]
    if (otherCount > 0) {
        topCountries.push({ name: '其他', count: otherCount })
    }
    // 整体按数量降序排序（这样“其他”可能会排到中间，但没关系，符合从大到小）
    // 其他永远排最后
    topCountries.sort((a, b) => {
        if (a.name === '其他') return 1
        if (b.name === '其他') return -1
        return b.count - a.count
    })

    const total = topCountries.reduce((s, c) => s + c.count, 0)

    // 可选：在控制台查看排序结果
    console.log('topCountries 顺序:', topCountries.map(c => `${c.name} ${c.count}`))

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

            {/* 评分分布 */}
            <div>
                <h3>评分分布</h3>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={ratingData}>
                        <XAxis dataKey="score" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#4e79a7" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 年代分布 — x轴标签旋转避免重叠 */}
            <div>
                <h3>年代分布</h3>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={decadeData} margin={{ bottom: 30, left: 10 }}>
                        <XAxis 
                            dataKey="decade" 
                            tick={{ fontSize: 10 }}
                            angle={-35}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#f28e2b" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 类型TOP10 */}
            <div>
                <h3>类型 TOP10</h3>
                <ResponsiveContainer width="100%" height={380}>
                    <BarChart layout="vertical" data={stats.genres}
                        margin={{ left: 60, right: 30, top: 10, bottom: 10 }}>
                        <XAxis type="number" />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={60}
                            tick={{ fontSize: 12 }}
                            interval={0}
                        />
                        <Tooltip />
                        <Bar dataKey="count" fill="#59a14f" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 国家饼图 - 修复左侧裁切 & 确保图例按数量排序 */}
            <div style={{ minHeight: 360, overflow: 'visible' }}>
                <h3>国家 / 地区</h3>
                <ResponsiveContainer width="100%" height={340}>
                    <PieChart>
                        <Pie
                            data={topCountries}
                            dataKey="count"
                            nameKey="name"
                            cx="60%"          // 向右移动（原45%，现在65%）
                            cy="50%"
                            outerRadius={110}
                            label={false}
                        >
                            {topCountries.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} 部`, name]} />
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            iconSize={10}
                            content={() => {
                                // 按数量降序，其他放最后
                                const legendItems = [...topCountries].sort((a, b) => {
                                    if (a.name === '其他') return 1
                                    if (b.name === '其他') return -1
                                    return b.count - a.count
                                })
                                return (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, paddingLeft: 10 }}>
                                        {legendItems.map((item, i) => {
                                            const pct = total > 0 ? ((item.count / total) * 100).toFixed(0) : 0
                                            return (
                                                <li key={item.name} style={{ 
                                                    display: 'flex', alignItems: 'center', 
                                                    marginBottom: 4, fontSize: 12 
                                                }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        width: 10, height: 10,
                                                        background: COLORS[topCountries.findIndex(c => c.name === item.name) % COLORS.length],
                                                        marginRight: 6, flexShrink: 0
                                                    }} />
                                                    {item.name} {pct}%
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )
                            }}
                            wrapperStyle={{ paddingLeft: 10, right: 0 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

        </div>
    )
}