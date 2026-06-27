from rest_framework import serializers
from .models import Conversation, Message
from accounts.serializers import UserSerializer
from properties.serializers import PropertySerializer

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    conversation = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'conversation', 'sender', 'content', 'is_read', 'created_at')
        read_only_fields = ('sender', 'conversation', 'created_at')

class ConversationSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    property = PropertySerializer(read_only=True)
    property_id = serializers.IntegerField(write_only=True, required=False)
    participant_ids = serializers.ListField(
        write_only=True,
        child=serializers.IntegerField(),
        required=True
    )

    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'property', 'property_id', 'participant_ids', 'messages', 'created_at')
        read_only_fields = ('created_at',)

    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        property_id = validated_data.pop('property_id', None)
        conversation = Conversation.objects.create(**validated_data)
        if participant_ids:
            conversation.participants.set(participant_ids)
        if property_id:
            conversation.property_id = property_id
            conversation.save()
        return conversation