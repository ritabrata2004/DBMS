from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import nl_to_sql, get_metadata_description

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_metadata_description(request):
    """
    Generate description for database metadata
    """
    if 'type' not in request.data or 'name' not in request.data:
        return Response(
            {'error': 'Both type and name are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    metadata_type = request.data['type']
    name = request.data['name']
    sample_data = request.data.get('sample_data')
    
    if metadata_type not in ['table', 'column', 'relationship']:
        return Response(
            {'error': 'Invalid metadata type. Must be one of: table, column, relationship'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    description = get_metadata_description(metadata_type, name, sample_data)
    
    return Response({'description': description})
