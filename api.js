import axios from 'axios'

const BASE = 'http://localhost:5000/api'

export const fetchOptions = () =>
    axios.get(`${BASE}/options`).then(r => r.data)

export const fetchStats = (filters) =>
    axios.get(`${BASE}/stats`, { params: filters }).then(r => r.data)

export const fetchMovies = (filters) =>
    axios.get(`${BASE}/movies`, { params: filters }).then(r => r.data)