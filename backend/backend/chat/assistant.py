import hashlib
import re
import unicodedata
from decimal import Decimal, InvalidOperation

from django.db.models import Avg, Count, Max, Min, Q

from properties.models import Property


PROPERTY_TYPES = {
    'apartment': ('apartment', 'apartments', 'flat', 'flats', 'appartement', 'appartements'),
    'house': ('house', 'houses', 'home', 'homes', 'maison', 'maisons'),
    'villa': ('villa', 'villas', 'duplex'),
    'studio': ('studio', 'studios'),
    'office': ('office', 'offices', 'bureau', 'bureaux', 'workspace'),
    'land': ('land', 'plot', 'plots', 'terrain', 'terrains'),
    'commercial': ('commercial', 'shop', 'store', 'warehouse', 'entrepot', 'entrepôt', 'local'),
}

PROPERTY_INTENT_WORDS = (
    'property', 'properties', 'house', 'home', 'apartment', 'flat', 'studio', 'room',
    'rooms', 'villa', 'office', 'land', 'plot', 'commercial', 'rent', 'rental', 'lease',
    'sale', 'buy', 'purchase', 'bedroom', 'bedrooms', 'bathroom', 'bathrooms', 'price',
    'budget', 'furnished', 'available', 'city', 'location', 'neighborhood', 'quarter',
    'quartier', 'near', 'around', 'in', 'at', 'chambre', 'maison', 'terrain', 'bureau',
    'cheapest', 'cheap', 'affordable', 'expensive', 'luxury', 'compare', 'best', 'recommend',
    'safe', 'documents', 'deposit', 'contract', 'negotiate', 'fees', 'area', 'areas',
    'student', 'family', 'business', 'worker', 'relocate', 'moving', 'investment',
    'invest', 'client', 'tenant', 'agent', 'water', 'electricity', 'maintenance',
    'frais', 'caution', 'contrat', 'visite', 'quartier', 'ecole', 'school',
)

CLIENT_PROFILES = {
    'student': {
        'keywords': ('student', 'school', 'campus', 'university', 'etudiant', 'étudiant'),
        'answer': (
            'For a student, I would prioritize a lower monthly budget, easy transport, security, water/electricity reliability, and a simple studio or 1-bedroom option. '
            'If you share the school area and budget, I can narrow the search.'
        ),
        'quick_replies': ['Studios under 200000', 'Rooms in Yaounde', 'What should I check before paying?'],
    },
    'family': {
        'keywords': ('family', 'children', 'kids', 'school', 'famille', 'enfants'),
        'answer': (
            'For a family, I would look for at least 2 bedrooms, a calmer neighborhood, access to schools, reliable water/electricity, and enough space for daily living. '
            'Tell me the city and maximum budget and I will propose the best matches.'
        ),
        'quick_replies': ['3 bedroom houses in Douala', 'Family homes in Yaounde', 'Compare options'],
    },
    'business': {
        'keywords': ('business', 'office', 'shop', 'store', 'commercial', 'bureau', 'commerce'),
        'answer': (
            'For a business space, location visibility, accessibility, parking, foot traffic, power reliability, and lease terms matter more than decoration. '
            'Tell me the business type and area and I can suggest offices or commercial listings.'
        ),
        'quick_replies': ['Offices in Yaounde', 'Commercial spaces in Douala', 'How do I contact a landlord?'],
    },
    'investor': {
        'keywords': ('investment', 'invest', 'investor', 'roi', 'return', 'acheter pour louer'),
        'answer': (
            'For investment, compare purchase price, likely rent, demand in the neighborhood, maintenance cost, legal documents, and resale potential. '
            'I can help you compare sale listings or identify rental-demand areas.'
        ),
        'quick_replies': ['Homes for sale', 'Price range in Douala', 'What documents should I check?'],
    },
}

TOPIC_ANSWERS = [
    {
        'keywords': ('book', 'booking', 'visit', 'appointment', 'schedule', 'viewing', 'inspect'),
        'answer': (
            'To arrange a visit, open the property you like, use the booking option, and send your preferred date with a short note. '
            'The landlord receives the request and can confirm it from their dashboard.'
        ),
        'quick_replies': ['Show available rentals', 'How do I contact a landlord?', 'Properties with virtual tours'],
    },
    {
        'keywords': ('contact', 'message landlord', 'talk to landlord', 'owner', 'phone', 'call'),
        'answer': (
            'Open a listing and use the contact or booking action to reach the landlord. If you are logged in, you can also continue the conversation from Messages.'
        ),
        'quick_replies': ['Show rentals in Douala', 'Show rentals in Yaounde', 'How do bookings work?'],
    },
    {
        'keywords': ('landlord', 'list my property', 'add property', 'post property', 'publish property'),
        'answer': (
            'To publish a property, create a landlord account, open the landlord dashboard, and add the listing details: location, price, rooms, photos, purpose, status, and optional virtual tour link.'
        ),
        'quick_replies': ['Register as landlord', 'What can I list?', 'How do bookings work?'],
    },
    {
        'keywords': ('login', 'register', 'account', 'sign up', 'profile', 'password'),
        'answer': (
            'Customers can register to book visits and message landlords. Landlords should choose the landlord role during registration so they can manage properties and bookings.'
        ),
        'quick_replies': ['Show available rentals', 'Homes for sale', 'How do I book a visit?'],
    },
    {
        'keywords': ('virtual tour', 'matterport', '3d', 'video tour', 'online tour'),
        'answer': (
            'Listings that include a virtual tour show a virtual tour action on the property details page. It is useful when you want to inspect the space before booking an in-person visit.'
        ),
        'quick_replies': ['Properties with virtual tours', 'Show rentals', 'Book a visit'],
    },
    {
        'keywords': ('document', 'documents', 'contract', 'lease agreement', 'payment', 'paying', 'pay', 'deposit'),
        'answer': (
            'Before paying, confirm the landlord identity, visit or verify the property, agree on the deposit and rent terms, and keep written proof of payments and agreements.'
        ),
        'quick_replies': ['How do bookings work?', 'Show affordable rentals', 'Contact landlord'],
    },
    {
        'keywords': ('negotiate', 'negotiation', 'discount', 'reduce price', 'lower rent'),
        'answer': (
            'For negotiation, compare similar listings in the same area, ask what is included in the rent, check maintenance costs, and make a clear offer based on your budget and move-in date.'
        ),
        'quick_replies': ['Show cheaper options', 'Compare rentals in Douala', 'What should I check before paying?'],
    },
    {
        'keywords': ('safe', 'safety', 'scam', 'fraud', 'trust'),
        'answer': (
            'For safety, avoid paying before verification, visit the property or request a virtual tour, confirm the landlord details, keep receipts, and use written agreements for deposits or rent.'
        ),
        'quick_replies': ['Documents before paying', 'How do bookings work?', 'Contact landlord'],
    },
    {
        'keywords': ('water', 'electricity', 'power', 'utilities', 'bills', 'eneo', 'camwater'),
        'answer': (
            'For utilities, ask whether water and electricity are independent meters or shared, how bills are calculated, whether there are recent unpaid bills, and how stable supply is in the area.'
        ),
        'quick_replies': ['What should I check during a visit?', 'Documents before paying', 'Show available rentals'],
    },
    {
        'keywords': ('maintenance', 'repair', 'repairs', 'damage', 'broken', 'plumbing'),
        'answer': (
            'Before moving in, agree in writing who handles repairs, inspect plumbing and electrical points, photograph existing damage, and clarify emergency maintenance contacts.'
        ),
        'quick_replies': ['Visit checklist', 'What should I check before paying?', 'How do bookings work?'],
    },
    {
        'keywords': ('furnished', 'unfurnished', 'meuble', 'meublé', 'furniture'),
        'answer': (
            'Furnished homes are easier for fast move-in but may cost more and require an inventory checklist. Unfurnished homes can be cheaper long-term if you already own furniture.'
        ),
        'quick_replies': ['Show furnished options', 'Show cheaper options', 'Rooms in Douala'],
    },
    {
        'keywords': ('rent or buy', 'buy or rent', 'should i buy', 'should i rent', 'rent vs buy'),
        'answer': (
            'Renting is better when you need flexibility or are testing an area. Buying is better when you have stable plans, verified documents, and enough budget for purchase costs, repairs, and taxes.'
        ),
        'quick_replies': ['Homes for sale', 'Show rentals', 'Price range in Douala'],
    },
    {
        'keywords': ('agency fee', 'agent fee', 'fees', 'commission', 'frais agence', 'frais'),
        'answer': (
            'Clarify all fees before visiting or paying: agency commission, deposit, advance rent, document costs, maintenance fees, and utility arrears. Ask for written confirmation of every amount.'
        ),
        'quick_replies': ['What should I check before paying?', 'How do I contact a landlord?', 'Show affordable rentals'],
    },
    {
        'keywords': ('visit checklist', 'check during a visit', 'inspection', 'viewing checklist'),
        'answer': (
            'During a visit, check water pressure, electricity, locks, ceiling leaks, windows, noise, road access, phone network, neighborhood safety, and whether the photos match the real property.'
        ),
        'quick_replies': ['Book a visit', 'What should I check before paying?', 'Show properties with virtual tours'],
    },
]

MATCH_OPENERS = [
    'I found {count} available option{plural} matching: {criteria}.',
    '{intro} {count} listing{plural} that {fit_verb}: {criteria}.',
    'Good news, there {verb} {count} available match{match_plural}: {criteria}.',
    'I checked the current listings and found {count} result{plural} matching: {criteria}.',
]

NO_MATCH_ANSWERS = [
    'I could not find an available listing for {criteria} right now. Try a nearby neighborhood, a higher budget, or a broader property type.',
    'No exact match is available for {criteria} at the moment. I can still help if you widen the location, budget, or room count.',
    'I do not see an available property matching {criteria}. You may get better results by searching the city instead of only the neighborhood.',
]

GENERAL_ANSWERS = [
    'I can help with real estate questions: finding rooms, apartments, houses, offices, land, rentals, homes for sale, budgets, neighborhoods, bookings, and landlord contact steps.',
    'Tell me what you need, for example: "rooms in Bonamoussadi", "2 bedroom apartment in Douala under 300000", or "houses for sale in Yaounde".',
    'I am best at property search and rental guidance. Share a location, budget, room count, or property type and I will check available listings.',
]

CAPABILITY_ANSWER = (
    'I can help clients search properties by city, neighborhood, budget, room count, type, rent or sale, furnished status, and virtual tours. '
    'I can also explain bookings, landlord contact, account setup, listing property, payment safety, deposits, lease checks, negotiation, area selection, and how to compare options. '
    'If the request is not precise yet, I can orient the client by asking the right questions and proposing next steps.'
)

DEFAULT_PROPOSITIONS = [
    {
        'title': 'Find a property',
        'detail': 'Search by location, budget, type, and number of rooms.',
        'prompt': 'I need a 2 bedroom apartment in Douala under 300000',
    },
    {
        'title': 'Get oriented',
        'detail': 'Tell me your profile and I will suggest what to prioritize.',
        'prompt': 'I am moving with my family, what should I look for?',
    },
    {
        'title': 'Stay safe',
        'detail': 'Review payment, documents, visit, and landlord checks.',
        'prompt': 'What should I check before paying?',
    },
]


def _normalize(value):
    text = unicodedata.normalize('NFKD', str(value or ''))
    text = ''.join(char for char in text if not unicodedata.combining(char))
    text = text.lower().replace("'", ' ')
    return re.sub(r'\s+', ' ', text).strip()


def _pick(options, seed):
    index = int(hashlib.sha1(seed.encode('utf-8')).hexdigest(), 16) % len(options)
    return options[index]


def _history_text(history):
    if not isinstance(history, list):
        return ''
    lines = []
    for item in history[-6:]:
        if not isinstance(item, dict):
            continue
        text = str(item.get('text') or '').strip()
        role = str(item.get('role') or 'user').strip()
        if text:
            lines.append(f'{role}: {text}')
    return '\n'.join(lines)


def _contextual_message(message, history):
    cleaned = (message or '').strip()
    if not history:
        return cleaned

    normalized = _normalize(cleaned)
    context = _history_text(history)
    context_locations = _detect_locations(context)
    context_purpose = _detect_purpose(context)
    context_type = _detect_property_type(context)

    needs_context = any(phrase in normalized for phrase in (
        'cheaper', 'cheap', 'more affordable', 'another', 'other', 'similar',
        'more like', 'show more', 'compare', 'best one', 'recommend one',
    ))
    if not needs_context:
        return cleaned

    additions = []
    if context_locations and not _detect_locations(cleaned):
        additions.append('in ' + context_locations[0])
    if context_purpose and not _detect_purpose(cleaned):
        additions.append('for ' + ('rent' if context_purpose == 'rent' else 'sale'))
    if context_type and not _detect_property_type(cleaned):
        additions.append(context_type)
    return ' '.join([cleaned, *additions]).strip()


def _money_from_message(message):
    text = _normalize(message).replace(',', '').replace('xaf', '').replace('fcfa', '')
    matches = re.findall(r'(\d+(?:\.\d+)?)\s*(m|million|millions|k|thousand)?', text)
    amounts = []
    for number, suffix in matches:
        try:
            amount = Decimal(number)
        except InvalidOperation:
            continue
        if suffix in ('m', 'million', 'millions'):
            amount *= Decimal('1000000')
        elif suffix in ('k', 'thousand'):
            amount *= Decimal('1000')
        if amount >= 100:
            amounts.append(amount)
    return max(amounts) if amounts else None


def _number_before_word(message, word):
    normalized = _normalize(message)
    match = re.search(rf'(\d+)\s*\+?\s*{word}', normalized)
    return int(match.group(1)) if match else None


def _detect_purpose(message):
    normalized = _normalize(message)
    if any(re.search(rf'\b{re.escape(word)}\b', normalized) for word in ('buy', 'sale', 'purchase', 'acheter', 'vente')) or 'for sale' in normalized:
        return 'sale'
    if any(re.search(rf'\b{re.escape(word)}\b', normalized) for word in ('rent', 'rental', 'lease', 'louer', 'location')) or 'for rent' in normalized:
        return 'rent'
    return None


def _detect_property_type(message):
    normalized = _normalize(message)
    for property_type, words in PROPERTY_TYPES.items():
        if any(re.search(rf'\b{re.escape(_normalize(word))}\b', normalized) for word in words):
            return property_type
    return None


def _location_candidates():
    values = set()
    for prop in Property.objects.all().only('city', 'state', 'address'):
        for value in (prop.city, prop.state, prop.address):
            normalized = _normalize(value)
            if len(normalized) >= 3:
                values.add((normalized, value))
    return sorted(values, key=lambda item: len(item[0]), reverse=True)


def _detect_locations(message):
    normalized = _normalize(message)
    matches = []
    seen = set()
    for location_key, display in _location_candidates():
        if location_key in normalized and location_key not in seen:
            matches.append(display)
            seen.add(location_key)
    return matches


def _free_text_terms(message):
    ignored = set(PROPERTY_INTENT_WORDS)
    ignored.update({'want', 'need', 'show', 'give', 'find', 'looking', 'please', 'available', 'with'})
    return [
        word for word in re.findall(r'[a-zA-ZÀ-ÿ-]{3,}', message)
        if _normalize(word) not in ignored
    ][:6]


def _looks_property_related(message, locations):
    normalized = _normalize(message)
    return bool(locations) or any(re.search(rf'\b{re.escape(word)}\b', normalized) for word in PROPERTY_INTENT_WORDS)


def _build_property_query(message):
    queryset = Property.objects.filter(status='available').prefetch_related('images')
    filters = []

    purpose = _detect_purpose(message)
    if purpose:
        queryset = queryset.filter(purpose=purpose)
        filters.append('for rent' if purpose == 'rent' else 'for sale')

    property_type = _detect_property_type(message)
    if property_type:
        queryset = queryset.filter(property_type=property_type)
        label = 'rooms or studios' if property_type == 'studio' else property_type
        filters.append(label)

    locations = _detect_locations(message)
    if locations:
        location_query = Q()
        for location in locations:
            location_query |= Q(city__iexact=location) | Q(state__iexact=location) | Q(address__icontains=location)
        queryset = queryset.filter(location_query)
        filters.append('in ' + ', '.join(locations[:3]))

    budget = _money_from_message(message)
    if budget:
        queryset = queryset.filter(price__lte=budget)
        filters.append(f'under {budget:,.0f} XAF')

    bedrooms = _number_before_word(message, 'bed') or _number_before_word(message, 'bedroom')
    rooms = _number_before_word(message, 'room') or _number_before_word(message, 'chambre')
    room_count = bedrooms or rooms
    if room_count:
        queryset = queryset.filter(bedroom__gte=room_count)
        filters.append(f'{room_count}+ bedroom{"s" if room_count > 1 else ""}')

    bathrooms = _number_before_word(message, 'bath') or _number_before_word(message, 'bathroom')
    if bathrooms:
        queryset = queryset.filter(bathroom__gte=bathrooms)
        filters.append(f'{bathrooms}+ bathroom{"s" if bathrooms > 1 else ""}')

    if 'furnished' in _normalize(message) or 'meuble' in _normalize(message):
        queryset = queryset.filter(is_furnished=True)
        filters.append('furnished')

    if 'virtual tour' in _normalize(message) or '3d' in _normalize(message):
        queryset = queryset.exclude(virtual_tour_url='')
        filters.append('with virtual tour')

    if not filters:
        terms = _free_text_terms(message)
        if terms:
            search = Q()
            for term in terms:
                search |= (
                    Q(title__icontains=term)
                    | Q(description__icontains=term)
                    | Q(address__icontains=term)
                    | Q(city__icontains=term)
                    | Q(state__icontains=term)
                )
            queryset = queryset.filter(search)
            filters.append('your search')

    return queryset.order_by('price', '-created_at'), filters, locations


def _sort_queryset_for_intent(queryset, message):
    normalized = _normalize(message)
    if any(word in normalized for word in ('cheap', 'cheaper', 'cheapest', 'affordable', 'low budget', 'budget')):
        return queryset.order_by('price', '-created_at')
    if any(word in normalized for word in ('expensive', 'luxury', 'premium', 'highest')):
        return queryset.order_by('-price', '-created_at')
    if any(word in normalized for word in ('new', 'newest', 'latest', 'recent')):
        return queryset.order_by('-created_at')
    if any(word in normalized for word in ('large', 'big', 'spacious', 'space')):
        return queryset.order_by('-area_sqft', 'price')
    return queryset.order_by('price', '-created_at')


def _wants_capabilities(message):
    normalized = _normalize(message)
    return any(phrase in normalized for phrase in (
        'what can you do', 'help me', 'how can you help', 'your functionalities',
        'your features', 'what do you do', 'assistant do',
    ))


def _wants_area_summary(message):
    normalized = _normalize(message)
    return any(phrase in normalized for phrase in (
        'which areas', 'what areas', 'available areas', 'locations do you have',
        'cities do you have', 'neighborhoods', 'neighbourhoods', 'where do you have',
    ))


def _wants_market_summary(message):
    normalized = _normalize(message)
    return any(phrase in normalized for phrase in (
        'market summary', 'price range', 'average price', 'how much', 'prices in',
        'budget for', 'cost of', 'rent prices',
    ))


def _wants_comparison(message):
    normalized = _normalize(message)
    return any(word in normalized for word in ('compare', 'comparison', 'best', 'recommend', 'better option', 'which one'))


def _is_vague_housing_request(message, filters, locations):
    normalized = _normalize(message)
    vague_phrases = (
        'i need a place', 'i want a place', 'find me a place', 'help me find',
        'i need a house', 'i need a room', 'i want a room', 'i am looking for',
        'orient me', 'guide me', 'advise me', 'propose', 'make propositions',
    )
    return any(phrase in normalized for phrase in vague_phrases) and len(filters) + len(locations) < 2


def _profile_match(message):
    normalized = _normalize(message)
    for profile in CLIENT_PROFILES.values():
        if any(_normalize(keyword) in normalized for keyword in profile['keywords']):
            return profile
    return None


def _propositions_for_search(filters, locations, matches):
    location = locations[0] if locations else 'Douala'
    if matches:
        cheapest = min(matches, key=lambda prop: prop.price)
        return [
            {
                'title': 'Best budget option',
                'detail': f'{cheapest.title} starts at {cheapest.price:,.0f} XAF in {cheapest.state}.',
                'prompt': f'Compare {cheapest.title} with similar options',
            },
            {
                'title': 'Book a visit',
                'detail': 'Open a listing card and send your preferred visit date.',
                'prompt': 'How do I book a visit?',
            },
            {
                'title': 'Check before paying',
                'detail': 'Verify documents, landlord identity, and payment proof.',
                'prompt': 'What should I check before paying?',
            },
        ]
    return [
        {
            'title': 'Widen the search',
            'detail': f'Try the whole city instead of one neighborhood, for example {location}.',
            'prompt': f'Show available rentals in {location}',
        },
        {
            'title': 'Adjust budget',
            'detail': 'Increase or remove the budget limit to see more options.',
            'prompt': f'Price range in {location}',
        },
        {
            'title': 'Change property type',
            'detail': 'Try studios, apartments, or houses depending on your room needs.',
            'prompt': f'Rooms in {location}',
        },
    ]


def _orientation_answer(message, filters, locations):
    profile = _profile_match(message)
    if profile:
        return {
            'answer': profile['answer'],
            'properties': [],
            'quick_replies': profile['quick_replies'],
            'propositions': [
                {
                    'title': 'Start with location',
                    'detail': 'Share the city or neighborhood where you want to live.',
                    'prompt': 'Rooms in Douala',
                },
                {
                    'title': 'Set the budget',
                    'detail': 'Give a maximum monthly budget so I can filter strongly.',
                    'prompt': 'Apartments under 300000',
                },
                {
                    'title': 'Compare options',
                    'detail': 'I can compare price, rooms, area, and value.',
                    'prompt': 'Compare apartments in Douala',
                },
            ],
        }

    if _is_vague_housing_request(message, filters, locations):
        return {
            'answer': (
                'I can orient you, but I need a little more detail to give useful propositions. '
                'Please tell me: the city or neighborhood, your maximum budget, the number of rooms or bedrooms, and whether you want rent or sale. '
                'For example: "2 rooms in Akwa under 300000 for rent".'
            ),
            'properties': [],
            'quick_replies': ['Rooms in Douala', 'Apartments under 300000', 'Available areas'],
            'propositions': DEFAULT_PROPOSITIONS,
        }
    return None


def _area_summary_answer():
    rows = (
        Property.objects.filter(status='available')
        .values('city', 'state')
        .annotate(count=Count('id'), min_price=Min('price'))
        .order_by('city', 'state')
    )
    if not rows:
        return {
            'answer': 'There are no available listings published right now. Please check again after landlords add or reactivate properties.',
            'properties': [],
            'quick_replies': ['Show rentals', 'Homes for sale', 'How do bookings work?'],
            'propositions': DEFAULT_PROPOSITIONS,
        }

    by_city = {}
    for row in rows:
        by_city.setdefault(row['city'], []).append(row)

    lines = ['Available locations right now:']
    for city, city_rows in by_city.items():
        neighborhoods = ', '.join(
            f"{row['state']} ({row['count']} from {row['min_price']:,.0f} XAF)"
            for row in city_rows[:6]
        )
        lines.append(f'{city}: {neighborhoods}')
    lines.append('Tell me a neighborhood, budget, and room count and I will narrow it down.')
    return {
        'answer': '\n'.join(lines),
        'properties': [],
        'quick_replies': ['Rooms in Douala', 'Rooms in Yaounde', 'Apartments under 300000'],
        'propositions': [
            {'title': 'Search Douala', 'detail': 'Look at available neighborhoods in Douala.', 'prompt': 'Rooms in Douala'},
            {'title': 'Search Yaounde', 'detail': 'Look at available neighborhoods in Yaounde.', 'prompt': 'Rooms in Yaounde'},
            {'title': 'Use a budget', 'detail': 'Filter by your maximum monthly rent.', 'prompt': 'Apartments under 300000'},
        ],
    }


def _market_summary_answer(message, queryset, filters, locations):
    stats = queryset.aggregate(
        count=Count('id'),
        min_price=Min('price'),
        max_price=Max('price'),
        avg_price=Avg('price'),
    )
    if not stats['count']:
        return None

    criteria = _criteria_text(filters)
    answer = (
        f'For {criteria}, I found {stats["count"]} available listing{"s" if stats["count"] != 1 else ""}. '
        f'Prices range from {stats["min_price"]:,.0f} XAF to {stats["max_price"]:,.0f} XAF, '
        f'with an average around {stats["avg_price"]:,.0f} XAF. '
        'A good next step is to choose your maximum budget and preferred neighborhood.'
    )
    matches = list(_sort_queryset_for_intent(queryset, message)[:3])
    return {
        'answer': answer,
        'properties': [_property_payload(prop) for prop in matches],
        'quick_replies': ['Show cheapest options', 'Show furnished options', 'How do I book a visit?'],
        'propositions': _propositions_for_search(filters, locations, matches),
    }


def _comparison_answer(queryset, filters):
    matches = list(queryset.order_by('price', '-area_sqft')[:4])
    if len(matches) < 2:
        return None

    cheapest = min(matches, key=lambda prop: prop.price)
    largest = max(matches, key=lambda prop: prop.area_sqft)
    most_rooms = max(matches, key=lambda prop: prop.bedroom)
    criteria = _criteria_text(filters)

    lines = [
        f'Here is a practical comparison for {criteria}:',
        f'Best price: {cheapest.title} at {cheapest.price:,.0f} XAF in {cheapest.state}.',
        f'Most space: {largest.title} with {largest.area_sqft} sqft in {largest.state}.',
        f'Most bedrooms: {most_rooms.title} with {most_rooms.bedroom} bedroom{"s" if most_rooms.bedroom != 1 else ""}.',
        'My recommendation: choose the best price if budget matters most, or the most space if comfort is the priority.',
    ]
    return {
        'answer': '\n'.join(lines),
        'properties': [_property_payload(prop) for prop in matches],
        'quick_replies': ['Show cheaper options', 'How do I book a visit?', 'What should I check before paying?'],
        'propositions': _propositions_for_search(filters, [], matches),
    }


def _nearby_alternatives(locations, budget=None):
    if not locations:
        return []
    base_location = locations[0]
    city = Property.objects.filter(Q(city__iexact=base_location) | Q(state__iexact=base_location)).values_list('city', flat=True).first()
    if not city:
        return []
    queryset = Property.objects.filter(status='available', city__iexact=city)
    if budget:
        queryset = queryset.filter(price__lte=budget)
    return list(queryset.order_by('price')[:3])


def _property_payload(prop):
    cover = prop.images.filter(is_cover=True).first() or prop.images.first()
    cover_image = None
    if cover:
        cover_image = cover.image.url if cover.image else cover.image_url or None

    return {
        'id': prop.id,
        'title': prop.title,
        'city': prop.city,
        'state': prop.state,
        'price': str(prop.price),
        'purpose': prop.purpose,
        'property_type': prop.property_type,
        'bedroom': prop.bedroom,
        'bathroom': prop.bathroom,
        'area_sqft': prop.area_sqft,
        'is_furnished': prop.is_furnished,
        'cover_image': cover_image,
    }


def _format_property_line(index, prop):
    purpose = 'rent' if prop.purpose == 'rent' else 'sale'
    furnished = ' furnished' if prop.is_furnished else ''
    room_text = f'{prop.bedroom} bed' if prop.bedroom else prop.property_type
    return (
        f'{index}. {prop.title} - {prop.state}, {prop.city}. '
        f'{room_text}, {prop.bathroom} bath, {prop.area_sqft} sqft,{furnished} '
        f'{prop.property_type} for {purpose} at {prop.price:,.0f} XAF.'
    )


def _topic_matches(message):
    normalized = _normalize(message)
    matches = []
    for topic in TOPIC_ANSWERS:
        matched_keywords = [
            _normalize(keyword)
            for keyword in topic['keywords']
            if _normalize(keyword) in normalized
        ]
        if matched_keywords:
            matches.append((max(len(keyword) for keyword in matched_keywords), topic))
    return [topic for _, topic in sorted(matches, key=lambda item: item[0], reverse=True)]


def _is_advice_only_question(message, filters, locations):
    normalized = _normalize(message)
    has_specific_search = bool(locations or _detect_property_type(message) or _money_from_message(message))
    has_specific_search = has_specific_search or bool(
        _number_before_word(message, 'room')
        or _number_before_word(message, 'bed')
        or _number_before_word(message, 'chambre')
    )
    advice_starters = ('how', 'what', 'should', 'can i', 'do i', 'is it', 'explain', 'guide')
    return not has_specific_search and any(normalized.startswith(starter) for starter in advice_starters)


def _criteria_text(filters):
    return ', '.join(filters) if filters else 'available properties'


def _quick_replies(filters, locations):
    location = locations[0] if locations else 'Douala'
    if filters:
        return [
            f'Cheaper options in {location}',
            f'2 bedroom rentals in {location}',
            'How do I book a visit?',
        ]
    return ['Rooms in Douala', 'Apartments in Yaounde', 'Houses for sale', 'How do bookings work?']


def answer_real_estate_question(message, history=None):
    cleaned = _contextual_message(message, history)
    if not cleaned:
        return {
            'answer': 'Tell me what you need. You can ask for a location, budget, room count, property type, booking help, or landlord contact steps.',
            'properties': [],
            'quick_replies': ['Rooms in Douala', 'Apartments under 300000', 'How do bookings work?'],
            'propositions': DEFAULT_PROPOSITIONS,
        }

    if _wants_capabilities(cleaned):
        return {
            'answer': CAPABILITY_ANSWER,
            'properties': [],
            'quick_replies': ['Rooms in Douala', 'Compare apartments in Yaounde', 'What should I check before paying?'],
            'propositions': DEFAULT_PROPOSITIONS,
        }

    if _wants_area_summary(cleaned):
        return _area_summary_answer()

    queryset, filters, locations = _build_property_query(cleaned)
    queryset = _sort_queryset_for_intent(queryset, cleaned)
    topics = _topic_matches(cleaned)
    property_related = _looks_property_related(cleaned, locations)

    orientation = _orientation_answer(cleaned, filters, locations)
    if orientation:
        return orientation

    if topics and _is_advice_only_question(cleaned, filters, locations):
        return {
            'answer': topics[0]['answer'],
            'properties': [],
            'quick_replies': topics[0]['quick_replies'],
            'propositions': DEFAULT_PROPOSITIONS,
        }

    if _wants_market_summary(cleaned) and property_related:
        market_answer = _market_summary_answer(cleaned, queryset, filters, locations)
        if market_answer:
            return market_answer

    if _wants_comparison(cleaned) and property_related:
        comparison = _comparison_answer(queryset, filters)
        if comparison:
            comparison['propositions'] = _propositions_for_search(filters, locations, [
                Property.objects.get(id=prop['id']) for prop in comparison['properties']
            ])
            return comparison

    matches = list(queryset[:4]) if property_related else []

    if matches:
        count = queryset.count()
        criteria = _criteria_text(filters)
        opener = _pick(MATCH_OPENERS, cleaned).format(
            count=count,
            plural='' if count == 1 else 's',
            match_plural='' if count == 1 else 'es',
            intro='Here is' if count == 1 else 'Here are',
            fit_verb='fits' if count == 1 else 'fit',
            verb='is' if count == 1 else 'are',
            criteria=criteria,
        )
        lines = [_format_property_line(index, prop) for index, prop in enumerate(matches, start=1)]
        advice = 'Open any card below to see photos, full details, and booking options.'
        answer_parts = [opener, *lines, advice]
        if topics:
            answer_parts.insert(0, topics[0]['answer'])
        answer = '\n'.join(answer_parts)
        quick_replies = _quick_replies(filters, locations)
        propositions = _propositions_for_search(filters, locations, matches)
    elif property_related:
        criteria = _criteria_text(filters)
        answer = _pick(NO_MATCH_ANSWERS, cleaned).format(criteria=criteria)
        alternatives = _nearby_alternatives(locations, _money_from_message(cleaned))
        if alternatives:
            answer += '\nNearby alternatives in the same city:'
            answer += '\n' + '\n'.join(_format_property_line(index, prop) for index, prop in enumerate(alternatives, start=1))
            matches = alternatives
        elif locations:
            answer += ' I can also search nearby areas if you tell me the closest city.'
        quick_replies = _quick_replies(filters, locations)
        propositions = _propositions_for_search(filters, locations, matches)
    elif topics:
        answer = topics[0]['answer']
        quick_replies = topics[0]['quick_replies']
        propositions = DEFAULT_PROPOSITIONS
    else:
        answer = _pick(GENERAL_ANSWERS, cleaned)
        quick_replies = ['Rooms in Bonamoussadi', 'Rentals under 300000', 'How do I contact a landlord?']
        propositions = DEFAULT_PROPOSITIONS

    return {
        'answer': answer,
        'properties': [_property_payload(prop) for prop in matches],
        'quick_replies': quick_replies,
        'propositions': propositions,
    }
