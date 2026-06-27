from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('property', 'customer', 'status', 'preferred_date', 'created_at')
    list_filter = ('status', 'preferred_date', 'property__city', 'property__landlord')
    search_fields = ('property__title', 'customer__email', 'customer__username', 'message')
    ordering = ['-created_at']
    autocomplete_fields = ['property', 'customer']
    list_editable = ('status',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Booking', {'fields': ('property', 'customer', 'status', 'message', 'preferred_date')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    @admin.action(description='Confirm selected bookings')
    def confirm_bookings(self, request, queryset):
        queryset.update(status='confirmed')

    @admin.action(description='Cancel selected bookings')
    def cancel_bookings(self, request, queryset):
        queryset.update(status='cancelled')

    actions = [confirm_bookings, cancel_bookings]
