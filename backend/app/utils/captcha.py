import base64
import random
import string

CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ"
CAPTCHA_LENGTH = 5


def _random_word(length=CAPTCHA_LENGTH):
    return "".join(random.choice(CAPTCHA_CHARS) for _ in range(length))


def _noise_lines(width, height):
    lines = []
    for _ in range(6):
        x1 = random.randint(0, width)
        y1 = random.randint(0, height)
        x2 = random.randint(0, width)
        y2 = random.randint(0, height)
        color = f"rgb({random.randint(120, 200)}, {random.randint(120, 200)}, {random.randint(120, 200)})"
        lines.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="1.5" opacity="0.7" />'
        )
    return "\n".join(lines)


def _noise_dots(width, height):
    dots = []
    for _ in range(30):
        cx = random.randint(0, width)
        cy = random.randint(0, height)
        color = f"rgb({random.randint(100, 180)}, {random.randint(100, 180)}, {random.randint(100, 180)})"
        dots.append(f'<circle cx="{cx}" cy="{cy}" r="1.2" fill="{color}" opacity="0.8" />')
    return "\n".join(dots)


def _letter_elements(word, width, height):
    letters = []
    spacing = width / (len(word) + 1)
    for index, char in enumerate(word):
        x = spacing * (index + 1)
        y = height / 2 + random.randint(-6, 6)
        rotate = random.randint(-18, 18)
        size = random.randint(26, 32)
        color = f"rgb({random.randint(20, 80)}, {random.randint(20, 80)}, {random.randint(20, 80)})"
        letters.append(
            f'<text x="{x:.1f}" y="{y:.1f}" fill="{color}" font-size="{size}" '
            f'font-family="Georgia, serif" font-weight="700" '
            f'transform="rotate({rotate} {x:.1f} {y:.1f})" text-anchor="middle">{char}</text>'
        )
    return "\n".join(letters)


def generate_word_captcha_svg():
    """Generate a distorted word captcha SVG and return the word plus image data URI."""
    word = _random_word()
    width = 180
    height = 60
    background = f"rgb({random.randint(235, 245)}, {random.randint(235, 245)}, {random.randint(235, 245)})"

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <rect width="100%" height="100%" fill="{background}" rx="8" />
  {_noise_lines(width, height)}
  {_letter_elements(word, width, height)}
  {_noise_dots(width, height)}
</svg>"""

    encoded = base64.b64encode(svg.encode("utf-8")).decode("ascii")
    return word.lower(), f"data:image/svg+xml;base64,{encoded}"
