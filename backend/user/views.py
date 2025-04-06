from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer


# Create your views here.

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# Add a new view to get current user info
class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Return information about the authenticated user"""
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name
        })

# Add a dedicated login endpoint that works alongside Firebase auth
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle traditional form-based login"""
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        
        if not username or not password:
            return Response(
                {"detail": "Username and password are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Try to authenticate with Django's system
        user = authenticate(username=username, password=password)
        
        # If authentication failed but email was provided, try finding by email
        if not user and email:
            try:
                # Find the user by email to provide a better error message
                user_obj = User.objects.get(email=email)
                return Response(
                    {"detail": "This email was registered with Google Sign-In. Please use Google to log in."}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except User.DoesNotExist:
                pass
        
        if not user:
            return Response(
                {"detail": "Invalid credentials."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
            
        # Authentication successful, generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'email': user.email
        })
