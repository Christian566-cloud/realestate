from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from properties.models import Property

User = get_user_model()

CAMEROON_PROPERTIES = [
    {
        'title': 'Appartement moderne Bastos',
        'description': 'Bel appartement meublé au quartier Bastos, proche des ambassades et commerces. Sécurité 24h/24, parking privé.',
        'price': Decimal('350000'), 'address': 'Rue 1.753, Bastos', 'city': 'Yaoundé', 'state': 'Bastos',
        'zip_code': 'BP 1234', 'latitude': Decimal('3.875600'), 'longitude': Decimal('11.518600'),
        'property_type': 'apartment', 'bedroom': 3, 'bathroom': 2, 'area_sqft': 120, 'is_furnished': True,
        'landlord_email': 'jean@example.cm',
    },
    {
        'title': 'Villa spacieuse Essos',
        'description': 'Grande villa avec jardin à Essos. Idéale pour famille, quartier calme et résidentiel.',
        'price': Decimal('850000'), 'address': 'Carrefour Essos', 'city': 'Yaoundé', 'state': 'Essos',
        'zip_code': 'BP 2345', 'latitude': Decimal('3.857000'), 'longitude': Decimal('11.528000'),
        'property_type': 'villa', 'bedroom': 5, 'bathroom': 3, 'area_sqft': 280, 'is_furnished': False,
        'landlord_email': 'jean@example.cm',
    },
    {
        'title': 'Studio économique Mvog-Ada',
        'description': 'Studio fonctionnel à Mvog-Ada, proche du marché central. Parfait pour étudiant ou jeune professionnel.',
        'price': Decimal('120000'), 'address': 'Avenue Kennedy, Mvog-Ada', 'city': 'Yaoundé', 'state': 'Mvog-Ada',
        'zip_code': 'BP 3456', 'latitude': Decimal('3.848000'), 'longitude': Decimal('11.502000'),
        'property_type': 'studio', 'bedroom': 1, 'bathroom': 1, 'area_sqft': 35, 'is_furnished': True,
        'landlord_email': 'paul@example.cm',
    },
    {
        'title': 'Maison familiale Ngousso',
        'description': 'Maison 4 chambres à Ngousso avec cour intérieure. Quartier populaire et bien desservi.',
        'price': Decimal('450000'), 'address': 'Rue de Ngousso', 'city': 'Yaoundé', 'state': 'Ngousso',
        'zip_code': 'BP 4567', 'latitude': Decimal('3.889000'), 'longitude': Decimal('11.534000'),
        'property_type': 'house', 'bedroom': 4, 'bathroom': 2, 'area_sqft': 180, 'is_furnished': False,
        'landlord_email': 'paul@example.cm',
    },
    {
        'title': 'Appartement Mokolo centre',
        'description': 'Appartement au cœur de Mokolo, à proximité du grand marché. Transport facile.',
        'price': Decimal('200000'), 'address': 'Marché Mokolo', 'city': 'Yaoundé', 'state': 'Mokolo',
        'zip_code': 'BP 5678', 'latitude': Decimal('3.863000'), 'longitude': Decimal('11.511000'),
        'property_type': 'apartment', 'bedroom': 2, 'bathroom': 1, 'area_sqft': 75, 'is_furnished': False,
        'landlord_email': 'paul@example.cm',
    },
    {
        'title': 'Bureau professionnel Obili',
        'description': 'Espace bureau climatisé à Obili, idéal pour startup ou cabinet. Fibre optique disponible.',
        'price': Decimal('500000'), 'address': 'Boulevard du 20 Mai, Obili', 'city': 'Yaoundé', 'state': 'Obili',
        'zip_code': 'BP 6789', 'latitude': Decimal('3.831000'), 'longitude': Decimal('11.492000'),
        'property_type': 'office', 'bedroom': 0, 'bathroom': 1, 'area_sqft': 90, 'is_furnished': True,
        'landlord_email': 'jean@example.cm',
    },
    {
        'title': 'Local commercial Nlongkak',
        'description': 'Local commercial en rez-de-chaussée à Nlongkak, forte affluence piétonne.',
        'price': Decimal('650000'), 'address': 'Avenue Nlongkak', 'city': 'Yaoundé', 'state': 'Nlongkak',
        'zip_code': 'BP 7890', 'latitude': Decimal('3.871000'), 'longitude': Decimal('11.524000'),
        'property_type': 'commercial', 'bedroom': 0, 'bathroom': 1, 'area_sqft': 150, 'is_furnished': False,
        'landlord_email': 'jean@example.cm',
    },
    {
        'title': 'Villa de luxe Omnisport',
        'description': 'Villa haut standing près du stade Omnisport. Piscine, gardien, garage double.',
        'price': Decimal('1200000'), 'address': 'Quartier Omnisport', 'city': 'Yaoundé', 'state': 'Omnisport',
        'zip_code': 'BP 8901', 'latitude': Decimal('3.853000'), 'longitude': Decimal('11.545000'),
        'property_type': 'villa', 'bedroom': 6, 'bathroom': 4, 'area_sqft': 350, 'is_furnished': True,
        'landlord_email': 'jean@example.cm',
    },
    {
        'title': 'Appartement standing Akwa',
        'description': 'Appartement haut standing à Akwa, quartier des affaires de Douala. Vue sur la ville.',
        'price': Decimal('400000'), 'address': 'Boulevard de la Liberté, Akwa', 'city': 'Douala', 'state': 'Akwa',
        'zip_code': 'BP 1001', 'latitude': Decimal('4.049300'), 'longitude': Decimal('9.704100'),
        'property_type': 'apartment', 'bedroom': 3, 'bathroom': 2, 'area_sqft': 110, 'is_furnished': True,
        'landlord_email': 'marie@example.cm',
    },
    {
        'title': 'Villa Bonapriso',
        'description': 'Magnifique villa à Bonapriso, quartier résidentiel huppé de Douala. Jardin tropical.',
        'price': Decimal('1500000'), 'address': 'Rue Bonapriso', 'city': 'Douala', 'state': 'Bonapriso',
        'zip_code': 'BP 2002', 'latitude': Decimal('4.032000'), 'longitude': Decimal('9.701000'),
        'property_type': 'villa', 'bedroom': 5, 'bathroom': 3, 'area_sqft': 320, 'is_furnished': True,
        'landlord_email': 'marie@example.cm',
    },
    {
        'title': 'Studio Bonamoussadi',
        'description': 'Studio meublé à Bonamoussadi, quartier en pleine expansion. Proche des écoles.',
        'price': Decimal('150000'), 'address': 'Carrefour Bonamoussadi', 'city': 'Douala', 'state': 'Bonamoussadi',
        'zip_code': 'BP 3003', 'latitude': Decimal('4.088000'), 'longitude': Decimal('9.756000'),
        'property_type': 'studio', 'bedroom': 1, 'bathroom': 1, 'area_sqft': 40, 'is_furnished': True,
        'landlord_email': 'marie@example.cm',
    },
    {
        'title': 'Maison traditionnelle Deido',
        'description': 'Maison de caractère à Deido, quartier historique de Douala. Cour intérieure typique.',
        'price': Decimal('280000'), 'address': 'Rue Deido', 'city': 'Douala', 'state': 'Deido',
        'zip_code': 'BP 4004', 'latitude': Decimal('4.063000'), 'longitude': Decimal('9.712000'),
        'property_type': 'house', 'bedroom': 3, 'bathroom': 2, 'area_sqft': 140, 'is_furnished': False,
        'landlord_email': 'marie@example.cm',
    },
    {
        'title': 'Appartement Bali vue mer',
        'description': 'Appartement avec vue partielle sur le Wouri à Bali. Quartier animé et central.',
        'price': Decimal('320000'), 'address': 'Avenue Bali', 'city': 'Douala', 'state': 'Bali',
        'zip_code': 'BP 5005', 'latitude': Decimal('4.058000'), 'longitude': Decimal('9.698000'),
        'property_type': 'apartment', 'bedroom': 2, 'bathroom': 1, 'area_sqft': 85, 'is_furnished': False,
        'landlord_email': 'marie@example.cm',
    },
    {
        'title': 'Entrepôt commercial Makepe',
        'description': 'Grand espace commercial/entrepôt à Makepe. Accès camion, hauteur sous plafond 4m.',
        'price': Decimal('750000'), 'address': 'Zone industrielle Makepe', 'city': 'Douala', 'state': 'Makepe',
        'zip_code': 'BP 6006', 'latitude': Decimal('4.075000'), 'longitude': Decimal('9.768000'),
        'property_type': 'commercial', 'bedroom': 0, 'bathroom': 1, 'area_sqft': 400, 'is_furnished': False,
        'landlord_email': 'marie@example.cm',
    },
    {
        'title': 'Terrain constructible Logpom',
        'description': 'Terrain viabilisé de 500m² à Logpom. Titre foncier disponible, zone résidentielle.',
        'price': Decimal('25000000'), 'address': 'Extension Logpom', 'city': 'Douala', 'state': 'Logpom',
        'zip_code': 'BP 7007', 'latitude': Decimal('4.088000'), 'longitude': Decimal('9.735000'),
        'property_type': 'land', 'bedroom': 0, 'bathroom': 0, 'area_sqft': 500, 'is_furnished': False,
        'landlord_email': 'marie@example.cm', 'status': 'available',
    },
    {
        'title': 'Maison populaire New Bell',
        'description': 'Maison abordable à New Bell, idéale pour première location. Proche des transports.',
        'price': Decimal('180000'), 'address': 'Quartier New Bell', 'city': 'Douala', 'state': 'New Bell',
        'zip_code': 'BP 8008', 'latitude': Decimal('4.045000'), 'longitude': Decimal('9.728000'),
        'property_type': 'house', 'bedroom': 2, 'bathroom': 1, 'area_sqft': 70, 'is_furnished': False,
        'landlord_email': 'marie@example.cm',
    },
]


class Command(BaseCommand):
    help = 'Seed the database with Cameroon landlords, customers, and 16 properties'

    def add_arguments(self, parser):
        parser.add_argument(
            '--flush',
            action='store_true',
            help='Delete existing properties and demo users before seeding',
        )

    def handle(self, *args, **options):
        if options['flush']:
            Property.objects.all().delete()
            User.objects.filter(email__endswith='@example.cm').delete()
            self.stdout.write('Cleared existing seed data.')

        admin = User.objects.filter(email='admin@example.cm').first()
        if not admin:
            admin = User.objects.filter(username='admin_cm').first()
        if admin:
            admin.role = 'admin'
            admin.is_staff = True
            admin.is_superuser = True
            if not admin.email.endswith('@example.cm'):
                pass  # keep existing email for pre-existing superuser
            else:
                admin.email = admin.email or 'admin@example.cm'
        else:
            admin = User.objects.create(
                email='admin@example.cm',
                username='admin_cm',
                role='admin',
                is_staff=True,
                is_superuser=True,
            )
        if not admin.check_password('admin123'):
            admin.set_password('admin123')
            admin.save()

        landlords_data = [
            ('jean@example.cm', 'jean_mbola', '+237 677 111 001'),
            ('marie@example.cm', 'marie_akwa', '+237 677 222 002'),
            ('paul@example.cm', 'paul_yaounde', '+237 677 333 003'),
        ]
        landlords = {}
        for email, username, phone in landlords_data:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': username, 'role': 'landlord', 'phone': phone},
            )
            if created or not user.check_password('landlord123'):
                user.set_password('landlord123')
                user.role = 'landlord'
                user.save()
            landlords[email] = user
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'{action} landlord: {username} ({email})')

        customers_data = [
            ('client@example.cm', 'client_douala', '+237 677 444 004'),
            ('student@example.cm', 'student_yaounde', '+237 677 555 005'),
        ]
        for email, username, phone in customers_data:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'username': username, 'role': 'customer', 'phone': phone},
            )
            if created or not user.check_password('customer123'):
                user.set_password('customer123')
                user.save()
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'{action} customer: {username} ({email})')

        created_count = 0
        for prop_data in CAMEROON_PROPERTIES:
            landlord_email = prop_data.pop('landlord_email')
            status = prop_data.pop('status', 'available')
            landlord = landlords[landlord_email]
            title = prop_data['title']

            if Property.objects.filter(title=title, landlord=landlord).exists():
                self.stdout.write(f'Skipped (exists): {title}')
                continue

            Property.objects.create(landlord=landlord, status=status, country='Cameroon', **prop_data)
            created_count += 1
            self.stdout.write(f'Created property: {title} — {prop_data["city"]}, {prop_data["state"]}')

        self.stdout.write(self.style.SUCCESS(
            f'\nSeed complete! {created_count} new properties. '
            f'Total properties: {Property.objects.count()}\n'
            f'Admin: admin@example.cm / admin123\n'
            f'Landlords: *@example.cm / landlord123\n'
            f'Customers: *@example.cm / customer123'
        ))
