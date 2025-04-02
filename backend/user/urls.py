from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.CreateUserView.as_view(), name='register'),
    # Add any additional user-related endpoints here
]
