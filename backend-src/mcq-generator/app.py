from flask import Flask, request, jsonify
from generator import generate_mcqs
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.form or request.json
    if not data or 'prompt' not in data:
        return jsonify({'error': 'Missing prompt'}), 400

    prompt_text = data['prompt']
    mcqs = generate_mcqs(prompt_text)

    return mcqs, 200  # plain text, not JSON

if __name__ == '__main__':
    app.run(port=5001, debug=True)
