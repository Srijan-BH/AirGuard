from flask import Blueprint, request, jsonify, current_app
import bcrypt
import jwt
import datetime
from models import mongo
from utils.validators import validate_email, validate_password, is_duplicate_email
from utils.auth import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'User')

    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required"}), 400

    if not validate_email(email):
        return jsonify({"message": "Invalid email format"}), 400

    is_valid_pass, msg = validate_password(password)
    if not is_valid_pass:
        return jsonify({"message": msg}), 400

    if is_duplicate_email(email):
        return jsonify({"message": "Email already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    user_id = mongo.db.users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role,
        "created_at": datetime.datetime.utcnow()
    }).inserted_id

    return jsonify({"message": "User registered successfully", "user_id": str(user_id)}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = mongo.db.users.find_one({"email": email})
    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    if bcrypt.checkpw(password.encode('utf-8'), user['password']):
        token = jwt.encode({
            'user_id': str(user['_id']),
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, current_app.config['JWT_SECRET_KEY'], algorithm="HS256")
        
        # Log login time
        mongo.db.login_tracking.insert_one({
            "user_id": user['_id'],
            "IP": request.remote_addr,
            "login_time": datetime.datetime.utcnow()
        })

        # Returning 'role' payload so frontend can properly route users/admins
        return jsonify({
            "message": "Login successful", 
            "token": token,
            "role": user['role']
        }), 200

    return jsonify({"message": "Invalid email or password"}), 401

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    mongo.db.login_tracking.update_one(
        {"user_id": current_user['_id'], "logout_time": {"$exists": False}},
        {"$set": {"logout_time": datetime.datetime.utcnow()}},
        sort=[('login_time', -1)]
    )
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')
    
    user = mongo.db.users.find_one({"email": email})
    if not user:
        return jsonify({"message": "If email exists, a reset link will be sent"}), 200
        
    reset_token = jwt.encode({
        'user_id': str(user['_id']),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    }, current_app.config['JWT_SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        "message": "Password reset token generated", 
        "reset_token": reset_token
    }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    token = data.get('token')
    new_password = data.get('new_password')
    
    is_valid_pass, msg = validate_password(new_password)
    if not is_valid_pass:
        return jsonify({"message": msg}), 400
        
    try:
        token_data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        
        from bson import ObjectId
        mongo.db.users.update_one(
            {"_id": ObjectId(token_data['user_id'])},
            {"$set": {"password": hashed_password}}
        )
        return jsonify({"message": "Password reset successfully"}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired"}), 400
    except Exception:
        return jsonify({"message": "Invalid token"}), 400
