from django.urls import path
from . import views
from .firebase_auth import FirebaseAuthView  # Import the Firebase auth view

urlpatterns = [
    path('register/', views.CreateUserView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),  # Add the new login endpoint
    path('firebase-auth/', FirebaseAuthView.as_view(), name='firebase-auth'),
    path('me/', views.UserInfoView.as_view(), name='user-info'),
    # Add any additional user-related endpoints here
]
