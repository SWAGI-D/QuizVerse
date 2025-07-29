from transformers import pipeline

# Load once when app starts
qa_pipeline = pipeline(
    "text2text-generation",
    model="google/flan-t5-base",  # works offline after first run
    tokenizer="google/flan-t5-base"
)

def generate_mcqs(text):
    prompt = f"Generate 3 multiple choice questions based on the following content:\n{text}\nInclude four options per question and highlight the correct answer with 'Answer:'."

    result = qa_pipeline(prompt, max_new_tokens=512)[0]['generated_text']

    return result
