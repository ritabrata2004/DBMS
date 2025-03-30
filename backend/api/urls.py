from django.urls import path
from . import views

urlpatterns = [
    # Session management endpoints
    path('sessions/', views.SessionListCreateView.as_view(), name='session-list-create'),
    path('sessions/<int:pk>/', views.SessionDetailView.as_view(), name='session-detail'),
    path('sessions/<int:session_id>/queries/', views.QueryCreateView.as_view(), name='query-create'),
]
