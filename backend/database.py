import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path

DB_PATH = Path(__file__).parent / "queries.db"


def _conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with closing(_conn()) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                message TEXT NOT NULL,
                intent TEXT,
                language TEXT,
                status TEXT,
                product_name TEXT,
                quantity REAL,
                unit_price REAL,
                bulk_price REAL,
                total REAL,
                reply TEXT,
                mode TEXT
            )
            """
        )
        conn.commit()


def save_query(r):
    product = r.get("product")
    pricing = r.get("pricing")
    with closing(_conn()) as conn:
        cur = conn.execute(
            """
            INSERT INTO queries
            (created_at, message, intent, language, status, product_name,
             quantity, unit_price, bulk_price, total, reply, mode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                datetime.now(timezone.utc).isoformat(),
                r["message"],
                r.get("intent"),
                r.get("language"),
                r.get("status"),
                product["name"] if product else None,
                r.get("quantity"),
                pricing["unit_price"] if pricing else None,
                pricing["bulk_price"] if pricing else None,
                pricing["total"] if pricing else None,
                r.get("reply"),
                r.get("mode"),
            ),
        )
        conn.commit()
        return cur.lastrowid


def get_history(limit=100):
    with closing(_conn()) as conn:
        rows = conn.execute(
            "SELECT * FROM queries ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def get_stats():
    with closing(_conn()) as conn:
        total = conn.execute("SELECT COUNT(*) FROM queries").fetchone()[0]
        counts = {
            row["intent"]: row["c"]
            for row in conn.execute(
                "SELECT intent, COUNT(*) AS c FROM queries GROUP BY intent"
            )
        }
        recent = [
            dict(r)
            for r in conn.execute("SELECT * FROM queries ORDER BY id DESC LIMIT 5")
        ]
    price = counts.get("price_enquiry", 0)
    bulk = counts.get("bulk_order", 0)
    return {
        "total": total,
        "price_enquiries": price,
        "bulk_enquiries": bulk,
        "other_enquiries": total - price - bulk,
        "recent": recent,
    }