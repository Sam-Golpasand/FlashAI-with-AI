from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from flask_cors import CORS
import uuid
import time
import os

# Import your processing functions
from dataLoader import main as load_data

app = Flask(__name__)
CORS(app)
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
    
    # Create a unique subfolder for this upload
    unique_folder_name = f"{int(time.time())}_{uuid.uuid4().hex}"
    upload_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_folder_name)
    os.makedirs(upload_path, exist_ok=True)
    
    saved_files = []
    for file in files:
        if file.filename == '':
            return jsonify({"error": "One or more files have no filename"}), 400
       
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_path, filename)
        file.save(file_path)
        saved_files.append(file_path)
    
    try:
        # Retrieve deckAmount from the form data
        deck_amount = int(request.form.get('deckAmount', 1))
        print(f"Deck amount: {deck_amount}")
        
        # Get questions, answers, and sources from load_data()
        questions, answers, sources = await load_data(deck_amount)
        
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
    app.run(debug=True, port=3011)
