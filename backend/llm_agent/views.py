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
    sample_data = request.data.get('sample_data', {})
    
    if metadata_type not in ['table', 'column', 'relationship']:
        return Response(
            {'error': 'Invalid metadata type. Must be one of: table, column, relationship'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # For column type, fetch sample values if database_id is provided
    if metadata_type == 'column' and 'database_id' in sample_data:
        try:
            from databases.models import ClientDatabase
            from databases.services import DatabaseConnector
            
            # Get database, schema, table and column information
            database_id = sample_data.get('database_id')
            schema_name = sample_data.get('schema')
            table_name = sample_data.get('table')
            column_name = name
            
            if database_id and schema_name and table_name and column_name:
                try:
                    # Get database record
                    database = ClientDatabase.objects.get(id=database_id)
                    
                    # Initialize connector and fetch sample values
                    connector = DatabaseConnector()
                    sample_values = connector.get_column_sample_values(
                        database,
                        schema_name,
                        table_name,
                        column_name,
                        limit=10
                    )
                    
                    # Add sample values to the context
                    if sample_values:
                        sample_data['sample_values'] = sample_values
                except ClientDatabase.DoesNotExist:
                    print(f"Database with ID {database_id} not found")
                except Exception as e:
                    print(f"Error fetching sample values: {str(e)}")
        except Exception as e:
            print(f"Error in sample values processing: {str(e)}")
    
    description = get_metadata_description(metadata_type, name, sample_data)
    
    return Response({'description': description})
