from flask import Blueprint, jsonify, request
from models import mongo
from utils.auth import token_required, admin_required
from bson import ObjectId

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_users(current_user):
    users = list(mongo.db.users.find({}, {"password": 0}))
    for user in users:
        user['_id'] = str(user['_id'])
    return jsonify(users), 200

@admin_bp.route('/analytics', methods=['GET'])
@token_required
@admin_required
def get_analytics(current_user):
    users_count = mongo.db.users.count_documents({})
    predictions_count = mongo.db.predictions.count_documents({})
    return jsonify({
        "total_users": users_count,
        "total_predictions": predictions_count,
        "status": "System Healthy"
    }), 200

@admin_bp.route('/reports', methods=['GET'])
@token_required
@admin_required
def get_reports(current_user):
    reports = list(mongo.db.reports.find({}))
    for report in reports:
        report['_id'] = str(report['_id'])
    return jsonify(reports), 200

@admin_bp.route('/delete-user', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user):
    data = request.json
    target_user_id = data.get('user_id')
    
    if not target_user_id:
        return jsonify({"message": "User ID is required"}), 400
        
    result = mongo.db.users.delete_one({"_id": ObjectId(target_user_id)})
    if result.deleted_count > 0:
        mongo.db.predictions.delete_many({"user_id": ObjectId(target_user_id)})
        return jsonify({"message": "User deleted successfully"}), 200
    
    return jsonify({"message": "User not found"}), 404
