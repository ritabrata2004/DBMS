# Generated by Django 5.0.3 on 2025-04-18 08:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('session', '0003_query_explanation_query_success'),
    ]

    operations = [
        migrations.AddField(
            model_name='query',
            name='error',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='query',
            name='error_type',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='query',
            name='generated_sql',
            field=models.TextField(blank=True, null=True),
        ),
    ]
