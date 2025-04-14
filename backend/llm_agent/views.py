from django.shortcuts import render, get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import nl_to_sql, get_metadata_description
from databases.models import ClientDatabase, TableMetadata, ColumnMetadata
from databases.services import DatabaseConnector

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_sql_from_nl(request):
    """
    Convert natural language to SQL query using the schema from the specified database
    """
    if 'query' not in request.data or 'database_id' not in request.data:
        return Response(
            {'error': 'Both query and database_id are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    natural_language_query = request.data['query']
    database_id = request.data['database_id']
    
    result = nl_to_sql(natural_language_query, database_id)
    
    if not result.get('success'):
        return Response(
            {'error': result.get('error', 'Unknown error generating SQL')},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({
        'sql_query': result.get('sql_query', ''),
        'explanation': result.get('explanation', '')
    })
