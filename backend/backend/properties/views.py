from rest_framework import generics, permissions, filters, serializers
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from .models import Property, PropertyImage
from .serializers import PropertySerializer, PropertyImageSerializer


class IsLandlordOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'landlord'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.landlord == request.user


class PropertyListCreateView(generics.ListCreateAPIView):
    queryset = Property.objects.all().prefetch_related('images')
    serializer_class = PropertySerializer
    permission_classes = [IsLandlordOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['title', 'description', 'city', 'state', 'address']
    ordering_fields = ['price', 'created_at', 'bedroom', 'bathroom']
    filterset_fields = {
        'property_type': ['exact'],
        'purpose': ['exact'],
        'status': ['exact'],
        'city': ['exact'],
        'landlord': ['exact'],
        'price': ['gte', 'lte'],
        'bedroom': ['exact', 'gte'],
        'bathroom': ['exact', 'gte'],
        'is_furnished': ['exact'],
    }

    def get_queryset(self):
        qs = super().get_queryset()
        landlord = self.request.query_params.get('landlord')
        if landlord and self.request.user.is_authenticated:
            if str(self.request.user.id) == landlord or self.request.user.role == 'admin':
                return qs.filter(landlord_id=landlord)
            return qs.none()
        return qs

    def perform_create(self, serializer):
        serializer.save(landlord=self.request.user)


class MyPropertiesView(generics.ListAPIView):
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'landlord':
            return Property.objects.none()
        return Property.objects.filter(landlord=self.request.user).prefetch_related('images')


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Property.objects.all().prefetch_related('images')
    serializer_class = PropertySerializer
    permission_classes = [IsLandlordOrReadOnly]


class PropertyImageUploadView(generics.CreateAPIView):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        property_id = self.request.data.get('property')
        if not property_id:
            raise serializers.ValidationError({'property': 'This field is required.'})
        prop = Property.objects.get(id=property_id)
        if prop.landlord != self.request.user and self.request.user.role != 'admin':
            raise PermissionDenied('You do not own this property.')
        serializer.save(property_id=property_id)
