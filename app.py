from flask import Flask, jsonify, request
from flask_cors import CORS
from mysql_helper import MysqlHelper

app = Flask(__name__)
CORS(app)  # 允许前端跨域请求

db = MysqlHelper(
    host="localhost",
    user="root",
    password="123456",
    database="test_db"
)


# 接口1：筛选电影 — 国家用 LIKE 模糊匹配
@app.route('/api/movies', methods=['GET'])
def get_movies():
    genre    = request.args.get('genre', '')
    country  = request.args.get('country', '')
    year_min = request.args.get('year_min', 0, type=int)
    year_max = request.args.get('year_max', 9999, type=int)

    sql = "SELECT rank_num, title, year, country, genre, rating FROM douban_movies WHERE year BETWEEN %s AND %s"
    params = [year_min, year_max]

    if genre:
        sql += " AND genre = %s"
        params.append(genre)
    if country:
        sql += " AND country LIKE %s"   # ← 改成 LIKE
        params.append(f"%{country}%")   # ← 模糊匹配

    sql += " ORDER BY rank_num"
    rows = db.query(sql, params)
    movies = [
        {"rank": r[0], "title": r[1], "year": r[2],
         "country": r[3], "genre": r[4], "rating": r[5]}
        for r in (rows or [])
    ]
    return jsonify(movies)


# 接口2：统计数据 — 国家也用 LIKE
@app.route('/api/stats', methods=['GET'])
def get_stats():
    genre    = request.args.get('genre', '')
    country  = request.args.get('country', '')
    year_min = request.args.get('year_min', 0, type=int)   # ← 加上
    year_max = request.args.get('year_max', 9999, type=int) # ← 加上

    conditions = ["year BETWEEN %s AND %s"]  # ← 年份始终加入条件
    params = [year_min, year_max]            # ← 始终带上年份参数

    if genre:
        conditions.append("genre = %s")
        params.append(genre)
    if country:
        conditions.append("country LIKE %s")
        params.append(f"%{country}%")

    where = "WHERE " + " AND ".join(conditions)

    ratings = db.query(f"SELECT rating FROM douban_movies {where}", params)
    
    year_where = where + " AND year > 0"
    years = db.query(f"SELECT year FROM douban_movies {year_where}", params)
    
    genre_where = where + " AND genre != '' AND genre REGEXP '^[^0-9]'"
    genres = db.query(
        f"SELECT genre, COUNT(*) FROM douban_movies {genre_where} GROUP BY genre ORDER BY COUNT(*) DESC LIMIT 10",
        params
    )
    
    countries_raw = db.query(f"SELECT country FROM douban_movies {where}", params)
    country_count = {}
    for row in (countries_raw or []):
        for c in row[0].split():
            c = c.strip()
            if c:
                country_count[c] = country_count.get(c, 0) + 1
    countries_list = [{"name": k, "count": v}
                      for k, v in sorted(country_count.items(), key=lambda x: -x[1])]

    return jsonify({
        "ratings":   [r[0] for r in (ratings or [])],
        "years":     [r[0] for r in (years   or [])],
        "genres":    [{"name": r[0], "count": r[1]} for r in (genres or [])],
        "countries": countries_list,
    })

# 接口3：获取选项 — 把多国字符串拆开再去重
@app.route('/api/options', methods=['GET'])
def get_options():
    genres = db.query("SELECT DISTINCT genre FROM douban_movies WHERE genre != '' AND genre REGEXP '^[^0-9]' ORDER BY genre")
    
    # 国家要拆开：把"美国 英国"拆成["美国","英国"]再去重
    all_countries_raw = db.query("SELECT country FROM douban_movies WHERE country != ''")
    country_set = set()
    for row in (all_countries_raw or []):
        for c in row[0].split():  # 按空格拆
            country_set.add(c.strip())
    
    return jsonify({
        "genres":    [r[0] for r in (genres or [])],
        "countries": sorted(list(country_set)),
    })

# 接口4：修改《大闹天宫》的年份、国家、类型
@app.route('/api/update/danao', methods=['POST'])
def update_danao():
    try:
        # 执行你要的 SQL
        sql = """
            UPDATE douban_movies 
            SET year = 1964, country = '中国大陆', genre = '剧情'
            WHERE title = '大闹天宫';
        """
        # 执行更新（非查询用 execute 不是 query）
        db.execute(sql)
        
        return jsonify({
            "code": 200,
            "msg": "修改成功：大闹天宫 已更新为 1964 / 中国大陆 / 剧情"
        })
    except Exception as e:
        return jsonify({
            "code": 500,
            "msg": "修改失败",
            "error": str(e)
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)