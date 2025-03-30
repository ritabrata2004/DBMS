from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Session, Query


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class QuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = ['id', 'prompt', 'response', 'created_at']


class SessionSerializer(serializers.ModelSerializer):
    queries = QuerySerializer(many=True, read_only=True)
    query_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Session
        fields = ['id', 'title', 'created_at', 'updated_at', 'queries', 'query_count']
        
    def get_query_count(self, obj):
        return obj.queries.count()


class SessionListSerializer(serializers.ModelSerializer):
    query_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Session
        fields = ['id', 'title', 'created_at', 'updated_at', 'query_count']
        
    def get_query_count(self, obj):
        return obj.queries.count()
