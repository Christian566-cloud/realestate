from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('properties', '0001_initial'),
        ('accounts', '0002_rename_tenant_role_to_landlord'),
    ]

    operations = [
        migrations.RenameField(
            model_name='property',
            old_name='tenant',
            new_name='landlord',
        ),
        migrations.AlterField(
            model_name='property',
            name='country',
            field=models.CharField(default='Cameroon', max_length=100),
        ),
    ]
