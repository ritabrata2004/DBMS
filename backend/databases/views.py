from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ClientDatabase, TableMetadata, ColumnMetadata, RelationshipMetadata
from .serializers import (
    ClientDatabaseSerializer,
    QueryExecutionSerializer,
    ConnectionTestSerializer,
    QueryResultSerializer
)
from .services import DatabaseConnector, MetadataExtractor, MetadataVectorizer

class DatabaseViewSet(viewsets.ModelViewSet):
    """CRUD operations for database connections"""
    queryset = ClientDatabase.objects.all()
    serializer_class = ClientDatabaseSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['post'])
    def test_connection(self, request, pk=None):
        """Test database connection"""
        database = self.get_object()
        connector = DatabaseConnector()
        success, message = connector.test_connection(database)
        
        serializer = ConnectionTestSerializer(data={
            'success': success,
            'message': message
        })
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def execute_query(self, request, pk=None):
        """Execute SQL query on the database"""
        database = self.get_object()
        query_serializer = QueryExecutionSerializer(data=request.data)
        query_serializer.is_valid(raise_exception=True)
        
        connector = DatabaseConnector()
        result = connector.execute_query(
            database,
            query_serializer.validated_data['query'],
            query_serializer.validated_data.get('params')
        )
        
        result_serializer = QueryResultSerializer(data=result)
        result_serializer.is_valid(raise_exception=True)
        return Response(result_serializer.data)
    
    @action(detail=True, methods=['post'])
    def extract_metadata(self, request, pk=None):
        """Extract schema metadata from the database"""
        database = self.get_object()
        extractor = MetadataExtractor()
        success, message = extractor.extract_full_metadata(database)
        
        return Response({
            'success': success,
            'message': message
        })
    
    @action(detail=True, methods=['post'])
    def update_embeddings(self, request, pk=None):
        """Update embeddings for database metadata"""
        database = self.get_object()
        vectorizer = MetadataVectorizer()
        success, message = vectorizer.update_all_embeddings(database)
        
        return Response({
            'success': success,
            'message': message
        })
    
    @action(detail=True, methods=['get'])
    def schema(self, request, pk=None):
        """Get full schema for a database"""
        database = self.get_object()
        
        # Get tables for this database
        tables = TableMetadata.objects.filter(database=database)
        
        # Build the schema response
        schema_data = []
        
        for table in tables:
            # Get columns for this table
            columns = ColumnMetadata.objects.filter(table=table)
            column_data = []
            
            for column in columns:
                column_data.append({
                    'id': column.id,
                    'name': column.column_name,
                    'data_type': column.data_type,
                    'is_nullable': column.is_nullable,
                    'is_primary_key': column.is_primary_key,
                    'is_foreign_key': column.is_foreign_key,
                    'description': column.description
                })
            
            # Add table with its columns to schema
            schema_data.append({
                'id': table.id,
                'schema_name': table.schema_name,
                'table_name': table.table_name,
                'table_type': table.table_type,
                'description': table.description,
                'row_count': table.row_count,
                'columns': column_data
            })
        
        return Response(schema_data)
    
    @action(detail=True, methods=['get'])
    def relationships(self, request, pk=None):
        """Get relationships between tables in this database"""
        database = self.get_object()
        
        # Get all tables for this database
        tables = TableMetadata.objects.filter(database=database)
        table_ids = [table.id for table in tables]
        
        # Get all columns for these tables
        columns = ColumnMetadata.objects.filter(table__in=tables)
        column_ids = [column.id for column in columns]
        
        # Get relationships where both columns are from this database
        relationships = RelationshipMetadata.objects.filter(
            from_column__in=column_ids,
            to_column__in=column_ids
        )
        
        # Build relationship data
        relationship_data = []
        
        for rel in relationships:
            relationship_data.append({
                'id': rel.id,
                'from_schema': rel.from_column.table.schema_name,
                'from_table': rel.from_column.table.table_name,
                'from_column': rel.from_column.column_name,
                'to_schema': rel.to_column.table.schema_name,
                'to_table': rel.to_column.table.table_name,
                'to_column': rel.to_column.column_name,
                'relationship_type': rel.relationship_type
            })
        
        return Response(relationship_data)
    
    @action(detail=True, methods=['get'])
    def search(self, request, pk=None):
        """Search database schema metadata"""
        database = self.get_object()
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({'error': 'Query parameter "q" is required'}, status=400)
        
        vectorizer = MetadataVectorizer()
        results = vectorizer.search_metadata(database, query)
        
        return Response(results)
    
    @action(detail=True, methods=['post'])
    def update_description(self, request, pk=None):
        """Update description for table or column metadata"""
        database = self.get_object()
        
        # Validate input
        if 'type' not in request.data or 'id' not in request.data or 'description' not in request.data:
            return Response({
                'success': False,
                'message': 'type, id, and description are required'
            }, status=400)
        
        metadata_type = request.data['type']
        metadata_id = request.data['id']
        description = request.data['description']
        
        try:
            if metadata_type == 'table':
                table = TableMetadata.objects.get(id=metadata_id, database=database)
                table.description = description
                table.save(update_fields=['description'])
            elif metadata_type == 'column':
                # Ensure column belongs to this database
                column = ColumnMetadata.objects.get(id=metadata_id, table__database=database)
                column.description = description
                column.save(update_fields=['description'])
            else:
                return Response({
                    'success': False,
                    'message': f'Invalid metadata type: {metadata_type}'
                }, status=400)
                
            return Response({
                'success': True,
                'message': 'Description updated successfully'
            })
            
        except (TableMetadata.DoesNotExist, ColumnMetadata.DoesNotExist):
            return Response({
                'success': False,
                'message': f'{metadata_type} with id {metadata_id} not found'
            }, status=404)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)
            
    @action(detail=True, methods=['post'])
    def generate_description(self, request, pk=None):
        """Generate AI description for table or column metadata"""
        database = self.get_object()
        
        # Validate input
        if 'type' not in request.data or 'name' not in request.data:
            return Response({
                'success': False,
                'message': 'type and name are required'
            }, status=400)
        
        metadata_type = request.data['type']
        name = request.data['name']
        context = request.data.get('context', {})
        
        try:
            from llm_agent.services import get_metadata_description
            
            # Generate description using LLM
            description = get_metadata_description(metadata_type, name, context)
            
            return Response({
                'success': True,
                'description': description
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=500)
