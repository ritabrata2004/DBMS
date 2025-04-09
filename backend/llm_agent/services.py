from openai import OpenAI
import os
import json
from django.conf import settings
from databases.models import TableMetadata, ColumnMetadata
import requests 

def llm_api(prompt, model="gpt-4o-mini", temperature=0.7, max_tokens=1000):
    """
    A unified function to interact with either OpenAI or Groq API based on the model name.
    
    Args:
        prompt (str): The prompt to send to the API
        model (str): The model to use, default is gpt-4o-mini
        temperature (float): Controls randomness (0-1), default is 0.7
        max_tokens (int): Maximum number of tokens to generate, default is 1000
        
    Returns:
        dict: The response with success status and content/error
    """
    try:
        # Determine which API to use based on model name
        use_openai = model.startswith(("gpt", "o1", "o3"))
        
        if use_openai:
            # Get OpenAI API key
            api_key = os.getenv("OPENAI_API_KEY") or getattr(settings, "OPENAI_API_KEY", None)
            
            if not api_key:
                return {"success": False, "error": "OpenAI API key not found. Please set OPENAI_API_KEY environment variable."}
            
            # Initialize the OpenAI client
            client = OpenAI(api_key=api_key)
            
            # Call the OpenAI API
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
        else:
            # Get Groq API key
            api_key = os.getenv("GROQ_API_KEY")
            
            if not api_key:
                return {"success": False, "error": "Groq API key not found. Please set GROQ_API_KEY in your .env file."}
            
            # Set up the Groq request
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            # Call the Groq API
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions", 
                headers=headers, 
                json=data
            )
            response.raise_for_status()
            result = response.json()
            
            # Extract the content from the response
            content = result["choices"][0]["message"]["content"]
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
    # Base prompts without additional context
    base_prompts = {
        "table": f"Generate a brief, professional description for a database table named '{name}'.",
        "column": f"Generate a brief, professional description for a database column named '{name}'.",
        "relationship": f"Generate a brief, professional description for a database relationship."
    }
    
    if metadata_type not in base_prompts:
        return "Invalid metadata type specified."
    
    # Start with the base prompt
    prompt = base_prompts[metadata_type]
    
    # Add context details based on metadata type
    if sample_data:
        if metadata_type == 'table':
            schema = sample_data.get('schema', 'unknown')
            table_type = sample_data.get('table_type', 'table')
            row_count = sample_data.get('row_count', 'unknown')
            
            prompt += f"\n\nContext information:"
            prompt += f"\n- Schema: {schema}"
            prompt += f"\n- Table type: {table_type}"
            if row_count != 'unknown':
                prompt += f"\n- Approximate row count: {row_count}"
            
            # Add column information if available
            if 'columns' in sample_data:
                prompt += "\n- Columns:"
                for column in sample_data['columns'][:10]:  # Limit to 10 columns
                    col_name = column.get('name', '')
                    col_type = column.get('type', '')
                    is_pk = "primary key" if column.get('primary_key', False) else ""
                    is_fk = "foreign key" if column.get('foreign_key', False) else ""
                    
                    keys = ""
                    if is_pk and is_fk:
                        keys = " (primary and foreign key)"
                    elif is_pk:
                        keys = " (primary key)"
                    elif is_fk:
                        keys = " (foreign key)"
                        
                    prompt += f"\n  - {col_name}: {col_type}{keys}"
                    
        elif metadata_type == 'column':
            schema = sample_data.get('schema', 'unknown')
            table = sample_data.get('table', 'unknown')
            data_type = sample_data.get('data_type', 'unknown')
            nullable = "nullable" if sample_data.get('nullable', True) else "not nullable"
            
            prompt += f"\n\nContext information:"
            prompt += f"\n- Schema: {schema}"
            prompt += f"\n- Table: {table}"
            prompt += f"\n- Data type: {data_type}"
            prompt += f"\n- {nullable}"
            
            if sample_data.get('primary_key', False):
                prompt += "\n- This is a primary key column"
            
            if sample_data.get('foreign_key', False):
                prompt += "\n- This is a foreign key column"
            
            # Add sample values if available
            if 'sample_values' in sample_data and sample_data['sample_values']:
                sample_values = sample_data['sample_values']
                formatted_samples = [f"'{str(value)}'" for value in sample_values]
                prompt += f"\n\nSample distinct values from this column (up to 10): {', '.join(formatted_samples)}"
                prompt += "\n\nBased on the column name, data type, constraints, and especially these sample values, generate an accurate and specific description of what this column represents in the database."
                prompt += "\n\nYOUR DESCRIPTION MUST INCLUDE a brief mention of the possible values this column can contain, based on the provided sample values."
        
        elif metadata_type == 'relationship':
            prompt += f"\n\nContext information: {sample_data}"
    
    # Request a concise professional description
    prompt += "\n\nGenerate a single paragraph, professional description that would be helpful for a database user to understand this item's purpose and content."
    
    result = llm_api(prompt)
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
        # Get the database to ensure it exists
        from databases.models import ClientDatabase
        try:
            database = ClientDatabase.objects.get(id=database_id)
        except ClientDatabase.DoesNotExist:
            return {
                "success": False,
                "error": f"Database with ID {database_id} does not exist."
            }
            
        # Build schema representation from database
        schema = build_schema_representation(database_id)
        
        if not schema:
            # If metadata hasn't been extracted, inform the user
            return {
                "success": False,
                "error": "No schema information available for this database. Please extract metadata first by clicking 'Extract Schema' on the database details page."
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
You must return only the json and nothing else.
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