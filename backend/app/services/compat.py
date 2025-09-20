from typing import Optional

def is_browser_friendly(vcodec: Optional[str], acodec: Optional[str], path: str) -> bool:
    """
    Heurística simple: navegadores reproducen bien MP4 con H.264 + AAC/MP3.
    Contenedores MKV o HEVC (h265) suelen fallar.
    """
    if not vcodec or not acodec:
        return False

    # contenedor
    if not path.lower().endswith(".mp4"):
        return False

    v_ok = vcodec.lower() in {"h264", "avc1"}
    a_ok = acodec.lower() in {"aac", "mp4a", "mp3"}
    return v_ok and a_ok
