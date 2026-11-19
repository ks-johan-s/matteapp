"""Genererar PWA-ikoner (uggla) utan externa beroenden – ritar pixlar + skriver PNG via zlib."""
import zlib, struct, math

def png_write(path, size):
    px = []
    R = size * 0.22           # hörnradie
    for y in range(size):
        row = bytearray()
        row.append(0)
        for x in range(size):
            u, v = x / size, y / size
            # rundad rektangel
            qx = min(u, 1 - u) * size; qy = min(v, 1 - v) * size
            inside = True
            if qx < R and qy < R:
                inside = (qx - R) ** 2 + (qy - R) ** 2 <= R * R
            if not inside:
                row += b'\x00\x00\x00\x00'
                continue
            # diagonal gradient: amber -> orange
            t = (u + v) / 2
            r = int(251 + t * (230 - 251)); g = int(191 + t * (110 - 191)); b = int(36 + t * (40 - 36))
            col = (r, g, b)
            def circle(cx_, cy_, rad):
                return (x - cx_ * size) ** 2 + (y - cy_ * size) ** 2 <= (rad * size) ** 2
            # ögon (vita)
            if circle(0.36, 0.42, 0.16) or circle(0.64, 0.42, 0.16):
                col = (255, 255, 255)
            # pupiller
            if circle(0.37, 0.44, 0.062) or circle(0.63, 0.44, 0.062):
                col = (30, 41, 59)
            # glimt i ögat
            if circle(0.39, 0.415, 0.022) or circle(0.65, 0.415, 0.022):
                col = (255, 255, 255)
            # näbb (triangel)
            bx, by = u - 0.5, v - 0.53
            if by > 0 and by < 0.13 and abs(bx) < 0.085 * (1 - by / 0.13):
                col = (154, 52, 18)
            # ögonbryn/tofsar
            if 0.14 < v < 0.24 and (abs(u - 0.34) < 0.03 + (v - 0.14) * 0.5 or abs(u - 0.66) < 0.03 + (v - 0.14) * 0.5):
                col = (146, 64, 14)
            row += bytes((*col, 255))
        px.append(bytes(row))
    raw = b''.join(px)
    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    out = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    open(path, 'wb').write(out)
    print(path, len(out), 'bytes')

png_write('icon-512.png', 512)
png_write('icon-192.png', 192)
