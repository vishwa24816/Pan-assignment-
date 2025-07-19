from flask import Flask, request, jsonify, render_template, send_from_directory
from functools import wraps
import jwt
from datetime import datetime, timedelta

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['SECRET_KEY'] = 'your_secret_key' 

users = {}
assignments = {}
submissions = {}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users.get(data['username'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

def teacher_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user['role'] != 'teacher':
            return jsonify({'message': 'Teachers only!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def student_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user['role'] != 'student':
            return jsonify({'message': 'Students only!'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'student')
    if username in users:
        return jsonify({'message': 'User already exists!'}), 400
    users[username] = {'password': password, 'role': role}
    return jsonify({'message': 'User created successfully!'}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = users.get(username)
    if not user or user['password'] != password:
        return jsonify({'message': 'Could not verify'}), 401
    token = jwt.encode({
        'username': username,
        'role': user['role'],
        'exp': datetime.utcnow() + timedelta(minutes=30)
    }, app.config['SECRET_KEY'])
    return jsonify({'token': token})

@app.route('/assignments', methods=['GET'])
@token_required
def get_assignments(current_user):
    return jsonify(list(assignments.values()))

@app.route('/assignments', methods=['POST'])
@token_required
@teacher_required
def create_assignment(current_user):
    data = request.get_json()
    assignment_id = str(len(assignments) + 1)
    assignments[assignment_id] = {
        'id': assignment_id,
        'title': data['title'],
        'description': data['description'],
        'due_date': data['due_date'],
        'teacher': current_user['username']
    }
    return jsonify({'message': 'Assignment created!', 'assignment_id': assignment_id}), 201

@app.route('/assignments/<assignment_id>/submit', methods=['POST'])
@token_required
@student_required
def submit_assignment(current_user, assignment_id):
    if assignment_id not in assignments:
        return jsonify({'message': 'Assignment not found!'}), 404
    data = request.get_json()
    submission_id = str(len(submissions) + 1)
    submissions[submission_id] = {
        'assignment_id': assignment_id,
        'student': current_user['username'],
        'content': data['content'],
        'submission_date': datetime.utcnow().isoformat()
    }
    return jsonify({'message': 'Submission successful!', 'submission_id': submission_id}), 201

@app.route('/assignments/<assignment_id>/submissions', methods=['GET'])
@token_required
@teacher_required
def view_submissions(current_user, assignment_id):
    if assignment_id not in assignments:
        return jsonify({'message': 'Assignment not found!'}), 404

    assignment_submissions = [
        sub for sub in submissions.values() if sub['assignment_id'] == assignment_id
    ]
    return jsonify(assignment_submissions)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)
