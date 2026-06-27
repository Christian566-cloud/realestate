from rest_framework import serializers
from .models import Property, PropertyImage
from accounts.serializers import UserSerializer


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ('id', 'image', 'image_url', 'is_cover', 'property')
        read_only_fields = ('property',)


class PropertySerializer(serializers.ModelSerializer):
    landlord = UserSerializer(read_only=True)
    images = PropertyImageSerializer(many=True, read_only=True)
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ('landlord', 'created_at', 'updated_at')

    def get_cover_image(self, obj):
        cover = obj.images.filter(is_cover=True).first()
        if cover:
            if cover.image:
                return cover.image.url
            if cover.image_url:
                return cover.image_url
        if obj.images.exists():
            first = obj.images.first()
            if first.image:
                return first.image.url
            if first.image_url:
                return first.image_url
        return None

    def create(self, validated_data):
        images_data = self.context.get('images', [])
        property = Property.objects.create(**validated_data)
        for img in images_data:
            PropertyImage.objects.create(property=property, **img)
        return property
