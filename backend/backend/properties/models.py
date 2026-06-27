from django.db import models
from django.conf import settings

class Property(models.Model):
    PROPERTY_TYPE_CHOICES = (
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('villa', 'Villa'),
        ('studio', 'Studio'),
        ('office', 'Office'),
        ('land', 'Land'),
        ('commercial', 'Commercial'),
    )
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('rented', 'Rented'),
        ('sold', 'Sold'),
    )
    PURPOSE_CHOICES = (
        ('rent', 'For Rent'),
        ('sale', 'For Sale'),
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    purpose = models.CharField(max_length=10, choices=PURPOSE_CHOICES, default='rent')
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='Cameroon')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    bedroom = models.PositiveIntegerField(default=1)
    bathroom = models.PositiveIntegerField(default=1)
    area_sqft = models.PositiveIntegerField()
    is_furnished = models.BooleanField(default=False)
    virtual_tour_url = models.URLField(blank=True)
    landlord = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='property_images/', blank=True, null=True)
    image_url = models.URLField(blank=True, help_text='External image URL (optional if image file is uploaded)')
    is_cover = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.property.title}"