# Generated by Django 4.2.7 on 2025-04-14 18:05

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('user', '0002_rename_otp_code_passwordresetotp_otp'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserTokenUsage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('prompt_tokens', models.IntegerField(default=0)),
                ('completion_tokens', models.IntegerField(default=0)),
                ('total_tokens', models.IntegerField(default=0)),
                ('model', models.CharField(blank=True, max_length=50)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('query_text', models.TextField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='token_usage', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
    ]
