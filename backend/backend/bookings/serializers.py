from rest_framework import serializers
from .models import Booking
from properties.serializers import PropertySerializer
from accounts.serializers import UserSerializer

class BookingSerializer(serializers.ModelSerializer):
    property = PropertySerializer(read_only=True)
    customer = UserSerializer(read_only=True)
    property_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Booking
        fields = ('id', 'property', 'customer', 'status', 'message', 'preferred_date', 'created_at', 'updated_at', 'property_id')
        read_only_fields = ('customer', 'created_at', 'updated_at')

    def validate(self, attrs):
        user = self.context['request'].user
        if self.instance:  # Update operation
            status = attrs.get('status')
            if status and status != self.instance.status:
                if self.instance.property.landlord == user:
                    if status not in ['confirmed', 'cancelled', 'completed']:
                        raise serializers.ValidationError("Invalid status transition for landlord.")
                elif self.instance.customer == user:
                    if status != 'cancelled':
                        raise serializers.ValidationError("Customers can only cancel bookings.")
                    if self.instance.status in ['cancelled', 'completed']:
                        raise serializers.ValidationError("Cannot cancel already finalized bookings.")
                else:
                    raise serializers.ValidationError("You are not authorized to update this booking.")
        return attrs

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        validated_data['property_id'] = validated_data.pop('property_id')
        validated_data.pop('status', None)
        if Booking.objects.filter(
            property_id=validated_data['property_id'],
            customer=validated_data['customer']
        ).exists():
            raise serializers.ValidationError({'property_id': 'You have already booked this property.'})
        return Booking.objects.create(**validated_data)