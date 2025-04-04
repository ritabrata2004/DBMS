from django.urls import path
from . import views
from .google_auth import GoogleAuthView  # Import the new view

urlpatterns = [
    path('register/', views.CreateUserView.as_view(), name='register'),
    path('google-auth/', GoogleAuthView.as_view(), name='google-auth'),
    path('me/', views.UserInfoView.as_view(), name='user-info'),  # Add this line
    # Add any additional user-related endpoints here
]
