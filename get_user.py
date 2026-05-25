import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
log_file = r'C:\Users\koush\.gemini\antigravity-ide\brain\8e426d84-7322-43a5-aed0-f5c8e70d5471\.system_generated\logs\transcript.jsonl'

with open(log_file, 'r', encoding='utf-8') as f:
    for line in f:
        if '"type":"USER_INPUT"' in line:
            data = json.loads(line)
            content = data.get('content', '')
            if 'world-class SEO strategist' in content:
                print(content)
                break
