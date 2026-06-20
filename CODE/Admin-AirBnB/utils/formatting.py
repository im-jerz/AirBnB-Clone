from datetime import datetime


def format_currency(amount: float, currency: str = "PHP") -> str:
    return f"{currency} {amount:,.2f}"


def format_date(dt: datetime | str | None, fmt: str = "%Y-%m-%d %H:%M") -> str:
    if dt is None:
        return "-"
    if isinstance(dt, str):
        return dt
    return dt.strftime(fmt)


def truncate(text: str, max_len: int = 40) -> str:
    if len(text) <= max_len:
        return text
    return text[: max_len - 3] + "..."


def short_id(id_str: str, length: int = 8) -> str:
    return id_str[:length] + "..."
