import { useState, useEffect, useRef, useCallback } from 'react'
import { Select, InputNumber, Button, Space } from 'antd'

export default function FilterBar({ options, filters, onChange }) {
    const [localYearMin, setLocalYearMin] = useState(filters.year_min || '')
    const [localYearMax, setLocalYearMax] = useState(filters.year_max || '')
    const timerRef = useRef(null)

    useEffect(() => {
        setLocalYearMin(filters.year_min || '')
        setLocalYearMax(filters.year_max || '')
    }, [filters.year_min, filters.year_max])

    const debouncedUpdate = useCallback((yearMin, yearMax) => {
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => {
            onChange({ ...filters, year_min: yearMin, year_max: yearMax })
        }, 500)
    }, [filters, onChange])

    const handleReset = () => {
        setLocalYearMin('')
        setLocalYearMax('')
        onChange({ genre: '', country: '', year_min: '', year_max: '' })
    }

    return (
        <Space wrap style={{ marginBottom: 24 }}>
            <Select
                value={filters.genre || undefined}
                placeholder="全部类型"
                style={{ width: 130 }}
                allowClear
                onChange={val => onChange({ ...filters, genre: val || '' })}
                options={options.genres.map(g => ({ value: g, label: g }))}
            />

            <Select
                value={filters.country || undefined}
                placeholder="全部国家"
                style={{ width: 130 }}
                allowClear
                showSearch
                onChange={val => onChange({ ...filters, country: val || '' })}
                options={options.countries.map(c => ({ value: c, label: c }))}
            />

            <span>年份从</span>
            <InputNumber
                value={localYearMin || null}
                placeholder="如 1990"
                style={{ width: 100 }}
                onChange={val => {
                    setLocalYearMin(val || '')
                    debouncedUpdate(val || '', localYearMax)
                }}
            />
            <span>到</span>
            <InputNumber
                value={localYearMax || null}
                placeholder="如 2020"
                style={{ width: 100 }}
                onChange={val => {
                    setLocalYearMax(val || '')
                    debouncedUpdate(localYearMin, val || '')
                }}
            />

            <Button onClick={handleReset}>重置所有筛选</Button>
        </Space>
    )
}