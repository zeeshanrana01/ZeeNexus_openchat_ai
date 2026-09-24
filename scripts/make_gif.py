"""
ZeeNexus OpenChat AI — Demo GIF Generator
Generates high-definition, pixel-perfect animated GIF of the application
using native system fonts and Pillow.
"""

import math
import os
import sys

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from PIL import Image, ImageDraw, ImageFont

WIDTH = 960
HEIGHT = 620
FPS = 8
DURATION = 130  # ms per frame

# Load Windows Fonts
try:
    font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 24)
    font_heading = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 15)
    font_body = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 13)
    font_bold = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 13)
    font_small = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 11)
    font_small_bold = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 11)
    font_mono = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 12)
    font_mono_bold = ImageFont.truetype("C:/Windows/Fonts/consolab.ttf", 12)
except Exception:
    font_title = ImageFont.load_default()
    font_heading = font_title
    font_body = font_title
    font_bold = font_title
    font_small = font_title
    font_small_bold = font_title
    font_mono = font_title
    font_mono_bold = font_title

def draw_window_frame(draw, title="ZeeNexus OpenChat AI - Dual OpenAI & Ollama Engine"):
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=(9, 13, 22))
    
    # Window titlebar
    draw.rectangle([0, 0, WIDTH, 36], fill=(14, 19, 31))
    draw.line([(0, 36), (WIDTH, 36)], fill=(30, 41, 59), width=1)
    
    # macOS window dots
    draw.ellipse([14, 12, 24, 22], fill=(239, 68, 68))
    draw.ellipse([30, 12, 40, 22], fill=(245, 158, 11))
    draw.ellipse([46, 12, 56, 22], fill=(16, 185, 129))
    
    # Title
    draw.text((WIDTH // 2 - 140, 10), title, fill=(148, 163, 184), font=font_small_bold)

def draw_sidebar(draw):
    sidebar_w = 200
    draw.rectangle([0, 37, sidebar_w, HEIGHT], fill=(17, 22, 34))
    draw.line([(sidebar_w, 37), (sidebar_w, HEIGHT)], fill=(30, 41, 59), width=1)
    
    # Brand Icon (Drawn Lightning Badge)
    draw.rounded_rectangle([14, 48, 38, 72], radius=6, fill=(16, 185, 129))
    # Draw lightning bolt polygon
    poly = [(28, 50), (20, 60), (25, 60), (23, 70), (32, 58), (27, 58)]
    draw.polygon(poly, fill=(9, 13, 22))
    draw.text((46, 52), "OpenChat AI", fill=(241, 245, 249), font=font_bold)
    
    # + New Chat button
    draw.rounded_rectangle([14, 84, sidebar_w - 14, 116], radius=8, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((24, 93), "+  New Chat", fill=(241, 245, 249), font=font_small_bold)
    
    # Recent chats section
    draw.text((16, 134), "RECENT CHATS", fill=(100, 116, 139), font=font_small_bold)
    
    chats = [
        ("Python REST API Script", True),
        ("Explain Neural Backprop", False),
        ("Debug Next.js Route", False),
        ("ReAct Agent Loops", False),
    ]
    
    y = 154
    for title, is_active in chats:
        if is_active:
            draw.rounded_rectangle([10, y - 4, sidebar_w - 10, y + 24], radius=6, fill=(30, 41, 59), outline=(16, 185, 129))
            draw.text((18, y), f"> {title[:18]}...", fill=(52, 211, 153), font=font_small)
        else:
            draw.text((18, y), f"> {title[:18]}...", fill=(148, 163, 184), font=font_small)
        y += 32
        
    # Bottom key settings
    draw.line([(0, HEIGHT - 48), (sidebar_w, HEIGHT - 48)], fill=(30, 41, 59), width=1)
    draw.rounded_rectangle([14, HEIGHT - 40, sidebar_w - 14, HEIGHT - 12], radius=6, fill=(22, 32, 50))
    draw.text((22, HEIGHT - 33), "Key Settings", fill=(203, 213, 225), font=font_small)
    draw.ellipse([sidebar_w - 28, HEIGHT - 29, sidebar_w - 22, HEIGHT - 23], fill=(52, 211, 153))

def draw_header(draw, provider_text="gpt-4o-mini"):
    sidebar_w = 200
    header_h = 42
    draw.rectangle([sidebar_w + 1, 37, WIDTH, 37 + header_h], fill=(14, 19, 31))
    draw.line([(sidebar_w + 1, 37 + header_h), (WIDTH, 37 + header_h)], fill=(30, 41, 59), width=1)
    
    # Model Pill
    draw.rounded_rectangle([sidebar_w + 16, 44, sidebar_w + 240, 72], radius=8, fill=(22, 32, 50), outline=(51, 65, 85))
    draw.text((sidebar_w + 26, 50), f"Model: {provider_text}", fill=(226, 232, 240), font=font_small_bold)
    
    # Right icons
    draw.rounded_rectangle([WIDTH - 150, 45, WIDTH - 65, 71], radius=8, fill=(16, 185, 129, 30), outline=(16, 185, 129))
    draw.ellipse([WIDTH - 142, 55, WIDTH - 136, 61], fill=(52, 211, 153))
    draw.text((WIDTH - 130, 50), "Ollama Ready", fill=(52, 211, 153), font=font_small_bold)
    draw.rounded_rectangle([WIDTH - 55, 45, WIDTH - 18, 71], radius=8, fill=(30, 41, 59))
    draw.text((WIDTH - 46, 50), "Key", fill=(245, 158, 11), font=font_small_bold)

def draw_neural_background(img, t):
    draw = ImageDraw.Draw(img)
    # Orb 1 (Emerald)
    cx1 = int(450 + 40 * math.sin(t))
    cy1 = int(220 + 30 * math.cos(t))
    for r in range(130, 0, -13):
        draw.ellipse([cx1 - r, cy1 - r, cx1 + r, cy1 + r], fill=(16, 185, 129))
        
    # Orb 2 (Cyan)
    cx2 = int(720 + 35 * math.cos(t * 0.8))
    cy2 = int(320 + 25 * math.sin(t * 0.8))
    for r in range(140, 0, -14):
        draw.ellipse([cx2 - r, cy2 - r, cx2 + r, cy2 + r], fill=(56, 189, 248))

def draw_input_bar(draw, typed_text="", is_streaming=False):
    bar_x = 240
    bar_w = WIDTH - 280
    bar_y = HEIGHT - 76
    bar_h = 52
    
    # Capsule
    draw.rounded_rectangle([bar_x, bar_y, bar_x + bar_w, bar_y + bar_h], radius=26, fill=(22, 29, 43), outline=(71, 85, 105), width=1)
    
    if typed_text:
        draw.text((bar_x + 22, bar_y + 17), typed_text, fill=(241, 245, 249), font=font_body)
    else:
        draw.text((bar_x + 22, bar_y + 17), "Message OpenChat AI...", fill=(100, 116, 139), font=font_body)
        
    # Send / stop button
    btn_x = bar_x + bar_w - 42
    btn_y = bar_y + 9
    if is_streaming:
        draw.ellipse([btn_x, btn_y, btn_x + 34, btn_y + 34], fill=(239, 68, 68))
        draw.rectangle([btn_x + 12, btn_y + 12, btn_x + 22, btn_y + 22], fill=(255, 255, 255))
    elif typed_text:
        draw.ellipse([btn_x, btn_y, btn_x + 34, btn_y + 34], fill=(241, 245, 249))
        # Drawn upward arrow
        draw.polygon([(btn_x + 17, btn_y + 9), (btn_x + 10, btn_y + 18), (btn_x + 24, btn_y + 18)], fill=(15, 23, 42))
        draw.rectangle([btn_x + 15, btn_y + 18, btn_x + 19, btn_y + 25], fill=(15, 23, 42))
    else:
        draw.ellipse([btn_x, btn_y, btn_x + 34, btn_y + 34], fill=(30, 41, 59))
        draw.polygon([(btn_x + 17, btn_y + 9), (btn_x + 10, btn_y + 18), (btn_x + 24, btn_y + 18)], fill=(100, 116, 139))
        draw.rectangle([btn_x + 15, btn_y + 18, btn_x + 19, btn_y + 25], fill=(100, 116, 139))
        
    # Footer disclaimer
    draw.text((WIDTH // 2 - 130, HEIGHT - 18), "OpenChat AI can make mistakes. Supports OpenAI & Ollama.", fill=(100, 116, 139), font=font_small)

def create_frames():
    frames = []
    full_prompt = "Write a Python script to fetch data from a REST API and parse JSON."
    total_frames = 36
    
    for i in range(total_frames):
        t = (i / total_frames) * (2 * math.pi)
        img = Image.new("RGB", (WIDTH, HEIGHT), color=(9, 13, 22))
        
        # 1. Background
        draw_neural_background(img, t)
        draw = ImageDraw.Draw(img)
        
        # 2. Window Frame & Sidebar
        draw_window_frame(draw, "ZeeNexus OpenChat AI - Dual OpenAI & Ollama Engine")
        draw_sidebar(draw)
        
        # Provider header toggles between OpenAI and Ollama to showcase flexibility
        provider_name = "Ollama (llama3.2 Local Free)" if i > 22 else "OpenAI (gpt-4o-mini)"
        draw_header(draw, provider_name)
        
        # SCENE 1: Welcome Empty State (Frames 0 to 7)
        if i <= 7:
            # Drawn Diamond Sparkle Logo
            draw.rounded_rectangle([550, 130, 610, 190], radius=18, fill=(22, 32, 50), outline=(51, 65, 85))
            poly_star = [(580, 142), (585, 155), (598, 160), (585, 165), (580, 178), (575, 165), (562, 160), (575, 155)]
            draw.polygon(poly_star, fill=(52, 211, 153))
            
            # Welcome heading
            draw.text((450, 205), "What can I help with today?", fill=(255, 255, 255), font=font_title)
            
            # 4 Prompt cards
            cards = [
                ("[Code]  Code & Algorithms", "Write a Python script to fetch data from a REST API and parse JSON.", 260, 260),
                ("[Learn] Explain Concepts", "Explain how neural networks learn with backpropagation.", 580, 260),
                ("[Idea]  Brainstorm Ideas", "Brainstorm unique features for an autonomous AI application.", 260, 335),
                ("[Write] Draft & Write", "Draft a concise professional project update email.", 580, 335),
            ]
            
            for c_title, c_desc, cx, cy in cards:
                draw.rounded_rectangle([cx, cy, cx + 300, cy + 62], radius=12, fill=(22, 30, 46), outline=(40, 53, 76))
                draw.text((cx + 14, cy + 10), c_title, fill=(226, 232, 240), font=font_small_bold)
                draw.text((cx + 14, cy + 30), c_desc[:42] + "...", fill=(148, 163, 184), font=font_small)
                
            draw_input_bar(draw, typed_text="")
            
        # SCENE 2: Typing Prompt (Frames 8 to 15)
        elif 8 <= i <= 15:
            chars_to_show = int(len(full_prompt) * ((i - 7) / 8))
            current_typed = full_prompt[:chars_to_show]
            
            draw.rounded_rectangle([550, 130, 610, 190], radius=18, fill=(22, 32, 50), outline=(51, 65, 85))
            poly_star = [(580, 142), (585, 155), (598, 160), (585, 165), (580, 178), (575, 165), (562, 160), (575, 155)]
            draw.polygon(poly_star, fill=(52, 211, 153))
            
            draw.text((450, 205), "What can I help with today?", fill=(255, 255, 255), font=font_title)
            
            # Clicked active card
            draw.rounded_rectangle([260, 260, 560, 322], radius=12, fill=(30, 44, 68), outline=(52, 211, 153), width=2)
            draw.text((274, 270), "[Code]  Code & Algorithms", fill=(52, 211, 153), font=font_small_bold)
            draw.text((274, 290), full_prompt[:42] + "...", fill=(203, 213, 225), font=font_small)
            
            draw_input_bar(draw, typed_text=current_typed)
            
        # SCENE 3: Sent & Agent Reasoning (Frames 16 to 23)
        elif 16 <= i <= 23:
            # User Message bubble
            msg_w = 460
            draw.rounded_rectangle([WIDTH - msg_w - 40, 96, WIDTH - 40, 142], radius=18, fill=(31, 41, 61))
            draw.text((WIDTH - msg_w - 20, 108), full_prompt, fill=(241, 245, 249), font=font_body)
            
            # Reasoning card
            rc_x = 240
            rc_y = 158
            rc_w = 660
            draw.rounded_rectangle([rc_x, rc_y, rc_x + rc_w, rc_y + 74], radius=10, fill=(6, 78, 59, 60), outline=(16, 185, 129))
            
            draw.text((rc_x + 14, rc_y + 10), "[AGENT REASONING & ACTION TRACE]  •  2 steps", fill=(52, 211, 153), font=font_small_bold)
            draw.text((rc_x + 14, rc_y + 30), "> Thought: Connecting to Ollama / OpenAI SDK. Generating requests code...", fill=(203, 213, 225), font=font_small)
            draw.text((rc_x + 14, rc_y + 50), "> Tool Call: execute_code_sandbox(language='python') -> Verified OK [OK]", fill=(56, 189, 248), font=font_small)
            
            draw_input_bar(draw, typed_text="", is_streaming=True)
            
        # SCENE 4: Streaming Code & Output (Frames 24 to 35)
        else:
            msg_w = 460
            draw.rounded_rectangle([WIDTH - msg_w - 40, 96, WIDTH - 40, 142], radius=18, fill=(31, 41, 61))
            draw.text((WIDTH - msg_w - 20, 108), full_prompt, fill=(241, 245, 249), font=font_body)
            
            # Collapsed Reasoning Bar
            rc_x = 240
            rc_y = 156
            rc_w = 660
            draw.rounded_rectangle([rc_x, rc_y, rc_x + rc_w, rc_y + 32], radius=8, fill=(6, 78, 59, 50), outline=(16, 185, 129))
            draw.text((rc_x + 14, rc_y + 8), "[OK] Agent Reasoning & Tool Execution Completed (2 steps)", fill=(52, 211, 153), font=font_small_bold)
            
            # Assistant Text
            draw.text((rc_x, rc_y + 44), "Here is a clean, production-ready Python script using the requests library:", fill=(226, 232, 240), font=font_body)
            
            # Code Block Box
            code_y = rc_y + 70
            code_h = 240
            draw.rounded_rectangle([rc_x, code_y, rc_x + rc_w, code_y + code_h], radius=10, fill=(11, 15, 23), outline=(30, 41, 59))
            
            # Code Block Header
            draw.rectangle([rc_x, code_y, rc_x + rc_w, code_y + 30], fill=(21, 29, 46))
            draw.text((rc_x + 14, code_y + 7), "PYTHON", fill=(148, 163, 184), font=font_small_bold)
            draw.text((rc_x + rc_w - 90, code_y + 7), "[Copy code]", fill=(52, 211, 153), font=font_small)
            
            # Code Lines
            code_lines = [
                ("import", (168, 85, 247), " requests, json", (226, 232, 240)),
                ("def", (168, 85, 247), " fetch_api_data(url: str) -> dict:", (56, 189, 248)),
                ("    try:", (168, 85, 247), "", (226, 232, 240)),
                ("        res = requests.get(url, timeout=10)", (226, 232, 240), "", (226, 232, 240)),
                ("        res.raise_for_status()", (226, 232, 240), "", (226, 232, 240)),
                ("        return res.json()  # Parse response", (52, 211, 153), "", (226, 232, 240)),
                ("    except requests.exceptions.RequestException as err:", (168, 85, 247), "", (226, 232, 240)),
                ("        return {'error': str(err)}", (244, 63, 94), "", (226, 232, 240)),
            ]
            
            line_y = code_y + 40
            lines_to_render = min(len(code_lines), (i - 23) * 2)
            for idx in range(lines_to_render):
                kwd, kwd_col, rest, rest_col = code_lines[idx]
                draw.text((rc_x + 16, line_y), kwd, fill=kwd_col, font=font_mono)
                draw.text((rc_x + 16 + len(kwd) * 7.5, line_y), rest, fill=rest_col, font=font_mono)
                line_y += 22
                
            # Blinking cursor
            if (i % 2 == 0) and (lines_to_render < len(code_lines)):
                draw.rectangle([rc_x + 16, line_y, rc_x + 24, line_y + 14], fill=(52, 211, 153))
                
            draw_input_bar(draw, typed_text="", is_streaming=(lines_to_render < len(code_lines)))

        frames.append(img)
        
    return frames

def main():
    print("[*] Generating clean ZeeNexus OpenChat AI Animated Demo GIF...")
    frames = create_frames()
    
    out_path = "C:/Users/Rana_Zeeshan/Desktop/AgenticAi/ZeeNexus_openchat_ai/demo.gif"
    
    frames[0].save(
        out_path,
        save_all=True,
        append_images=frames[1:],
        optimize=True,
        duration=DURATION,
        loop=0
    )
    
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"[SUCCESS] Created animated GIF: {out_path} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    main()
