from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Session, Query
from .serializers import SessionSerializer, SessionListSerializer, QuerySerializer


class SessionListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        sessions = Session.objects.filter(user=request.user)
        serializer = SessionListSerializer(sessions, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        # Check if the user already has any sessions
        existing_sessions = Session.objects.filter(user=request.user)
        
        # If user already has sessions, don't create another one
        if existing_sessions.exists():
            # Return the most recent session instead
            session = existing_sessions.first()  # Due to ordering in Meta, this will be most recent
            serializer = SessionSerializer(session)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        # Create a new session for the user if they don't have any
        session = Session.objects.create(
            user=request.user,
            title=request.data.get('title', 'New Session')
        )
        serializer = SessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SessionDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            session = Session.objects.get(pk=pk, user=request.user)
            serializer = SessionSerializer(session)
            return Response(serializer.data)
        except Session.DoesNotExist:
            return Response({"detail": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request, pk):
        try:
            session = Session.objects.get(pk=pk, user=request.user)
            if 'title' in request.data:
                session.title = request.data['title']
                session.save()
            serializer = SessionSerializer(session)
            return Response(serializer.data)
        except Session.DoesNotExist:
            return Response({"detail": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            session = Session.objects.get(pk=pk, user=request.user)
            session.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Session.DoesNotExist:
            return Response({"detail": "Session not found"}, status=status.HTTP_404_NOT_FOUND)


class QueryCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, session_id):
        try:
            session = Session.objects.get(pk=session_id, user=request.user)
            
            # Update session timestamp when new query is added
            session.save()  # This triggers the auto_now field update
            
            query_data = {
                'prompt': request.data.get('prompt', ''),
                'response': request.data.get('response', '')
            }
            
            query = Query.objects.create(
                session=session,
                **query_data
            )
            
            serializer = QuerySerializer(query)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Session.DoesNotExist:
            return Response({"detail": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
