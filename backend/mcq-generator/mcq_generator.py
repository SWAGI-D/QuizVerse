import re
import requests

def extract_mcqs(text):
    mcq_pattern = re.compile(r"\d+\.\s*(.*?)\?\s*a\)(.*?)\s*b\)(.*?)\s*c\)(.*?)\s*d\)(.*?)\s*Answer:\s*([a-d])\)", re.DOTALL)
    matches = mcq_pattern.findall(text)
    mcqs = []
    for idx, match in enumerate(matches, 1):
        question = match[0].strip()
        options = {
            "a": match[1].strip(),
            "b": match[2].strip(),
            "c": match[3].strip(),
            "d": match[4].strip()
        }
        answer = match[5].strip()
        mcqs.append({
            "question_number": idx,
            "question": question,
            "options": options,
            "correct_answer": answer
        })
    return mcqs

def generate_mcqs_from_text(text):
    prompt = "make 5 mcqs just from the following text:\n" + text
    ngrok_url = "https://e609-34-125-130-84.ngrok-free.app/generate"
    response = requests.post(ngrok_url, data={"prompt": prompt})
    if response.status_code == 200:
        return extract_mcqs(response.text)
    else:
        return []
