from django.db import migrations, models


def migrate_tenant_role_to_landlord(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(role='tenant').update(role='landlord')


def migrate_landlord_role_to_tenant(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(role='landlord').update(role='tenant')


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(migrate_tenant_role_to_landlord, migrate_landlord_role_to_tenant),
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[('customer', 'Customer'), ('landlord', 'Landlord'), ('admin', 'Admin')],
                default='customer',
                max_length=20,
            ),
        ),
    ]
