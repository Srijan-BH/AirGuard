import re
from models import mongo

def validate_email(email):
    regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(regex, email) is not None

def validate_password(password):
    # Minimum 8 characters, Uppercase, Lowercase, Number, Special Character
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain an uppercase letter."
    if not re.search(r'[a-z]', password):
        return False, "Password must contain a lowercase letter."
    if not re.search(r'\d', password):
        return False, "Password must contain a number."
    if not re.search(r'[@$!%*?&]', password):
        return False, "Password must contain a special character."
    return True, ""

def is_duplicate_email(email):
    user = mongo.db.users.find_one({"email": email})
    return user is not None
