import { useState, useEffect, useCallback, useRef } from 'react'

export default function FilterBar({ options, filters, onChange }) {
    const [localYearMin, setLocalYearMin] = useState(filters.year_min || '')
    const [localYearMax, setLocalYearMax] = useState(filters.year_max || '')
    const timerRef = useRef(null)

    // 当父组件的 filters 重置时，同步本地年份输入框
    useEffect(() => {
        setLocalYearMin(filters.year_min || '')
        setLocalYearMax(filters.year_max || '')
    }, [filters.year_min, filters.year_max])

    // 自定义防抖提交
    const debouncedUpdate = useCallback((yearMin, yearMax) => {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            onChange({
                ...filters,
                year_min: yearMin,
                year_max: yearMax
            })
        }, 500)
    }, [filters, onChange])

    const handleYearMinChange = (e) => {
        const value = e.target.value
        setLocalYearMin(value)
        debouncedUpdate(value, localYearMax)
    }

    const handleYearMaxChange = (e) => {
        const value = e.target.value
        setLocalYearMax(value)
        debouncedUpdate(localYearMin, value)
    }

    const handleReset = () => {
        setLocalYearMin('')
        setLocalYearMax('')
        onChange({ genre: '', country: '', year_min: '', year_max: '' })
    }

    return (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap',
                      marginBottom: 24, alignItems: 'center' }}>
            <select value={filters.genre || ''}
                onChange={e => onChange({ ...filters, genre: e.target.value })}>
                <option value="">全部类型</option>
                {options.genres.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <select value={filters.country || ''}
                onChange={e => onChange({ ...filters, country: e.target.value })}>
                <option value="">全部国家</option>
                {options.countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <span>年份从</span>
            <input 
                type="number" 
                value={localYearMin} 
                placeholder="如 1990"
                style={{ width: 80 }}
                onChange={handleYearMinChange} 
            />
            <span>到</span>
            <input 
                type="number" 
                value={localYearMax} 
                placeholder="如 2020"
                style={{ width: 80 }}
                onChange={handleYearMaxChange} 
            />

            <button onClick={handleReset}>重置所有筛选</button>
        </div>
    )
}