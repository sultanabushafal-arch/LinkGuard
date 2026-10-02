from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

from scanner import analyze_url


FRONTEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend")
)

app = Flask(
    __name__,
    static_folder=FRONTEND_DIR,
    static_url_path=""
)

CORS(app)


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    if not data or "url" not in data:
        return jsonify({
            "error": "لم يتم إدخال رابط"
        }), 400

    url = data["url"]

    result = analyze_url(url)

    return jsonify(result)
