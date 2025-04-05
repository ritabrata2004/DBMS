from openai import OpenAI
import os
import json
from django.conf import settings
from databases.models import TableMetadata, ColumnMetadata

def llm_api(prompt, model="gpt-4o-mini", temperature=0.7, max_tokens=1000):
    """
    A simple function to interact with OpenAI API for generating SQL queries and database metadata descriptions.
    
    Args:
        prompt (str): The prompt to send to the OpenAI API
        model (str): The model to use, default is gpt-4o-mini
        temperature (float): Controls randomness (0-1), default is 0.7
        max_tokens (int): Maximum number of tokens to generate, default is 1000
        
    Returns:
        dict: The response from the OpenAI API
    """
    try:
        # Get API key from environment or settings
        api_key = os.getenv("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", None)
        
        if not api_key:
            return {"success": False, "error": "OpenAI API key not found. Please set OPENAI_API_KEY environment variable."}
        
        # Initialize the client
        client = OpenAI(api_key=api_key)
        
        # Call the API
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # Extract the content from the response
        content = response.choices[0].message.content
        return {
            "success": True,
            "content": content
        }
            
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_metadata_description(metadata_type, name, sample_data=None):
    """
    Generate natural language descriptions for database metadata.
    
    Args:
        metadata_type (str): Type of metadata ('table', 'column', 'relationship')
        name (str): Name of the database object
        sample_data (dict, optional): Sample data or additional context
        
    Returns:
        str: Generated description
    """
    prompts = {
        "table": f"Generate a brief, professional description for a database table named '{name}'. If available, use this sample data for context: {sample_data}",
        "column": f"Generate a brief, professional description for a database column named '{name}' with the following properties: {sample_data}",
        "relationship": f"Generate a brief, professional description for a database relationship where {sample_data}"
    }
    
    if metadata_type not in prompts:
        return "Invalid metadata type specified."
    
    result = llm_api(prompts[metadata_type])
    if result.get("success"):
        return result.get("content", "")
    return "Failed to generate description due to API error."

def nl_to_sql(natural_language_query, database_id):
    """
    Convert natural language query to SQL based on the provided database ID.
    
    Args:
        natural_language_query (str): The natural language question
        database_id (int): Database ID to get schema information
        
    Returns:
        dict: Generated SQL query and explanation
    """
    try:
        # Build schema representation from database
        schema = build_schema_representation(database_id)
        
        if not schema:
            return {
                "success": False,
                "error": "Could not retrieve database schema. Please ensure metadata has been extracted."
            }
        
        # Create a schema summary for the prompt
        schema_summary = json.dumps(schema, indent=2)
        
        prompt = f"""
Given the following database schema:
```
{schema_summary}
```

Convert this natural language question to a valid SQL query:
"{natural_language_query}"

Return your answer as a JSON object with the following format:
{{
    "sql_query": "The SQL query",
    "explanation": "Brief explanation of what the query does"
}}
"""
        
        result = llm_api(prompt)
        
        if not result.get("success"):
            return {"success": False, "error": result.get("error")}
        
        content = result.get("content", "")
        try:
            # Try to extract JSON from the response
            if "```json" in content:
                json_content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                json_content = content.split("```")[1].strip()
            else:
                json_content = content
                
            response_data = json.loads(json_content)
            return {
                "success": True, 
                "sql_query": response_data.get("sql_query"), 
                "explanation": response_data.get("explanation")
            }
        except json.JSONDecodeError:
            # If JSON parsing fails, return the raw content
            return {
                "success": True, 
                "sql_query": content, 
                "explanation": "Generated SQL query (no structured explanation available)"
            }
    
    except Exception as e:
        return {"success": False, "error": str(e)}

def build_schema_representation(database_id):
    """
    Build a representation of the database schema for the LLM based on extracted metadata.
    
    Args:
        database_id (int): The database ID
        
    Returns:
        list: Schema representation for the LLM
    """
    tables = TableMetadata.objects.filter(database_id=database_id)
    schema = []
    
    for table in tables:
        columns = ColumnMetadata.objects.filter(table=table)
        column_info = []
        
        for column in columns:
            column_info.append({
                'name': column.column_name,
                'type': column.data_type,
                'nullable': column.is_nullable,
                'is_primary_key': column.is_primary_key,
                'is_foreign_key': column.is_foreign_key,
                'description': column.description if column.description else ""
            })
            
        schema.append({
            'table_name': table.table_name,
            'schema_name': table.schema_name,
            'description': table.description if table.description else "",
            'columns': column_info
        })
        
    return schema