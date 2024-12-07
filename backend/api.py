from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os

# Import your processing functions
from dataLoader import main as load_data

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure upload folder
UPLOAD_FOLDER = './data'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/file-upload', methods=['POST'])
async def file_upload():
    if 'files' not in request.files:
        return jsonify({"error": "No files part in the request"}), 400
    
    files = request.files.getlist('files')
    if not files:
        return jsonify({"error": "No files provided"}), 400
    
    saved_files = []
    for file in files:
        if file.filename == '':
            return jsonify({"error": "One or more files have no filename"}), 400
       
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        saved_files.append(file_path)
   
    try:
        # Get questions, answers, and sources from load_data()
        questions, answers, sources = await load_data()
        
        # Create cards with matching questions and answers
        cards = [
            {
                "question": question,
                "answer": answer,
                "source": source
            } 
            for question, answer, source in zip(questions, answers, sources)
        ]
        
        response = {
            "cards": cards
        }
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    app.run(debug=True, port=5000)
