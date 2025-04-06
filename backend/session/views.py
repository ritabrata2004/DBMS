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
        # Create a new session for the user
        session_data = {
            'user': request.user,
            'title': request.data.get('title', 'New Session'),
        }
        
        # Add database information if provided
        if 'database' in request.data and request.data['database']:
            database = request.data['database']
            if isinstance(database, dict):
                session_data['database_name'] = database.get('name')
                session_data['database_id'] = database.get('id')
        
        session = Session.objects.create(**session_data)
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


class QueryDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, session_id, query_id):
        try:
            # First check if the session belongs to the user
            session = Session.objects.get(pk=session_id, user=request.user)
            
            try:
                # Find the query within this session
                query = Query.objects.get(pk=query_id, session=session)
                query.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except Query.DoesNotExist:
                return Response({"detail": "Query not found"}, status=status.HTTP_404_NOT_FOUND)
        except Session.DoesNotExist:
            return Response({"detail": "Session not found"}, status=status.HTTP_404_NOT_FOUND)
