import os
import sys
import django

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# Import necessary modules
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

def test_user_exists(username):
    """Check if a user exists in the database."""
    try:
        user = User.objects.get(username=username)
        print(f"User '{username}' exists in the database.")
        return True
    except User.DoesNotExist:
        print(f"User '{username}' does not exist in the database.")
        return False

def test_authentication(username, password):
    """Test if the provided username and password can authenticate."""
    user = authenticate(username=username, password=password)
    if user is not None:
        print(f"Authentication successful for '{username}'")
    else:
        print(f"Authentication failed for '{username}'")

def create_test_user(username, password):
    """Create a test user in the database."""
    try:
        user = User.objects.create_user(username=username, password=password)
        print(f"Created user '{username}' successfully.")
    except Exception as e:
        print(f"Error creating user '{username}': {str(e)}")

def list_all_users():
    """List all users in the database."""
    users = User.objects.all()
    if users:
        print("Users in the database:")
        for user in users:
            print(f" - {user.username}")
    else:
        print("No users in the database.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Available commands:")
        print("  python test_auth.py check <username>")
        print("  python test_auth.py auth <username> <password>")
        print("  python test_auth.py create <username> <password>")
        print("  python test_auth.py list")
        sys.exit(1)

    command = sys.argv[1]
    
    if command == "check" and len(sys.argv) == 3:
        test_user_exists(sys.argv[2])
    elif command == "auth" and len(sys.argv) == 4:
        test_authentication(sys.argv[2], sys.argv[3])
    elif command == "create" and len(sys.argv) == 4:
        create_test_user(sys.argv[2], sys.argv[3])
    elif command == "list":
        list_all_users()
    else:
        print("Invalid command or arguments.")
        print("Use the script without arguments to see available commands.")
