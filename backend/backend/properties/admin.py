from django.contrib import admin
from .models import Property, PropertyImage


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ('image', 'image_url', 'is_cover')


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'property_type', 'purpose', 'price', 'city', 'state', 'status',
        'landlord', 'bedroom', 'bathroom', 'created_at',
    )
    list_filter = ('property_type', 'purpose', 'status', 'city', 'state', 'is_furnished', 'landlord__role')
    search_fields = ('title', 'description', 'address', 'city', 'state', 'zip_code')
    ordering = ['-created_at']
    autocomplete_fields = ['landlord']
    list_editable = ('status',)
    inlines = [PropertyImageInline]
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'description', 'landlord', 'property_type', 'purpose', 'status', 'price'),
        }),
        ('Location', {
            'fields': ('address', 'city', 'state', 'zip_code', 'country', 'latitude', 'longitude'),
        }),
        ('Details', {
            'fields': ('bedroom', 'bathroom', 'area_sqft', 'is_furnished', 'virtual_tour_url'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('property', 'is_cover', 'image', 'image_url')
    list_filter = ('is_cover', 'property__city', 'property__property_type')
    search_fields = ('property__title',)
    autocomplete_fields = ['property']
    fieldsets = (
        ('Image Source', {
            'fields': ('property', 'image', 'image_url'),
            'description': 'Upload an image file OR provide an external image URL for remote hosting.',
        }),
        ('Options', {
            'fields': ('is_cover',),
        }),
    )
