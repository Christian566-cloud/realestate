from rest_framework import generics, permissions
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

class IsParticipant(permissions.BasePermission):
    def has_permission(self, request, view):
        conversation_id = view.kwargs.get('conversation_id') or view.kwargs.get('pk')
        if conversation_id is None:
            return True
        from .models import Conversation
        try:
            conv = Conversation.objects.get(id=conversation_id)
            return request.user in conv.participants.all()
        except Conversation.DoesNotExist:
            return False

    def has_object_permission(self, request, view, obj):
        return request.user in obj.participants.all()

class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

    def perform_create(self, serializer):
        participant_ids = list(set([self.request.user.id] + serializer.validated_data.get('participant_ids', [])))
        serializer.save(participant_ids=participant_ids)

class ConversationDetailView(generics.RetrieveAPIView):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsParticipant]

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsParticipant]

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        return Message.objects.filter(conversation_id=conversation_id, conversation__participants=self.request.user)

    def perform_create(self, serializer):
        conversation_id = self.kwargs['conversation_id']
        serializer.save(sender=self.request.user, conversation_id=conversation_id)