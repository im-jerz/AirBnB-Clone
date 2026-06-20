def chart_layout(height: int = 300, showlegend: bool = False) -> dict:
    return dict(
        margin=dict(t=10, b=10, l=10, r=10),
        height=height,
        showlegend=showlegend,
        font=dict(family="Sora, sans-serif", size=12, color="#1C1816"),
        paper_bgcolor="#FFFFFF",
        plot_bgcolor="#FFFFFF",
        xaxis=dict(gridcolor="#E5DDD4", zeroline=False),
        yaxis=dict(gridcolor="#E5DDD4", zeroline=False),
    )
