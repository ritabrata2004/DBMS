from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
import secrets
import string

class GoogleAuthView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Extract user info from the request
        email = request.data.get('email')
        uid = request.data.get('uid')
        display_name = request.data.get('display_name', '')
        
        if not email or not uid:
            return Response(
                {"detail": "Email and uid are required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate a username if not provided
        username = display_name or email.split('@')[0]
        
        # Make username unique by removing non-alphanumeric chars and adding part of uid
        username = ''.join(c for c in username if c.isalnum())
        username = f"{username}_{uid[-6:]}"
        
        # Generate a strong random password
        alphabet = string.ascii_letters + string.digits + string.punctuation
        password = ''.join(secrets.choice(alphabet) for _ in range(20))
        
        # Try to find existing user or create a new one
        try:
            user = User.objects.get(email=email)
            # User exists, update username if it has changed
            if user.username != username:
                user.username = username
                user.save()
        except User.DoesNotExist:
            # Create new user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
        
        # Generate token
        refresh = RefreshToken.for_user(user)
        
        # Add username to token payload
        refresh['username'] = user.username
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,  # Also return username directly in response
        })
