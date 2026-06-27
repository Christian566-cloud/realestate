from django.urls import path
from .views import PropertyListCreateView, PropertyDetailView, PropertyImageUploadView, MyPropertiesView

urlpatterns = [
    path('mine/', MyPropertiesView.as_view(), name='my-properties'),
    path('', PropertyListCreateView.as_view(), name='property-list'),
    path('<int:pk>/', PropertyDetailView.as_view(), name='property-detail'),
    path('images/', PropertyImageUploadView.as_view(), name='property-image-upload'),
]