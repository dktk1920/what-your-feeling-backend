#!/usr/bin/env python3
import csv
import argparse

EMOTION_KEYWORDS = {
    "불안": ["불안", "초조", "걱정", "긴장", "망했어", "어쩌지", "어떡", "무서"],
    "분노": ["화나", "짜증", "빡쳐", "싫어", "열받", "젠장", "싸가지", "미친"],
    "슬픔": ["슬퍼", "우울", "눈물", "힘들", "속상", "절망", "서럽"],
    "행복": ["행복", "좋아", "좋다", "기쁨", "신나", "고마워", "사랑"],
}
DEFAULT_EMOTION = "중립"

def detect_emotion(text: str):
    emotions = []
    keywords = []
    for emotion, kws in EMOTION_KEYWORDS.items():
        for kw in kws:
            if kw in text:
                emotions.append(emotion)
                keywords.append(kw)
                break
    if not emotions:
        return DEFAULT_EMOTION, []
    # unique emotion list in stable order
    seen = set()
    ordered_emotions = []
    for e in emotions:
        if e not in seen:
            ordered_emotions.append(e)
            seen.add(e)
    return "/".join(ordered_emotions), keywords

def process_csv(in_path: str, out_path: str):
    with open(in_path, newline='', encoding='utf-8') as fin, \
         open(out_path, 'w', newline='', encoding='utf-8') as fout:
        reader = csv.DictReader(fin)
        fieldnames = reader.fieldnames + ['emotion', 'keywords']
        writer = csv.DictWriter(fout, fieldnames=fieldnames)
        writer.writeheader()
        for row in reader:
            # 일부 파일에 있는 총평 행 무시
            if row.get('user_id') == '총평':
                continue
            message = row.get('user_message', '')
            emotion, keywords = detect_emotion(message)
            row['emotion'] = emotion
            row['keywords'] = ' '.join(keywords)
            writer.writerow(row)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Extract emotions from chat CSV')
    parser.add_argument('input_csv', help='원본 CSV 파일 경로')
    parser.add_argument('output_csv', help='결과 CSV 파일 경로')
    args = parser.parse_args()
    process_csv(args.input_csv, args.output_csv)
